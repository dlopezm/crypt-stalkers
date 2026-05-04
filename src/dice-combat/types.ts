import type { DamageType, StatusKey } from "../types";

/* ── Dice + Faces ── */

/** Four slots: main hand, off hand, armor, ability. */
export type DieSlot = "main" | "offhand" | "armor" | "ability";

export type Row = "front" | "back";

/** Seven colors plus the neutral blank. Two faces in the pool sharing a color = bust. */
export type FaceColor =
  | "crimson"
  | "salt"
  | "fire"
  | "coldfire"
  | "brine"
  | "echo"
  | "iron"
  | "blank";

export interface ColorDef {
  readonly id: FaceColor;
  readonly label: string;
  readonly hex: string;
  readonly badge: string;
}

export type FaceTargetKind =
  | "self"
  | "enemy"
  | "any-enemy"
  | "front-enemy"
  | "all-front"
  | "all-enemies"
  | "none";

/* ── v3 symbol grammar ──
 * A face is a color + a bag of symbols + zero or more tags. v2 effect fields
 * remain on FaceDef for backwards compatibility — when both are present, v3
 * symbols are authoritative and v2 fields are ignored. New faces should use
 * `symbols` + `tags` only. */

export type SymbolKey =
  | "sword" // ⚔ 1 damage
  | "shield" // 🛡 1 block (absorb 1 from assigned attack)
  | "heart" // ♥ 1 heal to friendly target
  | "flame" // 🔥 1 fire (+1 vs undead)
  | "drop" // 💧 +1 Bleed
  | "spark" // ✦ +1 Stun (one of target's intents next turn)
  | "crystal" // ◇ +1 Salt
  | "bolt" // ↯ +1 Weaken
  | "sun" // ☼ +1 Bolster
  | "riposte" // ⤺ pre-empt 1 dmg vs an enemy attack, before it resolves
  | "cleanse" // ⟲ remove 1 status
  | "mark" // ⚹ marks target (next dmg symbol on it counts double)
  | "power" // ↑ +1 Power charge (next sword counts +1)
  | "dodge" // ✷ negate one specific incoming attack (assign to attack glyph)
  | "reproduce" // 🐀 enemy-only: spawn a same-kind enemy
  | "steal" // 🪙 enemy-only: steal 1 salt from player
  | "push"; // ⇄ push target to opposite row

export type FaceTag =
  | "ranged" // assignable to back row
  | "area" // also hits two adjacent in target's row
  | "holy" // damage symbols +1 vs undead
  | "heavy" // bludgeoning
  | "silent" // does not count for the bust check
  | "pierce" // damage symbols ignore enemy block
  | "unblockable" // (enemy) shields cannot absorb this attack
  | "undodgeable"; // (enemy) dodge cannot cancel this attack

export interface FaceDef {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly desc: string;
  readonly color: FaceColor;
  readonly target: FaceTargetKind;
  /** v3 symbol bag. When present, this is the authoritative effect spec. */
  readonly symbols?: readonly SymbolKey[];
  /** v3 face tags. Modify reach, area, damage type, etc. */
  readonly tags?: readonly FaceTag[];
  /** v2 fields — retained for legacy faces. Ignored when `symbols` is set. */
  readonly damage?: number;
  readonly damageType?: DamageType;
  readonly heal?: number;
  readonly block?: number;
  readonly applyStatus?: { readonly status: StatusKey; readonly stacks: number };
  readonly cleanseSelf?: number;
  readonly pushOpposite?: boolean;
  readonly grantPower?: number;
  readonly grantDodge?: boolean;
  readonly twoHandedBonus?: boolean;
  readonly gainSalt?: number;
  readonly breakSlotLock?: boolean;
  readonly grantHymnHum?: boolean;
  readonly grantResonance?: boolean;
}

export interface DieDef {
  readonly id: string;
  readonly slot: DieSlot;
  readonly name: string;
  readonly icon: string;
  /** Exactly 6 face IDs, indexed 0..5. */
  readonly faces: readonly [string, string, string, string, string, string];
}

/* ── Push-your-luck pool ── */

/** A face rolled into the player's pool this turn. The pool is the bust check substrate. */
export interface PoolFace {
  /** Stable identity within the turn — used for assignment lookups. */
  readonly poolId: number;
  /** The slot this face came from. */
  readonly slot: DieSlot;
  /** The face id rolled. */
  readonly faceId: string;
  /** The effective color used for the bust check. */
  readonly color: FaceColor;
  /** Forced faces (e.g. False Sacrarium) are added at start-of-turn and cannot be unrolled. */
  readonly forced: boolean;
}

export interface PoolAssignment {
  readonly poolId: number;
  readonly targetUid: string | null;
  readonly resolved: boolean;
}

/* ── Enemy state ── */

export interface DiceEnemyIntent {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly damage?: number;
  readonly tooltip?: string;
}

/* ── v3 enemy dice ── */

/** A 6-faced enemy die. Faces use the same FaceDef grammar as the player's dice.
 * Enemy faces typically point at the player (offensive symbols) or at the enemy
 * itself (defensive symbols). Tags `unblockable`/`undodgeable` can be set per face. */
export interface EnemyDieDef {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  /** Six face IDs (lookup in FACES). */
  readonly faces: readonly [string, string, string, string, string, string];
  /** Where rolled symbols target by default. `self` means defensive (enemy buffs/heals self). */
  readonly defaultTarget: "player" | "self" | "enemy-other";
}

/** Result of an enemy rolling its dice this turn. */
export interface EnemyRolledFace {
  readonly dieId: string;
  readonly faceId: string;
  readonly targetUid: string; // who this face hits (player uid is "player", or own uid for self-buffs)
}

export interface DiceEnemy {
  readonly uid: string;
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly hp: number;
  readonly maxHp: number;
  readonly row: Row;
  readonly statuses: import("../types").Statuses;
  readonly resistances: Partial<Record<DamageType, number>>;
  readonly vulnerabilities: Partial<Record<DamageType, number>>;
  readonly isBoss: boolean;
  readonly intent: DiceEnemyIntent | null;
  readonly untargetable: boolean;
  /** Used by Skeleton: a Heap of Bones that will rise unless smashed/burned. */
  readonly reassembleQueued: boolean;
  /** Heap-of-Bones countdown: turns until it rises into a Skeleton. */
  readonly reassembleCountdown: number;
  /** Number of turns this enemy has been on the field. */
  readonly turnsAlive: number;
  /** Phase index for phased bosses (Lich King, Vampire Lord). */
  readonly phaseIndex: number;
  /** Vampire Lord: has the once-per-fight heal already fired? */
  readonly thresholdHealUsed: boolean;
  /** Mournful Ghost: incorporeal this turn — Crimson damage deals 0. */
  readonly intangible: boolean;
  /** v3: faces this enemy rolled at start of its turn. Visible to player before they roll. */
  readonly rolledFaces: readonly EnemyRolledFace[];
}

/* ── Player state ── */

/** A face from the player's die was rewritten by an enemy effect (Banshee / Lich P2). */
export interface CorruptedFace {
  readonly slot: DieSlot;
  readonly faceIndex: number; // 0..5
  readonly recoloredTo: FaceColor;
  /** Source enemy uid; when that enemy dies, this corruption clears. */
  readonly sourceUid: string;
}

export interface DicePlayer {
  readonly hp: number;
  readonly maxHp: number;
  readonly salt: number;
  readonly block: number;
  readonly statuses: import("../types").Statuses;
  readonly mainWeaponId: string;
  readonly offhandId: string | null;
  readonly armorId: string;
  readonly abilityFaces: readonly [string, string, string, string, string, string];
  /** Buff: next damage face deals +N. */
  readonly powerCharges: number;
  /** Damage faces deal +1 this turn. */
  readonly twoHandedActive: boolean;
  /** Next physical hit negated. */
  readonly dodgeActive: boolean;
  /** Hymn-Hum is active for the current pool's bust check. */
  readonly hymnHumActive: boolean;
  /** One color clash will be forgiven this turn. */
  readonly resonanceCharges: number;
  /** Slots locked by Salt Revenants — cannot be rolled. */
  readonly slotLocks: readonly DieSlot[];
  /** Faces rewritten by Banshee / Lich (visible on the die in the tray). */
  readonly corruptedFaces: readonly CorruptedFace[];
  /** Forced faces injected next turn (e.g. False Sacrarium accrual). */
  readonly forcedFacesNextTurn: readonly { readonly faceId: string; readonly sourceUid: string }[];
}

/* ── Combat state ── */

export type DiceCombatPhase =
  | "rolling"
  | "busted"
  | "assigning"
  | "resolving-player"
  | "resolving-enemies"
  | "victory"
  | "defeat";

export interface DiceCombatLogEntry {
  readonly turn: number;
  readonly text: string;
  readonly source: "player" | "enemy" | "system";
}

/** v3: per-incoming-attack mitigation. Built up as the player drops shield/dodge/riposte
 * symbols onto specific enemy attack glyphs during the assigning phase. Consulted by
 * resolveEnemyIntents at attack-resolution time. Key = `${enemyUid}:${rolledFaceIndex}`. */
export interface AttackMitigation {
  readonly block: number;
  readonly dodge: boolean;
  readonly riposteDamage: number;
}

/** v3: stepped enemy resolution — the engine produces a queue and the UI walks
 * through it one entry per beat so the player can read what each enemy does. */
export interface EnemyQueueEntry {
  readonly uid: string;
  /** Index into the enemy's rolledFaces. null = legacy fixed-intent attack. */
  readonly faceIndex: number | null;
}

export interface DiceCombatState {
  readonly player: DicePlayer;
  readonly enemies: readonly DiceEnemy[];
  /** Current rolled pool — bust check runs on this. */
  readonly pool: readonly PoolFace[];
  /** Assignments for the current pool, keyed by PoolFace.poolId. */
  readonly assignments: Readonly<Record<number, PoolAssignment>>;
  /** Monotonic counter for PoolFace.poolId. */
  readonly nextPoolId: number;
  readonly turn: number;
  readonly phase: DiceCombatPhase;
  readonly log: readonly DiceCombatLogEntry[];
  readonly rng: number;
  /** v3: defensive assignments. Keyed by `${enemyUid}:${rolledFaceIndex}`. */
  readonly attackMitigations: Readonly<Record<string, AttackMitigation>>;
  /** v3: pending enemy attack queue, processed one entry at a time. */
  readonly enemyQueue: readonly EnemyQueueEntry[];
  /** v3: the entry just resolved (for UI flash). */
  readonly lastEnemyAction: EnemyQueueEntry | null;
}

/* ── Init params ── */

export interface DiceLoadout {
  readonly mainWeaponId: string;
  readonly offhandId: string | null;
  readonly armorId: string;
  readonly abilityFaces: readonly [string, string, string, string, string, string];
}

export interface DiceCombatInit {
  readonly loadout: DiceLoadout;
  readonly startingHp: number;
  readonly startingMaxHp: number;
  readonly startingSalt: number;
  readonly enemies: readonly { readonly id: string; readonly uid: string }[];
  readonly seed?: number;
}

/* ── Enemy defs ── */

export interface DiceEnemyDef {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly maxHp: number;
  readonly defaultRow: Row;
  readonly isBoss: boolean;
  readonly resistances: Partial<Record<DamageType, number>>;
  readonly vulnerabilities: Partial<Record<DamageType, number>>;
  /** v3: enemy dice. When present, the engine rolls these instead of calling selectIntent. */
  readonly dice?: readonly EnemyDieDef[];
  readonly selectIntent: (self: DiceEnemy, state: DiceCombatState) => DiceEnemyIntent | null;
  readonly resolveIntent?: (
    self: DiceEnemy,
    state: DiceCombatState,
    intent: DiceEnemyIntent,
  ) => DiceCombatState;
  readonly onDeath?: (
    self: DiceEnemy,
    state: DiceCombatState,
    killingDamageType: DamageType | null,
  ) => DiceCombatState;
  /** Hook: called once when this enemy enters the battle (initial spawn or summon). */
  readonly onSpawn?: (self: DiceEnemy, state: DiceCombatState) => DiceCombatState;
  /** Hook: called at the start of every player turn. Used for passive auras and start-of-turn effects. */
  readonly onPlayerTurnStart?: (self: DiceEnemy, state: DiceCombatState) => DiceCombatState;
  /** Hook: called when the player busts. Used by Blood Wraith heal-on-bust. */
  readonly onPlayerBust?: (
    self: DiceEnemy,
    state: DiceCombatState,
    poolSize: number,
  ) => DiceCombatState;
  /** Hook: damage that would land on another enemy is offered to this one first (bodyguard). Returns the actual target uid. */
  readonly redirectDamageTo?: (
    self: DiceEnemy,
    state: DiceCombatState,
    intendedUid: string,
  ) => string;
  /** Hook: incoming damage is computed; this lets the enemy modify it (Ghost intangibility). */
  readonly modifyIncomingDamage?: (
    self: DiceEnemy,
    state: DiceCombatState,
    base: number,
    damageType: DamageType,
  ) => number;
  /** Hook: after taking damage, may queue follow-ups (Vampire Lord threshold heal). */
  readonly afterDamaged?: (self: DiceEnemy, state: DiceCombatState) => DiceCombatState;
}
