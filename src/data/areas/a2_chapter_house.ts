import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 2 - Chapter House (R56–R61)
 */

// prettier-ignore
export const A2_CHAPTER_HOUSE_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 1 R57
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 2
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 3 R57↔R56
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1], // 4 R56
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1], // 5
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1], // 6
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1], // 7
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1], // 8
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 0, 4, 4, 0, 5, 5, 1, 1, 1], // 9 R56↔R58; R58↔R59
 [ 1, 1, 8, 8, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 5, 5, 1, 1, 1, 1, 1], // 10
 [ 1, 1, 8, 8, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 9, 9, 1], // 11 exit8; armory
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 0, 6, 6, 6, 1, 9, 9, 1], // 12 R56↔R60
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 6, 6, 6, 1, 1, 1, 1], // 13
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1], // 14
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 7, 1, 1, 1, 1, 1], // 15 R61
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 7, 1, 1, 1, 1, 1], // 16
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 17
];

export const A2_CHAPTER_HOUSE_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Chapter Hall",
    hint: "horseshoe table; a necromancer sits like a clerk at the head, zombies at stiff attention.",
    description:
      "Big hall. Horseshoe table - salt-stone with iron inlay. Maps under glass on the surface. Colored-green coldfire in hanging frames. " +
      "High vault; carved plaster frieze with order mottoes. Sound carries; a coin dropped on the table would ring clear.",
    enemies: ["necromancer", "forsworn", "zombie", "zombie", "zombie", "zombie"],
    isStart: true,
    notes:
      "R56. COLDFIRE. Era 2+3. Room design ref R56. Forsworn bodyguards the necromancer — intercept mechanic forces player to deal with it first or reposition. " +
      "Necromancer kill → zombies inert (teaches command structure). " +
      "Connects: R57, R58, R59 (walk through R58: edges 2–4 and 4–5; isolated 2–5 door would merge corridors and add false edges), R60, cloister exit, armory exit.",
    props: [
      {
        id: "dungeon_operational_map",
        label: "Deep Halls War-Map",
        icon: "\u{1F5FA}\uFE0F",
        desc: "Parchment pinned under salt-glass: the bone halls east, the deep cuts west, the sanctum ringed in red - sketched the way a war-table lies. Narrowings and patrol sweeps marked in ink; the corridors don't match stone exactly, but malice does.",
        gridPosition: { row: 6, col: 11 },
        onExamine: [
          { type: "set_flag", flag: "read_dungeon_operational_map_r56" },
          {
            type: "log",
            message:
              "Bone vault east, drowned workings west, a seat of power circled in ink you smell before you read. Someone updates this in a living hand.",
          },
        ],
      },
      {
        id: "chapter_hall_coffer",
        label: "Horseshoe Table Coffer",
        icon: "\u{1FA99}",
        desc: "A locked box beneath the necromancer's seat, key still in the hasp - arrogance or habit. Coin for bribes and corpse-wages.",
        gridPosition: { row: 7, col: 12 },
        actions: [
          {
            id: "take",
            label: "Empty the coffer",
            effects: [
              { type: "grant_salt", amount: 20 },
              { type: "consume_prop" },
              { type: "log", message: "20 salt - operational budget written in metal." },
            ],
          },
        ],
      },
    ],
  },
  3: {
    label: "Grandmaster's Study",
    hint: "patrol dispatches and a portrait of someone still human - eyes you across the years.",
    description:
      "Private study off the hall. Salt-wood paneling. Wide desk; wax built up in layers on the corners. " +
      "Shaded coldfire sconces - light only on the desk top. Wax, paper, and stale room smell.",
    enemies: [],
    notes:
      "R57. COLDFIRE. Room design ref R57. Cultist ×1 not in enemy list. " + "Connects: R56 only.",
    safeRoom: true,
    props: [
      {
        id: "surface_supply_calendar",
        label: "Supply Run Calendar",
        icon: "\u{1F4C5}",
        desc: "Village names and dates: 'supply runs' inked beside crop yields. Evidence of surface operations - requisitions dressed as charity.",
        gridPosition: { row: 1, col: 9 },
        onExamine: [
          { type: "set_flag", flag: "read_grandmaster_supply_calendar" },
          {
            type: "log",
            message:
              "The order taxed the living the way it taxed the dead - on schedule, with seals.",
          },
        ],
      },
      {
        id: "patrol_dispatches_r57",
        label: "Patrol Dispatches",
        icon: "\u{1F4E4}",
        desc: "Recent orders: corridors, timings, who may carry coldfire where. Margins note 'unauthorized archive traffic' - someone else reads these.",
        gridPosition: { row: 2, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "read_patrol_dispatches_r57" },
          {
            type: "log",
            message:
              "The necromancer's handwriting repeats; the cultist's corrections argue. Command is layered.",
          },
        ],
      },
      {
        id: "serevic_portrait_human",
        label: "Portrait - Serevic (Living)",
        icon: "\u{1F5BC}\uFE0F",
        desc: "Oil on salt-panel: Serevic while flesh still obeyed him, severe in grandmaster whites. The painter caught restraint, not kindness - a man who mistook control for care.",
        gridPosition: { row: 2, col: 9 },
        onExamine: [
          { type: "set_flag", flag: "read_serevic_portrait_r57" },
          {
            type: "log",
            message: "Eyes follow you anyway. Whatever sits on the throne now wore this face once.",
          },
        ],
      },
      {
        id: "grandmaster_desk_strongbox",
        label: "Desk Strongbox",
        icon: "\u{1F5C4}\uFE0F",
        desc: "Heavy iron, wax dribbles in layers. Inside: stacked marks and a list of names crossed out one by one.",
        gridPosition: { row: 1, col: 10 },
        actions: [
          {
            id: "take",
            label: "Take the strongbox contents",
            effects: [
              { type: "grant_salt", amount: 30 },
              { type: "consume_prop" },
              { type: "log", message: "30 salt - the study's true sermon." },
            ],
          },
        ],
      },
    ],
  },
  4: {
    label: "Scribe's Room",
    hint: "a zombie scratches blank paper while shelves hold deployment logs and rosters.",
    description:
      "Clerks' workroom. Copy desks, ink-wells, shelves sagging under rotten ledger bindings. " +
      "Coldfire in a ceiling track; moving shadow through hanging seals and ribbon. Chair legs have worn arcs in the floor stone.",
    enemies: ["zombie"],
    notes:
      "R58. COLDFIRE. Room design ref R58. Tactical gaps Areas 3–5; warden names tie Area 3 Epitaph Gallery. " +
      "Connects: R56 only.",
    props: [
      {
        id: "deployment_logs_r58",
        label: "Deployment Logs",
        icon: "\u{1F4C4}",
        desc: "Shelves of rot-bound books: who was sent where, which sectors abandoned, which doors 'left unwatched' on purpose. Gaps as policy.",
        gridPosition: { row: 9, col: 14 },
        onExamine: [
          { type: "set_flag", flag: "read_deployment_logs_r58" },
          {
            type: "log",
            message:
              "Gaps between the bone halls and the deep cuts - someone drew corridors the patrols are ordered to miss.",
          },
        ],
      },
      {
        id: "warden_roster_r58",
        label: "Warden Roster",
        icon: "\u{1F4DC}",
        desc: "Names matched to carved stone you haven't stood before. Dead wardens listed as 'on rotation' years after their burial dates. Someone kept the fiction going on paper long after the bodies were interred.",
        gridPosition: { row: 9, col: 15 },
        onExamine: [
          { type: "set_flag", flag: "read_warden_roster_r58" },
          {
            type: "log",
            message:
              "The roster lies; the carved names in the bone vault do not. Compare when you stand before the epitaphs.",
          },
        ],
      },
    ],
  },
  5: {
    label: "Seal Room",
    hint: "ruined ceremonial seals on velvet; one stamp still reads clear enough to open heavy doors.",
    description:
      "Climate-cool and faintly acrid - wax solvent, metal polish, old velvet gone bald on display boards. Cases line the walls under coldfire hoods; brass catches light in disciplined gleam. " +
      "The room is quiet except for the tick of cooling metal - a treasury of signatures that outlived the hands that owned them.",
    enemies: [],
    safeRoom: true,
    notes: "R59. COLDFIRE. Room design ref R59. Connects: R56 only.",
    props: [
      {
        id: "grandmaster_library_seal",
        label: "Grandmaster's Library Seal",
        icon: "\u{1F48E}",
        desc: "Intaglio intact: the key to the restricted archive. Wax still clings to its face from the last authorized entry - whenever that was.",
        gridPosition: { row: 10, col: 15 },
        actions: [
          {
            id: "take",
            label: "Take the library seal",
            effects: [
              { type: "set_flag", flag: "has_grandmaster_library_seal" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Heavy in the palm. The archivists will bow or bluff - either way, the door listens to this.",
              },
            ],
          },
        ],
      },
      {
        id: "order_official_seal",
        label: "Spare Order Seal",
        icon: "\u{1F58A}\uFE0F",
        desc: "A secondary stamp for edicts and supply manifests. Less grand than the library key, more common - the bureaucracy's everyday crown.",
        gridPosition: { row: 10, col: 16 },
        actions: [
          {
            id: "take",
            label: "Take the official seal",
            effects: [
              { type: "set_flag", flag: "has_order_official_seal" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Heavy wax, familiar sigil - enough to bluff a checkpoint or seal a lie until someone who matters reads closer.",
              },
            ],
          },
        ],
      },
    ],
  },
  6: {
    label: "Portrait Gallery",
    hint: "grandmaster after grandmaster - dignity thinning to strain - then a blank wall.",
    description:
      "Widened corridor lined with gilt-framed portraits on salt-panel. Yellow-filtered coldfire - looks warm, feels cold. " +
      "One section of wall bare plaster, lighter rectangle where a frame used to hang. Soft echo.",
    enemies: [],
    notes:
      "R60. COLDFIRE. Room design ref R60. Visual timeline of authority eroding; Mira's shortcut to R61 → R41 when allied at R45. " +
      "Connects: R56, R61.",
    props: [
      {
        id: "grandmaster_succession_portraits",
        label: "Succession Portraits",
        icon: "\u{1F5BC}\uFE0F",
        desc: "A line of faces: dignity, then strain, then fear dressed as piety. Each frame heavier gilt than the last - as if metal could prop up collapsing purpose.",
        gridPosition: { row: 12, col: 16 },
        onExamine: [
          { type: "set_flag", flag: "read_grandmaster_succession_portraits" },
          {
            type: "log",
            message:
              "Authority outlasting its purpose, painted in real time. The last frame before the blank wall shows someone young - Serevic, before the math ate him.",
          },
        ],
      },
      {
        id: "blank_successor_wall",
        label: "Blank Wall",
        icon: "\u{2B1C}",
        desc: "Plaster bare where a successor should hang. No frame, no hook - only a rectangle paler than its neighbors, as if light refused the last commission.",
        gridPosition: { row: 12, col: 15 },
        onExamine: [
          { type: "set_flag", flag: "read_portrait_gallery_blank_wall" },
          {
            type: "log",
            message:
              "No successor. No line. The order ended in paperwork before it ended in undeath.",
          },
        ],
      },
    ],
  },
  7: {
    label: "Upper Passage",
    hint: "narrow maintenance cut; air from the cavern below carries old smoke and cold stone.",
    description:
      "Narrow maintenance cut overhead: loose grit, worn steps. Draft carries smoke and damp stone from the cavern below.",
    enemies: [],
    notes:
      "R61. DARK. Room design ref R61. To Chapel R41; Mira shortcut (R45). Arrival from chapel exit 9. Exit → a2_chapel grid 6.",
    exit: { toAreaId: "a2_chapel", toRoomGridId: 6 },
  },
  8: {
    label: "Back to the Cloister",
    hint: "the dormitory hub and the inner gate route.",
    description:
      "Passage widens toward the cloister common room - benches, more voices, same cold smell.",
    enemies: [],
    exit: { toAreaId: "a2_cloister", toRoomGridId: 3 },
  },
  9: {
    label: "Toward Armory & Lower Gate",
    hint: "posted orders and racks of steel beyond.",
    description: "Connecting hall. Lamp oil and iron smell ahead; coldfire on the walls.",
    enemies: [],
    exit: { toAreaId: "a2_armory", toRoomGridId: 2 },
  },
};

export const A2_CHAPTER_HOUSE: AreaDef = {
  id: "a2_chapter_house",
  name: "Chapter House",
  desc: "Where they moved coin and fear through ink - maps on the wall, seals in the drawer, faces going hollow frame by frame.",
  difficulty: 2,
  generator: "authored",
  authored: {
    grid: A2_CHAPTER_HOUSE_GRID,
    rooms: A2_CHAPTER_HOUSE_ROOMS,
  },
  combatRooms: [],
};
