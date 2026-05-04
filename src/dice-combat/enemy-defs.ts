import type {
  DiceCombatState,
  DiceEnemy,
  DiceEnemyDef,
  DiceEnemyIntent,
  DieSlot,
  FaceColor,
} from "./types";
import { DICE_BALANCE } from "./balance";

/* ── Helpers ── */

function intent(
  id: string,
  label: string,
  icon: string,
  damage?: number,
  tooltip?: string,
): DiceEnemyIntent {
  return { id, label, icon, damage, tooltip };
}

function appendLog(
  state: DiceCombatState,
  source: "player" | "enemy" | "system",
  text: string,
): DiceCombatState {
  return { ...state, log: [...state.log, { turn: state.turn, source, text }] };
}

function freshUid(state: DiceCombatState, prefix: string): string {
  return `${prefix}_t${state.turn}_${Math.floor(state.rng % 1e6)}_${state.enemies.length}`;
}

function spawnEnemy(state: DiceCombatState, defId: string, uidPrefix?: string): DiceCombatState {
  const def = DICE_ENEMY_DEFS[defId];
  if (!def) return state;
  const newEnemy: DiceEnemy = {
    uid: freshUid(state, uidPrefix ?? defId),
    id: def.id,
    name: def.name,
    icon: def.icon,
    hp: def.maxHp,
    maxHp: def.maxHp,
    row: def.defaultRow,
    statuses: {},
    resistances: def.resistances,
    vulnerabilities: def.vulnerabilities,
    isBoss: def.isBoss,
    intent: null,
    untargetable: false,
    reassembleQueued: false,
    reassembleCountdown: 0,
    turnsAlive: 0,
    phaseIndex: 0,
    thresholdHealUsed: false,
    intangible: false,
    rolledFaces: [],
  };
  let s: DiceCombatState = { ...state, enemies: [...state.enemies, newEnemy] };
  if (def.onSpawn) s = def.onSpawn(newEnemy, s);
  return s;
}

function lockSlot(state: DiceCombatState, slot: DieSlot): DiceCombatState {
  if (state.player.slotLocks.includes(slot)) return state;
  return {
    ...state,
    player: { ...state.player, slotLocks: [...state.player.slotLocks, slot] },
  };
}

function corruptFace(
  state: DiceCombatState,
  slot: DieSlot,
  faceIndex: number,
  to: FaceColor,
  sourceUid: string,
): DiceCombatState {
  const already = state.player.corruptedFaces.find(
    (c) => c.slot === slot && c.faceIndex === faceIndex,
  );
  if (already) return state;
  return {
    ...state,
    player: {
      ...state.player,
      corruptedFaces: [
        ...state.player.corruptedFaces,
        { slot, faceIndex, recoloredTo: to, sourceUid },
      ],
    },
  };
}

/* ── 1. Ravager Rat ── */

const RAT: DiceEnemyDef = {
  id: "rat",
  name: "Ravager Rat",
  icon: "🐀",
  maxHp: 2,
  defaultRow: "front",
  isBoss: false,
  resistances: {},
  vulnerabilities: {},
  // v3: rolls one die; faces include reproduce (1/6), bite, rake, cower, blank.
  dice: [
    {
      id: "rat_die",
      name: "Rat",
      icon: "🐀",
      faces: [
        "enemy_bite_1",
        "enemy_rake_2",
        "enemy_rake_2",
        "enemy_reproduce",
        "enemy_cower",
        "blank",
      ],
      defaultTarget: "player",
    },
  ],
  selectIntent: () => intent("bite", "Bite", "🦷", 1, "Rolls a rat die."),
};

/* ── 2. Skeleton ── */

const SKELETON: DiceEnemyDef = {
  id: "skeleton",
  name: "Skeleton",
  icon: "💀",
  maxHp: 16,
  defaultRow: "front",
  isBoss: false,
  resistances: { pierce: 0.5 },
  vulnerabilities: { bludgeoning: 1.5 },
  // v3: Bone Die (offense) + Armor Die (self-block).
  dice: [
    {
      id: "bone_die",
      name: "Bone Die",
      icon: "🦴",
      faces: [
        "enemy_bone_strike",
        "enemy_bone_strike",
        "enemy_bone_crack",
        "enemy_bone_lurch",
        "enemy_bone_bash",
        "blank",
      ],
      defaultTarget: "player",
    },
    {
      id: "armor_die",
      name: "Armor Die",
      icon: "🛡️",
      faces: [
        "enemy_armor_2",
        "enemy_armor_1",
        "enemy_armor_strike",
        "enemy_armor_stun",
        "blank",
        "blank",
      ],
      defaultTarget: "self",
    },
  ],
  selectIntent: () => intent("bash", "Bash", "🦴", 4, "Strikes for 4."),
  onDeath: (self, state, killingType) => {
    // Iron / bludgeoning or Fire kill it permanently. Anything else leaves a Heap.
    if (killingType === "bludgeoning" || killingType === "fire" || killingType === "holy") {
      return appendLog(state, "system", `${self.name} is shattered for good.`);
    }
    const heap: DiceEnemy = {
      ...self,
      hp: 3,
      maxHp: 3,
      reassembleQueued: true,
      // +1 because endOfTurn ticks once on the same turn the skeleton dies.
      reassembleCountdown: DICE_BALANCE.HEAP_RISE_TURNS + 1,
      untargetable: false,
      intent: null,
      id: "heap_of_bones",
      name: "Heap of Bones",
      icon: "🦴",
      vulnerabilities: { bludgeoning: 2.0, fire: 2.0 },
      resistances: { pierce: 0.5 },
    };
    return {
      ...state,
      enemies: [...state.enemies, heap],
      log: [
        ...state.log,
        {
          turn: state.turn,
          source: "system",
          text: `${self.name} collapses into a Heap of Bones — rises in ${DICE_BALANCE.HEAP_RISE_TURNS} turns.`,
        },
      ],
    };
  },
};

/* ── 3. Heap of Bones ── */

const HEAP_OF_BONES: DiceEnemyDef = {
  id: "heap_of_bones",
  name: "Heap of Bones",
  icon: "🦴",
  maxHp: 3,
  defaultRow: "front",
  isBoss: false,
  resistances: { pierce: 0.5 },
  vulnerabilities: { bludgeoning: 2.0, fire: 2.0 },
  selectIntent: () => null, // No attack — just a countdown.
};

/* ── 4. Rotting Zombie ── */

const ZOMBIE: DiceEnemyDef = {
  id: "zombie",
  name: "Rotting Zombie",
  icon: "🧟",
  maxHp: 8,
  defaultRow: "front",
  isBoss: false,
  resistances: {},
  vulnerabilities: {},
  // v3: rolls a slow shamble die. Necromancer-buffing flavor moves to a passive bolster
  // applied by the Necromancer (stretch — for now zombies just shamble for 1).
  dice: [
    {
      id: "zombie_die",
      name: "Zombie Die",
      icon: "🧟",
      faces: ["enemy_shamble", "enemy_shamble", "enemy_grasp", "enemy_shamble", "blank", "blank"],
      defaultTarget: "player",
    },
  ],
  selectIntent: () => intent("shamble", "Shamble", "🧟", undefined, "Rolls a zombie die."),
};

/* ── 5. Mournful Ghost ── */

const GHOST: DiceEnemyDef = {
  id: "ghost",
  name: "Mournful Ghost",
  icon: "👻",
  maxHp: 12,
  defaultRow: "front",
  isBoss: false,
  resistances: { slash: 0.5, pierce: 0.5 },
  vulnerabilities: {},
  // v3: phantom strikes that bypass shields.
  dice: [
    {
      id: "ghost_die",
      name: "Phantom Die",
      icon: "👻",
      faces: [
        "enemy_phantom_strike",
        "enemy_phantom_strike",
        "enemy_wail",
        "enemy_drone",
        "blank",
        "blank",
      ],
      defaultTarget: "player",
    },
  ],
  selectIntent: (self) =>
    intent(
      self.intangible ? "phased" : "phantom",
      self.intangible ? "Phantom (intangible)" : "Phantom",
      "👻",
      undefined,
      self.intangible ? "Crimson damage deals 0 this turn." : "Rolls a phantom die.",
    ),
  onPlayerTurnStart: (self, state) => {
    // Toggle intangibility every turn.
    return {
      ...state,
      enemies: state.enemies.map((e) =>
        e.uid === self.uid ? { ...e, intangible: !e.intangible } : e,
      ),
    };
  },
  modifyIncomingDamage: (self, _state, base, type) => {
    if (self.intangible && type !== "fire" && type !== "holy") return 0;
    return base;
  },
};

/* ── 6. Blood Wraith ── */

const VAMPIRE: DiceEnemyDef = {
  id: "vampire",
  name: "Blood Wraith",
  icon: "🧛",
  maxHp: 20,
  defaultRow: "front",
  isBoss: false,
  resistances: {},
  vulnerabilities: {},
  // v3: rolls a Blood Die — drain attacks heal self via heart symbol.
  dice: [
    {
      id: "vampire_die",
      name: "Blood Die",
      icon: "🧛",
      faces: [
        "enemy_drain",
        "enemy_drain",
        "enemy_drain_heavy",
        "enemy_grasp",
        "enemy_chant",
        "blank",
      ],
      defaultTarget: "player",
    },
  ],
  selectIntent: () => intent("drain", "Drain", "🩸", undefined, "Rolls a blood die."),
  resolveIntent: (_self, state) => state,
  onPlayerBust: (self, state, poolSize) => {
    const heal = poolSize;
    if (heal <= 0) return state;
    return {
      ...state,
      enemies: state.enemies.map((e) =>
        e.uid === self.uid ? { ...e, hp: Math.min(e.maxHp, e.hp + heal) } : e,
      ),
      log: [
        ...state.log,
        {
          turn: state.turn,
          source: "enemy",
          text: `${self.name} laps your spilled greed — heals ${heal}.`,
        },
      ],
    };
  },
};

/* ── 7. Wailing Banshee ── */

const BANSHEE: DiceEnemyDef = {
  id: "banshee",
  name: "Wailing Banshee",
  icon: "👁️",
  maxHp: 12,
  defaultRow: "back",
  isBoss: false,
  resistances: {},
  vulnerabilities: {},
  // v3: rolls a Wail die. Wail and Drone are unblockable (terror attacks).
  dice: [
    {
      id: "wail_die",
      name: "Wail Die",
      icon: "👁️",
      faces: ["enemy_wail", "enemy_wail", "enemy_drone", "enemy_ululate", "blank", "blank"],
      defaultTarget: "player",
    },
  ],
  selectIntent: () => intent("wail", "Wail", "📢", undefined, "Rolls a wail die — terror."),
  resolveIntent: (_self, state) => state,
  onSpawn: (self, state) => {
    const s = corruptFace(state, "main", 0, "coldfire", self.uid);
    return appendLog(s, "enemy", `${self.name}'s wail rewrites a face on your weapon.`);
  },
};

/* ── 8. Necromancer ── */

const NECROMANCER: DiceEnemyDef = {
  id: "necromancer",
  name: "Necromancer",
  icon: "🧙",
  maxHp: 8,
  defaultRow: "back",
  isBoss: false,
  resistances: {},
  vulnerabilities: {},
  // v3: rolls a Curse die. Area + undodgeable + unblockable.
  dice: [
    {
      id: "curse_die",
      name: "Curse Die",
      icon: "🌫️",
      faces: ["enemy_curse", "enemy_curse", "enemy_grave_call", "enemy_chant", "blank", "blank"],
      defaultTarget: "player",
    },
  ],
  selectIntent: () =>
    intent("raise", "Raise Dead", "⚰️", undefined, "Animates a Heap or summons a zombie."),
  resolveIntent: (_self, state) => {
    // Prefer animating an existing Heap into a Skeleton; else summon a Zombie.
    const heap = state.enemies.find((e) => e.id === "heap_of_bones" && e.hp > 0);
    if (heap) {
      const skel = DICE_ENEMY_DEFS.skeleton;
      const animated: DiceEnemy = {
        ...heap,
        id: skel.id,
        name: skel.name,
        icon: skel.icon,
        maxHp: skel.maxHp,
        hp: skel.maxHp,
        resistances: skel.resistances,
        vulnerabilities: skel.vulnerabilities,
        reassembleQueued: false,
        reassembleCountdown: 0,
      };
      return {
        ...state,
        enemies: state.enemies.map((e) => (e.uid === heap.uid ? animated : e)),
        log: [
          ...state.log,
          {
            turn: state.turn,
            source: "enemy",
            text: `The Necromancer animates a Heap of Bones into a Skeleton.`,
          },
        ],
      };
    }
    return spawnEnemy(state, "zombie");
  },
};

/* ── 9. Lurking Ghoul ── */

const GHOUL: DiceEnemyDef = {
  id: "ghoul",
  name: "Lurking Ghoul",
  icon: "👹",
  maxHp: 14,
  defaultRow: "front",
  isBoss: false,
  resistances: {},
  vulnerabilities: {},
  // v3: rolls 1 die normally; on first turn, an extra ambush face is appended via onSpawn.
  dice: [
    {
      id: "ghoul_die",
      name: "Ghoul Die",
      icon: "👹",
      faces: [
        "enemy_pounce",
        "enemy_pounce",
        "enemy_grasp",
        "enemy_bite_1",
        "enemy_cower",
        "blank",
      ],
      defaultTarget: "player",
    },
  ],
  selectIntent: () => intent("rake", "Rake", "💢", undefined, "Rolls a ghoul die."),
  onSpawn: (self, state) => {
    // Mark for ambush on the first turn — UI consumes turnsAlive==0 as the ambush window.
    return {
      ...state,
      enemies: state.enemies.map((e) => (e.uid === self.uid ? { ...e, intangible: false } : e)),
    };
  },
};

/* ── 10. The Shadow ── */

const SHADOW: DiceEnemyDef = {
  id: "shadow",
  name: "The Shadow",
  icon: "🌑",
  maxHp: 16,
  defaultRow: "front",
  isBoss: false,
  resistances: {},
  vulnerabilities: {},
  // v3: shadow strikes are unblockable; aura (blanks → coldfire) handled passively.
  dice: [
    {
      id: "shadow_die",
      name: "Shadow Die",
      icon: "🌑",
      faces: [
        "enemy_shadow_strike",
        "enemy_shadow_strike",
        "enemy_phantom_strike",
        "enemy_drone",
        "blank",
        "blank",
      ],
      defaultTarget: "player",
    },
  ],
  selectIntent: () =>
    intent("drain_light", "Drain Light", "🌑", undefined, "Rolls a shadow die. Blanks → Coldfire."),
};

/* ── 11. Grave Robber ── */

const GRAVE_ROBBER: DiceEnemyDef = {
  id: "grave_robber",
  name: "Grave Robber",
  icon: "🕵️",
  maxHp: 10,
  defaultRow: "front",
  isBoss: false,
  resistances: {},
  vulnerabilities: {},
  // v3: rolls a die — most faces pilfer; some are blank. Pilfer logic stays in resolveIntent.
  dice: [
    {
      id: "robber_die",
      name: "Robber Die",
      icon: "🪙",
      faces: ["enemy_pilfer", "enemy_pilfer", "enemy_bite_1", "blank", "blank", "blank"],
      defaultTarget: "self",
    },
  ],
  selectIntent: () =>
    intent("steal", "Pilfer", "🪙", undefined, "Steals 1 salt if it rolls pilfer."),
  resolveIntent: (_self, state) => {
    const stolen = Math.min(1, state.player.salt);
    if (stolen <= 0) return appendLog(state, "enemy", "The Grave Robber finds nothing to take.");
    return {
      ...state,
      player: { ...state.player, salt: state.player.salt - stolen },
      log: [
        ...state.log,
        { turn: state.turn, source: "enemy", text: `The Grave Robber pilfers ${stolen} salt.` },
      ],
    };
  },
};

/* ── 12. Gutborn Larva ── */

const GUTBORN_LARVA: DiceEnemyDef = {
  id: "gutborn_larva",
  name: "Gutborn Larva",
  icon: "🪱",
  maxHp: 1,
  defaultRow: "front",
  isBoss: false,
  resistances: {},
  vulnerabilities: { fire: 2.0 },
  selectIntent: () =>
    intent("infest", "Infest", "🪱", undefined, "Animates a corpse into a Zombie next turn."),
  resolveIntent: (_self, state) => {
    // Without explicit corpses, the larva acts as a slow summoner.
    return spawnEnemy(state, "zombie");
  },
};

/* ── 13. The Forsworn ── */

const FORSWORN: DiceEnemyDef = {
  id: "forsworn",
  name: "The Forsworn",
  icon: "⚔️",
  maxHp: 22,
  defaultRow: "front",
  isBoss: false,
  resistances: { slash: 0.5, pierce: 0.5 },
  vulnerabilities: { bludgeoning: 1.5, holy: 1.5, fire: 1.5 },
  selectIntent: () =>
    intent("guard_strike", "Guard Strike", "🛡️", 3, "Strikes for 3 and guards allies."),
  redirectDamageTo: (self, state, intendedUid) => {
    if (intendedUid === self.uid) return intendedUid;
    // Redirect any damage targeting allies to the Forsworn.
    const target = state.enemies.find((e) => e.uid === intendedUid);
    if (!target || target.hp <= 0) return intendedUid;
    return self.uid;
  },
};

/* ── 14. The False Sacrarium ── */

const FALSE_SACRARIUM: DiceEnemyDef = {
  id: "false_sacrarium",
  name: "The False Sacrarium",
  icon: "⛪",
  maxHp: 12,
  defaultRow: "back",
  isBoss: false,
  resistances: { slash: 0.5, pierce: 0.5 },
  vulnerabilities: { holy: 1.5, fire: 1.5 },
  selectIntent: () =>
    intent(
      "litany",
      "Putrid Litany",
      "🦠",
      undefined,
      "Adds a forced Brine face to your next pool.",
    ),
  resolveIntent: (self, state) => ({
    ...state,
    player: {
      ...state.player,
      forcedFacesNextTurn: [
        ...state.player.forcedFacesNextTurn,
        { faceId: "dagger_open_vein", sourceUid: self.uid },
      ],
    },
    log: [
      ...state.log,
      {
        turn: state.turn,
        source: "enemy",
        text: `${self.name} chants — a Brine face will be forced into your next pool.`,
      },
    ],
  }),
};

/* ── 15. Salt Revenant ── */

const SALT_REVENANT: DiceEnemyDef = {
  id: "salt_revenant",
  name: "Salt Revenant",
  icon: "💎",
  maxHp: 18,
  defaultRow: "front",
  isBoss: false,
  resistances: { pierce: 0.5 },
  vulnerabilities: { bludgeoning: 1.5 },
  selectIntent: () =>
    intent("grapple", "Salt-Grapple", "💎", 2, "2 damage and locks one of your dice."),
  resolveIntent: (_self, state) => {
    // Lock the most-loaded die: prefer "main" then "ability" then "offhand" then "armor".
    const candidates: DieSlot[] = ["main", "ability", "offhand", "armor"];
    const target = candidates.find((slot) => !state.player.slotLocks.includes(slot));
    if (!target) return state;
    return {
      ...lockSlot(state, target),
      log: [
        ...state.log,
        {
          turn: state.turn,
          source: "enemy",
          text: `Salt Revenant locks your ${target} die — spend an Iron face to break free.`,
        },
      ],
    };
  },
};

/* ── 16. Skeleton Lord (boss) ── */

const SKELETON_LORD: DiceEnemyDef = {
  id: "boss_skeleton_lord",
  name: "Skeleton Lord",
  icon: "💀",
  maxHp: 35,
  defaultRow: "front",
  isBoss: true,
  resistances: { pierce: 0.75 },
  vulnerabilities: { bludgeoning: 1.25, fire: 1.5, holy: 1.5 },
  selectIntent: () => intent("greatsmash", "Bone Cleave", "🦴", 6, "Cleaves for 6."),
  onDeath: (self, state, killingType) => {
    if (killingType === "fire" || killingType === "holy") {
      return appendLog(state, "system", `${self.name} burns to ash. The bones cannot rise.`);
    }
    let s = appendLog(state, "system", `${self.name} shatters into three lesser Skeletons.`);
    for (let i = 0; i < 3; i++) s = spawnEnemy(s, "skeleton", `lord_split_${i}`);
    return s;
  },
};

/* ── 17. Vampire Lord (boss) ── */

const VAMPIRE_LORD: DiceEnemyDef = {
  id: "boss_vampire_lord",
  name: "Vampire Lord",
  icon: "🧛",
  maxHp: 45,
  defaultRow: "front",
  isBoss: true,
  resistances: {},
  vulnerabilities: { fire: 1.25, holy: 1.5 },
  selectIntent: () => intent("drain", "Sanguine Drain", "🩸", 6, "Drains 6 HP from the player."),
  resolveIntent: (self, state) => ({
    ...state,
    enemies: state.enemies.map((e) =>
      e.uid === self.uid ? { ...e, hp: Math.min(e.maxHp, e.hp + 3) } : e,
    ),
    log: [
      ...state.log,
      { turn: state.turn, source: "enemy", text: `${self.name} drinks — heals 3.` },
    ],
  }),
  onPlayerBust: (self, state, poolSize) => {
    const heal = poolSize * 2;
    if (heal <= 0) return state;
    return {
      ...state,
      enemies: state.enemies.map((e) =>
        e.uid === self.uid ? { ...e, hp: Math.min(e.maxHp, e.hp + heal) } : e,
      ),
      log: [
        ...state.log,
        {
          turn: state.turn,
          source: "enemy",
          text: `${self.name} feasts on your bust — heals ${heal}.`,
        },
      ],
    };
  },
  afterDamaged: (self, state) => {
    if (self.thresholdHealUsed) return state;
    if (self.hp / self.maxHp > DICE_BALANCE.VAMPIRE_LORD_HEAL_AT) return state;
    return {
      ...state,
      enemies: state.enemies.map((e) =>
        e.uid === self.uid ? { ...e, hp: e.maxHp, thresholdHealUsed: true } : e,
      ),
      log: [
        ...state.log,
        {
          turn: state.turn,
          source: "enemy",
          text: `${self.name} resurges — fully healed once.`,
        },
      ],
    };
  },
};

/* ── 18. Lich King (boss) ── */

const LICH_KING: DiceEnemyDef = {
  id: "boss_lich",
  name: "The Lich King",
  icon: "☠️",
  maxHp: 55,
  defaultRow: "back",
  isBoss: true,
  resistances: {},
  vulnerabilities: { holy: 1.5, fire: 1.25 },
  selectIntent: (self) => {
    const ratio = self.hp / self.maxHp;
    if (ratio > DICE_BALANCE.LICH_PHASE_2_AT)
      return intent("cold_lamp", "Cold Lamp", "🔮", 5, "5 damage, applies Brand.");
    if (ratio > DICE_BALANCE.LICH_PHASE_3_AT)
      return intent("tithe_mark", "Tithe-Mark", "🩸", 4, "Corrupts a die face on hit.");
    return intent("hymn_break", "Hymn-Break", "🎵", 3, "Echo faces are now bust-immune.");
  },
  resolveIntent: (_self, state, intentRes) => {
    if (intentRes.id === "cold_lamp") {
      return {
        ...state,
        player: {
          ...state.player,
          statuses: {
            ...state.player.statuses,
            weaken: (state.player.statuses.weaken ?? 0) + 1,
          },
        },
      };
    }
    return state;
  },
  onPlayerTurnStart: (self, state) => {
    const ratio = self.hp / self.maxHp;
    let phaseIndex = self.phaseIndex;
    if (ratio <= DICE_BALANCE.LICH_PHASE_3_AT) phaseIndex = 2;
    else if (ratio <= DICE_BALANCE.LICH_PHASE_2_AT) phaseIndex = 1;
    let s: DiceCombatState = state;
    if (phaseIndex !== self.phaseIndex) {
      s = {
        ...s,
        enemies: s.enemies.map((e) => (e.uid === self.uid ? { ...e, phaseIndex } : e)),
      };
      if (phaseIndex === 1) {
        // P2 entry: rewrite two die faces to Coldfire (one-shot, not per-turn).
        const slots: DieSlot[] = ["main", "offhand", "armor", "ability"];
        for (let i = 0; i < 2; i++) {
          s = corruptFace(s, slots[i % slots.length], (i + 1) % 6, "coldfire", self.uid);
        }
        s = appendLog(s, "enemy", "Tithe-Mark — two of your faces are rewritten to Coldfire.");
      }
      if (phaseIndex === 2) {
        s = appendLog(s, "system", "The Hymn rises. Echo faces now ignore the bust check.");
      }
    }
    // P3: re-grant Hymn-Hum every turn while the Lich lives (engine resets it each turn).
    if (phaseIndex === 2) {
      s = { ...s, player: { ...s.player, hymnHumActive: true } };
    }
    return s;
  },
};

/* ── Registry ── */

export const DICE_ENEMY_DEFS: Record<string, DiceEnemyDef> = {
  rat: RAT,
  skeleton: SKELETON,
  heap_of_bones: HEAP_OF_BONES,
  zombie: ZOMBIE,
  ghost: GHOST,
  vampire: VAMPIRE,
  banshee: BANSHEE,
  necromancer: NECROMANCER,
  ghoul: GHOUL,
  shadow: SHADOW,
  grave_robber: GRAVE_ROBBER,
  gutborn_larva: GUTBORN_LARVA,
  forsworn: FORSWORN,
  false_sacrarium: FALSE_SACRARIUM,
  salt_revenant: SALT_REVENANT,
  boss_skeleton_lord: SKELETON_LORD,
  boss_vampire_lord: VAMPIRE_LORD,
  boss_lich: LICH_KING,
};

export function getEnemyDef(id: string): DiceEnemyDef | null {
  return DICE_ENEMY_DEFS[id] ?? null;
}

/* ── Engine helpers re-exported for engine code ── */

export { spawnEnemy, lockSlot, corruptFace };
