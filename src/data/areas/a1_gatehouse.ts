import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 1 — The Gatehouse (R7–R11)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * Connectivity (per design doc):
 *   exit7(mine mouth) ↔ R7(court) ↔ R8(guard, dead end)
 *                                  ↔ R9(receiving) ↔ R10(record, dead end)
 *                                                   ↔ R11(balcony, dead end)
 */

// prettier-ignore
export const A1_GATEHOUSE_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  6,  6,  6,  6,  6,  1,  1,  1], //  1  R11 Balcony (5x2)
  [ 1,  1,  1,  1,  1,  1,  1,  6,  6,  6,  6,  6,  1,  1,  1], //  2
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1], //  3  R9→R11 corridor
  [ 1,  1,  3,  3,  3,  1,  4,  4,  4,  4,  4,  0,  5,  5,  1], //  4  R8, R9, R9→R10
  [ 1,  1,  3,  3,  3,  1,  4,  4,  4,  4,  4,  1,  5,  5,  1], //  5
  [ 1,  1,  1,  0,  1,  1,  4,  4,  4,  4,  4,  1,  5,  5,  1], //  6  R7→R8 corridor
  [ 1,  2,  2,  2,  2,  2,  2,  0,  1,  1,  1,  1,  1,  1,  1], //  7  R7 Outer Court + R7→R9
  [ 1,  2,  2,  2,  2,  2,  2,  1,  1,  1,  1,  1,  1,  1,  1], //  8
  [ 1,  2,  2,  2,  2,  2,  2,  1,  1,  1,  1,  1,  1,  1,  1], //  9
  [ 1,  2,  2,  2,  2,  2,  2,  1,  1,  1,  1,  1,  1,  1,  1], // 10
  [ 1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 11  R7→exit7 corridor
  [ 1,  1,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 12  exit7
  [ 1,  1,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 13
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 14
];

export const A1_GATEHOUSE_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Outer Court",
    hint: "open sky over broken walls. carved flames and open mouths watch the threshold.",
    enemies: [],
    isStart: true,
    notes:
      "R7. Era 2 + ruin. LIT (open sky). " +
      "Courtyard before inner gatehouse; outer wall crumbles. Gate pillars: FLAME and OPEN MOUTHS carvings (singing / vigil). " +
      "DEAD GRAVE ROBBER near threshold — broken by skeleton patrol, pack spilled. " +
      "Loot: torch ×2, 15 gold, CRUDE MAP OF AREA 1 (annotated danger/loot). " +
      "Early gear; foreshadows Grave Robber behavior and patrol danger.",
  },
  3: {
    label: "Guard Room",
    hint: "empty racks, rusted nails. a duty roster still pinned to the wall.",
    enemies: ["rat", "rat"],
    notes:
      "R8. Era 2 + neglect. DIM. Dead end off R7. " +
      "Gate guards once stood here. Empty weapon rack (long looted). " +
      "DUTY ROSTER pinned with rusted nails — shifts from ~200 years ago; readable patterns echo skeleton patrol logic. " +
      "RUSTED SHORTSWORD (weak slashing — NOT blunt). " +
      "Wrong weapon type teaches damage-type lesson if player experiments on skeletons.",
  },
  4: {
    label: "Receiving Hall",
    hint: "frescoes fade: hands raised, flames above palms. two shapes lug salt on a fixed path.",
    enemies: ["zombie", "zombie"],
    notes:
      "R9. Era 2. DIM. Once-grand reception space. " +
      "FRESCOES: figures over a mine mouth, raised hands, flames above palms — founding myth of the order. " +
      "Inscription: 'We who keep the vigil stand between the salt and the shadow.' " +
      "SINGING MOTIF in frescoes — later resonance hint for R17 Inner Gate. " +
      "Two ZOMBIES lug salt blocks on fixed path R9→R7→surface and return — workers reduced to instructions, minding task unless attacked. " +
      "Shows command structure; player can observe route without fight.",
  },
  5: {
    label: "Record Room",
    hint: "most folios are pulp. one receipt survived.",
    enemies: [],
    notes:
      "R10. Era 2. DARK — true light or risk. Dead end off R9. " +
      "Small archive. Most folios pulp; one sheet survives: RECEIPT — " +
      "the order bought 'the Ashvere mining concession' for 'twelve silver marks and the promise of spiritual stewardship.' " +
      "Nearby letters sneer at 'the Ashvere claim.' " +
      "6 gold. " +
      "Emotional beat: the heir was sold cheap.",
  },
  6: {
    label: "Gatehouse Balcony",
    hint: "a thin walk above. the court and mine mouth spread below like a model.",
    enemies: [],
    notes:
      "R11. Era 2. LIT (open air). Dead end via stairs from R9. " +
      "Elevated walk; player looks down into R1 and R7 without being seen if careful. " +
      "SKELETON PATROL visible below on its loop — timing and composition readable from safety. " +
      "OBSERVATION TUTORIAL: learn patrol path before engaging. " +
      "MISSING: bat ×3 (darkvision; blocked by doors; teach door-blocking / vertical nuisance).",
  },
  7: {
    label: "To Mine Mouth",
    hint: "stairs descend toward cart tracks and family stone.",
    enemies: [],
    exit: { toAreaId: "a1_mine_mouth", toRoomGridId: 2 },
  },
};

export const A1_GATEHOUSE: AreaDef = {
  id: "a1_gatehouse",
  name: "The Gatehouse",
  desc: "The order's ruined threshold over the mine. Their vigil outlasted their mercy.",
  difficulty: 1,
  generator: "authored",
  authored: {
    grid: A1_GATEHOUSE_GRID,
    rooms: A1_GATEHOUSE_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
  notes:
    "Fortified order entrance over the mine mouth. Era 2 architecture; Era 3 neglect and surface-facing undead activity. " +
    "Frescoes (R9) seed singing motif for R17 resonance lock. " +
    "Dead grave robber (R7) teaches loot/danger dynamic. " +
    "Balcony (R11) is observation tutorial for patrol mechanics.",
};
