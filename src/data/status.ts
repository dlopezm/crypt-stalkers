import type { StatusKey } from "../types";

export const STATUS_COLORS: Record<StatusKey, string> = {
  bleed: "#c0392b",
  weaken: "#e67e22",
  blind: "#7f8c8d",
  silence: "#8e44ad",
  poison: "#27ae60",
  stun: "#f1c40f",
  bolster: "#E8821F",
  dice_stun: "#f1c40f",
  mark: "#E8821F",
  warded: "#bcbcbc",
  dragged: "#5d6d7e",
};

export const STATUS_ICONS: Record<StatusKey, string> = {
  bleed: "\u{1FA78}",
  weaken: "\u{1F494}",
  blind: "\u{1F441}\uFE0F",
  silence: "\u{1F507}",
  poison: "\u{1F40D}",
  stun: "\u26A1",
  bolster: "\u2600",
  dice_stun: "\u2728",
  mark: "\u2739",
  warded: "\u{1F6E1}",
  dragged: "\u{1F9DF}",
};

export const STATUS_DESC: Record<StatusKey, string> = {
  bleed: "Lose HP each turn",
  weaken: "Deal 25% less dmg",
  blind: "30% miss chance",
  silence: "Can't use Abilities",
  poison: "Lose HP (stacks)",
  stun: "Skip next action",
  bolster: "+1 to damage symbols",
  dice_stun: "One rolled die does nothing",
  mark: "Next damage doubled",
  warded: "Block (absorbs damage)",
  dragged: "Dodge faces don't prevent damage",
};
