export type StatusKey = "bleed" | "weaken" | "blind" | "silence" | "poison" | "stun";
export type Statuses = Partial<Record<StatusKey, number>>;

/* ── Equipment & Abilities ── */

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  range: "melee" | "ranged";
  icon: string;
  desc: string;
  cost: number;
  holy?: boolean;
  aoe?: boolean;
  finishing?: boolean;
  applyStatus?: { status: StatusKey; stacks: number; chance: number };
}

export interface Consumable {
  id: string;
  name: string;
  icon: string;
  desc: string;
  cost: number;
  heal?: number;
  damage?: number;
  damageRange?: "melee" | "ranged";
  holy?: boolean;
  aoe?: boolean;
  block?: number;
  cleanse?: boolean;
  restoreLight?: number;
  applyStatus?: { status: StatusKey; stacks: number };
}

export interface Ability {
  id: string;
  name: string;
  icon: string;
  desc: string;
  building: string;
  buildingLevel: number;
  damage?: number;
  damageRange?: "melee" | "ranged";
  holy?: boolean;
  aoe?: boolean;
  finishing?: boolean;
  block?: number;
  heal?: number;
  applyStatus?: { status: StatusKey; stacks: number };
  selfBuff?: "stealth" | "counter";
  needsTarget?: boolean;
}

/* ── Town Buildings ── */

export interface BuildingDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  initiallyUnlocked: boolean;
  unlockCost: number;
  upgradeCost: number;
}

export interface BuildingState {
  unlocked: boolean;
  level: number;
}

/* ── Enemies ── */

export interface EnemyAI {
  noiseAttract?: boolean;
  lightFlee?: boolean;
  roam?: boolean;
  reproduce?: boolean;
  sendScout?: boolean;
}

export interface EnemyType {
  id: string;
  name: string;
  maxHp: number;
  atk: number;
  loot: number;
  ascii: string;
  mechanic: string;
  mechanicDesc: string;
  ai: EnemyAI;
  evadeChance?: number;
  ambushTurns?: number;
  isBoss?: boolean;
  defaultRow: "front" | "back";
}

export interface Enemy extends EnemyType {
  hp: number;
  block: number;
  statuses: Statuses;
  reassembled: boolean;
  summonCooldown: number;
  uid: string;
  row: "front" | "back";
}

/* ── Dungeon ── */

export type RoomType = "combat" | "boss" | "start";
export type RoomState = "locked" | "reachable" | "visited" | "cleared";

export interface RoomTemplate {
  type: RoomType;
  label: string;
  enemies: string[];
  hint: string;
}

export interface DungeonDef {
  id: string;
  name: string;
  desc: string;
  difficulty: number;
  combatRooms: RoomTemplate[];
  bossRoom: RoomTemplate;
}

export interface DungeonNode {
  id: string;
  slot: string;
  label: string;
  type: RoomType;
  enemies: string[];
  hint: string;
  state: RoomState;
  col: number;
  row: number;
  cx: number;
  cy: number;
  connections: string[];
  trap: string | null;
  blocked: boolean;
  scouted: boolean;
}

/* ── Player ── */

export interface Player {
  hp: number;
  maxHp: number;
  gold: number;
  statuses: Statuses;
  weapons: Weapon[];
  activeWeaponIdx: number;
  consumables: Consumable[];
  abilities: string[];
  buildings: Record<string, BuildingState>;
}

export interface CombatPlayer extends Player {
  block: number;
  stealthActive: boolean;
  counterActive: boolean;
}

/* ── Misc ── */

export interface TrapInfo {
  label: string;
  icon: string;
  desc: string;
  cost: number;
  color: string;
}

export interface DungeonLogEntry {
  turn: number;
  text: string;
  source: "player" | "monster" | "system";
  roomId?: string;
}

export type SoundVolume = "quiet" | "normal" | "loud";

export interface AILogEntry {
  text: string;
  debugText: string;
  volume: SoundVolume;
  roomId: string;
  toRoomId?: string;
}
