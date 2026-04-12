import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 2 - Maintenance Halls (R62–R68)
 * R62↔R63↔R64; R62↔R65,R66; R62↔R67↔R68; R68↔exits Area4/armory.
 */

// prettier-ignore
export const A2_MAINTENANCE_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
 [ 1, 1, 9, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 1
 [ 1, 1, 9, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 2
 [ 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 3
 [ 1, 1, 2, 2, 2, 0, 3, 3, 3, 0, 5, 5, 5, 1, 1, 1, 1, 1, 1], // 4 R62|R63|R64
 [ 1, 1, 2, 2, 2, 1, 3, 3, 3, 1, 5, 5, 5, 1, 1, 1, 1, 1, 1], // 5
 [ 1, 1, 2, 2, 2, 0, 4, 4, 1, 1, 5, 5, 5, 0, 10, 10, 1, 1, 1], // 6 R62↔R65; R64↔exit10
 [ 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 10, 10, 1, 1, 1], // 7
 [ 1, 1, 2, 2, 2, 0, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 8 R62↔R66
 [ 1, 1, 2, 2, 2, 1, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 9
 [ 1, 1, 2, 2, 2, 0, 7, 7, 7, 0, 8, 8, 8, 1, 1, 1, 1, 1, 1], // 10 R62↔R67↔R68
 [ 1, 1, 2, 2, 2, 1, 7, 7, 7, 1, 8, 8, 8, 1, 1, 1, 1, 1, 1], // 11
 [ 1, 1, 1, 1, 1, 1, 7, 7, 7, 1, 8, 8, 8, 0, 12, 12, 1, 1, 1], // 12 R68↔armory (col13)
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 8, 8, 8, 1, 12, 12, 1, 1, 1], // 13
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 8, 8, 8, 0, 11, 11, 1, 1, 1], // 14 R68↔Area4
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 8, 8, 8, 1, 11, 11, 1, 1, 1], // 15
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 11, 1, 1, 1], // 16
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 17
];

export const A2_MAINTENANCE_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Service Corridor",
    hint: "pipes crowd the ceiling; zombies haul crates in a maintenance pantomime.",
    description:
      "Narrow service corridor. Iron pipes along the ceiling; steady drips to the floor. Colored coldfire in wire cages. " +
      "Tool marks on the walls. Wet stone, oil, and a low hum from water moving in the pipes.",
    enemies: ["zombie", "zombie"],
    isStart: true,
    notes:
      "R62. COLDFIRE. Era 2. Room design ref R62. Cramped; ceiling pipes. Zombies haul tool crates - maintenance pantomime. " +
      "Connects: R31 cloister (exit grid 9), R63 stores, R65 workshop, R66 lamp workshop, R67 pump room.",
  },
  3: {
    label: "Kitchen Stores",
    hint: "pantry shelves stripped of rot; rats argue over salt-cured scraps.",
    description:
      "Pantry: rows of shelves, many empty. Dim light from a shaft and a little coldfire - dust in the air. " +
      "Brine, old grain, and stacked curing salt - same grey crystals as road salt, not the ritual stuff.",
    enemies: ["rat", "rat", "rat", "rat"],
    notes:
      "R63. DIM. Era 2. Room design ref R63. FIRE part 1 - combine with R65 glass flasks for oil bombs when crafting exists. " +
      "Connects: R62, R64 kitchen.",
    props: [
      {
        id: "lamp_oil_jugs",
        label: "Sealed Lamp-Oil Jugs",
        icon: "\u{1F6E1}",
        desc: "Three wax-sealed jugs, still fragrant. The workshop labels them for coldfire lamps - but true flame answers to oil all the same.",
        gridPosition: { row: 5, col: 7 },
        actions: [
          {
            id: "take",
            label: "Take the jugs",
            effects: [
              { type: "set_flag", flag: "has_lamp_oil_three", value: 1 },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Three jugs - enough for lamps, for flasks, for anything you mean to set alight when the moment comes.",
              },
            ],
          },
        ],
      },
      {
        id: "pantry_dried_salt",
        label: "Dried Salt Crystals",
        icon: "\u{1F9C2}",
        desc: "Bins of coarse salt for curing - irony in a mine that sells blessed grains for thrice the price.",
        gridPosition: { row: 4, col: 7 },
        onExamine: [
          {
            type: "log",
            message:
              "Industrial salt, not ritual salt. The kitchens knew the difference; the pulpits pretended not to.",
          },
        ],
      },
      {
        id: "cooks_stash_r63",
        label: "Cook's Hidden Tin",
        icon: "\u{1FA99}",
        desc: "Behind a loose brick: a tin of coin and a spoon bent from stirring stone soup for zombies.",
        gridPosition: { row: 5, col: 6 },
        actions: [
          {
            id: "take",
            label: "Take the stash",
            effects: [
              { type: "grant_salt", amount: 8 },
              { type: "grant_consumable", consumableId: "antidote" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "8 salt and a stoppered vial from the cook's own pocket - against bad meat, bad air, bad luck. Hazard pay the cook never spent.",
              },
            ],
          },
        ],
      },
    ],
  },
  4: {
    label: "Workshop",
    hint: "pegs and a bench; a zombie turns a wheel that will never fit anything again.",
    description:
      "Workshop. Bench, vise, pegboard - files and wrenches salt-dulled, lamp parts laid out on cloth. " +
      "Coldfire track on the ceiling. Grit on the floor. Somewhere a gear wheel spins free, metal ticking steady.",
    enemies: ["zombie"],
    notes:
      "R65. COLDFIRE. Era 2+3. Room design ref R65. FIRE part 2 - pair with R63 lamp oil when crafting UI lands. " +
      "Connects: R62 only.",
    props: [
      {
        id: "intact_glass_flasks",
        label: "Intact Glass Flasks",
        icon: "\u{1F52C}",
        desc: "Three lamp flasks from maintenance stock, blown thick, stoppers tied with waxed cord. Waiting for oil and a steady hand.",
        gridPosition: { row: 6, col: 6 },
        actions: [
          {
            id: "take",
            label: "Take the flasks",
            effects: [
              { type: "set_flag", flag: "has_glass_flasks_three", value: 1 },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Three empty vessels. You already know what happens when oil meets glass and a steady hand.",
              },
            ],
          },
        ],
      },
      {
        id: "workshop_till_box",
        label: "Bench Till",
        icon: "\u{1FA99}",
        desc: "Under the vise: petty cash for runners and replacement wicks. Pegboard above - pliers, coldfire wrenches, files salt-dulled - still honest metal watching over dishonest light.",
        gridPosition: { row: 6, col: 7 },
        actions: [
          {
            id: "take",
            label: "Take the coin",
            effects: [
              { type: "grant_salt", amount: 10 },
              { type: "consume_prop" },
              { type: "log", message: "10 salt - maintenance skim, unmaintained." },
            ],
          },
        ],
      },
    ],
  },
  5: {
    label: "Kitchen",
    hint: "ovens and a working well; cleaver rings on stone that will never be meat.",
    description:
      "Big kitchen vault. Black brick ovens; empty pot hooks. Colored coldfire instead of hearth fire. " +
      "Stone well head cut through older rock; green light on the water. Pots clang; rinse water drips; cooling brick ticks.",
    enemies: ["zombie", "zombie", "zombie"],
    notes:
      "R64. COLDFIRE. Era 2+3. Room design ref R64. Zombies 'cook'; one chops stone forever. " +
      "Connects: R63, cloister refectory exit grid 10 (R35).",
    props: [
      {
        id: "kitchen_well",
        label: "Working Well",
        icon: "\u{1F6B0}",
        desc: "Stone lip, rope scarred, water clear enough to reflect coldfire wrong. Someone maintained the filters - living work, recent.",
        gridPosition: { row: 5, col: 11 },
        actions: [
          {
            id: "draw",
            label: "Draw water",
            effects: [
              { type: "set_flag", flag: "used_kitchen_well_r64" },
              { type: "heal_player", amount: 1 },
              {
                type: "log",
                message: "Cold, clean. Your throat remembers what trust tastes like.",
              },
            ],
          },
        ],
      },
      {
        id: "kitchen_cleaver",
        label: "Kitchen Cleaver",
        icon: "\u{1F52A}",
        desc: "Heavy blade, edge chipped from stone, not bone. A zombie has been lifting it forever - the steel still wants purpose.",
        gridPosition: { row: 4, col: 11 },
        actions: [
          {
            id: "take",
            label: "Take the cleaver",
            effects: [
              { type: "set_flag", flag: "has_kitchen_cleaver" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Brutal, close, loud if you swing wild - a kitchen blade for when you're already in something's arms.",
              },
            ],
          },
        ],
      },
      {
        id: "kitchen_spice_tin_gold",
        label: "Spice Tin",
        icon: "\u{1FA99}",
        desc: "Old tin labeled in joke-hand: 'saffron.' Inside: not spice.",
        gridPosition: { row: 5, col: 10 },
        actions: [
          {
            id: "take",
            label: "Take the coin",
            effects: [
              { type: "grant_salt", amount: 5 },
              { type: "consume_prop" },
              { type: "log", message: "5 salt - cook's joke on whoever audited the pantry." },
            ],
          },
        ],
      },
    ],
  },
  6: {
    label: "Lamp Workshop",
    hint: "half-built lanterns; one brass shell waits with a lever and a salt-crystal lens.",
    description:
      "Lantern assembly room. Half-built brass shells on shelves; lenses in cloth; drawers of wicks and stoppers. " +
      "Shaft light plus coldfire. Oil, brass polish, hot dust. Hinges and shutters squeak loud in the quiet.",
    enemies: [],
    notes:
      "R66. DIM. Era 2. Room design ref R66. RELIABLE LIGHT - open shutter = true flame, shut = dark; consumes lamp oil; longer burn than torch (fuel hook TBD). " +
      "Connects: R62 only.",
    props: [
      {
        id: "shuttered_lantern_r66",
        label: "Shuttered Lantern",
        icon: "\u{1F526}",
        desc: "Brass shell on the high shelf, salt-crystal lens, lever shutter that slides like a drawn breath. Open it for true flame; close it to swallow light whole. Hungry for oil, patient for hands that remember how.",
        gridPosition: { row: 8, col: 6 },
        actions: [
          {
            id: "take",
            label: "Take the lantern",
            effects: [
              { type: "set_flag", flag: "has_shuttered_lantern" },
              { type: "grant_consumable", consumableId: "torch" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Weight and balance right - and a spare torch from the wick drawer, waxed for the dark pipes. This is the first honest fire you've held since the coldfire halls.",
              },
            ],
          },
        ],
      },
    ],
  },
  7: {
    label: "Pump Room",
    hint: "old iron and ordered gauges - frozen until someone reads the right sequence.",
    description:
      "Pump chamber. Old thick iron pipe; newer brass gauges and levers on a console. Everything stiff with rust. " +
      "Dim light. Water noise behind the metal panels. Floor stone cold and damp through your boots.",
    enemies: [],
    notes:
      "R67. DIM. Era 1+2. Room design ref R67. Era 1 pumps + Era 2 controls. Wrong guesses risk jam/flood when puzzle logic exists. Drains R68 and Area 4 Drained Tunnels (R111–R116). " +
      "Connects: R62, R68.",
    props: [
      {
        id: "pump_control_console",
        label: "Pump Console",
        icon: "\u{2699}\uFE0F",
        desc: "Levers, valves, gauges frozen at angry angles. Heavy mine iron couples to dials someone labeled in confident ink - then abandoned.",
        gridPosition: { row: 10, col: 7 },
        actions: [
          {
            id: "examine_gauges",
            label: "Read the gauges",
            effects: [
              {
                type: "log",
                message:
                  "Pressure dreams in rust. Without the engineering folio from the mining records room, this is sculpture, not machinery.",
              },
            ],
          },
          {
            id: "run_sequence",
            label: "Run the drain sequence",
            desc: "You need the barons' pump sequence from the mining records - guessing will jam the works",
            requires: { flags: ["has_mine_engineering_documents"] },
            effects: [
              { type: "set_flag", flag: "pumps_activated_r67" },
              {
                type: "log",
                message:
                  "Valves bite, iron shudders, water somewhere below begins to leave its chair. The drain shaft ahead will fall; far below, drowned workings groan as the same pull empties them.",
              },
            ],
          },
        ],
      },
    ],
  },
  8: {
    label: "Drain Access",
    hint: "water breathes at the lip of the shaft; something floral chokes the deep air.",
    description:
      "Open shaft mouth. Rope-worn stone lip. Damp air; mineral smell. " +
      "Over that: thick sweet flower stink - wrong down here. Dark below; water dripping; slow slap of water on rock; iron groaning somewhere under.",
    enemies: [],
    notes:
      "R68. DARK. Era 1+2. Room design ref R68. Waist-deep water until pumps run (flag pumps_activated_r67). Skullflower choke - enemy type not in data yet. " +
      "Dual gate to Area 4: infrastructure + fire. Alternate R74 Lower Gate West when Skullflower cleared + pumps drained. " +
      "Grid 8 = arrival from a4_drained_tunnels and a2_armory R74. Exits: Area 4 (grid 11), armory (grid 12).",
    props: [
      {
        id: "drain_shaft_skullflower",
        label: "Skullflower at the Waterline",
        icon: "\u{1F33A}",
        desc: "Pale growth choking the shaft floor to ceiling, petals like bone plates, rooted in the flood. It drinks lamplight and gives nothing back. After the pumps pull the water down, fire might starve it.",
        gridPosition: { row: 12, col: 11 },
        condition: { notFlags: ["skullflower_burned_r68"] },
        actions: [
          {
            id: "burn",
            label: "Douse it with oil and ignite",
            desc: "Requires lamp oil and glass flasks; the water level needs to be low",
            requires: {
              flags: ["has_lamp_oil_three", "has_glass_flasks_three", "pumps_activated_r67"],
            },
            effects: [
              { type: "set_flag", flag: "skullflower_burned_r68" },
              {
                type: "log",
                message:
                  "Flame catches the oil-slicked bloom. It screams like wet paper. The choked passage west gapes - air moves again where the flower strangled it.",
              },
            ],
          },
        ],
      },
    ],
  },
  9: {
    label: "Back to the Cloister (Common Room)",
    hint: "stone benches and the hum of the common hall.",
    description: "Corridor opens into the cloister common room - higher vault, stone benches.",
    enemies: [],
    exit: { toAreaId: "a2_cloister", toRoomGridId: 3 },
  },
  10: {
    label: "Back to the Cloister (Refectory)",
    hint: "salt tables and the matins bell's ghost.",
    description: "Warmer coldfire ahead; long refectory tables and echo from the big hall.",
    enemies: [],
    exit: { toAreaId: "a2_cloister", toRoomGridId: 6 },
  },
  11: {
    label: "To the Deep Workings",
    hint: "the shaft drops into wet dark and older stone.",
    description: "Steps down: older rougher stone, colder air, echo growing with each flight.",
    enemies: [],
    exit: { toAreaId: "a4_drained_tunnels", toRoomGridId: 2 },
  },
  12: {
    label: "Back to the Armory",
    hint: "drills and racks somewhere above.",
    description:
      "Climb toward the armory: drier air, oil smell, faint drill noise from the training room.",
    enemies: [],
    exit: { toAreaId: "a2_armory", toRoomGridId: 7 },
  },
};

export const A2_MAINTENANCE: AreaDef = {
  id: "a2_maintenance",
  name: "Maintenance Halls",
  desc: "Kitchens, workshops, pumps - where honest flame gets built and the flood below finally learns to obey.",
  difficulty: 2,
  generator: "authored",
  authored: {
    grid: A2_MAINTENANCE_GRID,
    rooms: A2_MAINTENANCE_ROOMS,
  },
  combatRooms: [],
};
