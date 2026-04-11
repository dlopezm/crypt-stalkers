import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 2 — The Library (R43–R50)
 * R43↔R44↔R45; R44↔R46; R43↔R47↔R48; R47↔R49; R47↔R50.
 */

// prettier-ignore
export const A2_LIBRARY_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1, 10, 10,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  1, 10, 10,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3
  [ 1,  1,  2,  2,  2,  0,  3,  3,  3,  0,  5,  5,  5,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  4  R43↔R44↔R46
  [ 1,  1,  2,  2,  2,  1,  3,  3,  3,  1,  5,  5,  5,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  5
  [ 1,  1,  2,  2,  2,  1,  3,  3,  3,  1,  5,  5,  5,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  2,  2,  2,  1,  3,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  7
  [ 1,  1,  2,  2,  2,  1,  3,  0,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  8  R44↔R45
  [ 1,  1,  2,  2,  2,  1,  4,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  9
  [ 1,  1,  2,  2,  2,  1,  4,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 10
  [ 1,  1,  2,  2,  2,  0,  6,  6,  6,  6,  6,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 11  R43↔R47
  [ 1,  1,  1,  1,  1,  1,  6,  6,  6,  6,  6,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 12
  [ 1,  1,  1,  1,  1,  1,  6,  6,  6,  6,  6,  0,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1], // 13  R47↔R48
  [ 1,  1,  1,  1,  1,  1,  6,  6,  6,  6,  6,  0,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1], // 14
  [ 1,  1,  1,  1,  1,  1,  6,  6,  6,  6,  6,  0,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1], // 15
  [ 1,  1,  1,  1,  1,  1,  6,  6,  6,  6,  6,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 16
  [ 1,  1,  1,  1,  1,  1,  6,  6,  6,  6,  6,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 17
  [ 1,  1,  1,  1,  1,  1,  6,  6,  6,  0,  8,  8,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 18  R47↔R49 (col 9)
  [ 1,  1,  1,  1,  1,  1,  6,  6,  6,  1,  8,  8,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 19
  [ 1,  1,  1,  1,  1,  1,  6,  6,  6,  6,  6,  6,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 20  R47↔R50 (col 12; avoids R49 col 10)
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  9,  9,  9,  9,  1,  1,  1,  1,  1,  1], // 21
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  9,  9,  9,  9,  1,  1,  1,  1,  1,  1], // 22
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 23
];

export const A2_LIBRARY_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Library Entrance",
    hint: "an arch demands seek and be illuminated; zombies mime shelving books that are long gone.",
    enemies: ["zombie", "zombie"],
    isStart: true,
    notes:
      "R43. COLDFIRE. Era 2+3. Room design ref R43. " +
      "Arch: 'SEEK AND BE ILLUMINATED.' Zombies mime shelving. " +
      "Connects: cloister exit grid 10, R44, R47. Chapel noise → Library Ghost risk.",
  },
  3: {
    label: "Public Stacks",
    hint: "narrow galleries of salt-preserved spines; shapes drift between shelves without feet.",
    enemies: ["ghost", "ghost"],
    notes:
      "R44. COLDFIRE. Era 2. Room design ref R44. Ghosts reshelve; quiet zone. " +
      "Theology/history (darkness bias); meditation manual (minor buff). " +
      "Connects: R43, R45, R46.",
  },
  4: {
    label: "Reading Room",
    hint: "dead lamps on desks; something small moves behind overturned furniture.",
    enemies: ["ghost"],
    notes:
      "R45. COLDFIRE. Room design ref R45. Mira encounter 2: patrol trade + R61→R41 shortcut if not blocking Upper Galleries. Hostile → loses trade. " +
      "Partial map if allied; 10 gold. Connects: R43 only (via R44 chain in layout).",
  },
  5: {
    label: "Order Archive",
    hint: "ledgers and deeds — the paper spine of tithes, licenses, and bought mines.",
    enemies: ["ghost"],
    notes:
      "R46. COLDFIRE. Room design ref R46. Tithe records; license fees; revenue vs wards; Ashvere file (twelve silver marks; 'grasping', 'deluded by entitlement'). 15 gold. " +
      "Connects: R44 only.",
  },
  6: {
    label: "Catalog Room",
    hint: "indexes and cross-reference cards point toward shelves you are not meant to open.",
    enemies: [],
    notes:
      "R47. COLDFIRE. Room design ref R47. Restricted titles list; cross-reference cards. " +
      "Connects: R43, R48, R49 (Rennic), R50 restricted door.",
  },
  7: {
    label: "Mining Records",
    hint: "baron-era maps curl at the edges; pump diagrams and reflector notes wait in the dim.",
    enemies: [],
    notes:
      "R48. DIM. Room design ref R48. Surveys; thinning vs mining timelines; investor letters. " +
      "Mine engineering (R67); reflector docs (Area 4). Connects: R47 only.",
  },
  8: {
    label: "Scholar's Alcove",
    hint: "a niche of open books and a faint glow that does not threaten — only grieves.",
    enemies: [],
    notes:
      "R49. DARK. Room design ref R49. Rennic: 'The flame answered to the voice…'; hum R40 → 'Pale Vigil.' " +
      "'Your family built this. And this place destroyed them for it.' Rennic's notes (Ending 2). " +
      "Connects: R47 only.",
  },
  9: {
    label: "Restricted Section Door",
    hint: "grandmaster seal; the keyhole is dark, and something inside tastes of swallowed light.",
    enemies: [],
    notes:
      "R50. COLDFIRE. Room design ref R50. Seal R59. 'Beyond lies knowledge too heavy for the uninitiated.' Shadow in R52. " +
      "Grid 9 = return from restricted. Exit → a2_restricted grid 2.",
    exit: { toAreaId: "a2_restricted", toRoomGridId: 2 },
  },
  10: {
    label: "Back to the Cloister",
    hint: "the cloister's coldfire and the echo of the common room.",
    enemies: [],
    exit: { toAreaId: "a2_cloister", toRoomGridId: 3 },
  },
};

export const A2_LIBRARY: AreaDef = {
  id: "a2_library",
  name: "The Library",
  desc: "Indexed knowledge and quiet ghosts — the order's public story, shelved beside the truth.",
  difficulty: 2,
  generator: "authored",
  authored: {
    grid: A2_LIBRARY_GRID,
    rooms: A2_LIBRARY_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
};
