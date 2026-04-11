import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 5 — Founder's Reliquary — Outer Ward (R146–R151)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * Each 2-room link uses a single isolated 0-cell (or non-adjoining stub); no corridor cliques.
 */

// prettier-ignore
export const A5_OUTER_WARD_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  4,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  4,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  4,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  4
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  5
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1, 10, 10,  1,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1, 10, 10,  1,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  7
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  1,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  8
  [ 1,  1,  1,  1,  1,  8,  8,  0,  2,  2,  2,  0,  3,  3,  3,  3,  0,  5,  5,  5,  5,  0,  6,  6,  6,  0,  7,  7,  7,  0, 11, 11,  1,  1,  1,  1], //  9
  [ 1,  1,  1,  1,  1,  8,  8,  1,  2,  2,  2,  1,  3,  3,  3,  3,  1,  5,  5,  5,  5,  1,  6,  6,  6,  1,  7,  7,  7,  1, 11, 11,  1,  1,  1,  1], // 10
  [ 1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  1,  3,  3,  3,  3,  1,  5,  5,  5,  5,  1,  6,  6,  6,  1,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1], // 11
  [ 1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  1,  3,  3,  3,  3,  1,  5,  5,  5,  5,  1,  6,  6,  6,  1,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1], // 12
  [ 1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 13
  [ 1,  1,  1,  1,  1,  1,  1,  1,  9,  9,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 14
  [ 1,  1,  1,  1,  1,  1,  1,  1,  9,  9,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 15
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 16
];

export const A5_OUTER_WARD_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Arrival Chamber",
    hint: "two paths meet; coldfire threads the salt. the air is wrong here — still, charged, heavy.",
    enemies: [],
    isStart: true,
    notes:
      "R146. Always. Dark (coldfire flickers). No enemies. Era 1 raw mine + Era 2 salt-block + Era 3 coldfire — all three in one glance. " +
      "Junction: Area 3 R99 (Lich's Ward) and Area 4 R144 (Miner's Shaft) land here (grid 2). " +
      "Crystal lantern: light refracts off salt in the walls (read as environmental affordance for hidden geometry). " +
      "If player refused Mira in Area 4 R127: her body slumped near the Area 3 entrance, torch burned out; elite patrol kill; map + loot on corpse — immediate emotional cost. " +
      "Hidden to Mortal Quarters (R162 / a5_mortal_quarters): loose salt-block panel behind wall; visible only with crystal lantern at full bright OR deliberate wall search; Mira's map (if she gave it in Area 4) marks this. " +
      "Cross-ref: R99, R144, R162, R127. Teaching: final hub = knowledge + light + hidden topology.",
  },
  3: {
    label: "Guard Hall",
    hint: "three armored shapes hold formation; order flame carved in the pillars, bindings laid over.",
    enemies: ["boss_skeleton_lord", "boss_skeleton_lord", "boss_skeleton_lord"],
    notes:
      "R147. Coldfire. Elite Skeleton ×3 — boss_skeleton_lord (ancient order plate; see in dark; reform without blunt). " +
      "Ceremonial hall as guard post; salt pillars: Era 2 flame motif + Era 3 binding sigils. " +
      "Loot: ancient order longsword, ceremonial shield (high-quality gear); 30 gold. " +
      "World-state: brutal choke — blunt essential; consecration after clear prevents reform; lure individuals with light/noise from adjacent rooms. " +
      "Cross-ref: R146, R148, R149.",
  },
  4: {
    label: "Armory of the Dead",
    hint: "racks of well-kept steel; one figure tends a blade that already cuts clean.",
    enemies: ["boss_skeleton_lord"],
    notes:
      "R148. Coldfire. Dead end off R147. Elite Skeleton ×1 (boss_skeleton_lord) sharpening needlessly. " +
      "Loot: order knight's blade (best slashing in dungeon), reinforced shield, heavy crossbow + 8 bolts (upgrade vs Area 2 crossbow); 20 gold. " +
      "Teaching: best conventional arms before throne; blunt still mandatory for reform.",
  },
  5: {
    label: "Patrol Corridor",
    hint: "a long run of crystal-inlaid wall; shimmer where coldfire catches salt.",
    enemies: ["boss_skeleton_lord", "boss_skeleton_lord"],
    notes:
      "R149. Coldfire. Elite Skeleton ×2 on patrol between R147 and R150; route is learnable — time movement or fight in narrow space (one-on-one bias). " +
      "Salt-crystal inlays catch coldfire; faint shimmer — Era 1 beauty under Era 3 occupation.",
  },
  6: {
    label: "Staging Ground",
    hint: "deployment maps on the walls; a bone resonator hums toward corridors you cannot see.",
    enemies: ["necromancer", "zombie", "zombie", "zombie", "zombie"],
    notes:
      "R150. Coldfire. Inner Circle Necromancer (type necromancer; note stronger stats: HP 12, ATK 8) in back row + Zombies ×4 in formation. " +
      "Loot: deployment maps (full five-area patrol overview); 15 gold. Bone resonator — destroy disrupts communication Areas 2–5 for several dungeon turns (no reinforcements from here). " +
      "Teaching: ranged priority on necromancer; killing coordinator weakens zombies. " +
      "MISSING enemy type: cultist (notes only).",
  },
  7: {
    label: "Inner Gate",
    hint: "salt-block gate stands open; an inscription ends on a line in a stranger hand.",
    enemies: [],
    notes:
      "R151. Coldfire. No enemies. Ceremonial boundary; R99 was the real lock. Finest Era 2 salt-work; architecture turns more ornate inward. " +
      'Gate text: "The Vigil endures. The Vigil provides. The Vigil consumes." — third line added later in different handwriting (lich\'s addendum to order motto). ' +
      "Exit forward: Prayer Colonnade R152 via grid link to a5_colonnade (room 11). " +
      "Cross-ref: R150, R152.",
  },
  8: {
    label: "To Lich's Ward",
    hint: "bone columns give way to the route you know from the deep ward.",
    enemies: [],
    exit: { toAreaId: "a3_bone_stacks", toRoomGridId: 8 },
    notes:
      "Exit. Return to Area 3 a3_bone_stacks grid 8 (R99 path). Pair: arrivals from R99 must land Outer Ward grid 2 (R146).",
  },
  9: {
    label: "To Miner's Shaft",
    hint: "rope marks and cold air — the climb back toward the sealed workings.",
    enemies: [],
    exit: { toAreaId: "a4_sealed_chamber", toRoomGridId: 5 },
    notes:
      "Exit. Return to Area 4 a4_sealed_chamber grid 5 (R144). Pair: arrivals from sealed chamber land Outer Ward grid 2 (R146).",
  },
  10: {
    label: "Hidden Panel",
    hint: "a salt-block seam that only true light or patient hands reveals.",
    enemies: [],
    exit: { toAreaId: "a5_mortal_quarters", toRoomGridId: 2 },
    notes:
      "Hidden. HIDDEN exit to Mortal Quarters R168 (a5_mortal_quarters grid 2). Crystal lantern full or deliberate search. " +
      "Pair: Mortal Quarters loose panel returns to this area grid 2 (R146). Cross-ref: R162, R169 journal beat.",
  },
  11: {
    label: "Into the Colonnade",
    hint: "salt-crystal columns wait beyond; prayers cut into every face.",
    enemies: [],
    exit: { toAreaId: "a5_colonnade", toRoomGridId: 2 },
    notes:
      "Exit to a5_colonnade R152 (grid 2). Pair: return from colonnade uses Outer Ward grid 7 (R151).",
  },
};

export const A5_OUTER_WARD: AreaDef = {
  id: "a5_outer_ward",
  name: "Outer Ward",
  desc: "The lich's last conventional line: elite dead, deployment maps, and a gate into prayer.",
  difficulty: 5,
  generator: "authored",
  authored: {
    grid: A5_OUTER_WARD_GRID,
    rooms: A5_OUTER_WARD_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
};
