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
  bleed: "Receives damage equal to stack count each turn, then loses 1 stack.",
  weaken: "Deals 1 less damage per hit. Loses 1 stack each turn.",
  blind: "Each attack has a 30% chance to miss entirely.",
  silence: "Cannot use active abilities.",
  poison: "Receives damage equal to stack count each turn. Stacks do not decay.",
  stun: "Skips their next action. Loses 1 stack when triggered.",
  bolster: "Deals +1 damage on all damage symbols. Clears at end of turn.",
  dice_stun: "One randomly chosen rolled die has no effect this turn.",
  mark: "The next instance of damage dealt to this target is doubled. Consumes 1 stack.",
  warded:
    "Each stack absorbs 1 incoming damage. All stacks are cleared at the start of the enemy phase.",
  dragged: "Dodge faces do not prevent incoming damage. Loses 1 stack each turn.",
};
