import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 3 - Ossuary - Sorting Halls (R80–R86). Grid: 2=R80 hub, 3=R81, 4=R82, 5=R83, 6=R84, 7=R85, 8=R86.
 * Exits: 11→threshold R79 (grid 5), 12→reanimation (grid 2), 13→bone stacks R93 (grid 2).
 */

// prettier-ignore
export const A3_SORTING_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 1
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 13, 13, 13, 1, 1, 1, 1, 1, 1], // 2 exit→bone stacks
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 13, 13, 13, 1, 1, 1, 1, 1, 1], // 3
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 4 R13↔vertical shaft
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 5 R81
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 6
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 7
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 8 R81↔R80 (col 12) + shaft
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 9
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 5, 5, 5, 5, 5, 0, 6, 6, 6, 1], // 10 hub north stub for R81 shaft
 [ 1, 1, 11, 11, 0, 4, 4, 4, 0, 2, 2, 2, 2, 2, 2, 2, 0, 5, 5, 5, 5, 5, 1, 6, 6, 6, 1], // 11
 [ 1, 1, 11, 11, 1, 4, 4, 4, 1, 2, 2, 2, 2, 2, 2, 2, 1, 5, 5, 5, 5, 5, 1, 6, 6, 6, 1], // 12
 [ 1, 1, 1, 1, 1, 4, 4, 4, 1, 2, 2, 2, 2, 2, 2, 2, 1, 5, 5, 5, 5, 5, 1, 6, 6, 6, 1], // 13
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1], // 14
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 15 R80↔R85
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 16
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 17
 [ 1, 1, 1, 1, 1, 1, 1, 1, 12, 0, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 18 exit reanim↔R85
 [ 1, 1, 1, 1, 1, 1, 1, 1, 12, 12, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 19
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 20 R85↔R86
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 8, 8, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 21
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 8, 8, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 22
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 23
];

export const A3_SORTING_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Sorting Gallery",
    hint: "a floor of bone and moving shadow; something on a raised platform shouts until the dead obey.",
    description:
      "Huge hall. Bone heaped in ridges along the floor. Conveyors run the length - steady rattle and grind. Ceiling lost in dark. Chalk dust in the air. Your light catches tally marks and wire until the distance swallows it.",
    enemies: [
      "skeleton",
      "skeleton",
      "skeleton",
      "zombie",
      "zombie",
      "zombie",
      "zombie",
      "necromancer",
      "forsworn",
    ],
    isStart: true,
    isBoss: true,
    notes:
      "R80. Era 3. DARK. Vast room: bone conveyors, sorting lines; zombies sort by type, skeletons in aisles, necromancer ×1 on raised platform, forsworn ×1 - factory thesis, first full throughput hit. " +
      "Skeletons ×3, zombies ×4, necromancer ×1, forsworn ×1. Occasional zombie drifts toward R83 / deeper egress until necromancer snaps orders (What Lies Below drift). " +
      "Teaching: kill necromancer first (e.g. crossbow) → zombies inert; hierarchy. Platform = back-row target; ranged optimal. " +
      "Noise masks movement and ghoul footsteps in conveyor hall. Environmental thread: dead pulled downward; necromancers redirect labor.",
    props: [
      {
        id: "sorting_platform_ledger",
        label: "Spilled Tally Slate",
        icon: "\u{1F4DD}",
        desc: 'A chalk-smeared board slid partway off the overseer\'s platform. Columns of tallies: femurs, ribs, "ungraded - redirect." A shout from above still fits the rhythm of the numbers - as if the count itself were a whip.',
        gridPosition: { row: 12, col: 12 },
        onExamine: [
          { type: "set_flag", flag: "read_sorting_platform_tally_r80" },
          {
            type: "log",
            message:
              "Figures in chalk - femurs, ribs, a column for what they could not sort. Someone here weighed grief and called it a shift.",
          },
        ],
      },
    ],
  },
  3: {
    label: "Tag Station",
    hint: "shelves of tags whisper names you were never meant to read here.",
    description:
      "Small room off the main gallery. Shelves of bone tags floor to ceiling - wire, brown ink, salt labels. Smell of ink, rust, old paper. The floor hums with the belts through the wall.",
    enemies: ["zombie", "zombie"],
    notes:
      "R81. Era 3. DARK. Small inscription room; shelves of bone tags (names, dates, origins). Zombies ×2. " +
      "The greed frame: player's ancestor was indentured (contracts Area 1 R4); died in collapse; recovery crews claimed remains for processing - three eras' greed billed to one body; they chose none of it. " +
      "Bones likely in R95/R96, still in the machine. High impact, minimal combat; the tag is the scene.",
    props: [
      {
        id: "ancestor_bone_tag",
        label: "Tagged Bone Bundle",
        icon: "\u{1F3F7}\uFE0F",
        desc: "Among hundreds of wire-tied tags, one bundle sits forward as if recently handled. The card is stamped in clerk-hand: ASHVERE - recovered from collapse gallery - processed (the date smeared by damp). The bones beneath are not yours to lift, but the letters are - your name, pressed into pulp like a receipt.",
        gridPosition: { row: 6, col: 13 },
        actions: [
          {
            id: "take_tag",
            label: "Slip the tag into your belt",
            desc: "Paper, wire, proof you can touch - Ashvere, filed beside strangers.",
            effects: [
              { type: "set_flag", flag: "has_ancestor_bone_tag_ashvere" },
              { type: "set_flag", flag: "read_ancestor_bone_tag_r81" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Paper and wire bite your belt. Indenture, collapse, then this - every hand that used your kin called it duty, ledger, or God's patience.",
              },
            ],
          },
        ],
        onExamine: [
          { type: "set_flag", flag: "read_ancestor_bone_tag_r81" },
          {
            type: "log",
            message:
              "The thought rises without permission: they are still using my blood. Your jaw locks. Saying it aloud would sound like a gift to whatever owns this place.",
          },
        ],
      },
      {
        id: "tag_station_shelves",
        label: "Shelves of Bone Tags",
        icon: "\u{1F4DA}",
        desc: "Wire, salt-crystal labels, ink gone brown. Names, dates, origins - a bureaucracy of the dead stretching farther than your light.",
        gridPosition: { row: 5, col: 12 },
        onExamine: [
          { type: "set_flag", flag: "examined_r81_tag_shelves" },
          {
            type: "log",
            message:
              "Thousands of names in wire and brown ink. The vigil spoke them at burial once; down here they are sorted like ore grades.",
          },
        ],
      },
    ],
  },
  4: {
    label: "Classification Room",
    hint: "graded piles; the dark between them has teeth if you shut the light.",
    description:
      "Narrow aisles between sorted bone piles. Dry mineral smell, faint butcher-salt edge. Deep gaps between heaps - light does not reach the back. Cool still air.",
    enemies: ["ghoul"],
    notes:
      "R82. Era 3. DARK. Bone quality classification - grading the taken. Ghoul ×1 hidden on entry if lantern shut / no true light (ambush); open lantern → visible crouched behind bone pile.",
    props: [
      {
        id: "classification_manual_r82",
        label: "Classification Manual",
        icon: "\u{1F4D8}",
        desc: 'A binder chained to a grading desk. A steady margin-hand counts density, maps fractures, sets "acceptable residue" limits. The vigil\'s old prayers are scratched through and replaced with yield percentages - ore-talk applied to ribs.',
        gridPosition: { row: 12, col: 6 },
        onExamine: [
          { type: "set_flag", flag: "read_bone_classification_manual_r82" },
          {
            type: "log",
            message: "They grade the taken the way a mill grades grain.",
          },
        ],
      },
      {
        id: "bone_meal_sack_r82",
        label: "Sack of Bone Meal",
        icon: "\u{1F9F2}",
        desc: "Fine powder ground from unsuitable fragments - pale as flour, wrong on the tongue even through the cloth. You know enough of trade and apothecary talk to guess who would pay dearly for a sack like this.",
        gridPosition: { row: 12, col: 5 },
        actions: [
          {
            id: "take",
            label: "Bag the bone meal",
            desc: "Tie off the sack before the dust finds your throat.",
            effects: [
              { type: "set_flag", flag: "has_bone_meal_alchemy_r82" },
              { type: "consume_prop" },
              {
                type: "log",
                message: "The sack is heavier than it looks. Dust creeps through the weave.",
              },
            ],
          },
        ],
      },
    ],
  },
  5: {
    label: "Conveyor Hall",
    hint: "a long run of track and rattle; noise swallows smaller sounds.",
    description:
      "Long corridor. Conveyor track the whole way - cages and bone loads jerking along. Loud: motor warmth, metal grind, bone ticking on rollers. Floor shakes underfoot.",
    enemies: ["skeleton", "skeleton", "zombie", "zombie", "zombie"],
    notes:
      "R83. Era 3. DARK. Long corridor; bone conveyors full length; zombies feed lines; skeletons escort. Skeletons ×2, zombies ×3. " +
      "Noise masks movement and ghoul footsteps. Drift: skeleton may linger at R93 mouth before patrol snaps into route. " +
      "Connects to R80, R84 (rejection heap), reanimation wing (R87).",
    props: [
      {
        id: "conveyor_bone_line_r83",
        label: "Bone Conveyor",
        icon: "\u{2699}\uFE0F",
        desc: "Track and rattle without end. Cages of femurs and ribs ride toward sorting, toward circles, toward whatever opens when the line stops. The noise is a curtain - it swallows smaller sounds whole.",
        gridPosition: { row: 12, col: 19 },
        onExamine: [
          { type: "set_flag", flag: "examined_r83_conveyor" },
          { type: "grant_ability", abilityId: "stealth" },
          {
            type: "log",
            message: "You could move under this roar in ways you could not in silence.",
          },
        ],
      },
    ],
  },
  6: {
    label: "Rejection Heap",
    hint: "refuse and rats; something larger hunts the edges.",
    description:
      "Rejected bone piled overhead in splintered heaps. Floor thick with crushed fragments - yields underfoot. Heavy sweet rot under chalk. Scratching past the light - rats.",
    enemies: ["rat", "rat", "rat", "rat", "rat", "rat", "ghoul"],
    notes:
      "R84. Era 3. DARK. Discard pile of damaged/unsuitable bone - waste from the efficient line. Rats ×6, ghoul ×1 at edges. Stench implied. Dead end off R83.",
    props: [
      {
        id: "rejection_heap_gold",
        label: "Buried Coin Clump",
        icon: "\u{1FA99}",
        desc: "Something glints between splintered ribs and swept dust - not bone. A fist of coins pressed into the refuse as if hidden in haste.",
        gridPosition: { row: 11, col: 24 },
        actions: [
          {
            id: "dig_out",
            label: "Work the coins free",
            desc: "Cold metal between splinters - someone's hidden purse, or someone's last bribe.",
            effects: [
              { type: "grant_salt", amount: 12 },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Twelve pieces - cold, crusted with marrow-dust, still spending after whoever hid them stopped needing money.",
              },
            ],
          },
        ],
      },
      {
        id: "bone_shards_distraction",
        label: "Loose Bone Shards",
        icon: "\u{1F9B4}",
        desc: "Splinters and knobs split from the reject pile - light enough to skitter across stone, loud enough to pull an eye.",
        gridPosition: { row: 11, col: 25 },
        actions: [
          {
            id: "gather",
            label: "Gather throwable shards",
            desc: "Splinters that skitter loud - enough to pull an eye from your throat.",
            effects: [
              { type: "set_flag", flag: "has_bone_shard_distractions_r84" },
              { type: "consume_prop" },
              {
                type: "log",
                message: "A handful of distractions. The rats watch you like creditors.",
              },
            ],
          },
        ],
      },
    ],
  },
  7: {
    label: "Foreman's Post",
    hint: "coldfire over quotas and a resonator that hums wrong.",
    description:
      "Room brighter than the belt hall - coldfire. Desks, stacked slates, quota papers. Green-white light. Low hum in the stone; buzz in your teeth and chest.",
    enemies: ["necromancer", "zombie", "zombie"],
    notes:
      "R85. Era 3. COLDFIRE (brighter). Overseer's desk; processing quotas; bone resonator links toward Area 2 Chapter House (R56). Necromancer ×1, zombies ×2. " +
      "Logs: redirected labor - workers lost to downward tendency, quotas adjusted.",
    props: [
      {
        id: "foreman_quota_logs_r85",
        label: "Quota Ledgers",
        icon: "\u{1F4C4}",
        desc: 'Desk stacks of figures: output per shift, "loss to downward tendency," lines scratched and rewritten. Someone is fighting gravity with arithmetic. A margin begs the east corridor for more hands - and notes, in a tighter hand, that the chapter\'s hall answers with a hum through the stone when the line stutters.',
        gridPosition: { row: 17, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "read_foreman_quota_logs_r85" },
          {
            type: "log",
            message: "The dead drift down; the living managers adjust the columns.",
          },
        ],
      },
      {
        id: "bone_resonator_r85",
        label: "Bone Resonator",
        icon: "\u{1F50A}",
        desc: "A salt-iron frame around a tuned column of femurs - not decoration. It thrums on a frequency that makes your teeth itch. When the belts miss a beat, this thing carries the complaint through rock toward the brothers' hall above.",
        gridPosition: { row: 18, col: 11 },
        actions: [
          {
            id: "smash_resonator",
            label: "Destroy the resonator",
            desc: "Iron and bone - if it breaks, the warning walks instead of runs.",
            effects: [
              { type: "set_flag", flag: "bone_resonator_destroyed_r85" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Bone and iron crack. The hum dies. Alerts from this hall will crawl instead of run - for a while.",
              },
            ],
          },
        ],
      },
      {
        id: "foreman_coin_box_r85",
        label: "Locked Cash Box",
        icon: "\u{1F4B0}",
        desc: "Iron-banded, key missing - the hasp is pried just enough to wedge fingers. Inside: overseer's skim or legitimate pay; either way, it jingles.",
        gridPosition: { row: 17, col: 11 },
        actions: [
          {
            id: "take_gold",
            label: "Pry out the coins",
            desc: "Skim or wage - metal that jingles the same either way.",
            effects: [
              { type: "grant_salt", amount: 18 },
              { type: "consume_prop" },
              {
                type: "log",
                message: "Eighteen pieces - enough to shame whoever left the box half-open.",
              },
            ],
          },
        ],
      },
    ],
  },
  8: {
    label: "Side Processing",
    hint: "damp warmth; wrong motion in the host corpse.",
    description:
      "Side room. Warm wet air. Chemical sting in the throat. Beads on the salt-block walls. Floor slightly tacky under the boots.",
    enemies: ["zombie", "gutborn_larva", "gutborn_larva"],
    notes:
      "R86. Era 3. DARK. Gutborn-infested zombie host (enemy type gutborn not in data - represented as zombie + gutborn_larva ×2). Wrong movement; larvae on floor seeking hosts; warm damp. " +
      "Larvae redirect: lure larva to necromancer (e.g. R85) → infected necromancer becomes gutborn, loses command, zombies inert (high risk). Larva on player lethal if unseen.",
    props: [
      {
        id: "infestation_clipboard_r86",
        label: "Stained Field Notes",
        icon: "\u{1F4C3}",
        desc: 'Pages glued with damp: sketches of larval curves, warnings about "host proximity," a stamp from the circle-halls where they wake bone to work. Someone knew what crawled here before the room was sealed with prayer and neglect.',
        gridPosition: { row: 21, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "read_gutborn_infestation_notes_r86" },
          {
            type: "log",
            message: "Exploitation down to the cell - written in ink that smears like mucus.",
          },
        ],
      },
    ],
  },
  11: {
    label: "Stairs Toward the Crypt Mouth",
    hint: "steps climb; the roar of belts thins until you hear only your own breath and the arch's motto.",
    description: "Stairs up. Belt noise thins overhead.",
    enemies: [],
    exit: { toAreaId: "a3_threshold", toRoomGridId: 5 },
    notes:
      "Return to R79 Descent Steps (threshold grid 5). Pair: threshold exit to sorting lands grid 2 (R80).",
  },
  12: {
    label: "Passage to the Circle-Halls",
    hint: "coldfire leaks from ahead; the air tastes of salt-ash and something pulled taut like string through marrow.",
    description: "Coldfire glow ahead. Draft sharp with salt-ash and hot metal.",
    enemies: [],
    exit: { toAreaId: "a3_reanimation", toRoomGridId: 2 },
    notes:
      "To R87 Ritual Circle Alpha. Pair: reanimation exit returns conveyor R83 (sorting grid 5).",
  },
  13: {
    label: "Into the Bone-Mountains",
    hint: "ceilings lower over heaped remains; cart ruts bite the floor like old teeth.",
    description: "Passage narrows. Lower ceiling, bone heaps close. Deep cart ruts in the dust.",
    enemies: [],
    exit: { toAreaId: "a3_bone_stacks", toRoomGridId: 2 },
    notes: "To R93 Stack Entrance. Pair: bone stacks exit to conveyor returns sorting grid 5.",
  },
};

export const A3_SORTING: AreaDef = {
  id: "a3_sorting",
  name: "Sorting Halls",
  desc: "Belts, tallies, and wire-tied names - the place where the dead are weighed like cargo and your family name can turn up on a card.",
  difficulty: 3,
  generator: "authored",
  authored: {
    grid: A3_SORTING_GRID,
    rooms: A3_SORTING_ROOMS,
  },
  combatRooms: [],
  bossRoom: {
    label: "Sorting Gallery",
    enemies: [
      "skeleton",
      "skeleton",
      "skeleton",
      "zombie",
      "zombie",
      "zombie",
      "zombie",
      "necromancer",
      "forsworn",
    ],
    hint: "a floor of bone and moving shadow; something on a raised platform shouts until the dead obey.",
  },
  notes:
    "Ossuary subarea 2: industrial bone processing; lantern-shutter rhythm vs patrols. " +
    "Environmental drift toward lower exits; necromancers snap workers back on task.",
};
