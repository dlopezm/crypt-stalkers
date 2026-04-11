import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 5 — Founder's Reliquary — Mortal Quarters (R168–R171)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 * Linear R168–R171; isolated stubs for sanctum (R162) and outer ward (R146) off R168 only.
 */

// prettier-ignore
export const A5_MORTAL_QUARTERS_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  6,  6,  0,  2,  2,  2,  2,  0,  3,  3,  3,  0,  4,  4,  4,  0,  5,  5,  1], //  2
  [ 1,  6,  6,  1,  2,  2,  2,  2,  1,  3,  3,  3,  1,  4,  4,  4,  1,  5,  5,  1], //  3
  [ 1,  1,  1,  1,  2,  2,  2,  2,  1,  3,  3,  3,  1,  4,  4,  4,  1,  1,  1,  1], //  4
  [ 1,  1,  1,  1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  5
  [ 1,  1,  1,  1,  1,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  1,  1,  1,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  7
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  8
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  9
];

export const A5_MORTAL_QUARTERS_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Forgotten Corridor",
    hint: "dust and old prints — something with bone in its step passes here, rarely, for no ledger.",
    enemies: [],
    isStart: true,
    notes:
      "R168. Always. Dark. No enemies. Dusty service corridor; skeletal footprints (recent) — lich visits rarely with no operational purpose. " +
      'Tone: efficiency expert in a wing with no line item; neglect filed as "no action required" — worse than sentimentality. ' +
      "Exits: hidden passage to R162 (room 6 → a5_sanctum grid 8); loose panel to R146 (room 7 → a5_outer_ward grid 2, HIDDEN). " +
      "Cross-ref: R146, R157, R162, R169 desk beat.",
  },
  3: {
    label: "The Preserved Room",
    hint: "a bed made centuries ago; a desk waits as if work paused mid-sentence.",
    enemies: [],
    notes:
      "R169. Always. Dark. No enemies. Serevic's bedroom before transformation — preserved by inaction, not care. " +
      "Bed still made because they made it ~150 years ago and never had a work order to unmake it. Desk, empty cup, bookmark in unfinished novel: abandoned mid-process, never resumed — not curated, stopped. " +
      "No shrine logic; stopped time as bureaucracy. " +
      "JOURNAL PLACEMENT (world-state): place Serevic's pre-transformation journal (Area 2 R55) on the desk → lich senses own pre-lich math, including hymn line, inside the room they never repurposed → R165 encounter modifier (Phase 2 notes in R165). " +
      "Personal effects: narrative weight, no gold. Cross-ref: R55, R165, Ending 4 evidence chain.",
  },
  4: {
    label: "Personal Library",
    hint: "duty, sacrifice, competence — margin lines argue with themselves in one hand.",
    enemies: [],
    notes:
      "R170. Always. Dark. No enemies. Philosophy shelves emphasize duty, sacrifice, competence — not soft-loss poetry as primary key. " +
      'Margin quotes in Serevic\'s hand (justifications in progress): "Is it greed to refuse to let something die? Is it duty to make yourself the only solution? What if no one else will do it?" — ethical engine: competence as virtue → monstrosity. ' +
      "Ashvere / barony history present as operational context (how the machine worked), not apology. " +
      "Teaching: complicates easy judgment without demanding forgiveness. Cross-ref: R165 dialogue, Baron's ring trigger.",
  },
  5: {
    label: "The Mirror Room",
    hint: "cloth over glass; a locket on the shelf asks nothing and stays.",
    enemies: [],
    notes:
      'R171. Always. Dark. No enemies. Dead end. Full-length mirror covered — efficiency, not grief trope: "This serves no function." ' +
      "Shelf: comb and razor as artifacts of discontinued process (no work order to clear — same motif as bedroom). " +
      "Silver locket: someone they loved; room does not sentimentalize — object simply still there. " +
      "If player removes cloth: living reflection (warm, breathing) in a place built for the dead — no mechanical reward; evidence / dungeon's last question: what does a living person do here — take, hold, break, or walk away? " +
      'Cross-ref: Ending 4 emotional credibility, R165 "high consecration" line.',
  },
  6: {
    label: "Through the Hidden Passage",
    hint: "service stone; the same dust as the sanctum's back way.",
    enemies: [],
    exit: { toAreaId: "a5_sanctum", toRoomGridId: 8 },
    notes:
      "Exit. Returns to a5_sanctum R162 (grid 8). Pair: sanctum room 8 → mortal grid 2 (R168). Cross-ref: R157 hidden door.",
  },
  7: {
    label: "Loose Panel to the Outer Ward",
    hint: "salt-block seam; cold air and coldfire leak from the junction beyond.",
    enemies: [],
    exit: { toAreaId: "a5_outer_ward", toRoomGridId: 2 },
    notes:
      "HIDDEN exit. Returns to a5_outer_ward R146 (grid 2). Crystal lantern full or deliberate search. " +
      "Pair: Outer Ward room 10 → mortal grid 2. Cross-ref: R146 panel text.",
  },
};

export const A5_MORTAL_QUARTERS: AreaDef = {
  id: "a5_mortal_quarters",
  name: "Mortal Quarters",
  desc: "Wing the schedule forgot. Proof of a life filed under no action required.",
  difficulty: 5,
  generator: "authored",
  authored: {
    grid: A5_MORTAL_QUARTERS_GRID,
    rooms: A5_MORTAL_QUARTERS_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
};
