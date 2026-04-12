import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 4 - Ancestor's Trail (R130–R134), difficulty 4.
 * Linear chain 2→3→4→5→6; exit 7 links to a4_abandoned_dig R128 (grid 6).
 * Isolated corridor cells between each room pair.
 */

// prettier-ignore
export const A4_ANCESTORS_TRAIL_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 7, 7, 0, 2, 2, 0, 3, 3, 3, 0, 4, 4, 4, 0, 5, 5, 0, 6, 1, 1],
 [ 1, 1, 1, 1, 7, 7, 0, 2, 2, 0, 3, 3, 3, 0, 4, 4, 4, 0, 5, 5, 0, 6, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 3, 3, 3, 1, 4, 4, 1, 1, 5, 5, 1, 6, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const A4_ANCESTORS_TRAIL_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Tally Marks",
    hint: "someone carved days into the salt. the foreman's promise repeats.",
    description:
      "Narrow passage. One wall dense with tally marks - days cut into the salt. Quiet. Nothing else in the room.",
    enemies: [],
    isStart: true,
    notes:
      "R130. DARK. Era 1. Wall of tallies; ancestor's name visible. " +
      "Teaching: clock of extraction vs human lifespan. Connects R128 (abandoned dig) ↔ R131.",
    props: [
      {
        id: "tally_wall_r130",
        label: "Wall of Tallies",
        icon: "\u{1F4CA}",
        desc: "Hashes crowd the salt like rain tallies - and among them, a name you know from shame as much as blood. Freshest deep cut: Day 291. The foreman says one more week. He's said that for a month.",
        gridPosition: { row: 3, col: 7 },
        onExamine: [
          { type: "set_flag", flag: "read_tally_wall_r130" },
          {
            type: "log",
            message: "The foreman's week is a lie - same promise, new date scratched beside it.",
          },
        ],
      },
    ],
  },
  3: {
    label: "Complaint Wall",
    hint: "grievances, canaries, names crossed out when the mine took them.",
    description:
      "Wall packed with warnings - beam dates, canary counts, names, some scratched out. Smells like old dust. Carving sits close; tunnel feels tight.",
    enemies: ["rat", "rat"],
    notes:
      "R131. DARK. Era 1. Grievances, canaries, timber warnings; fellow miners' names, some crossed out. " +
      "Ancestor entries literate - they did not belong in the pit. " +
      "Name list overlaps bone tags Area 3. Cross-ref: R129 graffiti voice. " +
      "Connects R130 ↔ R132.",
    props: [
      {
        id: "complaint_wall_r131",
        label: "Complaint Wall",
        icon: "\u{1F4DD}",
        desc: "Grievances stacked like timber shoring - canary tallies, rotten beam dates, names honored then crossed through when the mine finished arguing. Among them, a hand too educated for the pit: full sentences, careful punctuation, fury dressed as courtesy.",
        gridPosition: { row: 3, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "read_complaint_wall_r131" },
          {
            type: "log",
            message:
              "The crossed-out names match tags you have seen on ribs in the upper ossuaries.",
          },
        ],
      },
    ],
  },
  4: {
    label: "Shift Change",
    hint: "salt benches and a folk altar nobody disturbed.",
    description:
      "Wider stop: packed grit floor, salt benches along the walls. Small niche with coins, crystals, dry petals - miners' altar, untouched-looking. Faint warmth from deeper salt. No drip, no picks.",
    enemies: [],
    notes: "R132. DARK. Era 1. Wider halt space; salt benches. " + "Connects R131 ↔ R133.",
    props: [
      {
        id: "folk_altar_r132",
        label: "Folk Altar",
        icon: "\u{2728}",
        desc: "Crystals, copper coins, a tin cup of dry petals - offerings no overseer taxed. The little shrine has sat untouched longer than the order's vows.",
        gridPosition: { row: 3, col: 14 },
        onExamine: [
          { type: "set_flag", flag: "examined_folk_altar_r132" },
          {
            type: "log",
            message:
              "No overseer taxed these petals - only hands that needed something to look at besides tonnage.",
          },
        ],
      },
      {
        id: "folk_altar_coins_r132",
        label: "Copper Offering Coins",
        icon: "\u{1FA99}",
        desc: "Oxidized faces, generations of thumbs. Taking them would not be theft - it would be a verdict.",
        gridPosition: { row: 4, col: 15 },
        condition: { notFlags: ["took_folk_altar_coins_r132"] },
        actions: [
          {
            id: "take",
            label: "Pocket the coins",
            effects: [
              { type: "grant_gold", amount: 3 },
              { type: "set_flag", flag: "took_folk_altar_coins_r132" },
              { type: "consume_prop" },
              { type: "log", message: "Three copper - light in the hand, heavy in the chest." },
            ],
          },
        ],
      },
      {
        id: "ancestor_shift_change_graffito_r132",
        label: "Long Carved Graffito",
        icon: "\u{1F58B}\uFE0F",
        desc: "Spiral of neat letters confessing beauty in the galleries, a wish that a child could see them, and - lower, tighter - worry about strange air deeper down. The voice is your blood trying to warn itself.",
        gridPosition: { row: 4, col: 14 },
        onExamine: [
          { type: "set_flag", flag: "read_ancestor_shift_graffito_r132" },
          {
            type: "log",
            message: "Wonder and dread braided - someone loved the deep and feared it honestly.",
          },
        ],
      },
    ],
  },
  5: {
    label: "The Drawing",
    hint: "a scratched house, a garden, a child. one word underneath: Home.",
    description:
      "One wall carved with a rough house, garden, two figures holding hands - bad perspective, clear intent. Under it, cut deep: HOME. Small space. Very quiet.",
    enemies: [],
    notes:
      "R133. DARK. Era 1. Dominant wall piece. " +
      "Player recognizes baron stories / letters. Pure human beat - no fight, no loot required. " +
      "Connects R132 ↔ R134.",
    props: [
      {
        id: "home_drawing_r133",
        label: "Salt-Wall Drawing",
        icon: "\u{1F3E0}",
        desc: "Scratched house, scratched garden, two figures - adult and child - holding hands in bad perspective and perfect love. Underneath, one word: Home. You have seen this scene in letters the baron pretended were politics.",
        gridPosition: { row: 3, col: 18 },
        onExamine: [
          { type: "set_flag", flag: "read_home_drawing_r133" },
          {
            type: "log",
            message:
              "No pick-marks on this wall - only someone remembering the world above hard enough to carve it.",
          },
        ],
      },
    ],
  },
  6: {
    label: "Ancestor's Alcove",
    hint: "a skeleton wears your family's name. paper survives where breath did not.",
    description:
      "Side pocket from a fall-in - low ceiling, tight. Air barely moves. Surrounding salt is warm; the pocket is a little cooler. Skeleton, paper, small carved toy on the ground. Room is small.",
    enemies: [],
    notes:
      "R134. DARK. Dead end; emotional climax of Area 4 - quiet, no combat. Era 1. " +
      "Collapsed side into small alcove. " +
      "After Crystal Galleries, lands as doctrine: ancestor knew - instinct, not textbook - mine better left; baron took, order taxed, lich calculated; simplest voice understood stop taking. " +
      "Letter unlocks lich line \"You're sitting on my family's bones\"; Ending 4 evidence chain when combined with other proof. " +
      "Cross-ref: regrowing salt proof R121; seal Study R143; Ending 4 (Release).",
    props: [
      {
        id: "ancestor_skeleton_r134",
        label: "Skeleton with Familiar Belt Plate",
        icon: "\u{1FAA6}",
        desc: "Salt-stained leather on the hip - a name you carry stamped in brass. The collapse took them sideways into this pocket, as if the mine wanted privacy for its confession.",
        gridPosition: { row: 3, col: 21 },
        onExamine: [
          { type: "set_flag", flag: "examined_ancestor_remains_r134" },
          { type: "log", message: "Family proof without pedigree - bone wearing your name." },
        ],
      },
      {
        id: "ancestor_unsent_letter_r134",
        label: "Unsent Letter",
        icon: "\u{2709}\uFE0F",
        desc: "Paper gone crisp, ink still legible. It opens If I don't make it out - and becomes a ledger of ignored collapses, a foreman who would not call stop, a plea that no one follow for silver or pride. The last lines stop your breath: Don't come looking for what we left here. The salt keeps its own.",
        gridPosition: { row: 4, col: 21 },
        onExamine: [
          { type: "set_flag", flag: "read_ancestor_letter_r134" },
          { type: "set_flag", flag: "ancestor_letter_ending4_evidence" },
          {
            type: "log",
            message:
              "You read it twice. The hand shook. Stop digging, it says - or the stone will keep what you will not leave behind.",
          },
        ],
      },
      {
        id: "ancestor_carved_toy_r134",
        label: "Carved Wooden Toy",
        icon: "\u{1F9F8}",
        desc: "A horse whittled from pallet wood, never oiled, never given. Finger-smoothed ears - someone imagined a child's laugh in a place that ate sound.",
        gridPosition: { row: 3, col: 22 },
        condition: { notFlags: ["has_ancestor_carved_toy"] },
        actions: [
          {
            id: "take",
            label: "Take the toy",
            effects: [
              { type: "set_flag", flag: "has_ancestor_carved_toy" },
              { type: "consume_prop" },
              { type: "log", message: "Small weight - a life that did not get to unwrap it." },
            ],
          },
        ],
      },
      {
        id: "ancestor_tally_book_r134",
        label: "Tally Book",
        icon: "\u{1F4D6}",
        desc: "Cover soft as cloth from handling. Inside: loads, debts, days, small drawings in margins - a private mathematics arguing with the company's books.",
        gridPosition: { row: 4, col: 22 },
        onExamine: [
          { type: "set_flag", flag: "read_ancestor_tally_book_r134" },
          {
            type: "log",
            message:
              "The full record - every day counted against a foreman who never meant to pay them back.",
          },
        ],
      },
    ],
  },
  7: {
    label: "Back toward the dig",
    hint: "unstable timber and the smell of old coldfire.",
    description: "Timber noise ahead; thin coldfire smell on the draft - back toward the dig.",
    enemies: [],
    exit: { toAreaId: "a4_abandoned_dig", toRoomGridId: 6 },
  },
};

export const A4_ANCESTORS_TRAIL: AreaDef = {
  id: "a4_ancestors_trail",
  name: "Ancestor's Trail",
  desc: "Tallies, curses, a child's house scratched in salt - then a letter that tells you to turn around.",
  difficulty: 4,
  generator: "authored",
  authored: {
    grid: A4_ANCESTORS_TRAIL_GRID,
    rooms: A4_ANCESTORS_TRAIL_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
  notes:
    'Area 4 Subarea 4 - linear intimate arc; R134 letter is thematic keystone with "The salt keeps its own." ' +
    "Pairs with Crystal Galleries revelation and Sealed Chamber observation log.",
};
