import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 1 — The Pale Approach — Mine Mouth (R1–R6)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * Connectivity (per design doc):
 *   exit8(gatehouse) ↔ R1 ↔ R2 ↔ R3(hub) ↔ R4
 *                                    ↔ R5
 *                                    ↔ R6 ↔ exit9(upper galleries)
 *
 * Each corridor segment is isolated (no shared 0-cell components)
 * so the room graph matches the design exactly.
 */

// prettier-ignore
export const A1_MINE_MOUTH_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  5,  5,  5,  1,  1,  1,  1,  1], //  1  R4 Foreman's Office
  [ 1,  8,  8,  1,  1,  1,  1,  1,  1,  5,  5,  5,  1,  1,  1,  1,  1], //  2  exit8 (gatehouse)
  [ 1,  8,  8,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1], //  3  R3→R4 corridor
  [ 1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1], //  4  exit8→R1 corridor
  [ 1,  2,  2,  2,  0,  3,  3,  0,  4,  4,  4,  4,  0,  6,  6,  1,  1], //  5  R1→R2→R3(hub)→R5
  [ 1,  2,  2,  2,  1,  3,  3,  1,  4,  4,  4,  4,  1,  6,  6,  1,  1], //  6
  [ 1,  2,  2,  2,  1,  3,  3,  1,  4,  4,  4,  4,  1,  1,  1,  1,  1], //  7
  [ 1,  1,  1,  1,  1,  3,  3,  1,  4,  4,  4,  4,  1,  1,  1,  1,  1], //  8
  [ 1,  1,  1,  1,  1,  3,  3,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1], //  9  R3→R6 corridor
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7,  1,  1,  1,  1,  1], // 10  R6 Gallery Threshold
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7,  0,  9,  9,  1,  1], // 11  R6→exit9
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7,  1,  9,  9,  1,  1], // 12  exit9
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 13
];

export const A1_MINE_MOUTH_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Entrance Arch",
    hint: "iron cart tracks bite the floor. chisel scars on the shield over the arch — your crest, still there if you squint.",
    enemies: [],
    isStart: true,
    notes:
      "R1. Era 1 + Era 2 plaster. SUNLIT — safe, no combat. " +
      "Era layering visible: raw stone → plaster → neglect. " +
      "Thematic beat: you stand where a fortune was dug from stone — and where the bill was charged to people who did not keep the books.",
    props: [
      {
        id: "ashvere_crest",
        label: "Scarred Shield Above the Arch",
        icon: "\u{1F6E1}\uFE0F",
        desc: "Iron above your head, cold when you touch it. Someone hacked at the relief until their arm tired — they couldn't grind it flat. Pickaxe, crystal, mountain: yours, whether they liked it or not. Deeper cuts spell words you heard at kitchen tables when there was still meat: From the earth, prosperity.",
        gridPosition: { row: 5, col: 2 },
        onExamine: [
          { type: "set_flag", flag: "knows_ashvere_motto" },
          {
            type: "log",
            message:
              "The same phrase the stories mumbled. Standing under it feels different — heavier, and not entirely good.",
          },
        ],
      },
    ],
  },
  3: {
    label: "Weighing Station",
    hint: "rusted scales and chains on a low platform. paper curls; something small scratches in the corners.",
    enemies: ["rat", "rat"],
    notes:
      "R2. Era 1. DIM (some daylight). " +
      "Teaching: documents reward thorough search; rats introduce breeding / door-squeeze mechanics.",
    props: [
      {
        id: "foreman_log",
        label: "Sodden Ledger",
        icon: "\u{1F4D6}",
        desc: "Pages stuck together with damp; the shelf beneath is soft with rot. One header stayed legible when the rest ran: SUPERVISOR — ASHVERE. Your name, typed neat as a tax, sitting over rows of shifts and bodies you don't know yet.",
        gridPosition: { row: 6, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "read_foreman_log" },
          {
            type: "log",
            message:
              "They put our name at the top of the page like we swung the pick. Your stomach turns; you keep reading anyway.",
          },
        ],
      },
      {
        id: "scattered_coins",
        label: "Coins in the Grit",
        icon: "\u{1FA99}",
        desc: "Five pieces kicked into the corner, dull silver, thick enough to feel real in the palm.",
        gridPosition: { row: 7, col: 6 },
        actions: [
          {
            id: "take",
            label: "Gather them",
            effects: [
              { type: "grant_gold", amount: 5 },
              { type: "consume_prop" },
              {
                type: "log",
                message: "Five coins. Small luck — unless someone meant to come back for them.",
              },
            ],
          },
        ],
      },
    ],
  },
  4: {
    label: "Cart Depot",
    hint: "salt carts, heaps that catch the dim light wrong — almost warm. tracks fork into the dark.",
    enemies: ["rat", "rat", "rat"],
    notes:
      "R3. Era 1. DIM. HUB room. " +
      "Deepest salt chunks catch dim light oddly; wall-facing cartloads feel a trace WARM — What Lies Below seed. " +
      "Salt blocks (crafting/quest later — no crafting system yet).",
    props: [
      {
        id: "salt_cart",
        label: "Heaped Salt Cart",
        icon: "\u{1F9C2}",
        desc: "Timber groans under a load that looks fresh — scrape marks on the floor, grit still falling. Whoever fills these carts doesn't rest like you do. When you dig your hand to the bottom, the biggest crystals feel wrong: not cold enough, almost like skin under a fever.",
        gridPosition: { row: 6, col: 9 },
      },
      {
        id: "cart_depot_gold",
        label: "Spill from a Split Box",
        icon: "\u{1FA99}",
        desc: "Splinters of paymaster's wood and eight coins rolled between the wheels. Someone's accounting ended in a hurry.",
        gridPosition: { row: 7, col: 10 },
        actions: [
          {
            id: "take",
            label: "Collect the coins",
            effects: [
              { type: "grant_gold", amount: 8 },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Eight pieces. Enough to eat for a while — or to remind you what this place used to pay.",
              },
            ],
          },
        ],
      },
    ],
  },
  5: {
    label: "Foreman's Office",
    hint: "a crooked portrait — eyes gouged, GREED hacked across the coat. paper stacks choke the desk like snowfall.",
    enemies: [],
    notes:
      "R4. Era 1 + Era 2 vandalism. DIM. " +
      "First proof the heir's prosperity had a line item paid in someone else's life.",
    props: [
      {
        id: "baron_portrait",
        label: "Ruined Portrait",
        icon: "\u{1F5BC}\uFE0F",
        desc: "Oil and varnish, someone's careful work — then knife-work after. The eyes are pale gouges; across the breastplate they carved GREED deep enough to show wood. Whoever did it wanted the next clerk to feel righteous.",
        gridPosition: { row: 1, col: 9 },
      },
      {
        id: "indenture_contracts",
        label: "Stack of Indentures",
        icon: "\u{1F4DC}",
        desc: "Paper that smells of ink and old sweat. Each line item nickels and dimes a life: bunk, lamp oil, shovel edge, bread — billed back to the signer so the tally never shrinks. The same names repeat until the handwriting changes generation to generation. Under the stack, petitions for timbering and air, corners bent, each stamped REVIEWED and filed beside silence.",
        gridPosition: { row: 1, col: 10 },
        onExamine: [
          { type: "set_flag", flag: "read_indentures" },
          {
            type: "log",
            message:
              "They didn't chain men in iron. They chained them in numbers. Your family signed the top of the page; other people's blood paid the margin.",
          },
        ],
      },
      {
        id: "mine_maps",
        label: "Tacked Survey Maps",
        icon: "\u{1F5FA}\uFE0F",
        desc: "Vellum curling at the pins: drifts, pillars, galleries you haven't walked yet. Pencil ghosts another cut into the deep — started, crossed out, started again. Someone was in a hurry to reach something below.",
        gridPosition: { row: 1, col: 11 },
        onExamine: [{ type: "set_flag", flag: "has_mine_maps" }],
      },
      {
        id: "locked_drawer_gold",
        label: "Rotten Drawer",
        icon: "\u{1F512}",
        desc: "Brass lock, swollen wood. It gives when you wrench — splinters bite your hand. Inside, twelve coins in a cloth bundle and a receipt stamped PAID for emergency timbering and airworks. The timber above your head is still wrong; the receipt is a lie you can weigh.",
        gridPosition: { row: 2, col: 10 },
        actions: [
          {
            id: "take",
            label: "Take the coins",
            effects: [
              { type: "grant_gold", amount: 12 },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Twelve pieces that were meant to buy breath for the tunnels. Someone pocketed the money and let the shafts cough.",
              },
            ],
          },
        ],
      },
    ],
  },
  6: {
    label: "Ventilation Shaft Base",
    hint: "a blade of sky far up the shaft. grey ash in the bowl; the iron never catches the sun's warmth.",
    enemies: [],
    notes:
      "R5. Era 1 + Era 2. SUNLIT — safe room (sunlight blocks most monster entry; rest/plan spot). " +
      "Vertical shaft; too narrow to climb. When brazier lit: true-light zone here.",
    props: [
      {
        id: "extinguished_brazier",
        label: "Dead Brazier",
        icon: "\u{1F56F}\uFE0F",
        desc: "Wrought iron at the shaft's foot, ash packed tight as wool, one charred wick stub. Your palm comes away cold. Daylight pours past your shoulder — bright enough to shame the corners — but the bowl stays dead until something blessed feeds it.",
        gridPosition: { row: 5, col: 14 },
        actions: [
          {
            id: "relight",
            label: "Kindle it with the chapel blessing",
            desc: "You carry the words and the gesture they taught you in the sanctified place — the ones that make flame honest.",
            requires: { flags: ["has_consecration"] },
            effects: [
              { type: "set_flag", flag: "mine_brazier_lit" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "The wick catches. Fire stands straight, no flicker, no lie. The shaft feels less like it's swallowing you.",
              },
            ],
          },
          {
            id: "leave_dark",
            label: "Leave it cold",
            desc: "The sun is enough for now. You can remember where this sits.",
            effects: [
              { type: "set_flag", flag: "mine_brazier_noted" },
              {
                type: "log",
                message: "You mark the brazier in your mind and let the ash sleep.",
              },
            ],
          },
        ],
      },
    ],
  },
  7: {
    label: "Gallery Threshold",
    hint: "sick green light runs the ribs of stone — bright, wrong, bloodless. when boots strike, the salt answers with a hum you feel in your teeth.",
    enemies: ["skeleton"],
    notes:
      "R6. Era 1 + first Era 3 coldfire. DIM → DARK. Ceiling drops; cart tracks continue. " +
      "FIRST COLDFIRE — bright, wrong, no protection vs true-light-sensitive threats. Coldfire reads as 'the mine is lit' but teaches: green glow is NOT safety. " +
      "FIRST SKELETON — walks loop into R12 (perpetual shift). First undead fight; first place players may see REFORM if they lack blunt. " +
      "Faint WARMTH threads the draft — wrong for a shallow mine. Salt in the seam HUMS almost below hearing when skeleton's boots strike stone. " +
      "Bridges Mine Mouth to Upper Galleries. Environmental teach: fake light visible ahead.",
  },
  8: {
    label: "To the Gatehouse",
    hint: "cut stone replaces raw tunnel — their blocks, their mortar, sky not far above.",
    enemies: [],
    exit: { toAreaId: "a1_gatehouse", toRoomGridId: 2 },
  },
  9: {
    label: "To Upper Galleries",
    hint: "tracks run on under that green glare into a wider dark.",
    enemies: [],
    exit: { toAreaId: "a1_upper_galleries", toRoomGridId: 2 },
  },
};

export const A1_MINE_MOUTH: AreaDef = {
  id: "a1_mine_mouth",
  name: "Mine Mouth",
  desc: "The first breath of your family's hole in the hill — stone they broke, wealth they pulled, names they put on other men's backs.",
  difficulty: 1,
  generator: "authored",
  authored: {
    grid: A1_MINE_MOUTH_GRID,
    rooms: A1_MINE_MOUTH_ROOMS,
  },
  combatRooms: [],
  townName: "The Pale Vault",
  notes:
    "Area 1 theme: the cost of greed — greed has a price; it is rarely paid by the one who profits. " +
    "Emotional arc: Recognition (crest, log, family door) → Discomfort (contracts, journals) → Triumph (return with blunt). " +
    "Learning: skeleton reform (blunt kills); true light attracts patrols; coldfire = fake safety; dark = risk/reward; zombies follow fixed routes. " +
    "What Lies Below seed: warmth and resonance in deep-facing salt (R3, R6, R29). " +
    "Family throughline: Ashvere crest (R1), surname in log (R2), contracts (R4), Baron's Wing (R24-R29). " +
    "Baron's arithmetic: debts to expand → surface veins thinned → deeper salt richer but costlier → creditors demanded → extraction deepened. Not villainy — arithmetic.",
};
