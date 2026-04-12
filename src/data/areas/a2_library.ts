import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 2 - The Library (R43–R50)
 * R43↔R44↔R45; R44↔R46; R43↔R47↔R48; R47↔R49; R47↔R50.
 */

// prettier-ignore
export const A2_LIBRARY_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
 [ 1, 1, 10, 10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 1
 [ 1, 1, 10, 10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 2
 [ 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 3
 [ 1, 1, 2, 2, 2, 0, 3, 3, 3, 0, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 4 R43↔R44↔R46
 [ 1, 1, 2, 2, 2, 1, 3, 3, 3, 1, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 5
 [ 1, 1, 2, 2, 2, 1, 3, 3, 3, 1, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 6
 [ 1, 1, 2, 2, 2, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 7
 [ 1, 1, 2, 2, 2, 1, 3, 0, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 8 R44↔R45
 [ 1, 1, 2, 2, 2, 1, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 9
 [ 1, 1, 2, 2, 2, 1, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 10
 [ 1, 1, 2, 2, 2, 0, 6, 6, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 11 R43↔R47
 [ 1, 1, 1, 1, 1, 1, 6, 6, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 12
 [ 1, 1, 1, 1, 1, 1, 6, 6, 6, 6, 6, 0, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1], // 13 R47↔R48
 [ 1, 1, 1, 1, 1, 1, 6, 6, 6, 6, 6, 0, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1], // 14
 [ 1, 1, 1, 1, 1, 1, 6, 6, 6, 6, 6, 0, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1], // 15
 [ 1, 1, 1, 1, 1, 1, 6, 6, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 16
 [ 1, 1, 1, 1, 1, 1, 6, 6, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 17
 [ 1, 1, 1, 1, 1, 1, 6, 6, 6, 0, 8, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 18 R47↔R49 (col 9)
 [ 1, 1, 1, 1, 1, 1, 6, 6, 6, 1, 8, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 19
 [ 1, 1, 1, 1, 1, 1, 6, 6, 6, 6, 6, 6, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 20 R47↔R50 (col 12; avoids R49 col 10)
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 9, 9, 9, 9, 1, 1, 1, 1, 1, 1], // 21
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 9, 9, 9, 9, 1, 1, 1, 1, 1, 1], // 22
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 23
];

export const A2_LIBRARY_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Library Entrance",
    hint: "an arch demands seek and be illuminated; zombies mime shelving books that are long gone.",
    description:
      "Archway with deep-carved motto. Past it: rows of empty wooden racks, cracked varnish. " +
      "Thin coldfire. Board floor; salt dust; boots sound sharp.",
    enemies: ["zombie", "zombie"],
    isStart: true,
    notes:
      "R43. COLDFIRE. Era 2+3. Room design ref R43. " +
      "Zombies mime shelving vanished volumes. " +
      "Connects: cloister exit grid 10, R44, R47. Chapel noise → Library Ghost risk.",
    props: [
      {
        id: "library_entrance_arch_motto",
        label: "Carved Arch",
        icon: "\u{1F3DB}\uFE0F",
        desc: "Letters deep-cut through old varnish into older stone: a command and a promise in one breath.",
        gridPosition: { row: 6, col: 3 },
        onExamine: [
          { type: "set_flag", flag: "read_library_arch_motto_r43" },
          {
            type: "log",
            message: "SEEK AND BE ILLUMINATED. The order never specified what kind of light.",
          },
        ],
      },
    ],
  },
  3: {
    label: "Public Stacks",
    hint: "narrow galleries of salt-preserved spines; shapes drift between shelves without feet.",
    description:
      "Tight aisles between tall shelves. Leather bindings, white salt crust on some spines. " +
      "Coldfire; dust in the light. Noticeably colder between the stacks. Sound dies a few steps in - then a random creak carries.",
    enemies: ["ghost", "ghost"],
    notes:
      "R44. COLDFIRE. Era 2. Room design ref R44. Ghosts reshelve; quiet zone - adjacent fights can wake them. " +
      "Connects: R43, R45, R46.",
    props: [
      {
        id: "order_training_primers",
        label: "Training Primers",
        icon: "\u{1F4DA}",
        desc: "Surviving volumes on theology and history: every other page warns of darkness rising, thin specifics, thick exhortation. Geology is absent; fear is thorough.",
        gridPosition: { row: 7, col: 7 },
        onExamine: [
          { type: "set_flag", flag: "read_order_training_primers_r44" },
          {
            type: "log",
            message:
              "The index lists 'The Moral Geography of Shadow' but not a single stratum map. The order taught what served the tithe.",
          },
        ],
      },
      {
        id: "meditation_manual_r44",
        label: "Meditation Manual",
        icon: "\u{1F4D2}",
        desc: "A slim codex bound in cord, exercises for breath and attention before battle. Margins: a nervous hand practiced sword forms in ink.",
        gridPosition: { row: 8, col: 6 },
        actions: [
          {
            id: "study",
            label: "Study the exercises",
            effects: [
              { type: "set_flag", flag: "studied_library_meditation_manual" },
              { type: "heal_player", amount: 2 },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Slow breath, steady grip. Your shoulders loosen - a small, borrowed calm.",
              },
            ],
          },
        ],
      },
    ],
  },
  4: {
    label: "Reading Room",
    hint: "dead lamps on desks; something small moves behind overturned furniture.",
    description:
      "Reading room wrecked: desks tipped, lamp wicks dry. Light mostly from the doorway. " +
      "Deep shadows in the corners. Dry paper and old varnish smell. Floorboards pop on their own.",
    enemies: ["ghost"],
    notes:
      "R45. COLDFIRE. Room design ref R45. Mira encounter 2: trade gives patrol windows Areas 1–2 and shortcut R61→R41; blocking her exits loses the deal. " +
      "Connects: R44 only (via R44 chain in layout).",
    props: [
      {
        id: "mira_encounter_r45",
        label: "Crouched Figure",
        icon: "\u{1F9D1}",
        desc: "A woman in travel leathers hugs a satchel behind an overturned desk. Her eyes flick to the Upper Galleries arch as if measuring distance, not courage.",
        gridPosition: { row: 9, col: 8 },
        actions: [
          {
            id: "parley",
            label: "Offer passage - hear her terms",
            effects: [
              { type: "set_flag", flag: "mira_met_r45" },
              { type: "set_flag", flag: "mira_r45_allied" },
              { type: "set_flag", flag: "knows_upper_passage_r61_to_r41" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Mira trades what she knows about patrol timing - from the inner gate route through these galleries - for you not blocking her run toward the upper cut. She scratches a line on the floor: chapter-house portraits, a maintenance crawl, then you're over the cavern's big hearth before the nave stairs would take you. 'Don't make me regret showing you.'",
              },
            ],
          },
          {
            id: "threaten",
            label: "Cut her off",
            effects: [
              { type: "set_flag", flag: "mira_r45_hostile" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "She kicks a chair into your knees and vanishes into the stacks. No map. No favors.",
              },
            ],
          },
        ],
      },
      {
        id: "mira_desk_stash_gold",
        label: "Folded Cloth and Coins",
        icon: "\u{1FA99}",
        desc: "Under a loose floorboard: a scrap of map someone abandoned, and a purse meant for a restricted vault she never reached.",
        gridPosition: { row: 8, col: 8 },
        actions: [
          {
            id: "take",
            label: "Take the coins",
            effects: [
              { type: "grant_gold", amount: 10 },
              { type: "consume_prop" },
              {
                type: "log",
                message: "10 gold - theft interrupted by collapse and rot, not conscience.",
              },
            ],
          },
        ],
      },
    ],
  },
  5: {
    label: "Order Archive",
    hint: "ledgers and deeds - the paper spine of tithes, licenses, and bought mines.",
    description:
      "Large office floor. Rows of desks, wall cubbies, iron strongboxes bolted down. Smooth salt-block; bright coldfire - easy to read labels. " +
      "Thin dust; everything still squared on the desks. Ink, varnish, cold dry air. " +
      "Very quiet; only your own movement and the tick of cooling metal somewhere.",
    enemies: ["ghost"],
    notes:
      "R46. COLDFIRE. Room design ref R46. Administrative core - anger beat vs authority's greed; lich dialogue can hook Ashvere claim. " +
      "Connects: R44 only.",
    props: [
      {
        id: "salt_tithe_records",
        label: "Salt Tithe Ledgers",
        icon: "\u{1F4C4}",
        desc: "Annual tribute by town: coin for 'blessed salt' and for protection from wards the payers never toured. The handwriting is clerk-proud.",
        gridPosition: { row: 5, col: 11 },
        onExamine: [
          { type: "set_flag", flag: "read_salt_tithe_records" },
          {
            type: "log",
            message:
              "Ordinary salt, a prayer, a seal - and a price that climbed every famine year. The blessing was stamped; the barrier was assumed.",
          },
        ],
      },
      {
        id: "mining_license_schedules",
        label: "Mining License Fee Schedules",
        icon: "\u{1F4C3}",
        desc: "Tables of who paid what to work which gallery. Upper cuts itemized; deep galleries marked forbidden while the order's own teams are absent from the fines.",
        gridPosition: { row: 4, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "read_mining_license_fee_schedules" },
          {
            type: "log",
            message:
              "The purest salt went to vaults the licenses never mention. Miners bought the right to crumbs.",
          },
        ],
      },
      {
        id: "revenue_vs_ward_reports",
        label: "Revenue and Ward Maintenance Reports",
        icon: "\u{1F4CA}",
        desc: "Decades of columns: income rising beside a thin line labeled 'barrier upkeep.' The gap yawns wider each decade - math as accusation.",
        gridPosition: { row: 5, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "read_revenue_vs_ward_maintenance" },
          {
            type: "log",
            message:
              "Protection money poured in; protection spending flatlined. The Vigil ate what it swore to guard.",
          },
        ],
      },
      {
        id: "ashvere_acquisition_file",
        label: "Ashvere Acquisition File",
        icon: "\u{1F4C2}",
        desc: "Deed bundle: the mine bought for twelve silver marks, heirs stripped in the same ink. Margin notes in red: grasping; deluded by entitlement.",
        gridPosition: { row: 6, col: 11 },
        onExamine: [
          { type: "set_flag", flag: "read_ashvere_acquisition_file" },
          {
            type: "log",
            message:
              "Your family name, priced and dismissed in the same breath. If you climb to face what took the order's seat, you could shove this under his nose - and see whether the ink still shames him.",
          },
        ],
      },
      {
        id: "archive_strongbox",
        label: "Iron Strongbox",
        icon: "\u{1F5C4}\uFE0F",
        desc: "Under the archivist's desk, bolted but rust-eaten. Inside: coin stacked with bureaucratic neatness.",
        gridPosition: { row: 4, col: 11 },
        actions: [
          {
            id: "take",
            label: "Take the strongbox coin",
            effects: [
              { type: "grant_gold", amount: 15 },
              { type: "consume_prop" },
              { type: "log", message: "15 gold - tithe change that never went back to the towns." },
            ],
          },
        ],
      },
    ],
  },
  6: {
    label: "Catalog Room",
    hint: "index drawers and finding-slips point toward shelves you're not meant to open.",
    description:
      "Three walls of card drawers. Brass pulls polished by use. Center table stacked with cord-tied finding slips. " +
      "Steady coldfire. Half-open drawers click when the air moves.",
    enemies: [],
    notes:
      "R47. COLDFIRE. Room design ref R47. " +
      "Connects: R43, R48, R49 (Rennic), R50 restricted door.",
    props: [
      {
        id: "restricted_catalog_index",
        label: "Catalog Index - Restricted Wing",
        icon: "\u{1F4DC}",
        desc: "Drawer labels in careful script: On the Persistence of the Self Beyond Mortality; Confessions of the Chapter; Relighting of Sacred Flame - Full Ritual (restricted). Titles enough to guess what they hid.",
        gridPosition: { row: 14, col: 8 },
        onExamine: [
          { type: "set_flag", flag: "read_restricted_catalog_index_r47" },
          {
            type: "log",
            message:
              "Half the entries point to vaults behind the grandmaster-sealed door. Whatever answers the public never got, someone filed it with a number.",
          },
        ],
      },
      {
        id: "cross_reference_cards_r47",
        label: "Finding-Slip Tray",
        icon: "\u{1F5C3}\uFE0F",
        desc: "Salt-stiff cards tied with cord: classified survey citations, ward rotation schedules, 'see also' notes to shelves and shafts that never appeared on the maps they hung for pilgrims.",
        gridPosition: { row: 13, col: 7 },
        onExamine: [
          { type: "set_flag", flag: "read_catalog_cross_reference_cards" },
          {
            type: "log",
            message:
              "The public stacks were a screen. The real geology lived in drawers with locks.",
          },
        ],
      },
    ],
  },
  7: {
    label: "Mining Records",
    hint: "baron-era maps curl at the edges; pump diagrams and reflector notes wait in the dim.",
    description:
      "Darker than the front rooms. Slit windows, bit of coldfire, dead oil lamps on hooks. " +
      "Big tables; curled vellum maps weighted with stones. Iron-gall ink smell. Rougher older floor stone than the catalog hall.",
    enemies: [],
    notes:
      "R48. DIM. Room design ref R48. Correlation of thinning barrier surveys with order mining timelines - lore backbone for Area 4. " +
      "Connects: R47 only.",
    props: [
      {
        id: "mine_engineering_documents",
        label: "Mine Engineering Folio",
        icon: "\u{1F4D0}",
        desc: "Baron-era maps, pump diagrams, valve callouts - the language of the deep drains. Without this, the pump room is only iron soup.",
        gridPosition: { row: 14, col: 13 },
        actions: [
          {
            id: "take",
            label: "Take the folio",
            effects: [
              { type: "set_flag", flag: "has_mine_engineering_documents" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "The sequence clicks in your head as weight in your pack. The pump room downstream may finally move for you.",
              },
            ],
          },
        ],
      },
      {
        id: "crystal_reflector_documentation",
        label: "Reflector Array Notes",
        icon: "\u{1F52D}",
        desc: "Sheaves on crystal reflector arrays - geometry, mounting angles, maintenance oaths. Meant for eyes cleared for the deep workings.",
        gridPosition: { row: 13, col: 12 },
        onExamine: [
          { type: "set_flag", flag: "read_crystal_reflector_documentation" },
          {
            type: "log",
            message:
              "Light bent on purpose, not faith. The barons engineered miracles before the order renamed them.",
          },
        ],
      },
      {
        id: "geological_survey_correlation",
        label: "Survey Correlation Tables",
        icon: "\u{1F4CA}",
        desc: "Early strata show thick natural containment; later surveys pencil the same headings thinner. Someone drew brackets linking dates to gallery reopenings.",
        gridPosition: { row: 15, col: 13 },
        onExamine: [
          { type: "set_flag", flag: "read_geological_thinning_correlation" },
          {
            type: "log",
            message:
              "Extraction timelines and thinning columns share years. The mine paid for the order; the barrier paid for the mine.",
          },
        ],
      },
      {
        id: "baron_investor_letters",
        label: "Investor Correspondence",
        icon: "\u{2709}\uFE0F",
        desc: "Letters filed in two stacks: outward optimism for shareholders, inward letters that mention tremors, dreams of weight, and 'postpone the gala.'",
        gridPosition: { row: 14, col: 12 },
        onExamine: [
          { type: "set_flag", flag: "read_baron_investor_letters_r48" },
          {
            type: "log",
            message:
              "Public face: prosperity. Private margins: dread - and margins that send the reader hunting other volumes for the rest of the truth.",
          },
        ],
      },
    ],
  },
  8: {
    label: "Scholar's Alcove",
    hint: "a niche of open books and a faint glow that does not threaten - only grieves.",
    description:
      "Shallow niche off the stacks - open front, no door. Low ceiling; shelves overhead. Codices left open on a ledge. " +
      "Pale glow in the corner - grey-white, not green coldfire. Still cold. " +
      "Your voice falls flat; almost no echo. Stale paper and old dust on the tongue.",
    enemies: [],
    notes:
      "R49. DARK. Room design ref R49. Rennic: ghost scholar, non-hostile - translation, library wayfinding, hymn–brazier bridge. " +
      "Connects: R47 only.",
    props: [
      {
        id: "rennic_scholar_presence",
        label: "Pale Glow and Ink",
        icon: "\u{1F47B}",
        desc: "A man-shaped shimmer bent over codices he cannot quite turn. Faint light, warm at the edges - grief without heat. When he notices you, his mouth shapes words the air almost carries.",
        gridPosition: { row: 18, col: 10 },
        actions: [
          {
            id: "speak",
            label: "Ask what the flame heard",
            effects: [
              { type: "set_flag", flag: "rennic_spoken_r49" },
              {
                type: "log",
                message:
                  "Rennic's voice steadies when he speaks of the flame - it answered to the voice, he says, not to tithe, not to decree. He translates stray marginalia, tells you the sealed ritual vault lies past the grandmaster's key, warns the shelves facing the street are a lid on a deeper shelf. 'Your family built this. And this place destroyed them for it.'",
              },
            ],
          },
          {
            id: "hum_fragment",
            label: "Hum the fragment you learned",
            desc: "The cadence from the nave hymnal",
            requires: { flags: ["knows_hymn_fragment"] },
            effects: [
              { type: "set_flag", flag: "rennic_harmonized_pale_vigil" },
              {
                type: "log",
                message:
                  "You hum; he answers without thinking - harmony threading the dark like a second sun remembered. Pale Vigil, he whispers. For a breath, the alcove feels lit.",
              },
            ],
          },
        ],
      },
      {
        id: "rennic_notes_codex",
        label: "Rennic's Notes",
        icon: "\u{1F4DD}",
        desc: "Loose gatherings clipped together: the same dates and headings copied from sealed surveys into sermon drafts. Someone lined the lie up until it broke them.",
        gridPosition: { row: 19, col: 10 },
        actions: [
          {
            id: "read",
            label: "Read the collation",
            effects: [
              { type: "set_flag", flag: "read_rennic_notes_transformation_context" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Loose ends pull tight: what Serevic became, what the order knew, what the scholar could never put his name to. You fold the pages into your coat.",
              },
            ],
          },
        ],
      },
    ],
  },
  9: {
    label: "Restricted Section Door",
    hint: "grandmaster seal; the keyhole is dark, and something inside tastes of swallowed light.",
    description:
      "Thick salt-wood door banded with iron. Grandmaster seal plate. Cold draft from the keyhole; your torch flame pulls toward it.",
    enemies: [],
    notes:
      "R50. COLDFIRE. Room design ref R50. Inscription: Beyond lies knowledge too heavy for the uninitiated. Key: Grandmaster's Library Seal (R59). Shadow beyond R52; crystal lantern backtrack gate. " +
      "Grid 9 = return from restricted. Exit → a2_restricted grid 2.",
    exit: { toAreaId: "a2_restricted", toRoomGridId: 2 },
  },
  10: {
    label: "Back to the Cloister",
    hint: "the cloister's coldfire and the echo of the common room.",
    description: "Short hall past empty racks, then the cloister common room opens out.",
    enemies: [],
    exit: { toAreaId: "a2_cloister", toRoomGridId: 3 },
  },
};

export const A2_LIBRARY: AreaDef = {
  id: "a2_library",
  name: "The Library",
  desc: "Stacks that smell of salt and old varnish - the order's pretty version of history shelved a breath away from what they locked.",
  difficulty: 2,
  generator: "authored",
  authored: {
    grid: A2_LIBRARY_GRID,
    rooms: A2_LIBRARY_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
};
