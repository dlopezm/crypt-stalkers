/* ═══════════════════════════════════════════════════════════════════════════
   Line Combat — Enemy Definitions
   All 14 regular + 3 boss enemies adapted to 1D line combat.
   Each enemy's tactical identity from Grid is preserved; geometry is adapted.
   ═══════════════════════════════════════════════════════════════════════════ */

import type {
  LineEnemyTypeDef,
  LineEnemyState,
  LineAIContext,
  LineTelegraph,
  LineDeathEffect,
  LineAbility,
} from "./types";

// ─── Telegraph helpers ───

function dist(self: LineEnemyState, ctx: LineAIContext): number {
  return Math.abs(self.position - ctx.player.position);
}

function dirToward(self: LineEnemyState, ctx: LineAIContext): 1 | -1 {
  return ctx.player.position > self.position ? 1 : -1;
}

function dirAway(self: LineEnemyState, ctx: LineAIContext): 1 | -1 {
  return ctx.player.position > self.position ? -1 : 1;
}

function isSlotFree(ctx: LineAIContext, slot: number): boolean {
  if (slot < 0 || slot >= ctx.slots.length) return false;
  if (ctx.player.position === slot) return false;
  if (ctx.enemies.some((e) => e.position === slot && (e.hp > 0 || e.countdownTimer !== null)))
    return false;
  const t = ctx.slots[slot];
  if (t.type === "wall_pillar" || t.type === "pit") return false;
  return true;
}

function moveTowardPlayer(self: LineEnemyState, ctx: LineAIContext, icon = "👣"): LineTelegraph[] {
  const dir = dirToward(self, ctx);
  const targetSlot = self.position + dir;
  if (!isSlotFree(ctx, targetSlot)) return [];
  return [
    {
      ownerUid: self.uid,
      abilityId: "move",
      label: "Advances",
      icon,
      affectedSlots: [],
      selfRepositionSlot: targetSlot,
      damage: 0,
      damageType: null,
      reposition: null,
      conditions: [],
      special: [],
    },
  ];
}

function moveAwayFromPlayer(
  self: LineEnemyState,
  ctx: LineAIContext,
  icon = "👣",
): LineTelegraph[] {
  const dir = dirAway(self, ctx);
  const targetSlot = self.position + dir;
  if (!isSlotFree(ctx, targetSlot)) return [];
  return [
    {
      ownerUid: self.uid,
      abilityId: "retreat",
      label: "Retreats",
      icon,
      affectedSlots: [],
      selfRepositionSlot: targetSlot,
      damage: 0,
      damageType: null,
      reposition: null,
      conditions: [],
      special: [],
    },
  ];
}

function makeTelegraph(
  self: LineEnemyState,
  ability: LineAbility,
  affectedSlots: number[],
  selfRepositionSlot: number | null = null,
): LineTelegraph {
  return {
    ownerUid: self.uid,
    abilityId: ability.id,
    label: ability.name,
    icon: ability.icon,
    affectedSlots,
    selfRepositionSlot,
    damage: ability.damage,
    damageType: ability.damageType,
    reposition: ability.reposition,
    conditions: ability.conditions,
    special: ability.special,
  };
}

function affectedSlotsForward(
  self: LineEnemyState,
  ctx: LineAIContext,
  minDist: number,
  maxDist: number,
): number[] {
  const dir = dirToward(self, ctx);
  const slots: number[] = [];
  for (let d = minDist; d <= maxDist; d++) {
    const s = self.position + dir * d;
    if (s >= 0 && s < ctx.slots.length) slots.push(s);
  }
  return slots;
}

// ─── RAVAGER RAT ───

const ratBite: LineAbility = {
  id: "rat_bite",
  name: "Bite",
  icon: "🐀",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "adjacent_forward" },
  damage: 2,
  damageType: "pierce",
  reposition: null,
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const ratSwarmPile: LineAbility = {
  id: "rat_swarm_pile",
  name: "Swarm Pile",
  icon: "🐀🐀",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self_burst", radius: 1 },
  damage: 3,
  damageType: "pierce",
  reposition: null,
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

export const RAT_DEF: LineEnemyTypeDef = {
  id: "rat",
  name: "Ravager Rat",
  ascii: "🐀",
  maxHp: 2,
  speedTier: "fast",
  loot: 3,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  resistances: {},
  vulnerabilities: {},
  abilities: [ratBite, ratSwarmPile],
  passives: [{ type: "swarm_bonus", bonusDamagePerAlly: 1 }],
  selectActions(self, ctx): readonly LineTelegraph[] {
    const d = dist(self, ctx);
    const adjacentRats = ctx.enemies.filter(
      (e) => e.id === "rat" && e.uid !== self.uid && Math.abs(e.position - self.position) <= 1,
    );

    if (d <= 1 && adjacentRats.length >= 1) {
      return [
        makeTelegraph(
          self,
          ratSwarmPile,
          [self.position - 1, self.position, self.position + 1].filter(
            (s) => s >= 0 && s < ctx.slots.length,
          ),
        ),
      ];
    }
    if (d <= 1) {
      return [makeTelegraph(self, ratBite, [ctx.player.position])];
    }
    return moveTowardPlayer(self, ctx, "🐀");
  },
};

// ─── SKELETON ───

const skelSlash: LineAbility = {
  id: "skel_slash",
  name: "Slash",
  icon: "💀",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "adjacent_forward" },
  damage: 5,
  damageType: "slash",
  reposition: null,
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const skelBoneLunge: LineAbility = {
  id: "skel_bone_lunge",
  name: "Bone Lunge",
  icon: "🦴",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "gap", exactDist: 2 },
  damage: 4,
  damageType: "pierce",
  reposition: null,
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const skelShieldedStance: LineAbility = {
  id: "skel_shielded_stance",
  name: "Shielded Stance",
  icon: "🛡️",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self" },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "gain_armor", amount: 3, turns: 1 }],
  silenceBlocked: false,
  isReaction: false,
};

export const SKELETON_DEF: LineEnemyTypeDef = {
  id: "skeleton",
  name: "Skeleton",
  ascii: "💀",
  maxHp: 12,
  speedTier: "medium",
  loot: 8,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  resistances: { pierce: 0.5 },
  vulnerabilities: { bludgeoning: 1.5 },
  abilities: [skelSlash, skelBoneLunge, skelShieldedStance],
  passives: [{ type: "reform_on_non_bludgeoning" }, { type: "formation_armor", bonusPerAlly: 1 }],
  selectActions(self, ctx): readonly LineTelegraph[] {
    const d = dist(self, ctx);
    if (d === 1) {
      // Shield stance every other attack
      if (ctx.turn % 2 === 0) {
        return [makeTelegraph(self, skelShieldedStance, [self.position])];
      }
      return [makeTelegraph(self, skelSlash, [ctx.player.position])];
    }
    if (d === 2) {
      return [makeTelegraph(self, skelBoneLunge, [ctx.player.position])];
    }
    return moveTowardPlayer(self, ctx, "💀");
  },
  onDeath(self): readonly LineDeathEffect[] {
    return [{ type: "spawn_heap", position: self.position }];
  },
};

// ─── HEAP OF BONES ───

export const HEAP_OF_BONES_DEF: LineEnemyTypeDef = {
  id: "heap_of_bones",
  name: "Heap of Bones",
  ascii: "🦴",
  maxHp: 3,
  speedTier: "slow",
  loot: 0,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  resistances: { pierce: 0.5 },
  vulnerabilities: { bludgeoning: 2.0 },
  abilities: [],
  passives: [],
  selectActions(): readonly LineTelegraph[] {
    return []; // reforming — no actions
  },
};

// ─── ROTTING ZOMBIE ───

const zombieGrab: LineAbility = {
  id: "zombie_grab",
  name: "Grab",
  icon: "🧟",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "adjacent_forward" },
  damage: 3,
  damageType: "bludgeoning",
  reposition: null,
  conditions: [{ condition: "immobilized", stacks: 2 }],
  special: [{ type: "immobilize_both" }],
  silenceBlocked: false,
  isReaction: false,
};

const zombieShamble: LineAbility = {
  id: "zombie_shamble",
  name: "Shamble",
  icon: "👋",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "pierce", minDist: 1, maxDist: 3 },
  damage: 2,
  damageType: "bludgeoning",
  reposition: null,
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

export const ZOMBIE_DEF: LineEnemyTypeDef = {
  id: "zombie",
  name: "Rotting Zombie",
  ascii: "🧟",
  maxHp: 8,
  speedTier: "slow",
  loot: 12,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  resistances: {},
  vulnerabilities: {},
  abilities: [zombieGrab, zombieShamble],
  passives: [],
  selectActions(self, ctx): readonly LineTelegraph[] {
    const d = dist(self, ctx);
    if (d === 1) {
      return [makeTelegraph(self, zombieGrab, [ctx.player.position])];
    }
    if (d <= 3) {
      return [makeTelegraph(self, zombieShamble, affectedSlotsForward(self, ctx, 1, 3))];
    }
    return moveTowardPlayer(self, ctx, "🧟");
  },
  onDeath(self): readonly LineDeathEffect[] {
    return [
      { type: "corpse_burst", position: self.position, damage: 2, poisonTurns: 2, radius: 1 },
    ];
  },
};

// ─── MOURNFUL GHOST ───

const ghostChillTouch: LineAbility = {
  id: "ghost_chill_touch",
  name: "Chill Touch",
  icon: "🌡️",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "adjacent" },
  damage: 4,
  damageType: null,
  reposition: null,
  conditions: [{ condition: "slowed", stacks: 2 }],
  special: [{ type: "drain_ap", amount: 1 }],
  silenceBlocked: false,
  isReaction: false,
};

const ghostSpectralWail: LineAbility = {
  id: "ghost_spectral_wail",
  name: "Spectral Wail",
  icon: "👻",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "sweep", minDist: 2, maxDist: 3 },
  damage: 3,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "drain_ap", amount: 1 }],
  silenceBlocked: false,
  isReaction: false,
};

const ghostPhaseShift: LineAbility = {
  id: "ghost_phase_shift",
  name: "Phase Shift",
  icon: "💫",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self" },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "teleport_self", targetType: "away_from_player" }],
  silenceBlocked: false,
  isReaction: false,
};

export const GHOST_DEF: LineEnemyTypeDef = {
  id: "ghost",
  name: "Mournful Ghost",
  ascii: "👻",
  maxHp: 10,
  speedTier: "fast",
  loot: 10,
  isBoss: false,
  incorporeal: true,
  defaultArmor: 0,
  resistances: { slash: 0.5, pierce: 0.5, bludgeoning: 0.5 },
  vulnerabilities: { holy: 1.5 },
  abilities: [ghostChillTouch, ghostSpectralWail, ghostPhaseShift],
  passives: [{ type: "incorporeal_resistance" }, { type: "immune_to_push" }],
  selectActions(self, ctx): readonly LineTelegraph[] {
    const d = dist(self, ctx);
    // Phase shift to flank every 4 turns
    if (ctx.turn % 4 === 0 && d > 1) {
      return [makeTelegraph(self, ghostPhaseShift, [self.position])];
    }
    if (d <= 1) {
      return [makeTelegraph(self, ghostChillTouch, [ctx.player.position])];
    }
    if (d <= 3) {
      return [makeTelegraph(self, ghostSpectralWail, affectedSlotsForward(self, ctx, 2, 3))];
    }
    return moveTowardPlayer(self, ctx, "👻");
  },
};

// ─── WAILING BANSHEE ───

const bansheeWail: LineAbility = {
  id: "banshee_wail",
  name: "Wail",
  icon: "😱",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "sweep", minDist: 1, maxDist: 4 },
  damage: 2,
  damageType: null,
  reposition: { type: "push_target", distance: 1 },
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const bansheeCorruptedHymn: LineAbility = {
  id: "banshee_hymn",
  name: "Corrupted Hymn",
  icon: "🎵",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "full_line" },
  damage: 3,
  damageType: null,
  reposition: null,
  conditions: [{ condition: "silenced", stacks: 2 }],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const bansheeDirge: LineAbility = {
  id: "banshee_dirge",
  name: "Dirge of the Damned",
  icon: "🎶",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "reach", minDist: 1, maxDist: 4 },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "dirge_zone", slot: 0, turns: 2, damagePerTurn: 2, apDrainPerTurn: 1 }],
  silenceBlocked: false,
  isReaction: false,
};

export const BANSHEE_DEF: LineEnemyTypeDef = {
  id: "banshee",
  name: "Wailing Banshee",
  ascii: "😱",
  maxHp: 10,
  speedTier: "medium",
  loot: 14,
  isBoss: false,
  incorporeal: true,
  defaultArmor: 0,
  resistances: { slash: 0.5, pierce: 0.5, bludgeoning: 0.5 },
  vulnerabilities: { holy: 1.5 },
  abilities: [bansheeWail, bansheeCorruptedHymn, bansheeDirge],
  passives: [{ type: "incorporeal_resistance" }, { type: "immune_to_push" }],
  selectActions(self, ctx): readonly LineTelegraph[] {
    // Hymn every 3 turns
    if (ctx.turn % 3 === 0) {
      return [
        makeTelegraph(
          self,
          bansheeCorruptedHymn,
          Array.from({ length: ctx.slots.length }, (_, i) => i),
        ),
      ];
    }
    // Dirge every other turn
    if (ctx.turn % 2 === 1) {
      const targetSlot = ctx.player.position;
      return [makeTelegraph(self, bansheeDirge, [targetSlot])];
    }
    return [makeTelegraph(self, bansheeWail, affectedSlotsForward(self, ctx, 1, 4))];
  },
};

// ─── NECROMANCER ───

const necDarkBolt: LineAbility = {
  id: "nec_dark_bolt",
  name: "Dark Bolt",
  icon: "⚡",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "reach", minDist: 1, maxDist: 6 },
  damage: 6,
  damageType: "fire",
  reposition: null,
  conditions: [],
  special: [],
  silenceBlocked: true,
  isReaction: false,
};

const necRaiseDead: LineAbility = {
  id: "nec_raise_dead",
  name: "Raise Dead",
  icon: "☠️",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "reach", minDist: 1, maxDist: 8 },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "raise_dead", hpFraction: 0.5 }],
  silenceBlocked: true,
  isReaction: false,
};

const necCommand: LineAbility = {
  id: "nec_command",
  name: "Command",
  icon: "🖐️",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "reach", minDist: 1, maxDist: 6 },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "command_ally_extra_action" }],
  silenceBlocked: true,
  isReaction: false,
};

export const NECROMANCER_DEF: LineEnemyTypeDef = {
  id: "necromancer",
  name: "Necromancer",
  ascii: "🧙",
  maxHp: 7,
  speedTier: "medium",
  loot: 25,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  resistances: {},
  vulnerabilities: {},
  abilities: [necDarkBolt, necRaiseDead, necCommand],
  passives: [{ type: "bone_shield_while_minions", armor: 3 }],
  selectActions(self, ctx): readonly LineTelegraph[] {
    const d = dist(self, ctx);
    // Flee if player is close
    if (d <= 2) {
      return moveAwayFromPlayer(self, ctx, "🧙");
    }
    // Raise dead if corpse exists
    if (ctx.turn % 2 === 0 && ctx.corpses.length > 0) {
      const nearestCorpse = ctx.corpses.reduce((best, c) =>
        Math.abs(c.position - self.position) < Math.abs(best.position - self.position) ? c : best,
      );
      return [makeTelegraph(self, necRaiseDead, [nearestCorpse.position])];
    }
    // Command nearest ally every 3 turns
    if (ctx.turn % 3 === 0) {
      const ally = ctx.enemies.find((e) => e.uid !== self.uid && e.hp > 0);
      if (ally) {
        return [makeTelegraph(self, necCommand, [ally.position])];
      }
    }
    return [makeTelegraph(self, necDarkBolt, [ctx.player.position])];
  },
};

// ─── LURKING GHOUL ───

const ghoulPounce: LineAbility = {
  id: "ghoul_pounce",
  name: "Pounce",
  icon: "🦁",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "reach", minDist: 2, maxDist: 4 },
  damage: 10,
  damageType: "pierce",
  reposition: null,
  conditions: [{ condition: "immobilized", stacks: 1 }],
  special: [{ type: "teleport_to_adjacent_target" }],
  silenceBlocked: false,
  isReaction: false,
};

const ghoulSlash: LineAbility = {
  id: "ghoul_slash",
  name: "Slash",
  icon: "🦷",
  apCost: 0,
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

const ghoulRetreat: LineAbility = {
  id: "ghoul_retreat",
  name: "Retreat",
  icon: "💨",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self" },
  damage: 0,
  damageType: null,
  reposition: { type: "push_self", distance: 3 },
  conditions: [{ condition: "hidden", stacks: 2 }],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

export const GHOUL_DEF: LineEnemyTypeDef = {
  id: "ghoul",
  name: "Lurking Ghoul",
  ascii: "🦁",
  maxHp: 12,
  speedTier: "fast",
  loot: 12,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  resistances: {},
  vulnerabilities: {},
  abilities: [ghoulPounce, ghoulSlash, ghoulRetreat],
  passives: [{ type: "hidden_in_dark" }, { type: "ambush_predator", bonusDamage: 3 }],
  selectActions(self, ctx): readonly LineTelegraph[] {
    const d = dist(self, ctx);
    const isHidden = (self.conditions.hidden ?? 0) > 0;

    if (isHidden && d >= 2 && d <= 4) {
      return [makeTelegraph(self, ghoulPounce, [ctx.player.position])];
    }
    if (d <= 1) {
      return [makeTelegraph(self, ghoulSlash, [ctx.player.position])];
    }
    if (!isHidden && ctx.turn % 3 === 0) {
      const retreatSlot = self.position + dirAway(self, ctx) * 3;
      return [
        makeTelegraph(
          self,
          ghoulRetreat,
          [self.position],
          Math.max(0, Math.min(ctx.slots.length - 1, retreatSlot)),
        ),
      ];
    }
    return moveTowardPlayer(self, ctx, "🦁");
  },
};

// ─── THE SHADOW ───

const shadowStrike: LineAbility = {
  id: "shadow_strike",
  name: "Shadow Strike",
  icon: "🌑",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "adjacent_forward" },
  damage: 8,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "teleport_self", targetType: "away_from_player" }],
  silenceBlocked: false,
  isReaction: false,
};

const shadowSpreadDarkness: LineAbility = {
  id: "shadow_spread_darkness",
  name: "Spread Darkness",
  icon: "🌚",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self_burst", radius: 1 },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "apply_dark_zone", slotsFromSelf: 0, width: 3, turns: 3 }],
  silenceBlocked: false,
  isReaction: false,
};

const shadowStep: LineAbility = {
  id: "shadow_step",
  name: "Shadow Step",
  icon: "👤",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self" },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "teleport_self", targetType: "dark_zone" }],
  silenceBlocked: false,
  isReaction: false,
};

export const SHADOW_DEF: LineEnemyTypeDef = {
  id: "shadow",
  name: "The Shadow",
  ascii: "🌑",
  maxHp: 14,
  speedTier: "medium",
  loot: 15,
  isBoss: false,
  incorporeal: true,
  defaultArmor: 0,
  resistances: { slash: 0.5, pierce: 0.5, bludgeoning: 0.5 },
  vulnerabilities: { holy: 1.5 },
  abilities: [shadowStrike, shadowSpreadDarkness, shadowStep],
  passives: [
    { type: "dark_empowered", bonusDamage: 3, bonusArmor: 2 },
    { type: "incorporeal_resistance" },
  ],
  selectActions(self, ctx): readonly LineTelegraph[] {
    const d = dist(self, ctx);
    // Spread darkness every 3 turns
    if (ctx.turn % 3 === 0) {
      return [
        makeTelegraph(
          self,
          shadowSpreadDarkness,
          [self.position - 1, self.position, self.position + 1].filter(
            (s) => s >= 0 && s < ctx.slots.length,
          ),
        ),
      ];
    }
    // Shadow step to a dark zone slot if not adjacent
    const darkSlots = ctx.slots.map((s, i) => ({ s, i })).filter(({ s }) => s.type === "dark_zone");
    if (d > 1 && darkSlots.length > 0) {
      const bestDark = darkSlots.reduce((best, cur) =>
        Math.abs(cur.i - ctx.player.position) < Math.abs(best.i - ctx.player.position) ? cur : best,
      );
      return [makeTelegraph(self, shadowStep, [bestDark.i], bestDark.i)];
    }
    if (d <= 1) {
      return [makeTelegraph(self, shadowStrike, [ctx.player.position])];
    }
    return moveTowardPlayer(self, ctx, "🌑");
  },
};

// ─── THE FORSWORN ───

const forswornStrike: LineAbility = {
  id: "forsworn_strike",
  name: "Oathbreaker's Strike",
  icon: "⛓️",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "adjacent_forward" },
  damage: 4,
  damageType: "bludgeoning",
  reposition: { type: "push_target", distance: 1 },
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const forswornWard: LineAbility = {
  id: "forsworn_ward",
  name: "Perjured Ward",
  icon: "🛡️",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self" },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "gain_armor", amount: 2, turns: 2 }],
  silenceBlocked: false,
  isReaction: false,
};

const forswornIntercept: LineAbility = {
  id: "forsworn_intercept",
  name: "Compelled Intercept",
  icon: "🚧",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self" },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "intercept_for_allies" }],
  silenceBlocked: false,
  isReaction: false,
};

export const FORSWORN_DEF: LineEnemyTypeDef = {
  id: "forsworn",
  name: "The Forsworn",
  ascii: "⛓️",
  maxHp: 22,
  speedTier: "slow",
  loot: 14,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 2,
  resistances: { slash: 0.5, pierce: 0.5 },
  vulnerabilities: { bludgeoning: 1.5, holy: 1.5 },
  abilities: [forswornStrike, forswornWard, forswornIntercept],
  passives: [{ type: "perjured_aura", armorBonus: 2 }, { type: "immune_to_push" }],
  selectActions(self, ctx): readonly LineTelegraph[] {
    const d = dist(self, ctx);
    // Intercept whenever there's a vulnerable backline ally the player could snipe past Forsworn
    const backlineAlly = ctx.enemies.find((e) => e.uid !== self.uid && e.hp > 0);
    if (backlineAlly) {
      return [makeTelegraph(self, forswornIntercept, [self.position])];
    }
    if (d <= 1) {
      return [makeTelegraph(self, forswornStrike, [ctx.player.position])];
    }
    if (ctx.turn % 2 === 1) {
      return [makeTelegraph(self, forswornWard, [self.position])];
    }
    return moveTowardPlayer(self, ctx, "⛓️");
  },
};

// ─── FALSE SACRARIUM ───

const sacLitany: LineAbility = {
  id: "sac_litany",
  name: "Putrid Litany",
  icon: "☣️",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self_burst", radius: 2 },
  damage: 3,
  damageType: "bludgeoning",
  reposition: null,
  conditions: [{ condition: "poisoned", stacks: 2 }],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const sacGrowth: LineAbility = {
  id: "sac_growth",
  name: "Suppurating Growth",
  icon: "🌿",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self" },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [
    { type: "create_terrain_aoe", terrain: { type: "rot", turnsRemaining: 99 }, radius: 1 },
  ],
  silenceBlocked: false,
  isReaction: false,
};

const sacPulse: LineAbility = {
  id: "sac_pulse",
  name: "Sacral Pulse",
  icon: "💚",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self" },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "teleport_self", targetType: "rot" }],
  silenceBlocked: false,
  isReaction: false,
};

const sacSpawn: LineAbility = {
  id: "sac_spawn",
  name: "Spawn Faithful",
  icon: "🐛",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self" },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "summon", enemyId: "gutborn_larva", atSlotOffset: 1 }],
  silenceBlocked: false,
  isReaction: false,
};

export const FALSE_SACRARIUM_DEF: LineEnemyTypeDef = {
  id: "false_sacrarium",
  name: "False Sacrarium",
  ascii: "☣️",
  maxHp: 12,
  speedTier: "slow",
  loot: 12,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  resistances: { slash: 0.5, pierce: 0.5 },
  vulnerabilities: { holy: 1.5, fire: 1.5 },
  abilities: [sacLitany, sacGrowth, sacPulse, sacSpawn],
  passives: [{ type: "ever_growing", hpPerTurn: 1 }],
  selectActions(self, ctx): readonly LineTelegraph[] {
    const d = dist(self, ctx);
    // Spawn every N turns
    if (ctx.turn % 4 === 0) {
      return [makeTelegraph(self, sacSpawn, [self.position])];
    }
    // Growth every other turn
    if (ctx.turn % 2 === 1) {
      return [
        makeTelegraph(
          self,
          sacGrowth,
          [self.position - 1, self.position + 1].filter((s) => s >= 0 && s < ctx.slots.length),
        ),
      ];
    }
    if (d <= 2) {
      return [
        makeTelegraph(
          self,
          sacLitany,
          [
            self.position - 2,
            self.position - 1,
            self.position,
            self.position + 1,
            self.position + 2,
          ].filter((s) => s >= 0 && s < ctx.slots.length),
        ),
      ];
    }
    // Teleport to rot if possible
    const rotSlot = ctx.slots.findIndex((s) => s.type === "rot");
    if (rotSlot >= 0 && rotSlot !== self.position) {
      return [makeTelegraph(self, sacPulse, [self.position], rotSlot)];
    }
    return [];
  },
};

// ─── SALT REVENANT ───

const revenantGrapple: LineAbility = {
  id: "revenant_grapple",
  name: "Grapple",
  icon: "🧂",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "adjacent_forward" },
  damage: 5,
  damageType: "bludgeoning",
  reposition: { type: "pull_self", distance: 1 },
  conditions: [{ condition: "immobilized", stacks: 2 }],
  special: [{ type: "immobilize_both" }],
  silenceBlocked: false,
  isReaction: false,
};

const revenantWeep: LineAbility = {
  id: "revenant_weep",
  name: "Weep",
  icon: "💧",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self_burst", radius: 1 },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [{ condition: "stunned", stacks: 1 }],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const revenantCrush: LineAbility = {
  id: "revenant_salt_crush",
  name: "Salt Crush",
  icon: "💥",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "adjacent_forward" },
  damage: 12,
  damageType: "bludgeoning",
  reposition: null,
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

export const SALT_REVENANT_DEF: LineEnemyTypeDef = {
  id: "salt_revenant",
  name: "Salt Revenant",
  ascii: "🧂",
  maxHp: 20,
  speedTier: "medium",
  loot: 20,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  resistances: { pierce: 0.5 },
  vulnerabilities: { bludgeoning: 1.5 },
  abilities: [revenantGrapple, revenantWeep, revenantCrush],
  passives: [],
  selectActions(self, ctx): readonly LineTelegraph[] {
    const d = dist(self, ctx);
    const highHp = self.hp > self.maxHp / 2;

    if (d > 1) {
      return moveTowardPlayer(self, ctx, "🧂");
    }
    if (highHp) {
      return [makeTelegraph(self, revenantGrapple, [ctx.player.position])];
    }
    // Low HP phase: Weep → Salt Crush alternating
    if (ctx.turn % 2 === 0) {
      return [
        makeTelegraph(
          self,
          revenantWeep,
          [self.position - 1, self.position, self.position + 1].filter(
            (s) => s >= 0 && s < ctx.slots.length,
          ),
        ),
      ];
    }
    return [makeTelegraph(self, revenantCrush, [ctx.player.position])];
  },
  onDeath(self): readonly LineDeathEffect[] {
    return [
      { type: "explode", position: self.position, radius: 2, damage: 5 },
      { type: "create_salt_deposit", position: self.position },
    ];
  },
};

// ─── GRAVE ROBBER ───

const robberPilfer: LineAbility = {
  id: "robber_pilfer",
  name: "Pilfer",
  icon: "💰",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "adjacent_forward" },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "steal_salt", amount: 15 }],
  silenceBlocked: false,
  isReaction: false,
};

const robberSmokeBomb: LineAbility = {
  id: "robber_smoke_bomb",
  name: "Smoke Bomb",
  icon: "💨",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self" },
  damage: 0,
  damageType: null,
  reposition: { type: "push_self", distance: 2 },
  conditions: [],
  special: [
    { type: "create_terrain_aoe", terrain: { type: "smoke", turnsRemaining: 2 }, radius: 1 },
  ],
  silenceBlocked: false,
  isReaction: false,
};

const robberCaltrops: LineAbility = {
  id: "robber_caltrops",
  name: "Drop Caltrops",
  icon: "⭐",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self" },
  damage: 0,
  damageType: null,
  reposition: { type: "push_self", distance: 1 },
  conditions: [],
  special: [
    {
      type: "create_terrain",
      terrain: { type: "hazard", turnsRemaining: 5, damage: 2 },
      slotOffset: 0,
    },
  ],
  silenceBlocked: false,
  isReaction: false,
};

export const GRAVE_ROBBER_DEF: LineEnemyTypeDef = {
  id: "grave_robber",
  name: "Grave Robber",
  ascii: "💰",
  maxHp: 8,
  speedTier: "fast",
  loot: 20,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  resistances: {},
  vulnerabilities: {},
  abilities: [robberPilfer, robberSmokeBomb, robberCaltrops],
  passives: [{ type: "fleeing" }],
  selectActions(self, ctx): readonly LineTelegraph[] {
    const d = dist(self, ctx);
    if (d <= 1) {
      return [makeTelegraph(self, robberPilfer, [ctx.player.position])];
    }
    if (d <= 3 && ctx.turn % 2 === 0) {
      return [
        makeTelegraph(
          self,
          robberSmokeBomb,
          [self.position - 1, self.position, self.position + 1].filter(
            (s) => s >= 0 && s < ctx.slots.length,
          ),
        ),
      ];
    }
    if (d <= 2) {
      return [makeTelegraph(self, robberCaltrops, [self.position])];
    }
    return moveAwayFromPlayer(self, ctx, "💰");
  },
};

// ─── GUTBORN LARVA ───

export const GUTBORN_LARVA_DEF: LineEnemyTypeDef = {
  id: "gutborn_larva",
  name: "Gutborn Larva",
  ascii: "🐛",
  maxHp: 1,
  speedTier: "slow",
  loot: 2,
  isBoss: false,
  incorporeal: false,
  defaultArmor: 0,
  resistances: {},
  vulnerabilities: {},
  abilities: [],
  passives: [{ type: "metamorphosis", turns: 2, transformInto: "ghoul" }],
  selectActions(): readonly LineTelegraph[] {
    return [];
  },
  onDeath(self): readonly LineDeathEffect[] {
    return [{ type: "infected_adjacent", position: self.position, turns: 2 }];
  },
};

// ─── BOSS: SKELETON LORD ───

const lordBoneStorm: LineAbility = {
  id: "lord_bone_storm",
  name: "Bone Storm",
  icon: "🌀",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "sweep", minDist: 1, maxDist: 4 },
  damage: 7,
  damageType: "bludgeoning",
  reposition: null,
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const lordRallyBones: LineAbility = {
  id: "lord_rally_bones",
  name: "Rally Bones",
  icon: "💀",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self" },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "summon", enemyId: "skeleton", atSlotOffset: -3 }],
  silenceBlocked: false,
  isReaction: false,
};

const lordBonePillar: LineAbility = {
  id: "lord_bone_pillar",
  name: "Bone Pillar",
  icon: "🏛️",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "reach", minDist: 2, maxDist: 5 },
  damage: 4,
  damageType: "pierce",
  reposition: null,
  conditions: [],
  special: [{ type: "create_terrain", terrain: { type: "wall_pillar" }, slotOffset: 0 }],
  silenceBlocked: false,
  isReaction: false,
};

const lordCrushingAdvance: LineAbility = {
  id: "lord_crushing_advance",
  name: "Crushing Advance",
  icon: "💢",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "pierce", minDist: 1, maxDist: 3 },
  damage: 10,
  damageType: "bludgeoning",
  reposition: { type: "push_all_in_range", distance: 1 },
  conditions: [],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const lordBoneCage: LineAbility = {
  id: "lord_bone_cage",
  name: "Bone Cage",
  icon: "🔒",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "adjacent_forward" },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [{ condition: "immobilized", stacks: 2 }],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

export const SKELETON_LORD_DEF: LineEnemyTypeDef = {
  id: "boss_skeleton_lord",
  name: "Skeleton Lord",
  ascii: "💀👑",
  maxHp: 50,
  speedTier: "medium",
  loot: 40,
  isBoss: true,
  incorporeal: false,
  defaultArmor: 2,
  resistances: { pierce: 0.75 },
  vulnerabilities: { bludgeoning: 1.25 },
  abilities: [lordBoneStorm, lordRallyBones, lordBonePillar, lordCrushingAdvance, lordBoneCage],
  passives: [],
  selectActions(self, ctx): readonly LineTelegraph[] {
    const d = dist(self, ctx);
    const phase = self.hp > self.maxHp / 2 ? 1 : 2;

    if (phase === 1) {
      if (ctx.turn % 2 === 0) {
        return [makeTelegraph(self, lordRallyBones, [self.position])];
      }
      if (ctx.turn % 3 === 0) {
        return [makeTelegraph(self, lordBonePillar, [ctx.player.position - 2])];
      }
      return [makeTelegraph(self, lordBoneStorm, affectedSlotsForward(self, ctx, 1, 4))];
    }

    // Phase 2
    if (ctx.turn % 3 === 0) {
      return [makeTelegraph(self, lordBoneCage, [ctx.player.position])];
    }
    if (d <= 3) {
      return [makeTelegraph(self, lordCrushingAdvance, affectedSlotsForward(self, ctx, 1, 3))];
    }
    return moveTowardPlayer(self, ctx, "💀👑");
  },
};

// ─── BOSS: VAMPIRE LORD ───

const vampDrainLife: LineAbility = {
  id: "vamp_drain_life",
  name: "Drain Life",
  icon: "🩸",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "reach", minDist: 2, maxDist: 5 },
  damage: 7,
  damageType: "pierce",
  reposition: null,
  conditions: [],
  special: [{ type: "lifesteal", fraction: 1.0 }],
  silenceBlocked: false,
  isReaction: false,
};

const vampEclipse: LineAbility = {
  id: "vamp_eclipse",
  name: "Eclipse",
  icon: "🌑",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "full_line" },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "eclipse", turns: 2 }],
  silenceBlocked: false,
  isReaction: false,
};

const vampBloodRush: LineAbility = {
  id: "vamp_blood_rush",
  name: "Blood Rush",
  icon: "💢",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self_burst", radius: 1 },
  damage: 9,
  damageType: "fire",
  reposition: null,
  conditions: [{ condition: "burning", stacks: 2 }],
  special: [{ type: "teleport_to_adjacent_target" }],
  silenceBlocked: false,
  isReaction: false,
};

const vampMistForm: LineAbility = {
  id: "vamp_mist_form",
  name: "Mist Form",
  icon: "🌫️",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "self" },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "mist_form", turns: 2 }],
  silenceBlocked: false,
  isReaction: false,
};

export const VAMPIRE_LORD_DEF: LineEnemyTypeDef = {
  id: "boss_vampire_lord",
  name: "Vampire Lord",
  ascii: "🧛",
  maxHp: 55,
  speedTier: "fast",
  loot: 60,
  isBoss: true,
  incorporeal: false,
  defaultArmor: 0,
  resistances: {},
  vulnerabilities: { holy: 2.0 },
  abilities: [vampDrainLife, vampEclipse, vampBloodRush, vampMistForm],
  passives: [
    { type: "lifesteal", fraction: 0.5 },
    { type: "shadow_cloak_in_dark", damageReduction: 0.5 },
    { type: "feast_heal_on_adjacent_kill" },
  ],
  selectActions(self, ctx): readonly LineTelegraph[] {
    const phase = self.hp > self.maxHp / 2 ? 1 : 2;

    if (phase === 1) {
      if (ctx.turn % 3 === 0) {
        return [
          makeTelegraph(
            self,
            vampEclipse,
            Array.from({ length: ctx.slots.length }, (_, i) => i),
          ),
        ];
      }
      return [makeTelegraph(self, vampDrainLife, [ctx.player.position])];
    }

    // Phase 2
    if (ctx.turn % 4 === 0) {
      return [makeTelegraph(self, vampMistForm, [self.position])];
    }
    if (self.mistFormTurns > 0) {
      return []; // invulnerable, skip
    }
    return [
      makeTelegraph(
        self,
        vampBloodRush,
        [self.position - 1, self.position, self.position + 1].filter(
          (s) => s >= 0 && s < ctx.slots.length,
        ),
      ),
    ];
  },
};

// ─── BOSS: THE LICH KING ───

const lichDarkBolt: LineAbility = {
  id: "lich_dark_bolt",
  name: "Dark Bolt",
  icon: "⚡",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "reach", minDist: 1, maxDist: 8 },
  damage: 10,
  damageType: "fire",
  reposition: null,
  conditions: [{ condition: "burning", stacks: 1 }],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

const lichMassRaise: LineAbility = {
  id: "lich_mass_raise",
  name: "Mass Raise",
  icon: "☠️☠️",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "full_line" },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "mass_raise_dead", hpFraction: 0.3 }],
  silenceBlocked: false,
  isReaction: false,
};

const lichSoulDrain: LineAbility = {
  id: "lich_soul_drain",
  name: "Soul Drain",
  icon: "💀",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "full_line" },
  damage: 4,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "drain_ap", amount: 2 }],
  silenceBlocked: false,
  isReaction: false,
};

const lichBarrierBreach: LineAbility = {
  id: "lich_barrier_breach",
  name: "Barrier Breach",
  icon: "🔓",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "sweep", minDist: 1, maxDist: 4 },
  damage: 0,
  damageType: null,
  reposition: null,
  conditions: [],
  special: [{ type: "barrier_breach" }],
  silenceBlocked: false,
  isReaction: false,
};

const lichGambit: LineAbility = {
  id: "lich_gambit",
  name: "Lich's Gambit",
  icon: "💀⚡",
  apCost: 0,
  cooldown: 0,
  pattern: { type: "full_line" },
  damage: 10,
  damageType: null,
  reposition: null,
  conditions: [{ condition: "stunned", stacks: 1 }],
  special: [],
  silenceBlocked: false,
  isReaction: false,
};

export const LICH_KING_DEF: LineEnemyTypeDef = {
  id: "boss_lich",
  name: "The Lich King",
  ascii: "💀👑",
  maxHp: 70,
  speedTier: "medium",
  loot: 80,
  isBoss: true,
  incorporeal: false,
  defaultArmor: 0,
  resistances: {},
  vulnerabilities: { holy: 1.5 },
  abilities: [lichDarkBolt, lichMassRaise, lichSoulDrain, lichBarrierBreach, lichGambit],
  passives: [{ type: "shield_of_will_while_minions_live", armor: 5 }],
  selectActions(self, ctx): readonly LineTelegraph[] {
    const hpPct = self.hp / self.maxHp;
    const allSlots = Array.from({ length: ctx.slots.length }, (_, i) => i);

    if (hpPct > 0.66) {
      // Phase 1
      if (ctx.turn % 2 === 0 && ctx.corpses.length > 0) {
        return [makeTelegraph(self, lichMassRaise, allSlots)];
      }
      return [makeTelegraph(self, lichDarkBolt, [ctx.player.position])];
    }

    if (hpPct > 0.33) {
      // Phase 2
      if (ctx.turn % 3 === 0) {
        return [makeTelegraph(self, lichGambit, allSlots)];
      }
      if (ctx.turn % 2 === 0) {
        return [makeTelegraph(self, lichBarrierBreach, affectedSlotsForward(self, ctx, 1, 4))];
      }
      return [makeTelegraph(self, lichSoulDrain, allSlots)];
    }

    // Phase 3
    if (ctx.turn % 2 === 0) {
      return [makeTelegraph(self, lichMassRaise, allSlots)]; // every turn in phase 3
    }
    return [makeTelegraph(self, lichGambit, allSlots)];
  },
};

// ─── Registry ───

export const LINE_ENEMY_DEFS: Record<string, LineEnemyTypeDef> = {
  rat: RAT_DEF,
  skeleton: SKELETON_DEF,
  heap_of_bones: HEAP_OF_BONES_DEF,
  zombie: ZOMBIE_DEF,
  ghost: GHOST_DEF,
  banshee: BANSHEE_DEF,
  necromancer: NECROMANCER_DEF,
  ghoul: GHOUL_DEF,
  shadow: SHADOW_DEF,
  forsworn: FORSWORN_DEF,
  false_sacrarium: FALSE_SACRARIUM_DEF,
  salt_revenant: SALT_REVENANT_DEF,
  grave_robber: GRAVE_ROBBER_DEF,
  gutborn_larva: GUTBORN_LARVA_DEF,
  boss_skeleton_lord: SKELETON_LORD_DEF,
  boss_vampire_lord: VAMPIRE_LORD_DEF,
  boss_lich: LICH_KING_DEF,
};

export function getLineEnemyDef(id: string): LineEnemyTypeDef {
  const def = LINE_ENEMY_DEFS[id];
  if (!def) throw new Error(`Unknown line enemy id: ${id}`);
  return def;
}

let uidCounter = 0;

export function makeLineEnemy(id: string, position: number): import("./types").LineEnemyState {
  const def = getLineEnemyDef(id);
  return {
    uid: `${id}_${++uidCounter}`,
    id,
    position,
    hp: def.maxHp,
    maxHp: def.maxHp,
    armor: def.defaultArmor,
    conditions: {},
    passives: def.passives,
    resistances: def.resistances,
    vulnerabilities: def.vulnerabilities,
    speedTier: def.speedTier,
    countdownTimer: null,
    countdownTarget: null,
    mistFormTurns: 0,
    darkZoneBonus: false,
    commandedExtraAction: false,
    dirgeZoneActive: false,
  };
}
