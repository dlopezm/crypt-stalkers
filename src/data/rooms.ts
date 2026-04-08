import type { RoomTemplate, AreaDef, TrapInfo } from "../types";
import { PALE_VIGIL_VAULT } from "./areas/pale_vigil_vault";
import { SALT_BARRIER_NORTH } from "./areas/salt_barrier_north";
import { SALT_BARRIER_EAST } from "./areas/salt_barrier_east";
import { SALT_BARRIER_SOUTH } from "./areas/salt_barrier_south";
import { SALT_BARRIER_WEST } from "./areas/salt_barrier_west";
import { BARRACKS } from "./areas/barracks";

/* ── Room Templates ── */

const EASY_COMBAT: RoomTemplate[] = [
  {
    label: "Dusty Passage",
    enemies: ["rat", "rat", "rat"],
    hint: "tiny claws scraping on stone",
  },
  { label: "Shallow Tomb", enemies: ["skeleton"], hint: "chains rattling faintly" },
  {
    label: "Lurker's Den",
    enemies: ["ghoul"],
    hint: "low breathing, something waits",
  },
  {
    label: "Rat Warren",
    enemies: ["rat", "rat", "rat", "rat"],
    hint: "constant scratching, a wave of scurrying",
  },
];

const MED_COMBAT: RoomTemplate[] = [
  {
    label: "Entrance Hall",
    enemies: ["rat", "rat", "skeleton"],
    hint: "chains rattling, small skitters",
  },
  {
    label: "Charnel Pit",
    enemies: ["zombie", "ghoul"],
    hint: "slow dragging sound, low groans",
  },
  {
    label: "Whispering Vault",
    enemies: ["ghost", "ghost"],
    hint: "near-silence, cold air under the door",
  },
  {
    label: "Crypt of Hunger",
    enemies: ["vampire", "skeleton"],
    hint: "nothing \u2014 the dead kind of silence",
  },
  {
    label: "Banshee's Chamber",
    enemies: ["banshee", "rat", "rat"],
    hint: "faint wailing, high-pitched and distant",
  },
];

const HARD_COMBAT: RoomTemplate[] = [
  {
    label: "Shadow Corridor",
    enemies: ["shadow", "ghost"],
    hint: "no light bleeds under the door",
  },
  {
    label: "Necromancer's Study",
    enemies: ["necromancer", "zombie", "skeleton"],
    hint: "low chanting, shuffling of bound feet",
  },
  {
    label: "Banshee's Throne",
    enemies: ["banshee", "ghost", "skeleton"],
    hint: "wailing and cold wind",
  },
  {
    label: "Blood Sanctum",
    enemies: ["vampire", "vampire"],
    hint: "nothing \u2014 the dead kind of silence",
  },
  {
    label: "Ghoul Nest",
    enemies: ["ghoul", "ghoul", "rat", "rat"],
    hint: "low breathing, lots of it",
  },
  {
    label: "Crypt of Hunger",
    enemies: ["vampire", "skeleton"],
    hint: "nothing \u2014 the dead kind of silence",
  },
];

const KITCHEN_SINK_COMBAT: RoomTemplate[] = [
  {
    label: "Dusty Passage",
    enemies: ["rat", "rat", "rat"],
    hint: "tiny claws scraping on stone",
  },
  {
    label: "Shallow Tomb",
    enemies: ["skeleton", "skeleton"],
    hint: "chains rattling faintly",
  },
  {
    label: "Charnel Pit",
    enemies: ["zombie", "ghoul"],
    hint: "slow dragging sound, low groans",
  },
  {
    label: "Whispering Vault",
    enemies: ["ghost", "ghost"],
    hint: "near-silence, cold air under the door",
  },
  {
    label: "Blood Sanctum",
    enemies: ["vampire", "skeleton"],
    hint: "nothing \u2014 the dead kind of silence",
  },
  {
    label: "Banshee's Chamber",
    enemies: ["banshee", "rat", "rat"],
    hint: "faint wailing, high-pitched and distant",
  },
  {
    label: "Shadow Corridor",
    enemies: ["shadow", "ghost"],
    hint: "no light bleeds under the door",
  },
  {
    label: "Necromancer's Study",
    enemies: ["necromancer", "zombie", "skeleton"],
    hint: "low chanting, shuffling of bound feet",
  },
  {
    label: "Ghoul Nest",
    enemies: ["ghoul", "ghoul", "rat"],
    hint: "low breathing, lots of it",
  },
  {
    label: "Collapsed Ossuary",
    enemies: ["heap_of_bones", "skeleton"],
    hint: "a grinding, shifting sound beneath the floor",
  },
  {
    label: "Looter's Cache",
    enemies: ["grave_robber", "grave_robber"],
    hint: "hushed voices and the clink of stolen coins",
  },
  {
    label: "Festering Pit",
    enemies: ["gutborn_larva", "gutborn_larva", "rat"],
    hint: "wet, rhythmic squelching from below",
  },
];

/* ── Dungeon Definitions ── */

export const AREAS: AreaDef[] = [
  PALE_VIGIL_VAULT,
  SALT_BARRIER_NORTH,
  SALT_BARRIER_EAST,
  SALT_BARRIER_SOUTH,
  SALT_BARRIER_WEST,
  BARRACKS,
  {
    id: "shallow_graves",
    name: "Shallow Graves",
    desc: "A small burial site on the outskirts. Rats and old bones.",
    difficulty: 1,
    generator: "stamp",
    combatRooms: EASY_COMBAT,
    bossRoom: {
      label: "The Bone Throne",
      enemies: ["boss_skeleton_lord"],
      hint: "bones creak and shift. something large waits.",
    },
  },
  {
    id: "the_crypt",
    name: "The Crypt",
    desc: "A branching dungeon of 7 rooms. Undead, wraiths, and worse.",
    difficulty: 2,
    generator: "stamp",
    combatRooms: MED_COMBAT,
    bossRoom: {
      label: "The Blood Altar",
      enemies: ["boss_vampire_lord"],
      hint: "the air reeks of iron. crimson light pulses.",
    },
  },
  {
    id: "lich_domain",
    name: "The Lich's Domain",
    desc: "A sprawling tomb complex. Necromancers, shadows, and the Lich King himself.",
    difficulty: 3,
    generator: "stamp",
    combatRooms: HARD_COMBAT,
    bossRoom: {
      label: "The Lich's Throne",
      enemies: ["boss_lich"],
      hint: "the air itself recoils. don't go in unprepared.",
    },
  },
  {
    id: "kitchen_sink",
    name: "The Kitchen Sink",
    desc: "A mid-size dungeon with no theme. Every creature has found its way in.",
    difficulty: 2,
    generator: "stamp",
    combatRooms: KITCHEN_SINK_COMBAT,
    bossRoom: {
      label: "The Convergence",
      enemies: ["boss_vampire_lord", "necromancer"],
      hint: "multiple presences. different kinds of wrong.",
    },
  },
];

/* ── Shared Constants ── */

export const TRAP_INFO: Record<string, TrapInfo> = {
  snare: {
    label: "Snare",
    icon: "\u{1FAA4}",
    desc: "Enemy skips first attack turn.",
    cost: 15,
    color: "#e67e22",
  },
  flash: {
    label: "Flash",
    icon: "\u{1F4A1}",
    desc: "High light burst \u2014 damages all enemies.",
    cost: 20,
    color: "#f0c040",
  },
  noise: {
    label: "Noise Lure",
    icon: "\u{1F514}",
    desc: "Draws enemies to adjacent room (reduces count).",
    cost: 20,
    color: "#2980b9",
  },
};

export const ROOM_W_SM = 76;
export const ROOM_H_SM = 58;
export const ROOM_W_LG = 220;
export const ROOM_H_LG = 155;
export const COR_THICK = 12;
