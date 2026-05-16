import type { DiceAbilityId } from "./dice-combat/dice-defs";
export type { DiceAbilityId };

export type Screen = "title" | "intro" | "map" | "combat" | "victory" | "gameover" | "editor";

export type StatusKey =
  | "bleed"
  | "weaken"
  | "blind"
  | "silence"
  | "poison"
  | "stun"
  | "bolster"
  | "mark"
  | "warded"
  | "power" // player: next damage symbol deals +N (stacks consumed on next hit)
  | "dragged" // Zombie Drag: dodge faces don't prevent damage for 1 turn
  | "dodge" // enemy-only: next incoming attack is negated, then clears
  | "intangible" // enemy-only: immune to physical damage this turn, then clears
  | "taunt" // enemy-only: redirects damage aimed at other enemies to this one, then clears
  | "hidden" // enemy-only: untargetable this turn, enables sneak attack, clears at end of player turn
  | "focus"; // each stack grants one free face pick on next roll
export type Statuses = Partial<Record<StatusKey, number>>;

/* ── Damage & Equipment ── */

export type DamageType = "slash" | "pierce" | "bludgeoning" | "holy" | "fire";
export type HandType = "1" | "2" | "offhand";

export interface Weapon {
  id: string;
  name: string;
  damage: number; // 0 for Shield
  damageType: DamageType;
  hand: HandType;
  reach: "melee" | "ranged"; // CSV "1" → melee, "1-2" → ranged
  icon: string;
  desc: string;
  cost: number;
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

/* ── Unified Action System ── */

export type Action =
  // Damage
  | {
      type: "damage_enemy";
      targetUid: string;
      amount: number;
      damageType: DamageType;
      pierceArmor?: boolean;
      holy?: boolean;
    }
  | { type: "damage_player"; amount: number }
  // Status
  | { type: "apply_status_enemy"; targetUid: string; status: StatusKey; stacks: number }
  | { type: "apply_status_player"; status: StatusKey; stacks: number }
  // Healing
  | { type: "heal_player"; amount: number }
  | { type: "heal_enemy"; targetUid: string; amount: number }
  // Row manipulation
  | { type: "push_row"; targetUid: string; to: "front" | "back" }
  // Spawning
  | {
      type: "spawn";
      enemyId: string;
      row?: "front" | "back";
      reassembled?: boolean;
      summonCooldown?: number;
      hpOverride?: number;
    }
  // Light
  | { type: "drain_light"; amount: number }
  // Player buffs
  | { type: "set_block_reduction"; fraction: number }
  | { type: "set_stealth"; active: boolean }
  | { type: "set_counter"; active: boolean }
  | { type: "add_block_player"; amount: number }
  // Cooldowns
  | { type: "set_cooldown"; abilityId: string; turns: number }
  | { type: "tick_cooldowns" }
  // Charging
  | { type: "begin_charge"; abilityId: string; turnsLeft: number; targetUid?: string }
  | { type: "resolve_charge" }
  // Turn flow
  | { type: "end_turn" }
  | { type: "skip_end_turn" }
  | { type: "flee" }
  // Items
  | { type: "consume_item"; itemIndex: number }
  | { type: "restore_light"; amount: number }
  | { type: "cleanse_player" }
  // Logging
  | { type: "log"; message: string }
  // Enemy-specific
  | { type: "skip_attack" }
  | { type: "set_hidden"; targetUid: string; hidden: boolean };

/* ── Abilities ── */

export type AbilitySource =
  | { type: "weapon"; weaponId: string }
  | { type: "building"; buildingId: string; buildingLevel: number }
  | { type: "universal" }
  | { type: "item"; itemId: string };

export interface ActionContext {
  player: CombatPlayer;
  enemies: Enemy[];
  lightLevel: number;
  weapon: Weapon;
  offhandWeapon: Weapon | null;
}

export interface Ability {
  id: string;
  name: string;
  icon: string;
  desc: string;
  source: AbilitySource;
  cooldown: number;
  needsTarget: boolean;
  reach?: "melee" | "ranged";
  execute: (ctx: ActionContext, targets: number[]) => Action[];
}

/* ── Monster Intents ── */

export interface MonsterIntent {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly damage?: number;
  readonly tooltip?: string;
}

/* ── Enemies ── */

/* ── Combat Mechanics ── */

export interface CombatContext {
  enemies: Enemy[];
  player: CombatPlayer;
  lightLevel: { value: number };
}

export interface AttackResult {
  skip?: boolean;
  damageMultiplier?: number;
  lifestealFraction?: number;
  atkOverride?: number;
  extraActions?: Action[];
}

export interface HitResponse {
  evade?: boolean;
  damageMultiplier?: number;
  actions?: Action[];
}

export interface CombatMechanics {
  onStartCombat?: (self: Enemy, ctx: CombatContext) => Action[];
  onTurnStart?: (self: Enemy, ctx: CombatContext) => Action[];
  onAttack?: (self: Enemy, ctx: CombatContext) => AttackResult | null;
  onReceiveHit?: (
    self: Enemy,
    ctx: CombatContext,
    hit: { damage: number; damageType: DamageType; holy: boolean },
  ) => HitResponse;
  onDeath?: (self: Enemy, ctx: CombatContext, killingHit: { damageType: DamageType }) => Action[];
  selectIntent?: (self: Enemy, ctx: CombatContext) => MonsterIntent;
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

  isBoss?: boolean;
  defaultRow: "front" | "back";
  combatMechanics?: CombatMechanics;
  resistances?: Partial<Record<DamageType, number>>;
  vulnerabilities?: Partial<Record<DamageType, number>>;
  deathHint?: string;
  /* ── CSV fields (descriptive, not used by game logic) ── */
  movement?: string;
  seesInDark?: boolean;
  reactsToLight?: string;
  corporeal?: boolean;
  onClosedDoors?: string;
}

export interface Enemy extends EnemyType {
  uid: string;
  hp: number;
  block: number;
  statuses: Statuses;
  reassembled: boolean;
  summonCooldown: number;
  row: "front" | "back";
  hidden: boolean;
  intent?: MonsterIntent;
}

/* ── Dungeon / Area ──
 *
 * Terminology: a *Dungeon* is a set of interconnected *Areas*. The data model
 * below (AreaDef, AreaNode, AreaGrid) describes a single area — one authored
 * or generated grid with its own start/boss and enemies. Inter-area travel
 * happens via RoomExit entries on AuthoredRoom; the runtime materializes
 * those as synthetic AreaNodes with `exit` set.
 */

/** An individual monster instance living in an area room. */
export interface AreaEnemy {
  typeId: string; // key into ENEMY_TYPES
  uid: string; // unique instance id — carried into combat via makeEnemyData
  /** If set, overrides maxHp when this enemy enters combat (e.g. resurrected at reduced HP). */
  hpOverride?: number;
  patrolRoute?: string[];
  patrolIndex?: number;
  tetheredTo?: string;
  turnsInRoom?: number;
}

export type RoomState = "locked" | "reachable" | "visited";

export interface RoomTemplate {
  label: string;
  enemies: string[];
  hint: string;
  description?: string;
}

/** A door from one room to a room in another area. */
export interface RoomExit {
  toAreaId: string;
  toRoomGridId: number;
}

/* ── Room Props ── */

export interface PropRequirements {
  flags?: string[];
  notFlags?: string[];
  salt?: number;
}

export type PropEffect =
  | { type: "set_flag"; flag: string; value?: boolean | number }
  | { type: "grant_salt"; amount: number }
  | { type: "remove_salt"; amount: number }
  | { type: "damage_player"; amount: number }
  | { type: "heal_player"; amount: number }
  | { type: "log"; message: string }
  | { type: "consume_prop" }
  | { type: "grant_weapon"; weaponId: string }
  | { type: "grant_consumable"; consumableId: string }
  | { type: "grant_ability"; abilityId: DiceAbilityId }
  | { type: "grant_grid_weapon"; weaponId: string }
  | { type: "grant_grid_offhand"; offhandId: string }
  | { type: "grant_grid_armor"; armorId: string };

export interface PropAction {
  id: string;
  label: string;
  desc?: string;
  requires?: PropRequirements;
  effects: PropEffect[];
}

export interface RoomProp {
  id: string;
  label: string;
  icon: string;
  desc: string;
  gridPosition?: { row: number; col: number };
  actions?: PropAction[];
  onExamine?: PropEffect[];
  condition?: PropRequirements;
}

export interface PropState {
  examined: boolean;
  actionsUsed: string[];
  consumed: boolean;
}

export interface AuthoredRoom {
  label: string;
  hint: string;
  description?: string;
  enemies: string[];
  isStart?: boolean;
  isBoss?: boolean;
  /**
   * Author-only notes. A scratchpad for things that should live in this room
   * (clues, items, environmental beats, etc.) but aren't yet implemented.
   * Not shown to the player — only surfaced in the in-game editor.
   */
  notes?: string;
  /**
   * If set, this room is a cross-area transition room. Entering it triggers
   * `switchArea` to the target area + room. The room can still be authored
   * normally (label, hint, grid position); it just behaves as a one-way door
   * in addition to being a visitable room.
   */
  exit?: RoomExit;
  /** Interactable props placed within this room. */
  props?: RoomProp[];
  /** Safe rooms heal more on rest and suppress ambushes (sunlit, warded, brazier-lit). */
  safeRoom?: boolean;
}

export interface AuthoredLayout {
  grid: number[][];
  rooms: Record<number, AuthoredRoom>;
}

export interface AreaDef {
  id: string;
  name: string;
  desc: string;
  difficulty: number;
  combatRooms: RoomTemplate[];
  /** Optional: authored areas can have zero boss rooms (transit/ring segments). */
  bossRoom?: RoomTemplate;
  generator?: "stamp" | "authored";
  authored?: AuthoredLayout;
  /**
   * Author-only notes for the area as a whole. Scratchpad for things that
   * should exist somewhere in this area (clues, set pieces, hook-ups, etc.)
   * but aren't yet implemented. Only surfaced in the in-game editor.
   */
  notes?: string;
}

export interface RoomBBox {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
}

export interface AreaNode {
  id: string;
  slot: string;
  label: string;
  boss: boolean;
  enemies: AreaEnemy[];
  /** Dead enemies left in this room, by typeId. Necromancer can resurrect these. */
  corpses: Record<string, number>;
  /** Active necromancer resurrection ritual. Counts down each area turn. */
  necroRitual: { typeId: string; turnsLeft: number; hpFraction: number } | null;
  hint: string;
  description?: string;
  state: RoomState;
  cx: number;
  cy: number;
  connections: string[];
  scouted: boolean;
  gridRoomId?: number;
  bbox?: RoomBBox;
  /** If set, entering this room transitions to another area. Mirrors `AuthoredRoom.exit`. */
  exit?: RoomExit;
  /** Interactable props carried from the authored room into the runtime node. */
  props?: RoomProp[];
  /** Runtime state per prop id (examined / actions used / consumed). */
  propStates?: Record<string, PropState>;
  /** Safe rooms heal more on rest and suppress ambushes. */
  safeRoom?: boolean;
  ratInfested?: number;
  stench?: number;
  coldZone?: number;
  shadowDarkness?: number;
  wailZone?: boolean;
  commanded?: boolean;
  tracks?: number;
  saltCrystals?: number;
  looted?: string[];
  infested?: number;
}

/** The raw grid + metadata produced by area generation */
export interface AreaGrid {
  cells: number[][];
  width: number;
  height: number;
}

/* ── Player ── */

export interface Player {
  hp: number;
  maxHp: number;
  salt: number;
  statuses: Statuses;
  mainWeapon: Weapon;
  offhandWeapon: Weapon | null;
  ownedWeapons: Weapon[];
  consumables: Consumable[];
  abilities: DiceAbilityId[];
  /** Narrative flags set by room-prop interactions. Values are boolean or number. */
  flags: Record<string, boolean | number>;

  /** Grid-combat loadout (weapon/offhand/armor) selected by the player. */
  gridWeaponId?: string;
  gridOffhandId?: string | null;
  gridArmorId?: string;
  ownedGridWeaponIds: string[];
  ownedGridOffhandIds: string[];
  ownedGridArmorIds: string[];

  /** Dice-combat active ability id (key into ABILITY_DICE). Defaults to "steady_hands". */
  activeAbilityId?: DiceAbilityId;
}

export interface CombatPlayer extends Player {
  block: number;
  stealthActive: boolean;
  counterActive: boolean;
  abilityCooldowns: Record<string, number>;
  chargingAbility?: string;
  chargingTurnsLeft?: number;
  chargingTargetUid?: string;
  blockReduction?: number;
}

/* ── Misc ── */

export interface AreaLogEntry {
  turn: number;
  text: string;
  source: "player" | "monster" | "system";
  roomId?: string;
  debugText?: string;
  approaching?: boolean;
}
