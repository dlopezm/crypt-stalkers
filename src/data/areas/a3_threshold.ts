import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 3 — Ossuary — Funerary Threshold (R75–R79). Grid IDs: 2=R75 … 6=R78, 9=exit a2, 10=exit sorting.
 * R78 branch uses column 16 so its corridor cell does not stack-merge with the R75–R79 horizontal 0-row.
 */

// prettier-ignore
export const A3_THRESHOLD_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  6,  6,  6,  1,  1,  1,  1,  1,  1], //  1  R78
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  6,  6,  6,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  6,  6,  6,  1,  1,  1,  1,  1,  1], //  3
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], //  4  R77↔R78 only
  [ 1,  1,  9,  9,  0,  2,  2,  2,  0,  3,  3,  3,  0,  4,  4,  4,  0,  5,  5,  5,  1,  1,  1], //  5  main chain (one row of 0s)
  [ 1,  1,  9,  9,  1,  2,  2,  2,  1,  3,  3,  3,  1,  4,  4,  4,  1,  5,  5,  5,  1,  1,  1], //  6
  [ 1,  1,  9,  9,  1,  2,  2,  2,  1,  3,  3,  3,  1,  4,  4,  4,  1,  5,  5,  5,  1,  1,  1], //  7
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  5,  5,  5,  1,  1,  1], //  8
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  5,  5,  5,  1,  1,  1], //  9
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1], // 10  R79→sorting
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 10, 10,  1,  1,  1,  1], // 11
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 10, 10,  1,  1,  1,  1], // 12
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 13
];

export const A3_THRESHOLD_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Threshold Entrance",
    hint: "a carved arch; letters you were taught to respect now read as license.",
    enemies: ["skeleton", "skeleton"],
    isStart: true,
    notes:
      "R75. Era 2+3. COLDFIRE fading to dark — strips thin quickly; darkness follows in a few rooms. " +
      "First room past Lower Gate East (Area 2 R73); reliable light soft gate at that gate. " +
      'Order inscription on arch: "From service in life to service in death." Below, it reads as license to claim. ' +
      "Skeletons ×2 on patrol — already the lich's shift, not the order's rest. " +
      "Teaching: true flame vs coldfire; shuttered lantern rhythm for Area 3 gauntlet.",
  },
  3: {
    label: "Ritual Arch",
    hint: "the floor sigil holds a patient glow. the air waits for a gesture.",
    enemies: [],
    notes:
      "R76. Era 2. DARK. Ceremonial arch; intact floor ward, faint glow. " +
      "Crossing without the interment gesture (hands together, head bowed — from Area 2 funerary texts or Voss): defensive pulse 5 damage + loud alarm alerting R77–R79. " +
      "With gesture: safe. Knowledge gate; optional clean entry vs damage + alert.",
  },
  4: {
    label: "Old Receiving Room",
    hint: "a stone slab, rusted tools. something still mimics preparation on nothing.",
    enemies: ["zombie"],
    notes:
      "R77. Era 2. DARK. Modest receiving room; single stone slab; rusted ritual tools on shelf. " +
      "Zombie ×1 mimics preparation on nothing — instructions with no body; order care collapsed into habit. " +
      "Contrast: one corpse, one ritual; above, throughput in tons. " +
      "Connects to R76, R78 (guard post only — not R75), R79.",
  },
  5: {
    label: "Descent Steps",
    hint: "stairs fall away; coldfire ends. bone scrapes stone somewhere below.",
    enemies: [],
    notes:
      "R79. Era 2+3. DARK — coldfire ends here; true darkness unless player lights. " +
      "Staircase deeper; air cooler, damper; walls shift from Era 2 salt-block to rougher work. " +
      "Distant bone-on-stone — the sorting line starting below. Connects to R77 and R80 (Sorting Halls).",
  },
  6: {
    label: "Guard Post",
    hint: "coldfire, a watchman's niche. someone reassigned here sounds smaller than their robe.",
    enemies: [],
    notes:
      "R78. Era 2+3. COLDFIRE. Cultist ×1 watches if not bypassed — enemy type cultist not in data; use stealth/disguise logic in script. " +
      "Cultist disguise (from Voss): no hostile reaction; otherwise combat. Guard provisions (minor healing). " +
      "VOSS ENCOUNTER 2: if player returns after meeting Voss in Area 2, Voss is reassigned here — deeper, more frightened. " +
      "Grants cultist disguise (robe): cultists do not attack on sight for 3–4 dungeon turns after donning. " +
      "Voss dialogue: \"End this. Or don't — just... don't destroy everything. Some of us don't have anywhere else.\" " +
      "World emptied by three eras of greed; the cult is what's left. Foreshadows Ending 3 (collapse/destroy — nowhere left) vs Ending 4 (release/walk away — fragile continuity). " +
      "Connects only to R77 (dead end branch).",
  },
  9: {
    label: "To Lower Gate East",
    hint: "salt-block gives way to the armory route you opened.",
    enemies: [],
    exit: { toAreaId: "a2_armory", toRoomGridId: 10 },
    notes:
      "Return to Area 2 armory route (R73 side). Arrival from that gate lands threshold grid 2 (R75).",
  },
  10: {
    label: "To Sorting Halls",
    hint: "the industrial dark breathes; conveyors hum in the distance.",
    enemies: [],
    exit: { toAreaId: "a3_sorting", toRoomGridId: 2 },
    notes:
      'Exit to R80 Sorting Gallery. Pair: sorting "To Funerary Threshold" returns threshold grid 5 (R79).',
  },
};

export const A3_THRESHOLD: AreaDef = {
  id: "a3_threshold",
  name: "Funerary Threshold",
  desc: "From order rest to lich shift: the old crypt mouth, still quoting duty.",
  difficulty: 3,
  generator: "authored",
  authored: {
    grid: A3_THRESHOLD_GRID,
    rooms: A3_THRESHOLD_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
  notes:
    "Ossuary subarea 1: transition from living quarters to the dead. Entry from Area 2 R73. " +
    "Lantern-shutter rhythm and reliable light matter. R78 is R77-only side branch (not R75).",
};
