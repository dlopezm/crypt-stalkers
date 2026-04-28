/* ═══════════════════════════════════════════════════════════════════════════
   Line Combat — Encounter Definitions
   Three encounter templates showcasing different tactical situations.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { LineEncounterDef } from "./types";

// ─── Tutorial: The Corridor ───
// Teaches range management: skeleton uses Bone Lunge at dist 2, not 1.
// Player at slot 5, skeleton at slot 3. Skeleton will Bone Lunge → hits slot 5.
// Player learns to step to slot 6 to dodge, then attack at dist 1 or 2.

export const ENCOUNTER_TUTORIAL: LineEncounterDef = {
  id: "tutorial_corridor",
  name: "The Corridor",
  desc: "A lone skeleton blocks the passage. Watch where it strikes.",
  lineLength: 9,
  playerStartSlot: 5,
  terrain: {},
  enemies: [["skeleton", 2]],
  goal: { type: "kill_all" },
  reinforcements: [],
  isTutorial: true,
};

// ─── Encounter A: Corridor Assault ───
// Necromancer hides at slot 1 behind two skeletons at slots 3-4.
// Goal: kill all. Skeletons reform if killed with non-bludgeoning damage.
// Turn 3: second necromancer enters from left.

export const ENCOUNTER_CORRIDOR_ASSAULT: LineEncounterDef = {
  id: "corridor_assault",
  name: "Corridor Assault",
  desc: "A necromancer commands the dead from the depths. Pierce the skeleton wall.",
  lineLength: 9,
  playerStartSlot: 6,
  terrain: {},
  enemies: [
    ["necromancer", 1],
    ["skeleton", 3],
    ["skeleton", 4],
  ],
  goal: { type: "kill_all" },
  reinforcements: [{ onTurn: 3, side: "left", enemyIds: ["zombie"] }],
  isTutorial: false,
};

// ─── Encounter B: Surrounded ───
// Ghost on the left (slot 1), Zombie on the right (slot 7). Player flanked from turn 1.
// Goal: survive 5 turns OR kill both enemies.
// Ghost phase-shifts; Zombie grabs. Player must choose which threat to address.

export const ENCOUNTER_SURROUNDED: LineEncounterDef = {
  id: "surrounded",
  name: "Surrounded",
  desc: "Enemies close from both sides. Which do you face first?",
  lineLength: 7,
  playerStartSlot: 3,
  terrain: {},
  enemies: [
    ["ghost", 1],
    ["zombie", 5],
  ],
  goal: { type: "kill_all" },
  reinforcements: [],
  isTutorial: false,
};

// ─── Encounter C: The Necromancer's Chamber ───
// Necromancer at slot 1, guarded by two skeletons at slots 2-3.
// Goal: kill the necromancer. Skeletons will be continuously raised.
// Player must push through or use pierce abilities to reach the necromancer.

export const ENCOUNTER_NECROMANCERS_CHAMBER: LineEncounterDef = {
  id: "necromancers_chamber",
  name: "Necromancer's Chamber",
  desc: "The necromancer hides behind a wall of bones. Kill it before it raises the dead again.",
  lineLength: 7,
  playerStartSlot: 5,
  terrain: {},
  enemies: [
    ["necromancer", 1],
    ["skeleton", 2],
    ["skeleton", 3],
  ],
  goal: { type: "kill_all" },
  reinforcements: [],
  isTutorial: false,
};

// ─── Encounter D: Salt Revenant's Vault ───
// Salt Revenant at slot 3, Grave Robber at slot 5 (fleeing away from player at slot 6).
// Halllowed ground at slots 1-2 damages undead.
// Kill both before the robber steals all your salt.

export const ENCOUNTER_SALT_VAULT: LineEncounterDef = {
  id: "salt_vault",
  name: "Salt Revenant's Vault",
  desc: "The Salt Revenant guards its hoard while a robber picks your pockets.",
  lineLength: 9,
  playerStartSlot: 6,
  terrain: {
    1: { type: "hallowed_ground", turnsRemaining: 99 },
    2: { type: "hallowed_ground", turnsRemaining: 99 },
  },
  enemies: [
    ["salt_revenant", 3],
    ["grave_robber", 5],
  ],
  goal: { type: "kill_all" },
  reinforcements: [],
  isTutorial: false,
};

// ─── Encounter E: The Sacrarium Spreads ───
// False Sacrarium at slot 1, growing rot terrain toward player at slot 7.
// Gutborn Larva at slot 4 — will metamorphose into Ghoul if not killed in 2 turns.
// Kill both before the line fills with rot.

export const ENCOUNTER_SACRARIUM: LineEncounterDef = {
  id: "sacrarium_spreads",
  name: "The Sacrarium Spreads",
  desc: "A flesh-cathedral spawns larvae and spreads corruption. Act fast.",
  lineLength: 9,
  playerStartSlot: 7,
  terrain: {},
  enemies: [
    ["false_sacrarium", 1],
    ["gutborn_larva", 4],
  ],
  goal: { type: "kill_all" },
  reinforcements: [],
  isTutorial: false,
};

// ─── BOSS: Skeleton Lord ───

export const ENCOUNTER_BOSS_SKELETON_LORD: LineEncounterDef = {
  id: "boss_skeleton_lord",
  name: "The Skeleton Lord",
  desc: "The lord of bones commands an undying army. Crush his bones before he rebuilds.",
  lineLength: 9,
  playerStartSlot: 6,
  terrain: {},
  enemies: [
    ["boss_skeleton_lord", 1],
    ["skeleton", 2],
    ["skeleton", 3],
    ["skeleton", 7],
  ],
  goal: { type: "kill_target", targetUid: "", targetName: "Skeleton Lord" }, // uid filled at runtime
  reinforcements: [],
  isTutorial: false,
};

// ─── BOSS: Vampire Lord ───

export const ENCOUNTER_BOSS_VAMPIRE_LORD: LineEncounterDef = {
  id: "boss_vampire_lord",
  name: "The Vampire Lord",
  desc: "Darkness is his armor. Holy weapons are your salvation.",
  lineLength: 9,
  playerStartSlot: 7,
  terrain: {
    0: { type: "dark_zone", turnsRemaining: 99 },
    1: { type: "dark_zone", turnsRemaining: 99 },
    2: { type: "dark_zone", turnsRemaining: 99 },
  },
  enemies: [["boss_vampire_lord", 1]],
  goal: { type: "kill_all" },
  reinforcements: [],
  isTutorial: false,
};

// ─── BOSS: The Lich King ───

export const ENCOUNTER_BOSS_LICH: LineEncounterDef = {
  id: "boss_lich",
  name: "The Lich King",
  desc: "The Lich rules from beyond death. Destroy its phylactery before it raises the entire crypt.",
  lineLength: 9,
  playerStartSlot: 7,
  terrain: {},
  enemies: [
    ["boss_lich", 0],
    ["skeleton", 2],
    ["skeleton", 3],
    ["skeleton", 4],
  ],
  goal: { type: "kill_all" },
  reinforcements: [],
  isTutorial: false,
};

// ─── Dynamic encounter builder ───

/**
 * Build a LineEncounterDef from a list of enemy IDs (e.g. from a room's spawn list).
 * Enemies are placed on the line based on their tactical role:
 *   - Backline (snipers/casters):     positioned furthest from player
 *   - Frontline (pressers/anchors):   positioned closer to player as blockers
 *   - Flankers/skirmishers:           may spawn on the far side (right of player)
 */

const BACKLINE_ROLES: ReadonlySet<string> = new Set([
  "necromancer",
  "banshee",
  "false_sacrarium",
  "boss_lich",
  "boss_skeleton_lord",
  "boss_vampire_lord",
]);

const FLANKER_ROLES: ReadonlySet<string> = new Set(["ghost", "shadow", "grave_robber", "rat"]);

const FALLBACK_ENEMY = "skeleton"; // unknown ids become skeletons

import { LINE_ENEMY_DEFS } from "./enemy-defs";
import type { LinePos, LineTerrain } from "./types";

export function buildEncounterFromEnemies(
  enemyIds: readonly string[],
  roomLabel: string,
): LineEncounterDef {
  const lineLength = 9 as const;
  const playerStartSlot: LinePos = 6;

  // Map unknown enemy ids to a fallback so we never get a "?" placeholder
  const known = enemyIds.map((id) => (LINE_ENEMY_DEFS[id] ? id : FALLBACK_ENEMY));

  const backline = known.filter((id) => BACKLINE_ROLES.has(id));
  const flankers = known.filter((id) => FLANKER_ROLES.has(id));
  const frontline = known.filter((id) => !BACKLINE_ROLES.has(id) && !FLANKER_ROLES.has(id));

  // Slot layout (player at 6):
  //   0    1    2    3    4    5    6     7    8
  // [BACK BACK FRONT FRONT FRONT _   PLAYER FLANK FLANK]
  const placements: [string, LinePos][] = [];
  const usedSlots = new Set<LinePos>([playerStartSlot]);

  // Place backline at slots 0, 1
  const backlineSlots: LinePos[] = [1, 0, 2];
  for (let i = 0; i < backline.length && i < backlineSlots.length; i++) {
    placements.push([backline[i], backlineSlots[i]]);
    usedSlots.add(backlineSlots[i]);
  }

  // Place frontline at slots 3, 4, 2 (in that priority — closest first)
  const frontlineSlots: LinePos[] = [3, 4, 2, 5];
  for (let i = 0, slotIdx = 0; i < frontline.length && slotIdx < frontlineSlots.length; slotIdx++) {
    if (usedSlots.has(frontlineSlots[slotIdx])) continue;
    placements.push([frontline[i], frontlineSlots[slotIdx]]);
    usedSlots.add(frontlineSlots[slotIdx]);
    i++;
  }

  // Place flankers at slot 8, 7, 5 (right side of player to create flanking pressure)
  const flankerSlots: LinePos[] = [8, 7, 5];
  for (let i = 0, slotIdx = 0; i < flankers.length && slotIdx < flankerSlots.length; slotIdx++) {
    if (usedSlots.has(flankerSlots[slotIdx])) continue;
    placements.push([flankers[i], flankerSlots[slotIdx]]);
    usedSlots.add(flankerSlots[slotIdx]);
    i++;
  }

  // Anything that didn't fit (overflow): drop into nearest empty slot
  const overflow = [...backline, ...frontline, ...flankers].slice(placements.length);
  for (const id of overflow) {
    let slot: LinePos = 0;
    for (let s = 0; s < lineLength; s++) {
      if (!usedSlots.has(s as LinePos)) {
        slot = s as LinePos;
        break;
      }
    }
    placements.push([id, slot]);
    usedSlots.add(slot);
  }

  return {
    id: `dynamic_${roomLabel.toLowerCase().replace(/\s+/g, "_")}`,
    name: roomLabel || "Combat",
    desc: `Encounter in ${roomLabel}`,
    lineLength,
    playerStartSlot,
    terrain: {} as Partial<Record<LinePos, LineTerrain>>,
    enemies: placements,
    goal: { type: "kill_all" },
    reinforcements: [],
    isTutorial: false,
  };
}

// ─── Registry ───

export const ALL_LINE_ENCOUNTERS: LineEncounterDef[] = [
  ENCOUNTER_TUTORIAL,
  ENCOUNTER_CORRIDOR_ASSAULT,
  ENCOUNTER_SURROUNDED,
  ENCOUNTER_NECROMANCERS_CHAMBER,
  ENCOUNTER_SALT_VAULT,
  ENCOUNTER_SACRARIUM,
  ENCOUNTER_BOSS_SKELETON_LORD,
  ENCOUNTER_BOSS_VAMPIRE_LORD,
  ENCOUNTER_BOSS_LICH,
];

export function getEncounterById(id: string): LineEncounterDef | undefined {
  return ALL_LINE_ENCOUNTERS.find((e) => e.id === id);
}
