import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 2 — Chapter House (R56–R61)
 */

// prettier-ignore
export const A2_CHAPTER_HOUSE_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1  R57
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3  R57↔R56
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  2,  2,  1,  1,  1,  1,  1,  1,  1,  1], //  4  R56
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  2,  2,  1,  1,  1,  1,  1,  1,  1,  1], //  5
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  2,  2,  1,  1,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  2,  2,  1,  1,  1,  1,  1,  1,  1,  1], //  7
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  2,  2,  1,  1,  1,  1,  1,  1,  1,  1], //  8
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  0,  4,  4,  0,  5,  5,  1,  1,  1], //  9  R56↔R58; R58↔R59
  [ 1,  1,  8,  8,  1,  1,  1,  1,  1,  2,  2,  2,  2,  2,  1,  5,  5,  1,  1,  1,  1,  1], // 10
  [ 1,  1,  8,  8,  0,  0,  0,  0,  0,  0,  2,  2,  2,  2,  2,  2,  2,  2,  0,  9,  9,  1], // 11  exit8; armory
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  2,  2,  0,  6,  6,  6,  1,  9,  9,  1], // 12  R56↔R60
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  6,  6,  6,  1,  1,  1,  1], // 13
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1], // 14
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7,  1,  1,  1,  1,  1], // 15  R61
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7,  1,  1,  1,  1,  1], // 16
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 17
];

export const A2_CHAPTER_HOUSE_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Chapter Hall",
    hint: "horseshoe table; a necromancer sits like a clerk at the head, zombies at stiff attention.",
    enemies: ["necromancer", "zombie", "zombie", "zombie", "zombie"],
    isStart: true,
    notes:
      "R56. COLDFIRE. Era 2+3. Room design ref R56. Operational map Areas 3–5; 20 gold; necromancer kill → zombies inert. " +
      "Connects: R57, R58, R59 (walk through R58: edges 2–4 and 4–5; isolated 2–5 door would merge corridors and add false edges), R60, cloister exit, armory exit.",
  },
  3: {
    label: "Grandmaster's Study",
    hint: "patrol dispatches and a portrait of someone still human — eyes you across the years.",
    enemies: [],
    notes:
      "R57. COLDFIRE. Room design ref R57. Patrol dispatches; Serevic portrait; 30 gold. Cultist ×1 not in list. " +
      "Connects: R56 only.",
  },
  4: {
    label: "Scribe's Room",
    hint: "a zombie scratches blank paper while shelves hold deployment logs and rosters.",
    enemies: ["zombie"],
    notes:
      "R58. COLDFIRE. Room design ref R58. Deployment logs; warden roster. Connects: R56 only.",
  },
  5: {
    label: "Seal Room",
    hint: "ruined ceremonial seals on velvet; one stamp still reads clear enough to open heavy doors.",
    enemies: [],
    notes:
      "R59. COLDFIRE. Room design ref R59. Library seal (R50); order seal. Connects: R56 only.",
  },
  6: {
    label: "Portrait Gallery",
    hint: "grandmaster after grandmaster — dignity thinning to strain — then a blank wall.",
    enemies: [],
    notes:
      "R60. COLDFIRE. Room design ref R60. Succession portraits; blank wall. Connects: R56, R61.",
  },
  7: {
    label: "Upper Passage",
    hint: "narrow maintenance cut; air from the cavern below carries old smoke and cold stone.",
    enemies: [],
    notes:
      "R61. DARK. Room design ref R61. To Chapel R41; Mira shortcut (R45). Arrival from chapel exit 9. Exit → a2_chapel grid 6.",
    exit: { toAreaId: "a2_chapel", toRoomGridId: 6 },
  },
  8: {
    label: "Back to the Cloister",
    hint: "the dormitory hub and the inner gate route.",
    enemies: [],
    exit: { toAreaId: "a2_cloister", toRoomGridId: 3 },
  },
  9: {
    label: "Toward Armory & Lower Gate",
    hint: "posted orders and racks of steel beyond.",
    enemies: [],
    exit: { toAreaId: "a2_armory", toRoomGridId: 2 },
  },
};

export const A2_CHAPTER_HOUSE: AreaDef = {
  id: "a2_chapter_house",
  name: "Chapter House",
  desc: "Administration and command — maps, seals, and portraits of authority outlasting its purpose.",
  difficulty: 2,
  generator: "authored",
  authored: {
    grid: A2_CHAPTER_HOUSE_GRID,
    rooms: A2_CHAPTER_HOUSE_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
};
