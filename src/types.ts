export type Screen = "title" | "town" | "map" | "combat" | "victory" | "gameover";

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

/* ── Combat Mechanics ── */

export type CombatAction =
  | { type: "damage_player"; amount: number }
  | { type: "apply_status_player"; status: StatusKey; stacks: number }
  | { type: "heal_self"; amount: number }
  | {
      type: "spawn";
      enemyId: string;
      row?: "front" | "back";
      reassembled?: boolean;
      summonCooldown?: number;
    }
  | { type: "drain_light"; amount: number }
  | { type: "log"; message: string }
  | { type: "skip_attack" };

export interface AttackResult {
  skip?: boolean;
  damageMultiplier?: number;
  lifestealFraction?: number;
  atkOverride?: number;
  extraActions?: CombatAction[];
}

export interface HitResponse {
  evade?: boolean;
  damageMultiplier?: number;
}

export interface CombatContext {
  enemies: Enemy[];
  player: CombatPlayer;
  lightLevel: { value: number };
}

export interface CombatMechanics {
  onTurnStart?: (self: Enemy, ctx: CombatContext) => CombatAction[];
  onAttack?: (self: Enemy, ctx: CombatContext) => AttackResult | null;
  onReceiveHit?: (
    self: Enemy,
    ctx: CombatContext,
    hit: { damage: number; holy: boolean; finishing: boolean },
  ) => HitResponse;
  onDeath?: (self: Enemy, ctx: CombatContext, killingHit: { finishing: boolean }) => CombatAction[];
}

/* ── Out-of-Combat (Dungeon AI) Mechanics ── */

export interface DungeonAIContext {
  rooms: DungeonNode[];
  currentRoomId: string;
  room: DungeonNode;
  neighbours: DungeonNode[];
  noise: "quiet" | "medium" | "loud";
  byId: (id: string) => DungeonNode | undefined;
}

export type DungeonAction =
  | { type: "move_toward_player"; reason: string }
  | { type: "move_away_from_player"; reason: string }
  | { type: "move_random"; reason: string }
  | { type: "move"; targetRoomId: string; reason: string }
  | { type: "reproduce" }
  | { type: "send_minion"; minionUid: string; targetRoomId: string; reason: string }
  | { type: "log"; text: string; volume: SoundVolume }
  | { type: "skip" }
  | { type: "begin_ritual"; typeId: string; turns: number; hpFraction: number }
  | { type: "tick_ritual" };

export interface OutOfCombatMechanics {
  onTick: (self: DungeonEnemy, ctx: DungeonAIContext) => DungeonAction[];
  canPassDoor?: (self: DungeonEnemy, door: DungeonNode) => boolean;
  sounds?: {
    move?: { texts: string[]; volume: SoundVolume };
    blocked?: { texts: string[]; volume: SoundVolume };
  };
}

export interface EnemyType {
  id: string;
  name: string;
  maxHp: number;
  atk: number;
  loot: number;
  ascii: string;
  mechanic: string;
  evadeChance?: number;
  ambushTurns?: number;
  isBoss?: boolean;
  defaultRow: "front" | "back";
  combatMechanics?: CombatMechanics;
  outOfCombatMechanics?: OutOfCombatMechanics;
  /* ── CSV fields (descriptive, not used by game logic) ── */
  movement?: string;
  seesInDark?: boolean;
  reactsToLight?: string;
  corporeal?: boolean;
  onClosedDoors?: string;
}

/** Serializable runtime state for a live enemy — stored in Redux and saves. */
export interface EnemyData {
  id: string;
  uid: string;
  hp: number;
  block: number;
  statuses: Statuses;
  reassembled: boolean;
  summonCooldown: number;
  row: "front" | "back";
  ambushTurns: number;
}

export interface Enemy extends Omit<EnemyType, "ambushTurns">, EnemyData {}

/* ── Dungeon ── */

/** An individual monster instance living in a dungeon room. */
export interface DungeonEnemy {
  typeId: string; // key into ENEMY_TYPES
  uid: string; // unique instance id — carried into combat via makeEnemyData
  /** If set, overrides maxHp when this enemy enters combat (e.g. resurrected at reduced HP). */
  hpOverride?: number;
}

export type RoomState = "locked" | "reachable" | "visited";

export interface RoomTemplate {
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
  generator?: "stamp";
}

export interface RoomBBox {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
}

export interface DungeonNode {
  id: string;
  slot: string;
  label: string;
  boss: boolean;
  enemies: DungeonEnemy[];
  /** Dead enemies left in this room, by typeId. Necromancer can resurrect these. */
  corpses: Record<string, number>;
  /** Active necromancer resurrection ritual. Counts down each dungeon turn. */
  necroRitual: { typeId: string; turnsLeft: number; hpFraction: number } | null;
  hint: string;
  state: RoomState;
  cx: number;
  cy: number;
  connections: string[];
  trap: string | null;
  blocked: boolean;
  scouted: boolean;
  gridRoomId?: number;
  bbox?: RoomBBox;
}

/** The raw grid + metadata produced by dungeon generation */
export interface DungeonGrid {
  cells: number[][];
  width: number;
  height: number;
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
  debugText?: string;
}

export type SoundVolume = "quiet" | "normal" | "loud";

export interface AILogEntry {
  text: string;
  debugText: string;
  volume: SoundVolume;
  roomId: string;
  toRoomId?: string;
}
