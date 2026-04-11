import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 3 — Ossuary — Bone Stacks (R93–R99). Grid: 2=R93, 3=R94, 4=R96, 5=R95, 6=R98, 7=R97,
 * 8=ward antechamber (a5 return lands here), 14=R99 ward door combat, 9=sorting, 10=deep crypt, 11=prison, 12=Area 5 exit.
 */

// prettier-ignore
export const A3_BONE_STACKS_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  4
  [ 1,  1,  1,  9,  9,  0,  2,  2,  2,  0,  3,  3,  0,  5,  5,  0,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  5
  [ 1,  1,  1,  9,  9,  1,  2,  2,  2,  1,  3,  3,  1,  5,  5,  1,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  1,  1,  1,  1,  2,  2,  2,  1,  3,  3,  1,  5,  5,  1,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  7
  [ 1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  0,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  8  R93↔R96 @ col6; R95↔R97; R97↔R98
  [ 1,  1,  1,  1,  1,  4,  4,  4,  1,  1,  1,  1,  1,  7,  7,  7,  0,  6,  6,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  9
  [ 1,  1,  1,  1,  1,  4,  4,  4,  1,  1,  1,  1,  1,  7,  7,  7,  0,  6,  6,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 10
  [ 1,  1,  1,  1,  1,  4,  4,  4,  0,  8,  8,  8,  0,  7,  7,  7,  0,  6,  6,  0,  1,  1,  1,  1,  1,  1,  1,  1], // 11  R98 shaft col19
  [ 1,  1,  1,  1,  1,  4,  4,  4,  1,  8,  8,  8,  1,  7,  7,  7,  0,  6,  6,  0,  1,  1,  1,  1,  1,  1,  1,  1], // 12
  [ 1,  1,  1,  1,  1,  0,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], // 13
  [ 1,  1,  1,  1,  1, 11, 11,  1,  1, 14, 14, 14,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], // 14
  [ 1,  1,  1,  1,  1, 11, 11,  1,  1, 14, 14, 14,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], // 15
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1, 14, 14, 14,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], // 16
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1, 14, 14, 14,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], // 17
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], // 18
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1, 12, 12,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], // 19
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1, 12, 12,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], // 20
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], // 21
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], // 22
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], // 23
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], // 24
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  6,  6,  0, 10, 10,  1,  1,  1,  1,  1,  1], // 25
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 26
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 27
];

export const A3_BONE_STACKS_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Stack Entrance",
    hint: "bone mountains and cart ruts; patrol routes echo in the aisles.",
    enemies: ["skeleton", "skeleton"],
    isStart: true,
    notes:
      "R93. Era 3. DARK. High ceiling; bone mountains; narrow cart aisles. Skeletons ×2 on patrol. " +
      "Connects to R83 conveyor, R94 femur corridor, R96 stack core. Environmental drift: patrol vectors toward R99 / lower bone mass; necromancers correct formations.",
  },
  3: {
    label: "Femur Corridor",
    hint: "tight columns of femurs; something uses them as cover.",
    enemies: ["ghoul"],
    notes:
      "R94. Era 3. DARK. Tight passage between femur towers. Ghoul ×1 hit-and-run using columns; claustrophobic fight. " +
      "Teaching: open lantern before entering — tight quarters favor Ghoul hiding. Connects R93 ↔ R95.",
  },
  5: {
    label: "Skull Gallery",
    hint: "shelves of skulls; the silence has weight.",
    enemies: [],
    notes:
      "R95. Era 3. DARK. Floor-to-ceiling skull shelves; numeric codes; profound silence. " +
      "Ancestors statistically present — tag in R81 names one of thousands. No loot — atmosphere only. Connects R94 ↔ R97.",
  },
  4: {
    label: "Stack Core",
    hint: "the largest reserve; inventory chalk marks read like a war plan.",
    enemies: ["skeleton", "skeleton", "skeleton", "necromancer"],
    notes:
      "R96. Era 3. DARK. Largest open storage; organized bone mountains; necromancer ×1; patrol skeletons ×3. " +
      "Lich's reserve — thousands more undead possible. Supervisor strain: pull toward deeper stacks / R99 approach. " +
      "Loot: 30 gold; bone reserve assessment (lore). Connects R93, R97, R98, ward approach (R8), R106 prison approach.",
  },
  7: {
    label: "Collapsed Stack",
    hint: "unstable heaps; combat might bring the ceiling down.",
    enemies: ["rat", "rat", "rat", "rat", "rat"],
    notes:
      "R97. Era 3. DARK. Collapsed pile; unstable. Rats ×5. Loud combat → falling debris 2–4 random damage/turn (environmental hazard). " +
      "Connects R95, R96, R98.",
  },
  6: {
    label: "Hidden Passage",
    hint: "older timber shoring; the mine remembers before the order.",
    enemies: [],
    notes:
      "R98. Era 1+2. DARK. Era 1 mine tunnel, Era 2 shortcut, exposed by collapse. No enemies. " +
      "Bypasses main stacks traffic to R100 Deep Crypt. Exit room pairs with deep crypt return to this grid id 6.",
  },
  8: {
    label: "Lich's Ward Antechamber",
    hint: "coldfire on bone columns before the curtain; the door is not the whole threshold.",
    enemies: [],
    notes:
      'Staging before R99 proper. COLDFIRE implied from ward nearby. No combat here — return from Area 5 Outer Ward lands grid 8 (pair: a5_outer_ward "To Lich\'s Ward"). ' +
      "Connects stack core to R99 Lich's Ward Door. Beyond R99 → Area 5 R146 uses separate exit room (grid 12).",
  },
  14: {
    label: "Lich's Ward Door",
    hint: "coldfire on a door too large for humility; two armored shapes wait.",
    enemies: ["boss_skeleton_lord", "boss_skeleton_lord"],
    isBoss: true,
    notes:
      "R99. Era 3. COLDFIRE. Massive warded door; dark energy curtain; bone column anchors. Elite Skeletons ×2 (boss_skeleton_lord). Beyond → Area 5 R146. " +
      "PROGRESSION GATE (Area 3 → 5): " +
      "(a) FORCE — kill elites; break ward by destroying column anchors (mining maul / fire): LOUD, pulls Bone Stacks aggro. " +
      "(b) KNOWLEDGE — deactivation phrase in lich correspondence (Area 2 Restricted Archive, if accessed). " +
      "(c) SALT-IRON — silent ward corrosion (e.g. material from Area 4 or R110 salt-iron dagger in Castellane's Gallery); nuanced stealth option vs force. " +
      "CONTENT ROOM — not the travel exit; use grid 12 to enter Area 5.",
  },
  9: {
    label: "To Conveyor Hall",
    hint: "industrial noise leaks back through the threshold.",
    enemies: [],
    exit: { toAreaId: "a3_sorting", toRoomGridId: 5 },
    notes: 'Return to R83. Pair: sorting "To Bone Stacks" lands grid 2 (R93).',
  },
  10: {
    label: "To Deep Crypt",
    hint: "older air; names carved with care instead of throughput.",
    enemies: [],
    exit: { toAreaId: "a3_deep_crypt", toRoomGridId: 2 },
    notes: "From R98. Pair: deep crypt exit returns bone stacks grid 6 (R98).",
  },
  11: {
    label: "To Vampire's Prison",
    hint: "downward damp; bindings hum even before you see the cell.",
    enemies: [],
    exit: { toAreaId: "a3_vampire_prison", toRoomGridId: 2 },
    notes: "From R96 toward R106. Pair: prison exit returns stack core grid 4 (R96).",
  },
  12: {
    label: "Beyond the Ward Curtain",
    hint: "the lich's house continues; you cross as trespasser or invited predator.",
    enemies: [],
    exit: { toAreaId: "a5_outer_ward", toRoomGridId: 2 },
    notes:
      "Travel-only exit to Area 5 R146 Arrival Chamber (outer ward grid 2). Pair: return from Area 5 uses bone stacks grid 8 (ward antechamber), not this room.",
  },
};

export const A3_BONE_STACKS: AreaDef = {
  id: "a3_bone_stacks",
  name: "Bone Stacks",
  desc: "Warehouse scale: the reserve that makes the factory believable.",
  difficulty: 4,
  generator: "authored",
  authored: {
    grid: A3_BONE_STACKS_GRID,
    rooms: A3_BONE_STACKS_ROOMS,
  },
  combatRooms: [],
  bossRoom: {
    label: "Lich's Ward Door",
    enemies: ["boss_skeleton_lord", "boss_skeleton_lord"],
    hint: "coldfire on a door too large for humility; two armored shapes wait.",
  },
  hiddenFromTown: true,
  notes:
    "Ossuary subarea 4: mass storage toward Area 5. Grid 8 = a5 return; grid 14 = R99 combat; grid 12 = exit to a5. " +
    "What Lies Below drift in stacks; patrols correct vectors toward R99.",
};
