import type { Weapon } from "../types";

export const WEAPONS: Weapon[] = [
  { id: "short_sword", name: "Short Sword", damage: 8, range: "melee", icon: "\u{1F5E1}\uFE0F", desc: "A simple blade. 8 melee damage.", cost: 0 },
  { id: "mace", name: "Iron Mace", damage: 10, range: "melee", icon: "\u{1F528}", desc: "Heavy blunt weapon. 10 melee damage.", cost: 30 },
  { id: "long_sword", name: "Long Sword", damage: 12, range: "melee", icon: "\u2694\uFE0F", desc: "A fine blade. 12 melee damage.", cost: 50 },
  { id: "war_hammer", name: "War Hammer", damage: 16, range: "melee", icon: "\u{1F6E0}\uFE0F", desc: "Devastating blows. 16 dmg. Kills Skeletons permanently.", cost: 80, finishing: true },
  { id: "short_bow", name: "Short Bow", damage: 6, range: "ranged", icon: "\u{1F3F9}", desc: "Basic ranged weapon. 6 ranged damage.", cost: 25 },
  { id: "crossbow", name: "Crossbow", damage: 10, range: "ranged", icon: "\u{1F3F9}", desc: "Precise and powerful. 10 ranged damage.", cost: 60 },
  { id: "holy_mace", name: "Holy Mace", damage: 12, range: "melee", icon: "\u271D\uFE0F", desc: "Blessed weapon. 12 holy melee damage. +50% vs Vampires.", cost: 70, holy: true },
  { id: "silver_dagger", name: "Silver Dagger", damage: 6, range: "melee", icon: "\u{1F52A}", desc: "Quick strikes. 50% chance to Bleed.", cost: 40, applyStatus: { status: "bleed", stacks: 2, chance: 0.5 } },
  { id: "throwing_axes", name: "Throwing Axes", damage: 7, range: "ranged", icon: "\u{1FA93}", desc: "Ranged axes. Hit ALL enemies.", cost: 55, aoe: true },
];

export const STARTER_WEAPON_ID = "short_sword";
