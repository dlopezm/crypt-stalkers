import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 2 — The Sanctified Galleries — The Cloister (R30–R36)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * Connectivity (design doc):
 *   exit9 ↔ R30 ↔ R31 ↔ R32 ↔ R33 ↔ R34(secret)
 *   R31 ↔ R35 ↔ R36(dead end)
 *   R31 ↔ exits chapel, library, chapter, maintenance(common), R35 ↔ exit kitchen
 *
 * R30 only meets R31 (one corridor component). R31 branches use separate 0-components.
 */

// prettier-ignore
export const A2_CLOISTER_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  1,  1,  1,  1,  1,  1,  1,  9,  9,  1, 11, 11,  1, 12, 12,  1, 13, 13,  1, 10, 10,  1,  1,  1,  1], //  1
  [ 1,  1,  1,  1,  1,  1,  1,  1,  9,  9,  1, 11, 11,  1, 12, 12,  1, 13, 13,  1, 10, 10,  1,  1,  1,  1], //  2
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  1,  1], //  3
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  1,  1], //  4
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  1,  1], //  5
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  1,  1], //  6
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  1,  1], //  7
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  1,  1], //  8
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  1,  1], //  9
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  0,  1,  1,  1,  1], // 10
  [ 1,  1,  1,  2,  2,  2,  0,  0,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  0,  4,  4,  4], // 11  R30|0|R31|0|R32
  [ 1,  1,  1,  2,  2,  2,  1,  1,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  1,  4,  4,  4], // 12
  [ 1,  1,  1,  2,  2,  2,  1,  1,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  1,  4,  4,  4], // 13
  [ 1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  3,  0,  3,  3,  3,  3,  3,  3,  3,  3,  3,  1,  4,  4,  4], // 14  R31↔R35
  [ 1,  1,  1,  1,  1,  1,  1,  1,  3,  3,  3,  3,  0,  6,  6,  6,  6,  6,  6,  1,  1,  1,  1,  4,  4,  4], // 15
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  6,  6,  6,  6,  6,  6,  0, 14, 14,  1,  4,  4,  4], // 16  R35↔exit14
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  1,  1,  1,  1, 14, 14,  1,  0,  0,  0], // 17  R35↔R36 + R32↔R33 (separate components)
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1,  5,  5,  5], // 18  R35↔R36
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  8,  8,  8,  1,  1,  1,  1,  1,  1,  1,  5,  5,  5], // 19
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  8,  8,  8,  1,  1,  1,  1,  1,  1,  1,  5,  5,  5], // 20
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  0], // 21  R33↔R34
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7], // 22
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  7,  7,  7], // 23
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 24
];

export const A2_CLOISTER_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Entrance Hall",
    hint: "arched Era 2 vault; coldfire strips along the crown. cracked stone and a worn inscription.",
    enemies: ["zombie", "zombie"],
    isStart: true,
    notes:
      "R30. COLDFIRE. Era 2+3. Room design ref R30. " +
      "First room past Inner Gate (Area 1 R17). Arched Era 2 ceiling; coldfire strips along crown. " +
      "Two zombies sweep polished salt-block floor in slow circles — echo of obedience. Cracked stone. " +
      "Inscription (exact): 'Enter in silence, leave in service.' " +
      "Contains: order welcome plaque (lore). " +
      "Connects: Area 1 Inner Gate / R17 (via exit grid 9), R31 only — not a hub to chapel/library/chapter (those branch from R31). " +
      "Cross-ref: R37 chapel entrance, R43 library entrance via R31. " +
      "Teaching: coldfire halls; degraded monastic routine vs cultist-maintained fiction.",
  },
  3: {
    label: "Common Room",
    hint: "stone benches; three zombies sit with empty bowls as if waiting for a meal that never comes.",
    enemies: ["zombie", "zombie", "zombie"],
    notes:
      "R31. COLDFIRE. Era 2+3. Room design ref R31. " +
      "Large communal hall, stone benches. Three zombies sit with empty bowls; a cultist spoons nothing into them — kindness toward things that cannot hunger. " +
      "Enemy note: cultist ×1 not in engine enemy list — add when cultist type exists. " +
      "Contains: 12 gold (wall niche); cultist's journal (joining, relief, horror). " +
      "Connects: R30, R32 novice dorm, R35 refectory, R62 service corridor (maintenance exit), transit to chapel / library / chapter / upper galleries. " +
      "Area theme (Area 2): cost of greed — greed of authority; threat inflated, ignorance enforced, revenue over wards.",
  },
  4: {
    label: "Novice Dormitory",
    hint: "long rows of stone bed-frames; rats nest in rotted bedding and salt-eaten cubbies.",
    enemies: ["rat", "rat", "rat"],
    notes:
      "R32. DARK. Era 2. Room design ref R32. " +
      "Long barracks: stone bed-frames, rotted bedding gone. Wall cubbies — corroded trinkets, austerity in salt air. Rats in debris. " +
      "Contains: novice's hidden journal (daily life, singing, hierarchy); prayer beads (minor loot). " +
      "Connects: R31, R33 knight's quarters.",
  },
  5: {
    label: "Knight's Quarters",
    hint: "better chambers than the novices enjoyed; a makeshift shrine stains one wall with wax and ash.",
    enemies: ["zombie", "zombie"],
    notes:
      "R33. COLDFIRE. Era 2+3. Room design ref R33. " +
      "Better rooms, working doors. Cultist billet: surface clothes, dried food, child's drawing. Makeshift lich shrine — belief made visible. " +
      "Enemy note: cultists ×2 not in engine list — zombies as stand-in until cultist type. " +
      "Contains: 25 gold; dried food (minor heal); lich shrine (lore). " +
      "Connects: R32, R34 hidden cell (secret panel).",
  },
  6: {
    label: "Refectory",
    hint: "long salt tables; zombies circuit trays in a loop. a matins bell ticks where only the living would hear.",
    enemies: ["zombie", "zombie", "zombie", "zombie"],
    notes:
      "R35. COLDFIRE. Era 2+3. Room design ref R35. " +
      "Dining hall: long salt tables. Zombies circuit trays R64→tables→R64 forever. Matins bell on timer — only the living hear it. Salt-crystal cups at each place, century-empty. " +
      "Contains: salt-crystal cups (minor loot); matins bell (deliberate ring = extreme noise lure / risk). " +
      "Connects: R31, R36 cloister garden (dead end), R64 kitchen (exit grid 14). Cross-ref R64.",
  },
  7: {
    label: "Hidden Cell",
    hint: "a narrow cell behind a loose panel; breathing you cannot quite place.",
    enemies: [],
    notes:
      "R34. DARK. Era 2. Room design ref R34. Secret from R33 only. " +
      "Voss encounter 1: Not greedy in the order's sense — three eras of extraction emptied his world. Town declined after lich sealed mine; no prospects. Cult offered food; price is serving a monster. 'Greed' is survival — wanting to eat — still binds him to the taker below. " +
      "Fast talk: patrol timing, necromancer corridors, forbidden zones (Restricted Archive, chapel inner sanctum). Confirms coldfire is fake — quote: 'Tomasz didn't make it.' Directions to library. Aggression → Voss flees; harder to find later.",
  },
  8: {
    label: "Cloister Garden",
    hint: "dead herbs and a shaft of weak daylight; hush unlike the coldfire halls.",
    enemies: [],
    notes:
      "R36. DIM (ventilation shaft). Era 1+2. Room design ref R36. Dead end off R35 only. " +
      "Former herb garden; weak daylight through shaft. Plants dead to husks; higher ceiling, hush unlike coldfire. Era 1 pillar carved to Era 2 devotional column. " +
      "Contains: dried medicinal herbs (alchemy); restful tone. Natural dim — safe pause.",
  },
  9: {
    label: "Return to Upper Galleries",
    hint: "salt-block masonry gives way to the inner gate route.",
    enemies: [],
    exit: { toAreaId: "a1_upper_galleries", toRoomGridId: 7 },
  },
  10: {
    label: "Toward Chapel Cavern",
    hint: "flame-and-voice carvings bite the arch; the cavern beyond hums with echo.",
    enemies: [],
    exit: { toAreaId: "a2_chapel", toRoomGridId: 2 },
  },
  11: {
    label: "Toward the Library",
    hint: "an arch reads seek and be illuminated; empty racks line the way ahead.",
    enemies: [],
    exit: { toAreaId: "a2_library", toRoomGridId: 2 },
  },
  12: {
    label: "Toward the Chapter House",
    hint: "administrative corridors; wax seals and routed orders still cling to the air.",
    enemies: [],
    exit: { toAreaId: "a2_chapter_house", toRoomGridId: 2 },
  },
  13: {
    label: "Toward Maintenance Halls",
    hint: "pipes run along the ceiling; the air smells of old oil and wet stone.",
    enemies: [],
    exit: { toAreaId: "a2_maintenance", toRoomGridId: 2 },
  },
  14: {
    label: "Toward the Kitchens",
    hint: "warm coldfire and the ghost of cooking smoke; ovens somewhere ahead.",
    enemies: [],
    exit: { toAreaId: "a2_maintenance", toRoomGridId: 5 },
  },
};

export const A2_CLOISTER: AreaDef = {
  id: "a2_cloister",
  name: "The Cloister",
  desc: "Dormitories and common halls where the order lived — zombies still repeat broken routines.",
  difficulty: 2,
  generator: "authored",
  authored: {
    grid: A2_CLOISTER_GRID,
    rooms: A2_CLOISTER_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
};
