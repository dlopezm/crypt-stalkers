import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Salt Barrier (South)
 *
 * Generated/edited via the in-game Authored Area Editor.
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 */

// prettier-ignore
export const SALT_BARRIER_SOUTH_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
  [ 1,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  8,  8,  8,  1,  1], //  0
  [ 1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1], //  1
  [ 1,  2,  2,  2,  1,  3,  3,  3,  1,  4,  4,  4,  4,  4,  4,  1,  5,  5,  5,  5,  5,  5,  5,  5,  1,  6,  6,  6,  6,  6,  1,  1], //  2
  [ 1,  2,  2,  2,  0,  3,  3,  3,  0,  4,  4,  4,  4,  4,  4,  0,  5,  5,  5,  5,  5,  5,  5,  5,  0,  6,  6,  6,  6,  6,  1,  1], //  3
  [ 1,  2,  2,  2,  1,  3,  3,  3,  1,  4,  4,  4,  4,  4,  4,  1,  5,  5,  5,  5,  5,  5,  5,  5,  1,  6,  6,  6,  6,  6,  1,  1], //  4
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  5
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  7
];

export const SALT_BARRIER_SOUTH_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Southern Approach",
    hint: "the southern stretch of the salt ring. rarely patrolled.",
    enemies: [],
    isStart: true,
  },
  3: {
    label: "Broken Line",
    hint: "the salt line is worn thin here. something has been dragging through it.",
    enemies: ["rat"],
  },
  4: {
    label: "Demonologist's Way",
    hint: "stairs descending to the south. a dry heat rises from below.",
    enemies: [],
  },
  5: {
    label: "Dark corridor",
    hint: "",
    enemies: [],
  },
  6: {
    label: "Descending corridor",
    hint: "",
    enemies: [],
  },
  7: {
    label: "South west corner",
    hint: "",
    enemies: [],
    exit: { toAreaId: "salt_barrier_west", toRoomGridId: 6 },
  },
  8: {
    label: "South east corner",
    hint: "",
    enemies: [],
    exit: { toAreaId: "salt_barrier_east", toRoomGridId: 2 },
  },
};

export const SALT_BARRIER_SOUTH: AreaDef = {
  id: "salt_barrier_south",
  name: "Salt Barrier (South)",
  desc: "The southern segment, leading toward the Demonologist's Tower.",
  difficulty: 1,
  generator: "authored",
  authored: {
    grid: SALT_BARRIER_SOUTH_GRID,
    rooms: SALT_BARRIER_SOUTH_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
};
