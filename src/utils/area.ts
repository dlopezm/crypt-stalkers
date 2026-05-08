import { ENEMY_TYPES } from "../data/enemies";
import type { AreaNode, AreaDef, AreaGrid, RoomTemplate, RoomBBox } from "../types";
import { shuffle, uid } from "./helpers";
import { generateStampGrid } from "./stamp-dungeon";

/* ── Stamp generation config per difficulty ── */
const STAMP_CONFIG: Record<
  number,
  { gridW: number; gridH: number; minRooms: number; maxRooms: number }
> = {
  1: { gridW: 40, gridH: 40, minRooms: 4, maxRooms: 9 },
  2: { gridW: 50, gridH: 50, minRooms: 7, maxRooms: 16 },
  3: { gridW: 55, gridH: 55, minRooms: 10, maxRooms: 22 },
};

/* ── Extract rooms and connections from BSP grid ── */

interface ExtractedRoom {
  gridId: number;
  bbox: RoomBBox;
  cx: number;
  cy: number;
}

export function extractRoomsFromGrid(grid: number[][]): {
  rooms: ExtractedRoom[];
  connections: [number, number][];
} {
  const height = grid.length;
  const width = grid[0]?.length ?? 0;

  // Find all room IDs and their bounding boxes
  const bboxes = new Map<number, { minR: number; maxR: number; minC: number; maxC: number }>();
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const v = grid[r][c];
      if (v < 2) continue;
      const bb = bboxes.get(v);
      if (bb) {
        bb.minR = Math.min(bb.minR, r);
        bb.maxR = Math.max(bb.maxR, r);
        bb.minC = Math.min(bb.minC, c);
        bb.maxC = Math.max(bb.maxC, c);
      } else {
        bboxes.set(v, { minR: r, maxR: r, minC: c, maxC: c });
      }
    }
  }

  const rooms: ExtractedRoom[] = [];
  for (const [gridId, bb] of bboxes) {
    rooms.push({
      gridId,
      bbox: { minRow: bb.minR, maxRow: bb.maxR, minCol: bb.minC, maxCol: bb.maxC },
      cx: (bb.minC + bb.maxC) / 2,
      cy: (bb.minR + bb.maxR) / 2,
    });
  }

  // Find connections: trace corridors (0 cells) to see which rooms they connect
  const connSet = new Set<string>();
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (grid[r][c] !== 0) continue;
      // BFS from this corridor cell to find adjacent room IDs
      const adjacentRooms = new Set<number>();
      for (const [dr, dc] of dirs) {
        const nr = r + dr,
          nc = c + dc;
        if (nr >= 0 && nr < height && nc >= 0 && nc < width && grid[nr][nc] >= 2) {
          adjacentRooms.add(grid[nr][nc]);
        }
      }
      // If corridor is adjacent to 2+ rooms, they're connected
      const roomIds = [...adjacentRooms];
      for (let i = 0; i < roomIds.length; i++) {
        for (let j = i + 1; j < roomIds.length; j++) {
          const key = [Math.min(roomIds[i], roomIds[j]), Math.max(roomIds[i], roomIds[j])].join(
            ",",
          );
          connSet.add(key);
        }
      }
    }
  }

  // Also trace longer corridors: BFS along corridor cells
  const visited = Array.from({ length: height }, () => new Array(width).fill(false));
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (grid[r][c] !== 0 || visited[r][c]) continue;
      // BFS to find all rooms reachable through this corridor segment
      const queue: [number, number][] = [[r, c]];
      visited[r][c] = true;
      const reachableRooms = new Set<number>();
      while (queue.length) {
        const [cr, cc] = queue.shift()!;
        for (const [dr, dc] of dirs) {
          const nr = cr + dr,
            nc = cc + dc;
          if (nr < 0 || nr >= height || nc < 0 || nc >= width) continue;
          if (grid[nr][nc] >= 2) {
            reachableRooms.add(grid[nr][nc]);
          } else if (grid[nr][nc] === 0 && !visited[nr][nc]) {
            visited[nr][nc] = true;
            queue.push([nr, nc]);
          }
        }
      }
      const roomIds = [...reachableRooms];
      for (let i = 0; i < roomIds.length; i++) {
        for (let j = i + 1; j < roomIds.length; j++) {
          const key = [Math.min(roomIds[i], roomIds[j]), Math.max(roomIds[i], roomIds[j])].join(
            ",",
          );
          connSet.add(key);
        }
      }
    }
  }

  const connections: [number, number][] = [...connSet].map((k) => {
    const [a, b] = k.split(",").map(Number);
    return [a, b];
  });

  return { rooms, connections };
}

export interface GenerateAreaResult {
  nodes: AreaNode[];
  grid: AreaGrid;
}

function generateGrid(def: AreaDef): {
  grid: number[][];
  extracted: ReturnType<typeof extractRoomsFromGrid>;
} {
  const cfg = STAMP_CONFIG[def.difficulty] || STAMP_CONFIG[1];
  for (let attempt = 0; attempt < 10; attempt++) {
    const grid = generateStampGrid(cfg);
    if (grid) {
      const extracted = extractRoomsFromGrid(grid);
      if (extracted.rooms.length >= cfg.minRooms) return { grid, extracted };
    }
  }
  // Last resort: keep trying until we get something
  let grid: number[][] | null = null;
  while (!grid) grid = generateStampGrid(cfg);
  return { grid, extracted: extractRoomsFromGrid(grid) };
}

export function generateArea(def: AreaDef): GenerateAreaResult {
  const authored = def.generator === "authored" ? def.authored : undefined;

  let grid: number[][];
  let extracted: ReturnType<typeof extractRoomsFromGrid>;
  if (authored) {
    grid = authored.grid;
    extracted = extractRoomsFromGrid(grid);
  } else {
    const generated = generateGrid(def);
    grid = generated.grid;
    extracted = generated.extracted;
  }

  const { rooms: extractedRooms, connections } = extracted;

  // Pick start and boss rooms: from authored metadata if available, else derive from layout
  let startGridId: number;
  // -1 signals "no boss room" — valid for authored transit areas.
  let bossGridId: number = -1;
  if (authored) {
    const startEntry = Object.entries(authored.rooms).find(([, r]) => r.isStart);
    if (!startEntry) {
      throw new Error(`Authored area "${def.id}" has no room flagged isStart.`);
    }
    const bossEntries = Object.entries(authored.rooms).filter(([, r]) => r.isBoss);
    if (bossEntries.length > 1) {
      throw new Error(
        `Authored area "${def.id}" must have at most one isBoss room (found ${bossEntries.length}).`,
      );
    }
    for (const room of extractedRooms) {
      if (!authored.rooms[room.gridId]) {
        throw new Error(
          `Authored area "${def.id}" grid contains room ID ${room.gridId} with no metadata entry.`,
        );
      }
    }
    startGridId = Number(startEntry[0]);
    bossGridId = bossEntries.length === 1 ? Number(bossEntries[0][0]) : -1;
  } else {
    // Pick start nearest the top-left corner, then BFS to place the boss in the
    // farthest-reachable room. Only runs for generated layouts; authored dungeons
    // get both from metadata.
    const sortedByCorner = [...extractedRooms].sort((a, b) => a.cx + a.cy - (b.cx + b.cy));
    startGridId = sortedByCorner[0].gridId;

    const adjMap = new Map<number, Set<number>>();
    for (const room of extractedRooms) adjMap.set(room.gridId, new Set());
    for (const [a, b] of connections) {
      adjMap.get(a)?.add(b);
      adjMap.get(b)?.add(a);
    }
    const distFromStart = new Map<number, number>([[startGridId, 0]]);
    const bfsQueue = [startGridId];
    while (bfsQueue.length) {
      const cur = bfsQueue.shift()!;
      const d = distFromStart.get(cur)!;
      for (const nb of adjMap.get(cur) || []) {
        if (!distFromStart.has(nb)) {
          distFromStart.set(nb, d + 1);
          bfsQueue.push(nb);
        }
      }
    }
    bossGridId = startGridId;
    let maxDist = 0;
    for (const [gid, d] of distFromStart) {
      if (d > maxDist) {
        maxDist = d;
        bossGridId = gid;
      }
    }
  }

  // Scale grid coords to pixel positions
  const CELL_PX = 14;
  const gridIdToNodeId = new Map<number, string>();
  const combatPool = shuffle([...def.combatRooms]);
  let combatIdx = 0;

  function pickCombatTemplate(): RoomTemplate {
    const t = combatPool[combatIdx % combatPool.length];
    combatIdx++;
    return { ...t };
  }

  const nodes: AreaNode[] = extractedRooms.map((room) => {
    const isStart = room.gridId === startGridId;
    const isBoss = room.gridId === bossGridId;
    const nodeId = isStart ? "start" : uid("room");
    gridIdToNodeId.set(room.gridId, nodeId);

    let tmpl: RoomTemplate;
    let authoredProps: AreaNode["props"];
    let safeRoom: boolean | undefined;
    if (authored) {
      const ar = authored.rooms[room.gridId];
      tmpl = {
        label: ar.label,
        enemies: [...ar.enemies],
        hint: ar.hint,
        description: ar.description,
      };
      authoredProps = ar.props;
      safeRoom = ar.safeRoom;
    } else if (isStart) {
      tmpl = { label: "Entrance", enemies: [], hint: "" };
    } else if (isBoss && def.bossRoom) {
      tmpl = { ...def.bossRoom };
    } else {
      tmpl = pickCombatTemplate();
    }

    return {
      id: nodeId,
      slot: isStart ? "start" : uid("slot"),
      label: tmpl.label,
      boss: isBoss,
      enemies: tmpl.enemies ? tmpl.enemies.map((typeId) => ({ typeId, uid: uid(typeId) })) : [],
      corpses: {},
      necroRitual: null,
      hint: tmpl.hint || "",
      description: tmpl.description,
      state: isStart ? ("visited" as const) : ("locked" as const),
      cx: room.cx * CELL_PX,
      cy: room.cy * CELL_PX,
      connections: [],
      scouted: false,
      gridRoomId: room.gridId,
      bbox: room.bbox,
      props: authoredProps,
      propStates: authoredProps ? {} : undefined,
      safeRoom,
    };
  });

  // Wire up connections
  for (const [a, b] of connections) {
    const aId = gridIdToNodeId.get(a);
    const bId = gridIdToNodeId.get(b);
    if (!aId || !bId) continue;
    const aNode = nodes.find((n) => n.id === aId)!;
    const bNode = nodes.find((n) => n.id === bId)!;
    if (!aNode.connections.includes(bId)) aNode.connections.push(bId);
    if (!bNode.connections.includes(aId)) bNode.connections.push(aId);
  }

  // Cross-area transitions: any authored room with an `exit` field gets its
  // node's `exit` populated. The room is otherwise a normal room — the author
  // controls its grid placement, label, and neighbors. enterRoom checks `exit`
  // and routes to switchArea instead of the usual enter flow.
  if (authored) {
    for (const room of extractedRooms) {
      const ar = authored.rooms[room.gridId];
      if (!ar?.exit) continue;
      const nodeId = gridIdToNodeId.get(room.gridId);
      if (!nodeId) continue;
      const node = nodes.find((n) => n.id === nodeId)!;
      node.exit = { toAreaId: ar.exit.toAreaId, toRoomGridId: ar.exit.toRoomGridId };
      // Exit rooms are travel-only: never populate enemies.
      node.enemies = [];
    }
  }

  // Mark rooms adjacent to start as reachable
  const startNode = nodes.find((n) => n.id === "start")!;
  for (const cid of startNode.connections) {
    const n = nodes.find((n) => n.id === cid);
    if (n && n.state === "locked") n.state = "reachable";
  }

  return {
    nodes,
    grid: { cells: grid, width: grid[0]?.length ?? 0, height: grid.length },
  };
}

export function getScoutIntel(room: AreaNode, scoutLevel: number): string {
  if (!room) return "Nothing unusual.";
  const count = room.enemies.length;

  if (count === 0) {
    if (room.safeRoom) {
      return scoutLevel >= 2 ? "☀️ The room is safe and empty." : "...warm silence.";
    }
    return scoutLevel >= 2 ? "The room appears empty." : "...silence.";
  }

  if (scoutLevel === 1) {
    return room.hint || "You hear something. Hard to tell what.";
  }

  if (scoutLevel === 2) {
    const rough = count === 1 ? "one creature" : count <= 3 ? "a few creatures" : "many creatures";
    const firstType = ENEMY_TYPES.find((e) => e.id === room.enemies[0].typeId);
    return `${rough} inside. ${firstType ? `${firstType.ascii} ${firstType.name}...` : ""}`;
  }

  const typeCounts = new Map<string, { type: (typeof ENEMY_TYPES)[number]; count: number }>();
  for (const e of room.enemies) {
    const t = ENEMY_TYPES.find((et) => et.id === e.typeId);
    if (!t) continue;
    const existing = typeCounts.get(t.id);
    if (existing) {
      existing.count++;
    } else {
      typeCounts.set(t.id, { type: t, count: 1 });
    }
  }

  const parts = [...typeCounts.values()].map(
    ({ type, count }) => `${type.ascii} ${type.name}${count > 1 ? ` ×${count}` : ""}`,
  );
  return `Full scout: ${parts.join(", ")}`;
}
