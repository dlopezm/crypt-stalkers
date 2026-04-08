import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * The Barracks
 *
 * Generated/edited via the in-game Authored Area Editor.
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 */

// prettier-ignore
export const BARRACKS_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16
  [ 1, 10, 10, 10,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  0,  1,  1,  3,  3,  3,  3,  0,  4,  4,  4,  4,  4,  4,  1], //  1
  [ 1,  2,  2,  2,  0,  3,  3,  3,  3,  1,  4,  4,  4,  4,  4,  4,  1], //  2
  [ 1,  2,  2,  2,  1,  3,  3,  3,  3,  1,  4,  4,  4,  4,  4,  4,  1], //  3
  [ 1,  2,  2,  2,  1,  1,  1,  0,  1,  1,  1,  1,  0,  1,  1,  1,  1], //  4
  [ 1,  1,  1,  0,  1,  1,  1,  6,  6,  6,  1,  5,  5,  5,  5,  5,  1], //  5
  [ 1,  8,  8,  8,  1,  1,  1,  6,  6,  6,  1,  5,  5,  5,  5,  5,  1], //  6
  [ 1,  8,  8,  8,  1,  1,  1,  6,  6,  6,  1,  5,  5,  5,  5,  5,  1], //  7
  [ 1,  8,  8,  8,  1,  1,  1,  1,  1,  1,  1,  5,  5,  5,  5,  5,  1], //  8
  [ 1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  5,  5,  5,  5,  5,  1], //  9
  [ 1,  1,  7,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 10
  [ 1,  7,  7,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 11
  [ 1,  7,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 12
  [ 1,  7,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 13
  [ 1,  1,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 14
  [ 1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 15
  [ 1,  1,  9,  9,  9,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 16
];

export const BARRACKS_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Guard Post",
    hint: "a muster room, half-rotted weapons still racked along one wall.",
    enemies: [],
    isStart: true,
  },
  3: {
    label: "Bunk Row",
    hint: "rows of straw bedding. the blankets still smell of their long-dead owners.",
    enemies: ["skeleton"],
  },
  4: {
    label: "Mess Hall",
    hint: "long benches, overturned. something large has been eating here, and recently.",
    enemies: ["zombie", "skeleton"],
  },
  5: {
    label: "Armory",
    hint: "broken racks, but a few good blades remain. someone left in a hurry.",
    enemies: ["skeleton", "skeleton"],
  },
  6: {
    label: "Drill Yard",
    hint: "the captain of the watch stands alone at the center, patient, waiting.",
    enemies: ["skeleton", "skeleton", "necromancer"],
    isBoss: true,
  },
  7: {
    label: "Corridor",
    hint: "",
    enemies: [],
  },
  8: {
    label: "Central room",
    hint: "",
    enemies: [],
  },
  9: {
    label: "Leave barracks",
    hint: "",
    enemies: [],
    exit: { toAreaId: "salt_barrier_north", toRoomGridId: 7 },
  },
  10: {
    label: "To excursion corridors",
    hint: "",
    enemies: [],
    exit: { toAreaId: "pale_vigil_vault", toRoomGridId: 7 },
  },
};

export const BARRACKS: AreaDef = {
  id: "barracks",
  name: "The Barracks",
  desc: "Where the old garrison mustered. The dead still drill here.",
  difficulty: 1,
  generator: "authored",
  authored: {
    grid: BARRACKS_GRID,
    rooms: BARRACKS_ROOMS,
  },
  combatRooms: [],
  bossRoom: {
    label: "Drill Yard",
    enemies: ["skeleton", "skeleton", "necromancer"],
    hint: "the captain of the watch stands alone at the center, patient, waiting.",
  },
  hiddenFromTown: true,
};
