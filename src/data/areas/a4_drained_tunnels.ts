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
      "Loot: waterlogged miner's pack — tools, 8 gold. " +
      "World-state / combat: footing hazard — disadvantage or miss chance in water. " +
      "Connects R111 ↔ R113.",
  },
  4: {
    label: "Pump Station Alpha",
    hint: "massive hand-cranked gear, iron pipe, Era 1 wood and salt-stained iron.",
    enemies: [],
    notes:
      "R113. DARK. Era 1 water control: huge hand-cranked gear, wood, iron pipe. " +
      "Ties conceptually to Area 2 R67. " +
      "Contains: pump maintenance log naming crystal galleries beyond the wet section (foreshadow R117+). Tools. " +
      "Connects R112 ↔ R114.",
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
  },
  7: {
    label: "Clear Passage",
    hint: "cleaner air. tiny salt crystals glitter in the walls ahead.",
    enemies: [],
    notes:
      "R116. DARK. Era 1. Beyond Skullflower. Cleaner air; first small salt crystals in walls — foreshadow Crystal Galleries and salt that returns where nothing scrapes it. " +
      "Connects R115 ↔ R117 (via exit to a4_crystal_galleries). " +
      "Cross-ref: Area 4 Subarea 2 entrance.",
  },
  8: {
    label: "To maintenance shaft",
    hint: "climb toward Area 2 pumps and the order works.",
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
  desc: "Pumped galleries under the old barrier. Wet stone gives way to salt that wants to grow back.",
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
