/* ═══════════════════════════════════════════════════════════════════════════
   Player Equipment — Weapons, Offhands, Armor, Relics
   Every piece is a tactical identity + artifact of the mine's history.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { GridWeaponDef, GridOffhandDef, GridArmorDef, GridAbility } from "./types";

// ─── Helper to build abilities with sensible defaults ───

function ability(
  partial: Partial<GridAbility> &
    Pick<GridAbility, "id" | "name" | "desc" | "apCost" | "cooldown" | "targetType">,
): GridAbility {
  return {
    range: 1,
    damageType: null,
    baseDamage: 0,
    aoeRadius: 0,
    pushDistance: 0,
    conditions: [],
    special: [],
    requiresBehindTarget: false,
    requiresLOS: false,
    moveSelfDistance: 0,
    moveSelfDirection: null,
    ...partial,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// WEAPONS (7)
// ═══════════════════════════════════════════════════════════════════════════

export const ASHVERE_KNIFE: GridWeaponDef = {
  id: "ashvere_knife",
  name: "Ashvere Knife",
  subtitle: "Your great-grandmother kept it sharp",
  icon: "🗡️",
  desc: "The last thing the barony owns. Nimble, precise, deadly from behind.",
  hand: "1h",
  primaryDamageType: "pierce",
  era: "pre_era",
  passives: [],
  abilities: [
    ability({
      id: "stab",
      name: "Stab",
      desc: "Basic melee pierce attack.",
      apCost: 1,
      cooldown: 0,
      targetType: "adjacent",
      damageType: "pierce",
      baseDamage: 3,
    }),
    ability({
      id: "sidestep",
      name: "Sidestep",
      desc: "Pick adjacent enemy, move 1 tile, then stab if still in range.",
      apCost: 1,
      cooldown: 1,
      targetType: "adjacent",
      damageType: "pierce",
      baseDamage: 0,
      special: [{ type: "sidestep_strike", damage: 3, damageType: "pierce" }],
    }),
    ability({
      id: "backstab",
      name: "Backstab",
      desc: "Must be behind target. Devastating pierce damage.",
      apCost: 2,
      cooldown: 2,
      targetType: "adjacent",
      damageType: "pierce",
      baseDamage: 8,
      requiresBehindTarget: true,
    }),
    ability({
      id: "envenom",
      name: "Envenom",
      desc: "Melee attack that poisons the target.",
      apCost: 1,
      cooldown: 2,
      targetType: "adjacent",
      damageType: "pierce",
      baseDamage: 2,
      conditions: [{ condition: "poisoned", stacks: 3, target: "enemy" }],
    }),
    ability({
      id: "slip_through",
      name: "Slip Through",
      desc: "Slip to opposite side of adjacent enemy + free Stab.",
      apCost: 2,
      cooldown: 2,
      targetType: "adjacent",
      damageType: "pierce",
      baseDamage: 0,
      special: [{ type: "slip_through_strike", damage: 3, damageType: "pierce" }],
    }),
  ],
};

export const FOREMANS_PICK: GridWeaponDef = {
  id: "foremans_pick",
  name: "Foreman's Pick",
  subtitle: "The name 'Ashvere' is scratched into the handle",
  icon: "⛏️",
  desc: "Environmental engineer. Terrain destruction, displacement, mine interaction.",
  hand: "1h",
  primaryDamageType: "bludgeoning",
  era: "era1_baron",
  passives: [],
  abilities: [
    ability({
      id: "swing",
      name: "Swing",
      desc: "Basic bludgeoning melee attack.",
      apCost: 1,
      cooldown: 0,
      targetType: "adjacent",
      damageType: "bludgeoning",
      baseDamage: 4,
    }),
    ability({
      id: "shatter",
      name: "Shatter",
      desc: "Destroy adjacent terrain. AoE debris damage.",
      apCost: 2,
      cooldown: 2,
      targetType: "adjacent",
      damageType: "bludgeoning",
      baseDamage: 3,
      aoeRadius: 1,
      special: [{ type: "destroy_terrain" }],
    }),
    ability({
      id: "heave",
      name: "Heave",
      desc: "Push adjacent target 2 tiles in a straight line.",
      apCost: 1,
      cooldown: 1,
      targetType: "adjacent",
      pushDistance: 2,
    }),
    ability({
      id: "crack_bone",
      name: "Crack Bone",
      desc: "Heavy bludgeoning hit + stun 1 turn.",
      apCost: 2,
      cooldown: 3,
      targetType: "adjacent",
      damageType: "bludgeoning",
      baseDamage: 5,
      conditions: [{ condition: "stunned", stacks: 1, target: "enemy" }],
    }),
    ability({
      id: "prospect",
      name: "Prospect",
      desc: "Reveal hidden enemies in radius 2 + gain 3 salt.",
      apCost: 1,
      cooldown: 2,
      targetType: "self",
      range: 0,
      special: [
        { type: "reveal_hidden", radius: 2 },
        { type: "gain_salt", amount: 3 },
      ],
    }),
  ],
};

export const VIGIL_BLADE: GridWeaponDef = {
  id: "vigil_blade",
  name: "Vigil Blade",
  subtitle: "Standard issue. Every knight carried one.",
  icon: "⚔️",
  desc: "Disciplined swordsman. Reliable damage, parry/riposte, counterattacks.",
  hand: "1h",
  primaryDamageType: "slash",
  era: "era2_order",
  passives: [],
  abilities: [
    ability({
      id: "slash",
      name: "Slash",
      desc: "Basic slash melee attack.",
      apCost: 1,
      cooldown: 0,
      targetType: "adjacent",
      damageType: "slash",
      baseDamage: 4,
    }),
    ability({
      id: "riposte_stance",
      name: "Riposte Stance",
      desc: "If missed or dodged this turn, counter for 5 slash.",
      apCost: 1,
      cooldown: 1,
      targetType: "self",
      range: 0,
      special: [{ type: "riposte" }],
    }),
    ability({
      id: "lunge",
      name: "Lunge",
      desc: "Move 1 forward + attack 2 tiles deep for 4 each.",
      apCost: 2,
      cooldown: 2,
      targetType: "line",
      range: 2,
      damageType: "slash",
      baseDamage: 4,
      moveSelfDistance: 1,
      moveSelfDirection: "toward_target",
    }),
    ability({
      id: "disarm",
      name: "Disarm",
      desc: "3 slash + target's next attack deals 50% damage.",
      apCost: 2,
      cooldown: 3,
      targetType: "adjacent",
      damageType: "slash",
      baseDamage: 3,
      special: [{ type: "reduce_next_attack_damage", fraction: 0.5 }],
    }),
    ability({
      id: "guard",
      name: "Guard",
      desc: "Reduce all damage taken this turn by 3.",
      apCost: 1,
      cooldown: 2,
      targetType: "self",
      range: 0,
      special: [{ type: "damage_reduction", amount: 3 }],
    }),
  ],
};

export const CENSER_FLAIL: GridWeaponDef = {
  id: "censer_flail",
  name: "Censer Flail",
  subtitle: "The thurible still smells of frankincense",
  icon: "⚱️",
  desc: "Holy AoE. Wide arcs, smoke zones, devastating vs undead. 2-handed.",
  hand: "2h",
  primaryDamageType: "holy",
  era: "era2_order",
  passives: [],
  abilities: [
    ability({
      id: "swing_censer",
      name: "Swing Censer",
      desc: "Holy+bludgeoning melee. Creates smoke on target tile.",
      apCost: 1,
      cooldown: 0,
      targetType: "adjacent",
      damageType: "holy",
      baseDamage: 4,
      special: [{ type: "smoke_on_hit" }],
    }),
    ability({
      id: "censing_arc",
      name: "Censing Arc",
      desc: "Sweep 3 tiles in a wide arc. Smoke on all.",
      apCost: 2,
      cooldown: 1,
      targetType: "cone",
      range: 1,
      damageType: "holy",
      baseDamage: 4,
      special: [{ type: "smoke_on_hit" }],
    }),
    ability({
      id: "sanctified_ground",
      name: "Sanctified Ground",
      desc: "Radius 1 becomes Hallowed for 2 turns. Undead take 3/turn.",
      apCost: 2,
      cooldown: 3,
      targetType: "self",
      range: 0,
      special: [{ type: "hallowed_ground", radius: 1, turns: 2 }],
    }),
    ability({
      id: "incense_cloud",
      name: "Incense Cloud",
      desc: "Lob smoke to tile within 3. Creates 3x3 smoke zone.",
      apCost: 1,
      cooldown: 2,
      targetType: "tile",
      range: 3,
      requiresLOS: true,
      special: [{ type: "create_terrain", terrain: "smoke", turnsRemaining: 2 }],
    }),
    ability({
      id: "penitents_toll",
      name: "Penitent's Toll",
      desc: "6 holy+bludgeoning to all enemies in radius 2. Self-damage 2.",
      apCost: 3,
      cooldown: 3,
      targetType: "radius",
      range: 2,
      damageType: "holy",
      baseDamage: 6,
      special: [{ type: "self_damage", amount: 2 }],
    }),
  ],
};

export const WARDENS_CROSSBOW: GridWeaponDef = {
  id: "wardens_crossbow",
  name: "Warden's Crossbow",
  subtitle: "The order watched from a distance",
  icon: "🏹",
  desc: "Ranged control. Pin, overwatch, line shots. 2-handed.",
  hand: "2h",
  primaryDamageType: "pierce",
  era: "era2_order",
  passives: [],
  abilities: [
    ability({
      id: "shoot",
      name: "Shoot",
      desc: "Ranged pierce shot. Requires LOS.",
      apCost: 1,
      cooldown: 0,
      targetType: "tile",
      range: 8,
      damageType: "pierce",
      baseDamage: 4,
      requiresLOS: true,
    }),
    ability({
      id: "piercing_shot",
      name: "Piercing Shot",
      desc: "Line through all enemies. 5 pierce each, ignores armor.",
      apCost: 2,
      cooldown: 2,
      targetType: "line",
      range: 8,
      damageType: "pierce",
      baseDamage: 5,
      requiresLOS: true,
    }),
    ability({
      id: "pin_shot",
      name: "Pin Shot",
      desc: "3 pierce + immobilize target 1 turn.",
      apCost: 2,
      cooldown: 2,
      targetType: "tile",
      range: 8,
      damageType: "pierce",
      baseDamage: 3,
      requiresLOS: true,
      conditions: [{ condition: "immobilized", stacks: 1, target: "enemy" }],
    }),
    ability({
      id: "overwatch",
      name: "Overwatch",
      desc: "Mark a tile. Any enemy entering it takes 5 pierce.",
      apCost: 2,
      cooldown: 3,
      targetType: "tile",
      range: 8,
      requiresLOS: true,
      special: [{ type: "overwatch", damage: 5 }],
    }),
    ability({
      id: "retreat_shot",
      name: "Retreat Shot",
      desc: "Shoot adjacent enemy for 3 + move self 2 tiles back.",
      apCost: 1,
      cooldown: 1,
      targetType: "adjacent",
      damageType: "pierce",
      baseDamage: 3,
      moveSelfDistance: 2,
      moveSelfDirection: "away_from_target",
    }),
  ],
};

export const BONECRAFTED_CLEAVER: GridWeaponDef = {
  id: "bonecrafted_cleaver",
  name: "Bonecrafted Cleaver",
  subtitle: "Warm to the touch. The dead, made into a tool.",
  icon: "🪓",
  desc: "AoE berserker. Wide swings, gets stronger with kills. 2-handed.",
  hand: "2h",
  primaryDamageType: "slash",
  era: "era3_lich",
  passives: [{ type: "bone_resonance", maxStacks: 3 }],
  abilities: [
    ability({
      id: "hack",
      name: "Hack",
      desc: "Basic slash+bludgeoning melee.",
      apCost: 1,
      cooldown: 0,
      targetType: "adjacent",
      damageType: "slash",
      baseDamage: 5,
    }),
    ability({
      id: "cleave",
      name: "Cleave",
      desc: "Arc attack hitting 3 tiles in front.",
      apCost: 2,
      cooldown: 1,
      targetType: "cone",
      range: 1,
      damageType: "slash",
      baseDamage: 4,
    }),
    ability({
      id: "wild_swing",
      name: "Wild Swing",
      desc: "Hit all 4 orthogonal adjacent tiles.",
      apCost: 1,
      cooldown: 2,
      targetType: "orthogonal",
      damageType: "slash",
      baseDamage: 3,
    }),
    ability({
      id: "bone_resonance_passive",
      name: "Bone Resonance",
      desc: "Each kill grants +1 damage to all Cleaver attacks (max +3).",
      apCost: 0,
      cooldown: 0,
      targetType: "passive",
      special: [{ type: "bone_resonance" }],
    }),
    ability({
      id: "charnel_charge",
      name: "Charnel Charge",
      desc: "Move 3 tiles in a line, attack everything in path + push sideways.",
      apCost: 3,
      cooldown: 3,
      targetType: "line",
      range: 3,
      damageType: "slash",
      baseDamage: 5,
      pushDistance: 1,
      moveSelfDistance: 3,
      moveSelfDirection: "toward_target",
    }),
  ],
};

export const SALT_CRYSTAL_BLADE: GridWeaponDef = {
  id: "salt_crystal_blade",
  name: "Salt Crystal Blade",
  subtitle: "The mine itself, offering a weapon",
  icon: "💎",
  desc: "Holy specialist + light generation. Each attack lights the area. 1-handed.",
  hand: "1h",
  primaryDamageType: "holy",
  era: "mine",
  passives: [{ type: "darkness_immunity" }, { type: "dark_vision", range: 2 }],
  abilities: [
    ability({
      id: "salt_strike",
      name: "Salt Strike",
      desc: "Holy melee. Target tile becomes lit for 2 turns.",
      apCost: 1,
      cooldown: 0,
      targetType: "adjacent",
      damageType: "holy",
      baseDamage: 4,
      special: [{ type: "light_zone", radius: 0, turns: 2 }],
    }),
    ability({
      id: "crystalline_flash",
      name: "Crystalline Flash",
      desc: "Holy AoE radius 1. All tiles become lit for 3 turns.",
      apCost: 2,
      cooldown: 2,
      targetType: "radius",
      range: 1,
      damageType: "holy",
      baseDamage: 4,
      special: [{ type: "light_zone", radius: 1, turns: 3 }],
    }),
    ability({
      id: "fracture",
      name: "Fracture",
      desc: "Ranged 3. Launch salt shard for 3 holy. Creates Salt Deposit on tile.",
      apCost: 1,
      cooldown: 2,
      targetType: "tile",
      range: 3,
      damageType: "holy",
      baseDamage: 3,
      requiresLOS: true,
      special: [{ type: "create_terrain", terrain: "salt_deposit", turnsRemaining: null }],
    }),
    ability({
      id: "consecrate_ground",
      name: "Consecrate Ground",
      desc: "Target tile within 2 becomes Hallowed for 3 turns.",
      apCost: 2,
      cooldown: 3,
      targetType: "tile",
      range: 2,
      special: [{ type: "hallowed_ground", radius: 0, turns: 3 }],
    }),
    ability({
      id: "resonance_passive",
      name: "Resonance",
      desc: "Immune to Darkness bonuses. See into Dark Zones within 2.",
      apCost: 0,
      cooldown: 0,
      targetType: "passive",
      special: [{ type: "darkness_immunity" }, { type: "dark_vision", range: 2 }],
    }),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// OFFHANDS (5, for 1H weapons only)
// ═══════════════════════════════════════════════════════════════════════════

export const MINERS_LANTERN: GridOffhandDef = {
  id: "miners_lantern",
  name: "Miner's Lantern",
  subtitle: "The baron saved on lamp oil",
  icon: "🏮",
  desc: "Fire + illumination + reveal hidden enemies.",
  era: "era1_baron",
  passives: [],
  abilities: [
    ability({
      id: "illuminate",
      name: "Illuminate",
      desc: "Create 2-tile light zone + reveal all hidden in radius.",
      apCost: 1,
      cooldown: 2,
      targetType: "self",
      range: 0,
      special: [
        { type: "light_zone", radius: 2, turns: 3 },
        { type: "reveal_hidden", radius: 2 },
      ],
    }),
    ability({
      id: "brand",
      name: "Brand",
      desc: "3 fire melee + burning 2.",
      apCost: 1,
      cooldown: 1,
      targetType: "adjacent",
      damageType: "fire",
      baseDamage: 3,
      conditions: [{ condition: "burning", stacks: 2, target: "enemy" }],
    }),
    ability({
      id: "flare",
      name: "Flare",
      desc: "Lob oil to tile within 3. 4 fire AoE + light zone.",
      apCost: 2,
      cooldown: 3,
      targetType: "tile",
      range: 3,
      damageType: "fire",
      baseDamage: 4,
      aoeRadius: 1,
      special: [{ type: "light_zone", radius: 1, turns: 2 }],
    }),
  ],
};

export const VIGIL_SHIELD: GridOffhandDef = {
  id: "vigil_shield",
  name: "Vigil Shield",
  subtitle: "Better at pushing people around than protecting them",
  icon: "🛡️",
  desc: "Displacement + protection. THE Into the Breach tool.",
  era: "era2_order",
  passives: [{ type: "block_first_hit", reduction: 0.5 }],
  abilities: [
    ability({
      id: "shield_bash",
      name: "Shield Bash",
      desc: "Push adjacent target 2 tiles + 2 bludgeoning.",
      apCost: 1,
      cooldown: 1,
      targetType: "adjacent",
      damageType: "bludgeoning",
      baseDamage: 2,
      pushDistance: 2,
    }),
    ability({
      id: "brace",
      name: "Brace",
      desc: "Negate ALL damage from one hit this turn.",
      apCost: 1,
      cooldown: 2,
      targetType: "self",
      range: 0,
      special: [{ type: "negate_hit" }],
    }),
  ],
};

export const SALT_TALISMAN: GridOffhandDef = {
  id: "salt_talisman",
  name: "Salt Talisman",
  subtitle: "Warm in the hand. The ward-keepers were the last useful people.",
  icon: "🔮",
  desc: "Anti-undead terrain control. Create barriers and sacred zones.",
  era: "era2_order",
  passives: [],
  abilities: [
    ability({
      id: "salt_ward",
      name: "Salt Ward",
      desc: "Place impassable ward line on adjacent tile. 3 turns.",
      apCost: 1,
      cooldown: 2,
      targetType: "adjacent",
      special: [{ type: "create_terrain", terrain: "ward_line", turnsRemaining: 3 }],
    }),
    ability({
      id: "purifying_flash",
      name: "Purifying Flash",
      desc: "Holy radius 1. 4 holy + unaware on incorporeal.",
      apCost: 2,
      cooldown: 3,
      targetType: "self",
      range: 0,
      damageType: "holy",
      baseDamage: 4,
      aoeRadius: 1,
      special: [{ type: "ignore_incorporeal_resistance" }],
    }),
    ability({
      id: "consecrate",
      name: "Consecrate",
      desc: "Target tile within 2 becomes Hallowed for 3 turns.",
      apCost: 2,
      cooldown: 3,
      targetType: "tile",
      range: 2,
      special: [{ type: "hallowed_ground", radius: 0, turns: 3 }],
    }),
  ],
};

export const VENTILATION_BELLOWS: GridOffhandDef = {
  id: "ventilation_bellows",
  name: "Ventilation Bellows",
  subtitle: "The unfixed tool from the disaster",
  icon: "🌬️",
  desc: "Ranged push + air control. Displace from distance.",
  era: "era1_baron",
  passives: [],
  abilities: [
    ability({
      id: "gust",
      name: "Gust",
      desc: "Push target within 3 back 1 tile. No LOS required.",
      apCost: 1,
      cooldown: 0,
      targetType: "tile",
      range: 3,
      pushDistance: 1,
    }),
    ability({
      id: "blast",
      name: "Blast",
      desc: "Push ALL units in a 3-tile line back 2 tiles.",
      apCost: 2,
      cooldown: 3,
      targetType: "line",
      range: 3,
      pushDistance: 2,
    }),
    ability({
      id: "clear_air",
      name: "Clear Air",
      desc: "Remove all Smoke, Gas, Dark Zone in radius 2.",
      apCost: 1,
      cooldown: 2,
      targetType: "self",
      range: 0,
      special: [{ type: "light_zone", radius: 2, turns: 2 }],
    }),
  ],
};

export const TOME_OF_BINDING: GridOffhandDef = {
  id: "tome_of_binding",
  name: "Tome of Binding",
  subtitle: "The knowledge they hoarded",
  icon: "📖",
  desc: "Debuff + control. Force enemies to change behavior. Zero damage.",
  era: "era2_order",
  passives: [],
  abilities: [
    ability({
      id: "command_halt",
      name: "Command Halt",
      desc: "Target enemy within 3: cancel their next move action.",
      apCost: 1,
      cooldown: 1,
      targetType: "tile",
      range: 3,
      special: [{ type: "cancel_enemy_move" }],
    }),
    ability({
      id: "rebuke",
      name: "Rebuke",
      desc: "Target within 3: redirect their next attack to an adjacent ally.",
      apCost: 2,
      cooldown: 3,
      targetType: "tile",
      range: 3,
      special: [{ type: "redirect_enemy_attack" }],
    }),
    ability({
      id: "compel",
      name: "Compel",
      desc: "Force enemy within 2 to move 2 tiles in your chosen direction.",
      apCost: 2,
      cooldown: 3,
      targetType: "tile",
      range: 2,
      special: [{ type: "force_enemy_move", distance: 2 }],
    }),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// ARMOR (5)
// ═══════════════════════════════════════════════════════════════════════════

export const MINERS_LEATHERS: GridArmorDef = {
  id: "miners_leathers",
  name: "Miner's Leathers",
  subtitle: "No protection, no restriction",
  icon: "👕",
  desc: "Starter armor. Pure mobility.",
  era: "pre_era",
  armor: 0,
  thorns: 0,
  maxHpBonus: 0,
  maxApModifier: 0,
  passives: [],
  activeAbility: ability({
    id: "dodge_roll",
    name: "Dodge Roll",
    desc: "Move 1 tile in any direction ignoring hazards.",
    apCost: 0,
    cooldown: 2,
    targetType: "tile",
    range: 1,
    moveSelfDistance: 1,
    moveSelfDirection: "any",
  }),
};

export const VIGIL_HAUBERK: GridArmorDef = {
  id: "vigil_hauberk",
  name: "Vigil Hauberk",
  subtitle: "Forty pounds of chain. Protection has a cost.",
  icon: "🛡️",
  desc: "Heavy armor. +Armor, +HP, but -1 max AP.",
  era: "era2_order",
  armor: 1,
  thorns: 0,
  maxHpBonus: 5,
  maxApModifier: -1,
  passives: [],
  activeAbility: ability({
    id: "brace_for_impact",
    name: "Brace for Impact",
    desc: "Armor becomes 3 this turn.",
    apCost: 0,
    cooldown: 3,
    targetType: "self",
    range: 0,
    special: [{ type: "armor_this_turn", amount: 3 }],
  }),
};

export const BONE_PLATE: GridArmorDef = {
  id: "bone_plate",
  name: "Bone Plate",
  subtitle: "It moves with you. It shouldn't be comfortable.",
  icon: "🦴",
  desc: "Aggressive armor. Thorns + AoE active.",
  era: "era3_lich",
  armor: 1,
  thorns: 1,
  maxHpBonus: 0,
  maxApModifier: 0,
  passives: [],
  activeAbility: ability({
    id: "bone_splinter",
    name: "Bone Splinter",
    desc: "3 bludgeoning to all orthogonal adjacent tiles.",
    apCost: 1,
    cooldown: 2,
    targetType: "orthogonal",
    damageType: "bludgeoning",
    baseDamage: 3,
  }),
};

export const SALT_WARDED_VESTMENTS: GridArmorDef = {
  id: "salt_warded_vestments",
  name: "Salt-Warded Vestments",
  subtitle: "Woven with salt thread from the deep seam",
  icon: "✨",
  desc: "Anti-incorporeal specialist. Cleanse active.",
  era: "era2_order",
  armor: 0,
  thorns: 0,
  maxHpBonus: 3,
  maxApModifier: 0,
  passives: [{ type: "incorporeal_half_damage" }],
  activeAbility: ability({
    id: "absolution",
    name: "Absolution",
    desc: "Cleanse all conditions + heal 3 HP.",
    apCost: 0,
    cooldown: 3,
    targetType: "self",
    range: 0,
    special: [{ type: "cleanse_conditions" }, { type: "heal", amount: 3 }],
  }),
};

export const FOREMANS_GREATCOAT: GridArmorDef = {
  id: "foremans_greatcoat",
  name: "Foreman's Greatcoat",
  subtitle: "The coat of the man who sat at the desk",
  icon: "🧥",
  desc: "Subtle aggro reduction. Redirect enemy attacks.",
  era: "era1_baron",
  armor: 0,
  thorns: 0,
  maxHpBonus: 3,
  maxApModifier: 0,
  passives: [{ type: "aggro_reduction" }],
  activeAbility: ability({
    id: "commanding_presence",
    name: "Commanding Presence",
    desc: "Retarget one enemy's attack to a tile of your choice.",
    apCost: 1,
    cooldown: 3,
    targetType: "tile",
    range: 3,
    special: [{ type: "retarget_attack" }],
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// LOOKUP MAPS
// ═══════════════════════════════════════════════════════════════════════════

export const GRID_WEAPONS: readonly GridWeaponDef[] = [
  ASHVERE_KNIFE,
  FOREMANS_PICK,
  VIGIL_BLADE,
  CENSER_FLAIL,
  WARDENS_CROSSBOW,
  BONECRAFTED_CLEAVER,
  SALT_CRYSTAL_BLADE,
];

export const GRID_OFFHANDS: readonly GridOffhandDef[] = [
  MINERS_LANTERN,
  VIGIL_SHIELD,
  SALT_TALISMAN,
  VENTILATION_BELLOWS,
  TOME_OF_BINDING,
];

export const GRID_ARMORS: readonly GridArmorDef[] = [
  MINERS_LEATHERS,
  VIGIL_HAUBERK,
  BONE_PLATE,
  SALT_WARDED_VESTMENTS,
  FOREMANS_GREATCOAT,
];

export const GRID_WEAPON_MAP: ReadonlyMap<string, GridWeaponDef> = new Map(
  GRID_WEAPONS.map((w) => [w.id, w]),
);

export const GRID_OFFHAND_MAP: ReadonlyMap<string, GridOffhandDef> = new Map(
  GRID_OFFHANDS.map((o) => [o.id, o]),
);

export const GRID_ARMOR_MAP: ReadonlyMap<string, GridArmorDef> = new Map(
  GRID_ARMORS.map((a) => [a.id, a]),
);

export const MOVE_ABILITY: GridAbility = ability({
  id: "move",
  name: "Move",
  desc: "Move 1 tile orthogonally.",
  apCost: 1,
  cooldown: 0,
  targetType: "tile",
  range: 1,
  moveSelfDistance: 1,
  moveSelfDirection: "any",
});

export function getPlayerAbilities(
  weaponId: string,
  offhandId: string | null,
  armorId: string,
): ReadonlyMap<string, GridAbility> {
  const abilities = new Map<string, GridAbility>();

  abilities.set(MOVE_ABILITY.id, MOVE_ABILITY);

  const weapon = GRID_WEAPON_MAP.get(weaponId);
  if (weapon) {
    for (const a of weapon.abilities) {
      abilities.set(a.id, a);
    }
  }

  if (offhandId) {
    const offhand = GRID_OFFHAND_MAP.get(offhandId);
    if (offhand) {
      for (const a of offhand.abilities) {
        abilities.set(a.id, a);
      }
    }
  }

  const armor = GRID_ARMOR_MAP.get(armorId);
  if (armor) {
    abilities.set(armor.activeAbility.id, armor.activeAbility);
  }

  return abilities;
}
