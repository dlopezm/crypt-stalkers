import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 1 - Baron's Wing (R24–R29)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * Connectivity (per design doc):
 *  exit9(upper galleries) ↔ R24(sealed door) ↔ R25(gallery hub) ↔ R26(tool cache, dead end)
 *                                 ↔ R27(study, dead end)
 *                                 ↔ R28(vault, dead end)
 *                                 ↔ R29(collapse, dead end)
 *
 * R25 is intentionally a hub - baronial private corridor with four branches.
 * Each branch is isolated (no cross-connections between R26/R27/R28/R29).
 */

// prettier-ignore
export const A1_BARONS_WING_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
 [ 1, 1, 1, 1, 4, 4, 1, 5, 5, 1, 1, 1, 1, 1, 1], // 1 R26 Tool + R27 Study
 [ 1, 1, 1, 1, 4, 4, 1, 5, 5, 1, 1, 1, 1, 1, 1], // 2
 [ 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1], // 3 R25→R26, R25→R27
 [ 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1], // 4 R25 Gallery (hub)
 [ 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1], // 5
 [ 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1], // 6 R25→R28, R25→R29
 [ 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1], // 7
 [ 1, 1, 1, 1, 6, 6, 6, 1, 1, 7, 7, 1, 1, 1, 1], // 8 R28 Vault, R29 Collapse
 [ 1, 2, 2, 0, 6, 6, 6, 1, 1, 7, 1, 1, 1, 1, 1], // 9 R24→R25, R28, R29
 [ 1, 2, 2, 1, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1, 1], // 10 R24 Sealed Door
 [ 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 11 R24→exit9
 [ 1, 9, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 12 exit9 (upper galleries)
 [ 1, 9, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 13
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 14
];

export const A1_BARONS_WING_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Sealed Door",
    hint: "your family's iron: pickaxe, crystal, mountain. the lock listens for words, not keys.",
    description:
      "Dark after the green galleries; passage narrows to family iron and a letter plate instead of a keyhole. Dust undisturbed - no recent tracks. Cold air, no coldfire.",
    enemies: [],
    isStart: true,
    notes:
      "R24. DARK beyond, coldfire bleed from R15 outside. " +
      "Family/identity gate, not a skill gate.",
    props: [
      {
        id: "barons_wing_door",
        label: "Family Door",
        icon: "\u{1F6AA}",
        desc: "Ashvere work: pickaxe, crystal, mountain raised in iron relief. No keyhole - instead a plate punched for letters, tarnished except where thumbs tried every rumor. You know what belongs there. From the earth, prosperity. Saying it aloud tastes like swallowing pride and ash.",
        gridPosition: { row: 9, col: 2 },
        actions: [
          {
            id: "speak_motto",
            label: "Say the motto aloud",
            requires: { flags: ["knows_ashvere_motto"] },
            effects: [
              { type: "set_flag", flag: "barons_wing_opened" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Tumblers grind; hinges cough a lungful of centuries-old dust. Air beyond is still, cold, untouched - as if the stone held its breath waiting for your voice.",
              },
            ],
          },
        ],
      },
    ],
  },
  3: {
    label: "Baron's Gallery",
    hint: "salt-crystal panels polished until they drink light. faces under dust; when you knock, the wall answers with a faint ring.",
    description:
      "Short private gallery lined with polished salt crystal - panels catch your light and throw back a warmer, amber tint. Low vault, fine dressed work. Knock the wall and a faint ring runs through the crystal.",
    enemies: [],
    notes:
      "R25. Era 1 premium. DARK. Hub room. " +
      "Crystal RINGS faintly when struck; seems to ANSWER something far down - What Lies Below seed.",
    props: [
      {
        id: "salt_portraits",
        label: "Carved Portraits in Salt",
        icon: "\u{1F5BC}\uFE0F",
        desc: "Three panels, dust packed into the lines like snow in engraving. A young man with soft jaw and clean collar - hope without caution. The same face later, mouth thin, eyes deep. Last, a cluster of children and a woman with your cheekbones, everyone smiling because the painter asked. A caption cut shallow: The Ashvere Line - Builders of the White Galleries. Your throat tightens; you share their noses, their stubborn chins.",
        gridPosition: { row: 4, col: 6 },
        onExamine: [
          { type: "set_flag", flag: "seen_baron_portraits" },
          {
            type: "log",
            message:
              "They look proud before they learn the cost. You want to resent them; mostly you want them to have been kinder when the bills came due.",
          },
        ],
      },
    ],
  },
  4: {
    label: "Tool Cache",
    hint: "racks of rotten iron - save one hammer-head glittering with inlaid crystal, crest on the haft.",
    description:
      "Storage off the gallery - wall racks, stone floor littered with rust flakes from ruined tools. Dry, sharp air; thick dust shows every footprint.",
    enemies: [],
    notes:
      "R26. Era 1. DARK. Dead end. " +
      "Triumph beat after discomfort in R4/R27. " +
      "PRIMARY BLUNT CAPABILITY - validates return after skeleton reform lesson.",
    props: [
      {
        id: "mining_maul",
        label: "Crystal-Inlaid Maul",
        icon: "\u{1F528}",
        desc: "Everything else flaked to powder on the stone floor. This one waited: head banded with white glass that kept the steel honest, haft carved with your crest worn smooth by someone else's grip. When you heft it, the weight settles like a debt paid - meant to split rock, meant to end fights that shouldn't get back up.",
        gridPosition: { row: 1, col: 5 },
        actions: [
          {
            id: "take",
            label: "Claim the maul",
            effects: [
              { type: "grant_weapon", weaponId: "warhammer" },
              { type: "set_flag", flag: "has_blunt" },
              { type: "set_flag", flag: "has_mining_maul" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Yours. Not because the law says so - because it fits your hand the way stories said Ashvere tools always would. For the first time down here, you feel less like a trespasser.",
              },
            ],
          },
        ],
      },
    ],
  },
  5: {
    label: "Baron's Study",
    hint: "shelves slumped to rot; three leather spines stayed dry - one bright hand tightens across them all.",
    description:
      "Heavy desk between bowed bookshelves; drawers swollen with age. Thin light; every flat surface wears an even coat of dust - no recent handprints. Little space beyond the desk and the shelves.",
    enemies: [],
    notes: "R27. Era 1. DARK. Dead end. " + "Lore bridges to deep areas.",
    props: [
      {
        id: "baron_journal_v1",
        label: "First Journal - Bright Years",
        icon: "\u{1F4D5}",
        desc: "Ink smells faintly of violets - ridiculous down here. He writes about the first white seam like a lover, promises schools for pit-children, fair tallies, bread with the wages. Sentences long and sure. You can almost like him on these pages. That makes what comes after worse.",
        gridPosition: { row: 1, col: 7 },
        onExamine: [{ type: "set_flag", flag: "read_baron_journal_1" }],
      },
      {
        id: "baron_journal_v2",
        label: "Second Journal - Tight Margins",
        icon: "\u{1F4D5}",
        desc: "Competitors undercut; creditors knock; timber costs climb. Phrases shorten. He starts crossing out whole paragraphs. The deeper salt will save us, he repeats, as if depth were mercy. Numbers creep into the margins until they eat the prose.",
        gridPosition: { row: 2, col: 7 },
        onExamine: [{ type: "set_flag", flag: "read_baron_journal_2" }],
      },
      {
        id: "baron_journal_v3",
        label: "Third Journal - The Last Ink",
        icon: "\u{1F4D5}",
        desc: "Indenture defended as 'contractual clarity.' Timbering requests denied: Superstition does not appear on the ledger - underlined twice. The night before silence: Tomorrow we open the lower gallery; the vein runs true. Hand steadier than it should be. After that entry, nothing - only paper, as if the pen refused or never got the chance.",
        gridPosition: { row: 2, col: 8 },
        onExamine: [
          { type: "set_flag", flag: "read_baron_journal_3" },
          {
            type: "log",
            message:
              "He wrote off fear as a line item. The next morning he walked into the dark he helped dig. You close the cover gently, as if noise could wake him.",
          },
        ],
      },
      {
        id: "tuning_fork",
        label: "Mounted Tuning Fork",
        icon: "\u{1F3B5}",
        desc: "Bottom drawer, velvet gone to mold. Steel fork on a salt-crystal stand - when you strike it, the note hangs clean, and the desk grain shivers under your knuckles. Someone tuned galleries with this, or doors, or both.",
        gridPosition: { row: 1, col: 8 },
        actions: [
          {
            id: "take",
            label: "Lift the fork",
            effects: [
              { type: "set_flag", flag: "has_tuning_fork" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "The hum travels through your arm into the walls. Salt answers salt; you feel foolish for not hearing it sooner.",
              },
            ],
          },
        ],
      },
    ],
  },
  6: {
    label: "Family Vault",
    hint: "second lock, same words as the arch. past it: coin, a show-piece tool, and paper in his hand - unsealed, unsent.",
    description:
      "Inner chamber: iron bands, salt plugs, low ceiling. Cold still air, no draft; quiet - no ring from the crystal gallery. Narrow floor, vault layout.",
    enemies: [],
    notes:
      "R28. Era 1 reinforced. DARK. Dead end. " +
      "EMOTIONAL CLIMAX of Area 1 - baron knew the cost and went anyway; heir repeats the pattern. " +
      "Not the Area 4 ancestor-miner letter - different generation, same warning.",
    props: [
      {
        id: "vault_door",
        label: "Inner Vault Portal",
        icon: "\u{1F510}",
        desc: "Iron bands, salt plugs, a letter-plate meant for speech not keys. The same motto the arch wore - or the rhythm those journals hammered into your head until words felt like numbers. Your mouth is dry before you try.",
        gridPosition: { row: 8, col: 4 },
        actions: [
          {
            id: "open",
            label: "Speak the motto to the plate",
            requires: { flags: ["knows_ashvere_motto"] },
            effects: [
              { type: "set_flag", flag: "vault_opened" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Bolts sigh back. Dust falls in a single sheet, undisturbed until your breath disturbed it - as if the room waited only for Ashvere air.",
              },
            ],
          },
        ],
      },
      {
        id: "pick_hammer",
        label: "Ceremonial Pick-Hammer",
        icon: "\u{2692}\uFE0F",
        desc: "Displayed like relic and meant like work: blunt face on one end, needle pick on the other, crystal veining catching what little light you brought. The crest on the collar is yours, worn bright where palms tested the balance before parades and before shifts.",
        gridPosition: { row: 9, col: 5 },
        condition: { flags: ["vault_opened"] },
        actions: [
          {
            id: "take",
            label: "Lift it from the stand",
            effects: [
              { type: "grant_weapon", weaponId: "warhammer" },
              { type: "set_flag", flag: "has_pick_hammer" },
              { type: "set_flag", flag: "has_blunt" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Metal and crystal, heavy with intent - the kind of tool they showed visitors, then carried underground when pretty words failed.",
              },
            ],
          },
        ],
      },
      {
        id: "vault_gold",
        label: "Rusted Strongbox",
        icon: "\u{1FA99}",
        desc: "Box jammed under a warped leg; lock corroded honest. Inside, eighty coins stacked with cloth between - dull, patient, never spent on the life above. They smell of oil and old fear.",
        gridPosition: { row: 10, col: 5 },
        condition: { flags: ["vault_opened"] },
        actions: [
          {
            id: "take",
            label: "Load the coins out",
            effects: [
              { type: "grant_salt", amount: 80 },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Eighty pieces. Enough to rebuild a name - or to understand why they left it to rot rather than spend it on mercy.",
              },
            ],
          },
        ],
      },
      {
        id: "signet_ring",
        label: "Warm Signet",
        icon: "\u{1F48D}",
        desc: "Gold softened by skin oil long gone; crest raised, edges still sharp. It would fit your finger if you forced it - proof pressed into wax, proof pressed into flesh.",
        gridPosition: { row: 9, col: 6 },
        condition: { flags: ["vault_opened"] },
        actions: [
          {
            id: "take",
            label: "Slip it on",
            effects: [
              { type: "set_flag", flag: "has_signet_ring" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "The metal sits cool, then warms. Outside these walls the world forgot you; the ring remembers.",
              },
            ],
          },
        ],
      },
      {
        id: "letter_to_child",
        label: "Letter Folded Open",
        icon: "\u{2709}\uFE0F",
        desc: "Paper foxed at the edges, ink brown. His hand - you've seen it all day in the journals. If the mine takes me, do not come for my bones. Do not come for the wealth. Let the debt die with the shaft. Tell your mother I tried to keep the count honest at the start. Tell yourself whatever you must. Let it go. No seal. No direction. He never gave the order to send it, or someone refused. You stand in the dark he begged a child to avoid, dust on your tongue, his wealth in reach, his warning in your hands. Pride and shame braid so tight you cannot pull one thread free.",
        gridPosition: { row: 10, col: 6 },
        condition: { flags: ["vault_opened"] },
        onExamine: [
          { type: "set_flag", flag: "read_baron_letter" },
          {
            type: "log",
            message:
              "He asked the next life to walk away. You didn't. That doesn't feel like victory - it feels like love and stubbornness and the same mistake dressed in better clothes.",
          },
        ],
      },
    ],
  },
  7: {
    label: "Collapse Point",
    hint: "polished salt stops at nothing - black gulf, updraft hot as breath from deep lungs.",
    description:
      "Polished gallery ends at a cliff into black. Hot updraft, grit in the wind; far below, quick flashes - timber, salt, pale rubble - then black again. At the edge your sinuses press; the salt hums.",
    enemies: [],
    notes:
      "R29. Era 1 edge / void. DARK. Dead end. " +
      "Not a passage in Area 1; later ROPE/ENGINEERING (Area 4) may link to Deep Workings. " +
      "FORESHADOW WHAT LIES BELOW.",
    props: [
      {
        id: "collapse_chasm",
        label: "The Drop",
        icon: "\u{1F573}\uFE0F",
        desc: "Your family's pretty gallery shears into air. Wind climbs from below - too warm, carrying grit and a hum that isn't quite sound, more like pressure against your sinuses. Far under, broken angles catch stray gleams: ribs of timber, a flash of white that might be more salt, might be bone. Stories said the lower gallery punched through something it shouldn't; heat pushed up; the ceiling walked; hundreds died including the man whose journals you read. Standing here, belief isn't required. Your palms sweat; the stone under your boots feels thin.",
        gridPosition: { row: 8, col: 10 },
        actions: [
          {
            id: "drop_torch",
            label: "Let a lit torch fall",
            effects: [
              { type: "set_flag", flag: "measured_chasm_depth" },
              {
                type: "log",
                message:
                  "Light shrinks to a coin, then a spark, then black. Counting heartbeats doesn't help. The hole is hungry.",
              },
            ],
          },
        ],
      },
    ],
  },
  9: {
    label: "To Upper Galleries",
    hint: "green glare and many paths wait beyond the iron you closed behind you.",
    description: "Past the family door: green coldfire and the wider gallery network.",
    enemies: [],
    exit: { toAreaId: "a1_upper_galleries", toRoomGridId: 5 },
  },
};

export const A1_BARONS_WING: AreaDef = {
  id: "a1_barons_wing",
  name: "Baron's Wing",
  desc: "Your family's private slice of the mine - locked while the order preached, untouched while the dead walked - still holding tools, tallies, and words begging you to turn back.",
  difficulty: 2,
  generator: "authored",
  authored: {
    grid: A1_BARONS_WING_GRID,
    rooms: A1_BARONS_WING_ROOMS,
  },
  combatRooms: [],
  notes:
    "Sealed family enclave. Era 1 workmanship at its best; order sealed it; lich ignored. " +
    "~400 years of dust; no coldfire inside - DARK until the player brings flame. " +
    "Gallery (R25) is intentional hub with four distinct branches. " +
    "Baron's arithmetic lore spine: idealism → debt → rationalized exploitation → collapse. " +
    "Key items: MINING MAUL (R26), TUNING FORK (R27), PICK-HAMMER + SIGNET RING (R28). " +
    "Letter in R28 mirrors ancestor-miner letter in Area 4 R134 - same family, same warning, different generation.",
};
