import { ROOM_TEMPLATES, LAYOUT } from "../data/rooms";
import { ENEMY_TYPES } from "../data/enemies";
import type { DungeonNode } from "../types";
import { shuffle, uid } from "./helpers";

function connectNodes(a: DungeonNode, b: DungeonNode) {
  if (!a || !b) return;
  if (!a.connections.includes(b.id)) a.connections.push(b.id);
  if (!b.connections.includes(a.id)) b.connections.push(a.id);
}

export function generateDungeon(): DungeonNode[] {
  const combatPool = shuffle(ROOM_TEMPLATES.filter(r => r.type === "combat"));
  const restPool = shuffle(ROOM_TEMPLATES.filter(r => r.type === "rest"));
  const shopTmpl = ROOM_TEMPLATES.find(r => r.type === "shop")!;
  const bossTmpl = ROOM_TEMPLATES.find(r => r.type === "boss")!;
  const hasShop = Math.random() > 0.4;

  const assignments: Record<string, { label: string; type: string; enemies: string[]; hint: string }> = {
    start: { label: "Crypt Entrance", type: "start", enemies: [], hint: "" },
    left: { ...combatPool[0] },
    right: { ...combatPool[1] },
    mid: { ...combatPool[2] },
    branch1: hasShop ? { ...shopTmpl } : { ...restPool[0] },
    branch2: { ...restPool[1] || restPool[0], label: restPool[1]?.label || "Old Barracks" },
    boss: { ...bossTmpl },
  };

  const nodes: DungeonNode[] = LAYOUT.map(({ slot, col, row }) => {
    const tmpl = assignments[slot];
    return {
      id: slot === "start" ? "start" : uid("room"),
      slot,
      label: tmpl.label,
      type: tmpl.type as DungeonNode["type"],
      enemies: tmpl.enemies ? [...tmpl.enemies] : [],
      hint: tmpl.hint || "",
      state: slot === "start" ? "visited" : "locked",
      col,
      row,
      connections: [],
      trap: null,
      blocked: false,
      scouted: false,
    };
  });

  const bySlot = (s: string) => nodes.find(n => n.slot === s)!;

  const pairs: [string, string][] = [
    ["start", "left"], ["start", "right"],
    ["left", "mid"], ["right", "mid"],
    ["left", "branch1"],
    ["mid", "branch1"], ["mid", "branch2"],
    ["right", "branch2"],
    ["branch1", "boss"], ["branch2", "boss"],
  ];
  pairs.forEach(([a, b]) => connectNodes(bySlot(a), bySlot(b)));

  bySlot("start").connections.forEach(id => {
    const n = nodes.find(n => n.id === id);
    if (n && n.state === "locked") n.state = "reachable";
  });

  return nodes;
}

const ACTION_NOISE: Record<string, string> = {
  move: "medium",
  scout: "quiet",
  combat: "loud",
  rest: "quiet",
  shop: "quiet",
};

export function runDungeonAI(dungeon: DungeonNode[], currentRoomId: string, action = "move") {
  const rooms = dungeon.map(r => ({ ...r, enemies: [...r.enemies] }));
  const log: string[] = [];

  const noise = ACTION_NOISE[action] || "medium";
  const isLoud = noise === "loud";
  const isMedium = noise === "medium" || isLoud;

  const byId = (id: string) => rooms.find(r => r.id === id);

  function moveEnemy(enemyId: string, fromRoom: DungeonNode, toRoom: DungeonNode, reason: string) {
    if (!fromRoom || !toRoom) return;
    if (toRoom.blocked) {
      log.push(`\u{1F6A7} [AI] ${enemyId} tried to enter ${toRoom.label} \u2014 door blocked.`);
      return;
    }
    fromRoom.enemies = fromRoom.enemies.filter(e => e !== enemyId);
    toRoom.enemies = [...toRoom.enemies, enemyId];
    log.push(`\u{1F463} [AI] ${enemyId} moved from ${fromRoom.label} \u2192 ${toRoom.label} (${reason})`);
  }

  rooms.forEach(room => {
    if (room.state === "cleared" || room.id === currentRoomId) return;
    if (!room.enemies.length) return;

    const neighbours = room.connections.map(id => byId(id)).filter(Boolean) as DungeonNode[];
    const typesHere = [...new Set(room.enemies)];

    typesHere.forEach(eid => {
      const etype = ENEMY_TYPES.find(e => e.id === eid);
      if (!etype?.ai) return;
      const ai = etype.ai;

      if (ai.reproduce && room.enemies.filter(e => e === eid).length > 0) {
        if (Math.random() < 0.4) {
          room.enemies = [...room.enemies, eid];
          log.push(`\u{1F400} [AI] Rats in ${room.label} reproduced. Now ${room.enemies.filter(e => e === "rat").length} rats.`);
        }
      }

      if (ai.noiseAttract && isMedium) {
        const adjacentToCurrent = neighbours.find(n => n.id === currentRoomId);
        if (adjacentToCurrent && !room.blocked && Math.random() < 0.55) {
          moveEnemy(eid, room, adjacentToCurrent, "attracted by noise");
        }
      }

      if (ai.lightFlee && isLoud) {
        const awayRoom = neighbours.find(n => n.id !== currentRoomId && n.state !== "cleared");
        if (awayRoom && Math.random() < 0.45) {
          moveEnemy(eid, room, awayRoom, "fleeing light/noise");
        }
      }

      if (ai.roam && Math.random() < 0.2) {
        const target = shuffle(neighbours.filter(n => n.state !== "cleared" && n.id !== currentRoomId))[0];
        if (target) moveEnemy(eid, room, target, "roaming");
      }

      if (ai.sendScout && isMedium && room.enemies.includes("zombie")) {
        const adjacentToCurrent = neighbours.find(n => n.id === currentRoomId);
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
    const firstType = ENEMY_TYPES.find(e => e.id === room.enemies[0]);
    return `${rough} inside. ${firstType ? `Something ${firstType.ascii}...` : ""}`;
  }
  const names = room.enemies.map(id => ENEMY_TYPES.find(e => e.id === id)?.name || id).join(", ");
  return `Full scout: ${names}.`;
}
