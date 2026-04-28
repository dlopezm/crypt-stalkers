/* ═══════════════════════════════════════════════════════════════════════════
   Line Combat — Positioning Engine
   Pure functions for push / pull / switch / cascade / wall-slam logic.
   All functions take and return immutable state (spread cloning).
   ═══════════════════════════════════════════════════════════════════════════ */

import type { LineCombatState, LinePos, LineEnemyState } from "../types";
import { LINE_BALANCE } from "../balance";
import { getLineEnemyDef } from "../enemy-defs";

// ─── Helpers ───

export function getEntityAtSlot(
  state: LineCombatState,
  slot: LinePos,
): { kind: "player" } | { kind: "enemy"; uid: string } | null {
  if (state.player.position === slot) return { kind: "player" };
  const e = state.enemies.find((e) => e.position === slot && !isDefeated(e));
  if (e) return { kind: "enemy", uid: e.uid };
  return null;
}

export function isDefeated(enemy: LineEnemyState): boolean {
  return enemy.hp <= 0 && enemy.countdownTimer === null;
}

export function slotInBounds(slot: LinePos, lineLength: number): boolean {
  return slot >= 0 && slot < lineLength;
}

function isTerrainPassableForMove(state: LineCombatState, slot: LinePos): boolean {
  const t = state.slots[slot];
  return t.type !== "wall_pillar"; // pillars block movement; pits cost nothing extra but you can be pushed into one
}

function isIncorporeal(state: LineCombatState, uid: string): boolean {
  const e = state.enemies.find((e) => e.uid === uid);
  return e?.passives.some((p) => p.type === "incorporeal_resistance") ?? false;
}

function isImmuneToReposition(state: LineCombatState, uid: string): boolean {
  const e = state.enemies.find((e) => e.uid === uid);
  return e?.passives.some((p) => p.type === "immune_to_push") ?? false;
}

// ─── Log helpers ───

function appendLog(state: LineCombatState, msg: string): LineCombatState {
  return { ...state, log: [...state.log, msg] };
}

// ─── Wall-slam ───

/**
 * Apply wall-slam damage + stun to whatever is at slot (if occupied by an entity).
 * Wall-slam happens when an entity is pushed into a wall boundary.
 */
function applyWallSlam(state: LineCombatState, slot: LinePos): LineCombatState {
  const occupant = getEntityAtSlot(state, slot);
  if (!occupant) return state;

  const damage = LINE_BALANCE.line.wallSlamDamage;
  const stunTurns = LINE_BALANCE.line.wallSlamStunTurns;

  if (occupant.kind === "player") {
    const p = state.player;
    const actualDamage = Math.max(0, damage - p.armor);
    state = appendLog(
      state,
      `💥 Wall-slam! ${p.hp - actualDamage <= 0 ? "Fatal!" : `-${actualDamage} HP, stunned ${stunTurns}t`}`,
    );
    return {
      ...state,
      player: {
        ...p,
        hp: Math.max(0, p.hp - actualDamage),
        conditions: {
          ...p.conditions,
          stunned: Math.max(p.conditions.stunned ?? 0, stunTurns),
        },
      },
    };
  } else {
    const enemies = state.enemies.map((e) => {
      if (e.uid !== occupant.uid) return e;
      const actualDamage = Math.max(0, damage - e.armor);
      return {
        ...e,
        hp: Math.max(0, e.hp - actualDamage),
        conditions: {
          ...e.conditions,
          stunned: Math.max(e.conditions.stunned ?? 0, stunTurns),
        },
      };
    });
    const victim = enemies.find((e) => e.uid === occupant.uid)!;
    state = appendLog(state, `💥 ${victim.id} wall-slammed! -${damage} HP, stunned`);
    return { ...state, enemies };
  }
}

// ─── Pit fall ───

function applyPitFall(state: LineCombatState, slot: LinePos): LineCombatState {
  const occupant = getEntityAtSlot(state, slot);
  if (!occupant || state.slots[slot].type !== "pit") return state;

  if (occupant.kind === "player") {
    const p = state.player;
    state = appendLog(state, `⬇️ Player falls into a pit! Lethal.`);
    return { ...state, player: { ...p, hp: 0 } };
  } else {
    const e = state.enemies.find((en) => en.uid === occupant.uid)!;
    const damage = getLineEnemyDef(e.id).isBoss
      ? LINE_BALANCE.line.pitFallDamageBoss
      : LINE_BALANCE.line.pitFallDamage;
    state = appendLog(state, `⬇️ ${e.id} falls into a pit!`);
    const enemies = state.enemies.map((en) =>
      en.uid === e.uid ? { ...en, hp: Math.max(0, en.hp - damage) } : en,
    );
    return { ...state, enemies };
  }
}

// ─── Core push: move entity at `fromSlot` by `distance` in `direction` ───

/**
 * Returns the slot an entity would end up at after being pushed.
 * Handles wall boundaries, occupied slots (cascade), and terrain.
 * `direction`: +1 = rightward, -1 = leftward.
 *
 * Returns the resolved landing slot plus updated state (wall-slams, cascade applied).
 */
export function applyPushEntity(
  state: LineCombatState,
  fromSlot: LinePos,
  direction: 1 | -1,
  distance: number,
): LineCombatState {
  if (distance <= 0) return state;

  const occupant = getEntityAtSlot(state, fromSlot);
  if (!occupant) return state;

  // Incorporeal entities are immune to push/pull
  if (occupant.kind === "enemy" && isIncorporeal(state, occupant.uid)) {
    return appendLog(state, `${occupant.uid} is incorporeal — unaffected by repositioning.`);
  }
  if (occupant.kind === "enemy" && isImmuneToReposition(state, occupant.uid)) {
    return appendLog(state, `${occupant.uid} cannot be pushed.`);
  }

  let currentSlot = fromSlot;
  let remainingDistance = distance;

  while (remainingDistance > 0) {
    const nextSlot = currentSlot + direction;

    // Hit wall boundary
    if (!slotInBounds(nextSlot, state.lineLength)) {
      // Move entity to boundary slot first, then wall-slam
      state = moveEntityFromTo(state, currentSlot, currentSlot); // entity stays at current (boundary)
      state = applyWallSlam(state, currentSlot);
      return state;
    }

    // Terrain blocker — wall pillar acts as wall
    if (state.slots[nextSlot].type === "wall_pillar") {
      state = applyWallSlam(state, currentSlot);
      return state;
    }

    // Pit — push into it
    if (state.slots[nextSlot].type === "pit") {
      state = moveEntityFromTo(state, currentSlot, nextSlot);
      state = applyPitFall(state, nextSlot);
      return state;
    }

    // Occupied slot — cascade: push the occupant forward first
    const nextOccupant = getEntityAtSlot(state, nextSlot);
    if (nextOccupant) {
      // Recursively push the next occupant (with remaining distance minus 1 used for the push-to)
      state = applyPushEntity(state, nextSlot, direction, remainingDistance - 1);
      // Now nextSlot may be empty (if cascade succeeded), or entity is still there (stopped)
      const stillOccupied = getEntityAtSlot(state, nextSlot);
      if (stillOccupied) {
        // Cascade stopped — entity stays, push chain done
        state = applyWallSlam(state, currentSlot);
        return state;
      }
    }

    // Move entity to next slot
    state = moveEntityFromTo(state, currentSlot, nextSlot);
    currentSlot = nextSlot;
    remainingDistance--;
  }

  return state;
}

/** Low-level: update entity position without side effects. */
function moveEntityFromTo(state: LineCombatState, from: LinePos, to: LinePos): LineCombatState {
  if (from === to) return state;

  const occupant = getEntityAtSlot(state, from);
  if (!occupant) return state;

  if (occupant.kind === "player") {
    return { ...state, player: { ...state.player, position: to } };
  } else {
    const enemies = state.enemies.map((e) => (e.uid === occupant.uid ? { ...e, position: to } : e));
    return { ...state, enemies };
  }
}

// ─── Pull ───

export function applyPullEntity(
  state: LineCombatState,
  targetSlot: LinePos,
  towardSlot: LinePos,
  distance: number,
): LineCombatState {
  // Pull = push in the direction toward the attacker
  const direction = (towardSlot < targetSlot ? -1 : 1) as 1 | -1;
  return applyPushEntity(state, targetSlot, direction, distance);
}

// ─── Switch ───

/** Swap positions of two entities. */
export function applySwitch(
  state: LineCombatState,
  slotA: LinePos,
  slotB: LinePos,
): LineCombatState {
  const occA = getEntityAtSlot(state, slotA);
  const occB = getEntityAtSlot(state, slotB);
  if (!occA || !occB) return state;

  // Block if either is immune
  if (occA.kind === "enemy" && isImmuneToReposition(state, occA.uid)) return state;
  if (occB.kind === "enemy" && isImmuneToReposition(state, occB.uid)) return state;

  // Perform swap
  let newPlayer = state.player;
  let newEnemies = [...state.enemies];

  const moveOcc = (occ: typeof occA, toSlot: LinePos) => {
    if (occ.kind === "player") {
      newPlayer = { ...newPlayer, position: toSlot };
    } else {
      newEnemies = newEnemies.map((e) => (e.uid === occ.uid ? { ...e, position: toSlot } : e));
    }
  };

  moveOcc(occA, slotB);
  moveOcc(occB, slotA);

  return { ...state, player: newPlayer, enemies: newEnemies };
}

// ─── Move player ───

/**
 * Attempt to move the player to `toSlot`. Returns updated state.
 * Validates: slot in bounds, not wall_pillar, not occupied by enemy.
 * Deducts AP from player.
 */
export function movePlayer(
  state: LineCombatState,
  toSlot: LinePos,
): { state: LineCombatState; success: boolean; reason?: string } {
  const p = state.player;
  const distance = Math.abs(toSlot - p.position);
  const apCost = distance * LINE_BALANCE.player.movementApCost;

  if (p.conditions.immobilized && p.conditions.immobilized > 0) {
    return { state, success: false, reason: "Immobilized" };
  }
  if (p.conditions.stunned && p.conditions.stunned > 0) {
    return { state, success: false, reason: "Stunned" };
  }
  if (p.ap < apCost) {
    return { state, success: false, reason: "Not enough AP" };
  }
  if (!slotInBounds(toSlot, state.lineLength)) {
    return { state, success: false, reason: "Out of bounds" };
  }
  if (!isTerrainPassableForMove(state, toSlot)) {
    return { state, success: false, reason: "Terrain blocks movement" };
  }

  // Path check: every slot between current and destination must be passable & unoccupied
  const dir = toSlot > p.position ? 1 : -1;
  let rubbleCost = 0;
  for (let s = p.position + dir; s !== toSlot + dir; s += dir) {
    if (!isTerrainPassableForMove(state, s)) {
      return { state, success: false, reason: "Path blocked by terrain" };
    }
    if (getEntityAtSlot(state, s) !== null) {
      return { state, success: false, reason: "Path blocked by entity" };
    }
    if (state.slots[s].type === "rubble") rubbleCost += LINE_BALANCE.line.rubbleMovementCostExtra;
  }

  const totalCost = apCost + rubbleCost;
  if (p.ap < totalCost) {
    return { state, success: false, reason: "Not enough AP (terrain)" };
  }

  const newState = {
    ...state,
    player: { ...p, position: toSlot, ap: p.ap - totalCost },
  };
  return { state: newState, success: true };
}

// ─── Push all entities in range outward ───

export function applyPushAllInRange(
  state: LineCombatState,
  casterSlot: LinePos,
  minDist: number,
  maxDist: number,
  pushDistance: number,
): LineCombatState {
  // Collect targets by uid (or null = player) up-front, so cascades that shift
  // entities between slots don't cause us to push the wrong entity twice.
  const targets: { uid: string | null; startSlot: LinePos; dir: 1 | -1 }[] = [];

  for (let slot = 0; slot < state.lineLength; slot++) {
    const dist = Math.abs(slot - casterSlot);
    if (dist < minDist || dist > maxDist) continue;
    const occ = getEntityAtSlot(state, slot);
    if (!occ) continue;
    targets.push({
      uid: occ.kind === "player" ? null : occ.uid,
      startSlot: slot,
      dir: slot >= casterSlot ? 1 : -1,
    });
  }

  // Push farther entities first so closer ones have somewhere to go.
  targets.sort((a, b) => Math.abs(b.startSlot - casterSlot) - Math.abs(a.startSlot - casterSlot));

  for (const { uid, dir } of targets) {
    const pos =
      uid === null ? state.player.position : state.enemies.find((e) => e.uid === uid)?.position;
    if (pos !== undefined) state = applyPushEntity(state, pos, dir, pushDistance);
  }

  return state;
}
