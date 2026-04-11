import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 4 — Abandoned Dig (R124–R129), difficulty 4.
 * Grid: 2=R124, 3=R125, 4=R126, 5=R127, 6=R128, 7=R129; 8=crystal exit; 9=ancestors; 10=shadow depths.
 * Hub R128 (6): separate corridor legs to R127, R129, exits — no merged 0-component cliques.
 */

// prettier-ignore
export const A4_ABANDONED_DIG_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  4,  4,  0,  3,  3,  0,  2,  2,  0,  8,  8,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  4,  4,  0,  3,  3,  0,  2,  2,  0,  8,  8,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  1,  5,  5,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  1,  5,  5,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  1,  6,  6,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  7,  7,  0,  6,  6,  0,  9,  9,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  7,  7,  1,  6,  6,  1,  9,  9,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1, 10, 10,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1, 10, 10,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
];

export const A4_ABANDONED_DIG_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Dig Camp",
    hint: "dying coldfire strips. skeletons chip at salt that no longer ships.",
    enemies: ["skeleton", "skeleton"],
    isStart: true,
    notes:
      "R124. COLDFIRE (dying strips) + DARK pockets. Era 3. Equipment tents; fading coldfire posts. " +
      "Skeletons ×2 still \"working\" on last orders — chips salt forever. " +
      "Connects R116 (crystal exit), R125 equipment, R127 trapped passage. " +
      "Theme: Era 3 dig stopped mid-work; lich withdrew after crews vanished.",
  },
  3: {
    label: "Equipment Store",
    hint: "picks, rope, and the reek of rat-nested sacks.",
    enemies: ["rat", "rat", "rat", "rat"],
    notes:
      "R125. DARK. Era 3. Picks, carts, rope, last coldfire strips — supply ends here. " +
      "Rats in organics. Hasty exit: dropped gear; log quote — \"Crew 7 — no report. Crew 9 — no report. Halting deep operations. —S.\" (Serevic halt order; necromancer withdrew). " +
      "Loot: mining tools; rope (Area 5 descent / traversal gate with R144). " +
      "Connects R124 ↔ R126.",
  },
  4: {
    label: "Active Face",
    hint: "the wall curves toward you as if the void taught stone to reach.",
    enemies: [],
    notes:
      "R126. DARK. Era 1 + 3. Dig face frozen mid-swing; half-loaded cart. " +
      "Wall crystals organic — curved, reaching toward viewer; warmth palpable. " +
      "Where extraction would have been richest and most catastrophic — profit and peril one gesture; growth is presence's influence visible. " +
      "Loot: crystal-rich salt (crafting). Environmental read for seal / deep presence (R143). Dead end.",
  },
  5: {
    label: "Trapped Passage",
    hint: "torchlight gutters. something pinned a woman to the floor.",
    enemies: ["shadow"],
    notes:
      "R127. DARK. Era 1. Corridor claimed by Shadow ×1. Mira pinned; torch guttering under drain. " +
      "MIRA ENCOUNTER 3 — mirror of heir: in the deep for treasure, no coat of inheritance. " +
      "She is haggard, honest: quote — \"I'm not saving anyone. I'm getting paid.\" " +
      "DEAL: detailed Area 4 map — Ancestor's Trail R130–R134 + Shadow Depths R135–R140 annotations — if player clears Shadow OR lends crystal lantern. " +
      "HELP branch: she survives — proves individual honest greed can walk out if someone pays cost of helping. " +
      "REFUSE branch: she dies near Area 5 entrance; map still lootable on body — price player chose not to pay. " +
      "Connects R124 ↔ R128.",
  },
  6: {
    label: "Collapse Warning",
    hint: "timber cracks overhead. miners painted DANGER UNSTABLE in haste.",
    enemies: [],
    notes:
      "R128. DARK. Era 1. Cracked supports; DANGER — UNSTABLE in miners' script. " +
      "World-state / combat: random collapse damage per turn risk while fighting here. " +
      "Hub toward Ancestor's Trail (R130+) and Shadow Depths (R135+). " +
      "Cross-ref: unstable geology vs baron's pace; ties to R134 letter and R143 seal stress.",
  },
  7: {
    label: "Break Room",
    hint: "benches rot under graffiti older than the coldfire posts.",
    enemies: [],
    notes:
      "R129. DARK. Era 1. Rotting benches, tin cups. Multi-era graffiti anthology of greed's voice — " +
      "PRIDE (early miners): names in wreaths, \"deepest crew,\" boasts of loads. " +
      "BITTERNESS (later): \"still not enough for him\" — foreman, baron, faceless him. " +
      "RESIGNATION (indentured): tallies without comment; \"owed 14 years, year 9.\" " +
      "Anonymous line: \"From down here the walls look like stars. Nobody owns stars.\" — beauty without ownership, view greed cannot deed. " +
      "Ancestor handwriting among marks (matches baron journals Area 1) — first explicit ancestor trace this branch. Dead end.",
  },
  8: {
    label: "Toward crystal galleries",
    hint: "prismatic drafts from the living-salt halls.",
    enemies: [],
    exit: { toAreaId: "a4_crystal_galleries", toRoomGridId: 2 },
  },
  9: {
    label: "Toward ancestor's trail",
    hint: "someone counted days on the wall beyond.",
    enemies: [],
    exit: { toAreaId: "a4_ancestors_trail", toRoomGridId: 2 },
  },
  10: {
    label: "Into shadow depths",
    hint: "your lantern shivers before you step through.",
    enemies: [],
    exit: { toAreaId: "a4_shadow_depths", toRoomGridId: 2 },
  },
};

export const A4_ABANDONED_DIG: AreaDef = {
  id: "a4_abandoned_dig",
  name: "Abandoned Dig",
  desc: "Era 3 headings stopped mid-swing. The camp still pretends the shift never ended.",
  difficulty: 4,
  generator: "authored",
  authored: {
    grid: A4_ABANDONED_DIG_GRID,
    rooms: A4_ABANDONED_DIG_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
  notes:
    "Area 4 Subarea 3 — Mira 3, halt-order lore, rope gate for Area 5. " +
    "Branches: graffiti + ancestor fingerprints (R129), linear ancestor emotional arc (R130–R134), Shadow depths + lantern craft (R135–R140).",
};
