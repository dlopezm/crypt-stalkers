import type {
  GridCombatState,
  GridEnemyState,
  GridConditionKey,
  GridPos,
  GridDeadEnemy,
} from "../types";
import { DIR_DELTA, DIRECTIONS, isWalkable, posAdd } from "../types";
import { getOccupiedPositions, posKey } from "../grid";

export function updateEnemy(
  state: GridCombatState,
  uid: string,
  updates: Partial<GridEnemyState>,
): GridCombatState {
  return {
    ...state,
    enemies: state.enemies.map((e) => (e.uid === uid ? { ...e, ...updates } : e)),
  };
}

export function applyConditionToEnemy(
  state: GridCombatState,
  uid: string,
  condition: GridConditionKey,
  stacks: number,
): GridCombatState {
  return updateEnemy(state, uid, {
    conditions: {
      ...state.enemies.find((e) => e.uid === uid)?.conditions,
      [condition]: stacks,
    },
  });
}

export function applyConditionToPlayer(
  state: GridCombatState,
  condition: GridConditionKey,
  stacks: number,
): GridCombatState {
  return {
    ...state,
    player: {
      ...state.player,
      conditions: { ...state.player.conditions, [condition]: stacks },
    },
  };
}

export function findNearbyEmptyTile(state: GridCombatState, center: GridPos): GridPos | null {
  const occupied = getOccupiedPositions(state.player, state.enemies);

  for (const dir of DIRECTIONS) {
    const pos = posAdd(center, DIR_DELTA[dir]);
    if (isWalkable(state.grid, pos) && !occupied.has(posKey(pos))) {
      return pos;
    }
  }

  return null;
}

export function handleEnemyDeath(
  state: GridCombatState,
  deadEnemy: GridEnemyState,
): GridCombatState {
  const lootSalt = 5;
  let current = {
    ...state,
    player: { ...state.player, salt: state.player.salt + lootSalt },
  };

  if (current.player.boneResonanceStacks < 3) {
    current = {
      ...current,
      player: { ...current.player, boneResonanceStacks: current.player.boneResonanceStacks + 1 },
    };
  }

  const deadEntry: GridDeadEnemy = {
    id: deadEnemy.id,
    uid: deadEnemy.uid,
    pos: deadEnemy.pos,
    killedByBludgeoning: false,
    reformTimer: null,
  };

  current = {
    ...current,
    deadEnemyPositions: [...current.deadEnemyPositions, deadEntry],
  };

  return current;
}
