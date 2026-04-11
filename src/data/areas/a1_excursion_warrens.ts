import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 1 — Excursion Warrens (R19–R23)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * Connectivity (per design doc):
 *   exit7(upper galleries) ↔ R19(entrance) ↔ R20(dig face, dead end)
 *                                           ↔ R21(cache) ↔ R22(collapse, dead end)
 *                                           ↔ R23(surface breach, dead end — long tunnel)
 */

// prettier-ignore
export const A1_EXCURSION_WARRENS_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1  exit7 (upper galleries)
  [ 1,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3  exit7→R19
  [ 1,  2,  2,  2,  0,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  4  R19→R20
  [ 1,  2,  2,  2,  1,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  5
  [ 1,  2,  2,  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  7  R19→R21 corridor
  [ 1,  4,  4,  4,  0,  5,  5,  5,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  8  R21→R22
  [ 1,  4,  4,  4,  1,  5,  5,  5,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  9
  [ 1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 10  R19→R23 long corridor
  [ 1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 11
  [ 1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  6,  6,  1], // 12  long tunnel to R23
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  6,  6,  1], // 13
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 14
];

export const A1_EXCURSION_WARRENS_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Warren Entrance",
    hint: "new-cut props bite wet earth. something dead-heavy drags salt sacks deeper in, same gait, no rest.",
    enemies: ["zombie", "zombie"],
    isStart: true,
    notes:
      "R19. Era 3 excavation. DARK. " +
      "Zombies haul salt sacks inward — non-hostile unless struck. " +
      "Supply chain reveal: undead economy visible.",
  },
  3: {
    label: "Dig Face",
    hint: "iron heads jammed in clay like they were dropped mid-swing. prints of bone in the mud — circling, waiting.",
    enemies: [],
    notes: "R20. Era 3. DARK. Dead end. " + "Implies ongoing expansion elsewhere in the vault.",
    props: [
      {
        id: "dig_face_picks",
        label: "Pickaxes in the Clay",
        icon: "\u{26CF}\uFE0F",
        desc: "Handles slick with seepage; heads wedged where someone meant to swing again. Rings of bone-toe marks stamp the mud — tight, patient, as if the diggers stepped aside but never left.",
        gridPosition: { row: 4, col: 6 },
        actions: [
          {
            id: "take",
            label: "Work one free",
            effects: [
              { type: "set_flag", flag: "has_pickaxe" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "The haft's coarse; the point's honest. Ugly for a fight, useful when stone or ribcage won't move.",
              },
            ],
          },
        ],
      },
    ],
  },
  4: {
    label: "Supply Cache",
    hint: "heaped theft: wax, salt, someone's silver plate — and a living thief nursing real flame.",
    enemies: ["rat", "rat", "rat", "grave_robber"],
    notes:
      "R21. Era 3 widened chamber. DARK. " +
      "Grave Robber loots by torch (true light). Flees toward R22 if spotted. " +
      "Robber surrenders if cornered in R22: 'There's a sealed wing off the junction — old family stuff. The skeletons don't go in there.' (Points to R24.)",
    props: [
      {
        id: "stolen_goods",
        label: "Heap of Taken Things",
        icon: "\u{1F4E6}",
        desc: "Rough salt crusted to altar wax, a bent spoon, a child's shoe — none of it sorted, all of it hurried. On top, a receipt for a cellar's winter salt, signed by a mayor whose hand shook. The surface raids aren't rumor; they're inventory.",
        gridPosition: { row: 8, col: 2 },
        actions: [
          {
            id: "search",
            label: "Dig through it",
            effects: [
              { type: "grant_gold", amount: 20 },
              { type: "set_flag", flag: "read_salt_cellar_receipt" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Twenty coins in mixed coin, stubs of tallow, the receipt folded like someone meant to burn it later. You pocket the money and keep the paper — evidence tastes like bile.",
              },
            ],
          },
        ],
      },
    ],
  },
  5: {
    label: "Collapsed Tunnel",
    hint: "broken props knit a trap of splinters. wet eyes wink between the gaps.",
    enemies: ["rat", "rat", "rat", "rat", "rat"],
    notes:
      "R22. Era 3 collapse. DARK. Dead end. " +
      "CLEARING NESTS reduces/stops breeding IN THIS ROOM (no clearing mechanic yet). " +
      "Flee target for R21 robber.",
  },
  6: {
    label: "Surface Breach",
    hint: "a tear in the hill lets wind and winter fields through. mud carries prints toward the light.",
    enemies: [],
    notes:
      "R23. Era 3. LIT (daylight). Dead end — long tunnel. " +
      "SAFE ROOM (sun). Exit to wilderness — NOT toward town.",
    props: [
      {
        id: "skeletal_tracks",
        label: "Mud Prints Toward Daylight",
        icon: "\u{1F43E}",
        desc: "Toe-bone arcs pressed deep, going out more often than in. The clay at the lip is still wet — last night's rain caught fresh edges. Whatever uses this hole treats open air like a highway.",
        gridPosition: { row: 12, col: 14 },
      },
    ],
  },
  7: {
    label: "To Upper Galleries",
    hint: "timber ends at dressed salt and cracked plaster; that green glare waits beyond.",
    enemies: [],
    exit: { toAreaId: "a1_upper_galleries", toRoomGridId: 4 },
  },
};

export const A1_EXCURSION_WARRENS: AreaDef = {
  id: "a1_excursion_warrens",
  name: "Excursion Warrens",
  desc: "Rough new tunnels — not your family's neat cuts — where something drags salt toward a rip in the hillside and the world above.",
  difficulty: 1,
  generator: "authored",
  authored: {
    grid: A1_EXCURSION_WARRENS_GRID,
    rooms: A1_EXCURSION_WARRENS_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
  notes:
    "Fresh Era 3 digs: raw earth, timber, no salt-block finesse. " +
    "Tunnels the order never authorized; lich's route toward surface supply. " +
    "Grave robber in R21 provides intel about Baron's Wing if cornered. " +
    "Surface breach (R23) shows undead surface raids are real — long tunnel conveys isolation.",
};
