import type { ColorDef, DieDef, DieSlot, FaceColor, FaceDef } from "./types";
import {
  IconCrossbow,
  IconCrossedSwords,
  IconDagger,
  IconDrag,
  IconFlame,
  IconFocus,
  IconGear,
  IconHeavyArmor,
  IconHymnHum,
  IconLantern,
  IconLightArmor,
  IconRiposte,
  IconRobe,
  IconShield,
  IconSkull,
  IconSpear,
  IconSun,
  IconSword,
  IconTorch,
  IconWarhammer,
  IconWater,
} from "../icons";

/* ── Color palette ── */

export const COLORS: Record<FaceColor, ColorDef> = {
  crimson: { id: "crimson", label: "Crimson", hex: "#C0303A", badge: "▲" },
  salt: { id: "salt", label: "Salt", hex: "#F4F1E8", badge: "■" },
  fire: { id: "fire", label: "Fire", hex: "#E8821F", badge: "✦" },
  coldfire: { id: "coldfire", label: "Coldfire", hex: "#7B3FA0", badge: "☠" },
  brine: { id: "brine", label: "Brine", hex: "#499237", badge: "◆" },
  echo: { id: "echo", label: "Echo", hex: "#0569a3", badge: "≈" },
  iron: { id: "iron", label: "Iron", hex: "#8A9098", badge: "⬢" },
  blank: { id: "blank", label: "Blank", hex: "#d8cdb6", badge: "·" },
  colorless: { id: "colorless", label: "Colorless", hex: "#111111", badge: "○" },
};

export function getColor(c: FaceColor): ColorDef {
  return COLORS[c];
}

/* ── Faces ── *
 * Each face is a small effect bag, identified by id, with one of seven colors, blank, or colorless.
 * Two faces sharing a color (including blank) triggers a bust. Colorless never contributes to a bust. */

export const FACES: Record<string, FaceDef> = {
  /* Universal */
  blank: {
    id: "blank",
    label: "Blank",
    color: "blank",
    target: "none",
    symbols: [],
  },

  /* ── Dagger (main hand) ── */
  dagger_stab: {
    id: "dagger_stab",
    label: "Stab",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword"],
  },
  dagger_quick: {
    id: "dagger_quick",
    label: "Quick Stab",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword", "sword"],
  },
  dagger_open_vein: {
    id: "dagger_open_vein",
    label: "Open Vein",
    color: "brine",
    target: "any-enemy",
    symbols: ["drop", "drop"],
  },
  dagger_flit: {
    id: "dagger_flit",
    label: "Flit",
    color: "echo",
    target: "self",
    symbols: ["dodge"],
  },

  /* ── Warhammer (main hand) ── */
  hammer_smash: {
    id: "hammer_smash",
    label: "Smash",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword", "sword"],
  },
  hammer_crush: {
    id: "hammer_crush",
    label: "Crush",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword", "sword", "sword"],
  },
  hammer_heavybash: {
    id: "hammer_heavybash",
    label: "Heavy Bash",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "sword", "spark"],
  },
  hammer_windup: {
    id: "hammer_windup",
    label: "Wind Up",
    color: "echo",
    target: "self",
    symbols: ["power", "power"],
  },

  /* ── Shield (off hand) ── */
  shield_block: {
    id: "shield_block",
    label: "Block",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield"],
  },
  shield_bulwark: {
    id: "shield_bulwark",
    label: "Bulwark",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield", "shield"],
  },
  shield_cleanse: {
    id: "shield_cleanse",
    label: "Cleanse",
    color: "salt",
    target: "self",
    symbols: ["cleanse"],
  },
  shield_bash: {
    id: "shield_bash",
    label: "Bash",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "spark"],
  },
  shield_focus: {
    id: "shield_focus",
    label: "Focus",
    color: "echo",
    target: "self",
    symbols: ["resonance"],
  },
  ability_focus_mind: {
    id: "ability_focus_mind",
    label: "Focus Mind",
    color: "echo",
    target: "self",
    symbols: ["focus"],
  },

  /* ── Torch (off hand starter) ── *
   * The Fourth Hand enters the mine with a knife and a torch. Two Fire faces give
   * the torch a real damage identity but make same-die rerolls risky — mirroring
   * the Dagger's two-Crimson pattern. Torch + Dagger have minimal color overlap,
   * so combining them is naturally safe. */
  torch_brand: {
    id: "torch_brand",
    label: "Brand",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "ranged"],
  },
  torch_sear: {
    id: "torch_sear",
    label: "Sear",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "flame"],
  },
  torch_sidestep: {
    id: "torch_sidestep",
    label: "Sidestep",
    color: "echo",
    target: "self",
    symbols: ["dodge"],
  },
  torch_sweep: {
    id: "torch_sweep",
    label: "Sweep",
    color: "iron",
    target: "any-enemy",
    symbols: ["push"],
  },

  /* ── Mail Hauberk (armor) ── */
  mail_block: {
    id: "mail_block",
    label: "Mail",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },
  mail_block2: {
    id: "mail_block2",
    label: "Heavy Mail",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield"],
  },
  mail_steady: {
    id: "mail_steady",
    label: "Steady",
    color: "salt",
    target: "self",
    symbols: ["cleanse"],
  },
  mail_edge: {
    id: "mail_edge",
    label: "Edge",
    color: "iron",
    target: "self",
    symbols: ["sun"],
  },
  mail_endurance: {
    id: "mail_endurance",
    label: "Endurance",
    color: "fire",
    target: "self",
    symbols: ["heart"],
  },

  /* ── Robes of the Vigil (late-game armor) ── */
  robes_veil: {
    id: "robes_veil",
    label: "Veil",
    color: "echo",
    target: "self",
    symbols: ["dodge"],
  },
  robes_hum: {
    id: "robes_hum",
    label: "Hum",
    color: "echo",
    target: "self",
    symbols: ["hymn_hum"],
  },
  robes_saltline: {
    id: "robes_saltline",
    label: "Salt-line",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },
  robes_censer: {
    id: "robes_censer",
    label: "Censer",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "ranged", "holy"],
  },
  robes_tincture: {
    id: "robes_tincture",
    label: "Tincture",
    color: "brine",
    target: "any-enemy",
    symbols: ["drop", "ranged"],
  },

  /* ── Steady Hands (basic starting Ability) ── *
   * The Fourth Hand's basic ability — six different colors, one of each effect family.
   * Naturally bust-resistant on its own (every face is unique). Modest in raw power so
   * later abilities feel like real upgrades, but always useful: there's no wasted face
   * except the blank. */
  steady_resolve: {
    id: "steady_resolve",
    label: "Resolve",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword", "ranged"],
  },
  steady_brace: {
    id: "steady_brace",
    label: "Brace",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },
  steady_breath: {
    id: "steady_breath",
    label: "Catch Breath",
    color: "fire",
    target: "self",
    symbols: ["heart"],
  },
  steady_focus: {
    id: "steady_focus",
    label: "Focus",
    color: "echo",
    target: "self",
    symbols: ["resonance"],
  },
  steady_bear_down: {
    id: "steady_bear_down",
    label: "Bear Down",
    color: "iron",
    target: "self",
    symbols: ["power"],
  },

  /* ── Higher-tier ability faces (etched at shrines / earned in the dungeon) ── */
  ability_smite: {
    id: "ability_smite",
    label: "Smite",
    color: "fire",
    target: "any-enemy",
    symbols: ["sword", "sword", "holy", "ranged"],
  },
  ability_hymn: {
    id: "ability_hymn",
    label: "Hymn",
    color: "echo",
    target: "self",
    symbols: ["heart", "hymn_hum"],
  },
  ability_ward: {
    id: "ability_ward",
    label: "Ward",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield", "shield", "cleanse"],
  },
  ability_coldfire_lance: {
    id: "ability_coldfire_lance",
    label: "Coldfire Lance",
    color: "coldfire",
    target: "any-enemy",
    symbols: ["sword", "sword", "sword", "sword", "pierce", "ranged"],
  },

  /* ── v3 weapons (authored as symbol bags) ── */

  /* Crossbow — every face `ranged`. Trades raw damage for back-row reach. */
  crossbow_bolt: {
    id: "crossbow_bolt",
    label: "Bolt",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "ranged"],
  },
  crossbow_heavy: {
    id: "crossbow_heavy",
    label: "Heavy Bolt",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "sword", "ranged"],
  },
  crossbow_punch: {
    id: "crossbow_punch",
    label: "Punch-Through",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword", "ranged", "pierce"],
  },
  crossbow_pin: {
    id: "crossbow_pin",
    label: "Pin",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "spark", "ranged"],
  },
  crossbow_load: {
    id: "crossbow_load",
    label: "Load",
    color: "echo",
    target: "self",
    symbols: ["power"],
  },

  /* Spear — riposte weapon. */
  spear_set: {
    id: "spear_set",
    label: "Set",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "riposte"],
  },
  spear_lunge: {
    id: "spear_lunge",
    label: "Lunge",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword", "sword"],
  },
  spear_thrust: {
    id: "spear_thrust",
    label: "Thrust",
    color: "brine",
    target: "any-enemy",
    symbols: ["sword", "drop"],
  },
  spear_brace: {
    id: "spear_brace",
    label: "Brace",
    color: "salt",
    target: "self",
    symbols: ["shield", "riposte"],
  },
  spear_reach: {
    id: "spear_reach",
    label: "Reach",
    color: "echo",
    target: "any-enemy",
    symbols: ["sword", "ranged"],
  },

  /* Greatsword — two-handed (occupies offhand too). Area on three faces. */
  greatsword_cleave: {
    id: "greatsword_cleave",
    label: "Cleave",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword", "sword", "area"],
  },
  greatsword_sweep: {
    id: "greatsword_sweep",
    label: "Sweep",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword", "sword", "sword", "area"],
  },
  greatsword_overhead: {
    id: "greatsword_overhead",
    label: "Overhead",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "sword", "spark"],
  },
  greatsword_arc: {
    id: "greatsword_arc",
    label: "Arc",
    color: "brine",
    target: "any-enemy",
    symbols: ["sword", "drop", "area"],
  },
  greatsword_guard: {
    id: "greatsword_guard",
    label: "Guard",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield"],
  },

  /* Censer — Fire + holy on every face. */
  censer_swing: {
    id: "censer_swing",
    label: "Swing",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "holy"],
  },
  censer_smolder: {
    id: "censer_smolder",
    label: "Smolder",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "flame", "holy"],
  },
  censer_asperge: {
    id: "censer_asperge",
    label: "Asperge",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "cleanse", "holy"],
  },
  censer_pour: {
    id: "censer_pour",
    label: "Pour",
    color: "salt",
    target: "self",
    symbols: ["heart", "cleanse"],
  },
  censer_ward: {
    id: "censer_ward",
    label: "Ward",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },

  /* Buckler — defensive ripostes. */
  buckler_parry: {
    id: "buckler_parry",
    label: "Parry",
    color: "salt",
    target: "self",
    symbols: ["shield", "riposte"],
  },
  buckler_punch: {
    id: "buckler_punch",
    label: "Punch",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword"],
  },
  buckler_brace: {
    id: "buckler_brace",
    label: "Brace",
    color: "colorless",
    target: "self",
    symbols: ["shield"],
  },
  buckler_dodge: {
    id: "buckler_dodge",
    label: "Slip",
    color: "colorless",
    target: "self",
    symbols: ["dodge"],
  },
  buckler_riposte: {
    id: "buckler_riposte",
    label: "Riposte",
    color: "iron",
    target: "self",
    symbols: ["riposte", "cleanse"],
  },

  /* Lantern — fire + ranged + Mark. */
  lantern_reveal: {
    id: "lantern_reveal",
    label: "Reveal",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "mark", "ranged"],
  },
  lantern_beam: {
    id: "lantern_beam",
    label: "Beam",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "ranged"],
  },
  lantern_mark: {
    id: "lantern_mark",
    label: "Mark",
    color: "echo",
    target: "any-enemy",
    symbols: ["mark", "ranged"],
  },
  lantern_warmth: {
    id: "lantern_warmth",
    label: "Warmth",
    color: "fire",
    target: "self",
    symbols: ["heart"],
  },
  lantern_focus: {
    id: "lantern_focus",
    label: "Focus",
    color: "echo",
    target: "self",
    symbols: ["sun"],
  },

  /* Vials of Brine — bleed stacking. */
  vials_pour: {
    id: "vials_pour",
    label: "Pour",
    color: "brine",
    target: "any-enemy",
    symbols: ["drop", "drop", "ranged"],
  },
  vials_splash: {
    id: "vials_splash",
    label: "Splash",
    color: "brine",
    target: "any-enemy",
    symbols: ["sword", "drop", "ranged"],
  },
  vials_drench: {
    id: "vials_drench",
    label: "Drench",
    color: "brine",
    target: "any-enemy",
    symbols: ["drop", "area"],
  },
  vials_cure: {
    id: "vials_cure",
    label: "Cure",
    color: "salt",
    target: "self",
    symbols: ["heart", "cleanse"],
  },
  /* Plate armor */
  plate_wall: {
    id: "plate_wall",
    label: "Wall",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield", "shield"],
  },
  plate_mass: {
    id: "plate_mass",
    label: "Mass",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield"],
  },
  plate_step: {
    id: "plate_step",
    label: "Step",
    color: "iron",
    target: "any-enemy",
    symbols: ["shield", "push"],
  },
  plate_grind: {
    id: "plate_grind",
    label: "Grind",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "pierce"],
  },
  plate_endurance: {
    id: "plate_endurance",
    label: "Endurance",
    color: "fire",
    target: "self",
    symbols: ["heart"],
  },

  /* Cloak of the Stalker — colorless faces, push-luck friendly. */
  cloak_slip: {
    id: "cloak_slip",
    label: "Slip",
    color: "colorless",
    target: "self",
    symbols: ["riposte"],
  },
  cloak_fade: {
    id: "cloak_fade",
    label: "Fade",
    color: "colorless",
    target: "self",
    symbols: ["shield"],
  },
  cloak_shroud: {
    id: "cloak_shroud",
    label: "Shroud",
    color: "colorless",
    target: "self",
    symbols: ["dodge"],
  },
  cloak_breath: {
    id: "cloak_breath",
    label: "Breath",
    color: "fire",
    target: "self",
    symbols: ["heart"],
  },
  cloak_strike: {
    id: "cloak_strike",
    label: "Strike",
    color: "brine",
    target: "any-enemy",
    symbols: ["sword", "drop"],
  },

  /* ── New player faces (enemy-counter gaps) ── */

  // Brine: cash out Bleed stacks as burst (or re-apply if none). Vampire Lord kill window.
  brine_hemorrhage: {
    id: "brine_hemorrhage",
    label: "Hemorrhage",
    color: "brine",
    target: "any-enemy",
    symbols: ["bleed_burst", "pierce"],
  },

  // Salt: 2 block.
  salt_unclasp: {
    id: "salt_unclasp",
    label: "Unclasp",
    color: "colorless",
    target: "self",
    symbols: ["shield", "shield"],
  },

  // Iron: armor-break — reduces enemy warded by 1 permanently.
  iron_armor_shatter: {
    id: "iron_armor_shatter",
    label: "Armor Shatter",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "armor_break"],
  },

  // Crimson: 1 damage + Mark on same target — enables follow-up doubling.
  crimson_marked_flesh: {
    id: "crimson_marked_flesh",
    label: "Marked Flesh",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword", "mark"],
  },

  // Fire: Weaken rider on fire damage — bridges Fire+Coldfire naturally on Torch.
  fire_consuming_blaze: {
    id: "fire_consuming_blaze",
    label: "Consuming Blaze",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "bolt"],
  },

  /* ── v3 enemy faces (player-targeting offensive symbols, or self-targeting for armor/heals) ── */

  enemy_bite_1: {
    id: "enemy_bite_1",
    label: "Bite",
    color: "crimson",
    target: "self",
    symbols: ["sword"],
  },
  enemy_reproduce: {
    id: "enemy_reproduce",
    label: "Reproduce",
    color: "colorless",
    target: "self",
    symbols: ["reproduce"],
  },

  /* Skeleton offense */
  enemy_bone_strike: {
    id: "enemy_bone_strike",
    label: "Strike",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword"],
  },
  enemy_bone_lurch: {
    id: "enemy_bone_lurch",
    label: "Lurch",
    color: "crimson",
    target: "self",
    symbols: ["sword"],
  },

  /* Skeleton armor die */
  enemy_shield_2: {
    id: "enemy_shield_2",
    label: "Guard",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield"],
  },
  enemy_armor_2: {
    id: "enemy_armor_2",
    label: "Brace",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield", "taunt"],
  },
  enemy_shield_1: {
    id: "enemy_shield_1",
    label: "Ward",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },
  enemy_armor_strike: {
    id: "enemy_armor_strike",
    label: "Bash-Brace",
    color: "iron",
    target: "self",
    symbols: ["shield", "sword"],
  },

  /* Banshee — Wail die faces */
  enemy_wail_stun3: {
    id: "enemy_wail_stun3",
    label: "Shriek",
    color: "echo",
    target: "self",
    symbols: ["spark", "spark", "spark"],
  },
  enemy_wail_stun2: {
    id: "enemy_wail_stun2",
    label: "Wail",
    color: "coldfire",
    target: "self",
    symbols: ["spark", "spark"],
  },
  enemy_wail_weaken2: {
    id: "enemy_wail_weaken2",
    label: "Keen Wail",
    color: "brine",
    target: "self",
    symbols: ["bolt", "bolt"],
  },
  enemy_wail_vulnerable: {
    id: "enemy_wail_vulnerable",
    label: "Harrowing Cry",
    color: "iron",
    target: "self",
    symbols: ["mark"],
  },
  /* Banshee — Ghost die faces */
  enemy_ghost_dodge: {
    id: "enemy_ghost_dodge",
    label: "Phase",
    color: "echo",
    target: "self",
    symbols: ["dodge"],
  },
  enemy_ghost_ranged_unblockable: {
    id: "enemy_ghost_ranged_unblockable",
    label: "Haunting Strike",
    color: "coldfire",
    target: "self",
    symbols: ["sword", "ranged", "unblockable"],
  },
  enemy_wail: {
    id: "enemy_wail",
    label: "Wail",
    color: "echo",
    target: "self",
    symbols: ["sword", "sword", "sword", "unblockable"],
  },
  enemy_drone: {
    id: "enemy_drone",
    label: "Drone",
    color: "coldfire",
    target: "self",
    symbols: ["bolt", "bolt", "unblockable"],
  },
  enemy_chant: {
    id: "enemy_chant",
    label: "Chant",
    color: "salt",
    target: "self",
    symbols: ["heart"],
  },

  /* Generic shared enemy faces */
  enemy_grasp: {
    id: "enemy_grasp",
    label: "Grasp",
    color: "brine",
    target: "self",
    symbols: ["sword", "drop"],
  },
  enemy_phantom_strike: {
    id: "enemy_phantom_strike",
    label: "Phantom Strike",
    color: "echo",
    target: "self",
    symbols: ["sword", "sword", "unblockable"],
  },
  enemy_drain: {
    id: "enemy_drain",
    label: "Drain",
    color: "brine",
    target: "self",
    symbols: ["sword", "sword", "heart"],
  },
  enemy_drain_heavy: {
    id: "enemy_drain_heavy",
    label: "Sanguine Drain",
    color: "coldfire",
    target: "self",
    symbols: ["sword", "sword", "sword"],
  },
  enemy_shadow_strike: {
    id: "enemy_shadow_strike",
    label: "Shadow Strike",
    color: "coldfire",
    target: "self",
    symbols: ["sword", "unblockable"],
  },
  enemy_pilfer: {
    id: "enemy_pilfer",
    label: "Pilfer",
    color: "iron",
    target: "self",
    symbols: ["steal"],
  },
  enemy_bind: {
    id: "enemy_bind",
    label: "Bind",
    color: "salt",
    target: "self",
    symbols: ["bind"],
  },
  enemy_crush: {
    id: "enemy_crush",
    label: "Crush",
    color: "iron",
    target: "self",
    symbols: ["sword", "sword", "sword"],
  },
  enemy_great_cleave: {
    id: "enemy_great_cleave",
    label: "Bone Cleave",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword", "sword", "area"],
  },
  enemy_brand: {
    id: "enemy_brand",
    label: "Brand",
    color: "coldfire",
    target: "self",
    symbols: ["mark", "unblockable"],
  },
  enemy_cold_lamp: {
    id: "enemy_cold_lamp",
    label: "Cold Lamp",
    color: "coldfire",
    target: "self",
    symbols: ["sword", "sword", "sword", "unblockable"],
  },
  enemy_echo_lance: {
    id: "enemy_echo_lance",
    label: "Echo Lance",
    color: "echo",
    target: "self",
    symbols: ["sword", "sword", "sword", "bolt", "unblockable"],
  },

  // Heap of Bones — rises immediately into a Skeleton on this face
  enemy_reform: {
    id: "enemy_reform",
    label: "Reform",
    color: "iron",
    target: "self",
    symbols: ["reform"],
  },

  // Ghost intangibility
  enemy_intangible: {
    id: "enemy_intangible",
    label: "Phase",
    color: "echo",
    target: "self",
    symbols: ["intangible"],
  },

  // Forsworn main hand
  enemy_forsworn_strike2: {
    id: "enemy_forsworn_strike2",
    label: "Strike",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword"],
  },
  enemy_forsworn_strike3: {
    id: "enemy_forsworn_strike3",
    label: "Heavy Strike",
    color: "iron",
    target: "self",
    symbols: ["sword", "sword", "sword"],
  },
  // Forsworn offhand (damage + defense combos)
  enemy_forsworn_guard1: {
    id: "enemy_forsworn_guard1",
    label: "Guard",
    color: "salt",
    target: "self",
    symbols: ["sword", "shield"],
  },
  enemy_forsworn_guard2: {
    id: "enemy_forsworn_guard2",
    label: "Press",
    color: "iron",
    target: "self",
    symbols: ["sword", "sword", "shield"],
  },
  enemy_forsworn_bulwark: {
    id: "enemy_forsworn_bulwark",
    label: "Bulwark",
    color: "echo",
    target: "self",
    symbols: ["sword", "shield", "shield"],
  },

  // Salt Revenant slot lock
  enemy_salt_grapple: {
    id: "enemy_salt_grapple",
    label: "Salt-Grapple",
    color: "salt",
    target: "self",
    symbols: ["sword", "sword", "bind"],
  },

  // Gutborn Larva — surfaces immediately and spawns a Zombie
  enemy_burrow: {
    id: "enemy_burrow",
    label: "Burrow",
    color: "brine",
    target: "self",
    symbols: ["burrow_spawn"],
  },

  // False Sacrarium curse
  enemy_litany: {
    id: "enemy_litany",
    label: "Blessing Inversion",
    color: "coldfire",
    target: "self",
    symbols: ["invert"],
  },

  // Boss: Skeleton Lord
  enemy_bone_cleave_boss: {
    id: "enemy_bone_cleave_boss",
    label: "Bone Cleave",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword", "sword", "sword", "sword", "sword", "area"],
  },

  // Boss: Vampire Lord
  enemy_sanguine_drain: {
    id: "enemy_sanguine_drain",
    label: "Sanguine Drain",
    color: "brine",
    target: "self",
    symbols: ["sword", "sword", "sword", "sword", "sword", "sword", "heart", "heart", "heart"],
  },

  // Boss: Lich King — phase 1
  enemy_lich_cold_lamp: {
    id: "enemy_lich_cold_lamp",
    label: "Cold Lamp",
    color: "coldfire",
    target: "self",
    symbols: ["sword", "sword", "sword", "sword", "sword", "bolt", "unblockable"],
  },
  // Boss: Lich King — phase 2
  enemy_lich_tithe_mark: {
    id: "enemy_lich_tithe_mark",
    label: "Tithe-Mark",
    color: "brine",
    target: "self",
    symbols: ["sword", "sword", "sword", "sword", "mark"],
  },
  // Boss: Lich King — phase 3
  enemy_lich_hymn_break: {
    id: "enemy_lich_hymn_break",
    label: "Hymn-Break",
    color: "echo",
    target: "self",
    symbols: ["sword", "sword", "sword", "unblockable"],
  },

  /* ── Rat ── */
  enemy_rat_strike: {
    id: "enemy_rat_strike",
    label: "Gnaw",
    color: "crimson",
    target: "self",
    symbols: ["sword"],
  },
  enemy_rat_dodge: {
    id: "enemy_rat_dodge",
    label: "Dodge",
    color: "colorless",
    target: "self",
    symbols: ["dodge"],
  },

  /* ── Ghoul stealth die ── */
  enemy_ghoul_hide: {
    id: "enemy_ghoul_hide",
    label: "Hide",
    color: "colorless",
    target: "self",
    symbols: ["hide", "shield"],
  },
  enemy_ghoul_dodge: {
    id: "enemy_ghoul_dodge",
    label: "Dodge",
    color: "colorless",
    target: "self",
    symbols: ["hide", "intangible"],
  },
  enemy_ghoul_parry: {
    id: "enemy_ghoul_parry",
    label: "Parry",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield"],
  },

  /* ── Ghoul attack die ── */
  enemy_ghoul_sneak_attack: {
    id: "enemy_ghoul_sneak_attack",
    label: "Sneak Attack",
    color: "coldfire",
    target: "self",
    symbols: ["sneak_attack", "sword", "sword", "sword", "sword", "unblockable"],
  },
  enemy_ghoul_claw: {
    id: "enemy_ghoul_claw",
    label: "Claw",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword"],
  },
  enemy_ghoul_bite: {
    id: "enemy_ghoul_bite",
    label: "Bite",
    color: "brine",
    target: "self",
    symbols: ["sword", "sword", "heart"],
  },

  /* ── Necromancer ── */
  enemy_necro_summon: {
    id: "enemy_necro_summon",
    label: "Raise Zombie",
    color: "coldfire",
    target: "self",
    symbols: ["summon"],
  },
  enemy_necro_focus: {
    id: "enemy_necro_focus",
    label: "Focus",
    color: "echo",
    target: "self",
    symbols: ["focus"],
  },
  enemy_necro_focus_bolster: {
    id: "enemy_necro_focus_bolster",
    label: "Focus + Bolster",
    color: "echo",
    target: "self",
    symbols: ["focus", "sun"],
  },
  enemy_necro_bolt: {
    id: "enemy_necro_bolt",
    label: "Death Bolt",
    color: "coldfire",
    target: "any-enemy",
    symbols: ["ranged", "sword", "sword"],
  },
  enemy_necro_bolt_mark: {
    id: "enemy_necro_bolt_mark",
    label: "Death Bolt+",
    color: "coldfire",
    target: "any-enemy",
    symbols: ["ranged", "sword", "sword", "mark"],
  },
  enemy_necro_focus_double: {
    id: "enemy_necro_focus_double",
    label: "Deep Focus",
    color: "echo",
    target: "self",
    symbols: ["focus", "focus"],
  },

  /* ── Zombie ── */
  enemy_zombie_slam: {
    id: "enemy_zombie_slam",
    label: "Slam",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword", "sword", "sword"],
  },
  enemy_zombie_lurch: {
    id: "enemy_zombie_lurch",
    label: "Lurch",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword", "sword"],
  },

  /* ── Dagger (dice-spec) ── */
  dagger_spec_light: {
    id: "dagger_spec_light",
    label: "Light Cut",
    color: "colorless",
    target: "any-enemy",
    symbols: ["sword"],
  },
  dagger_spec_sneak1: {
    id: "dagger_spec_sneak1",
    label: "Sneak Strike",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sneak_attack", "sword", "sword", "sword", "sword"],
  },
  dagger_spec_stab: {
    id: "dagger_spec_stab",
    label: "Stab",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "sword"],
  },

  /* ── Crossbow (dice-spec) ── */
  crossbow_spec_shot: {
    id: "crossbow_spec_shot",
    label: "Crossbow Shot",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "sword", "ranged"],
  },
  crossbow_spec_light_shot: {
    id: "crossbow_spec_light_shot",
    label: "Light Shot",
    color: "echo",
    target: "any-enemy",
    symbols: ["sword", "ranged"],
  },
  crossbow_spec_pierce_shot: {
    id: "crossbow_spec_pierce_shot",
    label: "Piercing Shot",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword", "ranged", "pierce"],
  },

  /* ── Shield (dice-spec) ── */
  shield_spec_block2: {
    id: "shield_spec_block2",
    label: "Raise Shield",
    color: "iron",
    target: "self",
    symbols: ["shield", "shield"],
  },
  shield_spec_block1: {
    id: "shield_spec_block1",
    label: "Brace",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },
  shield_spec_push: {
    id: "shield_spec_push",
    label: "Shield Shove",
    color: "echo",
    target: "any-enemy",
    symbols: ["push"],
  },
  shield_spec_stun: {
    id: "shield_spec_stun",
    label: "Shield Bash",
    color: "brine",
    target: "any-enemy",
    symbols: ["spark"],
  },

  /* ── Torch (dice-spec) ── */
  torch_spec_blind2: {
    id: "torch_spec_blind2",
    label: "Blind",
    color: "fire",
    target: "any-enemy",
    symbols: ["bolt", "bolt"],
  },
  torch_spec_blind1: {
    id: "torch_spec_blind1",
    label: "Dazzle",
    color: "fire",
    target: "any-enemy",
    symbols: ["bolt"],
  },
  torch_spec_fire2: {
    id: "torch_spec_fire2",
    label: "Burn",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "flame"],
  },
  torch_spec_fire1: {
    id: "torch_spec_fire1",
    label: "Singe",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame"],
  },
  torch_spec_reveal: {
    id: "torch_spec_reveal",
    label: "Sweep Light",
    color: "echo",
    target: "any-enemy",
    symbols: ["mark", "ranged"],
  },

  /* ── Censer (dice-spec offhand) ── */
  censer_spec_cleanse: {
    id: "censer_spec_cleanse",
    label: "Cleanse",
    color: "salt",
    target: "self",
    symbols: ["cleanse"],
  },
  censer_spec_blind: {
    id: "censer_spec_blind",
    label: "Smoke",
    color: "echo",
    target: "any-enemy",
    symbols: ["bolt"],
  },
  censer_spec_dodge: {
    id: "censer_spec_dodge",
    label: "Sway",
    color: "brine",
    target: "self",
    symbols: ["dodge"],
  },
  censer_spec_hide: {
    id: "censer_spec_hide",
    label: "Veil",
    color: "coldfire",
    target: "self",
    symbols: ["hide"],
  },

  /* ── Main Gauche (dice-spec) ── */
  gauche_defend_dmg1: {
    id: "gauche_defend_dmg1",
    label: "Guard Cut",
    color: "iron",
    target: "any-enemy",
    symbols: ["shield", "shield", "sword"],
  },
  gauche_defend_dmg2: {
    id: "gauche_defend_dmg2",
    label: "Parry Thrust",
    color: "crimson",
    target: "any-enemy",
    symbols: ["shield", "sword", "sword"],
  },
  gauche_riposte1: {
    id: "gauche_riposte1",
    label: "Riposte",
    color: "salt",
    target: "any-enemy",
    symbols: ["riposte"],
  },
  gauche_riposte2: {
    id: "gauche_riposte2",
    label: "Sharp Riposte",
    color: "brine",
    target: "any-enemy",
    symbols: ["riposte", "riposte"],
  },
  gauche_redirect: {
    id: "gauche_redirect",
    label: "Redirect",
    color: "echo",
    target: "self",
    symbols: ["taunt"],
  },

  /* ── Long Sword (dice-spec) ── */
  longsword_dmg2: {
    id: "longsword_dmg2",
    label: "Swing",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword", "sword"],
  },
  longsword_vulnerable: {
    id: "longsword_vulnerable",
    label: "Expose",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "mark"],
  },
  longsword_bleed1: {
    id: "longsword_bleed1",
    label: "Draw Blood",
    color: "brine",
    target: "any-enemy",
    symbols: ["sword", "drop"],
  },
  longsword_bleed2: {
    id: "longsword_bleed2",
    label: "Deep Cut",
    color: "brine",
    target: "any-enemy",
    symbols: ["sword", "drop", "drop"],
  },
  longsword_riposte: {
    id: "longsword_riposte",
    label: "Riposte",
    color: "salt",
    target: "any-enemy",
    symbols: ["riposte", "riposte"],
  },

  /* ── Claymore (dice-spec) ── */
  claymore_cleave2: {
    id: "claymore_cleave2",
    label: "Great Cleave",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword", "sword", "area"],
  },
  claymore_cleave1: {
    id: "claymore_cleave1",
    label: "Wide Arc",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "area"],
  },
  claymore_cleave_bleed: {
    id: "claymore_cleave_bleed",
    label: "Rend",
    color: "brine",
    target: "any-enemy",
    symbols: ["sword", "area", "drop"],
  },
  claymore_dmg3: {
    id: "claymore_dmg3",
    label: "Overhead",
    color: "salt",
    target: "any-enemy",
    symbols: ["sword", "sword", "sword"],
  },

  /* ── Pickaxe (dice-spec) ── */
  pickaxe_smash: {
    id: "pickaxe_smash",
    label: "Smash",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword", "sword"],
  },
  pickaxe_crack: {
    id: "pickaxe_crack",
    label: "Crack",
    color: "iron",
    target: "any-enemy",
    symbols: ["armor_break"],
  },
  pickaxe_shatter: {
    id: "pickaxe_shatter",
    label: "Shatter",
    color: "salt",
    target: "any-enemy",
    symbols: ["armor_break", "armor_break"],
  },
  pickaxe_chip: {
    id: "pickaxe_chip",
    label: "Chip",
    color: "echo",
    target: "any-enemy",
    symbols: ["sword"],
  },
  pickaxe_stun: {
    id: "pickaxe_stun",
    label: "Stagger",
    color: "brine",
    target: "any-enemy",
    symbols: ["spark"],
  },

  /* ── Spiked Armor (dice-spec) ── */
  spiked_riposte_def1: {
    id: "spiked_riposte_def1",
    label: "Spike Ward",
    color: "iron",
    target: "self",
    symbols: ["riposte", "riposte", "shield"],
  },
  spiked_riposte3_def2: {
    id: "spiked_riposte3_def2",
    label: "Iron Thorns",
    color: "crimson",
    target: "self",
    symbols: ["riposte", "riposte", "riposte", "shield", "shield"],
  },
  spiked_def1: {
    id: "spiked_def1",
    label: "Brace",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },

  /* ── Shadow Cloak (dice-spec) ── */
  cloak_dodge_colorless: {
    id: "cloak_dodge_colorless",
    label: "Slip",
    color: "colorless",
    target: "self",
    symbols: ["dodge"],
  },
  cloak_hide_colorless: {
    id: "cloak_hide_colorless",
    label: "Vanish",
    color: "colorless",
    target: "self",
    symbols: ["hide"],
  },
  cloak_dodge_color: {
    id: "cloak_dodge_color",
    label: "Sidestep",
    color: "echo",
    target: "self",
    symbols: ["dodge"],
  },
  cloak_hide_color: {
    id: "cloak_hide_color",
    label: "Shadow",
    color: "coldfire",
    target: "self",
    symbols: ["hide"],
  },
  cloak_def: {
    id: "cloak_def",
    label: "Shroud",
    color: "iron",
    target: "self",
    symbols: ["shield"],
  },

  /* ── Steady Hands (dice-spec) ── */
  steady_spec_bolster2: {
    id: "steady_spec_bolster2",
    label: "Steady",
    color: "salt",
    target: "self",
    symbols: ["sun", "sun"],
  },
  steady_spec_cleanse: {
    id: "steady_spec_cleanse",
    label: "Breathe",
    color: "brine",
    target: "self",
    symbols: ["cleanse"],
  },
  steady_spec_heal2: {
    id: "steady_spec_heal2",
    label: "Recover",
    color: "echo",
    target: "self",
    symbols: ["heart", "heart"],
  },

  /* ── Curse Uttering (dice-spec) ── */
  curse_weaken4: {
    id: "curse_weaken4",
    label: "Curse",
    color: "coldfire",
    target: "any-enemy",
    symbols: ["bolt", "bolt", "bolt", "bolt"],
  },
  curse_mark4: {
    id: "curse_mark4",
    label: "Mark",
    color: "crimson",
    target: "any-enemy",
    symbols: ["mark", "mark", "mark", "mark"],
  },
  curse_vulnerable4: {
    id: "curse_vulnerable4",
    label: "Expose",
    color: "brine",
    target: "any-enemy",
    symbols: ["mark", "mark", "mark", "mark", "pierce"],
  },
  curse_stun: {
    id: "curse_stun",
    label: "Hex",
    color: "iron",
    target: "any-enemy",
    symbols: ["spark"],
  },

  /* ── Plate Armor (dice-spec) ── */
  plate_spec_def2: {
    id: "plate_spec_def2",
    label: "Iron Wall",
    color: "iron",
    target: "self",
    symbols: ["shield", "shield"],
  },
  plate_spec_def3: {
    id: "plate_spec_def3",
    label: "Fortress",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield", "shield"],
  },

  /* ── Battle Cries (dice-spec) ── */
  cry_bolster1: {
    id: "cry_bolster1",
    label: "Rally",
    color: "salt",
    target: "self",
    symbols: ["sun"],
  },
  cry_bolster2: {
    id: "cry_bolster2",
    label: "War Cry",
    color: "brine",
    target: "self",
    symbols: ["sun", "sun"],
  },
  cry_stun: {
    id: "cry_stun",
    label: "Shout",
    color: "echo",
    target: "any-enemy",
    symbols: ["spark"],
  },
  cry_weaken_all: {
    id: "cry_weaken_all",
    label: "Demoralize",
    color: "coldfire",
    target: "any-enemy",
    symbols: ["bolt", "area"],
  },
  cry_push_cleave: {
    id: "cry_push_cleave",
    label: "Charge",
    color: "crimson",
    target: "any-enemy",
    symbols: ["push", "area"],
  },
  cry_mark_all: {
    id: "cry_mark_all",
    label: "Target",
    color: "iron",
    target: "any-enemy",
    symbols: ["mark", "area"],
  },

  /* ── Leather Armor (dice-spec) ── */
  leather_def1: {
    id: "leather_def1",
    label: "Padding",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },
  leather_def2: {
    id: "leather_def2",
    label: "Brace",
    color: "iron",
    target: "self",
    symbols: ["shield", "shield"],
  },
  leather_dodge: {
    id: "leather_dodge",
    label: "Duck",
    color: "echo",
    target: "self",
    symbols: ["dodge"],
  },
  /* ── Test Poisoner ── */
  enemy_poisoner_p1: {
    id: "enemy_poisoner_p1",
    label: "Venom",
    color: "brine",
    target: "self",
    symbols: ["poison"],
  },
  enemy_poisoner_p2: {
    id: "enemy_poisoner_p2",
    label: "Venom II",
    color: "brine",
    target: "self",
    symbols: ["poison", "poison"],
  },
  enemy_poisoner_p3: {
    id: "enemy_poisoner_p3",
    label: "Venom III",
    color: "brine",
    target: "self",
    symbols: ["poison", "poison", "poison"],
  },
  enemy_poisoner_p4: {
    id: "enemy_poisoner_p4",
    label: "Venom IV",
    color: "brine",
    target: "self",
    symbols: ["poison", "poison", "poison", "poison"],
  },
  enemy_poisoner_p5: {
    id: "enemy_poisoner_p5",
    label: "Venom V",
    color: "brine",
    target: "self",
    symbols: ["poison", "poison", "poison", "poison", "poison"],
  },
  enemy_poisoner_p6: {
    id: "enemy_poisoner_p6",
    label: "Venom VI",
    color: "brine",
    target: "self",
    symbols: ["poison", "poison", "poison", "poison", "poison", "poison"],
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
    icon: IconDagger,
    // dagger_twist removed (Iron color broke Crimson identity). crimson_marked_flesh added.
    faces: [
      "dagger_stab",
      "dagger_quick",
      "crimson_marked_flesh",
      "dagger_open_vein",
      "dagger_flit",
      "blank",
    ],
  },
  warhammer: {
    id: "die_warhammer",
    slot: "main",
    name: "Warhammer",
    icon: IconWarhammer,
    // hammer_stagger (weak solo spark) replaced with iron_armor_shatter (pierce+heavy, explicit Wound Lock enabler).
    faces: [
      "hammer_smash",
      "hammer_crush",
      "iron_armor_shatter",
      "hammer_heavybash",
      "hammer_windup",
      "blank",
    ],
  },
  crossbow: {
    id: "die_crossbow",
    slot: "main",
    name: "Crossbow",
    icon: IconCrossbow,
    faces: [
      "crossbow_bolt",
      "crossbow_heavy",
      "crossbow_punch",
      "crossbow_pin",
      "crossbow_load",
      "blank",
    ],
  },
  spear: {
    id: "die_spear",
    slot: "main",
    name: "Spear",
    icon: IconSpear,
    faces: ["spear_set", "spear_lunge", "spear_thrust", "spear_brace", "spear_reach", "blank"],
  },
  greatsword: {
    id: "die_greatsword",
    slot: "main",
    name: "Greatsword",
    icon: IconCrossedSwords,
    faces: [
      "greatsword_cleave",
      "greatsword_sweep",
      "greatsword_overhead",
      "greatsword_arc",
      "greatsword_guard",
      "blank",
    ],
  },
  censer: {
    id: "die_censer",
    slot: "main",
    name: "Censer",
    icon: IconFlame,
    faces: [
      "censer_swing",
      "censer_smolder",
      "censer_asperge",
      "censer_pour",
      "censer_ward",
      "blank",
    ],
  },
  long_sword: {
    id: "die_long_sword",
    slot: "main",
    name: "Long Sword",
    icon: IconSword,
    faces: [
      "longsword_dmg2",
      "longsword_vulnerable",
      "longsword_bleed1",
      "longsword_bleed2",
      "longsword_riposte",
      "blank",
    ],
  },
  claymore: {
    id: "die_claymore",
    slot: "main",
    name: "Claymore",
    icon: IconSword,
    faces: [
      "claymore_cleave2",
      "claymore_cleave2",
      "claymore_cleave1",
      "claymore_cleave1",
      "claymore_cleave_bleed",
      "claymore_dmg3",
    ],
  },
  pickaxe: {
    id: "die_pickaxe",
    slot: "main",
    name: "Pickaxe",
    icon: IconWarhammer,
    faces: [
      "pickaxe_smash",
      "pickaxe_crack",
      "pickaxe_crack",
      "pickaxe_shatter",
      "pickaxe_chip",
      "pickaxe_stun",
    ],
  },
  dagger_spec: {
    id: "die_dagger_spec",
    slot: "main",
    name: "Dagger",
    icon: IconDagger,
    faces: [
      "dagger_spec_light",
      "dagger_spec_light",
      "dagger_spec_sneak1",
      "dagger_spec_sneak1",
      "dagger_spec_stab",
      "dagger_spec_stab",
    ],
  },
  crossbow_spec: {
    id: "die_crossbow_spec",
    slot: "main",
    name: "Crossbow",
    icon: IconCrossbow,
    faces: [
      "crossbow_spec_shot",
      "crossbow_spec_shot",
      "crossbow_spec_light_shot",
      "crossbow_spec_light_shot",
      "crossbow_spec_pierce_shot",
      "crossbow_spec_pierce_shot",
    ],
  },
};

/** Offhand dice keyed by offhand id. The Fourth Hand starts with a torch. */
export const OFFHAND_DICE: Record<string, DieDef> = {
  torch: {
    id: "die_torch",
    slot: "offhand",
    name: "Torch",
    icon: IconFlame,
    // torch_ward_off (Salt — wrong color) replaced with fire_consuming_blaze (Fire+Weaken bridge).
    faces: [
      "torch_brand",
      "torch_sear",
      "torch_sidestep",
      "fire_consuming_blaze",
      "torch_sweep",
      "blank",
    ],
  },
  shield: {
    id: "die_shield",
    slot: "offhand",
    name: "Shield",
    icon: IconShield,
    faces: [
      "shield_block",
      "shield_bulwark",
      "shield_cleanse",
      "shield_bash",
      "shield_focus",
      "blank",
    ],
  },
  buckler: {
    id: "die_buckler",
    slot: "offhand",
    name: "Buckler",
    icon: IconShield,
    faces: [
      "buckler_parry",
      "buckler_punch",
      "buckler_brace",
      "buckler_dodge",
      "buckler_riposte",
      "blank",
    ],
  },
  lantern: {
    id: "die_lantern",
    slot: "offhand",
    name: "Lantern",
    icon: IconLantern,
    faces: [
      "lantern_reveal",
      "lantern_beam",
      "lantern_mark",
      "lantern_warmth",
      "lantern_focus",
      "blank",
    ],
  },
  vials: {
    id: "die_vials",
    slot: "offhand",
    name: "Vials of Brine",
    icon: IconWater,
    // vials_steady (Salt block — wrong color) replaced with brine_hemorrhage (Bleed cashout face).
    faces: [
      "vials_pour",
      "vials_splash",
      "vials_drench",
      "vials_cure",
      "brine_hemorrhage",
      "blank",
    ],
  },
  censer_offhand: {
    id: "die_censer_offhand",
    slot: "offhand",
    name: "Censer",
    icon: IconFlame,
    faces: [
      "censer_spec_cleanse",
      "censer_spec_cleanse",
      "censer_spec_blind",
      "censer_spec_blind",
      "censer_spec_dodge",
      "censer_spec_hide",
    ],
  },
  main_gauche: {
    id: "die_main_gauche",
    slot: "offhand",
    name: "Main Gauche",
    icon: IconRiposte,
    faces: [
      "gauche_defend_dmg1",
      "gauche_defend_dmg2",
      "gauche_riposte1",
      "gauche_riposte2",
      "gauche_redirect",
      "gauche_redirect",
    ],
  },
  shield_spec: {
    id: "die_shield_spec",
    slot: "offhand",
    name: "Shield",
    icon: IconShield,
    faces: [
      "shield_spec_block2",
      "shield_spec_block2",
      "shield_spec_block1",
      "shield_spec_block1",
      "shield_spec_push",
      "shield_spec_stun",
    ],
  },
  torch_spec: {
    id: "die_torch_spec",
    slot: "offhand",
    name: "Torch",
    icon: IconTorch,
    faces: [
      "torch_spec_blind2",
      "torch_spec_blind1",
      "torch_spec_fire2",
      "torch_spec_fire1",
      "torch_spec_reveal",
      "torch_spec_reveal",
    ],
  },
};

/** Armor dice keyed by armor id. */
export const ARMOR_DICE: Record<string, DieDef> = {
  mail_hauberk: {
    id: "die_mail",
    slot: "armor",
    name: "Mail Hauberk",
    icon: IconLightArmor,
    faces: ["mail_block", "mail_block2", "mail_steady", "mail_edge", "mail_endurance", "blank"],
  },
  robes_of_the_vigil: {
    id: "die_robes",
    slot: "armor",
    name: "Robes of the Vigil",
    icon: IconRobe,
    faces: ["robes_veil", "robes_hum", "robes_saltline", "robes_censer", "robes_tincture", "blank"],
  },
  plate: {
    id: "die_plate",
    slot: "armor",
    name: "Plate",
    icon: IconGear,
    faces: ["plate_wall", "plate_mass", "plate_step", "plate_grind", "plate_endurance", "blank"],
  },
  cloak_of_the_stalker: {
    id: "die_cloak",
    slot: "armor",
    name: "Cloak of the Stalker",
    icon: IconHeavyArmor,
    faces: ["cloak_slip", "cloak_fade", "cloak_shroud", "cloak_breath", "cloak_strike", "blank"],
  },
  spiked_armor: {
    id: "die_spiked_armor",
    slot: "armor",
    name: "Spiked Armor",
    icon: IconGear,
    faces: [
      "spiked_riposte_def1",
      "spiked_riposte_def1",
      "spiked_riposte_def1",
      "spiked_def1",
      "spiked_riposte3_def2",
      "spiked_def1",
    ],
  },
  shadow_cloak: {
    id: "die_shadow_cloak",
    slot: "armor",
    name: "Shadow Cloak",
    icon: IconHeavyArmor,
    faces: [
      "cloak_dodge_colorless",
      "cloak_dodge_colorless",
      "cloak_hide_colorless",
      "cloak_dodge_color",
      "cloak_hide_color",
      "cloak_def",
    ],
  },
  plate_armor: {
    id: "die_plate_armor",
    slot: "armor",
    name: "Plate Armor",
    icon: IconGear,
    faces: [
      "plate_spec_def2",
      "plate_spec_def2",
      "plate_spec_def3",
      "plate_spec_def3",
      "blank",
      "blank",
    ],
  },
  leather_armor: {
    id: "die_leather_armor",
    slot: "armor",
    name: "Leather Armor",
    icon: IconLightArmor,
    faces: [
      "leather_def1",
      "leather_def1",
      "leather_def2",
      "leather_def2",
      "leather_dodge",
      "blank",
    ],
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
  icon: IconDrag,
};

/** Ability dice keyed by ability id. The starter is "steady_hands" (Steady Hands).
 * Higher-tier abilities replace it wholesale — found at shrines, hymnals, and labs in the dungeon. */
export const ABILITY_DICE: Record<
  string,
  {
    readonly id: string;
    readonly name: string;
    readonly icon: React.FC<import("../icons").IconProps>;
    readonly faces: readonly [string, string, string, string, string, string];
  }
> = {
  steady_hands: {
    id: "steady_hands",
    name: "Steady Hands",
    icon: IconDrag,
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
    icon: IconHymnHum,
    faces: [
      "ability_hymn",
      "ability_smite",
      "ability_ward",
      "steady_focus",
      "steady_resolve",
      "blank",
    ],
  },
  lichbane: {
    id: "lichbane",
    name: "Lichbane",
    icon: IconSkull,
    faces: [
      "ability_smite",
      "ability_coldfire_lance",
      "ability_ward",
      "steady_resolve",
      "steady_focus",
      "blank",
    ],
  },
  steady_hands_spec: {
    id: "steady_hands_spec",
    name: "Steady Hands",
    icon: IconDrag,
    faces: [
      "steady_spec_bolster2",
      "steady_spec_bolster2",
      "steady_spec_cleanse",
      "steady_spec_heal2",
      "steady_spec_heal2",
      "blank",
    ],
  },
  curse_uttering: {
    id: "curse_uttering",
    name: "Curse Uttering",
    icon: IconSkull,
    faces: [
      "curse_weaken4",
      "curse_weaken4",
      "curse_mark4",
      "curse_mark4",
      "curse_vulnerable4",
      "curse_stun",
    ],
  },
  battle_cries: {
    id: "battle_cries",
    name: "Battle Cries",
    icon: IconSun,
    faces: [
      "cry_bolster1",
      "cry_bolster2",
      "cry_stun",
      "cry_weaken_all",
      "cry_push_cleave",
      "cry_mark_all",
    ],
  },
  keen_eye: {
    id: "keen_eye",
    name: "Keen Eye",
    icon: IconFocus,
    faces: [
      "ability_focus_mind",
      "ability_focus_mind",
      "ability_focus_mind",
      "steady_resolve",
      "steady_brace",
      "blank",
    ],
  },
};

export type DiceAbilityId = keyof typeof ABILITY_DICE;

export const DICE_ABILITY_IDS = Object.keys(ABILITY_DICE) as DiceAbilityId[];

export function isDiceAbilityId(id: string): id is DiceAbilityId {
  return id in ABILITY_DICE;
}

export function getAbilityDie(abilityId: DiceAbilityId | string | undefined): {
  readonly id: string;
  readonly name: string;
  readonly icon: React.FC<import("../icons").IconProps>;
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
