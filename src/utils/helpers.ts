import { WEAPONS, STARTER_WEAPON_ID } from "../data/weapons";
import { ENEMY_TYPES } from "../data/enemies";
import { PLAYER_START_HP, PLAYER_START_SALT, NECRO_SUMMON_COOLDOWN } from "../data/constants";
import type { Enemy, EnemyData, Player, Statuses } from "../types";

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

export function makeEnemyData(id: string, existingUid?: string, hpOverride?: number): EnemyData {
  const b = ENEMY_TYPES.find((e) => e.id === id)!;
  return {
    id,
    uid: existingUid ?? uid(id),
    hp: hpOverride ?? b.maxHp,
    block: 0,
    statuses: {},
    reassembled: false,
    summonCooldown: NECRO_SUMMON_COOLDOWN,
    row: b.defaultRow,
    hidden: false,
  };
}

export function hydrateEnemy(data: EnemyData): Enemy {
  const type = ENEMY_TYPES.find((e) => e.id === data.id)!;
  return { ...type, ...data };
}

export function toEnemyData({
  id,
  uid,
  hp,
  block,
  statuses,
  reassembled,
  summonCooldown,
  row,
  hidden,
}: Enemy): EnemyData {
  return { id, uid, hp, block, statuses, reassembled, summonCooldown, row, hidden };
}

export function makeEnemy(id: string): Enemy {
  return hydrateEnemy(makeEnemyData(id));
}

export function cloneEnemy(e: Enemy): Enemy {
  return { ...e, statuses: { ...(e.statuses || {}) } };
}

export function cloneEnemies(enemies: Enemy[]): Enemy[] {
  return enemies.map(cloneEnemy);
}

export function makeStarterPlayer(): Player {
  const starterWeapon = { ...WEAPONS.find((w) => w.id === STARTER_WEAPON_ID)! };
  return {
    hp: PLAYER_START_HP,
    maxHp: PLAYER_START_HP,
    salt: PLAYER_START_SALT,
    statuses: {},
    mainWeapon: starterWeapon,
    offhandWeapon: null,
    ownedWeapons: [starterWeapon],
    consumables: [],
    abilities: [],
    flags: {},
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
