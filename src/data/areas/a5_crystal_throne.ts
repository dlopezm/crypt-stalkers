import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 5 — Founder's Reliquary — Crystal Throne (R163–R167)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * Graph: 163(2)↔164(3)↔165(4); 164↔166(5); 164↔167(6); 2↔9(sanctum). No shared 0-component between 4,5,6.
 */

// prettier-ignore
export const A5_CRYSTAL_THRONE_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  9,  9,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  4
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  5
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  7
  [ 1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1,  1,  1], //  8
  [ 1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1,  1,  1], //  9
  [ 1,  1,  1,  1,  1,  1,  6,  0,  3,  3,  3,  3,  3,  3,  3,  0,  5,  5,  1,  1,  1,  1], // 10
  [ 1,  1,  1,  1,  1,  1,  6,  6,  3,  3,  3,  3,  3,  3,  3,  5,  5,  5,  1,  1,  1,  1], // 11
  [ 1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1,  1,  1,  1], // 12
  [ 1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1,  1,  1,  1], // 13
  [ 1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1,  1,  1,  1], // 14
  [ 1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1,  1,  1,  1], // 15
  [ 1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1,  1,  1,  1], // 16
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 17
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  4,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 18
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  4,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 19
];

export const A5_CRYSTAL_THRONE_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Throne Approach",
    hint: "three centuries of tool-marks and spell-work stack on the walls; my torch shrinks here like it knows better.",
    enemies: [],
    isStart: true,
    notes:
      "R163. Always. Dark; lich-suppressed light — ordinary torches/lanterns halved in radius; crystal lantern resists (reduced but still reaches). " +
      "If R160 Deep Brazier and/or R158 altar brazier relit: suppression weaker; ordinary light more usable. " +
      "Cross-ref: R161, R164, R165. Teaching: prep vs suppression stacks across Areas 4–5.",
    props: [
      {
        id: "throne_approach_layered_walls_r163",
        label: "Layered Wall Marks",
        icon: "\u{1F5FD}",
        desc: "Mine chisel scars under order relief under necromantic scratch-cipher — three centuries arguing in the same stone. Your torch shrinks here; the crystal lantern fights for every foot.",
        gridPosition: { row: 4, col: 11 },
        onExamine: [
          { type: "set_flag", flag: "read_throne_approach_triple_era_walls_r163" },
          {
            type: "log",
            message:
              "Three centuries of chisel and curse in one wall — and my torch shrinks as if ashamed. Whoever holds the seat ahead has been taxing every flame I carry the whole walk in.",
          },
        ],
      },
    ],
  },
  3: {
    label: "The Formation",
    hint: "salt grown into a cathedral; prayers and bindings crawled up it after the fact.",
    enemies: [],
    notes:
      "R164. Always. Dark while suppressed. MASSIVE room (~9×9 cells) — natural salt-crystal cluster; Era 2 prayers carved into faces; Era 3 binding sigils parasitic on the surface. " +
      "Mechanical payoff when lit: weakens light-wipe phases toward R165; reveals R166; emotional peak of the dungeon's visual language. " +
      "Cross-ref: R160, R158, R166, R165.",
    props: [
      {
        id: "central_salt_formation_r164",
        label: "The Crystal Formation",
        icon: "\u{1F48E}",
        desc: "Salt grown taller than prayer — a natural cathedral of facets that predates the order. Old Vigil lines score the faces; newer sigils vein them like infection. In dim light the cluster eats my beam; in full brilliance it answers, throwing color until the cavern forgets how to be afraid of the dark.",
        gridPosition: { row: 11, col: 11 },
        onExamine: [
          { type: "set_flag", flag: "examined_crystal_formation_core_r164" },
          {
            type: "log",
            message:
              "It was beautiful before anyone prayed into it — I feel that in my chest. Then the sigils came, veining the facets like mold on fruit someone still called sacred.",
          },
        ],
        actions: [
          {
            id: "full_illumination_lantern",
            label: "Bring the crystal lantern to full beside the formation",
            requires: {
              flags: ["has_crystal_lantern"],
              notFlags: ["formation_full_illumination_r164"],
            },
            effects: [
              { type: "set_flag", flag: "formation_full_illumination_r164" },
              {
                type: "log",
                message:
                  'Light dives the facets and returns multiplied — the cavern blooms cold fire honest as day. From nowhere and everywhere at once, a voice like a blade held level: "You raised the ambient illumination. The formation answers pitch, not pity."',
              },
            ],
          },
          {
            id: "full_illumination_array",
            label: "Let the master array's light run the crystal through",
            desc: "Let the aligned mirrors in the deep array throw real light down the salt-veins until this heart answers.",
            requires: {
              flags: ["examined_array_nexus_r122"],
              notFlags: ["formation_full_illumination_r164"],
            },
            effects: [
              { type: "set_flag", flag: "formation_full_illumination_r164" },
              {
                type: "log",
                message:
                  "Distant mirrors cough sun down salt-veins I can't trace from here — the formation catches it and screams brilliance until every carved line flinches visible. The weight on my light frays like rotten rope.",
              },
            ],
          },
        ],
      },
    ],
  },
  4: {
    label: "The Seat",
    hint: "a plain salt chair faces the crystal; coldfire paints a face that still finishes the sum before I've drawn breath.",
    enemies: ["boss_lich"],
    isBoss: true,
    notes:
      "R165. Coldfire (lich-controlled). Grandmaster Serevic — enemy boss_lich (HP 90, ATK 15). " +
      "Phase 0 conversation → Phase 1 combat if talk fails or player attacks first. " +
      "Phase 1 — tests ALL: turns 1–3 summon Elite Skeletons (2/turn) boss_skeleton_lord — blunt vs reform; 4–6 raise fallen — consecration gates; 7+ extinguish room light — crystal lantern persists; lich back row — ranged; Skullflower from crystal — fire clears (MISSING skullflower enemy id). " +
      "If R160 / R158 / formation full illumination (R164): fewer summons, slower raises, partial blackout. " +
      "Phase 2 — journal on R169 desk (flag serevic_journal_placed_desk_r169): facade cracks; barks shift to exposure; slight phase easing. " +
      "MISSING: skullflower enemy id; gutborn/demon hooks — notes only. " +
      "Ending resolution flags set via props below; credibility / loot ratio tracked elsewhere when implemented.",
    props: [
      {
        id: "salt_block_seat_r165",
        label: "Salt-Block Chair",
        icon: "\u{1FA91}",
        desc: "Not a throne — thrones waste maintenance cycles. A working seat facing the formation, arms worn where desiccated hands still rest. Whoever built it assumed the sitter would always have something to watch.",
        gridPosition: { row: 18, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "examined_lich_salt_chair_r165" },
          {
            type: "log",
            message: "Ostentation trimmed to zero; ego expressed as endurance.",
          },
        ],
      },
      {
        id: "grandmaster_serevic_lich_r165",
        label: "Grandmaster Serevic",
        icon: "\u{1F480}",
        desc: "Coldfire paints bone and the memory of bone — human once, desiccated now, eyes still sharp enough to audit me mid-thought. A century and a half of patience ends in questions: what I know, what use I am, whether I'm another mouth at the vein. The argument starts before steel does.",
        gridPosition: { row: 18, col: 11 },
        onExamine: [
          { type: "set_flag", flag: "examined_grandmaster_serevic_r165" },
          {
            type: "log",
            message:
              "The northwest ward requires recalibration every 73 days. I have not missed one. — They speak as if punctuality were virtue enough.",
          },
        ],
        actions: [
          {
            id: "sing_vigil_hymn",
            label: "Sing the Vigil Hymn",
            requires: {
              flags: ["knows_hymn_fragment"],
              notFlags: ["performed_vigil_hymn_at_lich_r165"],
            },
            effects: [
              { type: "set_flag", flag: "performed_vigil_hymn_at_lich_r165" },
              {
                type: "log",
                message:
                  "Stop. — The word cracks like thin ice. Then quiet. Then: The dead can't sing. I needed the dead more than the singing. That was the calculation.",
              },
            ],
          },
          {
            id: "show_ashvere_signet",
            label: "Show the Ashvere signet",
            requires: { flags: ["has_signet_ring"], notFlags: ["serevic_saw_ashvere_signet_r165"] },
            effects: [
              { type: "set_flag", flag: "serevic_saw_ashvere_signet_r165" },
              {
                type: "log",
                message:
                  "An Ashvere. Your family started this. The debts, the deep mining, the collapse. Four hundred years later, here you are to take more.",
              },
            ],
          },
          {
            id: "present_ancestor_bone_tag",
            label: "Speak of the ancestor bone tag",
            requires: {
              flags: ["has_ancestor_bone_tag_ashvere"],
              notFlags: ["serevic_discussed_ancestor_bones_r165"],
            },
            effects: [
              { type: "set_flag", flag: "serevic_discussed_ancestor_bones_r165" },
              {
                type: "log",
                message:
                  "Yes. Crew 7, recovered from the collapse gallery. Processed and deployed to the northwestern ward. Still functional.",
              },
            ],
          },
          {
            id: "press_regrowing_salt",
            label: "Press the evidence of regrowing salt",
            requires: {
              flags: ["read_regrowth_survey_mark_r121"],
              notFlags: ["serevic_deflected_regrowing_salt_r165"],
            },
            effects: [
              { type: "set_flag", flag: "serevic_deflected_regrowing_salt_r165" },
              {
                type: "log",
                message:
                  "Silence, precise as a held breath. The crystal galleries are not my operational priority.",
              },
            ],
          },
          {
            id: "press_regrowing_salt_alt",
            label: "Tell them of the living seams I saw below",
            requires: {
              flags: ["examined_secondary_growth_r123"],
              notFlags: ["serevic_deflected_regrowing_salt_r165"],
            },
            effects: [
              { type: "set_flag", flag: "serevic_deflected_regrowing_salt_r165" },
              {
                type: "log",
                message:
                  "Silence, precise as a held breath. The crystal galleries are not my operational priority.",
              },
            ],
          },
          {
            id: "present_pretransformation_journal",
            label: "Hold out the pre-transformation journal",
            requires: {
              flags: ["has_serevic_pretransformation_journal"],
              notFlags: ["presented_serevic_journal_at_throne_r165"],
            },
            effects: [
              { type: "set_flag", flag: "presented_serevic_journal_at_throne_r165" },
              { type: "set_flag", flag: "serevic_journal_release_evidence_secured" },
              {
                type: "log",
                message:
                  '"Where did you find that?" Their voice thins. The journal\'s ink — a human margin, a doubt — strikes a place their tallies never built a row for. They go quiet, as if silence could erase the extra figure.',
              },
            ],
          },
          {
            id: "ending_claim_fight",
            label: "End it in steel — kill the grandmaster, take the deep by blood",
            effects: [
              { type: "set_flag", flag: "ending_claim_fight_chosen_r165" },
              {
                type: "log",
                message:
                  "No more audit. I end it the way graves end arguments — one of us stays in the salt, the other walks out over what's left.",
              },
            ],
          },
          {
            id: "ending_claim_partnership",
            label: "Take their bargain — Ashvere above ground, they keep the dark",
            effects: [
              { type: "set_flag", flag: "ending_claim_partnership_chosen_r165" },
              {
                type: "log",
                message:
                  '"The mine was Ashvere\'s. Take the title, reopen the upper works, mind the town. I keep the deep on my ledger — all I require is that you never meddle below." We agree. My hand meets bone. The dead keep drawing wages I pretend not to see.',
              },
            ],
          },
          {
            id: "ending_inherit",
            label: "Offer the living vigil — my breath for the seal, their end",
            requires: {
              flags: [
                "demon_seal_studied_r143",
                "performed_vigil_hymn_at_lich_r165",
                "read_consecration_rite_knowledge_r53",
              ],
            },
            effects: [
              { type: "set_flag", flag: "ending_inherit_vigil_chosen_r165" },
              {
                type: "log",
                message:
                  "I name duty without wearing their rot. They march my tongue through every seal-line I memorized; when I don't stumble, something tears out of them — cold, final — and settles against my ribs instead. One living keeper. One ended grandmaster. The deep still caged, but the cage breathes with me.",
              },
            ],
          },
          {
            id: "ending_return",
            label: "Swear to bury the mine — bring down the mirrors, seal whole, hunger starved",
            requires: {
              flags: ["demon_seal_studied_r143", "has_consecration", "examined_array_nexus_r122"],
              notFlags: ["demon_seal_broken_r143"],
            },
            effects: [
              { type: "set_flag", flag: "ending_return_collapse_chosen_r165" },
              {
                type: "log",
                message:
                  "I swear I'll unmake the vein they sold — bring down the mirror-chain, spend consecration I've carried, use seal-lore I refused to break as the lever. The town's purse starves when the tunnels go quiet. The taking stops because there is nothing left to haul.",
              },
            ],
          },
          {
            id: "ending_release_regrowth_survey",
            label: "Swear the salt heals — survey in hand, seal unbroken, I leave with nothing",
            requires: {
              flags: [
                "demon_seal_studied_r143",
                "read_ancestor_letter_r134",
                "performed_vigil_hymn_at_lich_r165",
                "ancestor_letter_ending4_evidence",
                "read_regrowth_survey_mark_r121",
                "serevic_journal_release_evidence_secured",
              ],
              notFlags: ["demon_seal_broken_r143"],
            },
            effects: [
              { type: "set_flag", flag: "ending_release_salt_heals_chosen_r165" },
              {
                type: "log",
                message:
                  '"I knew. Somewhere under the ink, I knew the salt healed. I chose not to tally it." Coldfire thins until I can hear my own heartbeat. No blade. No purse. I leave with empty hands and the mountain still knitting itself shut behind me.',
              },
            ],
          },
          {
            id: "ending_release_regrowth_seam",
            label: "Swear the salt heals — living seam seen, seal unbroken, I leave with nothing",
            requires: {
              flags: [
                "demon_seal_studied_r143",
                "read_ancestor_letter_r134",
                "performed_vigil_hymn_at_lich_r165",
                "ancestor_letter_ending4_evidence",
                "examined_secondary_growth_r123",
                "serevic_journal_release_evidence_secured",
              ],
              notFlags: ["demon_seal_broken_r143"],
            },
            effects: [
              { type: "set_flag", flag: "ending_release_salt_heals_chosen_r165" },
              {
                type: "log",
                message:
                  '"I knew. Somewhere under the ink, I knew the salt healed. I chose not to tally it." Coldfire thins until I can hear my own heartbeat. No blade. No purse. I leave with empty hands and the mountain still knitting itself shut behind me.',
              },
            ],
          },
        ],
      },
    ],
  },
  5: {
    label: "Phylactery Chamber",
    hint: "only light and violence against the growth convince the stone to show what it swallowed.",
    enemies: [],
    notes:
      "R166. Hidden until formation fully illuminated (R164). " +
      "If not destroyed: lich may regenerate after apparent kill (bad variant / epilogue hooks). " +
      "Cross-ref: R164, R165.",
    props: [
      {
        id: "lich_phylactery_r166",
        label: "Saltgrown Heart",
        icon: "\u{2764}\uFE0F",
        desc: "A salt-crystal orb shot through with facet-veins — inside, impossibly, meat still beats, kept honest by brine and stubbornness. No shelf: stone and grandmaster grown into one knot. To break it I'd have to strike what the vigil named holy and hunger made inseparable from the vein.",
        gridPosition: { row: 10, col: 17 },
        condition: {
          flags: ["formation_full_illumination_r164"],
          notFlags: ["phylactery_destroyed_r166"],
        },
        onExamine: [
          { type: "set_flag", flag: "examined_lich_phylactery_r166" },
          {
            type: "log",
            message:
              "Only when the formation blazed did I see it — a pulse inside clear stone, want grown into geology while every eye was on the ledger.",
          },
        ],
        actions: [
          {
            id: "shatter_phylactery",
            label: "Strike the hosting spar — break orb and heart together",
            effects: [
              { type: "set_flag", flag: "phylactery_destroyed_r166" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Crystal screams; the wet thud inside stops. Whatever lived in that knot won't get a second name on their tally — no quiet reinscription, no footnote resurrection.",
              },
            ],
          },
        ],
      },
    ],
  },
  6: {
    label: "Binding Circle",
    hint: "the floor is one equation at cathedral scale — power borrowed and power paid back in the same ink.",
    enemies: [],
    notes:
      "R167. Dark. Massive floor inscription — Prayer Colonnade math at full scale; lich interface to formation + deep presence. " +
      "Deep study ties demon seal + colonnade knowledge to parasitic symbiosis (draw/contain). " +
      "Not sabotage trope: Serevic believes the vigil necessary; epistemic bind blocks the hypothesis that unmakes them. " +
      "Cross-ref: R152–R155, R165 dialogue.",
    props: [
      {
        id: "floor_binding_circle_r167",
        label: "Binding Circle",
        icon: "\u{1F52F}",
        desc: "Arcs and integers span the floor at cathedral scale — the same prayers that dressed the columns, rewritten as one working harness. When I map what I learned of the seal onto the curves, the trade shows bare: strength pulled up from below, strength paid back as cage; a circle that pays me to stop asking whether the wound still needs the needle.",
        gridPosition: { row: 10, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "read_throne_binding_circle_inscriptions_r167" },
          {
            type: "log",
            message:
              "Killing the grandmaster and unmaking what they've wired into the stone aren't the same blow. If I tear the mine down, I have to sever every line that borrows from below. If I walk away, I have to persuade someone who trusts ledgers that the salt mends without their needle still in the wound.",
          },
        ],
      },
    ],
  },
  9: {
    label: "Back to the Sanctum",
    hint: "gallery murals at my back; the suppression ahead is worse.",
    enemies: [],
    exit: { toAreaId: "a5_sanctum", toRoomGridId: 7 },
    notes:
      "Exit. Returns to a5_sanctum R161 (grid 7). Pair: Sanctum room 10 → crystal throne grid 2 (R163).",
  },
};

export const A5_CRYSTAL_THRONE: AreaDef = {
  id: "a5_crystal_throne",
  name: "Crystal Throne",
  desc: "The salt that bought and broke my line — grown into a cathedral before the vigil, then carved, bound, and finally sat in by someone who treats cost as someone else's column.",
  difficulty: 5,
  generator: "authored",
  authored: {
    grid: A5_CRYSTAL_THRONE_GRID,
    rooms: A5_CRYSTAL_THRONE_ROOMS,
  },
  combatRooms: [],
  bossRoom: {
    label: "The Seat",
    enemies: ["boss_lich"],
    hint: "coldfire paints a desiccated face; the eyes still wait for my numbers to confess before I do.",
  },
  hiddenFromTown: true,
};
