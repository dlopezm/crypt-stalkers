import type { EnemyType } from "../types";

export const ENEMY_TYPES: EnemyType[] = [
  {
    id: "rat",
    name: "Ravager Rat",
    ascii: "\u{1F400}",
    mechanic: "swarm",
    deathHint:
      "Rats swarm in numbers. Kill them fast before they breed — fire and area attacks thin the pack.",
  },
  {
    id: "skeleton",
    name: "Skeleton",
    ascii: "\u{1F480}",
    mechanic: "reassemble",
    deathHint:
      "Skeletons reassemble after death. Use bludgeoning weapons to shatter them for good.",
  },
  {
    id: "zombie",
    name: "Rotting Zombie",
    ascii: "\u{1F9DF}",
    mechanic: "controlled",
    deathHint:
      "Zombies are slow but relentless. Kill the necromancer commanding them and they'll stop advancing.",
  },
  {
    id: "ghost",
    name: "Mournful Ghost",
    ascii: "\u{1F47B}",
    mechanic: "phase",
    deathHint:
      "Ghosts phase through physical attacks. Use holy water or wait for them to manifest — they can't dodge while attacking.",
  },
  {
    id: "vampire",
    name: "Blood Wraith",
    ascii: "\u{1F9DB}",
    mechanic: "lifesteal",
    deathHint:
      "Vampires heal by draining your blood. Keep your HP high — they retreat when you're strong and strike when you're weak.",
  },
  {
    id: "banshee",
    name: "Wailing Banshee",
    ascii: "\u{1F441}️",
    mechanic: "drain_aura",
    deathHint:
      "Banshees deafen everything nearby, masking other sounds. Approach cautiously — you won't hear what else lurks in wail zones.",
  },
  {
    id: "necromancer",
    name: "Necromancer",
    ascii: "\u{1F9D9}",
    mechanic: "summon",
    deathHint:
      "Necromancers are frail but dangerous. They resurrect the dead and command undead troops. Prioritize them in combat.",
  },
  {
    id: "ghoul",
    name: "Lurking Ghoul",
    ascii: "\u{1F9B4}",
    mechanic: "ambush",
    deathHint:
      "Ghouls hide in dark rooms and ambush. Carry light to prevent surprise attacks — they flee from illumination.",
  },
  {
    id: "shadow",
    name: "The Shadow",
    ascii: "\u{1F311}",
    mechanic: "light_drain",
    deathHint:
      "Shadows spread darkness to adjacent rooms and drain your light. Keep backup light sources ready.",
  },
  {
    id: "heap_of_bones",
    name: "Heap of Bones",
    ascii: "\u{1F9B4}",
    mechanic: "reassemble_source",
  },
  {
    id: "grave_robber",
    name: "Grave Robber",
    ascii: "🕵️",
    mechanic: "flee",
    deathHint:
      "Grave robbers flee combat and steal dungeon resources. Corner them — they can't fight, but what they stole drops on death.",
  },
  {
    id: "gutborn_larva",
    name: "Gutborn Larva",
    ascii: "🪱",
    mechanic: "infect",
    deathHint:
      "Larvae are fragile but infest corpses. Clear bodies from rooms or they'll multiply into something worse.",
  },
  {
    id: "forsworn",
    name: "The Forsworn",
    ascii: "⚔️",
    mechanic: "perjured_ward",
    deathHint:
      "The Forsworn resist slashing and piercing but holy damage burns through their broken oaths. Bludgeoning cracks the plate.",
  },
  {
    id: "false_sacrarium",
    name: "The False Sacrarium",
    ascii: "⛪",
    mechanic: "putrid_litany",
    deathHint:
      "The False Sacrarium spreads rot each turn. Rush it down before the room becomes uninhabitable. Holy and fire purify its corruption.",
  },
  {
    id: "salt_revenant",
    name: "Salt Revenant",
    ascii: "💎",
    mechanic: "grapple",
    deathHint:
      "Salt revenants grapple and hold you in place. Break free quickly — they're territorial and won't chase far from their domain.",
  },
  {
    id: "boss_skeleton_lord",
    name: "SKELETON LORD",
    ascii: "\u{1F480}",
    mechanic: "reassemble",
    isBoss: true,
    deathHint:
      "The Skeleton Lord is heavily armored against piercing. Bring your heaviest bludgeoning weapon.",
  },
  {
    id: "boss_vampire_lord",
    name: "VAMPIRE LORD",
    ascii: "\u{1F9DB}",
    mechanic: "lifesteal",
    isBoss: true,
    deathHint:
      "The Vampire Lord heals relentlessly. Burst damage and anti-heal items are essential.",
  },
  {
    id: "boss_lich",
    name: "THE LICH KING",
    ascii: "☠️",
    mechanic: "boss",
    isBoss: true,
    deathHint:
      "The Lich King commands all undead. Surviving his onslaught requires mastering every lesson the dungeon taught you.",
  },
];
