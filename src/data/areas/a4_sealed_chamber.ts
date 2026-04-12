import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 4 - Sealed Chamber (R141–R145), difficulty 5.
 * Grid: 2=R141, 3=R142, 4=R143, 5=R144, 6=R145; 7=exit shadow R140 (grid 7); 8=descend a5 (pairs R146).
 * Ward hub uses separate 0 legs to seal, shaft, observation - no single 0-cell touches 3+ room IDs.
 */

// prettier-ignore
export const A4_SEALED_CHAMBER_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 6, 6, 0, 3, 3, 0, 5, 5, 0, 8, 8, 1, 1, 1],
 [ 1, 1, 6, 6, 0, 3, 3, 0, 5, 5, 0, 8, 8, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const A4_SEALED_CHAMBER_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Antechamber",
    hint: "salt grows in wrong curves. carved line: BEYOND THIS POINT, THE VIGIL KEEPS.",
    description:
      "Salt grows in curved lobes, not straight seams. Warm on your face; cold along your back. Light edges smear; no wind. Low vibration in the stone you feel more than hear.",
    enemies: [],
    isStart: true,
    notes:
      "R141. DARK. Era 1 + 2. Salt grows asymmetric / organic - wrong geometry. Heavy air. " +
      "Light flickers oddly (not Shadow drain). Edge whispers as impressions: warmth, pull, weight - not a voice negotiating. " +
      "Ambient demon pressure only. " +
      "Connects R140 (shadow exit) ↔ R142 ward hall.",
    props: [
      {
        id: "vigil_carved_line_r141",
        label: "Carved Order Line",
        icon: "\u{1F58B}\uFE0F",
        desc: "Letters bitten deep into salt: BEYOND THIS POINT, THE VIGIL KEEPS. The chisel slipped once - a hairline like a warning inside a warning.",
        gridPosition: { row: 10, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "read_vigil_line_r141" },
          {
            type: "log",
            message: "The brothers carved forever into salt - as if stone owed them the word.",
          },
        ],
      },
      {
        id: "wrong_geometry_salt_r141",
        label: "Wrong-Curve Growth",
        icon: "\u{1F9C2}",
        desc: "Salt should grow in hunger-straight lines here; instead it curls like muscle memory from something that never had bones. Touch brings warmth without comfort.",
        gridPosition: { row: 11, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "examined_wrong_salt_geometry_r141" },
          {
            type: "log",
            message: "Pressure without personhood - impressions brushing your nerves like dust.",
          },
        ],
      },
    ],
  },
  3: {
    label: "Ward Hall",
    hint: "binding marks climb every surface. the air pushes back gently.",
    description:
      "Sigils and carved text from floor to ceiling. Salt holds faint heat. Step forward and the air pushes back lightly on your chest. Sound is muffled.",
    enemies: [],
    notes:
      "R142. DARK. Era 2. Salt-block corridor: binding formulae, prayer, math sigils floor to ceiling. " +
      "Wards active - faint pushback, not hard block. Finest order craft - supplement to geology, not substitute. " +
      "Connects R141 ↔ R143 seal, R144 shaft head, R145 observation.",
    props: [
      {
        id: "ward_hall_sigils_r142",
        label: "Layered Wards",
        icon: "\u{1F52F}",
        desc: "Prayer braided into geometry - sigils climbing floor to ceiling like frost that learned arithmetic. The air resists your stride: not a wall, a polite refusal. Salt did the first holding; these marks only argue with the stone.",
        gridPosition: { row: 5, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "read_ward_hall_sigils_r142" },
          {
            type: "log",
            message:
              "Chant and line-work stacked on salt - as if ink could stretch what the earth already bears.",
          },
        ],
      },
    ],
  },
  4: {
    label: "The Seal",
    hint: "salt columns ring a floor sigil. hairline cracks breathe warmth from below.",
    description:
      "Round chamber. Ring of thick salt columns around a floor sigil worn smooth. Columns warm to the touch, almost glowing from inside. Hairline cracks at the center; fine dust jumps there on a slow beat. Heat rises through the floor in waves as you move in. Corners and sightlines do not quite line up.",
    enemies: [],
    notes:
      "R143. DARK. Era 2. Circular chamber; floor sigil; ring of salt columns. Center: stress - hairline cracks, dust, warmth from below. " +
      "Vast, patient presence - draw, not rant; not cartoon mind. " +
      "MAJOR DECISION - Demon seal (props capture Study / Strengthen / Break flags; MISSING demon enemy + combat when broken; three-turn ritual pacing is encounter-script). " +
      "Dead end branch off R142 until decision resolved.",
    props: [
      {
        id: "demon_seal_inscriptions_r143",
        label: "Order Inscriptions at the Ring",
        icon: "\u{1F5DD}\uFE0F",
        desc: "Carved testimony in a hand too steady to be kind: the pale brothers layered prayer on what the salt already held. Every heading thinned the wall; their marks bought years. The letters admit what nobody wanted carved - when the picks stop, the crystal returns. When the dead keep walking, something else cracks. Forever is a word men like; the vein only knows rest and hunger.",
        gridPosition: { row: 2, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "read_demon_seal_inscriptions_r143" },
          {
            type: "log",
            message:
              "You read until your mouth goes dry - faith, numbers, and fear all cut by the same tool.",
          },
        ],
      },
      {
        id: "demon_seal_nexus_r143",
        label: "Stressed Seal Heart",
        icon: "\u{1F300}",
        desc: "Floor sigil underfoot; salt columns like teeth around a mouth forced shut. At the center, hairline cracks breathe warmth - dust jumping to a rhythm too slow to be heartbeat. Weight pools in your knees; want brushes your thoughts without a face. Not a voice - pressure, patient as bedrock.",
        gridPosition: { row: 3, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "demon_seal_center_examined_r143" },
          {
            type: "log",
            message: "Warmth without kindness - pull without a face.",
          },
        ],
        actions: [
          {
            id: "study_seal",
            label: "Study the seal calmly",
            desc: "Kneel until the warmth, dust, and ring of columns sort into sense - not comfort, clarity.",
            requires: { notFlags: ["demon_seal_studied_r143", "demon_seal_broken_r143"] },
            effects: [
              { type: "set_flag", flag: "demon_seal_studied_r143" },
              { type: "set_flag", flag: "lich_dialogue_deep_geology_unlocked" },
              {
                type: "log",
                message:
                  "It is not a mind down there - it is weight that learned patience. Salt stacks calm around it when the picks go quiet. Chew the walls and the shell thins; keep the dead walking and new hairlines open. The watcher upstairs wrote the same story in ink.",
              },
            ],
          },
          {
            id: "strengthen_seal",
            label: "Perform the strengthening rite",
            desc: "Blessing, raw salt pressed into the hairlines, breath after breath until the sigil stops trembling.",
            requires: {
              flags: ["has_consecration", "has_raw_salt_crystal"],
              notFlags: ["demon_seal_strengthened_r143", "demon_seal_broken_r143"],
            },
            effects: [
              { type: "set_flag", flag: "demon_seal_strengthened_r143" },
              { type: "set_flag", flag: "has_raw_salt_crystal", value: false },
              {
                type: "log",
                message:
                  "Salt knits; the warm breath underfoot steadies. The deep should feel lighter - and Serevic's borrowed flesh may pay for every hour you bought the stone.",
              },
            ],
          },
          {
            id: "break_seal",
            label: "Shatter the salt columns",
            desc: "Bring iron to the teeth of the ring - let whatever waits rise.",
            requires: { notFlags: ["demon_seal_broken_r143"] },
            effects: [
              { type: "set_flag", flag: "demon_seal_broken_r143" },
              { type: "set_flag", flag: "demon_released_from_seal_r143" },
              { type: "set_flag", flag: "ending_return_seal_intact_locked" },
              {
                type: "log",
                message:
                  "Columns scream like glass. Something vast uncurls below - not grateful, not hurried. Whatever hope needed this ring intact dies with the salt.",
              },
            ],
          },
        ],
      },
    ],
  },
  5: {
    label: "Miner's Shaft Head",
    hint: "black drop into the deep. rope from the equipment store, or a repaired winch.",
    description:
      "Iron staples and timber frame a straight vertical drop. Cold air wells up; warmth still hits your back from the halls behind. Headframe creaks. Kicked pebbles fall a long time before you hear them hit.",
    enemies: [],
    notes:
      "R144. DARK. Era 1 + 2. Top of deepest historic shaft; vertical drop to natural cavern (Area 5 R146). " +
      "Order-sheathed walls; original miner route. Progression gate: rope (R125 or other source) OR repaired lift (mining maul on broken winch). Quieter path than Area 3 R99 Lich's Ward. " +
      "Cross-area: a5_outer_ward return lands grid 5 (this room) per pair rule. Connects R142 ↔ exit 8 (descend).",
    props: [
      {
        id: "shaft_head_drop_r144",
        label: "Black Shaft Mouth",
        icon: "\u{2B07}\uFE0F",
        desc: "Air rises cold from a throat cut before the order existed. Iron staples and salt-sheathed guides show the original miner route - plain vertigo, nothing poetic about it.",
        gridPosition: { row: 5, col: 8 },
        onExamine: [
          { type: "set_flag", flag: "examined_miner_shaft_head_r144" },
          {
            type: "log",
            message:
              "Rope from the forward supply cache, or a winch coaxed back to life - either way, your weight goes down that throat.",
          },
        ],
      },
      {
        id: "broken_winch_r144",
        label: "Broken Winch",
        icon: "\u{2699}\uFE0F",
        desc: "Gears split, chain snarled - something heavy panicked here. A maul could persuade the axle true again, if you are willing to announce yourself with noise.",
        gridPosition: { row: 6, col: 9 },
        condition: { notFlags: ["repaired_shaft_winch_r144"] },
        actions: [
          {
            id: "repair_with_maul",
            label: "Free the winch with the mining maul",
            requires: { flags: ["has_mining_maul"] },
            effects: [
              { type: "set_flag", flag: "repaired_shaft_winch_r144" },
              { type: "consume_prop" },
              {
                type: "log",
                message: "Iron shrieks, then yields - the winch turns, grudging but usable.",
              },
            ],
          },
        ],
      },
    ],
  },
  6: {
    label: "Observation Post",
    hint: "a slit frames the seal chamber. a log ties thinning headings to new cracks after Serevic's dead walked.",
    description:
      "Small watch room. Narrow slit into the round chamber - you see columns, sigil, heat shimmer; almost no sound through the wall. Salt crust on the walls. Warmth bleeds through the rock from the seal side.",
    enemies: [],
    notes:
      "R145. DARK. Era 2 + lich annotations. Slit view toward R143. " +
      "Player synthesis (esp. after seal Study + Crystal Galleries): barrier thins when mine eaten, eases when taking stops; lich maintenance buys time while undeath frays seal; R143 cracks rhyme with log. " +
      "Dead end.",
    props: [
      {
        id: "observation_log_r145",
        label: "Observation Log",
        icon: "\u{1F4D6}",
        desc: "Order pages, then lich margins. Early hand: No change. - geology doing most of the holding. Later, as headings chewed deeper: Slight thinning, NE quadrant. Then Serevic's ink: Barrier stabilized. Wards reinforced. Same book, a few pages on: Cracks. Expanding. The handwriting tightens - pride, then fear.",
        gridPosition: { row: 5, col: 2 },
        onExamine: [
          { type: "set_flag", flag: "read_observation_log_r145" },
          {
            type: "log",
            message:
              "Same story as the ring under your boots: headings gnawed the wall thin; quiet years let salt return; Serevic's hand steadied the ink while new cracks opened anyway.",
          },
        ],
      },
      {
        id: "observation_post_coin_purse_r145",
        label: "Dropped Coin Purse",
        icon: "\u{1FA99}",
        desc: "Cloth slimy with salt-drip - a watcher fled mid-shift or simply forgot mortality pays poorly.",
        gridPosition: { row: 6, col: 2 },
        actions: [
          {
            id: "take",
            label: "Take the coins",
            effects: [
              { type: "grant_gold", amount: 10 },
              { type: "consume_prop" },
              { type: "log", message: "Ten gold - hazard pay never collected." },
            ],
          },
        ],
      },
      {
        id: "observation_slit_r145",
        label: "Slit Toward the Seal",
        icon: "\u{1F441}\uFE0F",
        desc: "A knife-cut view of the circular chamber - columns, sigil, the patient cracks breathing heat. Watching does not make you safer; it only proves someone wanted witnesses afraid.",
        gridPosition: { row: 5, col: 3 },
        onExamine: [
          { type: "set_flag", flag: "examined_observation_slit_r145" },
          { type: "log", message: "The seal looks smaller from here - a lie distance tells." },
        ],
      },
    ],
  },
  7: {
    label: "Back through shadow depths",
    hint: "the drain-light corridor. your lantern remembers being eaten here.",
    description:
      "Passage drops into black that pulls your flame down - back toward the shadow depths.",
    enemies: [],
    exit: { toAreaId: "a4_shadow_depths", toRoomGridId: 7 },
  },
  8: {
    label: "Descend to outer ward",
    hint: "rope burn on the timbers. the crystal cavern breathes below.",
    description:
      "Rope wear on the timbers. Cool damp salt air from below - open volume under your feet.",
    enemies: [],
    exit: { toAreaId: "a5_outer_ward", toRoomGridId: 2 },
  },
};

export const A4_SEALED_CHAMBER: AreaDef = {
  id: "a4_sealed_chamber",
  name: "Sealed Chamber",
  desc: "Salt grown wrong, prayer stacked higher, and a ring of columns around warmth that should not be patient.",
  difficulty: 5,
  generator: "authored",
  authored: {
    grid: A4_SEALED_CHAMBER_GRID,
    rooms: A4_SEALED_CHAMBER_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
  notes:
    "Area 4 Subarea 6 - demon seal decision; observation log; descent to Area 5 R146. " +
    "Ties regrowing salt (R121), ancestor letter (R134), and lich arithmetic into one moral-geometry puzzle.",
};
