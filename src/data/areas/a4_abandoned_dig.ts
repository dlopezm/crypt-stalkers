import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 4 - Abandoned Dig (R124–R129), difficulty 4.
 * Grid: 2=R124, 3=R125, 4=R126, 5=R127, 6=R128, 7=R129; 8=crystal exit; 9=ancestors; 10=shadow depths.
 * Hub R128 (6): separate corridor legs to R127, R129, exits - no merged 0-component cliques.
 */

// prettier-ignore
export const A4_ABANDONED_DIG_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 4, 4, 0, 3, 3, 0, 2, 2, 0, 8, 8, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 4, 4, 0, 3, 3, 0, 2, 2, 0, 8, 8, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 7, 7, 0, 6, 6, 0, 9, 9, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 7, 7, 1, 6, 6, 1, 9, 9, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 10, 10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 10, 10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const A4_ABANDONED_DIG_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Dig Camp",
    hint: "dying coldfire strips. skeletons chip at salt that no longer ships.",
    description:
      "Collapsed tent poles, slack lines, churned salt and ash on the floor. Dying coldfire strips - green-white, no real heat. Stale coldfire smell and old sweat. Nobody struck camp.",
    enemies: ["skeleton", "skeleton"],
    isStart: true,
    notes:
      "R124. COLDFIRE (dying strips) + DARK pockets. Era 3. " +
      'Skeletons ×2 still "working" on last orders - chips salt forever. ' +
      "Connects R116 (crystal exit), R125 equipment, R127 trapped passage. " +
      "Theme: Era 3 dig stopped mid-work; lich withdrew after crews vanished.",
    props: [
      {
        id: "dig_camp_tents_r124",
        label: "Collapsed Equipment Tents",
        icon: "\u{26FA}\uFE0F",
        desc: "Canvas slumped on splintered poles - picks still stacked like someone meant to return after tea. A recent camp, half-erased by dust and the silence that followed.",
        gridPosition: { row: 3, col: 9 },
        onExamine: [
          { type: "set_flag", flag: "examined_dig_camp_tents_r124" },
          {
            type: "log",
            message: "The camp still waits for an overseer who is never coming back.",
          },
        ],
      },
      {
        id: "dying_coldfire_posts_r124",
        label: "Dying Coldfire Strips",
        icon: "\u{1F56F}\uFE0F",
        desc: "Green-white strips gutter along the guy lines - bright, lying light. They warm nothing and keep nothing honest.",
        gridPosition: { row: 4, col: 8 },
        onExamine: [
          { type: "set_flag", flag: "examined_dig_coldfire_r124" },
          { type: "log", message: "Coldfire: pretty, useless against what hunts by appetite." },
        ],
      },
    ],
  },
  3: {
    label: "Equipment Store",
    hint: "picks, rope, and the reek of rat-nested sacks.",
    description:
      "Racks of picks, rope, carts. Oil, dust, sweet rot from burst grain sacks. Footprints everywhere - people left in a hurry. Pale coldfire smears on the timbers.",
    enemies: ["rat", "rat", "rat", "rat"],
    notes:
      "R125. DARK. Era 3. Picks, carts, last coldfire strips - supply ends here. " +
      "Rats in organics. Hasty exit: dropped gear. " +
      "Connects R124 ↔ R126.",
    props: [
      {
        id: "serevic_halt_log_r125",
        label: "Hastily Dropped Log Page",
        icon: "\u{1F4C4}",
        desc: "Ink smeared by a wet thumb. Crew 7 - no report. Crew 9 - no report. Halting deep operations. - S. The hand is the necromancer's clerk-hand - calm where miners would have screamed.",
        gridPosition: { row: 3, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "read_serevic_halt_order_r125" },
          {
            type: "log",
            message: "Serevic stopped the deep dig when the silence started answering back.",
          },
        ],
      },
      {
        id: "supply_rope_coil_r125",
        label: "Coiled Rope",
        icon: "\u{1F9F6}",
        desc: "Hemp heavy with salt-dust, rated for shaft work. Someone left it like a promise: there is still a way down.",
        gridPosition: { row: 4, col: 5 },
        condition: { notFlags: ["has_rope"] },
        actions: [
          {
            id: "take",
            label: "Take the rope",
            effects: [
              { type: "set_flag", flag: "has_rope" },
              { type: "consume_prop" },
              {
                type: "log",
                message: "Enough line for a shaft head - or for refusing to jump blind.",
              },
            ],
          },
        ],
      },
      {
        id: "equipment_store_tools_r125",
        label: "Racked Picks and Carts",
        icon: "\u{2692}\uFE0F",
        desc: "Iron forest of picks, wheelbarrows, and broken sledges - the last honest logistics before Serevic's dead learned to count silence as yield.",
        gridPosition: { row: 3, col: 6 },
        onExamine: [
          { type: "set_flag", flag: "examined_equipment_store_r125" },
          { type: "log", message: "Tools without hands. The store outlived the operators." },
        ],
      },
      {
        id: "last_coldfire_strips_r125",
        label: "Spare Coldfire Strips",
        icon: "\u{1F319}",
        desc: "A crate of wrong light - packaged like mercy, useful only if you forget what true flame proves.",
        gridPosition: { row: 4, col: 6 },
        onExamine: [
          { type: "set_flag", flag: "examined_coldfire_strips_r125" },
          { type: "log", message: "The strips hiss faintly. They are not your friend." },
        ],
        actions: [
          {
            id: "take_packed_torch_r125",
            label: "Take a waxed torch from the crate lid",
            desc: "Someone wedged honest tinder beside the wrong-light strips - habit from older shifts.",
            requires: { notFlags: ["took_supply_torch_r125"] },
            effects: [
              { type: "set_flag", flag: "took_supply_torch_r125" },
              { type: "grant_consumable", consumableId: "torch" },
              {
                type: "log",
                message: "Waxed wrap, dry fiber - small mercy next to the hissing strips.",
              },
            ],
          },
        ],
      },
    ],
  },
  4: {
    label: "Active Face",
    hint: "the wall curves toward you like muscle under thin stone.",
    description:
      "Working face of salt in smooth curved sheets, not jagged break. Warm if you put your hand close. Light catches glints inside the mass.",
    enemies: [],
    notes:
      "R126. DARK. Era 1 + 3. Dig face frozen mid-swing; half-loaded cart. " +
      "Wall crystals organic - curved, reaching toward viewer; warmth palpable. " +
      "Where extraction would have been richest and most catastrophic - profit and peril one gesture; growth is presence's influence visible. " +
      "Dead end.",
    props: [
      {
        id: "half_loaded_cart_r126",
        label: "Half-Loaded Cart",
        icon: "\u{1F6D2}",
        desc: "Salt heaped to the brim on one side, empty on the other - a life interrupted mid-greed. The brake is set; the handle still warm in a way stone should not be.",
        gridPosition: { row: 3, col: 2 },
        onExamine: [
          { type: "set_flag", flag: "examined_half_loaded_cart_r126" },
          {
            type: "log",
            message: "The cart froze mid-shift - panic wearing the mask of a quota.",
          },
        ],
      },
      {
        id: "reaching_crystal_face_r126",
        label: "Reaching Crystal Face",
        icon: "\u{1FAA8}",
        desc: "The wall bulges in curved planes - not fracture, almost muscle. Warmth rises from it like breath. This is where the baron's arithmetic would have sung, and where the earth would have answered in teeth.",
        gridPosition: { row: 4, col: 3 },
        onExamine: [
          { type: "set_flag", flag: "examined_reaching_crystal_face_r126" },
          { type: "set_flag", flag: "read_deep_presence_at_face_r126" },
          {
            type: "log",
            message:
              "The wall reaches like muscle. One more swing would have paid - and opened something that does not bargain.",
          },
        ],
      },
      {
        id: "crystal_rich_salt_chunk_r126",
        label: "Crystal-Rich Salt Chunk",
        icon: "\u{1F9C2}",
        desc: "A slab broke free when work stopped - threaded with interior glint, hot to the palm. Enough crystal to feed a serious lantern build, if you can stand taking from a face that reaches back.",
        gridPosition: { row: 4, col: 2 },
        condition: { notFlags: ["took_crystal_rich_salt_r126"] },
        actions: [
          {
            id: "take",
            label: "Take the salt chunk",
            effects: [
              { type: "set_flag", flag: "took_crystal_rich_salt_r126" },
              { type: "set_flag", flag: "has_raw_salt_crystal" },
              { type: "consume_prop" },
              { type: "log", message: "Crystal-rich salt - weight and warmth together." },
            ],
          },
        ],
      },
    ],
  },
  5: {
    label: "Trapped Passage",
    hint: "torchlight gutters. something pinned a woman to the floor.",
    description:
      "Corridor tightens. Your torch shrinks; the walls pull color out of the light. Almost no echo - no drip, no distant picks. Mira is pinned ahead under a draining shadow.",
    enemies: ["shadow"],
    notes:
      "R127. DARK. Era 1. Corridor claimed by Shadow ×1. Mira pinned; torch guttering under drain. " +
      "MIRA ENCOUNTER 3 - mirror of heir: in the deep for treasure, no coat of inheritance. " +
      "Combat hook: set r127_shadow_cleared when the Shadow here is destroyed so map trade can resolve. " +
      "REFUSE branch: she dies near Area 5 entrance; map on body needs encounter script + mira_perished_r127 flag. " +
      "Connects R124 ↔ R128.",
    props: [
      {
        id: "mira_trapped_r127",
        label: "Mira",
        icon: "\u{1F469}",
        desc: "A woman you have met before - stripped of bravado, pressed to salt by a shadow that drinks her torch to a whine. Her eyes find yours without flinching. I'm not saving anyone, she says. I'm getting paid. The honesty is uglier than the dark.",
        gridPosition: { row: 6, col: 8 },
        onExamine: [
          { type: "set_flag", flag: "encountered_mira_r127" },
          {
            type: "log",
            message:
              "Same eyes you see in still water - someone down here for coin, not for crests on a letter.",
          },
        ],
        actions: [
          {
            id: "lend_crystal_lantern",
            label: "Lend her your crystal lantern",
            desc: "Deep salt light the shadow cannot drink. You walk darker until you seat another crystal heart in brass.",
            requires: { flags: ["has_crystal_lantern"], notFlags: ["mira_r127_received_map"] },
            effects: [
              { type: "set_flag", flag: "lent_crystal_lantern_to_mira_r127" },
              { type: "set_flag", flag: "has_crystal_lantern", value: false },
              { type: "set_flag", flag: "mira_survives_r127" },
              { type: "set_flag", flag: "mira_r127_received_map" },
              { type: "set_flag", flag: "has_mira_area4_map" },
              {
                type: "log",
                message:
                  "She drags ink across vellum - the scratched ancestor route, the blacker drop, little marks only someone still breathing would bother with. The lantern leaves with her; the chart stays with you.",
              },
            ],
          },
          {
            id: "take_map_after_shadow",
            label: "Accept her chart once the thing in the dark is dead",
            desc: "The weight lifts from the corridor only when the shadow does.",
            requires: { flags: ["r127_shadow_cleared"], notFlags: ["mira_r127_received_map"] },
            effects: [
              { type: "set_flag", flag: "mira_survives_r127" },
              { type: "set_flag", flag: "mira_r127_received_map" },
              { type: "set_flag", flag: "has_mira_area4_map" },
              {
                type: "log",
                message:
                  "She slaps folded vellum into your hand - the ancestor marks, the way down into the black, bitter jokes squeezed into the margins.",
              },
            ],
          },
          {
            id: "loot_mira_map_body",
            label: "Take the chart from her still hands",
            desc: "She did not get up. The vellum is still warm from her pocket.",
            requires: { flags: ["mira_perished_r127"], notFlags: ["mira_r127_received_map"] },
            effects: [
              { type: "set_flag", flag: "mira_r127_received_map" },
              { type: "set_flag", flag: "has_mira_area4_map" },
              {
                type: "log",
                message:
                  "Ink and salt on cold fingers. You let her die for a full grip on your light.",
              },
            ],
          },
        ],
      },
    ],
  },
  6: {
    label: "Collapse Warning",
    hint: "timber cracks overhead. miners painted DANGER UNSTABLE in haste.",
    description:
      "Timber cracks overhead. Dust sifts down. Lamp-black on the ribs: unstable, danger. Feels like the whole hub could go.",
    enemies: [],
    notes:
      "R128. DARK. Era 1. Cracked supports. " +
      "World-state / combat: random collapse damage per turn risk while fighting here. " +
      "Hub toward Ancestor's Trail (R130+) and Shadow Depths (R135+). " +
      "Cross-ref: unstable geology vs baron's pace; ties to R134 letter and R143 seal stress.",
    props: [
      {
        id: "danger_unstable_sign_r128",
        label: "Painted Warning",
        icon: "\u{26A0}\uFE0F",
        desc: "Timber streaked with lamp-black: DANGER - UNSTABLE. The letters tilt as if the wall shivered while someone wrote.",
        gridPosition: { row: 10, col: 8 },
        onExamine: [
          { type: "set_flag", flag: "read_collapse_warning_r128" },
          {
            type: "log",
            message: "The mine confesses its temper before you step into the fork.",
          },
        ],
      },
    ],
  },
  7: {
    label: "Break Room",
    hint: "benches rot under graffiti older than the coldfire posts.",
    description:
      "Salt benches, walls thick with chisel and charcoal - names, loads, complaints. Cooler and stiller than the heading outside. Sound dies on the salt.",
    enemies: [],
    notes:
      "R129. DARK. Era 1. Rotting benches, tin cups (not separate props). " +
      "First explicit ancestor trace on this branch is in the indenture / familiar-script panel. Dead end.",
    props: [
      {
        id: "break_room_pride_graffiti_r129",
        label: "Pride Marks",
        icon: "\u{1F58B}\uFE0F",
        desc: "Early miners carved names inside wreaths - deepest crew, loads boasted in numbers tall as legs. The stone wears their vanity like medals.",
        gridPosition: { row: 10, col: 4 },
        onExamine: [
          { type: "set_flag", flag: "read_break_room_pride_r129" },
          { type: "log", message: "Pride measured in tons and titles." },
        ],
      },
      {
        id: "break_room_bitterness_graffiti_r129",
        label: "Bitter Lines",
        icon: "\u{1F58B}\uFE0F",
        desc: "A different chisel, meaner spacing: still not enough for him. Him could be foreman, baron, or any mouth that rewrites sweat into debt.",
        gridPosition: { row: 11, col: 4 },
        onExamine: [
          { type: "set_flag", flag: "read_break_room_bitterness_r129" },
          {
            type: "log",
            message: "Resentment without a proper name - only the shape of being used.",
          },
        ],
      },
      {
        id: "break_room_indenture_graffiti_r129",
        label: "Indenture Tallies and Familiar Script",
        icon: "\u{1F4CA}",
        desc: "Rows of marks without comment - debt kept like rainfall. One line breaks pattern: owed 14 years, year 9. Beside them, a second hand: literate, careful, matching the baron's journals - ashamed letters hiding inside the pit's arithmetic.",
        gridPosition: { row: 10, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "read_break_room_indenture_r129" },
          { type: "set_flag", flag: "read_ancestor_trace_break_room_r129" },
          {
            type: "log",
            message: "Time owed in scratches - and your blood confessing between the lines.",
          },
        ],
      },
      {
        id: "break_room_stars_line_r129",
        label: "Anonymous Verse",
        icon: "\u{2728}",
        desc: "Smaller, almost shy script: From down here the walls look like stars. Nobody owns stars.",
        gridPosition: { row: 11, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "read_break_room_stars_line_r129" },
          {
            type: "log",
            message: "Beauty without deed - the one thing greed cannot file.",
          },
        ],
      },
    ],
  },
  8: {
    label: "Toward crystal galleries",
    hint: "prismatic drafts from the living-salt halls.",
    description: "Dryer air ahead; faint colored glints from the salt halls.",
    enemies: [],
    exit: { toAreaId: "a4_crystal_galleries", toRoomGridId: 2 },
  },
  9: {
    label: "Toward ancestor's trail",
    hint: "someone counted days on the wall beyond.",
    description: "Quiet passage. Bare salt. Carved marks ahead, private stuff.",
    enemies: [],
    exit: { toAreaId: "a4_ancestors_trail", toRoomGridId: 2 },
  },
  10: {
    label: "Into shadow depths",
    hint: "your lantern shivers before you step through.",
    description:
      "Cold on your wrists. Your light dips hard at the threshold - the corridor pulls it down.",
    enemies: [],
    exit: { toAreaId: "a4_shadow_depths", toRoomGridId: 2 },
  },
};

export const A4_ABANDONED_DIG: AreaDef = {
  id: "a4_abandoned_dig",
  name: "Abandoned Dig",
  desc: "Serevic's last headings, stopped mid-swing. The camp still pretends the shift never ended - coldfire dying, dead crews still swinging.",
  difficulty: 4,
  generator: "authored",
  authored: {
    grid: A4_ABANDONED_DIG_GRID,
    rooms: A4_ABANDONED_DIG_ROOMS,
  },
  combatRooms: [],
  notes:
    "Area 4 Subarea 3 - Mira 3, halt-order lore, rope gate for Area 5. " +
    "Branches: graffiti + ancestor fingerprints (R129), linear ancestor emotional arc (R130–R134), Shadow depths + lantern craft (R135–R140).",
};
