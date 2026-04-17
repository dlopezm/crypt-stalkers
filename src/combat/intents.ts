import {
  WEAKEN_DMG_MULT,
  ZOMBIE_EMPOWERED_ATK_MULT,
  NECRO_SUMMON_COOLDOWN,
  SHADOW_DARKNESS_DAMAGE,
  SALT_REVENANT_HP_THRESHOLD,
} from "../data/constants";
import type { MonsterIntent, Enemy, CombatContext } from "../types";

/* ── Reusable intent constructors ── */

export const INTENTS = {
  attack: (damage: number): MonsterIntent => ({
    id: "attack",
    label: "Attack",
    icon: "⚔️",
    damage,
  }),
  empoweredAttack: (damage: number): MonsterIntent => ({
    id: "empowered_attack",
    label: "Empowered Attack",
    icon: "⚔️",
    damage,
    tooltip: "Strengthened by Necromancer",
  }),
  wail: (): MonsterIntent => ({
    id: "wail",
    label: "Wail",
    icon: "👁️",
    tooltip: "Applies Weaken to you",
  }),
  drainLight: (): MonsterIntent => ({
    id: "drain_light",
    label: "Drain Light",
    icon: "🌑",
    tooltip: "Reduces light level by 1",
  }),
  raiseDead: (targetName: string): MonsterIntent => ({
    id: "raise_dead",
    label: `Raise ${targetName}`,
    icon: "💀",
    tooltip: "Resurrects a fallen enemy",
  }),
  summonZombie: (): MonsterIntent => ({
    id: "summon",
    label: "Summon Zombie",
    icon: "🧟",
    tooltip: "Calls a new zombie",
  }),
  ambush: (damage: number): MonsterIntent => ({
    id: "ambush",
    label: "Ambush",
    icon: "💥",
    damage,
    tooltip: "Devastating strike from hiding",
  }),
  hidden: (): MonsterIntent => ({
    id: "hidden",
    label: "???",
    icon: "❓",
    tooltip: "Something lurks unseen...",
  }),
  hide: (): MonsterIntent => ({
    id: "hide",
    label: "Hide",
    icon: "🌑",
    tooltip: "Retreating into shadows",
  }),
  retreat: (): MonsterIntent => ({
    id: "retreat",
    label: "Retreat",
    icon: "🔙",
    tooltip: "Moving to back row",
  }),
  reassemble: (): MonsterIntent => ({
    id: "reassemble",
    label: "Reassembling...",
    icon: "🦴",
    tooltip: "Bones knitting back together",
  }),
  countdown: (turns: number): MonsterIntent => ({
    id: "countdown",
    label: `Reforming (${turns})`,
    icon: "💀",
    tooltip: `Skeleton returns in ${turns} turn(s)`,
  }),
  idle: (): MonsterIntent => ({
    id: "idle",
    label: "Idle",
    icon: "💤",
    tooltip: "No action this turn",
  }),
  flee: (): MonsterIntent => ({
    id: "flee",
    label: "Flee",
    icon: "🏃",
    tooltip: "Trying to escape",
  }),
  lifestealAttack: (damage: number): MonsterIntent => ({
    id: "lifesteal",
    label: "Drain",
    icon: "🧛",
    damage,
    tooltip: "Attacks and heals from your blood",
  }),
  dormant: (): MonsterIntent => ({
    id: "dormant",
    label: "Dormant",
    icon: "😶",
    tooltip: "Won't act unless disturbed",
  }),
  shamble: (): MonsterIntent => ({
    id: "shamble",
    label: "Shamble",
    icon: "🧟",
    tooltip: "Sluggish - skipping turn",
  }),
  consume: (damage: number): MonsterIntent => ({
    id: "consume",
    label: "Consume",
    icon: "🌑",
    damage,
    tooltip: "Feeds in total darkness",
  }),
  perjuredWard: (): MonsterIntent => ({
    id: "perjured_ward",
    label: "Perjured Ward",
    icon: "⚔️",
    tooltip: "Broken oath still compels protection",
  }),
  putridLitany: (): MonsterIntent => ({
    id: "putrid_litany",
    label: "Putrid Litany",
    icon: "⛪",
    tooltip: "Corruption spreads from the false altar",
  }),
  grapple: (damage: number): MonsterIntent => ({
    id: "grapple",
    label: "Grapple",
    icon: "🤝",
    damage,
    tooltip: "Crystalline arms dig in, causing bleeding",
  }),
  weep: (): MonsterIntent => ({
    id: "weep",
    label: "Weep",
    icon: "💎",
    tooltip: "Salt tears freeze you in place",
  }),
  wailAttack: (damage: number, weakenStacks: number): MonsterIntent => ({
    id: "wail_attack",
    label: "Wail + Attack",
    icon: "👁️",
    damage,
    tooltip: `Weaken ×${weakenStacks} then attacks`,
  }),
  raiseDeadAttack: (targetName: string, damage: number): MonsterIntent => ({
    id: "raise_dead_attack",
    label: `Raise ${targetName} + Attack`,
    icon: "💀",
    damage,
    tooltip: `Raises ${targetName}, then attacks`,
  }),
  summonZombieAttack: (damage: number): MonsterIntent => ({
    id: "summon_attack",
    label: "Summon + Attack",
    icon: "🧟",
    damage,
    tooltip: "Summons a zombie, then attacks",
  }),
} as const;

/* ── Per-monster intent selection ── */

function effectiveAtk(enemy: Enemy): number {
  let atk = enemy.atk;
  if ((enemy.statuses?.weaken || 0) > 0) {
    atk = Math.floor(atk * WEAKEN_DMG_MULT);
  }
  return atk;
}

export function selectRatIntent(self: Enemy): MonsterIntent {
  return INTENTS.attack(effectiveAtk(self));
}

export function selectSkeletonIntent(self: Enemy): MonsterIntent {
  return INTENTS.attack(effectiveAtk(self));
}

export function selectHeapIntent(self: Enemy): MonsterIntent {
  const cdAfterTick = Math.max(0, (self.summonCooldown ?? 0) - 1);
  if (cdAfterTick > 0) {
    return INTENTS.countdown(cdAfterTick);
  }
  return INTENTS.reassemble();
}

export function selectZombieIntent(self: Enemy, ctx: CombatContext): MonsterIntent {
  const necroAlive = ctx.enemies.some((e) => e.id === "necromancer" && e.hp > 0);
  if (necroAlive) {
    return INTENTS.empoweredAttack(Math.floor(self.atk * ZOMBIE_EMPOWERED_ATK_MULT));
  }
  return INTENTS.attack(effectiveAtk(self));
}

export function selectGhostIntent(self: Enemy): MonsterIntent {
  return INTENTS.attack(effectiveAtk(self));
}

export function selectBansheeIntent(self: Enemy, ctx: CombatContext): MonsterIntent {
  if ((self.statuses?.silence || 0) > 0) {
    return INTENTS.attack(effectiveAtk(self));
  }
  const weakenStacks = (ctx.player.statuses.weaken || 0) + 1;
  return INTENTS.wailAttack(effectiveAtk(self), weakenStacks);
}

export function selectNecromancerIntent(self: Enemy, ctx: CombatContext): MonsterIntent {
  const cooldown = (self.summonCooldown || NECRO_SUMMON_COOLDOWN) - 1;
  if (cooldown > 0) {
    return INTENTS.attack(effectiveAtk(self));
  }

  const dead = ctx.enemies.find((e) => e.hp <= 0 && e.id !== "necromancer" && e.id !== "boss_lich");
  if (dead) {
    return INTENTS.raiseDeadAttack(dead.name, effectiveAtk(self));
  }
  return INTENTS.summonZombieAttack(effectiveAtk(self));
}

export function selectGhoulIntent(self: Enemy): MonsterIntent {
  if (self.hidden) {
    return INTENTS.hidden();
  }
  if (self.row === "front") {
    return INTENTS.retreat();
  }
  return INTENTS.hide();
}

export function selectShadowIntent(_self: Enemy, ctx: CombatContext): MonsterIntent {
  if (ctx.lightLevel.value <= 1) {
    return INTENTS.consume(SHADOW_DARKNESS_DAMAGE);
  }
  return INTENTS.drainLight();
}

export function selectVampireIntent(self: Enemy): MonsterIntent {
  return INTENTS.lifestealAttack(effectiveAtk(self));
}

export function selectGraveRobberIntent(): MonsterIntent {
  return INTENTS.flee();
}

export function selectGutbornLarvaIntent(): MonsterIntent {
  return INTENTS.idle();
}

export function selectLichIntent(self: Enemy, ctx: CombatContext): MonsterIntent {
  const dead = ctx.enemies.find((e) => e.hp <= 0 && e.id !== "boss_lich");
  if (dead) {
    return INTENTS.raiseDead(dead.name);
  }
  return INTENTS.attack(effectiveAtk(self));
}

/* ── New monster intents ── */

export function selectForswornIntent(self: Enemy, ctx: CombatContext): MonsterIntent {
  const backRowAllies = ctx.enemies.filter(
    (e) => e.hp > 0 && e.row === "back" && e.uid !== self.uid,
  );
  if (backRowAllies.length > 0) {
    return INTENTS.perjuredWard();
  }
  return INTENTS.attack(effectiveAtk(self));
}

export function selectFalseSacrariumIntent(_self: Enemy, _ctx: CombatContext): MonsterIntent {
  return INTENTS.putridLitany();
}

export function selectSaltRevenantIntent(self: Enemy, ctx: CombatContext): MonsterIntent {
  if (ctx.player.hp > ctx.player.maxHp * SALT_REVENANT_HP_THRESHOLD) {
    return INTENTS.grapple(effectiveAtk(self));
  }
  return INTENTS.weep();
}

/**
 * Fallback: produce a generic attack intent from atk stat.
 * Used when a monster type doesn't define selectIntent.
 */
export function defaultSelectIntent(self: Enemy): MonsterIntent {
  if (self.atk === 0) return INTENTS.idle();
  if ((self.statuses?.stun || 0) > 0) {
    return { id: "stunned", label: "Stunned", icon: "⚡", tooltip: "Cannot act" };
  }
  return INTENTS.attack(effectiveAtk(self));
}
