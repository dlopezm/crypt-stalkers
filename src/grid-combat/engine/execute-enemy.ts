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
import {
  directionFromTo,
  getTile,
  isWalkable,
  makeTerrain,
  posEqual,
  manhattanDistance,
  DIRECTIONS,
  DIR_DELTA,
  posAdd,
  inBounds,
} from "../types";
import {
  getOccupiedPositions,
  getRadiusTiles,
  getRingTiles,
  posKey,
  resolvePush,
  setTile,
} from "../grid";
import {
  applyConditionToEnemy,
  applyConditionToPlayer,
  findNearbyEmptyTile,
  handleEnemyDeath,
  updateEnemy,
} from "./state-helpers";
import type { ExecutionResult } from "./types";
import { SYNTHETIC_ABILITY_ID } from "./types";
import { BALANCE } from "../balance";

export function executeEnemyAction(
  state: GridCombatState,
  entry: TimelineEntry,
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): ExecutionResult {
  if (entry.owner.type !== "enemy") {
    return { state, log: [] };
  }

  const enemyUid = entry.owner.uid;
  const actualEnemy = state.enemies.find((e) => e.uid === enemyUid && e.hp > 0);

  if (!actualEnemy) {
    return { state, log: [] };
  }

  if (entry.abilityId === SYNTHETIC_ABILITY_ID.stunned) {
    return {
      state,
      log: [{ turn: state.turn, text: `${actualEnemy.id} is stunned!`, source: "enemy" }],
    };
  }

  if (entry.abilityId === SYNTHETIC_ABILITY_ID.reforming) {
    return handleReformTick(state, actualEnemy);
  }

  if (entry.abilityId === SYNTHETIC_ABILITY_ID.metamorphosis) {
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

  return executeEnemyAbility(state, actualEnemy, abilityDef, entry, enemyDefs);
}

function handleEnemyMovement(
  state: GridCombatState,
  enemy: GridEnemyState,
  entry: TimelineEntry,
): ExecutionResult {
  if (!entry.targetTile) {
    return { state, log: [] };
  }

  if ((enemy.conditions.slowed ?? 0) > 0) {
    return {
      state,
      log: [{ turn: state.turn, text: `${enemy.id} is slowed — cannot move!`, source: "enemy" }],
    };
  }

  if ((enemy.conditions.immobilized ?? 0) > 0) {
    return {
      state,
      log: [{ turn: state.turn, text: `${enemy.id} is immobilized!`, source: "enemy" }],
    };
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
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): ExecutionResult {
  const log: GridCombatLogEntry[] = [];
  let current = state;
  let damageDealt = 0;

  const newFacing = entry.targetTile
    ? (directionFromTo(enemy.pos, entry.targetTile) ?? enemy.facing)
    : enemy.facing;
  current = updateEnemy(current, enemy.uid, { facing: newFacing });

  const wasCommanded = (enemy.conditions.commanded ?? 0) > 0;
  if (wasCommanded) {
    current = applyConditionToEnemy(current, enemy.uid, "commanded", 0);
  }

  if (ability.damage > 0) {
    const playerOnTarget = entry.affectedTiles.some((t) => posEqual(t, current.player.pos));

    if (playerOnTarget) {
      let damage = ability.damage;

      if (wasCommanded) {
        damage += BALANCE.combat.commanderBonusDamage;
      }

      const enemyDir = directionFromTo(enemy.pos, current.player.pos);
      if (enemyDir) {
        const oppositePos = posAdd(current.player.pos, DIR_DELTA[enemyDir]);
        const flanker = current.enemies.find(
          (e) => e.uid !== enemy.uid && e.hp > 0 && posEqual(e.pos, oppositePos),
        );
        if (flanker) {
          damage += BALANCE.combat.flankingBonus;
        }
      }

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
        damageDealt = damage;
        const newHp = Math.max(0, current.player.hp - damage);
        current = { ...current, player: { ...current.player, hp: newHp } };
        log.push({
          turn: current.turn,
          text: `${enemy.id} hits you for ${damage}!`,
          source: "enemy",
        });

        if (current.player.riposteActive) {
          const riposteDamage = BALANCE.combat.riposteDamage;
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
          current = handleEnemyDeath(current, { ...hitEnemy, hp: 0 }, enemyDefs);
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
    const result = applyEnemySpecial(current, enemy, special, entry, damageDealt, enemyDefs);
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
  damageDealt: number,
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): ExecutionResult {
  const log: GridCombatLogEntry[] = [];
  let current = state;

  switch (special.type) {
    case "summon": {
      const summonDef = enemyDefs.get(special.enemyId);
      const summonHp = summonDef?.maxHp ?? 12;
      const summonArmor = summonDef?.defaultArmor ?? 0;
      const summonThorns = summonDef?.defaultThorns ?? 0;
      const summonIncorporeal = summonDef?.incorporeal ?? false;

      for (let i = 0; i < special.count; i++) {
        const spawnPos = findNearbyEmptyTile(current, enemy.pos);
        if (spawnPos) {
          const newEnemy: GridEnemyState = {
            id: special.enemyId,
            uid: `${special.enemyId}_${current.turn}_${i}`,
            hp: summonHp,
            maxHp: summonHp,
            pos: spawnPos,
            facing: "south",
            conditions: {},
            armor: summonArmor,
            thorns: summonThorns,
            isBoss: false,
            incorporeal: summonIncorporeal,
            shieldWallActive: false,
            reformTimer: null,
            metamorphosisTimer: null,
            metamorphosisTarget: null,
            resistances: summonDef?.resistances ?? {},
            vulnerabilities: summonDef?.vulnerabilities ?? {},
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
        const raisedDef = enemyDefs.get(corpse.id);
        const raisedMaxHp = raisedDef?.maxHp ?? 12;
        const raisedHp = Math.floor(raisedMaxHp * BALANCE.enemy.necromancerRaiseHpFraction);

        const raisedEnemy: GridEnemyState = {
          id: corpse.id,
          uid: `raised_${corpse.uid}_${current.turn}`,
          hp: raisedHp,
          maxHp: raisedMaxHp,
          pos: corpse.pos,
          facing: "south",
          conditions: {},
          armor: raisedDef?.defaultArmor ?? 0,
          thorns: raisedDef?.defaultThorns ?? 0,
          isBoss: false,
          incorporeal: raisedDef?.incorporeal ?? false,
          shieldWallActive: false,
          reformTimer: null,
          metamorphosisTimer: null,
          metamorphosisTarget: null,
          resistances: raisedDef?.resistances ?? {},
          vulnerabilities: raisedDef?.vulnerabilities ?? {},
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
      const newAp = current.player.ap - special.amount;
      current = { ...current, player: { ...current.player, ap: newAp } };
      log.push({
        turn: current.turn,
        text: `${enemy.id} drains ${special.amount} AP!${newAp < 0 ? " (AP debt carries over!)" : ""}`,
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
      const darkTiles: Array<{ pos: GridPos; dist: number }> = [];
      const occupied = getOccupiedPositions(current.player, current.enemies);
      for (let r = 0; r < current.grid.height; r++) {
        for (let c = 0; c < current.grid.width; c++) {
          const tile = getTile(current.grid, { row: r, col: c });
          if (tile && tile.type === "dark_zone" && !occupied.has(posKey({ row: r, col: c }))) {
            darkTiles.push({
              pos: { row: r, col: c },
              dist: manhattanDistance({ row: r, col: c }, current.player.pos),
            });
          }
        }
      }
      darkTiles.sort((a, b) => b.dist - a.dist);
      if (darkTiles.length > 0) {
        current = updateEnemy(current, enemy.uid, { pos: darkTiles[0].pos });
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
      const healAmount = Math.floor(damageDealt * special.fraction);
      if (healAmount > 0) {
        const updatedEnemy = current.enemies.find((e) => e.uid === enemy.uid);
        if (updatedEnemy) {
          const newHp = Math.min(updatedEnemy.maxHp, updatedEnemy.hp + healAmount);
          current = updateEnemy(current, enemy.uid, { hp: newHp });
          log.push({
            turn: current.turn,
            text: `${enemy.id} drains ${healAmount} life!`,
            source: "enemy",
          });
        }
      }
      break;
    }

    case "teleport_to_rot": {
      const rotTiles: Array<{ pos: GridPos; dist: number }> = [];
      const occupied = getOccupiedPositions(current.player, current.enemies);
      for (let r = 0; r < current.grid.height; r++) {
        for (let c = 0; c < current.grid.width; c++) {
          const tile = getTile(current.grid, { row: r, col: c });
          if (tile && tile.type === "rot" && !occupied.has(posKey({ row: r, col: c }))) {
            rotTiles.push({
              pos: { row: r, col: c },
              dist: manhattanDistance({ row: r, col: c }, current.player.pos),
            });
          }
        }
      }
      rotTiles.sort((a, b) => a.dist - b.dist);
      if (rotTiles.length > 0) {
        current = updateEnemy(current, enemy.uid, { pos: rotTiles[0].pos });
        log.push({
          turn: current.turn,
          text: `${enemy.id} manifests through the rot!`,
          source: "enemy",
        });
      }
      break;
    }

    case "intercept_for_ally": {
      current = applyConditionToEnemy(current, enemy.uid, "intercepting", 1);
      log.push({
        turn: current.turn,
        text: `${enemy.id} braces to intercept attacks on nearby allies!`,
        source: "enemy",
      });
      break;
    }

    case "damage_reduction_mark": {
      current = applyConditionToPlayer(current, "marked", 1);
      log.push({
        turn: current.turn,
        text: `${enemy.id} marks you with damnation — attacks against it deal less damage!`,
        source: "enemy",
      });
      break;
    }

    case "bone_cage": {
      if (entry.targetTile) {
        const ringTiles = getRingTiles(entry.targetTile, 2, current.grid);
        let newGrid = current.grid;
        for (const t of ringTiles) {
          const tile = getTile(newGrid, t);
          if (tile && tile.type === "floor") {
            newGrid = setTile(newGrid, t, makeTerrain("rubble"));
          }
        }
        current = { ...current, grid: newGrid };
        log.push({
          turn: current.turn,
          text: `${enemy.id} traps you in a cage of bone!`,
          source: "enemy",
        });
      }
      break;
    }

    case "command_extra_action": {
      const targetUid = special.targetEnemyUid || entry.targetUid;
      if (targetUid) {
        current = applyConditionToEnemy(current, targetUid, "commanded", 1);
        const target = current.enemies.find((e) => e.uid === targetUid);
        log.push({
          turn: current.turn,
          text: `${enemy.id} commands ${target?.id ?? "an ally"} — empowered next attack!`,
          source: "enemy",
        });
      }
      break;
    }

    case "drop_caltrops": {
      const newGrid = setTile(
        current.grid,
        enemy.pos,
        makeTerrain("hazard", { hazardDamage: 2, turnsRemaining: 2 }),
      );
      current = { ...current, grid: newGrid };
      log.push({
        turn: current.turn,
        text: `${enemy.id} drops caltrops!`,
        source: "enemy",
      });
      break;
    }

    case "dirge_zone": {
      const tiles = getRadiusTiles(enemy.pos, special.radius, current.grid);
      let newGrid = current.grid;
      for (const t of tiles) {
        const tile = getTile(newGrid, t);
        if (tile && tile.type === "floor") {
          newGrid = setTile(
            newGrid,
            t,
            makeTerrain("hazard", {
              hazardDamage: special.damage,
              turnsRemaining: special.turns,
            }),
          );
        }
      }
      current = { ...current, grid: newGrid };

      if (tiles.some((t) => posEqual(t, current.player.pos))) {
        const newAp = current.player.ap - special.apDrain;
        current = { ...current, player: { ...current.player, ap: newAp } };
      }

      log.push({
        turn: current.turn,
        text: `${enemy.id} fills the area with a dirge of death!`,
        source: "enemy",
      });
      break;
    }

    case "retreat_to_dark": {
      const darkTiles: Array<{ pos: GridPos; dist: number }> = [];
      const occupied = getOccupiedPositions(current.player, current.enemies);
      for (let r = 0; r < current.grid.height; r++) {
        for (let c = 0; c < current.grid.width; c++) {
          const tile = getTile(current.grid, { row: r, col: c });
          if (tile && tile.type === "dark_zone" && !occupied.has(posKey({ row: r, col: c }))) {
            darkTiles.push({
              pos: { row: r, col: c },
              dist: manhattanDistance({ row: r, col: c }, current.player.pos),
            });
          }
        }
      }
      darkTiles.sort((a, b) => b.dist - a.dist);
      if (darkTiles.length > 0) {
        current = updateEnemy(current, enemy.uid, { pos: darkTiles[0].pos });
        current = applyConditionToEnemy(current, enemy.uid, "hidden", 1);
        log.push({
          turn: current.turn,
          text: `${enemy.id} retreats into the darkness!`,
          source: "enemy",
        });
      }
      break;
    }

    case "smoke_bomb": {
      const smokeTiles = getRadiusTiles(enemy.pos, special.radius, current.grid);
      let newGrid = current.grid;
      for (const t of smokeTiles) {
        const tile = getTile(newGrid, t);
        if (tile && (tile.type === "floor" || tile.type === "dark_zone")) {
          newGrid = setTile(newGrid, t, makeTerrain("smoke", { turnsRemaining: 2 }));
        }
      }
      current = { ...current, grid: newGrid };
      log.push({
        turn: current.turn,
        text: `${enemy.id} drops a smoke bomb!`,
        source: "enemy",
      });
      break;
    }

    case "pull_toward": {
      const dir = directionFromTo(current.player.pos, enemy.pos);
      if (dir) {
        const occupied = getOccupiedPositions(current.player, current.enemies);
        let newPos = current.player.pos;
        for (let i = 0; i < special.distance; i++) {
          const next = posAdd(newPos, DIR_DELTA[dir]);
          if (isWalkable(current.grid, next) && !occupied.has(posKey(next))) {
            newPos = next;
          } else {
            break;
          }
        }
        if (!posEqual(newPos, current.player.pos)) {
          current = { ...current, player: { ...current.player, pos: newPos } };
          log.push({
            turn: current.turn,
            text: `${enemy.id} pulls you closer!`,
            source: "enemy",
          });
        }
      }
      break;
    }

    case "bone_pillar": {
      if (entry.targetTile) {
        const pillarTile = getTile(current.grid, entry.targetTile);
        if (pillarTile && pillarTile.type === "floor") {
          const newGrid = setTile(current.grid, entry.targetTile, makeTerrain("pillar"));
          current = { ...current, grid: newGrid };

          if (posEqual(current.player.pos, entry.targetTile)) {
            current = {
              ...current,
              player: {
                ...current.player,
                hp: Math.max(0, current.player.hp - special.damage),
              },
            };
            log.push({
              turn: current.turn,
              text: `A bone pillar erupts beneath you for ${special.damage}!`,
              source: "enemy",
            });
          }

          log.push({
            turn: current.turn,
            text: `${enemy.id} raises a bone pillar!`,
            source: "enemy",
          });
        }
      }
      break;
    }

    case "blood_puppet": {
      const missingHp = enemy.maxHp - enemy.hp;
      if (missingHp <= 0) {
        break;
      }

      const weakestEnemy = [...current.enemies]
        .filter((e) => e.hp > 0 && e.uid !== enemy.uid)
        .sort((a, b) => a.hp - b.hp)[0];

      if (weakestEnemy) {
        const puppetHeal = Math.min(missingHp, weakestEnemy.hp);
        current = updateEnemy(current, weakestEnemy.uid, { hp: 0 });
        current = handleEnemyDeath(current, { ...weakestEnemy, hp: 0 }, enemyDefs);
        const updatedBoss = current.enemies.find((e) => e.uid === enemy.uid);
        if (updatedBoss) {
          current = updateEnemy(current, enemy.uid, {
            hp: Math.min(updatedBoss.maxHp, updatedBoss.hp + puppetHeal),
          });
        }
        log.push({
          turn: current.turn,
          text: `${enemy.id} sacrifices ${weakestEnemy.id} to heal ${puppetHeal}!`,
          source: "enemy",
        });
      }
      break;
    }

    case "mist_form": {
      current = applyConditionToEnemy(current, enemy.uid, "hidden", special.turns);
      current = updateEnemy(current, enemy.uid, {
        incorporeal: true,
        armor: enemy.armor + 3,
      });
      log.push({
        turn: current.turn,
        text: `${enemy.id} dissolves into crimson mist!`,
        source: "enemy",
      });
      break;
    }

    case "phylactery_shield": {
      current = updateEnemy(current, enemy.uid, {
        armor: enemy.armor + 10,
      });
      log.push({
        turn: current.turn,
        text: `${enemy.id} channels phylactery energy — massive armor!`,
        source: "enemy",
      });
      break;
    }

    case "mass_raise_all": {
      const raisableCorpses = current.deadEnemyPositions.filter((c) => {
        const def = enemyDefs.get(c.id);
        return !def?.isBoss;
      });
      for (const corpse of raisableCorpses) {
        const raisedDef = enemyDefs.get(corpse.id);
        const raisedMaxHp = raisedDef?.maxHp ?? 12;
        const raisedHp = Math.floor(raisedMaxHp * special.hpFraction);

        const raised: GridEnemyState = {
          id: corpse.id,
          uid: `mass_raised_${corpse.uid}_${current.turn}`,
          hp: raisedHp,
          maxHp: raisedMaxHp,
          pos: corpse.pos,
          facing: "south",
          conditions: {},
          armor: raisedDef?.defaultArmor ?? 0,
          thorns: raisedDef?.defaultThorns ?? 0,
          isBoss: false,
          incorporeal: raisedDef?.incorporeal ?? false,
          shieldWallActive: false,
          reformTimer: null,
          metamorphosisTimer: null,
          metamorphosisTarget: null,
          resistances: raisedDef?.resistances ?? {},
          vulnerabilities: raisedDef?.vulnerabilities ?? {},
        };
        current = { ...current, enemies: [...current.enemies, raised] };
      }
      const raisedUids = new Set(raisableCorpses.map((c) => c.uid));
      current = {
        ...current,
        deadEnemyPositions: current.deadEnemyPositions.filter((c) => !raisedUids.has(c.uid)),
      };
      if (raisableCorpses.length > 0) {
        log.push({
          turn: current.turn,
          text: `${enemy.id} raises ALL dead — ${raisableCorpses.length} corpses rise!`,
          source: "enemy",
        });
      }
      break;
    }

    case "shadow_step": {
      const darkTiles: Array<{ pos: GridPos; dist: number }> = [];
      const occupied = getOccupiedPositions(current.player, current.enemies);
      for (let r = 0; r < current.grid.height; r++) {
        for (let c = 0; c < current.grid.width; c++) {
          const tile = getTile(current.grid, { row: r, col: c });
          if (tile && tile.type === "dark_zone" && !occupied.has(posKey({ row: r, col: c }))) {
            darkTiles.push({
              pos: { row: r, col: c },
              dist: manhattanDistance({ row: r, col: c }, current.player.pos),
            });
          }
        }
      }
      darkTiles.sort((a, b) => a.dist - b.dist);
      if (darkTiles.length > 0) {
        current = updateEnemy(current, enemy.uid, { pos: darkTiles[0].pos });
        log.push({
          turn: current.turn,
          text: `${enemy.id} steps through shadow!`,
          source: "enemy",
        });
      }
      break;
    }

    case "create_terrain_aoe": {
      const candidates: GridPos[] = [];
      for (const dir of DIRECTIONS) {
        const pos = posAdd(enemy.pos, DIR_DELTA[dir]);
        if (inBounds(pos, current.grid.width, current.grid.height)) {
          const tile = getTile(current.grid, pos);
          if (tile && tile.type === "floor") {
            const occ = getOccupiedPositions(current.player, current.enemies);
            if (!occ.has(posKey(pos))) {
              candidates.push(pos);
            }
          }
        }
      }

      candidates.sort(
        (a, b) =>
          manhattanDistance(a, current.player.pos) - manhattanDistance(b, current.player.pos),
      );

      const count = Math.min(special.count, candidates.length);
      for (let i = 0; i < count; i++) {
        const picked = candidates[i];
        const newGrid = setTile(
          current.grid,
          picked,
          makeTerrain(special.terrain, {
            hazardDamage: special.terrain === "rot" ? BALANCE.enemy.sacrariumRotDamage : undefined,
          }),
        );
        current = { ...current, grid: newGrid };
      }
      if (count > 0) {
        log.push({
          turn: current.turn,
          text: `${enemy.id} spreads corruption — ${count} tile${count > 1 ? "s" : ""} rot!`,
          source: "enemy",
        });
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
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): ExecutionResult {
  if (enemy.metamorphosisTimer === null) {
    return { state, log: [] };
  }

  const remaining = enemy.metamorphosisTimer - 1;

  if (remaining <= 0 && enemy.metamorphosisTarget) {
    const targetDef = enemyDefs.get(enemy.metamorphosisTarget);
    const targetHp = targetDef?.maxHp ?? 12;
    const transformed: GridEnemyState = {
      ...enemy,
      id: enemy.metamorphosisTarget,
      hp: targetHp,
      maxHp: targetHp,
      armor: targetDef?.defaultArmor ?? enemy.armor,
      thorns: targetDef?.defaultThorns ?? enemy.thorns,
      incorporeal: targetDef?.incorporeal ?? enemy.incorporeal,
      resistances: targetDef?.resistances ?? enemy.resistances,
      vulnerabilities: targetDef?.vulnerabilities ?? enemy.vulnerabilities,
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
