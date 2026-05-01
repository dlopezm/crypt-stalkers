import type { DieDef, DieSlot, FaceDef } from "./types";

/* ── Faces ── *
 * Each face is a small effect bag. Faces are referenced by id from die definitions
 * so the same face can appear on multiple dice (e.g. the universal Blank). */

export const FACES: Record<string, FaceDef> = {
  /* Universal */
  blank: {
    id: "blank",
    label: "Blank",
    icon: "⬛",
    desc: "No effect.",
    target: "none",
  },
  free_reroll: {
    id: "free_reroll",
    label: "Focus",
    icon: "\u{1F441}️",
    desc: "Gain 1 free re-roll this turn.",
    target: "none",
    bonusReroll: 1,
  },

  /* Body */
  body_strike: {
    id: "body_strike",
    label: "Strike",
    icon: "⚔️",
    desc: "1 slash to any enemy.",
    target: "any-enemy",
    damage: 1,
    damageType: "slash",
  },
  body_brace: {
    id: "body_brace",
    label: "Brace",
    icon: "\u{1F6E1}️",
    desc: "Gain 1 block.",
    target: "self",
    block: 1,
  },
  body_breath: {
    id: "body_breath",
    label: "Catch Breath",
    icon: "\u{1F49A}",
    desc: "Heal 1 HP.",
    target: "self",
    heal: 1,
  },
  body_shove: {
    id: "body_shove",
    label: "Shove",
    icon: "\u{1F6B6}",
    desc: "Push an enemy to the opposite row.",
    target: "any-enemy",
    pushOpposite: true,
  },

  /* Dagger */
  dagger_stab: {
    id: "dagger_stab",
    label: "Stab",
    icon: "\u{1F5E1}️",
    desc: "1 slash to a front-row enemy.",
    target: "front-enemy",
    damage: 1,
    damageType: "slash",
  },
  dagger_quick: {
    id: "dagger_quick",
    label: "Quick Stab",
    icon: "\u{1F5E1}️\u{1F5E1}️",
    desc: "2 slash to a front-row enemy.",
    target: "front-enemy",
    damage: 2,
    damageType: "slash",
  },
  dagger_bleed: {
    id: "dagger_bleed",
    label: "Open Vein",
    icon: "\u{1FA78}",
    desc: "Apply 2 bleed to a front-row enemy.",
    target: "front-enemy",
    applyStatus: { status: "bleed", stacks: 2 },
  },
  dagger_twist: {
    id: "dagger_twist",
    label: "Twist",
    icon: "\u{1F5E1}️\u{1FA78}",
    desc: "1 slash + 1 bleed to a front-row enemy.",
    target: "front-enemy",
    damage: 1,
    damageType: "slash",
    applyStatus: { status: "bleed", stacks: 1 },
  },
  dagger_flit: {
    id: "dagger_flit",
    label: "Flit",
    icon: "\u{1F300}",
    desc: "Gain Dodge: the next physical hit on you is negated.",
    target: "self",
    grantDodge: true,
  },

  /* Warhammer */
  hammer_smash: {
    id: "hammer_smash",
    label: "Smash",
    icon: "\u{1F528}\u{1F528}",
    desc: "2 bludgeoning to a front-row enemy.",
    target: "front-enemy",
    damage: 2,
    damageType: "bludgeoning",
  },
  hammer_crush: {
    id: "hammer_crush",
    label: "Crush",
    icon: "\u{1F528}\u{1F528}\u{1F528}",
    desc: "3 bludgeoning to a front-row enemy.",
    target: "front-enemy",
    damage: 3,
    damageType: "bludgeoning",
  },
  hammer_stagger: {
    id: "hammer_stagger",
    label: "Stagger",
    icon: "\u{1F4A2}",
    desc: "Apply 1 stun to a front-row enemy.",
    target: "front-enemy",
    applyStatus: { status: "stun", stacks: 1 },
  },
  hammer_windup: {
    id: "hammer_windup",
    label: "Wind Up",
    icon: "\u{1F4AA}",
    desc: "Gain Power: your next damage face this turn deals +2.",
    target: "self",
    grantPower: 2,
  },
  hammer_heavybash: {
    id: "hammer_heavybash",
    label: "Heavy Bash",
    icon: "\u{1F528}\u{1F4A2}",
    desc: "2 bludgeoning + 1 stun to a front-row enemy.",
    target: "front-enemy",
    damage: 2,
    damageType: "bludgeoning",
    applyStatus: { status: "stun", stacks: 1 },
  },

  /* Shield (offhand) */
  shield_block: {
    id: "shield_block",
    label: "Block",
    icon: "\u{1F6E1}️\u{1F6E1}️",
    desc: "Gain 2 block.",
    target: "self",
    block: 2,
  },
  shield_bulwark: {
    id: "shield_bulwark",
    label: "Bulwark",
    icon: "\u{1F6E1}️✨",
    desc: "Gain 3 block.",
    target: "self",
    block: 3,
  },
  shield_bash: {
    id: "shield_bash",
    label: "Bash",
    icon: "\u{1F94A}",
    desc: "1 bludgeoning + 1 stun to a front-row enemy.",
    target: "front-enemy",
    damage: 1,
    damageType: "bludgeoning",
    applyStatus: { status: "stun", stacks: 1 },
  },
  shield_cleanse: {
    id: "shield_cleanse",
    label: "Cleanse",
    icon: "✨",
    desc: "Remove 1 status from yourself.",
    target: "self",
    cleanseSelf: 1,
  },

  /* No offhand (two-handed) */
  twohand_grip: {
    id: "twohand_grip",
    label: "Two-Handed Grip",
    icon: "✊",
    desc: "Damage faces deal +1 this turn.",
    target: "self",
    twoHandedBonus: true,
  },
  twohand_dodge: {
    id: "twohand_dodge",
    label: "Sidestep",
    icon: "\u{1F300}",
    desc: "Gain Dodge: the next physical hit is negated.",
    target: "self",
    grantDodge: true,
  },
  twohand_brace: {
    id: "twohand_brace",
    label: "Brace",
    icon: "\u{1F6E1}️",
    desc: "Gain 1 block.",
    target: "self",
    block: 1,
  },
  twohand_heal: {
    id: "twohand_heal",
    label: "Resilience",
    icon: "\u{1F49A}",
    desc: "Heal 1 HP.",
    target: "self",
    heal: 1,
  },

  /* Mail Hauberk (armor) */
  mail_block: {
    id: "mail_block",
    label: "Mail",
    icon: "\u{1F6E1}️",
    desc: "Gain 1 block.",
    target: "self",
    block: 1,
  },
  mail_block2: {
    id: "mail_block2",
    label: "Heavy Mail",
    icon: "\u{1F6E1}️\u{1F6E1}️",
    desc: "Gain 2 block.",
    target: "self",
    block: 2,
  },
  mail_heal: {
    id: "mail_heal",
    label: "Endurance",
    icon: "\u{1F49A}",
    desc: "Heal 1 HP.",
    target: "self",
    heal: 1,
  },
  mail_cleanse: {
    id: "mail_cleanse",
    label: "Steady",
    icon: "⛓️",
    desc: "Cleanse 1 status from yourself.",
    target: "self",
    cleanseSelf: 1,
  },
  mail_edge: {
    id: "mail_edge",
    label: "Edge",
    icon: "⚔️",
    desc: "Damage faces deal +1 this turn.",
    target: "self",
    twoHandedBonus: true,
  },

  /* Soul (starter only — etching at shrines comes in Phase 2) */
  soul_strike: {
    id: "soul_strike",
    label: "Resolve",
    icon: "⚔️",
    desc: "1 slash to any enemy.",
    target: "any-enemy",
    damage: 1,
    damageType: "slash",
  },
  soul_heal: {
    id: "soul_heal",
    label: "Prayer",
    icon: "\u{1F49A}",
    desc: "Heal 1 HP.",
    target: "self",
    heal: 1,
  },
};

export function getFace(id: string): FaceDef | null {
  return FACES[id] ?? null;
}

/* ── Die Definitions ── */

export const BODY_DIE: DieDef = {
  id: "body_die",
  slot: "body",
  name: "Body",
  icon: "\u{1F464}",
  faces: ["body_strike", "body_brace", "body_breath", "free_reroll", "body_shove", "blank"],
};

/** Weapon dice keyed by weapon.id from src/data/weapons.ts. */
export const WEAPON_DICE: Record<string, DieDef> = {
  dagger: {
    id: "die_dagger",
    slot: "main",
    name: "Dagger",
    icon: "\u{1F5E1}️",
    faces: ["dagger_stab", "dagger_quick", "dagger_bleed", "dagger_flit", "dagger_twist", "blank"],
  },
  warhammer: {
    id: "die_warhammer",
    slot: "main",
    name: "Warhammer",
    icon: "\u{1F528}",
    faces: [
      "hammer_smash",
      "hammer_crush",
      "hammer_stagger",
      "hammer_windup",
      "hammer_heavybash",
      "blank",
    ],
  },
};

/** Offhand dice keyed by offhand id; the special id "none" is used when no offhand is equipped. */
export const OFFHAND_DICE: Record<string, DieDef> = {
  shield: {
    id: "die_shield",
    slot: "offhand",
    name: "Shield",
    icon: "\u{1F6E1}️",
    faces: [
      "shield_block",
      "shield_bulwark",
      "shield_bash",
      "free_reroll",
      "shield_cleanse",
      "blank",
    ],
  },
  none: {
    id: "die_twohand",
    slot: "offhand",
    name: "Two-Handed",
    icon: "✊",
    faces: [
      "twohand_grip",
      "twohand_dodge",
      "twohand_brace",
      "free_reroll",
      "twohand_heal",
      "blank",
    ],
  },
};

/** Armor dice keyed by armor id. Phase 1 ships only mail_hauberk; phase 2 adds plate / robes. */
export const ARMOR_DICE: Record<string, DieDef> = {
  mail_hauberk: {
    id: "die_mail",
    slot: "armor",
    name: "Mail Hauberk",
    icon: "\u{1F454}",
    faces: ["mail_block", "mail_heal", "mail_cleanse", "mail_block2", "mail_edge", "blank"],
  },
};

/** Starting Soul Die — mostly blank, etched at shrines later. */
export const SOUL_STARTING_FACES: readonly [string, string, string, string, string, string] = [
  "soul_strike",
  "soul_heal",
  "blank",
  "blank",
  "blank",
  "blank",
];

export const SOUL_DIE_TEMPLATE: Omit<DieDef, "faces"> = {
  id: "die_soul",
  slot: "soul",
  name: "Soul",
  icon: "✨",
};

/* ── Lookup helpers ── */

export function getWeaponDie(weaponId: string): DieDef {
  return WEAPON_DICE[weaponId] ?? WEAPON_DICE.dagger;
}

export function getOffhandDie(offhandId: string | null): DieDef {
  if (!offhandId) return OFFHAND_DICE.none;
  return OFFHAND_DICE[offhandId] ?? OFFHAND_DICE.none;
}

export function getArmorDie(armorId: string): DieDef {
  return ARMOR_DICE[armorId] ?? ARMOR_DICE.mail_hauberk;
}

export function buildSoulDie(
  faces: readonly [string, string, string, string, string, string],
): DieDef {
  return { ...SOUL_DIE_TEMPLATE, faces };
}

/** Slot order in the dice tray (left to right). */
export const SLOT_ORDER: readonly DieSlot[] = ["body", "main", "offhand", "armor", "soul"];
