import { makeEnemy } from "../utils/helpers";
import { ENEMY_TYPES } from "../data/enemies";
import { STATUS_ICONS } from "../data/status";
import { LIGHT_MAX } from "../data/constants";
import type { Action, Enemy, CombatPlayer, DamageType, AnimationEvent } from "../types";

export interface ResolveResult {
  player: CombatPlayer;
  enemies: Enemy[];
  lightLevel: number;
  log: string[];
  endTurn: boolean;
  flee: boolean;
  anim: AnimationEvent[];
}

/**
 * Pure function: resolves an Action[] against combat state.
 * Returns a new state snapshot — does NOT mutate inputs.
 */
export function resolveActions(
  actions: Action[],
  player: CombatPlayer,
  enemies: Enemy[],
  lightLevel: number,
  log: string[],
): ResolveResult {
  // Deep-clone mutable state so we don't touch the caller's objects
  const p = { ...player, statuses: { ...(player.statuses || {}) } };
  const enems = enemies.map((e) => ({ ...e, statuses: { ...(e.statuses || {}) } }));
  const lines = [...log];
  const anim: AnimationEvent[] = [];
  let light = lightLevel;
  let endTurn = false;
  let flee = false;

  function findEnemy(uid: string): Enemy | undefined {
    return enems.find((e) => e.uid === uid);
  }

  function applyResistances(amount: number, damageType: DamageType, target: Enemy): number {
    const type = ENEMY_TYPES.find((t) => t.id === target.id);
    if (!type) return amount;
    const resist = type.resistances?.[damageType];
    if (resist !== undefined) amount = Math.floor(amount * resist);
    const vuln = type.vulnerabilities?.[damageType];
    if (vuln !== undefined) amount = Math.floor(amount * vuln);
    return amount;
  }

  function processDeath(target: Enemy) {
    if (target.hp > 0) return;
    anim.push({ type: "death", uid: target.uid });
    const mechanics = target.combatMechanics;
    if (!mechanics?.onDeath) return;
    const ctx = { enemies: enems, player: p, lightLevel: { value: light } };
    const deathActions = mechanics.onDeath(target, ctx, { damageType: lastDamageType });
    if (deathActions.length) processActions(deathActions);
  }

  // Track last damageType for onDeath callbacks
  let lastDamageType: DamageType = "bludgeoning";

  function processActions(acts: Action[]) {
    for (const action of acts) {
      switch (action.type) {
        case "damage_enemy": {
          const t = findEnemy(action.targetUid);
          if (!t || t.hp <= 0) break;

          let dmg = applyResistances(action.amount, action.damageType, t);
          lastDamageType = action.damageType;

          // Call onReceiveHit mechanic
          const mechanics = t.combatMechanics;
          if (mechanics?.onReceiveHit) {
            const ctx = { enemies: enems, player: p, lightLevel: { value: light } };
            const response = mechanics.onReceiveHit(t, ctx, {
              damage: dmg,
              damageType: action.damageType,
              holy: !!action.holy,
            });
            if (response.evade) {
              lines.push(`\u{1F47B} ${t.name} phases through the attack!`);
              anim.push({ type: "phase", targetUid: t.uid });
              break;
            }
            if (response.damageMultiplier !== undefined) {
              dmg = Math.floor(dmg * response.damageMultiplier);
            }
          }

          // Apply block (unless pierceArmor)
          if (!action.pierceArmor) {
            const bl = Math.min(t.block, dmg);
            t.block = Math.max(0, t.block - bl);
            const dealt = dmg - bl;
            t.hp -= dealt;
            lines.push(`\u2694 ${dealt} dmg\u2192${t.name}${bl > 0 ? ` (${bl} blocked)` : ""}`);
            anim.push({ type: "damage_enemy", targetUid: t.uid, amount: dealt });
            if (bl > 0) anim.push({ type: "block", targetUid: t.uid, amount: bl });
          } else {
            t.hp -= dmg;
            lines.push(`\u2694 ${dmg} dmg\u2192${t.name} (armor pierced)`);
            anim.push({ type: "damage_enemy", targetUid: t.uid, amount: dmg });
          }

          processDeath(t);
          break;
        }

        case "damage_player": {
          let dmg = action.amount;
          // Apply blockReduction (Shield Block) first
          if (p.blockReduction && p.blockReduction > 0) {
            dmg = Math.floor(dmg * (1 - p.blockReduction));
            p.blockReduction = undefined;
          }
          const bl = Math.min(p.block, dmg);
          p.block = Math.max(0, p.block - bl);
          const dealt = dmg - bl;
          p.hp -= dealt;
          anim.push({ type: "damage_player", amount: dealt });
          if (bl > 0) anim.push({ type: "block", targetUid: "player", amount: bl });
          if (dealt >= 8) anim.push({ type: "screen_shake" });
          break;
        }

        case "apply_status_enemy": {
          const t = findEnemy(action.targetUid);
          if (!t || t.hp <= 0) break;
          t.statuses[action.status] = (t.statuses[action.status] || 0) + action.stacks;
          lines.push(
            `${STATUS_ICONS[action.status]} ${t.name} ${action.status}\u00D7${action.stacks}`,
          );
          anim.push({ type: "status_apply", targetUid: t.uid, status: action.status });
          break;
        }

        case "apply_status_player": {
          p.statuses[action.status] = (p.statuses[action.status] || 0) + action.stacks;
          anim.push({ type: "status_apply", targetUid: "player", status: action.status });
          break;
        }

        case "heal_player": {
          p.hp = Math.min(p.maxHp, p.hp + action.amount);
          anim.push({ type: "heal_player", amount: action.amount });
          break;
        }

        case "heal_enemy": {
          const t = findEnemy(action.targetUid);
          if (!t || t.hp <= 0) break;
          t.hp = Math.min(t.maxHp, t.hp + action.amount);
          anim.push({ type: "heal_enemy", targetUid: t.uid, amount: action.amount });
          break;
        }

        case "push_row": {
          const t = findEnemy(action.targetUid);
          if (!t || t.hp <= 0) break;
          t.row = action.to;
          anim.push({ type: "row_change", uid: t.uid, to: action.to });
          break;
        }

        case "spawn": {
          const e = makeEnemy(action.enemyId);
          if (action.row) e.row = action.row;
          if (action.reassembled) e.reassembled = true;
          if (action.summonCooldown !== undefined) e.summonCooldown = action.summonCooldown;
          enems.push(e);
          anim.push({
            type: "spawn",
            uid: e.uid,
            enemyId: action.enemyId,
            flipReveal: !action.reassembled,
          });
          break;
        }

        case "drain_light": {
          light = Math.max(0, light - action.amount);
          lines.push(light === 0 ? "\u{1F311} Total darkness!" : "\u{1F311} Light fades.");
          anim.push({ type: "drain_light", amount: action.amount });
          break;
        }

        case "set_block_reduction": {
          p.blockReduction = action.fraction;
          break;
        }

        case "set_stealth": {
          p.stealthActive = action.active;
          break;
        }

        case "set_counter": {
          p.counterActive = action.active;
          break;
        }

        case "add_block_player": {
          p.block += action.amount;
          break;
        }

        case "set_cooldown": {
          p.abilityCooldowns = { ...p.abilityCooldowns };
          p.abilityCooldowns[action.abilityId] = action.turns;
          break;
        }

        case "tick_cooldowns": {
          const cds = { ...p.abilityCooldowns };
          for (const key of Object.keys(cds)) {
            cds[key] = Math.max(0, cds[key] - 1);
          }
          p.abilityCooldowns = cds;
          break;
        }

        case "begin_charge": {
          p.chargingAbility = action.abilityId;
          p.chargingTurnsLeft = action.turnsLeft;
          p.chargingTargetUid = action.targetUid;
          break;
        }

        case "resolve_charge": {
          p.chargingAbility = undefined;
          p.chargingTurnsLeft = undefined;
          p.chargingTargetUid = undefined;
          break;
        }

        case "consume_item": {
          p.consumables = p.consumables.filter((_, i) => i !== action.itemIndex);
          break;
        }

        case "restore_light": {
          light = Math.min(LIGHT_MAX, light + action.amount);
          break;
        }

        case "cleanse_player": {
          p.statuses = {};
          break;
        }

        case "end_turn": {
          endTurn = true;
          break;
        }

        case "skip_end_turn": {
          endTurn = false;
          break;
        }

        case "flee": {
          flee = true;
          break;
        }

        case "log": {
          lines.push(action.message);
          break;
        }

        case "skip_attack":
          break;
      }
    }
  }

  processActions(actions);

  return { player: p, enemies: enems, lightLevel: light, log: lines, endTurn, flee, anim };
}
