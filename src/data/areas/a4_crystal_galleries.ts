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
      "Connects R116 (via drained tunnels exit), R118 geode, R119 reflector alpha; exits to drained / dig.",
    props: [
      {
        id: "maren_wall_scratch_r117",
        label: "Wall Scratch",
        icon: "\u{270D}\uFE0F",
        desc: "Letters gouged into salt with a nail or pick tip, impatient and tender: Beautiful down here. Wish Maren could see it.",
        gridPosition: { row: 5, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "read_maren_scratch_r117" },
          {
            type: "log",
            message: "Someone loved the depth enough to risk naming who they missed.",
          },
        ],
      },
    ],
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
      "Dead end off R117.",
    props: [
      {
        id: "geode_miner_note_r118",
        label: "Folded Miner's Note",
        icon: "\u{1F4DD}",
        desc: "Paper gone stiff with salt-dust. Block letters, afraid of being read: Foreman says keep digging. Could sell the walls. But it's warm down here and the walls hum.",
        gridPosition: { row: 1, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "read_geode_miner_note_r118" },
          {
            type: "log",
            message: "The foreman wants tonnage; the wall offers warmth. One of them is lying.",
          },
        ],
      },
      {
        id: "crystal_fragment_pile_r118",
        label: "Crystal Fragments",
        icon: "\u{1FA99}",
        desc: "Splinters of facet litter the floor like dropped stars. They still hold a trace of warmth — loose coin from a hall that hums when you breathe wrong.",
        gridPosition: { row: 2, col: 6 },
        actions: [
          {
            id: "gather",
            label: "Gather loose shards",
            effects: [
              { type: "grant_gold", amount: 15 },
              { type: "consume_prop" },
              {
                type: "log",
                message: "Fifteen gold in splinters — warm in the palm, gone from the wall.",
              },
            ],
          },
        ],
      },
      {
        id: "arm_sized_raw_crystals_r118",
        label: "Arm-Sized Salt Crystals",
        icon: "\u{1F48E}",
        desc: "Two faceted masses ready to break free — heavy enough to anchor a lamp, if you dare take from a wall that hums when struck.",
        gridPosition: { row: 1, col: 6 },
        condition: { notFlags: ["harvested_geode_crystals_r118"] },
        actions: [
          {
            id: "pry_loose",
            label: "Pry loose the crystals",
            effects: [
              { type: "set_flag", flag: "harvested_geode_crystals_r118" },
              { type: "set_flag", flag: "has_raw_salt_crystal" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Two heavy shards — enough to cage a flame or pay a debt, if you can stand taking from something that hums.",
              },
            ],
          },
        ],
      },
    ],
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
    props: [
      {
        id: "reflector_alpha_mirror_r119",
        label: "Polished Salt Reflector",
        icon: "\u{1FA9E}",
        desc: "A disk of pressed salt, polished until it thinks like glass — grime-caked, mounts loose, angle insulting the corridor it should serve. This is the first hinge of the old light-chain.",
        gridPosition: { row: 5, col: 8 },
        onExamine: [
          { type: "set_flag", flag: "examined_reflector_alpha_r119" },
          { type: "set_flag", flag: "knows_crystal_lantern_recipe" },
          {
            type: "log",
            message:
              "Clean it, square it, feed it real light — the disk remembers the old crews who bent daylight down a hole.",
          },
        ],
      },
    ],
  },
  5: {
    label: "Reflector Junction",
    hint: "three empty mounts stare down branching tunnels. order folios sketched this knot, if you ever saw them.",
    enemies: [],
    notes:
      "R120. DARK → lit when chain active. Era 1. Hub: three reflector mounts. " +
      "When all receive light from R119 and aim correctly: one toward R121, one toward R122, one optical link toward R139 (Shadow Depths — Master Array chain). " +
      "Physical rotation puzzles per mount. Enables Crystal Master Array when fully linked with R139 + sustained source (crystal lantern ideal). " +
      "Connects R119, R121, R122; puzzle ties to Area 2 R48 docs.",
    props: [
      {
        id: "triad_reflector_mounts_r120",
        label: "Three Reflector Mounts",
        icon: "\u{1FA9E}",
        desc: "Three skeletal yokes brace empty rings — one line should hit the vast columned hall, one the chamber with the big focusing stone, one a long hungry sightline toward the blacker workings. Bolt scars show where crews torqued by feel in smoke and dark.",
        gridPosition: { row: 5, col: 11 },
        onExamine: [
          { type: "set_flag", flag: "examined_reflector_junction_r120" },
          { type: "set_flag", flag: "knows_crystal_lantern_recipe" },
          {
            type: "log",
            message:
              "Three mirrors, three mouths — line them up and sun from the surface can walk farther than any torch.",
          },
        ],
      },
    ],
  },
  6: {
    label: "Grand Gallery",
    hint: "scale you cannot map — columns of salt swallow the ceiling. a chisel line sits shy of the crystal.",
    enemies: ["shadow", "shadow"],
    notes:
      "R121. DARK → LIT if reflectors from R120 reach here. Era 1. Largest natural crystal cavern; ceiling lost in dark. " +
      "Unmined upper alcoves run thick with columnar salt — lush, actively encroaching on old voids. Baron headings that did reach: walls thin, picked clean, spiritually hungry by contrast. " +
      "Shadows ×2 in depth; when lit, refracted cascade kills both — contrast undeniable: more crystal where nobody took. " +
      "Alt read: narrow unmined crawl visible from mined gallery — one side stripped, other choked with new growth. " +
      "Passage to R123 revealed only when this room is lit. Cross-ref: Ending 4 (Release) evidence — salt heals when taking stops.",
    props: [
      {
        id: "regrowth_survey_mark_r121",
        label: "Survey Mark on the Pillar",
        icon: "\u{1F4D0}",
        desc: "Chisel scar and faded ink: FACE — 4th span — Year of the Red Frost. The line was truth once. Now living crystal bulges a handspan past it — warm facets swallowing the old scar where nobody swung for years.",
        gridPosition: { row: 4, col: 14 },
        onExamine: [
          { type: "set_flag", flag: "read_regrowth_survey_mark_r121" },
          {
            type: "log",
            message:
              "The salt grew back past their ink. You can lay your palm on new crystal and feel it still warming.",
          },
        ],
      },
      {
        id: "grand_gallery_inscriptions_r121",
        label: "Ancient Mine Glyphs",
        icon: "\u{1F5DD}\uFE0F",
        desc: "Older miners carved warnings and boasts into the column feet — names, loads, small prayers. In honest light they read like a choir: we were here, we took, we feared what listened.",
        gridPosition: { row: 5, col: 15 },
        onExamine: [
          { type: "set_flag", flag: "read_grand_gallery_inscriptions_r121" },
          {
            type: "log",
            message:
              "Name on name, boast on boast — the column remembers every hand that swung for pay.",
          },
        ],
      },
      {
        id: "grand_gallery_crystal_hoard_r121",
        label: "Fallen Crystal Shards",
        icon: "\u{1FA99}",
        desc: "Fragments knocked loose by the salt's return glitter along a rib of stone — coin-bright, warm when you close your fist.",
        gridPosition: { row: 4, col: 15 },
        actions: [
          {
            id: "collect",
            label: "Collect the fragments",
            effects: [
              { type: "grant_gold", amount: 25 },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Twenty-five gold in luminous splinters — beautiful enough to make you forget the teeth in the dark.",
              },
            ],
          },
        ],
      },
    ],
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
    props: [
      {
        id: "array_nexus_focusing_crystal_r122",
        label: "Central Focusing Crystal",
        icon: "\u{1F48E}",
        desc: "A lens of salt grown, not blown — caught in brass claws and worm-gear. When the chain is honest, this stone drinks scatter and spits dawn down tunnels that forgot color.",
        gridPosition: { row: 7, col: 11 },
        onExamine: [
          { type: "set_flag", flag: "examined_array_nexus_r122" },
          {
            type: "log",
            message:
              "The hub stone — tie every mirror to it, feed it honest light, and the galleries forget how black they were.",
          },
        ],
      },
    ],
  },
  8: {
    label: "Crystal Seam",
    hint: "veins run blunt and young into the stone, as if the wound closed behind them.",
    enemies: [],
    notes:
      "R123. DARK (inherits gallery lighting if Master Array done). Era 1. Raw crystal veins; reinforces R121 teaching — " +
      "secondary growth in untouched roof/floor: blunt young terminations, not fracture-shattered. " +
      "Act of mining echoes theme; room still teaches healing in what remains. " +
      "Connects from lit Grand Gallery only.",
    props: [
      {
        id: "young_vein_terminations_r123",
        label: "Blunt Young Vein Ends",
        icon: "\u{1FAA8}",
        desc: "Crystal stops in rounded, almost soft tips — regrowth, not shatter. The seam looks like a scar closing.",
        gridPosition: { row: 4, col: 17 },
        onExamine: [
          { type: "set_flag", flag: "examined_secondary_growth_r123" },
          {
            type: "log",
            message: "The stone healed bluntly — no jagged theft-line, only patience.",
          },
        ],
      },
      {
        id: "mineable_crystal_seam_r123",
        label: "Thick Crystal Seam",
        icon: "\u{26CF}\uFE0F",
        desc: "Bulk salt crystal ready for maul or pick — enough to build a serious lantern heart, if you are willing to cut the living seam.",
        gridPosition: { row: 5, col: 18 },
        condition: { notFlags: ["harvested_crystal_seam_r123"] },
        actions: [
          {
            id: "mine_with_maul",
            label: "Drive the maul into the seam",
            requires: { flags: ["has_mining_maul"] },
            effects: [
              { type: "set_flag", flag: "harvested_crystal_seam_r123" },
              { type: "set_flag", flag: "has_raw_salt_crystal" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Four heavy masses break free — enough to cage a serious light — and the wall sighs like something wounded.",
              },
            ],
          },
          {
            id: "mine_with_pick",
            label: "Work the seam with a pick",
            requires: { flags: ["has_pickaxe"] },
            effects: [
              { type: "set_flag", flag: "harvested_crystal_seam_r123" },
              { type: "set_flag", flag: "has_raw_salt_crystal" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Pick iron frees four shards — enough to cage a flame in brass, if you forgive yourself the cut.",
              },
            ],
          },
        ],
      },
    ],
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
  desc: "The most beautiful halls in the mine — warm salt, humming seams, facets growing past old chisel scars. The mirrors still remember how to carry daylight underground.",
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
