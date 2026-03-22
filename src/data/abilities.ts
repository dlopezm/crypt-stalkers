import type { Ability, Action, ActionContext, Consumable, Player } from "../types";
import {
  WEAKEN_DMG_MULT,
  BLIND_MISS_CHANCE,
  QUICK_STRIKE_DAMAGE_MULT,
  CHARGING_BLOW_MULTIPLIER,
  SHIELD_BLOCK_REDUCTION,
  FLEE_CHANCE,
} from "./constants";

/* ── Helper: compute weapon damage with weaken debuff ── */
function weaponDmg(ctx: ActionContext): number {
  let dmg = ctx.weapon.damage;
  if ((ctx.player.statuses?.weaken || 0) > 0) dmg = Math.floor(dmg * WEAKEN_DMG_MULT);
  return dmg;
}

function blindMiss(ctx: ActionContext): boolean {
  return (ctx.player.statuses?.blind || 0) > 0 && Math.random() < BLIND_MISS_CHANCE;
}

/* ═══════════════════════════════════════════════════════
   Universal abilities
   ═══════════════════════════════════════════════════════ */

const basicAttack: Ability = {
  id: "basic_attack",
  name: "Attack",
  icon: "\u2694\uFE0F",
  desc: "Strike with your weapon.",
  source: { type: "universal" },
  cooldown: 0,
  needsTarget: true,
  execute(ctx, targets) {
    const w = ctx.weapon;
    if (blindMiss(ctx)) {
      return [
        { type: "log", message: `\u{1F441}\uFE0F Blinded \u2014 miss!` },
        { type: "end_turn" },
      ];
    }
    const dmg = weaponDmg(ctx);
    const actions: Action[] = [{ type: "log", message: `${w.icon} ${w.name}:` }];
    for (const tIdx of targets) {
      const t = ctx.enemies[tIdx];
      if (!t || t.hp <= 0) continue;
      actions.push({
        type: "damage_enemy",
        targetUid: t.uid,
        amount: dmg,
        damageType: w.damageType,
      });
    }
    actions.push({ type: "end_turn" });
    return actions;
  },
};

const wait: Ability = {
  id: "wait",
  name: "Wait",
  icon: "\u23F3",
  desc: "Skip your turn.",
  source: { type: "universal" },
  cooldown: 0,
  needsTarget: false,
  execute() {
    return [{ type: "log", message: "\u23F3 Waiting..." }, { type: "end_turn" }];
  },
};

const flee: Ability = {
  id: "flee",
  name: "Flee",
  icon: "\u{1F3C3}",
  desc: `Attempt to flee combat (${Math.round(FLEE_CHANCE * 100)}% chance).`,
  source: { type: "universal" },
  cooldown: 0,
  needsTarget: false,
  execute() {
    return [{ type: "flee" }];
  },
};

/* ═══════════════════════════════════════════════════════
   Dagger abilities
   ═══════════════════════════════════════════════════════ */

const silentStab: Ability = {
  id: "silent_stab",
  name: "Silent Stab",
  icon: "\u{1F92B}",
  desc: "Attack silently. No noise.",
  source: { type: "weapon", weaponId: "dagger" },
  cooldown: 1,
  needsTarget: true,
  reach: "melee",
  execute(ctx, targets) {
    if (blindMiss(ctx)) {
      return [
        { type: "log", message: `\u{1F441}\uFE0F Blinded \u2014 miss!` },
        { type: "set_cooldown", abilityId: "silent_stab", turns: 1 },
        { type: "end_turn" },
      ];
    }
    const t = ctx.enemies[targets[0]];
    if (!t || t.hp <= 0) return [{ type: "end_turn" }];
    const dmg = weaponDmg(ctx);
    return [
      { type: "log", message: `\u{1F92B} Silent Stab:` },
      { type: "damage_enemy", targetUid: t.uid, amount: dmg, damageType: ctx.weapon.damageType },
      { type: "set_cooldown", abilityId: "silent_stab", turns: 1 },
      { type: "end_turn" },
    ];
  },
};

const quickStrike: Ability = {
  id: "quick_strike",
  name: "Quick Strike",
  icon: "\u26A1",
  desc: "Half damage, doesn\u2019t end your turn.",
  source: { type: "weapon", weaponId: "dagger" },
  cooldown: 3,
  needsTarget: true,
  reach: "melee",
  execute(ctx, targets) {
    if (blindMiss(ctx)) {
      return [
        { type: "log", message: `\u{1F441}\uFE0F Blinded \u2014 miss!` },
        { type: "set_cooldown", abilityId: "quick_strike", turns: 3 },
        { type: "skip_end_turn" },
      ];
    }
    const t = ctx.enemies[targets[0]];
    if (!t || t.hp <= 0) return [{ type: "skip_end_turn" }];
    const dmg = Math.floor(weaponDmg(ctx) * QUICK_STRIKE_DAMAGE_MULT);
    return [
      { type: "log", message: `\u26A1 Quick Strike:` },
      { type: "damage_enemy", targetUid: t.uid, amount: dmg, damageType: ctx.weapon.damageType },
      { type: "set_cooldown", abilityId: "quick_strike", turns: 3 },
      { type: "skip_end_turn" },
    ];
  },
};

/* ═══════════════════════════════════════════════════════
   Spear abilities
   ═══════════════════════════════════════════════════════ */

const runThrough: Ability = {
  id: "run_through",
  name: "Run Through",
  icon: "\u{1F531}",
  desc: "Hits target and enemy behind it.",
  source: { type: "weapon", weaponId: "spear" },
  cooldown: 1,
  needsTarget: true,
  reach: "ranged",
  execute(ctx, targets) {
    if (blindMiss(ctx)) {
      return [
        { type: "log", message: `\u{1F441}\uFE0F Blinded \u2014 miss!` },
        { type: "set_cooldown", abilityId: "run_through", turns: 1 },
        { type: "end_turn" },
      ];
    }
    const t = ctx.enemies[targets[0]];
    if (!t || t.hp <= 0) return [{ type: "end_turn" }];
    const dmg = weaponDmg(ctx);
    const actions: Action[] = [
      { type: "log", message: `\u{1F531} Run Through!` },
      { type: "damage_enemy", targetUid: t.uid, amount: dmg, damageType: ctx.weapon.damageType },
    ];
    // Hit an enemy behind (in back row if target is front, or another back row enemy)
    const behind = ctx.enemies.find(
      (e) => e.hp > 0 && !e.hidden && e.uid !== t.uid && e.row === "back",
    );
    if (behind) {
      actions.push({
        type: "damage_enemy",
        targetUid: behind.uid,
        amount: dmg,
        damageType: ctx.weapon.damageType,
      });
      actions.push({ type: "log", message: `\u{1F531} Pierces through to ${behind.name}!` });
    }
    actions.push({ type: "set_cooldown", abilityId: "run_through", turns: 1 });
    actions.push({ type: "end_turn" });
    return actions;
  },
};

const hook: Ability = {
  id: "hook",
  name: "Hook",
  icon: "\u{1FA9D}",
  desc: "Pull enemy from back row to front row.",
  source: { type: "weapon", weaponId: "spear" },
  cooldown: 3,
  needsTarget: true,
  reach: "ranged",
  execute(ctx, targets) {
    const t = ctx.enemies[targets[0]];
    if (!t || t.hp <= 0) return [{ type: "end_turn" }];
    const actions: Action[] = [
      { type: "log", message: `\u{1FA9D} Hook! Pulled ${t.name} to front row.` },
      { type: "push_row", targetUid: t.uid, to: "front" },
      { type: "set_cooldown", abilityId: "hook", turns: 3 },
      { type: "end_turn" },
    ];
    return actions;
  },
};

/* ═══════════════════════════════════════════════════════
   Warhammer abilities
   ═══════════════════════════════════════════════════════ */

const chargingBlow: Ability = {
  id: "charging_blow",
  name: "Charging Blow",
  icon: "\u{1F4A5}",
  desc: `${CHARGING_BLOW_MULTIPLIER}x damage, needs 1 turn of charging. Auto-resolves.`,
  source: { type: "weapon", weaponId: "warhammer" },
  cooldown: 2,
  needsTarget: true,
  reach: "melee",
  execute(ctx, targets) {
    const t = ctx.enemies[targets[0]];
    if (!t || t.hp <= 0) return [{ type: "end_turn" }];
    // Start charging — stores target uid; auto-resolves after 1 turn
    return [
      { type: "log", message: `\u{1F4A5} Charging up...` },
      { type: "begin_charge", abilityId: "charging_blow", turnsLeft: 1, targetUid: t.uid },
      { type: "end_turn" },
    ];
  },
};

/** Called by CombatScreen when a charge finishes (turnsLeft reaches 0). */
export function resolveChargingBlow(ctx: ActionContext): Action[] {
  if (blindMiss(ctx)) {
    return [
      { type: "log", message: `\u{1F441}\uFE0F Blinded \u2014 charged blow misses!` },
      { type: "resolve_charge" },
      { type: "set_cooldown", abilityId: "charging_blow", turns: 2 },
    ];
  }
  const targetUid = ctx.player.chargingTargetUid;
  const t = targetUid ? ctx.enemies.find((e) => e.uid === targetUid) : undefined;
  if (!t || t.hp <= 0) {
    return [
      { type: "log", message: `\u{1F4A5} Target lost \u2014 charge fizzles.` },
      { type: "resolve_charge" },
    ];
  }
  const dmg = Math.floor(weaponDmg(ctx) * CHARGING_BLOW_MULTIPLIER);
  return [
    { type: "log", message: `\u{1F4A5} Charging Blow unleashed!` },
    {
      type: "damage_enemy",
      targetUid: t.uid,
      amount: dmg,
      damageType: ctx.weapon.damageType,
    },
    { type: "resolve_charge" },
    { type: "set_cooldown", abilityId: "charging_blow", turns: 2 },
  ];
}

const groundSlam: Ability = {
  id: "ground_slam",
  name: "Ground Slam",
  icon: "\u{1F30B}",
  desc: "Stuns all enemies in the front row. Loud.",
  source: { type: "weapon", weaponId: "warhammer" },
  cooldown: 4,
  needsTarget: false,
  execute(ctx) {
    const frontRow = ctx.enemies.filter((e) => e.hp > 0 && !e.hidden && e.row === "front");
    const actions: Action[] = [{ type: "log", message: `\u{1F30B} Ground Slam!` }];
    for (const e of frontRow) {
      actions.push({
        type: "apply_status_enemy",
        targetUid: e.uid,
        status: "stun",
        stacks: 2,
      });
    }
    actions.push({ type: "set_cooldown", abilityId: "ground_slam", turns: 4 });
    actions.push({ type: "end_turn" });
    return actions;
  },
};

/* ═══════════════════════════════════════════════════════
   Crossbow abilities
   ═══════════════════════════════════════════════════════ */

const piercingShot: Ability = {
  id: "piercing_shot",
  name: "Piercing Shot",
  icon: "\u{1F3AF}",
  desc: "Ignores armor.",
  source: { type: "weapon", weaponId: "crossbow" },
  cooldown: 2,
  needsTarget: true,
  reach: "ranged",
  execute(ctx, targets) {
    if (blindMiss(ctx)) {
      return [
        { type: "log", message: `\u{1F441}\uFE0F Blinded \u2014 miss!` },
        { type: "set_cooldown", abilityId: "piercing_shot", turns: 2 },
        { type: "end_turn" },
      ];
    }
    const t = ctx.enemies[targets[0]];
    if (!t || t.hp <= 0) return [{ type: "end_turn" }];
    const dmg = weaponDmg(ctx);
    return [
      { type: "log", message: `\u{1F3AF} Piercing Shot!` },
      {
        type: "damage_enemy",
        targetUid: t.uid,
        amount: dmg,
        damageType: ctx.weapon.damageType,
        pierceArmor: true,
      },
      { type: "set_cooldown", abilityId: "piercing_shot", turns: 2 },
      { type: "end_turn" },
    ];
  },
};

const throatShot: Ability = {
  id: "throat_shot",
  name: "Throat Shot",
  icon: "\u{1F910}",
  desc: "Silences target.",
  source: { type: "weapon", weaponId: "crossbow" },
  cooldown: 3,
  needsTarget: true,
  reach: "ranged",
  execute(ctx, targets) {
    if (blindMiss(ctx)) {
      return [
        { type: "log", message: `\u{1F441}\uFE0F Blinded \u2014 miss!` },
        { type: "set_cooldown", abilityId: "throat_shot", turns: 3 },
        { type: "end_turn" },
      ];
    }
    const t = ctx.enemies[targets[0]];
    if (!t || t.hp <= 0) return [{ type: "end_turn" }];
    const dmg = weaponDmg(ctx);
    return [
      { type: "log", message: `\u{1F910} Throat Shot!` },
      { type: "damage_enemy", targetUid: t.uid, amount: dmg, damageType: ctx.weapon.damageType },
      { type: "apply_status_enemy", targetUid: t.uid, status: "silence", stacks: 2 },
      { type: "set_cooldown", abilityId: "throat_shot", turns: 3 },
      { type: "end_turn" },
    ];
  },
};

/* ═══════════════════════════════════════════════════════
   Axe abilities
   ═══════════════════════════════════════════════════════ */

const cleave: Ability = {
  id: "cleave",
  name: "Cleave",
  icon: "\u{1FA93}",
  desc: "Hits target and adjacent foes in same row.",
  source: { type: "weapon", weaponId: "axe" },
  cooldown: 2,
  needsTarget: true,
  reach: "melee",
  execute(ctx, targets) {
    if (blindMiss(ctx)) {
      return [
        { type: "log", message: `\u{1F441}\uFE0F Blinded \u2014 miss!` },
        { type: "set_cooldown", abilityId: "cleave", turns: 2 },
        { type: "end_turn" },
      ];
    }
    const t = ctx.enemies[targets[0]];
    if (!t || t.hp <= 0) return [{ type: "end_turn" }];
    const dmg = weaponDmg(ctx);
    const actions: Action[] = [{ type: "log", message: `\u{1FA93} Cleave!` }];
    // Hit target
    actions.push({
      type: "damage_enemy",
      targetUid: t.uid,
      amount: dmg,
      damageType: ctx.weapon.damageType,
    });
    // Hit adjacent foes in same row
    const sameRow = ctx.enemies.filter(
      (e) => e.hp > 0 && !e.hidden && e.row === t.row && e.uid !== t.uid,
    );
    for (const adj of sameRow) {
      actions.push({
        type: "damage_enemy",
        targetUid: adj.uid,
        amount: dmg,
        damageType: ctx.weapon.damageType,
      });
    }
    actions.push({ type: "set_cooldown", abilityId: "cleave", turns: 2 });
    actions.push({ type: "end_turn" });
    return actions;
  },
};

const deepGash: Ability = {
  id: "deep_gash",
  name: "Deep Gash",
  icon: "\u{1FA78}",
  desc: "Causes bleeding.",
  source: { type: "weapon", weaponId: "axe" },
  cooldown: 2,
  needsTarget: true,
  reach: "melee",
  execute(ctx, targets) {
    if (blindMiss(ctx)) {
      return [
        { type: "log", message: `\u{1F441}\uFE0F Blinded \u2014 miss!` },
        { type: "set_cooldown", abilityId: "deep_gash", turns: 2 },
        { type: "end_turn" },
      ];
    }
    const t = ctx.enemies[targets[0]];
    if (!t || t.hp <= 0) return [{ type: "end_turn" }];
    const dmg = weaponDmg(ctx);
    return [
      { type: "log", message: `\u{1FA78} Deep Gash!` },
      { type: "damage_enemy", targetUid: t.uid, amount: dmg, damageType: ctx.weapon.damageType },
      { type: "apply_status_enemy", targetUid: t.uid, status: "bleed", stacks: 3 },
      { type: "set_cooldown", abilityId: "deep_gash", turns: 2 },
      { type: "end_turn" },
    ];
  },
};

/* ═══════════════════════════════════════════════════════
   Shield abilities
   ═══════════════════════════════════════════════════════ */

const shieldBlock: Ability = {
  id: "shield_block",
  name: "Block",
  icon: "\u{1F6E1}\uFE0F",
  desc: `Reduce damage taken next hit by ${Math.round(SHIELD_BLOCK_REDUCTION * 100)}%.`,
  source: { type: "weapon", weaponId: "shield" },
  cooldown: 0,
  needsTarget: false,
  execute() {
    return [
      {
        type: "log",
        message: `\u{1F6E1}\uFE0F Block! (${Math.round(SHIELD_BLOCK_REDUCTION * 100)}% damage reduction)`,
      },
      { type: "set_block_reduction", fraction: SHIELD_BLOCK_REDUCTION },
      { type: "end_turn" },
    ];
  },
};

const shieldBash: Ability = {
  id: "shield_bash",
  name: "Shield Bash",
  icon: "\u{1F6E1}\uFE0F",
  desc: "4 damage, push enemy to back row.",
  source: { type: "weapon", weaponId: "shield" },
  cooldown: 2,
  needsTarget: true,
  reach: "melee",
  execute(ctx, targets) {
    const t = ctx.enemies[targets[0]];
    if (!t || t.hp <= 0) return [{ type: "end_turn" }];
    const actions: Action[] = [
      { type: "log", message: `\u{1F6E1}\uFE0F Shield Bash!` },
      { type: "damage_enemy", targetUid: t.uid, amount: 4, damageType: "bludgeoning" },
    ];
    if (t.row === "front") {
      actions.push({ type: "push_row", targetUid: t.uid, to: "back" });
      actions.push({ type: "log", message: `${t.name} pushed to back row!` });
    }
    actions.push({ type: "set_cooldown", abilityId: "shield_bash", turns: 2 });
    actions.push({ type: "end_turn" });
    return actions;
  },
};

/* ═══════════════════════════════════════════════════════
   Building abilities (kept from old system)
   ═══════════════════════════════════════════════════════ */

const divineHeal: Ability = {
  id: "heal",
  name: "Divine Heal",
  icon: "\u2728",
  desc: "Restore 12 HP.",
  source: { type: "building", buildingId: "shrine", buildingLevel: 1 },
  cooldown: 0,
  needsTarget: false,
  execute() {
    return [
      { type: "log", message: `\u2728 Divine Heal:` },
      { type: "heal_player", amount: 12 },
      { type: "log", message: `+12 HP` },
      { type: "end_turn" },
    ];
  },
};

const holySmite: Ability = {
  id: "holy_smite",
  name: "Holy Smite",
  icon: "\u2600\uFE0F",
  desc: "18 holy dmg. Always hits Ghosts.",
  source: { type: "building", buildingId: "shrine", buildingLevel: 2 },
  cooldown: 0,
  needsTarget: true,
  reach: "ranged",
  execute(ctx, targets) {
    if (blindMiss(ctx)) {
      return [
        { type: "log", message: `\u{1F441}\uFE0F Blinded \u2014 miss!` },
        { type: "end_turn" },
      ];
    }
    const t = ctx.enemies[targets[0]];
    if (!t || t.hp <= 0) return [{ type: "end_turn" }];
    let dmg = 18;
    if ((ctx.player.statuses?.weaken || 0) > 0) dmg = Math.floor(dmg * WEAKEN_DMG_MULT);
    return [
      { type: "log", message: `\u2600\uFE0F Holy Smite!` },
      {
        type: "damage_enemy",
        targetUid: t.uid,
        amount: dmg,
        damageType: "bludgeoning",
        holy: true,
      },
      { type: "end_turn" },
    ];
  },
};

const aimedShot: Ability = {
  id: "aimed_shot",
  name: "Aimed Shot",
  icon: "\u{1F3AF}",
  desc: "12 precise ranged damage.",
  source: { type: "building", buildingId: "hunter", buildingLevel: 1 },
  cooldown: 0,
  needsTarget: true,
  reach: "ranged",
  execute(ctx, targets) {
    if (blindMiss(ctx)) {
      return [
        { type: "log", message: `\u{1F441}\uFE0F Blinded \u2014 miss!` },
        { type: "end_turn" },
      ];
    }
    const t = ctx.enemies[targets[0]];
    if (!t || t.hp <= 0) return [{ type: "end_turn" }];
    let dmg = 12;
    if ((ctx.player.statuses?.weaken || 0) > 0) dmg = Math.floor(dmg * WEAKEN_DMG_MULT);
    return [
      { type: "log", message: `\u{1F3AF} Aimed Shot!` },
      { type: "damage_enemy", targetUid: t.uid, amount: dmg, damageType: "pierce" },
      { type: "end_turn" },
    ];
  },
};

const stealth: Ability = {
  id: "stealth",
  name: "Stealth",
  icon: "\u{1F464}",
  desc: "Enemies skip their next attacks.",
  source: { type: "building", buildingId: "hunter", buildingLevel: 2 },
  cooldown: 0,
  needsTarget: false,
  execute() {
    return [
      { type: "log", message: `\u{1F464} You vanish into the shadows.` },
      { type: "set_stealth", active: true },
      { type: "end_turn" },
    ];
  },
};

const counterStance: Ability = {
  id: "counter_stance",
  name: "Counter Stance",
  icon: "\u2694\uFE0F",
  desc: "Reflect 50% of next hit back.",
  source: { type: "building", buildingId: "knight", buildingLevel: 1 },
  cooldown: 0,
  needsTarget: false,
  execute() {
    return [
      { type: "log", message: `\u2694\uFE0F You brace for a counter-attack.` },
      { type: "set_counter", active: true },
      { type: "end_turn" },
    ];
  },
};

const acidFlask: Ability = {
  id: "acid_flask",
  name: "Acid Flask",
  icon: "\u{1F9EA}",
  desc: "Apply Weaken \u00D73 to target.",
  source: { type: "building", buildingId: "alchemist", buildingLevel: 1 },
  cooldown: 0,
  needsTarget: true,
  reach: "ranged",
  execute(ctx, targets) {
    const t = ctx.enemies[targets[0]];
    if (!t || t.hp <= 0) return [{ type: "end_turn" }];
    return [
      { type: "log", message: `\u{1F9EA} Acid Flask!` },
      { type: "apply_status_enemy", targetUid: t.uid, status: "weaken", stacks: 3 },
      { type: "end_turn" },
    ];
  },
};

const smokeBomb: Ability = {
  id: "smoke_bomb_ability",
  name: "Smoke Bomb",
  icon: "\u{1F4A8}",
  desc: "Blind all enemies for 2 turns.",
  source: { type: "building", buildingId: "alchemist", buildingLevel: 2 },
  cooldown: 0,
  needsTarget: false,
  execute(ctx) {
    const actions: Action[] = [{ type: "log", message: `\u{1F4A8} Smoke Bomb!` }];
    for (const e of ctx.enemies.filter((e) => e.hp > 0 && !e.hidden)) {
      actions.push({
        type: "apply_status_enemy",
        targetUid: e.uid,
        status: "blind",
        stacks: 2,
      });
    }
    actions.push({ type: "end_turn" });
    return actions;
  },
};

/* ═══════════════════════════════════════════════════════
   All abilities registry
   ═══════════════════════════════════════════════════════ */

export const ABILITIES: Ability[] = [
  // Universal
  basicAttack,
  wait,
  flee,
  // Dagger
  silentStab,
  quickStrike,
  // Spear
  runThrough,
  hook,
  // Warhammer
  chargingBlow,
  groundSlam,
  // Crossbow
  piercingShot,
  throatShot,
  // Axe
  cleave,
  deepGash,
  // Shield
  shieldBlock,
  shieldBash,
  // Building
  divineHeal,
  holySmite,
  aimedShot,
  stealth,
  counterStance,
  acidFlask,
  smokeBomb,
];

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */

export function getWeaponAbilities(weaponId: string): Ability[] {
  return ABILITIES.filter((a) => a.source.type === "weapon" && a.source.weaponId === weaponId);
}

export function getUniversalAbilities(): Ability[] {
  return ABILITIES.filter((a) => a.source.type === "universal");
}

export function getBuildingAbilities(): Ability[] {
  return ABILITIES.filter((a) => a.source.type === "building");
}

/** Create a combat ability from a consumable at a specific inventory index. */
function makeItemAbility(item: Consumable, index: number): Ability {
  const needsTarget = !!(item.damage || item.applyStatus) && !item.aoe;

  return {
    id: `item_${index}_${item.id}`,
    name: item.name,
    icon: item.icon,
    desc: item.desc,
    source: { type: "item", itemId: item.id },
    cooldown: 0,
    needsTarget,
    reach: "ranged", // all items are usable at range
    execute(_ctx: ActionContext, targets: number[]): Action[] {
      const actions: Action[] = [
        { type: "consume_item", itemIndex: index },
        { type: "log", message: `\u{1F392} ${item.icon} ${item.name}:` },
      ];

      if (item.heal) {
        actions.push({ type: "heal_player", amount: item.heal });
        actions.push({ type: "log", message: `+${item.heal} HP` });
      }
      if (item.cleanse) {
        actions.push({ type: "cleanse_player" });
        actions.push({ type: "log", message: "Debuffs cleared!" });
      }
      if (item.restoreLight) {
        actions.push({ type: "restore_light", amount: item.restoreLight });
        actions.push({ type: "log", message: `+${item.restoreLight} light` });
      }
      if (item.block) {
        actions.push({ type: "add_block_player", amount: item.block });
        actions.push({ type: "log", message: `+${item.block} block` });
      }
      if (item.damage) {
        if (item.aoe) {
          // Damage all living visible enemies
          for (const e of _ctx.enemies) {
            if (e.hp <= 0 || e.hidden) continue;
            actions.push({
              type: "damage_enemy",
              targetUid: e.uid,
              amount: item.damage,
              damageType: "bludgeoning",
              holy: !!item.holy,
            });
          }
        } else {
          const t = _ctx.enemies[targets[0]];
          if (t && t.hp > 0) {
            actions.push({
              type: "damage_enemy",
              targetUid: t.uid,
              amount: item.damage,
              damageType: "bludgeoning",
              holy: !!item.holy,
            });
          }
        }
      }
      if (item.applyStatus && !item.damage) {
        const { status, stacks } = item.applyStatus;
        if (item.aoe) {
          for (const e of _ctx.enemies) {
            if (e.hp <= 0 || e.hidden) continue;
            actions.push({ type: "apply_status_enemy", targetUid: e.uid, status, stacks });
          }
        } else {
          const t = _ctx.enemies[targets[0]];
          if (t && t.hp > 0) {
            actions.push({ type: "apply_status_enemy", targetUid: t.uid, status, stacks });
          }
        }
      }

      actions.push({ type: "end_turn" });
      return actions;
    },
  };
}

/** Get all abilities available to a player in combat. */
export function getPlayerCombatAbilities(player: Player): Ability[] {
  const abilities: Ability[] = [];
  // Basic attack first (universal, always available)
  const universals = getUniversalAbilities();
  const attack = universals.find((a) => a.id === "basic_attack");
  if (attack) abilities.push(attack);

  // Weapon abilities from main weapon
  abilities.push(...getWeaponAbilities(player.mainWeapon.id));

  // Weapon abilities from offhand (shield)
  if (player.offhandWeapon) {
    abilities.push(...getWeaponAbilities(player.offhandWeapon.id));
  }

  // Building abilities the player has unlocked
  const buildingAbilities = getBuildingAbilities().filter((a) => player.abilities.includes(a.id));
  abilities.push(...buildingAbilities);

  // Consumable items as abilities
  player.consumables.forEach((c, i) => {
    abilities.push(makeItemAbility(c, i));
  });

  // Wait and Flee at the end
  const waitAndFlee = universals.filter((a) => a.id !== "basic_attack");
  abilities.push(...waitAndFlee);

  return abilities;
}
