import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 2 — Restricted Archive (R51–R55)
 * R51↔R52↔R55; R51↔R53; R51↔R54; exit7↔R51.
 */

// prettier-ignore
export const A2_RESTRICTED_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  1,  1,  1,  5,  5,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2  R54 (north)
  [ 1,  1,  1,  1,  5,  5,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3
  [ 1,  1,  7,  7,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  4  exit7; R54↔R51
  [ 1,  1,  7,  7,  1,  2,  2,  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  5  R51 top (R54↔R51 via r4 col5)
  [ 1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  2,  2,  2,  0,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  7  R51↔R53
  [ 1,  1,  2,  2,  2,  1,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  8
  [ 1,  1,  2,  2,  2,  0,  3,  3,  3,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1], //  9  R51↔R52
  [ 1,  1,  2,  2,  2,  1,  3,  3,  3,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1], // 10
  [ 1,  1,  1,  1,  1,  1,  3,  3,  3,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1], // 11
  [ 1,  1,  1,  1,  1,  1,  3,  3,  3,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1], // 12
  [ 1,  1,  1,  1,  1,  1,  3,  3,  3,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1], // 13
  [ 1,  1,  1,  1,  1,  1,  3,  3,  3,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1], // 14
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1], // 15  R52↔R55
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  6,  6,  1,  1,  1], // 16
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  6,  6,  1,  1,  1], // 17
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 18
];

export const A2_RESTRICTED_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Restricted Vestibule",
    hint: "archivist desk and seal wax; the air tastes of ink and withheld answers.",
    enemies: [],
    isStart: true,
    notes:
      "R51. COLDFIRE. Era 2. Room design ref R51. " +
      "Archivist checkpoint. Cultist ×1 not in enemy list — fight, sneak, bluff library seal (R59), or Voss cultist disguise. " +
      "Connects: R50 (grid 9), R52, R53 ritual texts, R54 confessions.",
  },
  3: {
    label: "Shadow Corridor",
    hint: "your light thins with every step; the dark ahead has teeth.",
    enemies: ["shadow"],
    notes:
      "R52. DARK. Era 2+3. Room design ref R52. " +
      "Shadow consumes non-crystal lantern light in 2–3 turns. Crystal Lantern backtrack gate; return from Area 4 to reach R55. " +
      "Connects: R51, R55.",
  },
  4: {
    label: "Ritual Texts",
    hint: "ceremonial vault: melody, gesture, invocation — and a map of every sacred brazier.",
    enemies: [],
    notes:
      "R53. COLDFIRE. Room design ref R53. Full brazier relighting; consecration half (relic Area 3 R102); dungeon brazier map. " +
      "Connects: R51 only.",
  },
  5: {
    label: "Order Confessions",
    hint: "internal ledgers that admit what the pulpits never did.",
    enemies: [],
    notes:
      "R54. COLDFIRE. Room design ref R54. Tithe skimming; land seizure; recruitment quotas; dissident knight letter ('we guard nothing and profit from the guarding'); annotation 'Expelled. Let the salt take his doubts.' " +
      "Connects: R51 only.",
  },
  6: {
    label: "Serevic's Journal",
    hint: "a locked cabinet past the shadow — handwriting still precise, still human.",
    enemies: [],
    notes:
      "R55. DARK. Room design ref R55. Barrier math; council raised tithe vs degradation; 30–50 year failure proof; hymn entry 'I wonder if that matters.' Ending 4 item. " +
      "Connects: R52 only.",
  },
  7: {
    label: "Back to the Library Door",
    hint: "the grandmaster seal and the inscription on the public side.",
    enemies: [],
    exit: { toAreaId: "a2_library", toRoomGridId: 9 },
  },
};

export const A2_RESTRICTED: AreaDef = {
  id: "a2_restricted",
  name: "Restricted Archive",
  desc: "What tithes bought but towns never saw — geology, rites, and confession in one locked wing.",
  difficulty: 3,
  generator: "authored",
  authored: {
    grid: A2_RESTRICTED_GRID,
    rooms: A2_RESTRICTED_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
};
