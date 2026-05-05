import type { DamageType, StatusKey } from "../../types";
import { DICE_BALANCE } from "../balance";
import { COLORS, getDieForSlot, getFace, SLOT_ORDER, ABILITY_STARTING_FACES } from "../dice-defs";
import { DICE_ENEMY_DEFS, getEnemyDef } from "../enemy-defs";
import type {
  AttackMitigation,
  DiceCombatInit,
  DiceCombatLogEntry,
  DiceCombatState,
  DiceEnemy,
  DieDef,
  DieSlot,
  EnemyQueueEntry,
  FaceColor,
  FaceDef,
  FaceTag,
  FaceTargetKind,
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
      resistances: def.resistances,
      vulnerabilities: def.vulnerabilities,
      isBoss: def.isBoss,
      intent: null,
      untargetable: false,
      reassembleQueued: false,
      reassembleCountdown: 0,
      turnsAlive: 0,
      phaseIndex: 0,
      thresholdHealUsed: false,
      intangible: false,
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
      powerCharges: 0,
      twoHandedActive: false,
      dodgeActive: false,
      hymnHumActive: false,
      resonanceCharges: 0,
      slotLocks: [],
      corruptedFaces: [],
      forcedFacesNextTurn: [],
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
      twoHandedActive: false,
      powerCharges: 0,
      resonanceCharges: 0,
      dodgeActive: false,
      hymnHumActive: false,
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
    const shadowAlive = s.enemies.some((e) => e.id === "shadow" && e.hp > 0);
    for (const forced of s.player.forcedFacesNextTurn) {
      const face = getFace(forced.faceId);
      if (!face) continue;
      const color: FaceColor = face.color === "blank" && shadowAlive ? "coldfire" : face.color;
      pool = [
        ...pool,
        { poolId: nextId, slot: "main", faceId: forced.faceId, color, forced: true },
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

  // Shadow Coldfire Mark: while a Shadow lives, blanks recolor to Coldfire.
  if (faceDef.color === "blank") {
    const shadowAlive = state.enemies.some((e) => e.id === "shadow" && e.hp > 0);
    if (shadowAlive) return "coldfire";
  }
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

  const newPoolFace: PoolFace = {
    poolId: state.nextPoolId,
    slot,
    faceId,
    color,
    forced: false,
  };

  let s: DiceCombatState = {
    ...state,
    pool: [...state.pool, newPoolFace],
    nextPoolId: state.nextPoolId + 1,
    rng: r.seed,
    log: appendLog(state, "player", `Rolled ${faceDef.label} (${COLORS[color].label}).`),
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
    const c = pf.color;
    // Hymn-Hum: Echo faces count as wildcards (don't contribute to a clash).
    if (state.player.hymnHumActive && c === "echo") continue;
    // v3: faces tagged `silent` don't count for the bust check.
    const fd = getFace(pf.faceId);
    if (fd?.tags?.includes("silent")) continue;
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
    if (face.target === "none") {
      assignments[pf.poolId] = { poolId: pf.poolId, targetUid: null, resolved: true };
      continue;
    }
    // Defensive faces wait for the player to pick a specific attack glyph.
    if (hasDefensiveSymbol(face)) continue;
    if (face.target === "self") {
      s = applyFaceEffect(s, face, null);
      assignments[pf.poolId] = { poolId: pf.poolId, targetUid: null, resolved: true };
      continue;
    }
    if (face.target === "all-front" || face.target === "all-enemies") {
      s = applyFaceEffect(s, face, null);
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
  const ranged = face.tags?.includes("ranged") ?? false;
  if (kind === "self" || kind === "none") {
    return targetUid === null ? { ok: true } : { ok: false, reason: "This face has no target." };
  }
  if (kind === "all-front" || kind === "all-enemies") {
    return targetUid === null ? { ok: true } : { ok: false, reason: "Auto-targets all." };
  }
  if (!targetUid) return { ok: false, reason: "Pick a target." };
  const enemy = state.enemies.find((e) => e.uid === targetUid && e.hp > 0 && !e.untargetable);
  if (!enemy) return { ok: false, reason: "Invalid target." };
  // `ranged` tag overrides front-row restriction.
  if (kind === "front-enemy" && enemy.row !== "front" && !ranged) {
    return { ok: false, reason: "Front-row only." };
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
  const face = faceAtPoolId(state, poolId);
  if (!face) return state;

  let s = state;
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
    for (const sym of face.symbols ?? []) {
      if (sym === "shield") block += 1;
      else if (sym === "dodge") dodge = true;
      else if (sym === "riposte") riposteDamage += 1;
      // Self-affecting symbols on a defensive face still apply to the player.
      else if (
        sym === "heart" ||
        sym === "crystal" ||
        sym === "power" ||
        sym === "sun" ||
        sym === "cleanse"
      ) {
        // Apply via the symbol resolver against self.
        s = applyFaceSymbols(s, { ...face, symbols: [sym] }, null);
      }
    }
    s = {
      ...s,
      attackMitigations: { ...s.attackMitigations, [key]: { block, dodge, riposteDamage } },
      log: appendLog(s, "player", `${face.label} → defends vs attack.`),
    };
  } else {
    // Normal assignment: resolve the face immediately against the target.
    s = applyFaceEffect(s, face, targetUid);
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

/** v3 leaves this as a no-op — once resolved, an assignment cannot be cleared. Kept
 * for API compatibility with old callers; returns state unchanged. */
export function clearAssignment(state: DiceCombatState, _poolId: number): DiceCombatState {
  return state;
}

export function allAssigned(state: DiceCombatState): boolean {
  for (const pf of state.pool) {
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
 * entry per rolled face (or a single legacy entry if they still use intents).
 * Stunned/dead/reassembling enemies are skipped (stun decrement happens when
 * stepEnemyTurn encounters them via a synthetic skip — kept simple by handling
 * stun in stepEnemyTurn itself, not at queue build time). */
function buildEnemyQueue(state: DiceCombatState): EnemyQueueEntry[] {
  const order = [...state.enemies].sort(
    (a, b) => (a.row === "front" ? -1 : 1) - (b.row === "front" ? -1 : 1),
  );
  const queue: EnemyQueueEntry[] = [];
  for (const e of order) {
    if (e.hp <= 0 || e.untargetable || e.reassembleQueued) continue;
    if (e.rolledFaces.length > 0) {
      for (let i = 0; i < e.rolledFaces.length; i++) {
        queue.push({ uid: e.uid, faceIndex: i });
      }
    } else {
      queue.push({ uid: e.uid, faceIndex: null });
    }
  }
  return queue;
}

/** v3: kicks off enemy phase by setting up the queue. UI then calls stepEnemyTurn
 * repeatedly to walk through it. Bust path also routes through here. */
export function resolveTurn(state: DiceCombatState): DiceCombatState {
  if (state.phase === "busted") {
    return { ...state, phase: "resolving-enemies", enemyQueue: buildEnemyQueue(state) };
  }
  if (state.phase !== "assigning") return state;
  if (!allAssigned(state)) return state;
  if (isVictory(state)) return finalize(state, "victory");
  return { ...state, phase: "resolving-enemies", enemyQueue: buildEnemyQueue(state) };
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
  if (head.faceIndex === null) {
    // Legacy fixed intent.
    const intent = enemy.intent;
    const def = getEnemyDef(enemy.id);
    if (intent && intent.damage !== undefined) {
      s = damagePlayer(s, intent.damage, enemy.name, intent.label);
    }
    if (def?.resolveIntent && intent) {
      const refreshed = s.enemies.find((x) => x.uid === enemy.uid);
      if (refreshed) s = def.resolveIntent(refreshed, s, intent);
    }
  } else {
    const rf = enemy.rolledFaces[head.faceIndex];
    const face = rf ? getFace(rf.faceId) : null;
    if (rf && face) {
      s = applyEnemyFace(s, enemy.uid, face, rf.targetUid, head.faceIndex);
    }
    // After the LAST rolledFace for this enemy, fire resolveIntent so aux effects
    // (Necromancer summon, Grave Robber pilfer, False Sacrarium force, Salt Revenant
    // lock, Larva animate, Vampire Lord heal, Lich phase logic) still run.
    const moreFromThisEnemy = rest.some((q) => q.uid === enemy.uid);
    if (!moreFromThisEnemy) {
      const def = getEnemyDef(enemy.id);
      if (def?.resolveIntent && enemy.intent) {
        const refreshed = s.enemies.find((x) => x.uid === enemy.uid);
        if (refreshed && refreshed.hp > 0) {
          s = def.resolveIntent(refreshed, s, enemy.intent);
        }
      }
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

function hasTag(face: FaceDef, tag: FaceTag): boolean {
  return face.tags?.includes(tag) ?? false;
}

function symbolDamageType(face: FaceDef): DamageType {
  if (hasTag(face, "heavy")) return "bludgeoning";
  if (hasTag(face, "pierce")) return "pierce";
  if (hasTag(face, "holy")) return "holy";
  // Fire damage is symbol-driven (flame symbol uses "fire"); sword default is slash.
  return "slash";
}

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
  if (hasTag(face, "area")) {
    for (const adj of rowAdjacent(s, primaryUid)) {
      if (!offensiveUids.includes(adj)) offensiveUids.push(adj);
    }
  }

  for (const sym of symbols) {
    if (sym === "sword" || sym === "riposte") {
      // Riposte without attack-targeting collapses to "free pre-emptive 1 damage".
      const dt = symbolDamageType(face);
      const seen = new Set<string>();
      for (const uid of offensiveUids) {
        const actual = resolveDamageRedirect(s, uid);
        if (seen.has(actual)) continue;
        seen.add(actual);
        s = damageEnemy(s, actual, 1, dt, face.label);
      }
    } else if (sym === "flame") {
      const seen = new Set<string>();
      for (const uid of offensiveUids) {
        const actual = resolveDamageRedirect(s, uid);
        if (seen.has(actual)) continue;
        seen.add(actual);
        s = damageEnemy(s, actual, 1, "fire", face.label);
      }
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
    }
    // sword/flame/etc above; symbols not relevant to enemies (heart, shield, sun, etc.) handled in self pass.
  }
  return s;
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
      s = {
        ...s,
        player: { ...s.player, powerCharges: s.player.powerCharges + 1 },
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
    }
  }

  // Offensive symbols routed through targets.
  if (face.target !== "self" && face.target !== "none" && targetUid) {
    s = applySymbolsToTargets(s, face, symbols, targetUid);
  }

  // Meta-effects that don't have a symbol equivalent — coexist with the symbol bag.
  if (face.grantHymnHum) {
    s = { ...s, player: { ...s.player, hymnHumActive: true } };
  }
  if (face.grantResonance) {
    s = { ...s, player: { ...s.player, resonanceCharges: s.player.resonanceCharges + 1 } };
  }
  if (face.breakSlotLock && s.player.slotLocks.length > 0) {
    const removed = s.player.slotLocks[0];
    s = {
      ...s,
      player: { ...s.player, slotLocks: s.player.slotLocks.slice(1) },
      log: appendLog(s, "player", `${face.label}: broke ${removed} lock.`),
    };
  }

  return s;
}

function applyFaceEffect(
  state: DiceCombatState,
  face: FaceDef,
  targetUid: string | null,
): DiceCombatState {
  // v3: when a face declares symbols, the symbol bag is authoritative.
  if (face.symbols && face.symbols.length > 0) {
    return applyFaceSymbols(state, face, targetUid);
  }

  let s = state;

  // Self-buffs first.
  if (face.grantPower) {
    s = {
      ...s,
      player: { ...s.player, powerCharges: s.player.powerCharges + face.grantPower },
      log: appendLog(s, "player", `${face.label}: stored +${face.grantPower}.`),
    };
  }
  if (face.grantDodge) {
    s = {
      ...s,
      player: { ...s.player, dodgeActive: true },
      log: appendLog(s, "player", `${face.label}: dodge ready.`),
    };
  }
  if (face.twoHandedBonus) {
    s = {
      ...s,
      player: { ...s.player, twoHandedActive: true },
      log: appendLog(s, "player", `${face.label}: damage faces +1.`),
    };
  }
  if (face.grantHymnHum) {
    s = { ...s, player: { ...s.player, hymnHumActive: true } };
  }
  if (face.grantResonance) {
    s = { ...s, player: { ...s.player, resonanceCharges: s.player.resonanceCharges + 1 } };
  }
  if (face.heal) {
    const newHp = Math.min(s.player.maxHp, s.player.hp + face.heal);
    const healed = newHp - s.player.hp;
    s = {
      ...s,
      player: { ...s.player, hp: newHp },
      log: appendLog(s, "player", `${face.label}: healed ${healed}.`),
    };
  }
  if (face.block) {
    s = {
      ...s,
      player: { ...s.player, block: s.player.block + face.block },
      log: appendLog(s, "player", `${face.label}: gained ${face.block} block.`),
    };
  }
  if (face.cleanseSelf) {
    s = cleansePlayer(s, face.cleanseSelf, face.label);
  }
  if (face.gainSalt) {
    s = {
      ...s,
      player: { ...s.player, salt: s.player.salt + face.gainSalt },
      log: appendLog(s, "player", `${face.label}: +${face.gainSalt} salt.`),
    };
  }
  if (face.breakSlotLock) {
    if (s.player.slotLocks.length > 0) {
      const removed = s.player.slotLocks[0];
      s = {
        ...s,
        player: { ...s.player, slotLocks: s.player.slotLocks.slice(1) },
        log: appendLog(s, "player", `${face.label}: broke ${removed} lock.`),
      };
    }
  }

  if (face.target === "self" || face.target === "none") return s;

  const targets = collectTargets(s, face.target, targetUid);

  // Damage path runs through redirect (Forsworn) with dedupe so AOE doesn't
  // multiply onto a single bodyguard.
  if (face.damage !== undefined && face.damageType !== undefined) {
    const seen = new Set<string>();
    for (const uid of targets) {
      const actual = resolveDamageRedirect(s, uid);
      if (seen.has(actual)) continue;
      seen.add(actual);
      s = damageEnemy(s, actual, face.damage, face.damageType, face.label);
    }
  }

  for (const enemyUid of targets) {
    if (face.applyStatus) {
      s = applyStatusToEnemy(
        s,
        enemyUid,
        face.applyStatus.status,
        face.applyStatus.stacks,
        face.label,
      );
    }
    if (face.pushOpposite) {
      s = pushEnemyToOppositeRow(s, enemyUid, face.label);
    }
  }
  return s;
}

function resolveDamageRedirect(state: DiceCombatState, uid: string): string {
  for (const e of state.enemies) {
    if (e.hp <= 0) continue;
    const def = getEnemyDef(e.id);
    if (!def?.redirectDamageTo) continue;
    const next = def.redirectDamageTo(e, state, uid);
    if (next !== uid) return next;
  }
  return uid;
}

function collectTargets(
  state: DiceCombatState,
  kind: FaceTargetKind,
  targetUid: string | null,
): string[] {
  switch (kind) {
    case "all-front":
      return state.enemies
        .filter((e) => e.hp > 0 && !e.untargetable && e.row === "front")
        .map((e) => e.uid);
    case "all-enemies":
      return state.enemies.filter((e) => e.hp > 0 && !e.untargetable).map((e) => e.uid);
    case "any-enemy":
    case "front-enemy":
      return targetUid ? [targetUid] : [];
    default:
      return [];
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * DAMAGE
 * ───────────────────────────────────────────────────────────────────────── */

function damageEnemy(
  state: DiceCombatState,
  uid: string,
  base: number,
  type: DamageType,
  source: string,
): DiceCombatState {
  const enemy = state.enemies.find((e) => e.uid === uid);
  if (!enemy || enemy.hp <= 0) return state;

  let dmg = base;
  if (state.player.powerCharges > 0) dmg += state.player.powerCharges;
  if (state.player.twoHandedActive) dmg += 1;
  // v3 Bolster: each stack adds +1 to damage symbols this turn.
  const bolster = state.player.statuses.bolster ?? 0;
  if (bolster > 0) dmg += bolster;
  // Robes Censer +1 vs undead.
  if (type === "fire" && source === "Censer" && isUndead(enemy)) {
    dmg += 1;
  }

  const resist = enemy.resistances[type];
  const vuln = enemy.vulnerabilities[type];
  if (resist !== undefined) dmg = Math.floor(dmg * resist);
  if (vuln !== undefined) dmg = Math.floor(dmg * vuln);

  // Per-enemy damage modifier (Ghost intangibility, etc.).
  const def = getEnemyDef(enemy.id);
  if (def?.modifyIncomingDamage) {
    dmg = def.modifyIncomingDamage(enemy, state, dmg, type);
  }

  dmg = Math.max(0, dmg);

  // v3: Mark doubles the next damage instance, then consumes a stack.
  let mark = enemy.statuses.mark ?? 0;
  if (mark > 0 && dmg > 0) {
    dmg = dmg * 2;
    mark -= 1;
  }
  // v3: enemy `warded` stacks act as block. Pierce ignores.
  let warded = enemy.statuses.warded ?? 0;
  let absorbed = 0;
  if (warded > 0 && dmg > 0 && type !== "pierce") {
    absorbed = Math.min(warded, dmg);
    dmg -= absorbed;
    warded -= absorbed;
  }

  const newStatuses: Record<string, number> = { ...enemy.statuses, warded, mark };
  if (warded === 0) delete newStatuses.warded;
  if (mark === (enemy.statuses.mark ?? 0)) {
    /* unchanged */
  } else if (mark === 0) {
    delete newStatuses.mark;
  }

  const newHp = Math.max(0, enemy.hp - dmg);
  const enemies = state.enemies.map((e) =>
    e.uid === uid ? { ...e, hp: newHp, statuses: newStatuses as DiceEnemy["statuses"] } : e,
  );
  const baseLog = appendLog(state, "player", `${source}: ${dmg} ${type} → ${enemy.name}.`);
  const logAfterAbsorb =
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
  let s: DiceCombatState = {
    ...state,
    enemies,
    player: { ...state.player, powerCharges: 0 },
    log: logAfterAbsorb,
  };

  // afterDamaged hook (Vampire Lord threshold heal).
  if (def?.afterDamaged && newHp > 0) {
    const fresh = s.enemies.find((e) => e.uid === uid);
    if (fresh) s = def.afterDamaged(fresh, s);
  }

  if (newHp === 0) {
    s = handleEnemyDeath(s, enemy, type);
  }
  return s;
}

function isUndead(enemy: DiceEnemy): boolean {
  return [
    "skeleton",
    "heap_of_bones",
    "zombie",
    "ghost",
    "vampire",
    "banshee",
    "necromancer",
    "ghoul",
    "shadow",
    "boss_skeleton_lord",
    "boss_vampire_lord",
    "boss_lich",
  ].includes(enemy.id);
}

function handleEnemyDeath(
  state: DiceCombatState,
  enemy: DiceEnemy,
  killingType: DamageType,
): DiceCombatState {
  const def = getEnemyDef(enemy.id);
  let s: DiceCombatState = {
    ...state,
    enemies: state.enemies.filter((e) => e.uid !== enemy.uid),
    log: appendLog(state, "system", `${enemy.name} falls.`),
  };
  // Clear corruptions sourced from this enemy.
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
  if (def?.onDeath) {
    s = def.onDeath(enemy, s, killingType);
  }
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

function cleansePlayer(state: DiceCombatState, count: number, source: string): DiceCombatState {
  const keys = Object.keys(state.player.statuses) as StatusKey[];
  if (keys.length === 0) return state;
  const next = { ...state.player.statuses };
  let removed = 0;
  for (const k of keys) {
    if (removed >= count) break;
    delete next[k];
    removed++;
  }
  return {
    ...state,
    player: { ...state.player, statuses: next },
    log: appendLog(state, "player", `${source}: cleansed ${removed}.`),
  };
}

/* ─────────────────────────────────────────────────────────────────────────
 * ENEMY PHASE
 * ───────────────────────────────────────────────────────────────────────── */

function telegraphIntents(state: DiceCombatState): DiceCombatState {
  let rng = state.rng;
  // First pass: roll dice, collect rolledFaces.
  const enemies = state.enemies.map((e) => {
    if (e.hp <= 0 || e.reassembleQueued) return { ...e, intent: null, rolledFaces: [] };
    const def = getEnemyDef(e.id);
    if (!def) return e;
    if (def.dice && def.dice.length > 0) {
      const rolled: { dieId: string; faceId: string; targetUid: string }[] = [];
      for (const die of def.dice) {
        const r = rollD6(rng);
        rng = r.seed;
        const faceId = die.faces[r.face];
        const targetUid = die.defaultTarget === "self" ? e.uid : "player";
        rolled.push({ dieId: die.id, faceId, targetUid });
      }
      return { ...e, intent: def.selectIntent(e, state), rolledFaces: rolled };
    }
    return { ...e, intent: def.selectIntent(e, state), rolledFaces: [] };
  });

  // v3 Option A: apply enemy `shield` symbols NOW (telegraph time), so the
  // armor is set BEFORE the player's turn starts. Symmetric with player defense
  // (set during player turn, consumed during enemy turn). Other symbols stay
  // queued for attack-resolve time.
  const armored = enemies.map((e) => {
    if (!e.rolledFaces || e.rolledFaces.length === 0) return e;
    let warded = e.statuses.warded ?? 0;
    for (const rf of e.rolledFaces) {
      const f = getFace(rf.faceId);
      if (!f?.symbols) continue;
      for (const sym of f.symbols) {
        if (sym === "shield") warded += 1;
      }
    }
    if (warded === (e.statuses.warded ?? 0)) return e;
    return { ...e, statuses: { ...e.statuses, warded } };
  });
  return { ...state, enemies: armored, rng };
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
  const unblockable = face.tags?.includes("unblockable") ?? false;
  const undodgeable = face.tags?.includes("undodgeable") ?? false;

  // v3: consult per-attack mitigations the player set during assignment.
  const mitigationKey = `${attackerUid}:${faceIndex}`;
  const mit = s.attackMitigations[mitigationKey];

  // Riposte fires before any of the face's symbols. Pre-empt damage to attacker.
  if (mit && mit.riposteDamage > 0) {
    s = damageEnemy(s, attackerUid, mit.riposteDamage, "slash", "Riposte");
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
  // Targeted block budget for this attack.
  let attackBlock = unblockable ? 0 : (mit?.block ?? 0);

  for (const sym of symbols) {
    if (sym === "sword") {
      // 1 damage to player, respecting unblockable / undodgeable.
      let dmg = 1;
      if (s.player.statuses.weaken && s.player.statuses.weaken > 0) dmg = Math.max(0, dmg - 1);
      if (!undodgeable && s.player.dodgeActive) {
        s = {
          ...s,
          player: { ...s.player, dodgeActive: false },
          log: appendLog(s, "player", `Dodged ${attacker.name}'s ${face.label}.`),
        };
        continue;
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
    } else if (sym === "shield") {
      // No-op at attack-resolve: shields were applied at telegraph time so the
      // armor is in place BEFORE the player's turn (and could be chipped by
      // their attacks). See telegraphIntents.
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
    } else if (sym === "reproduce") {
      // Spawn a same-id enemy in the same row, capped at 5 of this id alive.
      const sameKind = s.enemies.filter((x) => x.id === attacker.id && x.hp > 0).length;
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
            resistances: def.resistances,
            vulnerabilities: def.vulnerabilities,
            isBoss: def.isBoss,
            intent: null,
            untargetable: false,
            reassembleQueued: false,
            reassembleCountdown: 0,
            turnsAlive: 0,
            phaseIndex: 0,
            thresholdHealUsed: false,
            intangible: false,
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

function damagePlayer(
  state: DiceCombatState,
  amount: number,
  source: string,
  label: string,
): DiceCombatState {
  let dmg = amount;
  if (state.player.statuses.weaken && state.player.statuses.weaken > 0) dmg = Math.max(0, dmg - 1);
  const s = state;
  if (s.player.dodgeActive) {
    return {
      ...s,
      player: { ...s.player, dodgeActive: false },
      log: appendLog(s, "player", `Dodged ${source}'s ${label}.`),
    };
  }
  if (dmg <= 0) return s;
  const newHp = Math.max(0, s.player.hp - dmg);
  return {
    ...s,
    player: { ...s.player, hp: newHp },
    log: appendLog(s, "enemy", `${source}'s ${label} hits for ${dmg}.`),
  };
}

/* ─────────────────────────────────────────────────────────────────────────
 * END OF TURN
 * ───────────────────────────────────────────────────────────────────────── */

function endOfTurn(state: DiceCombatState): DiceCombatState {
  // v3: clear per-attack mitigations — they apply only to this turn's enemy roll.
  let s: DiceCombatState = { ...state, attackMitigations: {} };

  // 1. Heap of Bones countdowns.
  s = {
    ...s,
    enemies: s.enemies.map((e) => {
      if (!e.reassembleQueued) return e;
      if (e.reassembleCountdown <= 1) {
        const def = DICE_ENEMY_DEFS.skeleton;
        return {
          ...e,
          id: def.id,
          name: def.name,
          icon: def.icon,
          maxHp: def.maxHp,
          hp: Math.max(1, Math.ceil(def.maxHp / 2)),
          resistances: def.resistances,
          vulnerabilities: def.vulnerabilities,
          reassembleQueued: false,
          reassembleCountdown: 0,
          statuses: {},
        };
      }
      return { ...e, reassembleCountdown: e.reassembleCountdown - 1 };
    }),
  };

  // 3. Tick player statuses.
  s = tickPlayerStatuses(s);

  // 4. Tick enemy statuses.
  s = tickEnemyStatuses(s);

  // 5. Clear pool / advance turn. Per-turn player flags are reset in
  // startOfPlayerTurn so hooks (e.g. Lich P3 Hymn-Hum) can re-grant.
  s = { ...s, pool: [], assignments: {}, turn: s.turn + 1 };

  // 6. Bump enemy ages.
  s = { ...s, enemies: s.enemies.map((e) => ({ ...e, turnsAlive: e.turnsAlive + 1 })) };

  // 7. Run start-of-next-player-turn hooks.
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
  const poison = s.player.statuses.poison;
  if (poison && poison > 0) {
    const newHp = Math.max(0, s.player.hp - poison);
    s = {
      ...s,
      player: { ...s.player, hp: newHp },
      log: appendLog(s, "system", `Poison: -${poison} HP.`),
    };
  }
  // v3: Bolster expires at end of turn (one-turn buff per stack-application).
  // Weaken decays one stack per turn.
  if ((s.player.statuses.bolster ?? 0) > 0) {
    const next = { ...s.player.statuses };
    delete next.bolster;
    s = { ...s, player: { ...s.player, statuses: next } };
  }
  if ((s.player.statuses.weaken ?? 0) > 0) {
    const cur = (s.player.statuses.weaken ?? 0) - 1;
    const next = { ...s.player.statuses, weaken: cur };
    if (cur === 0) delete (next as Record<string, number>).weaken;
    s = { ...s, player: { ...s.player, statuses: next } };
  }
  return s;
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
    // v3: enemy `warded` (block) is one-turn-only — symmetric with the player's
    // shields, which also expire at end of turn since they're per-attack.
    if (statuses.warded) delete statuses.warded;
    enemies.push({ ...e, hp, statuses });
  }
  s = { ...s, enemies };
  // Drop dead enemies (status-tick deaths bypass onDeath).
  return { ...s, enemies: s.enemies.filter((e) => e.hp > 0 || e.reassembleQueued) };
}

/* ─────────────────────────────────────────────────────────────────────────
 * VICTORY / DEFEAT
 * ───────────────────────────────────────────────────────────────────────── */

function isVictory(state: DiceCombatState): boolean {
  return state.enemies.every((e) => e.hp <= 0 && !e.reassembleQueued);
}

function isDefeat(state: DiceCombatState): boolean {
  return state.player.hp <= 0;
}

function finalize(state: DiceCombatState, outcome: "victory" | "defeat"): DiceCombatState {
  return {
    ...state,
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
