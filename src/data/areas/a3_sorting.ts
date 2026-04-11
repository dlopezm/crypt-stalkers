import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 3 — Ossuary — Sorting Halls (R80–R86). Grid: 2=R80 hub, 3=R81, 4=R82, 5=R83, 6=R84, 7=R85, 8=R86.
 * Exits: 11→threshold R79 (grid 5), 12→reanimation (grid 2), 13→bone stacks R93 (grid 2).
 */

// prettier-ignore
export const A3_SORTING_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 13, 13, 13,  1,  1,  1,  1,  1,  1], //  2  exit→bone stacks
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1, 13, 13, 13,  1,  1,  1,  1,  1,  1], //  3
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], //  4  R13↔vertical shaft
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], //  5  R81
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], //  7
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], //  8  R81↔R80 (col 12) + shaft
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1], //  9
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  1,  1,  1,  1,  5,  5,  5,  5,  5,  0,  6,  6,  6,  1], // 10  hub north stub for R81 shaft
  [ 1,  1, 11, 11,  0,  4,  4,  4,  0,  2,  2,  2,  2,  2,  2,  2,  0,  5,  5,  5,  5,  5,  1,  6,  6,  6,  1], // 11
  [ 1,  1, 11, 11,  1,  4,  4,  4,  1,  2,  2,  2,  2,  2,  2,  2,  1,  5,  5,  5,  5,  5,  1,  6,  6,  6,  1], // 12
  [ 1,  1,  1,  1,  1,  4,  4,  4,  1,  2,  2,  2,  2,  2,  2,  2,  1,  5,  5,  5,  5,  5,  1,  6,  6,  6,  1], // 13
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  2,  2,  2,  2,  1,  5,  5,  5,  5,  5,  1,  1,  1,  1,  1], // 14
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 15  R80↔R85
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 16
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 17
  [ 1,  1,  1,  1,  1,  1,  1,  1, 12,  0,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 18  exit reanim↔R85
  [ 1,  1,  1,  1,  1,  1,  1,  1, 12, 12,  7,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 19
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 20  R85↔R86
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  8,  8,  8,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 21
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  8,  8,  8,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 22
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 23
];

export const A3_SORTING_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Sorting Gallery",
    hint: "a factory floor of bone and conveyor shadow; something on a platform shouts orders.",
    enemies: [
      "skeleton",
      "skeleton",
      "skeleton",
      "zombie",
      "zombie",
      "zombie",
      "zombie",
      "necromancer",
    ],
    isStart: true,
    isBoss: true,
    notes:
      "R80. Era 3. DARK. Vast room: bone conveyors, sorting lines; zombies sort by type, skeletons in aisles, necromancer ×1 on raised platform — factory thesis, first full throughput hit. " +
      "Skeletons ×3, zombies ×4, necromancer ×1. Occasional zombie drifts toward R83 / deeper egress until necromancer snaps orders (What Lies Below drift). " +
      "Teaching: kill necromancer first (e.g. crossbow) → zombies inert; hierarchy. Platform = back-row target; ranged optimal. " +
      "Noise masks movement and ghoul footsteps in conveyor hall. Environmental thread: dead pulled downward; necromancers redirect labor.",
  },
  3: {
    label: "Tag Station",
    hint: "shelves of tags whisper names you were never meant to read here.",
    enemies: ["zombie", "zombie"],
    notes:
      "R81. Era 3. DARK. Small inscription room; shelves of bone tags (names, dates, origins). Zombies ×2. " +
      "The greed frame: player's ancestor was indentured (contracts Area 1 R4); died in collapse; recovery crews claimed remains for processing — three eras' greed billed to one body; they chose none of it. " +
      "Tag with bloodline: [ASHVERE], recovered from collapse gallery, processed [date]. Bones likely in R95/R96, still in the machine. " +
      "ANCESTOR'S BONE TAG — emotional beat; unlocks lich dialogue: \"You're sitting on my family's bones.\" High impact, minimal combat; the tag is the scene.",
  },
  4: {
    label: "Classification Room",
    hint: "graded piles; the dark between them has teeth if you shut the light.",
    enemies: ["ghoul"],
    notes:
      "R82. Era 3. DARK. Bone quality classification — grading the taken. Ghoul ×1 hidden on entry if lantern shut / no true light (ambush); open lantern → visible crouched behind bone pile. " +
      "Contains: classification manual (lich grading system); bone meal (alchemy).",
  },
  5: {
    label: "Conveyor Hall",
    hint: "a long run of track and rattle; noise swallows smaller sounds.",
    enemies: ["skeleton", "skeleton", "zombie", "zombie", "zombie"],
    notes:
      "R83. Era 3. DARK. Long corridor; bone conveyors full length; zombies feed lines; skeletons escort. Skeletons ×2, zombies ×3. " +
      "Noise masks movement and ghoul footsteps. Drift: skeleton may linger at R93 mouth before patrol snaps into route. " +
      "Connects to R80, R84 (rejection heap), reanimation wing (R87).",
  },
  6: {
    label: "Rejection Heap",
    hint: "refuse and rats; something larger hunts the edges.",
    enemies: ["rat", "rat", "rat", "rat", "rat", "rat", "ghoul"],
    notes:
      "R84. Era 3. DARK. Discard pile of damaged/unsuitable bone — waste from the efficient line. Rats ×6, ghoul ×1 at edges. Stench implied. " +
      "Loot: 12 gold buried in refuse; bone shards (throwable distractions). Dead end off R83.",
  },
  7: {
    label: "Foreman's Post",
    hint: "coldfire over quotas and a resonator that hums wrong.",
    enemies: ["necromancer", "zombie", "zombie"],
    notes:
      "R85. Era 3. COLDFIRE (brighter). Overseer's desk; processing quotas; bone resonator links toward Area 2 Chapter House (R56). Necromancer ×1, zombies ×2. " +
      "Logs: redirected labor — workers lost to downward tendency, quotas adjusted. " +
      "Loot: quotas (lore); bone resonator — destroy to delay alerts from this section; 18 gold.",
  },
  8: {
    label: "Side Processing",
    hint: "damp warmth; wrong motion in the host corpse.",
    enemies: ["zombie", "gutborn_larva", "gutborn_larva"],
    notes:
      "R86. Era 3. DARK. Gutborn-infested zombie host (enemy type gutborn not in data — represented as zombie + gutborn_larva ×2). Wrong movement; larvae on floor seeking hosts; warm damp. " +
      "Larvae redirect: lure larva to necromancer (e.g. R85) → infected necromancer becomes gutborn, loses command, zombies inert (high risk). Larva on player lethal if unseen. Infestation evidence (lore).",
  },
  11: {
    label: "To Funerary Threshold",
    hint: "stairs and thinner industry above.",
    enemies: [],
    exit: { toAreaId: "a3_threshold", toRoomGridId: 5 },
    notes:
      "Return to R79 Descent Steps (threshold grid 5). Pair: threshold exit to sorting lands grid 2 (R80).",
  },
  12: {
    label: "To Reanimation Wing",
    hint: "circles glow somewhere ahead; the air tastes of binding.",
    enemies: [],
    exit: { toAreaId: "a3_reanimation", toRoomGridId: 2 },
    notes:
      "To R87 Ritual Circle Alpha. Pair: reanimation exit returns conveyor R83 (sorting grid 5).",
  },
  13: {
    label: "To Bone Stacks",
    hint: "storage towers close overhead; cart ruts bite the floor.",
    enemies: [],
    exit: { toAreaId: "a3_bone_stacks", toRoomGridId: 2 },
    notes: "To R93 Stack Entrance. Pair: bone stacks exit to conveyor returns sorting grid 5.",
  },
};

export const A3_SORTING: AreaDef = {
  id: "a3_sorting",
  name: "Sorting Halls",
  desc: "Throughput made walkable: conveyors, tags, and the cost of every bone.",
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
    ],
    hint: "a factory floor of bone and conveyor shadow; something on a platform shouts orders.",
  },
  hiddenFromTown: true,
  notes:
    "Ossuary subarea 2: industrial bone processing; lantern-shutter rhythm vs patrols. " +
    "Environmental drift toward lower exits; necromancers snap workers back on task.",
};
