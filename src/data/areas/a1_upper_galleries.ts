import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 1 - Upper Galleries (R12–R18)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * Connectivity (per design doc):
 *  exit9(mine mouth) ↔ R12(main) ↔ R13(east, dead end)
 *                 ↔ R14(west) ↔ exit10(warrens)
 *                 ↔ R15(junction) ↔ R16(patrol, dead end)
 *                          ↔ R17(gate) ↔ R18(alcove, dead end)
 *                                ↔ exit12(Area 2)
 *                          ↔ exit11(baron's wing)
 *
 * KEY TOPOLOGY FIX: R12 must NOT connect directly to R14 or warrens exit.
 * Player must pass through R15 (Junction Hall) to reach the western branches.
 * R15 is the chokepoint/decision hub.
 */

// prettier-ignore
export const A1_UPPER_GALLERIES_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
 [ 1, 9, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 1 exit9 (mine mouth)
 [ 1, 9, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 2
 [ 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 3 exit9→R12
 [ 1, 2, 2, 2, 2, 2, 2, 0, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1], // 4 R12→R13
 [ 1, 2, 2, 2, 2, 2, 2, 1, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1], // 5
 [ 1, 2, 2, 2, 2, 2, 2, 1, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1], // 6
 [ 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 7 R12→R15 corridor
 [ 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 8
 [ 1, 10, 10, 0, 5, 5, 5, 5, 5, 0, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1], // 9 exit10(warrens)←R15→R16
 [ 1, 10, 10, 1, 5, 5, 5, 5, 5, 1, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1], // 10
 [ 1, 1, 1, 1, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 11
 [ 1, 4, 4, 0, 5, 5, 5, 5, 5, 0, 7, 7, 7, 0, 8, 8, 1, 1, 1, 1], // 12 R14←R15→R17→R18
 [ 1, 4, 4, 1, 1, 1, 0, 1, 1, 1, 7, 7, 7, 1, 8, 8, 1, 1, 1, 1], // 13
 [ 1, 4, 4, 1, 1, 11, 11, 1, 1, 1, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1], // 14 exit11(baron's wing)
 [ 1, 1, 1, 1, 1, 11, 11, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1], // 15 R17→exit12
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 12, 1, 1, 1, 1, 1, 1, 1, 1], // 16 exit12 (Area 2)
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 12, 1, 1, 1, 1, 1, 1, 1, 1], // 17
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 18
];

export const A1_UPPER_GALLERIES_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Main Gallery",
    hint: "green light tubes the ceiling like veins. iron shines slick and false; your shadow looks thin.",
    description:
      "Corridor opens wide - cracked plaster over older stone, green coldfire strips along the vault. Iron picks up the green glow. Footsteps echo; sometimes a faint buzz from the salt on the deep-facing walls.",
    enemies: ["skeleton"],
    isStart: true,
    notes:
      "R12. Era 1 + coldfire. FIRST skeleton fight. " +
      "Teaches damage-type gating: dagger pierce resisted, need bludgeoning (Pick). " +
      "Shielded Stance (Armor 2 every other turn) teaches timing. Bone Thorns teach Unaware value.",
  },
  3: {
    label: "Side Gallery East",
    hint: "shoulder-wide; rubble underfoot. names and marks gouged in the wall - a headless figure of carved salt stares from its niche.",
    description:
      "Shoulder-wide cut, loose rubble underfoot, raw seam where plaster never reached. Pitch black without your light; breath fogs; water dripping ahead.",
    enemies: ["rat", "rat", "rat", "rat", "rat"],
    notes:
      "R13. Era 1. DARK. Dead end. ⚔ RAT ×5 — biggest swarm so far. " +
      "Teaches value of AoE (Cleave, Flare, Bone Splinter). Chain Hauberk Armor 2 = all hits do 0. " +
      "MINING PICK reward — enables skeleton kills in R15+.",
    props: [
      {
        id: "miner_graffiti",
        label: "Scratched Tallies",
        icon: "\u{270D}\uFE0F",
        desc: "Chisel and knife work: strokes that might be days, or bodies, or both. Names worn smooth by palms. A rat scratched with a line through it - brag, warning, or grief. The letters look older than the clean salt blocks farther in.",
        gridPosition: { row: 4, col: 9 },
      },
      {
        id: "salt_saint_shrine",
        label: "Broken Salt Figure",
        icon: "\u{1F9CE}",
        desc: "Someone's saint of the seam, carved from the same white stuff they died in - neck sheared ragged, offerings long stolen. The priests never blessed this corner; the miners did. Behind the stump of neck, tin winks: a box forced into the rock.",
        gridPosition: { row: 5, col: 11 },
        actions: [
          {
            id: "search",
            label: "Reach behind the figure",
            effects: [
              { type: "grant_salt", amount: 10 },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Ten salt crystals in a dented lunch tin, wrapped in oilcloth. Whoever left them believed more in hiding than in saints.",
              },
            ],
          },
        ],
      },
      {
        id: "abandoned_pick",
        label: "Lodged Mining Pick",
        icon: "\u26CF\uFE0F",
        desc: "Iron head buried in the rock face where a miner was working the seam. The ash handle is cracked but holds. Heavy head, short swing - a tool for breaking rock. The miner who left it didn't plan on fighting bone. But rock and bone break the same way.",
        gridPosition: { row: 6, col: 10 },
        actions: [
          {
            id: "take",
            label: "Wrench it free",
            effects: [
              { type: "grant_weapon", weaponId: "mining_pick" },
              { type: "set_flag", flag: "has_blunt" },
              { type: "consume_prop" },
              {
                type: "log",
                message: "Weight for weight, this will do what your edge can't.",
              },
            ],
          },
        ],
      },
    ],
  },
  4: {
    label: "Side Gallery West",
    hint: "new iron scratches on old stone. a plaque: SEALED BY DECREE - someone chipped around it anyway.",
    description:
      "Old cart scratches on stone; fresher tool marks at a breach beside a sealed-by-decree plaque. Thin cold air; iron lintel scratched and worn bright in patches.",
    enemies: ["rat", "rat"],
    notes:
      "R14. Era 1 + recent breach. DARK. " + "Mira escape vector; risky exploration without flame.",
    props: [
      {
        id: "sealed_decree_plaque",
        label: "Sealed-by-Decree Plaque",
        icon: "\u{1F4CB}",
        desc: "Letters cut deep, full of pomp: SEALED BY DECREE OF THE PALE VIGIL. Chips and pale dust say someone disagreed with parchment and chisel. The breach gapes beside it - rude, human, impatient.",
        gridPosition: { row: 12, col: 2 },
      },
    ],
  },
  5: {
    label: "Junction Hall",
    hint: "vaulted roof; four ways to regret. a splintered board still names Chapel, Library, Quarters - deeper in.",
    description:
      "Four-way junction under a high vault - salt-block ribs, cracked signboards, green coldfire on everything. Echoes pile up. Drafts pull dust from the plaster seams.",
    enemies: ["skeleton", "skeleton", "zombie"],
    notes:
      "R15. COLDFIRE. Central chokepoint. ⚔ SKELETON ×2 + ZOMBIE — formation teaching fight. " +
      "Teaches prioritization: zombie = slow but tanky, skeleton = fragile but reforms.",
    props: [
      {
        id: "directional_sign",
        label: "Cracked Direction Post",
        icon: "\u{1F6A7}",
        desc: "Oak split down the grain; iron letters cling. Chapel - Library - Quarters, each arm pointing into a different throat of dark. Over Quarters, some wit scratched a skull until the wood splintered. Ugly, honest, still readable.",
        gridPosition: { row: 9, col: 6 },
      },
      {
        id: "mira_encounter_1",
        label: "Running Woman",
        icon: "\u{1F3C3}",
        desc: "Sack over her shoulder, boots sliding on grit - she checks mid-stride, sees you, goes paler than the salt. A glass vial spills from her pack and rings on stone. Her voice tears: 'That green glare doesn't fool them - it never did!' Then she's gone into the western cut, breath and panic echoing.",
        gridPosition: { row: 10, col: 5 },
        actions: [
          {
            id: "take_potion",
            label: "Snatch the fallen vial",
            effects: [
              { type: "set_flag", flag: "mira_met" },
              { type: "set_flag", flag: "has_healing_potion_mira" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Syrup thick as honey, label scuffed - the kind peddlers sell for knife wounds and fever. Her fear tasted true.",
              },
            ],
          },
        ],
      },
    ],
  },
  6: {
    label: "Patrol Station",
    hint: "bone sentries slump as if between rounds that never end. one mace on the rack forgot to rust through.",
    description:
      "Side room: weapon rack, bench, corners where the green light thins. Steady coldfire glow. Oil smell, grit on the air.",
    enemies: ["skeleton", "skeleton"],
    notes:
      "R16. COLDFIRE. Dead end. ⚔ SKELETON ×2 — multi-skeleton fight. " +
      "Tests weapon choice: Pick ideal (bludgeoning). Shielded stance timing with two enemies.",
    props: [
      {
        id: "rusty_mace",
        label: "Patrol Mace",
        icon: "\u{1F528}",
        desc: "Rack iron flaked orange; this head stayed solid, dense as a butcher's block. The shaft fits your palm the way tools meant for breaking stone do. Whatever wore this uniform last didn't need an edge - they needed weight.",
        gridPosition: { row: 9, col: 11 },
        actions: [
          {
            id: "take",
            label: "Lift it from the rack",
            effects: [
              { type: "grant_weapon", weaponId: "warhammer" },
              { type: "set_flag", flag: "has_blunt" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "The heft settles in your wrist. When the next hollow thing stands up, you'll answer with something that doesn't leave room for argument.",
              },
            ],
          },
        ],
      },
      {
        id: "patrol_schedule",
        label: "Carved Route",
        icon: "\u{1F4CB}",
        desc: "Lines chiseled into plaster: Main Gallery, Junction, Inner Gate, Junction, repeat. Little hatch marks count breaths between stops - four beats, pause, march. Someone turned nightmare into timetable.",
        gridPosition: { row: 10, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "read_patrol_schedule" },
          {
            type: "log",
            message:
              "You trace the groove with your thumb until your own pulse matches. If they're clockwork, you can steal the gaps.",
          },
        ],
      },
    ],
  },
  7: {
    label: "The Inner Gate",
    hint: "a slab of dressed salt big as a house front. lever, palm hollow, and gouges beside a slot - like someone tried to write a tune in stone.",
    description:
      "Corridor ends at a huge dressed-salt slab - shallow flame reliefs picked out green by the strips overhead. Lever, worn hand hollow, narrow slot. Lean in and a low vibration comes through the stone into your jaw and hands.",
    enemies: ["skeleton", "skeleton", "skeleton", "zombie"],
    notes:
      "R17. COLDFIRE. PROGRESSION GATE to Area 2. ⚔ SKELETON ×3 + ZOMBIE — Area 1 climax fight. " +
      "Tests everything learned: damage types, mixed types, timing, Thorns interaction.",
    props: [
      {
        id: "inner_gate",
        label: "Salt Slab and Locks",
        icon: "\u{1F6AA}",
        desc: "The door is salt dressed like marble, flame reliefs shallow enough to catch green light. A lever rusted stiff; a handprint worn by palms; beside them a narrow slot and scrapes that rise and fall like notes someone couldn't quite remember. The whole slab hums faintly when you lean close - waiting.",
        gridPosition: { row: 12, col: 11 },
        actions: [
          {
            id: "use_fork",
            label: "Touch the fork to the slot",
            desc: "Steel and crystal sing; the stone listens. No need to shout.",
            requires: { flags: ["has_tuning_fork"] },
            effects: [
              { type: "set_flag", flag: "inner_gate_opened" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "One clear tone. The slab shivers; dust spills in sheets. The way open is almost gentle - as if the gate prefers music to muscle.",
              },
            ],
          },
          {
            id: "hum",
            label: "Hum what the painted hall taught",
            desc: "You carry the vigil's song in your head from the receiving hall; the scratches want that shape.",
            requires: { flags: ["seen_singing_frescoes"] },
            effects: [
              { type: "set_flag", flag: "inner_gate_opened" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Your throat goes dry. When the note lands true, salt clicks deep inside - a swallow, a giving way - and cold air rolls through.",
              },
            ],
          },
          {
            id: "bash",
            label: "Drive the lock apart",
            desc: "Every ear in the tunnels will hear. So will every thing that patrols them.",
            requires: { flags: ["has_blunt"] },
            effects: [
              { type: "set_flag", flag: "inner_gate_opened" },
              { type: "set_flag", flag: "inner_gate_bashed" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Metal shrieks; salt rains. Footfalls that were distant snap toward you - disciplined, eager, many.",
              },
            ],
          },
        ],
      },
    ],
  },
  8: {
    label: "Brazier Alcove",
    hint: "carved pocket in the wall; brasswork black with cold. faceted salt winks back at torch or tinder.",
    description:
      "Wall niche off the gate - blackened brass, faceted salt glass in the rim that splinters torchlight. Dark until lit; then heat and a small dry pocket of air.",
    enemies: [],
    notes:
      "R18. Era 2. DARK. Dead end. " +
      "When LIT: true-light safe zone R17–R18; skeleton patrols redirect - tactical map shift.",
    props: [
      {
        id: "alcove_brazier",
        label: "Niche Brazier",
        icon: "\u{1F56F}\uFE0F",
        desc: "Brass scrolled like sermon metal, bowl full of last century's ash. Salt glass in the rim throws your torchlight into shards. This was meant to burn the honest way - oil and prayer - before the green strips overhead stole the idea of light.",
        gridPosition: { row: 12, col: 14 },
        actions: [
          {
            id: "relight",
            label: "Light it with the chapel hymn",
            desc: "You know the verses they sing when flame must mean sanctuary, not show.",
            requires: { flags: ["has_hymn_knowledge"] },
            effects: [
              { type: "set_flag", flag: "alcove_brazier_lit" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Fire catches clean - no green edge, no chemical stink. Heat pushes the damp back; somewhere behind stone, bone feet hesitate and turn aside.",
              },
            ],
          },
        ],
      },
    ],
  },
  9: {
    label: "To Mine Mouth",
    hint: "air turns a fraction warmer toward the sun-cut entrance.",
    description: "Air warms slightly toward the sunlit entrance.",
    enemies: [],
    safeRoom: true,
    exit: { toAreaId: "a1_mine_mouth", toRoomGridId: 7 },
  },
  10: {
    label: "To Excursion Warrens",
    hint: "props and clawed earth - a newer bite someone dug without asking.",
    description: "Plaster ends; clawed earth and new timber shoring - a fresh dig.",
    enemies: [],
    exit: { toAreaId: "a1_excursion_warrens", toRoomGridId: 2 },
  },
  11: {
    label: "To Baron's Wing",
    hint: "Ashvere iron ahead; the words on the lock will be the ones over the arch.",
    description: "Ashvere iron door frame - heavier metal than the gallery work around it.",
    enemies: [],
    exit: { toAreaId: "a1_barons_wing", toRoomGridId: 2 },
  },
  12: {
    label: "To Sanctified Cloister",
    hint: "beyond the gate, the order's deep domain waits.",
    description: "Past the gate: dressed salt, colder air, very little sound.",
    enemies: [],
    exit: { toAreaId: "a2_cloister", toRoomGridId: 2 },
  },
};

export const A1_UPPER_GALLERIES: AreaDef = {
  id: "a1_upper_galleries",
  name: "Upper Galleries",
  desc: "Near-surface tunnels where someone strung sick green lamps overhead and left bone to walk the same path forever.",
  difficulty: 1,
  generator: "authored",
  authored: {
    grid: A1_UPPER_GALLERIES_GRID,
    rooms: A1_UPPER_GALLERIES_ROOMS,
  },
  combatRooms: [],
  notes:
    "Main mine corridors; skeleton patrols; Era 1 tunnels under cracking Era 2 plaster; Era 3 coldfire overhead. " +
    "R15 Junction Hall is the central chokepoint - all western branches (warrens, baron's wing) and deeper access (gate, patrol) route through it. " +
    "Deeper-facing walls occasionally carry wrong warmth and almost-tone in salt when mine is quiet. " +
    "Patrol schedule readable from R16; timing matters for stealth approaches.",
};
