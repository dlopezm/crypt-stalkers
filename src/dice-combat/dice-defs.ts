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
    symbols: ["sword"],
  },
  dagger_quick: {
    id: "dagger_quick",
    label: "Quick Stab",
    icon: "🗡️",
    desc: "2 slash to a front-row enemy.",
    color: "crimson",
    target: "front-enemy",
    symbols: ["sword", "sword"],
  },
  dagger_twist: {
    id: "dagger_twist",
    label: "Twist",
    icon: "🩸",
    desc: "1 slash + 1 Bleed.",
    color: "iron",
    target: "front-enemy",
    symbols: ["sword", "drop"],
  },
  dagger_open_vein: {
    id: "dagger_open_vein",
    label: "Open Vein",
    icon: "🩸",
    desc: "+2 Bleed.",
    color: "brine",
    target: "front-enemy",
    symbols: ["drop", "drop"],
  },
  dagger_flit: {
    id: "dagger_flit",
    label: "Flit",
    icon: "🌀",
    desc: "Dodge — assign to a specific enemy attack.",
    color: "echo",
    target: "self",
    symbols: ["dodge"],
  },

  /* ── Warhammer (main hand) ── */
  hammer_smash: {
    id: "hammer_smash",
    label: "Smash",
    icon: "🔨",
    desc: "2 bludgeoning.",
    color: "crimson",
    target: "front-enemy",
    symbols: ["sword", "sword"],
    tags: ["heavy"],
  },
  hammer_crush: {
    id: "hammer_crush",
    label: "Crush",
    icon: "🔨",
    desc: "3 bludgeoning.",
    color: "crimson",
    target: "front-enemy",
    symbols: ["sword", "sword", "sword"],
    tags: ["heavy"],
  },
  hammer_stagger: {
    id: "hammer_stagger",
    label: "Stagger",
    icon: "💢",
    desc: "Stun.",
    color: "iron",
    target: "front-enemy",
    symbols: ["spark"],
  },
  hammer_heavybash: {
    id: "hammer_heavybash",
    label: "Heavy Bash",
    icon: "🔨",
    desc: "2 bludgeoning + Stun.",
    color: "iron",
    target: "front-enemy",
    symbols: ["sword", "sword", "spark"],
    tags: ["heavy"],
  },
  hammer_windup: {
    id: "hammer_windup",
    label: "Wind Up",
    icon: "💪",
    desc: "+2 Power.",
    color: "echo",
    target: "self",
    symbols: ["power", "power"],
  },

  /* ── Shield (off hand) ── */
  shield_block: {
    id: "shield_block",
    label: "Block",
    icon: "🛡️",
    desc: "2 block (assign to enemy attack).",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield"],
  },
  shield_bulwark: {
    id: "shield_bulwark",
    label: "Bulwark",
    icon: "🛡️",
    desc: "3 block.",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield", "shield"],
  },
  shield_cleanse: {
    id: "shield_cleanse",
    label: "Cleanse",
    icon: "✨",
    desc: "Cleanse 1 status.",
    color: "salt",
    target: "self",
    symbols: ["cleanse"],
  },
  shield_bash: {
    id: "shield_bash",
    label: "Bash",
    icon: "🥊",
    desc: "1 bludgeoning + Stun.",
    color: "iron",
    target: "front-enemy",
    symbols: ["sword", "spark"],
    tags: ["heavy"],
  },
  shield_focus: {
    id: "shield_focus",
    label: "Focus",
    icon: "👁️",
    desc: "Resonance — next clash forgiven.",
    color: "echo",
    target: "self",
    // Resonance is a meta-buff (forgive next clash); kept on legacy field for now.
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
    desc: "1 fire (+1 vs undead). Reaches back row.",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame"],
    tags: ["ranged"],
  },
  torch_sear: {
    id: "torch_sear",
    label: "Sear",
    icon: "🔥",
    desc: "2 fire to front.",
    color: "fire",
    target: "front-enemy",
    symbols: ["flame", "flame"],
  },
  torch_sidestep: {
    id: "torch_sidestep",
    label: "Sidestep",
    icon: "🌀",
    desc: "Dodge.",
    color: "echo",
    target: "self",
    symbols: ["dodge"],
  },
  torch_ward_off: {
    id: "torch_ward_off",
    label: "Ward Off",
    icon: "🛡️",
    desc: "1 block.",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },
  torch_sweep: {
    id: "torch_sweep",
    label: "Sweep",
    icon: "🔥",
    desc: "Push to opposite row.",
    color: "iron",
    target: "any-enemy",
    symbols: ["push"],
  },

  /* ── Mail Hauberk (armor) ── */
  mail_block: {
    id: "mail_block",
    label: "Mail",
    icon: "🛡️",
    desc: "1 block.",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },
  mail_block2: {
    id: "mail_block2",
    label: "Heavy Mail",
    icon: "🛡️",
    desc: "2 block.",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield"],
  },
  mail_steady: {
    id: "mail_steady",
    label: "Steady",
    icon: "⛓️",
    desc: "Cleanse 1.",
    color: "salt",
    target: "self",
    symbols: ["cleanse"],
  },
  mail_edge: {
    id: "mail_edge",
    label: "Edge",
    icon: "⚔️",
    desc: "+1 Bolster.",
    color: "iron",
    target: "self",
    symbols: ["sun"],
  },
  mail_endurance: {
    id: "mail_endurance",
    label: "Endurance",
    icon: "💚",
    desc: "Heal 1.",
    color: "fire",
    target: "self",
    symbols: ["heart"],
  },

  /* ── Robes of the Vigil (late-game armor) ── */
  robes_veil: {
    id: "robes_veil",
    label: "Veil",
    icon: "🌀",
    desc: "Dodge.",
    color: "echo",
    target: "self",
    symbols: ["dodge"],
  },
  robes_hum: {
    id: "robes_hum",
    label: "Hum",
    icon: "🎵",
    desc: "Hymn-Hum — Echo bust-immune this turn.",
    color: "echo",
    target: "self",
    grantHymnHum: true,
  },
  robes_saltline: {
    id: "robes_saltline",
    label: "Salt-line",
    icon: "🛡️",
    desc: "1 block.",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },
  robes_censer: {
    id: "robes_censer",
    label: "Censer",
    icon: "🔥",
    desc: "1 fire (+holy). Reaches back row.",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame"],
    tags: ["ranged", "holy"],
  },
  robes_tincture: {
    id: "robes_tincture",
    label: "Tincture",
    icon: "🩸",
    desc: "+1 Bleed.",
    color: "brine",
    target: "any-enemy",
    symbols: ["drop"],
    tags: ["ranged"],
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
    desc: "1 damage to any enemy.",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword"],
    tags: ["ranged"],
  },
  steady_brace: {
    id: "steady_brace",
    label: "Brace",
    icon: "🛡️",
    desc: "1 block.",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },
  steady_breath: {
    id: "steady_breath",
    label: "Catch Breath",
    icon: "💚",
    desc: "Heal 1.",
    color: "fire",
    target: "self",
    symbols: ["heart"],
  },
  steady_focus: {
    id: "steady_focus",
    label: "Focus",
    icon: "👁️",
    desc: "Resonance — next clash forgiven.",
    color: "echo",
    target: "self",
    grantResonance: true,
  },
  steady_bear_down: {
    id: "steady_bear_down",
    label: "Bear Down",
    icon: "💪",
    desc: "+1 Power.",
    color: "iron",
    target: "self",
    symbols: ["power"],
  },

  /* ── Higher-tier ability faces (etched at shrines / earned in the dungeon) ── */
  ability_smite: {
    id: "ability_smite",
    label: "Smite",
    icon: "✨",
    desc: "2 holy damage. Reaches back row.",
    color: "fire",
    target: "any-enemy",
    symbols: ["sword", "sword"],
    tags: ["holy", "ranged"],
  },
  ability_hymn: {
    id: "ability_hymn",
    label: "Hymn",
    icon: "🎵",
    desc: "Hymn-Hum + heal 1.",
    color: "echo",
    target: "self",
    symbols: ["heart"],
    grantHymnHum: true,
  },
  ability_ward: {
    id: "ability_ward",
    label: "Ward",
    icon: "🛡️",
    desc: "3 block + cleanse.",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield", "shield", "cleanse"],
  },
  ability_brand_break: {
    id: "ability_brand_break",
    label: "Brand-Break",
    icon: "⛓️",
    desc: "Cleanse + break a slot-lock.",
    color: "iron",
    target: "self",
    symbols: ["cleanse"],
    breakSlotLock: true, // meta-effect coexists with symbols
  },
  ability_coldfire_lance: {
    id: "ability_coldfire_lance",
    label: "Coldfire Lance",
    icon: "☠️",
    desc: "4 pierce. Reaches back row.",
    color: "coldfire",
    target: "any-enemy",
    symbols: ["sword", "sword", "sword", "sword"],
    tags: ["pierce", "ranged"],
  },

  /* ── v3 weapons (authored as symbol bags) ── */

  /* Crossbow — every face `ranged`. Trades raw damage for back-row reach. */
  crossbow_bolt: {
    id: "crossbow_bolt",
    label: "Bolt",
    icon: "🏹",
    desc: "1 damage. Reaches back row.",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword"],
    tags: ["ranged"],
  },
  crossbow_heavy: {
    id: "crossbow_heavy",
    label: "Heavy Bolt",
    icon: "🏹",
    desc: "2 damage. Reaches back row.",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "sword"],
    tags: ["ranged"],
  },
  crossbow_punch: {
    id: "crossbow_punch",
    label: "Punch-Through",
    icon: "🏹",
    desc: "1 damage, ignores block. Reaches back row.",
    color: "crimson",
    target: "any-enemy",
    symbols: ["sword"],
    tags: ["ranged", "pierce"],
  },
  crossbow_pin: {
    id: "crossbow_pin",
    label: "Pin",
    icon: "🏹",
    desc: "1 damage + Stun. Reaches back row.",
    color: "iron",
    target: "any-enemy",
    symbols: ["sword", "spark"],
    tags: ["ranged"],
  },
  crossbow_load: {
    id: "crossbow_load",
    label: "Load",
    icon: "🎯",
    desc: "+1 Power.",
    color: "echo",
    target: "self",
    symbols: ["power"],
  },

  /* Spear — riposte weapon. */
  spear_set: {
    id: "spear_set",
    label: "Set",
    icon: "🔱",
    desc: "1 damage + Riposte vs the next attack.",
    color: "iron",
    target: "front-enemy",
    symbols: ["sword", "riposte"],
  },
  spear_lunge: {
    id: "spear_lunge",
    label: "Lunge",
    icon: "🔱",
    desc: "2 damage to front.",
    color: "crimson",
    target: "front-enemy",
    symbols: ["sword", "sword"],
  },
  spear_thrust: {
    id: "spear_thrust",
    label: "Thrust",
    icon: "🔱",
    desc: "1 damage + Bleed.",
    color: "brine",
    target: "front-enemy",
    symbols: ["sword", "drop"],
  },
  spear_brace: {
    id: "spear_brace",
    label: "Brace",
    icon: "🛡️",
    desc: "1 block + Riposte.",
    color: "salt",
    target: "self",
    symbols: ["shield", "riposte"],
  },
  spear_reach: {
    id: "spear_reach",
    label: "Reach",
    icon: "🔱",
    desc: "1 damage. Reaches back row.",
    color: "echo",
    target: "any-enemy",
    symbols: ["sword"],
    tags: ["ranged"],
  },

  /* Greatsword — two-handed (occupies offhand too). Area on three faces. */
  greatsword_cleave: {
    id: "greatsword_cleave",
    label: "Cleave",
    icon: "⚔️",
    desc: "2 damage + adjacent.",
    color: "crimson",
    target: "front-enemy",
    symbols: ["sword", "sword"],
    tags: ["area", "heavy"],
  },
  greatsword_sweep: {
    id: "greatsword_sweep",
    label: "Sweep",
    icon: "⚔️",
    desc: "3 damage + adjacent.",
    color: "crimson",
    target: "front-enemy",
    symbols: ["sword", "sword", "sword"],
    tags: ["area", "heavy"],
  },
  greatsword_overhead: {
    id: "greatsword_overhead",
    label: "Overhead",
    icon: "⚔️",
    desc: "2 damage + Stun.",
    color: "iron",
    target: "front-enemy",
    symbols: ["sword", "sword", "spark"],
    tags: ["heavy"],
  },
  greatsword_arc: {
    id: "greatsword_arc",
    label: "Arc",
    icon: "⚔️",
    desc: "1 damage + adjacent + Bleed.",
    color: "brine",
    target: "front-enemy",
    symbols: ["sword", "drop"],
    tags: ["area", "heavy"],
  },
  greatsword_guard: {
    id: "greatsword_guard",
    label: "Guard",
    icon: "🛡️",
    desc: "2 block.",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield"],
  },

  /* Censer — Fire + holy on every face. */
  censer_swing: {
    id: "censer_swing",
    label: "Swing",
    icon: "🔥",
    desc: "1 fire (+1 vs undead).",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame"],
    tags: ["holy"],
  },
  censer_smolder: {
    id: "censer_smolder",
    label: "Smolder",
    icon: "🔥",
    desc: "2 fire (+holy).",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "flame"],
    tags: ["holy"],
  },
  censer_asperge: {
    id: "censer_asperge",
    label: "Asperge",
    icon: "✨",
    desc: "1 fire + cleanse self.",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "cleanse"],
    tags: ["holy"],
  },
  censer_pour: {
    id: "censer_pour",
    label: "Pour",
    icon: "✨",
    desc: "Heal 1 + cleanse 1.",
    color: "salt",
    target: "self",
    symbols: ["heart", "cleanse"],
  },
  censer_ward: {
    id: "censer_ward",
    label: "Ward",
    icon: "🛡️",
    desc: "1 block.",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },

  /* Buckler — defensive ripostes. */
  buckler_parry: {
    id: "buckler_parry",
    label: "Parry",
    icon: "🛡️",
    desc: "1 block + Riposte.",
    color: "salt",
    target: "self",
    symbols: ["shield", "riposte"],
  },
  buckler_punch: {
    id: "buckler_punch",
    label: "Punch",
    icon: "🥊",
    desc: "1 damage.",
    color: "crimson",
    target: "front-enemy",
    symbols: ["sword"],
  },
  buckler_brace: {
    id: "buckler_brace",
    label: "Brace",
    icon: "🛡️",
    desc: "1 block.",
    color: "salt",
    target: "self",
    symbols: ["shield"],
    tags: ["silent"],
  },
  buckler_dodge: {
    id: "buckler_dodge",
    label: "Slip",
    icon: "✷",
    desc: "Dodge.",
    color: "echo",
    target: "self",
    symbols: ["dodge"],
    tags: ["silent"],
  },
  buckler_riposte: {
    id: "buckler_riposte",
    label: "Riposte",
    icon: "⤺",
    desc: "Riposte + cleanse self.",
    color: "iron",
    target: "self",
    symbols: ["riposte", "cleanse"],
  },

  /* Lantern — fire + ranged + Mark. */
  lantern_reveal: {
    id: "lantern_reveal",
    label: "Reveal",
    icon: "🔦",
    desc: "1 fire + Mark. Reaches back row.",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame", "mark"],
    tags: ["ranged"],
  },
  lantern_beam: {
    id: "lantern_beam",
    label: "Beam",
    icon: "🔦",
    desc: "1 fire. Reaches back row.",
    color: "fire",
    target: "any-enemy",
    symbols: ["flame"],
    tags: ["ranged"],
  },
  lantern_mark: {
    id: "lantern_mark",
    label: "Mark",
    icon: "⚹",
    desc: "Mark target. Reaches back row.",
    color: "echo",
    target: "any-enemy",
    symbols: ["mark"],
    tags: ["ranged"],
  },
  lantern_warmth: {
    id: "lantern_warmth",
    label: "Warmth",
    icon: "💚",
    desc: "Heal 1.",
    color: "fire",
    target: "self",
    symbols: ["heart"],
  },
  lantern_focus: {
    id: "lantern_focus",
    label: "Focus",
    icon: "👁️",
    desc: "+1 Bolster.",
    color: "echo",
    target: "self",
    symbols: ["sun"],
  },

  /* Vials of Brine — bleed stacking. */
  vials_pour: {
    id: "vials_pour",
    label: "Pour",
    icon: "💧",
    desc: "+2 Bleed.",
    color: "brine",
    target: "any-enemy",
    symbols: ["drop", "drop"],
    tags: ["ranged"],
  },
  vials_splash: {
    id: "vials_splash",
    label: "Splash",
    icon: "💧",
    desc: "1 damage + Bleed.",
    color: "brine",
    target: "any-enemy",
    symbols: ["sword", "drop"],
    tags: ["ranged"],
  },
  vials_drench: {
    id: "vials_drench",
    label: "Drench",
    icon: "💧",
    desc: "+1 Bleed + adjacent.",
    color: "brine",
    target: "front-enemy",
    symbols: ["drop"],
    tags: ["area"],
  },
  vials_cure: {
    id: "vials_cure",
    label: "Cure",
    icon: "💚",
    desc: "Heal 1 + cleanse.",
    color: "salt",
    target: "self",
    symbols: ["heart", "cleanse"],
  },
  vials_steady: {
    id: "vials_steady",
    label: "Steady",
    icon: "🛡️",
    desc: "1 block.",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },

  /* Plate armor — heavy block. */
  plate_wall: {
    id: "plate_wall",
    label: "Wall",
    icon: "🛡️",
    desc: "3 block.",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield", "shield"],
  },
  plate_mass: {
    id: "plate_mass",
    label: "Mass",
    icon: "🛡️",
    desc: "2 block.",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield"],
  },
  plate_step: {
    id: "plate_step",
    label: "Step",
    icon: "⚒️",
    desc: "1 block + push.",
    color: "iron",
    target: "front-enemy",
    symbols: ["shield", "push"],
  },
  plate_grind: {
    id: "plate_grind",
    label: "Grind",
    icon: "⚒️",
    desc: "1 damage, ignores block.",
    color: "iron",
    target: "front-enemy",
    symbols: ["sword"],
    tags: ["pierce", "heavy"],
  },
  plate_endurance: {
    id: "plate_endurance",
    label: "Endurance",
    icon: "💚",
    desc: "Heal 1.",
    color: "fire",
    target: "self",
    symbols: ["heart"],
  },

  /* Cloak of the Stalker — silent faces, push-luck friendly. */
  cloak_slip: {
    id: "cloak_slip",
    label: "Slip",
    icon: "✷",
    desc: "Riposte (silent).",
    color: "echo",
    target: "self",
    symbols: ["riposte"],
    tags: ["silent"],
  },
  cloak_fade: {
    id: "cloak_fade",
    label: "Fade",
    icon: "🛡️",
    desc: "1 block (silent).",
    color: "salt",
    target: "self",
    symbols: ["shield"],
    tags: ["silent"],
  },
  cloak_shroud: {
    id: "cloak_shroud",
    label: "Shroud",
    icon: "✷",
    desc: "Dodge (silent).",
    color: "echo",
    target: "self",
    symbols: ["dodge"],
    tags: ["silent"],
  },
  cloak_breath: {
    id: "cloak_breath",
    label: "Breath",
    icon: "💚",
    desc: "Heal 1.",
    color: "fire",
    target: "self",
    symbols: ["heart"],
  },
  cloak_strike: {
    id: "cloak_strike",
    label: "Strike",
    icon: "🗡️",
    desc: "1 damage + Bleed.",
    color: "brine",
    target: "any-enemy",
    symbols: ["sword", "drop"],
  },

  /* ── New player faces (enemy-counter gaps) ── */

  // Coldfire: penetrates Ghost intangibility for one hit; also Weakens.
  coldfire_haunting_mark: {
    id: "coldfire_haunting_mark",
    label: "Haunting Mark",
    icon: "☠️",
    desc: "Mark + 1 Weaken. Removes Ghost intangibility for 1 hit.",
    color: "coldfire",
    target: "any-enemy",
    symbols: ["mark", "bolt"],
    tags: ["silent", "ranged"],
  },

  // Fire: dispels The Shadow's blank→Coldfire aura for this roll turn.
  fire_solar_ward: {
    id: "fire_solar_ward",
    label: "Solar Ward",
    icon: "☀️",
    desc: "2 fire (+holy). Dispels Shadow aura — Blanks stay Blank this turn.",
    color: "fire",
    target: "any-enemy",
    symbols: ["sun", "flame"],
    tags: ["holy", "ranged"],
  },

  // Brine: cash out Bleed stacks as burst (or re-apply if none). Vampire Lord kill window.
  brine_hemorrhage: {
    id: "brine_hemorrhage",
    label: "Hemorrhage",
    icon: "🩸",
    desc: "If target is Bleeding: deal damage = Bleed stacks and remove all Bleed. Else: +2 Bleed.",
    color: "brine",
    target: "front-enemy",
    symbols: ["drop", "sword"],
    tags: ["pierce"],
  },

  // Salt: removes slot-lock (Salt Revenant counter). Fallback: 2 block.
  salt_unclasp: {
    id: "salt_unclasp",
    label: "Unclasp",
    icon: "🔓",
    desc: "Remove all Locked from one die slot. If nothing is locked: 2 block instead.",
    color: "salt",
    target: "self",
    symbols: ["cleanse", "shield"],
    tags: ["silent"],
  },

  // Echo: pushes all front-row enemies back + dodge their attacks this turn. Delays, doesn't kill.
  echo_scatter: {
    id: "echo_scatter",
    label: "Scatter",
    icon: "🌀",
    desc: "Push all front-row enemies to back row. Dodge all front-row attacks this turn.",
    color: "echo",
    target: "all-front",
    symbols: ["push", "dodge"],
    tags: ["area", "silent"],
  },

  // Iron: bypasses Forsworn bodyguard redirection. Chips back-row enemies at reduced efficiency.
  iron_called_strike: {
    id: "iron_called_strike",
    label: "Called Strike",
    icon: "🎯",
    desc: "2 damage, ignoring bodyguard redirection. 4 damage if targeting the bodyguard itself.",
    color: "iron",
    target: "any-enemy",
    symbols: ["spark", "sword"],
    tags: ["pierce", "heavy", "ranged"],
  },

  // Iron: armor-break — reduces enemy block pool by 1 permanently for the encounter.
  iron_armor_shatter: {
    id: "iron_armor_shatter",
    label: "Armor Shatter",
    icon: "⚒️",
    desc: "2 damage. Reduce target's armor (warded) by 1 permanently.",
    color: "iron",
    target: "front-enemy",
    symbols: ["sword", "sword"],
    tags: ["pierce", "heavy"],
  },

  // Crimson: 1 damage + Mark on same target — enables follow-up doubling.
  crimson_marked_flesh: {
    id: "crimson_marked_flesh",
    label: "Marked Flesh",
    icon: "🩸",
    desc: "1 damage + Mark (next damage to this target is doubled).",
    color: "crimson",
    target: "front-enemy",
    symbols: ["sword", "mark"],
  },

  // Fire: Weaken rider on fire damage — bridges Fire+Coldfire naturally on Torch.
  fire_consuming_blaze: {
    id: "fire_consuming_blaze",
    label: "Consuming Blaze",
    icon: "🔥",
    desc: "1 fire + 1 Weaken.",
    color: "fire",
    target: "front-enemy",
    symbols: ["flame", "bolt"],
  },

  /* ── v3 enemy faces (player-targeting offensive symbols, or self-targeting for armor/heals) ── */

  // Zombie Grasp variant: undodgeable, applies Dragged status (engine handles "dragged").
  enemy_grasp_drag: {
    id: "enemy_grasp_drag",
    label: "Drag",
    icon: "✋",
    desc: "1 damage + 1 Bleed — undodgeable. Applies Dragged (dodge disabled 1 turn).",
    color: "brine",
    target: "self",
    symbols: ["sword", "drop"],
    tags: ["undodgeable"],
  },

  enemy_bite_1: {
    id: "enemy_bite_1",
    label: "Bite",
    icon: "🦷",
    desc: "1 damage to player.",
    color: "crimson",
    target: "self",
    symbols: ["sword"],
  },
  enemy_rake_2: {
    id: "enemy_rake_2",
    label: "Rake",
    icon: "🦷",
    desc: "2 damage to player.",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword"],
  },
  enemy_reproduce: {
    id: "enemy_reproduce",
    label: "Reproduce",
    icon: "🐀",
    desc: "Spawns a same-kind enemy in the same row.",
    color: "blank",
    target: "self",
    symbols: ["reproduce"],
    tags: ["silent"],
  },
  enemy_cower: {
    id: "enemy_cower",
    label: "Cower",
    icon: "🛡️",
    desc: "Self-block 1.",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },

  /* Skeleton offense */
  enemy_bone_strike: {
    id: "enemy_bone_strike",
    label: "Strike",
    icon: "🦴",
    desc: "2 damage to player.",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword"],
  },
  enemy_bone_crack: {
    id: "enemy_bone_crack",
    label: "Crack",
    icon: "💢",
    desc: "1 damage + Stun.",
    color: "iron",
    target: "self",
    symbols: ["sword", "spark"],
  },
  enemy_bone_lurch: {
    id: "enemy_bone_lurch",
    label: "Lurch",
    icon: "🦴",
    desc: "1 damage.",
    color: "crimson",
    target: "self",
    symbols: ["sword"],
  },
  enemy_bone_bash: {
    id: "enemy_bone_bash",
    label: "Bash",
    icon: "🦴",
    desc: "1 damage + adjacent.",
    color: "iron",
    target: "self",
    symbols: ["sword"],
    tags: ["area", "heavy"],
  },

  /* Skeleton armor die — every face is self-shield. */
  enemy_armor_2: {
    id: "enemy_armor_2",
    label: "Brace",
    icon: "🛡️",
    desc: "Self-block 2.",
    color: "salt",
    target: "self",
    symbols: ["shield", "shield"],
  },
  enemy_armor_1: {
    id: "enemy_armor_1",
    label: "Plate",
    icon: "🛡️",
    desc: "Self-block 1.",
    color: "salt",
    target: "self",
    symbols: ["shield"],
  },
  enemy_armor_strike: {
    id: "enemy_armor_strike",
    label: "Bash-Brace",
    icon: "🛡️",
    desc: "Self-block 1 + 1 damage to player.",
    color: "iron",
    target: "self",
    symbols: ["shield", "sword"],
  },
  enemy_armor_stun: {
    id: "enemy_armor_stun",
    label: "Stun-Brace",
    icon: "🛡️",
    desc: "Self-block 1 + Stun.",
    color: "iron",
    target: "self",
    symbols: ["shield", "spark"],
  },

  /* Banshee — terror attacks: unblockable. */
  enemy_wail: {
    id: "enemy_wail",
    label: "Wail",
    icon: "👻",
    desc: "3 damage — unblockable.",
    color: "echo",
    target: "self",
    symbols: ["sword", "sword", "sword"],
    tags: ["unblockable"],
  },
  enemy_drone: {
    id: "enemy_drone",
    label: "Drone",
    icon: "🌫️",
    desc: "+2 Weaken — unblockable.",
    color: "coldfire",
    target: "self",
    symbols: ["bolt", "bolt"],
    tags: ["unblockable"],
  },
  enemy_ululate: {
    id: "enemy_ululate",
    label: "Ululate",
    icon: "🎶",
    desc: "Stun.",
    color: "echo",
    target: "self",
    symbols: ["spark"],
  },

  /* Necromancer — area curse, no animation logic here (handled by selectIntent hook). */
  enemy_curse: {
    id: "enemy_curse",
    label: "Curse",
    icon: "🌫️",
    desc: "+1 Weaken to player + adjacent (none in single-player) — undodgeable.",
    color: "coldfire",
    target: "self",
    symbols: ["bolt"],
    tags: ["area", "undodgeable", "unblockable"],
  },
  enemy_grave_call: {
    id: "enemy_grave_call",
    label: "Grave-Call",
    icon: "🦴",
    desc: "1 damage — unblockable. Reaches.",
    color: "coldfire",
    target: "self",
    symbols: ["sword"],
    tags: ["unblockable"],
  },
  enemy_chant: {
    id: "enemy_chant",
    label: "Chant",
    icon: "📜",
    desc: "Self-heal 1.",
    color: "salt",
    target: "self",
    symbols: ["heart"],
  },

  /* Generic shared enemy faces */
  enemy_shamble: {
    id: "enemy_shamble",
    label: "Shamble",
    icon: "🧟",
    desc: "1 damage.",
    color: "crimson",
    target: "self",
    symbols: ["sword"],
  },
  enemy_grasp: {
    id: "enemy_grasp",
    label: "Grasp",
    icon: "✋",
    desc: "1 damage + Bleed.",
    color: "brine",
    target: "self",
    symbols: ["sword", "drop"],
  },
  enemy_phantom_strike: {
    id: "enemy_phantom_strike",
    label: "Phantom Strike",
    icon: "👻",
    desc: "2 damage — unblockable.",
    color: "echo",
    target: "self",
    symbols: ["sword", "sword"],
    tags: ["unblockable"],
  },
  enemy_drain: {
    id: "enemy_drain",
    label: "Drain",
    icon: "🩸",
    desc: "2 damage + heal self.",
    color: "brine",
    target: "self",
    symbols: ["sword", "sword", "heart"],
  },
  enemy_drain_heavy: {
    id: "enemy_drain_heavy",
    label: "Sanguine Drain",
    icon: "🩸",
    desc: "3 damage + heal self.",
    color: "coldfire",
    target: "self",
    symbols: ["sword", "sword", "sword"],
  },
  enemy_pounce: {
    id: "enemy_pounce",
    label: "Pounce",
    icon: "🐾",
    desc: "3 damage.",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword", "sword"],
  },
  enemy_ambush: {
    id: "enemy_ambush",
    label: "Ambush",
    icon: "💥",
    desc: "3 damage — unblockable.",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword", "sword"],
    tags: ["unblockable"],
  },
  enemy_shadow_strike: {
    id: "enemy_shadow_strike",
    label: "Shadow Strike",
    icon: "🌑",
    desc: "1 damage — unblockable.",
    color: "coldfire",
    target: "self",
    symbols: ["sword"],
    tags: ["unblockable"],
  },
  enemy_pilfer: {
    id: "enemy_pilfer",
    label: "Pilfer",
    icon: "🪙",
    desc: "Steals 1 salt.",
    color: "iron",
    target: "self",
    symbols: ["steal"],
  },
  enemy_animate: {
    id: "enemy_animate",
    label: "Animate",
    icon: "⚰️",
    desc: "Animates a corpse next turn.",
    color: "coldfire",
    target: "self",
    symbols: [],
  },
  enemy_summon: {
    id: "enemy_summon",
    label: "Raise Dead",
    icon: "⚰️",
    desc: "Animates a Heap or summons.",
    color: "coldfire",
    target: "self",
    symbols: [],
  },
  enemy_force_face: {
    id: "enemy_force_face",
    label: "Tithe",
    icon: "📜",
    desc: "Adds a forced face to your next pool.",
    color: "brine",
    target: "self",
    symbols: [],
  },
  enemy_bind: {
    id: "enemy_bind",
    label: "Bind",
    icon: "⛓️",
    desc: "Locks one of your dice.",
    color: "salt",
    target: "self",
    symbols: [],
  },
  enemy_crush: {
    id: "enemy_crush",
    label: "Crush",
    icon: "🪨",
    desc: "3 bludgeoning.",
    color: "iron",
    target: "self",
    symbols: ["sword", "sword", "sword"],
    tags: ["heavy"],
  },
  enemy_hold: {
    id: "enemy_hold",
    label: "Hold",
    icon: "🪨",
    desc: "2 bludgeoning + Stun.",
    color: "iron",
    target: "self",
    symbols: ["sword", "sword", "spark"],
    tags: ["heavy"],
  },
  enemy_great_cleave: {
    id: "enemy_great_cleave",
    label: "Bone Cleave",
    icon: "🦴",
    desc: "3 damage + adjacent — area.",
    color: "crimson",
    target: "self",
    symbols: ["sword", "sword", "sword"],
    tags: ["area", "heavy"],
  },
  enemy_brand: {
    id: "enemy_brand",
    label: "Brand",
    icon: "🩸",
    desc: "Marks player — next damage doubled.",
    color: "coldfire",
    target: "self",
    symbols: ["mark"],
    tags: ["unblockable"],
  },
  enemy_cold_lamp: {
    id: "enemy_cold_lamp",
    label: "Cold Lamp",
    icon: "🕯️",
    desc: "3 damage — unblockable.",
    color: "coldfire",
    target: "self",
    symbols: ["sword", "sword", "sword"],
    tags: ["unblockable"],
  },
  enemy_iron_pike: {
    id: "enemy_iron_pike",
    label: "Iron Pike",
    icon: "🗡️",
    desc: "2 damage + Stun.",
    color: "iron",
    target: "self",
    symbols: ["sword", "sword", "spark"],
    tags: ["heavy"],
  },
  enemy_echo_lance: {
    id: "enemy_echo_lance",
    label: "Echo Lance",
    icon: "🎶",
    desc: "3 damage + Weaken — unblockable.",
    color: "echo",
    target: "self",
    symbols: ["sword", "sword", "sword", "bolt"],
    tags: ["unblockable"],
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
