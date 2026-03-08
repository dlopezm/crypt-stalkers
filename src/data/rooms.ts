import type { RoomTemplate, SlotName, TrapInfo, ShopItem } from "../types";

export const ROOM_TEMPLATES: RoomTemplate[] = [
  {type:"combat", label:"Entrance Hall",        enemies:["rat","rat","rat","skeleton"],          hint:"chains rattling, many small skitters"},
  {type:"combat", label:"Charnel Pit",           enemies:["zombie","ghoul"],                     hint:"slow dragging sound, low groans"},
  {type:"combat", label:"Whispering Vault",      enemies:["ghost","ghost"],                      hint:"near-silence, cold air under the door"},
  {type:"combat", label:"Crypt of Hunger",       enemies:["vampire","skeleton"],                 hint:"nothing \u2014 the dead kind of silence"},
  {type:"combat", label:"Rat Warren",            enemies:["rat","rat","rat","rat","rat"],         hint:"constant scratching, a wave of scurrying"},
  {type:"combat", label:"Shadow Corridor",       enemies:["shadow","ghost"],                     hint:"no light bleeds under the door"},
  {type:"combat", label:"Necromancer's Study",   enemies:["necromancer","zombie","skeleton"],    hint:"low chanting, shuffling of bound feet"},
  {type:"combat", label:"Banshee's Chamber",     enemies:["banshee","rat","rat"],                hint:"faint wailing, high-pitched and distant"},
  {type:"rest",   label:"Forgotten Alcove",      enemies:[],                                     hint:"silence \u2014 not the dangerous kind"},
  {type:"rest",   label:"Collapsed Chapel",      enemies:[],                                     hint:"dust and faint candlelight"},
  {type:"shop",   label:"Wandering Merchant",    enemies:[],                                     hint:"muttering, clink of coins"},
  {type:"boss",   label:"The Lich's Throne",     enemies:["boss_lich"],                          hint:"the air itself recoils. don't go in unprepared."},
];

export const LAYOUT: { slot: SlotName; col: number; row: number }[] = [
  {slot:"start",   col:1, row:3},
  {slot:"left",    col:0, row:2},
  {slot:"right",   col:2, row:2},
  {slot:"mid",     col:1, row:1},
  {slot:"branch1", col:0, row:1},
  {slot:"branch2", col:2, row:1},
  {slot:"boss",    col:1, row:0},
];

export const TRAP_INFO: Record<string, TrapInfo> = {
  snare: {label:"Snare",    icon:"\u{1FAA4}", desc:"Enemy skips first attack turn.", cost:15, color:"#e67e22"},
  flash: {label:"Flash",    icon:"\u{1F4A1}", desc:"High light burst \u2014 routs Bats, damages Shadows.", cost:20, color:"#f0c040"},
  noise: {label:"Noise Lure",icon:"\u{1F514}",desc:"Draws enemies to adjacent room (reduces this room's count).", cost:20, color:"#2980b9"},
};

export const SHOP_ITEMS: ShopItem[] = [
  {id:"heal_sm",  label:"Vial of Blood",   icon:"\u{1F9EA}", desc:"Restore 15 HP.",     cost:20, effect:"heal",   value:15},
  {id:"heal_lg",  label:"Dark Elixir",     icon:"\u2697\uFE0F",  desc:"Restore 30 HP.",     cost:35, effect:"heal",   value:30},
  {id:"energy",   label:"Soul Crystal",    icon:"\u{1F48E}", desc:"Perm. +1 max energy.",cost:40, effect:"energy", value:1},
  {id:"remove",   label:"Curse Removal",   icon:"\u{1F56F}\uFE0F",  desc:"Remove 1 card from deck.",cost:25,effect:"remove",value:0},
];

export const TYPE_COLOR: Record<string, string> = {combat:"#c0392b",rest:"#2ecc71",shop:"#f0c040",boss:"#e74c3c",start:"#7f8c8d"};
export const TYPE_ICON: Record<string, string> = {combat:"\u2694",rest:"\u{1F56F}",shop:"\u{1F4B0}",boss:"\u2620",start:"\u{1F6AA}"};

export const SLOT_POS: Record<SlotName, { cx: number; cy: number }> = {
  start:   {cx:340, cy:560},
  left:    {cx:120, cy:400},
  right:   {cx:560, cy:400},
  mid:     {cx:340, cy:255},
  branch1: {cx:120, cy:160},
  branch2: {cx:560, cy:160},
  boss:    {cx:340, cy:60},
};

export const MAP_W = 680;
export const MAP_H = 630;
export const ROOM_W_SM = 76;
export const ROOM_H_SM = 58;
export const ROOM_W_LG = 220;
export const ROOM_H_LG = 155;
export const COR_THICK = 12;
