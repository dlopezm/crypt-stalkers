import type { DamageType } from "../../types";
import { getCard } from "../cards";
import { HELPLESS_MULT } from "../constants";
import type {
  CardCombatEnemy,
  CardCombatLogEntry,
  CardCombatPlayer,
  CardCombatState,
  CardConditionApply,
  CardSpecial,
} from "../types";
import { adjustEnemyDistance, clampDistance, inReach } from "./distance";
import { isHelpless } from "./helpless";
import { drawCards, moveCardToDiscard } from "./deck";

interface PlayResult {
  readonly state: CardCombatState;
  readonly log: readonly CardCombatLogEntry[];
  readonly ok: boolean;
  readonly reason?: string;
}

export function canPlayCard(
  state: CardCombatState,
  cardId: string,
  targetUid: string | null,
): { ok: boolean; reason?: string } {
  const { player, enemies } = state;
  const card = getCard(cardId);
  if (!card) return { ok: false, reason: "Unknown card." };
  if (!player.hand.includes(cardId)) return { ok: false, reason: "Card not in hand." };

  const cursedCost = (player.conditions.cursed ?? 0) > 0 ? card.stamina + 1 : card.stamina;
  if (player.stamina < cursedCost) return { ok: false, reason: "Not enough stamina." };

  if ((player.conditions.silenced ?? 0) > 0 && card.stamina >= 2) {
    return { ok: false, reason: "Silenced." };
  }

  const saltRite = card.special.find((s) => s.type === "salt_rite");
  if (saltRite && saltRite.type === "salt_rite" && player.salt < saltRite.saltCost) {
    return { ok: false, reason: "Not enough Salt." };
  }

  if (card.targetKind === "enemy") {
    if (!targetUid) return { ok: false, reason: "Requires a target." };
    const target = enemies.find((e) => e.uid === targetUid);
    if (!target) return { ok: false, reason: "Target gone." };
    if (card.reach === "self") return { ok: false, reason: "Self-only card." };
    if (!inReach(card.reach, target.distance)) return { ok: false, reason: "Out of reach." };

    if (card.special.some((s) => s.type === "requires_helpless") && !isHelpless(target)) {
      return { ok: false, reason: "Target must be Helpless." };
    }
  }

  return { ok: true };
}

function applyDamageToEnemy(
  enemy: CardCombatEnemy,
  rawDamage: number,
  damageType: DamageType | null,
): { enemy: CardCombatEnemy; dealt: number } {
  if (rawDamage <= 0) return { enemy, dealt: 0 };

  let dmg = rawDamage;
  if (damageType) {
    const resist = enemy.resistances[damageType];
    if (resist != null) dmg = Math.floor(dmg * resist);
    const vuln = enemy.vulnerabilities[damageType];
    if (vuln != null) dmg = Math.floor(dmg * vuln);
  }
  if (isHelpless(enemy)) {
    dmg = Math.floor(dmg * HELPLESS_MULT);
  }
  const postArmor = Math.max(0, dmg - enemy.armor);
  const hp = Math.max(0, enemy.hp - postArmor);
  return { enemy: { ...enemy, hp }, dealt: postArmor };
}

function applyConditionsToEnemy(
  enemy: CardCombatEnemy,
  conditions: readonly CardConditionApply[],
): CardCombatEnemy {
  const next = { ...enemy.conditions };
  for (const a of conditions) {
    if (a.target !== "enemy") continue;
    next[a.condition] = (next[a.condition] ?? 0) + a.stacks;
  }
  return { ...enemy, conditions: next };
}

function applyConditionsToPlayer(
  player: CardCombatPlayer,
  conditions: readonly CardConditionApply[],
): CardCombatPlayer {
  const next = { ...player.conditions };
  for (const a of conditions) {
    if (a.target !== "self") continue;
    next[a.condition] = (next[a.condition] ?? 0) + a.stacks;
  }
  return { ...player, conditions: next };
}

export function playCard(
  state: CardCombatState,
  cardId: string,
  targetUid: string | null,
): PlayResult {
  const check = canPlayCard(state, cardId, targetUid);
  if (!check.ok) {
    return {
      state,
      log: [{ turn: state.turn, text: check.reason ?? "Cannot play.", source: "system" }],
      ok: false,
      reason: check.reason,
    };
  }

  const card = getCard(cardId)!;
  const log: CardCombatLogEntry[] = [];
  let current = state;
  let player = current.player;
  let enemies = current.enemies.slice();

  const cursedCost = (player.conditions.cursed ?? 0) > 0 ? card.stamina + 1 : card.stamina;
  const saltRite = card.special.find(
    (s): s is Extract<CardSpecial, { type: "salt_rite" }> => s.type === "salt_rite",
  );
  player = {
    ...player,
    stamina: player.stamina - cursedCost,
    salt: player.salt - (saltRite?.saltCost ?? 0),
  };

  player = moveCardToDiscard(player, cardId);

  // Determine primary target
  const primary = targetUid ? (enemies.find((e) => e.uid === targetUid) ?? null) : null;

  // AoE hits nearest others within distance 1 of primary
  const aoe = card.special.some((s) => s.type === "aoe_adjacent_distance");
  const targets: CardCombatEnemy[] = [];
  if (primary) targets.push(primary);
  if (aoe) {
    for (const e of enemies) {
      if (!primary && Math.abs(e.distance - 0) <= 1) {
        targets.push(e);
      } else if (primary && e.uid !== primary.uid && Math.abs(e.distance - primary.distance) <= 1) {
        targets.push(e);
      }
    }
  }

  // Damage + conditions
  for (const t of targets) {
    const idx = enemies.findIndex((e) => e.uid === t.uid);
    if (idx < 0) continue;
    let updated = enemies[idx];
    const dmgRes = applyDamageToEnemy(updated, card.damage, card.damageType);
    updated = dmgRes.enemy;
    if (card.conditions.length > 0) {
      updated = applyConditionsToEnemy(updated, card.conditions);
    }
    enemies[idx] = updated;
    if (card.damage > 0) {
      log.push({
        turn: state.turn,
        text: `${updated.name}: -${dmgRes.dealt} HP`,
        source: "player",
      });
    }
  }

  // Self-targeted conditions
  if (card.conditions.some((c) => c.target === "self")) {
    player = applyConditionsToPlayer(player, card.conditions);
  }

  // Apply specials
  for (const s of card.special) {
    switch (s.type) {
      case "heal":
        player = { ...player, hp: Math.min(player.maxHp, player.hp + s.amount) };
        log.push({ turn: state.turn, text: `+${s.amount} HP`, source: "player" });
        break;
      case "cleanse_conditions":
        player = { ...player, conditions: {} };
        log.push({ turn: state.turn, text: `Cleansed.`, source: "player" });
        break;
      case "armor_this_turn":
        player = { ...player, armorThisTurn: player.armorThisTurn + s.amount };
        break;
      case "damage_reduction":
        player = { ...player, armorThisTurn: player.armorThisTurn + s.amount };
        break;
      case "negate_hit":
        player = { ...player, reactions: { ...player.reactions, negateNextHit: true } };
        break;
      case "riposte":
        player = {
          ...player,
          reactions: {
            ...player.reactions,
            ripostePending: Math.max(player.reactions.ripostePending, s.damage),
          },
        };
        break;
      case "overwatch":
        player = {
          ...player,
          reactions: {
            ...player.reactions,
            overwatch: { damage: s.damage, triggerBelowDistance: s.triggerBelowDistance },
          },
        };
        break;
      case "close_distance":
        if (primary) {
          const idx = enemies.findIndex((e) => e.uid === primary.uid);
          if (idx >= 0) enemies[idx] = adjustEnemyDistance(enemies[idx], -s.amount);
        }
        break;
      case "retreat":
        if (primary) {
          const idx = enemies.findIndex((e) => e.uid === primary.uid);
          if (idx >= 0) enemies[idx] = adjustEnemyDistance(enemies[idx], s.amount);
        }
        break;
      case "push_enemy":
        if (primary) {
          const idx = enemies.findIndex((e) => e.uid === primary.uid);
          if (idx >= 0) enemies[idx] = adjustEnemyDistance(enemies[idx], s.amount);
        }
        break;
      case "draw_cards":
        current = drawCards({ ...current, player, enemies }, s.amount);
        player = current.player;
        enemies = current.enemies.slice();
        break;
      case "hide_self": {
        const cur = player.conditions.hidden ?? 0;
        player = { ...player, conditions: { ...player.conditions, hidden: cur + s.stacks } };
        break;
      }
      case "consume_corpse": {
        if (current.corpses.length > 0) {
          current = {
            ...current,
            corpses: current.corpses.slice(0, current.corpses.length - 1),
          };
          log.push({ turn: state.turn, text: `Corpse consumed.`, source: "player" });
        }
        break;
      }
      case "disarm_telegraph":
        if (primary) {
          const idx = enemies.findIndex((e) => e.uid === primary.uid);
          if (idx >= 0) {
            const adv =
              (enemies[idx].telegraphIndex + 1) % Math.max(1, enemies[idx].intents.length);
            enemies[idx] = { ...enemies[idx], telegraphIndex: adv };
            log.push({
              turn: state.turn,
              text: `${primary.name}'s telegraph cancelled.`,
              source: "player",
            });
          }
        }
        break;
      case "gain_salt":
        player = { ...player, salt: Math.min(9, player.salt + s.amount) };
        break;
      case "end_turn_draw_next_turn":
        player = {
          ...player,
          holdBreathUsed: true,
          stamina: Math.min(player.maxStamina, player.stamina + s.bonusStamina),
        };
        break;
      case "requires_helpless":
      case "requires_hidden_self":
      case "aoe_adjacent_distance":
      case "salt_rite":
        // Already consumed above or in canPlayCard.
        break;
    }
  }

  // Remove dead enemies into corpses
  const corpses = current.corpses.slice();
  const alive: CardCombatEnemy[] = [];
  for (const e of enemies) {
    if (e.hp <= 0) {
      corpses.push({ enemyId: e.id, distance: clampDistance(e.distance), ageTurns: 0 });
      log.push({ turn: state.turn, text: `${e.name} falls.`, source: "player" });
    } else {
      alive.push(e);
    }
  }

  const nextState: CardCombatState = {
    ...current,
    player,
    enemies: alive,
    corpses,
    log: [...current.log, ...log],
  };

  return { state: nextState, log, ok: true };
}

export function clampDistanceExported(n: number): number {
  return clampDistance(n);
}
