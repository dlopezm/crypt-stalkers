import { ENEMY_TYPES } from "../data/enemies";
import {
  AI_REPRODUCE_CHANCE,
  AI_NOISE_ATTRACT_CHANCE,
  AI_LIGHT_FLEE_CHANCE,
  AI_ROAM_CHANCE,
  AI_SCOUT_SEND_CHANCE,
} from "../data/constants";
import type { DungeonNode, DungeonDef, RoomTemplate, AILogEntry, SoundVolume } from "../types";
import { shuffle, uid } from "./helpers";

function connectNodes(a: DungeonNode, b: DungeonNode) {
  if (!a || !b) return;
  if (!a.connections.includes(b.id)) a.connections.push(b.id);
  if (!b.connections.includes(a.id)) b.connections.push(a.id);
}

export function generateDungeon(def: DungeonDef): DungeonNode[] {
  const combatPool = shuffle([...def.combatRooms]);

  let combatIdx = 0;

  function pickTemplate(type: "start" | "combat" | "boss"): RoomTemplate {
    if (type === "start") return { type: "start", label: "Entrance", enemies: [], hint: "" };
    if (type === "boss") return { ...def.bossRoom };
    const t = combatPool[combatIdx % combatPool.length];
    combatIdx++;
    return { ...t };
  }

  // Generate rows procedurally based on difficulty
  // More difficulty = more rows and wider rows
  const midRowCount = def.difficulty + 2; // 3, 4, 5 middle rows
  const rows: { type: "start" | "combat" | "boss"; col: number }[][] = [];

  // Start row
  rows.push([{ type: "start", col: 1 }]);

  // Middle rows: randomize width (1-3 rooms), all combat
  for (let r = 0; r < midRowCount; r++) {
    const maxWidth = Math.min(3, 1 + def.difficulty);
    const width = 1 + Math.floor(Math.random() * maxWidth);
    const row: { type: "combat"; col: number }[] = [];
    for (let c = 0; c < width; c++) {
      row.push({ type: "combat", col: c });
    }
    rows.push(row);
  }

  // Boss row
  rows.push([{ type: "boss", col: 1 }]);

  // Compute positions
  const rowSpacing = 140;
  const colSpacing = 200;
  const totalRows = rows.length;
  const mapH = (totalRows - 1) * rowSpacing + 120;

  const nodes: DungeonNode[] = [];
  const nodesByRow: DungeonNode[][] = [];

  for (let r = 0; r < totalRows; r++) {
    const row = rows[r];
    const rowWidth = row.length;
    const totalW = (rowWidth - 1) * colSpacing;
    const baseX = 340 - totalW / 2;
    const cy = mapH - 60 - r * rowSpacing;
    const rowNodes: DungeonNode[] = [];

    for (let c = 0; c < rowWidth; c++) {
      const slot = row[c];
      const jitterX = rowWidth > 1 ? Math.floor(Math.random() * 40 - 20) : 0;
      const jitterY = Math.floor(Math.random() * 20 - 10);
      const cx = baseX + c * colSpacing + jitterX;
      const tmpl = pickTemplate(slot.type);
      const isStart = slot.type === "start";
      const node: DungeonNode = {
        id: isStart ? "start" : uid("room"),
        slot: isStart ? "start" : uid("slot"),
        label: tmpl.label,
        type: tmpl.type,
        enemies: tmpl.enemies ? [...tmpl.enemies] : [],
        hint: tmpl.hint || "",
        state: isStart ? "visited" : "locked",
        col: c,
        row: r,
        cx,
        cy: cy + jitterY,
        connections: [],
        trap: null,
        blocked: false,
        scouted: false,
      };
      nodes.push(node);
      rowNodes.push(node);
    }
    nodesByRow.push(rowNodes);
  }

  // Connect rooms between adjacent rows
  for (let r = 0; r < nodesByRow.length - 1; r++) {
    const currentRow = nodesByRow[r];
    const nextRow = nodesByRow[r + 1];

    // Every node must have at least one connection forward
    // Every node in next row must have at least one connection backward
    const forwardConnected = new Set<DungeonNode>();
    const backwardConnected = new Set<DungeonNode>();

    // Connect each current node to nearest next-row node
    for (const node of currentRow) {
      let nearest = nextRow[0];
      let nearestDist = Math.abs(node.cx - nearest.cx);
      for (const n of nextRow) {
        const d = Math.abs(node.cx - n.cx);
        if (d < nearestDist) {
          nearest = n;
          nearestDist = d;
        }
      }
      connectNodes(node, nearest);
      forwardConnected.add(nearest);
      backwardConnected.add(node);
    }

    // Ensure all next-row nodes have at least one backward connection
    for (const nextNode of nextRow) {
      if (!forwardConnected.has(nextNode)) {
        let nearest = currentRow[0];
        let nearestDist = Math.abs(nextNode.cx - nearest.cx);
        for (const n of currentRow) {
          const d = Math.abs(nextNode.cx - n.cx);
          if (d < nearestDist) {
            nearest = n;
            nearestDist = d;
          }
        }
        connectNodes(nearest, nextNode);
      }
    }

    // Add random cross-connections for variety
    if (currentRow.length > 1 && nextRow.length > 1 && Math.random() < 0.5) {
      const a = currentRow[Math.floor(Math.random() * currentRow.length)];
      const b = nextRow[Math.floor(Math.random() * nextRow.length)];
      connectNodes(a, b);
    }
  }

  // Occasional same-row connections
  for (const rowNodes of nodesByRow) {
    if (rowNodes.length >= 2 && Math.random() < 0.3) {
      const idx = Math.floor(Math.random() * (rowNodes.length - 1));
      connectNodes(rowNodes[idx], rowNodes[idx + 1]);
    }
  }

  // Mark rooms adjacent to start as reachable
  const startNode = nodes.find((n) => n.id === "start")!;
  startNode.connections.forEach((id) => {
    const n = nodes.find((n) => n.id === id);
    if (n && n.state === "locked") n.state = "reachable";
  });

  return nodes;
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

  const noise = ACTION_NOISE[action] || "medium";
  const isLoud = noise === "loud";
  const isMedium = noise === "medium" || isLoud;

  const byId = (id: string) => rooms.find((r) => r.id === id);

  function moveEnemy(enemyId: string, fromRoom: DungeonNode, toRoom: DungeonNode, reason: string) {
    if (!fromRoom || !toRoom) return;
    if (toRoom.blocked) {
      const sounds = BLOCKED_SOUNDS[enemyId] || {
        volume: "normal" as SoundVolume,
        texts: ["Something scrapes against a sealed door"],
      };
      aiLog.push({
        text: pick(sounds.texts),
        debugText: `\u{1F6A7} [AI] ${enemyId} tried to enter ${toRoom.label} \u2014 door blocked.`,
        volume: sounds.volume,
        roomId: toRoom.id,
      });
      return;
    }
    fromRoom.enemies = fromRoom.enemies.filter((e) => e !== enemyId);
    toRoom.enemies = [...toRoom.enemies, enemyId];
    const sounds = MOVE_SOUNDS[enemyId] || {
      volume: "normal" as SoundVolume,
      texts: ["Something moves in the dark"],
    };
    aiLog.push({
      text: pick(sounds.texts),
      debugText: `\u{1F463} [AI] ${enemyId} moved from ${fromRoom.label} \u2192 ${toRoom.label} (${reason})`,
      volume: sounds.volume,
      roomId: fromRoom.id,
      toRoomId: toRoom.id,
    });
  }

  rooms.forEach((room) => {
    if (room.state === "cleared" || room.id === currentRoomId) return;
    if (!room.enemies.length) return;

    const neighbours = room.connections.map((id) => byId(id)).filter(Boolean) as DungeonNode[];
    const typesHere = [...new Set(room.enemies)];

    typesHere.forEach((eid) => {
      const etype = ENEMY_TYPES.find((e) => e.id === eid);
      if (!etype?.ai) return;
      const ai = etype.ai;

      if (ai.reproduce && room.enemies.filter((e) => e === eid).length > 0) {
        if (Math.random() < AI_REPRODUCE_CHANCE) {
          room.enemies = [...room.enemies, eid];
          const sounds = REPRODUCE_SOUNDS[eid] || {
            volume: "quiet" as SoundVolume,
            texts: ["Strange sounds of multiplying"],
          };
          aiLog.push({
            text: pick(sounds.texts),
            debugText: `\u{1F400} [AI] Rats in ${room.label} reproduced. Now ${room.enemies.filter((e) => e === "rat").length} rats.`,
            volume: sounds.volume,
            roomId: room.id,
          });
        }
      }

      if (ai.noiseAttract && isMedium) {
        const adjacentToCurrent = neighbours.find((n) => n.id === currentRoomId);
        if (adjacentToCurrent && !room.blocked && Math.random() < AI_NOISE_ATTRACT_CHANCE) {
          moveEnemy(eid, room, adjacentToCurrent, "attracted by noise");
        }
      }

      if (ai.lightFlee && isLoud) {
        const awayRoom = neighbours.find((n) => n.id !== currentRoomId && n.state !== "cleared");
        if (awayRoom && Math.random() < AI_LIGHT_FLEE_CHANCE) {
          moveEnemy(eid, room, awayRoom, "fleeing light/noise");
        }
      }

      if (ai.roam && Math.random() < AI_ROAM_CHANCE) {
        const target = shuffle(
          neighbours.filter((n) => n.state !== "cleared" && n.id !== currentRoomId),
        )[0];
        if (target) moveEnemy(eid, room, target, "roaming");
      }

      if (ai.sendScout && isMedium && room.enemies.includes("zombie")) {
        const adjacentToCurrent = neighbours.find((n) => n.id === currentRoomId);
        if (adjacentToCurrent && Math.random() < AI_SCOUT_SEND_CHANCE) {
          moveEnemy("zombie", room, adjacentToCurrent, "sent by Necromancer to investigate");
          // Also log the necromancer's command separately
          aiLog.push({
            text: pick(SCOUT_SEND_SOUNDS.texts),
            debugText: `\u{1F9D9} [AI] Necromancer in ${room.label} sent zombie to investigate`,
            volume: SCOUT_SEND_SOUNDS.volume,
            roomId: room.id,
          });
        }
      }
    });
  });

  return { newDungeon: rooms, aiLog };
}

export function getScoutIntel(room: DungeonNode, scoutLevel: number): string {
  if (!room || room.type !== "combat") return "Nothing unusual.";
  const count = room.enemies.length;
  if (count === 0) {
    return scoutLevel >= 2 ? "The room appears empty." : "...silence.";
  }
  if (scoutLevel === 1) {
    return room.hint || "You hear something. Hard to tell what.";
  }
  if (scoutLevel === 2) {
    const rough = count === 1 ? "one creature" : count <= 3 ? "a few creatures" : "many creatures";
    const firstType = ENEMY_TYPES.find((e) => e.id === room.enemies[0]);
    return `${rough} inside. ${firstType ? `Something ${firstType.ascii}...` : ""}`;
  }
  const names = room.enemies
    .map((id) => ENEMY_TYPES.find((e) => e.id === id)?.name || id)
    .join(", ");
  return `Full scout: ${names}.`;
}
