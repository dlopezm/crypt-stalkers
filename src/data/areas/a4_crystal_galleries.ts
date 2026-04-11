import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 4 — Crystal Galleries (R117–R123), difficulty 4.
 * Grid: 2=R117, 3=R118, 4=R119, 5=R120, 6=R121, 7=R122, 8=R123; 9=exit drained; 10=exit dig.
 * Each hub spoke uses an isolated corridor segment (no clique from shared 0-components).
 */

// prettier-ignore
export const A4_CRYSTAL_GALLERIES_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  9,  9,  0,  2,  2,  0,  4,  4,  0,  5,  5,  0,  6,  6,  0,  8,  8,  1],
  [ 1,  1,  9,  9,  0,  2,  2,  0,  4,  4,  0,  5,  5,  0,  6,  6,  0,  8,  8,  1],
  [ 1,  1,  1,  1,  1,  2,  2,  1,  1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  2,  2,  1,  1,  1,  1,  7,  7,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  2,  2,  1,  1,  1,  1,  7,  7,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1, 10, 10,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1, 10, 10,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
];

export const A4_CRYSTAL_GALLERIES_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Crystal Entrance",
    hint: "old tool marks glitter with new facets. the air tastes dry and sharp.",
    enemies: [],
    isStart: true,
    notes:
      "R117. DARK. Era 1. Tunnel widens; crystals multiply. " +
      "First regrowth teaching: old tool marks and abandoned cracks show small new facets — glassy, younger than scored stone; fresh growth in seams picks never finished. " +
      "Player light refracts — prismatic wash; air dry and clean. " +
      "Miner wall scratch (exact): \"Beautiful down here. Wish Maren could see it.\" " +
      "Connects R116 (via drained tunnels exit), R118 geode, R119 reflector alpha; exits to drained / dig.",
  },
  3: {
    label: "Geode Chamber",
    hint: "a split cavern armored in warm, humming salt. shapes wheel above the dark.",
    enemies: [],
    notes:
      "R118. DARK. Era 1. Natural cavern; massive geode split by mining — deep salt in miniature. " +
      "Crystals warm to touch, faintly self-luminous; struck crystals resonate (low hum). " +
      "Teaching: the thing worth selling is what the wall holds back; presence refines what it touches. " +
      "MISSING enemy: bats ×4 (see in dark; blocked by doors). " +
      "Loot: raw salt crystal ×2 (lantern crafting); ~15 gold crystal fragments. " +
      "Miner note quote: \"Foreman says keep digging. Could sell the walls. But it's warm down here and the walls hum.\" " +
      "Dead end off R117.",
  },
  4: {
    label: "Reflector Alpha",
    hint: "a pivoted mirror of polished salt, filthy and canted wrong. something thin lives in the corners.",
    enemies: ["shadow"],
    notes:
      "R119. DARK → LIT if array restored. Era 1. First reflector: pivoted polished salt mirror, grimy, misaligned. " +
      "Shadow ×1 nests in long dark. Puzzle: clean + align + feed light (torch/lantern); beam bounces down-corridor; Shadow hurt/flees; room transforms LIT. " +
      "Teaching beat: Shadow drain vs need for light — angle dim light through mirror, burn torch, or return with crystal lantern (R138). " +
      "Cross-ref: alignment diagrams Area 2 R48. Connects R117 ↔ R120.",
  },
  5: {
    label: "Reflector Junction",
    hint: "three empty mounts stare down branching tunnels. diagrams could live in Area 2 R48.",
    enemies: [],
    notes:
      "R120. DARK → lit when chain active. Era 1. Hub: three reflector mounts. " +
      "When all receive light from R119 and aim correctly: one toward R121, one toward R122, one optical link toward R139 (Shadow Depths — Master Array chain). " +
      "Physical rotation puzzles per mount. Enables Crystal Master Array when fully linked with R139 + sustained source (crystal lantern ideal). " +
      "Connects R119, R121, R122; puzzle ties to Area 2 R48 docs.",
  },
  6: {
    label: "Grand Gallery",
    hint: "scale you cannot map — columns of salt swallow the ceiling. a chisel line sits shy of the crystal.",
    enemies: ["shadow", "shadow"],
    notes:
      "R121. DARK → LIT if reflectors from R120 reach here. Era 1. Largest natural crystal cavern; ceiling lost in dark. " +
      "Unmined upper alcoves run thick with columnar salt — lush, actively encroaching on old voids. Baron headings that did reach: walls thin, picked clean, spiritually hungry by contrast. " +
      "Shadows ×2 in depth; when lit, refracted cascade kills both — contrast undeniable: more crystal where nobody took. " +
      "REGROWING SALT proof: chisel mark + faded ink on pillar — \"FACE — 4th span — Year of the Red Frost\" (~400 years); crystal surface now protrudes a handspan past the line. " +
      "Alt read: narrow unmined crawl visible from mined gallery — one side stripped, other choked with new growth. " +
      "Loot when lit: ancient mine inscriptions; 25 gold crystal fragments; awe/scale read. " +
      "Passage to R123 revealed only when this room is lit. Cross-ref: Ending 4 (Release) evidence — salt heals when taking stops.",
  },
  7: {
    label: "Array Nexus",
    hint: "focusing crystal and heavy wheels — the heart of the old array.",
    enemies: ["shadow", "shadow"],
    notes:
      "R122. DARK → permanent LIT if Master Array complete. Era 1. Hub of miners' reflector system: large mounts, wheels, central focusing crystal. " +
      "Full restore = chain R119 → R120 → R139 plus local alignment + sustained source. " +
      "BONUS — Crystal Master Array payoff: daylight-equivalent permanent light through Crystal Galleries and Shadow Depths (R135–R140); Shadows there die; hidden paths/inscriptions exposed. " +
      "Highest puzzle complexity. Dead end / bonus branch from R120.",
  },
  8: {
    label: "Crystal Seam",
    hint: "veins run blunt and young into the stone, as if the wound closed behind them.",
    enemies: [],
    notes:
      "R123. DARK (inherits gallery lighting if Master Array done). Era 1. Raw crystal veins; reinforces R121 teaching — " +
      "secondary growth in untouched roof/floor: blunt young terminations, not fracture-shattered. " +
      "Loot: raw salt crystal ×4 (primary lantern bulk); raw salt; mineable crystal wall (mining maul / pickaxe) — act of taking echoes theme; room still teaches healing in what remains. " +
      "Connects from lit Grand Gallery only.",
  },
  9: {
    label: "Back toward drained tunnels",
    hint: "wet air leaks from the pumped galleries behind you.",
    enemies: [],
    exit: { toAreaId: "a4_drained_tunnels", toRoomGridId: 7 },
  },
  10: {
    label: "Toward the abandoned dig",
    hint: "coldfire smear on the wall — a camp was here.",
    enemies: [],
    exit: { toAreaId: "a4_abandoned_dig", toRoomGridId: 2 },
  },
};

export const A4_CRYSTAL_GALLERIES: AreaDef = {
  id: "a4_crystal_galleries",
  name: "Crystal Galleries",
  desc: "Living salt: facets regrow in abandoned seams, and mirrors remember how to carry light.",
  difficulty: 4,
  generator: "authored",
  authored: {
    grid: A4_CRYSTAL_GALLERIES_GRID,
    rooms: A4_CRYSTAL_GALLERIES_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
  notes:
    "Area 4 Subarea 2 — regrowing salt proof, reflector puzzles, Master Array bonus. " +
    "Light system: sunlight/crystal arrays full protection; crystal lantern (R138) counts as sunlight vs Shadow drain. " +
    "Emotional beat: awe + revelation (profit = peril; earth heals when teeth withdraw).",
};
