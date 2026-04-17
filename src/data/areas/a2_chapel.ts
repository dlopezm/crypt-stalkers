import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 2 - Chapel Cavern (R37–R42)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * R37↔R38; R38↔R39,R40,R41,R42; R41↔exit9. Wall band isolates R40 (north) from exit/R37 tunnel.
 */

// prettier-ignore
export const A2_CHAPEL_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 1
 [ 1, 1, 1, 1, 1, 5, 5, 1, 1, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 2 R40 | R39
 [ 1, 1, 1, 1, 1, 5, 5, 1, 1, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 3
 [ 1, 1, 1, 1, 1, 5, 5, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 4 R40 wall + R39↔nave
 [ 1, 1, 1, 1, 1, 5, 5, 0, 3, 3, 3, 3, 3, 3, 3, 0, 7, 7, 1, 1, 1, 1], // 5 R40↔nave|nave|R42
 [ 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 7, 7, 1, 1, 1, 1], // 6
 [ 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 7, 7, 1, 1, 1, 1], // 7
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 8 wall band (isolates north from south doors)
 [ 1, 1, 8, 8, 0, 0, 2, 2, 0, 3, 3, 3, 3, 3, 3, 1, 7, 7, 1, 1, 1, 1], // 9 exit8|R37|nave|R42
 [ 1, 1, 8, 8, 1, 1, 2, 2, 1, 3, 3, 3, 3, 3, 3, 1, 7, 7, 1, 1, 1, 1], // 10
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 0, 3, 3, 1, 1, 1, 1, 1, 1, 1], // 11 nave↔R41
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 0, 6, 6, 6, 6, 1, 1, 1, 1, 1], // 12
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 0, 6, 6, 6, 6, 1, 1, 1, 1, 1], // 13
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 6, 6, 6, 6, 1, 1, 1, 1, 1], // 14
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 15
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 9, 9, 1, 1, 1, 1, 1, 1, 1, 1], // 16
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 9, 9, 1, 1, 1, 1, 1, 1, 1, 1], // 17
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 18
];

export const A2_CHAPEL_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Chapel Entrance",
    hint: "flame-and-voice carvings on the arch; every footstep answers from the stone.",
    description:
      "Heavy arch: carved flames and open mouths in polished salt-stone. " +
      "Past it the air is cooler and wetter. Every step doubles back as echo. Coldfire does not reach far into the dark ahead.",
    enemies: ["zombie", "zombie", "zombie", "ghost"],
    isStart: true,
    notes:
      "R37. COLDFIRE. Era 2+3. Room design ref R37. " +
      "Ornate arch: flame-and-voice motif. Zombies flank like ushers. Beyond, cavern opens - every footstep and clash gains resonance. " +
      "Special: chapel acoustic rules - combat noise spreads to adjacent chapel rooms; Banshee screams amplified; can alert Ghosts in Library block (R43–R50). " +
      "Connects: R30 cloister (exit grid 8), R38 nave.",
    props: [
      {
        id: "chapel_entrance_arch",
        label: "Flame-and-Voice Arch",
        icon: "\u{1F3DB}\uFE0F",
        desc: "Ornate salt-stone arch: tongues of carved flame interwoven with open mouths, as if song could be masonry. Beyond, the cavern swallows sound and gives it back louder.",
        gridPosition: { row: 9, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "read_chapel_entrance_arch_r37" },
          {
            type: "log",
            message:
              "The order wanted everyone to know: here, voice and fire were the same liturgy.",
          },
        ],
      },
    ],
  },
  3: {
    label: "Nave",
    hint: "salt-crystal walls climb into darkness; pews carved from the living floor like teeth.",
    description:
      "Huge cavern. Salt-crystal walls; ceiling lost in black above your light. " +
      "Pews carved straight up from the rock floor. Central aisle slopes toward a raised dais far ahead. " +
      "Sound comes back louder than you made it. Stalactites carved into robed figures with open mouths. " +
      "Coldfire strips along the walls read small in all this volume.",
    enemies: ["zombie", "zombie", "zombie", "zombie", "necromancer"],
    notes:
      "R38. COLDFIRE. Era 2+3. Room design ref R38. " +
      "Vast nave: salt-crystal walls vanishing upward, pews carved from floor. Cultists chant; zombies sit - drone almost beautiful (cultists ×2 not in enemy list). " +
      "Stalactites as singing saints, mouths open forever. " +
      "Connects: R37, R39 choir loft, R40 cantor's stand, R41 great brazier, R42 side chapel.",
    props: [
      {
        id: "offering_bowls",
        label: "Offering Bowls",
        icon: "\u{1F963}",
        desc: "Stone bowls along the nave aisle, coins pressed between scraps of salt. They still feed the bowl as if hunger lived in the stone - the carved saints above owe them nothing.",
        gridPosition: { row: 6, col: 10 },
        actions: [
          {
            id: "take",
            label: "Take the offerings",
            effects: [
              { type: "grant_salt", amount: 18 },
              { type: "consume_prop" },
              { type: "log", message: "18 salt lifted from the bowls." },
            ],
          },
        ],
      },
      {
        id: "hymn_fragment",
        label: "Damaged Hymnal",
        icon: "\u{1F3BC}",
        desc: "Most of the hymnals on the pews are rotted to pulp, but one has survived in a pew crevice. A single page remains legible: a notation in a lost hand, naming the cadence that 'strikes the brazier's heart.' A fragment of the Vigil Hymn.",
        gridPosition: { row: 7, col: 12 },
        onExamine: [
          { type: "set_flag", flag: "knows_hymn_fragment" },
          { type: "grant_ability", abilityId: "heal" },
          {
            type: "log",
            message: "You commit the cadence to memory. It tastes like a note you've always known.",
          },
        ],
      },
    ],
  },
  4: {
    label: "Choir Loft",
    hint: "elevated stands and a robed figure with its mouth frozen open - the air tastes of wrong notes.",
    description:
      "Raised platform above the nave. Salt stairs up. Rows of music stands; empty. " +
      "Almost no coldfire - dark overhead. Noise bounces and hangs; you hear yourself twice.",
    enemies: ["banshee", "skeleton", "skeleton"],
    notes:
      "R39. DARK. Era 2. Room design ref R39. " +
      "Elevated platform; salt stairs from R38. Robed figure, mouth frozen open. Wail corrupts hymn if player saw R38 hymnal. Music stands; sheet music. " +
      "Special: wail echoes R37–R42; triggers Library Ghosts; ranged silence or accept cascade. " +
      "Connects: R38 only.",
    props: [
      {
        id: "complete_vigil_hymn_sheet",
        label: "Complete Hymn Sheet",
        icon: "\u{1F3BC}",
        desc: "On a music stand, pages held by salt-clips: the Vigil Hymn in full arrangement - every voice part, every rest the cantor once owned. The margins bear grease from nervous thumbs.",
        gridPosition: { row: 2, col: 10 },
        actions: [
          {
            id: "take",
            label: "Take the sheet music",
            effects: [
              { type: "set_flag", flag: "has_complete_vigil_hymn_sheet" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "The paper whispers when folded. The great bowl was fed full song - not the half page you found in the nave.",
              },
            ],
          },
        ],
      },
      {
        id: "conductors_strongbox",
        label: "Conductor's Box",
        icon: "\u{1F4E6}",
        desc: "A small iron box beneath the stand, meant for stipends and replacement reeds. The lock is rust, not secret.",
        gridPosition: { row: 3, col: 11 },
        actions: [
          {
            id: "open",
            label: "Pry it open",
            effects: [
              { type: "grant_salt", amount: 15 },
              { type: "consume_prop" },
              {
                type: "log",
                message: "15 salt - the choir's wages, outlasting every throat that earned them.",
              },
            ],
          },
        ],
      },
    ],
  },
  5: {
    label: "Cantor's Stand",
    hint: "a small raised platform; inscription describes striking the brazier at the hymn's crescendo.",
    description:
      "Small platform built out from the crystal wall. Carved notation and ceremony text in the riser; salt rubbed into the letters. " +
      "Coldfire on the wall. A whisper carries clear over the pews below.",
    enemies: [],
    notes:
      "R40. COLDFIRE. Era 2. Room design ref R40. " +
      "Small raised platform for lead singer. Rosetta for singing + fire + faith - ties brazier system to order practice. " +
      "Combine with R39 sheet, R53 ritual texts, Rennic (R49) for full relighting procedure. " +
      "Connects: R38 only.",
    safeRoom: true,
    props: [
      {
        id: "cantor_stand_inscription",
        label: "Cantor's Inscription",
        icon: "\u{1F5FF}",
        desc: "Carved into the platform riser: ceremony text and musical notation, salt-filled grooves. Someone scored lines through the words; the chisel cuts underneath still read clear.",
        gridPosition: { row: 4, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "read_cantors_stand_inscription" },
          { type: "set_flag", flag: "knows_cantor_brazier_strike_rite" },
          { type: "grant_ability", abilityId: "holy_smite" },
          {
            type: "log",
            message:
              "At the crescendo of the Vigil Hymn, the keeper strikes the brazier's heart and sings the note of waking. The notation under it burns into memory - strike, breathe, pitch.",
          },
        ],
      },
      {
        id: "cantor_hymn_fragment_tablet",
        label: "Wax Tablet Fragment",
        icon: "\u{1F4DC}",
        desc: "A cracked wax tablet wedged under the platform - rehearsal marks, a thumbprint smear, the same cadence the nave hymnal hinted at, written large.",
        gridPosition: { row: 3, col: 6 },
        onExamine: [
          { type: "set_flag", flag: "read_cantor_hymn_fragment" },
          {
            type: "log",
            message:
              "The keeper's blow lands on the breath before the chorus answers - that is when the basin wakes. Fire follows voice, the old rite swore.",
          },
        ],
      },
    ],
  },
  6: {
    label: "Great Brazier Platform",
    hint: "a cart-scale salt basin cold as a tomb; rot creeps from something that has colonized the hearth.",
    description:
      "Raised dais in the middle of the nave. Massive salt-crystal basin on top - cart-sized. Chipped flame-and-mouth carving around the rim. " +
      "The bowl is not empty — a fleshy mass has rooted in the basin, rot spreading outward across the dais. " +
      "Coldfire orbits the corruption. Stone underfoot is slick.",
    enemies: ["false_sacrarium", "gutborn_larva"],
    notes:
      "R41. DARK (brazier out). Era 2+3. Room design ref R41. " +
      "Central dais. Great Brazier colonized by False Sacrarium + Gutborn Larva. Rot spreads from the altar each turn. " +
      "Clear the corruption to access the brazier. " +
      "Great Brazier milestone: defeat Sacrarium; relight (hymn + R40/R53 + performed melody) → Chapel Cavern true light: Skullflower suppressed; Ghouls/Larvae flee; Shadows blocked; Area 1 skeleton patrols add chapel route. " +
      "Connects: R38, exit grid 9 (R61 upper passage / chapter house). Cross-ref R61, Mira trade R61→R41 shortcut.",
    props: [
      {
        id: "great_brazier",
        label: "The Great Brazier",
        icon: "\u{1F525}",
        desc: "A cart-scale salt-crystal basin set into a central dais. The flame-and-voice relief around its rim is chipped but unmistakable. Where fire should be, only cold air, orbiting nothing. The stone beneath your boots remembers heat.",
        gridPosition: { row: 13, col: 14 },
        actions: [
          {
            id: "relight",
            label: "Sing the Vigil Hymn and relight",
            desc: "You need the cadence from the nave; humming wrong will leave the basin cold",
            requires: { flags: ["knows_hymn_fragment"] },
            effects: [
              { type: "set_flag", flag: "has_consecration" },
              { type: "set_flag", flag: "great_brazier_lit" },
              {
                type: "log",
                message:
                  "The cadence takes. The basin answers - true flame, rising. The chapel stops holding its breath.",
              },
            ],
          },
          {
            id: "leave_dark",
            label: "Leave the basin cold",
            effects: [
              {
                type: "log",
                message: "The cold air keeps orbiting where fire should be.",
              },
            ],
          },
        ],
      },
    ],
  },
  7: {
    label: "Side Chapel",
    hint: "a quiet alcove; something at the altar breathes where nothing should.",
    description:
      "Shallow side alcove off the nave wall. The small altar has become something else — " +
      "fleshy nodules pulse where salt offerings once lay, the stone weeps clear fluid. " +
      "Thin coldfire. The air is thick with sweetness and rot.",
    enemies: ["false_sacrarium"],
    notes:
      "R42. DARK. Era 2+3. Room design ref R42. " +
      "Corrupted altar: False Sacrarium rooted at the miners' patron shrine. Spreads rot tiles each turn. " +
      "Rush it down before the room becomes uninhabitable. Holy/fire purifies. " +
      "Connects: R38 only.",
    props: [
      {
        id: "side_chapel_salt_offering",
        label: "Salt Offering Piles",
        icon: "\u{1F9C2}",
        desc: "Cones of blessed salt at the altar foot, grey and pink in layers. The miners' saint never asked for gold - only this, heaped until it spilled.",
        gridPosition: { row: 6, col: 16 },
        actions: [
          {
            id: "take",
            label: "Bag some salt",
            effects: [
              { type: "set_flag", flag: "has_side_chapel_blessed_salt" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Coarse grains hiss in the sack. Salt for trade, for thresholds, for whatever work comes - the kneeling shade does not look up.",
              },
            ],
          },
        ],
      },
      {
        id: "side_chapel_offering_box",
        label: "Offering Box",
        icon: "\u{1FA99}",
        desc: "Iron box on a chain, slot worn shiny. Inside, coin and folded prayers - some legible, most melted to illegible humility.",
        gridPosition: { row: 5, col: 17 },
        actions: [
          {
            id: "take",
            label: "Empty the box",
            effects: [
              { type: "grant_salt", amount: 8 },
              { type: "grant_consumable", consumableId: "holy_water" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "8 salt - and beneath the coin, a wax-stoppered ampulla still cloudy with old blessing. Alms that outlived the almsgivers.",
              },
            ],
          },
        ],
      },
      {
        id: "miners_patron_painting",
        label: "Small Painting",
        icon: "\u{1F5BC}\uFE0F",
        desc: "A panel no larger than a prayer book: the mine mouth in gold light, carts like toys, figures raising hands as if warding something generous. Their story - guardians, not toll-takers. Your jaw tightens anyway.",
        gridPosition: { row: 6, col: 17 },
        onExamine: [
          { type: "set_flag", flag: "read_miners_patron_painting_r42" },
          {
            type: "log",
            message:
              "Whoever painted it believed the story. You wonder which side of the ledger they never saw.",
          },
        ],
      },
    ],
  },
  8: {
    label: "Back to the Cloister",
    hint: "the galleries' coldfire waits beyond the arch.",
    description: "Arch back toward the cloister: tighter passage, brighter coldfire, less reverb.",
    enemies: [],
    exit: { toAreaId: "a2_cloister", toRoomGridId: 2 },
  },
  9: {
    label: "Upper Passage (Chapter House)",
    hint: "a narrow cut overhead; clerks' shortcut to the great hearth - stone scuffed by soles that never used the nave.",
    description:
      "Narrow overhead crawl: worn steps, grit. Warmer draft from above; open cavern air below through gaps in the stone.",
    enemies: [],
    exit: { toAreaId: "a2_chapter_house", toRoomGridId: 7 },
  },
};

export const A2_CHAPEL: AreaDef = {
  id: "a2_chapel",
  name: "Chapel Cavern",
  desc: "The order hollowed a cavern into a throat - every footstep returns louder; the great hearth waits cold or cruel.",
  difficulty: 2,
  generator: "authored",
  authored: {
    grid: A2_CHAPEL_GRID,
    rooms: A2_CHAPEL_ROOMS,
  },
  combatRooms: [],
};
