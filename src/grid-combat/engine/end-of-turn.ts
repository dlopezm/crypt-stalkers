import type { GridCombatState, GridConditionKey, GridEnemyTypeDef } from "../types";
import { getTile } from "../types";
import { tickTerrainTimers } from "../grid";
import { handleEnemyDeath, updateEnemy } from "./state-helpers";

export function endOfTurnCleanup(
  state: GridCombatState,
  _enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): GridCombatState {
  let current = state;

  current = { ...current, grid: tickTerrainTimers(current.grid) };

  current = tickConditions(current);

  current = applyHallowedGroundDamage(current);

  current = applyOverwatchTriggers(current);

  const newCooldowns: Record<string, number> = {};
  for (const [id, cd] of Object.entries(current.player.abilityCooldowns)) {
    if (cd > 0) {
      newCooldowns[id] = cd - 1;
    }
  }

  current = {
    ...current,
    player: {
      ...current.player,
      abilityCooldowns: newCooldowns,
      guardDamageReduction: 0,
      braceNegateActive: false,
      riposteActive: false,
      blockFirstHitReduction: current.player.blockFirstHitReduction,
      overwatchTile: null,
      overwatchDamage: 0,
    },
    turn: current.turn + 1,
    playerInsertions: [],
    timeline: [],
  };

  return current;
}

function tickConditions(state: GridCombatState): GridCombatState {
  let current = state;

  const playerConds = { ...current.player.conditions };
  for (const key of Object.keys(playerConds) as GridConditionKey[]) {
    const val = playerConds[key];
    if (val !== undefined && val > 0) {
      playerConds[key] = val - 1;
      if (playerConds[key] === 0) {
        delete playerConds[key];
      }
    }
  }

  let playerHp = current.player.hp;
  if ((current.player.conditions.poisoned ?? 0) > 0) {
    playerHp = Math.max(0, playerHp - 2);
  }
  if ((current.player.conditions.burning ?? 0) > 0) {
    playerHp = Math.max(0, playerHp - 1);
  }

  current = {
    ...current,
    player: { ...current.player, conditions: playerConds, hp: playerHp },
  };

  const newEnemies = current.enemies.map((e) => {
    if (e.hp <= 0) {
      return e;
    }

    const conds = { ...e.conditions };
    let hp = e.hp;

    if ((conds.poisoned ?? 0) > 0) {
      hp = Math.max(0, hp - 2);
    }
    if ((conds.burning ?? 0) > 0) {
      hp = Math.max(0, hp - 1);
    }

    for (const key of Object.keys(conds) as GridConditionKey[]) {
      const val = conds[key];
      if (val !== undefined && val > 0) {
        conds[key] = val - 1;
        if (conds[key] === 0) {
          delete conds[key];
        }
      }
    }

    return { ...e, conditions: conds, hp };
  });

  return { ...current, enemies: newEnemies };
}

function applyHallowedGroundDamage(state: GridCombatState): GridCombatState {
  let current = state;

  for (const enemy of current.enemies) {
    if (enemy.hp <= 0) {
      continue;
    }

    const tile = getTile(current.grid, enemy.pos);
    if (tile && tile.type === "hallowed_ground") {
      const dmg = 3;
      const newHp = Math.max(0, enemy.hp - dmg);
      current = updateEnemy(current, enemy.uid, { hp: newHp });
      if (newHp <= 0) {
        current = handleEnemyDeath(current, { ...enemy, hp: 0 });
      }
    }
  }

  return current;
}

function applyOverwatchTriggers(state: GridCombatState): GridCombatState {
  return state;
}

export function checkVictoryDefeat(state: GridCombatState): GridCombatState {
  if (state.player.hp <= 0) {
    return { ...state, phase: "defeat" };
  }

  if (state.objectiveType === "kill_all") {
    const allDead = state.enemies.every((e) => e.hp <= 0);
    if (allDead) {
      return { ...state, phase: "victory" };
    }
  }

  if (state.objectiveType === "survive" && state.objectiveState) {
    if (state.objectiveState.turnsRemaining !== null && state.objectiveState.turnsRemaining <= 0) {
      return { ...state, phase: "victory" };
    }
  }

  return state;
}
