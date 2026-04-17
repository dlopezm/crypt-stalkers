/* ═══════════════════════════════════════════════════════════════════════════
   Room Terrain Layouts — per-room combat grid configurations
   Each authored room with enemies gets a tactical terrain layout.
   Rooms without enemies don't need combat layouts.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { RoomTerrainLayout, RoomTerrainPlacement, GridPos } from "./types";
import { TERRAIN_BLOCKS_MOVEMENT } from "./types";
import type { RoomBBox } from "../types";

export interface OvermapData {
  readonly grid: readonly (readonly number[])[];
  readonly roomId: number;
  readonly bbox: RoomBBox;
}

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
    t(0, 5, "pit"),
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
    { row: 1, col: 4 },
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
    { row: 2, col: 4 },
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
    t(3, 0, "pit"),
    t(3, 7, "pit"),
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
    { row: 1, col: 1 },
    { row: 1, col: 5 },
  ],
  [
    t(0, 0, "wall"),
    t(0, 6, "wall"),
    t(1, 2, "rubble"),
    t(1, 4, "rubble"),
    t(3, 1, "brazier"),
    t(3, 5, "brazier"),
    t(4, 3, "pillar"),
    t(3, 2, "ward_line"),
    t(3, 3, "ward_line"),
    t(3, 4, "ward_line"),
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
    t(3, 4, "pit"),
  ],
);

const CHOIR_LOFT = layout(
  6,
  5,
  { row: 4, col: 3 },
  [
    { row: 1, col: 3 },
    { row: 1, col: 1 },
    { row: 1, col: 4 },
  ],
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
    t(2, 1, "hazard", { hazardDamage: 2 }),
    t(2, 5, "hazard", { hazardDamage: 2 }),
    t(3, 3, "pillar"),
    t(4, 1, "rubble"),
  ],
);

const FEMUR_CORRIDOR = layout(
  8,
  4,
  { row: 3, col: 0 },
  [
    { row: 1, col: 6 },
    { row: 2, col: 6 },
  ],
  [
    t(0, 0, "wall"),
    t(0, 7, "wall"),
    t(3, 0, "wall"),
    t(3, 7, "wall"),
    t(1, 2, "rubble"),
    t(1, 5, "rubble"),
    t(1, 3, "dark_zone"),
    t(1, 4, "dark_zone"),
    t(1, 6, "dark_zone"),
    t(2, 1, "dark_zone"),
    t(2, 2, "dark_zone"),
    t(2, 3, "dark_zone"),
    t(2, 4, "dark_zone"),
    t(2, 5, "dark_zone"),
    t(2, 6, "dark_zone"),
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
    { row: 2, col: 5 },
  ],
  [
    t(0, 0, "wall"),
    t(0, 7, "wall"),
    t(2, 1, "pit"),
    t(2, 6, "pit"),
    t(3, 2, "pillar"),
    t(3, 5, "pillar"),
    t(4, 0, "dark_zone"),
    t(4, 7, "dark_zone"),
    t(5, 0, "dark_zone"),
    t(5, 7, "dark_zone"),
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
    { row: 0, col: 2 },
    { row: 0, col: 3 },
    { row: 1, col: 1 },
  ],
  [
    t(1, 0, "rubble"),
    t(1, 4, "rubble"),
    t(3, 1, "hazard", { hazardDamage: 2 }),
    t(3, 3, "hazard", { hazardDamage: 2 }),
    t(2, 2, "rubble"),
    t(1, 3, "hazard", { hazardDamage: 2 }),
  ],
);

const GREAT_WARD_DOOR = layout(
  8,
  8,
  { row: 7, col: 4 },
  [
    { row: 2, col: 3 },
    { row: 2, col: 5 },
    { row: 1, col: 2 },
    { row: 1, col: 5 },
    { row: 3, col: 4 },
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
    t(4, 0, "pit"),
    t(4, 7, "pit"),
    t(4, 3, "ward_line"),
    t(4, 4, "ward_line"),
    t(4, 5, "ward_line"),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// AREA 4 — DEEP WORKINGS
// ═══════════════════════════════════════════════════════════════════════════

const REFLECTOR_ALPHA = layout(
  6,
  6,
  { row: 5, col: 3 },
  [
    { row: 1, col: 3 },
    { row: 1, col: 4 },
  ],
  [
    t(0, 0, "wall"),
    t(0, 5, "wall"),
    t(2, 1, "salt_deposit"),
    t(2, 4, "salt_deposit"),
    t(2, 2, "dark_zone"),
    t(2, 3, "dark_zone"),
    t(3, 1, "dark_zone"),
    t(3, 2, "dark_zone"),
    t(3, 3, "dark_zone"),
    t(3, 4, "dark_zone"),
    t(4, 1, "dark_zone"),
    t(4, 2, "dark_zone"),
    t(4, 3, "dark_zone"),
    t(4, 4, "dark_zone"),
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
    { row: 2, col: 3 },
    { row: 2, col: 4 },
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
    { row: 2, col: 1 },
    { row: 2, col: 5 },
    { row: 3, col: 3 },
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
  [
    { row: 1, col: 4 },
    { row: 1, col: 3 },
    { row: 1, col: 5 },
    { row: 2, col: 4 },
  ],
  [
    t(0, 0, "wall"),
    t(0, 7, "wall"),
    t(7, 0, "wall"),
    t(7, 7, "wall"),
    t(2, 2, "pillar"),
    t(2, 5, "pillar"),
    t(5, 2, "pillar"),
    t(5, 5, "pillar"),
    t(1, 1, "pit"),
    t(1, 6, "pit"),
    t(6, 1, "pit"),
    t(6, 6, "pit"),
    t(3, 4, "brazier"),
    t(4, 4, "brazier"),
    t(0, 1, "dark_zone"),
    t(0, 2, "dark_zone"),
    t(0, 5, "dark_zone"),
    t(0, 6, "dark_zone"),
    t(7, 1, "dark_zone"),
    t(7, 2, "dark_zone"),
    t(7, 5, "dark_zone"),
    t(7, 6, "dark_zone"),
    t(1, 0, "dark_zone"),
    t(2, 0, "dark_zone"),
    t(5, 0, "dark_zone"),
    t(6, 0, "dark_zone"),
    t(1, 7, "dark_zone"),
    t(2, 7, "dark_zone"),
    t(5, 7, "dark_zone"),
    t(6, 7, "dark_zone"),
    t(3, 1, "ward_line"),
    t(4, 1, "ward_line"),
    t(3, 6, "ward_line"),
    t(4, 6, "ward_line"),
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

function generateAdditionalSpawns(
  layout: RoomTerrainLayout,
  existingSpawns: readonly GridPos[],
  needed: number,
): readonly GridPos[] {
  const blocked = new Set(
    layout.terrainPlacements
      .filter((p) => TERRAIN_BLOCKS_MOVEMENT.has(p.terrain))
      .map((p) => `${p.pos.row},${p.pos.col}`),
  );

  const used = new Set(existingSpawns.map((s) => `${s.row},${s.col}`));
  used.add(`${layout.playerStart.row},${layout.playerStart.col}`);

  const candidates: GridPos[] = [];
  for (let r = 0; r < layout.gridHeight; r++) {
    for (let c = 0; c < layout.gridWidth; c++) {
      const key = `${r},${c}`;
      if (!blocked.has(key) && !used.has(key)) {
        candidates.push({ row: r, col: c });
      }
    }
  }

  candidates.sort((a, b) => {
    const distA =
      Math.abs(a.row - layout.playerStart.row) + Math.abs(a.col - layout.playerStart.col);
    const distB =
      Math.abs(b.row - layout.playerStart.row) + Math.abs(b.col - layout.playerStart.col);
    return distB - distA;
  });

  return candidates.slice(0, needed);
}

export function getRoomTerrainLayout(
  roomLabel: string,
  enemyCount: number,
  overmap?: OvermapData,
): RoomTerrainLayout {
  if (overmap) {
    return buildOvermapLayout(roomLabel, enemyCount, overmap);
  }

  const specific = ROOM_LAYOUTS[roomLabel];
  if (specific) {
    if (specific.enemySpawns.length >= enemyCount) {
      return specific;
    }

    if (import.meta.env.DEV) {
      console.warn(
        `Layout "${roomLabel}" has ${specific.enemySpawns.length} spawns but needs ${enemyCount}. ` +
          `Auto-generating ${enemyCount - specific.enemySpawns.length} additional spawn(s).`,
      );
    }

    const additional = generateAdditionalSpawns(
      specific,
      specific.enemySpawns,
      enemyCount - specific.enemySpawns.length,
    );
    return {
      ...specific,
      enemySpawns: [...specific.enemySpawns, ...additional],
    };
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

function buildOvermapLayout(
  roomLabel: string,
  enemyCount: number,
  overmap: OvermapData,
): RoomTerrainLayout {
  const { grid, roomId, bbox } = overmap;
  const overmapH = bbox.maxRow - bbox.minRow + 1;
  const overmapW = bbox.maxCol - bbox.minCol + 1;
  const gridHeight = overmapH * 2;
  const gridWidth = overmapW * 2;

  const isFloor: boolean[][] = [];
  for (let r = 0; r < gridHeight; r++) {
    isFloor[r] = [];
    for (let c = 0; c < gridWidth; c++) {
      isFloor[r][c] = false;
    }
  }

  for (let or = bbox.minRow; or <= bbox.maxRow; or++) {
    for (let oc = bbox.minCol; oc <= bbox.maxCol; oc++) {
      if (grid[or]?.[oc] === roomId) {
        const baseR = (or - bbox.minRow) * 2;
        const baseC = (oc - bbox.minCol) * 2;
        isFloor[baseR][baseC] = true;
        isFloor[baseR][baseC + 1] = true;
        isFloor[baseR + 1][baseC] = true;
        isFloor[baseR + 1][baseC + 1] = true;
      }
    }
  }

  const wallPlacements: RoomTerrainPlacement[] = [];
  for (let r = 0; r < gridHeight; r++) {
    for (let c = 0; c < gridWidth; c++) {
      if (!isFloor[r][c]) {
        wallPlacements.push({ pos: { row: r, col: c }, terrain: "wall" });
      }
    }
  }

  const authored = ROOM_LAYOUTS[roomLabel];
  const terrainPlacements: RoomTerrainPlacement[] = [...wallPlacements];

  if (authored) {
    for (const placement of authored.terrainPlacements) {
      const { row, col } = placement.pos;
      if (row < gridHeight && col < gridWidth && isFloor[row]?.[col]) {
        terrainPlacements.push(placement);
      }
    }
  }

  const floorTiles: GridPos[] = [];
  for (let r = 0; r < gridHeight; r++) {
    for (let c = 0; c < gridWidth; c++) {
      if (isFloor[r][c]) {
        const isUsedByTerrain = terrainPlacements.some(
          (p) => p.pos.row === r && p.pos.col === c && p.terrain !== "wall",
        );
        if (!isUsedByTerrain) {
          floorTiles.push({ row: r, col: c });
        }
      }
    }
  }

  let playerStart: GridPos;
  if (authored && authored.playerStart.row < gridHeight && authored.playerStart.col < gridWidth) {
    playerStart = authored.playerStart;
  } else {
    playerStart = floorTiles[floorTiles.length - 1] ?? {
      row: gridHeight - 1,
      col: Math.floor(gridWidth / 2),
    };
  }

  let enemySpawns: readonly GridPos[];
  if (authored && authored.enemySpawns.length >= enemyCount) {
    enemySpawns = authored.enemySpawns.filter(
      (s) => s.row < gridHeight && s.col < gridWidth && isFloor[s.row]?.[s.col],
    );
  } else {
    enemySpawns = [];
  }

  if (enemySpawns.length < enemyCount) {
    const partialLayout: RoomTerrainLayout = {
      gridWidth,
      gridHeight,
      terrainPlacements,
      playerStart,
      enemySpawns,
      exitTile: authored?.exitTile ?? null,
    };
    const additional = generateAdditionalSpawns(
      partialLayout,
      enemySpawns,
      enemyCount - enemySpawns.length,
    );
    enemySpawns = [...enemySpawns, ...additional];
  }

  return {
    gridWidth,
    gridHeight,
    terrainPlacements,
    playerStart,
    enemySpawns,
    exitTile: authored?.exitTile ?? null,
  };
}

export { ROOM_LAYOUTS };
