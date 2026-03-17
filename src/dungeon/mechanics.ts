import {
  AI_REPRODUCE_CHANCE,
  AI_NOISE_ATTRACT_CHANCE,
  AI_LIGHT_FLEE_CHANCE,
  AI_ROAM_CHANCE,
  AI_SCOUT_SEND_CHANCE,
} from "../data/constants";
import type { DungeonAction, OutOfCombatMechanics } from "../types";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ── Rat ── */

const RAT_REPRODUCE_TEXTS = [
  "Frantic squeaking echoes from the dark",
  "A chorus of high-pitched chittering",
  "The sound of many small things multiplying",
];

export const ratDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    const actions: DungeonAction[] = [];

    if (Math.random() < AI_REPRODUCE_CHANCE) {
      actions.push({ type: "reproduce" });
      actions.push({ type: "log", text: pick(RAT_REPRODUCE_TEXTS), volume: "quiet" });
    }

    if (ctx.noise !== "quiet" && Math.random() < AI_NOISE_ATTRACT_CHANCE) {
      actions.push({ type: "move_toward_player", reason: "attracted by noise" });
      return actions;
    }

    if (Math.random() < AI_ROAM_CHANCE) {
      actions.push({ type: "move_random", reason: "roaming" });
    }

    return actions;
  },
  sounds: {
    move: {
      volume: "quiet",
      texts: [
        "Skittering of tiny claws on stone",
        "Small legs scrambling in the dark",
        "Faint scratching echoes nearby",
      ],
    },
    blocked: { volume: "quiet", texts: ["Scratching against a barricade"] },
  },
};

/* ── Zombie ── */

export const zombieDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    if (ctx.noise !== "quiet" && Math.random() < AI_NOISE_ATTRACT_CHANCE) {
      return [{ type: "move_toward_player", reason: "attracted by noise" }];
    }

    if (Math.random() < AI_ROAM_CHANCE) {
      return [{ type: "move_random", reason: "roaming" }];
    }

    return [];
  },
  sounds: {
    move: {
      volume: "normal",
      texts: [
        "Heavy, shambling footsteps",
        "Wet dragging across stone",
        "A low groan and shuffling feet",
      ],
    },
    blocked: { volume: "normal", texts: ["Something pounds against a sealed door"] },
  },
};

/* ── Ghost ── */

export const ghostDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    if (ctx.noise === "loud" && Math.random() < AI_LIGHT_FLEE_CHANCE) {
      return [{ type: "move_away_from_player", reason: "fleeing noise" }];
    }

    return [];
  },
  canPassDoor() {
    return true;
  },
  sounds: {
    move: {
      volume: "quiet",
      texts: [
        "A chill breeze drifts through the corridor",
        "Faint moaning from somewhere unseen",
        "The air grows cold for a moment",
      ],
    },
    blocked: { volume: "quiet", texts: ["A cold presence presses against a barrier"] },
  },
};

/* ── Vampire ── */

export const vampireDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    if (ctx.noise === "loud" && Math.random() < AI_LIGHT_FLEE_CHANCE) {
      return [{ type: "move_away_from_player", reason: "fleeing light/noise" }];
    }

    return [];
  },
  sounds: {
    move: {
      volume: "normal",
      texts: [
        "A rush of cold air, something withdrawing",
        "The flutter of a dark cloak",
        "A sharp hiss fading into silence",
      ],
    },
    blocked: { volume: "normal", texts: ["Hissing from behind a sealed door"] },
  },
};

/* ── Shadow ── */

export const shadowDungeonMechanics: OutOfCombatMechanics = {
  onTick() {
    if (Math.random() < AI_ROAM_CHANCE) {
      return [{ type: "move_random", reason: "roaming" }];
    }
    return [];
  },
  canPassDoor() {
    return true;
  },
  sounds: {
    move: {
      volume: "quiet",
      texts: [
        "The shadows shift and deepen",
        "Darkness crawls along the walls",
        "A patch of black slithers out of sight",
      ],
    },
    blocked: { volume: "quiet", texts: ["Darkness pools against a blockade"] },
  },
};

/* ── Banshee ── */

export const bansheeDungeonMechanics: OutOfCombatMechanics = {
  onTick() {
    return [];
  },
  sounds: {
    move: {
      volume: "loud",
      texts: ["A distant wail pierces the silence", "An unearthly shriek echoes through the halls"],
    },
    blocked: { volume: "loud", texts: ["A wail of frustration from beyond a blockade"] },
  },
};

/* ── Necromancer ── */

const SCOUT_SEND_TEXTS = [
  "Arcane whispers, then shambling footsteps with purpose",
  "A commanding murmur, followed by heavy shuffling",
];

const NECRO_RITUAL_TURNS = 3;
const NECRO_RESURRECT_HP_FRAC = 0.2;

const RITUAL_START_TEXTS = [
  "A low, resonant chanting drifts through the stone",
  "Arcane syllables echo — something stirs in the dark",
  "A necromantic drone rises, then falls, then rises again",
];

const RITUAL_TICK_TEXTS = ["The chanting intensifies", "Dark energies coil and tighten"];

export const necromancerDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    const actions: DungeonAction[] = [];

    // Continue an in-progress ritual
    if (ctx.room.necroRitual) {
      actions.push({ type: "tick_ritual" });
      actions.push({ type: "log", text: pick(RITUAL_TICK_TEXTS), volume: "loud" });
      return actions;
    }

    // Start a new ritual if there are corpses in the room
    const corpseTypeId = Object.keys(ctx.room.corpses).find(
      (id) => (ctx.room.corpses[id] ?? 0) > 0,
    );
    if (corpseTypeId) {
      actions.push({
        type: "begin_ritual",
        typeId: corpseTypeId,
        turns: NECRO_RITUAL_TURNS,
        hpFraction: NECRO_RESURRECT_HP_FRAC,
      });
      actions.push({ type: "log", text: pick(RITUAL_START_TEXTS), volume: "loud" });
      return actions;
    }

    // No corpses — send a zombie to investigate noise instead
    if (ctx.noise !== "quiet") {
      const zombieInRoom = ctx.room.enemies.find((e) => e.typeId === "zombie");
      const adjacentToPlayer = ctx.neighbours.find((n) => n.id === ctx.currentRoomId);
      if (zombieInRoom && adjacentToPlayer && Math.random() < AI_SCOUT_SEND_CHANCE) {
        return [
          {
            type: "send_minion",
            minionUid: zombieInRoom.uid,
            targetRoomId: adjacentToPlayer.id,
            reason: "sent by Necromancer to investigate",
          },
          { type: "log", text: pick(SCOUT_SEND_TEXTS), volume: "normal" },
        ];
      }
    }

    // No corpses, no zombies — roam in search of corpses
    return [{ type: "move_random", reason: "searching for corpses" }];
  },
  sounds: {
    move: {
      volume: "normal",
      texts: [
        "Arcane whispers drift through the stone",
        "A low chanting reverberates through the walls",
      ],
    },
    blocked: { volume: "normal", texts: ["Muttering and scraping at a barred entrance"] },
  },
};

/* ── Skeleton ── */
/* CSV: "Scouts the dungeon", "Investigates it" (light), bashes doors */

export const skeletonDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    // Investigates any noise (attracted by medium+)
    if (ctx.noise !== "quiet" && Math.random() < AI_NOISE_ATTRACT_CHANCE) {
      return [{ type: "move_toward_player", reason: "investigating disturbance" }];
    }
    // Actively scouts — roams more than most enemies
    if (Math.random() < AI_ROAM_CHANCE * 3) {
      return [{ type: "move_random", reason: "scouting" }];
    }
    return [];
  },
  sounds: {
    move: {
      volume: "normal",
      texts: ["The clatter of bones on stone", "Rattling from beyond the door"],
    },
    blocked: { volume: "normal", texts: ["Bones clatter against a blocked passage"] },
  },
};

/* ── Ghoul ── */
/* CSV: "Finds nearest human, tries to hide or ambush", "Moves away to hide" from light */

export const ghoulDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    // Flees toward darkness when it hears noise (avoids confrontation to preserve ambush)
    if (ctx.noise !== "quiet" && Math.random() < AI_LIGHT_FLEE_CHANCE) {
      return [{ type: "move_away_from_player", reason: "retreating to hide" }];
    }
    return [];
  },
  sounds: {
    move: {
      volume: "quiet",
      texts: ["Something pads softly in the darkness", "A faint, wet sniffing sound"],
    },
    blocked: { volume: "quiet", texts: ["Clawing at a sealed door"] },
  },
};

/* ── Grave Robber ── */
/* CSV: "Away from any perceived danger, towards the exit", flees on any noise */

const GRAVE_ROBBER_FLEE_TEXTS = [
  "Hurried footsteps retreating into the dark",
  "The jingle of stolen coin, moving quickly away",
  "Panicked scrambling echoing through the corridor",
];

export const graveRobberDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    // Always flees any noise — cowardly by nature
    if (ctx.noise !== "quiet") {
      return [{ type: "move_away_from_player", reason: "fleeing in fear" }];
    }
    // Wanders when quiet, seeking loot
    if (Math.random() < AI_ROAM_CHANCE) {
      return [{ type: "move_random", reason: "searching for loot" }];
    }
    return [];
  },
  sounds: {
    move: { volume: "quiet", texts: GRAVE_ROBBER_FLEE_TEXTS },
    blocked: { volume: "quiet", texts: ["Frantic rattling of a locked door handle"] },
  },
};

/* ── Gutborn Larva ── */
/* CSV: "Towards any sign of life", squeezes under doors, flees light */

export const gutbornLarvaDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    // Flees from loud disturbances
    if (ctx.noise === "loud" && Math.random() < AI_LIGHT_FLEE_CHANCE) {
      return [{ type: "move_away_from_player", reason: "fleeing the light" }];
    }
    // Actively seeks out life — attracted to any noise
    if (ctx.noise !== "quiet" && Math.random() < AI_NOISE_ATTRACT_CHANCE) {
      return [{ type: "move_toward_player", reason: "seeking a host" }];
    }
    // Otherwise crawls through the dungeon
    if (Math.random() < AI_ROAM_CHANCE) {
      return [{ type: "move_random", reason: "searching for a host" }];
    }
    return [];
  },
  canPassDoor() {
    // Squeezes under closed doors
    return true;
  },
  sounds: {
    move: {
      volume: "quiet",
      texts: [
        "A wet, skittering sound in the walls",
        "Something small drags itself through the dark",
        "A faint, moist rustling",
      ],
    },
    blocked: { volume: "quiet", texts: ["Scratching from beneath a door"] },
  },
};
