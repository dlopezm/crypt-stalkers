import type { DamageType } from "../../types";
import { getEnemyCard } from "../enemy-cards";
import { getEnemyDef } from "../enemies";
import type {
  CardCombatEnemy,
  CardCombatLogEntry,
  CardCombatPlayer,
  CardCombatState,
  CardConditionApply,
} from "../types";
import { adjustEnemyDistance, clampDistance } from "./distance";

function applyDamageToPlayer(
  player: CardCombatPlayer,
  rawDamage: number,
  _damageType: DamageType | null,
): { player: CardCombatPlayer; dealt: number; negated: boolean } {
  if (rawDamage <= 0) return { player, dealt: 0, negated: false };

  if (player.reactions.negateNextHit) {
    return {
      player: { ...player, reactions: { ...player.reactions, negateNextHit: false } },
      dealt: 0,
      negated: true,
    };
  }

  const totalArmor = player.armor + player.armorThisTurn;
  const postArmor = Math.max(0, rawDamage - totalArmor);
  const hp = Math.max(0, player.hp - postArmor);
  return { player: { ...player, hp }, dealt: postArmor, negated: false };
}

function applyConditionsToPlayer(
  player: CardCombatPlayer,
  conditions: readonly CardConditionApply[],
): CardCombatPlayer {
  const next = { ...player.conditions };
  for (const a of conditions) {
    // Enemy cards: treat "enemy" target (from their POV) as applying to player
    next[a.condition] = (next[a.condition] ?? 0) + a.stacks;
  }
  return { ...player, conditions: next };
}

export function resolveEnemyIntent(
  state: CardCombatState,
  enemyUid: string,
): { state: CardCombatState; log: readonly CardCombatLogEntry[] } {
  const idx = state.enemies.findIndex((e) => e.uid === enemyUid);
  if (idx < 0) return { state, log: [] };

  const enemy = state.enemies[idx];
  const intent = enemy.intents[enemy.telegraphIndex];
  if (!intent) return { state, log: [] };

  const ecard = getEnemyCard(intent.abilityId);
  if (!ecard) return { state, log: [] };

  const log: CardCombatLogEntry[] = [];
  let enemies = state.enemies.slice();
  let player = state.player;
  let corpses = state.corpses;

  // Hidden player skips enemy attacks
  const hidden = (player.conditions.hidden ?? 0) > 0;

  // Move self first
  if (ecard.selfMove !== 0) {
    enemies[idx] = adjustEnemyDistance(enemies[idx], ecard.selfMove);
    log.push({
      turn: state.turn,
      text: `${enemy.name}: ${intent.label}`,
      source: "enemy",
    });
  }

  const inRange =
    enemies[idx].distance >= ecard.reach.min && enemies[idx].distance <= ecard.reach.max;

  if (ecard.kind === "attack") {
    if (hidden) {
      log.push({
        turn: state.turn,
        text: `${enemy.name}'s attack misses — you are Hidden.`,
        source: "enemy",
      });
      // Break hidden after dodging
      const cur = (player.conditions.hidden ?? 0) - 1;
      const cond = { ...player.conditions };
      if (cur <= 0) delete cond.hidden;
      else cond.hidden = cur;
      player = { ...player, conditions: cond };
    } else if (!inRange) {
      log.push({
        turn: state.turn,
        text: `${enemy.name} is out of range.`,
        source: "enemy",
      });
    } else {
      // Riposte if in melee
      if (enemies[idx].distance === 0 && player.reactions.ripostePending > 0) {
        const dmg = player.reactions.ripostePending;
        const newHp = Math.max(0, enemies[idx].hp - dmg);
        enemies[idx] = { ...enemies[idx], hp: newHp };
        log.push({
          turn: state.turn,
          text: `Riposte! ${enemies[idx].name} takes ${dmg}.`,
          source: "player",
        });
        player = { ...player, reactions: { ...player.reactions, ripostePending: 0 } };
      }

      if (enemies[idx].hp > 0) {
        const dmgRes = applyDamageToPlayer(player, ecard.damage, ecard.damageType);
        player = dmgRes.player;
        if (dmgRes.negated) {
          log.push({
            turn: state.turn,
            text: `${enemy.name}'s ${intent.label} negated.`,
            source: "enemy",
          });
        } else {
          log.push({
            turn: state.turn,
            text: `${enemy.name}'s ${intent.label}: -${dmgRes.dealt} HP`,
            source: "enemy",
          });
        }
        if (ecard.conditions.length > 0 && !dmgRes.negated) {
          player = applyConditionsToPlayer(player, ecard.conditions);
        }
        // Lifesteal
        const ls = enemies[idx].passives.find((p) => p.key === "lifesteal");
        if (ls && dmgRes.dealt > 0) {
          const heal = ls.value ?? 2;
          enemies[idx] = {
            ...enemies[idx],
            hp: Math.min(enemies[idx].maxHp, enemies[idx].hp + heal),
          };
          log.push({
            turn: state.turn,
            text: `${enemies[idx].name} drains ${heal} HP.`,
            source: "enemy",
          });
        }
      }
    }
  } else if (ecard.kind === "summon") {
    // Raise most recent corpse as a Zombie-equivalent (if defined)
    if (corpses.length > 0) {
      const freshest = corpses[corpses.length - 1];
      const raisedDef = getEnemyDef("zombie") ?? getEnemyDef(freshest.enemyId);
      if (raisedDef) {
        const raised: CardCombatEnemy = {
          uid: `raised_${state.turn}_${Math.random().toString(36).slice(2, 6)}`,
          id: raisedDef.id,
          name: `Risen ${raisedDef.name}`,
          icon: raisedDef.icon,
          hp: raisedDef.maxHp,
          maxHp: raisedDef.maxHp,
          distance: freshest.distance,
          conditions: {},
          armor: raisedDef.armor,
          resistances: raisedDef.resistances,
          vulnerabilities: raisedDef.vulnerabilities,
          passives: raisedDef.passives,
          intents: raisedDef.intents,
          telegraphIndex: 0,
          isBoss: false,
        };
        enemies = [...enemies, raised];
        corpses = corpses.slice(0, corpses.length - 1);
        log.push({
          turn: state.turn,
          text: `${enemy.name} raises ${raised.name}!`,
          source: "enemy",
        });
      }
    } else {
      log.push({
        turn: state.turn,
        text: `${enemy.name}: ${intent.label} (no corpse).`,
        source: "enemy",
      });
    }
  } else if (ecard.kind === "buff") {
    enemies[idx] = { ...enemies[idx], armor: enemies[idx].armor + 2 };
    log.push({
      turn: state.turn,
      text: `${enemy.name} hardens (+2 armor).`,
      source: "enemy",
    });
  } else if (ecard.kind === "move_close" || ecard.kind === "move_retreat") {
    // already handled above via selfMove
    if (ecard.selfMove === 0) {
      log.push({ turn: state.turn, text: `${enemy.name}: ${intent.label}`, source: "enemy" });
    }
  } else {
    log.push({ turn: state.turn, text: `${enemy.name}: ${intent.label}`, source: "enemy" });
  }

  // Check Overwatch trigger on close
  if (ecard.selfMove < 0 && player.reactions.overwatch) {
    const ow = player.reactions.overwatch;
    if (enemies[idx].distance < ow.triggerBelowDistance) {
      const newHp = Math.max(0, enemies[idx].hp - ow.damage);
      enemies[idx] = { ...enemies[idx], hp: newHp };
      log.push({
        turn: state.turn,
        text: `Overwatch! ${enemies[idx].name} takes ${ow.damage}.`,
        source: "player",
      });
      player = { ...player, reactions: { ...player.reactions, overwatch: null } };
    }
  }

  // Advance telegraph
  const telegraphIndex =
    (enemies[idx].telegraphIndex + 1) % Math.max(1, enemies[idx].intents.length);
  enemies[idx] = { ...enemies[idx], telegraphIndex };

  // Ensure distance clamp
  enemies[idx] = { ...enemies[idx], distance: clampDistance(enemies[idx].distance) };

  // Remove dead enemies
  const aliveEnemies: CardCombatEnemy[] = [];
  const newCorpses = corpses.slice();
  for (const e of enemies) {
    if (e.hp <= 0) {
      newCorpses.push({ enemyId: e.id, distance: e.distance, ageTurns: 0 });
      log.push({ turn: state.turn, text: `${e.name} falls.`, source: "player" });
    } else {
      aliveEnemies.push(e);
    }
  }

  return {
    state: {
      ...state,
      player,
      enemies: aliveEnemies,
      corpses: newCorpses,
      log: [...state.log, ...log],
    },
    log,
  };
}
