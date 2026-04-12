import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Salt Barrier (North)
 *
 * Generated/edited via the in-game Authored Area Editor.
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 */

// prettier-ignore
export const SALT_BARRIER_NORTH_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
  [ 1,  1,  1,  1,  1,  1,  1, 12, 12, 12,  1,  1,  1,  1,  1,  1,  1,  1,  9,  9,  9,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  5,  5,  1,  3,  3,  1,  2,  2,  2,  1,  4,  4,  4,  4,  4,  1,  7,  7,  7,  7,  7,  1,  8,  8,  8,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  5,  5,  0,  3,  3,  0,  2,  2,  2,  0,  4,  4,  4,  4,  4,  0,  7,  7,  7,  7,  7,  0,  8,  8,  8,  1,  1,  1,  1,  1,  1], //  3
  [ 1,  5,  5,  1,  3,  3,  1,  2,  2,  2,  1,  4,  4,  4,  4,  4,  1,  7,  7,  7,  7,  7,  1,  8,  8,  8,  1,  1,  1,  1,  1,  1], //  4
  [ 1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1], //  5
  [ 1, 11, 11,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 10, 10, 10,  1,  1,  1,  1,  1,  1], //  6
  [ 1, 11, 11,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 10, 10, 10,  1,  1,  1,  1,  1,  1], //  7
];

export const SALT_BARRIER_NORTH_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Entry from the Corridors",
    hint: "the salt line is broken here. boot prints lead off in every direction.",
    enemies: [],
    isStart: true,
  },
  3: {
    label: "Salt-Crusted Junction",
    hint: "white crystals crunch underfoot. the air smells of brine and old iron.",
    enemies: ["rat"],
  },
  4: {
    label: "East Turn",
    hint: "the barrier curves east. something scuttles past the broken line.",
    enemies: [],
  },
  5: {
    label: "West Turn",
    hint: "the barrier curves west. salt sacks lie split open along the wall.",
    enemies: [],
  },
  6: {
    label: "Inner View",
    hint: "from here you can see the salt line stretching inward. something vast pulses beyond it.",
    enemies: [],
  },
  7: {
    label: "Corridor",
    hint: "",
    enemies: [],
  },
  8: {
    label: "East Corner",
    hint: "",
    enemies: [],
  },
  9: {
    label: "To barracks",
    hint: "",
    enemies: [],
    exit: { toAreaId: "barracks", toRoomGridId: 7 },
  },
  10: {
    label: "East corner",
    hint: "",
    enemies: [],
    exit: { toAreaId: "salt_barrier_east", toRoomGridId: 2 },
  },
  11: {
    label: "West corner",
    hint: "",
    enemies: [],
    exit: { toAreaId: "salt_barrier_west", toRoomGridId: 2 },
  },
  12: {
    label: "To corridors",
    hint: "",
    enemies: [],
    exit: { toAreaId: "pale_vigil_vault", toRoomGridId: 7 },
  },
};

export const SALT_BARRIER_NORTH: AreaDef = {
  id: "salt_barrier_north",
  name: "Salt Barrier (North)",
  desc: "The northern segment of the salt ring. Rats avoid the salt — when they can.",
  difficulty: 1,
  generator: "authored",
  authored: {
    grid: SALT_BARRIER_NORTH_GRID,
    rooms: SALT_BARRIER_NORTH_ROOMS,
  },
  combatRooms: [],
};
