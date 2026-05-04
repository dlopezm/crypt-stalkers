import type { DamageType, StatusKey } from "../../types";
import { DICE_BALANCE } from "../balance";
import { COLORS, getDieForSlot, getFace, SLOT_ORDER, ABILITY_STARTING_FACES } from "../dice-defs";
import { DICE_ENEMY_DEFS, getEnemyDef } from "../enemy-defs";
import type {
  DiceCombatInit,
  DiceCombatLogEntry,
  DiceCombatState,
  DiceEnemy,
  DieDef,
  DieSlot,
  FaceColor,
  FaceDef,
  FaceTargetKind,
  PoolAssignment,
  PoolFace,
  Row,
} from "../types";
import { rollD6 } from "./rng";

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
  let s: DiceCombatState = {
    ...state,
    phase: "busted",
    pool: [],
    assignments: {},
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

/** Move from rolling phase into assigning. */
export function stopRolling(state: DiceCombatState): DiceCombatState {
  if (state.phase !== "rolling") return state;
  if (state.pool.length === 0) return state;
  // Auto-assign self / none / all-target faces.
  const assignments: Record<number, PoolAssignment> = {};
  for (const pf of state.pool) {
    const face = getFace(pf.faceId);
    if (!face) continue;
    if (
      face.target === "self" ||
      face.target === "none" ||
      face.target === "all-front" ||
      face.target === "all-enemies"
    ) {
      assignments[pf.poolId] = { poolId: pf.poolId, targetUid: null, resolved: false };
    }
  }
  return { ...state, phase: "assigning", assignments };
}

/* ─────────────────────────────────────────────────────────────────────────
 * ASSIGNMENT
 * ───────────────────────────────────────────────────────────────────────── */

export interface AssignCheck {
  readonly ok: boolean;
  readonly reason?: string;
}

export function canAssign(
  state: DiceCombatState,
  poolId: number,
  targetUid: string | null,
): AssignCheck {
  if (state.phase !== "assigning") return { ok: false, reason: "Not assigning." };
  const face = faceAtPoolId(state, poolId);
  if (!face) return { ok: false, reason: "No such face." };
  return validateTarget(state, face.target, targetUid);
}

function validateTarget(
  state: DiceCombatState,
  kind: FaceTargetKind,
  targetUid: string | null,
): AssignCheck {
  if (kind === "self" || kind === "none") {
    return targetUid === null ? { ok: true } : { ok: false, reason: "This face has no target." };
  }
  if (kind === "all-front" || kind === "all-enemies") {
    return targetUid === null ? { ok: true } : { ok: false, reason: "Auto-targets all." };
  }
  if (!targetUid) return { ok: false, reason: "Pick a target." };
  const enemy = state.enemies.find((e) => e.uid === targetUid && e.hp > 0 && !e.untargetable);
  if (!enemy) return { ok: false, reason: "Invalid target." };
  if (kind === "front-enemy" && enemy.row !== "front") {
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
  return {
    ...state,
    assignments: {
      ...state.assignments,
      [poolId]: { poolId, targetUid, resolved: false },
    },
  };
}

export function clearAssignment(state: DiceCombatState, poolId: number): DiceCombatState {
  const next = { ...state.assignments };
  delete next[poolId];
  return { ...state, assignments: next };
}

export function allAssigned(state: DiceCombatState): boolean {
  for (const pf of state.pool) {
    const face = getFace(pf.faceId);
    if (!face) continue;
    if (face.target === "none") continue;
    if (!state.assignments[pf.poolId]) return false;
  }
  return true;
}

/* ─────────────────────────────────────────────────────────────────────────
 * RESOLVE TURN
 * ───────────────────────────────────────────────────────────────────────── */

export function resolveTurn(state: DiceCombatState): DiceCombatState {
  if (state.phase === "busted") {
    let s: DiceCombatState = { ...state, phase: "resolving-enemies" };
    s = resolveEnemyIntents(s);
    if (isDefeat(s)) return finalize(s, "defeat");
    s = endOfTurn(s);
    if (isVictory(s)) return finalize(s, "victory");
    if (isDefeat(s)) return finalize(s, "defeat");
    s = telegraphIntents(s);
    return s;
  }

  if (state.phase !== "assigning") return state;
  if (!allAssigned(state)) return state;

  let s: DiceCombatState = { ...state, phase: "resolving-player" };
  s = resolvePlayerPool(s);
  if (isVictory(s)) return finalize(s, "victory");

  s = { ...s, phase: "resolving-enemies" };
  s = resolveEnemyIntents(s);
  if (isDefeat(s)) return finalize(s, "defeat");

  s = endOfTurn(s);
  if (isVictory(s)) return finalize(s, "victory");
  if (isDefeat(s)) return finalize(s, "defeat");

  s = telegraphIntents(s);
  return s;
}

function resolvePlayerPool(state: DiceCombatState): DiceCombatState {
  let s = state;
  // Resolve in pool order (the order the player rolled).
  for (const pf of s.pool) {
    const face = getFace(pf.faceId);
    if (!face) continue;
    const a = s.assignments[pf.poolId];
    if (face.target !== "none" && !a && face.target !== "self") {
      // unassigned non-self face — skip (shouldn't happen if allAssigned)
      continue;
    }
    s = applyFaceEffect(s, face, a?.targetUid ?? null);
    if (isVictory(s)) break;
  }
  return s;
}

function applyFaceEffect(
  state: DiceCombatState,
  face: FaceDef,
  targetUid: string | null,
): DiceCombatState {
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

  const newHp = Math.max(0, enemy.hp - dmg);
  const enemies = state.enemies.map((e) => (e.uid === uid ? { ...e, hp: newHp } : e));
  let s: DiceCombatState = {
    ...state,
    enemies,
    player: { ...state.player, powerCharges: 0 },
    log: appendLog(state, "player", `${source}: ${dmg} ${type} → ${enemy.name}.`),
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
  const enemies = state.enemies.map((e) => {
    if (e.hp <= 0 || e.reassembleQueued) return { ...e, intent: null };
    const def = getEnemyDef(e.id);
    if (!def) return e;
    return { ...e, intent: def.selectIntent(e, state) };
  });
  return { ...state, enemies };
}

function resolveEnemyIntents(state: DiceCombatState): DiceCombatState {
  let s = state;
  // Front row first.
  const order = [...s.enemies].sort(
    (a, b) => (a.row === "front" ? -1 : 1) - (b.row === "front" ? -1 : 1),
  );
  for (const e of order) {
    const fresh = s.enemies.find((x) => x.uid === e.uid);
    if (!fresh || fresh.hp <= 0 || fresh.untargetable || fresh.reassembleQueued) continue;
    if (fresh.statuses.stun && fresh.statuses.stun > 0) {
      s = {
        ...s,
        enemies: s.enemies.map((x) =>
          x.uid === fresh.uid
            ? {
                ...x,
                statuses: { ...x.statuses, stun: Math.max(0, (x.statuses.stun ?? 0) - 1) },
              }
            : x,
        ),
        log: appendLog(s, "system", `${fresh.name} is stunned.`),
      };
      continue;
    }
    const intent = fresh.intent;
    if (!intent) continue;
    const def = getEnemyDef(fresh.id);
    if (intent.damage !== undefined) {
      s = damagePlayer(s, intent.damage, fresh.name, intent.label);
      if (isDefeat(s)) return s;
    }
    if (def?.resolveIntent) {
      const refreshed = s.enemies.find((x) => x.uid === fresh.uid);
      if (refreshed) s = def.resolveIntent(refreshed, s, intent);
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
  let s = state;
  if (s.player.dodgeActive) {
    return {
      ...s,
      player: { ...s.player, dodgeActive: false },
      log: appendLog(s, "player", `Dodged ${source}'s ${label}.`),
    };
  }
  if (s.player.block > 0) {
    const absorbed = Math.min(s.player.block, dmg);
    dmg -= absorbed;
    s = {
      ...s,
      player: { ...s.player, block: s.player.block - absorbed },
      log: appendLog(s, "system", `Blocked ${absorbed} of ${source}'s damage.`),
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
  let s = state;

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

  // 2. Rat merge: at end of turn, two rats become a stronger rat.
  s = mergeRats(s);

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

function mergeRats(state: DiceCombatState): DiceCombatState {
  const rats = state.enemies.filter((e) => e.id === "rat" && e.hp > 0);
  if (rats.length < 2) return state;
  const [a, b] = rats;
  const mergedHp = a.hp + b.hp + 1;
  const mergedMax = a.maxHp + b.maxHp + 1;
  const enemies = state.enemies
    .filter((e) => e.uid !== b.uid)
    .map((e) => (e.uid === a.uid ? { ...e, hp: mergedHp, maxHp: mergedMax } : e));
  return {
    ...state,
    enemies,
    log: appendLog(state, "system", "Two rats merge into a larger one."),
  };
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
