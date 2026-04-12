import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 5 - Founder's Reliquary - Outer Ward (R146–R151)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * Each 2-room link uses a single isolated 0-cell (or non-adjoining stub); no corridor cliques.
 */

// prettier-ignore
export const A5_OUTER_WARD_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 1
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 2
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 3
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 4
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 5
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 10, 10, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 6
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 10, 10, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 7
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 8
 [ 1, 1, 1, 1, 1, 8, 8, 0, 2, 2, 2, 0, 3, 3, 3, 3, 0, 5, 5, 5, 5, 0, 6, 6, 6, 0, 7, 7, 7, 0, 11, 11, 1, 1, 1, 1], // 9
 [ 1, 1, 1, 1, 1, 8, 8, 1, 2, 2, 2, 1, 3, 3, 3, 3, 1, 5, 5, 5, 5, 1, 6, 6, 6, 1, 7, 7, 7, 1, 11, 11, 1, 1, 1, 1], // 10
 [ 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 3, 3, 3, 3, 1, 5, 5, 5, 5, 1, 6, 6, 6, 1, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1], // 11
 [ 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 3, 3, 3, 3, 1, 5, 5, 5, 5, 1, 6, 6, 6, 1, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1], // 12
 [ 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 13
 [ 1, 1, 1, 1, 1, 1, 1, 1, 9, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 14
 [ 1, 1, 1, 1, 1, 1, 1, 1, 9, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 15
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 16
];

export const A5_OUTER_WARD_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Arrival Chamber",
    hint: "two paths meet; coldfire threads the salt. the air is wrong here - still, charged, heavy.",
    description:
      "Coldfire runs through the salt-block in thin green lines. Raw mine cut, dressed masonry, and necromantic patchwork sit in one view. The air is still and feels charged.",
    enemies: [],
    safeRoom: true,
    isStart: true,
    notes:
      "R146. Always. Dark (coldfire flickers). No enemies. Era 1 raw mine + Era 2 salt-block + Era 3 coldfire - all three in one glance. " +
      "Junction: Area 3 R99 (Lich's Ward) and Area 4 R144 (Miner's Shaft) land here (grid 2). " +
      "Crystal lantern: light refracts off salt in the walls (read as environmental affordance for hidden geometry). " +
      "Hidden to Mortal Quarters (R162 / a5_mortal_quarters): loose salt-block panel behind wall; visible only with crystal lantern at full bright OR deliberate wall search; Mira's map (if she gave it in Area 4) marks this. " +
      "Cross-ref: R99, R144, R162, R127. Teaching: final hub = knowledge + light + hidden topology.",
    props: [
      {
        id: "miras_body_r146",
        label: "Mira's Body",
        icon: "\u{1F6AC}",
        desc: "She made it out of the trapped passage but not past the elite patrols. The torch beside her is cold ash. Ink-stained fingers still curl around folded vellum - routes she meant to sell me, or save me with.",
        gridPosition: { row: 10, col: 8 },
        condition: { flags: ["mira_perished_r127"], notFlags: ["looted_mira_body_r146"] },
        onExamine: [
          { type: "set_flag", flag: "examined_mira_body_r146" },
          {
            type: "log",
            message:
              "She almost made it. I could have been faster, kinder, less proud - the thought lands before I can dodge it.",
          },
        ],
        actions: [
          {
            id: "gather_mira_remains",
            label: "Gather the map and her pouch",
            effects: [
              { type: "set_flag", flag: "looted_mira_body_r146" },
              { type: "set_flag", flag: "mira_r127_received_map" },
              { type: "set_flag", flag: "has_mira_area4_map" },
              { type: "grant_salt", amount: 12 },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Twelve gold in her belt-pouch - pay she thought she'd still collect. The map unfurls: our name in the margins, the deep routes, her handwriting laughing where it shouldn't.",
              },
            ],
          },
        ],
      },
    ],
  },
  3: {
    label: "Guard Hall",
    hint: "three armored shapes hold formation; order flame carved in the pillars, bindings laid over.",
    description:
      "Ceremonial hall used as a choke: high vault, floor scuffed from drill. Salt pillars carved with order flame-scrolls; binding marks cut over the carvings. Coldfire lights the reliefs green; shadows stay shallow.",
    enemies: ["boss_skeleton_lord", "boss_skeleton_lord", "boss_skeleton_lord"],
    notes:
      "R147. Coldfire. Elite Skeleton ×3 - boss_skeleton_lord (ancient order plate; see in dark; reform without blunt). " +
      "Ceremonial hall as guard post. " +
      "World-state: brutal choke - blunt essential; consecration after clear prevents reform; lure individuals with light/noise from adjacent rooms. " +
      "Cross-ref: R146, R148, R149.",
    props: [
      {
        id: "guard_hall_salt_pillars_r147",
        label: "Carved Salt Pillars",
        icon: "\u{1F3DB}\uFE0F",
        desc: "Flame-scrollwork climbs each shaft - the vigil's old pride. Necromantic bindings have been scratched over and through it, line by line, until prayer and leash read as one continuous instruction.",
        gridPosition: { row: 10, col: 13 },
        onExamine: [
          { type: "set_flag", flag: "read_guard_hall_pillar_carvings_r147" },
          {
            type: "log",
            message:
              "Faith and fetters share the same column - whoever carved last had steady hands.",
          },
        ],
      },
      {
        id: "elite_order_longsword_r147",
        label: "Ancient Order Longsword",
        icon: "\u{2694}\uFE0F",
        desc: "Fuller still bright where undead oil met steel. The grip is wired for a gauntlet I'll never wear - but the balance is honest, and the edge remembers knighthood before the lich.",
        gridPosition: { row: 11, col: 14 },
        condition: { notFlags: ["took_elite_order_longsword_r147"] },
        actions: [
          {
            id: "take",
            label: "Take the longsword",
            effects: [
              { type: "set_flag", flag: "took_elite_order_longsword_r147" },
              { type: "set_flag", flag: "has_elite_order_longsword" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "The blade settles - old vigil steel. If I mean to walk past their bones, I'll need every honest ounce of it.",
              },
            ],
          },
        ],
      },
      {
        id: "ceremonial_shield_r147",
        label: "Ceremonial Order Shield",
        icon: "\u{1F6E1}\uFE0F",
        desc: "Convex salt-iron, thin enameled flame on the face, rim chewed by centuries of drill. Heavy as doctrine - meant to stand in line, not to run.",
        gridPosition: { row: 11, col: 12 },
        condition: { notFlags: ["took_ceremonial_shield_r147"] },
        actions: [
          {
            id: "take",
            label: "Take the shield",
            effects: [
              { type: "set_flag", flag: "took_ceremonial_shield_r147" },
              { type: "set_flag", flag: "has_ceremonial_order_shield" },
              { type: "grant_weapon", weaponId: "shield" },
              { type: "consume_prop" },
              {
                type: "log",
                message: "The shield settles on my arm - cold, broad, unambiguous.",
              },
            ],
          },
        ],
      },
      {
        id: "guard_hall_coin_chest_r147",
        label: "Paymaster's Strongbox",
        icon: "\u{1F4B0}",
        desc: "Iron box kicked partway under a pillar - tithe silver the dead never marched upstairs. The lock is rust, but the hasp yields to anger.",
        gridPosition: { row: 10, col: 15 },
        condition: { notFlags: ["took_guard_hall_pay_r147"] },
        actions: [
          {
            id: "take",
            label: "Pry it open and take the coin",
            effects: [
              { type: "set_flag", flag: "took_guard_hall_pay_r147" },
              { type: "grant_salt", amount: 30 },
              { type: "consume_prop" },
              { type: "log", message: "30 salt - wages for three knights who forgot how to quit." },
            ],
          },
        ],
      },
    ],
  },
  4: {
    label: "Armory of the Dead",
    hint: "racks of well-kept steel; one figure tends a blade that already cuts clean.",
    description:
      "Weapon racks on the walls - oiled steel, salt-iron shields, smell of old polish. Narrow room; sound dies between racks so small noises echo. Coldfire washes everything green.",
    enemies: ["boss_skeleton_lord"],
    notes:
      "R148. Coldfire. Dead end off R147. Elite Skeleton ×1 (boss_skeleton_lord) sharpening needlessly. " +
      "Teaching: best conventional arms before throne; blunt still mandatory for reform.",
    props: [
      {
        id: "order_knights_blade_r148",
        label: "Order Knight's Blade",
        icon: "\u{1F5E1}\uFE0F",
        desc: "The best slashing steel I've seen in the deep - oiled rag still folded beside it, as if maintenance outlived meaning. The skeleton's whetstone whisper was vanity; the weapon is real.",
        gridPosition: { row: 3, col: 13 },
        condition: { notFlags: ["took_order_knights_blade_r148"] },
        actions: [
          {
            id: "take",
            label: "Take the blade",
            effects: [
              { type: "set_flag", flag: "took_order_knights_blade_r148" },
              { type: "set_flag", flag: "has_order_knights_blade" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Their best edge - weight and balance that don't care about speeches. If words fail, this won't.",
              },
            ],
          },
        ],
      },
      {
        id: "reinforced_shield_r148",
        label: "Reinforced Tower Shield",
        icon: "\u{1F6E1}\uFE0F",
        desc: "Salt-iron face, leather back, rim studded for shield-bash drills. Someone kept it war-ready after everyone who signed the roster died.",
        gridPosition: { row: 2, col: 14 },
        condition: { notFlags: ["took_reinforced_shield_r148"] },
        actions: [
          {
            id: "take",
            label: "Take the shield",
            effects: [
              { type: "set_flag", flag: "took_reinforced_shield_r148" },
              { type: "set_flag", flag: "has_reinforced_tower_shield" },
              { type: "consume_prop" },
              { type: "log", message: "Weight settles - a wall I can shoulder." },
            ],
          },
        ],
      },
      {
        id: "heavy_crossbow_rack_r148",
        label: "Heavy Crossbow and Bolt Case",
        icon: "\u{1F3F9}",
        desc: "Military windlass bow, limbs salted against rust; a quiver of eight heavy quarrels, fletching stiff as law. From here I can answer plate and bone before they close the gap - farther than anything the chapter armory ever handed me.",
        gridPosition: { row: 3, col: 12 },
        condition: { notFlags: ["took_heavy_crossbow_r148"] },
        actions: [
          {
            id: "take",
            label: "Take crossbow and bolts",
            effects: [
              { type: "set_flag", flag: "took_heavy_crossbow_r148" },
              { type: "set_flag", flag: "has_heavy_crossbow" },
              { type: "set_flag", flag: "has_heavy_crossbow_bolts", value: 8 },
              { type: "grant_weapon", weaponId: "crossbow" },
              { type: "consume_prop" },
              {
                type: "log",
                message: "Eight bolts counted - distance, finally, chosen by me.",
              },
            ],
          },
        ],
      },
      {
        id: "armory_pay_leather_bag_r148",
        label: "Leather Pay Bag",
        icon: "\u{1FA99}",
        desc: "Strung on a hook between racks - coin weight that clinks soft, almost apologetic.",
        gridPosition: { row: 4, col: 13 },
        condition: { notFlags: ["took_armory_gold_r148"] },
        actions: [
          {
            id: "take",
            label: "Empty the bag",
            effects: [
              { type: "set_flag", flag: "took_armory_gold_r148" },
              { type: "grant_salt", amount: 20 },
              { type: "consume_prop" },
              { type: "log", message: "20 salt." },
            ],
          },
        ],
      },
    ],
  },
  5: {
    label: "Patrol Corridor",
    hint: "a long run of crystal-inlaid wall; shimmer where coldfire catches salt.",
    description:
      "Long corridor. Crystal threads run through the salt-block walls. Coldfire catches each facet; footsteps echo thin.",
    enemies: ["boss_skeleton_lord", "boss_skeleton_lord"],
    notes:
      "R149. Coldfire. Elite Skeleton ×2 on patrol between R147 and R150; route is learnable - time movement or fight in narrow space (one-on-one bias). " +
      "Salt-crystal inlays catch coldfire; faint shimmer - Era 1 beauty under Era 3 occupation.",
    props: [
      {
        id: "crystal_inlaid_corridor_walls_r149",
        label: "Crystal-Inlaid Walls",
        icon: "\u{2728}",
        desc: "Threads of raw salt-crystal veined through the block - the mine's first beauty, exposed then caged. Coldfire slides along them until the whole corridor shivers like a held breath.",
        gridPosition: { row: 10, col: 19 },
        onExamine: [
          { type: "set_flag", flag: "read_patrol_corridor_crystal_inlay_r149" },
          {
            type: "log",
            message: "Someone beautiful lived here before the lich wrote schedules on it.",
          },
        ],
      },
    ],
  },
  6: {
    label: "Staging Ground",
    hint: "deployment maps on the walls; a bone resonator hums toward corridors I can't see from here.",
    description:
      "Staging floor: lectern, chalk dust, wax where maps were pinned. Bone resonator wires run into the wall; low hum in the teeth. Air smells of bone meal and dry ink.",
    enemies: ["necromancer", "zombie", "zombie", "zombie", "zombie"],
    notes:
      "R150. Coldfire. Inner Circle Necromancer (type necromancer; note stronger stats: HP 12, ATK 8) in back row + Zombies ×4 in formation. " +
      "Teaching: ranged priority on necromancer; killing coordinator weakens zombies. " +
      "MISSING enemy type: cultist (notes only).",
    props: [
      {
        id: "deployment_maps_r150",
        label: "Wall-Mounted Deployment Maps",
        icon: "\u{1F5FA}\uFE0F",
        desc: "Wax-splattered charts pinned with bone clasps - patrol vectors through gallery, ossuary, deep workings, every stair I climbed to get here, arrows drawn over routes I've already walked in blood. Someone turned the whole mountain into a dispatch ledger.",
        gridPosition: { row: 10, col: 24 },
        onExamine: [
          { type: "set_flag", flag: "read_five_area_deployment_maps_r150" },
          {
            type: "log",
            message:
              "Every gallery named. Every corridor tallied. My name isn't inked here - but my footprints were priced before I took them.",
          },
        ],
      },
      {
        id: "bone_resonator_r150",
        label: "Bone Resonator",
        icon: "\u{1F9B4}",
        desc: "A rib-cage bell wired to salt-string - hums on a frequency that makes my teeth itch. Cables vanish into the wall, running upward toward the order halls above. While it sings, commands outrun any runner I could send.",
        gridPosition: { row: 11, col: 23 },
        condition: { notFlags: ["bone_resonator_destroyed_r150"] },
        actions: [
          {
            id: "smash",
            label: "Destroy the resonator",
            effects: [
              { type: "set_flag", flag: "bone_resonator_destroyed_r150" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Ceramic splinters, salt-dust, a ringing hush. Whatever voice ran through that bone-bell goes quiet - long enough, I hope, for nothing fresh to crawl down the wires.",
              },
            ],
          },
        ],
      },
      {
        id: "staging_coin_purse_r150",
        label: "Field Coffers",
        icon: "\u{1F4B0}",
        desc: "Locked box under the command lectern - operating coin for bribes, blades, and bone meal.",
        gridPosition: { row: 11, col: 24 },
        condition: { notFlags: ["took_staging_gold_r150"] },
        actions: [
          {
            id: "take",
            label: "Take the coin",
            effects: [
              { type: "set_flag", flag: "took_staging_gold_r150" },
              { type: "grant_salt", amount: 15 },
              { type: "grant_consumable", consumableId: "heal_lg" },
              { type: "grant_consumable", consumableId: "throwing_knife" },
              { type: "consume_prop" },
              { type: "log", message: "15 salt - bloodless logistics, for once." },
            ],
          },
        ],
      },
    ],
  },
  7: {
    label: "Inner Gate",
    hint: "salt-block gate stands open; an inscription ends on a line in a stranger hand.",
    description:
      "Inner gate: tight salt-block joints, beveled edges, deep lintel. Past it the masonry gets finer and more ornate. Coldfire is weaker on the threshold; inscription on the lintel holds a green cast.",
    enemies: [],
    notes:
      "R151. Coldfire. No enemies. Ceremonial boundary; R99 was the real lock. Finest Era 2 salt-work; architecture turns more ornate inward. " +
      "Exit forward: Prayer Colonnade R152 via grid link to a5_colonnade (room 11). " +
      "Cross-ref: R150, R152.",
    props: [
      {
        id: "inner_gate_inscription_r151",
        label: "Gate Inscription",
        icon: "\u{1F4DC}",
        desc: "Carved deep into the lintel - two hands, two centuries. The first lines march in confident serif: THE VIGIL ENDURES. THE VIGIL PROVIDES. Below, a third line cuts sharper, colder, newer: THE VIGIL CONSUMES. The last word sits alone like a ledger total.",
        gridPosition: { row: 10, col: 28 },
        onExamine: [
          { type: "set_flag", flag: "read_inner_gate_vigil_inscription_r151" },
          {
            type: "log",
            message: "The final line is not the order's voice - same salt, different appetite.",
          },
        ],
      },
    ],
  },
  8: {
    label: "To Lich's Ward",
    hint: "bone columns give way to the route I know from the deep ward.",
    description: "Worked bone and old salt; draft from the lich's ward route.",
    enemies: [],
    exit: { toAreaId: "a3_bone_stacks", toRoomGridId: 8 },
    notes:
      "Exit. Return to Area 3 a3_bone_stacks grid 8 (R99 path). Pair: arrivals from R99 must land Outer Ward grid 2 (R146).",
  },
  9: {
    label: "To Miner's Shaft",
    hint: "rope marks and cold air - the climb back toward the sealed workings.",
    description: "Rope fibers worn into the stone; cold air rising - mouth of the miner's shaft.",
    enemies: [],
    exit: { toAreaId: "a4_sealed_chamber", toRoomGridId: 5 },
    notes:
      "Exit. Return to Area 4 a4_sealed_chamber grid 5 (R144). Pair: arrivals from sealed chamber land Outer Ward grid 2 (R146).",
  },
  10: {
    label: "Hidden Panel",
    hint: "a salt-block seam that only true light or patient hands reveals.",
    description:
      "Loose salt-block panel: seam at a wrong angle, dust pattern off; quiet passage beyond.",
    enemies: [],
    exit: { toAreaId: "a5_mortal_quarters", toRoomGridId: 2 },
    notes:
      "Hidden. HIDDEN exit to Mortal Quarters R168 (a5_mortal_quarters grid 2). Crystal lantern full or deliberate search. " +
      "Pair: Mortal Quarters loose panel returns to this area grid 2 (R146). Cross-ref: R162, R169 journal beat.",
  },
  11: {
    label: "Into the Colonnade",
    hint: "salt-crystal columns wait beyond; prayers cut into every face.",
    description: "Threshold down toward salt-crystal columns and green coldfire ahead.",
    enemies: [],
    exit: { toAreaId: "a5_colonnade", toRoomGridId: 2 },
    notes:
      "Exit to a5_colonnade R152 (grid 2). Pair: return from colonnade uses Outer Ward grid 7 (R151).",
  },
};

export const A5_OUTER_WARD: AreaDef = {
  id: "a5_outer_ward",
  name: "Outer Ward",
  desc: "Elite dead in old plate, maps that treat the whole mine as a route sheet, and a gate that pretends prayer still lives beyond it.",
  difficulty: 5,
  generator: "authored",
  authored: {
    grid: A5_OUTER_WARD_GRID,
    rooms: A5_OUTER_WARD_ROOMS,
  },
  combatRooms: [],
};
