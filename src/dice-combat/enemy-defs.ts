import type { DiceEnemy, DiceEnemyDef, DiceEnemyIntent } from "./types";

/* ── Helpers shared across enemy defs ── */

function intent(
  id: string,
  label: string,
  icon: string,
  damage?: number,
  tooltip?: string,
): DiceEnemyIntent {
  return { id, label, icon, damage, tooltip };
}

/* ── Definitions ── */

const RAT: DiceEnemyDef = {
  id: "rat",
  name: "Ravager Rat",
  icon: "\u{1F400}",
  maxHp: 2,
  defaultRow: "front",
  isBoss: false,
  resistances: {},
  vulnerabilities: {},
  selectIntent: () => intent("bite", "Bite", "\u{1F9B7}", 1, "Bites for 1 damage."),
};

const SKELETON: DiceEnemyDef = {
  id: "skeleton",
  name: "Skeleton",
  icon: "\u{1F480}",
  maxHp: 16,
  defaultRow: "front",
  isBoss: false,
  resistances: { pierce: 0.5 },
  vulnerabilities: { bludgeoning: 1.5 },
  selectIntent: () => intent("bash", "Bash", "\u{1F9B4}", 4, "Strikes for 4 damage."),
  /** Killed by anything other than bludgeoning → reassemble next turn at half HP. */
  onDeath: (self, state, killingDamageType) => {
    if (killingDamageType === "bludgeoning") return state;
    // Mark a corpse as queued-for-reassembly. We do this by re-adding the enemy
    // with reassembleQueued=true so end-of-turn can revive it at half HP.
    const reassembled: DiceEnemy = {
      ...self,
      hp: 0,
      reassembleQueued: true,
      untargetable: true,
      intent: null,
    };
    return {
      ...state,
      enemies: [...state.enemies, reassembled],
      log: [
        ...state.log,
        {
          turn: state.turn,
          source: "system",
          text: `${self.name}'s bones twitch — it will reassemble next turn unless crushed.`,
        },
      ],
    };
  },
};

const ZOMBIE: DiceEnemyDef = {
  id: "zombie",
  name: "Rotting Zombie",
  icon: "\u{1F9DF}",
  maxHp: 8,
  defaultRow: "front",
  isBoss: false,
  resistances: {},
  vulnerabilities: {},
  selectIntent: (_self, state) => {
    const necroAlive = state.enemies.some((e) => e.id === "necromancer" && e.hp > 0);
    const damage = necroAlive ? 4 : 2;
    return intent(
      "shamble",
      necroAlive ? "Commanded Strike" : "Shamble",
      "\u{1F9DF}",
      damage,
      necroAlive ? "Empowered by the Necromancer." : "Slow but heavy hit.",
    );
  },
};

const NECROMANCER: DiceEnemyDef = {
  id: "necromancer",
  name: "Necromancer",
  icon: "\u{1F9D9}",
  maxHp: 8,
  defaultRow: "back",
  isBoss: false,
  resistances: {},
  vulnerabilities: {},
  selectIntent: () => intent("raise", "Raise Dead", "⚰️", undefined, "Summons a zombie next turn."),
  resolveIntent: (_self, state) => {
    const newZombie: DiceEnemy = {
      uid: `zombie_${state.turn}_${Math.floor(state.rng * 1e6)}`,
      id: "zombie",
      name: ZOMBIE.name,
      icon: ZOMBIE.icon,
      hp: ZOMBIE.maxHp,
      maxHp: ZOMBIE.maxHp,
      row: "front",
      statuses: {},
      resistances: ZOMBIE.resistances,
      vulnerabilities: ZOMBIE.vulnerabilities,
      isBoss: false,
      intent: null,
      untargetable: false,
      reassembleQueued: false,
      turnsAlive: 0,
    };
    return {
      ...state,
      enemies: [...state.enemies, newZombie],
      log: [
        ...state.log,
        { turn: state.turn, source: "enemy", text: "The Necromancer raises a fresh zombie." },
      ],
    };
  },
};

const BANSHEE: DiceEnemyDef = {
  id: "banshee",
  name: "Wailing Banshee",
  icon: "\u{1F441}️",
  maxHp: 12,
  defaultRow: "back",
  isBoss: false,
  resistances: {},
  vulnerabilities: {},
  selectIntent: () =>
    intent("howl", "Howl", "\u{1F4E2}", undefined, "Steals 1 re-roll from your next turn."),
  resolveIntent: (_self, state) => ({
    ...state,
    player: {
      ...state.player,
      rerollDebt: state.player.rerollDebt + 1,
    },
    log: [
      ...state.log,
      {
        turn: state.turn,
        source: "enemy",
        text: "The Banshee howls — you'll have one fewer re-roll next turn.",
      },
    ],
  }),
};

/* ── Registry ── */

export const DICE_ENEMY_DEFS: Record<string, DiceEnemyDef> = {
  rat: RAT,
  skeleton: SKELETON,
  zombie: ZOMBIE,
  necromancer: NECROMANCER,
  banshee: BANSHEE,
};

export function getEnemyDef(id: string): DiceEnemyDef | null {
  return DICE_ENEMY_DEFS[id] ?? null;
}
