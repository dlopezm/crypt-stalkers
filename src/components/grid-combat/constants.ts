import type { Direction, GridConditionKey, TelegraphType } from "../../grid-combat/types";

export const TILE_SIZE = 104;

export const TERRAIN_COLORS: Record<string, string> = {
  floor: "#1a1610",
  wall: "#0c0a08",
  rubble: "#3a3020",
  pillar: "#5a4a38",
  pit: "#0a0000",
  mine_cart: "#8b6914",
  salt_deposit: "#d4c8a8",
  brazier: "#f0c040",
  dark_zone: "#050304",
  hazard: "#8b0000",
  ward_line: "#5dade2",
  hallowed_ground: "#f0c040",
  smoke: "#666",
  rail: "#3a3020",
};

export const TERRAIN_ICONS: Record<string, string> = {
  rubble: "🪨",
  pillar: "🏛️",
  pit: "🕳️",
  mine_cart: "🛒",
  salt_deposit: "🧂",
  brazier: "🔥",
  hazard: "⚠️",
  ward_line: "🛡️",
  hallowed_ground: "✨",
  smoke: "🌫️",
  rail: "═",
};

export const FACING_ROTATION: Record<Direction, number> = {
  south: 0,
  north: 180,
  east: -90,
  west: 90,
};

export const TERRAIN_INFO: Record<
  string,
  { readonly name: string; readonly effect: string } | undefined
> = {
  floor: undefined,
  wall: { name: "Wall", effect: "Impassable. Blocks line of sight." },
  rubble: {
    name: "Rubble",
    effect: "Blocks movement. Destroyable with bludgeoning → AoE debris.",
  },
  pillar: { name: "Pillar", effect: "Blocks movement + LOS. Collapsible → 3×1 debris line." },
  pit: {
    name: "Pit",
    effect: "Impassable. Units pushed in take massive damage (instant-kill non-bosses).",
  },
  mine_cart: {
    name: "Mine Cart",
    effect: "Pushable along rails. Damages + pushes anything in its path.",
  },
  salt_deposit: {
    name: "Salt Deposit",
    effect: "Blocks movement + ranged LOS. Breakable → yields salt.",
  },
  brazier: {
    name: "Brazier",
    effect: "Light source (2-tile radius). Can be extinguished/relit.",
  },
  dark_zone: {
    name: "Dark Zone",
    effect: "No vision beyond adjacent. Ghouls hide here. Shadows empowered.",
  },
  hazard: { name: "Hazard", effect: "Damages any unit stepping on it." },
  ward_line: { name: "Ward Line", effect: "Undead cannot cross. Lasts 3 turns." },
  hallowed_ground: { name: "Hallowed Ground", effect: "Undead take 3 holy damage per turn." },
  smoke: { name: "Smoke", effect: "Blocks all line of sight through this tile." },
  rail: { name: "Rail Track", effect: "Mine carts travel along these." },
  rot: { name: "Rot", effect: "Corruption deals damage each turn to any unit standing here." },
};

export const CONDITION_DISPLAY: Record<GridConditionKey, { icon: string; color: string }> = {
  poisoned: { icon: "🐍", color: "text-green-400" },
  burning: { icon: "🔥", color: "text-orange-400" },
  stunned: { icon: "💫", color: "text-yellow-400" },
  immobilized: { icon: "⛓️", color: "text-amber-400" },
  slowed: { icon: "🐌", color: "text-blue-400" },
  silenced: { icon: "🔇", color: "text-purple-400" },
  infected: { icon: "☣️", color: "text-green-500" },
  hidden: { icon: "👁️", color: "text-gray-400" },
  intercepting: { icon: "🛡️", color: "text-amber-300" },
  marked: { icon: "💀", color: "text-red-500" },
  commanded: { icon: "👆", color: "text-yellow-300" },
};

export const TELEGRAPH_TYPE_COLORS: Record<TelegraphType, { bg: string; pulse: string }> = {
  attack: { bg: "rgba(196, 28, 28, 0.25)", pulse: "rgba(196, 28, 28, 0.15)" },
  move: { bg: "rgba(240, 192, 64, 0.18)", pulse: "rgba(240, 192, 64, 0.10)" },
  buff: { bg: "rgba(93, 173, 226, 0.15)", pulse: "rgba(93, 173, 226, 0.08)" },
  special: { bg: "rgba(180, 120, 255, 0.18)", pulse: "rgba(180, 120, 255, 0.10)" },
};
