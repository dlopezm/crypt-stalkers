/* ═══════════════════════════════════════════════════════════════════════════
   Line Combat — End-of-Turn Cleanup
   Ticks conditions, terrain, metamorphosis timers, passive effects.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { LineCombatState } from "../types";
import { LINE_BALANCE } from "../balance";
import { killEnemy } from "./execute-player";
import { makeLineEnemy } from "../enemy-defs";

// ─── Tick integer condition stack (decrement by 1, remove at 0) ───

function tickCondition(
  conditions: Partial<Record<string, number>>,
  key: string,
): Partial<Record<string, number>> {
  const val = conditions[key];
  if (!val) return conditions;
  const next = val - 1;
  if (next <= 0) {
    const { [key]: _removed, ...rest } = conditions;
    return rest;
  }
  return { ...conditions, [key]: next };
}

// ─── End of turn ───

export function endOfTurn(state: LineCombatState): LineCombatState {
  state = tickPlayerConditions(state);
  state = tickEnemyConditions(state);
  state = tickTerrainTimers(state);
  state = tickDirgeZones(state);
  state = tickCountdownTimers(state);
  state = tickEnemyPassives(state);
  state = tickPlayerCooldowns(state);
  state = tickPlayerMistForm(state);
  state = applyReinforcements(state);
  state = checkVictoryDefeat(state);

  if (state.phase === "victory" || state.phase === "defeat") return state;

  // Advance turn
  return { ...state, turn: state.turn + 1, phase: "telegraph" };
}

// ─── Player conditions ───

function tickPlayerConditions(state: LineCombatState): LineCombatState {
  let p = state.player;

  // Poison damage
  if ((p.conditions.poisoned ?? 0) > 0) {
    const dmg = LINE_BALANCE.conditions.poisonDamagePerTurn;
    p = { ...p, hp: Math.max(0, p.hp - dmg) };
    state = { ...state, log: [...state.log, `🟢 Player poisoned: -${dmg} HP`] };
  }

  // Burning damage
  if ((p.conditions.burning ?? 0) > 0) {
    const dmg = LINE_BALANCE.conditions.burningDamagePerTurn;
    p = { ...p, hp: Math.max(0, p.hp - dmg) };
    state = { ...state, log: [...state.log, `🔥 Player burning: -${dmg} HP`] };
  }

  // Tick all conditions down
  let conds = { ...p.conditions };
  for (const key of Object.keys(conds)) {
    conds = tickCondition(conds, key) as typeof conds;
  }
  p = { ...p, conditions: conds };

  // Restore armor to base (temporary armor from abilities expires)
  // (We keep the armor field as the net value — reset to base armor each turn is handled in execute-player)

  // Reset riposte/overwatch (used for that turn only)
  p = { ...p, ripostePending: false, overwatchActive: false };

  // Reset commanded extra action
  state = {
    ...state,
    player: p,
    enemies: state.enemies.map((e) => ({ ...e, commandedExtraAction: false })),
  };

  return state;
}

// ─── Enemy conditions ───

function tickEnemyConditions(state: LineCombatState): LineCombatState {
  const newLogs: string[] = [];

  const enemies = state.enemies.map((enemy) => {
    if (enemy.hp <= 0 && enemy.countdownTimer === null) return enemy;

    let e = enemy;
    let dmg = 0;
    let logMsg = "";

    if ((e.conditions.poisoned ?? 0) > 0) {
      dmg += LINE_BALANCE.conditions.poisonDamagePerTurn;
      logMsg += `poison `;
    }
    if ((e.conditions.burning ?? 0) > 0) {
      dmg += LINE_BALANCE.conditions.burningDamagePerTurn;
      logMsg += `burning `;
    }

    if (dmg > 0) {
      e = { ...e, hp: Math.max(0, e.hp - dmg) };
      newLogs.push(`${enemy.id}: ${logMsg.trim()} -${dmg} HP`);
    }

    let conds = { ...e.conditions };
    for (const key of Object.keys(conds)) {
      conds = tickCondition(conds, key) as typeof conds;
    }
    e = { ...e, conditions: conds };

    return e;
  });

  state = { ...state, enemies, log: [...state.log, ...newLogs] };

  // Kill enemies that died from DoT
  for (const e of state.enemies) {
    if (e.hp <= 0 && e.countdownTimer === null) {
      state = killEnemy(state, e.uid);
    }
  }

  return state;
}

// ─── Terrain timers ───

function tickTerrainTimers(state: LineCombatState): LineCombatState {
  const newSlots = state.slots.map((terrain) => {
    switch (terrain.type) {
      case "hallowed_ground":
        return terrain.turnsRemaining <= 1
          ? { type: "empty" as const }
          : { ...terrain, turnsRemaining: terrain.turnsRemaining - 1 };
      case "smoke":
        return terrain.turnsRemaining <= 1
          ? { type: "empty" as const }
          : { ...terrain, turnsRemaining: terrain.turnsRemaining - 1 };
      case "hazard":
        return terrain.turnsRemaining <= 1
          ? { type: "empty" as const }
          : { ...terrain, turnsRemaining: terrain.turnsRemaining - 1 };
      case "rot":
        return terrain.turnsRemaining <= 1
          ? { type: "empty" as const }
          : { ...terrain, turnsRemaining: terrain.turnsRemaining - 1 };
      case "dark_zone":
        return terrain.turnsRemaining <= 1
          ? { type: "empty" as const }
          : { ...terrain, turnsRemaining: terrain.turnsRemaining - 1 };
      default:
        return terrain;
    }
  });

  // Apply terrain DoT effects to entities standing on them
  state = { ...state, slots: newSlots };

  for (let slot = 0; slot < state.lineLength; slot++) {
    const terrain = state.slots[slot];

    if (terrain.type === "hallowed_ground") {
      // Damage undead enemies
      for (const enemy of state.enemies) {
        if (
          enemy.position === slot &&
          !enemy.passives.some((p) => p.type === "incorporeal_resistance")
        ) {
          const dmg = LINE_BALANCE.conditions.hallowedGroundDamageUndead;
          state = {
            ...state,
            enemies: state.enemies.map((e) =>
              e.uid === enemy.uid ? { ...e, hp: Math.max(0, e.hp - dmg) } : e,
            ),
            log: [...state.log, `✝️ ${enemy.id} takes ${dmg} holy damage from hallowed ground`],
          };
        }
      }
    }

    if (terrain.type === "hazard") {
      const dmg = terrain.damage;
      if (state.player.position === slot) {
        state = { ...state, player: { ...state.player, hp: Math.max(0, state.player.hp - dmg) } };
      }
      for (const enemy of state.enemies) {
        if (enemy.position === slot) {
          state = {
            ...state,
            enemies: state.enemies.map((e) =>
              e.uid === enemy.uid ? { ...e, hp: Math.max(0, e.hp - dmg) } : e,
            ),
          };
        }
      }
    }

    if (terrain.type === "rot") {
      const dmg = LINE_BALANCE.conditions.rotTerrainDamagePerTurn;
      if (state.player.position === slot) {
        state = { ...state, player: { ...state.player, hp: Math.max(0, state.player.hp - dmg) } };
      }
    }

    if (terrain.type === "dark_zone") {
      // Update enemy darkZoneBonus
      state = {
        ...state,
        enemies: state.enemies.map((e) => ({
          ...e,
          darkZoneBonus: state.slots[e.position]?.type === "dark_zone",
        })),
      };
    }
  }

  // Kill enemies that died from terrain
  for (const e of state.enemies) {
    if (e.hp <= 0 && e.countdownTimer === null) {
      state = killEnemy(state, e.uid);
    }
  }

  return state;
}

// ─── Dirge zones ───

function tickDirgeZones(state: LineCombatState): LineCombatState {
  const newDirges = state.dirgeZones
    .map((dz) => ({ ...dz, turnsRemaining: dz.turnsRemaining - 1 }))
    .filter((dz) => dz.turnsRemaining > 0);

  for (const dz of state.dirgeZones) {
    // Damage player if in zone
    if (state.player.position === dz.slot) {
      state = {
        ...state,
        player: {
          ...state.player,
          hp: Math.max(0, state.player.hp - dz.damagePerTurn),
          ap: Math.max(0, (state.player.ap ?? 0) - dz.apDrainPerTurn),
        },
        log: [...state.log, `🎶 Dirge zone: -${dz.damagePerTurn} HP, -${dz.apDrainPerTurn} AP`],
      };
    }
    // Damage enemies in zone
    for (const enemy of state.enemies) {
      if (enemy.position === dz.slot) {
        state = {
          ...state,
          enemies: state.enemies.map((e) =>
            e.uid === enemy.uid ? { ...e, hp: Math.max(0, e.hp - dz.damagePerTurn) } : e,
          ),
        };
      }
    }
  }

  return { ...state, dirgeZones: newDirges };
}

// ─── Countdown timers (metamorphosis, reform) ───

function tickCountdownTimers(state: LineCombatState): LineCombatState {
  let enemies = state.enemies;
  const toTransform: string[] = [];

  enemies = enemies.map((e) => {
    if (e.countdownTimer === null) return e;
    const next = e.countdownTimer - 1;
    if (next <= 0) {
      toTransform.push(e.uid);
      return { ...e, countdownTimer: 0 };
    }
    return { ...e, countdownTimer: next };
  });

  state = { ...state, enemies };

  for (const uid of toTransform) {
    const old = state.enemies.find((e) => e.uid === uid);
    if (!old || !old.countdownTarget) continue;

    const newEnemy = makeLineEnemy(old.countdownTarget, old.position);
    state = {
      ...state,
      enemies: state.enemies.filter((e) => e.uid !== uid).concat(newEnemy),
      log: [...state.log, `${old.id} transforms into ${old.countdownTarget}!`],
    };
  }

  return state;
}

// ─── Enemy passives ───

function tickEnemyPassives(state: LineCombatState): LineCombatState {
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;

    for (const passive of enemy.passives) {
      if (passive.type === "ever_growing") {
        state = {
          ...state,
          enemies: state.enemies.map((e) =>
            e.uid === enemy.uid ? { ...e, hp: Math.min(e.maxHp, e.hp + passive.hpPerTurn) } : e,
          ),
        };
      }
    }
  }

  return state;
}

// ─── Player cooldowns ───

function tickPlayerCooldowns(state: LineCombatState): LineCombatState {
  const cooldowns = { ...state.player.abilityCooldowns };
  for (const key of Object.keys(cooldowns)) {
    if (cooldowns[key] > 0) cooldowns[key]--;
  }
  return {
    ...state,
    player: {
      ...state.player,
      ap: state.player.maxAp, // restore AP
      abilityCooldowns: cooldowns,
    },
  };
}

// ─── Player mist form ───

function tickPlayerMistForm(state: LineCombatState): LineCombatState {
  if (state.player.mistFormTurns <= 0) return state;
  return {
    ...state,
    player: { ...state.player, mistFormTurns: state.player.mistFormTurns - 1 },
  };
}

// ─── Reinforcements ───

function applyReinforcements(state: LineCombatState): LineCombatState {
  const pending = state.reinforcements.filter((r) => r.onTurn === state.turn);
  if (pending.length === 0) return state;

  for (const reinf of pending) {
    for (const enemyId of reinf.enemyIds) {
      const slot = reinf.side === "left" ? 0 : state.lineLength - 1;
      const newEnemy = makeLineEnemy(enemyId, slot);
      state = {
        ...state,
        enemies: [...state.enemies, newEnemy],
        log: [...state.log, `⚠️ ${enemyId} enters from the ${reinf.side}!`],
      };
    }
  }

  return {
    ...state,
    reinforcements: state.reinforcements.filter((r) => r.onTurn !== state.turn),
  };
}

// ─── Victory / defeat ───

export function checkVictoryDefeat(state: LineCombatState): LineCombatState {
  // Defeat: player dead
  if (state.player.hp <= 0) {
    return { ...state, phase: "defeat" };
  }

  const aliveEnemies = state.enemies.filter((e) => e.hp > 0 || e.countdownTimer !== null);

  switch (state.goal.type) {
    case "kill_all":
      if (aliveEnemies.length === 0) return { ...state, phase: "victory" };
      break;

    case "kill_target": {
      const targetUid = (state.goal as { type: "kill_target"; targetUid: string }).targetUid;
      const target = state.enemies.find((e) => e.uid === targetUid);
      if (!target || target.hp <= 0) return { ...state, phase: "victory" };
      break;
    }

    case "survive": {
      if (state.turn >= (state.goal as { type: "survive"; turns: number }).turns) {
        return { ...state, phase: "victory" };
      }
      break;
    }

    case "protect": {
      const goal = state.goal as { type: "protect"; protectedUid: string; protectedName: string };
      const protectedEntity = state.enemies.find((e) => e.uid === goal.protectedUid);
      if (protectedEntity && protectedEntity.hp <= 0) return { ...state, phase: "defeat" };
      if (aliveEnemies.filter((e) => e.uid !== goal.protectedUid).length === 0) {
        return { ...state, phase: "victory" };
      }
      break;
    }
  }

  return state;
}
