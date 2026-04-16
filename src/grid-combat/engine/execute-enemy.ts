import type {
  EnemyAbility,
  EnemyAbilitySpecial,
  GridCombatLogEntry,
  GridCombatState,
  GridEnemyState,
  GridEnemyTypeDef,
  GridPos,
  TimelineEntry,
} from "../types";
import { directionFromTo, getTile, isWalkable, makeTerrain, posEqual } from "../types";
import { getOccupiedPositions, getRadiusTiles, posKey, resolvePush, setTile } from "../grid";
import {
  applyConditionToEnemy,
  applyConditionToPlayer,
  findNearbyEmptyTile,
  handleEnemyDeath,
  updateEnemy,
} from "./state-helpers";
import type { ExecutionResult } from "./types";

export function executeEnemyAction(
  state: GridCombatState,
  entry: TimelineEntry,
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): ExecutionResult {
  if (entry.owner.type !== "enemy") {
    return { state, log: [] };
  }

  const enemyUid = (entry.owner as { type: "enemy"; uid: string }).uid;
  const actualEnemy = state.enemies.find((e) => e.uid === enemyUid && e.hp > 0);

  if (!actualEnemy) {
    return { state, log: [] };
  }

  if (entry.abilityId === "stunned") {
    return {
      state,
      log: [{ turn: state.turn, text: `${actualEnemy.id} is stunned!`, source: "enemy" }],
    };
  }

  if (entry.abilityId === "reforming") {
    return handleReformTick(state, actualEnemy);
  }

  if (entry.abilityId === "metamorphosis") {
    return handleMetamorphosisTick(state, actualEnemy, enemyDefs);
  }

  const def = enemyDefs.get(actualEnemy.id);
  if (!def) {
    return { state, log: [] };
  }

  const abilityDef = def.abilities.find((a) => a.id === entry.abilityId);
  if (!abilityDef) {
    return handleEnemyMovement(state, actualEnemy, entry);
  }

  return executeEnemyAbility(state, actualEnemy, abilityDef, entry);
}

function handleEnemyMovement(
  state: GridCombatState,
  enemy: GridEnemyState,
  entry: TimelineEntry,
): ExecutionResult {
  if (!entry.targetTile) {
    return { state, log: [] };
  }

  const occupied = getOccupiedPositions(state.player, state.enemies);
  const targetKey = posKey(entry.targetTile);

  if (isWalkable(state.grid, entry.targetTile) && !occupied.has(targetKey)) {
    const newState = updateEnemy(state, enemy.uid, {
      pos: entry.targetTile,
      facing: directionFromTo(enemy.pos, entry.targetTile) ?? enemy.facing,
    });
    return {
      state: newState,
      log: [{ turn: state.turn, text: `${enemy.id} moves.`, source: "enemy" }],
    };
  }

  return { state, log: [] };
}

function executeEnemyAbility(
  state: GridCombatState,
  enemy: GridEnemyState,
  ability: EnemyAbility,
  entry: TimelineEntry,
): ExecutionResult {
  const log: GridCombatLogEntry[] = [];
  let current = state;

  const newFacing = entry.targetTile
    ? (directionFromTo(enemy.pos, entry.targetTile) ?? enemy.facing)
    : enemy.facing;
  current = updateEnemy(current, enemy.uid, { facing: newFacing });

  if (ability.damage > 0) {
    const playerOnTarget = entry.affectedTiles.some((t) => posEqual(t, current.player.pos));

    if (playerOnTarget) {
      let damage = ability.damage;

      if (current.player.guardDamageReduction > 0) {
        damage = Math.max(0, damage - current.player.guardDamageReduction);
      }

      if (current.player.braceNegateActive) {
        damage = 0;
        log.push({ turn: current.turn, text: "Brace absorbs the hit!", source: "player" });
      }

      if (current.player.blockFirstHitReduction > 0 && damage > 0) {
        damage = Math.floor(damage * (1 - current.player.blockFirstHitReduction));
      }

      damage = Math.max(0, damage - current.player.armor);

      if (damage > 0) {
        const newHp = Math.max(0, current.player.hp - damage);
        current = { ...current, player: { ...current.player, hp: newHp } };
        log.push({
          turn: current.turn,
          text: `${enemy.id} hits you for ${damage}!`,
          source: "enemy",
        });

        if (current.player.riposteActive) {
          const riposteDamage = 5;
          const riposteEnemy = current.enemies.find((e) => e.uid === enemy.uid);
          if (riposteEnemy) {
            const newEnemyHp = Math.max(0, riposteEnemy.hp - riposteDamage);
            current = updateEnemy(current, enemy.uid, { hp: newEnemyHp });
            log.push({
              turn: current.turn,
              text: `Riposte! ${enemy.id} takes ${riposteDamage}!`,
              source: "player",
            });
          }
        }
      }
    }

    for (const tile of entry.affectedTiles) {
      const hitEnemy = current.enemies.find(
        (e) => e.uid !== enemy.uid && e.hp > 0 && posEqual(e.pos, tile),
      );
      if (hitEnemy) {
        const friendlyDamage = Math.max(0, ability.damage - hitEnemy.armor);
        const newHp = Math.max(0, hitEnemy.hp - friendlyDamage);
        current = updateEnemy(current, hitEnemy.uid, { hp: newHp });
        log.push({
          turn: current.turn,
          text: `${enemy.id} hits ${hitEnemy.id} for ${friendlyDamage}! (friendly fire)`,
          source: "enemy",
        });

        if (newHp <= 0) {
          current = handleEnemyDeath(current, { ...hitEnemy, hp: 0 });
          log.push({
            turn: current.turn,
            text: `${hitEnemy.id} defeated by friendly fire!`,
            source: "enemy",
          });
        }
      }
    }
  }

  if (ability.pushDistance > 0 && entry.targetTile) {
    const targetOnTile = current.enemies.find(
      (e) => e.uid !== enemy.uid && e.hp > 0 && posEqual(e.pos, entry.targetTile!),
    );
    const playerOnTile = posEqual(current.player.pos, entry.targetTile);

    if (playerOnTile) {
      const pushDir = directionFromTo(enemy.pos, current.player.pos);
      if (pushDir) {
        const occupied = getOccupiedPositions(current.player, current.enemies);
        const pushResult = resolvePush(
          current.grid,
          current.player.pos,
          pushDir,
          ability.pushDistance,
          occupied,
        );
        current = { ...current, player: { ...current.player, pos: pushResult.finalPos } };
        log.push({ turn: current.turn, text: `${enemy.id} pushes you!`, source: "enemy" });
      }
    } else if (targetOnTile) {
      const pushDir = directionFromTo(enemy.pos, targetOnTile.pos);
      if (pushDir) {
        const occupied = getOccupiedPositions(current.player, current.enemies);
        const pushResult = resolvePush(
          current.grid,
          targetOnTile.pos,
          pushDir,
          ability.pushDistance,
          occupied,
        );
        current = updateEnemy(current, targetOnTile.uid, { pos: pushResult.finalPos });
      }
    }
  }

  for (const special of ability.special) {
    const result = applyEnemySpecial(current, enemy, special, entry, log);
    current = result.state;
    log.push(...result.log);
  }

  for (const cond of ability.conditions) {
    if (cond.target === "enemy" && entry.targetUid) {
      current = applyConditionToEnemy(current, entry.targetUid, cond.condition, cond.stacks);
    }
    if (cond.target === "self") {
      current = applyConditionToEnemy(current, enemy.uid, cond.condition, cond.stacks);
    }
  }

  return { state: current, log };
}

function applyEnemySpecial(
  state: GridCombatState,
  enemy: GridEnemyState,
  special: EnemyAbilitySpecial,
  entry: TimelineEntry,
  existingLog: readonly GridCombatLogEntry[],
): ExecutionResult {
  const log: GridCombatLogEntry[] = [];
  let current = state;

  switch (special.type) {
    case "summon": {
      for (let i = 0; i < special.count; i++) {
        const spawnPos = findNearbyEmptyTile(current, enemy.pos);
        if (spawnPos) {
          const newEnemy: GridEnemyState = {
            id: special.enemyId,
            uid: `${special.enemyId}_${current.turn}_${i}`,
            hp: 12,
            maxHp: 12,
            pos: spawnPos,
            facing: "south",
            conditions: {},
            armor: 0,
            thorns: 0,
            isBoss: false,
            incorporeal: false,
            shieldWallActive: false,
            reformTimer: null,
            metamorphosisTimer: null,
            metamorphosisTarget: null,
            resistances: {},
            vulnerabilities: {},
          };
          current = { ...current, enemies: [...current.enemies, newEnemy] };
          log.push({
            turn: current.turn,
            text: `${enemy.id} summons ${special.enemyId}!`,
            source: "enemy",
          });
        }
      }
      break;
    }

    case "raise_dead": {
      const corpse = current.deadEnemyPositions.find((d) => d.reformTimer === null);
      if (corpse) {
        const raisedEnemy: GridEnemyState = {
          id: corpse.id,
          uid: `raised_${corpse.uid}_${current.turn}`,
          hp: Math.floor(12 * 0.5),
          maxHp: 12,
          pos: corpse.pos,
          facing: "south",
          conditions: {},
          armor: 0,
          thorns: 0,
          isBoss: false,
          incorporeal: false,
          shieldWallActive: false,
          reformTimer: null,
          metamorphosisTimer: null,
          metamorphosisTarget: null,
          resistances: {},
          vulnerabilities: {},
        };
        current = {
          ...current,
          enemies: [...current.enemies, raisedEnemy],
          deadEnemyPositions: current.deadEnemyPositions.filter((d) => d.uid !== corpse.uid),
        };
        log.push({ turn: current.turn, text: `${enemy.id} raises ${corpse.id}!`, source: "enemy" });
      }
      break;
    }

    case "extinguish_light": {
      const tiles = getRadiusTiles(enemy.pos, special.range, current.grid);
      let newGrid = current.grid;
      for (const tilePos of tiles) {
        const tile = getTile(newGrid, tilePos);
        if (tile && tile.type === "brazier" && tile.brazierLit) {
          newGrid = setTile(newGrid, tilePos, { ...tile, brazierLit: false });
          log.push({
            turn: current.turn,
            text: `${enemy.id} extinguishes a brazier!`,
            source: "enemy",
          });
        }
      }
      current = { ...current, grid: newGrid };
      break;
    }

    case "spread_darkness": {
      let newGrid = current.grid;
      const darkTiles = getRadiusTiles(enemy.pos, special.radius, current.grid);
      for (const tilePos of darkTiles) {
        const tile = getTile(newGrid, tilePos);
        if (tile && tile.type === "floor") {
          newGrid = setTile(
            newGrid,
            tilePos,
            makeTerrain("dark_zone", { turnsRemaining: special.turns }),
          );
        }
      }
      current = { ...current, grid: newGrid };
      log.push({ turn: current.turn, text: `${enemy.id} spreads darkness!`, source: "enemy" });
      break;
    }

    case "drain_ap": {
      const newAp = Math.max(0, current.player.ap - special.amount);
      current = { ...current, player: { ...current.player, ap: newAp } };
      log.push({
        turn: current.turn,
        text: `${enemy.id} drains ${special.amount} AP!`,
        source: "enemy",
      });
      break;
    }

    case "steal_salt": {
      const stolen = Math.min(current.player.salt, special.amount);
      current = { ...current, player: { ...current.player, salt: current.player.salt - stolen } };
      log.push({ turn: current.turn, text: `${enemy.id} steals ${stolen} salt!`, source: "enemy" });
      break;
    }

    case "teleport_to_dark": {
      const darkTiles: GridPos[] = [];
      for (let r = 0; r < current.grid.height; r++) {
        for (let c = 0; c < current.grid.width; c++) {
          const tile = getTile(current.grid, { row: r, col: c });
          if (tile && tile.type === "dark_zone") {
            const occupied = getOccupiedPositions(current.player, current.enemies);
            if (!occupied.has(posKey({ row: r, col: c }))) {
              darkTiles.push({ row: r, col: c });
            }
          }
        }
      }
      if (darkTiles.length > 0) {
        const target = darkTiles[Math.floor(Math.random() * darkTiles.length)];
        current = updateEnemy(current, enemy.uid, { pos: target });
        log.push({
          turn: current.turn,
          text: `${enemy.id} teleports through the darkness!`,
          source: "enemy",
        });
      }
      break;
    }

    case "immobilize_both": {
      current = applyConditionToEnemy(current, enemy.uid, "immobilized", special.turns);
      current = applyConditionToPlayer(current, "immobilized", special.turns);
      log.push({ turn: current.turn, text: `${enemy.id} grapples you!`, source: "enemy" });
      break;
    }

    case "silence": {
      current = applyConditionToPlayer(current, "silenced", special.turns);
      log.push({ turn: current.turn, text: `${enemy.id} silences you!`, source: "enemy" });
      break;
    }

    case "gain_armor": {
      current = updateEnemy(current, enemy.uid, { armor: enemy.armor + special.amount });
      break;
    }

    case "hold_position_armor": {
      current = updateEnemy(current, enemy.uid, { armor: enemy.armor + special.amount });
      break;
    }

    case "lifesteal": {
      if (entry.targetTile && posEqual(current.player.pos, entry.targetTile)) {
        const healAmount = Math.floor((existingLog.length > 0 ? 5 : 0) * special.fraction);
        if (healAmount > 0) {
          const updatedEnemy = current.enemies.find((e) => e.uid === enemy.uid);
          if (updatedEnemy) {
            const newHp = Math.min(updatedEnemy.maxHp, updatedEnemy.hp + healAmount);
            current = updateEnemy(current, enemy.uid, { hp: newHp });
            log.push({ turn: current.turn, text: `${enemy.id} drains life!`, source: "enemy" });
          }
        }
      }
      break;
    }

    default:
      break;
  }

  return { state: current, log };
}

function handleReformTick(state: GridCombatState, enemy: GridEnemyState): ExecutionResult {
  if (enemy.reformTimer === null) {
    return { state, log: [] };
  }

  const remaining = enemy.reformTimer - 1;

  if (remaining <= 0) {
    const reformed = updateEnemy(state, enemy.uid, {
      hp: enemy.maxHp,
      reformTimer: null,
      id: "skeleton",
    });
    return {
      state: reformed,
      log: [{ turn: state.turn, text: `${enemy.id} reforms into a skeleton!`, source: "enemy" }],
    };
  }

  return {
    state: updateEnemy(state, enemy.uid, { reformTimer: remaining }),
    log: [{ turn: state.turn, text: `${enemy.id} reforming... (${remaining})`, source: "enemy" }],
  };
}

function handleMetamorphosisTick(
  state: GridCombatState,
  enemy: GridEnemyState,
  _enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): ExecutionResult {
  if (enemy.metamorphosisTimer === null) {
    return { state, log: [] };
  }

  const remaining = enemy.metamorphosisTimer - 1;

  if (remaining <= 0 && enemy.metamorphosisTarget) {
    const transformed: GridEnemyState = {
      ...enemy,
      id: enemy.metamorphosisTarget,
      hp: 12,
      maxHp: 12,
      metamorphosisTimer: null,
      metamorphosisTarget: null,
    };
    const newEnemies = state.enemies.map((e) => (e.uid === enemy.uid ? transformed : e));
    return {
      state: { ...state, enemies: newEnemies },
      log: [
        {
          turn: state.turn,
          text: `${enemy.id} transforms into ${enemy.metamorphosisTarget}!`,
          source: "enemy",
        },
      ],
    };
  }

  return {
    state: updateEnemy(state, enemy.uid, { metamorphosisTimer: remaining }),
    log: [{ turn: state.turn, text: `${enemy.id} growing... (${remaining})`, source: "enemy" }],
  };
}
