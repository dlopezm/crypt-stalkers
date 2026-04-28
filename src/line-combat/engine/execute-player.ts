/* ═══════════════════════════════════════════════════════════════════════════
   Line Combat — Player Action Execution
   Resolves player abilities against the line state.
   ═══════════════════════════════════════════════════════════════════════════ */

import type {
  LineCombatState,
  LinePos,
  LineAbility,
  LineAbilitySpecial,
  LineDeathEffect,
} from "../types";
import { applyPushEntity, applySwitch, getEntityAtSlot } from "./positioning";
import { LINE_BALANCE } from "../balance";
import { getLineEnemyDef, makeLineEnemy } from "../enemy-defs";

// ─── Damage resolution ───

function applyDamageToPlayer(
  state: LineCombatState,
  damage: number,
  ignoreArmor = false,
): LineCombatState {
  const p = state.player;
  const armor = ignoreArmor ? 0 : p.armor;
  const actual = Math.max(0, damage - armor);
  if (p.negateNextHit && actual > 0) {
    return {
      ...state,
      player: { ...p, negateNextHit: false },
      log: [...state.log, `🛡️ Hit negated!`],
    };
  }
  return {
    ...state,
    player: { ...p, hp: Math.max(0, p.hp - actual) },
    log: [...state.log, `Player takes ${actual} damage`],
  };
}

function applyDamageToEnemy(
  state: LineCombatState,
  uid: string,
  damage: number,
  lifestealFraction = 0,
  armorPierce = 0,
): LineCombatState {
  const enemy = state.enemies.find((e) => e.uid === uid);
  if (!enemy) return state;

  const effectiveArmor = Math.max(0, enemy.armor - armorPierce);
  const actual = Math.max(0, damage - effectiveArmor);
  const newHp = Math.max(0, enemy.hp - actual);

  const enemies = state.enemies.map((e) => (e.uid === uid ? { ...e, hp: newHp } : e));
  state = {
    ...state,
    enemies,
    log: [...state.log, `${enemy.id} takes ${actual} damage (${newHp} HP remaining)`],
  };

  // Lifesteal
  if (lifestealFraction > 0 && actual > 0) {
    const heal = Math.floor(actual * lifestealFraction);
    state = {
      ...state,
      player: { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + heal) },
    };
  }

  return state;
}

// ─── Range resolution: compute which slots are affected ───

export function resolveSlotsForAbility(
  ability: LineAbility,
  casterSlot: LinePos,
  targetSlot: LinePos,
  direction: 1 | -1,
  lineLength: number,
): LinePos[] {
  const p = ability.pattern;
  const slots: LinePos[] = [];

  switch (p.type) {
    case "self":
      return [casterSlot];

    case "adjacent":
      if (casterSlot - 1 >= 0) slots.push(casterSlot - 1);
      if (casterSlot + 1 < lineLength) slots.push(casterSlot + 1);
      return slots;

    case "adjacent_forward": {
      const s = casterSlot + direction;
      if (s >= 0 && s < lineLength) slots.push(s);
      return slots;
    }

    case "reach":
      for (let d = p.minDist; d <= p.maxDist; d++) {
        const s = casterSlot + direction * d;
        if (s >= 0 && s < lineLength) slots.push(s);
      }
      return slots;

    case "pierce":
      for (let d = p.minDist; d <= p.maxDist; d++) {
        const s = casterSlot + direction * d;
        if (s >= 0 && s < lineLength) slots.push(s);
      }
      return slots;

    case "gap": {
      const gs = casterSlot + direction * p.exactDist;
      if (gs >= 0 && gs < lineLength) slots.push(gs);
      return slots;
    }

    case "sweep":
      for (let d = p.minDist; d <= p.maxDist; d++) {
        const s = casterSlot + direction * d;
        if (s >= 0 && s < lineLength) slots.push(s);
      }
      return slots;

    case "scatter":
      for (let offset = -p.spread; offset <= p.spread; offset++) {
        const s = targetSlot + offset;
        if (s >= 0 && s < lineLength) slots.push(s);
      }
      return [...new Set(slots)];

    case "full_line":
      return Array.from({ length: lineLength }, (_, i) => i);

    case "self_burst":
      for (let offset = -p.radius; offset <= p.radius; offset++) {
        const s = casterSlot + offset;
        if (s >= 0 && s < lineLength) slots.push(s);
      }
      return slots;
  }
}

// ─── Execute a death effect ───

function executeDeathEffect(state: LineCombatState, effect: LineDeathEffect): LineCombatState {
  switch (effect.type) {
    case "spawn_heap": {
      const heap = makeLineEnemy("heap_of_bones", effect.position);
      return {
        ...state,
        enemies: [
          ...state.enemies,
          {
            ...heap,
            countdownTimer: LINE_BALANCE.enemy.reformTimerTurns,
            countdownTarget: "skeleton",
          },
        ],
        log: [...state.log, `💀 Heap of Bones appears at slot ${effect.position}`],
      };
    }
    case "corpse_burst": {
      // AoE damage + poison
      let s = state;
      const pDist = Math.abs(s.player.position - effect.position);
      if (pDist <= effect.radius) {
        s = applyDamageToPlayer(s, effect.damage);
        s = {
          ...s,
          player: {
            ...s.player,
            conditions: {
              ...s.player.conditions,
              poisoned: (s.player.conditions.poisoned ?? 0) + effect.poisonTurns,
            },
          },
        };
      }
      for (const e of s.enemies) {
        if (e.hp > 0 && Math.abs(e.position - effect.position) <= effect.radius) {
          s = applyDamageToEnemy(s, e.uid, effect.damage);
        }
      }
      return s;
    }
    case "infected_adjacent": {
      // Apply infected condition to adjacent entities
      const pDist = Math.abs(state.player.position - effect.position);
      if (pDist <= 1) {
        state = {
          ...state,
          player: {
            ...state.player,
            conditions: {
              ...state.player.conditions,
              poisoned: (state.player.conditions.poisoned ?? 0) + effect.turns,
            },
          },
        };
      }
      return state;
    }
    case "explode": {
      let s = state;
      const pDist = Math.abs(s.player.position - effect.position);
      if (pDist <= effect.radius) s = applyDamageToPlayer(s, effect.damage);
      for (const e of s.enemies) {
        if (e.hp > 0 && Math.abs(e.position - effect.position) <= effect.radius) {
          s = applyDamageToEnemy(s, e.uid, effect.damage);
        }
      }
      return s;
    }
    case "create_terrain": {
      const newSlots = [...state.slots];
      newSlots[effect.position] = effect.terrain;
      return { ...state, slots: newSlots };
    }
    case "create_salt_deposit": {
      // Add a salt deposit terrain at position
      const ns = [...state.slots];
      ns[effect.position] = { type: "salt_deposit" };
      return {
        ...state,
        slots: ns,
        log: [...state.log, `🧂 Salt deposit left at slot ${effect.position}`],
      };
    }
    case "drop_caltrops": {
      const nc = [...state.slots];
      nc[effect.position] = { type: "hazard", turnsRemaining: 5, damage: 2 };
      return { ...state, slots: nc };
    }
  }
}

// ─── Kill enemy: remove from list, spawn corpse, trigger death effects ───

export function killEnemy(state: LineCombatState, uid: string): LineCombatState {
  const enemy = state.enemies.find((e) => e.uid === uid);
  if (!enemy) return state;

  const def = getLineEnemyDef(enemy.id);

  // Reform passive logic is handled in end-of-turn via killEnemy being called with the right context

  // Remove from active enemies
  let s: LineCombatState = {
    ...state,
    enemies: state.enemies.filter((e) => e.uid !== uid),
  };

  // Drop corpse (for necromancer raising)
  const def2 = getLineEnemyDef(enemy.id);
  if (!def2.isBoss && enemy.id !== "heap_of_bones" && enemy.id !== "gutborn_larva") {
    s = {
      ...s,
      corpses: [
        ...s.corpses,
        {
          uid: enemy.uid,
          enemyId: enemy.id,
          position: enemy.position,
          name: def2.name,
          icon: def2.ascii,
          salt: def2.loot,
        },
      ],
      log: [...s.log, `${def2.name} defeated!`],
    };
  }

  // Death effects
  if (def.onDeath) {
    const ctx = {
      player: s.player,
      enemies: s.enemies,
      corpses: s.corpses,
      slots: s.slots,
      turn: s.turn,
    };
    const effects = def.onDeath(enemy, ctx);
    for (const effect of effects) {
      s = executeDeathEffect(s, effect);
    }
  }

  return s;
}

// ─── Apply a special effect ───

function applySpecial(
  state: LineCombatState,
  special: LineAbilitySpecial,
  casterSlot: LinePos,
  targetSlot: LinePos,
  _direction: 1 | -1,
): LineCombatState {
  switch (special.type) {
    case "gain_armor":
      return {
        ...state,
        player: { ...state.player, armor: state.player.armor + special.amount },
      };

    case "steal_salt":
      // enemy steals — not relevant when player casts; ignore
      return state;

    case "drain_ap":
      return {
        ...state,
        player: { ...state.player, ap: Math.max(0, state.player.ap - special.amount) },
      };

    case "summon": {
      const slot = Math.max(0, Math.min(state.lineLength - 1, casterSlot + special.atSlotOffset));
      const existing = getEntityAtSlot(state, slot);
      if (existing) return state;
      const newEnemy = makeLineEnemy(special.enemyId, slot);
      return {
        ...state,
        enemies: [...state.enemies, newEnemy],
        log: [...state.log, `${special.enemyId} summoned at slot ${slot}`],
      };
    }

    case "raise_dead": {
      if (state.corpses.length === 0) return state;
      const corpse = state.corpses.reduce((best, c) =>
        Math.abs(c.position - targetSlot) < Math.abs(best.position - targetSlot) ? c : best,
      );
      const raised = makeLineEnemy(corpse.enemyId, corpse.position);
      const raisedWithHp = { ...raised, hp: Math.floor(raised.maxHp * special.hpFraction) };
      return {
        ...state,
        enemies: [...state.enemies, raisedWithHp],
        corpses: state.corpses.filter((c) => c.uid !== corpse.uid),
        log: [...state.log, `☠️ ${corpse.name} rises from the dead!`],
      };
    }

    case "mass_raise_dead": {
      let s = state;
      for (const corpse of s.corpses) {
        const raised = makeLineEnemy(corpse.enemyId, corpse.position);
        const raisedWithHp = { ...raised, hp: Math.floor(raised.maxHp * special.hpFraction) };
        s = {
          ...s,
          enemies: [...s.enemies, raisedWithHp],
          log: [...s.log, `☠️ ${corpse.name} rises!`],
        };
      }
      return { ...s, corpses: [] };
    }

    case "create_terrain": {
      const slot = Math.max(0, Math.min(state.lineLength - 1, targetSlot + special.slotOffset));
      const newSlots = [...state.slots];
      newSlots[slot] = special.terrain;
      return { ...state, slots: newSlots };
    }

    case "create_terrain_aoe": {
      const newSlots = [...state.slots];
      for (let offset = -special.radius; offset <= special.radius; offset++) {
        const s = casterSlot + offset;
        if (s >= 0 && s < state.lineLength) {
          newSlots[s] = special.terrain;
        }
      }
      return { ...state, slots: newSlots };
    }

    case "teleport_self":
      // Enemy-only special — no-op for player
      return state;

    case "teleport_to_adjacent_target": {
      // Player dagger backstab — handled by ability's reposition switch
      return state;
    }

    case "apply_dark_zone": {
      const newSlots = [...state.slots];
      for (let offset = 0; offset < special.width; offset++) {
        const s = casterSlot + special.slotsFromSelf + offset;
        if (s >= 0 && s < state.lineLength) {
          newSlots[s] = { type: "dark_zone", turnsRemaining: special.turns };
        }
      }
      return { ...state, slots: newSlots };
    }

    case "eclipse": {
      const newSlots = [...state.slots];
      for (let i = 0; i < state.lineLength; i += 2) {
        newSlots[i] = { type: "dark_zone", turnsRemaining: special.turns };
      }
      return { ...state, slots: newSlots };
    }

    case "dirge_zone": {
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

    case "immobilize_both": {
      // Immobilize both player and attacker (zombie grab)
      return {
        ...state,
        player: {
          ...state.player,
          conditions: { ...state.player.conditions, immobilized: 2 },
        },
      };
    }

    case "riposte_trigger":
      return { ...state, player: { ...state.player, ripostePending: true } };

    case "overwatch_trigger":
      return { ...state, player: { ...state.player, overwatchActive: true } };

    case "negate_hit":
      return { ...state, player: { ...state.player, negateNextHit: true } };

    case "mist_form":
      return {
        ...state,
        player: { ...state.player, mistFormTurns: special.turns },
      };

    case "lifesteal":
    case "wall_slam_bonus":
    case "command_ally_extra_action":
    case "intercept_for_allies":
    case "phylactery_shield":
    case "barrier_breach":
    case "blood_puppet_corpse":
      return state; // handled elsewhere or not applicable to player
  }
  return state;
}

// ─── Main: execute a player ability ───

export function executePlayerAbility(
  state: LineCombatState,
  abilityId: string,
  ability: LineAbility,
  targetSlot: LinePos,
  direction: 1 | -1,
): LineCombatState {
  const p = state.player;

  // Stun blocks all abilities
  if ((p.conditions.stunned ?? 0) > 0) {
    return { ...state, log: [...state.log, `Stunned — cannot act`] };
  }
  // AP check
  if (p.ap < ability.apCost) {
    return { ...state, log: [...state.log, `Not enough AP for ${ability.name}`] };
  }
  // Silence check
  if ((p.conditions.silenced ?? 0) > 0 && ability.silenceBlocked) {
    return { ...state, log: [...state.log, `${ability.name} is silenced!`] };
  }
  // Cooldown check
  if ((p.abilityCooldowns[abilityId] ?? 0) > 0) {
    return { ...state, log: [...state.log, `${ability.name} is on cooldown`] };
  }

  // Deduct AP
  state = {
    ...state,
    player: {
      ...p,
      ap: p.ap - ability.apCost,
      abilityCooldowns: {
        ...p.abilityCooldowns,
        ...(ability.cooldown > 0 ? { [abilityId]: ability.cooldown } : {}),
      },
    },
  };

  // Compute affected slots
  const affectedSlots = resolveSlotsForAbility(
    ability,
    state.player.position,
    targetSlot,
    direction,
    state.lineLength,
  );

  state = { ...state, log: [...state.log, `Player uses ${ability.name}`] };

  // For "reach" patterns: only hit first entity found (stop at first occupied)
  const hitsFirst = ability.pattern.type === "reach";

  const lifestealSpec = ability.special.find((s) => s.type === "lifesteal");
  const lifestealFrac = lifestealSpec ? lifestealSpec.fraction : 0;

  const wallSlamSpec = ability.special.find((s) => s.type === "wall_slam_bonus");
  const wallSlamBonus = wallSlamSpec ? wallSlamSpec.extraDamage : 0;

  let hitOne = false;
  for (const slot of affectedSlots) {
    if (hitsFirst && hitOne) break;

    const occupant = getEntityAtSlot(state, slot);
    if (!occupant || occupant.kind === "player") continue;

    hitOne = true;

    const enemy = state.enemies.find((e) => e.uid === occupant.uid)!;

    // Compute damage
    let damage = ability.damage;

    // Damage type multipliers
    const dt = ability.damageType;
    if (dt) {
      const res = enemy.resistances[dt] ?? 1;
      const vul = enemy.vulnerabilities[dt] ?? 1;
      damage = Math.round(damage * res * vul);
    }

    // Wall-slam bonus
    if (wallSlamBonus > 0 && (slot === 0 || slot === state.lineLength - 1)) {
      damage += wallSlamBonus;
    }

    // Crossbow bolt ignores 2 armor
    const armorPierce = abilityId === "crossbow_bolt" ? 2 : 0;

    state = applyDamageToEnemy(state, enemy.uid, damage, lifestealFrac, armorPierce);

    // Conditions
    for (const cond of ability.conditions) {
      const target = cond.targetSelf ? "player" : "enemy";
      if (target === "enemy") {
        state = {
          ...state,
          enemies: state.enemies.map((e) =>
            e.uid === enemy.uid
              ? {
                  ...e,
                  conditions: {
                    ...e.conditions,
                    [cond.condition]: (e.conditions[cond.condition] ?? 0) + cond.stacks,
                  },
                }
              : e,
          ),
        };
      }
    }

    // Check if enemy died
    const updatedEnemy = state.enemies.find((e) => e.uid === enemy.uid);
    if (updatedEnemy && updatedEnemy.hp <= 0) {
      state = killEnemy(state, enemy.uid);
    }
  }

  // Reposition
  if (ability.reposition) {
    const r = ability.reposition;
    switch (r.type) {
      case "push_target": {
        // Push target (first entity in affected direction)
        const targetOcc = affectedSlots.map((s) => getEntityAtSlot(state, s)).find(Boolean);
        if (targetOcc) {
          const targetPos =
            targetOcc.kind === "player"
              ? state.player.position
              : state.enemies.find((e) => e.uid === targetOcc.uid)!.position;
          state = applyPushEntity(state, targetPos, direction, r.distance);
        }
        break;
      }
      case "pull_target": {
        const targetOcc = affectedSlots.map((s) => getEntityAtSlot(state, s)).find(Boolean);
        if (targetOcc && targetOcc.kind === "enemy") {
          const targetPos = state.enemies.find((e) => e.uid === targetOcc.uid)!.position;
          // Pull = push toward player
          const pullDir = (state.player.position < targetPos ? -1 : 1) as 1 | -1;
          state = applyPushEntity(state, targetPos, pullDir, r.distance);
        }
        break;
      }
      case "push_self": {
        const selfDir = (direction === 1 ? -1 : 1) as 1 | -1;
        state = applyPushEntity(state, state.player.position, selfDir, r.distance);
        break;
      }
      case "pull_self": {
        state = applyPushEntity(state, state.player.position, direction, r.distance);
        break;
      }
      case "switch": {
        if (affectedSlots.length > 0) {
          const switchTarget = affectedSlots.find((s) => getEntityAtSlot(state, s) !== null);
          if (switchTarget !== undefined) {
            state = applySwitch(state, state.player.position, switchTarget);
          }
        }
        break;
      }
      case "push_all_in_range": {
        // Handled by mace shockwave — push all in sweep range.
        // Collect uids first so cascade doesn't shift entities into already-processed slots.
        const targets: { uid: string | null; oppDir: 1 | -1 }[] = [];
        for (const slot of affectedSlots) {
          const occ = getEntityAtSlot(state, slot);
          if (!occ) continue;
          const oppDir = (slot >= state.player.position ? 1 : -1) as 1 | -1;
          targets.push({ uid: occ.kind === "player" ? null : occ.uid, oppDir });
        }
        for (const { uid, oppDir } of targets) {
          const pos =
            uid === null
              ? state.player.position
              : state.enemies.find((e) => e.uid === uid)?.position;
          if (pos !== undefined) state = applyPushEntity(state, pos, oppDir, r.distance);
        }
        break;
      }
    }
  }

  // Special effects
  for (const sp of ability.special) {
    state = applySpecial(state, sp, state.player.position, targetSlot, direction);
  }

  return state;
}

// ─── Collect salt from adjacent corpse ───

export function collectSalt(state: LineCombatState, corpseUid: string): LineCombatState {
  const corpse = state.corpses.find((c) => c.uid === corpseUid);
  if (!corpse) return state;
  if (Math.abs(corpse.position - state.player.position) > 1) {
    return { ...state, log: [...state.log, "Too far to collect salt"] };
  }
  return {
    ...state,
    player: { ...state.player, salt: state.player.salt + corpse.salt },
    corpses: state.corpses.filter((c) => c.uid !== corpseUid),
    log: [...state.log, `Collected ${corpse.salt} salt from ${corpse.name}`],
  };
}
