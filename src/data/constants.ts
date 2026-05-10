/* ── Balance & Gameplay Constants ── */

// Player defaults
export const PLAYER_START_HP = 40;
export const PLAYER_START_SALT = 0;

// Combat multipliers
export const WEAKEN_DMG_MULT = 0.75;
export const BLIND_MISS_CHANCE = 0.3;
export const LIFESTEAL_FRACTION = 0.5;
export const COUNTER_REFLECT_FRACTION = 0.5;
export const HOLY_VS_VAMPIRE_MULT = 1.5;

// Weapon ability constants
export const CHARGING_BLOW_MULTIPLIER = 3;
export const SHIELD_BLOCK_REDUCTION = 0.75;
export const QUICK_STRIKE_DAMAGE_MULT = 0.5;

// Flee
export const FLEE_CHANCE = 0.6;

// Light
export const LIGHT_MAX = 5;
export const LIGHT_START = 4;
export const DARKNESS_DAMAGE = 3;

// Skeleton
export const SKELETON_REASSEMBLE_HP = 5;

// Ghost
export const GHOST_PHASE_CHANCE = 0.3;

// Ambush
export const AMBUSH_DMG_MULT = 3;

// Zombie
export const ZOMBIE_EMPOWERED_ATK_MULT = 2;

// Necromancer
export const NECRO_SUMMON_COOLDOWN = 2;
export const NECRO_REVIVE_HP_FRAC = 0.5;

// Lich
export const LICH_REVIVE_HP_FRAC = 0.3;

// Shadow
export const SHADOW_DARKNESS_DAMAGE = 5;

// Salt Revenant
export const SALT_REVENANT_HP_THRESHOLD = 0.5;

// Dungeon AI
export const AI_REPRODUCE_CHANCE = 0.25;
export const AI_NOISE_ATTRACT_CHANCE = 0.55;
export const AI_LIGHT_FLEE_CHANCE = 0.45;
export const AI_ROAM_CHANCE = 0.2;
export const AI_SCOUT_SEND_CHANCE = 0.6;

// Population caps (per-monster-type, per-room / per-area)
export const RAT_CAP_PER_ROOM = 4;
export const RAT_CAP_PER_AREA = 12;

// Monster dungeon identity — occupation thresholds (turns in room before effect triggers)
export const OCCUPATION_THRESHOLD_RAT = 3;
export const OCCUPATION_THRESHOLD_ZOMBIE = 2;
export const OCCUPATION_THRESHOLD_LARVA = 2;

// Monster dungeon identity — decay counters (turns before effect fades after source leaves)
export const DECAY_RAT_INFESTATION = 3;
export const DECAY_STENCH = 3;
export const DECAY_COLD_ZONE = 2;
export const DECAY_SHADOW_DARKNESS = 4;
export const DECAY_TRACKS = 3;
export const DECAY_SALT_CRYSTALS = 5;
export const DECAY_INFESTATION = 2;

// Monster dungeon identity — zone radii (BFS hops from source)
export const ZONE_WAIL_RADIUS = 3;
export const ZONE_COMMAND_RADIUS = 2;

// Monster dungeon identity — behavior thresholds
export const ZOMBIE_TETHER_RANGE = 2;
export const VAMPIRE_APPROACH_HP_RATIO = 0.4;
export const VAMPIRE_AVOID_HP_RATIO = 0.6;

// Limits
export const DUNGEON_LOG_MAX = 200;

import type { DiceAbilityId } from "../dice-combat/dice-defs";
export const STARTER_ABILITY_ID: DiceAbilityId = "steady_hands";
