/* ═══════════════════════════════════════════════════════════════════════════
   Line Combat — Enemy Telegraph Resolution
   Executes enemy telegraphs in speed-tier order.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { LineCombatState, LineTelegraph, LineEnemyState, LineAbilitySpecial } from "../types";
import { applyPushEntity, applySwitch, getEntityAtSlot } from "./positioning";
import { killEnemy } from "./execute-player";
import { LINE_BALANCE } from "../balance";
import { makeLineEnemy } from "../enemy-defs";

const SPEED_ORDER = ["very_fast", "fast", "medium", "slow"] as const;

export function executeAllTelegraphs(state: LineCombatState): LineCombatState {
  // Sort telegraphs by owner speed tier
  const orderedTelegraphs = [...state.telegraphs].sort((a, b) => {
    const ea = state.enemies.find((e) => e.uid === a.ownerUid);
    const eb = state.enemies.find((e) => e.uid === b.ownerUid);
    const ta = ea ? SPEED_ORDER.indexOf(ea.speedTier) : 99;
    const tb = eb ? SPEED_ORDER.indexOf(eb.speedTier) : 99;
    return ta - tb;
  });

  for (const tel of orderedTelegraphs) {
    state = executeSingleTelegraph(state, tel);
    // Check defeat mid-resolution
    if (state.player.hp <= 0) return { ...state, phase: "defeat" };
  }

  return { ...state, phase: "end_of_turn" };
}

function executeSingleTelegraph(state: LineCombatState, tel: LineTelegraph): LineCombatState {
  const enemy = state.enemies.find((e) => e.uid === tel.ownerUid);
  if (!enemy || enemy.hp <= 0) return state;

  // Handle self-reposition (move action)
  if (tel.abilityId === "move" || tel.abilityId === "retreat") {
    return enemyMove(state, enemy, tel);
  }

  state = { ...state, log: [...state.log, `${enemy.id} uses ${tel.label}`] };

  // Handle special-only abilities
  for (const sp of tel.special) {
    state = applyEnemySpecial(state, sp, enemy, tel);
  }

  // Apply damage to affected slots
  for (const slot of tel.affectedSlots) {
    const occupant = getEntityAtSlot(state, slot);
    if (!occupant) continue;

    if (occupant.kind === "player") {
      // Hit player
      if (state.player.mistFormTurns > 0) continue; // invulnerable

      let damage = tel.damage;
      // Incorporeal reduction
      if (enemy.passives.some((p) => p.type === "incorporeal_resistance")) {
        // Incorporeal enemies do full damage; it's their defense not offense
      }
      // Dark empowered bonus
      const darkEmpowered = enemy.passives.find((p) => p.type === "dark_empowered");
      if (darkEmpowered && enemy.darkZoneBonus) {
        damage += darkEmpowered.bonusDamage;
      }
      // Ambush predator bonus (if hidden last turn)
      const ambush = enemy.passives.find((p) => p.type === "ambush_predator");
      if (ambush && (enemy.conditions.hidden ?? 0) > 0) {
        damage += ambush.bonusDamage;
      }

      // Player defense
      const armor = state.player.armor;
      const actual = Math.max(0, damage - armor);

      if (state.player.negateNextHit && actual > 0) {
        state = {
          ...state,
          player: { ...state.player, negateNextHit: false },
          log: [...state.log, `🛡️ Hit negated!`],
        };
        continue;
      }

      state = {
        ...state,
        player: {
          ...state.player,
          hp: Math.max(0, state.player.hp - actual),
        },
        log: [...state.log, `${enemy.id} deals ${actual} damage to player`],
      };

      // Apply conditions to player
      for (const cond of tel.conditions) {
        state = {
          ...state,
          player: {
            ...state.player,
            conditions: {
              ...state.player.conditions,
              [cond.condition]: (state.player.conditions[cond.condition] ?? 0) + cond.stacks,
            },
          },
        };
      }

      // Player riposte reaction
      if (state.player.ripostePending && Math.abs(enemy.position - state.player.position) <= 1) {
        const riposteDamage = LINE_BALANCE.combat.riposteDamage ?? 5;
        state = applyDamageToEnemy(state, enemy.uid, riposteDamage);
        state = {
          ...state,
          player: { ...state.player, ripostePending: false },
          log: [...state.log, `⚔️ Riposte!`],
        };
      }

      // Player overwatch reaction (ranged)
      if (state.player.overwatchActive) {
        const dist = Math.abs(enemy.position - state.player.position);
        if (dist >= 2 && dist <= 4) {
          state = applyDamageToEnemy(
            state,
            enemy.uid,
            LINE_BALANCE.combat.overwatchDefaultDamage ?? 5,
          );
          state = {
            ...state,
            player: { ...state.player, overwatchActive: false },
            log: [...state.log, `🎯 Overwatch fires!`],
          };
        }
      }
    }
  }

  // Enemy reposition effects
  if (tel.reposition) {
    const r = tel.reposition;
    const dir = state.player.position > enemy.position ? (1 as 1 | -1) : (-1 as 1 | -1);

    switch (r.type) {
      case "push_target":
        state = applyPushEntity(state, state.player.position, -dir as 1 | -1, r.distance);
        break;
      case "pull_target":
        state = applyPushEntity(state, state.player.position, dir, r.distance);
        break;
      case "push_self":
        state = applyPushEntity(state, enemy.position, dir, r.distance);
        break;
      case "pull_self":
        state = applyPushEntity(state, enemy.position, -dir as 1 | -1, r.distance);
        break;
      case "switch":
        state = applySwitch(state, enemy.position, state.player.position);
        break;
      case "push_all_in_range":
        // Push all entities (incl. player) outward from enemy
        for (const slot of tel.affectedSlots) {
          const occ = getEntityAtSlot(state, slot);
          if (occ) {
            const outDir = slot >= enemy.position ? (1 as 1 | -1) : (-1 as 1 | -1);
            const pos =
              occ.kind === "player"
                ? state.player.position
                : state.enemies.find((e) => e.uid === (occ as { kind: "enemy"; uid: string }).uid)!
                    .position;
            state = applyPushEntity(state, pos, outDir, r.distance);
          }
        }
        break;
    }
  }

  // Immobilize both (zombie grab)
  const immobilizesBoth = tel.special.some((s) => s.type === "immobilize_both");
  if (immobilizesBoth) {
    state = {
      ...state,
      enemies: state.enemies.map((e) =>
        e.uid === tel.ownerUid ? { ...e, conditions: { ...e.conditions, immobilized: 2 } } : e,
      ),
    };
  }

  return state;
}

function enemyMove(
  state: LineCombatState,
  enemy: LineEnemyState,
  tel: LineTelegraph,
): LineCombatState {
  if ((enemy.conditions.stunned ?? 0) > 0) return state;
  if ((enemy.conditions.immobilized ?? 0) > 0) return state;

  const targetSlot = tel.selfRepositionSlot;
  if (targetSlot === null) return state;

  // Check slot not occupied
  const occupant = getEntityAtSlot(state, targetSlot);
  if (occupant) return state; // blocked

  return {
    ...state,
    enemies: state.enemies.map((e) => (e.uid === enemy.uid ? { ...e, position: targetSlot } : e)),
  };
}

function applyEnemySpecial(
  state: LineCombatState,
  special: LineAbilitySpecial,
  enemy: LineEnemyState,
  tel: LineTelegraph,
): LineCombatState {
  switch (special.type) {
    case "drain_ap":
      return {
        ...state,
        player: { ...state.player, ap: Math.max(0, state.player.ap - special.amount) },
        log: [...state.log, `💧 AP drained by ${special.amount}`],
      };

    case "steal_salt": {
      const stolen = Math.min(state.player.salt, special.amount);
      return {
        ...state,
        player: { ...state.player, salt: state.player.salt - stolen },
        log: [...state.log, `💰 ${enemy.id} steals ${stolen} salt!`],
      };
    }

    case "summon": {
      const slotTarget = Math.max(
        0,
        Math.min(state.lineLength - 1, enemy.position + special.atSlotOffset),
      );
      const existing = getEntityAtSlot(state, slotTarget);
      if (existing) return state;
      const summon = makeLineEnemy(special.enemyId, slotTarget);
      return {
        ...state,
        enemies: [...state.enemies, summon],
        log: [...state.log, `${special.enemyId} summoned`],
      };
    }

    case "raise_dead": {
      if (state.corpses.length === 0) return state;
      const corpse = state.corpses[0];
      const raised = makeLineEnemy(corpse.enemyId, corpse.position);
      return {
        ...state,
        enemies: [
          ...state.enemies,
          { ...raised, hp: Math.floor(raised.maxHp * special.hpFraction) },
        ],
        corpses: state.corpses.filter((c) => c.uid !== corpse.uid),
        log: [...state.log, `☠️ ${corpse.name} rises!`],
      };
    }

    case "mass_raise_dead": {
      let s = state;
      for (const corpse of s.corpses) {
        const raised = makeLineEnemy(corpse.enemyId, corpse.position);
        s = {
          ...s,
          enemies: [...s.enemies, { ...raised, hp: Math.floor(raised.maxHp * special.hpFraction) }],
          log: [...s.log, `☠️ ${corpse.name} rises!`],
        };
      }
      return { ...s, corpses: [] };
    }

    case "create_terrain": {
      const slot = Math.max(0, Math.min(state.lineLength - 1, enemy.position + special.slotOffset));
      const ns = [...state.slots];
      ns[slot] = special.terrain;
      return { ...state, slots: ns };
    }

    case "create_terrain_aoe": {
      const ns = [...state.slots];
      for (let offset = -special.radius; offset <= special.radius; offset++) {
        const s = enemy.position + offset;
        if (s >= 0 && s < state.lineLength) ns[s] = special.terrain;
      }
      return { ...state, slots: ns };
    }

    case "apply_dark_zone": {
      const ns = [...state.slots];
      for (let offset = 0; offset < special.width; offset++) {
        const s = enemy.position + special.slotsFromSelf + offset;
        if (s >= 0 && s < state.lineLength)
          ns[s] = { type: "dark_zone", turnsRemaining: special.turns };
      }
      return { ...state, slots: ns };
    }

    case "eclipse": {
      const ns = [...state.slots];
      for (let i = 0; i < state.lineLength; i += 2) {
        ns[i] = { type: "dark_zone", turnsRemaining: special.turns };
      }
      return { ...state, slots: ns };
    }

    case "dirge_zone": {
      const targetSlot = tel.affectedSlots[0] ?? enemy.position;
      return {
        ...state,
        dirgeZones: [
          ...state.dirgeZones,
          {
            slot: targetSlot,
            turnsRemaining: special.turns,
            damagePerTurn: special.damagePerTurn,
            apDrainPerTurn: special.apDrainPerTurn,
          },
        ],
      };
    }

    case "teleport_self": {
      let targetSlot: number | null = null;
      if (special.targetType === "away_from_player") {
        // Move to farthest empty slot from player
        const dir = state.player.position > enemy.position ? -1 : 1;
        targetSlot = enemy.position + dir * 3;
        targetSlot = Math.max(0, Math.min(state.lineLength - 1, targetSlot));
      } else if (special.targetType === "dark_zone") {
        const dark = state.slots.findIndex((s) => s.type === "dark_zone");
        if (dark >= 0) targetSlot = dark;
      } else if (special.targetType === "rot") {
        const rot = state.slots.findIndex((s) => s.type === "rot");
        if (rot >= 0) targetSlot = rot;
      } else if (special.targetType === "any_empty") {
        for (let s = 0; s < state.lineLength; s++) {
          if (!getEntityAtSlot(state, s)) {
            targetSlot = s;
            break;
          }
        }
      }
      if (targetSlot !== null) {
        return {
          ...state,
          enemies: state.enemies.map((e) =>
            e.uid === enemy.uid ? { ...e, position: targetSlot! } : e,
          ),
        };
      }
      return state;
    }

    case "teleport_to_adjacent_target": {
      // Ghoul pounce / Vampire Blood Rush — move to adjacent of player
      const dir = state.player.position > enemy.position ? 1 : -1;
      const adjSlot = state.player.position - dir;
      if (adjSlot >= 0 && adjSlot < state.lineLength && !getEntityAtSlot(state, adjSlot)) {
        return {
          ...state,
          enemies: state.enemies.map((e) =>
            e.uid === enemy.uid ? { ...e, position: adjSlot } : e,
          ),
        };
      }
      return state;
    }

    case "intercept_for_allies": {
      // Forsworn: if player used a ranged ability, Forsworn moves between player and target
      // In practice, the intercept happens during player's turn. No-op in enemy turn.
      return state;
    }

    case "command_ally_extra_action": {
      const nearestAlly = state.enemies
        .filter((e) => e.uid !== enemy.uid && e.hp > 0)
        .sort(
          (a, b) => Math.abs(a.position - enemy.position) - Math.abs(b.position - enemy.position),
        )[0];
      if (nearestAlly) {
        return {
          ...state,
          enemies: state.enemies.map((e) =>
            e.uid === nearestAlly.uid ? { ...e, commandedExtraAction: true } : e,
          ),
        };
      }
      return state;
    }

    case "mist_form":
      return {
        ...state,
        enemies: state.enemies.map((e) =>
          e.uid === enemy.uid ? { ...e, mistFormTurns: special.turns } : e,
        ),
      };

    case "gain_armor":
      return {
        ...state,
        enemies: state.enemies.map((e) =>
          e.uid === enemy.uid ? { ...e, armor: e.armor + special.amount } : e,
        ),
      };

    case "lifesteal":
    case "wall_slam_bonus":
    case "negate_hit":
    case "riposte_trigger":
    case "overwatch_trigger":
    case "blood_puppet_corpse":
    case "phylactery_shield":
    case "barrier_breach":
    case "immobilize_both":
      return state;
  }
  return state;
}

// ─── Damage helper (for reactions) ───

function applyDamageToEnemy(state: LineCombatState, uid: string, damage: number): LineCombatState {
  const enemy = state.enemies.find((e) => e.uid === uid);
  if (!enemy) return state;
  const actual = Math.max(0, damage - enemy.armor);
  const newHp = Math.max(0, enemy.hp - actual);
  state = {
    ...state,
    enemies: state.enemies.map((e) => (e.uid === uid ? { ...e, hp: newHp } : e)),
  };
  if (newHp <= 0) {
    state = killEnemy(state, uid);
  }
  return state;
}
