import type {
  GridAbility,
  GridAbilitySpecial,
  GridCombatLogEntry,
  GridCombatState,
  GridPos,
  TimelineEntry,
} from "../types";
import {
  DIR_DELTA,
  TERRAIN_DESTRUCTIBLE,
  directionFromTo,
  getTile,
  isAdjacent,
  isWalkable,
  makeFloor,
  makeTerrain,
  manhattanDistance,
  posAdd,
  posEqual,
} from "../types";
import {
  getOccupiedPositions,
  getRadiusTiles,
  posKey,
  resolveMinecartPush,
  resolvePush,
  setTile,
} from "../grid";
import {
  applyConditionToEnemy,
  applyConditionToPlayer,
  handleEnemyDeath,
  updateEnemy,
} from "./state-helpers";
import type { ExecutionResult } from "./types";
import { BALANCE } from "../balance";
import type { GridEnemyState, GridEnemyTypeDef } from "../types";

export function executePlayerAction(
  state: GridCombatState,
  entry: TimelineEntry,
  playerAbilities: ReadonlyMap<string, GridAbility>,
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): ExecutionResult {
  const ability = playerAbilities.get(entry.abilityId);
  if (!ability) {
    return { state, log: [] };
  }

  if ((state.player.conditions.silenced ?? 0) > 0 && ability.silenceBlocked) {
    return {
      state,
      log: [{ turn: state.turn, text: "Silenced — cannot use abilities!", source: "player" }],
    };
  }

  const log: GridCombatLogEntry[] = [];
  let current = state;

  if (ability.moveSelfDistance > 0 && ability.moveSelfDirection) {
    if ((current.player.conditions.immobilized ?? 0) > 0) {
      log.push({ turn: current.turn, text: "Cannot move — immobilized!", source: "player" });
    } else {
      const moveDistance =
        (current.player.conditions.slowed ?? 0) > 0
          ? Math.max(0, ability.moveSelfDistance - 1)
          : ability.moveSelfDistance;

      if (moveDistance > 0) {
        current = applyPlayerMovement(
          current,
          { ...ability, moveSelfDistance: moveDistance },
          entry.targetTile,
        );
        log.push({ turn: current.turn, text: `You move.`, source: "player" });
      } else {
        log.push({ turn: current.turn, text: "Too slowed to move!", source: "player" });
      }
    }
  }

  if (ability.baseDamage > 0 && entry.targetTile) {
    const result = applyPlayerDamage(
      current,
      ability,
      entry.targetTile,
      entry.targetUid,
      enemyDefs,
    );
    current = result.state;
    log.push(...result.log);
  }

  if (ability.pushDistance > 0 && entry.targetUid) {
    const result = applyPlayerPush(
      current,
      entry.targetUid,
      ability.pushDistance,
      entry.targetTile,
      enemyDefs,
    );
    current = result.state;
    log.push(...result.log);
  }

  for (const special of ability.special) {
    const result = applyAbilitySpecial(current, special, entry, ability, enemyDefs);
    current = result.state;
    log.push(...result.log);
  }

  for (const cond of ability.conditions) {
    if (cond.target === "enemy" || cond.target === "both") {
      if (entry.targetUid) {
        current = applyConditionToEnemy(current, entry.targetUid, cond.condition, cond.stacks);
        log.push({
          turn: current.turn,
          text: `Enemy ${cond.condition} ${cond.stacks}.`,
          source: "player",
        });
      }
    }
    if (cond.target === "self" || cond.target === "both") {
      current = applyConditionToPlayer(current, cond.condition, cond.stacks);
    }
  }

  return { state: current, log };
}

function applyPlayerMovement(
  state: GridCombatState,
  ability: GridAbility,
  targetTile: GridPos | null,
): GridCombatState {
  if (!targetTile || !ability.moveSelfDirection) {
    return state;
  }

  const dir = directionFromTo(state.player.pos, targetTile);
  if (!dir) {
    return state;
  }

  let newPos = state.player.pos;

  for (let i = 0; i < ability.moveSelfDistance; i++) {
    const nextPos = posAdd(newPos, DIR_DELTA[dir]);
    const occupied = getOccupiedPositions(state.player, state.enemies);

    if (!isWalkable(state.grid, nextPos) || occupied.has(posKey(nextPos))) {
      break;
    }

    newPos = nextPos;
  }

  return { ...state, player: { ...state.player, pos: newPos } };
}

function applyPlayerDamage(
  state: GridCombatState,
  ability: GridAbility,
  targetTile: GridPos,
  targetUid: string | null,
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): ExecutionResult {
  const log: GridCombatLogEntry[] = [];
  let current = state;

  const intendedTargets = targetUid
    ? current.enemies.filter((e) => e.uid === targetUid && e.hp > 0)
    : current.enemies.filter((e) => posEqual(e.pos, targetTile) && e.hp > 0);

  for (const intended of intendedTargets) {
    const redirect = redirectToInterceptor(current, intended);
    const target = redirect.target;
    log.push(...redirect.log);

    let damage = ability.baseDamage + current.player.boneResonanceStacks;

    const resist = ability.damageType ? (target.resistances[ability.damageType] ?? 1) : 1;
    const vuln = ability.damageType ? (target.vulnerabilities[ability.damageType] ?? 1) : 1;
    damage = Math.max(0, Math.floor(damage * resist * vuln) - target.armor);

    if (target.incorporeal && ability.damageType !== "holy" && ability.damageType !== "fire") {
      damage = Math.floor(damage * 0.5);
    }

    if ((current.player.conditions.marked ?? 0) > 0) {
      damage = Math.floor(damage * (1 - BALANCE.enemy.forswornMarkReduction));
    }

    const newHp = Math.max(0, target.hp - damage);
    log.push({ turn: current.turn, text: `You hit ${target.id} for ${damage}!`, source: "player" });

    current = updateEnemy(current, target.uid, { hp: newHp });

    if (target.thorns > 0 && damage > 0) {
      const thornsHp = Math.max(0, current.player.hp - target.thorns);
      current = { ...current, player: { ...current.player, hp: thornsHp } };
      log.push({
        turn: current.turn,
        text: `Thorns! You take ${target.thorns} damage!`,
        source: "environment",
      });
    }

    if (newHp <= 0) {
      current = handleEnemyDeath(current, target, enemyDefs);
      log.push({ turn: current.turn, text: `${target.id} defeated!`, source: "player" });
    }
  }

  return { state: current, log };
}

function redirectToInterceptor(
  state: GridCombatState,
  intended: GridEnemyState,
): { target: GridEnemyState; log: readonly GridCombatLogEntry[] } {
  if ((intended.conditions.intercepting ?? 0) > 0) {
    return { target: intended, log: [] };
  }
  const interceptor = state.enemies.find(
    (e) =>
      e.uid !== intended.uid &&
      e.hp > 0 &&
      (e.conditions.intercepting ?? 0) > 0 &&
      isAdjacent(e.pos, intended.pos),
  );
  if (!interceptor) {
    return { target: intended, log: [] };
  }
  return {
    target: interceptor,
    log: [
      {
        turn: state.turn,
        text: `${interceptor.id} intercepts the blow for ${intended.id}!`,
        source: "enemy",
      },
    ],
  };
}

function applyPlayerPush(
  state: GridCombatState,
  targetUid: string,
  distance: number,
  fromTile: GridPos | null,
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): ExecutionResult {
  const log: GridCombatLogEntry[] = [];
  let current = state;

  const target = current.enemies.find((e) => e.uid === targetUid && e.hp > 0);
  if (!target) {
    return { state: current, log };
  }

  const pushDir = directionFromTo(fromTile ?? current.player.pos, target.pos);
  if (!pushDir) {
    return { state: current, log };
  }

  const occupied = getOccupiedPositions(current.player, current.enemies);
  const result = resolvePush(current.grid, target.pos, pushDir, distance, occupied);

  current = updateEnemy(current, target.uid, { pos: result.finalPos });
  log.push({ turn: current.turn, text: `${target.id} pushed!`, source: "player" });

  if (result.hitPit) {
    if (!target.isBoss) {
      current = updateEnemy(current, target.uid, { hp: 0 });
      log.push({
        turn: current.turn,
        text: `${target.id} falls into a pit!`,
        source: "environment",
      });
      current = handleEnemyDeath(current, { ...target, pos: result.finalPos, hp: 0 }, enemyDefs);
    } else {
      current = updateEnemy(current, target.uid, { hp: Math.max(1, target.hp - 20) });
      log.push({
        turn: current.turn,
        text: `${target.id} takes massive pit damage!`,
        source: "environment",
      });
    }
  }

  return { state: current, log };
}

function applyAbilitySpecial(
  state: GridCombatState,
  special: GridAbilitySpecial,
  entry: TimelineEntry,
  _ability: GridAbility,
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): ExecutionResult {
  const log: GridCombatLogEntry[] = [];
  let current = state;

  switch (special.type) {
    case "create_terrain": {
      if (entry.targetTile) {
        const newGrid = setTile(
          current.grid,
          entry.targetTile,
          makeTerrain(special.terrain, {
            turnsRemaining: special.turnsRemaining,
          }),
        );
        current = { ...current, grid: newGrid };
        log.push({ turn: current.turn, text: `Created ${special.terrain}!`, source: "player" });
      }
      break;
    }

    case "destroy_terrain": {
      if (entry.targetTile) {
        const tile = getTile(current.grid, entry.targetTile);
        if (tile && TERRAIN_DESTRUCTIBLE.has(tile.type)) {
          let newGrid = setTile(current.grid, entry.targetTile, makeFloor());

          if (tile.type === "pillar") {
            const debrisTiles = getRadiusTiles(entry.targetTile, 1, current.grid);
            for (const dt of debrisTiles) {
              const dtTile = getTile(newGrid, dt);
              if (dtTile && dtTile.type === "floor") {
                newGrid = setTile(newGrid, dt, makeTerrain("rubble"));
              }
            }

            for (const e of current.enemies) {
              if (e.hp > 0 && debrisTiles.some((dt) => posEqual(dt, e.pos))) {
                const dmg = 3;
                const newHp = Math.max(0, e.hp - dmg);
                current = updateEnemy(current, e.uid, { hp: newHp });
                log.push({
                  turn: current.turn,
                  text: `${e.id} hit by debris for ${dmg}!`,
                  source: "environment",
                });
                if (newHp <= 0) {
                  current = handleEnemyDeath(current, { ...e, hp: 0 }, enemyDefs);
                }
              }
            }

            if (debrisTiles.some((dt) => posEqual(dt, current.player.pos))) {
              const dmg = 3;
              current = {
                ...current,
                player: { ...current.player, hp: Math.max(0, current.player.hp - dmg) },
              };
              log.push({
                turn: current.turn,
                text: `You're hit by debris for ${dmg}!`,
                source: "environment",
              });
            }
          }

          if (tile.type === "salt_deposit") {
            current = { ...current, player: { ...current.player, salt: current.player.salt + 3 } };
            log.push({
              turn: current.turn,
              text: "Salt deposit shattered! +3 salt.",
              source: "environment",
            });
          }

          current = { ...current, grid: newGrid };
          log.push({ turn: current.turn, text: "Terrain destroyed!", source: "player" });
        }
      }
      break;
    }

    case "push_mine_cart": {
      if (entry.targetTile) {
        const dir = directionFromTo(current.player.pos, entry.targetTile);
        if (dir) {
          const occupied = getOccupiedPositions(current.player, current.enemies);
          const cartResult = resolveMinecartPush(current.grid, entry.targetTile, dir, occupied);
          for (const hitPos of cartResult.hitPositions) {
            const hitEnemy = current.enemies.find((e) => e.hp > 0 && posEqual(e.pos, hitPos));
            if (hitEnemy) {
              const dmg = 5;
              const newHp = Math.max(0, hitEnemy.hp - dmg);
              current = updateEnemy(current, hitEnemy.uid, { hp: newHp });
              log.push({
                turn: current.turn,
                text: `Mine cart hits ${hitEnemy.id} for ${dmg}!`,
                source: "environment",
              });
              if (newHp <= 0) {
                current = handleEnemyDeath(current, { ...hitEnemy, hp: 0 }, enemyDefs);
              }
            }
            if (posEqual(hitPos, current.player.pos)) {
              current = {
                ...current,
                player: { ...current.player, hp: Math.max(0, current.player.hp - 5) },
              };
              log.push({
                turn: current.turn,
                text: `Mine cart hits you for 5!`,
                source: "environment",
              });
            }
          }
        }
      }
      break;
    }

    case "reveal_hidden": {
      const revealed: string[] = [];
      for (const e of current.enemies) {
        if (
          (e.conditions.hidden ?? 0) > 0 &&
          manhattanDistance(current.player.pos, e.pos) <= special.radius
        ) {
          current = applyConditionToEnemy(current, e.uid, "hidden", 0);
          revealed.push(e.id);
        }
      }
      if (revealed.length > 0) {
        log.push({
          turn: current.turn,
          text: `Revealed: ${revealed.join(", ")}!`,
          source: "player",
        });
      }
      break;
    }

    case "gain_salt": {
      current = {
        ...current,
        player: { ...current.player, salt: current.player.salt + special.amount },
      };
      log.push({ turn: current.turn, text: `+${special.amount} salt.`, source: "player" });
      break;
    }

    case "heal": {
      const healAmt = Math.min(special.amount, current.player.maxHp - current.player.hp);
      if (healAmt > 0) {
        current = { ...current, player: { ...current.player, hp: current.player.hp + healAmt } };
        log.push({ turn: current.turn, text: `Healed ${healAmt} HP.`, source: "player" });
      }
      break;
    }

    case "self_damage": {
      current = {
        ...current,
        player: { ...current.player, hp: Math.max(0, current.player.hp - special.amount) },
      };
      log.push({ turn: current.turn, text: `Self-damage: ${special.amount}.`, source: "player" });
      break;
    }

    case "armor_this_turn": {
      current = {
        ...current,
        player: { ...current.player, armor: current.player.armor + special.amount },
      };
      break;
    }

    case "damage_reduction": {
      current = { ...current, player: { ...current.player, guardDamageReduction: special.amount } };
      break;
    }

    case "negate_hit": {
      current = { ...current, player: { ...current.player, braceNegateActive: true } };
      break;
    }

    case "riposte": {
      current = { ...current, player: { ...current.player, riposteActive: true } };
      log.push({ turn: current.turn, text: "Riposte stance!", source: "player" });
      break;
    }

    case "overwatch": {
      if (entry.targetTile) {
        current = {
          ...current,
          player: {
            ...current.player,
            overwatchTile: entry.targetTile,
            overwatchDamage: special.damage,
          },
        };
        log.push({ turn: current.turn, text: "Overwatch set!", source: "player" });
      }
      break;
    }

    case "cleanse_conditions": {
      current = { ...current, player: { ...current.player, conditions: {} } };
      log.push({ turn: current.turn, text: "Conditions cleansed!", source: "player" });
      break;
    }

    case "hallowed_ground": {
      const tiles = getRadiusTiles(current.player.pos, special.radius, current.grid);
      let newGrid = current.grid;
      for (const t of tiles) {
        const tile = getTile(newGrid, t);
        if (tile && (tile.type === "floor" || tile.type === "dark_zone")) {
          newGrid = setTile(
            newGrid,
            t,
            makeTerrain("hallowed_ground", { turnsRemaining: special.turns }),
          );
        }
      }
      current = { ...current, grid: newGrid };
      log.push({ turn: current.turn, text: "Ground sanctified!", source: "player" });
      break;
    }

    case "light_zone": {
      const tiles = getRadiusTiles(current.player.pos, special.radius, current.grid);
      let newGrid = current.grid;
      for (const t of tiles) {
        const tile = getTile(newGrid, t);
        if (tile && tile.type === "dark_zone") {
          newGrid = setTile(
            newGrid,
            t,
            makeTerrain("floor", { turnsRemaining: special.turns, lit: true }),
          );
        }
      }
      const playerTile = getTile(newGrid, current.player.pos);
      if (playerTile && playerTile.type === "dark_zone") {
        newGrid = setTile(
          newGrid,
          current.player.pos,
          makeTerrain("floor", { turnsRemaining: special.turns, lit: true }),
        );
      }
      current = { ...current, grid: newGrid };
      log.push({ turn: current.turn, text: "Light illuminates the area!", source: "player" });
      break;
    }

    case "smoke_on_hit": {
      if (entry.targetTile) {
        const newGrid = setTile(
          current.grid,
          entry.targetTile,
          makeTerrain("smoke", { turnsRemaining: 1 }),
        );
        current = { ...current, grid: newGrid };
      }
      break;
    }

    case "sidestep_strike": {
      if (!entry.targetTile) {
        break;
      }

      const moveDest = entry.targetTile;
      if (
        isAdjacent(current.player.pos, moveDest) &&
        isWalkable(current.grid, moveDest) &&
        !getOccupiedPositions(current.player, current.enemies).has(posKey(moveDest))
      ) {
        current = { ...current, player: { ...current.player, pos: moveDest } };
        log.push({ turn: current.turn, text: "You sidestep.", source: "player" });
      }

      const strikeTarget = entry.affectedTiles[1];
      const strikeEnemy = strikeTarget
        ? current.enemies.find((e) => e.hp > 0 && posEqual(e.pos, strikeTarget))
        : entry.targetUid
          ? current.enemies.find((e) => e.uid === entry.targetUid && e.hp > 0)
          : null;

      if (strikeEnemy && isAdjacent(current.player.pos, strikeEnemy.pos)) {
        let damage = special.damage + current.player.boneResonanceStacks;
        const resist = special.damageType ? (strikeEnemy.resistances[special.damageType] ?? 1) : 1;
        const vuln = special.damageType
          ? (strikeEnemy.vulnerabilities[special.damageType] ?? 1)
          : 1;
        damage = Math.max(0, Math.floor(damage * resist * vuln) - strikeEnemy.armor);
        if (
          strikeEnemy.incorporeal &&
          special.damageType !== "holy" &&
          special.damageType !== "fire"
        ) {
          damage = Math.floor(damage * 0.5);
        }
        const newHp = Math.max(0, strikeEnemy.hp - damage);
        current = updateEnemy(current, strikeEnemy.uid, { hp: newHp });
        log.push({
          turn: current.turn,
          text: `You stab ${strikeEnemy.id} for ${damage}!`,
          source: "player",
        });
        if (newHp <= 0) {
          current = handleEnemyDeath(current, { ...strikeEnemy, hp: 0 }, enemyDefs);
          log.push({ turn: current.turn, text: `${strikeEnemy.id} defeated!`, source: "player" });
        }
      } else if (strikeEnemy) {
        log.push({
          turn: current.turn,
          text: `${strikeEnemy.id} out of melee range — no hit.`,
          source: "player",
        });
      }
      break;
    }

    case "slip_through_strike": {
      if (!entry.targetUid) {
        break;
      }

      const target = current.enemies.find((e) => e.uid === entry.targetUid && e.hp > 0);
      if (!target) {
        break;
      }

      const throughDir = directionFromTo(current.player.pos, target.pos);
      if (throughDir) {
        const oppositeTile = posAdd(target.pos, DIR_DELTA[throughDir]);
        if (
          isWalkable(current.grid, oppositeTile) &&
          !getOccupiedPositions(current.player, current.enemies).has(posKey(oppositeTile))
        ) {
          current = { ...current, player: { ...current.player, pos: oppositeTile } };
          log.push({ turn: current.turn, text: "You slip through!", source: "player" });
        }
      }

      if (isAdjacent(current.player.pos, target.pos)) {
        let damage = special.damage + current.player.boneResonanceStacks;
        const resist = special.damageType ? (target.resistances[special.damageType] ?? 1) : 1;
        const vuln = special.damageType ? (target.vulnerabilities[special.damageType] ?? 1) : 1;
        damage = Math.max(0, Math.floor(damage * resist * vuln) - target.armor);
        if (target.incorporeal && special.damageType !== "holy" && special.damageType !== "fire") {
          damage = Math.floor(damage * 0.5);
        }
        const newHp = Math.max(0, target.hp - damage);
        current = updateEnemy(current, target.uid, { hp: newHp });
        log.push({
          turn: current.turn,
          text: `You stab ${target.id} for ${damage}!`,
          source: "player",
        });
        if (newHp <= 0) {
          current = handleEnemyDeath(current, { ...target, hp: 0 }, enemyDefs);
          log.push({ turn: current.turn, text: `${target.id} defeated!`, source: "player" });
        }
      }
      break;
    }

    case "bone_resonance": {
      break;
    }

    default:
      break;
  }

  return { state: current, log };
}
