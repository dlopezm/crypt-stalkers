import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 2 - Restricted Archive (R51–R55)
 * R51↔R52↔R55; R51↔R53; R51↔R54; exit7↔R51.
 */

// prettier-ignore
export const A2_RESTRICTED_GRID: number[][] = [
 // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 1
 [ 1, 1, 1, 1, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 2 R54 (north)
 [ 1, 1, 1, 1, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 3
 [ 1, 1, 7, 7, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 4 exit7; R54↔R51
 [ 1, 1, 7, 7, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 5 R51 top (R54↔R51 via r4 col5)
 [ 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 6
 [ 1, 1, 2, 2, 2, 0, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 7 R51↔R53
 [ 1, 1, 2, 2, 2, 1, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 8
 [ 1, 1, 2, 2, 2, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1], // 9 R51↔R52
 [ 1, 1, 2, 2, 2, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1], // 10
 [ 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1], // 11
 [ 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1], // 12
 [ 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1], // 13
 [ 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1], // 14
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1], // 15 R52↔R55
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 1, 1, 1], // 16
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 1, 1, 1], // 17
 [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 18
];

export const A2_RESTRICTED_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Restricted Vestibule",
    hint: "archivist desk and seal wax; the air tastes of ink and withheld answers.",
    description:
      "Small checkpoint room before the archive. Scuffed desk, wax crumbs on the floor. Bright coldfire. " +
      "Smooth salt-block walls. Ink and old fabric smell.",
    enemies: [],
    isStart: true,
    notes:
      "R51. COLDFIRE. Era 2. Room design ref R51. " +
      "Archivist checkpoint. Cultist ×1 not in enemy list - fight, sneak, bluff library seal (R59), or Voss cultist disguise route. " +
      "Connects: R50 (grid 9), R52, R53 ritual texts, R54 confessions.",
    props: [
      {
        id: "archivist_checkpoint_desk",
        label: "Checkpoint Desk",
        icon: "\u{1F4DD}",
        desc: "Inkpots dried to crust; a sign-in sheet stops mid-name as if the writer heard something through the stone. Wax crumbs everywhere - seals opened, resealed, opened again.",
        gridPosition: { row: 8, col: 3 },
        onExamine: [
          { type: "set_flag", flag: "read_restricted_vestibule_desk" },
          {
            type: "log",
            message:
              "Whoever sat here knew the public catalog was theater. The real titles went through this desk first.",
          },
        ],
      },
    ],
  },
  3: {
    label: "Shadow Corridor",
    hint: "your light thins with every step; the dark ahead has teeth.",
    description:
      "Long corridor. Your lamp flame shrinks step by step; light does not carry far. " +
      "Rougher stone joins the salt-block. Cold enough to see your breath. Very quiet; ears feel stuffed.",
    enemies: ["shadow"],
    notes:
      "R52. DARK. Era 2+3. Room design ref R52. " +
      "Shadow consumes non-crystal lantern light in 2–3 turns. Crystal Lantern backtrack gate; return from Area 4 to reach R55. " +
      "Connects: R51, R55.",
    props: [
      {
        id: "r52_keyhole_draft",
        label: "Draft from the Restricted Door",
        icon: "\u{1F300}",
        desc: "From the library side you felt it - cold moving like a tongue through the keyhole. Here, the sensation is full: your torch flame leans away as if ashamed.",
        gridPosition: { row: 11, col: 10 },
        onExamine: [
          {
            type: "log",
            message:
              "Whatever lives past the sealed library door does not swallow stone - only borrowed light. Crystal might endure; flesh learns when to step back.",
          },
        ],
      },
    ],
  },
  4: {
    label: "Ritual Texts",
    hint: "ceremonial vault: melody, gesture, invocation - and a map of every sacred brazier.",
    description:
      "Small vaulted room. Salt-block ribs on the ceiling. Dry air. " +
      "Semicircle of reading desks under hooded coldfire - tight bright pools on the books. Floor stone rings if you tap it.",
    enemies: [],
    notes:
      "R53. COLDFIRE. Room design ref R53. Consecration knowledge pairs with relic in Area 3 R102 when implemented. " +
      "Connects: R51 only.",
    safeRoom: true,
    props: [
      {
        id: "full_brazier_relighting_codex",
        label: "Codex: Relighting Sacred Flame",
        icon: "\u{1F4D5}",
        desc: "Full ceremony: melody, gesture, invocation - the parts the cantor's stand hinted and the choir loft completed. Margins argue about tempo; the order's last editors were frightened of silence.",
        gridPosition: { row: 7, col: 6 },
        onExamine: [
          { type: "set_flag", flag: "read_full_brazier_relighting_rite" },
          {
            type: "log",
            message:
              "Relighting is performance, not prayer alone. Strike on the downbeat; wake the basin with voice before oil meets wick.",
          },
        ],
      },
      {
        id: "consecration_rite_fragment",
        label: "Consecration Rite (Transcript)",
        icon: "\u{1F4DC}",
        desc: "The knowledge-half of consecration - words without relic, or relic without words, depending who you ask. The text references something vault-sealed deeper in the crypt.",
        gridPosition: { row: 8, col: 6 },
        onExamine: [
          { type: "set_flag", flag: "read_consecration_rite_knowledge_r53" },
          {
            type: "log",
            message:
              "The text ends where a physical seal begins. Someone penciled a journeyman's door-mark in the margin - a threshold far below you, still shut.",
          },
        ],
      },
      {
        id: "architectural_brazier_map",
        label: "Architectural Brazier Map",
        icon: "\u{1F5FA}\uFE0F",
        desc: "Folded vellum, salt-stained: every sacred hearth from the galleries down, marked by age of build and what each was meant to burn. Lines stitch chapels to pump rooms to mouths of tunnel you have not walked yet.",
        gridPosition: { row: 7, col: 7 },
        onExamine: [
          { type: "set_flag", flag: "read_dungeon_brazier_map" },
          {
            type: "log",
            message:
              "The cavern's great hearth sits like a hub; the smaller bowls are spokes. Burn them in the wrong order, the margin warns, and you call the dead to new paths - not mercy.",
          },
        ],
      },
    ],
  },
  5: {
    label: "Order Confessions",
    hint: "internal ledgers that admit what the pulpits never did.",
    description:
      "Narrow chamber. Floor-to-ceiling shelves; folios spine-out. Steady bright coldfire. " +
      "Thin dust. Old paper, sharp ink, sealing wax. Cool enough that your fingertips stiffen.",
    enemies: [],
    notes:
      "R54. COLDFIRE. Room design ref R54. Internal exploitation record - foreshadows lich themes. " +
      "Connects: R51 only.",
    safeRoom: true,
    props: [
      {
        id: "tithe_and_seizure_folio",
        label: "Skimming Ledgers & Seizure Files",
        icon: "\u{1F4C2}",
        desc: "One fat folio: tithe columns beside 'donated' plots. What reached the vault vs what towns were told; orchards signed away under the same witness names. The order's left hand stole while the right blessed.",
        gridPosition: { row: 2, col: 4 },
        onExamine: [
          { type: "set_flag", flag: "read_tithe_skimming_ledgers" },
          { type: "set_flag", flag: "read_land_seizure_files_r54" },
          {
            type: "log",
            message:
              "Theft dressed as stewardship; soil moved from farmers to filing cabinets. Every page is a sermon they never preached.",
          },
        ],
      },
      {
        id: "recruitment_quota_scrolls",
        label: "Recruitment Quotas by Village",
        icon: "\u{1F4DC}",
        desc: "Tables of children owed per harvest. Margin motto, repeated: Send your children, or the darkness rises. Best to wards, most to administration - penciled in different hands.",
        gridPosition: { row: 2, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "read_recruitment_quota_documents" },
          {
            type: "log",
            message:
              "The arithmetic of fear: more souls listed for cloister service than for sword service every year.",
          },
        ],
      },
      {
        id: "internal_audit_growth_reports",
        label: "Internal Audits - Staff vs Warriors",
        icon: "\u{1F4CA}",
        desc: "Administrative headcount climbing; warrior-class rolls thinning. Graphs as autopsy. Someone underlined the crossing point three times.",
        gridPosition: { row: 3, col: 5 },
        onExamine: [
          { type: "set_flag", flag: "read_order_administrative_bloat_audits" },
          {
            type: "log",
            message:
              "The clerks fed themselves while the hands on the wards starved. No mystery why the barrier thinned - only shame that it was budgeted.",
          },
        ],
      },
      {
        id: "dissident_knight_letter",
        label: "Expelled Knight's Letter",
        icon: "\u{2709}\uFE0F",
        desc: "A single page, furious and clear: The vigil has become its own purpose - we guard nothing and profit from the guarding. Annotation in red: Expelled. Let the salt take his doubts.",
        gridPosition: { row: 3, col: 4 },
        onExamine: [
          { type: "set_flag", flag: "read_dissident_knight_letter_r54" },
          {
            type: "log",
            message:
              "Anger clear as a bell - and every line he feared would come true in Serevic's ink later.",
          },
        ],
      },
    ],
  },
  6: {
    label: "Serevic's Journal",
    hint: "a locked cabinet past the shadow - handwriting still precise, still human.",
    description:
      "Small room past the dark stretch. Low ceiling. One coldfire sconce. Big iron cabinet bolted to the floor. " +
      "Sweating walls. Water drip somewhere. No echo - sound dies within a few paces.",
    enemies: [],
    notes:
      "R55. DARK. Room design ref R55. Premier crystal-lantern backtrack reward; optional placement in Area 5 mortal quarters for extra beat. " +
      "Connects: R52 only.",
    props: [
      {
        id: "serevic_pretransformation_journal",
        label: "Locked Cabinet - Journals",
        icon: "\u{1F510}",
        desc: "Iron cabinet, lock corroded but holding. Inside: Serevic's hand while he still drew breath - barrier tallies, council minutes where the wards' rot sat beside ink raising the tithe, columns weighing corpse-labor against living pay. One undated line breaks the pattern: The evening hymn was particularly fine today. I wonder if that matters.",
        gridPosition: { row: 16, col: 14 },
        actions: [
          {
            id: "take",
            label: "Take the journal bundle",
            effects: [
              { type: "set_flag", flag: "has_serevic_pretransformation_journal" },
              { type: "consume_prop" },
              {
                type: "log",
                message:
                  "Figures cold as a ledger: the old wards fail in thirty to fifty years at the pace he measured. He knew. He wrote it. You could make his heirs read their own hand - if you are cruel enough to mean it.",
              },
            ],
          },
        ],
      },
    ],
  },
  7: {
    label: "Back to the Library Door",
    hint: "the grandmaster seal and the inscription on the public side.",
    description:
      "Few steps to the sealed library door: dark varnish and the carved motto facing the public stacks.",
    enemies: [],
    exit: { toAreaId: "a2_library", toRoomGridId: 9 },
  },
};

export const A2_RESTRICTED: AreaDef = {
  id: "a2_restricted",
  name: "Restricted Archive",
  desc: "What your neighbors' coin bought and never saw - the maps, rites, and confessions they kept past the grandmaster seal.",
  difficulty: 3,
  generator: "authored",
  authored: {
    grid: A2_RESTRICTED_GRID,
    rooms: A2_RESTRICTED_ROOMS,
  },
  combatRooms: [],
};
