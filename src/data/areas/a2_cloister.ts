import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 2 - The Sanctified Galleries - The Cloister (R30–R36)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * Connectivity (design doc):
 *  exit9 ↔ R30 ↔ R31 ↔ R32 ↔ R33 ↔ R34(secret)
 *  R31 ↔ R35 ↔ R36(dead end)
 *  R31 ↔ exits chapel, library, chapter, maintenance(common), R35 ↔ exit kitchen
 *
 * R30 only meets R31 (one corridor component). R31 branches use separate 0-components.
 */

// prettier-ignore
export const A2_CLOISTER_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
 [ 1, 1, 1, 1, 1, 1, 1, 1, 9, 9, 1, 11, 11, 1, 12, 12, 1, 13, 13, 1, 10, 10, 1, 1, 1, 1], // 1
 [ 1, 1, 1, 1, 1, 1, 1, 1, 9, 9, 1, 11, 11, 1, 12, 12, 1, 13, 13, 1, 10, 10, 1, 1, 1, 1], // 2
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1], // 3
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1], // 4
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1], // 5
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1], // 6
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1], // 7
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1], // 8
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1], // 9
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1], // 10
 [ 1, 1, 1, 2, 2, 2, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 4, 4, 4], // 11 R30|0|R31|0|R32
 [ 1, 1, 1, 2, 2, 2, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 4, 4, 4], // 12
 [ 1, 1, 1, 2, 2, 2, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 4, 4, 4], // 13
 [ 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 4, 4, 4], // 14 R31↔R35
 [ 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 0, 6, 6, 6, 6, 6, 6, 1, 1, 1, 1, 4, 4, 4], // 15
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 6, 6, 6, 6, 6, 6, 0, 14, 14, 1, 4, 4, 4], // 16 R35↔exit14
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 14, 14, 1, 0, 0, 0], // 17 R35↔R36 + R32↔R33 (separate components)
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5], // 18 R35↔R36
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 8, 8, 8, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5], // 19
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 8, 8, 8, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5], // 20
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0], // 21 R33↔R34
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 7], // 22
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 7], // 23
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 24
];

export const A2_CLOISTER_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Entrance Hall",
    hint: "arched vault under coldfire; salt-block gleam and old stone cracked where someone traced the letters.",
    description:
      "Big arched hall. Polished salt-block floor and walls; green coldfire in strips along the crown. " +
      "Rougher older stone shows at the arch foot. Cold air. Footsteps ring then flatten.",
    enemies: ["zombie", "zombie"],
    isStart: true,
    notes:
      "R30. COLDFIRE. Era 2+3. Room design ref R30. " +
      "First room past Inner Gate (Area 1 R17). Arched Era 2 ceiling; coldfire strips along crown. " +
      "Two zombies sweep polished salt-block floor in slow circles - echo of obedience. Cracked stone. " +
      "Connects: Area 1 Inner Gate / R17 (via exit grid 9), R31 only - not a hub to chapel/library/chapter (those branch from R31). " +
      "Cross-ref: R37 chapel entrance, R43 library entrance via R31. " +
      "Teaching: coldfire halls; degraded monastic routine vs cultist-maintained fiction.",
    props: [
      {
        id: "order_welcome_plaque",
        label: "Order Welcome Plaque",
        icon: "\u{1F4DC}",
        desc: "Polished salt-block mounted beside the arch: the order's formal greeting to visitors and novices alike. The corners are chipped; the script is still proud.",
        gridPosition: { row: 12, col: 4 },
        onExamine: [
          { type: "set_flag", flag: "read_order_welcome_plaque" },
          {
            type: "log",
            message:
              "The Pale Vigil welcomes those who enter in silence. Service, it says, is the price of the light they sell.",
          },
        ],
      },
      {
        id: "entrance_inscription",
        label: "Cracked Inscription",
        icon: "\u{1F5FF}",
        desc: "Carved into cracked stone at eye level, letters half-filled with salt dust. Someone traced the grooves recently - living fingers, not undead habit.",
        gridPosition: { row: 11, col: 4 },
        onExamine: [
          { type: "set_flag", flag: "read_r30_entrance_inscription" },
          {
            type: "log",
            message:
              "Enter in silence, leave in service. The vow outlasted the people who carved it.",
          },
        ],
      },
    ],
  },
  3: {
    label: "Common Room",
    hint: "stone benches; three dead sit with empty bowls like they're still owed supper from a kitchen that forgot them.",
    description:
      "Large room. Stone benches along the walls. Bright coldfire on pale salt-block. " +
      "Faint cooked-onion and incense smell. Carved rope pattern on the vault.",
    enemies: ["zombie", "zombie", "zombie"],
    notes:
      "R31. COLDFIRE. Era 2+3. Room design ref R31. " +
      "Large communal hall, stone benches. Three zombies sit with empty bowls; a cultist spoons nothing into them - kindness toward things that cannot hunger. " +
      "Enemy note: cultist ×1 not in engine enemy list - add when cultist type exists. " +
      "Connects: R30, R32 novice dorm, R35 refectory, R62 service corridor (maintenance exit), transit to chapel / library / chapter / upper galleries. " +
      "Area theme (Area 2): cost of greed - greed of authority; threat inflated, ignorance enforced, revenue over wards.",
    props: [
      {
        id: "wall_niche_coin",
        label: "Wall Niche",
        icon: "\u{1FA99}",
        desc: "A shallow niche behind a loose salt-slab, finger-smoothed from years of hiding small things. Coins glint at the back - someone’s rainy-day hoard, never reclaimed.",
        gridPosition: { row: 12, col: 14 },
        actions: [
          {
            id: "take",
            label: "Take the coins",
            effects: [
              { type: "grant_salt", amount: 12 },
              { type: "consume_prop" },
              { type: "log", message: "12 salt. The niche gapes empty." },
            ],
          },
        ],
      },
      {
        id: "cultist_journal",
        label: "Cultist's Journal",
        icon: "\u{1F4D6}",
        desc: "A thin booklet wedged under a bench, cover stained with oil and wax. The hand shifts from eager to numb across the pages.",
        gridPosition: { row: 13, col: 18 },
        onExamine: [
          { type: "set_flag", flag: "read_cultist_journal_r31" },
          {
            type: "log",
            message:
              "Joining brought relief - food, shelter, purpose. Then the first night below. Then orders that did not bear daylight. The last entries are lists of names crossed out.",
          },
        ],
      },
    ],
  },
  4: {
    label: "Novice Dormitory",
    hint: "long rows of stone bed-frames; rats nest in rotted bedding and salt-eaten cubbies.",
    description:
      "Long low dorm. Rows of stone bed-frames; hollowed wall cubbies. Almost no light except spill from the door. " +
      "Salt grit on the floor. Stale sweat and rotting wood smell.",
    enemies: ["rat", "rat", "rat"],
    notes:
      "R32. DARK. Era 2. Room design ref R32. " +
      "Long barracks: stone bed-frames, rotted bedding gone. Wall cubbies - corroded trinkets, austerity in salt air. Rats in debris. " +
      "Connects: R31, R33 knight's quarters.",
    props: [
      {
        id: "novice_hidden_journal",
        label: "Hidden Journal",
        icon: "\u{1F4D5}",
        desc: "Pried from beneath a bed-slat, boards splintered by salt. A novice's cramped hand: chores, hymns, who may speak in hall and who may not.",
        gridPosition: { row: 12, col: 24 },
        onExamine: [
          { type: "set_flag", flag: "read_novice_journal_r32" },
          {
            type: "log",
            message:
              "They wrote about singing until their throats gave out - and about seniors who smiled when the weak fell silent. Hierarchy, dressed as holiness.",
          },
        ],
      },
      {
        id: "prayer_beads",
        label: "Corroded Prayer Beads",
        icon: "\u{1F4FF}",
        desc: "A string of beads green with salt corrosion, caught in a cubby with a scrap of cord. Whatever blessing they held has leached into the stone.",
        gridPosition: { row: 11, col: 24 },
        actions: [
          {
            id: "take",
            label: "Pocket the beads",
            effects: [
              { type: "grant_salt", amount: 3 },
              { type: "consume_prop" },
              { type: "log", message: "A few beads still trade as oddities. 3 salt worth." },
            ],
          },
        ],
      },
    ],
  },
  5: {
    label: "Knight's Quarters",
    hint: "warmer stone than the novices' barracks; wax and ash crawl one wall toward a faceless robed sketch.",
    description:
      "Same layout as the novice dorm but kept up: doors that shut, plaster patches. Slightly less damp on the skin. " +
      "More coldfire than next door. Wax dripped down one wall in thick streaks.",
    enemies: ["zombie", "zombie"],
    notes:
      "R33. COLDFIRE. Era 2+3. Room design ref R33. " +
      "Better rooms, working doors. Cultist billet: surface clothes, dried food, child's drawing. Makeshift lich shrine - belief made visible. " +
      "Enemy note: cultists ×2 not in engine list - zombies as stand-in until cultist type. " +
      "Connects: R32, R34 hidden cell (secret panel).",
    props: [
      {
        id: "knights_stash_gold",
        label: "Footlocker Stash",
        icon: "\u{1FA99}",
        desc: "A cultist's footlocker, lid warped but still locked by a twist of wire. Inside: coin stacked with the neatness of someone who still believed they'd leave.",
        gridPosition: { row: 19, col: 14 },
        actions: [
          {
            id: "take",
            label: "Take the coin",
            effects: [
              { type: "grant_salt", amount: 25 },
              { type: "consume_prop" },
              { type: "log", message: "25 salt. The locker smells of sweat and incense." },
            ],
          },
        ],
      },
      {
        id: "dried_food_rations",
        label: "Dried Provisions",
        icon: "\u{1F35E}",
        desc: "Sacks and waxed bundles in the corner - surface fare, hoarded against shifts below. Hard as bark but still clean.",
        gridPosition: { row: 20, col: 13 },
        actions: [
          {
            id: "eat",
            label: "Eat a little",
            effects: [
              { type: "heal_player", amount: 4 },
              { type: "consume_prop" },
              {
                type: "log",
                message: "Dry salt-fish and hard bread. Your stomach remembers what hunger is not.",
              },
            ],
          },
        ],
      },
      {
        id: "lich_shrine_r33",
        label: "Makeshift Lich Shrine",
        icon: "\u{1F56F}\uFE0F",
        desc: "Wax drippings crawl down the wall in frozen rivers. A sketch of a robed figure without a face, ringed by offerings: teeth, coins, a child's drawing of a house.",
        gridPosition: { row: 19, col: 15 },
        onExamine: [
          { type: "set_flag", flag: "read_lich_shrine_r33" },
          {
            type: "log",
            message:
              "Wax, teeth, coin, a child's house - desperation stacked like offerings. They pray upward to something that does not breathe.",
          },
        ],
      },
    ],
  },
  6: {
    label: "Refectory",
    hint: "long salt tables; zombies circuit trays in a loop. a matins bell ticks where only the living would hear.",
    description:
      "Very long hall. Salt-stone tables end to end. High vault; every scrape bounces back loud. " +
      "Coldfire on chains. A brass bell over the head table ticks steady. Dust and old grease. No food cooking.",
    enemies: ["zombie", "zombie", "zombie", "zombie"],
    notes:
      "R35. COLDFIRE. Era 2+3. Room design ref R35. " +
      "Dining hall: long salt tables. Zombies circuit trays R64→tables→R64 forever. Matins bell on timer - only the living hear it. " +
      "Connects: R31, R36 cloister garden (dead end), R64 kitchen (exit grid 14). Cross-ref R64. " +
      "Acoustic / noise: deliberate bell ring = extreme noise lure; propagates to chapel and library ghost risk when implemented.",
    props: [
      {
        id: "salt_crystal_cups",
        label: "Salt-Crystal Cups",
        icon: "\u{1F964}",
        desc: "At each place setting, cups grown from salt and prayer, empty for a century. They chime softly if you lift one - a thin, guilty sound.",
        gridPosition: { row: 15, col: 14 },
        actions: [
          {
            id: "gather",
            label: "Gather a few to sell",
            effects: [
              { type: "grant_salt", amount: 6 },
              { type: "consume_prop" },
              { type: "log", message: "6 salt in oddities - delicate, worthless to the dead." },
            ],
          },
        ],
      },
      {
        id: "matins_bell",
        label: "Matins Bell",
        icon: "\u{1F514}",
        desc: "A brass bell on a timer above the high table, mechanism clicking where only warm ears should care. The clapper waits like a held breath.",
        gridPosition: { row: 16, col: 15 },
        actions: [
          {
            id: "ring",
            label: "Ring the bell",
            desc: "One stroke and every corridor will know a living throat was here",
            effects: [
              { type: "set_flag", flag: "matins_bell_rung_r35" },
              {
                type: "log",
                message:
                  "The peal slams into the vaults. Footsteps stumble; somewhere, something turns toward noise. You were warned.",
              },
            ],
          },
          {
            id: "leave",
            label: "Leave it silent",
            effects: [{ type: "log", message: "The timer clicks. You let it." }],
          },
        ],
      },
    ],
  },
  7: {
    label: "Hidden Cell",
    hint: "a narrow cell behind a loose panel; breathing you cannot quite place.",
    description:
      "Narrow cell behind the panel. Damp stone. Stale air; faint bread smell. No coldfire. " +
      "Three close walls swallow noise.",
    enemies: [],
    notes:
      "R34. DARK. Era 2. Room design ref R34. Secret from R33 only. " +
      "Voss encounter 1: Not greedy in the order's sense - three eras of extraction emptied his world. Town declined after lich sealed mine; no prospects. Cult offered food; price is serving a monster. 'Greed' is survival - wanting to eat - still binds him to the taker below. " +
      "Teaching: fast talk vs aggression branches; hostility makes him harder to find later.",
    props: [
      {
        id: "voss_encounter_r34",
        label: "Huddled Figure",
        icon: "\u{1F9D1}",
        desc: "A young cultist presses into the corner as if the stone could absorb him. Eyes too bright - fear, not zeal. His hands shake around a crust of bread he does not eat.",
        gridPosition: { row: 22, col: 24 },
        actions: [
          {
            id: "parley",
            label: "Speak softly - trade words",
            effects: [
              { type: "set_flag", flag: "voss_met_r34" },
              { type: "set_flag", flag: "voss_intel_patrol_and_zones" },
              {
                type: "log",
                message:
                  "Voss whispers: when the dead-tamers walk, which halls go quiet; the sealed archive wing and the chapel's inner cell are for sworn hands only. The green strips? 'Tomasz didn't make it. It's not sun. It's not safe.' He jerks his chin toward the library - then begs you not to say you saw him.",
              },
            ],
          },
          {
            id: "threaten",
            label: "Corner him",
            effects: [
              { type: "set_flag", flag: "voss_fled_r34" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "He bolts past you, elbow in your ribs, gone into the dark. Whatever he knew went with him.",
              },
            ],
          },
        ],
      },
    ],
  },
  8: {
    label: "Cloister Garden",
    hint: "dead herbs, a breath of sky down a shaft; quiet that doesn't hum like the corridors behind you.",
    description:
      "Small garden court. Ceiling opens to a rough shaft; grey daylight on dead herb beds. No coldfire. " +
      "Thin draft. Bitter dried-plant smell. One pillar re-carved over older chisel marks.",
    enemies: [],
    safeRoom: true,
    notes:
      "R36. DIM (ventilation shaft). Era 1+2. Room design ref R36. Dead end off R35 only. " +
      "Former herb garden; weak daylight through shaft. Plants dead to husks; higher ceiling, hush unlike coldfire. Era 1 pillar carved to Era 2 devotional column. " +
      "Natural dim - relatively safe pause; restful tone (mechanical buff TBD).",
    props: [
      {
        id: "dried_medicinal_herbs",
        label: "Dried Medicinal Herbs",
        icon: "\u{1F33F}",
        desc: "Husks rattling on dead stems - yarrow, monkshood, saltwort - hung to dry and never taken down. The air still smells faintly bitter, like memory of healing.",
        gridPosition: { row: 19, col: 24 },
        actions: [
          {
            id: "gather",
            label: "Gather what's left",
            effects: [
              { type: "set_flag", flag: "has_dried_medicinal_herbs_r36" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "The bundle crunches in your pack. Bitter husks - the kind of thing an apothecary in Ashvere would have paid dear for, once.",
              },
            ],
          },
        ],
      },
      {
        id: "era_pillar_column",
        label: "Devotional Column",
        icon: "\u{1F3DB}\uFE0F",
        desc: "A rough mine pillar re-carved with saints and rope-moulding by order hands. The chisel marks overlap - one age swallowing another.",
        gridPosition: { row: 20, col: 25 },
        onExamine: [
          { type: "set_flag", flag: "read_cloister_garden_pillar" },
          {
            type: "log",
            message:
              "Stone remembers timber, timber remembers faith. Nothing here was built only once.",
          },
        ],
      },
    ],
  },
  9: {
    label: "Return to Upper Galleries",
    hint: "salt-block masonry gives way to the inner gate route.",
    description: "Passage tightens. Rougher stone; less coldfire than the cloister halls.",
    enemies: [],
    exit: { toAreaId: "a1_upper_galleries", toRoomGridId: 7 },
  },
  10: {
    label: "Toward Chapel Cavern",
    hint: "flame-and-voice carvings bite the arch; the cavern beyond hums with echo.",
    description: "Past the arch the air turns cooler and damper. Your footsteps echo back early.",
    enemies: [],
    exit: { toAreaId: "a2_chapel", toRoomGridId: 2 },
  },
  11: {
    label: "Toward the Library",
    hint: "an arch reads seek and be illuminated; empty racks line the way ahead.",
    description: "Short hall: salt-block, empty book racks, cracked varnish and dust.",
    enemies: [],
    exit: { toAreaId: "a2_library", toRoomGridId: 2 },
  },
  12: {
    label: "Toward the Chapter House",
    hint: "corridors where wax and ink did the real preaching; seals and orders thick as dust.",
    description: "Corridor with steady coldfire. Cleaner plaster than the dorm wing.",
    enemies: [],
    exit: { toAreaId: "a2_chapter_house", toRoomGridId: 2 },
  },
  13: {
    label: "Toward Maintenance Halls",
    hint: "pipes run along the ceiling; the air smells of old oil and wet stone.",
    description:
      "Service passage. Iron brackets, water dripping off pipes, faint hum from the pipes.",
    enemies: [],
    exit: { toAreaId: "a2_maintenance", toRoomGridId: 2 },
  },
  14: {
    label: "Toward the Kitchens",
    hint: "warm coldfire and the ghost of cooking smoke; ovens somewhere ahead.",
    description: "Slightly warmer coldfire. Oil haze. Smell of kitchens ahead.",
    enemies: [],
    exit: { toAreaId: "a2_maintenance", toRoomGridId: 5 },
  },
};

export const A2_CLOISTER: AreaDef = {
  id: "a2_cloister",
  name: "The Cloister",
  desc: "Where they slept and ate after they stole your family's mine - salt-block polish, coldfire, and corpses still going through the motions.",
  difficulty: 2,
  generator: "authored",
  authored: {
    grid: A2_CLOISTER_GRID,
    rooms: A2_CLOISTER_ROOMS,
  },
  combatRooms: [],
};
