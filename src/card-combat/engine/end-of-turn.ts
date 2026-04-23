import { STAMINA_REGEN } from "../constants";
import type {
  CardCombatEnemy,
  CardCombatLogEntry,
  CardCombatPlayer,
  CardCombatState,
  CardConditions,
} from "../types";
import { drawCards } from "./deck";

function tickConditions(cond: CardConditions): CardConditions {
  const next: CardConditions = {};
  for (const key of Object.keys(cond) as (keyof CardConditions)[]) {
    const v = cond[key] ?? 0;
    if (v > 1) {
      next[key] = v - 1;
    }
  }
  return next;
}

function tickDotDamage(
  player: CardCombatPlayer,
  enemies: readonly CardCombatEnemy[],
  turn: number,
): {
  player: CardCombatPlayer;
  enemies: readonly CardCombatEnemy[];
  log: readonly CardCombatLogEntry[];
} {
  const log: CardCombatLogEntry[] = [];

  // Player DoTs
  let p = player;
  const poisoned = p.conditions.poisoned ?? 0;
  const burning = p.conditions.burning ?? 0;
  const bleeding = p.conditions.bleeding ?? 0;
  const totalDot = poisoned * 1 + burning * 2 + bleeding * 1;
  if (totalDot > 0) {
    p = { ...p, hp: Math.max(0, p.hp - totalDot) };
    log.push({ turn, text: `You suffer ${totalDot} from conditions.`, source: "system" });
  }

  // Enemy DoTs
  const newEnemies: CardCombatEnemy[] = [];
  for (const e of enemies) {
    const ePoison = e.conditions.poisoned ?? 0;
    const eBurn = e.conditions.burning ?? 0;
    const eBleed = e.conditions.bleeding ?? 0;
    const dot = ePoison * 1 + eBurn * 2 + eBleed * 1;
    if (dot > 0) {
      const hp = Math.max(0, e.hp - dot);
      log.push({ turn, text: `${e.name} suffers ${dot}.`, source: "system" });
      newEnemies.push({ ...e, hp });
    } else {
      newEnemies.push(e);
    }
  }

  return { player: p, enemies: newEnemies, log };
}

export function endPlayerTurn(state: CardCombatState): CardCombatState {
  const turn = state.turn;
  const log: CardCombatLogEntry[] = [];

  // Tick DoTs
  const dot = tickDotDamage(state.player, state.enemies, turn);
  let player = dot.player;
  let enemies = dot.enemies.slice();
  log.push(...dot.log);

  // Remove dead from DoTs
  const corpses = state.corpses.slice();
  const alive: CardCombatEnemy[] = [];
  for (const e of enemies) {
    if (e.hp <= 0) {
      corpses.push({ enemyId: e.id, distance: e.distance, ageTurns: 0 });
      log.push({ turn, text: `${e.name} dies from conditions.`, source: "system" });
    } else {
      alive.push(e);
    }
  }
  enemies = alive;

  // Tick conditions (decrement each stack by 1)
  player = { ...player, conditions: tickConditions(player.conditions) };
  enemies = enemies.map((e) => ({ ...e, conditions: tickConditions(e.conditions) }));

  // Age corpses
  const agedCorpses = corpses.map((c) => ({ ...c, ageTurns: c.ageTurns + 1 }));

  // Regen stamina, reset per-turn state
  const staminaBonus = player.holdBreathUsed ? 0 : 0;
  player = {
    ...player,
    stamina: Math.min(player.maxStamina, player.stamina + STAMINA_REGEN + staminaBonus),
    armorThisTurn: 0,
    holdBreathUsed: false,
    // Reactions persist through enemy turn resolve but reset at end of round
  };

  return {
    ...state,
    player,
    enemies,
    corpses: agedCorpses,
    turn: turn + 1,
    log: [...state.log, ...log],
  };
}

export function drawNewHand(state: CardCombatState): CardCombatState {
  // Move hand to discard
  const player = state.player;
  const discard = [...player.discard, ...player.hand];
  const s: CardCombatState = {
    ...state,
    player: { ...player, discard, hand: [] },
  };
  return drawCards(s, 5);
}

export function checkVictoryDefeat(state: CardCombatState): CardCombatState {
  if (state.player.hp <= 0) return { ...state, phase: "defeat" };
  if (state.enemies.length === 0) return { ...state, phase: "victory" };
  return state;
}
