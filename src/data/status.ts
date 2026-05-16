import type { StatusKey } from "../types";
import type { IconProps } from "../icons"; // used as Record value type below
import {
  IconBleed,
  IconWeaken,
  IconBlind,
  IconSilence,
  IconPoison,
  IconStun,
  IconBolster,
  IconMark,
  IconWarded,
  IconPower,
  IconDragged,
  IconDodge,
  IconIntangible,
  IconTaunt,
  IconHidden,
  IconFocus,
} from "../icons";

export const STATUS_COLORS: Record<StatusKey, string> = {
  bleed: "#c0392b",
  weaken: "#e67e22",
  blind: "#7f8c8d",
  silence: "#8e44ad",
  poison: "#27ae60",
  stun: "#f1c40f",
  bolster: "#E8821F",
  mark: "#E8821F",
  warded: "#bcbcbc",
  power: "#e8c31f",
  dragged: "#5d6d7e",
  dodge: "#7ec8e3",
  intangible: "#b8a9c9",
  taunt: "#e8821f",
  hidden: "#2c3e50",
  focus: "#a8d8ea",
};

export const STATUS_ICONS: Record<StatusKey, React.FC<IconProps>> = {
  bleed: IconBleed,
  weaken: IconWeaken,
  blind: IconBlind,
  silence: IconSilence,
  poison: IconPoison,
  stun: IconStun,
  bolster: IconBolster,
  mark: IconMark,
  warded: IconWarded,
  power: IconPower,
  dragged: IconDragged,
  dodge: IconDodge,
  intangible: IconIntangible,
  taunt: IconTaunt,
  hidden: IconHidden,
  focus: IconFocus,
};

export const STATUS_DESC: Record<StatusKey, string> = {
  bleed: "Receives damage equal to stack count each turn, then loses 1 stack.",
  weaken: "Deals 1 less damage per hit. Loses 1 stack each turn.",
  blind: "Each attack has a 30% chance to miss entirely.",
  silence: "Cannot use active abilities.",
  poison:
    "Each stack adds a self-damage symbol to a random die face (the same face can be hit multiple times). Stacks clear at end of combat; cleanse removes one stack.",
  stun: "Each stack causes the next die rolled to do nothing (still counts for bust). Loses 1 stack per die rolled.",
  bolster: "Deals +1 damage on all damage symbols. Loses 1 stack each turn.",
  mark: "The next instance of damage dealt to this target is doubled. Consumes 1 stack.",
  warded:
    "Each stack absorbs 1 incoming damage. All stacks are cleared at the start of the enemy phase.",
  power: "Next damage symbol deals +N damage. Consumed on hit.",
  dragged: "Dodge faces do not prevent incoming damage. Loses 1 stack each turn.",
  dodge: "The next incoming attack is negated entirely. Clears at the start of the enemy phase.",
  intangible: "Immune to physical damage. Clears at the start of the enemy phase.",
  taunt: "Forces enemies without Taunt to be untargetable while any enemy has Taunt.",
  hidden:
    "Cannot be targeted this turn. Enables Sneak Attack. Clears at start of the player's turn.",
  focus: "Each stack lets you choose the face of your next die roll. One stack consumed per roll.",
};
