import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * Area 1 — Excursion Warrens (R19–R23)
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 *
 * Connectivity (per design doc):
 *   exit7(upper galleries) ↔ R19(entrance) ↔ R20(dig face, dead end)
 *                                           ↔ R21(cache) ↔ R22(collapse, dead end)
 *                                           ↔ R23(surface breach, dead end — long tunnel)
 */

// prettier-ignore
export const A1_EXCURSION_WARRENS_GRID: number[][] = [
  //  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  0
  [ 1,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  1  exit7 (upper galleries)
  [ 1,  7,  7,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  2
  [ 1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  3  exit7→R19
  [ 1,  2,  2,  2,  0,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  4  R19→R20
  [ 1,  2,  2,  2,  1,  3,  3,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  5
  [ 1,  2,  2,  2,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  6
  [ 1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  7  R19→R21 corridor
  [ 1,  4,  4,  4,  0,  5,  5,  5,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  8  R21→R22
  [ 1,  4,  4,  4,  1,  5,  5,  5,  1,  1,  1,  1,  1,  1,  1,  1,  1], //  9
  [ 1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 10  R19→R23 long corridor
  [ 1,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 11
  [ 1,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  6,  6,  1], // 12  long tunnel to R23
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  6,  6,  1], // 13
  [ 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1], // 14
];

export const A1_EXCURSION_WARRENS_ROOMS: Record<number, AuthoredRoom> = {
  2: {
    label: "Warren Entrance",
    hint: "fresh timber props a rough mouth. something shuffles inward with salt sacks.",
    enemies: ["zombie", "zombie"],
    isStart: true,
    notes:
      "R19. Era 3 excavation. DARK. " +
      "Rough mouth off R14; new timber, fresh picks. " +
      "ZOMBIES haul salt sacks inward from surface chain — instructions in motion — non-hostile unless struck. " +
      "Supply chain reveal: undead economy visible; another face of cost kept off someone else's ledger. " +
      "Connects to R20 (dig face), R21 (supply cache), long tunnel to R23 (surface breach).",
  },
  3: {
    label: "Dig Face",
    hint: "picks stuck mid-bore. wet earth holds skeletal prints going nowhere.",
    enemies: [],
    notes:
      "R20. Era 3. DARK. Dead end off R19. " +
      "Active end of the cut. Picks stuck in mud; tunnel stops mid-bore. " +
      "SKELETAL FOOTPRINTS in wet earth — crew walked away or still works elsewhere. " +
      "PICKAXES available (tools, poor weapons). " +
      "Implies ongoing expansion elsewhere in the vault.",
  },
  4: {
    label: "Supply Cache",
    hint: "stolen plunder, candle stubs, salt — and a thief with a torch.",
    enemies: ["rat", "rat", "rat", "grave_robber"],
    notes:
      "R21. Era 3 widened chamber. DARK. " +
      "Stolen goods pile: salt, HOUSEHOLD PLUNDER, CHURCH CANDLES. " +
      "GRAVE ROBBER loots by TORCH (true light). Flees toward R22 if spotted. " +
      "20 gold; CANDLES (portable light); VILLAGE SALT-CELLAR RECEIPT (raids for salt). " +
      "Robber SURRENDERS if cornered in R22: " +
      "'There's a sealed wing off the junction — old family stuff. The skeletons don't go in there.' (Points to R24.)",
  },
  5: {
    label: "Collapsed Tunnel",
    hint: "splintered timbers; eyes glitter in the collapse.",
    enemies: ["rat", "rat", "rat", "rat", "rat"],
    notes:
      "R22. Era 3 collapse. DARK. Dead end off R21. " +
      "Side passage caved; shattered timbers; RAT COLONY. " +
      "Collapse may tie to warren blasting. " +
      "CLEARING NESTS reduces/stops breeding IN THIS ROOM. " +
      "Flee target for R21 robber; nest-clearing gameplay hook.",
  },
  6: {
    label: "Surface Breach",
    hint: "wind and distant fields through a hillside rip. tracks lead out.",
    enemies: [],
    notes:
      "R23. Era 3. LIT (daylight). Dead end — long tunnel from R19. " +
      "Hillside rip; daylight and wind; distant fields visible. " +
      "SKELETAL TRACKS lead out — undead use this daily. " +
      "Player can exit to wilderness — NOT toward town; narrative beat: the plague road is real. " +
      "SAFE ROOM (sun). Alternate exit; reinforces stakes of surface raids.",
  },
  7: {
    label: "To Upper Galleries",
    hint: "salt-block gives way to older plaster and coldfire glare.",
    enemies: [],
    exit: { toAreaId: "a1_upper_galleries", toRoomGridId: 4 },
  },
};

export const A1_EXCURSION_WARRENS: AreaDef = {
  id: "a1_excursion_warrens",
  name: "Excursion Warrens",
  desc: "Unauthorized cuts where the lich's supply chain meets open air.",
  difficulty: 1,
  generator: "authored",
  authored: {
    grid: A1_EXCURSION_WARRENS_GRID,
    rooms: A1_EXCURSION_WARRENS_ROOMS,
  },
  combatRooms: [],
  hiddenFromTown: true,
  notes:
    "Fresh Era 3 digs: raw earth, timber, no salt-block finesse. " +
    "Tunnels the order never authorized; lich's route toward surface supply. " +
    "Grave robber in R21 provides intel about Baron's Wing if cornered. " +
    "Surface breach (R23) shows undead surface raids are real — long tunnel conveys isolation.",
};
