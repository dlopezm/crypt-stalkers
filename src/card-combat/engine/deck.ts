import { ARMOR_MAP, OFFHAND_MAP, UNIVERSAL_CARD_IDS, WEAPON_MAP } from "../cards";
import { HAND_SIZE } from "../constants";
import type { CardCombatPlayer, CardCombatState, CombatLoadout } from "../types";
import { shuffle } from "./rng";

export function buildDeck(loadout: CombatLoadout): readonly string[] {
  const ids: string[] = [];
  ids.push(...UNIVERSAL_CARD_IDS);

  const weapon = WEAPON_MAP.get(loadout.weaponId);
  if (weapon) ids.push(...weapon.cardIds);

  if (loadout.offhandId) {
    const off = OFFHAND_MAP.get(loadout.offhandId);
    if (off) ids.push(...off.cardIds);
  }

  const armor = ARMOR_MAP.get(loadout.armorId);
  if (armor) ids.push(...armor.cardIds);

  ids.push(...loadout.bag);
  ids.push(...loadout.unlockedRites);

  return ids;
}

export function drawCards(state: CardCombatState, count: number): CardCombatState {
  let player = state.player;
  let rng = state.rng;
  const hand = player.hand.slice();
  let deck = player.deck.slice();
  let discard = player.discard.slice();

  for (let i = 0; i < count; i++) {
    if (deck.length === 0) {
      if (discard.length === 0) break;
      const shuffled = shuffle(discard, rng);
      deck = shuffled.result;
      rng = shuffled.next;
      discard = [];
    }
    const card = deck.shift();
    if (card) hand.push(card);
  }

  player = { ...player, hand, deck, discard };
  return { ...state, player, rng };
}

export function drawStartingHand(state: CardCombatState): CardCombatState {
  return drawCards(state, HAND_SIZE);
}

export function moveCardToDiscard(player: CardCombatPlayer, cardId: string): CardCombatPlayer {
  const idx = player.hand.indexOf(cardId);
  if (idx < 0) return player;
  const hand = player.hand.slice();
  hand.splice(idx, 1);
  return { ...player, hand, discard: [...player.discard, cardId] };
}
