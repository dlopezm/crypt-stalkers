import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 5 — Founder's Reliquary — Order's Sanctum (R157–R162)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * Graph: 157(2)↔158(3)↔159(4)↔160(5); 2↔161(7)↔10(throne); 2↔8(MQ); 2↔9(colonnade).
 */

// prettier-ignore
export const A5_SANCTUM_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  0, 10, 10,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  1, 10, 10,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  4
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  5
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  1,  1,  9,  9,  0,  0,  0,  2,  2,  2,  0,  3,  3,  3,  0,  4,  4,  4,  0,  5,  5,  5,  1,  1,  1,  1], //  7
  [ 1,  1,  1,  1,  9,  9,  1,  1,  1,  2,  2,  2,  1,  3,  3,  3,  1,  4,  4,  4,  1,  5,  5,  5,  1,  1,  1,  1], //  8
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  1,  3,  3,  3,  1,  4,  4,  4,  1,  5,  5,  5,  1,  1,  1,  1], //  9
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 10
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  8,  8,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 11
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  8,  8,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 12
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 13
];

export const A5_SANCTUM_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Sanctum Entrance",
    hint: "a single slab of salt frames the door; founding figures kneel toward a carved crystal that matches what lies ahead.",
    enemies: ["necromancer", "boss_skeleton_lord"],
    isStart: true,
    notes:
      "R157. Dark. Inner Circle Necromancer (type necromancer; stats note: HP 12, ATK 8 — stronger than stock) + Elite Skeleton ×1 (boss_skeleton_lord) as gate guards. " +
      "Grand doorway carving: order founding around crystal formation matching real formation ahead. " +
      "Hidden passage to R162: second entrance toward Mortal Quarters — harder to spot than R146 panel (cross-ref R162, R168). " +
      "MISSING: cultist (notes). Cross-ref: R156, R158, R161, R162.",
  },
  3: {
    label: "Altar Room",
    hint: "a cracked crystal altar wears two liturgies at once — hymn lines and something hungrier.",
    enemies: [],
    notes:
      "R158. Coldfire. No enemies. Massive salt-crystal altar; cracked; stained with centuries of rite residue. Era 2: Vigil Hymn notation. Era 3: necromantic reroute into lich power grid. Sacred brazier stand (extinguished). " +
      "Loot/read: altar inscriptions (hymn importance). " +
      "World-state — optional brazier: relight with hymn ritual → true light floods altar + adjacent spaces → weakens lich light suppression in Crystal Throne subarea. " +
      "If player consecrates altar: during R165 encounter Serevic may quip (impatient): \"You restored a ritual that maintains nothing. Efficient.\" " +
      "Brazier flood is a teaching beat tying consecration / hymn mastery to boss-phase economy. " +
      "Cross-ref: R159, R165, Area 2 hymn sources.",
  },
  4: {
    label: "Relic Chamber",
    hint: "empty cases; one seal still hungers for consecration before it opens.",
    enemies: [],
    notes:
      "R159. Coldfire. Display cases emptied by lich; one consecration-locked case remains. " +
      "Loot: blessed salt-iron amulet (best anti-undead accessory: necromancy resist + bonus vs undead). Relic inventory list (lich resource hoarding context). " +
      "Cross-ref: R158, R160, R165 combat prep.",
  },
  5: {
    label: "Brazier of the Deep",
    hint: "the grandest brazier stand, cold — first lit by the order, last put out by the throne.",
    enemies: [],
    notes:
      "R160. Dark. Dead end. Deepest sacred brazier — first lit by order, last extinguished by lich; older/grander than others. " +
      "World-state — DEEP BRAZIER (major optional): relight requires perfect hymn performance; true light floods R157–R161; sharply weakens lich light suppression toward throne; affects R163–R167 phase pacing. " +
      "Stacks with R158 brazier and Area 4 Crystal Master Array for Light Climax at R164. Cross-ref: R164, R165.",
  },
  7: {
    label: "Sanctum Gallery",
    hint: "murals fade into an unfinished stroke, as if the painter learned the ending.",
    enemies: ["boss_skeleton_lord"],
    notes:
      "R161. Coldfire. Salt-crystal walls; faded Era 2 murals (founding → growth → unfinished panel mid-stroke). Elite Skeleton ×1 (boss_skeleton_lord) slow patrol. " +
      "Opens toward final cavern. Convention: grid 7 = return from a5_crystal_throne; colonnade return lands at R157 (grid 2), not here. " +
      "Cross-ref: R163, R156.",
  },
  8: {
    label: "Hidden Passage",
    hint: "service stone, thick dust — on no chart the lich bothered to update.",
    enemies: [],
    exit: { toAreaId: "a5_mortal_quarters", toRoomGridId: 2 },
    notes:
      "R162. Dark. Narrow service route R146 ↔ R157 ↔ R168; not on maps; lich uses for efficiency. " +
      "Pair: Mortal Quarters exit 6 → sanctum grid 8. Outer Ward hidden panel → mortal grid 2. Cross-ref: R146, R168.",
  },
  9: {
    label: "Back to Colonnade",
    hint: "column light behind you; the threshold remembers your footsteps.",
    enemies: [],
    exit: { toAreaId: "a5_colonnade", toRoomGridId: 7 },
    notes:
      "Exit. Returns to colonnade R156 (grid 7). Pair: Colonnade room 8 → sanctum grid 2 (R157).",
  },
  10: {
    label: "Toward the Crystal Throne",
    hint: "the air thickens; suppression nibbles at every flame you carry.",
    enemies: [],
    exit: { toAreaId: "a5_crystal_throne", toRoomGridId: 2 },
    notes:
      "Exit to a5_crystal_throne R163 (grid 2). Pair: Crystal Throne \"Back to the Sanctum\" → sanctum grid 7 (R161). Cross-ref: R163.",
  },
};

export const A5_SANCTUM: AreaDef = {
  id: "a5_sanctum",
  name: "Order's Sanctum",
  desc: "Holiest salt-work of the vigil — rerouted by the throne, still singing if you know the tune.",
  difficulty: 5,
  generator: "authored",
  authored: {
    grid: A5_SANCTUM_GRID,
    rooms: A5_SANCTUM_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
};
