import { ENEMY_TYPES } from "../data/enemies";
import type { DungeonNode, DungeonDef, RoomTemplate } from "../types";
import { shuffle, uid } from "./helpers";

function connectNodes(a: DungeonNode, b: DungeonNode) {
  if (!a || !b) return;
  if (!a.connections.includes(b.id)) a.connections.push(b.id);
  if (!b.connections.includes(a.id)) b.connections.push(a.id);
}

export function generateDungeon(def: DungeonDef): DungeonNode[] {
  const combatPool = shuffle([...def.combatRooms]);
  const restPool = shuffle([...def.restRooms]);

  let combatIdx = 0;
  let restIdx = 0;

  function pickTemplate(type: "start" | "combat" | "rest" | "boss"): RoomTemplate {
    if (type === "start") return { type: "start", label: "Entrance", enemies: [], hint: "" };
    if (type === "boss") return { ...def.bossRoom };
    if (type === "rest") {
      const t = restPool[restIdx % restPool.length];
      restIdx++;
      return { ...t };
    }
    const t = combatPool[combatIdx % combatPool.length];
    combatIdx++;
    return { ...t };
  }

  // Generate rows procedurally based on difficulty
  // More difficulty = more rows and wider rows
  const midRowCount = def.difficulty + 2; // 3, 4, 5 middle rows
  const rows: { type: "start" | "combat" | "rest" | "boss"; col: number }[][] = [];

  // Start row
  rows.push([{ type: "start", col: 1 }]);

  // Middle rows: randomize width (1-3 rooms) with rest rooms scattered
  const totalMidRooms = midRowCount * 2 + Math.floor(Math.random() * (def.difficulty + 1));
  const restCount = Math.max(1, Math.floor(totalMidRooms * 0.25));
  const restPositions = new Set<number>();
  // Place rest rooms in middle rows (not first or last middle row)
  while (restPositions.size < restCount) {
    const pos = 1 + Math.floor(Math.random() * (totalMidRooms - 1));
    restPositions.add(pos);
  }

  let roomCounter = 0;
  for (let r = 0; r < midRowCount; r++) {
    const maxWidth = Math.min(3, 1 + def.difficulty);
    const width = 1 + Math.floor(Math.random() * maxWidth);
    const row: { type: "combat" | "rest"; col: number }[] = [];
    for (let c = 0; c < width; c++) {
      const type = restPositions.has(roomCounter) ? "rest" : "combat";
      row.push({ type, col: c });
      roomCounter++;
    }
    rows.push(row as { type: "start" | "combat" | "rest" | "boss"; col: number }[]);
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

const ACTION_NOISE: Record<string, string> = {
  move: "medium",
  scout: "quiet",
  combat: "loud",
  rest: "quiet",
};

export function runDungeonAI(dungeon: DungeonNode[], currentRoomId: string, action = "move") {
  const rooms = dungeon.map((r) => ({ ...r, enemies: [...r.enemies] }));
  const log: string[] = [];

  const noise = ACTION_NOISE[action] || "medium";
  const isLoud = noise === "loud";
  const isMedium = noise === "medium" || isLoud;

  const byId = (id: string) => rooms.find((r) => r.id === id);

  function moveEnemy(enemyId: string, fromRoom: DungeonNode, toRoom: DungeonNode, reason: string) {
    if (!fromRoom || !toRoom) return;
    if (toRoom.blocked) {
      log.push(`\u{1F6A7} [AI] ${enemyId} tried to enter ${toRoom.label} \u2014 door blocked.`);
      return;
    }
    fromRoom.enemies = fromRoom.enemies.filter((e) => e !== enemyId);
    toRoom.enemies = [...toRoom.enemies, enemyId];
    log.push(
      `\u{1F463} [AI] ${enemyId} moved from ${fromRoom.label} \u2192 ${toRoom.label} (${reason})`,
    );
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
        if (Math.random() < 0.4) {
          room.enemies = [...room.enemies, eid];
          log.push(
            `\u{1F400} [AI] Rats in ${room.label} reproduced. Now ${room.enemies.filter((e) => e === "rat").length} rats.`,
          );
        }
      }

      if (ai.noiseAttract && isMedium) {
        const adjacentToCurrent = neighbours.find((n) => n.id === currentRoomId);
        if (adjacentToCurrent && !room.blocked && Math.random() < 0.55) {
          moveEnemy(eid, room, adjacentToCurrent, "attracted by noise");
        }
      }

      if (ai.lightFlee && isLoud) {
        const awayRoom = neighbours.find((n) => n.id !== currentRoomId && n.state !== "cleared");
        if (awayRoom && Math.random() < 0.45) {
          moveEnemy(eid, room, awayRoom, "fleeing light/noise");
        }
      }

      if (ai.roam && Math.random() < 0.2) {
        const target = shuffle(
          neighbours.filter((n) => n.state !== "cleared" && n.id !== currentRoomId),
        )[0];
        if (target) moveEnemy(eid, room, target, "roaming");
      }

      if (ai.sendScout && isMedium && room.enemies.includes("zombie")) {
        const adjacentToCurrent = neighbours.find((n) => n.id === currentRoomId);
        if (adjacentToCurrent && Math.random() < 0.6) {
          moveEnemy("zombie", room, adjacentToCurrent, "sent by Necromancer to investigate");
        }
      }
    });
  });

  return { newDungeon: rooms, log };
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
