import { describe, expect, it } from "vitest";
import { canPlayCard, endTurnAndResolve, initCardCombat, playCard } from "./index";
import type { CombatLoadout } from "../types";

const BASE_LOADOUT: CombatLoadout = {
  weaponId: "ashvere_knife",
  offhandId: "round_shield",
  armorId: "leather_coat",
  bag: [],
  unlockedRites: ["rite_of_parting"],
};

function startFight(overrides: Partial<Parameters<typeof initCardCombat>[0]> = {}) {
  return initCardCombat({
    loadout: BASE_LOADOUT,
    startingHp: 30,
    startingMaxHp: 30,
    startingSalt: 3,
    enemies: [{ id: "rat", uid: "rat_1", distance: 1 }],
    seed: 42,
    ...overrides,
  });
}

describe("initCardCombat", () => {
  it("initialises with a full hand, deck shuffled, stamina at cap", () => {
    const s = startFight();
    expect(s.player.hand.length).toBe(5);
    expect(s.player.stamina).toBe(s.player.maxStamina);
    expect(s.enemies).toHaveLength(1);
    expect(s.enemies[0].distance).toBe(1);
    expect(s.phase).toBe("planning");
  });

  it("skips unknown enemies", () => {
    const s = startFight({
      enemies: [
        { id: "rat", uid: "rat_1" },
        { id: "nonexistent", uid: "x" },
      ],
    });
    expect(s.enemies).toHaveLength(1);
  });
});

describe("playCard", () => {
  it("stab in range deals damage to the rat", () => {
    const s = startFight({ enemies: [{ id: "rat", uid: "rat_1", distance: 0 }] });
    const stabInHand = ensureInHand(s, "stab");
    const result = playCard(stabInHand, "stab", "rat_1");
    expect(result.ok).toBe(true);
    // Rat is HP 2, stab base 4 pierce → dead
    expect(result.state.enemies).toHaveLength(0);
    expect(result.state.corpses).toHaveLength(1);
  });

  it("refuses stab if target out of reach", () => {
    const s = startFight({ enemies: [{ id: "rat", uid: "rat_1", distance: 3 }] });
    const stabInHand = ensureInHand(s, "stab");
    const check = canPlayCard(stabInHand, "stab", "rat_1");
    expect(check.ok).toBe(false);
    expect(check.reason).toMatch(/reach/i);
  });

  it("step closes distance by 1", () => {
    const s = startFight({ enemies: [{ id: "rat", uid: "rat_1", distance: 3 }] });
    const stepInHand = ensureInHand(s, "step_close");
    const result = playCard(stepInHand, "step_close", "rat_1");
    expect(result.ok).toBe(true);
    expect(result.state.enemies[0].distance).toBe(2);
  });

  it("backstab requires helpless", () => {
    const s = startFight({ enemies: [{ id: "skeleton", uid: "sk_1", distance: 0 }] });
    const stabbed = ensureInHand(s, "backstab");
    const result = playCard(stabbed, "backstab", "sk_1");
    expect(result.ok).toBe(false);
  });

  it("cursed condition increases stamina cost by 1", () => {
    const s = startFight({ enemies: [{ id: "rat", uid: "rat_1", distance: 0 }] });
    const withCursed = ensureInHand(s, "stab");
    const cursedPlayer = {
      ...withCursed.player,
      conditions: { ...withCursed.player.conditions, cursed: 1 },
      stamina: 1, // stab normally costs 1, but cursed → 2
    };
    const cursedState = { ...withCursed, player: cursedPlayer };
    const check = canPlayCard(cursedState, "stab", "rat_1");
    expect(check.ok).toBe(false);
  });

  it("Rite of Parting consumes a corpse and heals", () => {
    const s = startFight();
    const withCorpse = {
      ...s,
      corpses: [{ enemyId: "rat", distance: 0, ageTurns: 0 }],
      player: { ...s.player, hp: 20 },
    };
    const withRite = ensureInHand(withCorpse, "rite_of_parting");
    const result = playCard(withRite, "rite_of_parting", null);
    expect(result.ok).toBe(true);
    expect(result.state.corpses).toHaveLength(0);
    expect(result.state.player.hp).toBeGreaterThan(20);
    expect(result.state.player.salt).toBe(withRite.player.salt - 1);
  });
});

describe("endTurnAndResolve", () => {
  it("moves enemy closer and redraws hand", () => {
    const s = startFight({ enemies: [{ id: "rat", uid: "rat_1", distance: 3 }] });
    const after = endTurnAndResolve(s);
    expect(after.phase).toBe("planning");
    expect(after.enemies[0].distance).toBeLessThan(3);
    expect(after.player.hand.length).toBe(5);
    expect(after.turn).toBe(2);
  });

  it("declares victory when all enemies dead", () => {
    const s = startFight({ enemies: [{ id: "rat", uid: "rat_1", distance: 0 }] });
    const withStab = ensureInHand(s, "stab");
    const mid = playCard(withStab, "stab", "rat_1");
    expect(mid.ok).toBe(true);
    const after = endTurnAndResolve(mid.state);
    expect(after.phase).toBe("victory");
  });
});

// --- Helpers ---

function ensureInHand<T extends { player: { hand: readonly string[]; deck: readonly string[] } }>(
  state: T,
  cardId: string,
): T {
  if (state.player.hand.includes(cardId)) return state;
  const allCards = [...state.player.hand, ...state.player.deck];
  if (!allCards.includes(cardId)) {
    // Add it synthetically (test deck may not have drawn it)
    return {
      ...state,
      player: { ...state.player, hand: [...state.player.hand, cardId] },
    };
  }
  // Pull it from deck into hand
  const deck = state.player.deck.filter((c) => c !== cardId);
  return {
    ...state,
    player: { ...state.player, hand: [...state.player.hand, cardId], deck },
  };
}
