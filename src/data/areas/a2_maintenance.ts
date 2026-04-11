import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 2 — Maintenance Halls (R62–R68)
 * R62↔R63↔R64; R62↔R65,R66; R62↔R67↔R68; R68↔exits Area4/armory.
 */

// prettier-ignore
export const A2_MAINTENANCE_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  9,  9,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  1,  9,  9,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3
  [ 1,  1,  2,  2,  2,  0,  3,  3,  3,  0,  5,  5,  5,  1,  1,  1,  1,  1,  1], //  4  R62|R63|R64
  [ 1,  1,  2,  2,  2,  1,  3,  3,  3,  1,  5,  5,  5,  1,  1,  1,  1,  1,  1], //  5
  [ 1,  1,  2,  2,  2,  0,  4,  4,  1,  1,  5,  5,  5,  0, 10, 10,  1,  1,  1], //  6  R62↔R65; R64↔exit10
  [ 1,  1,  2,  2,  2,  1,  1,  1,  1,  1,  1,  1,  1,  1, 10, 10,  1,  1,  1], //  7
  [ 1,  1,  2,  2,  2,  0,  6,  6,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  8  R62↔R66
  [ 1,  1,  2,  2,  2,  1,  6,  6,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  9
  [ 1,  1,  2,  2,  2,  0,  7,  7,  7,  0,  8,  8,  8,  1,  1,  1,  1,  1,  1], // 10  R62↔R67↔R68
  [ 1,  1,  2,  2,  2,  1,  7,  7,  7,  1,  8,  8,  8,  1,  1,  1,  1,  1,  1], // 11
  [ 1,  1,  1,  1,  1,  1,  7,  7,  7,  1,  8,  8,  8,  0, 12, 12,  1,  1,  1], // 12  R68↔armory (col13)
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  8,  8,  8,  1, 12, 12,  1,  1,  1], // 13
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  8,  8,  8,  0, 11, 11,  1,  1,  1], // 14  R68↔Area4
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  8,  8,  8,  1, 11, 11,  1,  1,  1], // 15
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 11, 11,  1,  1,  1], // 16
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 17
];

export const A2_MAINTENANCE_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Service Corridor",
    hint: "pipes crowd the ceiling; zombies haul crates in a maintenance pantomime.",
    enemies: ["zombie", "zombie"],
    isStart: true,
    notes:
      "R62. COLDFIRE. Era 2. Room design ref R62. Cramped; ceiling pipes. Zombies haul tool crates — maintenance pantomime. " +
      "Connects: R31 cloister (exit grid 9), R63 stores, R65 workshop, R66 lamp workshop, R67 pump room.",
  },
  3: {
    label: "Kitchen Stores",
    hint: "pantry shelves stripped of rot; rats argue over salt-cured scraps.",
    enemies: ["rat", "rat", "rat", "rat"],
    notes:
      "R63. DIM. Era 2. Room design ref R63. " +
      "Contains: lamp oil ×3 (FIRE part 1); dried salt; 8 gold (cook's stash). " +
      "Connects: R62, R64 kitchen.",
  },
  4: {
    label: "Workshop",
    hint: "pegs and a bench; a zombie turns a wheel that will never fit anything again.",
    enemies: ["zombie"],
    notes:
      "R65. COLDFIRE. Era 2+3. Room design ref R65. " +
      "Glass flasks ×3 (FIRE part 2 — combine R63 oil); tools; 10 gold. " +
      "Connects: R62 only.",
  },
  5: {
    label: "Kitchen",
    hint: "ovens and a working well; cleaver rings on stone that will never be meat.",
    enemies: ["zombie", "zombie", "zombie"],
    notes:
      "R64. COLDFIRE. Era 2+3. Room design ref R64. Ovens; working well (extinguish/cleanse); kitchen cleaver (melee); 5 gold. " +
      "Zombies 'cook'; one chops stone forever. Connects: R63, cloister refectory exit grid 10 (R35).",
  },
  6: {
    label: "Lamp Workshop",
    hint: "half-built lanterns; one brass shell waits with a lever and a salt-crystal lens.",
    enemies: [],
    notes:
      "R66. DIM. Era 2. Room design ref R66. " +
      "SHUTTERED LANTERN (RELIABLE LIGHT): open = true flame; shut = dark; consumes lamp oil; longer burn than torch. " +
      "Connects: R62 only.",
  },
  7: {
    label: "Pump Room",
    hint: "Era 1 iron and Era 2 gauges — frozen until someone reads the right sequence.",
    enemies: [],
    notes:
      "R67. DIM. Era 1+2. Room design ref R67. Era 1 pumps + Era 2 controls. Pump activation needs R48 mine engineering docs; wrong guesses risk jam/flood. Drains R68 and Area 4 Drained Tunnels (R111–R116). " +
      "Connects: R62, R68.",
  },
  8: {
    label: "Drain Access",
    hint: "water breathes at the lip of the shaft; something floral chokes the deep air.",
    enemies: [],
    notes:
      "R68. DARK. Era 1+2. Room design ref R68. Waist-deep water until pumps run. Skullflower at waterline — enemy type not in list; needs FIRE after drain to clear. " +
      "Dual gate to Area 4: infrastructure knowledge + fire. Alternate R74 Lower Gate West when Skullflower cleared + pumps drained. " +
      "Grid 8 = arrival from a4_drained_tunnels and a2_armory R74. Exits: Area 4 (grid 11), armory (grid 12).",
  },
  9: {
    label: "Back to the Cloister (Common Room)",
    hint: "stone benches and the hum of the common hall.",
    enemies: [],
    exit: { toAreaId: "a2_cloister", toRoomGridId: 3 },
  },
  10: {
    label: "Back to the Cloister (Refectory)",
    hint: "salt tables and the matins bell's ghost.",
    enemies: [],
    exit: { toAreaId: "a2_cloister", toRoomGridId: 6 },
  },
  11: {
    label: "To the Deep Workings",
    hint: "the shaft drops into wet dark and older stone.",
    enemies: [],
    exit: { toAreaId: "a4_drained_tunnels", toRoomGridId: 2 },
  },
  12: {
    label: "Back to the Armory",
    hint: "drills and racks somewhere above.",
    enemies: [],
    exit: { toAreaId: "a2_armory", toRoomGridId: 7 },
  },
};

export const A2_MAINTENANCE: AreaDef = {
  id: "a2_maintenance",
  name: "Maintenance Halls",
  desc: "Kitchens, workshops, and pumps — where fire, reliable light, and the deep drain are assembled.",
  difficulty: 2,
  generator: "authored",
  authored: {
    grid: A2_MAINTENANCE_GRID,
    rooms: A2_MAINTENANCE_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
};
