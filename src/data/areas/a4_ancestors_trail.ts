import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 4 — Ancestor's Trail (R130–R134), difficulty 4.
 * Linear chain 2→3→4→5→6; exit 7 links to a4_abandoned_dig R128 (grid 6).
 * Isolated corridor cells between each room pair.
 */

// prettier-ignore
export const A4_ANCESTORS_TRAIL_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  7,  7,  0,  2,  2,  0,  3,  3,  3,  0,  4,  4,  4,  0,  5,  5,  0,  6,  1,  1],
  [ 1,  1,  1,  1,  7,  7,  0,  2,  2,  0,  3,  3,  3,  0,  4,  4,  4,  0,  5,  5,  0,  6,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  2,  2,  1,  3,  3,  3,  1,  4,  4,  1,  1,  5,  5,  1,  6,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  6,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
];

export const A4_ANCESTORS_TRAIL_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Tally Marks",
    hint: "someone carved days into the salt. the foreman's promise repeats.",
    enemies: [],
    isStart: true,
    notes:
      "R130. DARK. Era 1. Wall of tallies; ancestor's name visible. " +
      'Graffito quote: "Day 291. The foreman says one more week. He\'s said that for a month." ' +
      "Teaching: clock of extraction vs human lifespan. Connects R128 (abandoned dig) ↔ R131.",
  },
  3: {
    label: "Complaint Wall",
    hint: "grievances, canaries, names crossed out when the mine took them.",
    enemies: ["rat", "rat"],
    notes:
      "R131. DARK. Era 1. Grievances, canaries, timber warnings; fellow miners' names, some crossed out. " +
      "Ancestor entries literate — they did not belong in the pit. " +
      "Loot / lore: name list overlaps bone tags Area 3. Cross-ref: R129 graffiti voice. " +
      "Connects R130 ↔ R132.",
  },
  4: {
    label: "Shift Change",
    hint: "salt benches and a folk altar nobody disturbed.",
    enemies: [],
    notes:
      "R132. DARK. Era 1. Wider halt space; salt benches. " +
      "Folk altar — crystals, copper coins, undisturbed centuries. " +
      "Long ancestor graffito: beauty of galleries, wish child could see, unease about strange air deeper. " +
      "Connects R131 ↔ R133.",
  },
  5: {
    label: "The Drawing",
    hint: "a scratched house, a garden, a child. one word underneath: Home.",
    enemies: [],
    notes:
      'R133. DARK. Era 1. Dominant wall: scratched house and garden; adult and child; caption "Home." ' +
      "Player recognizes baron stories / letters. Pure human beat — no fight, no loot required. " +
      "Connects R132 ↔ R134.",
  },
  6: {
    label: "Ancestor's Alcove",
    hint: "a skeleton wears your family's name. paper survives where breath did not.",
    enemies: [],
    notes:
      "R134. DARK. Dead end; emotional climax of Area 4 — quiet, no combat. Era 1. " +
      "Collapsed side into small alcove. Skeleton with family name on belt. " +
      'Unsent letter opening: "If I don\'t make it out—" Body warns: collapse ignored, foreman refused stop, plea that no one follow for silver or pride. ' +
      'Closing line (exact): "Don\'t come looking for what we left here. The salt keeps its own." ' +
      "After Crystal Galleries, lands as doctrine: ancestor knew — instinct, not textbook — mine better left; baron took, order taxed, lich calculated; simplest voice understood stop taking. " +
      "BONUS — Ancestor's Rest contents: letter unlocks lich line \"You're sitting on my family's bones\"; Ending 4 evidence chain; carved toy for child who never got it (memento / small passive); tally book (full record). " +
      "Cross-ref: regrowing salt proof R121; seal Study R143; Ending 4 (Release).",
  },
  7: {
    label: "Back toward the dig",
    hint: "unstable timber and the smell of old coldfire.",
    enemies: [],
    exit: { toAreaId: "a4_abandoned_dig", toRoomGridId: 6 },
  },
};

export const A4_ANCESTORS_TRAIL: AreaDef = {
  id: "a4_ancestors_trail",
  name: "Ancestor's Trail",
  desc: "Graffiti left by someone who understood the mine before the books did.",
  difficulty: 4,
  generator: "authored",
  authored: {
    grid: A4_ANCESTORS_TRAIL_GRID,
    rooms: A4_ANCESTORS_TRAIL_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
  notes:
    'Area 4 Subarea 4 — linear intimate arc; R134 letter is thematic keystone with "The salt keeps its own." ' +
    "Pairs with Crystal Galleries revelation and Sealed Chamber observation log.",
};
