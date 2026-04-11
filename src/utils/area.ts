import { ENEMY_TYPES } from "../data/enemies";
import type {
  AreaNode,
  AreaEnemy,
  AreaDef,
  AreaGrid,
  RoomTemplate,
  RoomBBox,
  AILogEntry,
  SoundVolume,
  AreaAction,
  AreaAIContext,
  OutOfCombatMechanics,
} from "../types";
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
    if (authored) {
      const ar = authored.rooms[room.gridId];
      tmpl = { label: ar.label, enemies: [...ar.enemies], hint: ar.hint };
      authoredProps = ar.props;
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
      state: isStart ? ("visited" as const) : ("locked" as const),
      cx: room.cx * CELL_PX,
      cy: room.cy * CELL_PX,
      connections: [],
      trap: null,
      blocked: false,
      scouted: false,
      gridRoomId: room.gridId,
      bbox: room.bbox,
      props: authoredProps,
      propStates: authoredProps ? {} : undefined,
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

/* ── BFS distance from a room to all other rooms ── */
export function roomDistances(rooms: AreaNode[], fromId: string): Map<string, number> {
  const dist = new Map<string, number>();
  dist.set(fromId, 0);
  const queue = [fromId];
  while (queue.length) {
    const cur = queue.shift()!;
    const d = dist.get(cur)!;
    const node = rooms.find((r) => r.id === cur);
    if (!node) continue;
    for (const nid of node.connections) {
      if (!dist.has(nid)) {
        dist.set(nid, d + 1);
        queue.push(nid);
      }
    }
  }
  return dist;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const ACTION_NOISE: Record<string, "quiet" | "medium" | "loud"> = {
  move: "medium",
  scout: "quiet",
  combat: "loud",
  rest: "quiet",
};

export function runAreaAI(area: AreaNode[], currentRoomId: string, action = "move") {
  const rooms = area.map((r) => ({ ...r, enemies: [...r.enemies], corpses: { ...r.corpses } }));
  const aiLog: AILogEntry[] = [];
  const arrivedInPlayerRoom: string[] = [];

  const noise = ACTION_NOISE[action] || "medium";
  const byId = (id: string) => rooms.find((r) => r.id === id);

  function moveEnemy(
    enemy: AreaEnemy,
    fromRoom: AreaNode,
    toRoom: AreaNode,
    reason: string,
    mechanics?: OutOfCombatMechanics,
  ): boolean {
    if (!fromRoom.connections.includes(toRoom.id)) {
      console.warn(
        "Tried to move from ",
        fromRoom.label,
        "to ",
        toRoom.label,
        ", which are not adjacent.",
      );
      throw new Error(
        `Tried to move from ${fromRoom.label} to ${toRoom.label}, which are not adjacent.`,
      );
    }
    if (toRoom.blocked && !mechanics?.canPassDoor?.(enemy, toRoom)) {
      const sounds = mechanics?.sounds?.blocked || {
        volume: "normal" as SoundVolume,
        texts: ["Something scrapes against a sealed door"],
      };
      aiLog.push({
        text: pick(sounds.texts),
        debugText: `\u{1F6A7} [AI] ${enemy.typeId} (${enemy.uid}) tried to enter ${toRoom.label} \u2014 door blocked.`,
        volume: sounds.volume,
        roomId: toRoom.id,
      });
      return false;
    }
    fromRoom.enemies = fromRoom.enemies.filter((e) => e.uid !== enemy.uid);
    toRoom.enemies = [...toRoom.enemies, enemy];
    if (toRoom.id === currentRoomId) arrivedInPlayerRoom.push(enemy.uid);
    const sounds = mechanics?.sounds?.move || {
      volume: "normal" as SoundVolume,
      texts: ["Something moves in the dark"],
    };
    aiLog.push({
      text: pick(sounds.texts),
      debugText: `\u{1F463} [AI] ${enemy.typeId} (${enemy.uid}) moved from ${fromRoom.label} \u2192 ${toRoom.label} (${reason})`,
      volume: sounds.volume,
      roomId: fromRoom.id,
      toRoomId: toRoom.id,
    });
    return true;
  }

  function executeAreaActions(
    actions: AreaAction[],
    enemy: AreaEnemy,
    room: AreaNode,
    neighbours: AreaNode[],
    mechanics: OutOfCombatMechanics,
  ) {
    let moved = false;

    for (const action of actions) {
      switch (action.type) {
        case "move_toward_player": {
          if (moved) break;
          const target = neighbours.find((n) => n.id === currentRoomId);
          if (target && !room.blocked) {
            moved = moveEnemy(enemy, room, target, action.reason, mechanics);
          }
          break;
        }
        case "move_away_from_player": {
          if (moved) break;
          const away = neighbours.find((n) => n.id !== currentRoomId && n.state !== "visited");
          if (away) {
            moved = moveEnemy(enemy, room, away, action.reason, mechanics);
          }
          break;
        }
        case "move_random": {
          if (moved) break;
          const target = shuffle(neighbours)[0];
          if (target) {
            moved = moveEnemy(enemy, room, target, action.reason, mechanics);
          }
          break;
        }
        case "move": {
          if (moved) break;
          const target = byId(action.targetRoomId);
          if (target) {
            moved = moveEnemy(enemy, room, target, action.reason, mechanics);
          }
          break;
        }
        case "reproduce": {
          const newEnemy: AreaEnemy = { typeId: enemy.typeId, uid: uid(enemy.typeId) };
          room.enemies = [...room.enemies, newEnemy];
          break;
        }
        case "send_minion": {
          const minion = room.enemies.find((e) => e.uid === action.minionUid);
          const target = byId(action.targetRoomId);
          if (minion && target) {
            // Find the minion's mechanics for its own sounds
            const minionType = ENEMY_TYPES.find((e) => e.id === minion.typeId);
            moveEnemy(minion, room, target, action.reason, minionType?.outOfCombatMechanics);
          }
          break;
        }
        case "log": {
          aiLog.push({
            text: action.text,
            debugText: `[AI] ${enemy.typeId} (${enemy.uid}) in ${room.label}: ${action.text}`,
            volume: action.volume,
            roomId: room.id,
          });
          break;
        }
        case "begin_ritual": {
          if (!room.necroRitual) {
            room.necroRitual = {
              typeId: action.typeId,
              turnsLeft: action.turns,
              hpFraction: action.hpFraction,
            };
          }
          break;
        }
        case "tick_ritual": {
          if (room.necroRitual) {
            room.necroRitual = { ...room.necroRitual, turnsLeft: room.necroRitual.turnsLeft - 1 };
            if (room.necroRitual.turnsLeft <= 0) {
              const { typeId, hpFraction } = room.necroRitual;
              room.necroRitual = null;
              // Remove one corpse of this type
              if ((room.corpses[typeId] ?? 0) > 0) {
                room.corpses[typeId] -= 1;
                if (room.corpses[typeId] === 0) delete room.corpses[typeId];
              }
              // Spawn resurrected enemy with reduced HP
              const etype = ENEMY_TYPES.find((e) => e.id === typeId);
              const hpOverride = etype
                ? Math.max(1, Math.floor(etype.maxHp * hpFraction))
                : undefined;
              const newEnemy: AreaEnemy = { typeId, uid: uid(typeId), hpOverride };
              room.enemies = [...room.enemies, newEnemy];
              if (room.id === currentRoomId) arrivedInPlayerRoom.push(newEnemy.uid);
              aiLog.push({
                text: "Something stirs... then rises.",
                debugText: `💀 [AI] Necromancer ritual complete in ${room.label} — ${typeId} resurrected at ${Math.round(hpFraction * 100)}% HP!`,
                volume: "loud",
                roomId: room.id,
              });
            }
          }
          break;
        }
        case "skip":
          break;
      }
    }
  }

  rooms.forEach((room) => {
    if (room.id === currentRoomId) return;
    if (!room.enemies.length) return;

    const neighbours = room.connections.map((id) => byId(id)).filter(Boolean) as AreaNode[];
    const snapshot = [...room.enemies];

    for (const enemy of snapshot) {
      if (!room.enemies.some((e) => e.uid === enemy.uid)) continue;

      const etype = ENEMY_TYPES.find((e) => e.id === enemy.typeId);
      const mechanics = etype?.outOfCombatMechanics;
      if (!mechanics) continue;

      const ctx: AreaAIContext = { rooms, currentRoomId, room, neighbours, noise, byId };
      const actions = mechanics.onTick(enemy, ctx);
      executeAreaActions(actions, enemy, room, neighbours, mechanics);
    }
  });

  return { newArea: rooms, aiLog, arrivedInPlayerRoom };
}

export function getScoutIntel(room: AreaNode, scoutLevel: number): string {
  if (!room) return "Nothing unusual.";
  const count = room.enemies.length;
  if (count === 0) {
    return scoutLevel >= 2 ? "The room appears empty." : "...silence.";
  }
  if (scoutLevel === 1) {
    return room.hint || "You hear something. Hard to tell what.";
  }
  if (scoutLevel === 2) {
    const rough = count === 1 ? "one creature" : count <= 3 ? "a few creatures" : "many creatures";
    const firstType = ENEMY_TYPES.find((e) => e.id === room.enemies[0].typeId);
    return `${rough} inside. ${firstType ? `Something ${firstType.ascii}...` : ""}`;
  }
  const names = room.enemies
    .map((e) => ENEMY_TYPES.find((t) => t.id === e.typeId)?.name || e.typeId)
    .join(", ");
  return `Full scout: ${names}.`;
}
