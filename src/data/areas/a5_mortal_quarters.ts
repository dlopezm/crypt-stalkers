import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 5 - Founder's Reliquary - Mortal Quarters (R168–R171)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 * Linear R168–R171; isolated stubs for sanctum (R162) and outer ward (R146) off R168 only.
 */

// prettier-ignore
export const A5_MORTAL_QUARTERS_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 1
 [ 1, 6, 6, 0, 2, 2, 2, 2, 0, 3, 3, 3, 0, 4, 4, 4, 0, 5, 5, 1], // 2
 [ 1, 6, 6, 1, 2, 2, 2, 2, 1, 3, 3, 3, 1, 4, 4, 4, 1, 5, 5, 1], // 3
 [ 1, 1, 1, 1, 2, 2, 2, 2, 1, 3, 3, 3, 1, 4, 4, 4, 1, 1, 1, 1], // 4
 [ 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 5
 [ 1, 1, 1, 1, 1, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 6
 [ 1, 1, 1, 1, 1, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 7
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 8
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 9
];

export const A5_MORTAL_QUARTERS_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Forgotten Corridor",
    hint: "dust and old prints - something with bone in its step passes here, rarely, for no ledger.",
    description:
      "Narrow service passage, heavy dust, stale air. Overlapping tracks in the ash - too light for heavy boots. Walls are quiet; no crystal hum like the colonnade.",
    enemies: [],
    isStart: true,
    notes:
      "R168. Always. Dark. No enemies. Dusty service corridor. " +
      'Tone: efficiency expert in a wing with no line item; neglect filed as "no action required" - worse than sentimentality. ' +
      "Exits: hidden passage to R162 (room 6 → a5_sanctum grid 8); loose panel to R146 (room 7 → a5_outer_ward grid 2, HIDDEN). " +
      "Cross-ref: R146, R157, R162, R169 desk beat.",
    props: [
      {
        id: "skeletal_footprints_dust_r168",
        label: "Tracks in the Dust",
        icon: "\u{1F9B4}",
        desc: "Prints too light for a living boot - bone pressing ash in a stride that hesitates, doubles back, stops as if no work order justified the next step. Recent. Rare.",
        gridPosition: { row: 2, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "read_mortal_corridor_lich_tracks_r168" },
          {
            type: "log",
            message:
              "The schedule-keeper visits the one wing that never needed repurposing - and does nothing here on purpose.",
          },
        ],
      },
    ],
  },
  3: {
    label: "The Preserved Room",
    hint: "a bed made centuries ago; a desk waits as if work paused mid-sentence.",
    description:
      "Small chamber, low ceiling, dust in the corners - plain after the huge salt halls. Bed still made; gray dust on the linen. Writing desk, dry inkwell, papers squared at the edges; smells like old paper. Left as-is, not staged.",
    enemies: [],
    notes:
      "R169. Always. Dark. No enemies. Serevic's bedroom before transformation - preserved by inaction, not care. " +
      "No shrine logic; stopped time as bureaucracy. " +
      "JOURNAL PLACEMENT (world-state): lich senses journal on desk before/as R165 combat - encounter modifier (Phase 2 notes in R165). " +
      "Cross-ref: R55, R165, Ending 4 evidence chain.",
    props: [
      {
        id: "preserved_bed_r169",
        label: "Made Bed",
        icon: "\u{1F6CF}\uFE0F",
        desc: "Blankets square enough to pass inspection - because they were squared once, when hands still warmed, and no maintenance ticket ever asked them undone. Dust sits on linen like a second, softer snow.",
        gridPosition: { row: 2, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "examined_serevic_preserved_bed_r169" },
          {
            type: "log",
            message: "Stopped time, filed under no action required.",
          },
        ],
      },
      {
        id: "writing_desk_r169",
        label: "Writing Desk",
        icon: "\u{1F4DD}",
        desc: "Inkwell dry as arithmetic; a few salt-stained papers squared with obsessive edges. The wood remembers elbows that leaned here before coldfire painted a different face.",
        gridPosition: { row: 3, col: 6 },
        onExamine: [
          { type: "set_flag", flag: "examined_serevic_desk_r169" },
          {
            type: "log",
            message: "Work paused mid-sentence - not curated, abandoned.",
          },
        ],
        actions: [
          {
            id: "place_journal",
            label: "Lay the pre-transformation journal on the desk",
            desc: "Lay their living hand on the desk - ink and second thoughts where the thing in the crystal never files paperwork.",
            requires: {
              flags: ["has_serevic_pretransformation_journal"],
              notFlags: ["serevic_journal_placed_desk_r169"],
            },
            effects: [
              { type: "set_flag", flag: "serevic_journal_placed_desk_r169" },
              { type: "set_flag", flag: "serevic_journal_release_evidence_secured" },
              { type: "set_flag", flag: "has_serevic_pretransformation_journal", value: false },
              {
                type: "log",
                message:
                  "Paper meets wood with a whisper. Somewhere in the crystal dark, a mind wired to ledgers feels its own handwriting breathe.",
              },
            ],
          },
        ],
      },
      {
        id: "unfinished_novel_r169",
        label: "Unfinished Novel",
        icon: "\u{1F4D6}",
        desc: "Clothbound, spine cracked, bookmark trapped mid-chapter - a life that imagined other endings. The protagonist was about to choose mercy or efficiency; the page never learned which won.",
        gridPosition: { row: 2, col: 7 },
        onExamine: [
          { type: "set_flag", flag: "read_serevic_unfinished_novel_r169" },
          {
            type: "log",
            message: "The story stops where the numbers got louder than the people.",
          },
        ],
      },
      {
        id: "empty_cup_r169",
        label: "Empty Cup",
        icon: "\u{2615}",
        desc: "Porcelain rim stained faint with old tea rings - the last domestic act before transformation filed the cup under obsolete.",
        gridPosition: { row: 3, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "examined_serevic_empty_cup_r169" },
          {
            type: "log",
            message: "Warmth remembered in concentric ghosts.",
          },
        ],
      },
    ],
  },
  4: {
    label: "Personal Library",
    hint: "duty, sacrifice, competence - margin lines argue with themselves in one hand.",
    description:
      "Bookshelves close together - duty, sacrifice, barony procedure. Dust on the top shelves; cool steady air. Footsteps and breath sound loud on the stone.",
    enemies: [],
    notes:
      "R170. Always. Dark. No enemies. Philosophy shelves emphasize duty, sacrifice, competence - not soft-loss poetry as primary key. " +
      "Teaching: complicates easy judgment without demanding forgiveness. Cross-ref: R165 dialogue, Baron's ring trigger.",
    props: [
      {
        id: "duty_philosophy_shelf_r170",
        label: "Duty and Competence - Annotated",
        icon: "\u{1F4DA}",
        desc: "Spines on sacrifice, ledgers of 'necessary harm,' manuals on ward maintenance bound like breviaries. Margins in one precise hand argue with the authors: IS IT GREED TO REFUSE TO LET SOMETHING DIE? IS IT DUTY TO MAKE YOURSELF THE ONLY SOLUTION? WHAT IF NO ONE ELSE WILL DO IT? The ethical engine that turned virtue into appetite - still drafting.",
        gridPosition: { row: 2, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "read_serevic_margin_justifications_r170" },
          {
            type: "log",
            message: "Competence as virtue - every question an excuse sharpened into policy.",
          },
        ],
      },
      {
        id: "barony_operational_history_r170",
        label: "Barony History (Operational)",
        icon: "\u{1F4DC}",
        desc: "Ashvere tithes, gallery contracts, collapse reports - read as logistics, not tragedy. Annotations tally who paid, who delayed, who signed in wet ink while miners stopped breathing. No apology; only context for the machine.",
        gridPosition: { row: 3, col: 11 },
        onExamine: [
          { type: "set_flag", flag: "read_serevic_barony_operational_notes_r170" },
          {
            type: "log",
            message:
              "Ashvere shows up the way a tally-master names a seam in a roof - weight, yield, who paid late. No weeping ink. Just my bloodline measured like timber.",
          },
        ],
      },
    ],
  },
  5: {
    label: "The Mirror Room",
    hint: "cloth over glass; a locket on the shelf asks nothing and stays.",
    description:
      "Small niche. Mirror covered with pinned sackcloth; dust in the cloth folds. Shelf with tarnished comb, razor, silver - unused, never cleared out.",
    enemies: [],
    notes:
      "R171. Always. Dark. No enemies. Dead end. " +
      "If player removes cloth: living reflection (warm, breathing) in a place built for the dead - no mechanical reward; evidence / dungeon's last question: what does a living person do here - take, hold, break, or walk away? " +
      'Cross-ref: Ending 4 emotional credibility, R165 "high consecration" line.',
    props: [
      {
        id: "covered_mirror_r171",
        label: "Covered Mirror",
        icon: "\u{1FA9F}",
        desc: "Sackcloth pinned over glass - not mourning, notation. A margin note scratched on the frame reads, in the same hand as the ledgers: SERVES NO FUNCTION. The veil is efficiency dressed as indifference.",
        gridPosition: { row: 2, col: 14 },
        onExamine: [
          { type: "set_flag", flag: "examined_covered_mirror_r171" },
          {
            type: "log",
            message:
              "Something I could look at - if looking were still on anyone's schedule down here.",
          },
        ],
        actions: [
          {
            id: "lift_cloth",
            label: "Draw back the cloth",
            requires: { notFlags: ["uncovered_mortal_quarters_mirror_r171"] },
            effects: [
              { type: "set_flag", flag: "uncovered_mortal_quarters_mirror_r171" },
              {
                type: "log",
                message:
                  "Glass throws me back - breath, blood-color, warmth - obscene in a place that forgot how to need lungs. Nothing to pocket. Only my own face asking what a living heir does when the deep offers everything and nothing at once.",
              },
            ],
          },
        ],
      },
      {
        id: "silver_locket_r171",
        label: "Silver Locket",
        icon: "\u{1F48E}",
        desc: "Small, tarnished, still latched. Someone they loved - the room refuses to narrate it; the object simply waited because no work order cleared the shelf.",
        gridPosition: { row: 3, col: 13 },
        onExamine: [
          { type: "set_flag", flag: "examined_serevic_silver_locket_r171" },
          {
            type: "log",
            message: "Love left like paperwork - present, unindexed, unreconciled.",
          },
        ],
      },
      {
        id: "discontinued_toiletries_r171",
        label: "Comb and Razor",
        icon: "\u{1F9F4}",
        desc: "Bone comb, steel razor, dried soap rim - artifacts of a discontinued process. Maintenance never needed them; maintenance never removed them.",
        gridPosition: { row: 3, col: 15 },
        onExamine: [
          { type: "set_flag", flag: "examined_serevic_discontinued_toiletries_r171" },
          {
            type: "log",
            message: "Grooming as ghost - habits outlived the flesh that owned them.",
          },
        ],
      },
    ],
  },
  6: {
    label: "Through the Hidden Passage",
    hint: "service stone; the same dust as the sanctum's back way.",
    description: "Same service stone and dust as the sanctum hidden door.",
    enemies: [],
    exit: { toAreaId: "a5_sanctum", toRoomGridId: 8 },
    notes:
      "Exit. Returns to a5_sanctum R162 (grid 8). Pair: sanctum room 8 → mortal grid 2 (R168). Cross-ref: R157 hidden door.",
  },
  7: {
    label: "Loose Panel to the Outer Ward",
    hint: "salt-block seam; cold air and coldfire leak from the junction beyond.",
    description: "Loose panel; coldfire-green and outer-ward air on the far side.",
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
  desc: "A corridor of dust and stopped breath - the wing no ledger bothered to reopen. Proof someone lived here once, then was filed away as nothing pending.",
  difficulty: 5,
  generator: "authored",
  authored: {
    grid: A5_MORTAL_QUARTERS_GRID,
    rooms: A5_MORTAL_QUARTERS_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
};
