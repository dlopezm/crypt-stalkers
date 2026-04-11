import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 5 — Founder's Reliquary — Prayer Colonnade (R152–R156)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 * Linear: R152 ↔ R153 ↔ R154 ↔ R155 ↔ R156; room 6 is isolated return stub to Outer Ward R151.
 */

// prettier-ignore
export const A5_COLONNADE_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  1,  6,  6,  0,  2,  2,  2,  2,  0,  3,  3,  3,  0,  4,  4,  4,  0,  5,  5,  0,  7,  7,  7,  0,  8,  8,  1], //  2
  [ 1,  1,  6,  6,  1,  2,  2,  2,  2,  1,  3,  3,  3,  1,  4,  4,  4,  1,  5,  5,  1,  7,  7,  7,  1,  8,  8,  1], //  3
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  4
];

export const A5_COLONNADE_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Colonnade Entrance",
    hint: "salt columns rise through coldfire; the carved words stay shy until real light finds them.",
    enemies: [],
    isStart: true,
    notes:
      "R152. Coldfire. No enemies. Salt-crystal columns floor to ceiling; text on every surface. " +
      "Condition: in coldfire alone inscriptions stay unreadable (light too low). " +
      "With true light (torch, lantern, crystal lantern): prayers become legible — interleaved with math and geometry. " +
      "Teaching beat: prayers ARE binding formulas; religion IS the machine (faith as operational spec). " +
      "Cross-ref: R151, R153. World-state: player must carry real light for full read.",
  },
  3: {
    label: "First Inscription",
    hint: "a wail rides the crystal; a ward circle hums at your boots.",
    enemies: ["banshee"],
    notes:
      "R153. Coldfire. Banshee ×1 bound to third column; distorted hymn wail. " +
      "Inscription: \"the first duty: to hold what must not be released.\" Ward circle on floor — pass wrong geometry: 3 damage + brief stun (soft knowledge gate). " +
      "Area 2 R53 ritual geometry = safe path (cross-ref). " +
      "Combat alert: wail echoes through crystal — fight here can alert R154–R156 (audio propagation). " +
      "Teaching: ranged positioning; ward literacy rewards archive study.",
  },
  4: {
    label: "Banshee Row",
    hint: "two voices braid into pain; the air pulls strength from your limbs.",
    enemies: ["banshee", "banshee"],
    notes:
      "R154. Coldfire. Banshees ×2; overlapping wails = dissonant harmony — 2 strength-drain / turn while both live (cumulative). " +
      "Columns carry densest binding core math. Ranged essential; without ranged, closing costs multiple drain turns. " +
      "MISSING: skullflower / ghost infection edge cases (notes only). " +
      "Optional: kill from R153 LOS through columns if geometry allows line of sight.",
  },
  5: {
    label: "Second Inscription",
    hint: "one hand precise, one hand tired — two eras arguing on the same stone.",
    enemies: [],
    notes:
      "R155. Coldfire. No enemies. Era 2 prayers + Era 3 necromantic overlay; lich handwriting beside order scribes. " +
      "Primary inscription (clinical): \"The vigil does not end. The keeper does not rest. The salt remembers.\" " +
      "Below, maintenance note (smaller, less precise): \"Ward 7-NE recalibrated. Ahead of schedule. The silence is very complete tonight.\" " +
      "Read: Serevic still runs schedules; loneliness leaks through logistics. Cross-ref: R156, R165 voice.",
  },
  7: {
    label: "Colonnade End",
    hint: "coldfire dies; ahead, darkness swallows scale until light proves otherwise.",
    enemies: [],
    notes:
      "R156. Coldfire → dark threshold. No enemies. Colonnade opens; ahead — darkness then, with light, faint glimmer of enormous crystal (formation foreshadow). " +
      "Convention: grid 7 = return target from a5_sanctum (R161 path uses colonnade R156). Cross-ref: R157.",
  },
  6: {
    label: "Back to Outer Ward",
    hint: "the gateward noise of elite plate, faint through worked salt.",
    enemies: [],
    exit: { toAreaId: "a5_outer_ward", toRoomGridId: 7 },
    notes:
      "Exit. Returns to Outer Ward R151 Inner Gate (grid 7). Pair: Outer Ward room 11 → colonnade grid 2 (R152).",
  },
  8: {
    label: "Into the Sanctum",
    hint: "grand salt masonry; the founding carving knows the shape of what waits inside.",
    enemies: [],
    exit: { toAreaId: "a5_sanctum", toRoomGridId: 2 },
    notes:
      "Exit to a5_sanctum R157 (grid 2). Pair: sanctum \"Back to Colonnade\" → this area grid 7 (R156).",
  },
};

export const A5_COLONNADE: AreaDef = {
  id: "a5_colonnade",
  name: "Prayer Colonnade",
  desc: "Prayers written as wards. Banshees hold the columns. Every line is binding.",
  difficulty: 5,
  generator: "authored",
  authored: {
    grid: A5_COLONNADE_GRID,
    rooms: A5_COLONNADE_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
};
