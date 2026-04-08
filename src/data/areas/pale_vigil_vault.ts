import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * The Pale Vigil's Vault
 *
 * Generated/edited via the in-game Authored Area Editor.
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 */

// prettier-ignore
export const PALE_VIGIL_VAULT_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  5,  0,  2,  2,  1,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  5,  5,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1], //  3
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  5,  5,  1,  3,  3,  3,  1,  1,  1,  1,  1,  1], //  4
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  5,  5,  1,  3,  3,  3,  1,  1,  1,  1,  1,  1], //  5
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  5,  1,  3,  3,  3,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  5,  1,  3,  3,  3,  1,  1,  1,  1,  1,  1], //  7
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  3,  3,  1,  1,  1,  1,  1,  1], //  8
  [ 1,  1,  1,  1,  1,  1,  1,  6,  6,  6,  6,  0,  0,  1,  0,  1,  1,  1,  1,  1,  1,  1], //  9
  [ 1,  1,  1,  1,  1,  1,  1,  6,  6,  6,  6,  1,  4,  4,  4,  4,  1,  1,  1,  1,  1,  1], // 10
  [ 1,  1,  1,  1,  1,  1,  1,  6,  6,  6,  6,  1,  4,  4,  4,  4,  4,  1,  1,  1,  1,  1], // 11
  [ 1,  1,  1,  1,  1,  1,  1,  6,  6,  6,  6,  1,  1,  4,  4,  4,  4,  1,  1,  1,  1,  1], // 12
  [ 1,  1,  1,  7,  7,  7,  0,  6,  6,  6,  6,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1], // 13
  [ 1,  1,  1,  7,  7,  7,  0,  6,  6,  6,  6,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1], // 14
  [ 1,  1,  1,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  8,  8,  8,  8,  8,  8,  1,  1,  1], // 15
  [ 1,  1,  1,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  8,  8,  8,  8,  8,  8,  1,  1,  1], // 16
  [ 1,  1,  1,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  8,  8,  8,  8,  1,  1,  1,  1], // 17
  [ 1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  8,  8,  1,  1,  1,  1,  1], // 18
  [ 1,  1,  1, 10, 10, 10,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  1,  1,  1,  1,  1], // 19
  [ 1,  1,  1, 10, 10, 10,  1,  1,  1,  1,  1,  1,  1,  1,  1,  9,  9,  1,  1,  1,  1,  1], // 20
];

export const PALE_VIGIL_VAULT_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Aldric's Side Passage",
    hint: "fresh tool marks on the walls. this passage is new.",
    enemies: [],
    isStart: true,
  },
  3: {
    label: "Collapsed Cut",
    hint: "skittering. something nests in the loose fill.",
    enemies: ["rat", "rat", "rat"],
  },
  4: {
    label: "Salt Cart Junction",
    hint: "a patrolled junction",
    enemies: ["skeleton"],
  },
  5: {
    label: "Side Cache",
    hint: "stacked sacks, branded with a town's mark. rats among them.",
    enemies: ["rat", "rat"],
  },
  6: {
    label: "Storage Area",
    hint: "barrels, sacks, and all sorts of stuff on the ground. a zombie hauls some to the south ",
    enemies: ["zombie", "rat"],
  },
  7: {
    label: "Door towards Salt Barrier",
    hint: "zombies are hauling sacks and barrels towards the south door",
    enemies: [],
  },
  8: {
    label: "Gate to Barracks",
    hint: "a heavily patrolled room, a door towards the south",
    enemies: ["skeleton", "skeleton"],
  },
  9: {
    label: "Proceed",
    hint: "",
    enemies: [],
    exit: { toAreaId: "barracks", toRoomGridId: 2 },
  },
  10: {
    label: "Proceed",
    hint: "",
    enemies: [],
    exit: { toAreaId: "salt_barrier_north", toRoomGridId: 2 },
  },
};

export const PALE_VIGIL_VAULT: AreaDef = {
  id: "pale_vigil_vault",
  name: "The Pale Vigil's Vault",
  desc: "Aldric gave you a key. The wardens are long dead. Something is still moving the salt.",
  difficulty: 1,
  generator: "authored",
  authored: {
    grid: PALE_VIGIL_VAULT_GRID,
    rooms: PALE_VIGIL_VAULT_ROOMS,
  },
  combatRooms: [],
};
