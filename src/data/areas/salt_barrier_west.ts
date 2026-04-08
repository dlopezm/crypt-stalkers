import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Salt Barrier (West)
 *
 * Generated/edited via the in-game Authored Area Editor.
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 */

// prettier-ignore
export const SALT_BARRIER_WEST_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7
  [ 1,  1,  8,  8,  8,  1,  1,  1], //  0
  [ 1,  1,  1,  0,  1,  1,  1,  1], //  1
  [ 1,  1,  2,  2,  2,  1,  1,  1], //  2
  [ 1,  1,  2,  2,  2,  1,  1,  1], //  3
  [ 1,  1,  2,  2,  2,  1,  1,  1], //  4
  [ 1,  1,  1,  0,  1,  1,  1,  1], //  5
  [ 1,  1,  3,  3,  3,  1,  1,  1], //  6
  [ 1,  1,  3,  3,  3,  1,  1,  1], //  7
  [ 1,  1,  3,  3,  3,  1,  1,  1], //  8
  [ 1,  1,  3,  3,  3,  1,  1,  1], //  9
  [ 1,  1,  1,  0,  1,  1,  1,  1], // 10
  [ 1,  1,  4,  4,  4,  1,  1,  1], // 11
  [ 1,  1,  4,  4,  4,  1,  1,  1], // 12
  [ 1,  1,  4,  4,  4,  1,  1,  1], // 13
  [ 1,  1,  4,  4,  4,  1,  1,  1], // 14
  [ 1,  1,  4,  4,  4,  1,  1,  1], // 15
  [ 1,  1,  4,  4,  4,  1,  1,  1], // 16
  [ 1,  1,  1,  0,  1,  1,  1,  1], // 17
  [ 1,  1,  5,  5,  5,  1,  1,  1], // 18
  [ 1,  1,  5,  5,  5,  1,  1,  1], // 19
  [ 1,  1,  5,  5,  5,  1,  1,  1], // 20
  [ 1,  1,  5,  5,  5,  1,  1,  1], // 21
  [ 1,  1,  5,  5,  5,  1,  1,  1], // 22
  [ 1,  1,  5,  5,  5,  1,  1,  1], // 23
  [ 1,  1,  1,  0,  1,  1,  1,  1], // 24
  [ 1,  1,  6,  6,  6,  1,  1,  1], // 25
  [ 1,  1,  6,  6,  6,  1,  1,  1], // 26
  [ 1,  1,  6,  6,  6,  1,  1,  1], // 27
  [ 1,  1,  6,  6,  6,  1,  1,  1], // 28
  [ 1,  1,  6,  6,  6,  1,  1,  1], // 29
  [ 1,  1,  1,  0,  1,  1,  1,  1], // 30
  [ 1,  1,  7,  7,  7,  1,  1,  1], // 31
];

export const SALT_BARRIER_WEST_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Western Approach",
    hint: "the smell of old books drifts in from somewhere west of here.",
    enemies: [],
    isStart: true,
  },
  3: {
    label: "Library Antechamber",
    hint: "a low desk, papers half-eaten by damp. the libraries lie further west.",
    enemies: ["rat"],
  },
  4: {
    label: "Maintenance Hatch",
    hint: "a square hatch in the floor — the old salt mine maintenance shaft.",
    enemies: [],
  },
  5: {
    label: "Corridor",
    hint: "",
    enemies: ["skeleton"],
  },
  6: {
    label: "South Curve",
    hint: "the corridor bends south. you can hear distant chanting.",
    enemies: [],
  },
  7: {
    label: "South west corner",
    hint: "",
    enemies: [],
    exit: { toAreaId: "salt_barrier_south", toRoomGridId: 2 },
  },
  8: {
    label: "North west corner",
    hint: "",
    enemies: [],
    exit: { toAreaId: "salt_barrier_north", toRoomGridId: 5 },
  },
};

export const SALT_BARRIER_WEST: AreaDef = {
  id: "salt_barrier_west",
  name: "Salt Barrier (West)",
  desc: "The western segment, leading toward the Libraries and the Old Salt Mines.",
  difficulty: 1,
  generator: "authored",
  authored: {
    grid: SALT_BARRIER_WEST_GRID,
    rooms: SALT_BARRIER_WEST_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
};
