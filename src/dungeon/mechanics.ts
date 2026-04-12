import {
  AI_REPRODUCE_CHANCE,
  AI_NOISE_ATTRACT_CHANCE,
  AI_ROAM_CHANCE,
  AI_SCOUT_SEND_CHANCE,
  RAT_CAP_PER_ROOM,
  RAT_CAP_PER_AREA,
  VAMPIRE_APPROACH_HP_RATIO,
  VAMPIRE_AVOID_HP_RATIO,
} from "../data/constants";
import type { AreaAction, OutOfCombatMechanics } from "../types";

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ── Rat — BREEDS ─────────────────────────────────────────────────────────
   Reproduce up to caps. Scatter from noise. The CLOCK — the cost of
   lingering. ratInfested occupation effect handled centrally in runAreaAI.
──────────────────────────────────────────────────────────────────────────── */

const RAT_REPRODUCE_TEXTS = [
  "Frantic squeaking echoes from the dark",
  "A chorus of high-pitched chittering",
  "The sound of many small things multiplying",
] as const;

export const ratDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    const actions: AreaAction[] = [];

    const ratsInRoom = ctx.room.enemies.filter((e) => e.typeId === "rat").length;
    const ratsInArea = ctx.rooms.reduce(
      (sum, r) => sum + r.enemies.filter((e) => e.typeId === "rat").length,
      0,
    );

    if (
      Math.random() < AI_REPRODUCE_CHANCE &&
      ratsInRoom < RAT_CAP_PER_ROOM &&
      ratsInArea < RAT_CAP_PER_AREA
    ) {
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

/* ── Skeleton — PATROLS ───────────────────────────────────────────────────
   Deterministic cycle through spawn room's connections, sorted by grid ID.
   Route: [conn1, spawn, conn2, spawn, ...]. Every step is adjacent.
   Commanded undead override: chase player on noise.
──────────────────────────────────────────────────────────────────────────── */

export const skeletonDungeonMechanics: OutOfCombatMechanics = {
  onTick(self, ctx) {
    if (ctx.room.commanded && ctx.noise !== "quiet") {
      return [{ type: "move_toward_player", reason: "commanded" }];
    }

    if (!self.patrolRoute || self.patrolRoute.length === 0) {
      return [];
    }

    const nextIndex = ((self.patrolIndex ?? 0) + 1) % self.patrolRoute.length;
    const targetRoomId = self.patrolRoute[nextIndex];
    self.patrolIndex = nextIndex;

    if (targetRoomId === ctx.room.id) {
      return [];
    }

    if (!ctx.room.connections.includes(targetRoomId)) {
      return [];
    }

    return [{ type: "move", targetRoomId, reason: "patrolling" }];
  },
  sounds: {
    move: {
      volume: "normal",
      texts: ["The clatter of bones on stone", "Rattling from beyond the door"],
    },
    blocked: { volume: "normal", texts: ["Bones clatter against a blocked passage"] },
  },
};

/* ── Zombie — OBEYS ───────────────────────────────────────────────────────
   Tethered to spawn room (necromancer's room). Never moves beyond tether
   range 2. Stops completely if no necromancer is alive.
──────────────────────────────────────────────────────────────────────────── */

export const zombieDungeonMechanics: OutOfCombatMechanics = {
  onTick(self, ctx) {
    const necroAlive = ctx.rooms.some((r) =>
      r.enemies.some((e) => e.typeId === "necromancer"),
    );

    if (!necroAlive) {
      return [];
    }

    if (self.tetheredTo && ctx.room.id !== self.tetheredTo) {
      const tether = ctx.byId(self.tetheredTo);
      if (tether) {
        const isWithin1 = tether.connections.includes(ctx.room.id);
        const isWithin2 =
          isWithin1 ||
          tether.connections.some((nid) => {
            const n = ctx.byId(nid);
            return n?.connections.includes(ctx.room.id) ?? false;
          });

        if (!isWithin2) {
          const stepBack = ctx.neighbours.find(
            (n) => n.id === self.tetheredTo || tether.connections.includes(n.id),
          );
          if (stepBack) {
            return [{ type: "move", targetRoomId: stepBack.id, reason: "returning to post" }];
          }
        }
      }
    }

    if (ctx.room.commanded && ctx.noise !== "quiet") {
      return [{ type: "move_toward_player", reason: "commanded" }];
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

/* ── Ghost — HAUNTS ───────────────────────────────────────────────────────
   NEVER moves. Anchored to death place permanently. Cold zone propagated
   centrally in runAreaAI.
──────────────────────────────────────────────────────────────────────────── */

export const ghostDungeonMechanics: OutOfCombatMechanics = {
  onTick() {
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

/* ── Vampire — STALKS ─────────────────────────────────────────────────────
   Reacts to player HP: avoids when healthy, approaches when wounded.
   Consumes vermin (rats/larvae) in its room. The anti-sound.
──────────────────────────────────────────────────────────────────────────── */

export const vampireDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    if (ctx.room.commanded && ctx.noise !== "quiet") {
      return [{ type: "move_toward_player", reason: "commanded" }];
    }

    const actions: AreaAction[] = [];

    const hasVermin = ctx.room.enemies.some(
      (e) => e.typeId === "rat" || e.typeId === "gutborn_larva",
    );
    if (hasVermin) {
      actions.push({ type: "consume_vermin" });
    }

    const hpRatio =
      ctx.playerHp !== undefined && ctx.playerMaxHp
        ? ctx.playerHp / ctx.playerMaxHp
        : 1;

    if (hpRatio > VAMPIRE_AVOID_HP_RATIO) {
      actions.push({ type: "move_away_from_player", reason: "avoiding strong prey" });
    } else if (hpRatio < VAMPIRE_APPROACH_HP_RATIO) {
      actions.push({ type: "move_toward_player", reason: "stalking wounded prey" });
    } else if (Math.random() < AI_ROAM_CHANCE) {
      actions.push({ type: "move_random", reason: "drifting" });
    }

    return actions;
  },
  sounds: {
    move: {
      volume: "quiet",
      texts: [
        "A rush of cold air, something withdrawing",
        "The flutter of a dark cloak",
        "A sharp hiss fading into silence",
      ],
    },
    blocked: { volume: "quiet", texts: ["Hissing from behind a sealed door"] },
  },
};

/* ── Banshee — DEAFENS ────────────────────────────────────────────────────
   Mostly stationary. Wail zone (dist 3) masks other sounds — propagated
   centrally in runAreaAI.
──────────────────────────────────────────────────────────────────────────── */

export const bansheeDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    if (ctx.room.commanded && ctx.noise !== "quiet") {
      return [{ type: "move_toward_player", reason: "commanded" }];
    }

    if (Math.random() < AI_ROAM_CHANCE * 0.3) {
      return [{ type: "move_random", reason: "drifting" }];
    }

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

/* ── Necromancer — COMMANDS ───────────────────────────────────────────────
   Stationary. Ritually resurrects corpses (existing necroRitual system).
   Sends zombies to investigate. Command aura propagated centrally.
   Won't raise corpses from infested rooms.
──────────────────────────────────────────────────────────────────────────── */

const SCOUT_SEND_TEXTS = [
  "Arcane whispers, then shambling footsteps with purpose",
  "A commanding murmur, followed by heavy shuffling",
] as const;

const NECRO_RITUAL_TURNS = 3;
const NECRO_RESURRECT_HP_FRAC = 0.2;

const RITUAL_START_TEXTS = [
  "A low, resonant chanting drifts through the stone",
  "Arcane syllables echo — something stirs in the dark",
  "A necromantic drone rises, then falls, then rises again",
] as const;

const RITUAL_TICK_TEXTS = [
  "The chanting intensifies",
  "Dark energies coil and tighten",
] as const;

export const necromancerDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    const actions: AreaAction[] = [];

    if (ctx.room.necroRitual) {
      actions.push({ type: "tick_ritual" });
      actions.push({ type: "log", text: pick(RITUAL_TICK_TEXTS), volume: "loud" });
      return actions;
    }

    const corpseTypeId = Object.keys(ctx.room.corpses).find(
      (id) => (ctx.room.corpses[id] ?? 0) > 0,
    );
    if (corpseTypeId && !ctx.room.infested) {
      actions.push({
        type: "begin_ritual",
        typeId: corpseTypeId,
        turns: NECRO_RITUAL_TURNS,
        hpFraction: NECRO_RESURRECT_HP_FRAC,
      });
      actions.push({ type: "log", text: pick(RITUAL_START_TEXTS), volume: "loud" });
      return actions;
    }

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

    return [];
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

/* ── Ghoul — LURKS ────────────────────────────────────────────────────────
   Moves toward dark rooms (shadowDarkness), away from noise. Leaves NO
   environmental trace — invisibility is the identity.
──────────────────────────────────────────────────────────────────────────── */

export const ghoulDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    if (ctx.noise !== "quiet") {
      return [{ type: "move_away_from_player", reason: "retreating to hide" }];
    }

    const darkNeighbour = ctx.neighbours.find(
      (n) => (n.shadowDarkness ?? 0) > 0 && n.id !== ctx.currentRoomId,
    );
    if (darkNeighbour) {
      return [{ type: "move", targetRoomId: darkNeighbour.id, reason: "lurking in darkness" }];
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

/* ── Shadow — SPREADS ─────────────────────────────────────────────────────
   Drifts slowly. Can pass doors/walls. Darkness propagation (room +
   adjacent) handled centrally in runAreaAI.
──────────────────────────────────────────────────────────────────────────── */

export const shadowDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    if (ctx.room.commanded && ctx.noise !== "quiet") {
      return [{ type: "move_toward_player", reason: "commanded" }];
    }

    if (Math.random() < AI_ROAM_CHANCE) {
      return [{ type: "move_random", reason: "spreading" }];
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

/* ── Grave Robber — LOOTS ─────────────────────────────────────────────────
   Flees noise. Moves toward unvisited rooms. Loots salt/consumable props.
   Killing the grave robber recovers looted items.
──────────────────────────────────────────────────────────────────────────── */

export const graveRobberDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    if (ctx.noise !== "quiet") {
      return [{ type: "move_away_from_player", reason: "fleeing in fear" }];
    }

    const actions: AreaAction[] = [];

    if (ctx.room.props?.length) {
      actions.push({ type: "loot_room" });
    }

    const unvisitedNeighbour = ctx.neighbours.find((n) => n.state !== "visited");
    if (unvisitedNeighbour) {
      actions.push({
        type: "move",
        targetRoomId: unvisitedNeighbour.id,
        reason: "seeking loot",
      });
    } else if (Math.random() < AI_ROAM_CHANCE) {
      actions.push({ type: "move_random", reason: "searching for loot" });
    }

    return actions;
  },
  sounds: {
    move: {
      volume: "quiet",
      texts: [
        "Hurried footsteps retreating into the dark",
        "The jingle of stolen coin, moving quickly away",
        "Panicked scrambling echoing through the corridor",
      ],
    },
    blocked: { volume: "quiet", texts: ["Frantic rattling of a locked door handle"] },
  },
};

/* ── Gutborn Larva — INFESTS ──────────────────────────────────────────────
   Seeks rooms with corpses. After 2 turns of occupation, infests corpses
   (blocking necromancer resurrection). Flees from light/loud noise.
──────────────────────────────────────────────────────────────────────────── */

export const gutbornLarvaDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    if (ctx.noise === "loud") {
      return [{ type: "move_away_from_player", reason: "fleeing the light" }];
    }

    const corpseNeighbour = ctx.neighbours.find(
      (n) => Object.keys(n.corpses).length > 0 && n.id !== ctx.currentRoomId,
    );
    if (corpseNeighbour) {
      return [{ type: "move", targetRoomId: corpseNeighbour.id, reason: "seeking corpses" }];
    }

    if (Object.keys(ctx.room.corpses).length > 0) {
      return [];
    }

    if (Math.random() < AI_ROAM_CHANCE) {
      return [{ type: "move_random", reason: "searching for a host" }];
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
        "A wet, skittering sound in the walls",
        "Something small drags itself through the dark",
        "A faint, moist rustling",
      ],
    },
    blocked: { volume: "quiet", texts: ["Scratching from beneath a door"] },
  },
};

/* ── Boneguard — BLOCKS ───────────────────────────────────────────────────
   Stationed permanently. Only investigates loud noise, then returns next
   tick. Living locked door.
──────────────────────────────────────────────────────────────────────────── */

export const boneguardDungeonMechanics: OutOfCombatMechanics = {
  onTick(self, ctx) {
    if (self.tetheredTo && ctx.room.id !== self.tetheredTo) {
      const stationRoom = ctx.neighbours.find((n) => n.id === self.tetheredTo);
      if (stationRoom) {
        return [{ type: "move", targetRoomId: stationRoom.id, reason: "returning to post" }];
      }
      return [];
    }

    if (ctx.room.commanded && ctx.noise !== "quiet") {
      return [{ type: "move_toward_player", reason: "commanded" }];
    }

    if (ctx.noise === "loud") {
      return [{ type: "move_toward_player", reason: "investigating disturbance" }];
    }

    return [];
  },
  sounds: {
    move: {
      volume: "normal",
      texts: [
        "Heavy, deliberate footsteps of bone on stone",
        "The grinding of a massive shield dragging on the floor",
      ],
    },
    blocked: { volume: "normal", texts: ["A massive weight presses against a sealed passage"] },
  },
};

/* ── Bone Hound — HUNTS ──────────────────────────────────────────────────
   Moves toward player on ANY noise (guaranteed, not random). Double roam
   speed. Tracks left in rooms handled by moveEnemy in area.ts.
──────────────────────────────────────────────────────────────────────────── */

export const boneHoundDungeonMechanics: OutOfCombatMechanics = {
  onTick(_self, ctx) {
    if (ctx.room.commanded && ctx.noise !== "quiet") {
      return [{ type: "move_toward_player", reason: "commanded" }];
    }

    if (ctx.noise !== "quiet") {
      return [{ type: "move_toward_player", reason: "tracking prey" }];
    }

    if (Math.random() < AI_ROAM_CHANCE * 2) {
      return [{ type: "move_random", reason: "patrolling" }];
    }

    return [];
  },
  sounds: {
    move: {
      volume: "normal",
      texts: [
        "Rapid clicking of bony claws on stone",
        "A skeletal snarl echoes through the corridor",
        "The scrape of bone paws, moving fast",
      ],
    },
    blocked: { volume: "normal", texts: ["Frantic scratching and snarling at a barred door"] },
  },
};

/* ── Salt Revenant — GUARDS ───────────────────────────────────────────────
   Territorial. Drifts slowly between home and adjacent rooms. Never
   leaves territory. Salt crystals effect handled centrally.
──────────────────────────────────────────────────────────────────────────── */

export const saltRevenantDungeonMechanics: OutOfCombatMechanics = {
  onTick(self, ctx) {
    if (ctx.room.commanded && ctx.noise !== "quiet") {
      return [{ type: "move_toward_player", reason: "commanded" }];
    }

    if (self.tetheredTo && ctx.room.id !== self.tetheredTo) {
      if (Math.random() < 0.5) {
        const home = ctx.neighbours.find((n) => n.id === self.tetheredTo);
        if (home) {
          return [{ type: "move", targetRoomId: home.id, reason: "drifting between salt veins" }];
        }
      }
      return [];
    }

    if (Math.random() < AI_ROAM_CHANCE * 0.5) {
      return [{ type: "move_random", reason: "drifting between salt veins" }];
    }

    return [];
  },
  sounds: {
    move: {
      volume: "quiet",
      texts: [
        "A faint crystalline tinkling, like wind chimes made of salt",
        "Something crunches softly - crystals forming, or breaking",
      ],
    },
    blocked: { volume: "quiet", texts: ["Crystals creak against the sealed door"] },
  },
};
