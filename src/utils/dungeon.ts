import { ENEMY_TYPES } from "../data/enemies";
import {
  AI_REPRODUCE_CHANCE,
  AI_NOISE_ATTRACT_CHANCE,
  AI_LIGHT_FLEE_CHANCE,
  AI_ROAM_CHANCE,
  AI_SCOUT_SEND_CHANCE,
} from "../data/constants";
import type {
  DungeonNode,
  DungeonEnemy,
  DungeonDef,
  DungeonGrid,
  RoomTemplate,
  RoomBBox,
  AILogEntry,
  SoundVolume,
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

function extractRoomsFromGrid(grid: number[][]): {
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

export interface GenerateDungeonResult {
  nodes: DungeonNode[];
  grid: DungeonGrid;
}

function generateGrid(def: DungeonDef): {
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

export function generateDungeon(def: DungeonDef): GenerateDungeonResult {
  const { grid, extracted } = generateGrid(def);

  const { rooms: extractedRooms, connections } = extracted;

  // Pick start room (closest to top-left corner)
  const sortedByCorner = [...extractedRooms].sort((a, b) => a.cx + a.cy - (b.cx + b.cy));
  const startGridId = sortedByCorner[0].gridId;

  // Build temporary adjacency for BFS to find farthest room for boss
  const adjMap = new Map<number, Set<number>>();
  for (const room of extractedRooms) {
    adjMap.set(room.gridId, new Set());
  }
  for (const [a, b] of connections) {
    adjMap.get(a)?.add(b);
    adjMap.get(b)?.add(a);
  }

  // BFS from start to find farthest room
  const distFromStart = new Map<number, number>();
  distFromStart.set(startGridId, 0);
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

  let bossGridId = startGridId;
  let maxDist = 0;
  for (const [gid, d] of distFromStart) {
    if (d > maxDist) {
      maxDist = d;
      bossGridId = gid;
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

  const nodes: DungeonNode[] = extractedRooms.map((room) => {
    const isStart = room.gridId === startGridId;
    const isBoss = room.gridId === bossGridId;
    const nodeId = isStart ? "start" : uid("room");
    gridIdToNodeId.set(room.gridId, nodeId);

    let tmpl: RoomTemplate;
    if (isStart) {
      tmpl = { label: "Entrance", enemies: [], hint: "" };
    } else if (isBoss) {
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
export function roomDistances(rooms: DungeonNode[], fromId: string): Map<string, number> {
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

/* ── Vague sound descriptions per enemy type and action ── */

const MOVE_SOUNDS: Record<string, { texts: string[]; volume: SoundVolume }> = {
  rat: {
    volume: "quiet",
    texts: [
      "Skittering of tiny claws on stone",
      "Small legs scrambling in the dark",
      "Faint scratching echoes nearby",
    ],
  },
  zombie: {
    volume: "normal",
    texts: [
      "Heavy, shambling footsteps",
      "Wet dragging across stone",
      "A low groan and shuffling feet",
    ],
  },
  ghost: {
    volume: "quiet",
    texts: [
      "A chill breeze drifts through the corridor",
      "Faint moaning from somewhere unseen",
      "The air grows cold for a moment",
    ],
  },
  vampire: {
    volume: "normal",
    texts: [
      "A rush of cold air, something withdrawing",
      "The flutter of a dark cloak",
      "A sharp hiss fading into silence",
    ],
  },
  shadow: {
    volume: "quiet",
    texts: [
      "The shadows shift and deepen",
      "Darkness crawls along the walls",
      "A patch of black slithers out of sight",
    ],
  },
  necromancer: {
    volume: "normal",
    texts: [
      "Arcane whispers drift through the stone",
      "A low chanting reverberates through the walls",
    ],
  },
  skeleton: {
    volume: "normal",
    texts: ["The clatter of bones on stone", "Rattling from beyond the door"],
  },
  ghoul: {
    volume: "quiet",
    texts: ["Something pads softly in the darkness", "A faint, wet sniffing sound"],
  },
  banshee: {
    volume: "loud",
    texts: ["A distant wail pierces the silence", "An unearthly shriek echoes through the halls"],
  },
};

const REPRODUCE_SOUNDS: Record<string, { texts: string[]; volume: SoundVolume }> = {
  rat: {
    volume: "quiet",
    texts: [
      "Frantic squeaking echoes from the dark",
      "A chorus of high-pitched chittering",
      "The sound of many small things multiplying",
    ],
  },
};

const BLOCKED_SOUNDS: Record<string, { texts: string[]; volume: SoundVolume }> = {
  rat: { volume: "quiet", texts: ["Scratching against a barricade"] },
  zombie: { volume: "normal", texts: ["Something pounds against a sealed door"] },
  ghost: { volume: "quiet", texts: ["A cold presence presses against a barrier"] },
  vampire: { volume: "normal", texts: ["Hissing from behind a sealed door"] },
  shadow: { volume: "quiet", texts: ["Darkness pools against a blockade"] },
  necromancer: { volume: "normal", texts: ["Muttering and scraping at a barred entrance"] },
  skeleton: { volume: "normal", texts: ["Bones clatter against a blocked passage"] },
  ghoul: { volume: "quiet", texts: ["Clawing at a sealed door"] },
  banshee: { volume: "loud", texts: ["A wail of frustration from beyond a blockade"] },
};

const SCOUT_SEND_SOUNDS: { texts: string[]; volume: SoundVolume } = {
  volume: "normal",
  texts: [
    "Arcane whispers, then shambling footsteps with purpose",
    "A commanding murmur, followed by heavy shuffling",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const ACTION_NOISE: Record<string, string> = {
  move: "medium",
  scout: "quiet",
  combat: "loud",
  rest: "quiet",
};

export function runDungeonAI(dungeon: DungeonNode[], currentRoomId: string, action = "move") {
  const rooms = dungeon.map((r) => ({ ...r, enemies: [...r.enemies] }));
  const aiLog: AILogEntry[] = [];
  const arrivedInPlayerRoom: string[] = [];

  const noise = ACTION_NOISE[action] || "medium";
  const isLoud = noise === "loud";
  const isMedium = noise === "medium" || isLoud;

  const byId = (id: string) => rooms.find((r) => r.id === id);

  function moveEnemy(
    enemy: DungeonEnemy,
    fromRoom: DungeonNode,
    toRoom: DungeonNode,
    reason: string,
  ) {
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
    if (toRoom.blocked) {
      const sounds = BLOCKED_SOUNDS[enemy.typeId] || {
        volume: "normal" as SoundVolume,
        texts: ["Something scrapes against a sealed door"],
      };
      aiLog.push({
        text: pick(sounds.texts),
        debugText: `\u{1F6A7} [AI] ${enemy.typeId} (${enemy.uid}) tried to enter ${toRoom.label} \u2014 door blocked.`,
        volume: sounds.volume,
        roomId: toRoom.id,
      });
      return;
    }
    fromRoom.enemies = fromRoom.enemies.filter((e) => e.uid !== enemy.uid);
    toRoom.enemies = [...toRoom.enemies, enemy];
    if (toRoom.id === currentRoomId) arrivedInPlayerRoom.push(enemy.uid);
    const sounds = MOVE_SOUNDS[enemy.typeId] || {
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
  }

  rooms.forEach((room) => {
    if (room.id === currentRoomId) return;
    if (!room.enemies.length) return;

    const neighbours = room.connections.map((id) => byId(id)).filter(Boolean) as DungeonNode[];
    // Snapshot so that enemies spawned or moved this tick don't get an extra turn
    const snapshot = [...room.enemies];

    for (const enemy of snapshot) {
      // Skip if this individual already moved out of the room this tick
      if (!room.enemies.some((e) => e.uid === enemy.uid)) continue;

      const etype = ENEMY_TYPES.find((e) => e.id === enemy.typeId);
      if (!etype?.ai) continue;
      const ai = etype.ai;

      // Reproduce: spawn a new individual in the same room (no movement)
      if (ai.reproduce && Math.random() < AI_REPRODUCE_CHANCE) {
        const newEnemy: DungeonEnemy = { typeId: enemy.typeId, uid: uid(enemy.typeId) };
        room.enemies = [...room.enemies, newEnemy];
        const sounds = REPRODUCE_SOUNDS[enemy.typeId] || {
          volume: "quiet" as SoundVolume,
          texts: ["Strange sounds of multiplying"],
        };
        aiLog.push({
          text: pick(sounds.texts),
          debugText: `\u{1F400} [AI] ${enemy.typeId} in ${room.label} reproduced. Now ${room.enemies.filter((e) => e.typeId === enemy.typeId).length}.`,
          volume: sounds.volume,
          roomId: room.id,
        });
      }

      // Movement — at most one move per individual per tick
      let moved = false;

      if (!moved && ai.noiseAttract && isMedium) {
        const adjacentToCurrent = neighbours.find((n) => n.id === currentRoomId);
        if (adjacentToCurrent && !room.blocked && Math.random() < AI_NOISE_ATTRACT_CHANCE) {
          moveEnemy(enemy, room, adjacentToCurrent, "attracted by noise");
          moved = true;
        }
      }

      if (!moved && ai.lightFlee && isLoud) {
        const awayRoom = neighbours.find((n) => n.id !== currentRoomId && n.state !== "visited");
        if (awayRoom && Math.random() < AI_LIGHT_FLEE_CHANCE) {
          moveEnemy(enemy, room, awayRoom, "fleeing light/noise");
          moved = true;
        }
      }

      if (!moved && ai.roam && Math.random() < AI_ROAM_CHANCE) {
        const target = shuffle(neighbours)[0];
        if (target) {
          moveEnemy(enemy, room, target, "roaming");
        }
      }

      // sendScout: necromancer commands a zombie in the same room to investigate
      if (ai.sendScout && isMedium) {
        const zombieInRoom = room.enemies.find((e) => e.typeId === "zombie");
        if (zombieInRoom) {
          const adjacentToCurrent = neighbours.find((n) => n.id === currentRoomId);
          if (adjacentToCurrent && Math.random() < AI_SCOUT_SEND_CHANCE) {
            moveEnemy(zombieInRoom, room, adjacentToCurrent, "sent by Necromancer to investigate");
            aiLog.push({
              text: pick(SCOUT_SEND_SOUNDS.texts),
              debugText: `\u{1F9D9} [AI] Necromancer (${enemy.uid}) in ${room.label} sent zombie to investigate`,
              volume: SCOUT_SEND_SOUNDS.volume,
              roomId: room.id,
            });
          }
        }
      }
    }
  });

  return { newDungeon: rooms, aiLog, arrivedInPlayerRoom };
}

export function getScoutIntel(room: DungeonNode, scoutLevel: number): string {
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
