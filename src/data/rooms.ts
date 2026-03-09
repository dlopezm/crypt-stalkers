import type { RoomTemplate, DungeonDef, TrapInfo } from "../types";

/* ── Room Templates ── */

const EASY_COMBAT: RoomTemplate[] = [
  {type:"combat", label:"Dusty Passage",     enemies:["rat","rat","rat"],    hint:"tiny claws scraping on stone"},
  {type:"combat", label:"Shallow Tomb",      enemies:["skeleton"],           hint:"chains rattling faintly"},
  {type:"combat", label:"Lurker's Den",      enemies:["ghoul"],              hint:"low breathing, something waits"},
  {type:"combat", label:"Rat Warren",        enemies:["rat","rat","rat","rat"], hint:"constant scratching, a wave of scurrying"},
];

const MED_COMBAT: RoomTemplate[] = [
  {type:"combat", label:"Entrance Hall",     enemies:["rat","rat","skeleton"],     hint:"chains rattling, small skitters"},
  {type:"combat", label:"Charnel Pit",       enemies:["zombie","ghoul"],            hint:"slow dragging sound, low groans"},
  {type:"combat", label:"Whispering Vault",  enemies:["ghost","ghost"],             hint:"near-silence, cold air under the door"},
  {type:"combat", label:"Crypt of Hunger",   enemies:["vampire","skeleton"],        hint:"nothing \u2014 the dead kind of silence"},
  {type:"combat", label:"Banshee's Chamber", enemies:["banshee","rat","rat"],       hint:"faint wailing, high-pitched and distant"},
];

const HARD_COMBAT: RoomTemplate[] = [
  {type:"combat", label:"Shadow Corridor",     enemies:["shadow","ghost"],              hint:"no light bleeds under the door"},
  {type:"combat", label:"Necromancer's Study",  enemies:["necromancer","zombie","skeleton"], hint:"low chanting, shuffling of bound feet"},
  {type:"combat", label:"Banshee's Throne",    enemies:["banshee","ghost","skeleton"],   hint:"wailing and cold wind"},
  {type:"combat", label:"Blood Sanctum",       enemies:["vampire","vampire"],            hint:"nothing \u2014 the dead kind of silence"},
  {type:"combat", label:"Ghoul Nest",          enemies:["ghoul","ghoul","rat","rat"],    hint:"low breathing, lots of it"},
  {type:"combat", label:"Crypt of Hunger",     enemies:["vampire","skeleton"],           hint:"nothing \u2014 the dead kind of silence"},
];

const REST_ROOMS: RoomTemplate[] = [
  {type:"rest", label:"Forgotten Alcove",  enemies:[], hint:"silence \u2014 not the dangerous kind"},
  {type:"rest", label:"Collapsed Chapel",  enemies:[], hint:"dust and faint candlelight"},
  {type:"rest", label:"Old Barracks",      enemies:[], hint:"empty cots, a stale breeze"},
];

/* ── Dungeon Definitions ── */

export const DUNGEONS: DungeonDef[] = [
  {
    id: "shallow_graves",
    name: "Shallow Graves",
    desc: "A small burial site on the outskirts. Rats and old bones.",
    difficulty: 1,
    slots: [
      {slot:"start", type:"start",  col:1, row:3, cx:340, cy:500},
      {slot:"left",  type:"combat", col:0, row:2, cx:140, cy:350},
      {slot:"right", type:"combat", col:2, row:2, cx:540, cy:350},
      {slot:"rest",  type:"rest",   col:1, row:1, cx:340, cy:200},
      {slot:"boss",  type:"boss",   col:1, row:0, cx:340, cy:60},
    ],
    connections: [
      ["start","left"], ["start","right"],
      ["left","rest"], ["right","rest"],
      ["rest","boss"],
    ],
    combatRooms: EASY_COMBAT,
    restRooms: REST_ROOMS,
    bossRoom: {type:"boss", label:"The Bone Throne", enemies:["boss_skeleton_lord"], hint:"bones creak and shift. something large waits."},
    mapW: 680,
    mapH: 560,
  },
  {
    id: "the_crypt",
    name: "The Crypt",
    desc: "A branching dungeon of 7 rooms. Undead, wraiths, and worse.",
    difficulty: 2,
    slots: [
      {slot:"start",   type:"start",  col:1, row:3, cx:340, cy:560},
      {slot:"left",    type:"combat", col:0, row:2, cx:120, cy:400},
      {slot:"right",   type:"combat", col:2, row:2, cx:560, cy:400},
      {slot:"mid",     type:"combat", col:1, row:1, cx:340, cy:255},
      {slot:"branch1", type:"rest",   col:0, row:1, cx:120, cy:160},
      {slot:"branch2", type:"rest",   col:2, row:1, cx:560, cy:160},
      {slot:"boss",    type:"boss",   col:1, row:0, cx:340, cy:60},
    ],
    connections: [
      ["start","left"], ["start","right"],
      ["left","mid"], ["right","mid"],
      ["left","branch1"],
      ["mid","branch1"], ["mid","branch2"],
      ["right","branch2"],
      ["branch1","boss"], ["branch2","boss"],
    ],
    combatRooms: MED_COMBAT,
    restRooms: REST_ROOMS,
    bossRoom: {type:"boss", label:"The Blood Altar", enemies:["boss_vampire_lord"], hint:"the air reeks of iron. crimson light pulses."},
    mapW: 680,
    mapH: 630,
  },
  {
    id: "lich_domain",
    name: "The Lich's Domain",
    desc: "A sprawling tomb complex. Necromancers, shadows, and the Lich King himself.",
    difficulty: 3,
    slots: [
      {slot:"start",  type:"start",  col:1, row:4, cx:340, cy:600},
      {slot:"left",   type:"combat", col:0, row:3, cx:140, cy:470},
      {slot:"right",  type:"combat", col:2, row:3, cx:540, cy:470},
      {slot:"rest1",  type:"rest",   col:0, row:2, cx:140, cy:330},
      {slot:"rest2",  type:"rest",   col:2, row:2, cx:540, cy:330},
      {slot:"mid",    type:"combat", col:1, row:2, cx:340, cy:330},
      {slot:"upl",    type:"combat", col:0, row:1, cx:140, cy:190},
      {slot:"upr",    type:"combat", col:2, row:1, cx:540, cy:190},
      {slot:"boss",   type:"boss",   col:1, row:0, cx:340, cy:55},
    ],
    connections: [
      ["start","left"], ["start","right"],
      ["left","rest1"], ["left","mid"],
      ["right","rest2"], ["right","mid"],
      ["rest1","upl"], ["rest1","mid"],
      ["rest2","upr"], ["rest2","mid"],
      ["mid","upl"], ["mid","upr"],
      ["upl","boss"], ["upr","boss"],
    ],
    combatRooms: HARD_COMBAT,
    restRooms: REST_ROOMS,
    bossRoom: {type:"boss", label:"The Lich's Throne", enemies:["boss_lich"], hint:"the air itself recoils. don't go in unprepared."},
    mapW: 680,
    mapH: 660,
  },
];

/* ── Shared Constants ── */

export const TRAP_INFO: Record<string, TrapInfo> = {
  snare: {label:"Snare",    icon:"\u{1FAA4}", desc:"Enemy skips first attack turn.", cost:15, color:"#e67e22"},
  flash: {label:"Flash",    icon:"\u{1F4A1}", desc:"High light burst \u2014 damages all enemies.", cost:20, color:"#f0c040"},
  noise: {label:"Noise Lure",icon:"\u{1F514}",desc:"Draws enemies to adjacent room (reduces count).", cost:20, color:"#2980b9"},
};

export const TYPE_COLOR: Record<string, string> = {combat:"#c0392b",rest:"#2ecc71",boss:"#e74c3c",start:"#7f8c8d"};
export const TYPE_ICON: Record<string, string> = {combat:"\u2694",rest:"\u{1F56F}",boss:"\u2620",start:"\u{1F6AA}"};

export const ROOM_W_SM = 76;
export const ROOM_H_SM = 58;
export const ROOM_W_LG = 220;
export const ROOM_H_LG = 155;
export const COR_THICK = 12;
