import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 2 - Armory & Lower Gate (R69–R74)
 * R69↔R70↔R71; R69↔R72; R72↔R73; R72↔R74. R73 = combat only; grid10 = transit exit to a3_threshold.
 */

// prettier-ignore
export const A2_ARMORY_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
 [ 1, 1, 8, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 1
 [ 1, 1, 8, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 2
 [ 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 3
 [ 1, 1, 2, 2, 2, 0, 3, 3, 3, 0, 4, 4, 1, 1, 1, 1, 1, 1], // 4 R69|R70|R71
 [ 1, 1, 2, 2, 2, 1, 3, 3, 3, 1, 4, 4, 1, 1, 1, 1, 1, 1], // 5
 [ 1, 1, 2, 2, 2, 0, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 6 R69↔R72
 [ 1, 1, 1, 1, 1, 1, 6, 6, 6, 0, 5, 5, 1, 1, 1, 1, 1, 1], // 7 R72↔R73 only
 [ 1, 1, 1, 1, 1, 1, 6, 6, 6, 1, 5, 5, 1, 6, 0, 10, 10, 1], // 8 R72↔exit10 (no link 5↔10)
 [ 1, 1, 1, 1, 1, 0, 6, 6, 6, 6, 6, 6, 6, 1, 10, 10, 1], // 9 R72 bridge + R74 door
 [ 1, 1, 1, 1, 1, 0, 7, 7, 7, 1, 1, 1, 1, 1, 1, 10, 10, 1], // 10
 [ 1, 1, 1, 1, 1, 1, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 11
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 12
];

export const A2_ARMORY_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Armory Entrance",
    hint: "posted orders forbid unauthorized entry; the racks beyond smell of oil and old leather.",
    description:
      "Low ceiling. Notices nailed to salt-wood boards. Hard coldfire - glare on any metal you carry. " +
      "Smell of oil, leather, and iron filings. Colder than the chapter hall behind you.",
    enemies: ["zombie", "zombie"],
    isStart: true,
    notes:
      "R69. COLDFIRE. Era 2+3. Room design ref R69. Fight, disguise, or official seal (R59). Cultists ×2 not in enemy list. " +
      "Connects: R56 chapter hall (exit grid 8), R70 weapon racks, R72 training room.",
    props: [
      {
        id: "armory_posted_orders",
        label: "Posted Orders",
        icon: "\u{1F4DD}",
        desc: "Salt-board nailed crooked: NO UNAUTHORIZED ENTRY. Seals and signatures overlap like armor scales - each officer adding weight, none adding mercy.",
        gridPosition: { row: 5, col: 3 },
        onExamine: [
          { type: "set_flag", flag: "read_armory_posted_orders_r69" },
          {
            type: "log",
            message:
              "The spare grandmaster seal from the chapter house would satisfy a bored guard - if the dead cared about paperwork.",
          },
        ],
      },
    ],
  },
  3: {
    label: "Weapon Racks",
    hint: "most racks are bare; a high shelf still holds a crossbow and a bundle of quarrels.",
    description:
      "Weapon racks on both walls. Most pegs empty; scuffs where steel used to hang. " +
      "Coldfire through the uprights - bars of shadow on the floor. Drag marks and chips in the stone.",
    enemies: [],
    notes:
      "R70. COLDFIRE. Era 2. Room design ref R70. RANGED capability from crossbow pickup. " +
      "Connects: R69, R71 armor storage (dead end).",
    safeRoom: true,
    props: [
      {
        id: "overlooked_crossbow",
        label: "Crossbow and Quarrels",
        icon: "\u{1F3F9}",
        desc: "High rack, dust-thick: a crossbow strung with care and a bundle of twelve quarrels, overlooked when patrols stripped the lower shelves.",
        gridPosition: { row: 5, col: 7 },
        actions: [
          {
            id: "take",
            label: "Take crossbow and quarrels",
            effects: [
              { type: "set_flag", flag: "has_crossbow" },
              { type: "set_flag", flag: "has_twelve_bolts" },
              { type: "grant_weapon", weaponId: "crossbow" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Twelve bolts counted. For the first time since the gate, you can answer danger from a distance.",
              },
            ],
          },
        ],
      },
      {
        id: "rack_halberd",
        label: "Halberd",
        icon: "\u{2694}\uFE0F",
        desc: "A polearm too long for these tight cuts - unless you find a hall wide enough to let it wheel. Edge polished, shaft oiled by habit.",
        gridPosition: { row: 4, col: 6 },
        actions: [
          {
            id: "take",
            label: "Take the halberd",
            effects: [
              { type: "set_flag", flag: "has_halberd" },
              { type: "grant_weapon", weaponId: "spear" },
              { type: "consume_prop" },
              { type: "log", message: "Reach and heft. The dead do not respect fair distance." },
            ],
          },
        ],
      },
      {
        id: "rack_longsword",
        label: "Longsword",
        icon: "\u{1F5E1}\uFE0F",
        desc: "Straight, balanced, unadorned - the order's workman blade. No blessing etched; only a serial number salt-stamped on the guard.",
        gridPosition: { row: 4, col: 7 },
        actions: [
          {
            id: "take",
            label: "Take the longsword",
            effects: [
              { type: "set_flag", flag: "has_longsword" },
              { type: "consume_prop" },
              { type: "log", message: "Steel answers your grip like it was waiting." },
            ],
          },
        ],
      },
    ],
  },
  4: {
    label: "Armor Storage",
    hint: "corroded mail and a ceremonial plate that would sing if struck.",
    description:
      "Smaller room. Stands for mail and plate; parade harness on hooks - green corrosion at the rivets. " +
      "Damp leather and oil smell. Tap a hanging helm: rings loud and sharp.",
    enemies: [],
    notes: "R71. COLDFIRE. Era 2+3. Room design ref R71. Connects: R70 only.",
    safeRoom: true,
    props: [
      {
        id: "light_chain_mail",
        label: "Salvageable Chain Mail",
        icon: "\u{1F6E1}",
        desc: "Rings corroded at the shoulder but sound at the core - light enough to move in, honest enough to turn a knife.",
        gridPosition: { row: 4, col: 10 },
        actions: [
          {
            id: "take",
            label: "Take the chain mail",
            effects: [
              { type: "set_flag", flag: "has_light_chain_mail" },
              { type: "consume_prop" },
              {
                type: "log",
                message: "The mail settles on you like a second skeleton - lighter than fear.",
              },
            ],
          },
        ],
      },
      {
        id: "ceremonial_plate_display",
        label: "Ceremonial Plate",
        icon: "\u{1F3F0}",
        desc: "Display armor: order sigil acid-etched on the breast, gilding flaking. Beautiful, impractical - meant for processions, not punches.",
        gridPosition: { row: 5, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "read_ceremonial_plate_r71" },
          {
            type: "log",
            message:
              "Gilded, heavy - parade metal. The order dressed its legend in plate while sending others forward in corroded rings.",
          },
        ],
      },
      {
        id: "armor_storage_gold",
        label: "Paymaster's Tin",
        icon: "\u{1FA99}",
        desc: "Behind a loose grate: a tin with payroll chits and coin - someone skimmed before the skimmer vanished.",
        gridPosition: { row: 5, col: 11 },
        actions: [
          {
            id: "take",
            label: "Take the coin",
            effects: [
              { type: "grant_salt", amount: 15 },
              { type: "consume_prop" },
              { type: "log", message: "15 salt - armor budget that never reached the smith." },
            ],
          },
        ],
      },
    ],
  },
  5: {
    label: "Lower Gate East",
    hint: "iron bars end; beyond is not coldfire - only dark and the scrape of bone.",
    description:
      "Heavy iron gate; worn grooves in the floor from the doors. " +
      "Coldfire ends at the threshold. Past it: pitch black. Drip water. Distant shuffle. Dry scrape of bone on stone.",
    enemies: ["skeleton", "skeleton"],
    notes:
      "R73. DARK beyond gate. Era 2+3. Room design ref R73. Content room - skeletons; threshold to Area 3 Ossuary. " +
      "Soft gate: RELIABLE LIGHT - darkness is the real wall; torch punishing; shuttered lantern recommended. " +
      "NOT the area-transition room; use adjacent exit grid 10 for a3_threshold. " +
      "Grid 5 = designated return arrival from a3_threshold (convention).",
    props: [
      {
        id: "lower_gate_east_threshold",
        label: "Eastern Lower Gate",
        icon: "\u{1F6AA}",
        desc: "Iron gives way to a throat of raw dark. No coldfire beyond - only sound: shuffling, bone scrape, drip. The bone halls breathe through the gap.",
        gridPosition: { row: 7, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "examined_lower_gate_east_r73" },
          {
            type: "log",
            message:
              "The gate stands open; darkness is the wall. True flame or a shuttered lantern will matter more than courage here.",
          },
        ],
      },
    ],
  },
  6: {
    label: "Training Room",
    hint: "spar circle; living drill while a dead thing takes blows that never change it.",
    description:
      "Training floor: circle scribed in the stone, sand and splintered wicker, bins of blunt practice steel. " +
      "Coldfire high on the walls. Low vault - noise bounces fast. Dark stains in the sand.",
    enemies: ["zombie", "zombie", "zombie"],
    notes:
      "R72. COLDFIRE. Era 2+3. Room design ref R72. Spar circle; cultists ×2 not in list (zombies partial). " +
      "Connects: R69, R73 Lower Gate East, R74 Lower Gate West, exit grid 10 (Ossuary transit).",
    props: [
      {
        id: "training_manual_r72",
        label: "Training Manual",
        icon: "\u{1F4D8}",
        desc: "Illustrated drills: footwork, guard, how to brace against undead leverage. Margins warn about overcommitting - someone learned the hard way.",
        gridPosition: { row: 8, col: 7 },
        actions: [
          {
            id: "study",
            label: "Study the drills",
            effects: [
              { type: "set_flag", flag: "studied_armory_training_manual" },
              { type: "grant_ability", abilityId: "counter_stance" },
              { type: "grant_ability", abilityId: "aimed_shot" },
              { type: "heal_player", amount: 2 },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Your stance shifts without thinking. Small confidence - earned from paper.",
              },
            ],
          },
        ],
      },
      {
        id: "practice_weapons_bin",
        label: "Practice Weapons",
        icon: "\u{2694}\uFE0F",
        desc: "Blunted steel and wicker shields, splintered from use. Plentiful; weak - but better than empty hands if you need a decoy.",
        gridPosition: { row: 7, col: 7 },
        actions: [
          {
            id: "take_shield",
            label: "Pull free a strapped shield",
            effects: [
              { type: "grant_weapon", weaponId: "shield" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Leather, wood, and a rim of steel salvaged from the pile - parade drill metal, still honest enough to catch a first blow.",
              },
            ],
          },
        ],
        onExamine: [
          {
            type: "log",
            message:
              "Wood and dulled iron - training tools, not killers. Someone still swings them out of habit.",
          },
        ],
      },
    ],
  },
  7: {
    label: "Lower Gate West",
    hint: "coldfire holds here; past the narrow throat, something floral blocks stone and air alike.",
    description:
      "Narrow gap between armory dry stone and wet maintenance passage. Steady coldfire. " +
      "Past the wicket: thick sweet smell over mildew and wet stone.",
    enemies: [],
    notes:
      "R74. COLDFIRE near gate. Era 2+3. Room design ref R74. Skullflower choke - type not in enemy list; FIRE + pump state hard gate; alternate to Area 4 via R68 when cleared + drained. " +
      "Exit → a2_maintenance R68 (grid 8).",
    exit: { toAreaId: "a2_maintenance", toRoomGridId: 8 },
  },
  8: {
    label: "Back to Chapter House",
    hint: "maps and seals lie the way you came.",
    description: "Short hall back to the chapter house - wider ceiling, wax and paper smell.",
    enemies: [],
    exit: { toAreaId: "a2_chapter_house", toRoomGridId: 2 },
  },
  10: {
    label: "To the Ossuary",
    hint: "past the gate chamber, the threshold accepts your tread.",
    description: "Stone passage past the gate room; floor grain and sound change underfoot.",
    enemies: [],
    notes:
      "Transit only - pairs with a3_threshold grid 2. R73 remains combat/content at the gate proper.",
    exit: { toAreaId: "a3_threshold", toRoomGridId: 2 },
  },
};

export const A2_ARMORY: AreaDef = {
  id: "a2_armory",
  name: "Armory & Lower Gate",
  desc: "Racks thinned by panic-drill; east gate drops into the bone halls' dark, west chokes on bloom and wet stone.",
  difficulty: 3,
  generator: "authored",
  authored: {
    grid: A2_ARMORY_GRID,
    rooms: A2_ARMORY_ROOMS,
  },
  combatRooms: [],
};
