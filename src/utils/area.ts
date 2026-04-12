import { ENEMY_TYPES } from "../data/enemies";
import {
  DECAY_COLD_ZONE,
  DECAY_SHADOW_DARKNESS,
  DECAY_RAT_INFESTATION,
  DECAY_STENCH,
  DECAY_TRACKS,
  DECAY_SALT_CRYSTALS,
  DECAY_INFESTATION,
  OCCUPATION_THRESHOLD_RAT,
  OCCUPATION_THRESHOLD_ZOMBIE,
  OCCUPATION_THRESHOLD_LARVA,
  ZONE_WAIL_RADIUS,
  ZONE_COMMAND_RADIUS,
} from "../data/constants";
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
      trap: null,
      blocked: false,
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

export function runAreaAI(
  area: AreaNode[],
  currentRoomId: string,
  action = "move",
  playerHp?: number,
  playerMaxHp?: number,
) {
  const rooms = area.map((r) => ({
    ...r,
    enemies: r.enemies.map((e) => ({ ...e })),
    corpses: { ...r.corpses },
  }));
  const aiLog: AILogEntry[] = [];
  const arrivedInPlayerRoom: string[] = [];

  const noise = ACTION_NOISE[action] || "medium";
  const byId = (id: string) => rooms.find((r) => r.id === id);

  // Pre-compute player distances for pathfinding-based movement
  const playerDist = roomDistances(rooms, currentRoomId);

  // Increment turnsInRoom for all enemies
  for (const room of rooms) {
    for (const e of room.enemies) {
      e.turnsInRoom = (e.turnsInRoom ?? 0) + 1;
    }
  }

  // Initialize patrol routes and tethers (lazy, first tick only)
  for (const room of rooms) {
    for (const e of room.enemies) {
      if (e.typeId === "skeleton" && !e.patrolRoute) {
        const connected = [...room.connections].sort((a, b) => {
          const ra = byId(a);
          const rb = byId(b);
          return (ra?.gridRoomId ?? 0) - (rb?.gridRoomId ?? 0);
        });
        const route: string[] = [];
        for (const c of connected) {
          route.push(c);
          route.push(room.id);
        }
        e.patrolRoute = route.length > 0 ? route : [room.id];
        e.patrolIndex = route.length > 0 ? route.length - 1 : 0;
      }

      if (
        (e.typeId === "zombie" || e.typeId === "boneguard" || e.typeId === "salt_revenant") &&
        !e.tetheredTo
      ) {
        e.tetheredTo = room.id;
      }
    }
  }

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
    if (toRoom.safeRoom || (toRoom.blocked && !mechanics?.canPassDoor?.(enemy, toRoom))) {
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
    if (enemy.typeId === "bone_hound") {
      fromRoom.tracks = DECAY_TRACKS;
    }

    fromRoom.enemies = fromRoom.enemies.filter((e) => e.uid !== enemy.uid);
    enemy.turnsInRoom = 0;
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
          const direct = neighbours.find((n) => n.id === currentRoomId);
          if (direct && !room.blocked) {
            moved = moveEnemy(enemy, room, direct, action.reason, mechanics);
          } else {
            const myDist = playerDist.get(room.id) ?? Infinity;
            const closer = neighbours
              .filter((n) => (playerDist.get(n.id) ?? Infinity) < myDist)
              .sort((a, b) => (playerDist.get(a.id) ?? 0) - (playerDist.get(b.id) ?? 0));
            if (closer.length > 0 && !room.blocked) {
              moved = moveEnemy(enemy, room, closer[0], action.reason, mechanics);
            }
          }
          break;
        }
        case "move_away_from_player": {
          if (moved) break;
          const myDist = playerDist.get(room.id) ?? 0;
          const farther = neighbours
            .filter((n) => (playerDist.get(n.id) ?? 0) > myDist)
            .sort((a, b) => (playerDist.get(b.id) ?? 0) - (playerDist.get(a.id) ?? 0));
          if (farther.length > 0) {
            moved = moveEnemy(enemy, room, farther[0], action.reason, mechanics);
          } else {
            const away = neighbours.find((n) => n.id !== currentRoomId && n.state !== "visited");
            if (away) {
              moved = moveEnemy(enemy, room, away, action.reason, mechanics);
            }
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
          const newEnemy: AreaEnemy = {
            typeId: enemy.typeId,
            uid: uid(enemy.typeId),
            turnsInRoom: 0,
          };
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
              const newEnemy: AreaEnemy = { typeId, uid: uid(typeId), hpOverride, turnsInRoom: 0 };
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
        case "consume_vermin": {
          const consumed = room.enemies.filter(
            (e) => e.uid !== enemy.uid && (e.typeId === "rat" || e.typeId === "gutborn_larva"),
          );
          if (consumed.length > 0) {
            room.enemies = room.enemies.filter(
              (e) => e.uid === enemy.uid || (e.typeId !== "rat" && e.typeId !== "gutborn_larva"),
            );
            aiLog.push({
              text: "...silence falls.",
              debugText: `🧛 [AI] ${enemy.typeId} (${enemy.uid}) consumed ${consumed.length} vermin in ${room.label}`,
              volume: "quiet",
              roomId: room.id,
            });
          }
          break;
        }
        case "loot_room": {
          if (!room.props) break;
          const existing = new Set(room.looted ?? []);
          const lootable = room.props
            .filter((p) => !existing.has(p.id))
            .filter((p) => !room.propStates?.[p.id]?.consumed)
            .filter((p) =>
              p.actions?.some((a) =>
                a.effects.some(
                  (e) =>
                    e.type === "grant_salt" ||
                    e.type === "grant_consumable" ||
                    e.type === "grant_weapon",
                ),
              ),
            )
            .map((p) => p.id);
          if (lootable.length > 0) {
            room.looted = [...(room.looted ?? []), ...lootable];
            aiLog.push({
              text: "Greedy hands at work in the dark",
              debugText: `🕵️ [AI] ${enemy.typeId} (${enemy.uid}) looted ${lootable.length} props in ${room.label}`,
              volume: "quiet",
              roomId: room.id,
            });
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

      const ctx: AreaAIContext = {
        rooms,
        currentRoomId,
        room,
        neighbours,
        noise,
        byId,
        playerHp,
        playerMaxHp,
      };
      const actions = mechanics.onTick(enemy, ctx);
      executeAreaActions(actions, enemy, room, neighbours, mechanics);
    }
  });

  propagateEnvironment(rooms);

  return { newArea: rooms, aiLog, arrivedInPlayerRoom };
}

/* ── Environmental effect propagation ── */

function propagateEnvironment(rooms: AreaNode[]) {
  const byId = (id: string) => rooms.find((r) => r.id === id);

  for (const room of rooms) {
    if (room.ratInfested !== undefined) {
      room.ratInfested -= 1;
      if (room.ratInfested <= 0) room.ratInfested = undefined;
    }
    if (room.stench !== undefined) {
      room.stench -= 1;
      if (room.stench <= 0) room.stench = undefined;
    }
    if (room.coldZone !== undefined) {
      room.coldZone -= 1;
      if (room.coldZone <= 0) room.coldZone = undefined;
    }
    if (room.shadowDarkness !== undefined) {
      room.shadowDarkness -= 1;
      if (room.shadowDarkness <= 0) room.shadowDarkness = undefined;
    }
    if (room.tracks !== undefined) {
      room.tracks -= 1;
      if (room.tracks <= 0) room.tracks = undefined;
    }
    if (room.saltCrystals !== undefined) {
      room.saltCrystals -= 1;
      if (room.saltCrystals <= 0) room.saltCrystals = undefined;
    }
    if (room.infested !== undefined) {
      room.infested -= 1;
      if (room.infested <= 0) room.infested = undefined;
    }

    room.wailZone = undefined;
    room.commanded = undefined;
  }

  for (const room of rooms) {
    for (const enemy of room.enemies) {
      switch (enemy.typeId) {
        case "ghost": {
          room.coldZone = Math.max(room.coldZone ?? 0, DECAY_COLD_ZONE);
          for (const nid of room.connections) {
            const n = byId(nid);
            if (n) {
              n.coldZone = Math.max(n.coldZone ?? 0, DECAY_COLD_ZONE);
            }
          }
          break;
        }
        case "shadow": {
          room.shadowDarkness = Math.max(room.shadowDarkness ?? 0, DECAY_SHADOW_DARKNESS);
          for (const nid of room.connections) {
            const n = byId(nid);
            if (n) {
              n.shadowDarkness = Math.max(n.shadowDarkness ?? 0, DECAY_SHADOW_DARKNESS);
            }
          }
          break;
        }
        case "banshee": {
          const dist = roomDistances(rooms, room.id);
          for (const [rid, d] of dist) {
            if (d <= ZONE_WAIL_RADIUS) {
              const r = byId(rid);
              if (r) r.wailZone = true;
            }
          }
          break;
        }
        case "necromancer": {
          const dist = roomDistances(rooms, room.id);
          for (const [rid, d] of dist) {
            if (d <= ZONE_COMMAND_RADIUS) {
              const r = byId(rid);
              if (r) r.commanded = true;
            }
          }
          break;
        }
        case "salt_revenant": {
          room.saltCrystals = Math.max(room.saltCrystals ?? 0, DECAY_SALT_CRYSTALS);
          break;
        }
      }
    }

    if (
      room.enemies.some(
        (e) => e.typeId === "rat" && (e.turnsInRoom ?? 0) >= OCCUPATION_THRESHOLD_RAT,
      )
    ) {
      room.ratInfested = Math.max(room.ratInfested ?? 0, DECAY_RAT_INFESTATION);
    }

    if (
      room.enemies.some(
        (e) => e.typeId === "zombie" && (e.turnsInRoom ?? 0) >= OCCUPATION_THRESHOLD_ZOMBIE,
      )
    ) {
      room.stench = Math.max(room.stench ?? 0, DECAY_STENCH);
    }

    if (
      room.enemies.some(
        (e) => e.typeId === "gutborn_larva" && (e.turnsInRoom ?? 0) >= OCCUPATION_THRESHOLD_LARVA,
      ) &&
      Object.keys(room.corpses).length > 0
    ) {
      room.infested = Math.max(room.infested ?? 0, DECAY_INFESTATION);
    }
  }
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
