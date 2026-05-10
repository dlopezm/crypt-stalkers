import type { RoomTemplate, AreaDef } from "../types";
import { PALE_VIGIL_VAULT } from "./areas/pale_vigil_vault";
import { SALT_BARRIER_NORTH } from "./areas/salt_barrier_north";
import { SALT_BARRIER_EAST } from "./areas/salt_barrier_east";
import { SALT_BARRIER_SOUTH } from "./areas/salt_barrier_south";
import { SALT_BARRIER_WEST } from "./areas/salt_barrier_west";
import { BARRACKS } from "./areas/barracks";

import { A1_MINE_MOUTH } from "./areas/a1_mine_mouth";
import { A1_GATEHOUSE } from "./areas/a1_gatehouse";
import { A1_UPPER_GALLERIES } from "./areas/a1_upper_galleries";
import { A1_TESTING_GROUNDS } from "./areas/a1_testing_grounds";
import { A1_EXCURSION_WARRENS } from "./areas/a1_excursion_warrens";
import { A1_BARONS_WING } from "./areas/a1_barons_wing";

import { A2_CLOISTER } from "./areas/a2_cloister";
import { A2_CHAPEL } from "./areas/a2_chapel";
import { A2_LIBRARY } from "./areas/a2_library";
import { A2_RESTRICTED } from "./areas/a2_restricted";
import { A2_CHAPTER_HOUSE } from "./areas/a2_chapter_house";
import { A2_MAINTENANCE } from "./areas/a2_maintenance";
import { A2_ARMORY } from "./areas/a2_armory";

import { A3_THRESHOLD } from "./areas/a3_threshold";
import { A3_SORTING } from "./areas/a3_sorting";
import { A3_REANIMATION } from "./areas/a3_reanimation";
import { A3_BONE_STACKS } from "./areas/a3_bone_stacks";
import { A3_DEEP_CRYPT } from "./areas/a3_deep_crypt";
import { A3_VAMPIRE_PRISON } from "./areas/a3_vampire_prison";

import { A4_DRAINED_TUNNELS } from "./areas/a4_drained_tunnels";
import { A4_CRYSTAL_GALLERIES } from "./areas/a4_crystal_galleries";
import { A4_ABANDONED_DIG } from "./areas/a4_abandoned_dig";
import { A4_ANCESTORS_TRAIL } from "./areas/a4_ancestors_trail";
import { A4_SHADOW_DEPTHS } from "./areas/a4_shadow_depths";
import { A4_SEALED_CHAMBER } from "./areas/a4_sealed_chamber";

import { A5_OUTER_WARD } from "./areas/a5_outer_ward";
import { A5_COLONNADE } from "./areas/a5_colonnade";
import { A5_SANCTUM } from "./areas/a5_sanctum";
import { A5_CRYSTAL_THRONE } from "./areas/a5_crystal_throne";
import { A5_MORTAL_QUARTERS } from "./areas/a5_mortal_quarters";

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

  A1_MINE_MOUTH,
  A1_GATEHOUSE,
  A1_UPPER_GALLERIES,
  A1_TESTING_GROUNDS,
  A1_EXCURSION_WARRENS,
  A1_BARONS_WING,

  A2_CLOISTER,
  A2_CHAPEL,
  A2_LIBRARY,
  A2_RESTRICTED,
  A2_CHAPTER_HOUSE,
  A2_MAINTENANCE,
  A2_ARMORY,

  A3_THRESHOLD,
  A3_SORTING,
  A3_REANIMATION,
  A3_BONE_STACKS,
  A3_DEEP_CRYPT,
  A3_VAMPIRE_PRISON,

  A4_DRAINED_TUNNELS,
  A4_CRYSTAL_GALLERIES,
  A4_ABANDONED_DIG,
  A4_ANCESTORS_TRAIL,
  A4_SHADOW_DEPTHS,
  A4_SEALED_CHAMBER,

  A5_OUTER_WARD,
  A5_COLONNADE,
  A5_SANCTUM,
  A5_CRYSTAL_THRONE,
  A5_MORTAL_QUARTERS,

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

export const ROOM_W_SM = 76;
export const ROOM_H_SM = 58;
export const ROOM_W_LG = 220;
export const ROOM_H_LG = 155;
export const COR_THICK = 12;
