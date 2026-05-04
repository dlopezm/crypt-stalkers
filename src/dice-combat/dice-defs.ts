import type { ColorDef, DieDef, DieSlot, FaceColor, FaceDef } from "./types";

/* ── Color palette ── */

export const COLORS: Record<FaceColor, ColorDef> = {
  crimson: { id: "crimson", label: "Crimson", hex: "#C0303A", badge: "▲" },
  salt: { id: "salt", label: "Salt", hex: "#F4F1E8", badge: "■" },
  fire: { id: "fire", label: "Fire", hex: "#E8821F", badge: "✦" },
  coldfire: { id: "coldfire", label: "Coldfire", hex: "#7B3FA0", badge: "☠" },
  brine: { id: "brine", label: "Brine", hex: "#2BA17A", badge: "◆" },
  echo: { id: "echo", label: "Echo", hex: "#3FA3D6", badge: "≈" },
  iron: { id: "iron", label: "Iron", hex: "#5A6473", badge: "⬢" },
  blank: { id: "blank", label: "Blank", hex: "#2A2A2A", badge: "·" },
};

export function getColor(c: FaceColor): ColorDef {
  return COLORS[c];
}

/* ── Faces ── *
 * Each face is a small effect bag, identified by id, with one of seven colors (or blank).
 * Two faces in the pool sharing a color triggers a bust. Blank does not auto-bust unless
 * an aura recolors it (e.g. The Shadow's Coldfire Mark). */

export const FACES: Record<string, FaceDef> = {
  /* Universal */
  blank: {
    id: "blank",
    label: "Blank",
    icon: "·",
    desc: "No effect.",
    color: "blank",
    target: "none",
  },

  /* ── Dagger (main hand) ── */
  dagger_stab: {
    id: "dagger_stab",
    label: "Stab",
    icon: "🗡️",
    desc: "1 slash to a front-row enemy.",
    color: "crimson",
    target: "front-enemy",
    damage: 1,
    damageType: "slash",
  },
  dagger_quick: {
    id: "dagger_quick",
    label: "Quick Stab",
    icon: "🗡️",
    desc: "2 slash to a front-row enemy.",
    color: "crimson",
    target: "front-enemy",
    damage: 2,
    damageType: "slash",
  },
  dagger_twist: {
    id: "dagger_twist",
    label: "Twist",
    icon: "🩸",
    desc: "1 slash + 1 Bleed to a front-row enemy.",
    color: "iron",
    target: "front-enemy",
    damage: 1,
    damageType: "slash",
    applyStatus: { status: "bleed", stacks: 1 },
  },
  dagger_open_vein: {
    id: "dagger_open_vein",
    label: "Open Vein",
    icon: "🩸",
    desc: "Apply 2 Bleed to a front-row enemy.",
    color: "brine",
    target: "front-enemy",
    applyStatus: { status: "bleed", stacks: 2 },
  },
  dagger_flit: {
    id: "dagger_flit",
    label: "Flit",
    icon: "🌀",
    desc: "Gain Dodge — next physical hit is negated.",
    color: "echo",
    target: "self",
    grantDodge: true,
  },

  /* ── Warhammer (main hand) ── */
  hammer_smash: {
    id: "hammer_smash",
    label: "Smash",
    icon: "🔨",
    desc: "2 bludgeoning to front.",
    color: "crimson",
    target: "front-enemy",
    damage: 2,
    damageType: "bludgeoning",
  },
  hammer_crush: {
    id: "hammer_crush",
    label: "Crush",
    icon: "🔨",
    desc: "3 bludgeoning to front.",
    color: "crimson",
    target: "front-enemy",
    damage: 3,
    damageType: "bludgeoning",
  },
  hammer_stagger: {
    id: "hammer_stagger",
    label: "Stagger",
    icon: "💢",
    desc: "1 Stun to a front-row enemy.",
    color: "iron",
    target: "front-enemy",
    applyStatus: { status: "stun", stacks: 1 },
  },
  hammer_heavybash: {
    id: "hammer_heavybash",
    label: "Heavy Bash",
    icon: "🔨",
    desc: "2 bludgeoning + 1 Stun to front.",
    color: "iron",
    target: "front-enemy",
    damage: 2,
    damageType: "bludgeoning",
    applyStatus: { status: "stun", stacks: 1 },
  },
  hammer_windup: {
    id: "hammer_windup",
    label: "Wind Up",
    icon: "💪",
    desc: "Next damage face deals +2.",
    color: "echo",
    target: "self",
    grantPower: 2,
  },

  /* ── Shield (off hand) ── */
  shield_block: {
    id: "shield_block",
    label: "Block",
    icon: "🛡️",
    desc: "Gain 2 block.",
    color: "salt",
    target: "self",
    block: 2,
  },
  shield_bulwark: {
    id: "shield_bulwark",
    label: "Bulwark",
    icon: "🛡️",
    desc: "Gain 3 block.",
    color: "salt",
    target: "self",
    block: 3,
  },
  shield_cleanse: {
    id: "shield_cleanse",
    label: "Cleanse",
    icon: "✨",
    desc: "Remove 1 status from yourself.",
    color: "salt",
    target: "self",
    cleanseSelf: 1,
  },
  shield_bash: {
    id: "shield_bash",
    label: "Bash",
    icon: "🥊",
    desc: "1 bludgeoning + 1 Stun to front.",
    color: "iron",
    target: "front-enemy",
    damage: 1,
    damageType: "bludgeoning",
    applyStatus: { status: "stun", stacks: 1 },
  },
  shield_focus: {
    id: "shield_focus",
    label: "Focus",
    icon: "👁️",
    desc: "Gain Resonance — next color clash this turn is forgiven.",
    color: "echo",
    target: "self",
    grantResonance: true,
  },

  /* ── Torch (off hand starter) ── *
   * The Fourth Hand enters the mine with a knife and a torch. Two Fire faces give
   * the torch a real damage identity but make same-die rerolls risky — mirroring
   * the Dagger's two-Crimson pattern. Torch + Dagger have minimal color overlap,
   * so combining them is naturally safe. */
  torch_brand: {
    id: "torch_brand",
    label: "Brand",
    icon: "🔥",
    desc: "1 Fire damage to any enemy (+1 vs undead).",
    color: "fire",
    target: "any-enemy",
    damage: 1,
    damageType: "fire",
  },
  torch_sear: {
    id: "torch_sear",
    label: "Sear",
    icon: "🔥",
    desc: "2 Fire damage to a front-row enemy.",
    color: "fire",
    target: "front-enemy",
    damage: 2,
    damageType: "fire",
  },
  torch_sidestep: {
    id: "torch_sidestep",
    label: "Sidestep",
    icon: "🌀",
    desc: "Gain Dodge — next physical hit is negated.",
    color: "echo",
    target: "self",
    grantDodge: true,
  },
  torch_ward_off: {
    id: "torch_ward_off",
    label: "Ward Off",
    icon: "🛡️",
    desc: "Gain 1 block.",
    color: "salt",
    target: "self",
    block: 1,
  },
  torch_sweep: {
    id: "torch_sweep",
    label: "Sweep",
    icon: "🔥",
    desc: "Push an enemy to the opposite row.",
    color: "iron",
    target: "any-enemy",
    pushOpposite: true,
  },

  /* ── Mail Hauberk (armor) ── */
  mail_block: {
    id: "mail_block",
    label: "Mail",
    icon: "🛡️",
    desc: "Gain 1 block.",
    color: "salt",
    target: "self",
    block: 1,
  },
  mail_block2: {
    id: "mail_block2",
    label: "Heavy Mail",
    icon: "🛡️",
    desc: "Gain 2 block.",
    color: "salt",
    target: "self",
    block: 2,
  },
  mail_steady: {
    id: "mail_steady",
    label: "Steady",
    icon: "⛓️",
    desc: "Cleanse 1 status.",
    color: "salt",
    target: "self",
    cleanseSelf: 1,
  },
  mail_edge: {
    id: "mail_edge",
    label: "Edge",
    icon: "⚔️",
    desc: "Damage faces deal +1 this turn.",
    color: "iron",
    target: "self",
    twoHandedBonus: true,
  },
  mail_endurance: {
    id: "mail_endurance",
    label: "Endurance",
    icon: "💚",
    desc: "Heal 1 HP.",
    color: "fire",
    target: "self",
    heal: 1,
  },

  /* ── Robes of the Vigil (late-game armor) ── */
  robes_veil: {
    id: "robes_veil",
    label: "Veil",
    icon: "🌀",
    desc: "Gain Dodge.",
    color: "echo",
    target: "self",
    grantDodge: true,
  },
  robes_hum: {
    id: "robes_hum",
    label: "Hum",
    icon: "🎵",
    desc: "Gain Hymn-Hum — Echo faces count as any color for bust this turn.",
    color: "echo",
    target: "self",
    grantHymnHum: true,
  },
  robes_saltline: {
    id: "robes_saltline",
    label: "Salt-line",
    icon: "🛡️",
    desc: "Gain 1 block.",
    color: "salt",
    target: "self",
    block: 1,
  },
  robes_censer: {
    id: "robes_censer",
    label: "Censer",
    icon: "🔥",
    desc: "1 Fire damage to any enemy (+1 vs undead).",
    color: "fire",
    target: "any-enemy",
    damage: 1,
    damageType: "fire",
  },
  robes_tincture: {
    id: "robes_tincture",
    label: "Tincture",
    icon: "🩸",
    desc: "Apply 1 Bleed to any enemy.",
    color: "brine",
    target: "any-enemy",
    applyStatus: { status: "bleed", stacks: 1 },
  },

  /* ── Steady Hands (basic starting Ability) ── *
   * The Fourth Hand's basic ability — six different colors, one of each effect family.
   * Naturally bust-resistant on its own (every face is unique). Modest in raw power so
   * later abilities feel like real upgrades, but always useful: there's no wasted face
   * except the blank. */
  steady_resolve: {
    id: "steady_resolve",
    label: "Resolve",
    icon: "⚔️",
    desc: "1 slash to any enemy.",
    color: "crimson",
    target: "any-enemy",
    damage: 1,
    damageType: "slash",
  },
  steady_brace: {
    id: "steady_brace",
    label: "Brace",
    icon: "🛡️",
    desc: "Gain 1 block.",
    color: "salt",
    target: "self",
    block: 1,
  },
  steady_breath: {
    id: "steady_breath",
    label: "Catch Breath",
    icon: "💚",
    desc: "Heal 1 HP.",
    color: "fire",
    target: "self",
    heal: 1,
  },
  steady_focus: {
    id: "steady_focus",
    label: "Focus",
    icon: "👁️",
    desc: "Gain Resonance — next color clash is forgiven.",
    color: "echo",
    target: "self",
    grantResonance: true,
  },
  steady_bear_down: {
    id: "steady_bear_down",
    label: "Bear Down",
    icon: "💪",
    desc: "Next damage face deals +1.",
    color: "iron",
    target: "self",
    grantPower: 1,
  },

  /* ── Higher-tier ability faces (etched at shrines / earned in the dungeon) ── */
  ability_smite: {
    id: "ability_smite",
    label: "Smite",
    icon: "✨",
    desc: "2 holy damage to any enemy.",
    color: "fire",
    target: "any-enemy",
    damage: 2,
    damageType: "holy",
  },
  ability_hymn: {
    id: "ability_hymn",
    label: "Hymn",
    icon: "🎵",
    desc: "Gain Hymn-Hum and heal 1 HP.",
    color: "echo",
    target: "self",
    heal: 1,
    grantHymnHum: true,
  },
  ability_ward: {
    id: "ability_ward",
    label: "Ward",
    icon: "🛡️",
    desc: "Gain 3 block, cleanse 1 status.",
    color: "salt",
    target: "self",
    block: 3,
    cleanseSelf: 1,
  },
  ability_brand_break: {
    id: "ability_brand_break",
    label: "Brand-Break",
    icon: "⛓️",
    desc: "Break a slot lock and cleanse 1 status.",
    color: "iron",
    target: "self",
    cleanseSelf: 1,
    breakSlotLock: true,
  },
  ability_coldfire_lance: {
    id: "ability_coldfire_lance",
    label: "Coldfire Lance",
    icon: "☠️",
    desc: "4 damage to any enemy.",
    color: "coldfire",
    target: "any-enemy",
    damage: 4,
    damageType: "pierce",
  },
};

export function getFace(id: string): FaceDef | null {
  return FACES[id] ?? null;
}

/* ── Die Definitions ── */

export const SLOT_ORDER: readonly DieSlot[] = ["main", "offhand", "armor", "ability"];

/** Weapon dice keyed by weapon.id from src/data/weapons.ts. */
export const WEAPON_DICE: Record<string, DieDef> = {
  dagger: {
    id: "die_dagger",
    slot: "main",
    name: "Dagger",
    icon: "🗡️",
    faces: [
      "dagger_stab",
      "dagger_quick",
      "dagger_twist",
      "dagger_open_vein",
      "dagger_flit",
      "blank",
    ],
  },
  warhammer: {
    id: "die_warhammer",
    slot: "main",
    name: "Warhammer",
    icon: "🔨",
    faces: [
      "hammer_smash",
      "hammer_crush",
      "hammer_stagger",
      "hammer_heavybash",
      "hammer_windup",
      "blank",
    ],
  },
};

/** Offhand dice keyed by offhand id. The Fourth Hand starts with a torch. */
export const OFFHAND_DICE: Record<string, DieDef> = {
  torch: {
    id: "die_torch",
    slot: "offhand",
    name: "Torch",
    icon: "🔥",
    faces: [
      "torch_brand",
      "torch_sear",
      "torch_sidestep",
      "torch_ward_off",
      "torch_sweep",
      "blank",
    ],
  },
  shield: {
    id: "die_shield",
    slot: "offhand",
    name: "Shield",
    icon: "🛡️",
    faces: [
      "shield_block",
      "shield_bulwark",
      "shield_cleanse",
      "shield_bash",
      "shield_focus",
      "blank",
    ],
  },
};

/** Armor dice keyed by armor id. */
export const ARMOR_DICE: Record<string, DieDef> = {
  mail_hauberk: {
    id: "die_mail",
    slot: "armor",
    name: "Mail Hauberk",
    icon: "👕",
    faces: ["mail_block", "mail_block2", "mail_steady", "mail_edge", "mail_endurance", "blank"],
  },
  robes_of_the_vigil: {
    id: "die_robes",
    slot: "armor",
    name: "Robes of the Vigil",
    icon: "🥼",
    faces: ["robes_veil", "robes_hum", "robes_saltline", "robes_censer", "robes_tincture", "blank"],
  },
};

/** Starting Ability — "Steady Hands". Six different colors, each useful, one blank.
 * Higher-tier abilities replace this entirely; advanced ability faces are etched at shrines. */
export const ABILITY_STARTING_FACES: readonly [string, string, string, string, string, string] = [
  "steady_resolve",
  "steady_brace",
  "steady_breath",
  "steady_focus",
  "steady_bear_down",
  "blank",
];

export const ABILITY_DIE_TEMPLATE: Omit<DieDef, "faces"> = {
  id: "die_ability",
  slot: "ability",
  name: "Steady Hands",
  icon: "✋",
};

/** Ability dice keyed by ability id. The starter is "steady_hands" (Steady Hands).
 * Higher-tier abilities replace it wholesale — found at shrines, hymnals, and labs in the dungeon. */
export const ABILITY_DICE: Record<
  string,
  {
    readonly id: string;
    readonly name: string;
    readonly icon: string;
    readonly desc: string;
    readonly faces: readonly [string, string, string, string, string, string];
  }
> = {
  steady_hands: {
    id: "steady_hands",
    name: "Steady Hands",
    icon: "✋",
    desc: "The Fourth Hand's basic kit — six different colors, never bust-prone, always useful.",
    faces: [
      "steady_resolve",
      "steady_brace",
      "steady_breath",
      "steady_focus",
      "steady_bear_down",
      "blank",
    ],
  },
  vigil_hymn: {
    id: "vigil_hymn",
    name: "Vigil's Hymn",
    icon: "🎵",
    desc: "Echo-leaning support ability. Hymn-Hum makes Echo bust-immune; Smite finishes the dead.",
    faces: [
      "ability_hymn",
      "ability_smite",
      "ability_ward",
      "steady_focus",
      "steady_resolve",
      "blank",
    ],
  },
  brand_breaker: {
    id: "brand_breaker",
    name: "Brand-Breaker",
    icon: "⛓️",
    desc: "Iron-leaning. Breaks slot-locks and presses through curses. Anti-Salt-Revenant tech.",
    faces: [
      "ability_brand_break",
      "steady_bear_down",
      "steady_brace",
      "steady_resolve",
      "steady_focus",
      "blank",
    ],
  },
  lichbane: {
    id: "lichbane",
    name: "Lichbane",
    icon: "☠️",
    desc: "Anti-undead haymaker. Includes a Coldfire Lance — borrows the enemy's tool at the enemy's risk.",
    faces: [
      "ability_smite",
      "ability_coldfire_lance",
      "ability_ward",
      "steady_resolve",
      "steady_focus",
      "blank",
    ],
  },
};

export function getAbilityDie(abilityId: string | undefined): {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly faces: readonly [string, string, string, string, string, string];
} {
  if (!abilityId) return ABILITY_DICE.steady_hands;
  return ABILITY_DICE[abilityId] ?? ABILITY_DICE.steady_hands;
}

/* ── Lookup helpers ── */

export function getWeaponDie(weaponId: string): DieDef {
  return WEAPON_DICE[weaponId] ?? WEAPON_DICE.dagger;
}

export function getOffhandDie(offhandId: string | null): DieDef {
  if (!offhandId) return OFFHAND_DICE.torch;
  return OFFHAND_DICE[offhandId] ?? OFFHAND_DICE.torch;
}

export function getArmorDie(armorId: string): DieDef {
  return ARMOR_DICE[armorId] ?? ARMOR_DICE.mail_hauberk;
}

export function buildAbilityDie(
  faces: readonly [string, string, string, string, string, string],
): DieDef {
  return { ...ABILITY_DIE_TEMPLATE, faces };
}

export function getDieForSlot(
  slot: DieSlot,
  loadout: {
    mainWeaponId: string;
    offhandId: string | null;
    armorId: string;
    abilityFaces: readonly [string, string, string, string, string, string];
  },
): DieDef {
  switch (slot) {
    case "main":
      return getWeaponDie(loadout.mainWeaponId);
    case "offhand":
      return getOffhandDie(loadout.offhandId);
    case "armor":
      return getArmorDie(loadout.armorId);
    case "ability":
      return buildAbilityDie(loadout.abilityFaces);
  }
}
