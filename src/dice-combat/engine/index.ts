import type { StatusKey } from "../../types";
import { DICE_BALANCE } from "../balance";
import { COLORS, getDieForSlot, getFace, SLOT_ORDER, ABILITY_STARTING_FACES } from "../dice-defs";
import { DICE_ENEMY_DEFS, getEnemyDef, spawnEnemy, lockSlot } from "../enemy-defs";
import type {
  AttackMitigation,
  DiceCombatInit,
  DiceCombatLogEntry,
  DiceCombatState,
  DiceEnemy,
  DieDef,
  DieSlot,
  EnemyQueueEntry,
  EnemyRolledFace,
  FaceColor,
  FaceDef,
  PoolAssignment,
  PoolFace,
  Row,
  SymbolKey,
} from "../types";
import { nextRng, rollD6 } from "./rng";

/* ─────────────────────────────────────────────────────────────────────────
 * INIT
 * ───────────────────────────────────────────────────────────────────────── */

export function initDiceCombat(init: DiceCombatInit): DiceCombatState {
  const seed = init.seed ?? (Math.floor(Math.random() * 0x7fffffff) || 1);

  const enemies: DiceEnemy[] = [];
  for (const e of init.enemies) {
    const def = getEnemyDef(e.id);
    if (!def) continue;
    enemies.push({
      uid: e.uid,
      id: def.id,
      name: def.name,
      icon: def.icon,
      hp: def.maxHp,
      maxHp: def.maxHp,
      row: def.defaultRow,
      statuses: {},
      isBoss: def.isBoss,
      untargetable: false,
      phaseIndex: 0,
      rolledFaces: [],
    });
  }

  let state: DiceCombatState = {
    player: {
      hp: init.startingHp,
      maxHp: init.startingMaxHp,
      salt: init.startingSalt,
      block: 0,
      statuses: {},
      mainWeaponId: init.loadout.mainWeaponId,
      offhandId: init.loadout.offhandId,
      armorId: init.loadout.armorId,
      abilityFaces: init.loadout.abilityFaces,
      hymnHumActive: false,
      resonanceCharges: 0,
      slotLocks: [],
      corruptedFaces: [],
      forcedFacesNextTurn: [],
      invertedColor: null,
      poisonedFaces: [],
    },
    enemies,
    pool: [],
    assignments: {},
    nextPoolId: 1,
    turn: 1,
    phase: "rolling",
    log: [{ turn: 1, source: "system", text: "Combat begins. Push your luck." }],
    rng: seed,
    attackMitigations: {},
    enemyQueue: [],
    lastEnemyAction: null,
  };

  // Fire onSpawn hooks for each enemy after they're all in the field.
  for (const e of state.enemies) {
    const def = getEnemyDef(e.id);
    if (def?.onSpawn) {
      const fresh = state.enemies.find((x) => x.uid === e.uid);
      if (fresh) state = def.onSpawn(fresh, state);
    }
  }

  state = startOfPlayerTurn(state);
  state = telegraphIntents(state);
  return state;
}

/* ─────────────────────────────────────────────────────────────────────────
 * START OF PLAYER TURN
 * Apply per-turn effects: forced faces, onPlayerTurnStart hooks, etc.
 * ───────────────────────────────────────────────────────────────────────── */

function startOfPlayerTurn(state: DiceCombatState): DiceCombatState {
  // 1. Reset per-turn flags first, so hooks (e.g. Lich P3) can re-grant Hymn-Hum.
  let s: DiceCombatState = {
    ...state,
    player: {
      ...state.player,
      block: 0,
      resonanceCharges: 0,
      hymnHumActive: false,
      invertedColor: null,
    },
    phase: "rolling",
  };

  // 2. Run onPlayerTurnStart hooks (Ghost flip, Lich phase, Hymn-Hum re-grant, etc.).
  for (const e of [...s.enemies]) {
    const def = getEnemyDef(e.id);
    const fresh = s.enemies.find((x) => x.uid === e.uid);
    if (def?.onPlayerTurnStart && fresh) {
      s = def.onPlayerTurnStart(fresh, s);
    }
  }

  // 3. Inject forced faces (False Sacrarium accrual) into the empty pool.
  if (s.player.forcedFacesNextTurn.length > 0) {
    let pool: PoolFace[] = [...s.pool];
    let nextId = s.nextPoolId;
    for (const forced of s.player.forcedFacesNextTurn) {
      const face = getFace(forced.faceId);
      if (!face) continue;
      pool = [
        ...pool,
        { poolId: nextId, slot: "main", faceId: forced.faceId, color: face.color, forced: true },
      ];
      nextId += 1;
    }
    s = {
      ...s,
      pool,
      nextPoolId: nextId,
      player: { ...s.player, forcedFacesNextTurn: [] },
      log: appendLog(s, "system", "Forced faces enter your pool from a corrupting presence."),
    };
    if (computeBust(s).busted) {
      return triggerBust(s);
    }
  }

  return s;
}

/* ─────────────────────────────────────────────────────────────────────────
 * COLOR / FACE LOOKUP
 * ───────────────────────────────────────────────────────────────────────── */

export function dieForSlot(slot: DieSlot, state: DiceCombatState): DieDef {
  return getDieForSlot(slot, {
    mainWeaponId: state.player.mainWeaponId,
    offhandId: state.player.offhandId,
    armorId: state.player.armorId,
    abilityFaces: state.player.abilityFaces,
  });
}

export function effectiveColor(
  slot: DieSlot,
  faceIndex: number,
  faceDef: FaceDef,
  state: DiceCombatState,
): FaceColor {
  // Banshee/Lich corruption.
  const corruption = state.player.corruptedFaces.find(
    (c) => c.slot === slot && c.faceIndex === faceIndex,
  );
  if (corruption) return corruption.recoloredTo;

  return faceDef.color;
}

export function faceAtPoolId(state: DiceCombatState, poolId: number): FaceDef | null {
  const pf = state.pool.find((p) => p.poolId === poolId);
  if (!pf) return null;
  return getFace(pf.faceId);
}

/* ─────────────────────────────────────────────────────────────────────────
 * PUSH-YOUR-LUCK ROLLING
 * ───────────────────────────────────────────────────────────────────────── */

export function canRollSlot(state: DiceCombatState, slot: DieSlot): boolean {
  if (state.phase !== "rolling") return false;
  if (state.player.slotLocks.includes(slot)) return false;
  if (state.pool.length >= DICE_BALANCE.POOL_HARD_CAP) return false;
  return true;
}

/** Roll one die into the pool. May trigger a bust. */
export function rollSlot(state: DiceCombatState, slot: DieSlot): DiceCombatState {
  if (!canRollSlot(state, slot)) return state;
  const die = dieForSlot(slot, state);
  const r = rollD6(state.rng);
  const faceIdx = r.face;
  const faceId = die.faces[faceIdx];
  const faceDef = getFace(faceId);
  if (!faceDef) return { ...state, rng: r.seed };
  const color = effectiveColor(slot, faceIdx, faceDef, state);

  const stunStacks = state.player.statuses.stun ?? 0;
  const isStunned = stunStacks > 0;

  const newPoolFace: PoolFace = {
    poolId: state.nextPoolId,
    slot,
    faceId,
    color,
    forced: false,
    stunned: isStunned || undefined,
  };

  let playerAfterStun = state.player;
  if (isStunned) {
    const newStun = stunStacks - 1;
    const newStatuses = { ...state.player.statuses, stun: newStun };
    if (newStun === 0) delete (newStatuses as Record<string, number>).stun;
    playerAfterStun = { ...state.player, statuses: newStatuses };
  }

  let s: DiceCombatState = {
    ...state,
    player: playerAfterStun,
    pool: [...state.pool, newPoolFace],
    nextPoolId: state.nextPoolId + 1,
    rng: r.seed,
    log: appendLog(
      state,
      "player",
      isStunned
        ? `Rolled ${faceDef.label} — stunned, no effect.`
        : `Rolled ${faceDef.label} (${COLORS[color].label}).`,
    ),
  };

  const check = computeBust(s);
  if (check.busted) {
    s = triggerBust(s);
  }
  return s;
}

/** Like rollSlot but skips RNG — the player chose faceIdx via the Focus mechanic. */
export function rollSlotWithFace(
  state: DiceCombatState,
  slot: DieSlot,
  faceIdx: number,
): DiceCombatState {
  if (!canRollSlot(state, slot)) return state;
  const die = dieForSlot(slot, state);
  const faceId = die.faces[faceIdx];
  const faceDef = getFace(faceId);
  if (!faceDef) return state;
  const color = effectiveColor(slot, faceIdx, faceDef, state);

  const stunStacks = state.player.statuses.stun ?? 0;
  const isStunned = stunStacks > 0;

  const newPoolFace: PoolFace = {
    poolId: state.nextPoolId,
    slot,
    faceId,
    color,
    forced: false,
    stunned: isStunned || undefined,
    focused: isStunned ? undefined : true,
  };

  let statuses = { ...state.player.statuses };
  if (isStunned) {
    const newStun = stunStacks - 1;
    if (newStun === 0) delete (statuses as Record<string, number>).stun;
    else statuses = { ...statuses, stun: newStun };
  } else {
    const focusStacks = statuses.focus ?? 0;
    const newFocus = focusStacks - 1;
    if (newFocus <= 0) delete (statuses as Record<string, number>).focus;
    else statuses = { ...statuses, focus: newFocus };
  }

  const playerAfter = { ...state.player, statuses };

  let s: DiceCombatState = {
    ...state,
    player: playerAfter,
    pool: [...state.pool, newPoolFace],
    nextPoolId: state.nextPoolId + 1,
    log: appendLog(
      state,
      "player",
      isStunned
        ? `Rolled ${faceDef.label} — stunned, no effect.`
        : `${faceDef.label} chosen (Focus).`,
    ),
  };

  const check = computeBust(s);
  if (check.busted) {
    s = triggerBust(s);
  }
  return s;
}

interface BustCheckResult {
  busted: boolean;
  clashColor: FaceColor | null;
}

function computeBust(state: DiceCombatState): BustCheckResult {
  const seenByColor = new Map<FaceColor, number>();
  for (const pf of state.pool) {
    let c = pf.color;
    // Hymn-Hum: Echo faces count as wildcards (don't contribute to a clash).
    if (state.player.hymnHumActive && c === "echo") continue;
    // Colorless faces never contribute to a bust.
    if (c === "colorless") continue;
    // False Sacrarium Blessing Inversion: the player's most-rolled color counts as Brine.
    if (state.player.invertedColor && c === state.player.invertedColor) c = "brine";
    seenByColor.set(c, (seenByColor.get(c) ?? 0) + 1);
  }
  for (const [color, count] of seenByColor) {
    if (count >= 2) return { busted: true, clashColor: color };
  }
  return { busted: false, clashColor: null };
}

function triggerBust(state: DiceCombatState): DiceCombatState {
  // Resonance forgives one clash.
  if (state.player.resonanceCharges > 0) {
    return {
      ...state,
      player: { ...state.player, resonanceCharges: state.player.resonanceCharges - 1 },
      log: appendLog(state, "system", "Resonance forgives the clash — keep rolling."),
    };
  }
  const poolSize = state.pool.length;
  // v3: keep the pool visible during the bust phase so the player can read the
  // clash before pressing "End Turn". The pool is flushed in endOfTurn.
  let s: DiceCombatState = {
    ...state,
    phase: "busted",
    log: appendLog(state, "system", "BUST. Your pool is lost."),
  };
  // Heal-on-bust hooks (Vampire, Vampire Lord) — sized off the pool just discarded.
  for (const e of [...s.enemies]) {
    const def = getEnemyDef(e.id);
    const fresh = s.enemies.find((x) => x.uid === e.uid);
    if (def?.onPlayerBust && fresh && fresh.hp > 0) {
      s = def.onPlayerBust(fresh, s, poolSize);
    }
  }
  return s;
}

/** Move from rolling phase into assigning.
 * v3: faces with target self/none/all-* resolve IMMEDIATELY at stop-time —
 * EXCEPT faces carrying defensive symbols (shield/dodge/riposte). Those must
 * be pointed at a specific enemy attack glyph by the player (or, as a fallback,
 * self-assigned via the explicit "self" button if no attacks remain). */
export function stopRolling(state: DiceCombatState): DiceCombatState {
  if (state.phase !== "rolling") return state;
  if (state.pool.length === 0) return state;
  let s: DiceCombatState = { ...state, phase: "assigning", assignments: {} };
  const assignments: Record<number, PoolAssignment> = {};
  for (const pf of state.pool) {
    const face = getFace(pf.faceId);
    if (!face) continue;
    // Stunned faces do nothing — mark resolved immediately with no effect.
    if (pf.stunned) {
      assignments[pf.poolId] = { poolId: pf.poolId, targetUid: null, resolved: true };
      continue;
    }
    if (face.target === "none") {
      assignments[pf.poolId] = { poolId: pf.poolId, targetUid: null, resolved: true };
      continue;
    }
    // Defensive faces wait for the player to pick a specific attack glyph.
    if (hasDefensiveSymbol(face)) continue;
    if (face.target === "self") {
      s = applyFaceSymbols(s, withPoisonSymbols(s, pf, face), null);
      assignments[pf.poolId] = { poolId: pf.poolId, targetUid: null, resolved: true };
      continue;
    }
    if (face.target === "all-front" || face.target === "all-enemies") {
      s = applyFaceSymbols(s, withPoisonSymbols(s, pf, face), null);
      assignments[pf.poolId] = { poolId: pf.poolId, targetUid: null, resolved: true };
      continue;
    }
  }
  s = { ...s, assignments };
  if (isVictory(s)) return finalize(s, "victory");
  return s;
}

/* ─────────────────────────────────────────────────────────────────────────
 * ASSIGNMENT
 * ───────────────────────────────────────────────────────────────────────── */

export interface AssignCheck {
  readonly ok: boolean;
  readonly reason?: string;
}

/** Parse an attack-target string `attack:UID:IDX` into its parts, or null. */
function parseAttackTarget(targetUid: string | null): { uid: string; idx: number } | null {
  if (!targetUid || !targetUid.startsWith("attack:")) return null;
  const parts = targetUid.split(":");
  if (parts.length !== 3) return null;
  const idx = Number.parseInt(parts[2], 10);
  if (Number.isNaN(idx)) return null;
  return { uid: parts[1], idx };
}

/** True if the face has at least one defensive symbol (shield/dodge/riposte). */
function hasDefensiveSymbol(face: FaceDef): boolean {
  return face.symbols?.some((s) => s === "shield" || s === "dodge" || s === "riposte") ?? false;
}

/** True if the face has a *damaging* symbol — what shield/dodge can mitigate. */
function hasDamagingSymbol(face: FaceDef): boolean {
  return face.symbols?.some((s) => s === "sword" || s === "flame") ?? false;
}

export function canAssign(
  state: DiceCombatState,
  poolId: number,
  targetUid: string | null,
): AssignCheck {
  if (state.phase !== "assigning") return { ok: false, reason: "Not assigning." };
  const face = faceAtPoolId(state, poolId);
  if (!face) return { ok: false, reason: "No such face." };
  // Already resolved? Block re-assignment.
  if (state.assignments[poolId]?.resolved) return { ok: false, reason: "Already resolved." };
  // Attack-glyph target (defensive assignment).
  const atk = parseAttackTarget(targetUid);
  if (atk) {
    if (!hasDefensiveSymbol(face)) {
      return { ok: false, reason: "This face has no defensive symbol." };
    }
    if (face.symbols?.includes("dodge") && (state.player.statuses.dragged ?? 0) > 0) {
      return { ok: false, reason: "Dragged — cannot dodge this turn." };
    }
    const enemy = state.enemies.find((e) => e.uid === atk.uid && e.hp > 0);
    if (!enemy) return { ok: false, reason: "Invalid attacker." };
    if (atk.idx < 0 || atk.idx >= enemy.rolledFaces.length) {
      return { ok: false, reason: "Invalid attack glyph." };
    }
    // Block/dodge/riposte only mitigate damaging attacks. Reproduce, brace,
    // pilfer, force-face — non-damaging effects — cannot be defended this way.
    const targetFace = getFace(enemy.rolledFaces[atk.idx].faceId);
    if (!targetFace || !hasDamagingSymbol(targetFace)) {
      return { ok: false, reason: "Nothing damaging to block here." };
    }
    return { ok: true };
  }
  // Defensive faces cannot be self-applied — they only have meaning against a
  // specific incoming attack. If no targetable attack remains, the face wastes.
  if (targetUid === null && hasDefensiveSymbol(face)) {
    return { ok: false, reason: "Defensive face — assign to an enemy attack." };
  }
  return validateTarget(state, face, targetUid);
}

function validateTarget(
  state: DiceCombatState,
  face: FaceDef,
  targetUid: string | null,
): AssignCheck {
  const kind = face.target;
  const ranged = face.symbols?.includes("ranged") ?? false;
  if (kind === "self" || kind === "none") {
    return targetUid === null ? { ok: true } : { ok: false, reason: "This face has no target." };
  }
  if (kind === "all-front" || kind === "all-enemies") {
    return targetUid === null ? { ok: true } : { ok: false, reason: "Auto-targets all." };
  }
  if (!targetUid) return { ok: false, reason: "Pick a target." };
  const anyTaunting = state.enemies.some((e) => e.hp > 0 && e.statuses.taunt);
  const enemy = state.enemies.find(
    (e) => e.uid === targetUid && e.hp > 0 && !e.untargetable && !e.statuses.hidden,
  );
  if (!enemy) return { ok: false, reason: "Invalid target." };
  if (anyTaunting && !enemy.statuses.taunt) {
    return { ok: false, reason: "A taunting enemy must be targeted first." };
  }
  // `ranged` symbol or no living front-row enemies overrides front-row restriction.
  if (kind === "front-enemy" && enemy.row !== "front" && !ranged) {
    const hasFrontEnemy = state.enemies.some(
      (e) => e.hp > 0 && !e.untargetable && !e.statuses.hidden && e.row === "front",
    );
    if (hasFrontEnemy) return { ok: false, reason: "Front-row only." };
  }
  return { ok: true };
}

export function assignFace(
  state: DiceCombatState,
  poolId: number,
  targetUid: string | null,
): DiceCombatState {
  const check = canAssign(state, poolId, targetUid);
  if (!check.ok) return state;
  const pf = state.pool.find((p) => p.poolId === poolId);
  const face = pf ? getFace(pf.faceId) : null;
  if (!face || !pf) return state;

  let s = state;
  const effectiveFace = withPoisonSymbols(s, pf, face);
  const atk = parseAttackTarget(targetUid);
  if (atk) {
    // Defensive assignment: register a mitigation, deferred to enemy attack time.
    const key = `${atk.uid}:${atk.idx}`;
    const cur: AttackMitigation = s.attackMitigations[key] ?? {
      block: 0,
      dodge: false,
      riposteDamage: 0,
    };
    let block = cur.block;
    let dodge = cur.dodge;
    let riposteDamage = cur.riposteDamage;
    for (const sym of effectiveFace.symbols ?? []) {
      if (sym === "shield") block += 1;
      else if (sym === "dodge") dodge = true;
      else if (sym === "riposte") riposteDamage += 1;
      // Self-affecting symbols on a defensive face still apply to the player.
      else if (
        sym === "heart" ||
        sym === "crystal" ||
        sym === "power" ||
        sym === "sun" ||
        sym === "cleanse" ||
        sym === "self_damage"
      ) {
        s = applyFaceSymbols(s, { ...effectiveFace, symbols: [sym] }, null);
      }
    }
    s = {
      ...s,
      attackMitigations: { ...s.attackMitigations, [key]: { block, dodge, riposteDamage } },
      log: appendLog(s, "player", `${face.label} → defends vs attack.`),
    };
  } else {
    // Normal assignment: resolve the face immediately against the target.
    s = applyFaceSymbols(s, effectiveFace, targetUid);
  }

  s = {
    ...s,
    assignments: {
      ...s.assignments,
      [poolId]: { poolId, targetUid, resolved: true },
    },
  };
  // v3: assignments resolve immediately, so a kill can end combat mid-pool.
  if (isVictory(s)) return finalize(s, "victory");
  return s;
}

export function allAssigned(state: DiceCombatState): boolean {
  for (const pf of state.pool) {
    if (pf.stunned) continue;
    const face = getFace(pf.faceId);
    if (!face) continue;
    if (face.target === "none") continue;
    // Defensive faces are optional — leaving them unassigned wastes them but
    // does not block turn end.
    if (hasDefensiveSymbol(face)) continue;
    if (!state.assignments[pf.poolId]) return false;
  }
  return true;
}

/* ─────────────────────────────────────────────────────────────────────────
 * RESOLVE TURN
 * ───────────────────────────────────────────────────────────────────────── */

/** Build the enemy attack queue: front-row enemies first, each contributing one
 * entry per rolled face. Stunned/dead/untargetable enemies are skipped. */
function buildEnemyQueue(state: DiceCombatState): EnemyQueueEntry[] {
  const order = [...state.enemies].sort(
    (a, b) => (a.row === "front" ? -1 : 1) - (b.row === "front" ? -1 : 1),
  );
  const queue: EnemyQueueEntry[] = [];
  for (const e of order) {
    if (e.hp <= 0 || e.untargetable) continue;
    // Enemies that advanced to front this turn (no rolled faces) skip their turn.
    if (e.rolledFaces.length === 0) continue;
    for (let i = 0; i < e.rolledFaces.length; i++) {
      queue.push({ uid: e.uid, faceIndex: i });
    }
  }
  return queue;
}

/** v3: kicks off enemy phase by setting up the queue. UI then calls stepEnemyTurn
 * repeatedly to walk through it. Bust path also routes through here. */
export function resolveTurn(state: DiceCombatState): DiceCombatState {
  if (state.phase === "busted") {
    return {
      ...clearEnemyTurnStatuses(expirePlayerStun(state)),
      phase: "resolving-enemies",
      enemyQueue: buildEnemyQueue(state),
    };
  }
  if (state.phase !== "assigning") return state;
  if (!allAssigned(state)) return state;
  if (isVictory(state)) return finalize(state, "victory");
  const s = clearEnemyTurnStatuses(expirePlayerStun(state));
  return { ...s, phase: "resolving-enemies", enemyQueue: buildEnemyQueue(s) };
}

function clearEnemyTurnStatuses(state: DiceCombatState): DiceCombatState {
  return {
    ...state,
    enemies: state.enemies.map((e) => {
      if (!e.statuses.warded && !e.statuses.dodge && !e.statuses.intangible && !e.statuses.taunt)
        return e;
      const statuses = { ...e.statuses };
      delete (statuses as Record<string, number>).warded;
      delete (statuses as Record<string, number>).dodge;
      delete (statuses as Record<string, number>).intangible;
      delete (statuses as Record<string, number>).taunt;
      return { ...e, statuses };
    }),
  };
}

/** Drain the entire enemy queue synchronously. Used by tests and as the
 * fallback path; the UI prefers stepEnemyTurn for animation. */
export function runEnemyTurnSync(state: DiceCombatState): DiceCombatState {
  let s = state;
  let safety = 100;
  while (s.phase === "resolving-enemies" && safety-- > 0) {
    s = stepEnemyTurn(s);
  }
  return s;
}

/** v3: process exactly ONE entry from the enemy queue. Caller (UI) ticks this on a
 * timer so the player can see attacks land one at a time. When the queue empties,
 * runs end-of-turn cleanup and starts the next player turn. */
export function stepEnemyTurn(state: DiceCombatState): DiceCombatState {
  if (state.phase !== "resolving-enemies") return state;

  // Queue empty → finish the turn.
  if (state.enemyQueue.length === 0) {
    let s = endOfTurn(state);
    if (isVictory(s)) return finalize(s, "victory");
    if (isDefeat(s)) return finalize(s, "defeat");
    s = telegraphIntents(s);
    return { ...s, lastEnemyAction: null };
  }

  const head = state.enemyQueue[0];
  const rest = state.enemyQueue.slice(1);
  const enemy = state.enemies.find((e) => e.uid === head.uid);
  if (!enemy || enemy.hp <= 0) {
    return { ...state, enemyQueue: rest, lastEnemyAction: head };
  }
  // Stun: the entire enemy skips this turn — drop ALL remaining entries for this uid.
  if (enemy.statuses.stun && enemy.statuses.stun > 0) {
    const s: DiceCombatState = {
      ...state,
      enemies: state.enemies.map((x) =>
        x.uid === enemy.uid
          ? { ...x, statuses: { ...x.statuses, stun: Math.max(0, (x.statuses.stun ?? 0) - 1) } }
          : x,
      ),
      log: appendLog(state, "system", `${enemy.name} is stunned.`),
      enemyQueue: rest.filter((q) => q.uid !== enemy.uid),
      lastEnemyAction: head,
    };
    return s;
  }
  let s = state;
  if (head.faceIndex !== null && head.faceIndex >= 0) {
    const rf = enemy.rolledFaces[head.faceIndex];
    const face = rf ? getFace(rf.faceId) : null;
    if (rf && face) {
      s = applyEnemyFace(s, enemy.uid, face, rf.targetUid, head.faceIndex);
    }
  }
  if (isDefeat(s)) return finalize(s, "defeat");
  // If the attacker died (riposte), drop its remaining queue entries.
  const stillAlive = s.enemies.find((x) => x.uid === enemy.uid && x.hp > 0);
  const filtered = stillAlive ? rest : rest.filter((q) => q.uid !== enemy.uid);
  return { ...s, enemyQueue: filtered, lastEnemyAction: head };
}

/* ─────────────────────────────────────────────────────────────────────────
 * v3 SYMBOL RESOLVER
 *
 * When a face declares `symbols`, we run it through here. The symbol bag is
 * the authoritative effect spec; v2 effect fields are ignored. The resolver
 * routes through the same damageEnemy/applyStatusToEnemy/cleansePlayer paths
 * v2 uses, so redirects, resistances, and hooks all keep working.
 * ───────────────────────────────────────────────────────────────────────── */

function rowAdjacent(state: DiceCombatState, uid: string): readonly string[] {
  const target = state.enemies.find((e) => e.uid === uid);
  if (!target) return [];
  const sameRow = state.enemies.filter((e) => e.hp > 0 && e.row === target.row);
  const idx = sameRow.findIndex((e) => e.uid === uid);
  if (idx < 0) return [];
  const out: string[] = [];
  if (idx > 0) out.push(sameRow[idx - 1].uid);
  if (idx < sameRow.length - 1) out.push(sameRow[idx + 1].uid);
  return out;
}

function applySymbolsToTargets(
  state: DiceCombatState,
  face: FaceDef,
  symbols: readonly SymbolKey[],
  primaryUid: string | null,
): DiceCombatState {
  let s = state;
  if (!primaryUid) return s;

  // Build the actual target list — primary + adjacency if `area`.
  const offensiveUids: string[] = [primaryUid];
  if (face.symbols?.includes("area")) {
    for (const adj of rowAdjacent(s, primaryUid)) {
      if (!offensiveUids.includes(adj)) offensiveUids.push(adj);
    }
  }

  // Consume dodge before the symbol loop — a dodging enemy negates the whole face.
  const dodgingUids = new Set<string>();
  for (const uid of offensiveUids) {
    const actual = resolveDamageRedirect(s, uid);
    const target = s.enemies.find((e) => e.uid === actual);
    if (target?.statuses.dodge) {
      const newDodge = target.statuses.dodge - 1;
      const statuses = { ...target.statuses, dodge: newDodge };
      if (newDodge === 0) delete (statuses as Record<string, number>).dodge;
      s = { ...s, enemies: s.enemies.map((e) => (e.uid === actual ? { ...e, statuses } : e)) };
      dodgingUids.add(actual);
    }
  }
  if (dodgingUids.size === offensiveUids.length) return s;

  // Count all damage symbols up front and hit each target once with the total.
  // Sword and flame are resolved separately so flame can bypass intangible in the future.
  const swordCount = symbols.filter((sym) => sym === "sword").length;
  const flameCount = symbols.filter((sym) => sym === "flame").length;
  if (swordCount > 0 || flameCount > 0) {
    const seen = new Set<string>();
    for (const uid of offensiveUids) {
      const actual = resolveDamageRedirect(s, uid);
      if (seen.has(actual) || dodgingUids.has(actual)) continue;
      seen.add(actual);
      const totalDmg = swordCount + flameCount;
      s = damageEnemy(s, actual, totalDmg, face.label);
    }
  }

  for (const sym of symbols) {
    if (sym === "sword" || sym === "flame" || sym === "riposte") {
      // Handled above (sword/flame) or in attackMitigations (riposte).
    } else if (sym === "drop") {
      for (const uid of offensiveUids) s = applyStatusToEnemy(s, uid, "bleed", 1, face.label);
    } else if (sym === "spark") {
      for (const uid of offensiveUids) s = applyStatusToEnemy(s, uid, "stun", 1, face.label);
    } else if (sym === "bolt") {
      for (const uid of offensiveUids) s = applyStatusToEnemy(s, uid, "weaken", 1, face.label);
    } else if (sym === "mark") {
      for (const uid of offensiveUids) s = applyStatusToEnemy(s, uid, "mark", 1, face.label);
    } else if (sym === "push") {
      for (const uid of offensiveUids) s = pushEnemyToOppositeRow(s, uid, face.label);
    } else if (sym === "cleanse") {
      // Targeted to enemy: remove a status off it. (Self cleanse handled in self-buff pass.)
      for (const uid of offensiveUids) {
        const e = s.enemies.find((x) => x.uid === uid);
        if (!e) continue;
        const keys = Object.keys(e.statuses).filter(
          (k) => (e.statuses as Record<string, number>)[k] > 0,
        );
        if (keys.length === 0) continue;
        const next = { ...e.statuses } as Record<string, number>;
        delete next[keys[0]];
        s = {
          ...s,
          enemies: s.enemies.map((x) =>
            x.uid === uid ? { ...x, statuses: next as DiceEnemy["statuses"] } : x,
          ),
        };
      }
    } else if (sym === "armor_break") {
      for (const uid of offensiveUids) {
        const actual = resolveDamageRedirect(s, uid);
        s = {
          ...s,
          enemies: s.enemies.map((e) => {
            if (e.uid !== actual) return e;
            const newWarded = Math.max(0, (e.statuses.warded ?? 0) - 1);
            const statuses = { ...e.statuses, warded: newWarded };
            if (newWarded === 0) delete (statuses as Record<string, number>).warded;
            return { ...e, statuses };
          }),
          log: appendLog(s, "player", `${face.label}: armor broken.`),
        };
      }
    } else if (sym === "bleed_burst") {
      for (const uid of offensiveUids) {
        const actual = resolveDamageRedirect(s, uid);
        if (dodgingUids.has(actual)) continue;
        const enemy = s.enemies.find((e) => e.uid === actual);
        const bleedStacks = enemy?.statuses.bleed ?? 0;
        if (bleedStacks > 0) {
          s = {
            ...s,
            enemies: s.enemies.map((e) => {
              if (e.uid !== actual) return e;
              const statuses = { ...e.statuses };
              delete (statuses as Record<string, number>).bleed;
              return { ...e, statuses };
            }),
          };
          s = damageEnemy(s, actual, bleedStacks, face.label);
          s = { ...s, log: appendLog(s, "player", `${face.label}: ${bleedStacks} Bleed burst.`) };
        } else {
          s = applyStatusToEnemy(s, actual, "bleed", 2, face.label);
        }
      }
    }
    // Modifier/structural symbols (ranged, area, holy, pierce, unblockable, undodgeable,
    // drag, sneak_attack) are handled elsewhere and pass through silently.
  }
  return s;
}

/** Prepend one self_damage per poison stack on this face. */
function withPoisonSymbols(state: DiceCombatState, pf: PoolFace, face: FaceDef): FaceDef {
  const die = dieForSlot(pf.slot, state);
  const faceIndex = die.faces.indexOf(pf.faceId);
  if (faceIndex === -1) return face;
  const stacks = state.player.poisonedFaces.filter(
    (p) => p.slot === pf.slot && p.faceIndex === faceIndex,
  ).length;
  if (stacks === 0) return face;
  const injected: "self_damage"[] = Array(stacks).fill("self_damage");
  return { ...face, symbols: [...injected, ...(face.symbols ?? [])] };
}

function applyFaceSymbols(
  state: DiceCombatState,
  face: FaceDef,
  targetUid: string | null,
): DiceCombatState {
  let s = state;
  const symbols = face.symbols ?? [];

  // Self-affecting symbols first.
  // NOTE: shield/dodge/riposte are *only* meaningful when assigned to a specific
  // enemy attack. If a defensive face was self-applied (fallback when no attacks
  // remain to defend), those symbols simply waste — they do not feed a block soup.
  for (const sym of symbols) {
    if (sym === "shield" || sym === "dodge" || sym === "riposte") {
      continue;
    }
    if (sym === "heart") {
      // Heart heals friendly. In single-player "friendly" = self.
      const newHp = Math.min(s.player.maxHp, s.player.hp + 1);
      const healed = newHp - s.player.hp;
      if (healed > 0) {
        s = {
          ...s,
          player: { ...s.player, hp: newHp },
          log: appendLog(s, "player", `${face.label}: healed ${healed}.`),
        };
      }
    } else if (sym === "crystal") {
      s = {
        ...s,
        player: { ...s.player, salt: s.player.salt + 1 },
        log: appendLog(s, "player", `${face.label}: +1 salt.`),
      };
    } else if (sym === "power") {
      const cur = (s.player.statuses.power ?? 0) + 1;
      s = {
        ...s,
        player: { ...s.player, statuses: { ...s.player.statuses, power: cur } },
        log: appendLog(s, "player", `${face.label}: +1 power.`),
      };
    } else if (sym === "sun") {
      // Bolster on self.
      const cur = (s.player.statuses.bolster ?? 0) + 1;
      s = {
        ...s,
        player: { ...s.player, statuses: { ...s.player.statuses, bolster: cur } },
        log: appendLog(s, "player", `${face.label}: +1 Bolster.`),
      };
    } else if (sym === "cleanse" && (face.target === "self" || targetUid === null)) {
      s = cleansePlayer(s, 1, face.label);
    } else if (sym === "resonance") {
      s = { ...s, player: { ...s.player, resonanceCharges: s.player.resonanceCharges + 1 } };
    } else if (sym === "hymn_hum") {
      s = { ...s, player: { ...s.player, hymnHumActive: true } };
    } else if (sym === "focus") {
      const cur = (s.player.statuses.focus ?? 0) + 1;
      s = {
        ...s,
        player: { ...s.player, statuses: { ...s.player.statuses, focus: cur } },
        log: appendLog(s, "player", `${face.label}: +1 Focus.`),
      };
    } else if (sym === "self_damage") {
      const newHp = Math.max(0, s.player.hp - 1);
      s = {
        ...s,
        player: { ...s.player, hp: newHp },
        log: appendLog(s, "system", `Poison: ${face.label} burns for 1.`),
      };
    }
    // Structural modifiers (ranged, area, holy, pierce, unblockable, undodgeable,
    // armor_break, bleed_burst, drag, sneak_attack) are handled in the offensive pass.
  }

  // Offensive symbols routed through targets.
  if (face.target !== "self" && face.target !== "none" && targetUid) {
    s = applySymbolsToTargets(s, face, symbols, targetUid);
  }

  return s;
}

function resolveDamageRedirect(state: DiceCombatState, uid: string): string {
  const target = state.enemies.find((e) => e.uid === uid);
  if (!target || target.statuses.taunt) return uid;
  // If any other living enemy is taunting, redirect to it instead.
  const taunter = state.enemies.find((e) => e.uid !== uid && e.hp > 0 && e.statuses.taunt);
  return taunter ? taunter.uid : uid;
}

/* ─────────────────────────────────────────────────────────────────────────
 * DAMAGE
 * ───────────────────────────────────────────────────────────────────────── */

function damageEnemy(
  state: DiceCombatState,
  uid: string,
  base: number,
  source: string,
): DiceCombatState {
  const enemy = state.enemies.find((e) => e.uid === uid);
  if (!enemy || enemy.hp <= 0) return state;

  let dmg = base;
  const power = state.player.statuses.power ?? 0;
  if (power > 0) dmg += power;
  const bolster = state.player.statuses.bolster ?? 0;
  if (bolster > 0) dmg += bolster;
  const enemyWeaken = enemy.statuses.weaken ?? 0;
  if (enemyWeaken > 0) dmg = Math.max(0, dmg - enemyWeaken);

  // Intangible: physical damage is negated (fire/holy still lands via separate paths).
  if (enemy.statuses.intangible) {
    dmg = 0;
  }

  dmg = Math.max(0, dmg);

  // Mark doubles the next damage instance, then consumes a stack.
  let mark = enemy.statuses.mark ?? 0;
  if (mark > 0 && dmg > 0) {
    dmg = dmg * 2;
    mark -= 1;
  }
  // Warded stacks act as block.
  let warded = enemy.statuses.warded ?? 0;
  let absorbed = 0;
  if (warded > 0 && dmg > 0) {
    absorbed = Math.min(warded, dmg);
    dmg -= absorbed;
    warded -= absorbed;
  }

  const newStatuses: Record<string, number> = { ...enemy.statuses, warded, mark };
  if (warded === 0) delete newStatuses.warded;
  if (mark === 0) delete newStatuses.mark;

  const newHp = Math.max(0, enemy.hp - dmg);
  const enemies = state.enemies.map((e) =>
    e.uid === uid ? { ...e, hp: newHp, statuses: newStatuses as DiceEnemy["statuses"] } : e,
  );
  const baseLog = appendLog(state, "player", `${source}: ${dmg} → ${enemy.name}.`);
  const log =
    absorbed > 0
      ? [
          ...baseLog,
          {
            turn: state.turn,
            source: "system" as const,
            text: `${enemy.name} absorbs ${absorbed}.`,
          },
        ]
      : baseLog;
  const playerStatuses = { ...state.player.statuses };
  delete (playerStatuses as Record<string, number>).power;
  // Bolster: consume 1 stack per damage application.
  if (bolster > 0) {
    const newBolster = bolster - 1;
    if (newBolster === 0) delete (playerStatuses as Record<string, number>).bolster;
    else playerStatuses.bolster = newBolster;
  }
  let s: DiceCombatState = {
    ...state,
    enemies,
    player: { ...state.player, statuses: playerStatuses },
    log,
  };

  if (newHp === 0) s = handleEnemyDeath(s, enemy);
  return s;
}

function handleEnemyDeath(state: DiceCombatState, enemy: DiceEnemy): DiceCombatState {
  const def = getEnemyDef(enemy.id);
  let s: DiceCombatState = {
    ...state,
    enemies: state.enemies.filter((e) => e.uid !== enemy.uid),
    log: appendLog(state, "system", `${enemy.name} falls.`),
  };
  if (s.player.corruptedFaces.some((c) => c.sourceUid === enemy.uid)) {
    s = {
      ...s,
      player: {
        ...s.player,
        corruptedFaces: s.player.corruptedFaces.filter((c) => c.sourceUid !== enemy.uid),
      },
      log: appendLog(s, "system", `${enemy.name}'s corruption fades.`),
    };
  }
  if (def?.onDeath) s = def.onDeath(enemy, s);
  return s;
}

function applyStatusToEnemy(
  state: DiceCombatState,
  uid: string,
  status: StatusKey,
  stacks: number,
  source: string,
): DiceCombatState {
  const enemies = state.enemies.map((e) => {
    if (e.uid !== uid) return e;
    const current = e.statuses[status] ?? 0;
    return { ...e, statuses: { ...e.statuses, [status]: current + stacks } };
  });
  const enemy = enemies.find((e) => e.uid === uid);
  return {
    ...state,
    enemies,
    log: appendLog(state, "player", `${source}: ${stacks} ${status} → ${enemy?.name ?? "target"}.`),
  };
}

function pushEnemyToOppositeRow(
  state: DiceCombatState,
  uid: string,
  source: string,
): DiceCombatState {
  const enemies = state.enemies.map((e) =>
    e.uid === uid ? { ...e, row: (e.row === "front" ? "back" : "front") as Row } : e,
  );
  const enemy = enemies.find((e) => e.uid === uid);
  return {
    ...state,
    enemies,
    log: appendLog(state, "player", `${source}: shoved ${enemy?.name ?? "?"} to ${enemy?.row}.`),
  };
}

function applyPoisonStack(state: DiceCombatState, stacks: number): DiceCombatState {
  let s = state;
  for (let i = 0; i < stacks; i++) {
    // Any of the 24 face slots can be picked — stacks accumulate on the same face.
    const candidates: { slot: DieSlot; faceIndex: number }[] = [];
    for (const slot of SLOT_ORDER) {
      for (let fi = 0; fi < 6; fi++) {
        candidates.push({ slot, faceIndex: fi });
      }
    }
    const r = nextRng(s.rng);
    const pick = candidates[r.value % candidates.length];
    const die = dieForSlot(pick.slot, s);
    const faceDef = getFace(die.faces[pick.faceIndex]);
    s = {
      ...s,
      rng: r.seed,
      player: {
        ...s.player,
        statuses: { ...s.player.statuses, poison: (s.player.statuses.poison ?? 0) + 1 },
        poisonedFaces: [...s.player.poisonedFaces, pick],
      },
      log: appendLog(
        s,
        "system",
        `Poison corrupts ${faceDef?.label ?? pick.slot} (face ${pick.faceIndex + 1}).`,
      ),
    };
  }
  return s;
}

function clearPoisonStack(state: DiceCombatState, count: number): DiceCombatState {
  let s = state;
  for (let i = 0; i < count; i++) {
    if (s.player.poisonedFaces.length === 0) break;
    const r = nextRng(s.rng);
    const idx = r.value % s.player.poisonedFaces.length;
    const removed = s.player.poisonedFaces[idx];
    const die = dieForSlot(removed.slot, s);
    const faceDef = getFace(die.faces[removed.faceIndex]);
    const newPoisoned = s.player.poisonedFaces.filter((_, j) => j !== idx);
    const newPoison = Math.max(0, (s.player.statuses.poison ?? 0) - 1);
    const nextStatuses = { ...s.player.statuses, poison: newPoison };
    if (newPoison === 0) delete (nextStatuses as Record<string, number>).poison;
    s = {
      ...s,
      rng: r.seed,
      player: { ...s.player, statuses: nextStatuses, poisonedFaces: newPoisoned },
      log: appendLog(
        s,
        "system",
        `Poison clears from ${faceDef?.label ?? removed.slot} (face ${removed.faceIndex + 1}).`,
      ),
    };
  }
  return s;
}

function cleansePlayer(state: DiceCombatState, count: number, source: string): DiceCombatState {
  const keys = Object.keys(state.player.statuses) as StatusKey[];
  if (keys.length === 0) return state;
  const next = { ...state.player.statuses };
  let removed = 0;
  let poisonRemoved = 0;
  for (const k of keys) {
    if (removed >= count) break;
    if (k === "poison") {
      poisonRemoved++;
    } else {
      delete next[k];
    }
    removed++;
  }
  let s: DiceCombatState = { ...state, player: { ...state.player, statuses: next } };
  if (poisonRemoved > 0) s = clearPoisonStack(s, poisonRemoved);
  return { ...s, log: appendLog(s, "player", `${source}: cleansed ${removed}.`) };
}

/* ─────────────────────────────────────────────────────────────────────────
 * ENEMY PHASE
 * ───────────────────────────────────────────────────────────────────────── */

function telegraphIntents(state: DiceCombatState): DiceCombatState {
  let rng = state.rng;

  // Roll dice for every living enemy. Ghost intangibility is cleared here and only
  // Clear per-turn statuses (dodge, intangible, hidden, taunt), then re-grant from this turn's roll.
  const enemies = state.enemies.map((e) => {
    const def = getEnemyDef(e.id);
    if (!def) return e;

    if (e.hp <= 0) return { ...e, rolledFaces: [] };

    // Back-row advance: front-row enemies pushed to back row advance back and forfeit turn.
    if (e.row === "back" && def.defaultRow === "front") {
      return { ...e, row: "front" as const, rolledFaces: [] };
    }

    // Clear hidden — dodge/intangible were already cleared at start of enemy phase.
    const clearedStatuses = { ...e.statuses };
    delete (clearedStatuses as Record<string, number>).hidden;
    const base = { ...e, statuses: clearedStatuses as typeof e.statuses };

    if (def.dice && def.dice.length > 0) {
      const dice = def.phaseDice ? (def.phaseDice[base.phaseIndex] ?? def.dice) : def.dice;
      const rolled: EnemyRolledFace[] = [];
      let currentStatuses = { ...base.statuses };
      for (const die of dice) {
        const focusStacks = currentStatuses.focus ?? 0;
        let faceIdx: number;
        let usedFocus = false;
        if (focusStacks > 0) {
          faceIdx = die.faces.reduce((best, faceId, i) => {
            const count = getFace(faceId)?.symbols?.length ?? 0;
            const bestCount = getFace(die.faces[best])?.symbols?.length ?? 0;
            return count > bestCount ? i : best;
          }, 0);
          const newFocus = focusStacks - 1;
          currentStatuses = { ...currentStatuses, focus: newFocus };
          if (newFocus === 0) delete (currentStatuses as Record<string, number>).focus;
          usedFocus = true;
        } else {
          const r = rollD6(rng);
          rng = r.seed;
          faceIdx = r.face;
        }
        const faceId = die.faces[faceIdx];
        const targetUid = die.defaultTarget === "self" ? base.uid : "player";
        rolled.push({ dieId: die.id, faceId, targetUid, focused: usedFocus || undefined });
      }
      return { ...base, statuses: currentStatuses as typeof base.statuses, rolledFaces: rolled };
    }
    return { ...base, rolledFaces: [] };
  });

  return { ...state, enemies, rng };
}

function applyEnemyFace(
  state: DiceCombatState,
  attackerUid: string,
  face: FaceDef,
  _defaultTargetUid: string,
  faceIndex: number,
): DiceCombatState {
  let s = state;
  let attacker = s.enemies.find((e) => e.uid === attackerUid);
  if (!attacker) return s;

  const symbols = face.symbols ?? [];
  const unblockable = face.symbols?.includes("unblockable") ?? false;
  const undodgeable = face.symbols?.includes("undodgeable") ?? false;

  // sneak_attack symbol: the entire face fizzles if the attacker is not hidden.
  if (face.symbols?.includes("sneak_attack") && !attacker.statuses.hidden) {
    return {
      ...s,
      log: appendLog(s, "enemy", `${attacker.name}'s Sneak Attack — not hidden, fizzles.`),
    };
  }

  // v3: consult per-attack mitigations the player set during assignment.
  const mitigationKey = `${attackerUid}:${faceIndex}`;
  const mit = s.attackMitigations[mitigationKey];

  // Riposte fires before any of the face's symbols. Returns damage to attacker
  // and blocks the same amount of incoming damage (melee only).
  const hasMeleeDamage = symbols.includes("sword");
  if (mit && mit.riposteDamage > 0 && hasMeleeDamage) {
    s = damageEnemy(s, attackerUid, mit.riposteDamage, "Riposte");
    attacker = s.enemies.find((e) => e.uid === attackerUid);
    // If riposte killed the attacker, the attack is cancelled.
    if (!attacker || attacker.hp <= 0) {
      return s;
    }
  }
  // Targeted dodge cancels this whole attack face (if not undodgeable).
  if (mit && mit.dodge && !undodgeable) {
    s = {
      ...s,
      log: appendLog(s, "player", `Dodged ${attacker.name}'s ${face.label}.`),
    };
    return s;
  }
  // Targeted block budget for this attack. Riposte also contributes block vs melee.
  const riposteBlock = hasMeleeDamage && !unblockable ? (mit?.riposteDamage ?? 0) : 0;
  let attackBlock = unblockable ? 0 : (mit?.block ?? 0) + riposteBlock;

  for (const sym of symbols) {
    if (sym === "sword") {
      // 1 damage to player, respecting unblockable / undodgeable.
      let dmg = 1;
      // Bolster/weaken modify the attacker's own damage output; each consumes 1 stack per hit.
      const attackerBolster = attacker.statuses.bolster ?? 0;
      const attackerWeaken = attacker.statuses.weaken ?? 0;
      if (attackerBolster > 0 || attackerWeaken > 0) {
        dmg = Math.max(0, dmg + attackerBolster - attackerWeaken);
        const newBolster = Math.max(0, attackerBolster - 1);
        const newWeaken = Math.max(0, attackerWeaken - 1);
        s = {
          ...s,
          enemies: s.enemies.map((e) => {
            if (e.uid !== attackerUid) return e;
            const st = { ...e.statuses, bolster: newBolster, weaken: newWeaken };
            if (newBolster === 0) delete (st as Record<string, number>).bolster;
            if (newWeaken === 0) delete (st as Record<string, number>).weaken;
            return { ...e, statuses: st };
          }),
        };
        attacker = s.enemies.find((e) => e.uid === attackerUid) ?? attacker;
      }
      // Per-attack targeted block (from attackMitigations).
      if (attackBlock > 0 && dmg > 0) {
        const absorbed = Math.min(attackBlock, dmg);
        dmg -= absorbed;
        attackBlock -= absorbed;
        s = {
          ...s,
          log: appendLog(s, "system", `Shield absorbs ${absorbed} of ${attacker.name}'s damage.`),
        };
      }
      // v3: shields *only* land via per-attack mitigations (attackMitigations).
      // There is no global block soup.
      if (dmg > 0) {
        // Player mark doubles the next incoming damage instance, then consumes a stack.
        let playerMark = s.player.statuses.mark ?? 0;
        if (playerMark > 0) {
          dmg *= 2;
          playerMark -= 1;
          const markStatuses = { ...s.player.statuses, mark: playerMark };
          if (playerMark === 0) delete (markStatuses as Record<string, number>).mark;
          s = { ...s, player: { ...s.player, statuses: markStatuses } };
        }
        const newHp = Math.max(0, s.player.hp - dmg);
        s = {
          ...s,
          player: { ...s.player, hp: newHp },
          log: appendLog(s, "enemy", `${attacker.name}'s ${face.label} hits for ${dmg}.`),
        };
        if (isDefeat(s)) return s;
      }
    } else if (sym === "spark") {
      // Stun applies to player as the existing stun status (one whole intent skipped).
      const cur = (s.player.statuses.stun ?? 0) + 1;
      s = {
        ...s,
        player: { ...s.player, statuses: { ...s.player.statuses, stun: cur } },
        log: appendLog(s, "enemy", `${attacker.name}: +1 Stun.`),
      };
    } else if (sym === "bolt") {
      const cur = (s.player.statuses.weaken ?? 0) + 1;
      s = {
        ...s,
        player: { ...s.player, statuses: { ...s.player.statuses, weaken: cur } },
        log: appendLog(s, "enemy", `${attacker.name}: +1 Weaken.`),
      };
    } else if (sym === "drop") {
      const cur = (s.player.statuses.bleed ?? 0) + 1;
      s = {
        ...s,
        player: { ...s.player, statuses: { ...s.player.statuses, bleed: cur } },
        log: appendLog(s, "enemy", `${attacker.name}: +1 Bleed.`),
      };
    } else if (sym === "poison") {
      s = applyPoisonStack(s, 1);
      s = { ...s, log: appendLog(s, "enemy", `${attacker.name}: +1 Poison.`) };
    } else if (sym === "drag") {
      s = {
        ...s,
        player: { ...s.player, statuses: { ...s.player.statuses, dragged: 1 } },
        log: appendLog(s, "enemy", `${attacker.name} drags you — dodge disabled next turn.`),
      };
    } else if (sym === "mark") {
      const cur = (s.player.statuses.mark ?? 0) + 1;
      s = {
        ...s,
        player: { ...s.player, statuses: { ...s.player.statuses, mark: cur } },
        log: appendLog(s, "enemy", `${attacker.name} marks you — next hit is doubled.`),
      };
    } else if (sym === "heart") {
      // Self-heal on the attacker (e.g. Vampire's Drain).
      s = {
        ...s,
        enemies: s.enemies.map((x) =>
          x.uid === attackerUid ? { ...x, hp: Math.min(x.maxHp, x.hp + 1) } : x,
        ),
        log: appendLog(s, "enemy", `${attacker.name} heals 1.`),
      };
    } else if (sym === "steal") {
      const stolen = Math.min(1, s.player.salt);
      if (stolen > 0) {
        s = {
          ...s,
          player: { ...s.player, salt: s.player.salt - stolen },
          log: appendLog(s, "enemy", `${attacker.name} pilfers ${stolen} salt.`),
        };
      } else {
        s = { ...s, log: appendLog(s, "enemy", `${attacker.name} finds no salt.`) };
      }
    } else if (sym === "shield") {
      s = {
        ...s,
        enemies: s.enemies.map((e) =>
          e.uid === attackerUid
            ? { ...e, statuses: { ...e.statuses, warded: (e.statuses.warded ?? 0) + 1 } }
            : e,
        ),
        log: appendLog(s, "enemy", `${attacker.name} raises its guard (+1 ward).`),
      };
    } else if (sym === "taunt") {
      s = {
        ...s,
        enemies: s.enemies.map((e) =>
          e.uid === attackerUid ? { ...e, statuses: { ...e.statuses, taunt: 1 } } : e,
        ),
        log: appendLog(s, "enemy", `${attacker.name} taunts — others are untargetable.`),
      };
    } else if (sym === "intangible") {
      s = {
        ...s,
        enemies: s.enemies.map((e) =>
          e.uid === attackerUid ? { ...e, statuses: { ...e.statuses, intangible: 1 } } : e,
        ),
      };
    } else if (sym === "hide") {
      s = {
        ...s,
        enemies: s.enemies.map((e) =>
          e.uid === attackerUid ? { ...e, statuses: { ...e.statuses, hidden: 1 } } : e,
        ),
      };
    } else if (sym === "dodge") {
      s = {
        ...s,
        enemies: s.enemies.map((e) =>
          e.uid === attackerUid ? { ...e, statuses: { ...e.statuses, dodge: 1 } } : e,
        ),
      };
    } else if (sym === "reform") {
      // Heap of Bones: immediately convert self into a Skeleton at half HP.
      const skelDef = DICE_ENEMY_DEFS.skeleton;
      s = {
        ...s,
        enemies: s.enemies.map((e) =>
          e.uid === attackerUid
            ? {
                ...e,
                id: skelDef.id,
                name: skelDef.name,
                icon: skelDef.icon,
                maxHp: skelDef.maxHp,
                hp: Math.max(1, Math.ceil(skelDef.maxHp / 2)),
                statuses: {},
              }
            : e,
        ),
        log: appendLog(s, "enemy", `The Heap of Bones reforms — a Skeleton rises.`),
      };
      // Reformed enemy no longer attacks this face; skip remaining symbols.
      return s;
    } else if (sym === "summon") {
      s = spawnEnemy(s, "zombie");
      s = { ...s, log: appendLog(s, "enemy", `The Necromancer raises a Zombie.`) };
    } else if (sym === "invert") {
      // False Sacrarium: identify the player's most-rolled color; next turn it counts as Brine.
      const counts = new Map<string, number>();
      for (const pf of s.pool) {
        if (pf.color === "colorless") continue;
        counts.set(pf.color, (counts.get(pf.color) ?? 0) + 1);
      }
      if (counts.size > 0) {
        let topColor = "crimson";
        let topCount = 0;
        for (const [color, count] of counts) {
          if (count > topCount) {
            topCount = count;
            topColor = color;
          }
        }
        if (topColor !== "brine") {
          s = {
            ...s,
            player: { ...s.player, invertedColor: topColor as FaceColor },
            log: appendLog(
              s,
              "enemy",
              `Blessing Inversion — your ${topColor} faces count as Brine next turn.`,
            ),
          };
        }
      }
    } else if (sym === "bind") {
      // Salt Revenant / salt-grapple: lock the first unlocked die slot.
      const candidates: DieSlot[] = ["main", "ability", "offhand", "armor"];
      const target = candidates.find((slot) => !s.player.slotLocks.includes(slot));
      if (target) {
        s = lockSlot(s, target);
        s = {
          ...s,
          log: appendLog(
            s,
            "enemy",
            `${attacker.name} locks your ${target} die — spend an Iron face to break free.`,
          ),
        };
      }
    } else if (sym === "burrow_spawn") {
      // Gutborn Larva: surface (become targetable, move to front) and spawn a Zombie.
      s = {
        ...s,
        enemies: s.enemies.map((e) =>
          e.uid === attackerUid ? { ...e, row: "front" as const, untargetable: false } : e,
        ),
      };
      s = spawnEnemy(s, "zombie");
      s = { ...s, log: appendLog(s, "enemy", `The Larva surfaces and animates a corpse.`) };
    } else if (sym === "focus") {
      // Target the living ally with the highest symbol count on any single face.
      // Falls back to self if no other ally is alive.
      const allies = s.enemies.filter((e) => e.hp > 0);
      const maxSymbolsFor = (e: DiceEnemy) => {
        const def = getEnemyDef(e.id);
        if (!def) return 0;
        const dice = def.phaseDice ? (def.phaseDice[e.phaseIndex] ?? def.dice) : (def.dice ?? []);
        return dice.reduce((best, die) => {
          const faceMax = die.faces.reduce(
            (m, fid) => Math.max(m, getFace(fid)?.symbols?.length ?? 0),
            0,
          );
          return Math.max(best, faceMax);
        }, 0);
      };
      const focusTarget = allies.reduce((best, e) =>
        maxSymbolsFor(e) > maxSymbolsFor(best) ? e : best,
      );
      s = {
        ...s,
        enemies: s.enemies.map((e) =>
          e.uid === focusTarget.uid
            ? { ...e, statuses: { ...e.statuses, focus: (e.statuses.focus ?? 0) + 1 } }
            : e,
        ),
        log: appendLog(
          s,
          "enemy",
          focusTarget.uid === attackerUid
            ? `${attacker.name} focuses — will pick its best face next roll.`
            : `${attacker.name} focuses ${focusTarget.name} — it will pick its best face next roll.`,
        ),
      };
      attacker = s.enemies.find((e) => e.uid === attackerUid);
      if (!attacker) return s;
    } else if (sym === "sun") {
      // Bolster the ally with the most damage-symbol faces. If focus already ran this
      // turn, its target received focus; bolster independently picks its own best target.
      const damageSym = new Set<SymbolKey>(["sword", "flame"]);
      const damageSymCount = (e: DiceEnemy) => {
        const def = getEnemyDef(e.id);
        if (!def) return 0;
        const dice = def.phaseDice ? (def.phaseDice[e.phaseIndex] ?? def.dice) : (def.dice ?? []);
        return dice.reduce((best, die) => {
          const faceMax = die.faces.reduce(
            (m, fid) =>
              Math.max(m, getFace(fid)?.symbols?.filter((sym) => damageSym.has(sym)).length ?? 0),
            0,
          );
          return Math.max(best, faceMax);
        }, 0);
      };
      const allies = s.enemies.filter((e) => e.hp > 0);
      const bolsterTarget = allies.reduce((best, e) =>
        damageSymCount(e) > damageSymCount(best) ? e : best,
      );
      s = {
        ...s,
        enemies: s.enemies.map((e) =>
          e.uid === bolsterTarget.uid
            ? { ...e, statuses: { ...e.statuses, bolster: (e.statuses.bolster ?? 0) + 1 } }
            : e,
        ),
        log: appendLog(s, "enemy", `${attacker.name} bolsters ${bolsterTarget.name}.`),
      };
      attacker = s.enemies.find((e) => e.uid === attackerUid) ?? attacker;
    } else if (sym === "reproduce") {
      // Spawn a same-id enemy in the same row, capped at 5 of this id alive.
      const sameKind = s.enemies.filter((x) => x.id === attacker!.id && x.hp > 0).length;
      if (sameKind < 5) {
        const def = getEnemyDef(attacker.id);
        if (def) {
          const r = nextRng(s.rng);
          const newEnemy: DiceEnemy = {
            uid: `${attacker.id}_spawn_${r.value}`,
            id: def.id,
            name: def.name,
            icon: def.icon,
            hp: def.maxHp,
            maxHp: def.maxHp,
            row: attacker.row,
            statuses: {},
            isBoss: def.isBoss,
            untargetable: false,
            phaseIndex: 0,
            rolledFaces: [],
          };
          s = {
            ...s,
            rng: r.seed,
            enemies: [...s.enemies, newEnemy],
            log: appendLog(s, "enemy", `${attacker.name} reproduces — a new ${def.name} arrives.`),
          };
        }
      }
    }
  }
  return s;
}

/* ─────────────────────────────────────────────────────────────────────────
 * END OF TURN
 * ───────────────────────────────────────────────────────────────────────── */

function endOfTurn(state: DiceCombatState): DiceCombatState {
  // v3: clear per-attack mitigations — they apply only to this turn's enemy roll.
  let s: DiceCombatState = { ...state, attackMitigations: {} };

  // 3. Tick player statuses.
  s = tickPlayerStatuses(s);

  // 4. Tick enemy statuses.
  s = tickEnemyStatuses(s);

  // 5. Clear pool / advance turn. Per-turn player flags are reset in
  // startOfPlayerTurn so hooks (e.g. Lich P3 Hymn-Hum) can re-grant.
  s = { ...s, pool: [], assignments: {}, turn: s.turn + 1 };

  // 6. Run start-of-next-player-turn hooks.
  s = startOfPlayerTurn(s);
  return s;
}

function tickPlayerStatuses(state: DiceCombatState): DiceCombatState {
  let s = state;
  const bleed = s.player.statuses.bleed;
  if (bleed && bleed > 0) {
    const newHp = Math.max(0, s.player.hp - bleed);
    s = {
      ...s,
      player: {
        ...s.player,
        hp: newHp,
        statuses: { ...s.player.statuses, bleed: bleed - 1 },
      },
      log: appendLog(s, "system", `Bleed: -${bleed} HP.`),
    };
  }
  // Dragged decays one stack per turn. Bolster/weaken consume on use instead.
  const decayKeys = ["dragged"] as const;
  const decayed = { ...s.player.statuses };
  for (const key of decayKeys) {
    if ((decayed[key] ?? 0) > 0) {
      const cur = (decayed[key] ?? 0) - 1;
      if (cur === 0) delete (decayed as Record<string, number>)[key];
      else decayed[key] = cur;
    }
  }
  s = { ...s, player: { ...s.player, statuses: decayed } };
  return s;
}

function expirePlayerStun(state: DiceCombatState): DiceCombatState {
  const remaining = state.player.statuses.stun ?? 0;
  if (remaining === 0) return state;
  const next = { ...state.player.statuses };
  delete (next as Record<string, number>).stun;
  return {
    ...state,
    player: { ...state.player, statuses: next },
    log: appendLog(state, "system", `Stun ×${remaining} expires.`),
  };
}

function tickEnemyStatuses(state: DiceCombatState): DiceCombatState {
  let s = state;
  const enemies: DiceEnemy[] = [];
  for (const e of s.enemies) {
    const bleed = e.statuses.bleed ?? 0;
    let hp = e.hp;
    const statuses = { ...e.statuses };
    if (bleed > 0) {
      hp = Math.max(0, hp - bleed);
      statuses.bleed = bleed - 1;
    }
    enemies.push({ ...e, hp, statuses });
  }
  s = { ...s, enemies };
  // Drop dead enemies (status-tick deaths bypass onDeath).
  return { ...s, enemies: s.enemies.filter((e) => e.hp > 0) };
}

/* ─────────────────────────────────────────────────────────────────────────
 * VICTORY / DEFEAT
 * ───────────────────────────────────────────────────────────────────────── */

function isVictory(state: DiceCombatState): boolean {
  return state.enemies.every((e) => e.hp <= 0);
}

function isDefeat(state: DiceCombatState): boolean {
  return state.player.hp <= 0;
}

function finalize(state: DiceCombatState, outcome: "victory" | "defeat"): DiceCombatState {
  // Clear poison at end of combat regardless of outcome.
  const statuses = { ...state.player.statuses };
  delete (statuses as Record<string, number>).poison;
  return {
    ...state,
    player: { ...state.player, statuses, poisonedFaces: [] },
    phase: outcome,
    log: appendLog(state, "system", outcome === "victory" ? "Victory." : "You fall."),
  };
}

/* ─────────────────────────────────────────────────────────────────────────
 * LOGGING
 * ───────────────────────────────────────────────────────────────────────── */

function appendLog(
  state: DiceCombatState,
  source: DiceCombatLogEntry["source"],
  text: string,
): readonly DiceCombatLogEntry[] {
  return [...state.log, { turn: state.turn, source, text }];
}

/* ─────────────────────────────────────────────────────────────────────────
 * RE-EXPORTS
 * ───────────────────────────────────────────────────────────────────────── */

export { ABILITY_STARTING_FACES, SLOT_ORDER };
