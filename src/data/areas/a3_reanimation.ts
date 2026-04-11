import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 3 — Ossuary — Reanimation Wing (R87–R92). Grid: 2=R87 … 7=R92, 8=exit→sorting R83 (grid 5).
 * Exit column (5) separated from horizontal chain 0-row so no vertical merge into wrong rooms.
 */

// prettier-ignore
export const A3_REANIMATION_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  1,  1,  1,  1,  3,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2  R88 circle beta
  [ 1,  1,  1,  1,  1,  3,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3
  [ 1,  1,  1,  1,  1,  3,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  4
  [ 1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  5  R88↔R87 shaft
  [ 1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  7
  [ 1,  1,  1,  1,  1,  2,  2,  2,  0,  4,  4,  4,  0,  5,  5,  5,  0,  6,  6,  6,  0,  7,  7], //  8  main chain
  [ 1,  1,  1,  1,  1,  2,  2,  2,  1,  4,  4,  4,  1,  5,  5,  5,  1,  6,  6,  6,  1,  7,  7], //  9
  [ 1,  1,  1,  1,  1,  2,  2,  2,  1,  4,  4,  4,  1,  5,  5,  5,  1,  6,  6,  6,  1,  7,  7], // 10
  [ 1,  1,  1,  1,  1,  2,  2,  2,  1,  4,  4,  4,  1,  5,  5,  5,  1,  6,  6,  6,  1,  7,  7], // 11
  [ 1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 12  R87↔exit
  [ 1,  1,  1,  1,  1,  8,  8,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 13
  [ 1,  1,  1,  1,  1,  8,  8,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 14
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 15
];

export const A3_REANIMATION_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Ritual Circle Alpha",
    hint: "coldfire and a circle that will not stop assembling soldiers from refuse.",
    enemies: ["necromancer", "skeleton", "skeleton"],
    isStart: true,
    notes:
      "R87. Era 3. COLDFIRE. Active circle: sigils glow; necromancer chants; bone fragments assemble into armed skeletons — source of the perpetual shift, shown not told. " +
      "Necromancer ×1, skeletons ×2 (fresh). Loot: ritual components (alchemy); 15 gold. " +
      "WORLD STATE: destroy circle (fire or CONSECRATION after unlocked) → permanently disables this spawn point; fewer replacement skeletons in Areas 1–3. " +
      "Connects to R83 (sorting conveyor), R88 (beta, dead end), R89 (binding).",
  },
  3: {
    label: "Ritual Circle Beta",
    hint: "dim sigils; the last maintainer never finished the notes.",
    enemies: [],
    notes:
      "R88. Era 3. COLDFIRE (dim). Inactive circle; dark sigils; prior maintainer lost. Dead end. " +
      "Loot: circle components; reanimation notes; 20 gold in materials. Study aids CONSECRATION (know your counter).",
  },
  4: {
    label: "Binding Chamber",
    hint: "charged air; souls measured against bone like ledger lines.",
    enemies: ["necromancer", "zombie", "zombie"],
    notes:
      "R89. Era 3. COLDFIRE. Soul-to-bone binding. Witch ×1 (enemy type witch not in data — use necromancer as stand-in for telegraphed heavy magic); zombies ×2. " +
      "Unpleasant charged air; bright coldfire. Loot: soul-binding texts (lich/necro depth); 25 gold in materials.",
  },
  5: {
    label: "Assembly Floor",
    hint: "staged bodies wait in formation; the dark leans them toward the exits.",
    enemies: ["zombie", "zombie", "zombie", "zombie", "zombie", "skeleton"],
    notes:
      "R90. Era 3. DARK. Staged undead before deployment; zombies ×5, skeleton ×1. Chemical smell on fresh assemblies. " +
      "If necromancer off-shift or dead: figures tilt toward passages leading down/stack-ward (What Lies Below drift). " +
      "Loot: 10 gold (pouches on zombies).",
  },
  6: {
    label: "Testing Ground",
    hint: "scoring lines on stone; three skeletons rehearse violence on each other.",
    enemies: ["skeleton", "skeleton", "skeleton"],
    notes:
      "R91. Era 3. DARK. Combat drills forever; scoring lines and marks. Skeletons ×3 (drills) focused on each other — not patrol mode; observation safe; surprise attack = free first turn. " +
      "Quality control on a product line; drill behavior = stealth / opener opportunity.",
  },
  7: {
    label: "Necromancer's Study",
    hint: "shelves of failure labeled progress; a map marks every ossuary door.",
    enemies: [],
    notes:
      "R92. Era 3. COLDFIRE. Senior research space; occupant often at R87. Lich request in notes: reanimation that preserves memories and skills (not yet achieved). " +
      "Loot: reanimation research; experimental notes (alchemy); 12 gold; map — full Ossuary layout. Dead end.",
  },
  8: {
    label: "To Conveyor Hall",
    hint: "conveyor thunder leaks through; quotas call workers back.",
    enemies: [],
    exit: { toAreaId: "a3_sorting", toRoomGridId: 5 },
    notes:
      'Return to R83 Conveyor Hall (sorting grid 5). Pair: sorting "To Reanimation Wing" lands grid 2 (R87).',
  },
};

export const A3_REANIMATION: AreaDef = {
  id: "a3_reanimation",
  name: "Reanimation Wing",
  desc: "Where the shift is born: circles, binding, and the line's quality control.",
  difficulty: 4,
  generator: "authored",
  authored: {
    grid: A3_REANIMATION_GRID,
    rooms: A3_REANIMATION_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
  notes:
    "Ossuary subarea 3: industrial necromancy; drift toward bone stacks / deep connections. " +
    "R87 circle destruction reduces skeleton pressure in Areas 1–3 permanently.",
};
