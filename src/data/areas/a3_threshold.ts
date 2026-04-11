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
    label: "Crypt Mouth",
    hint: "a carved arch; letters you were taught to respect now read as license.",
    enemies: ["skeleton", "skeleton"],
    isStart: true,
    notes:
      "R75. Era 2+3. COLDFIRE fading to dark — strips thin quickly; darkness follows in a few rooms. " +
      "First room past Lower Gate East (Area 2 R73); reliable light soft gate at that gate. " +
      "Skeletons ×2 on patrol — already the lich's shift, not the order's rest. " +
      "Teaching: true flame vs coldfire; shuttered lantern rhythm for Area 3 gauntlet.",
    props: [
      {
        id: "threshold_arch_inscription",
        label: "Carved Arch",
        icon: "\u{1F3DB}\uFE0F",
        desc: 'Salt-block arch deep enough to swallow torchlight at the edges. The order\'s motto is cut clean: "From service in life to service in death." Below it, in shallower letters, some long-dead mason scratched a diagram — hands together, head bowed — the bow this place expects before it lets you pass.',
        gridPosition: { row: 6, col: 6 },
        onExamine: [
          { type: "set_flag", flag: "read_threshold_arch_motto_r75" },
          { type: "set_flag", flag: "knows_interment_passage_gesture" },
          {
            type: "log",
            message:
              "Duty cut deep; the small mercy is a picture you trace in the air until your hands remember.",
          },
        ],
      },
    ],
  },
  3: {
    label: "Ritual Arch",
    hint: "the floor sigil holds a patient glow; the air waits for a gesture.",
    enemies: [],
    notes:
      "R76. Era 2. DARK. Ceremonial arch; intact floor ward, faint glow. " +
      "Crossing without the interment gesture: defensive pulse 5 damage + loud alarm alerting R77–R79. " +
      "Knowledge gate; optional clean entry vs damage + alert.",
    props: [
      {
        id: "ritual_arch_floor_ward",
        label: "Floor Ward",
        icon: "\u{2728}",
        desc: "A ceremonial arch frames a sigil set flush into the stone. The lines hold a patient, offended glow — not coldfire, not quite hearth either. The air waits, as if counting your steps.",
        gridPosition: { row: 6, col: 10 },
        actions: [
          {
            id: "cross_with_gesture",
            label: "Cross with the interment sign",
            desc: "Hands together, head bowed — the way the arch showed, or the way Voss breathed it when he was still trying to warn you.",
            requires: { flags: ["knows_interment_passage_gesture"] },
            effects: [
              { type: "set_flag", flag: "r76_ward_crossed_safely" },
              {
                type: "log",
                message: "The sigil accepts you. No pulse. No shout into the rooms ahead.",
              },
            ],
          },
          {
            id: "cross_with_gesture_voss",
            label: "Cross using Voss's warning",
            desc: "You fold yourself the way he described in the cloister — small, obedient, not worth a shout.",
            requires: { flags: ["voss_met_r34"] },
            effects: [
              { type: "set_flag", flag: "r76_ward_crossed_safely" },
              {
                type: "log",
                message:
                  "You move as he described. The ward's attention slides off you like rain on oiled cloth.",
              },
            ],
          },
          {
            id: "cross_reckless",
            label: "Walk through without the gesture",
            desc: "Pride or haste — the lines on the floor do not care which.",
            effects: [
              { type: "damage_player", amount: 5 },
              { type: "set_flag", flag: "r76_ward_alarm_triggered" },
              {
                type: "log",
                message:
                  "Salt-light slams up through the stone — a blow of stored vigil-ward, loud as a bell. Somewhere ahead, something lifts its head.",
              },
            ],
          },
        ],
      },
    ],
  },
  4: {
    label: "Old Receiving Room",
    hint: "a stone slab, rusted tools. something still mimics preparation on nothing.",
    enemies: ["zombie"],
    notes:
      "R77. Era 2. DARK. Modest receiving room. " +
      "Zombie ×1 mimics preparation on nothing — instructions with no body; order care collapsed into habit. " +
      "Contrast: one corpse, one ritual; above, throughput in tons. " +
      "Connects to R76, R78 (guard post only — not R75), R79.",
    props: [
      {
        id: "receiving_stone_slab",
        label: "Stone Slab",
        icon: "\u{1F6CB}\uFE0F",
        desc: "A single slab, swept absurdly clean. No body rests here — only the ghost of procedure. Chalk arcs on the stone suggest where feet and shoulders were meant to lie.",
        gridPosition: { row: 6, col: 14 },
        onExamine: [
          { type: "set_flag", flag: "examined_r77_receiving_slab" },
          {
            type: "log",
            message:
              "One body, one cloth, one honest pause. Above your head, wheels and tallies treat the dead like freight.",
          },
        ],
      },
      {
        id: "rusted_ritual_tools_shelf",
        label: "Rusted Ritual Tools",
        icon: "\u{2692}\uFE0F",
        desc: "Hooks along the wall hold tongs, linen shears, and a salt-rimed brush — all rust-locked, all still aligned with monastic care. Whoever stocked this shelf believed someone would be received with dignity.",
        gridPosition: { row: 5, col: 15 },
        onExamine: [
          { type: "set_flag", flag: "examined_r77_ritual_tools" },
          {
            type: "log",
            message:
              "Tools for one honest burial. Below, nobody reaches for linen shears — only hooks and chalk.",
          },
        ],
      },
    ],
  },
  5: {
    label: "Descent Steps",
    hint: "stairs fall away; coldfire ends. bone scrapes stone somewhere below.",
    enemies: [],
    notes:
      "R79. Era 2+3. DARK — coldfire ends here; true darkness unless player lights. " +
      "Staircase deeper; air cooler, damper; walls shift from Era 2 salt-block to rougher work. " +
      "Distant bone-on-stone — the sorting line starting below. Connects to R77 and R80 (Sorting Halls).",
    props: [
      {
        id: "descent_steps_wall_shift",
        label: "Rougher Masonry",
        icon: "\u{1F9F1}",
        desc: "Coldfire gives up here; ordinary dark swallows the last green strip. Under your palm the wall changes — clean vigil salt-block yields to rougher cuts, as if the old workings pushed back through the veneer.",
        gridPosition: { row: 7, col: 18 },
        onExamine: [
          { type: "set_flag", flag: "examined_r79_descent_masonry" },
          {
            type: "log",
            message:
              "Somewhere below, bone scrapes stone — a rhythm like carts, like sorting, like something always one shift ahead of you.",
          },
        ],
      },
    ],
  },
  6: {
    label: "Guard Post",
    hint: "coldfire, a watchman's niche. someone reassigned here sounds smaller than their robe.",
    enemies: [],
    notes:
      "R78. Era 2+3. COLDFIRE. Cultist ×1 watches if not bypassed — enemy type cultist not in data; use stealth/disguise logic in script. " +
      "Cultist disguise: no hostile reaction; otherwise combat. " +
      "VOSS ENCOUNTER 2: if player returns after meeting Voss in Area 2, Voss is reassigned here — deeper, more frightened. " +
      "Cultists do not attack on sight for 3–4 dungeon turns after donning the robe (script timing). " +
      "World emptied by three eras of greed; the cult is what's left. Foreshadows Ending 3 (collapse/destroy — nowhere left) vs Ending 4 (release/walk away — fragile continuity). " +
      "Connects only to R77 (dead end branch).",
    props: [
      {
        id: "voss_guard_post_encounter",
        label: "Hunched Figure in Cult Robes",
        icon: "\u{1F9D5}",
        desc: 'Not the zeal you saw in the cloister — this posture is smaller, shoulders curled as if the stone itself disapproves. When the hood lifts, it is Voss. His eyes dart past you toward the dark stairs. "They moved me down," he breathes. "Closer to what Tomasz became. Take this. Don\'t say I gave it."',
        gridPosition: { row: 2, col: 15 },
        condition: { flags: ["voss_met_r34"] },
        actions: [
          {
            id: "take_cultist_disguise",
            label: "Take the folded cultist robe",
            desc: "His fingers shake as he presses the cloth into your hands — borrowed skin, borrowed safety.",
            effects: [
              { type: "set_flag", flag: "has_cultist_disguise_robe" },
              { type: "set_flag", flag: "voss_encounter_r78_complete" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Rough-spun cloth, salt-stiff. It smells like incense and fear. Voss melts back into the niche.",
              },
            ],
          },
        ],
        onExamine: [
          {
            type: "log",
            message:
              "\"End this. Or don't — just... don't destroy everything. Some of us don't have anywhere else.\"",
          },
        ],
      },
      {
        id: "guard_post_provisions",
        label: "Guard Shelf",
        icon: "\u{1F37C}",
        desc: "Coldfire picks out a niche of practical things: hard bread, a wax-sealed jar of salted meat, a tin of bitter herbs stamped with a vigil sigil.",
        gridPosition: { row: 3, col: 14 },
        actions: [
          {
            id: "use_provisions",
            label: "Eat a little from the vigil stores",
            desc: "Hard bread, bitter herbs — the small kindness of whoever stocked this niche.",
            effects: [
              { type: "heal_player", amount: 4 },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Dry bread, harsh herbs — small warmth in a room that trades on cold light.",
              },
            ],
          },
        ],
      },
    ],
  },
  9: {
    label: "Toward the Lower Gate",
    hint: "salt-block gives way; you smell oil and old steel from the armory passage you forced.",
    enemies: [],
    exit: { toAreaId: "a2_armory", toRoomGridId: 10 },
    notes:
      "Return to Area 2 armory route (R73 side). Arrival from that gate lands threshold grid 2 (R75).",
  },
  10: {
    label: "Stairs Into the Works",
    hint: "the dark below breathes machine-warm; somewhere, belts throb and bone chatters on stone.",
    enemies: [],
    exit: { toAreaId: "a3_sorting", toRoomGridId: 2 },
    notes:
      'Exit to R80 Sorting Gallery. Pair: sorting "To Funerary Threshold" returns threshold grid 5 (R79).',
  },
};

export const A3_THRESHOLD: AreaDef = {
  id: "a3_threshold",
  name: "Funerary Threshold",
  desc: "The old crypt mouth: vigil stone and mottoes, giving way to rougher cuts and the sound of something that never sleeps.",
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
