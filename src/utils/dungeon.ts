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

  const nodes: DungeonNode[] = def.slots.map((s) => {
    const tmpl = pickTemplate(s.type);
    return {
      id: s.slot === "start" ? "start" : uid("room"),
      slot: s.slot,
      label: tmpl.label,
      type: tmpl.type,
      enemies: tmpl.enemies ? [...tmpl.enemies] : [],
      hint: tmpl.hint || "",
      state: s.slot === "start" ? "visited" : "locked",
      col: s.col,
      row: s.row,
      cx: s.cx,
      cy: s.cy,
      connections: [],
      trap: null,
      blocked: false,
      scouted: false,
    };
  });

  const bySlot = (slot: string) => nodes.find((n) => n.slot === slot)!;

  def.connections.forEach(([a, b]) => connectNodes(bySlot(a), bySlot(b)));

  bySlot("start").connections.forEach((id) => {
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
