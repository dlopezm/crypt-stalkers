import { ARMOR_MAP, OFFHAND_MAP } from "../cards";
import { STAMINA_CAP } from "../constants";
import { getEnemyDef } from "../enemies";
import type { CardCombatEnemy, CardCombatPlayer, CardCombatState, CombatLoadout } from "../types";
import { buildDeck, drawCards } from "./deck";
import { checkVictoryDefeat, drawNewHand, endPlayerTurn } from "./end-of-turn";
import { resolveEnemyIntent } from "./execute-enemy";
import { shuffle } from "./rng";

export { canPlayCard, playCard } from "./execute-card";
export { isHelpless } from "./helpless";
export { inReach, enemiesInReach, closestEnemy } from "./distance";

export interface InitOptions {
  readonly loadout: CombatLoadout;
  readonly startingHp: number;
  readonly startingMaxHp: number;
  readonly startingSalt: number;
  readonly enemies: readonly {
    readonly id: string;
    readonly uid: string;
    readonly distance?: number;
  }[];
  readonly seed?: number;
}

export function initCardCombat(opts: InitOptions): CardCombatState {
  const { loadout, enemies: enemySpawn } = opts;

  const deck = buildDeck(loadout);
  const armor = ARMOR_MAP.get(loadout.armorId);
  const offhand = loadout.offhandId ? (OFFHAND_MAP.get(loadout.offhandId) ?? null) : null;

  const armorValue = armor?.armor ?? 0;
  const maxHpBonus = armor?.maxHpBonus ?? 0;
  const staminaMod = armor?.maxStaminaModifier ?? 0;

  // First-hit block from offhand counts as transient armor on turn 1
  const firstHit = offhand?.passiveBlockFirstHit ?? 0;

  const player: CardCombatPlayer = {
    hp: Math.min(opts.startingHp + maxHpBonus, opts.startingMaxHp + maxHpBonus),
    maxHp: opts.startingMaxHp + maxHpBonus,
    stamina: STAMINA_CAP + staminaMod,
    maxStamina: STAMINA_CAP + staminaMod,
    salt: opts.startingSalt,
    armor: armorValue,
    armorThisTurn: firstHit,
    conditions: {},
    weaponId: loadout.weaponId,
    offhandId: loadout.offhandId,
    armorId: loadout.armorId,
    deck,
    hand: [],
    discard: [],
    exhausted: [],
    bag: loadout.bag,
    reactions: { ripostePending: 0, overwatch: null, negateNextHit: false },
    holdBreathUsed: false,
  };

  const enemies: CardCombatEnemy[] = [];
  for (const spawn of enemySpawn) {
    const def = getEnemyDef(spawn.id);
    if (!def) continue;
    enemies.push({
      uid: spawn.uid,
      id: def.id,
      name: def.name,
      icon: def.icon,
      hp: def.maxHp,
      maxHp: def.maxHp,
      distance: spawn.distance ?? def.startDistance,
      conditions: {},
      armor: def.armor,
      resistances: def.resistances,
      vulnerabilities: def.vulnerabilities,
      passives: def.passives,
      intents: def.intents,
      telegraphIndex: 0,
      isBoss: def.isBoss,
    });
  }

  const state: CardCombatState = {
    player,
    enemies,
    corpses: [],
    turn: 1,
    phase: "planning",
    log: [],
    rng: opts.seed ?? Math.floor(Math.random() * 1e9),
  };

  const shuffled = shuffle(state.player.deck, state.rng);
  const withShuffle: CardCombatState = {
    ...state,
    rng: shuffled.next,
    player: { ...state.player, deck: shuffled.result },
  };

  return drawCards(withShuffle, 5);
}

export function endTurnAndResolve(state: CardCombatState): CardCombatState {
  if (state.phase !== "planning") return state;

  let s: CardCombatState = { ...state, phase: "resolving" };

  // Resolve each enemy's intent in order
  for (const enemy of state.enemies) {
    if (s.phase !== "resolving") break;
    s = resolveEnemyIntent(s, enemy.uid).state;
    const check = checkVictoryDefeat(s);
    if (check.phase !== "resolving") {
      s = check;
      break;
    }
  }

  // End-of-turn cleanup, draw new hand
  if (s.phase === "resolving") {
    s = endPlayerTurn(s);
    s = drawNewHand(s);
    s = { ...s, phase: "planning" };
    s = checkVictoryDefeat(s);
  }

  return s;
}
