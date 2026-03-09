import type { Ability } from "../types";

export const ABILITIES: Ability[] = [
  // Old Shrine
  { id: "heal", name: "Divine Heal", icon: "\u2728", desc: "Restore 12 HP.",
    building: "shrine", buildingLevel: 1, heal: 12, needsTarget: false },
  { id: "holy_smite", name: "Holy Smite", icon: "\u2600\uFE0F", desc: "18 holy dmg. Always hits Ghosts.",
    building: "shrine", buildingLevel: 2, damage: 18, damageRange: "ranged", holy: true, needsTarget: true },

  // Hunter's Lodge
  { id: "aimed_shot", name: "Aimed Shot", icon: "\u{1F3AF}", desc: "12 precise ranged damage.",
    building: "hunter", buildingLevel: 1, damage: 12, damageRange: "ranged", needsTarget: true },
  { id: "stealth", name: "Stealth", icon: "\u{1F464}", desc: "Enemies skip their next attacks.",
    building: "hunter", buildingLevel: 2, selfBuff: "stealth", needsTarget: false },

  // Knight's Chapterhouse
  { id: "shield_bash", name: "Shield Bash", icon: "\u{1F6E1}\uFE0F", desc: "8 melee dmg + gain 8 block.",
    building: "knight", buildingLevel: 1, damage: 8, damageRange: "melee", block: 8, needsTarget: true },
  { id: "counter_stance", name: "Counter Stance", icon: "\u2694\uFE0F", desc: "Reflect 50% of next hit back.",
    building: "knight", buildingLevel: 2, selfBuff: "counter", needsTarget: false },

  // Alchemist's Workshop
  { id: "acid_flask", name: "Acid Flask", icon: "\u{1F9EA}", desc: "Apply Weaken \u00D73 to target.",
    building: "alchemist", buildingLevel: 1, applyStatus: { status: "weaken", stacks: 3 }, damageRange: "ranged", needsTarget: true },
  { id: "smoke_bomb_ability", name: "Smoke Bomb", icon: "\u{1F4A8}", desc: "Blind all enemies for 2 turns.",
    building: "alchemist", buildingLevel: 2, applyStatus: { status: "blind", stacks: 2 }, aoe: true, damageRange: "ranged", needsTarget: false },
];
