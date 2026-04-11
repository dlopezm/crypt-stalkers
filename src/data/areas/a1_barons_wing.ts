import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 1 — Baron's Wing (R24–R29)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * Connectivity (per design doc):
 *   exit9(upper galleries) ↔ R24(sealed door) ↔ R25(gallery hub) ↔ R26(tool cache, dead end)
 *                                                                 ↔ R27(study, dead end)
 *                                                                 ↔ R28(vault, dead end)
 *                                                                 ↔ R29(collapse, dead end)
 *
 * R25 is intentionally a hub — baronial private corridor with four branches.
 * Each branch is isolated (no cross-connections between R26/R27/R28/R29).
 */

// prettier-ignore
export const A1_BARONS_WING_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  4,  4,  1,  5,  5,  1,  1,  1,  1,  1,  1], //  1  R26 Tool + R27 Study
  [ 1,  1,  1,  1,  4,  4,  1,  5,  5,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  1,  1,  1,  1,  0,  1,  0,  1,  1,  1,  1,  1,  1,  1], //  3  R25→R26, R25→R27
  [ 1,  1,  1,  1,  3,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1], //  4  R25 Gallery (hub)
  [ 1,  1,  1,  1,  3,  3,  3,  3,  3,  3,  3,  1,  1,  1,  1], //  5
  [ 1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  0,  1,  1,  1,  1], //  6  R25→R28, R25→R29
  [ 1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  0,  1,  1,  1,  1], //  7
  [ 1,  1,  1,  1,  6,  6,  6,  1,  1,  7,  7,  1,  1,  1,  1], //  8  R28 Vault, R29 Collapse
  [ 1,  2,  2,  0,  6,  6,  6,  1,  1,  7,  1,  1,  1,  1,  1], //  9  R24→R25, R28, R29
  [ 1,  2,  2,  1,  6,  6,  6,  1,  1,  1,  1,  1,  1,  1,  1], // 10  R24 Sealed Door
  [ 1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 11  R24→exit9
  [ 1,  9,  9,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 12  exit9 (upper galleries)
  [ 1,  9,  9,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 13
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 14
];

export const A1_BARONS_WING_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Sealed Door",
    hint: "Ashvere iron: pickaxe, crystal, mountain. the motto is the key.",
    enemies: [],
    isStart: true,
    notes:
      "R24. Junction side: coldfire bleed from R15 outside. No enemies until opened. " +
      "Iron door: ASHVERE CREST — pickaxe crossed with salt crystal over mountain. " +
      "Lock expects FAMILY MOTTO (player knowledge or read through crack: 'From the earth, prosperity' — matches R1). " +
      "FAMILY/IDENTITY GATE, not a skill gate. " +
      "Opening hushes the wing — pristine, untouched, DARK.",
  },
  3: {
    label: "Baron's Gallery",
    hint: "polished salt-crystal walls, portraits under dust. the stone almost rings back.",
    enemies: [],
    notes:
      "R25. Era 1 premium. DARK. Private corridor; finest stonework in Area 1. " +
      "Polished salt-crystal walls (dust-choked). " +
      "SALT-PANEL PORTRAITS: young hopeful baron; older harder baron; family group smiling. " +
      "Inscription: 'The Ashvere Line — Builders of the White Galleries.' " +
      "Crystal here RINGS faintly when struck; in stillness it almost seems to ANSWER something far down and out of sight. " +
      "HUB for tool cache, study, vault, and collapse point.",
  },
  4: {
    label: "Tool Cache",
    hint: "rusted tools — except one maul whose crystal inlay arrested the rust.",
    enemies: [],
    notes:
      "R26. Era 1. DARK. Dead end off R25. " +
      "Personal mining store. Most iron rusted through. " +
      "Exception: MINING MAUL — heavy head, salt-crystal inlay, Ashvere crest on haft; crystal arrested rust. " +
      "PRIMARY BLUNT CAPABILITY; best blunt weapon in game; future mining/breakable wall interactions. " +
      "Intended 'come back prepared' weapon; validates return after first skeleton reform lesson. " +
      "TRIUMPH beat after discomfort in R4/R27.",
  },
  5: {
    label: "Baron's Study",
    hint: "ledgers to pulp; three journals still trace a spiral in clear hand.",
    enemies: [],
    notes:
      "R27. Era 1. DARK. Dead end off R25. " +
      "Desk, chair, shelves of decayed ledgers. THREE JOURNAL VOLUMES trace debt spiral: " +
      "VOL 1 — IDEALISM: discovery of deposit; schools for miners' children; fair wages; pride in honest work. " +
      "VOL 2 — ARITHMETIC: market competition; debts to capital creditors; cutting costs; " +
      "'the deeper veins will make us whole.' " +
      "VOL 3 — THE LEDGER: indentured labor rationalized; safety warnings dismissed — " +
      "'Superstition does not appear on the ledger.' Eve-of-collapse entry: tomorrow the lower gallery breaks through; confidence mixed with hurry. " +
      "TUNING FORK in drawer — baron's pitch (quiet solution for R17 resonance lock). " +
      "Lore bridges to deep areas; fork rewards thorough search.",
  },
  6: {
    label: "Family Vault",
    hint: "inner door wants the motto again. beyond: gold, steel, and a letter you were not meant to read.",
    enemies: [],
    notes:
      "R28. Era 1 reinforced. DARK. Dead end off R25. " +
      "Inner door: COMBINATION — motto again or sequence from journals. " +
      "BARON'S CACHE (bonus): " +
      "PICK-HAMMER (unique blunt+piercing, mythic tool-of-the-mine); " +
      "80 GOLD; " +
      "BARON'S SIGNET RING (Ashvere proof, future dialogue); " +
      "LETTER TO CHILD: 'If the mine takes me, don't come back for it. Let it go.' " +
      "The player VIOLATES the warning. (Not the Area 4 ancestor-miner letter.) " +
      "EMOTIONAL CLIMAX of Area 1; baron knew the cost and went anyway; heir repeats the pattern.",
  },
  7: {
    label: "Collapse Point",
    hint: "the wing ends in void. warm air rises from a fall no rope reaches.",
    enemies: [],
    notes:
      "R29. Era 1 edge / void. DARK. Dead end off R25. " +
      "Wing ends at a CHASM — the 400-year collapse that killed the baron and hundreds. " +
      "Not only timber and bad luck: the deep gallery broke a CRITICAL SALT STRATUM; " +
      "strange heat welled from below; the PRESENCE SURGED; then rubble RE-SEALED the breach. " +
      "Far down: shattered lower gallery hints. Updraft is WARM — wrong for a mine shaft. " +
      "Faint RESONANCE rises from dark, as if salt were still transmitting what happened that day. " +
      "The void reads as something still down there, held back by thickness and time — for now. " +
      "Optional: drop lit torch — long fall, small impact flash — sells real depth. " +
      "Not a passage in Area 1; later ROPE/ENGINEERING (Area 4) may link to Deep Workings. " +
      "FORESHADOW WHAT LIES BELOW.",
  },
  9: {
    label: "To Upper Galleries",
    hint: "coldfire and crossroads beyond the family door.",
    enemies: [],
    exit: { toAreaId: "a1_upper_galleries", toRoomGridId: 5 },
  },
};

export const A1_BARONS_WING: AreaDef = {
  id: "a1_barons_wing",
  name: "Baron's Wing",
  desc: "Sealed Ashvere ground: tools, ledgers, and the baron's warning ignored.",
  difficulty: 2,
  generator: "authored",
  authored: {
    grid: A1_BARONS_WING_GRID,
    rooms: A1_BARONS_WING_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
  notes:
    "Sealed family enclave. Era 1 workmanship at its best; order sealed it; lich ignored. " +
    "~400 years of dust; no coldfire inside — DARK until the player brings flame. " +
    "Gallery (R25) is intentional hub with four distinct branches. " +
    "Baron's arithmetic lore spine: idealism → debt → rationalized exploitation → collapse. " +
    "Key items: MINING MAUL (R26), TUNING FORK (R27), PICK-HAMMER + SIGNET RING (R28). " +
    "Letter in R28 mirrors ancestor-miner letter in Area 4 R134 — same family, same warning, different generation.",
};
