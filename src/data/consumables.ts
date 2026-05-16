import type { Consumable } from "../types";

export const CONSUMABLES: Consumable[] = [
  { id: "heal_sm", name: "Minor Potion", icon: "\u{1F9EA}", desc: "Restore 15 HP." },
  { id: "heal_lg", name: "Greater Potion", icon: "⚗️", desc: "Restore 30 HP." },
  { id: "antidote", name: "Antidote", icon: "\u{1F33F}", desc: "Cure all status effects." },
  { id: "torch", name: "Torch", icon: "\u{1F525}", desc: "Restore 2 light levels." },
  {
    id: "throwing_knife",
    name: "Throwing Knife",
    icon: "\u{1F5E1}️",
    desc: "Deal 10 ranged damage.",
  },
  { id: "holy_water", name: "Holy Water", icon: "\u{1F4A7}", desc: "Deal 20 holy damage." },
  { id: "flash_bomb", name: "Flash Bomb", icon: "\u{1F4A5}", desc: "8 damage to all enemies." },
  {
    id: "poison_flask",
    name: "Poison Flask",
    icon: "\u{1F40D}",
    desc: "Apply 3 Poison to target.",
  },
  { id: "stun_bomb", name: "Stun Bomb", icon: "⚡", desc: "Stun target for 1 turn." },
];

export const STARTER_CONSUMABLE_IDS = ["heal_sm"];
