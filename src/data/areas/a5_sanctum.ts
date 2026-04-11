import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 5 — Founder's Reliquary — Order's Sanctum (R157–R162)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * Graph: 157(2)↔158(3)↔159(4)↔160(5); 2↔161(7)↔10(throne); 2↔8(MQ); 2↔9(colonnade).
 */

// prettier-ignore
export const A5_SANCTUM_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  0, 10, 10,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  1, 10, 10,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  4
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  5
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  1,  1,  9,  9,  0,  0,  0,  2,  2,  2,  0,  3,  3,  3,  0,  4,  4,  4,  0,  5,  5,  5,  1,  1,  1,  1], //  7
  [ 1,  1,  1,  1,  9,  9,  1,  1,  1,  2,  2,  2,  1,  3,  3,  3,  1,  4,  4,  4,  1,  5,  5,  5,  1,  1,  1,  1], //  8
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  1,  3,  3,  3,  1,  4,  4,  4,  1,  5,  5,  5,  1,  1,  1,  1], //  9
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 10
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  8,  8,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 11
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  8,  8,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 12
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 13
];

export const A5_SANCTUM_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Sanctum Entrance",
    hint: "a single slab of salt frames the door; founding figures kneel toward a carved crystal that matches what lies ahead.",
    enemies: ["necromancer", "boss_skeleton_lord"],
    isStart: true,
    notes:
      "R157. Dark. Inner Circle Necromancer (type necromancer; stats note: HP 12, ATK 8 — stronger than stock) + Elite Skeleton ×1 (boss_skeleton_lord) as gate guards. " +
      "Hidden passage to R162: second entrance toward Mortal Quarters — harder to spot than R146 panel (cross-ref R162, R168). " +
      "MISSING: cultist (notes). Cross-ref: R156, R158, R161, R162.",
    props: [
      {
        id: "sanctum_doorway_founding_relief_r157",
        label: "Founding Relief",
        icon: "\u{1F3DB}\uFE0F",
        desc: "Figures in salt-block high relief — miners, priests, architects — kneeling toward a carved crystal whose facets match the formation I haven't walked into yet but already feel in my teeth. The sculptor knew the real cavern's silhouette by heart.",
        gridPosition: { row: 8, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "read_sanctum_entrance_founding_relief_r157" },
          {
            type: "log",
            message:
              "They built faith around a wound in the earth — then someone learned to sit in it.",
          },
        ],
      },
    ],
  },
  3: {
    label: "Altar Room",
    hint: "a cracked crystal altar wears two liturgies at once — hymn lines and something hungrier.",
    enemies: [],
    notes:
      "R158. Coldfire. No enemies. Massive salt-crystal altar; cracked; stained with centuries of rite residue. Era 2: Vigil Hymn notation. Era 3: necromantic reroute into lich power grid. Sacred brazier stand (extinguished). " +
      "World-state — optional brazier: relight with hymn ritual → true light floods altar + adjacent spaces → weakens lich light suppression in Crystal Throne subarea. " +
      'If player consecrates altar: during R165 encounter Serevic may quip (impatient): "You restored a ritual that maintains nothing. Efficient." ' +
      "Brazier flood is a teaching beat tying consecration / hymn mastery to boss-phase economy. " +
      "Cross-ref: R159, R165, Area 2 hymn sources.",
    props: [
      {
        id: "crystal_altar_face_r158",
        label: "Crystal Altar",
        icon: "\u{26EA}",
        desc: "A slab grown and cut until it is both table and lens. Old lines score the Vigil Hymn's notation — strike, breathe, pitch — while newer channels gouge through them, rerouting sanctity into a hungry circuit I can almost hear sipping power.",
        gridPosition: { row: 8, col: 14 },
        onExamine: [
          { type: "set_flag", flag: "read_sanctum_altar_hymn_inscriptions_r158" },
          {
            type: "log",
            message: "The hymn survived — bent toward a throat that no longer sings it kindly.",
          },
        ],
        actions: [
          {
            id: "consecrate_altar",
            label: "Consecrate the desecrated altar",
            desc: "Pour consecrated salt through the scored hymn-lines until the newer gouges stutter and spit.",
            requires: { flags: ["has_consecration"], notFlags: ["sanctum_altar_consecrated_r158"] },
            effects: [
              { type: "set_flag", flag: "sanctum_altar_consecrated_r158" },
              {
                type: "log",
                message:
                  "Salt hisses where the old notation crosses the hungry cuts — something in the deep wiring hiccups. Far off, I feel attention turn like a needle twitching toward a mistake.",
              },
            ],
          },
        ],
      },
      {
        id: "altar_brazier_stand_r158",
        label: "Sacred Brazier Stand",
        icon: "\u{1F525}",
        desc: "Cold iron bowl, ash scoured thin, wick-end black as policy. It waited beside the altar for centuries of vigil fire — then the last grandmaster preferred coldfire's accounting.",
        gridPosition: { row: 9, col: 15 },
        condition: { notFlags: ["sanctum_altar_brazier_relit_r158"] },
        actions: [
          {
            id: "relight",
            label: "Relight with the full brazier rite",
            desc: "Strike and breathe exactly as the archive's full relighting codex demands — hymn-true, no skipped beat.",
            requires: { flags: ["read_full_brazier_relighting_rite", "knows_hymn_fragment"] },
            effects: [
              { type: "set_flag", flag: "sanctum_altar_brazier_relit_r158" },
              {
                type: "log",
                message:
                  "True flame crawls the bowl — honest heat licks the neighboring salt. The weight on every torch I carry eases a hair, as if something ahead had been pinching wicks and lost its grip for a moment.",
              },
            ],
          },
        ],
      },
    ],
  },
  4: {
    label: "Relic Chamber",
    hint: "empty cases; one seal still hungers for consecration before it opens.",
    enemies: [],
    notes:
      "R159. Coldfire. Display cases emptied by lich; one consecration-locked case remains. " +
      "Cross-ref: R158, R160, R165 combat prep.",
    props: [
      {
        id: "emptied_relic_cases_r159",
        label: "Emptied Display Cases",
        icon: "\u{1F5BC}\uFE0F",
        desc: "Glass jaws hang open; velvet liners show rectangular ghosts where reliquaries sat. Dust-fingerprints smear outward — someone collected with efficiency, not reverence.",
        gridPosition: { row: 8, col: 18 },
        onExamine: [
          { type: "set_flag", flag: "examined_emptied_relic_cases_r159" },
          {
            type: "log",
            message: "The lich took what armed faith; what remains is argument.",
          },
        ],
      },
      {
        id: "relic_vault_inventory_sheet_r159",
        label: "Relic Inventory Sheet",
        icon: "\u{1F4C4}",
        desc: "Clipboard bolted to the wall — columns of names, dates, 'transferred to deep custody.' The handwriting tightens as the list goes on, as if scarcity sharpened appetite.",
        gridPosition: { row: 9, col: 17 },
        onExamine: [
          { type: "set_flag", flag: "read_relic_chamber_inventory_list_r159" },
          {
            type: "log",
            message: "Hoarding dressed as cataloging — every line item a theft with paperwork.",
          },
        ],
      },
      {
        id: "consecration_locked_reliquary_r159",
        label: "Consecration-Locked Case",
        icon: "\u{1F512}",
        desc: "Salt-iron bands cross a crystal case; seal-glyph still hungry for prayer that refuses extraction. Inside, something circular presses the glass — metal and blessing braided until undead skin would blister to wear it.",
        gridPosition: { row: 8, col: 17 },
        condition: { notFlags: ["took_blessed_salt_iron_amulet_r159"] },
        actions: [
          {
            id: "open",
            label: "Speak the consecration seal open",
            requires: {
              flags: ["has_consecration"],
              notFlags: ["opened_consecration_reliquary_r159"],
            },
            effects: [
              { type: "set_flag", flag: "opened_consecration_reliquary_r159" },
              {
                type: "log",
                message: "Bands unwind like fingers releasing a throat — the crystal lets me in.",
              },
            ],
          },
          {
            id: "take_amulet",
            label: "Take the blessed salt-iron amulet",
            requires: { flags: ["opened_consecration_reliquary_r159"] },
            effects: [
              { type: "set_flag", flag: "took_blessed_salt_iron_amulet_r159" },
              { type: "set_flag", flag: "has_blessed_salt_iron_amulet" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Cold at first — then warmth like a vow pressed to my sternum. The air above the amulet feels thinner to wrong working; I imagine a corpse-hand jerking back from blessed iron.",
              },
            ],
          },
        ],
      },
    ],
  },
  5: {
    label: "Brazier of the Deep",
    hint: "the grandest brazier stand, cold — first lit by the order, last put out by the throne.",
    enemies: [],
    notes:
      "R160. Dark. Dead end. Deepest sacred brazier — first lit by order, last extinguished by lich; older/grander than others. " +
      "World-state — DEEP BRAZIER (major optional): relight requires perfect hymn performance; true light floods R157–R161; sharply weakens lich light suppression toward throne; affects R163–R167 phase pacing. " +
      "Stacks with R158 brazier and Area 4 Crystal Master Array for Light Climax at R164. Cross-ref: R164, R165.",
    props: [
      {
        id: "deep_brazier_r160",
        label: "Brazier of the Deep",
        icon: "\u{1F525}",
        desc: "Older iron than the altar's stand, wider bowl, more teeth on the grate — the first hearth the order lit this far down, and the last the grandmaster let die. Ash sits in it like a closed ledger.",
        gridPosition: { row: 8, col: 22 },
        condition: { notFlags: ["deep_brazier_relit_r160"] },
        actions: [
          {
            id: "relight_perfect_hymn",
            label: "Perform the hymn without flaw",
            desc: "Sing and strike as the cantor's brazier rite demands — the deep hearth will not forgive a wavered note.",
            requires: {
              flags: ["read_full_brazier_relighting_rite", "knows_cantor_brazier_strike_rite"],
            },
            effects: [
              { type: "set_flag", flag: "deep_brazier_relit_r160" },
              {
                type: "log",
                message:
                  "Flame rolls through the sanctum galleries behind me like a tide — every vault I passed to get here blushes with honest light. Farther on, toward the crystal dark, whatever has been starving my torches hesitates, as if surprised by hunger interrupted.",
              },
            ],
          },
        ],
      },
    ],
  },
  7: {
    label: "Sanctum Gallery",
    hint: "murals fade into an unfinished stroke, as if the painter learned the ending.",
    enemies: ["boss_skeleton_lord"],
    notes:
      "R161. Coldfire. Salt-crystal walls; faded Era 2 murals (founding → growth → unfinished panel mid-stroke). Elite Skeleton ×1 (boss_skeleton_lord) slow patrol. " +
      "Opens toward final cavern. Convention: grid 7 = return from a5_crystal_throne; colonnade return lands at R157 (grid 2), not here. " +
      "Cross-ref: R163, R156.",
    props: [
      {
        id: "sanctum_gallery_murals_r161",
        label: "Frescoed History",
        icon: "\u{1F3A8}",
        desc: "Old pigment on salt-crystal — founding in gold, growth in green, then a panel that stops mid-stroke: a face half-born, brush lifted as if the painter heard news from the deep and walked away.",
        gridPosition: { row: 3, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "read_sanctum_gallery_murals_r161" },
          {
            type: "log",
            message: "History ends where someone refused to paint the next cost.",
          },
        ],
      },
    ],
  },
  8: {
    label: "Hidden Passage",
    hint: "service stone, thick dust — on no chart the lich bothered to update.",
    enemies: [],
    exit: { toAreaId: "a5_mortal_quarters", toRoomGridId: 2 },
    notes:
      "R162. Dark. Narrow service route R146 ↔ R157 ↔ R168; not on maps; lich uses for efficiency. " +
      "Pair: Mortal Quarters exit 6 → sanctum grid 8. Outer Ward hidden panel → mortal grid 2. Cross-ref: R146, R168.",
  },
  9: {
    label: "Back to Colonnade",
    hint: "column light at my back; the threshold remembers how I crossed it.",
    enemies: [],
    exit: { toAreaId: "a5_colonnade", toRoomGridId: 7 },
    notes:
      "Exit. Returns to colonnade R156 (grid 7). Pair: Colonnade room 8 → sanctum grid 2 (R157).",
  },
  10: {
    label: "Toward the Crystal Throne",
    hint: "the air thickens; something nibbles at every flame I carry.",
    enemies: [],
    exit: { toAreaId: "a5_crystal_throne", toRoomGridId: 2 },
    notes:
      'Exit to a5_crystal_throne R163 (grid 2). Pair: Crystal Throne "Back to the Sanctum" → sanctum grid 7 (R161). Cross-ref: R163.',
  },
};

export const A5_SANCTUM: AreaDef = {
  id: "a5_sanctum",
  name: "Order's Sanctum",
  desc: "The vigil's deepest chapel — hymn-scored stone with hungry channels gouged through it. If I still know the old breath and strike, something here remembers the kinder route.",
  difficulty: 5,
  generator: "authored",
  authored: {
    grid: A5_SANCTUM_GRID,
    rooms: A5_SANCTUM_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
};
