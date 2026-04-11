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
      "R135. DARK — ambient drain zone. Era 1. Corridor feels heavier; torch/lantern flickers outside immediate melee; void-ahead read. " +
      "World-state (impl tune): in this subarea non-crystal player light loses ~1 intensity per ~2 turns — urgency toward R138 craft. " +
      "Shadow ×1. Cross-ref: crystal lantern immunity (sunlight-class). Connects R128 ↔ R136.",
  },
  3: {
    label: "Consumed Gallery",
    hint: "wall crystals blackened as if starved for years.",
    enemies: ["shadow", "shadow"],
    notes:
      "R136. DARK. Era 1. Shadows ×2; torch may last ~3 turns (tuning). Wall crystals blackened by long Shadow exposure. " +
      "Teaching: ordinary light starvation. Connects R135 ↔ R137.",
  },
  4: {
    label: "Crystal Vein",
    hint: "the seam glows on its own. the note says the salt refuses to go dark.",
    enemies: ["shadow"],
    notes:
      "R137. DARK — crystal faint internal glow (not Shadow-food). Era 1. Exposed deep salt vein; self-luminous crystals resist Shadow consumption — " +
      "glow reads as containment working; same formation that drew presence also armors against its echo. Treasure and barrier, one material. " +
      'Note quote: "These crystals don\'t go dark. The lamps die but the crystals keep glowing. Something in the salt itself." ' +
      "Loot: self-luminous salt crystal ×2; knowledge for crystal lantern recipe. Shadow ×1. Connects R136 ↔ R138.",
  },
  5: {
    label: "Crystal Forge",
    hint: "a miner bench, polish, mounts — everything to cage light in salt.",
    enemies: [],
    notes:
      "R138. DARK. Era 1. Miner workshop alcove: bench, polish, mounts. " +
      "CRAFT CRYSTAL LANTERN — requires: self-luminous crystal (R137), shuttered lantern, knowledge (R137 note OR Area 2 R48 mining/reflector docs OR reflector work R119–R120). " +
      "Output: sunlight-class light, immune to Shadow drain, shutterable like base lantern — key for Area 5 and Shadow backtrack. " +
      "Thematic: oldest mine matter + player's intent = light Shadows cannot eat; not imported sanctity. " +
      "Connects R137 ↔ R139.",
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
  },
  7: {
    label: "Shadow Heart",
    hint: "three absences circle you. ordinary light may not survive a single breath here.",
    enemies: ["shadow", "shadow", "shadow"],
    notes:
      "R140. DARK — max drain. Era 1. Darkest room; Shadows ×3; ordinary light can fail in one turn (tuning). " +
      "Crystal lantern dimmed but not killed. Walls fully stained black. Passage toward Sealed Chamber; sense of vast patience below — draw, not dialogue. " +
      "Loot: Shadow essence (alchemy). Toughest non-boss fight Area 4; lantern near-mandatory. " +
      "Connects R139 ↔ R141 (via exit). Cross-ref: demon pressure R141–R143.",
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
  desc: "Where light is food and the mine's oldest crystals still refuse to die.",
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
