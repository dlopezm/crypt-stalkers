import type { AreaNode } from "../types";

export interface EnvironmentalEffectDef {
  readonly field: keyof AreaNode;
  readonly description: string;
  readonly threat: string;
  readonly tint?: readonly [r: number, g: number, b: number, a: number];
  readonly icon?: string;
  readonly hazardous: boolean;
}

export const ENVIRONMENTAL_EFFECTS: readonly EnvironmentalEffectDef[] = [
  {
    field: "shadowDarkness",
    description: "The darkness here feels heavy, deliberate.",
    threat: "Unnatural darkness \u2014 reduced visibility",
    tint: [0, 0, 0, 0.1],
    hazardous: true,
  },
  {
    field: "coldZone",
    description: "The air feels unnaturally cold.",
    threat: "Cold zone \u2014 ghost territory",
    tint: [100, 150, 255, 0.15],
    hazardous: false,
  },
  {
    field: "wailZone",
    description: "An unearthly keening sets your teeth on edge.",
    threat: "Wail zone \u2014 sound masked, cannot hear nearby movement",
    tint: [150, 50, 200, 0.1],
    hazardous: true,
  },
  {
    field: "stench",
    description: "The air is thick and foul.",
    threat: "Foul stench \u2014 necromancer influence nearby",
    tint: [100, 150, 50, 0.12],
    hazardous: false,
  },
  {
    field: "tracks",
    description: "Fleshy nodules along the wall, weeping clear fluid.",
    threat: "Rot spreading from a false altar nearby",
    icon: "\u{1F56F}\uFE0F",
    hazardous: true,
  },
  {
    field: "saltCrystals",
    description: "Salt crystals bloom from the walls, warm to the touch.",
    threat: "Salt crystals \u2014 revenant territory, rich in salt",
    tint: [255, 220, 100, 0.12],
    icon: "\u2728",
    hazardous: false,
  },
  {
    field: "ratInfested",
    description: "Gnaw marks everywhere. The rats have been busy.",
    threat: "Rat infestation \u2014 supplies may be degraded",
    icon: "\u{1F400}",
    hazardous: false,
  },
  {
    field: "infested",
    description: "Something writhes inside the dead.",
    threat: "Corpse infestation \u2014 larvae breeding",
    tint: [50, 200, 50, 0.1],
    icon: "\u2623\uFE0F",
    hazardous: false,
  },
];

export function getActiveEffects(node: AreaNode): readonly EnvironmentalEffectDef[] {
  return ENVIRONMENTAL_EFFECTS.filter((e) => {
    const val = node[e.field];
    return val !== undefined && val !== false && val !== 0 && val !== null;
  });
}

export function isHazardousRoom(node: AreaNode): boolean {
  return getActiveEffects(node).some((e) => e.hazardous);
}
