import type { DamageType, StatusKey } from "../../types";
import { DICE_BALANCE } from "../balance";
import {
  BODY_DIE,
  buildSoulDie,
  getArmorDie,
  getFace,
  getOffhandDie,
  getWeaponDie,
  SLOT_ORDER,
  SOUL_STARTING_FACES,
} from "../dice-defs";
import { getEnemyDef } from "../enemy-defs";
import type {
  DiceCombatInit,
  DiceCombatLogEntry,
  DiceCombatState,
  DiceEnemy,
  DieDef,
  DieInstance,
  DieSlot,
  FaceAssignment,
  FaceDef,
  FaceTargetKind,
  Row,
} from "../types";
import { rollD6 } from "./rng";

/* ── Init ── */

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
      turnsAlive: 0,
    });
  }

  const dice: DieInstance[] = SLOT_ORDER.map((slot) => ({
    slot,
    dieId: dieForSlot(slot, init.loadout).id,
    faceIndex: -1,
    locked: false,
    grappled: false,
    suppressed: false,
  }));

  const state: DiceCombatState = {
    player: {
      hp: init.startingHp,
      maxHp: init.startingMaxHp,
      salt: init.startingSalt,
      block: 0,
      statuses: {},
      mainWeaponId: init.loadout.mainWeaponId,
      offhandId: init.loadout.offhandId,
      armorId: init.loadout.armorId,
      soulFaces: init.loadout.soulFaces,
      rerollsLeft: DICE_BALANCE.REROLLS_PER_TURN,
      powerCharges: 0,
      twoHandedActive: false,
      dodgeActive: false,
      rerollDebt: 0,
      bonusRerollsNextTurn: 0,
      suppressDebt: 0,
    },
    enemies,
    dice,
    assignments: {},
    turn: 1,
    phase: "rolling",
    log: [{ turn: 1, source: "system", text: "Combat begins. Roll your dice." }],
    rng: seed,
  };

  // Roll the opening dice and telegraph initial enemy intents.
  const rolled = rollAllDice(state);
  return telegraphIntents(rolled);
}

function dieForSlot(slot: DieSlot, loadout: DiceCombatInit["loadout"]): DieDef {
  switch (slot) {
    case "body":
      return BODY_DIE;
    case "main":
      return getWeaponDie(loadout.mainWeaponId);
    case "offhand":
      return getOffhandDie(loadout.offhandId);
    case "armor":
      return getArmorDie(loadout.armorId);
    case "soul":
      return buildSoulDie(loadout.soulFaces);
  }
}

/* ── Dice resolution helpers ── */

export function dieDefForInstance(d: DieInstance, state: DiceCombatState): DieDef {
  return dieForSlot(d.slot, {
    mainWeaponId: state.player.mainWeaponId,
    offhandId: state.player.offhandId,
    armorId: state.player.armorId,
    soulFaces: state.player.soulFaces,
  });
}

export function faceForInstance(d: DieInstance, state: DiceCombatState): FaceDef | null {
  if (d.faceIndex < 0) return null;
  const def = dieDefForInstance(d, state);
  return getFace(def.faces[d.faceIndex]);
}

/* ── Rolling ── */

function rollAllDice(state: DiceCombatState): DiceCombatState {
  let seed = state.rng;
  const dice: DieInstance[] = state.dice.map((d) => {
    if (d.suppressed) return { ...d, faceIndex: -1, locked: false };
    if (d.locked) return d;
    const r = rollD6(seed);
    seed = r.seed;
    return { ...d, faceIndex: r.face };
  });
  return { ...state, dice, rng: seed };
}

export function rerollDice(state: DiceCombatState): DiceCombatState {
  if (state.phase !== "rolling") return state;
  if (state.player.rerollsLeft <= 0) return state;
  const next = rollAllDice(state);
  return {
    ...next,
    player: { ...next.player, rerollsLeft: next.player.rerollsLeft - 1 },
    log: [
      ...next.log,
      {
        turn: next.turn,
        source: "player",
        text: `Re-rolled (${next.player.rerollsLeft} left).`,
      },
    ],
  };
}

export function toggleLock(state: DiceCombatState, slot: DieSlot): DiceCombatState {
  if (state.phase !== "rolling") return state;
  return {
    ...state,
    dice: state.dice.map((d) =>
      d.slot === slot && !d.suppressed && !d.grappled ? { ...d, locked: !d.locked } : d,
    ),
  };
}

/** Move from rolling phase into assigning. */
export function commitRoll(state: DiceCombatState): DiceCombatState {
  if (state.phase !== "rolling") return state;
  // Auto-assign self / none-target faces; leave enemy targets for the player.
  const assignments: Partial<Record<DieSlot, FaceAssignment>> = {};
  for (const d of state.dice) {
    if (d.suppressed || d.grappled) continue;
    const face = faceForInstance(d, state);
    if (!face) continue;
    if (
      face.target === "self" ||
      face.target === "none" ||
      face.target === "all-front" ||
      face.target === "all-enemies"
    ) {
      assignments[d.slot] = { slot: d.slot, targetUid: null, resolved: false };
    }
  }
  return { ...state, phase: "assigning", assignments };
}

/* ── Assignment ── */

export interface AssignCheck {
  readonly ok: boolean;
  readonly reason?: string;
}

export function canAssign(
  state: DiceCombatState,
  slot: DieSlot,
  targetUid: string | null,
): AssignCheck {
  if (state.phase !== "assigning") return { ok: false, reason: "Not in assignment phase." };
  const die = state.dice.find((d) => d.slot === slot);
  if (!die) return { ok: false, reason: "No such die." };
  if (die.suppressed) return { ok: false, reason: "Die is suppressed." };
  if (die.grappled) return { ok: false, reason: "Die is grappled." };
  const face = faceForInstance(die, state);
  if (!face) return { ok: false, reason: "Face not rolled." };
  return validateTarget(state, face.target, targetUid);
}

function validateTarget(
  state: DiceCombatState,
  targetKind: FaceTargetKind,
  targetUid: string | null,
): AssignCheck {
  if (targetKind === "self" || targetKind === "none") {
    return targetUid === null
      ? { ok: true }
      : { ok: false, reason: "This face has no enemy target." };
  }
  if (targetKind === "all-front" || targetKind === "all-enemies") {
    return targetUid === null ? { ok: true } : { ok: false, reason: "Auto-targets all enemies." };
  }
  if (!targetUid) return { ok: false, reason: "Pick an enemy target." };
  const enemy = state.enemies.find((e) => e.uid === targetUid && e.hp > 0 && !e.untargetable);
  if (!enemy) return { ok: false, reason: "Invalid target." };
  if (targetKind === "front-enemy" && enemy.row !== "front") {
    return { ok: false, reason: "Melee face can only hit the front row." };
  }
  return { ok: true };
}

export function assignFace(
  state: DiceCombatState,
  slot: DieSlot,
  targetUid: string | null,
): DiceCombatState {
  const check = canAssign(state, slot, targetUid);
  if (!check.ok) return state;
  return {
    ...state,
    assignments: { ...state.assignments, [slot]: { slot, targetUid, resolved: false } },
  };
}

export function clearAssignment(state: DiceCombatState, slot: DieSlot): DiceCombatState {
  const next = { ...state.assignments };
  delete next[slot];
  return { ...state, assignments: next };
}

export function allAssigned(state: DiceCombatState): boolean {
  for (const d of state.dice) {
    if (d.suppressed || d.grappled) continue;
    const face = faceForInstance(d, state);
    if (!face) continue;
    if (face.target === "none") continue;
    if (!state.assignments[d.slot]) return false;
  }
  return true;
}

/* ── Resolution ── */

/** Run the full turn from the current "assigning" state through enemy resolution
 * and bottom-of-turn cleanup. Returns the new state. */
export function resolveTurn(state: DiceCombatState): DiceCombatState {
  if (state.phase !== "assigning") return state;
  if (!allAssigned(state)) return state;
  let s: DiceCombatState = { ...state, phase: "resolving-player" };
  s = resolvePlayerFaces(s);
  if (isVictory(s)) return finalize(s, "victory");
  s = { ...s, phase: "resolving-enemies" };
  s = resolveEnemyIntents(s);
  if (isDefeat(s)) return finalize(s, "defeat");
  s = endOfTurn(s);
  if (isVictory(s)) return finalize(s, "victory");
  if (isDefeat(s)) return finalize(s, "defeat");
  // Telegraph and roll for the next turn.
  s = telegraphIntents(s);
  s = rollAllDice(s);
  return { ...s, phase: "rolling" };
}

function resolvePlayerFaces(state: DiceCombatState): DiceCombatState {
  let s = state;
  // Resolve in a fixed order: body, main, offhand, armor, soul.
  for (const slot of SLOT_ORDER) {
    const assignment = s.assignments[slot];
    const die = s.dice.find((d) => d.slot === slot);
    if (!die) continue;
    const face = faceForInstance(die, s);
    if (!face) continue;
    if (face.target === "none" && !assignment) continue;
    s = applyFaceEffect(s, face, assignment ?? null, slot);
    if (isVictory(s)) break;
  }
  return s;
}

function applyFaceEffect(
  state: DiceCombatState,
  face: FaceDef,
  assignment: FaceAssignment | null,
  slot: DieSlot,
): DiceCombatState {
  let s = state;
  const targetUid = assignment?.targetUid ?? null;

  // Self-buffs first (so a Wind-Up + Smash combo on the same turn works if Wind-Up resolves first).
  if (face.bonusReroll) {
    s = {
      ...s,
      player: {
        ...s.player,
        bonusRerollsNextTurn: s.player.bonusRerollsNextTurn + face.bonusReroll,
      },
      log: appendLog(s, "player", `${face.label}: +${face.bonusReroll} re-roll on your next turn.`),
    };
  }
  if (face.grantPower) {
    s = {
      ...s,
      player: { ...s.player, powerCharges: s.player.powerCharges + face.grantPower },
      log: appendLog(
        s,
        "player",
        `${face.label}: stored +${face.grantPower} for the next damage face.`,
      ),
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
      log: appendLog(s, "player", `${face.label}: damage faces deal +1 this turn.`),
    };
  }

  if (face.heal) {
    const newHp = Math.min(s.player.maxHp, s.player.hp + face.heal);
    const healed = newHp - s.player.hp;
    s = {
      ...s,
      player: { ...s.player, hp: newHp },
      log: appendLog(s, "player", `${face.label}: healed ${healed} HP.`),
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
      log: appendLog(s, "player", `${face.label}: gained ${face.gainSalt} salt.`),
    };
  }

  // Damage / status / push (target-needing effects).
  if (face.target === "self" || face.target === "none") return s;

  const targets = collectTargets(s, face.target, targetUid);
  if (targets.length === 0) return s;

  for (const enemyUid of targets) {
    if (face.damage !== undefined && face.damageType !== undefined) {
      s = damageEnemy(s, enemyUid, face.damage, face.damageType, face.label, face.ignoresBlock);
    }
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
  // Mark the assignment resolved (purely informational).
  if (assignment) {
    s = {
      ...s,
      assignments: { ...s.assignments, [slot]: { ...assignment, resolved: true } },
    };
  }
  return s;
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

function damageEnemy(
  state: DiceCombatState,
  uid: string,
  base: number,
  type: DamageType,
  source: string,
  ignoresBlock?: boolean,
): DiceCombatState {
  const enemy = state.enemies.find((e) => e.uid === uid);
  if (!enemy || enemy.hp <= 0) return state;

  let dmg = base;
  if (state.player.powerCharges > 0) dmg += state.player.powerCharges;
  if (state.player.twoHandedActive) dmg += 1;

  const resist = enemy.resistances[type];
  const vuln = enemy.vulnerabilities[type];
  if (resist !== undefined) dmg = Math.floor(dmg * resist);
  if (vuln !== undefined) dmg = Math.floor(dmg * vuln);
  // Bleed/weaken on enemy don't reduce incoming dmg in this system; statuses only affect the carrier.
  dmg = Math.max(0, dmg);

  const newHp = Math.max(0, enemy.hp - dmg);
  const enemies = state.enemies.map((e) => (e.uid === uid ? { ...e, hp: newHp } : e));
  let s: DiceCombatState = {
    ...state,
    enemies,
    // Power charges are consumed by the first damage face that fires this turn.
    player: { ...state.player, powerCharges: 0 },
    log: appendLog(state, "player", `${source}: ${dmg} ${type} to ${enemy.name}.`),
  };
  void ignoresBlock; // enemies don't have block in dice-combat; reserved for future
  if (newHp === 0) {
    s = handleEnemyDeath(s, enemy, type);
  }
  return s;
}

function handleEnemyDeath(
  state: DiceCombatState,
  enemy: DiceEnemy,
  killingType: DamageType,
): DiceCombatState {
  const def = getEnemyDef(enemy.id);
  let s: DiceCombatState = {
    ...state,
    log: appendLog(state, "system", `${enemy.name} falls.`),
  };
  // Remove the dead enemy from active list.
  s = { ...s, enemies: s.enemies.filter((e) => e.uid !== enemy.uid) };
  if (def?.onDeath) {
    const updated = def.onDeath(enemy, s, killingType);
    s = updated;
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
    log: appendLog(
      state,
      "player",
      `${source}: applied ${stacks} ${status} to ${enemy?.name ?? "target"}.`,
    ),
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
    log: appendLog(
      state,
      "player",
      `${source}: shoved ${enemy?.name ?? "target"} to the ${enemy?.row} row.`,
    ),
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
    log: appendLog(state, "player", `${source}: cleansed ${removed} status.`),
  };
}

/* ── Enemy phase ── */

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
  // Front row first, then back, mirroring Slice & Dice's tempo (melee threats land before casters).
  const order = [...s.enemies].sort(
    (a, b) => (a.row === "front" ? -1 : 1) - (b.row === "front" ? -1 : 1),
  );
  for (const e of order) {
    if (e.hp <= 0 || e.untargetable || e.reassembleQueued) continue;
    if (e.statuses.stun && e.statuses.stun > 0) {
      s = {
        ...s,
        enemies: s.enemies.map((x) =>
          x.uid === e.uid
            ? { ...x, statuses: { ...x.statuses, stun: Math.max(0, (x.statuses.stun ?? 0) - 1) } }
            : x,
        ),
        log: appendLog(s, "system", `${e.name} is stunned and cannot act.`),
      };
      continue;
    }
    const intent = e.intent;
    if (!intent) continue;
    const def = getEnemyDef(e.id);
    if (intent.damage !== undefined) {
      s = damagePlayer(s, intent.damage, e.name, intent.label);
      if (isDefeat(s)) return s;
    }
    if (def?.resolveIntent) {
      const fresh = s.enemies.find((x) => x.uid === e.uid);
      if (fresh) s = def.resolveIntent(fresh, s, intent);
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
  s = {
    ...s,
    player: { ...s.player, hp: newHp },
    log: appendLog(s, "enemy", `${source}'s ${label} hits for ${dmg}.`),
  };
  return s;
}

/* ── End of turn ── */

function endOfTurn(state: DiceCombatState): DiceCombatState {
  let s = state;
  // 1. Reassemble queued skeletons.
  s = {
    ...s,
    enemies: s.enemies.map((e) => {
      if (!e.reassembleQueued) return e;
      const def = getEnemyDef(e.id);
      const reviveHp = def ? Math.ceil(def.maxHp / 2) : Math.ceil(e.maxHp / 2);
      return {
        ...e,
        hp: reviveHp,
        reassembleQueued: false,
        untargetable: false,
        statuses: {},
      };
    }),
  };
  // 2. Tick player statuses (bleed, poison).
  s = tickPlayerStatuses(s);
  // 3. Tick enemy statuses (bleed mostly).
  s = tickEnemyStatuses(s);
  // 4. Reset per-turn flags.
  s = {
    ...s,
    player: {
      ...s.player,
      block: 0,
      twoHandedActive: false,
      powerCharges: 0,
      // Recompute re-rolls for the next turn, applying any debt the Banshee imposed
      // and any bonus from Focus faces resolved during this turn.
      rerollsLeft: Math.max(
        0,
        DICE_BALANCE.REROLLS_PER_TURN - s.player.rerollDebt + s.player.bonusRerollsNextTurn,
      ),
      rerollDebt: 0,
      bonusRerollsNextTurn: 0,
    },
    assignments: {},
    turn: s.turn + 1,
  };
  // 5. Apply suppression / clear stale dice state.
  s = {
    ...s,
    dice: s.dice.map((d) => ({
      ...d,
      faceIndex: -1,
      locked: false,
      suppressed: false,
      grappled: false,
    })),
  };
  // 6. Bump enemy ages.
  s = { ...s, enemies: s.enemies.map((e) => ({ ...e, turnsAlive: e.turnsAlive + 1 })) };
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
      log: appendLog(s, "system", `Bleed costs you ${bleed} HP.`),
    };
  }
  const poison = s.player.statuses.poison;
  if (poison && poison > 0) {
    const newHp = Math.max(0, s.player.hp - poison);
    s = {
      ...s,
      player: { ...s.player, hp: newHp },
      log: appendLog(s, "system", `Poison costs you ${poison} HP.`),
    };
  }
  return s;
}

function tickEnemyStatuses(state: DiceCombatState): DiceCombatState {
  let s = state;
  const enemies: DiceEnemy[] = [];
  const updatedLog: DiceCombatLogEntry[] = [...s.log];
  for (const e of s.enemies) {
    const bleed = e.statuses.bleed ?? 0;
    let hp = e.hp;
    const statuses = { ...e.statuses };
    if (bleed > 0) {
      hp = Math.max(0, hp - bleed);
      updatedLog.push({
        turn: s.turn,
        source: "system",
        text: `${e.name} bleeds for ${bleed}.`,
      });
      statuses.bleed = bleed - 1;
    }
    enemies.push({ ...e, hp, statuses });
  }
  s = { ...s, enemies, log: updatedLog };
  // Drop dead enemies (status-tick deaths don't trigger reassemble — only physical kills do).
  return { ...s, enemies: s.enemies.filter((e) => e.hp > 0 || e.reassembleQueued) };
}

/* ── Victory / defeat ── */

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

/* ── Logging ── */

function appendLog(
  state: DiceCombatState,
  source: DiceCombatLogEntry["source"],
  text: string,
): readonly DiceCombatLogEntry[] {
  return [...state.log, { turn: state.turn, source, text }];
}

/* ── Re-export commonly used helpers ── */

export { SOUL_STARTING_FACES };
