import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 1 — Upper Galleries (R12–R18)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * Connectivity (per design doc):
 *   exit9(mine mouth) ↔ R12(main) ↔ R13(east, dead end)
 *                                  ↔ R14(west) ↔ exit10(warrens)
 *                                  ↔ R15(junction) ↔ R16(patrol, dead end)
 *                                                   ↔ R17(gate) ↔ R18(alcove, dead end)
 *                                                                ↔ exit12(Area 2)
 *                                                   ↔ exit11(baron's wing)
 *
 * KEY TOPOLOGY FIX: R12 must NOT connect directly to R14 or warrens exit.
 * Player must pass through R15 (Junction Hall) to reach the western branches.
 * R15 is the chokepoint/decision hub.
 */

// prettier-ignore
export const A1_UPPER_GALLERIES_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  9,  9,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1  exit9 (mine mouth)
  [ 1,  9,  9,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3  exit9→R12
  [ 1,  2,  2,  2,  2,  2,  2,  0,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1,  1,  1], //  4  R12→R13
  [ 1,  2,  2,  2,  2,  2,  2,  1,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1,  1,  1], //  5
  [ 1,  2,  2,  2,  2,  2,  2,  1,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  7  R12→R15 corridor
  [ 1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  8
  [ 1, 10, 10,  0,  5,  5,  5,  5,  5,  0,  6,  6,  1,  1,  1,  1,  1,  1,  1,  1], //  9  exit10(warrens)←R15→R16
  [ 1, 10, 10,  1,  5,  5,  5,  5,  5,  1,  6,  6,  1,  1,  1,  1,  1,  1,  1,  1], // 10
  [ 1,  1,  1,  1,  5,  5,  5,  5,  5,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 11
  [ 1,  4,  4,  0,  5,  5,  5,  5,  5,  0,  7,  7,  7,  0,  8,  8,  1,  1,  1,  1], // 12  R14←R15→R17→R18
  [ 1,  4,  4,  1,  1,  1,  0,  1,  1,  1,  7,  7,  7,  1,  8,  8,  1,  1,  1,  1], // 13
  [ 1,  4,  4,  1,  1, 11, 11,  1,  1,  1,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1], // 14  exit11(baron's wing)
  [ 1,  1,  1,  1,  1, 11, 11,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], // 15  R17→exit12
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 12, 12,  1,  1,  1,  1,  1,  1,  1,  1], // 16  exit12 (Area 2)
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 12, 12,  1,  1,  1,  1,  1,  1,  1,  1], // 17
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 18
];

export const A1_UPPER_GALLERIES_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Main Gallery",
    hint: "coldfire runs the ceiling. iron tracks shine wrong in the green glow.",
    enemies: ["skeleton", "skeleton"],
    isStart: true,
    notes:
      "R12. Era 1 + Era 2 plaster + Era 3 coldfire. COLDFIRE lit. " +
      "Wide corridor; iron tracks; plaster flakes to raw stone. " +
      "COLDFIRE runs ceiling — bright, wrong, NO PROTECTION vs true-light-sensitive threats (teaches rule for later). " +
      "Patrol route: R12→R15→R17→R15→R12 (skeletons on perpetual loop). " +
      "Core traffic; noise/light here pulls investigating skeletons from adjacent rooms. " +
      "Deeper-facing walls carry that same wrong warmth and almost-tone in the salt when mine is quiet.",
  },
  3: {
    label: "Side Gallery East",
    hint: "narrow; rubble, tallies scratched in stone. a headless salt saint watches.",
    enemies: ["rat", "rat", "rat", "rat"],
    notes:
      "R13. Era 1. DARK. Dead end off R12. " +
      "Narrow east branch; rat nests in rubble. " +
      "MINER GRAFFITI: tallies, names, rat sketch with X. " +
      "Folk SALT SAINT shrine — carved figure, headless. " +
      "10 gold in miner's tin behind shrine. Salt figure (flavor item). " +
      "Dark reward lane; clearing nests ties to rat breeding rules.",
  },
  4: {
    label: "Side Gallery West",
    hint: "fresh pick marks. a plaque reads SEALED BY DECREE — ignored.",
    enemies: ["rat", "rat"],
    notes:
      "R14. Era 1 + recent breach. DARK. " +
      "Narrows toward Excursion Warrens. Fresh dirt, pick marks — Era 3 forced entry. " +
      "Order plaque: 'SEALED BY DECREE' — ignored. " +
      "MIRA ESCAPE VECTOR; risky exploration without flame. " +
      "Links to surface supply story (warrens). Exit to warrens nearby.",
  },
  5: {
    label: "Junction Hall",
    hint: "a high crossroads. a broken sign points deeper: Chapel, Library, Quarters.",
    enemies: ["skeleton", "grave_robber"],
    notes:
      "R15. Era 2 signage + defacement. COLDFIRE. Central chokepoint/decision hub. " +
      "High-ceiling crossroads; broken directional sign: 'Chapel / Library / Quarters' — all deeper. " +
      "MIRA ENCOUNTER 1: crosses with sack; freezes on seeing player, sprints for R14. " +
      "Drops HEALING POTION. Shouts: 'The green light doesn't keep them away!' Gone before dialogue. " +
      "If R14 already clear, pursuit possible in fiction — she's faster, vanishes into warrens. " +
      "Coldfire irony: her warning about green light while standing in coldfire. " +
      "Connects to: R12(main), R14(west), R16(patrol), R17(gate), exit to Baron's Wing(R24).",
  },
  6: {
    label: "Patrol Station",
    hint: "skeletons rest between circuits that never end. a mace on the rack still has heft.",
    enemies: ["skeleton", "skeleton"],
    notes:
      "R16. Era 3 + mine shell. COLDFIRE. Dead end off R15. " +
      "Side chamber where patrol skeletons bunch between circuits — 'between shifts that never end.' " +
      "RUSTY MACE — usable BLUNT (alternate if Baron's Wing skipped). " +
      "Wall carving: PATROL SCHEDULE (explicit timing for R12–R15–R17 loop). " +
      "Stealth entry vs two idle skeletons is viable.",
  },
  7: {
    label: "The Inner Gate",
    hint: "salt-block mass, lever, handplate — and scratches that look almost like music.",
    enemies: ["skeleton", "skeleton"],
    notes:
      "R17. Era 2 salt-block door + Era 3 occupation. COLDFIRE. " +
      "Massive door: flame carvings, salt blocks, working mechanism. " +
      "THREE PARTS: obvious LEVER, carved HANDPLATE, RESONANCE LOCK (pitch/fork/voice). " +
      "Guards do NOT operate the gate — they only kill intruders. " +
      "NOTATION SCRATCH near lock — links to R9 frescoes (singing motif). " +
      "PROGRESSION GATE (soft) to Area 2 R30. Three solutions: " +
      "(a) TUNING FORK from R27 — quiet, clean; " +
      "(b) correct HUM from frescoes + scratches — skilled observation; " +
      "(c) BASH — loud, damages lock, ALERTS Upper Gallery skeletons (costly pass). " +
      "Skilled observation = quiet pass; brute force = costly pass.",
  },
  8: {
    label: "Brazier Alcove",
    hint: "a niche brazier, ornate, cold. salt crystals catch any light you carry.",
    enemies: [],
    notes:
      "R18. Era 2. DARK. Dead end off R17. " +
      "Small recess. ORNATE SACRED BRAZIER, out; salt-crystal inlays catch any light the player carries. " +
      "Last true flame before the order's deep domain. " +
      "Relightable after Area 2 ritual. " +
      "When LIT: creates TRUE-LIGHT SAFE ZONE spanning R17–R18; " +
      "skeleton patrols REDIRECT to investigate — changes gallery traffic. Tactical map shift.",
  },
  9: {
    label: "To Mine Mouth",
    hint: "the threshold warms faintly toward the sunlit mouth.",
    enemies: [],
    exit: { toAreaId: "a1_mine_mouth", toRoomGridId: 7 },
  },
  10: {
    label: "To Excursion Warrens",
    hint: "timber props and raw earth — an unauthorized cut.",
    enemies: [],
    exit: { toAreaId: "a1_excursion_warrens", toRoomGridId: 2 },
  },
  11: {
    label: "To Baron's Wing",
    hint: "family iron and a motto you already know from the arch.",
    enemies: [],
    exit: { toAreaId: "a1_barons_wing", toRoomGridId: 2 },
  },
  12: {
    label: "To Sanctified Cloister",
    hint: "beyond the gate, the order's deep domain waits.",
    enemies: [],
    exit: { toAreaId: "a2_cloister", toRoomGridId: 2 },
  },
};

export const A1_UPPER_GALLERIES: AreaDef = {
  id: "a1_upper_galleries",
  name: "Upper Galleries",
  desc: "Shallow mines where coldfire replaced torchlight and the patrol never clocks out.",
  difficulty: 1,
  generator: "authored",
  authored: {
    grid: A1_UPPER_GALLERIES_GRID,
    rooms: A1_UPPER_GALLERIES_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
  notes:
    "Main mine corridors; skeleton patrols; Era 1 tunnels under cracking Era 2 plaster; Era 3 coldfire overhead. " +
    "R15 Junction Hall is the central chokepoint — all western branches (warrens, baron's wing) and deeper access (gate, patrol) route through it. " +
    "Deeper-facing walls occasionally carry wrong warmth and almost-tone in salt when mine is quiet. " +
    "Patrol schedule readable from R16; timing matters for stealth approaches.",
};
