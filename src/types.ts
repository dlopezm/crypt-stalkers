export type StatusKey = "bleed" | "weaken" | "blind" | "silence" | "poison" | "stun";
export type Statuses = Partial<Record<StatusKey, number>>;

export type CardType = "attack" | "defend" | "skill";

export interface Card {
  id: string;
  name: string;
  cost: number;
  type: CardType;
  value: number;
  desc: string;
  color: string;
  uid: string;
  draw?: number;
  heal?: number;
  healOnHit?: boolean;
  aoe?: boolean;
  exhaust?: boolean;
  gainEnergy?: number;
  cleanse?: boolean;
  holy?: boolean;
  finishing?: boolean;
  applyStatus?: { target: "enemy"; status: StatusKey; stacks: number };
}

export type CardTemplate = Omit<Card, "uid">;

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
}

export interface Enemy extends EnemyType {
  hp: number;
  block: number;
  statuses: Statuses;
  reassembled: boolean;
  summonCooldown: number;
  uid: string;
}

export type RoomType = "combat" | "rest" | "shop" | "boss" | "start";
export type RoomState = "locked" | "reachable" | "visited" | "cleared";

export interface RoomTemplate {
  type: RoomType;
  label: string;
  enemies: string[];
  hint: string;
}

export type SlotName = "start" | "left" | "right" | "mid" | "branch1" | "branch2" | "boss";

export interface DungeonNode {
  id: string;
  slot: SlotName;
  label: string;
  type: RoomType;
  enemies: string[];
  hint: string;
  state: RoomState;
  col: number;
  row: number;
  connections: string[];
  trap: string | null;
  blocked: boolean;
  scouted: boolean;
}

export interface Player {
  hp: number;
  maxHp: number;
  gold: number;
  maxEnergy: number;
  statuses: Statuses;
  deck: Card[];
}

export interface CombatPlayer extends Player {
  hand: Card[];
  drawPile: Card[];
  discard: Card[];
  energy: number;
  block: number;
}

export interface TrapInfo {
  label: string;
  icon: string;
  desc: string;
  cost: number;
  color: string;
}

export interface ShopItem {
  id: string;
  label: string;
  icon: string;
  desc: string;
  cost: number;
  effect: string;
  value: number;
  card?: CardTemplate;
  targetCard?: string;
}

export interface DungeonLogEntry {
  turn: number;
  text: string;
}
