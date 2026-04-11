import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 4 — Shadow Depths (R135–R140), difficulty 5.
 * Linear vertical stack 2–7 = R135–R140; 8 = exit abandoned dig R128 (grid 6); 9 = exit sealed R141 (grid 2).
 * Each floor linked by a single-row 0 strip (two room neighbors max per corridor cell).
 */

// prettier-ignore
export const A4_SHADOW_DEPTHS_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  8,  8,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  8,  8,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  2,  2,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  2,  2,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  3,  3,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  3,  3,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  4,  4,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  4,  4,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  5,  5,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  5,  5,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  6,  6,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  6,  6,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  7,  7,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  7,  7,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  9,  9,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  9,  9,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
];

export const A4_SHADOW_DEPTHS_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Shadow Threshold",
    hint: "the dark weighs on your flame. each step eats a little more of it.",
    enemies: ["shadow"],
    isStart: true,
    notes:
      "R135. DARK — ambient drain zone. Era 1. " +
      "World-state (impl tune): in this subarea non-crystal player light loses ~1 intensity per ~2 turns — urgency toward R138 craft. " +
      "Shadow ×1. Cross-ref: crystal lantern immunity (sunlight-class). Connects R128 ↔ R136.",
    props: [
      {
        id: "shadow_threshold_air_r135",
        label: "Weighted Dark",
        icon: "\u{1F319}",
        desc: "The corridor borrows weight from somewhere below. Your torch shrinks to a fist's worth of honest flame; beyond that radius, void stacks like wet felt.",
        gridPosition: { row: 4, col: 3 },
        onExamine: [
          { type: "set_flag", flag: "examined_shadow_threshold_r135" },
          {
            type: "log",
            message: "Each step shrinks your flame. Ordinary light does not belong this deep.",
          },
        ],
      },
    ],
  },
  3: {
    label: "Consumed Gallery",
    hint: "wall crystals blackened as if starved for years.",
    enemies: ["shadow", "shadow"],
    notes:
      "R136. DARK. Era 1. Shadows ×2; torch may last ~3 turns (tuning). " +
      "Teaching: ordinary light starvation. Connects R135 ↔ R137.",
    props: [
      {
        id: "blackened_wall_crystals_r136",
        label: "Blackened Salt Crystals",
        icon: "\u{26AB}",
        desc: "Facets that should glitter are soot-sick — starved by years of shadow grazing. They feel cold even when your hand expects warmth.",
        gridPosition: { row: 7, col: 3 },
        onExamine: [
          { type: "set_flag", flag: "examined_blackened_crystals_r136" },
          {
            type: "log",
            message: "Proof of hunger — the wall paid for your trespass in color.",
          },
        ],
      },
    ],
  },
  4: {
    label: "Crystal Vein",
    hint: "the seam glows on its own. the note says the salt refuses to go dark.",
    enemies: ["shadow"],
    notes:
      "R137. DARK — crystal faint internal glow (not Shadow-food). Era 1. Exposed deep salt vein; self-luminous crystals resist Shadow consumption — " +
      "glow reads as containment working; same formation that drew presence also armors against its echo. Treasure and barrier, one material. " +
      "Shadow ×1. Connects R136 ↔ R138.",
    props: [
      {
        id: "vein_miner_note_r137",
        label: "Pinned Scrap of Paper",
        icon: "\u{1F4DD}",
        desc: "Hand cramped with cold: These crystals don't go dark. The lamps die but the crystals keep glowing. Something in the salt itself.",
        gridPosition: { row: 10, col: 3 },
        onExamine: [
          { type: "set_flag", flag: "read_r137_vein_note" },
          { type: "set_flag", flag: "knows_crystal_lantern_recipe" },
          {
            type: "log",
            message: "The deep salt glows on its own — a vein that will not feed what eats flame.",
          },
        ],
      },
      {
        id: "self_luminous_vein_r137",
        label: "Glowing Salt Vein",
        icon: "\u{1F48E}",
        desc: "Salt grown thick with its own stubborn radiance — not bright, but honest. The seam holds the dark out the way thick doors hold out weather.",
        gridPosition: { row: 11, col: 3 },
        condition: { notFlags: ["harvested_self_luminous_vein_r137"] },
        actions: [
          {
            id: "harvest",
            label: "Break free glowing crystals",
            effects: [
              { type: "set_flag", flag: "harvested_self_luminous_vein_r137" },
              { type: "set_flag", flag: "has_self_luminous_salt_crystal" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Two fused masses — warm salt that keeps its own glow, humming faintly against your palm.",
              },
            ],
          },
        ],
      },
    ],
  },
  5: {
    label: "Crystal Forge",
    hint: "a miner bench, polish, mounts — everything to cage a stubborn glow in brass and glass.",
    enemies: [],
    notes:
      "R138. DARK. Era 1. Miner workshop alcove: bench, polish, mounts. " +
      "CRAFT CRYSTAL LANTERN — requires: self-luminous crystal (R137), shuttered lantern, knowledge (R137 note OR Area 2 R48 mining/reflector docs OR reflector work R119–R120). " +
      "Output: sunlight-class light, immune to Shadow drain, shutterable like base lantern — key for Area 5 and Shadow backtrack. " +
      "Thematic: oldest mine matter + player's intent = light Shadows cannot eat; not imported sanctity. " +
      "Connects R137 ↔ R139.",
    props: [
      {
        id: "crystal_forge_bench_r138",
        label: "Miner's Light Bench",
        icon: "\u{1F6E0}\uFE0F",
        desc: "Polish wheels, brass mounts, jigs meant to seat a lantern shell around a crystal heart. The tools expect patience — the same patience that refused to strip the deep bare.",
        gridPosition: { row: 13, col: 3 },
        actions: [
          {
            id: "craft_lantern_from_vein_note",
            label: "Seat the crystal in the lantern (scrap note)",
            desc: "Shuttered lantern shell, glowing salt from the vein, and the scrap that told you the salt keeps its light.",
            requires: {
              flags: [
                "has_shuttered_lantern",
                "has_self_luminous_salt_crystal",
                "read_r137_vein_note",
              ],
              notFlags: ["has_crystal_lantern"],
            },
            effects: [
              { type: "set_flag", flag: "has_crystal_lantern" },
              { type: "set_flag", flag: "has_shuttered_lantern", value: false },
              { type: "set_flag", flag: "has_self_luminous_salt_crystal", value: false },
              { type: "set_flag", flag: "crafted_crystal_lantern_r138" },
              {
                type: "log",
                message:
                  "You cage the stubborn glow in brass and glass. The beam comes up warm and whole — the kind of light the shadows cannot drink, only shy from.",
              },
            ],
          },
          {
            id: "craft_lantern_from_library",
            label: "Seat the crystal in the lantern (mirror folio)",
            desc: "Shuttered shell, glowing salt, and the order's mirror angles on vellum.",
            requires: {
              flags: [
                "has_shuttered_lantern",
                "has_self_luminous_salt_crystal",
                "read_crystal_reflector_documentation",
              ],
              notFlags: ["has_crystal_lantern"],
            },
            effects: [
              { type: "set_flag", flag: "has_crystal_lantern" },
              { type: "set_flag", flag: "has_shuttered_lantern", value: false },
              { type: "set_flag", flag: "has_self_luminous_salt_crystal", value: false },
              { type: "set_flag", flag: "crafted_crystal_lantern_r138" },
              {
                type: "log",
                message:
                  "Order lines meet miner's hands — the lantern wakes steady, the way prayers pretend to be.",
              },
            ],
          },
          {
            id: "craft_lantern_from_engineering",
            label: "Seat the crystal in the lantern (shaft folio)",
            desc: "Shuttered shell, glowing salt, and the old engineers' strata drawings.",
            requires: {
              flags: [
                "has_shuttered_lantern",
                "has_self_luminous_salt_crystal",
                "has_mine_engineering_documents",
              ],
              notFlags: ["has_crystal_lantern"],
            },
            effects: [
              { type: "set_flag", flag: "has_crystal_lantern" },
              { type: "set_flag", flag: "has_shuttered_lantern", value: false },
              { type: "set_flag", flag: "has_self_luminous_salt_crystal", value: false },
              { type: "set_flag", flag: "crafted_crystal_lantern_r138" },
              {
                type: "log",
                message:
                  "Numbers and ink become heat in your hands — light with the same discipline as a tally book.",
              },
            ],
          },
          {
            id: "craft_lantern_from_alpha_reflector",
            label: "Seat the crystal in the lantern (first mirror)",
            desc: "You already learned how the first polished disk drinks light.",
            requires: {
              flags: [
                "has_shuttered_lantern",
                "has_self_luminous_salt_crystal",
                "examined_reflector_alpha_r119",
              ],
              notFlags: ["has_crystal_lantern"],
            },
            effects: [
              { type: "set_flag", flag: "has_crystal_lantern" },
              { type: "set_flag", flag: "has_shuttered_lantern", value: false },
              { type: "set_flag", flag: "has_self_luminous_salt_crystal", value: false },
              { type: "set_flag", flag: "crafted_crystal_lantern_r138" },
              {
                type: "log",
                message:
                  "Your hands remember how the first mirror drank light — the lantern answers in the same dialect.",
              },
            ],
          },
          {
            id: "craft_lantern_from_junction",
            label: "Seat the crystal in the lantern (three mounts)",
            desc: "Your hands still remember torquing the three empty rings.",
            requires: {
              flags: [
                "has_shuttered_lantern",
                "has_self_luminous_salt_crystal",
                "examined_reflector_junction_r120",
              ],
              notFlags: ["has_crystal_lantern"],
            },
            effects: [
              { type: "set_flag", flag: "has_crystal_lantern" },
              { type: "set_flag", flag: "has_shuttered_lantern", value: false },
              { type: "set_flag", flag: "has_self_luminous_salt_crystal", value: false },
              { type: "set_flag", flag: "crafted_crystal_lantern_r138" },
              {
                type: "log",
                message:
                  "Three sightlines taught your fingers the angles — the finished lantern hums like the junction satisfied.",
              },
            ],
          },
        ],
      },
    ],
  },
  6: {
    label: "Deep Reflector",
    hint: "mirrors meant to marry this place to the galleries far above.",
    enemies: ["shadow", "shadow"],
    notes:
      "R139. DARK → LIT if restored. Era 1. Deepest array; Shadows ×2 aggressive pursuers. " +
      "Restore: clean, align — crystal lantern strongly recommended; completes optical chain to R120 / Crystal Master Array final leg. " +
      "Hardest Shadow pair without lantern. Cross-ref: R122 bonus daylight in galleries + this subarea when array complete. " +
      "Connects R138 ↔ R140; reflector path to R120 (puzzle chain).",
    props: [
      {
        id: "deep_reflector_array_r139",
        label: "Deep Array Mirror",
        icon: "\u{1FA9E}",
        desc: "Salt-glass canted toward a sightline that should kiss the three-mount hall far above. Grit, cracks, claw marks from things that hated being seen. Square this disk and the long light-path closes — if your flame lasts the work.",
        gridPosition: { row: 16, col: 3 },
        onExamine: [
          { type: "set_flag", flag: "examined_deep_reflector_r139" },
          { type: "set_flag", flag: "knows_crystal_lantern_recipe" },
          {
            type: "log",
            message:
              "The last mirror in the chain — tie it to the bright halls above or let the dark keep this floor.",
          },
        ],
      },
    ],
  },
  7: {
    label: "Shadow Heart",
    hint: "three absences circle you. your torch feels like a candle in a gale.",
    enemies: ["shadow", "shadow", "shadow"],
    notes:
      "R140. DARK — max drain. Era 1. Darkest room; Shadows ×3; ordinary light can fail in one turn (tuning). " +
      "Crystal lantern dimmed but not killed. Walls fully stained black. Passage toward Sealed Chamber; sense of vast patience below — draw, not dialogue. " +
      "Toughest non-boss fight Area 4; lantern near-mandatory. " +
      "Connects R139 ↔ R141 (via exit). Cross-ref: demon pressure R141–R143.",
    props: [
      {
        id: "shadow_heart_walls_r140",
        label: "Soot-Sick Walls",
        icon: "\u{2B1B}",
        desc: "Salt gone velvet-black — not soot, absence stacked until it has texture. Somewhere underfoot, patience widens like a throat.",
        gridPosition: { row: 19, col: 3 },
        onExamine: [
          { type: "set_flag", flag: "examined_shadow_heart_walls_r140" },
          {
            type: "log",
            message: "No voice — only pull, wide and patient, like standing beside deep water.",
          },
        ],
      },
      {
        id: "shadow_essence_pool_r140",
        label: "Black Tar Pool",
        icon: "\u{1F52E}",
        desc: "A tar-slick puddle that refuses to reflect you — apothecaries pay for such sludge; down here it is only proof you lived through the heart.",
        gridPosition: { row: 20, col: 3 },
        condition: { notFlags: ["has_shadow_essence_alchemy"] },
        actions: [
          {
            id: "collect",
            label: "Bottle the tar",
            effects: [
              { type: "set_flag", flag: "has_shadow_essence_alchemy" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Cold slips into the vial — fodder for a still or a curse, depending who buys it.",
              },
            ],
          },
        ],
      },
    ],
  },
  8: {
    label: "Back toward abandoned dig",
    hint: "warmer air and the memory of coldfire.",
    enemies: [],
    exit: { toAreaId: "a4_abandoned_dig", toRoomGridId: 6 },
  },
  9: {
    label: "Toward the sealed chamber",
    hint: "order glyphs bite the air ahead. something patient waits behind salt.",
    enemies: [],
    exit: { toAreaId: "a4_sealed_chamber", toRoomGridId: 2 },
  },
};

export const A4_SHADOW_DEPTHS: AreaDef = {
  id: "a4_shadow_depths",
  name: "Shadow Depths",
  desc: "Where the dark eats flame — and the oldest salt still refuses to go out.",
  difficulty: 5,
  generator: "authored",
  authored: {
    grid: A4_SHADOW_DEPTHS_GRID,
    rooms: A4_SHADOW_DEPTHS_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
  notes:
    "Area 4 Subarea 5 — Shadow territory; crystal lantern craft (R138); Master Array leg R139. " +
    "Light table: coldfire/bioluminescence fake; true flame vulnerable; crystal lantern = sunlight vs drain.",
};
