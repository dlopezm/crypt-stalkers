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
  | "power" // next damage symbol deals +N (stacks consumed on next hit)
  | "dragged" // dodge faces don't prevent damage for 1 turn
  | "dodge" // enemy-only: negate one incoming attack, then clears
  | "intangible" // enemy-only: immune to physical damage this turn, then clears
  | "taunt" // enemy-only: redirects damage from other enemies to this one, then clears
  | "hidden" // enemy-only: untargetable this turn, enables sneak attack, clears at end of player turn
  | "focus"; // each stack grants one free face pick on next roll
export type Statuses = Partial<Record<StatusKey, number>>;

/* ── Equipment ── */

export type HandType = "1" | "2" | "offhand";

export interface Weapon {
  id: string;
  name: string;
  hand: HandType;
  icon: string;
}

export interface Consumable {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

export interface EnemyType {
  id: string;
  name: string;
  ascii: string;
  mechanic: string;
  isBoss?: boolean;
  deathHint?: string;
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
  uid: string;
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
  | { type: "grant_consumable"; consumableId: string }
  | { type: "grant_ability"; abilityId: DiceAbilityId }
  | { type: "grant_weapon"; weaponId: string }
  | { type: "grant_offhand"; offhandId: string }
  | { type: "grant_armor"; armorId: string };

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
  weaponId: string;
  offhandId: string | null;
  armorId: string;
  ownedWeaponIds: string[];
  ownedOffhandIds: string[];
  ownedArmorIds: string[];
  consumables: Consumable[];
  abilities: DiceAbilityId[];
  activeAbilityId?: DiceAbilityId;
  /** Narrative flags set by room-prop interactions. */
  flags: Record<string, boolean | number>;
}

/* ── Combat Victory ── */

export interface CombatVictoryResult {
  hp: number;
  maxHp: number;
  salt: number;
  consumables: Consumable[];
}

/* ── Misc ── */

export interface AreaLogEntry {
  turn: number;
  text: string;
  source: "player" | "monster" | "system";
  roomId?: string;
  debugText?: string;
}
