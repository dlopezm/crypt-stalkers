import type {
  GridCombatState,
  GridEnemyState,
  GridEnemyTypeDef,
  GridConditionKey,
  GridPos,
  GridDeadEnemy,
} from "../types";
import {
  DIR_DELTA,
  DIRECTIONS,
  isWalkable,
  posAdd,
  posEqual,
  makeTerrain,
  isAdjacent,
} from "../types";
import { getOccupiedPositions, getRadiusTiles, posKey, setTile } from "../grid";

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
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
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

  const def = enemyDefs.get(deadEnemy.id);
  if (def?.onDeath) {
    const ctx = {
      grid: current.grid,
      player: current.player,
      enemies: current.enemies,
      deadEnemies: current.deadEnemyPositions,
      turn: current.turn,
    };
    const effects = def.onDeath(deadEnemy, ctx);

    for (const effect of effects) {
      switch (effect.type) {
        case "spawn_heap": {
          const heap: GridEnemyState = {
            id: "heap_of_bones",
            uid: `heap_${deadEnemy.uid}_${current.turn}`,
            hp: 3,
            maxHp: 3,
            pos: effect.pos,
            facing: "south",
            conditions: {},
            armor: 0,
            thorns: 0,
            isBoss: false,
            incorporeal: false,
            shieldWallActive: false,
            reformTimer: 2,
            metamorphosisTimer: null,
            metamorphosisTarget: null,
            resistances: { pierce: 0.5 },
            vulnerabilities: { bludgeoning: 2.0 },
          };
          current = { ...current, enemies: [...current.enemies, heap] };
          break;
        }

        case "explode": {
          const blastTiles = getRadiusTiles(deadEnemy.pos, effect.radius, current.grid);
          if (blastTiles.some((t) => posEqual(t, current.player.pos))) {
            current = {
              ...current,
              player: {
                ...current.player,
                hp: Math.max(0, current.player.hp - effect.damage),
              },
            };
          }
          for (const e of current.enemies) {
            if (e.hp > 0 && e.uid !== deadEnemy.uid && blastTiles.some((t) => posEqual(t, e.pos))) {
              const newHp = Math.max(0, e.hp - effect.damage);
              current = updateEnemy(current, e.uid, { hp: newHp });
            }
          }
          break;
        }

        case "drop_caltrops": {
          const newGrid = setTile(
            current.grid,
            effect.pos,
            makeTerrain("hazard", { hazardDamage: 2, turnsRemaining: 3 }),
          );
          current = { ...current, grid: newGrid };
          break;
        }

        case "create_terrain": {
          const newGrid = setTile(current.grid, effect.pos, makeTerrain(effect.terrain));
          current = { ...current, grid: newGrid };
          break;
        }

        case "corpse_burst": {
          const blastTiles = getRadiusTiles(effect.pos, 1, current.grid);
          if (blastTiles.some((t) => posEqual(t, current.player.pos))) {
            current = {
              ...current,
              player: {
                ...current.player,
                hp: Math.max(0, current.player.hp - effect.damage),
                conditions: {
                  ...current.player.conditions,
                  poisoned: Math.max(current.player.conditions.poisoned ?? 0, effect.poisonTurns),
                },
              },
            };
          }
          break;
        }

        case "infected_adjacent": {
          if (isAdjacent(effect.pos, current.player.pos)) {
            current = {
              ...current,
              player: {
                ...current.player,
                conditions: {
                  ...current.player.conditions,
                  infected: (current.player.conditions.infected ?? 0) + effect.turns,
                },
              },
            };
          }
          break;
        }

        case "death_darkness": {
          const darkTiles = getRadiusTiles(effect.pos, effect.radius, current.grid);
          let newGrid = current.grid;
          for (const t of darkTiles) {
            const tile = newGrid.tiles[t.row]?.[t.col];
            if (tile && tile.type === "floor") {
              newGrid = setTile(
                newGrid,
                t,
                makeTerrain("dark_zone", { turnsRemaining: effect.turns }),
              );
            }
          }
          current = { ...current, grid: newGrid };
          break;
        }
      }
    }
  }

  return current;
}
