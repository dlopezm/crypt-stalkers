import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 3 — Ossuary — Vampire's Prison (R106–R110). Grid: 2=R106 … 6=R110 gallery, 7=exit→R96 (bone stacks grid 4).
 * Binding↔cell and binding↔gallery use separate 0-cells on different rows (no merged 4–5–6 clique).
 */

// prettier-ignore
export const A3_VAMPIRE_PRISON_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  1,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2  exit
  [ 1,  1,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3
  [ 1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  4  exit↔approach
  [ 1,  1,  2,  2,  2,  0,  3,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  5
  [ 1,  1,  2,  2,  2,  1,  3,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  2,  2,  2,  1,  3,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  7
  [ 1,  1,  2,  2,  2,  0,  4,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  8  warden↔binding
  [ 1,  1,  1,  1,  1,  1,  4,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  9
  [ 1,  1,  1,  1,  1,  1,  4,  4,  4,  0,  5,  5,  5,  5,  1,  1,  1,  1,  1], // 10  binding↔cell (one 0)
  [ 1,  1,  1,  1,  1,  1,  4,  4,  4,  1,  5,  5,  5,  5,  1,  1,  1,  1,  1], // 11
  [ 1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  5,  5,  5,  5,  1,  1,  1,  1,  1], // 12  binding↔gallery (col6, not col9)
  [ 1,  1,  1,  1,  1,  1,  6,  6,  6,  1,  5,  5,  5,  5,  1,  1,  1,  1,  1], // 13
  [ 1,  1,  1,  1,  1,  1,  6,  6,  6,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 14
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 15
];

export const A3_VAMPIRE_PRISON_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Prison Approach",
    hint: "total dark; expert ghouls measure your shutter against their patience.",
    enemies: ["ghoul", "ghoul"],
    isStart: true,
    notes:
      "R106. Era 2+3. DARK. Descending corridor; total dark. Ghouls ×2 expert ambushers. " +
      "Lantern closed → ambush; open → Ghouls revealed, flee deeper (R107 cat-and-mouse). Connects R96 stack core and R107.",
  },
  3: {
    label: "Warden's Post",
    hint: "abandoned gear and a log that warns you not to bargain.",
    enemies: ["ghoul"],
    notes:
      "R107. Era 2+3. DARK. Abandoned post; Ghoul ×1 (may have fled from R106). " +
      'Loot: HOLY WATER VIAL (vs undead / optional vs Castellane if destroying); warden\'s log: "Subject continues to bargain. Do not engage." Warning: do not disturb binding.',
  },
  4: {
    label: "Binding Hall",
    hint: "layered order wards and lich work; the stone hums like a held breath.",
    enemies: [],
    notes:
      "R108. Era 2+3. DARK. Surrounds the cell. Layered bindings: order wards + lich necromancy. " +
      "Freeing Castellane requires Area 2 library context + these inscriptions + counter-ritual (e.g. R105 circle or holy relic). Room hums with contained power. Connects R107, R109 The Cell, R110 Castellane's Gallery.",
  },
  5: {
    label: "The Cell",
    hint: "salt-crystal bars; something ancient listens for your pulse.",
    enemies: ["boss_vampire_lord"],
    isBoss: true,
    notes:
      "R109. Era 2+3. DARK. Salt-crystal bars, iron, necromantic seals. Lord Castellane (Vampire) — NPC/boss_vampire_lord: ancient, gaunt, magnetic. " +
      'Opening line: "A living heart. I can hear it from here." Predation without ledger column for virtue. ' +
      'Key lines: "Your great-grandfather tried to deal with me. I said no. He died in the collapse. I wonder if you\'ll make better deals." / ' +
      '"This mine runs on greed. Always has. The salt\'s just the medium." / ' +
      '"Your baron mined salt until people died. Your order taxed farmers until they starved. Your lich raises the dead until they forget they were alive. I drain a body in under a minute. Tell me — which of us has the higher count?" ' +
      "TALK: each conversation costs 2 HP, +1 HP per subsequent visit; feeds by proximity; information true, self-serving (lich weaknesses, early order, pre-order mine, deep presence). " +
      'FREE: binding knowledge + counter-ritual → alliance vs lich; price after lich falls Castellane feeds on surface — "Not your town. Someone else\'s." Same pattern as the mine. ' +
      "BARGAIN: pay HP for targeted intel without freeing — no lich-alliance unlock; remains bound. " +
      "DESTROY: CONSECRATION + fire + holy water (R107) → Castellane's signet ring (strong accessory); no ally, no surface predator from this source. " +
      "IGNORE: never free, never destroy, minimal contact — no ally, no ring, remains bound. " +
      "Vampire's Bargain: powerful ally at someone else's expense — mirrors greed theme.",
  },
  6: {
    label: "Castellane's Gallery",
    hint: "old coins and a salt-iron blade within reach of the cell.",
    enemies: [],
    notes:
      "R110. Era 2. DARK. Adjacent chamber: trinkets — coins, favors. " +
      "SALT-IRON DAGGER — undead + demonic; usable on R99 ward per salt-iron gate rule (silent corrosion). ~40 gold in old coins. Dead end off binding hall.",
  },
  7: {
    label: "To Stack Core",
    hint: "back toward the bone mountains and the necromancer's inventory.",
    enemies: [],
    exit: { toAreaId: "a3_bone_stacks", toRoomGridId: 4 },
    notes:
      'Return to R96 Stack Core (bone stacks grid 4). Pair: bone stacks "To Vampire\'s Prison" lands grid 2 (R106).',
  },
};

export const A3_VAMPIRE_PRISON: AreaDef = {
  id: "a3_vampire_prison",
  name: "Vampire's Prison",
  desc: "What the lich walled away: hunger honest enough to name itself.",
  difficulty: 4,
  generator: "authored",
  authored: {
    grid: A3_VAMPIRE_PRISON_GRID,
    rooms: A3_VAMPIRE_PRISON_ROOMS,
  },
  combatRooms: [],
  bossRoom: {
    label: "The Cell",
    enemies: ["boss_vampire_lord"],
    hint: "salt-crystal bars; something ancient listens for your pulse.",
  },
  hiddenFromTown: true,
  notes:
    "Ossuary subarea 6: Castellane, salt-iron dagger for R99, Vampire's Bargain as greed-in-miniature.",
};
