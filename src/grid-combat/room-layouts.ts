/* ═══════════════════════════════════════════════════════════════════════════
   Room Terrain Layouts — per-room combat grid configurations
   Each authored room with enemies gets a tactical terrain layout.
   Rooms without enemies don't need combat layouts.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { RoomTerrainLayout, RoomTerrainPlacement, GridPos } from "./types";

function layout(
  w: number,
  h: number,
  playerStart: GridPos,
  enemySpawns: readonly GridPos[],
  placements: readonly RoomTerrainPlacement[],
  exitTile?: GridPos,
): RoomTerrainLayout {
  return {
    gridWidth: w,
    gridHeight: h,
    terrainPlacements: placements,
    playerStart,
    enemySpawns,
    exitTile: exitTile ?? null,
  };
}

function t(
  row: number,
  col: number,
  terrain: RoomTerrainPlacement["terrain"],
  extra?: Partial<RoomTerrainPlacement>,
): RoomTerrainPlacement {
  return { pos: { row, col }, terrain, ...extra };
}

// ═══════════════════════════════════════════════════════════════════════════
// AREA 1 — PALE APPROACH
// ═══════════════════════════════════════════════════════════════════════════

const WEIGHING_STATION = layout(
  6,
  5,
  { row: 4, col: 2 },
  [
    { row: 1, col: 1 },
    { row: 1, col: 4 },
    { row: 2, col: 3 },
  ],
  [t(2, 0, "rubble"), t(2, 5, "rubble"), t(0, 3, "wall"), t(0, 2, "wall")],
);

const CART_DEPOT = layout(
  6,
  5,
  { row: 4, col: 0 },
  [
    { row: 1, col: 1 },
    { row: 1, col: 4 },
    { row: 2, col: 2 },
    { row: 0, col: 3 },
  ],
  [
    t(2, 0, "rail", { railDirection: "east" }),
    t(2, 1, "rail", { railDirection: "east" }),
    t(2, 2, "mine_cart", { railDirection: "east" }),
    t(2, 3, "rail", { railDirection: "east" }),
    t(2, 4, "rail", { railDirection: "east" }),
    t(2, 5, "rail", { railDirection: "east" }),
    t(4, 0, "rail", { railDirection: "east" }),
    t(4, 1, "rail", { railDirection: "east" }),
    t(4, 2, "mine_cart", { railDirection: "east" }),
    t(4, 3, "rail", { railDirection: "east" }),
    t(4, 4, "rail", { railDirection: "east" }),
    t(4, 5, "rail", { railDirection: "east" }),
    t(0, 0, "rubble"),
    t(0, 5, "rubble"),
    t(3, 3, "pillar"),
  ],
);

const GUARD_ROOM = layout(
  6,
  5,
  { row: 4, col: 3 },
  [
    { row: 1, col: 2 },
    { row: 2, col: 0 },
    { row: 2, col: 4 },
  ],
  [t(0, 0, "wall"), t(0, 5, "wall"), t(1, 0, "rubble"), t(3, 2, "pillar"), t(3, 4, "rubble")],
);

const RECEIVING_HALL = layout(
  7,
  6,
  { row: 5, col: 3 },
  [
    { row: 1, col: 1 },
    { row: 1, col: 5 },
    { row: 2, col: 3 },
  ],
  [
    t(0, 0, "wall"),
    t(0, 6, "wall"),
    t(2, 1, "pillar"),
    t(2, 5, "pillar"),
    t(4, 3, "pillar"),
    t(3, 0, "rubble"),
    t(3, 6, "rubble"),
  ],
);

const MAIN_GALLERY = layout(
  7,
  6,
  { row: 5, col: 3 },
  [{ row: 1, col: 3 }],
  [
    t(0, 0, "wall"),
    t(0, 6, "wall"),
    t(2, 1, "pillar"),
    t(2, 5, "pillar"),
    t(4, 1, "salt_deposit"),
    t(4, 5, "salt_deposit"),
    t(3, 3, "brazier"),
  ],
);

const SIDE_GALLERY_EAST = layout(
  5,
  5,
  { row: 4, col: 2 },
  [
    { row: 0, col: 0 },
    { row: 0, col: 4 },
    { row: 1, col: 2 },
    { row: 2, col: 1 },
    { row: 2, col: 3 },
  ],
  [t(3, 1, "rubble"), t(3, 3, "rubble"), t(1, 0, "rubble"), t(1, 4, "rubble")],
);

const SIDE_GALLERY_WEST = layout(
  5,
  5,
  { row: 4, col: 2 },
  [
    { row: 1, col: 1 },
    { row: 1, col: 3 },
  ],
  [t(2, 2, "pillar"), t(0, 0, "salt_deposit"), t(0, 4, "salt_deposit")],
);

const JUNCTION_HALL = layout(
  7,
  6,
  { row: 5, col: 3 },
  [
    { row: 1, col: 2 },
    { row: 2, col: 5 },
  ],
  [
    t(0, 0, "wall"),
    t(0, 6, "wall"),
    t(2, 3, "pillar"),
    t(3, 1, "rubble"),
    t(3, 5, "rubble"),
    t(1, 0, "brazier"),
  ],
);

const PATROL_STATION = layout(
  6,
  5,
  { row: 4, col: 2 },
  [
    { row: 0, col: 1 },
    { row: 0, col: 4 },
  ],
  [t(2, 0, "pillar"), t(2, 5, "pillar"), t(1, 3, "salt_deposit"), t(3, 3, "rubble")],
);

const INNER_GATE = layout(
  8,
  6,
  { row: 5, col: 4 },
  [
    { row: 1, col: 2 },
    { row: 1, col: 5 },
    { row: 2, col: 7 },
  ],
  [
    t(0, 0, "wall"),
    t(0, 1, "wall"),
    t(0, 6, "wall"),
    t(0, 7, "wall"),
    t(2, 2, "pillar"),
    t(2, 5, "pillar"),
    t(4, 2, "pillar"),
    t(4, 5, "pillar"),
    t(3, 0, "rubble"),
    t(3, 7, "rubble"),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// AREA 2 — SANCTIFIED GALLERIES
// ═══════════════════════════════════════════════════════════════════════════

const ARMORY_ENTRANCE = layout(
  6,
  5,
  { row: 4, col: 2 },
  [
    { row: 1, col: 1 },
    { row: 1, col: 4 },
  ],
  [t(2, 0, "rubble"), t(2, 5, "rubble"), t(3, 3, "pillar")],
);

const LOWER_GATE_EAST = layout(
  7,
  5,
  { row: 4, col: 3 },
  [
    { row: 1, col: 1 },
    { row: 1, col: 5 },
  ],
  [t(2, 0, "wall"), t(2, 6, "wall"), t(2, 3, "pillar"), t(3, 1, "brazier"), t(3, 5, "brazier")],
);

const TRAINING_ROOM = layout(
  6,
  6,
  { row: 5, col: 3 },
  [
    { row: 1, col: 1 },
    { row: 1, col: 4 },
    { row: 2, col: 2 },
  ],
  [t(0, 0, "wall"), t(0, 5, "wall"), t(3, 0, "rubble"), t(3, 5, "rubble"), t(2, 3, "pillar")],
);

const CHAPEL_ENTRANCE = layout(
  7,
  6,
  { row: 5, col: 3 },
  [
    { row: 2, col: 1 },
    { row: 2, col: 5 },
  ],
  [
    t(0, 0, "wall"),
    t(0, 6, "wall"),
    t(1, 2, "rubble"),
    t(1, 4, "rubble"),
    t(3, 1, "brazier"),
    t(3, 5, "brazier"),
    t(4, 3, "pillar"),
  ],
);

const NAVE = layout(
  8,
  7,
  { row: 6, col: 4 },
  [
    { row: 1, col: 2 },
    { row: 1, col: 5 },
    { row: 2, col: 4 },
  ],
  [
    t(0, 0, "wall"),
    t(0, 7, "wall"),
    t(2, 1, "rubble"),
    t(2, 6, "rubble"),
    t(3, 2, "pillar"),
    t(3, 5, "pillar"),
    t(5, 2, "pillar"),
    t(5, 5, "pillar"),
    t(1, 4, "brazier"),
    t(4, 4, "brazier"),
  ],
);

const CHOIR_LOFT = layout(
  6,
  5,
  { row: 4, col: 3 },
  [{ row: 1, col: 3 }],
  [
    t(0, 0, "wall"),
    t(0, 5, "wall"),
    t(2, 1, "pillar"),
    t(2, 4, "pillar"),
    t(1, 0, "brazier"),
    t(1, 5, "brazier"),
  ],
);

const SIDE_CHAPEL = layout(
  5,
  5,
  { row: 4, col: 2 },
  [{ row: 1, col: 2 }],
  [t(0, 0, "wall"), t(0, 4, "wall"), t(2, 1, "brazier"), t(2, 3, "brazier"), t(3, 2, "pillar")],
);

// ═══════════════════════════════════════════════════════════════════════════
// AREA 3 — OSSUARY
// ═══════════════════════════════════════════════════════════════════════════

const STACK_ENTRANCE = layout(
  7,
  6,
  { row: 5, col: 3 },
  [
    { row: 1, col: 2 },
    { row: 1, col: 5 },
  ],
  [
    t(0, 0, "wall"),
    t(0, 6, "wall"),
    t(2, 1, "rubble"),
    t(2, 5, "rubble"),
    t(3, 3, "pillar"),
    t(4, 1, "rubble"),
  ],
);

const FEMUR_CORRIDOR = layout(
  8,
  4,
  { row: 3, col: 0 },
  [{ row: 1, col: 6 }],
  [
    t(0, 0, "wall"),
    t(0, 7, "wall"),
    t(3, 0, "wall"),
    t(3, 7, "wall"),
    t(1, 2, "rubble"),
    t(1, 5, "rubble"),
    t(2, 4, "dark_zone"),
    t(2, 3, "dark_zone"),
    t(2, 5, "dark_zone"),
  ],
);

const STACK_CORE = layout(
  8,
  7,
  { row: 6, col: 4 },
  [
    { row: 1, col: 1 },
    { row: 1, col: 4 },
    { row: 1, col: 6 },
    { row: 2, col: 3 },
  ],
  [
    t(0, 0, "wall"),
    t(0, 7, "wall"),
    t(2, 1, "rubble"),
    t(2, 6, "rubble"),
    t(3, 2, "pillar"),
    t(3, 5, "pillar"),
    t(4, 0, "rubble"),
    t(4, 7, "rubble"),
    t(5, 4, "brazier"),
  ],
);

const COLLAPSED_STACK = layout(
  6,
  5,
  { row: 4, col: 3 },
  [
    { row: 0, col: 1 },
    { row: 0, col: 4 },
    { row: 1, col: 2 },
    { row: 2, col: 0 },
    { row: 2, col: 4 },
  ],
  [t(1, 0, "rubble"), t(1, 4, "rubble"), t(3, 1, "rubble"), t(3, 3, "rubble"), t(2, 2, "rubble")],
);

const GREAT_WARD_DOOR = layout(
  8,
  8,
  { row: 7, col: 4 },
  [
    { row: 2, col: 3 },
    { row: 2, col: 5 },
  ],
  [
    t(0, 0, "wall"),
    t(0, 7, "wall"),
    t(7, 0, "wall"),
    t(7, 7, "wall"),
    t(3, 1, "pillar"),
    t(3, 6, "pillar"),
    t(5, 1, "pillar"),
    t(5, 6, "pillar"),
    t(1, 4, "brazier"),
    t(6, 4, "brazier"),
    t(4, 3, "rubble"),
    t(4, 5, "rubble"),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// AREA 4 — DEEP WORKINGS
// ═══════════════════════════════════════════════════════════════════════════

const REFLECTOR_ALPHA = layout(
  6,
  6,
  { row: 5, col: 3 },
  [{ row: 1, col: 3 }],
  [
    t(0, 0, "wall"),
    t(0, 5, "wall"),
    t(2, 1, "salt_deposit"),
    t(2, 4, "salt_deposit"),
    t(3, 2, "dark_zone"),
    t(3, 3, "dark_zone"),
    t(4, 2, "dark_zone"),
    t(4, 3, "dark_zone"),
    t(1, 1, "brazier"),
  ],
);

const GRAND_GALLERY_SHADOWS = layout(
  8,
  6,
  { row: 5, col: 4 },
  [
    { row: 1, col: 1 },
    { row: 1, col: 6 },
  ],
  [
    t(0, 0, "wall"),
    t(0, 7, "wall"),
    t(2, 2, "salt_deposit"),
    t(2, 5, "salt_deposit"),
    t(3, 0, "dark_zone"),
    t(3, 1, "dark_zone"),
    t(3, 6, "dark_zone"),
    t(3, 7, "dark_zone"),
    t(4, 0, "dark_zone"),
    t(4, 1, "dark_zone"),
    t(4, 6, "dark_zone"),
    t(4, 7, "dark_zone"),
    t(1, 4, "brazier"),
    t(4, 4, "brazier"),
  ],
);

const ARRAY_NEXUS = layout(
  7,
  7,
  { row: 6, col: 3 },
  [
    { row: 1, col: 2 },
    { row: 1, col: 5 },
  ],
  [
    t(0, 0, "wall"),
    t(0, 6, "wall"),
    t(2, 0, "dark_zone"),
    t(2, 6, "dark_zone"),
    t(3, 0, "dark_zone"),
    t(3, 6, "dark_zone"),
    t(4, 0, "dark_zone"),
    t(4, 6, "dark_zone"),
    t(2, 3, "salt_deposit"),
    t(4, 3, "salt_deposit"),
    t(3, 1, "brazier"),
    t(3, 5, "brazier"),
    t(5, 3, "brazier"),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// AREA 5 — FOUNDER'S RELIQUARY
// ═══════════════════════════════════════════════════════════════════════════

const CRYSTAL_THRONE_ARENA = layout(
  8,
  8,
  { row: 7, col: 4 },
  [{ row: 1, col: 4 }],
  [
    t(0, 0, "wall"),
    t(0, 7, "wall"),
    t(7, 0, "wall"),
    t(7, 7, "wall"),
    t(2, 2, "pillar"),
    t(2, 5, "pillar"),
    t(5, 2, "pillar"),
    t(5, 5, "pillar"),
    t(1, 1, "salt_deposit"),
    t(1, 6, "salt_deposit"),
    t(6, 1, "salt_deposit"),
    t(6, 6, "salt_deposit"),
    t(3, 4, "brazier"),
    t(4, 4, "brazier"),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT FALLBACK (for rooms without a specific layout)
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_SMALL = layout(
  6,
  5,
  { row: 4, col: 2 },
  [
    { row: 1, col: 1 },
    { row: 1, col: 4 },
    { row: 2, col: 3 },
  ],
  [t(2, 2, "pillar")],
);

const DEFAULT_MEDIUM = layout(
  7,
  6,
  { row: 5, col: 3 },
  [
    { row: 1, col: 1 },
    { row: 1, col: 5 },
    { row: 2, col: 3 },
    { row: 3, col: 2 },
  ],
  [t(2, 2, "pillar"), t(2, 4, "pillar"), t(4, 1, "rubble"), t(4, 5, "rubble")],
);

const DEFAULT_LARGE = layout(
  8,
  7,
  { row: 6, col: 4 },
  [
    { row: 1, col: 1 },
    { row: 1, col: 6 },
    { row: 2, col: 3 },
    { row: 2, col: 5 },
    { row: 3, col: 4 },
  ],
  [
    t(2, 2, "pillar"),
    t(2, 5, "pillar"),
    t(4, 2, "pillar"),
    t(4, 5, "pillar"),
    t(3, 0, "rubble"),
    t(3, 7, "rubble"),
    t(5, 4, "brazier"),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

const ROOM_LAYOUTS: Record<string, RoomTerrainLayout> = {
  // Area 1 — Mine Mouth
  "Weighing Station": WEIGHING_STATION,
  "Cart Depot": CART_DEPOT,

  // Area 1 — Gatehouse
  "Guard Room": GUARD_ROOM,
  "Receiving Hall": RECEIVING_HALL,

  // Area 1 — Upper Galleries
  "Main Gallery": MAIN_GALLERY,
  "Side Gallery East": SIDE_GALLERY_EAST,
  "Side Gallery West": SIDE_GALLERY_WEST,
  "Junction Hall": JUNCTION_HALL,
  "Patrol Station": PATROL_STATION,
  "The Inner Gate": INNER_GATE,

  // Area 2 — Armory
  "Armory Entrance": ARMORY_ENTRANCE,
  "Lower Gate East": LOWER_GATE_EAST,
  "Training Room": TRAINING_ROOM,

  // Area 2 — Chapel
  "Chapel Entrance": CHAPEL_ENTRANCE,
  Nave: NAVE,
  "Choir Loft": CHOIR_LOFT,
  "Side Chapel": SIDE_CHAPEL,

  // Area 3 — Bone Stacks
  "Stack Entrance": STACK_ENTRANCE,
  "Femur Corridor": FEMUR_CORRIDOR,
  "Stack Core": STACK_CORE,
  "Collapsed Stack": COLLAPSED_STACK,
  "Great Ward Door": GREAT_WARD_DOOR,

  // Area 4 — Crystal Galleries
  "Reflector Alpha": REFLECTOR_ALPHA,
  "Grand Gallery": GRAND_GALLERY_SHADOWS,
  "Array Nexus": ARRAY_NEXUS,

  // Area 5 — Crystal Throne
  "The Seat": CRYSTAL_THRONE_ARENA,
};

export function getRoomTerrainLayout(roomLabel: string, enemyCount: number): RoomTerrainLayout {
  const specific = ROOM_LAYOUTS[roomLabel];
  if (specific) {
    return specific;
  }

  if (import.meta.env.DEV) {
    console.warn(
      `No authored layout for room "${roomLabel}" — using size-based default. ` +
        `If the room was renamed, update ROOM_LAYOUTS to match.`,
    );
  }

  if (enemyCount <= 3) {
    return DEFAULT_SMALL;
  }

  if (enemyCount <= 5) {
    return DEFAULT_MEDIUM;
  }

  return DEFAULT_LARGE;
}

export { ROOM_LAYOUTS };
