import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 3 - Ossuary - Bone Stacks (R93–R99). Grid: 2=R93, 3=R94, 4=R96, 5=R95, 6=R98, 7=R97,
 * 8=ward antechamber (a5 return lands here), 14=R99 ward door combat, 9=sorting, 10=deep crypt, 11=prison, 12=Area 5 exit.
 */

// prettier-ignore
export const A3_BONE_STACKS_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 1
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 2
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 3
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 4
 [ 1, 1, 1, 9, 9, 0, 2, 2, 2, 0, 3, 3, 0, 5, 5, 0, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 5
 [ 1, 1, 1, 9, 9, 1, 2, 2, 2, 1, 3, 3, 1, 5, 5, 1, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 6
 [ 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 3, 3, 1, 5, 5, 1, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 7
 [ 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 8 R93↔R96 @ col6; R95↔R97; R97↔R98
 [ 1, 1, 1, 1, 1, 4, 4, 4, 1, 1, 1, 1, 1, 7, 7, 7, 0, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 9
 [ 1, 1, 1, 1, 1, 4, 4, 4, 1, 1, 1, 1, 1, 7, 7, 7, 0, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 10
 [ 1, 1, 1, 1, 1, 4, 4, 4, 0, 8, 8, 8, 0, 7, 7, 7, 0, 6, 6, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 11 R98 shaft col19
 [ 1, 1, 1, 1, 1, 4, 4, 4, 1, 8, 8, 8, 1, 7, 7, 7, 0, 6, 6, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 12
 [ 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 13
 [ 1, 1, 1, 1, 1, 11, 11, 1, 1, 14, 14, 14, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 14
 [ 1, 1, 1, 1, 1, 11, 11, 1, 1, 14, 14, 14, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 15
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 14, 14, 14, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 16
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 14, 14, 14, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 17
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 18
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 12, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 19
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 12, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 20
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 21
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 22
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 23
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 24
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 0, 10, 10, 1, 1, 1, 1, 1, 1], // 25
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 26
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 27
];

export const A3_BONE_STACKS_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Stack Entrance",
    hint: "bone mountains and cart ruts; patrol routes echo in the aisles.",
    description:
      "Large storeroom. Bone stacked in slopes toward the ceiling. Narrow aisles, cart ruts full of pale dust. Dry echo. Marrow grit and old paper in the air.",
    enemies: ["skeleton", "skeleton"],
    isStart: true,
    notes:
      "R93. Era 3. DARK. High ceiling; bone mountains; narrow cart aisles. Skeletons ×2 on patrol. " +
      "Connects to R83 conveyor, R94 femur corridor, R96 stack core. Environmental drift: patrol vectors toward R99 / lower bone mass; necromancers correct formations.",
    props: [
      {
        id: "stack_entrance_cart_aisle",
        label: "Cart Rut Junction",
        icon: "\u{1F6DF}",
        desc: "Deep ruts in salt dust - carts ran here until the wheels learned the route by memory. Bone mountains lean overhead; the aisle is a canyon cut through stacked dead.",
        gridPosition: { row: 6, col: 7 },
        onExamine: [
          { type: "set_flag", flag: "examined_r93_cart_aisles" },
          {
            type: "log",
            message:
              "Warehouse scale - bone stacked to the rafters. Enough raw material to refill the aisles with spear-holders whenever someone whispers the right cruelty.",
          },
        ],
      },
    ],
  },
  3: {
    label: "Femur Corridor",
    hint: "tight columns of femurs; something uses them as cover.",
    description:
      "Passage between femur stacks - columns close enough to brush your shoulders. Vertical gaps, dark between them. Sharp mineral smell. Boots loud on stone.",
    enemies: ["ghoul"],
    notes:
      "R94. Era 3. DARK. Tight passage between femur towers. Ghoul ×1 hit-and-run using columns; claustrophobic fight. " +
      "Teaching: open lantern before entering - tight quarters favor Ghoul hiding. Connects R93 ↔ R95.",
    props: [
      {
        id: "femur_column_niche",
        label: "Femur Columns",
        icon: "\u{1F9B4}",
        desc: "Stacked femurs form pillars shoulder-wide; gaps between them drink light. Something has been squeezing through the narrow places, leaving scrape-marks at knee height.",
        gridPosition: { row: 6, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "examined_r94_femur_columns" },
          { type: "grant_ability", abilityId: "stealth" },
          {
            type: "log",
            message:
              "Open flame before you step deep - the dark here has teeth trained on impatience.",
          },
        ],
      },
    ],
  },
  5: {
    label: "Skull Gallery",
    hint: "shelves of skulls; the silence has weight.",
    description:
      "Skulls on shelves wall to floor. Rows of hollow eye sockets in the lantern light. Very quiet. Cold, dry dust smell.",
    enemies: [],
    safeRoom: true,
    notes:
      "R95. Era 3. DARK. Profound silence. Ancestors statistically present - tag in R81 names one of thousands. No loot - atmosphere only. Connects R94 ↔ R97.",
    props: [
      {
        id: "skull_shelf_numeric_codes",
        label: "Coded Skull Shelves",
        icon: "\u{1F480}",
        desc: "Floor-to-ceiling shelves of skulls, each tagged with numeric codes that mean nothing to you yet and everything to the clerks who filed them. The silence is not peace - it is counted bone holding its breath.",
        gridPosition: { row: 5, col: 13 },
        onExamine: [
          { type: "set_flag", flag: "read_skull_gallery_codes_r95" },
          {
            type: "log",
            message:
              "One name on a wire-tied card in the sorting room could belong to any of a thousand hollow gazes pressed into these shelves.",
          },
        ],
      },
    ],
  },
  4: {
    label: "Stack Core",
    hint: "the largest reserve; chalk tallies on slates read like a war plan.",
    description:
      "Open floor between huge bone walls. Wide aisles for carts to turn. Chalk and bone-meal haze. Distant drip; occasional creak from the stacks settling.",
    enemies: ["skeleton", "skeleton", "skeleton", "necromancer"],
    notes:
      "R96. Era 3. DARK. Largest open storage; organized bone mountains; necromancer ×1; patrol skeletons ×3. " +
      "Lich's reserve - thousands more undead possible. Supervisor strain: pull toward deeper stacks / R99 approach. " +
      "Connects R93, R97, R98, ward approach (R8), R106 prison approach.",
    props: [
      {
        id: "bone_reserve_assessment_clipboard",
        label: "Reserve Assessment",
        icon: "\u{1F4CB}",
        desc: 'Chalkboard slate on a tripod: tallies in thousands, arrows toward "ward-ready," "unprocessed," "downward drift - correct." The handwriting tightens at the bottom - supervisor strain made visible.',
        gridPosition: { row: 10, col: 6 },
        onExamine: [
          { type: "set_flag", flag: "read_bone_reserve_assessment_r96" },
          {
            type: "log",
            message:
              "Thousands counted - not omen, inventory. Enough to raise another wave if the circles keep eating salt and spite.",
          },
        ],
      },
      {
        id: "stack_core_pay_chest",
        label: "Paymaster's Chest",
        icon: "\u{1F4B0}",
        desc: "Iron-bound, shoved behind a bone pallet as if secrecy mattered in a room this large. Coin for bribes, mercenaries, or panic.",
        gridPosition: { row: 10, col: 7 },
        actions: [
          {
            id: "take",
            label: "Empty the paymaster's chest",
            desc: "Iron and coin - whoever hid it behind bone hoped no honest eye would look.",
            effects: [
              { type: "grant_salt", amount: 30 },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Thirty pieces - pay for mercenaries, bribes, or panic. Heavy in the hand.",
              },
            ],
          },
        ],
      },
    ],
  },
  7: {
    label: "Collapsed Stack",
    hint: "unstable heaps; combat might bring the ceiling down.",
    description:
      "Collapsed bone and splintered timber under a low ceiling. Dust sifts when you jar or shout. Gritty cold air. Timber and salt-block look unstable overhead.",
    enemies: ["rat", "rat", "rat", "rat", "rat"],
    notes:
      "R97. Era 3. DARK. Collapsed pile; unstable. Rats ×5. Loud combat → falling debris 2–4 random damage/turn (environmental hazard). " +
      "Connects R95, R96, R98.",
    props: [
      {
        id: "collapsed_stack_ceiling",
        label: "Unstable Ceiling",
        icon: "\u{26F0}\uFE0F",
        desc: "Timber and salt-block wedged in a bad marriage. Dust sifts when you breathe too hard. Whatever fights loudly here may buy more than it bargains for.",
        gridPosition: { row: 10, col: 17 },
        onExamine: [
          { type: "set_flag", flag: "examined_r97_collapse_hazard" },
          {
            type: "log",
            message:
              "A shouting fight here could bring splinters and salt-block down on your head - stone answering noise the way a rotten roof answers hail.",
          },
        ],
      },
    ],
  },
  6: {
    label: "Hidden Passage",
    hint: "older timber shoring; the mine remembers before the order.",
    description:
      "Older timber props, rough ceiling. Smell of wet wood and earth - not much chalk. Cool draft along the tunnel toward the crypt end.",
    enemies: [],
    notes:
      "R98. Era 1+2. DARK. Era 1 mine tunnel, Era 2 shortcut, exposed by collapse. No enemies. " +
      "Bypasses main stacks traffic to R100 Deep Crypt. Exit room pairs with deep crypt return to this grid id 6.",
    props: [
      {
        id: "hidden_passage_timber",
        label: "Old Timber Shoring",
        icon: "\u{1FAB5}",
        desc: "Older timber props a ceiling the order once reinforced, then forgot when the factory ate their attention. Draft pulls toward the crypt air - older, slower, almost kind.",
        gridPosition: { row: 11, col: 20 },
        onExamine: [
          { type: "set_flag", flag: "examined_r98_mine_shoring" },
          {
            type: "log",
            message:
              "A bypass around the busiest evil - if you trust wood that remembers the baron's pickaxes.",
          },
        ],
      },
    ],
  },
  8: {
    label: "Ward Antechamber",
    hint: "coldfire on bone columns before the curtain; the door is only part of the lock.",
    description:
      "Huge femurs set vertical, bound with iron and salt-glass. Bright coldfire ahead - haze at the doorway, cold on the face. Swept stone floor. Wide space before the door.",
    enemies: [],
    safeRoom: true,
    notes:
      'Staging before R99 proper. COLDFIRE implied from ward nearby. No combat here - return from Area 5 Outer Ward lands grid 8 (pair: a5_outer_ward "To Lich\'s Ward"). ' +
      "Connects stack core to R99 Lich's Ward Door. Beyond R99 → Area 5 R146 uses separate exit room (grid 12).",
    props: [
      {
        id: "ward_antechamber_columns",
        label: "Bone Column Anchors",
        icon: "\u{1F9B4}",
        desc: "Massive femurs set vertical, bound in iron and salt-glass - not decoration, structure. Beyond them, coldfire thins into a curtain you can feel on your skin. The door ahead is only part of the lock.",
        gridPosition: { row: 11, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "examined_r99_antechamber_anchors" },
          {
            type: "log",
            message:
              "Break these and every listener in the stacks hears it - force travels fast through bone and iron.",
          },
        ],
      },
    ],
  },
  14: {
    label: "Great Ward Door",
    hint: "coldfire on iron and salt-block; two armored shapes wait as if cast for this threshold alone.",
    description:
      "Massive door: salt-block and iron bands. Dark sheet across the opening - shimmer at the edges, cold. Coldfire in the seams. Metallic taste. Open floor in front - room to fight. Bone columns at the sides. Two armored shapes by the threshold.",
    enemies: ["boss_skeleton_lord", "boss_skeleton_lord"],
    isBoss: true,
    notes:
      "R99. Era 3. COLDFIRE. Massive warded door; dark energy curtain; bone column anchors. Elite Skeletons ×2 (boss_skeleton_lord). Beyond → Area 5 R146. " +
      "PROGRESSION GATE (Area 3 → 5): " +
      "(a) FORCE - kill elites; break ward by destroying column anchors (mining maul / fire): LOUD, pulls Bone Stacks aggro. " +
      "(b) KNOWLEDGE - deactivation phrase in lich correspondence (Area 2 Restricted Archive, if accessed). " +
      "(c) SALT-IRON - silent ward corrosion (e.g. material from Area 4 or R110 salt-iron dagger in Castellane's Gallery); nuanced stealth option vs force. " +
      "CONTENT ROOM - not the travel exit; use grid 12 to enter Area 5.",
    props: [
      {
        id: "lichs_ward_door",
        label: "Great Ward Door",
        icon: "\u{1F6AA}",
        desc: "Too large for humility: salt-block and iron banding, a dark curtain rippling across the threshold like heat off a forge. Beyond lies another ring of his house - colder, hungrier, meant to be seen only by the invited.",
        gridPosition: { row: 15, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "examined_r99_ward_door" },
          {
            type: "log",
            message:
              "You could answer it with steel and flame, with a word you have not earned yet, or with salt-iron that gnaws bindings without shouting - if you carry the blade from the prison gallery.",
          },
        ],
      },
      {
        id: "ward_anchor_force_break",
        label: "Ward Anchor Column",
        icon: "\u{1FA93}",
        desc: "Iron-strapped bone - a structural piece of the curtain's geometry. A mining maul could make kindling of it. Fire would do the same, slower and louder in the telling.",
        gridPosition: { row: 16, col: 10 },
        actions: [
          {
            id: "shatter_with_maul",
            label: "Shatter the anchor with the mining maul",
            desc: "Iron-strapped bone - one honest swing and the whole stack will know.",
            requires: { flags: ["has_mining_maul"] },
            effects: [
              { type: "set_flag", flag: "r99_ward_breached_force_loud" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Stone screams. Iron sings. The stacks will know something broke its rhythm.",
              },
            ],
          },
        ],
      },
      {
        id: "ward_silencing_phrase",
        label: "Curtain's Command Notch",
        icon: "\u{1F4D6}",
        desc: "A hollow carved into the jamb - sized for a spoken word, not a key. Sealed letters from the chapter's locked shelves name what belongs here - if you have read them.",
        gridPosition: { row: 15, col: 11 },
        actions: [
          {
            id: "speak_phrase",
            label: "Speak the word the sealed letters named",
            desc: "Quiet authority - the curtain folds for language, not muscle.",
            requires: { flags: ["knows_r99_ward_silencing_phrase"] },
            effects: [
              { type: "set_flag", flag: "r99_ward_breached_knowledge_quiet" },
              { type: "consume_prop" },
              {
                type: "log",
                message: "The curtain folds like embarrassed cloth. No shout - only a path.",
              },
            ],
          },
        ],
      },
      {
        id: "ward_salt_iron_work",
        label: "Salt-Iron Touchpoint",
        icon: "\u{1F52A}",
        desc: "A hairline crack in the curtain's edge - the sort of flaw salt-iron was forged to find. Silent corrosion, if you have the right blade.",
        gridPosition: { row: 16, col: 11 },
        actions: [
          {
            id: "apply_salt_iron",
            label: "Work the curtain's edge with salt-iron",
            desc: "Cold metal finds the hairline flaw; the dark thins like breath on glass.",
            requires: { flags: ["has_salt_iron_dagger"] },
            effects: [
              { type: "set_flag", flag: "r99_ward_breached_salt_iron_quiet" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "The dark thins without a scream. The bone stacks keep their old arguments - for now.",
              },
            ],
          },
        ],
      },
    ],
  },
  9: {
    label: "Back Toward the Belt-Hall",
    hint: "the roar of belts and rolling bone leaks through - the works swallowing quiet again.",
    description: "Passage slopes toward conveyor noise and warm gritty air.",
    enemies: [],
    exit: { toAreaId: "a3_sorting", toRoomGridId: 5 },
    notes: 'Return to R83. Pair: sorting "To Bone Stacks" lands grid 2 (R93).',
  },
  10: {
    label: "Passage to the Deep Crypt",
    hint: "older, slower air; names carved with care instead of tallies.",
    description:
      "Cooler slower draft. Ahead the salt-block is carved - names and lines, not tally boards.",
    enemies: [],
    exit: { toAreaId: "a3_deep_crypt", toRoomGridId: 2 },
    notes: "From R98. Pair: deep crypt exit returns bone stacks grid 6 (R98).",
  },
  11: {
    label: "Descent to the Binding Cell",
    hint: "downward damp; carved stone hums before you see salt-crystal bars or hear his voice.",
    description: "Stairs down. Damp air. Carved wards faint in the light; darker below.",
    enemies: [],
    exit: { toAreaId: "a3_vampire_prison", toRoomGridId: 2 },
    notes: "From R96 toward R106. Pair: prison exit returns stack core grid 4 (R96).",
  },
  12: {
    label: "Through the Curtain",
    hint: "cold deepens; you step as thief, heir, or something hungrier - the house does not care which story you tell.",
    description: "Cold deepens step by step through the threshold. Breath fogs.",
    enemies: [],
    exit: { toAreaId: "a5_outer_ward", toRoomGridId: 2 },
    notes:
      "Travel-only exit to Area 5 R146 Arrival Chamber (outer ward grid 2). Pair: return from Area 5 uses bone stacks grid 8 (ward antechamber), not this room.",
  },
};

export const A3_BONE_STACKS: AreaDef = {
  id: "a3_bone_stacks",
  name: "Bone Stacks",
  desc: "Bone heaped like grain in a granary - except every cartload could stand, grip steel, and march if someone gives the word.",
  difficulty: 4,
  generator: "authored",
  authored: {
    grid: A3_BONE_STACKS_GRID,
    rooms: A3_BONE_STACKS_ROOMS,
  },
  combatRooms: [],
  bossRoom: {
    label: "Great Ward Door",
    enemies: ["boss_skeleton_lord", "boss_skeleton_lord"],
    hint: "coldfire on iron and salt-block; two armored shapes wait as if cast for this threshold alone.",
  },
  notes:
    "Ossuary subarea 4: mass storage toward Area 5. Grid 8 = a5 return; grid 14 = R99 combat; grid 12 = exit to a5. " +
    "What Lies Below drift in stacks; patrols correct vectors toward R99.",
};
