import type { GridCombatState, GridConditionKey, GridEnemyTypeDef } from "../types";
import { getTile, isAdjacent, posEqual } from "../types";
import { tickTerrainTimers } from "../grid";
import { BALANCE } from "../balance";
import { handleEnemyDeath, updateEnemy } from "./state-helpers";

export function endOfTurnCleanup(
  state: GridCombatState,
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): GridCombatState {
  let current = state;

  current = { ...current, grid: tickTerrainTimers(current.grid) };

  current = tickConditions(current);

  current = applyHallowedGroundDamage(current, enemyDefs);

  current = applyRotDamage(current, enemyDefs);

  current = applyEnemyPassives(current, enemyDefs);

  current = applyOverwatchTriggers(current, enemyDefs);

  const newCooldowns: Record<string, number> = {};
  for (const [id, cd] of Object.entries(current.player.abilityCooldowns)) {
    if (cd > 0) {
      newCooldowns[id] = cd - 1;
    }
  }

  const nextAp =
    current.player.ap < 0
      ? Math.max(1, current.player.maxAp + current.player.ap)
      : current.player.maxAp;

  current = {
    ...current,
    player: {
      ...current.player,
      ap: nextAp,
      abilityCooldowns: newCooldowns,
      guardDamageReduction: 0,
      braceNegateActive: false,
      riposteActive: false,
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
    playerHp = Math.max(0, playerHp - BALANCE.terrain.poisonDamagePerTurn);
  }
  if ((current.player.conditions.burning ?? 0) > 0) {
    playerHp = Math.max(0, playerHp - BALANCE.terrain.burningDamagePerTurn);
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
      hp = Math.max(0, hp - BALANCE.terrain.poisonDamagePerTurn);
    }
    if ((conds.burning ?? 0) > 0) {
      hp = Math.max(0, hp - BALANCE.terrain.burningDamagePerTurn);
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

function applyHallowedGroundDamage(
  state: GridCombatState,
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): GridCombatState {
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
        current = handleEnemyDeath(current, { ...enemy, hp: 0 }, enemyDefs);
      }
    }
  }

  return current;
}

function applyRotDamage(
  state: GridCombatState,
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): GridCombatState {
  let current = state;

  for (const enemy of current.enemies) {
    if (enemy.hp <= 0) {
      continue;
    }

    const tile = getTile(current.grid, enemy.pos);
    if (tile && tile.type === "rot") {
      const dmg = BALANCE.enemy.sacrariumRotDamage;
      const newHp = Math.max(0, enemy.hp - dmg);
      current = updateEnemy(current, enemy.uid, { hp: newHp });
      if (newHp <= 0) {
        current = handleEnemyDeath(current, { ...enemy, hp: 0 }, enemyDefs);
      }
    }
  }

  const playerTile = getTile(current.grid, current.player.pos);
  if (playerTile && playerTile.type === "rot") {
    const dmg = BALANCE.enemy.sacrariumRotDamage;
    current = {
      ...current,
      player: { ...current.player, hp: Math.max(0, current.player.hp - dmg) },
    };
  }

  return current;
}

function applyEnemyPassives(
  state: GridCombatState,
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): GridCombatState {
  let current = state;

  const armorBonuses = new Map<string, number>();
  const addBonus = (uid: string, amount: number) => {
    armorBonuses.set(uid, (armorBonuses.get(uid) ?? 0) + amount);
  };

  for (const enemy of current.enemies) {
    if (enemy.hp <= 0) {
      continue;
    }

    const def = enemyDefs.get(enemy.id);
    if (!def) {
      continue;
    }

    for (const passive of def.passives) {
      if (passive.type === "ever_growing") {
        current = updateEnemy(current, enemy.uid, {
          hp: enemy.hp + passive.hpPerTurn,
          maxHp: enemy.maxHp + passive.hpPerTurn,
        });
      }

      if (passive.type === "perjured_aura") {
        for (const ally of current.enemies) {
          if (ally.uid === enemy.uid || ally.hp <= 0) {
            continue;
          }
          if (isAdjacent(enemy.pos, ally.pos)) {
            addBonus(ally.uid, passive.armorBonus);
          }
        }
      }

      if (passive.type === "formation_armor") {
        const adjacentAllies = current.enemies.filter(
          (e) =>
            e.uid !== enemy.uid && e.hp > 0 && e.id === enemy.id && isAdjacent(enemy.pos, e.pos),
        );
        if (adjacentAllies.length > 0) {
          addBonus(enemy.uid, adjacentAllies.length * passive.bonusPerAlly);
        }
      }

      if (passive.type === "bone_shield_while_minions") {
        const hasMinions = current.enemies.some((e) => e.uid !== enemy.uid && e.hp > 0);
        if (hasMinions) {
          addBonus(enemy.uid, passive.armor);
        }
      }

      if (passive.type === "dark_empowered") {
        const tile = getTile(current.grid, enemy.pos);
        if (tile?.type === "dark_zone") {
          addBonus(enemy.uid, passive.bonusArmor);
        }
      }
    }
  }

  for (const enemy of current.enemies) {
    if (enemy.hp <= 0) {
      continue;
    }
    const def = enemyDefs.get(enemy.id);
    if (!def) {
      continue;
    }

    const mistExpired =
      enemy.incorporeal !== def.incorporeal && (enemy.conditions.hidden ?? 0) === 0;

    const passiveBaseline = def.defaultArmor + (armorBonuses.get(enemy.uid) ?? 0);
    const newArmor = mistExpired ? passiveBaseline : Math.max(passiveBaseline, enemy.armor);

    const armorChanged = newArmor !== enemy.armor;
    if (mistExpired && armorChanged) {
      current = updateEnemy(current, enemy.uid, {
        armor: newArmor,
        incorporeal: def.incorporeal,
      });
    } else if (mistExpired) {
      current = updateEnemy(current, enemy.uid, { incorporeal: def.incorporeal });
    } else if (armorChanged) {
      current = updateEnemy(current, enemy.uid, { armor: newArmor });
    }
  }

  return current;
}

function applyOverwatchTriggers(
  state: GridCombatState,
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): GridCombatState {
  if (!state.player.overwatchTile || state.player.overwatchDamage <= 0) {
    return state;
  }

  let current = state;
  const tile = current.player.overwatchTile;
  const damage = current.player.overwatchDamage;

  for (const enemy of current.enemies) {
    if (enemy.hp <= 0) {
      continue;
    }

    if (tile && posEqual(enemy.pos, tile)) {
      const newHp = Math.max(0, enemy.hp - damage);
      current = updateEnemy(current, enemy.uid, { hp: newHp });

      if (newHp <= 0) {
        current = handleEnemyDeath(current, { ...enemy, hp: 0 }, enemyDefs);
      }
    }
  }

  return current;
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
