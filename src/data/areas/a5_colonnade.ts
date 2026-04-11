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
    props: [
      {
        id: "colonnade_crystal_columns_r152",
        label: "Salt-Crystal Columns",
        icon: "\u{1F48E}",
        desc: "Translucent shafts from floor to ceiling, every facet etched until the stone looks like frozen choir music. In coldfire the glyphs swim; true flame or my crystal lantern pins them still — prayer and cipher braided until I cannot tell which line was meant to comfort and which to leash.",
        gridPosition: { row: 2, col: 7 },
        onExamine: [
          { type: "set_flag", flag: "read_colonnade_entrance_columns_r152" },
          {
            type: "log",
            message:
              "Each line reads like a vow until I follow the stroke — then it's a lock. I can't tell where worship ends and the latch begins.",
          },
        ],
      },
    ],
  },
  3: {
    label: "First Inscription",
    hint: "a wail rides the crystal; a ward circle hums against my boots.",
    enemies: ["banshee"],
    notes:
      "R153. Coldfire. Banshee ×1 bound to third column; distorted hymn wail. " +
      "Ward circle on floor — pass wrong geometry: 3 damage + brief stun (soft knowledge gate). " +
      "Combat alert: wail echoes through crystal — fight here can alert R154–R156 (audio propagation). " +
      "Teaching: ranged positioning; ward literacy rewards archive study.",
    props: [
      {
        id: "first_inscription_column_r153",
        label: "Third Column — First Duty",
        icon: "\u{1F4DD}",
        desc: "Letters spiral the crystal: THE FIRST DUTY: TO HOLD WHAT MUST NOT BE RELEASED. The stone hums against my palm — not warmth, obligation. Above, the banshee's orbit sketches a halo of wrong notes.",
        gridPosition: { row: 2, col: 11 },
        onExamine: [
          { type: "set_flag", flag: "read_first_inscription_column_r153" },
          {
            type: "log",
            message:
              "Hold what must not be released — carved like a kindness. I stand here wondering who the lock fed while it kept its promise.",
          },
        ],
      },
      {
        id: "ward_circle_floor_r153",
        label: "Ward Circle",
        icon: "\u{2B55}",
        desc: "Geometry burned into the floor — intersecting arcs that match no compass school I was taught on the surface. Step wrong and the air thickens; step true and the pressure lifts like a held throat released.",
        gridPosition: { row: 3, col: 11 },
        actions: [
          {
            id: "trace_safe_passage",
            label: "Trace the safe passage (ritual geometry)",
            desc: "Walk the path the archive's consecration transcripts traced — same angles, same shame, same breath between steps.",
            requires: { flags: ["read_consecration_rite_knowledge_r53"] },
            effects: [
              { type: "set_flag", flag: "crossed_ward_circle_safe_r153" },
              {
                type: "log",
                message:
                  "The angles line up with a transcript I read in candle-glow — shame and geometry, one hand correcting the other.",
              },
            ],
          },
          {
            id: "step_through_blindly",
            label: "Step through anyway",
            effects: [
              { type: "damage_player", amount: 3 },
              { type: "set_flag", flag: "crossed_ward_circle_hard_r153" },
              {
                type: "log",
                message:
                  "Salt-light bites — three rents of wrongness, then numb ringing in my joints. I'm through. Barely.",
              },
            ],
          },
        ],
      },
    ],
  },
  4: {
    label: "Banshee Row",
    hint: "two wails braid until my arms go heavy; the crystal carries every note like a knife.",
    enemies: ["banshee", "banshee"],
    notes:
      "R154. Coldfire. Banshees ×2; overlapping wails = dissonant harmony — 2 strength-drain / turn while both live (cumulative). " +
      "Ranged essential; without ranged, closing costs multiple drain turns. " +
      "MISSING: skullflower / ghost infection edge cases (notes only). " +
      "Optional: kill from R153 LOS through columns if geometry allows line of sight.",
    props: [
      {
        id: "binding_core_columns_r154",
        label: "Binding-Core Columns",
        icon: "\u{1F52F}",
        desc: "Here the inscriptions crowd until the crystal goes opaque with script — matrices of containment, coefficients of silence, marginalia that corrects itself in three hands. Every column I passed was another line in the same proof.",
        gridPosition: { row: 2, col: 15 },
        onExamine: [
          { type: "set_flag", flag: "read_binding_core_inscriptions_r154" },
          {
            type: "log",
            message:
              "The whole corridor is one long proof — coefficients, silences, corrections in three hands. They treated the world like a slate and the dead like figures carried forward.",
          },
        ],
      },
    ],
  },
  5: {
    label: "Second Inscription",
    hint: "one hand carved the vow; a tighter hand amended it underneath — same salt, colder patience.",
    enemies: [],
    notes:
      "R155. Coldfire. No enemies. Era 2 prayers + Era 3 necromantic overlay; lich handwriting beside order scribes. " +
      "Cross-ref: R156, R165 voice.",
    props: [
      {
        id: "second_inscription_column_r155",
        label: "Final Column Before the Sanctum",
        icon: "\u{1F4D6}",
        desc: "Two palimpsests share one cylinder. The first voice is cold, imposing: THE VIGIL DOES NOT END. THE KEEPER DOES NOT REST. THE SALT REMEMBERS. Beneath, smaller, less steady — a maintenance note that admits more than it means: WARD 7-NE RECALIBRATED. AHEAD OF SCHEDULE. THE SILENCE IS VERY COMPLETE TONIGHT. The same pen that carved duty scratched the loneliness between the lines.",
        gridPosition: { row: 2, col: 18 },
        onExamine: [
          { type: "set_flag", flag: "read_second_inscription_column_r155" },
          {
            type: "log",
            message: "They still run the wards — and still notice when the world goes quiet.",
          },
        ],
      },
    ],
  },
  7: {
    label: "Colonnade End",
    hint: "coldfire dies; ahead, darkness swallows scale until light proves otherwise.",
    enemies: [],
    notes:
      "R156. Coldfire → dark threshold. No enemies. Colonnade opens toward sanctum threshold. " +
      "Convention: grid 7 = return target from a5_sanctum (R161 path uses colonnade R156). Cross-ref: R157.",
    props: [
      {
        id: "threshold_glimmer_r156",
        label: "Darkness Beyond",
        icon: "\u{2728}",
        desc: "Coldfire strips end like a rule rescinded. Past the last column, black swallows distance — until my light catches a single stray glint, enormous, far, wrong in its patience. Something cathedral-sized waits without breathing.",
        gridPosition: { row: 2, col: 22 },
        onExamine: [
          { type: "set_flag", flag: "noticed_formation_glimmer_r156" },
          {
            type: "log",
            message:
              "One glint answers my light from farther than should be possible — big enough to swallow sound. Whatever waits past this isn't a room; it's a verdict with walls.",
          },
        ],
      },
    ],
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
      'Exit to a5_sanctum R157 (grid 2). Pair: sanctum "Back to Colonnade" → this area grid 7 (R156).',
  },
};

export const A5_COLONNADE: AreaDef = {
  id: "a5_colonnade",
  name: "Prayer Colonnade",
  desc: "The columns wear words I can feel in my teeth when the light is true — prayer and leash cut into the same crystal. The banshees keep the choir.",
  difficulty: 5,
  generator: "authored",
  authored: {
    grid: A5_COLONNADE_GRID,
    rooms: A5_COLONNADE_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
};
