import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 4 — Sealed Chamber (R141–R145), difficulty 5.
 * Grid: 2=R141, 3=R142, 4=R143, 5=R144, 6=R145; 7=exit shadow R140 (grid 7); 8=descend a5 (pairs R146).
 * Ward hub uses separate 0 legs to seal, shaft, observation — no single 0-cell touches 3+ room IDs.
 */

// prettier-ignore
export const A4_SEALED_CHAMBER_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  6,  6,  0,  3,  3,  0,  5,  5,  0,  8,  8,  1,  1,  1],
  [ 1,  1,  6,  6,  0,  3,  3,  0,  5,  5,  0,  8,  8,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  2,  2,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  2,  2,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
];

export const A4_SEALED_CHAMBER_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Antechamber",
    hint: "salt grows in wrong curves. carved line: BEYOND THIS POINT, THE VIGIL KEEPS.",
    enemies: [],
    isStart: true,
    notes:
      "R141. DARK. Era 1 + 2. Salt grows asymmetric / organic — wrong geometry. Heavy air. " +
      "Light flickers oddly (not Shadow drain). Edge whispers as impressions: warmth, pull, weight — not a voice negotiating. " +
      "Era 2 carved line: \"BEYOND THIS POINT, THE VIGIL KEEPS.\" Ambient demon pressure only. " +
      "Connects R140 (shadow exit) ↔ R142 ward hall.",
  },
  3: {
    label: "Ward Hall",
    hint: "binding marks climb every surface. the air pushes back gently.",
    enemies: [],
    notes:
      "R142. DARK. Era 2. Salt-block corridor: binding formulae, prayer, math sigils floor to ceiling. " +
      "Wards active — faint pushback, not hard block. Finest order craft — supplement to geology, not substitute. " +
      "Connects R141 ↔ R143 seal, R144 shaft head, R145 observation.",
  },
  4: {
    label: "The Seal",
    hint: "salt columns ring a floor sigil. hairline cracks breathe warmth from below.",
    enemies: [],
    notes:
      "R143. DARK. Era 2. Circular chamber; floor sigil; ring of salt columns. Center: stress — hairline cracks, dust, warmth from below. " +
      "Vast, patient presence — draw, not rant; not cartoon mind. Inscriptions (paraphrase): order's wards reinforce natural salt containment, not replace; mining thinned barrier; wards compensated; wards degrade while salt regrows if left alone. " +
      "Binary math: stop mining OR maintain wards forever — forever is lie institutions tell. Cracks correlate with necromantic throughput: lich repairs stabilize one axis while undeath pressure opens another. " +
      "Examine: weight, warmth, appetite without personhood. " +
      "MAJOR DECISION — Demon seal: " +
      "STUDY — Unlocks lich dialogue; affects endings. Reveals presence geological, not sentient — does not push, draws; salt accreted like calcium on irritant; if mining stops salt grows back; natural containment can suffice. Ties R145 log: thinning when people take, healing when they stop; lich ward reinforcement vs crack expansion under necromancy. " +
      "STRENGTHEN — Cost consecration + salt crystal + 3 dungeon turns ritual; mends cracks; fewer/weaker Shadows in Areas 4–5; weakens lich tricks tied to deep presence; easier endgame. " +
      "BREAK — Destroy columns → MISSING enemy demon released (HP ~150, ATK ~20, regenerates, multi-hit, destroys doors); rampage vs lich forces; lich crippled; demon remains problem. Ending 3 (Return — seal intact path) locked permanently. " +
      "Dead end branch off R142 until decision resolved.",
  },
  5: {
    label: "Miner's Shaft Head",
    hint: "black drop into Area 5. rope from the equipment store, or a repaired winch.",
    enemies: [],
    notes:
      "R144. DARK. Era 1 + 2. Top of deepest historic shaft; vertical drop to natural cavern (Area 5 R146). " +
      "Order-sheathed walls; original miner route. Progression gate: rope (R125 or other source) OR repaired lift (mining maul on broken winch). Quieter path than Area 3 R99 Lich's Ward. " +
      "Cross-area: a5_outer_ward return lands grid 5 (this room) per pair rule. Connects R142 ↔ exit 8 (descend).",
  },
  6: {
    label: "Observation Post",
    hint: "a slit frames the seal chamber. a log ties thinning to mining and cracks to necromancy.",
    enemies: [],
    notes:
      "R145. DARK. Era 2 + lich annotations. Slit view toward R143. Observation log structure: " +
      "Order early: \"No change.\" — barrier stable; geology doing most work. " +
      "As mining resumes/deepens: \"Slight thinning, NE quadrant\" — correlates with extraction bearing. " +
      "Lich era: \"Barrier stabilized. Wards reinforced.\" then \"Cracks. Expanding.\" — correlates with necromantic activity; new stress atop old thinning. " +
      "Player synthesis (esp. after seal Study + Crystal Galleries): barrier thins when mine eaten, eases when taking stops; lich maintenance buys time while undeath frays seal; R143 cracks rhyme with log. " +
      "Loot: 10 gold. Dead end.",
  },
  7: {
    label: "Back through shadow depths",
    hint: "the drain-light corridor. your lantern remembers being eaten here.",
    enemies: [],
    exit: { toAreaId: "a4_shadow_depths", toRoomGridId: 7 },
  },
  8: {
    label: "Descend to outer ward",
    hint: "rope burn on the timbers. the crystal cavern breathes below.",
    enemies: [],
    exit: { toAreaId: "a5_outer_ward", toRoomGridId: 2 },
  },
};

export const A4_SEALED_CHAMBER: AreaDef = {
  id: "a4_sealed_chamber",
  name: "Sealed Chamber",
  desc: "The order's last arithmetic: wards on top of geology, forever on the ledger.",
  difficulty: 5,
  generator: "authored",
  authored: {
    grid: A4_SEALED_CHAMBER_GRID,
    rooms: A4_SEALED_CHAMBER_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
  notes:
    "Area 4 Subarea 6 — demon seal decision; observation log; descent to Area 5 R146. " +
    "Ties regrowing salt (R121), ancestor letter (R134), and lich arithmetic into one moral-geometry puzzle.",
};
