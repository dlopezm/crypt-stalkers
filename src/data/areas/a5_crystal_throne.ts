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
    hint: "three centuries of tool-marks and spell-work stack on the walls; your torch shrinks here like it knows better.",
    enemies: [],
    isStart: true,
    notes:
      "R163. Always. Dark; lich-suppressed light — ordinary torches/lanterns halved in radius; crystal lantern resists (reduced but still reaches). " +
      "If R160 Deep Brazier and/or R158 altar brazier relit: suppression weaker; ordinary light more usable. " +
      "Three eras layered on walls (chisel, order carving, necromantic inscription). " +
      "Cross-ref: R161, R164, R165. Teaching: prep vs suppression stacks across Areas 4–5.",
  },
  3: {
    label: "The Formation",
    hint: "salt grown into a cathedral; prayers and bindings crawled up it after the fact.",
    enemies: [],
    notes:
      "R164. Always. Dark while suppressed. MASSIVE room (~9×9 cells) — natural salt-crystal cluster; Era 2 prayers carved into faces; Era 3 binding sigils parasitic on the surface. " +
      "LIGHT CLIMAX: crystal lantern at full near formation OR Crystal Master Array (Area 4) feeding light this deep → formation amplifies → refracted brilliance; suppression breaks; inscriptions legible; lich modifications read as grafts on a wonder. " +
      'Lich bark (controlled irritation): "You increased ambient illumination. The formation responds to frequency, not sentiment." ' +
      "Mechanical payoff: reveals R166 cavity; weakens light-wipe phases toward R165; emotional peak of the dungeon's visual language. " +
      "Cross-ref: R160, R158, R166, R165.",
  },
  4: {
    label: "The Seat",
    hint: "a plain salt chair faces the crystal; coldfire paints a face that still does math faster than you.",
    enemies: ["boss_lich"],
    isBoss: true,
    notes:
      "R165. Coldfire (lich-controlled). Grandmaster Serevic — enemy boss_lich (HP 90, ATK 15). " +
      "Room: small salt-block chair (not throne — maintenance over ostentation) facing formation; coldfire on lich; in true light face reads human-once, desiccated, eyes still sharp. " +
      "Phase 0 — CONVERSATION (default start unless player attacks into Phase 1). Branching by knowledge depth: " +
      'Minimal (rushed/combat-first/little lore): open "You came for the salt. Everyone comes for the salt. Take what you want from above. Leave my work alone." → Ending 1 only (fight; partnership if offered/accepted still philosophically Ending 1). ' +
      "Moderate (library, NPCs, surface history): \"You've read the histories. Then you know why I'm here. The barrier was failing. The council refused to act. I did the math. Show me the error in the logic.\" → Endings 1 and 2 structurally negotiable (inherit still needs deeper checklist). " +
      "Deep (demon seal studied, regrowing salt known, pre-transformation journal found): \"You've seen the deep galleries. The unmined sections. You're going to tell me the salt is growing back.\" → Endings 1–4 available as branches when flags + credibility allow. " +
      'Voice anchors (design): precise — "The northwest ward requires recalibration every 73 days. I have not missed one."; impatient — "The council said \'it\'s fine.\' I showed them the numbers. They chose not to read them."; bitter — "I solved the problem your ancestors created. You\'re welcome."; justified — "Show me the error in the logic."; diagnostic curiosity — "What do you know? What can you do? Are you useful, or are you another taker?" ' +
      'Item/knowledge triggers: Baron\'s signet — "An Ashvere. Your family started this. The debts, the deep mining, the collapse. Four hundred years later, here you are to take more."; ancestor bone tag — "Yes. Crew 7, recovered from the collapse gallery. Processed and deployed to the northwestern ward. Still functional."; regrowing salt / Area 4 evidence — silence then "The crystal galleries are not my operational priority." (deflection; they know); journal presented — "Where did you find that?" hymn entry stalls the spreadsheet; hymn performed — composure break: "Stop." then quiet then "The dead can\'t sing. I needed the dead more than the singing. That was the calculation."; high loot ratio — "You came here to take. Just like everyone. Just like me."; high consecration ratio — "You\'ve been giving things up. That takes... I don\'t know what that takes." ' +
      "Vulnerable primarily to hymn (per design). " +
      "THE OFFER (Ending 1 partnership): \"The mine was your family's. Take the title, reopen the upper galleries, manage the town. I continue the deep maintenance. All I ask: don't interfere below.\" Sincere, rational, mutually beneficial on paper — dead still pay; accepting = Ending 1 (partnership), not a separate good ending. " +
      "Ending 2 (Inherit): living vigil transfer after deep knowledge + hymn performed + binding proof in conversation. " +
      "Ending 3 (Return): collapse deep workings — array + consecration + seal studied + seal intact. " +
      "Ending 4 (Release): full evidence + hymn + credibility + seal studied not broken; possible no-fight resolution; walk out carrying nothing. " +
      "Phase 1 — COMBAT if talk fails or player opens with violence. Tests ALL systems: turns 1–3 summon Elite Skeletons (2/turn) as boss_skeleton_lord — blunt essential vs reform; 4–6 raise fallen — consecration gates; 7+ extinguish room light — crystal lantern persists; lich casts from back row — ranged; Skullflower eruptions from crystal channels — MISSING skullflower type (notes): use fire clears barriers. " +
      "If R160 / R158 / Light Climax active: fewer summons, slower raises, partial not total blackout. " +
      'Phase 2 — JOURNAL ON DESK (R169): if Serevic\'s pre-transformation journal (Area 2 R55) was placed on R169 desk, lich senses it before/as combat starts — same phase skeleton but facade cracks; mechanically slight delay or −1 first-wave skeleton; barks shift to exposure ("You read that. You brought that here.") not pity. ' +
      "MISSING: skullflower enemy id; gutborn/demon where referenced in doc — notes only.",
  },
  5: {
    label: "Phylactery Chamber",
    hint: "only light and violence against the growth convince the stone to show what it swallowed.",
    enemies: [],
    notes:
      "R166. Hidden until lit. Dark cavity inside formation; revealed by crystal lantern full at formation OR Light Climax (R164). " +
      "Phylactery: salt-crystal orb around still-beating heart; fused into geology — not on a shelf; immortality literal bedrock. " +
      "Destroy: requires light to see + deliberate violence against sacred crystal (strike hosting spar) — breaks order taboo and lich anchor. " +
      "If not destroyed: lich may regenerate after apparent kill (bad variant / lingering influence in epilogues). " +
      "Metaphor: only light reveals what grew in dark. Cross-ref: R164, R165.",
  },
  6: {
    label: "Binding Circle",
    hint: "the floor is one equation at cathedral scale — power borrowed and power paid back in the same ink.",
    enemies: [],
    notes:
      "R167. Dark. Massive floor inscription — Prayer Colonnade math at full scale; lich interface to formation + deep presence. " +
      "Deep study (demon seal + library/colonnade): parasitic symbiosis — lich draws from deep presence for undeath and channels power back to contain it; if regrowing salt naturally contained presence, incentive structure shifts; lich architecture never rewards testing whether vigil still needed. " +
      "Not cartoon sabotage: Serevic believes the work necessary; bind is epistemic — cannot objectively run the hypothesis that unmakes them. " +
      "Explains Ending 3 (collapse everything — cannot decouple with one stroke) vs Ending 4 (salt heals strikes foundation). Cross-ref: R152–R155, R165 dialogue.",
  },
  9: {
    label: "Back to the Sanctum",
    hint: "gallery murals behind you; the suppression ahead is worse.",
    enemies: [],
    exit: { toAreaId: "a5_sanctum", toRoomGridId: 7 },
    notes:
      "Exit. Returns to a5_sanctum R161 (grid 7). Pair: Sanctum room 10 → crystal throne grid 2 (R163).",
  },
};

export const A5_CRYSTAL_THRONE: AreaDef = {
  id: "a5_crystal_throne",
  name: "Crystal Throne",
  desc: "The deposit that built the barony — carved, bound, and sat in by someone who stopped counting the cost.",
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
    hint: "coldfire paints a desiccated face; the eyes still expect spreadsheets.",
  },
  hiddenFromTown: true,
};
