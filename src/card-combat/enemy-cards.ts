import type { EnemyCardDef } from "./types";

function ecard(
  partial: Partial<EnemyCardDef> & Pick<EnemyCardDef, "id" | "name" | "icon" | "kind">,
): EnemyCardDef {
  return {
    reach: { min: 0, max: 0 },
    damage: 0,
    damageType: null,
    conditions: [],
    selfMove: 0,
    description: "",
    ...partial,
  };
}

export const ENEMY_CARDS: readonly EnemyCardDef[] = [
  ecard({
    id: "rat_bite",
    name: "Bite",
    icon: "🦷",
    kind: "attack",
    reach: { min: 0, max: 0 },
    damage: 2,
    damageType: "pierce",
    description: "Bite the player.",
  }),
  ecard({
    id: "rat_scurry",
    name: "Scurry",
    icon: "👣",
    kind: "move_close",
    selfMove: -1,
    description: "Scurry closer.",
  }),

  ecard({
    id: "skeleton_slash",
    name: "Bone Slash",
    icon: "🦴",
    kind: "attack",
    reach: { min: 0, max: 0 },
    damage: 5,
    damageType: "slash",
    description: "Heavy overhand slash.",
  }),
  ecard({
    id: "skeleton_advance",
    name: "Advance",
    icon: "👣",
    kind: "move_close",
    selfMove: -1,
    description: "Close the distance.",
  }),
  ecard({
    id: "skeleton_guard",
    name: "Shielded Stance",
    icon: "🛡️",
    kind: "buff",
    description: "Raise a bone shield.",
  }),

  ecard({
    id: "zombie_grab",
    name: "Grab",
    icon: "🫳",
    kind: "attack",
    reach: { min: 0, max: 0 },
    damage: 3,
    damageType: "bludgeoning",
    conditions: [{ condition: "immobilized", stacks: 1, target: "enemy" }],
    description: "Grabs and bites.",
  }),
  ecard({
    id: "zombie_shamble",
    name: "Shamble",
    icon: "🚶",
    kind: "move_close",
    selfMove: -1,
    description: "Shamble forward.",
  }),

  ecard({
    id: "ghost_chill",
    name: "Chill Touch",
    icon: "❄️",
    kind: "attack",
    reach: { min: 0, max: 1 },
    damage: 3,
    damageType: "holy",
    conditions: [{ condition: "slowed", stacks: 1, target: "enemy" }],
    description: "Cold touch that numbs.",
  }),
  ecard({
    id: "ghost_phase",
    name: "Phase",
    icon: "👻",
    kind: "move_retreat",
    selfMove: 2,
    description: "Phase through walls.",
  }),

  ecard({
    id: "banshee_wail",
    name: "Wail",
    icon: "😱",
    kind: "attack",
    reach: { min: 1, max: 99 },
    damage: 3,
    damageType: "holy",
    conditions: [{ condition: "silenced", stacks: 1, target: "enemy" }],
    description: "Piercing wail.",
  }),
  ecard({
    id: "banshee_dirge",
    name: "Dirge",
    icon: "🎵",
    kind: "attack",
    reach: { min: 1, max: 99 },
    damage: 5,
    damageType: "holy",
    description: "A cursed song.",
  }),

  ecard({
    id: "necro_raise",
    name: "Raise Dead",
    icon: "💀",
    kind: "summon",
    description: "Raise a fallen minion.",
  }),
  ecard({
    id: "necro_bolt",
    name: "Dark Bolt",
    icon: "🌑",
    kind: "attack",
    reach: { min: 1, max: 99 },
    damage: 4,
    damageType: "holy",
    description: "Bolt of negative energy.",
  }),

  ecard({
    id: "ghoul_pounce",
    name: "Pounce",
    icon: "🐾",
    kind: "attack",
    reach: { min: 0, max: 2 },
    damage: 6,
    damageType: "slash",
    selfMove: -2,
    conditions: [{ condition: "bleeding", stacks: 2, target: "enemy" }],
    description: "Leap and rend.",
  }),
  ecard({
    id: "ghoul_slash",
    name: "Slash",
    icon: "🗡️",
    kind: "attack",
    reach: { min: 0, max: 0 },
    damage: 4,
    damageType: "slash",
    description: "Savage claws.",
  }),

  ecard({
    id: "vampire_drain",
    name: "Drain Bite",
    icon: "🩸",
    kind: "attack",
    reach: { min: 0, max: 0 },
    damage: 6,
    damageType: "pierce",
    conditions: [{ condition: "bleeding", stacks: 2, target: "enemy" }],
    description: "Drains your blood.",
  }),
  ecard({
    id: "vampire_stalk",
    name: "Stalk",
    icon: "👁️",
    kind: "move_retreat",
    selfMove: 1,
    description: "Back off, waiting.",
  }),

  ecard({
    id: "forsworn_cleave",
    name: "Oath-Break Cleave",
    icon: "⚔️",
    kind: "attack",
    reach: { min: 0, max: 0 },
    damage: 5,
    damageType: "slash",
    description: "A heavy cleave.",
  }),
  ecard({
    id: "forsworn_ward",
    name: "Ward Allies",
    icon: "🔰",
    kind: "buff",
    description: "Hardens nearby.",
  }),

  ecard({
    id: "larva_crawl",
    name: "Crawl",
    icon: "🪱",
    kind: "move_close",
    selfMove: -1,
    description: "Crawls toward prey.",
  }),

  ecard({
    id: "lich_bolt",
    name: "Death Bolt",
    icon: "🌑",
    kind: "attack",
    reach: { min: 1, max: 99 },
    damage: 6,
    damageType: "holy",
    conditions: [{ condition: "marked", stacks: 2, target: "enemy" }],
    description: "Withering bolt.",
  }),
  ecard({
    id: "lich_nova",
    name: "Necrotic Nova",
    icon: "💥",
    kind: "attack",
    reach: { min: 0, max: 99 },
    damage: 4,
    damageType: "holy",
    conditions: [{ condition: "cursed", stacks: 2, target: "enemy" }],
    description: "An unholy blast.",
  }),
  ecard({
    id: "lich_raise",
    name: "Mass Raise",
    icon: "☠️",
    kind: "summon",
    description: "Raises every corpse.",
  }),
];

export const ENEMY_CARD_MAP: ReadonlyMap<string, EnemyCardDef> = new Map(
  ENEMY_CARDS.map((c) => [c.id, c]),
);

export function getEnemyCard(id: string): EnemyCardDef | undefined {
  return ENEMY_CARD_MAP.get(id);
}
