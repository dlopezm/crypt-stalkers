/* ═══════════════════════════════════════════════════════════════════════════
   LINE COMBAT — Core Types
   1D corridor combat: entities on a numbered slot line, abilities keyed to
   slot patterns, push/pull/switch as first-class effects.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { DamageType } from "../types";
import type { GridConditionKey, EnemyPassive, EnemySpeedTier } from "../grid-combat/types";

export type { GridConditionKey as LineConditionKey };

// ─── Line Position ───

/** Slot index on the line (0 = left wall-adjacent, lineLength-1 = right wall-adjacent). */
export type LinePos = number;

// ─── Terrain ───

export type LineTerrain =
  | { type: "empty" }
  | { type: "pit" }
  | { type: "rubble" }
  | { type: "hallowed_ground"; turnsRemaining: number }
  | { type: "smoke"; turnsRemaining: number }
  | { type: "hazard"; turnsRemaining: number; damage: number }
  | { type: "salt_deposit" }
  | { type: "rot"; turnsRemaining: number }
  | { type: "dark_zone"; turnsRemaining: number }
  | { type: "wall_pillar" }; // Bone Pillar boss ability — acts as impassable wall

export function emptySlot(): LineTerrain {
  return { type: "empty" };
}

// ─── Ability Slot Patterns ───

/**
 * Defines which slots an ability can hit, relative to the caster's position.
 * "Distance" = |casterSlot - targetSlot|. Direction is resolved by AI / player intent.
 */
export type LinePattern =
  | { type: "adjacent" }
  // hits first entity at distance 1 in either direction (attacker chooses direction)
  | { type: "adjacent_forward" }
  // hits slot +1 in attacker's forward direction only
  | { type: "reach"; minDist: number; maxDist: number }
  // hits the first entity found within [minDist..maxDist] in chosen direction
  | { type: "pierce"; minDist: number; maxDist: number }
  // hits ALL entities in [minDist..maxDist] range (spear through multiple targets)
  | { type: "scatter"; targetMinDist: number; targetMaxDist: number; spread: number }
  // player/AI picks a center slot; hits center ± spread additional slots
  // (blunderbuss: targetDist 2-6, spread 1 → 3 entity AoE)
  | { type: "gap"; exactDist: number }
  // hits ONLY at exact distance (Bone Lunge: dist 2 only, not 1)
  | { type: "sweep"; minDist: number; maxDist: number }
  // hits all slots in range simultaneously, in ONE direction
  | { type: "full_line" }
  // hits all entities on the entire line
  | { type: "self_burst"; radius: number }
  // hits all entities within radius slots of caster (Salt Revenant Weep)
  | { type: "self" };
// targets only the caster (buffs, stances, summons)

// ─── Reposition Effects ───

export type LineReposition =
  | { type: "push_target"; distance: number }
  | { type: "pull_target"; distance: number }
  | { type: "push_self"; distance: number }
  | { type: "pull_self"; distance: number }
  | { type: "switch" } // swap caster and target positions
  | { type: "push_all_in_range"; distance: number }; // outward push from caster

// ─── Ability (player or enemy) ───

export interface LineAbilityConditionApply {
  readonly condition: GridConditionKey;
  readonly stacks: number;
  readonly targetSelf?: boolean;
}

export type LineAbilitySpecial =
  | { type: "lifesteal"; fraction: number }
  | { type: "gain_armor"; amount: number; turns: number }
  | { type: "wall_slam_bonus"; extraDamage: number }
  | { type: "drain_ap"; amount: number }
  | { type: "summon"; enemyId: string; atSlotOffset: number }
  | { type: "raise_dead"; hpFraction: number }
  | { type: "mass_raise_dead"; hpFraction: number }
  | { type: "create_terrain"; terrain: LineTerrain; slotOffset: number }
  | { type: "create_terrain_aoe"; terrain: LineTerrain; radius: number }
  | { type: "teleport_self"; targetType: "any_empty" | "dark_zone" | "rot" | "away_from_player" }
  | { type: "teleport_to_adjacent_target" } // ghoul pounce — land adjacent to target
  | { type: "steal_salt"; amount: number }
  | { type: "intercept_for_allies" } // Forsworn — move into line-of-sight path
  | { type: "command_ally_extra_action" }
  | { type: "overwatch_trigger"; rangeBand: { min: number; max: number }; damage: number }
  | { type: "riposte_trigger"; damage: number }
  | { type: "negate_hit" }
  | { type: "metamorphosis"; turnsLeft: number; targetEnemyId: string }
  | { type: "mist_form"; turns: number }
  | { type: "blood_puppet_corpse" }
  | { type: "apply_dark_zone"; slotsFromSelf: number; width: number; turns: number }
  | { type: "phylactery_shield"; armor: number }
  | { type: "barrier_breach" } // remove armor buffs from all targets in range
  | { type: "eclipse"; turns: number } // dark zone on all odd slots
  | {
      type: "dirge_zone";
      slot: number;
      turns: number;
      damagePerTurn: number;
      apDrainPerTurn: number;
    }
  | { type: "immobilize_both" }; // zombie grab — immobilizes attacker AND target

export interface LineAbility {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly apCost: number;
  readonly cooldown: number;
  readonly pattern: LinePattern;
  readonly damage: number;
  readonly damageType: DamageType | null;
  readonly reposition: LineReposition | null;
  readonly conditions: readonly LineAbilityConditionApply[];
  readonly special: readonly LineAbilitySpecial[];
  /** If true, silenced entities cannot use this ability. */
  readonly silenceBlocked: boolean;
  /** Reaction ability — triggers on specific enemy action (overwatch, riposte, brace). */
  readonly isReaction: boolean;
}

// ─── Player State ───

export interface LinePlayerState {
  readonly position: LinePos;
  readonly hp: number;
  readonly maxHp: number;
  readonly ap: number;
  readonly maxAp: number;
  readonly salt: number;
  readonly armor: number;
  readonly mainWeaponId: string;
  readonly offhandId: string | null;
  readonly armorId: string;
  readonly conditions: Partial<Record<GridConditionKey, number>>;
  readonly abilityCooldowns: Record<string, number>;
  readonly ripostePending: boolean;
  readonly overwatchActive: boolean;
  readonly negateNextHit: boolean;
  readonly mistFormTurns: number;
}

// ─── Enemy State ───

export interface LineEnemyState {
  readonly uid: string;
  readonly id: string;
  readonly position: LinePos;
  readonly hp: number;
  readonly maxHp: number;
  readonly armor: number;
  readonly conditions: Partial<Record<GridConditionKey, number>>;
  readonly passives: readonly EnemyPassive[];
  readonly resistances: Partial<Record<DamageType, number>>;
  readonly vulnerabilities: Partial<Record<DamageType, number>>;
  readonly speedTier: EnemySpeedTier;
  /** Turns until this entity transforms/reforms/hatches (null = inactive). */
  readonly countdownTimer: number | null;
  readonly countdownTarget: string | null; // enemy id to transform into
  /** True while entity has taken incorporeal mist form (temp invuln). */
  readonly mistFormTurns: number;
  readonly darkZoneBonus: boolean; // shadow: currently in dark zone slot
  readonly commandedExtraAction: boolean; // necromancer Command effect
  readonly dirgeZoneActive: boolean; // banshee dirge zone occupant
}

// ─── Corpse (dead enemy still on line) ───

export interface LineCorpse {
  readonly uid: string;
  readonly enemyId: string;
  readonly position: LinePos;
  readonly name: string;
  readonly icon: string;
  readonly salt: number; // loot waiting to be collected
}

// ─── Telegraph ───

/** Enemy declared intent for the current turn. */
export interface LineTelegraph {
  readonly ownerUid: string;
  readonly abilityId: string;
  readonly label: string;
  readonly icon: string;
  /** Which slots are affected (for UI highlight). */
  readonly affectedSlots: readonly LinePos[];
  /** Which slot will the enemy move to (if repositioning itself). */
  readonly selfRepositionSlot: LinePos | null;
  readonly damage: number;
  readonly damageType: DamageType | null;
  readonly reposition: LineReposition | null;
  readonly conditions: readonly LineAbilityConditionApply[];
  readonly special: readonly LineAbilitySpecial[];
}

// ─── Encounter Goal ───

export type EncounterGoal =
  | { type: "kill_all" }
  | { type: "kill_target"; targetUid: string; targetName: string }
  | { type: "survive"; turns: number }
  | { type: "protect"; protectedUid: string; protectedName: string };

// ─── Reinforcements ───

export interface LineReinforcement {
  readonly onTurn: number;
  readonly side: "left" | "right"; // which end of line
  readonly enemyIds: readonly string[];
}

// ─── Encounter Definition ───

export interface LineEncounterDef {
  readonly id: string;
  readonly name: string;
  readonly desc: string;
  readonly lineLength: 7 | 8 | 9;
  readonly playerStartSlot: LinePos;
  /** terrain[i] = terrain at slot i (undefined = empty) */
  readonly terrain: Partial<Record<LinePos, LineTerrain>>;
  /** starting enemies: [enemyId, startSlot] pairs */
  readonly enemies: readonly [string, LinePos][];
  readonly goal: EncounterGoal;
  readonly reinforcements: readonly LineReinforcement[];
  readonly isTutorial: boolean;
}

// ─── Enemy Type Definition ───

export interface LineAIContext {
  readonly player: LinePlayerState;
  readonly enemies: readonly LineEnemyState[];
  readonly corpses: readonly LineCorpse[];
  readonly slots: readonly LineTerrain[];
  readonly turn: number;
}

export interface LineEnemyTypeDef {
  readonly id: string;
  readonly name: string;
  readonly ascii: string;
  readonly maxHp: number;
  readonly speedTier: EnemySpeedTier;
  readonly loot: number;
  readonly isBoss: boolean;
  readonly incorporeal: boolean;
  readonly defaultArmor: number;
  readonly resistances: Partial<Record<DamageType, number>>;
  readonly vulnerabilities: Partial<Record<DamageType, number>>;
  readonly abilities: readonly LineAbility[];
  readonly passives: readonly EnemyPassive[];
  readonly selectActions: (self: LineEnemyState, ctx: LineAIContext) => readonly LineTelegraph[];
  readonly onDeath?: (self: LineEnemyState, ctx: LineAIContext) => readonly LineDeathEffect[];
}

export type LineDeathEffect =
  | { type: "spawn_heap"; position: LinePos }
  | { type: "corpse_burst"; position: LinePos; damage: number; poisonTurns: number; radius: number }
  | { type: "infected_adjacent"; position: LinePos; turns: number }
  | { type: "explode"; position: LinePos; radius: number; damage: number }
  | { type: "create_terrain"; position: LinePos; terrain: LineTerrain }
  | { type: "drop_caltrops"; position: LinePos }
  | { type: "create_salt_deposit"; position: LinePos };

// ─── Dirge Zone (Banshee persistent zone) ───

export interface DirgeZone {
  readonly slot: LinePos;
  readonly turnsRemaining: number;
  readonly damagePerTurn: number;
  readonly apDrainPerTurn: number;
}

// ─── Main Combat State ───

export type LineCombatPhase =
  | "telegraph"
  | "player_turn"
  | "resolving"
  | "end_of_turn"
  | "victory"
  | "defeat";

export interface LineCombatState {
  readonly lineLength: number;
  readonly slots: readonly LineTerrain[]; // length = lineLength
  readonly player: LinePlayerState;
  readonly enemies: readonly LineEnemyState[];
  readonly corpses: readonly LineCorpse[];
  readonly phase: LineCombatPhase;
  readonly telegraphs: readonly LineTelegraph[];
  readonly turn: number;
  readonly goal: EncounterGoal;
  readonly reinforcements: readonly LineReinforcement[];
  readonly dirgeZones: readonly DirgeZone[];
  readonly log: readonly string[];
}

// ─── Player Action (queued during player_turn) ───

export type LinePlayerAction =
  | { type: "move"; toSlot: LinePos }
  | { type: "use_ability"; abilityId: string; targetSlot: LinePos; direction: 1 | -1 }
  | { type: "collect_salt"; fromCorpseUid: string }
  | { type: "end_turn" };
