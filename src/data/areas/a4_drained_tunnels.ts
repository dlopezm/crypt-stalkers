import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 4 — The Deep Workings — Drained Tunnels (R111–R116), difficulty 4.
 * Design grid IDs 2–7 = R111–R116; 8 = exit a2_maintenance; 9 = exit a4_crystal_galleries.
 * Topology: linear chain only; R115 (6) gates R114→R116 (no 5–7 shortcut).
 */

// prettier-ignore
export const A4_DRAINED_TUNNELS_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  8,  8,  0,  2,  2,  0,  3,  3,  0,  4,  4,  0,  5,  5,  0,  6,  6,  0,  7,  7,  0,  9,  9,  1,  1],
  [ 1,  1,  1,  1,  1,  8,  8,  0,  2,  2,  0,  3,  3,  0,  4,  4,  0,  5,  5,  0,  6,  6,  0,  7,  7,  0,  9,  9,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
];

export const A4_DRAINED_TUNNELS_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Drain Mouth",
    hint: "wet stone and the smell of worked pumps. the shaft above is quiet now.",
    enemies: [],
    isStart: true,
    notes:
      "R111. DARK. Era 1 + 2. Bottom of drain shaft from Area 2 R68 (needs FIRE + Skullflower + pumps). " +
      "Recently drained: wet walls, floor puddles; order pump works above mine-era stone. " +
      "Air: wet stone, old salt. Cross-ref: Area 2 R68 arrival; forward to R112. " +
      "Teaching: transition from order construction to raw mine.",
  },
  3: {
    label: "Flooded Gallery",
    hint: "ankle-deep water. cart rails glint beneath the murk.",
    enemies: ["rat", "rat", "rat"],
    notes:
      "R112. DARK. Era 1. Gallery still partly flooded — ankle-deep water, bad footing; pumps lowered level. " +
      "Rats along waterline; cart tracks under surface. " +
      "World-state / combat: footing hazard — disadvantage or miss chance in water. " +
      "Connects R111 ↔ R113.",
    props: [
      {
        id: "waterlogged_miners_pack_r112",
        label: "Waterlogged Miner's Pack",
        icon: "\u{1F392}",
        desc: "Canvas black with wet, buckles rusted shut. Inside: oil-wrapped tools and a pay-pouch that never made it topside — the kind of weight someone died still carrying.",
        gridPosition: { row: 1, col: 11 },
        actions: [
          {
            id: "loot_pack",
            label: "Empty the pack",
            effects: [
              { type: "grant_gold", amount: 8 },
              { type: "set_flag", flag: "read_waterlogged_pack_r112" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Eight gold in tarnished coin. The tools smell of river mud and old sweat.",
              },
            ],
          },
        ],
      },
    ],
  },
  4: {
    label: "Pump Station Alpha",
    hint: "massive hand-cranked gear, iron pipe, old wood and salt-stained iron.",
    enemies: [],
    notes:
      "R113. DARK. Era 1 water control: huge hand-cranked gear, wood, iron pipe. " +
      "Ties conceptually to Area 2 R67. " +
      "Connects R112 ↔ R114.",
    props: [
      {
        id: "pump_maintenance_log_r113",
        label: "Pump Maintenance Log",
        icon: "\u{1F4D6}",
        desc: "Ledger chained to the gear frame. Entries in a confident engineer's hand describe head pressure, gasket rot, and — toward the back — a nervous margin note about galleries beyond the wet belt where the crystals 'answer the lamps wrong.'",
        gridPosition: { row: 1, col: 17 },
        onExamine: [
          { type: "set_flag", flag: "read_pump_maintenance_log_r113" },
          {
            type: "log",
            message:
              "Past the wet belt, the entries name crystal halls — dry air, wrong reflections in the lamps. Someone drew a line you could follow with your feet.",
          },
        ],
      },
      {
        id: "pump_station_tool_rack_r113",
        label: "Spare Tools",
        icon: "\u{1F6E0}\uFE0F",
        desc: "Iron wrenches, grease jars, and spare pins for the crank dog. Everything is old mine iron — heavier than it needs to be, built for hands that expected to die old at their post.",
        gridPosition: { row: 2, col: 18 },
        onExamine: [
          { type: "set_flag", flag: "examined_pump_tools_r113" },
          {
            type: "log",
            message: "Serviceable gear. Someone loved this machine enough to maintain it.",
          },
        ],
      },
    ],
  },
  5: {
    label: "Dry Gallery",
    hint: "a skeleton hefts a pickaxe on a fixed loop until it notices you.",
    enemies: ["skeleton"],
    notes:
      "R114. DARK. Era 1. Fully drained gallery. " +
      "Skeleton = Era 3 abandoned crew — pickaxe, cart on track, fixed patrol loop until light/noise aggro. " +
      "Impl note: avoid soft-lock on narrow track. " +
      "IMPORTANT: no corridor shortcut to R116 — player must pass R115 gate. " +
      "Connects R113 ↔ R115 only.",
    props: [
      {
        id: "salt_cart_on_track_r114",
        label: "Cart on the Rails",
        icon: "\u{1F6E4}\uFE0F",
        desc: "A salt cart frozen mid-haul, wheels kissed to the track. Scrapes on the timber show the loop it traced — back and forth — while whoever drove it forgot how to stop.",
        gridPosition: { row: 1, col: 17 },
        onExamine: [
          { type: "set_flag", flag: "examined_r114_salt_cart" },
          {
            type: "log",
            message: "The cart remembers a circle. So does the thing wearing a miner.",
          },
        ],
      },
      {
        id: "loose_pickaxe_r114",
        label: "Pickaxe Leaned on Timber",
        icon: "\u{26CF}\uFE0F",
        desc: "A spare pick head, edge chipped but true, left where a living hand might grab it before running. The haft is dry — the skeleton on the loop prefers its own.",
        gridPosition: { row: 2, col: 14 },
        condition: { notFlags: ["has_pickaxe"] },
        actions: [
          {
            id: "take",
            label: "Take the pickaxe",
            effects: [
              { type: "set_flag", flag: "has_pickaxe" },
              { type: "consume_prop" },
              { type: "log", message: "Cold iron. Familiar weight." },
            ],
          },
        ],
      },
    ],
  },
  6: {
    label: "Skullflower Threshold",
    hint: "blue-green bioluminescence chokes the way. something fibrous breathes.",
    enemies: [],
    notes:
      "R115. DARK + Skullflower bioluminescence (fake light — no Shadow protection). Era 1 + 3. " +
      "MISSING enemy type: skullflower mass ×1 — physical block; FIRE hard gate. " +
      "In full dark regrows ~5 dungeon turns; sustained real light keeps passage clear. " +
      "World-state: timer may pause/slow in lit tiles (impl). " +
      "Connects R114 ↔ R116 (after clear). Theme: cost of greed / containment vs taking.",
    props: [
      {
        id: "skullflower_mass_r115",
        label: "Skullflower Mass",
        icon: "\u{1FAB7}",
        desc: "Blue-green meat fills the passage — fibrous, wet, and wrong-bright. It pulses like breath. Coldfire and pretty glows do not count as truth here; only fire and honest light make it shrink back.",
        gridPosition: { row: 1, col: 20 },
        onExamine: [
          { type: "set_flag", flag: "examined_skullflower_threshold_r115" },
          {
            type: "log",
            message: "The mass is a door made of hunger. Something behind it remembers open air.",
          },
        ],
      },
    ],
  },
  7: {
    label: "Clear Passage",
    hint: "cleaner air. tiny salt crystals glitter in the walls ahead.",
    enemies: [],
    notes:
      "R116. DARK. Era 1. Beyond Skullflower. Cleaner air. " +
      "Connects R115 ↔ R117 (via exit to a4_crystal_galleries). " +
      "Cross-ref: Area 4 Subarea 2 entrance.",
    props: [
      {
        id: "first_wall_crystals_r116",
        label: "New Wall Crystals",
        icon: "\u{1F48E}",
        desc: "Salt has begun to jewel the seam — tiny facets where nobody has scraped for years. They catch your light like an answer: where the taking stops, the stone starts again.",
        gridPosition: { row: 1, col: 23 },
        onExamine: [
          { type: "set_flag", flag: "examined_first_regrowth_crystals_r116" },
          {
            type: "log",
            message:
              "Where nobody has scraped for years, the salt jewels again. Deeper ahead, you will see what that really means.",
          },
        ],
      },
    ],
  },
  8: {
    label: "To maintenance shaft",
    hint: "climb toward the pumps and the order works above.",
    enemies: [],
    exit: { toAreaId: "a2_maintenance", toRoomGridId: 8 },
  },
  9: {
    label: "Toward crystal galleries",
    hint: "the tunnel brightens with faint facet reflections.",
    enemies: [],
    exit: { toAreaId: "a4_crystal_galleries", toRoomGridId: 2 },
  },
};

export const A4_DRAINED_TUNNELS: AreaDef = {
  id: "a4_drained_tunnels",
  name: "Drained Tunnels",
  desc: "Galleries the pumps emptied under the pale works. Wet stone underfoot; ahead, dry salt wearing new faces where the picks went quiet.",
  difficulty: 4,
  generator: "authored",
  authored: {
    grid: A4_DRAINED_TUNNELS_GRID,
    rooms: A4_DRAINED_TUNNELS_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
  notes:
    "Area 4 Subarea 1 — transition from order works to raw mine. " +
    "Theme hook: treasure and danger same substance; pumping reveals older headings. " +
    "Key beat: Skullflower gate (R115) forces FIRE + light discipline before crystal halls.",
};
