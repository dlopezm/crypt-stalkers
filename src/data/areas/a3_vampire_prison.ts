import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 3 - Ossuary - Vampire's Prison (R106–R110). Grid: 2=R106 … 6=R110 gallery, 7=exit→R96 (bone stacks grid 4).
 * Binding↔cell and binding↔gallery use separate 0-cells on different rows (no merged 4–5–6 clique).
 */

// prettier-ignore
export const A3_VAMPIRE_PRISON_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 1
 [ 1, 1, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 2 exit
 [ 1, 1, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 3
 [ 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 4 exit↔approach
 [ 1, 1, 2, 2, 2, 0, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 5
 [ 1, 1, 2, 2, 2, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 6
 [ 1, 1, 2, 2, 2, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 7
 [ 1, 1, 2, 2, 2, 0, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 8 warden↔binding
 [ 1, 1, 1, 1, 1, 1, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 9
 [ 1, 1, 1, 1, 1, 1, 4, 4, 4, 0, 5, 5, 5, 5, 1, 1, 1, 1, 1], // 10 binding↔cell (one 0)
 [ 1, 1, 1, 1, 1, 1, 4, 4, 4, 1, 5, 5, 5, 5, 1, 1, 1, 1, 1], // 11
 [ 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 5, 5, 5, 5, 1, 1, 1, 1, 1], // 12 binding↔gallery (col6, not col9)
 [ 1, 1, 1, 1, 1, 1, 6, 6, 6, 1, 5, 5, 5, 5, 1, 1, 1, 1, 1], // 13
 [ 1, 1, 1, 1, 1, 1, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 14
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 15
];

export const A3_VAMPIRE_PRISON_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Prison Approach",
    hint: "pitch dark; the ghouls learn whether you dare open your lantern.",
    description:
      "Corridor drops and narrows. Pitch dark ahead unless you open a light. Damp from below. Cold wet film on the walls. Straight run - sound carries far.",
    enemies: ["ghoul", "ghoul"],
    isStart: true,
    notes:
      "R106. Era 2+3. DARK. Descending corridor; total dark. Ghouls ×2 expert ambushers. " +
      "Lantern closed → ambush; open → Ghouls revealed, flee deeper (R107 cat-and-mouse). Connects R96 stack core and R107.",
    props: [
      {
        id: "prison_approach_scratches",
        label: "Claw Marks on the Threshold",
        icon: "\u{1F5FF}",
        desc: "Something has been testing the stone for years - parallel gouges at knee height, too regular for tools. The corridor beyond is total dark; sound carries.",
        gridPosition: { row: 6, col: 3 },
        onExamine: [
          { type: "set_flag", flag: "examined_r106_prison_threshold" },
          {
            type: "log",
            message:
              "Open flame shows them; a closed shutter feeds whatever hunts by touch and patience.",
          },
        ],
      },
    ],
  },
  3: {
    label: "Warden's Post",
    hint: "abandoned gear and a log that warns you not to bargain.",
    description:
      "Widens into a guard post. Rack, stool, table scored with old marks. Rust and mildew smell. No coldfire - corners stay black past the lantern.",
    enemies: ["ghoul"],
    notes: "R107. Era 2+3. DARK. Abandoned post; Ghoul ×1 (may have fled from R106).",
    props: [
      {
        id: "warden_log_r107",
        label: "Warden's Log",
        icon: "\u{1F4D6}",
        desc: 'Pages stiff with damp, hand terse. Last legible line: "Subject continues to bargain. Do not engage." Margins repeat a warning: do not disturb the binding - as if the writer feared sympathy more than hunger.',
        gridPosition: { row: 6, col: 7 },
        onExamine: [
          { type: "set_flag", flag: "read_warden_log_castellane_r107" },
          {
            type: "log",
            message:
              "His name never appears - only warnings about bargaining and a hand that shook while it wrote.",
          },
        ],
      },
      {
        id: "holy_water_vial_r107",
        label: "Sealed Holy Water Vial",
        icon: "\u{1F4A7}",
        desc: "Ward-issue glass, wax still intact. The water inside catches no reflection - only a thin, angry clarity. It answers hunger in corpses - or in one prisoner here, if you mean to end him instead of hearing him out.",
        gridPosition: { row: 6, col: 8 },
        actions: [
          {
            id: "take",
            label: "Take the vial",
            desc: "Blessed water - a tool, a threat, or a mercy; it will not pretend which.",
            effects: [
              { type: "set_flag", flag: "has_holy_water_vial_r107" },
              { type: "grant_consumable", consumableId: "holy_water" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Glass cool against your palm. Whatever you do with it, it will not pretend neutrality.",
              },
            ],
          },
        ],
      },
      {
        id: "warden_gear_rack",
        label: "Abandoned Warden Gear",
        icon: "\u{1F6E1}\uFE0F",
        desc: "A rack of corroded vigil mail and a broken manacle key - whoever worked here left in a hurry, or was pulled.",
        gridPosition: { row: 5, col: 7 },
        onExamine: [
          { type: "set_flag", flag: "examined_r107_warden_gear" },
          {
            type: "log",
            message: "Post abandoned; binding still humming below.",
          },
        ],
      },
    ],
  },
  4: {
    label: "Binding Hall",
    hint: "vigil wards braided with another script; the stone hums like a held breath.",
    description:
      "Chamber walls carved twice - vigil text, then another script over it. Low hum felt in the teeth and jaw more than heard. Floor worn smooth in a ring - no center marker.",
    enemies: [],
    notes:
      "R108. Era 2+3. DARK. Surrounds the cell. " +
      "Freeing Castellane requires Area 2 library context + these inscriptions + counter-ritual (e.g. R105 circle or holy relic). Room hums with contained power. Connects R107, R109 The Cell, R110 Castellane's Gallery.",
    props: [
      {
        id: "binding_hall_inscriptions",
        label: "Layered Binding Inscriptions",
        icon: "\u{1F58B}\uFE0F",
        desc: "Vigil prayers braided into a second script - the same wall carved twice, in two kinds of hunger. The stone hums against your palm; power held in check, impatient. To break what they built together you would need whatever the chapter locked away for reading alongside these letters, and a rite woken in the deep crypt - circle or pendant, authority with teeth.",
        gridPosition: { row: 9, col: 7 },
        onExamine: [
          { type: "set_flag", flag: "read_binding_hall_inscriptions_r108" },
          { type: "set_flag", flag: "binding_knowledge" },
          {
            type: "log",
            message:
              "The vigil built the cage; the necromancer only riveted it tighter - different hungers, one door.",
          },
        ],
      },
    ],
  },
  5: {
    label: "The Cell",
    hint: "salt-crystal bars; something ancient listens for your pulse.",
    description:
      "Cell off the binding hall. Salt-crystal bars with iron through them - facets flash in your light. Black inside beyond the bars. Cold comes through the lattice. Air still and heavy.",
    enemies: ["boss_vampire_lord"],
    isBoss: true,
    notes:
      "R109. Era 2+3. DARK. Lord Castellane (Vampire) - NPC/boss_vampire_lord: ancient, gaunt, magnetic. Predation without ledger column for virtue. " +
      "TALK: each conversation costs 2 HP, +1 HP per subsequent visit; feeds by proximity; information true, self-serving (lich weaknesses, early order, pre-order mine, deep presence). " +
      'FREE: binding knowledge + counter-ritual → alliance vs lich; price after lich falls Castellane feeds on surface - "Not your town. Someone else\'s." Same pattern as the mine. ' +
      "BARGAIN: pay HP for targeted intel without freeing - no lich-alliance unlock; remains bound. " +
      "DESTROY: CONSECRATION + fire + holy water (R107) → Castellane's signet ring (strong accessory); no ally, no surface predator from this source. " +
      "IGNORE: never free, never destroy, minimal contact - no ally, no ring, remains bound. " +
      "Vampire's Bargain: powerful ally at someone else's expense - mirrors greed theme.",
    props: [
      {
        id: "castellane_cell_bars",
        label: "Salt-Crystal Bars",
        icon: "\u{1F532}",
        desc: "Bars grown like jealous geode, iron threaded through, necromantic seals black as oil between the facets. Air moves wrong on your skin - containment made tactile.",
        gridPosition: { row: 11, col: 11 },
        onExamine: [
          { type: "set_flag", flag: "examined_castellane_cell_bars_r109" },
          {
            type: "log",
            message:
              "Whatever stands behind this was caged - not catalogued. The bars hate him less than he hates being counted.",
          },
        ],
      },
      {
        id: "lord_castellane",
        label: "Lord Castellane",
        icon: "\u{1F9DB}",
        desc: 'Ancient, gaunt - the sort of beauty that makes your throat tighten before your mind names why. He does not dress hunger as duty. When you approach, his head lifts as if scenting weather. "A living heart. I can hear it from here."',
        gridPosition: { row: 11, col: 12 },
        actions: [
          {
            id: "parley",
            label: "Listen through the bars",
            desc: "Every word steals warmth through your ribs - nearness feeds him like a slow sip.",
            effects: [
              { type: "damage_player", amount: 2 },
              { type: "set_flag", flag: "castellane_parley_r109" },
              {
                type: "log",
                message:
                  'He speaks softly; each word takes a little warmth from your chest. "Your great-grandfather tried to deal with me. I said no. He died in the collapse. I wonder if you\'ll make better deals."',
              },
            ],
          },
          {
            id: "hear_bargain_terms",
            label: "Ask what freedom would cost",
            desc: "You lean closer; the cold deepens - he names terms while your pulse answers.",
            requires: { flags: ["castellane_parley_r109"] },
            effects: [
              { type: "damage_player", amount: 3 },
              { type: "set_flag", flag: "castellane_bargain_terms_heard" },
              { type: "grant_ability", abilityId: "counter_stance" },
              {
                type: "log",
                message:
                  '"I know how to hurt him - the thing that thinks he owns every vow beneath your feet. Free me with the right rite, and I will stand beside you until he falls. After? I feed where I please. Not your town. Someone else\'s. The mine always ran on that arithmetic."',
              },
            ],
          },
          {
            id: "destroy_castellane_rite",
            label: "Attempt the destruction rite",
            desc: "Flame, the vow you woke under the founding tombs, and the warden's blessed water - finish him; what remains is metal and silence.",
            requires: {
              flags: ["consecration_rite_performed_r105", "has_holy_water_vial_r107"],
            },
            effects: [
              { type: "set_flag", flag: "castellane_destroyed_r109" },
              { type: "set_flag", flag: "has_castellane_signet_ring" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Fire, prayer, and blessed water meet flesh older than your line. When the smoke thins, a ring rolls warm against your boot - heavy gold, his seal cut deep. No voice behind the bars now. No ally - only cold metal and the quiet you bought with mercy refused.",
              },
            ],
          },
        ],
      },
    ],
  },
  6: {
    label: "Castellane's Gallery",
    hint: "old coins and a salt-iron blade within reach of the cell.",
    description:
      "Small side room next to the binding hall. Shallow wall shelves. Drier air - metal and old cloth smell, less damp than the corridor. Coins, trinkets, wrapped blade on hooks. Stone scuffed at shelf height.",
    enemies: [],
    notes: "R110. Era 2. DARK. Adjacent chamber. Dead end off binding hall.",
    props: [
      {
        id: "castellane_personal_effects",
        label: "Trinket Shelves",
        icon: "\u{1F4FF}",
        desc: "Coins from dead favors, rings without owners, a ribbon that remembered a color once. Castellane could not reach these from the cell - but his bargains touched everyone who left gifts.",
        gridPosition: { row: 13, col: 6 },
        onExamine: [
          { type: "set_flag", flag: "examined_castellane_gallery_trinkets_r110" },
          {
            type: "log",
            message: "Greed in miniature: payment stacked where only memory visits.",
          },
        ],
      },
      {
        id: "salt_iron_dagger_r110",
        label: "Salt-Iron Dagger",
        icon: "\u{1F52A}",
        desc: "Blade folded with salt-iron veins - cold even through the wrap. It hung within reach of the binding hall, as if someone wanted insurance against corpse-servants and hungrier guests alike. The great curtain-door in the bone-mountains answers to this metal with a quiet gnawing no hammer mimics.",
        gridPosition: { row: 13, col: 7 },
        actions: [
          {
            id: "take",
            label: "Take the salt-iron dagger",
            desc: "Practical weight - chill, honest, meant for work that must stay quiet.",
            effects: [
              { type: "set_flag", flag: "has_salt_iron_dagger" },
              { type: "consume_prop" },
              {
                type: "log",
                message: "The hilt threads your fingers like it was waiting.",
              },
            ],
          },
        ],
      },
      {
        id: "castellane_old_coins_r110",
        label: "Chest of Old Coin",
        icon: "\u{1FA99}",
        desc: "Forty gold in denominations no mint still honors - soft edges, faces worn smooth. Money that outlived every issuer.",
        gridPosition: { row: 14, col: 7 },
        actions: [
          {
            id: "take",
            label: "Sweep the coins into your pack",
            desc: "Soft old money - edges worn smooth by hands long dead.",
            effects: [
              { type: "grant_salt", amount: 40 },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Forty pieces in dead mints - they spend as well as any coin, and ask no questions of the hand.",
              },
            ],
          },
        ],
      },
    ],
  },
  7: {
    label: "Back Toward the Stack Core",
    hint: "climb toward heaped bone and the clerks' chalk-mountains.",
    description:
      "Stairs up. Dryer grit underfoot. Chalk haze. Distant rumble from the stacks above.",
    enemies: [],
    exit: { toAreaId: "a3_bone_stacks", toRoomGridId: 4 },
    notes:
      'Return to R96 Stack Core (bone stacks grid 4). Pair: bone stacks "To Vampire\'s Prison" lands grid 2 (R106).',
  },
};

export const A3_VAMPIRE_PRISON: AreaDef = {
  id: "a3_vampire_prison",
  name: "Vampire's Prison",
  desc: "Salt-crystal bars and a lord who names his hunger - every conversation takes warmth; every promise sounds like the mine's old arithmetic in miniature.",
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
  notes:
    "Ossuary subarea 6: Castellane, salt-iron dagger for R99, Vampire's Bargain as greed-in-miniature.",
};
