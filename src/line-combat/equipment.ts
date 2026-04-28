/* ═══════════════════════════════════════════════════════════════════════════
   Line Combat — Player Weapon Abilities
   Each weapon's abilities are adapted from the Grid system to LinePattern.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { LineAbility } from "./types";

// ─── Sword ───

const swordSlash: LineAbility = {
  id: "sword_slash",
  name: "Slash",
  icon: "⚔️",
  apCost: 1,
  cooldown: 0,
  pattern: { type: "adjacent_forward" },
  damage: 6,
  damageType: "slash",
  reposition: null,
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const swordRiposte: LineAbility = {
  id: "sword_riposte",
  name: "Riposte",
  icon: "🛡️",
  apCost: 0,
  cooldown: 2,
  pattern: { type: "adjacent_forward" },
  damage: 4,
  damageType: "slash",
  reposition: null,
  conditions: [],
  special: [{ type: "riposte_trigger", damage: 4 }],
  silenceBlocked: false,
  isReaction: true,
};

const swordPommelStrike: LineAbility = {
  id: "sword_pommel_strike",
  name: "Pommel Strike",
  icon: "🔨",
  apCost: 1,
  cooldown: 0,
  pattern: { type: "adjacent_forward" },
  damage: 3,
  damageType: "bludgeoning",
  reposition: { type: "push_target", distance: 1 },
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

export const SWORD_ABILITIES: readonly LineAbility[] = [
  swordSlash,
  swordRiposte,
  swordPommelStrike,
];

// ─── Spear ───

const spearThrust: LineAbility = {
  id: "spear_thrust",
  name: "Thrust",
  icon: "🗡️",
  apCost: 1,
  cooldown: 0,
  pattern: { type: "pierce", minDist: 1, maxDist: 2 },
  damage: 5,
  damageType: "pierce",
  reposition: null,
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const spearHurl: LineAbility = {
  id: "spear_hurl",
  name: "Hurl",
  icon: "🎯",
  apCost: 2,
  cooldown: 2,
  pattern: { type: "reach", minDist: 3, maxDist: 5 },
  damage: 8,
  damageType: "pierce",
  reposition: null,
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const spearBrace: LineAbility = {
  id: "spear_brace",
  name: "Brace",
  icon: "⚡",
  apCost: 0,
  cooldown: 3,
  pattern: { type: "reach", minDist: 1, maxDist: 2 },
  damage: 6,
  damageType: "pierce",
  reposition: null,
  conditions: [],
  special: [{ type: "overwatch_trigger", rangeBand: { min: 1, max: 2 }, damage: 6 }],
  silenceBlocked: false,
  isReaction: true,
};

export const SPEAR_ABILITIES: readonly LineAbility[] = [spearThrust, spearHurl, spearBrace];

// ─── Blunderbuss ───

const blunderbussBlast: LineAbility = {
  id: "blunderbuss_blast",
  name: "Blast",
  icon: "💥",
  apCost: 2,
  cooldown: 0,
  pattern: { type: "scatter", targetMinDist: 2, targetMaxDist: 6, spread: 1 },
  damage: 4,
  damageType: "pierce",
  reposition: null,
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const blunderbussGrapeshot: LineAbility = {
  id: "blunderbuss_grapeshot",
  name: "Grapeshot",
  icon: "🌪️",
  apCost: 3,
  cooldown: 3,
  pattern: { type: "scatter", targetMinDist: 1, targetMaxDist: 3, spread: 2 },
  damage: 3,
  damageType: "pierce",
  reposition: null,
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const blunderBayonet: LineAbility = {
  id: "blunderbuss_bayonet",
  name: "Bayonet",
  icon: "🔪",
  apCost: 1,
  cooldown: 0,
  pattern: { type: "adjacent_forward" },
  damage: 3,
  damageType: "pierce",
  reposition: { type: "push_target", distance: 1 },
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

export const BLUNDERBUSS_ABILITIES: readonly LineAbility[] = [
  blunderbussBlast,
  blunderbussGrapeshot,
  blunderBayonet,
];

// ─── Mace ───

const maceHeavySwing: LineAbility = {
  id: "mace_heavy_swing",
  name: "Heavy Swing",
  icon: "🔨",
  apCost: 2,
  cooldown: 0,
  pattern: { type: "adjacent_forward" },
  damage: 7,
  damageType: "bludgeoning",
  reposition: null,
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const maceCrushingBlow: LineAbility = {
  id: "mace_crushing_blow",
  name: "Crushing Blow",
  icon: "💢",
  apCost: 2,
  cooldown: 0,
  pattern: { type: "adjacent_forward" },
  damage: 5,
  damageType: "bludgeoning",
  reposition: null,
  conditions: [],
  special: [{ type: "wall_slam_bonus", extraDamage: 4 }],
  silenceBlocked: false,
  isReaction: false,
};

const maceShockwave: LineAbility = {
  id: "mace_shockwave",
  name: "Shockwave",
  icon: "🌊",
  apCost: 2,
  cooldown: 2,
  pattern: { type: "sweep", minDist: 1, maxDist: 2 },
  damage: 3,
  damageType: "bludgeoning",
  reposition: { type: "push_all_in_range", distance: 1 },
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

export const MACE_ABILITIES: readonly LineAbility[] = [
  maceHeavySwing,
  maceCrushingBlow,
  maceShockwave,
];

// ─── Dagger ───

const daggerQuickStab: LineAbility = {
  id: "dagger_quick_stab",
  name: "Quick Stab",
  icon: "🔪",
  apCost: 1,
  cooldown: 0,
  pattern: { type: "adjacent_forward" },
  damage: 4,
  damageType: "pierce",
  reposition: null,
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const daggerBackstab: LineAbility = {
  id: "dagger_backstab",
  name: "Backstab",
  icon: "🗡️",
  apCost: 2,
  cooldown: 0,
  pattern: { type: "adjacent_forward" },
  damage: 8,
  damageType: "pierce",
  reposition: { type: "switch" },
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const daggerShadowStep: LineAbility = {
  id: "dagger_shadow_step",
  name: "Shadow Step",
  icon: "👤",
  apCost: 1,
  cooldown: 0,
  pattern: { type: "reach", minDist: 1, maxDist: 3 },
  damage: 0,
  damageType: null,
  reposition: { type: "pull_self", distance: 2 },
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

export const DAGGER_ABILITIES: readonly LineAbility[] = [
  daggerQuickStab,
  daggerBackstab,
  daggerShadowStep,
];

// ─── Crossbow ───

const crossbowBolt: LineAbility = {
  id: "crossbow_bolt",
  name: "Bolt",
  icon: "🏹",
  apCost: 1,
  cooldown: 0,
  pattern: { type: "reach", minDist: 2, maxDist: 5 },
  damage: 6,
  damageType: "pierce",
  reposition: null,
  conditions: [],
  special: [{ type: "gain_armor", amount: 0, turns: 0 }], // pierces 2 armor inline
  silenceBlocked: false,
  isReaction: false,
};

const crossbowOverwatch: LineAbility = {
  id: "crossbow_overwatch",
  name: "Overwatch",
  icon: "👁️",
  apCost: 0,
  cooldown: 1,
  pattern: { type: "reach", minDist: 2, maxDist: 4 },
  damage: 5,
  damageType: "pierce",
  reposition: null,
  conditions: [],
  special: [{ type: "overwatch_trigger", rangeBand: { min: 2, max: 4 }, damage: 5 }],
  silenceBlocked: false,
  isReaction: true,
};

const crossbowVolley: LineAbility = {
  id: "crossbow_volley",
  name: "Volley",
  icon: "🌧️",
  apCost: 3,
  cooldown: 3,
  pattern: { type: "sweep", minDist: 3, maxDist: 5 },
  damage: 4,
  damageType: "pierce",
  reposition: null,
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

export const CROSSBOW_ABILITIES: readonly LineAbility[] = [
  crossbowBolt,
  crossbowOverwatch,
  crossbowVolley,
];

// ─── Weapon → Abilities lookup ───

export const WEAPON_ABILITIES: Record<string, readonly LineAbility[]> = {
  sword: SWORD_ABILITIES,
  spear: SPEAR_ABILITIES,
  blunderbuss: BLUNDERBUSS_ABILITIES,
  mace: MACE_ABILITIES,
  dagger: DAGGER_ABILITIES,
  crossbow: CROSSBOW_ABILITIES,
};

export function getWeaponAbilities(weaponId: string): readonly LineAbility[] {
  return WEAPON_ABILITIES[weaponId] ?? SWORD_ABILITIES;
}

export function getAbility(weaponId: string, abilityId: string): LineAbility | null {
  return getWeaponAbilities(weaponId).find((a) => a.id === abilityId) ?? null;
}
