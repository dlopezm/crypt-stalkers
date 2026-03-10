import type { RoomTemplate, DungeonDef, TrapInfo } from "../types";

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

/* ── Dungeon Definitions ── */

export const DUNGEONS: DungeonDef[] = [
  {
    id: "shallow_graves",
    name: "Shallow Graves",
    desc: "A small burial site on the outskirts. Rats and old bones.",
    difficulty: 1,
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
    combatRooms: HARD_COMBAT,
    bossRoom: {
      label: "The Lich's Throne",
      enemies: ["boss_lich"],
      hint: "the air itself recoils. don't go in unprepared.",
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
