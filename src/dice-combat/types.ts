import type { DamageType } from "../types";

/* ── Dice + Faces ── */

export type DieSlot = "body" | "main" | "offhand" | "armor" | "soul";

export type Row = "front" | "back";

/** What a single face does when assigned. A face is a small bag of effects.
 * Each face must specify a target kind that constrains assignment. */
export type FaceTargetKind =
  | "self"
  | "enemy"
  | "any-enemy"
  | "front-enemy"
  | "all-front"
  | "all-enemies"
  | "none";

export interface FaceDef {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly desc: string;
  readonly target: FaceTargetKind;
  readonly damage?: number;
  readonly damageType?: DamageType;
  readonly ignoresBlock?: boolean;
  readonly heal?: number;
  readonly block?: number;
  readonly applyStatus?: { readonly status: import("../types").StatusKey; readonly stacks: number };
  readonly cleanseSelf?: number;
  readonly bonusReroll?: number;
  /** Push the targeted enemy to the opposite row. */
  readonly pushOpposite?: boolean;
  /** Self-buff: the next damage face this turn deals +N. */
  readonly grantPower?: number;
  /** Self-buff: the next physical hit on the player is negated. */
  readonly grantDodge?: boolean;
  /** Self-buff: damage faces deal +1 for the rest of this turn. */
  readonly twoHandedBonus?: boolean;
  /** Salt currency gain. */
  readonly gainSalt?: number;
}

export interface DieDef {
  readonly id: string;
  readonly slot: DieSlot;
  readonly name: string;
  readonly icon: string;
  /** Exactly 6 face IDs, indexed 0..5. The roll value is the index. */
  readonly faces: readonly [string, string, string, string, string, string];
}

/* ── Roll + Assignment ── */

export interface DieInstance {
  readonly slot: DieSlot;
  readonly dieId: string;
  /** Index 0..5 into the die's faces; -1 means unrolled. */
  readonly faceIndex: number;
  readonly locked: boolean;
  /** True when an enemy effect (e.g., Salt Revenant grapple) prevents this die from being used or re-rolled. */
  readonly grappled: boolean;
  /** True when a Shadow drains this die out of the pool for one turn. */
  readonly suppressed: boolean;
}

export interface FaceAssignment {
  /** Which die slot this assignment is for. */
  readonly slot: DieSlot;
  /** UID of the enemy target if the face needs one; otherwise null. */
  readonly targetUid: string | null;
  /** True after the face has been resolved this turn. */
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
  /** Currently telegraphed intent (resolved at end of player's turn). */
  readonly intent: DiceEnemyIntent | null;
  /** True when an enemy ability (Ghoul ambush, Vampire Mist Form) makes it untargetable this turn. */
  readonly untargetable: boolean;
  /** Used by Skeleton: if killed by non-bludgeoning, reassemble next turn. */
  readonly reassembleQueued: boolean;
  /** Turn count for hatching/timed enemies. */
  readonly turnsAlive: number;
}

/* ── Player state ── */

export interface DicePlayer {
  readonly hp: number;
  readonly maxHp: number;
  readonly salt: number;
  readonly block: number;
  /** Statuses on the player. */
  readonly statuses: import("../types").Statuses;
  readonly mainWeaponId: string;
  readonly offhandId: string | null;
  readonly armorId: string;
  readonly soulFaces: readonly [string, string, string, string, string, string];
  /** Re-rolls remaining this turn. */
  readonly rerollsLeft: number;
  /** Power stack from a Wind-Up or Aim — adds N to next damage face this turn. Consumed on first damage face. */
  readonly powerCharges: number;
  /** Two-handed bonus: damage faces deal +1 this turn while active. */
  readonly twoHandedActive: boolean;
  /** Dodge: next physical hit negated. */
  readonly dodgeActive: boolean;
  /** Number of re-rolls Banshee will steal next turn. */
  readonly rerollDebt: number;
  /** Bonus re-rolls accrued from Focus faces this turn — applied to next turn. */
  readonly bonusRerollsNextTurn: number;
  /** Number of dice Shadow will suppress next turn. */
  readonly suppressDebt: number;
}

/* ── Combat state ── */

export type DiceCombatPhase =
  | "rolling"
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

export interface DiceCombatState {
  readonly player: DicePlayer;
  readonly enemies: readonly DiceEnemy[];
  readonly dice: readonly DieInstance[];
  /** Assignments for the current turn — one per die, indexed by slot. Empty before assignment phase. */
  readonly assignments: Partial<Record<DieSlot, FaceAssignment>>;
  readonly turn: number;
  readonly phase: DiceCombatPhase;
  readonly log: readonly DiceCombatLogEntry[];
  /** Deterministic RNG seed for tests. */
  readonly rng: number;
}

/* ── Init params ── */

export interface DiceLoadout {
  readonly mainWeaponId: string;
  readonly offhandId: string | null;
  readonly armorId: string;
  readonly soulFaces: readonly [string, string, string, string, string, string];
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
  /** Choose this enemy's next intent given the current state. */
  readonly selectIntent: (self: DiceEnemy, state: DiceCombatState) => DiceEnemyIntent | null;
  /** Optional behavior when this enemy resolves its intent. Returns updated state. */
  readonly resolveIntent?: (
    self: DiceEnemy,
    state: DiceCombatState,
    intent: DiceEnemyIntent,
  ) => DiceCombatState;
  /** Optional hook called when this enemy is killed. Returns updated state. */
  readonly onDeath?: (
    self: DiceEnemy,
    state: DiceCombatState,
    killingDamageType: DamageType | null,
  ) => DiceCombatState;
}
