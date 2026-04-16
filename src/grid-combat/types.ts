/* ═══════════════════════════════════════════════════════════════════════════
   TACTICAL GRID COMBAT — Core Types
   Into the Breach-inspired timeline insertion on hybrid room grids.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { DamageType, Consumable } from "../types";

// ─── Grid Coordinates ───

export interface GridPos {
  readonly row: number;
  readonly col: number;
}

export type Direction = "north" | "south" | "east" | "west";

export const DIRECTIONS: readonly Direction[] = ["north", "south", "east", "west"] as const;

export const DIR_DELTA: Record<Direction, GridPos> = {
  north: { row: -1, col: 0 },
  south: { row: 1, col: 0 },
  east: { row: 0, col: 1 },
  west: { row: 0, col: -1 },
};

export const DIAGONAL_DELTAS: readonly GridPos[] = [
  { row: -1, col: -1 },
  { row: -1, col: 1 },
  { row: 1, col: -1 },
  { row: 1, col: 1 },
];

export const ALL_ADJACENT_DELTAS: readonly GridPos[] = [
  ...Object.values(DIR_DELTA),
  ...DIAGONAL_DELTAS,
];

// ─── Terrain ───

export type TerrainType =
  | "floor"
  | "wall"
  | "rubble"
  | "pillar"
  | "pit"
  | "mine_cart"
  | "salt_deposit"
  | "brazier"
  | "dark_zone"
  | "hazard"
  | "ward_line"
  | "hallowed_ground"
  | "smoke"
  | "rail";

export interface TerrainTile {
  readonly type: TerrainType;
  readonly lit: boolean;
  readonly turnsRemaining: number | null;
  readonly railDirection: Direction | null;
  readonly brazierLit: boolean | null;
  readonly hazardDamage: number | null;
}

export function makeFloor(): TerrainTile {
  return {
    type: "floor",
    lit: true,
    turnsRemaining: null,
    railDirection: null,
    brazierLit: null,
    hazardDamage: null,
  };
}

export function makeWall(): TerrainTile {
  return {
    type: "wall",
    lit: true,
    turnsRemaining: null,
    railDirection: null,
    brazierLit: null,
    hazardDamage: null,
  };
}

export function makeTerrain(type: TerrainType, overrides?: Partial<TerrainTile>): TerrainTile {
  return {
    type,
    lit: overrides?.lit ?? type !== "dark_zone",
    turnsRemaining: overrides?.turnsRemaining ?? null,
    railDirection: overrides?.railDirection ?? null,
    brazierLit: overrides?.brazierLit ?? (type === "brazier" ? true : null),
    hazardDamage: overrides?.hazardDamage ?? (type === "hazard" ? 2 : null),
  };
}

export const TERRAIN_BLOCKS_MOVEMENT: ReadonlySet<TerrainType> = new Set([
  "wall",
  "rubble",
  "pillar",
  "pit",
  "salt_deposit",
  "brazier",
]);

export const TERRAIN_BLOCKS_LOS: ReadonlySet<TerrainType> = new Set([
  "wall",
  "pillar",
  "salt_deposit",
  "smoke",
]);

export const TERRAIN_DESTRUCTIBLE: ReadonlySet<TerrainType> = new Set([
  "rubble",
  "pillar",
  "salt_deposit",
]);

// ─── Grid Conditions (on units) ───

export type GridConditionKey =
  | "poisoned"
  | "burning"
  | "stunned"
  | "immobilized"
  | "slowed"
  | "silenced"
  | "infected"
  | "hidden";

export type GridConditions = Partial<Record<GridConditionKey, number>>;

// ─── Grid Abilities ───

export type AbilityTargetType =
  | "self"
  | "adjacent" // orthogonal + diagonal (8-dir melee)
  | "orthogonal" // orthogonal only
  | "tile" // any tile within range
  | "line" // straight line from caster
  | "cone" // 3-tile cone in a direction
  | "ring" // all tiles at exact range
  | "radius" // all tiles within range
  | "passive"; // always-on, no activation

export interface GridAbility {
  readonly id: string;
  readonly name: string;
  readonly desc: string;
  readonly apCost: number;
  readonly cooldown: number;
  readonly range: number;
  readonly targetType: AbilityTargetType;
  readonly damageType: DamageType | null;
  readonly baseDamage: number;
  readonly aoeRadius: number;
  readonly pushDistance: number;
  readonly conditions: readonly GridAbilityConditionApply[];
  readonly special: readonly GridAbilitySpecial[];
  readonly requiresBehindTarget: boolean;
  readonly requiresLOS: boolean;
  readonly moveSelfDistance: number;
  readonly moveSelfDirection:
    | "toward_target"
    | "away_from_target"
    | "through_target"
    | "any"
    | null;
}

export interface GridAbilityConditionApply {
  readonly condition: GridConditionKey;
  readonly stacks: number;
  readonly target: "enemy" | "self" | "both";
}

export type GridAbilitySpecial =
  | {
      readonly type: "create_terrain";
      readonly terrain: TerrainType;
      readonly turnsRemaining: number | null;
    }
  | { readonly type: "destroy_terrain" }
  | { readonly type: "push_mine_cart" }
  | { readonly type: "reveal_hidden"; readonly radius: number }
  | { readonly type: "cancel_enemy_move" }
  | { readonly type: "redirect_enemy_attack" }
  | { readonly type: "force_enemy_move"; readonly distance: number }
  | { readonly type: "gain_salt"; readonly amount: number }
  | { readonly type: "heal"; readonly amount: number }
  | { readonly type: "armor_this_turn"; readonly amount: number }
  | { readonly type: "damage_reduction"; readonly amount: number }
  | { readonly type: "negate_hit" }
  | { readonly type: "cleanse_conditions" }
  | { readonly type: "riposte" }
  | { readonly type: "overwatch"; readonly damage: number }
  | { readonly type: "self_damage"; readonly amount: number }
  | { readonly type: "bone_resonance" }
  | { readonly type: "sidestep_strike"; readonly damage: number; readonly damageType: DamageType }
  | {
      readonly type: "slip_through_strike";
      readonly damage: number;
      readonly damageType: DamageType;
    }
  | { readonly type: "weapon_switch" }
  | { readonly type: "reduce_next_attack_damage"; readonly fraction: number }
  | { readonly type: "smoke_on_hit" }
  | { readonly type: "hallowed_ground"; readonly radius: number; readonly turns: number }
  | { readonly type: "light_zone"; readonly radius: number; readonly turns: number }
  | { readonly type: "ignore_incorporeal_resistance" }
  | { readonly type: "block_first_hit"; readonly reduction: number }
  | { readonly type: "retarget_attack" }
  | { readonly type: "aggro_reduction" }
  | { readonly type: "incorporeal_half_damage" }
  | { readonly type: "darkness_immunity" }
  | { readonly type: "dark_vision"; readonly range: number };

// ─── Player Grid State ───

export interface GridPlayerState {
  readonly hp: number;
  readonly maxHp: number;
  readonly salt: number;
  readonly pos: GridPos;
  readonly ap: number;
  readonly maxAp: number;
  readonly conditions: GridConditions;
  readonly armor: number;
  readonly thorns: number;
  readonly mainWeaponId: string;
  readonly offhandId: string | null;
  readonly armorId: string;
  readonly consumables: readonly Consumable[];
  readonly abilityCooldowns: Record<string, number>;
  readonly boneResonanceStacks: number;
  readonly overwatchTile: GridPos | null;
  readonly overwatchDamage: number;
  readonly riposteActive: boolean;
  readonly guardDamageReduction: number;
  readonly braceNegateActive: boolean;
  readonly blockFirstHitReduction: number;
}

// ─── Enemy Grid State ───

export type EnemyFacing = Direction;

export interface GridEnemyState {
  readonly id: string;
  readonly uid: string;
  readonly hp: number;
  readonly maxHp: number;
  readonly pos: GridPos;
  readonly facing: EnemyFacing;
  readonly conditions: GridConditions;
  readonly armor: number;
  readonly thorns: number;
  readonly isBoss: boolean;
  readonly incorporeal: boolean;
  readonly shieldWallActive: boolean;
  readonly reformTimer: number | null;
  readonly metamorphosisTimer: number | null;
  readonly metamorphosisTarget: string | null;
  readonly resistances: Partial<Record<DamageType, number>>;
  readonly vulnerabilities: Partial<Record<DamageType, number>>;
}

// ─── Enemy Ability (what enemies use in telegraphs) ───

export interface EnemyAbility {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly targetType: AbilityTargetType;
  readonly range: number;
  readonly damage: number;
  readonly damageType: DamageType | null;
  readonly aoeRadius: number;
  readonly pushDistance: number;
  readonly conditions: readonly GridAbilityConditionApply[];
  readonly special: readonly EnemyAbilitySpecial[];
}

export type EnemyAbilitySpecial =
  | { readonly type: "immobilize_both"; readonly turns: number }
  | { readonly type: "summon"; readonly enemyId: string; readonly count: number }
  | { readonly type: "raise_dead" }
  | { readonly type: "command_extra_action"; readonly targetEnemyUid: string }
  | { readonly type: "teleport_to_dark" }
  | { readonly type: "extinguish_light"; readonly range: number }
  | { readonly type: "spread_darkness"; readonly radius: number; readonly turns: number }
  | { readonly type: "drain_ap"; readonly amount: number }
  | { readonly type: "silence"; readonly turns: number }
  | { readonly type: "steal_salt"; readonly amount: number }
  | { readonly type: "drop_caltrops" }
  | { readonly type: "flee_toward_exit" }
  | { readonly type: "gain_armor"; readonly amount: number }
  | { readonly type: "shield_wall_allies" }
  | { readonly type: "intercept_los" }
  | { readonly type: "hold_position_armor"; readonly amount: number }
  | { readonly type: "bone_storm"; readonly radius: number }
  | { readonly type: "bone_cage" }
  | { readonly type: "reanimate_all" }
  | { readonly type: "blood_rush_teleport" }
  | { readonly type: "eclipse"; readonly turns: number }
  | { readonly type: "feast" }
  | { readonly type: "lifesteal"; readonly fraction: number }
  | { readonly type: "mass_raise" }
  | { readonly type: "shield_of_will" }
  | { readonly type: "soul_drain" }
  | { readonly type: "barrier_breach"; readonly radius: number }
  | { readonly type: "lich_gambit"; readonly damage: number }
  | { readonly type: "phase_through_walls" }
  | { readonly type: "swarm_bonus"; readonly bonusDamage: number }
  | { readonly type: "reform_on_death"; readonly nonBludgeoningOnly: boolean }
  | { readonly type: "pack_tactics"; readonly bonusDamage: number }
  | { readonly type: "death_explode"; readonly radius: number; readonly damage: number }
  | {
      readonly type: "metamorphosis";
      readonly turnsToTransform: number;
      readonly transformInto: string;
    };

// ─── Timeline ───

export type TelegraphType = "move" | "attack" | "buff" | "special";

export type TimelineEntryOwner =
  | { readonly type: "enemy"; readonly uid: string }
  | { readonly type: "player" };

export interface TimelineEntry {
  readonly id: string;
  readonly owner: TimelineEntryOwner;
  readonly abilityId: string;
  readonly targetTile: GridPos | null;
  readonly targetUid: string | null;
  readonly affectedTiles: readonly GridPos[];
  readonly label: string;
  readonly icon: string;
  readonly insertionIndex: number;
  readonly telegraphType: TelegraphType;
}

// ─── Tactical Grid ───

export interface TacticalGrid {
  readonly width: number;
  readonly height: number;
  readonly tiles: readonly (readonly TerrainTile[])[];
}

// ─── Combat Log ───

export interface GridCombatLogEntry {
  readonly turn: number;
  readonly text: string;
  readonly source: "player" | "enemy" | "environment";
}

// ─── Grid Combat Phase ───

export type GridCombatPhase = "telegraph" | "planning" | "execution" | "victory" | "defeat";

// ─── Full Combat State ───

export interface GridCombatState {
  readonly grid: TacticalGrid;
  readonly player: GridPlayerState;
  readonly enemies: readonly GridEnemyState[];
  readonly timeline: readonly TimelineEntry[];
  readonly playerInsertions: readonly TimelineEntry[];
  readonly turn: number;
  readonly phase: GridCombatPhase;
  readonly combatLog: readonly GridCombatLogEntry[];
  readonly deadEnemyPositions: readonly GridDeadEnemy[];
  readonly objectiveType: GridObjectiveType;
  readonly objectiveState: GridObjectiveState | null;
}

export interface GridDeadEnemy {
  readonly id: string;
  readonly uid: string;
  readonly pos: GridPos;
  readonly killedByBludgeoning: boolean;
  readonly reformTimer: number | null;
}

// ─── Objectives ───

export type GridObjectiveType =
  | "kill_all"
  | "survive"
  | "chase"
  | "defend"
  | "destroy_target"
  | "escort"
  | "puzzle";

export interface GridObjectiveState {
  readonly type: GridObjectiveType;
  readonly turnsRemaining: number | null;
  readonly targetTile: GridPos | null;
  readonly targetHp: number | null;
  readonly targetMaxHp: number | null;
  readonly escortPos: GridPos | null;
  readonly escortTargetTile: GridPos | null;
  readonly completed: boolean;
}

// ─── Grid Enemy Type Definition ───

export type EnemySpeedTier = "very_fast" | "fast" | "medium" | "slow";

export interface GridEnemyTypeDef {
  readonly id: string;
  readonly name: string;
  readonly ascii: string;
  readonly maxHp: number;
  readonly speedTier: EnemySpeedTier;
  readonly loot: number;
  readonly isBoss: boolean;
  readonly incorporeal: boolean;
  readonly defaultArmor: number;
  readonly defaultThorns: number;
  readonly resistances: Partial<Record<DamageType, number>>;
  readonly vulnerabilities: Partial<Record<DamageType, number>>;
  readonly abilities: readonly EnemyAbility[];
  readonly selectActions: (self: GridEnemyState, ctx: GridAIContext) => readonly EnemyTelegraph[];
  readonly onDeath?: (self: GridEnemyState, ctx: GridAIContext) => readonly EnemyDeathEffect[];
  readonly passives: readonly EnemyPassive[];
}

export interface GridAIContext {
  readonly grid: TacticalGrid;
  readonly player: GridPlayerState;
  readonly enemies: readonly GridEnemyState[];
  readonly deadEnemies: readonly GridDeadEnemy[];
  readonly turn: number;
}

export interface EnemyTelegraph {
  readonly abilityId: string;
  readonly targetTile: GridPos | null;
  readonly targetUid: string | null;
  readonly affectedTiles: readonly GridPos[];
  readonly label: string;
  readonly icon: string;
  readonly telegraphType: TelegraphType;
}

export type EnemyDeathEffect =
  | { readonly type: "spawn_heap"; readonly pos: GridPos }
  | { readonly type: "explode"; readonly radius: number; readonly damage: number }
  | { readonly type: "drop_caltrops"; readonly pos: GridPos }
  | { readonly type: "create_terrain"; readonly pos: GridPos; readonly terrain: TerrainType };

export type EnemyPassive =
  | { readonly type: "swarm_bonus"; readonly bonusDamagePerAlly: number }
  | { readonly type: "reform_on_non_bludgeoning" }
  | { readonly type: "hidden_in_dark" }
  | { readonly type: "dark_empowered"; readonly bonusDamage: number; readonly bonusArmor: number }
  | { readonly type: "incorporeal_resistance" }
  | { readonly type: "pack_tactics"; readonly bonusDamagePerAdjacentAlly: number }
  | { readonly type: "metamorphosis"; readonly turns: number; readonly transformInto: string }
  | { readonly type: "shield_wall_aura" }
  | { readonly type: "immune_to_push" }
  | { readonly type: "lifesteal"; readonly fraction: number }
  | { readonly type: "shadow_cloak_in_dark"; readonly damageReduction: number }
  | { readonly type: "feast_heal_on_adjacent_kill" }
  | { readonly type: "shield_of_will_while_minions_live"; readonly armor: number }
  | { readonly type: "fleeing" };

// ─── Equipment Definitions for Grid Combat ───

export interface GridWeaponDef {
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
  readonly icon: string;
  readonly desc: string;
  readonly hand: "1h" | "2h";
  readonly primaryDamageType: DamageType;
  readonly era: "pre_era" | "era1_baron" | "era2_order" | "era3_lich" | "mine";
  readonly abilities: readonly GridAbility[];
  readonly passives: readonly GridWeaponPassive[];
}

export type GridWeaponPassive =
  | { readonly type: "bone_resonance"; readonly maxStacks: number }
  | { readonly type: "salt_light_aura" }
  | { readonly type: "darkness_immunity" }
  | { readonly type: "dark_vision"; readonly range: number };

export interface GridOffhandDef {
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
  readonly icon: string;
  readonly desc: string;
  readonly era: "pre_era" | "era1_baron" | "era2_order" | "era3_lich" | "mine";
  readonly abilities: readonly GridAbility[];
  readonly passives: readonly GridOffhandPassive[];
}

export type GridOffhandPassive = { readonly type: "block_first_hit"; readonly reduction: number };

export interface GridArmorDef {
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
  readonly icon: string;
  readonly desc: string;
  readonly era: "pre_era" | "era1_baron" | "era2_order" | "era3_lich" | "mine";
  readonly armor: number;
  readonly thorns: number;
  readonly maxHpBonus: number;
  readonly maxApModifier: number;
  readonly activeAbility: GridAbility;
  readonly passives: readonly GridArmorPassive[];
}

export type GridArmorPassive =
  | { readonly type: "incorporeal_half_damage" }
  | { readonly type: "aggro_reduction" };

// ─── Grid Player (persistent, between fights) ───

export interface GridPlayer {
  readonly hp: number;
  readonly maxHp: number;
  readonly salt: number;
  readonly mainWeaponId: string;
  readonly offhandId: string | null;
  readonly armorId: string;
  readonly ownedWeaponIds: readonly string[];
  readonly ownedOffhandIds: readonly string[];
  readonly ownedArmorIds: readonly string[];
  readonly consumables: readonly Consumable[];
  readonly flags: Record<string, boolean | number>;
}

// ─── Room Terrain Layout (authored per room) ───

export interface RoomTerrainPlacement {
  readonly pos: GridPos;
  readonly terrain: TerrainType;
  readonly railDirection?: Direction;
  readonly brazierLit?: boolean;
  readonly hazardDamage?: number;
}

export interface RoomTerrainLayout {
  readonly gridWidth: number;
  readonly gridHeight: number;
  readonly terrainPlacements: readonly RoomTerrainPlacement[];
  readonly playerStart: GridPos;
  readonly enemySpawns: readonly GridPos[];
  readonly exitTile: GridPos | null;
}

// ─── Grid utility functions ───

export function posEqual(a: GridPos, b: GridPos): boolean {
  return a.row === b.row && a.col === b.col;
}

export function posAdd(a: GridPos, b: GridPos): GridPos {
  return { row: a.row + b.row, col: a.col + b.col };
}

export function manhattanDistance(a: GridPos, b: GridPos): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function chebyshevDistance(a: GridPos, b: GridPos): number {
  return Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col));
}

export function isAdjacent(a: GridPos, b: GridPos): boolean {
  return chebyshevDistance(a, b) === 1;
}

export function isOrthogonal(a: GridPos, b: GridPos): boolean {
  return manhattanDistance(a, b) === 1;
}

export function directionFromTo(from: GridPos, to: GridPos): Direction | null {
  const dr = to.row - from.row;
  const dc = to.col - from.col;

  if (dr === 0 && dc === 0) {
    return null;
  }

  if (Math.abs(dr) >= Math.abs(dc)) {
    return dr < 0 ? "north" : "south";
  }

  return dc < 0 ? "west" : "east";
}

export function oppositeDirection(dir: Direction): Direction {
  switch (dir) {
    case "north":
      return "south";
    case "south":
      return "north";
    case "east":
      return "west";
    case "west":
      return "east";
  }
}

export function inBounds(pos: GridPos, width: number, height: number): boolean {
  return pos.row >= 0 && pos.row < height && pos.col >= 0 && pos.col < width;
}

export function getTile(grid: TacticalGrid, pos: GridPos): TerrainTile | null {
  if (!inBounds(pos, grid.width, grid.height)) {
    return null;
  }
  return grid.tiles[pos.row][pos.col];
}

export function isWalkable(grid: TacticalGrid, pos: GridPos): boolean {
  const tile = getTile(grid, pos);
  if (!tile) {
    return false;
  }
  return !TERRAIN_BLOCKS_MOVEMENT.has(tile.type);
}

export function blocksLOS(grid: TacticalGrid, pos: GridPos): boolean {
  const tile = getTile(grid, pos);
  if (!tile) {
    return true;
  }
  return TERRAIN_BLOCKS_LOS.has(tile.type);
}
