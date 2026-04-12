import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Salt Barrier (East)
 *
 * Generated/edited via the in-game Authored Area Editor.
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 */

// prettier-ignore
export const SALT_BARRIER_EAST_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7
  [ 1,  1,  1,  8,  8,  8,  1,  1], //  0
  [ 1,  1,  1,  1,  0,  1,  1,  1], //  1
  [ 1,  1,  1,  2,  2,  2,  1,  1], //  2
  [ 1,  1,  1,  2,  2,  2,  1,  1], //  3
  [ 1,  1,  1,  2,  2,  2,  1,  1], //  4
  [ 1,  1,  1,  1,  0,  1,  1,  1], //  5
  [ 1,  1,  1,  3,  3,  3,  1,  1], //  6
  [ 1,  1,  1,  3,  3,  3,  1,  1], //  7
  [ 1,  1,  1,  3,  3,  3,  1,  1], //  8
  [ 1,  1,  1,  3,  3,  3,  1,  1], //  9
  [ 1,  1,  1,  3,  3,  3,  1,  1], // 10
  [ 1,  1,  1,  3,  3,  3,  1,  1], // 11
  [ 1,  1,  1,  1,  0,  1,  1,  1], // 12
  [ 1,  1,  1,  4,  4,  4,  1,  1], // 13
  [ 1,  1,  1,  4,  4,  4,  1,  1], // 14
  [ 1,  1,  1,  4,  4,  4,  1,  1], // 15
  [ 1,  1,  1,  4,  4,  4,  1,  1], // 16
  [ 1,  1,  1,  4,  4,  4,  1,  1], // 17
  [ 1,  1,  1,  1,  0,  1,  1,  1], // 18
  [ 1,  1,  1,  5,  5,  5,  1,  1], // 19
  [ 1,  1,  1,  5,  5,  5,  1,  1], // 20
  [ 1,  1,  1,  5,  5,  5,  1,  1], // 21
  [ 1,  1,  1,  5,  5,  5,  1,  1], // 22
  [ 1,  1,  1,  5,  5,  5,  1,  1], // 23
  [ 1,  1,  1,  1,  0,  1,  1,  1], // 24
  [ 1,  1,  1,  6,  6,  6,  1,  1], // 25
  [ 1,  1,  1,  6,  6,  6,  1,  1], // 26
  [ 1,  1,  1,  6,  6,  6,  1,  1], // 27
  [ 1,  1,  1,  6,  6,  6,  1,  1], // 28
  [ 1,  1,  1,  6,  6,  6,  1,  1], // 29
  [ 1,  1,  1,  1,  0,  1,  1,  1], // 30
  [ 1,  1,  1,  7,  7,  7,  1,  1], // 31
];

export const SALT_BARRIER_EAST_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Eastern Approach",
    hint: "the salt line here is intact, but only just. someone has been patching it.",
    enemies: [],
    isStart: true,
  },
  3: {
    label: "Cracked Reliquary",
    hint: "shards of carved stone scattered across the floor. the relics are gone.",
    enemies: ["rat"],
  },
  4: {
    label: "Mausoleum Approach",
    hint: "a heavy door to the east, sealed shut. behind it lies the mausoleum proper.",
    enemies: [],
  },
  5: {
    label: "Next segment",
    hint: "",
    enemies: [],
  },
  6: {
    label: "South Curve",
    hint: "the corridor curves south. dust hangs in the air, undisturbed.",
    enemies: [],
  },
  7: {
    label: "South east corner",
    hint: "",
    enemies: [],
    exit: { toAreaId: "salt_barrier_south", toRoomGridId: 6 },
  },
  8: {
    label: "North east corner",
    hint: "",
    enemies: [],
    exit: { toAreaId: "salt_barrier_north", toRoomGridId: 4 },
  },
};

export const SALT_BARRIER_EAST: AreaDef = {
  id: "salt_barrier_east",
  name: "Salt Barrier (East)",
  desc: "The eastern segment, leading toward the Mausoleum.",
  difficulty: 1,
  generator: "authored",
  authored: {
    grid: SALT_BARRIER_EAST_GRID,
    rooms: SALT_BARRIER_EAST_ROOMS,
  },
  combatRooms: [],
};
