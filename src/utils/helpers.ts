import { WEAPONS, STARTER_WEAPON_ID } from "../data/weapons";
import { CONSUMABLES, STARTER_CONSUMABLE_IDS } from "../data/consumables";
import { ENEMY_TYPES } from "../data/enemies";
import { BUILDINGS } from "../data/buildings";
import { PLAYER_START_HP, PLAYER_START_GOLD, NECRO_SUMMON_COOLDOWN } from "../data/constants";
import type { Enemy, Player, Statuses, BuildingState } from "../types";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function uid(p: string): string {
  return `${p}-${Math.random().toString(36).slice(2, 7)}`;
}

export function makeEnemy(id: string): Enemy {
  const b = ENEMY_TYPES.find((e) => e.id === id)!;
  return {
    ...b,
    hp: b.maxHp,
    block: 0,
    statuses: {},
    reassembled: false,
    ambushTurns: b.ambushTurns || 0,
    summonCooldown: NECRO_SUMMON_COOLDOWN,
    uid: uid(id),
    row: b.defaultRow,
  };
}

export function cloneEnemy(e: Enemy): Enemy {
  return { ...e, statuses: { ...(e.statuses || {}) } };
}

export function cloneEnemies(enemies: Enemy[]): Enemy[] {
  return enemies.map(cloneEnemy);
}

export function makeStarterPlayer(): Player {
  const starterWeapon = { ...WEAPONS.find((w) => w.id === STARTER_WEAPON_ID)! };
  const starterConsumables = STARTER_CONSUMABLE_IDS.map((id) => ({
    ...CONSUMABLES.find((c) => c.id === id)!,
  }));
  const buildings: Record<string, BuildingState> = {};
  BUILDINGS.forEach((b) => {
    buildings[b.id] = { unlocked: b.initiallyUnlocked, level: b.initiallyUnlocked ? 1 : 0 };
  });
  return {
    hp: PLAYER_START_HP,
    maxHp: PLAYER_START_HP,
    gold: PLAYER_START_GOLD,
    statuses: {},
    weapons: [starterWeapon],
    activeWeaponIdx: 0,
    consumables: starterConsumables,
    abilities: [],
    buildings,
  };
}

export function tickStatuses(entity: { hp: number; name?: string; statuses: Statuses }): {
  entity: typeof entity;
  log: string[];
} {
  const e = { ...entity, statuses: { ...(entity.statuses || {}) } };
  const log: string[] = [];
  const s = e.statuses;

  if ((s.bleed || 0) > 0) {
    e.hp -= s.bleed!;
    log.push(`\u{1FA78} ${e.name || "You"} bleeds ${s.bleed}.`);
    s.bleed = Math.max(0, s.bleed! - 1);
  }
  if ((s.poison || 0) > 0) {
    e.hp -= s.poison!;
    log.push(`\u{1F40D} ${e.name || "You"} poisoned ${s.poison}.`);
  }
  if ((s.stun || 0) > 0) s.stun = Math.max(0, s.stun! - 1);
  if ((s.weaken || 0) > 0) s.weaken = Math.max(0, s.weaken! - 1);
  if ((s.blind || 0) > 0) s.blind = Math.max(0, s.blind! - 1);
  if ((s.silence || 0) > 0) s.silence = Math.max(0, s.silence! - 1);

  return { entity: e, log };
}
