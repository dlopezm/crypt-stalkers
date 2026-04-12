import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 3 - Ossuary - Reanimation Wing (R87–R92). Grid: 2=R87 … 7=R92, 8=exit→sorting R83 (grid 5).
 * Exit column (5) separated from horizontal chain 0-row so no vertical merge into wrong rooms.
 */

// prettier-ignore
export const A3_REANIMATION_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 1
 [ 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 2 R88 circle beta
 [ 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 3
 [ 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 4
 [ 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 5 R88↔R87 shaft
 [ 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 6
 [ 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 7
 [ 1, 1, 1, 1, 1, 2, 2, 2, 0, 4, 4, 4, 0, 5, 5, 5, 0, 6, 6, 6, 0, 7, 7], // 8 main chain
 [ 1, 1, 1, 1, 1, 2, 2, 2, 1, 4, 4, 4, 1, 5, 5, 5, 1, 6, 6, 6, 1, 7, 7], // 9
 [ 1, 1, 1, 1, 1, 2, 2, 2, 1, 4, 4, 4, 1, 5, 5, 5, 1, 6, 6, 6, 1, 7, 7], // 10
 [ 1, 1, 1, 1, 1, 2, 2, 2, 1, 4, 4, 4, 1, 5, 5, 5, 1, 6, 6, 6, 1, 7, 7], // 11
 [ 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 12 R87↔exit
 [ 1, 1, 1, 1, 1, 8, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 13
 [ 1, 1, 1, 1, 1, 8, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 14
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 15
];

export const A3_REANIMATION_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Ritual Circle Alpha",
    hint: "coldfire and a circle that will not stop knitting bone into spear-bearers.",
    description:
      "Floor sigils lit by coldfire - green-white, steady. Salt-ash and hot iron smell. Floor pulses underfoot in time with the glow. Bone chips at the circle edge.",
    enemies: ["necromancer", "skeleton", "skeleton"],
    isStart: true,
    notes:
      "R87. Era 3. COLDFIRE. Active circle: sigils glow; necromancer chants; bone fragments assemble into armed skeletons - source of the perpetual shift, shown not told. " +
      "Necromancer ×1, skeletons ×2 (fresh). " +
      "WORLD STATE: destroy circle (fire or CONSECRATION after unlocked) → permanently disables this spawn point; fewer replacement skeletons in Areas 1–3. " +
      "Connects to R83 (sorting conveyor), R88 (beta, dead end), R89 (binding).",
    props: [
      {
        id: "ritual_circle_alpha",
        label: "Active Reanimation Circle",
        icon: "\u{1F52E}",
        desc: "Sigils drink coldfire and give nothing warm back. Bone chips skate the perimeter; at each pulse they find new angles - femur to scapula - until a skeleton stands and lifts its face toward the one who shouts. This is where the night shift never ends.",
        gridPosition: { row: 9, col: 6 },
        actions: [
          {
            id: "destroy_with_fire",
            label: "Collapse the circle with flame",
            desc: "True fire washes salt-geometry white; bone dust forgets the pattern it learned.",
            effects: [
              { type: "set_flag", flag: "ritual_circle_alpha_destroyed" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Fire washes the sigils white. Bone dust screams once, then forgets how to assemble.",
              },
            ],
          },
          {
            id: "destroy_with_consecration",
            label: "Sanctify the circle into silence",
            desc: "The vow you spoke in the deep crypt meets their craft - one ring goes quiet forever.",
            requires: { flags: ["consecration_rite_performed_r105"] },
            effects: [
              { type: "set_flag", flag: "ritual_circle_alpha_destroyed" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "The vow in your chest meets their wheel of bone. One circle forgets how to stand a soldier up.",
              },
            ],
          },
        ],
      },
      {
        id: "alpha_circle_components",
        label: "Basket of Ritual Components",
        icon: "\u{1F9EA}",
        desc: "Bundled herbs blackened with salt, vials of suspended ash, wire circles labeled in cipher. Enough to fuel a night of forbidden chemistry.",
        gridPosition: { row: 10, col: 5 },
        actions: [
          {
            id: "take",
            label: "Take the components",
            desc: "Bundled ash and salt - foul pantry for whoever fed this place.",
            effects: [
              { type: "set_flag", flag: "has_ritual_components_r87" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Herbs black with salt, wire circles, vials that rattle like seeds. Packed like provisions for a crime.",
              },
            ],
          },
        ],
      },
      {
        id: "alpha_circle_gold",
        label: "Offering Dish of Mixed Coin",
        icon: "\u{1FA99}",
        desc: "Silver rubbed thin, a few gold disks - stipend for whoever kept this circle fed.",
        gridPosition: { row: 10, col: 7 },
        actions: [
          {
            id: "take",
            label: "Empty the dish",
            desc: "Stipend for whoever kept the sigils fed - thin silver, a few thick disks of gold.",
            effects: [
              { type: "grant_salt", amount: 15 },
              { type: "consume_prop" },
              {
                type: "log",
                message: "Fifteen pieces - rubbed thin, still hungry to spend.",
              },
            ],
          },
        ],
      },
    ],
  },
  3: {
    label: "Ritual Circle Beta",
    hint: "dim sigils; the last maintainer never finished the notes.",
    description:
      "Smaller circle. Sigils only lit in thin lines - enough to read by. Tools, crates, chair shoved aside. Old reagents, cold stone smell.",
    enemies: [],
    safeRoom: true,
    notes:
      "R88. Era 3. COLDFIRE (dim). Inactive circle; dark sigils; prior maintainer lost. Dead end. Study aids CONSECRATION (know your counter).",
    props: [
      {
        id: "ritual_circle_beta",
        label: "Darkened Circle",
        icon: "\u{26AB}",
        desc: "Sigils carved deep; coldfire catches only in the grooves. Whatever last fed this circle left mid-rite - a scatter of tools, a chair knocked sideways.",
        gridPosition: { row: 3, col: 6 },
        onExamine: [
          { type: "set_flag", flag: "examined_ritual_circle_beta_r88" },
          {
            type: "log",
            message:
              "Quiet now - but the grooves show how their craft twists what the vigil once blessed: same stone, hungrier math.",
          },
        ],
      },
      {
        id: "beta_circle_components",
        label: "Crate of Circle Components",
        icon: "\u{1F4E6}",
        desc: "Salt-etched disks, bone pins, jars of suspended marrow. Spares for a line that never sleeps.",
        gridPosition: { row: 4, col: 5 },
        actions: [
          {
            id: "take",
            label: "Salvage the components",
            desc: "Spare pins, etched disks - enough to mock their work or unmake a span of it.",
            effects: [
              { type: "set_flag", flag: "has_circle_components_r88" },
              { type: "grant_consumable", consumableId: "poison_flask" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Salt-etched circles, marrow in glass - fodder for a still, or for breaking what a still helped raise.",
              },
            ],
          },
        ],
      },
      {
        id: "reanimation_notes_r88",
        label: "Reanimation Notes",
        icon: "\u{1F4D6}",
        desc: 'Hand cramped from speed: corrections to sigil spacing, warnings about "will bleed heat," marginal sketches of counter-gestures. Whoever wrote this was learning how to unmake as fast as they made.',
        gridPosition: { row: 3, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "read_reanimation_notes_r88" },
          { type: "set_flag", flag: "binding_knowledge" },
          {
            type: "log",
            message:
              "Counter-gestures sketched in haste - useful if you mean to bless ground they poisoned.",
          },
        ],
      },
      {
        id: "beta_materials_gold",
        label: "Material Strongbox",
        icon: "\u{1F4B3}",
        desc: "Coins mixed with ingot stubs - payment for deliveries the living stopped asking questions about.",
        gridPosition: { row: 4, col: 7 },
        actions: [
          {
            id: "take",
            label: "Take the strongbox contents",
            desc: "Coin and ingot stubs - payment for silence on the delivery road.",
            effects: [
              { type: "grant_salt", amount: 20 },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Twenty pieces, mostly silver-weight - mixed with metal stubs that smell of the furnace.",
              },
            ],
          },
        ],
      },
    ],
  },
  4: {
    label: "Binding Chamber",
    hint: "charged air; souls measured against bone like ledger lines.",
    description:
      "Bright coldfire. Lecterns, open codices, salt diagrams on stands. Hair stands on arms. Sharp chemical taste in the mouth. Charged air.",
    enemies: ["necromancer", "zombie", "zombie"],
    notes:
      "R89. Era 3. COLDFIRE. Soul-to-bone binding. Witch ×1 (enemy type witch not in data - use necromancer as stand-in for telegraphed heavy magic); zombies ×2. " +
      "Unpleasant charged air; bright coldfire.",
    props: [
      {
        id: "soul_binding_lectern_r89",
        label: "Soul-Binding Texts",
        icon: "\u{1F4DC}",
        desc: 'Chains hold codices open to diagrams that hurt to focus on - threads drawn from hollow silhouettes into bone outlines. A tight hand in the margin counts yield, retention, "personality bleed acceptable" - commerce written beside blasphemy.',
        gridPosition: { row: 9, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "read_soul_binding_texts_r89" },
          { type: "set_flag", flag: "binding_knowledge" },
          {
            type: "log",
            message:
              "Threads drawn from hollow silhouettes into bone - detail you cannot unsee once your eyes focus.",
          },
        ],
      },
      {
        id: "binding_chamber_materials_gold",
        label: "Sealed Material Coffers",
        icon: "\u{1FA99}",
        desc: "Wax-sealed boxes behind the lectern. Inside: coin, powdered salts, things that hum when your hand gets close.",
        gridPosition: { row: 10, col: 10 },
        actions: [
          {
            id: "take",
            label: "Claim the coffered coin and salts",
            desc: "Wax splits; inside, coin and powders that hum against your knuckles.",
            effects: [
              { type: "grant_salt", amount: 25 },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Twenty-five pieces - tithe, bribe, or lab fee; the box does not label its conscience.",
              },
            ],
          },
        ],
      },
    ],
  },
  5: {
    label: "Assembly Floor",
    hint: "staged bodies wait in formation; the dark leans them toward the exits.",
    description:
      "Large staging floor. Racks, chalk lane marks, swept paths for carts. Dark overhead - ceiling lost in shadow. Faint sweet chemical smell on the stone.",
    enemies: ["zombie", "zombie", "zombie", "zombie", "zombie", "skeleton"],
    notes:
      "R90. Era 3. DARK. Staged undead before deployment; zombies ×5, skeleton ×1. Chemical smell on fresh assemblies. " +
      "If necromancer off-shift or dead: figures tilt toward passages leading down/stack-ward (What Lies Below drift).",
    props: [
      {
        id: "staged_undead_pouches_r90",
        label: "Corded Pouches on a Staging Rack",
        icon: "\u{1F45B}",
        desc: "Belt pouches hung like uniforms waiting for owners who no longer need pay - but the coin inside still spends.",
        gridPosition: { row: 9, col: 14 },
        actions: [
          {
            id: "take",
            label: "Cut the pouches down",
            desc: "Petty coin hung like uniforms waiting for owners who no longer eat.",
            effects: [
              { type: "grant_salt", amount: 10 },
              { type: "consume_prop" },
              {
                type: "log",
                message: "Ten pieces - small theft from whoever paid these husks in pocket money.",
              },
            ],
          },
        ],
      },
    ],
  },
  6: {
    label: "Testing Ground",
    hint: "scoring lines on stone; three skeletons rehearse violence on each other.",
    description:
      "Wide chamber. Gouges and chalk scoring on the floor - practice marks. Lantern light dies at the walls. Hard echo - sound comes back thin.",
    enemies: ["skeleton", "skeleton", "skeleton"],
    notes:
      "R91. Era 3. DARK. Combat drills forever; scoring lines and marks. Skeletons ×3 (drills) focused on each other - not patrol mode; observation safe; surprise attack = free first turn. " +
      "Quality control on a product line; drill behavior = stealth / opener opportunity.",
    props: [
      {
        id: "testing_ground_scoring_marks",
        label: "Scoring Lines",
        icon: "\u{1F4CF}",
        desc: 'Chalk and gouged stone mark "hits," "penetration," "reform time." Three skeletons rehearse violence on each other with the patience of clockwork. Someone proves corpses will hold - and you are a flaw their drill has not met yet.',
        gridPosition: { row: 9, col: 18 },
        onExamine: [
          { type: "set_flag", flag: "read_testing_ground_scores_r91" },
          {
            type: "log",
            message:
              "Strike while they count each other's ribs - you buy one breath their drill never assigned you.",
          },
        ],
      },
    ],
  },
  7: {
    label: "Circle-Master's Study",
    hint: "shelves of failure labeled progress; a wall map marks every door in the dead-mills.",
    description:
      "Coldfire lamp - sick green on everything. Shelves: folios, jars, pinned notes. Smell of ink, alcohol, bone dust. Far wall covered by a big map - doors and tunnels inked, crossed out, redrawn.",
    enemies: [],
    safeRoom: true,
    notes: "R92. Era 3. COLDFIRE. Senior research space; occupant often at R87. Dead end.",
    props: [
      {
        id: "lich_memory_request_notes",
        label: "Pinned Orders",
        icon: "\u{1F4CC}",
        desc: 'Ink in a precise hand: whoever holds the chains wants corpses that keep memory and trained skill - "not merely obedient meat." Cross-outs thicken toward the bottom; success has not arrived. Someone else\'s failure is your intelligence.',
        gridPosition: { row: 9, col: 21 },
        onExamine: [
          { type: "set_flag", flag: "read_lich_memory_preservation_request_r92" },
          {
            type: "log",
            message:
              "He is still scratching new versions in flesh and ink. You move through pages he has not finished.",
          },
        ],
      },
      {
        id: "reanimation_research_shelf_r92",
        label: "Reanimation Research Folios",
        icon: "\u{1F4D2}",
        desc: 'Diagrams of fascia and filament, experiments on "retention under stress." The coldfire lamp leaves everything the color of old bruises.',
        gridPosition: { row: 10, col: 22 },
        onExamine: [
          { type: "set_flag", flag: "read_reanimation_research_folios_r92" },
          {
            type: "log",
            message:
              "The writers borrow mill-talk: yield, what holds under strain, how long a thing keeps before it spoils.",
          },
        ],
      },
      {
        id: "experimental_notes_r92",
        label: "Experimental Notes",
        icon: "\u{1F9EA}",
        desc: 'Loose leaves: failed catalysts, a list titled "Subjects - disposed," margins crowded with hurry. The handwriting changes halfway through - different researcher, same hunger.',
        gridPosition: { row: 10, col: 21 },
        onExamine: [
          { type: "set_flag", flag: "read_experimental_notes_r92" },
          { type: "grant_ability", abilityId: "acid_flask" },
          {
            type: "log",
            message:
              "Enough reagent-lore to make an honest shop shut its shutter when you ask for help.",
          },
        ],
      },
      {
        id: "study_coin_purse_r92",
        label: "Senior's Purse",
        icon: "\u{1FA99}",
        desc: "Leather, fine stitching - dropped behind a chair as if its owner expected to return the same hour.",
        gridPosition: { row: 11, col: 21 },
        actions: [
          {
            id: "take",
            label: "Take the purse",
            desc: "Fine stitching - dropped as if the owner meant to return within the hour.",
            effects: [
              { type: "grant_salt", amount: 12 },
              { type: "consume_prop" },
              {
                type: "log",
                message: "Twelve pieces - light in the purse, heavy in implication.",
              },
            ],
          },
        ],
      },
      {
        id: "ossuary_full_map_r92",
        label: "Salt-Chart Map",
        icon: "\u{1F5FA}\uFE0F",
        desc: "A wall map peeled and rolled thin: every door in the dead-mills - belts, circles, stack-aisles - inked with corrections in three hands. Someone wanted to own the paths better than the bodies piled along them.",
        gridPosition: { row: 9, col: 22 },
        actions: [
          {
            id: "take",
            label: "Roll up the map",
            effects: [
              { type: "set_flag", flag: "has_ossuary_full_map" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "The whole crypt-factory fits under your arm - ways through, places to hide, and ink that admits doubt.",
              },
            ],
          },
        ],
      },
    ],
  },
  8: {
    label: "Back Toward the Belt-Hall",
    hint: "belt-thunder leaks through; shouted tallies drag slack bodies toward their posts.",
    description: "Passage warms. Belt noise builds; floor vibrates under the boots.",
    enemies: [],
    exit: { toAreaId: "a3_sorting", toRoomGridId: 5 },
    notes:
      'Return to R83 Conveyor Hall (sorting grid 5). Pair: sorting "To Reanimation Wing" lands grid 2 (R87).',
  },
};

export const A3_REANIMATION: AreaDef = {
  id: "a3_reanimation",
  name: "Reanimation Wing",
  desc: "Where circles stay warm: bone becomes spear-line, souls are measured against marrow, and someone senior still edits his failures on the wall.",
  difficulty: 4,
  generator: "authored",
  authored: {
    grid: A3_REANIMATION_GRID,
    rooms: A3_REANIMATION_ROOMS,
  },
  combatRooms: [],
  notes:
    "Ossuary subarea 3: industrial necromancy; drift toward bone stacks / deep connections. " +
    "R87 circle destruction reduces skeleton pressure in Areas 1–3 permanently.",
};
