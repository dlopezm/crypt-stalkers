import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 2 — Armory & Lower Gate (R69–R74)
 * R69↔R70↔R71; R69↔R72; R72↔R73; R72↔R74. R73 = combat only; grid10 = transit exit to a3_threshold.
 */

// prettier-ignore
export const A2_ARMORY_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  8,  8,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  1,  8,  8,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3
  [ 1,  1,  2,  2,  2,  0,  3,  3,  3,  0,  4,  4,  1,  1,  1,  1,  1,  1], //  4  R69|R70|R71
  [ 1,  1,  2,  2,  2,  1,  3,  3,  3,  1,  4,  4,  1,  1,  1,  1,  1,  1], //  5
  [ 1,  1,  2,  2,  2,  0,  6,  6,  6,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  6  R69↔R72
  [ 1,  1,  1,  1,  1,  1,  6,  6,  6,  0,  5,  5,  1,  1,  1,  1,  1,  1], //  7  R72↔R73 only
  [ 1,  1,  1,  1,  1,  1,  6,  6,  6,  1,  5,  5,  1,  6,  0, 10, 10,  1], //  8  R72↔exit10 (no link 5↔10)
  [ 1,  1,  1,  1,  1,  0,  6,  6,  6,  6,  6,  6,  6,  1, 10, 10,  1], //  9  R72 bridge + R74 door
  [ 1,  1,  1,  1,  1,  0,  7,  7,  7,  1,  1,  1,  1,  1,  1, 10, 10,  1], // 10
  [ 1,  1,  1,  1,  1,  1,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 11
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 12
];

export const A2_ARMORY_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Armory Entrance",
    hint: "posted orders forbid unauthorized entry; the racks beyond smell of oil and old leather.",
    enemies: ["zombie", "zombie"],
    isStart: true,
    notes:
      "R69. COLDFIRE. Era 2+3. Room design ref R69. Posted orders: no unauthorized entry. Fight, disguise, or official seal (R59). Cultists ×2 not in enemy list. " +
      "Connects: R56 chapter hall (exit grid 8), R70 weapon racks, R72 training room.",
  },
  3: {
    label: "Weapon Racks",
    hint: "most racks are bare; a high shelf still holds a crossbow and a bundle of quarrels.",
    enemies: [],
    notes:
      "R70. COLDFIRE. Era 2. Room design ref R70. " +
      "CROSSBOW + 12 BOLTS (RANGED capability); halberd; longsword. " +
      "Connects: R69, R71 armor storage (dead end).",
  },
  4: {
    label: "Armor Storage",
    hint: "corroded mail and a ceremonial plate that would sing if struck.",
    enemies: [],
    notes:
      "R71. COLDFIRE. Era 2+3. Room design ref R71. Light chain mail (upgrade); ceremonial plate (flavor); 15 gold. " +
      "Connects: R70 only.",
  },
  5: {
    label: "Lower Gate East",
    hint: "iron bars end; beyond is not coldfire — only dark and the scrape of bone.",
    enemies: ["skeleton", "skeleton"],
    notes:
      "R73. DARK beyond gate. Era 2+3. Room design ref R73. Content room — skeletons; threshold to Area 3 Ossuary. " +
      "Soft gate: RELIABLE LIGHT — darkness is the real wall; torch punishing; shuttered lantern recommended. " +
      "NOT the area-transition room; use adjacent exit grid 10 for a3_threshold. " +
      "Grid 5 = designated return arrival from a3_threshold (convention).",
  },
  6: {
    label: "Training Room",
    hint: "spar circle; cultists drill while a zombie takes blows that never teach.",
    enemies: ["zombie", "zombie", "zombie"],
    notes:
      "R72. COLDFIRE. Era 2+3. Room design ref R72. Spar circle; cultists ×2 not in list (zombies partial). Training manual (minor buff); practice weapons. " +
      "Connects: R69, R73 Lower Gate East, R74 Lower Gate West, exit grid 10 (Ossuary transit).",
  },
  7: {
    label: "Lower Gate West",
    hint: "coldfire holds here; past the choke, something floral blocks stone and air alike.",
    enemies: [],
    notes:
      "R74. COLDFIRE near gate. Era 2+3. Room design ref R74. Skullflower choke — type not in enemy list; FIRE + pump state hard gate; alternate to Area 4 via R68 when cleared + drained. " +
      "Exit → a2_maintenance R68 (grid 8).",
    exit: { toAreaId: "a2_maintenance", toRoomGridId: 8 },
  },
  8: {
    label: "Back to Chapter House",
    hint: "maps and seals lie the way you came.",
    enemies: [],
    exit: { toAreaId: "a2_chapter_house", toRoomGridId: 2 },
  },
  10: {
    label: "To the Ossuary",
    hint: "past the gate chamber, the threshold accepts your tread.",
    enemies: [],
    notes:
      "Transit only — pairs with a3_threshold grid 2. R73 remains combat/content at the gate proper.",
    exit: { toAreaId: "a3_threshold", toRoomGridId: 2 },
  },
};

export const A2_ARMORY: AreaDef = {
  id: "a2_armory",
  name: "Armory & Lower Gate",
  desc: "Steel, drills, and the lower gates — east into darkness, west toward fire and flood.",
  difficulty: 3,
  generator: "authored",
  authored: {
    grid: A2_ARMORY_GRID,
    rooms: A2_ARMORY_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
};
