import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 1 — The Pale Approach — Mine Mouth (R1–R6)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * Connectivity (per design doc):
 *   exit8(gatehouse) ↔ R1 ↔ R2 ↔ R3(hub) ↔ R4
 *                                    ↔ R5
 *                                    ↔ R6 ↔ exit9(upper galleries)
 *
 * Each corridor segment is isolated (no shared 0-cell components)
 * so the room graph matches the design exactly.
 */

// prettier-ignore
export const A1_MINE_MOUTH_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  5,  5,  5,  1,  1,  1,  1,  1], //  1  R4 Foreman's Office
  [ 1,  8,  8,  1,  1,  1,  1,  1,  1,  5,  5,  5,  1,  1,  1,  1,  1], //  2  exit8 (gatehouse)
  [ 1,  8,  8,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1], //  3  R3→R4 corridor
  [ 1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1], //  4  exit8→R1 corridor
  [ 1,  2,  2,  2,  0,  3,  3,  0,  4,  4,  4,  4,  0,  6,  6,  1,  1], //  5  R1→R2→R3(hub)→R5
  [ 1,  2,  2,  2,  1,  3,  3,  1,  4,  4,  4,  4,  1,  6,  6,  1,  1], //  6
  [ 1,  2,  2,  2,  1,  3,  3,  1,  4,  4,  4,  4,  1,  1,  1,  1,  1], //  7
  [ 1,  1,  1,  1,  1,  3,  3,  1,  4,  4,  4,  4,  1,  1,  1,  1,  1], //  8
  [ 1,  1,  1,  1,  1,  3,  3,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1], //  9  R3→R6 corridor
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7,  1,  1,  1,  1,  1], // 10  R6 Gallery Threshold
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7,  0,  9,  9,  1,  1], // 11  R6→exit9
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7,  1,  9,  9,  1,  1], // 12  exit9
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 13
];

export const A1_MINE_MOUTH_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Entrance Arch",
    hint: "iron cart tracks bite the floor. a defaced crest still reads as yours.",
    enemies: [],
    isStart: true,
    notes:
      "R1. Era 1 + Era 2 plaster. SUNLIT — safe, no combat. " +
      "Defaced Ashvere crest: chisel marks from the order but pickaxe, crystal, mountain still read as family. " +
      "Motto survives in fragments: 'From the earth, prosperity' (gate hint for R24). " +
      "Iron cart tracks run inward. Era layering visible: raw stone → plaster → neglect. " +
      "Thematic beat: you stand where a fortune was dug from stone — and where the bill was charged to people who did not keep the books.",
    props: [
      {
        id: "ashvere_crest",
        label: "Defaced Crest",
        icon: "\u{1F6E1}\uFE0F",
        desc: "An iron shield above the arch. Chisel marks where the order tried to erase it, but the relief survives: pickaxe, crystal, mountain. Your family's mark. Beneath it, letters scored deep enough to outlast vandalism: 'From the earth, prosperity.'",
        gridPosition: { row: 5, col: 2 },
        onExamine: [
          { type: "set_flag", flag: "knows_ashvere_motto" },
          {
            type: "log",
            message: "The Ashvere motto. You remember it differently from the stories.",
          },
        ],
      },
    ],
  },
  3: {
    label: "Weighing Station",
    hint: "rusted scales and chains on a low platform. something scurries in the dim.",
    enemies: ["rat", "rat"],
    notes:
      "R2. Era 1. DIM (some daylight). " +
      "Low stone platform; rusted scales and chains; water-stained FOREMAN'S LOG on shelf. " +
      "Log names player's SURNAME as shift supervisor — proof this place was theirs, and that their name sat above crews whose terms you have not yet read. " +
      "5 gold in scattered coins. " +
      "Teaching: documents reward thorough search; rats introduce breeding / door-squeeze mechanics.",
    props: [
      {
        id: "foreman_log",
        label: "Foreman's Log",
        icon: "\u{1F4D6}",
        desc: "A water-stained ledger on a rotting shelf. The ink has bled, but the shift header still reads clearly: SUPERVISOR — ASHVERE. Your surname sat above crews whose terms you have not yet read.",
        gridPosition: { row: 6, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "read_foreman_log" },
          {
            type: "log",
            message: "Your family name, printed above other people's labor.",
          },
        ],
      },
      {
        id: "scattered_coins",
        label: "Scattered Coins",
        icon: "\u{1FA99}",
        desc: "Five silver-worn coins between the scales and the wall, missed by scavengers. Old mint, still heavy.",
        gridPosition: { row: 7, col: 6 },
        actions: [
          {
            id: "take",
            label: "Pocket the coins",
            effects: [
              { type: "grant_gold", amount: 5 },
              { type: "consume_prop" },
              { type: "log", message: "5 gold." },
            ],
          },
        ],
      },
    ],
  },
  4: {
    label: "Cart Depot",
    hint: "salt carts, warm raw heaps. tracks fork deeper into stone.",
    enemies: ["rat", "rat", "rat"],
    notes:
      "R3. Era 1. DIM. HUB room — branches to office, safe shaft, and darker threshold. " +
      "Wide chamber for storage and cart repair. Several carts; one heaped with raw salt as if recently moved — Era 3 logistics still touch the mouth. " +
      "Deepest salt chunks catch dim light oddly; wall-facing cartloads feel a trace WARM, as if the stone remembered a pulse from below. " +
      "Salt blocks (crafting/quest later); 8 gold.",
  },
  5: {
    label: "Foreman's Office",
    hint: "a crooked portrait, scratched eyes, GREED carved across the chest. papers crowd every surface.",
    enemies: [],
    notes:
      "R4. Era 1 + Era 2 vandalism. DIM. Pocket office carved into wall. " +
      "BARON'S PORTRAIT hangs crooked: eyes scratched, 'GREED' carved across chest — order judgment frozen in paint and knife. " +
      "INDENTURED LABOR CONTRACTS: workers charged for housing, tools, food; interest and fees structured so the principal never shrank. Same surnames appear for years. " +
      "SAFETY PETITIONS from miners' guild — ventilation, bracing, pace in the deep — each stamped REVIEWED and filed, no amendment, no repair date, no answer. " +
      "MINE MAPS (hint deep layout / connections). " +
      "12 gold in LOCKED DRAWER (key elsewhere or lockpick). " +
      "First proof the heir's prosperity had a line item paid in someone else's life.",
    props: [
      {
        id: "baron_portrait",
        label: "Baron's Portrait",
        icon: "\u{1F5BC}\uFE0F",
        desc: "The baron's portrait hangs crooked: eyes scratched out, GREED carved across the chest. Order judgment, frozen in paint and knife.",
        gridPosition: { row: 1, col: 9 },
      },
      {
        id: "indenture_contracts",
        label: "Labor Contracts",
        icon: "\u{1F4DC}",
        desc: "Indentured labor contracts fill the filing niche. Workers charged for housing, tools, food — interest and fees structured so the principal never shrank. The same surnames appear for years. Pinned beneath: safety petitions from the miners' guild. Each stamped REVIEWED, filed, no answer.",
        gridPosition: { row: 1, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "read_indentures" },
          {
            type: "log",
            message: "Your ancestor's arithmetic. The debt was designed to grow.",
          },
        ],
      },
      {
        id: "mine_maps",
        label: "Mine Maps",
        icon: "\u{1F5FA}\uFE0F",
        desc: "Survey maps of the upper and deep galleries. Pencil marks show planned expansions that never happened — or weren't supposed to happen yet.",
        gridPosition: { row: 1, col: 11 },
        onExamine: [{ type: "set_flag", flag: "has_mine_maps" }],
      },
      {
        id: "locked_drawer_gold",
        label: "Locked Drawer",
        icon: "\u{1F512}",
        desc: "The bottom drawer is locked but the wood is rotten. A sharp pull breaks it open. Inside: 12 gold coins and a stamped receipt for 'emergency ventilation repair' — funds allocated, never spent.",
        gridPosition: { row: 2, col: 10 },
        actions: [
          {
            id: "take",
            label: "Take the gold",
            effects: [
              { type: "grant_gold", amount: 12 },
              { type: "consume_prop" },
              { type: "log", message: "12 gold. The ventilation was never repaired." },
            ],
          },
        ],
      },
    ],
  },
  6: {
    label: "Ventilation Shaft Base",
    hint: "pale daylight threads a narrow shaft. a cold brazier waits, unlit.",
    enemies: [],
    notes:
      "R5. Era 1 + Era 2. SUNLIT — safe room (sunlight blocks most monster entry; rest/plan spot). " +
      "Vertical shaft; too narrow to climb. " +
      "ERA 2 BRAZIER — extinguished, one of the first sacred fire fixtures the player sees. Relightable after Area 2 ritual. " +
      "When lit: true-light zone here.",
    props: [
      {
        id: "extinguished_brazier",
        label: "Cold Brazier",
        icon: "\u{1F56F}\uFE0F",
        desc: "A wrought-iron brazier at the base of the shaft. The bowl is full of grey ash and a single black wick-end. The metal is cold to the touch. Sunlight washes down from above — it keeps the dark honest, but it does not warm the iron.",
        gridPosition: { row: 5, col: 14 },
        actions: [
          {
            id: "relight",
            label: "Relight the brazier",
            desc: "Requires the consecrated rite from the chapel",
            requires: { flags: ["has_consecration"] },
            effects: [
              { type: "set_flag", flag: "mine_brazier_lit" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "The rite takes. Flame climbs the wick, steady and true. The shaft stops feeling like a throat.",
              },
            ],
          },
          {
            id: "leave_dark",
            label: "Leave it dark",
            desc: "You could come back.",
            effects: [
              { type: "set_flag", flag: "mine_brazier_noted" },
              {
                type: "log",
                message: "You note the brazier's place and move on.",
              },
            ],
          },
        ],
      },
    ],
  },
  7: {
    label: "Gallery Threshold",
    hint: "coldfire strips the walls wrong. bootfalls hum in the salt.",
    enemies: ["skeleton"],
    notes:
      "R6. Era 1 + first Era 3 coldfire. DIM → DARK. Ceiling drops; cart tracks continue. " +
      "FIRST COLDFIRE — bright, wrong, no protection vs true-light-sensitive threats. Coldfire reads as 'the mine is lit' but teaches: green glow is NOT safety. " +
      "FIRST SKELETON — walks loop into R12 (perpetual shift). First undead fight; first place players may see REFORM if they lack blunt. " +
      "Faint WARMTH threads the draft — wrong for a shallow mine. Salt in the seam HUMS almost below hearing when skeleton's boots strike stone. " +
      "Bridges Mine Mouth to Upper Galleries. Environmental teach: fake light visible ahead.",
  },
  8: {
    label: "To the Gatehouse",
    hint: "order stonework climbs toward open sky.",
    enemies: [],
    exit: { toAreaId: "a1_gatehouse", toRoomGridId: 2 },
  },
  9: {
    label: "To Upper Galleries",
    hint: "tracks and coldfire lead into the wide dark.",
    enemies: [],
    exit: { toAreaId: "a1_upper_galleries", toRoomGridId: 2 },
  },
};

export const A1_MINE_MOUTH: AreaDef = {
  id: "a1_mine_mouth",
  name: "Mine Mouth",
  desc: "Where the fortune was dug from stone — and the bill charged to others.",
  difficulty: 1,
  generator: "authored",
  authored: {
    grid: A1_MINE_MOUTH_GRID,
    rooms: A1_MINE_MOUTH_ROOMS,
  },
  combatRooms: [],
  townName: "The Pale Vault",
  notes:
    "Area 1 theme: the cost of greed — greed has a price; it is rarely paid by the one who profits. " +
    "Emotional arc: Recognition (crest, log, family door) → Discomfort (contracts, journals) → Triumph (return with blunt). " +
    "Learning: skeleton reform (blunt kills); true light attracts patrols; coldfire = fake safety; dark = risk/reward; zombies follow fixed routes. " +
    "What Lies Below seed: warmth and resonance in deep-facing salt (R3, R6, R29). " +
    "Family throughline: Ashvere crest (R1), surname in log (R2), contracts (R4), Baron's Wing (R24-R29). " +
    "Baron's arithmetic: debts to expand → surface veins thinned → deeper salt richer but costlier → creditors demanded → extraction deepened. Not villainy — arithmetic.",
};
