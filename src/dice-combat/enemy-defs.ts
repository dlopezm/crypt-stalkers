import type { DiceCombatState, DiceEnemy, DiceEnemyDef, DieSlot, FaceColor } from "./types";
import { DICE_BALANCE } from "./balance";

/* ── Helpers ── */

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
    isBoss: def.isBoss,
    untargetable: false,
    phaseIndex: 0,
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
  maxHp: 1,
  defaultRow: "front",
  isBoss: false,
  dice: [
    {
      id: "rat_die",
      name: "Rat",
      icon: "🐀",
      faces: [
        "enemy_rat_strike",
        "enemy_rat_strike",
        "enemy_rat_strike",
        "enemy_reproduce",
        "enemy_rat_dodge",
        "blank",
      ],
      defaultTarget: "player",
    },
  ],
};

/* ── 2. Skeleton ── */

const SKELETON: DiceEnemyDef = {
  id: "skeleton",
  name: "Skeleton",
  icon: "💀",
  maxHp: 4,
  defaultRow: "front",
  isBoss: false,
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
  onDeath: (self, state) => {
    const heap: DiceEnemy = {
      ...self,
      hp: 2,
      maxHp: 2,
      untargetable: false,
      rolledFaces: [],
      id: "heap_of_bones",
      name: "Heap of Bones",
      icon: "🦴",
    };
    return {
      ...state,
      enemies: [...state.enemies, heap],
      log: [
        ...state.log,
        {
          turn: state.turn,
          source: "system",
          text: `${self.name} collapses into a Heap of Bones — it may yet reform.`,
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
  maxHp: 1,
  defaultRow: "front",
  isBoss: false,
  dice: [
    {
      id: "reform_die",
      name: "Reform Die",
      icon: "🦴",
      faces: ["enemy_reform", "enemy_reform", "enemy_reform", "blank", "blank", "blank"],
      defaultTarget: "self",
    },
  ],
};

/* ── 4. Rotting Zombie ── */

const ZOMBIE: DiceEnemyDef = {
  id: "zombie",
  name: "Rotting Zombie",
  icon: "🧟",
  maxHp: 3,
  defaultRow: "front",
  isBoss: false,
  dice: [
    {
      id: "zombie_die",
      name: "Zombie Die",
      icon: "🧟",
      faces: ["enemy_zombie_slam", "enemy_zombie_lurch", "blank", "blank", "blank", "blank"],
      defaultTarget: "player",
    },
  ],
};

/* ── 5. Mournful Ghost ── */

const GHOST: DiceEnemyDef = {
  id: "ghost",
  name: "Mournful Ghost",
  icon: "👻",
  maxHp: 3,
  defaultRow: "front",
  isBoss: false,
  // v3: phantom strikes that bypass shields. Second die gives 50% chance of intangibility.
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
    {
      id: "intangible_die",
      name: "Intangible Die",
      icon: "👻",
      faces: [
        "enemy_intangible",
        "enemy_intangible",
        "enemy_intangible",
        "blank",
        "blank",
        "blank",
      ],
      defaultTarget: "self",
    },
  ],
};

/* ── 6. Blood Wraith ── */

const VAMPIRE: DiceEnemyDef = {
  id: "vampire",
  name: "Blood Wraith",
  icon: "🧛",
  maxHp: 4,
  defaultRow: "front",
  isBoss: false,
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
  maxHp: 4,
  defaultRow: "back",
  isBoss: false,
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
  maxHp: 2,
  defaultRow: "back",
  isBoss: false,
  dice: [
    {
      id: "necro_die",
      name: "Necromancer Die",
      icon: "🧙",
      faces: [
        "enemy_necro_summon",
        "enemy_necro_summon",
        "enemy_necro_focus",
        "enemy_necro_focus",
        "enemy_necro_bolt",
        "enemy_necro_bolt",
      ],
      defaultTarget: "player",
    },
  ],
};

/* ── 9. Lurking Ghoul ── */

const GHOUL: DiceEnemyDef = {
  id: "ghoul",
  name: "Lurking Ghoul",
  icon: "👹",
  maxHp: 4,
  defaultRow: "front",
  isBoss: false,
  dice: [
    {
      id: "ghoul_stealth_die",
      name: "Stealth Die",
      icon: "🌑",
      faces: [
        "enemy_ghoul_hide",
        "enemy_ghoul_hide",
        "enemy_ghoul_hide",
        "enemy_ghoul_dodge",
        "enemy_ghoul_parry",
        "blank",
      ],
      defaultTarget: "self",
    },
    {
      id: "ghoul_attack_die",
      name: "Attack Die",
      icon: "👹",
      faces: [
        "enemy_ghoul_sneak_attack",
        "enemy_ghoul_sneak_attack",
        "enemy_ghoul_claw",
        "enemy_ghoul_claw",
        "enemy_ghoul_bite",
        "enemy_ghoul_bite",
      ],
      defaultTarget: "player",
    },
  ],
};

/* ── 10. The Shadow ── */

const SHADOW: DiceEnemyDef = {
  id: "shadow",
  name: "The Shadow",
  icon: "🌑",
  maxHp: 3,
  defaultRow: "front",
  isBoss: false,
  // v3: shadow strikes are unblockable.
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
};

/* ── 11. Grave Robber ── */

const GRAVE_ROBBER: DiceEnemyDef = {
  id: "grave_robber",
  name: "Grave Robber",
  icon: "🕵️",
  maxHp: 4,
  defaultRow: "front",
  isBoss: false,
  dice: [
    {
      id: "robber_die",
      name: "Robber Die",
      icon: "🪙",
      faces: ["enemy_pilfer", "enemy_pilfer", "enemy_bite_1", "blank", "blank", "blank"],
      defaultTarget: "self",
    },
  ],
};

/* ── 12. Gutborn Larva ── */

const GUTBORN_LARVA: DiceEnemyDef = {
  id: "gutborn_larva",
  name: "Gutborn Larva",
  icon: "🪱",
  maxHp: 1,
  defaultRow: "back", // starts untargetable by melee — different from Rat (front row, area kill)
  isBoss: false,
  dice: [
    {
      id: "larva_die",
      name: "Larva Die",
      icon: "🪱",
      faces: [
        "enemy_burrow",
        "enemy_burrow",
        "enemy_burrow",
        "enemy_burrow",
        "enemy_burrow",
        "enemy_burrow",
      ],
      defaultTarget: "self",
    },
  ],
  onSpawn: (self, state) => ({
    ...state,
    enemies: state.enemies.map((e) =>
      e.uid === self.uid ? { ...e, row: "back" as const, untargetable: true } : e,
    ),
  }),
};

/* ── 13. The Forsworn ── */

const FORSWORN: DiceEnemyDef = {
  id: "forsworn",
  name: "The Forsworn",
  icon: "⚔️",
  maxHp: 6,
  defaultRow: "front",
  isBoss: false,
  dice: [
    {
      id: "forsworn_die",
      name: "Forsworn Die",
      icon: "⚔️",
      faces: [
        "enemy_guard_strike",
        "enemy_guard_strike",
        "enemy_guard_taunt",
        "enemy_guard_taunt",
        "enemy_crush",
        "blank",
      ],
      defaultTarget: "player",
    },
  ],
};

/* ── 14. The False Sacrarium ── */

const FALSE_SACRARIUM: DiceEnemyDef = {
  id: "false_sacrarium",
  name: "The False Sacrarium",
  icon: "⛪",
  maxHp: 5,
  defaultRow: "back",
  isBoss: false,
  dice: [
    {
      id: "sacrarium_die",
      name: "Litany Die",
      icon: "⛪",
      faces: [
        "enemy_litany",
        "enemy_litany",
        "enemy_litany",
        "enemy_litany",
        "enemy_chant",
        "blank",
      ],
      defaultTarget: "self",
    },
  ],
};

/* ── 15. Salt Revenant ── */

const SALT_REVENANT: DiceEnemyDef = {
  id: "salt_revenant",
  name: "Salt Revenant",
  icon: "💎",
  maxHp: 6,
  defaultRow: "front",
  isBoss: false,
  dice: [
    {
      id: "revenant_die",
      name: "Revenant Die",
      icon: "💎",
      faces: [
        "enemy_salt_grapple",
        "enemy_salt_grapple",
        "enemy_salt_grapple",
        "enemy_bind",
        "enemy_crush",
        "blank",
      ],
      defaultTarget: "player",
    },
  ],
};

/* ── 16. Skeleton Lord (boss) ── */

const SKELETON_LORD: DiceEnemyDef = {
  id: "boss_skeleton_lord",
  name: "Skeleton Lord",
  icon: "💀",
  maxHp: 10,
  defaultRow: "front",
  isBoss: true,
  dice: [
    {
      id: "lord_die",
      name: "Lord Die",
      icon: "💀",
      faces: [
        "enemy_bone_cleave_boss",
        "enemy_bone_cleave_boss",
        "enemy_great_cleave",
        "enemy_crush",
        "enemy_armor_2",
        "blank",
      ],
      defaultTarget: "player",
    },
  ],
  onDeath: (self, state) => {
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
  maxHp: 15,
  defaultRow: "front",
  isBoss: true,
  dice: [
    {
      id: "vlord_die",
      name: "Blood Die",
      icon: "🧛",
      faces: [
        "enemy_sanguine_drain",
        "enemy_sanguine_drain",
        "enemy_drain_heavy",
        "enemy_drain",
        "enemy_chant",
        "blank",
      ],
      defaultTarget: "player",
    },
  ],
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
};

/* ── 18. Lich King (boss) ── */

const LICH_KING: DiceEnemyDef = {
  id: "boss_lich",
  name: "The Lich King",
  icon: "☠️",
  maxHp: 8,
  defaultRow: "back",
  isBoss: true,
  // Phase 0 (>67% HP): Cold Lamp die — unblockable + Weaken.
  // Phase 1 (34-67%): Tithe-Mark die — damage + Mark.
  // Phase 2 (<34%): Hymn-Break die — unblockable hits while granting Hymn-Hum.
  phaseDice: [
    [
      {
        id: "lich_p1_die",
        name: "Cold Lamp",
        icon: "🔮",
        faces: [
          "enemy_lich_cold_lamp",
          "enemy_lich_cold_lamp",
          "enemy_cold_lamp",
          "enemy_brand",
          "enemy_chant",
          "blank",
        ],
        defaultTarget: "player",
      },
    ],
    [
      {
        id: "lich_p2_die",
        name: "Tithe-Mark",
        icon: "🩸",
        faces: [
          "enemy_lich_tithe_mark",
          "enemy_lich_tithe_mark",
          "enemy_brand",
          "enemy_cold_lamp",
          "enemy_chant",
          "blank",
        ],
        defaultTarget: "player",
      },
    ],
    [
      {
        id: "lich_p3_die",
        name: "Hymn-Break",
        icon: "🎵",
        faces: [
          "enemy_lich_hymn_break",
          "enemy_lich_hymn_break",
          "enemy_echo_lance",
          "enemy_brand",
          "enemy_cold_lamp",
          "blank",
        ],
        defaultTarget: "player",
      },
    ],
  ],
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
