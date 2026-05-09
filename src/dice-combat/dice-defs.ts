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
    icon: "",
    color: "blank",
    target: "none",
    symbols: [],
  },

  /* ── Dagger (main hand) ── */
  dagger_stab: {
    id: "dagger_stab",
    label: "Stab",
    icon: "🗡️",
    color: "crimson",
    target: "front-enemy",
    symbols: ["sword"],
  },
  dagger_quick: {
    id: "dagger_quick",
    label: "Quick Stab",
    icon: "🗡️",
    color: "crimson",
    target: "front-enemy",
    symbols: ["sword", "sword"],
  },
  dagger_open_vein: {
    id: "dagger_open_vein",
    label: "Open Vein",
    icon: "🩸",
    color: "brine",
    target: "front-enemy",
    symbols: ["drop", "drop"],
  },
  dagger_flit: {
    id: "dagger_flit",
    label: "Flit",
    icon: "🌀",
    color: "echo",
    target: "self",
    symbols: ["dodge"],
  },

  /* ── Warhammer (main hand) ── */
  hammer_smash: {
    id: "hammer_smash",
    label: "Smash",
    icon: "🔨",
    color: "crimson",
    target: "front-enemy",
    symbols: ["sword", "sword"],
  },
  hammer_crush: {
    id: "hammer_crush",
    label: "Crush",
    icon: "🔨",
    color: "crimson",
    target: "front-enemy",
    symbols: ["sword", "sword", "sword"],
  },
  hammer_heavybash: {
    id: "hammer_heavybash",
    label: "Heavy Bash",
    icon: "🔨",
    color: "iron",
    target: "front-enemy",
    symbols: ["sword", "sword", "spark"],
  },
  hammer_windup: {
    id: "hammer_windup",
    label: "Wind Up",
    icon: "💪",
    color: "echo",
    target: "self",
    symbols: ["power", "power"],
  },

  /* ── Shield (off hand) ── */
  shield_block: {
    id: "shield_block",
    label: "Block",
    icon: "🛡️",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield"],
  },
  shield_bulwark: {
    id: "shield_bulwark",
    label: "Bulwark",
    icon: "🛡️",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield", "shield"],
  },
  shield_cleanse: {
    id: "shield_cleanse",
    label: "Cleanse",
    icon: "✨",
    color: "salt",
    target: "self",
    symbols: ["cleanse"],
  },
  shield_bash: {
    id: "shield_bash",
    label: "Bash",
    icon: "🥊",
    color: "iron",
    target: "front-enemy",
    symbols: ["sword", "spark"],
  },
  shield_focus: {
    id: "shield_focus",
    label: "Focus",
    icon: "👁️",
    color: "echo",
    target: "self",
    symbols: ["resonance"],
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
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "ranged"],
  },
  torch_sear: {
    id: "torch_sear",
    label: "Sear",
    icon: "🔥",
    color: "fire",
    target: "front-enemy",
    symbols: ["flame", "flame"],
  },
  torch_sidestep: {
    id: "torch_sidestep",
    label: "Sidestep",
    icon: "🌀",
    color: "echo",
    target: "self",
    symbols: ["dodge"],
  },
  torch_sweep: {
    id: "torch_sweep",
    label: "Sweep",
    icon: "🔥",
    color: "iron",
    target: "any-enemy",
    symbols: ["push"],
  },

  /* ── Mail Hauberk (armor) ── */
  mail_block: {
    id: "mail_block",
    label: "Mail",
    icon: "🛡️",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },
  mail_block2: {
    id: "mail_block2",
    label: "Heavy Mail",
    icon: "🛡️",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield"],
  },
  mail_steady: {
    id: "mail_steady",
    label: "Steady",
    icon: "⛓️",
    color: "salt",
    target: "self",
    symbols: ["cleanse"],
  },
  mail_edge: {
    id: "mail_edge",
    label: "Edge",
    icon: "⚔️",
    color: "iron",
    target: "self",
    symbols: ["sun"],
  },
  mail_endurance: {
    id: "mail_endurance",
    label: "Endurance",
    icon: "💚",
    color: "fire",
    target: "self",
    symbols: ["heart"],
  },

  /* ── Robes of the Vigil (late-game armor) ── */
  robes_veil: {
    id: "robes_veil",
    label: "Veil",
    icon: "🌀",
    color: "echo",
    target: "self",
    symbols: ["dodge"],
  },
  robes_hum: {
    id: "robes_hum",
    label: "Hum",
    icon: "🎵",
    color: "echo",
    target: "self",
    symbols: ["hymn_hum"],
  },
  robes_saltline: {
    id: "robes_saltline",
    label: "Salt-line",
    icon: "🛡️",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },
  robes_censer: {
    id: "robes_censer",
    label: "Censer",
    icon: "🔥",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "ranged", "holy"],
  },
  robes_tincture: {
    id: "robes_tincture",
    label: "Tincture",
    icon: "🩸",
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
    icon: "⚔️",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword", "ranged"],
  },
  steady_brace: {
    id: "steady_brace",
    label: "Brace",
    icon: "🛡️",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },
  steady_breath: {
    id: "steady_breath",
    label: "Catch Breath",
    icon: "💚",
    color: "fire",
    target: "self",
    symbols: ["heart"],
  },
  steady_focus: {
    id: "steady_focus",
    label: "Focus",
    icon: "👁️",
    color: "echo",
    target: "self",
    symbols: ["resonance"],
  },
  steady_bear_down: {
    id: "steady_bear_down",
    label: "Bear Down",
    icon: "💪",
    color: "iron",
    target: "self",
    symbols: ["power"],
  },

  /* ── Higher-tier ability faces (etched at shrines / earned in the dungeon) ── */
  ability_smite: {
    id: "ability_smite",
    label: "Smite",
    icon: "✨",
    color: "fire",
    target: "any-enemy",
    symbols: ["sword", "sword", "holy", "ranged"],
  },
  ability_hymn: {
    id: "ability_hymn",
    label: "Hymn",
    icon: "🎵",
    color: "echo",
    target: "self",
    symbols: ["heart", "hymn_hum"],
  },
  ability_ward: {
    id: "ability_ward",
    label: "Ward",
    icon: "🛡️",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield", "shield", "cleanse"],
  },
  ability_coldfire_lance: {
    id: "ability_coldfire_lance",
    label: "Coldfire Lance",
    icon: "☠️",
    color: "coldfire",
    target: "any-enemy",
    symbols: ["sword", "sword", "sword", "sword", "pierce", "ranged"],
  },

  /* ── v3 weapons (authored as symbol bags) ── */

  /* Crossbow — every face `ranged`. Trades raw damage for back-row reach. */
  crossbow_bolt: {
    id: "crossbow_bolt",
    label: "Bolt",
    icon: "🏹",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "ranged"],
  },
  crossbow_heavy: {
    id: "crossbow_heavy",
    label: "Heavy Bolt",
    icon: "🏹",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "sword", "ranged"],
  },
  crossbow_punch: {
    id: "crossbow_punch",
    label: "Punch-Through",
    icon: "🏹",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword", "ranged", "pierce"],
  },
  crossbow_pin: {
    id: "crossbow_pin",
    label: "Pin",
    icon: "🏹",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "spark", "ranged"],
  },
  crossbow_load: {
    id: "crossbow_load",
    label: "Load",
    icon: "🎯",
    color: "echo",
    target: "self",
    symbols: ["power"],
  },

  /* Spear — riposte weapon. */
  spear_set: {
    id: "spear_set",
    label: "Set",
    icon: "🔱",
    color: "iron",
    target: "front-enemy",
    symbols: ["sword", "riposte"],
  },
  spear_lunge: {
    id: "spear_lunge",
    label: "Lunge",
    icon: "🔱",
    color: "crimson",
    target: "front-enemy",
    symbols: ["sword", "sword"],
  },
  spear_thrust: {
    id: "spear_thrust",
    label: "Thrust",
    icon: "🔱",
    color: "brine",
    target: "front-enemy",
    symbols: ["sword", "drop"],
  },
  spear_brace: {
    id: "spear_brace",
    label: "Brace",
    icon: "🛡️",
    color: "salt",
    target: "self",
    symbols: ["shield", "riposte"],
  },
  spear_reach: {
    id: "spear_reach",
    label: "Reach",
    icon: "🔱",
    color: "echo",
    target: "any-enemy",
    symbols: ["sword", "ranged"],
  },

  /* Greatsword — two-handed (occupies offhand too). Area on three faces. */
  greatsword_cleave: {
    id: "greatsword_cleave",
    label: "Cleave",
    icon: "⚔️",
    color: "crimson",
    target: "front-enemy",
    symbols: ["sword", "sword", "area"],
  },
  greatsword_sweep: {
    id: "greatsword_sweep",
    label: "Sweep",
    icon: "⚔️",
    color: "crimson",
    target: "front-enemy",
    symbols: ["sword", "sword", "sword", "area"],
  },
  greatsword_overhead: {
    id: "greatsword_overhead",
    label: "Overhead",
    icon: "⚔️",
    color: "iron",
    target: "front-enemy",
    symbols: ["sword", "sword", "spark"],
  },
  greatsword_arc: {
    id: "greatsword_arc",
    label: "Arc",
    icon: "⚔️",
    color: "brine",
    target: "front-enemy",
    symbols: ["sword", "drop", "area"],
  },
  greatsword_guard: {
    id: "greatsword_guard",
    label: "Guard",
    icon: "🛡️",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield"],
  },

  /* Censer — Fire + holy on every face. */
  censer_swing: {
    id: "censer_swing",
    label: "Swing",
    icon: "🔥",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "holy"],
  },
  censer_smolder: {
    id: "censer_smolder",
    label: "Smolder",
    icon: "🔥",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "flame", "holy"],
  },
  censer_asperge: {
    id: "censer_asperge",
    label: "Asperge",
    icon: "✨",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "cleanse", "holy"],
  },
  censer_pour: {
    id: "censer_pour",
    label: "Pour",
    icon: "✨",
    color: "salt",
    target: "self",
    symbols: ["heart", "cleanse"],
  },
  censer_ward: {
    id: "censer_ward",
    label: "Ward",
    icon: "🛡️",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },

  /* Buckler — defensive ripostes. */
  buckler_parry: {
    id: "buckler_parry",
    label: "Parry",
    icon: "🛡️",
    color: "salt",
    target: "self",
    symbols: ["shield", "riposte"],
  },
  buckler_punch: {
    id: "buckler_punch",
    label: "Punch",
    icon: "🥊",
    color: "crimson",
    target: "front-enemy",
    symbols: ["sword"],
  },
  buckler_brace: {
    id: "buckler_brace",
    label: "Brace",
    icon: "🛡️",
    color: "colorless",
    target: "self",
    symbols: ["shield"],
  },
  buckler_dodge: {
    id: "buckler_dodge",
    label: "Slip",
    icon: "✷",
    color: "colorless",
    target: "self",
    symbols: ["dodge"],
  },
  buckler_riposte: {
    id: "buckler_riposte",
    label: "Riposte",
    icon: "⤺",
    color: "iron",
    target: "self",
    symbols: ["riposte", "cleanse"],
  },

  /* Lantern — fire + ranged + Mark. */
  lantern_reveal: {
    id: "lantern_reveal",
    label: "Reveal",
    icon: "🔦",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "mark", "ranged"],
  },
  lantern_beam: {
    id: "lantern_beam",
    label: "Beam",
    icon: "🔦",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "ranged"],
  },
  lantern_mark: {
    id: "lantern_mark",
    label: "Mark",
    icon: "⚹",
    color: "echo",
    target: "any-enemy",
    symbols: ["mark", "ranged"],
  },
  lantern_warmth: {
    id: "lantern_warmth",
    label: "Warmth",
    icon: "💚",
    color: "fire",
    target: "self",
    symbols: ["heart"],
  },
  lantern_focus: {
    id: "lantern_focus",
    label: "Focus",
    icon: "👁️",
    color: "echo",
    target: "self",
    symbols: ["sun"],
  },

  /* Vials of Brine — bleed stacking. */
  vials_pour: {
    id: "vials_pour",
    label: "Pour",
    icon: "💧",
    color: "brine",
    target: "any-enemy",
    symbols: ["drop", "drop", "ranged"],
  },
  vials_splash: {
    id: "vials_splash",
    label: "Splash",
    icon: "💧",
    color: "brine",
    target: "any-enemy",
    symbols: ["sword", "drop", "ranged"],
  },
  vials_drench: {
    id: "vials_drench",
    label: "Drench",
    icon: "💧",
    color: "brine",
    target: "front-enemy",
    symbols: ["drop", "area"],
  },
  vials_cure: {
    id: "vials_cure",
    label: "Cure",
    icon: "💚",
    color: "salt",
    target: "self",
    symbols: ["heart", "cleanse"],
  },
  /* Plate armor */
  plate_wall: {
    id: "plate_wall",
    label: "Wall",
    icon: "🛡️",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield", "shield"],
  },
  plate_mass: {
    id: "plate_mass",
    label: "Mass",
    icon: "🛡️",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield"],
  },
  plate_step: {
    id: "plate_step",
    label: "Step",
    icon: "⚒️",
    color: "iron",
    target: "front-enemy",
    symbols: ["shield", "push"],
  },
  plate_grind: {
    id: "plate_grind",
    label: "Grind",
    icon: "⚒️",
    color: "iron",
    target: "front-enemy",
    symbols: ["sword", "pierce"],
  },
  plate_endurance: {
    id: "plate_endurance",
    label: "Endurance",
    icon: "💚",
    color: "fire",
    target: "self",
    symbols: ["heart"],
  },

  /* Cloak of the Stalker — colorless faces, push-luck friendly. */
  cloak_slip: {
    id: "cloak_slip",
    label: "Slip",
    icon: "✷",
    color: "colorless",
    target: "self",
    symbols: ["riposte"],
  },
  cloak_fade: {
    id: "cloak_fade",
    label: "Fade",
    icon: "🛡️",
    color: "colorless",
    target: "self",
    symbols: ["shield"],
  },
  cloak_shroud: {
    id: "cloak_shroud",
    label: "Shroud",
    icon: "✷",
    color: "colorless",
    target: "self",
    symbols: ["dodge"],
  },
  cloak_breath: {
    id: "cloak_breath",
    label: "Breath",
    icon: "💚",
    color: "fire",
    target: "self",
    symbols: ["heart"],
  },
  cloak_strike: {
    id: "cloak_strike",
    label: "Strike",
    icon: "🗡️",
    color: "brine",
    target: "any-enemy",
    symbols: ["sword", "drop"],
  },

  /* ── New player faces (enemy-counter gaps) ── */

  // Brine: cash out Bleed stacks as burst (or re-apply if none). Vampire Lord kill window.
  brine_hemorrhage: {
    id: "brine_hemorrhage",
    label: "Hemorrhage",
    icon: "🩸",
    color: "brine",
    target: "front-enemy",
    symbols: ["bleed_burst", "pierce"],
  },

  // Salt: 2 block.
  salt_unclasp: {
    id: "salt_unclasp",
    label: "Unclasp",
    icon: "🔓",
    color: "colorless",
    target: "self",
    symbols: ["shield", "shield"],
  },

  // Iron: armor-break — reduces enemy warded by 1 permanently.
  iron_armor_shatter: {
    id: "iron_armor_shatter",
    label: "Armor Shatter",
    icon: "⚒️",
    color: "iron",
    target: "front-enemy",
    symbols: ["sword", "armor_break"],
  },

  // Crimson: 1 damage + Mark on same target — enables follow-up doubling.
  crimson_marked_flesh: {
    id: "crimson_marked_flesh",
    label: "Marked Flesh",
    icon: "🩸",
    color: "crimson",
    target: "front-enemy",
    symbols: ["sword", "mark"],
  },

  // Fire: Weaken rider on fire damage — bridges Fire+Coldfire naturally on Torch.
  fire_consuming_blaze: {
    id: "fire_consuming_blaze",
    label: "Consuming Blaze",
    icon: "🔥",
    color: "fire",
    target: "front-enemy",
    symbols: ["flame", "bolt"],
  },

  /* ── v3 enemy faces (player-targeting offensive symbols, or self-targeting for armor/heals) ── */

  enemy_grasp_drag: {
    id: "enemy_grasp_drag",
    label: "Drag",
    icon: "✋",
    color: "brine",
    target: "self",
    symbols: ["sword", "drag", "undodgeable"],
  },

  enemy_bite_1: {
    id: "enemy_bite_1",
    label: "Bite",
    icon: "🦷",
    color: "crimson",
    target: "self",
    symbols: ["sword"],
  },
  enemy_rake_2: {
    id: "enemy_rake_2",
    label: "Rake",
    icon: "🦷",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword"],
  },
  enemy_reproduce: {
    id: "enemy_reproduce",
    label: "Reproduce",
    icon: "🐀",
    color: "colorless",
    target: "self",
    symbols: ["reproduce"],
  },
  enemy_cower: {
    id: "enemy_cower",
    label: "Cower",
    icon: "🛡️",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },

  /* Skeleton offense */
  enemy_bone_strike: {
    id: "enemy_bone_strike",
    label: "Strike",
    icon: "🦴",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword"],
  },
  enemy_bone_crack: {
    id: "enemy_bone_crack",
    label: "Crack",
    icon: "💢",
    color: "iron",
    target: "self",
    symbols: ["sword", "spark"],
  },
  enemy_bone_lurch: {
    id: "enemy_bone_lurch",
    label: "Lurch",
    icon: "🦴",
    color: "crimson",
    target: "self",
    symbols: ["sword"],
  },
  enemy_bone_bash: {
    id: "enemy_bone_bash",
    label: "Bash",
    icon: "🦴",
    color: "iron",
    target: "self",
    symbols: ["sword", "area"],
  },

  /* Skeleton armor die — shield faces also apply Taunt. */
  enemy_armor_2: {
    id: "enemy_armor_2",
    label: "Brace",
    icon: "🛡️",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield", "taunt"],
  },
  enemy_armor_1: {
    id: "enemy_armor_1",
    label: "Plate",
    icon: "🛡️",
    color: "salt",
    target: "self",
    symbols: ["shield", "taunt"],
  },
  enemy_armor_strike: {
    id: "enemy_armor_strike",
    label: "Bash-Brace",
    icon: "🛡️",
    color: "iron",
    target: "self",
    symbols: ["shield", "sword"],
  },
  enemy_armor_stun: {
    id: "enemy_armor_stun",
    label: "Stun-Brace",
    icon: "🛡️",
    color: "iron",
    target: "self",
    symbols: ["shield", "spark"],
  },

  /* Banshee — terror attacks: unblockable. */
  enemy_wail: {
    id: "enemy_wail",
    label: "Wail",
    icon: "👻",
    color: "echo",
    target: "self",
    symbols: ["sword", "sword", "sword", "unblockable"],
  },
  enemy_drone: {
    id: "enemy_drone",
    label: "Drone",
    icon: "🌫️",
    color: "coldfire",
    target: "self",
    symbols: ["bolt", "bolt", "unblockable"],
  },
  enemy_ululate: {
    id: "enemy_ululate",
    label: "Ululate",
    icon: "🎶",
    color: "echo",
    target: "self",
    symbols: ["spark"],
  },

  /* Necromancer — area curse, no animation logic here (handled by selectIntent hook). */
  enemy_curse: {
    id: "enemy_curse",
    label: "Curse",
    icon: "🌫️",
    color: "coldfire",
    target: "self",
    symbols: ["bolt", "area", "undodgeable", "unblockable"],
  },
  enemy_grave_call: {
    id: "enemy_grave_call",
    label: "Grave-Call",
    icon: "🦴",
    color: "coldfire",
    target: "self",
    symbols: ["sword", "unblockable"],
  },
  enemy_chant: {
    id: "enemy_chant",
    label: "Chant",
    icon: "📜",
    color: "salt",
    target: "self",
    symbols: ["heart"],
  },

  /* Generic shared enemy faces */
  enemy_shamble: {
    id: "enemy_shamble",
    label: "Shamble",
    icon: "🧟",
    color: "crimson",
    target: "self",
    symbols: ["sword"],
  },
  enemy_grasp: {
    id: "enemy_grasp",
    label: "Grasp",
    icon: "✋",
    color: "brine",
    target: "self",
    symbols: ["sword", "drop"],
  },
  enemy_phantom_strike: {
    id: "enemy_phantom_strike",
    label: "Phantom Strike",
    icon: "👻",
    color: "echo",
    target: "self",
    symbols: ["sword", "sword", "unblockable"],
  },
  enemy_drain: {
    id: "enemy_drain",
    label: "Drain",
    icon: "🩸",
    color: "brine",
    target: "self",
    symbols: ["sword", "sword", "heart"],
  },
  enemy_drain_heavy: {
    id: "enemy_drain_heavy",
    label: "Sanguine Drain",
    icon: "🩸",
    color: "coldfire",
    target: "self",
    symbols: ["sword", "sword", "sword"],
  },
  enemy_pounce: {
    id: "enemy_pounce",
    label: "Pounce",
    icon: "🐾",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword", "sword"],
  },
  enemy_ambush: {
    id: "enemy_ambush",
    label: "Ambush",
    icon: "💥",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword", "sword", "unblockable"],
  },
  enemy_shadow_strike: {
    id: "enemy_shadow_strike",
    label: "Shadow Strike",
    icon: "🌑",
    color: "coldfire",
    target: "self",
    symbols: ["sword", "unblockable"],
  },
  enemy_pilfer: {
    id: "enemy_pilfer",
    label: "Pilfer",
    icon: "🪙",
    color: "iron",
    target: "self",
    symbols: ["steal"],
  },
  enemy_animate: {
    id: "enemy_animate",
    label: "Animate",
    icon: "⚰️",
    color: "coldfire",
    target: "self",
    symbols: ["summon"],
  },
  enemy_summon: {
    id: "enemy_summon",
    label: "Raise Dead",
    icon: "⚰️",
    color: "coldfire",
    target: "self",
    symbols: ["summon"],
  },
  enemy_bind: {
    id: "enemy_bind",
    label: "Bind",
    icon: "⛓️",
    color: "salt",
    target: "self",
    symbols: ["bind"],
  },
  enemy_crush: {
    id: "enemy_crush",
    label: "Crush",
    icon: "🪨",
    color: "iron",
    target: "self",
    symbols: ["sword", "sword", "sword"],
  },
  enemy_hold: {
    id: "enemy_hold",
    label: "Hold",
    icon: "🪨",
    color: "iron",
    target: "self",
    symbols: ["sword", "sword", "spark"],
  },
  enemy_great_cleave: {
    id: "enemy_great_cleave",
    label: "Bone Cleave",
    icon: "🦴",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword", "sword", "area"],
  },
  enemy_brand: {
    id: "enemy_brand",
    label: "Brand",
    icon: "🩸",
    color: "coldfire",
    target: "self",
    symbols: ["mark", "unblockable"],
  },
  enemy_cold_lamp: {
    id: "enemy_cold_lamp",
    label: "Cold Lamp",
    icon: "🕯️",
    color: "coldfire",
    target: "self",
    symbols: ["sword", "sword", "sword", "unblockable"],
  },
  enemy_iron_pike: {
    id: "enemy_iron_pike",
    label: "Iron Pike",
    icon: "🗡️",
    color: "iron",
    target: "self",
    symbols: ["sword", "sword", "spark"],
  },
  enemy_echo_lance: {
    id: "enemy_echo_lance",
    label: "Echo Lance",
    icon: "🎶",
    color: "echo",
    target: "self",
    symbols: ["sword", "sword", "sword", "bolt", "unblockable"],
  },

  // Heap of Bones — rises immediately into a Skeleton on this face
  enemy_reform: {
    id: "enemy_reform",
    label: "Reform",
    icon: "🦴",
    color: "iron",
    target: "self",
    symbols: ["reform"],
  },

  // Ghost intangibility
  enemy_intangible: {
    id: "enemy_intangible",
    label: "Phase",
    icon: "👻",
    color: "echo",
    target: "self",
    symbols: ["intangible"],
  },

  // Forsworn guard strike
  enemy_guard_strike: {
    id: "enemy_guard_strike",
    label: "Guard Strike",
    icon: "🛡️",
    color: "iron",
    target: "self",
    symbols: ["sword", "sword", "sword"],
  },

  // Salt Revenant slot lock
  enemy_salt_grapple: {
    id: "enemy_salt_grapple",
    label: "Salt-Grapple",
    icon: "💎",
    color: "salt",
    target: "self",
    symbols: ["sword", "sword", "bind"],
  },

  // Gutborn Larva — surfaces immediately and spawns a Zombie
  enemy_burrow: {
    id: "enemy_burrow",
    label: "Burrow",
    icon: "🪱",
    color: "brine",
    target: "self",
    symbols: ["burrow_spawn"],
  },

  // Forsworn guard taunt
  enemy_guard_taunt: {
    id: "enemy_guard_taunt",
    label: "Hold the Line",
    icon: "⚔️",
    color: "iron",
    target: "self",
    symbols: ["shield", "shield", "shield", "taunt"],
  },

  // False Sacrarium curse
  enemy_litany: {
    id: "enemy_litany",
    label: "Blessing Inversion",
    icon: "🦠",
    color: "coldfire",
    target: "self",
    symbols: ["invert"],
  },

  // Boss: Skeleton Lord
  enemy_bone_cleave_boss: {
    id: "enemy_bone_cleave_boss",
    label: "Bone Cleave",
    icon: "🦴",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword", "sword", "sword", "sword", "sword", "area"],
  },

  // Boss: Vampire Lord
  enemy_sanguine_drain: {
    id: "enemy_sanguine_drain",
    label: "Sanguine Drain",
    icon: "🩸",
    color: "brine",
    target: "self",
    symbols: ["sword", "sword", "sword", "sword", "sword", "sword", "heart", "heart", "heart"],
  },

  // Boss: Lich King — phase 1
  enemy_lich_cold_lamp: {
    id: "enemy_lich_cold_lamp",
    label: "Cold Lamp",
    icon: "🔮",
    color: "coldfire",
    target: "self",
    symbols: ["sword", "sword", "sword", "sword", "sword", "bolt", "unblockable"],
  },
  // Boss: Lich King — phase 2
  enemy_lich_tithe_mark: {
    id: "enemy_lich_tithe_mark",
    label: "Tithe-Mark",
    icon: "🩸",
    color: "brine",
    target: "self",
    symbols: ["sword", "sword", "sword", "sword", "mark"],
  },
  // Boss: Lich King — phase 3
  enemy_lich_hymn_break: {
    id: "enemy_lich_hymn_break",
    label: "Hymn-Break",
    icon: "🎵",
    color: "echo",
    target: "self",
    symbols: ["sword", "sword", "sword", "unblockable"],
  },

  /* ── Rat ── */
  enemy_rat_strike: {
    id: "enemy_rat_strike",
    label: "Gnaw",
    icon: "🐀",
    color: "crimson",
    target: "self",
    symbols: ["sword"],
  },
  enemy_rat_dodge: {
    id: "enemy_rat_dodge",
    label: "Dodge",
    icon: "💨",
    color: "colorless",
    target: "self",
    symbols: ["dodge"],
  },

  /* ── Ghoul stealth die ── */
  enemy_ghoul_hide: {
    id: "enemy_ghoul_hide",
    label: "Hide",
    icon: "🌑",
    color: "colorless",
    target: "self",
    symbols: ["hide", "shield"],
  },
  enemy_ghoul_dodge: {
    id: "enemy_ghoul_dodge",
    label: "Dodge",
    icon: "💨",
    color: "colorless",
    target: "self",
    symbols: ["hide", "intangible"],
  },
  enemy_ghoul_parry: {
    id: "enemy_ghoul_parry",
    label: "Parry",
    icon: "🛡️",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield"],
  },

  /* ── Ghoul attack die ── */
  enemy_ghoul_sneak_attack: {
    id: "enemy_ghoul_sneak_attack",
    label: "Sneak Attack",
    icon: "🗡️",
    color: "coldfire",
    target: "self",
    symbols: ["sneak_attack", "sword", "sword", "sword", "sword", "unblockable"],
  },
  enemy_ghoul_claw: {
    id: "enemy_ghoul_claw",
    label: "Claw",
    icon: "👹",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword"],
  },
  enemy_ghoul_bite: {
    id: "enemy_ghoul_bite",
    label: "Bite",
    icon: "🦷",
    color: "brine",
    target: "self",
    symbols: ["sword", "sword", "heart"],
  },

  /* ── Necromancer ── */
  enemy_necro_summon: {
    id: "enemy_necro_summon",
    label: "Raise Zombie",
    icon: "⚰️",
    color: "coldfire",
    target: "self",
    symbols: ["summon"],
  },
  enemy_necro_focus: {
    id: "enemy_necro_focus",
    label: "Focus",
    icon: "🌫️",
    color: "echo",
    target: "self",
    symbols: ["sun"],
  },
  enemy_necro_bolt: {
    id: "enemy_necro_bolt",
    label: "Death Bolt",
    icon: "☠️",
    color: "coldfire",
    target: "self",
    symbols: ["sword", "sword", "unblockable"],
  },

  /* ── Zombie ── */
  enemy_zombie_slam: {
    id: "enemy_zombie_slam",
    label: "Slam",
    icon: "🧟",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword", "sword", "sword"],
  },
  enemy_zombie_lurch: {
    id: "enemy_zombie_lurch",
    label: "Lurch",
    icon: "🧟",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword", "sword"],
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
    icon: "🔨",
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
    icon: "🏹",
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
    icon: "🔱",
    faces: ["spear_set", "spear_lunge", "spear_thrust", "spear_brace", "spear_reach", "blank"],
  },
  greatsword: {
    id: "die_greatsword",
    slot: "main",
    name: "Greatsword",
    icon: "⚔️",
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
    icon: "🔥",
    faces: [
      "censer_swing",
      "censer_smolder",
      "censer_asperge",
      "censer_pour",
      "censer_ward",
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
  buckler: {
    id: "die_buckler",
    slot: "offhand",
    name: "Buckler",
    icon: "🛡️",
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
    icon: "🔦",
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
    icon: "💧",
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
  plate: {
    id: "die_plate",
    slot: "armor",
    name: "Plate",
    icon: "⚙️",
    faces: ["plate_wall", "plate_mass", "plate_step", "plate_grind", "plate_endurance", "blank"],
  },
  cloak_of_the_stalker: {
    id: "die_cloak",
    slot: "armor",
    name: "Cloak of the Stalker",
    icon: "🧥",
    faces: ["cloak_slip", "cloak_fade", "cloak_shroud", "cloak_breath", "cloak_strike", "blank"],
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
    readonly faces: readonly [string, string, string, string, string, string];
  }
> = {
  steady_hands: {
    id: "steady_hands",
    name: "Steady Hands",
    icon: "✋",
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
    icon: "☠️",
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
