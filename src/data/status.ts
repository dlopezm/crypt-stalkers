import type { StatusKey } from "../types";

export const STATUS_COLORS: Record<StatusKey, string> = {
  bleed: "#c0392b", weaken: "#e67e22", blind: "#7f8c8d",
  silence: "#8e44ad", poison: "#27ae60", stun: "#f1c40f",
};

export const STATUS_ICONS: Record<StatusKey, string> = {
  bleed: "\u{1FA78}", weaken: "\u{1F494}", blind: "\u{1F441}\uFE0F",
  silence: "\u{1F507}", poison: "\u{1F40D}", stun: "\u26A1",
};

export const STATUS_DESC: Record<StatusKey, string> = {
  bleed: "Lose HP each turn", weaken: "Deal 25% less dmg",
  blind: "30% miss chance", silence: "Can't play Skills",
  poison: "Lose HP (stacks)", stun: "Skip next action",
};
