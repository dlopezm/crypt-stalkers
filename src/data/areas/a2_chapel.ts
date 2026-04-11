import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 2 — Chapel Cavern (R37–R42)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * R37↔R38; R38↔R39,R40,R41,R42; R41↔exit9. Wall band isolates R40 (north) from exit/R37 tunnel.
 */

// prettier-ignore
export const A2_CHAPEL_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1
  [ 1,  1,  1,  1,  1,  5,  5,  1,  1,  4,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2  R40 | R39
  [ 1,  1,  1,  1,  1,  5,  5,  1,  1,  4,  4,  4,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3
  [ 1,  1,  1,  1,  1,  5,  5,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  4  R40 wall + R39↔nave
  [ 1,  1,  1,  1,  1,  5,  5,  0,  3,  3,  3,  3,  3,  3,  3,  0,  7,  7,  1,  1,  1,  1], //  5  R40↔nave|nave|R42
  [ 1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  3,  3,  3,  3,  1,  7,  7,  1,  1,  1,  1], //  6
  [ 1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  3,  3,  3,  3,  1,  7,  7,  1,  1,  1,  1], //  7
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  8  wall band (isolates north from south doors)
  [ 1,  1,  8,  8,  0,  0,  2,  2,  0,  3,  3,  3,  3,  3,  3,  1,  7,  7,  1,  1,  1,  1], //  9  exit8|R37|nave|R42
  [ 1,  1,  8,  8,  1,  1,  2,  2,  1,  3,  3,  3,  3,  3,  3,  1,  7,  7,  1,  1,  1,  1], // 10
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  0,  3,  3,  1,  1,  1,  1,  1,  1,  1], // 11  nave↔R41
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  0,  6,  6,  6,  6,  1,  1,  1,  1,  1], // 12
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  0,  6,  6,  6,  6,  1,  1,  1,  1,  1], // 13
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  6,  6,  6,  6,  1,  1,  1,  1,  1], // 14
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 15
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  9,  9,  1,  1,  1,  1,  1,  1,  1,  1], // 16
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  9,  9,  1,  1,  1,  1,  1,  1,  1,  1], // 17
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 18
];

export const A2_CHAPEL_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Chapel Entrance",
    hint: "flame-and-voice carvings on the arch; every footstep answers from the stone.",
    enemies: ["zombie", "zombie"],
    isStart: true,
    notes:
      "R37. COLDFIRE. Era 2+3. Room design ref R37. " +
      "Ornate arch: flame-and-voice motif. Zombies flank like ushers. Beyond, cavern opens — every footstep and clash gains resonance. " +
      "Special: chapel acoustic rules — combat noise spreads to adjacent chapel rooms; Banshee screams amplified; can alert Ghosts in Library block (R43–R50). " +
      "Connects: R30 cloister (exit grid 8), R38 nave.",
  },
  3: {
    label: "Nave",
    hint: "salt-crystal walls climb into darkness; pews carved from the living floor like teeth.",
    enemies: ["zombie", "zombie", "zombie"],
    notes:
      "R38. COLDFIRE. Era 2+3. Room design ref R38. " +
      "Vast nave: salt-crystal walls vanishing upward, pews carved from floor. Cultists chant; zombies sit — drone almost beautiful (cultists ×2 not in enemy list). " +
      "Stalactites as singing saints, mouths open forever. " +
      "Contains: offering bowls 18 gold total; damaged hymnals — one legible notation (hymn fragment clue). " +
      "Connects: R37, R39 choir loft, R40 cantor's stand, R41 great brazier, R42 side chapel.",
  },
  4: {
    label: "Choir Loft",
    hint: "elevated stands and a robed figure with its mouth frozen open — the air tastes of wrong notes.",
    enemies: ["banshee"],
    notes:
      "R39. DARK. Era 2. Room design ref R39. " +
      "Elevated platform; salt stairs from R38. Robed figure, mouth frozen open. Wail corrupts hymn if player saw R38 hymnal. Music stands; sheet music. " +
      "Contains: complete hymn sheet (brazier ritual); 15 gold (conductor's box). " +
      "Special: wail echoes R37–R42; triggers Library Ghosts; ranged silence or accept cascade. " +
      "Connects: R38 only.",
  },
  5: {
    label: "Cantor's Stand",
    hint: "a small raised platform; inscription describes striking the brazier at the hymn's crescendo.",
    enemies: [],
    notes:
      "R40. COLDFIRE. Era 2. Room design ref R40. " +
      "Small raised platform for lead singer. Inscription (exact): 'At the crescendo of the Vigil Hymn, the keeper strikes the brazier's heart and sings the note of waking' — plus notation. Rosetta for singing + fire + faith. " +
      "Contains: hymn fragment (core relighting key — combine R39, R53, Rennic R49). " +
      "Connects: R38 only.",
  },
  6: {
    label: "Great Brazier Platform",
    hint: "a cart-scale salt basin cold as a tomb; coldfire orbits empty air above the hearth.",
    enemies: [],
    notes:
      "R41. DARK (brazier out). Era 2+3. Room design ref R41. " +
      "Central dais. Great Brazier: cart-scale salt-crystal basin, flame-and-voice relief. Witch ×1 not in enemy list — environmental boss when witch exists. Coldfire orbits her, not the bowl. " +
      "Great Brazier milestone: defeat Witch; relight (hymn + R40/R53 + performed melody) → Chapel Cavern true light: Skullflower suppressed; Ghouls/Larvae flee; Shadows blocked; Area 1 skeleton patrols add chapel route. " +
      "Connects: R38, exit grid 9 (R61 upper passage / chapter house). Cross-ref R61, Mira trade R61→R41 shortcut.",
  },
  7: {
    label: "Side Chapel",
    hint: "a quiet alcove; a kneeling shape does not turn when you enter.",
    enemies: ["ghost"],
    notes:
      "R42. DARK. Era 2. Room design ref R42. " +
      "Quiet alcove; altar to patron saint of miners. Ghost (ex-priest) kneels, murmuring unheard. Salt offerings; painting — mine mouth in gold light. " +
      "Contains: salt (crafting); 8 gold (offering box); painting (lore). Quiet approach avoids fight; Banshee (R39) can wake Ghost. " +
      "Connects: R38 only.",
  },
  8: {
    label: "Back to the Cloister",
    hint: "the galleries' coldfire waits beyond the arch.",
    enemies: [],
    exit: { toAreaId: "a2_cloister", toRoomGridId: 2 },
  },
  9: {
    label: "Upper Passage (Chapter House)",
    hint: "a narrow cut overhead; administration's private approach to the brazier dais.",
    enemies: [],
    exit: { toAreaId: "a2_chapter_house", toRoomGridId: 7 },
  },
};

export const A2_CHAPEL: AreaDef = {
  id: "a2_chapel",
  name: "Chapel Cavern",
  desc: "A natural cavern where the order sang; sound and flame still judge the living.",
  difficulty: 2,
  generator: "authored",
  authored: {
    grid: A2_CHAPEL_GRID,
    rooms: A2_CHAPEL_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
};
