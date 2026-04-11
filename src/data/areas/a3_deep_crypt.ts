import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 3 — Ossuary — Deep Crypt (R100–R105). Grid: 2=R100 … 7=R105, 8=exit→R98 (bone stacks grid 6).
 * R101 hub: each branch uses its own 0-run (no shared corridor component between spokes).
 */

// prettier-ignore
export const A3_DEEP_CRYPT_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  4,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3  R102
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  4,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  4
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  5  R102↔R101
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  8,  8,  0,  2,  2,  2,  0,  3,  3,  3,  3,  3,  0,  5,  5,  5,  1,  1,  1,  1,  1,  1], //  7  R100–R101–R103
  [ 1,  1,  8,  8,  1,  2,  2,  2,  1,  3,  3,  3,  3,  3,  1,  5,  5,  5,  1,  1,  1,  1,  1,  1], //  8
  [ 1,  1,  1,  1,  1,  2,  2,  2,  1,  3,  3,  3,  3,  3,  1,  5,  5,  5,  1,  1,  1,  1,  1,  1], //  9
  [ 1,  1,  1,  1,  1,  2,  2,  2,  1,  3,  3,  3,  3,  3,  1,  5,  5,  5,  0,  6,  6,  6,  1,  1], // 10  R103↔R104
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  3,  3,  1,  1,  1,  1,  1,  6,  6,  6,  1,  1], // 11
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 12  R101↔R105
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 13
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 14
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 15
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 16
];

export const A3_DEEP_CRYPT_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Crypt Entrance",
    hint: "clean salt-block and names carved with care; one old guard still walks his beat.",
    enemies: ["skeleton"],
    isStart: true,
    notes:
      "R100. Era 2. DARK. Transition from factory to crypt: clean salt-block, inscriptions, doorframes. " +
      "Skeleton ×1 in corroded order armor; slow patrol. Connects to R101 and exit to R98 Hidden Passage (bone stacks).",
  },
  3: {
    label: "Honor Guard Hall",
    hint: "knight-effigy lids; you feel watched before anything moves.",
    enemies: ["boss_skeleton_lord", "boss_skeleton_lord", "boss_skeleton_lord"],
    isBoss: true,
    notes:
      "R101. Era 2. DARK. Knight-effigy sarcophagi; three honor guards (Ancient Honor Guard: HP 20, ATK 8, slower — use boss_skeleton_lord ×3) dormant until entry or noise. " +
      "Era 2 dignity weaponized into Era 3 security. Connects to R100, R102 Founding Tomb, R103 Epitaph Gallery, R105 Consecration Circle.",
  },
  4: {
    label: "Founding Tomb",
    hint: "a single sarcophagus; the plaque asks more of you than gold does.",
    enemies: [],
    notes:
      "R102. Era 2. DARK. Single sarcophagus; founding symbol. Remains of first knight-commander; preservation cloth. " +
      "HOLY RELIC — blessed salt-crystal pendant (CONSECRATION physical part). Pair with Area 2 R53 ritual text; activate at R105. " +
      "Honor guard does not pursue into this room. Plaque: \"First to serve. Last to rest.\"",
  },
  5: {
    label: "Epitaph Gallery",
    hint: "centuries of carved names; the last line ends in empty space.",
    enemies: [],
    notes:
      "R103. Era 2. DARK. Carved epitaphs across centuries; late entries sparse — decline visible. Last entry: name, date, empty tribute. " +
      "Epitaph records cross-ref Area 2 R58 roster. Connects to R101 and R104 Reliquary Niche.",
  },
  6: {
    label: "Reliquary Niche",
    hint: "a locked alcove; the sigil is not the library's seal.",
    enemies: [],
    notes:
      "R104. Era 2. DARK. Locked alcove; deceased members' valuables. " +
      "CEREMONIAL KEY — Grandmaster sigil (not library seal) → physical lock on Order's Restricted Vault (Area 2, behind R52 Shadow Corridor). " +
      "Full vault route also needs Crystal Lantern + Shadow passage + CONSECRATION for sealed door (top optional path). R104 key to Restricted Archive / Area 2 restricted content.",
  },
  7: {
    label: "Consecration Circle",
    hint: "an intact order circle; it brightens when you carry something that remembers prayer.",
    enemies: [],
    notes:
      "R105. Era 2. DARK. Intact order consecration circle. With holy relic (R102) + ritual text (Area 2 R53), player performs first rite → CONSECRATION activates permanently. " +
      "Circle faint glows when player enters with relic. Theme — anti-greed: consecration inverts extraction; you give up a room's loot permanently to make ground unusable to the undead cycle — safety by refusing to take. " +
      "Effects (master spec): consecrate rooms / safe pockets, seal loot, deny undead resurrection in combat, open consecration caches dungeon-wide.",
  },
  8: {
    label: "To Hidden Passage",
    hint: "timber and old air; the stacks feel far behind.",
    enemies: [],
    exit: { toAreaId: "a3_bone_stacks", toRoomGridId: 6 },
    notes:
      "Return to R98 (bone stacks grid 6). Pair: bone stacks \"To Deep Crypt\" lands grid 2 (R100).",
  },
};

export const A3_DEEP_CRYPT: AreaDef = {
  id: "a3_deep_crypt",
  name: "Deep Crypt",
  desc: "Era 2 dignity: named dead, relics, and the rite that refuses extraction.",
  difficulty: 3,
  generator: "authored",
  authored: {
    grid: A3_DEEP_CRYPT_GRID,
    rooms: A3_DEEP_CRYPT_ROOMS,
  },
  combatRooms: [],
  bossRoom: {
    label: "Honor Guard Hall",
    enemies: ["boss_skeleton_lord", "boss_skeleton_lord", "boss_skeleton_lord"],
    hint: "knight-effigy lids; you feel watched before anything moves.",
  },
  hiddenFromTown: true,
  notes:
    "Ossuary subarea 5: CONSECRATION origin; contrast to Era 3 factory. R102 relic + Area 2 R53 text → R105 activation.",
};
