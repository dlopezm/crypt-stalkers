import type { IconProps } from "../icons";

/* ── Dice + Faces ── */

/** Four slots: main hand, off hand, armor, ability. */
export type DieSlot = "main" | "offhand" | "armor" | "ability";

export type Row = "front" | "back";

/** Seven colors plus blank (no effect, but contributes to bust) and colorless (never busts). */
export type FaceColor =
  | "crimson"
  | "salt"
  | "fire"
  | "coldfire"
  | "brine"
  | "echo"
  | "iron"
  | "blank"
  | "colorless";

export interface ColorDef {
  readonly id: FaceColor;
  readonly label: string;
  readonly hex: string;
  readonly badge: string;
}

export type FaceTargetKind =
  | "self"
  | "any-enemy"
  | "front-enemy"
  | "all-front"
  | "all-enemies"
  | "none";

/* ── Symbol grammar ──
 * A face is a color + a bag of symbols. All effects are expressed as symbols. */

export type SymbolKey =
  | "self_damage" // ☠ deal 1 damage to yourself (injected by poison)
  | "poison" // ☠ apply 1 poison stack to the player (enemy-only)
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
  | "push" // ⇄ push target to opposite row
  | "reform" // 🦴 heap-only: immediately convert self into a Skeleton
  | "intangible" // 👻 become intangible this turn — immune to physical damage (TODO: need a way for fire/holy to bypass this)
  | "hide" // 🫥 enemy-only: become hidden this turn — untargetable, enables sneak attack
  | "summon" // ⚰️ necromancer: animate a Heap → Skeleton, or spawn a Zombie
  | "invert" // 🦠 false-sacrarium: player's most-rolled color counts as Brine next turn
  | "bind" // ⛓️ salt-revenant: lock one of the player's die slots
  | "burrow_spawn" // 🪱 larva: surface and spawn a Zombie
  // ── Face modifiers (apply to the whole face, not stackable) ──
  | "ranged" // 🏹 face can target / be used from back row
  | "area" // ⤧ also hits enemies adjacent to the primary target
  | "holy" // ✝ damage symbols deal +1 vs undead
  | "pierce" // ↣ damage symbols ignore enemy warded/block
  | "unblockable" // enemy face: shields cannot absorb
  | "undodgeable" // enemy face: dodge cannot cancel
  // ── Player buff symbols (grant a turn state) ──
  | "resonance" // ◎ next color clash is forgiven
  | "hymn_hum" // 🎵 Echo faces act as wildcards during bust checks this turn
  | "armor_break" // ⚒ permanently reduce target's warded by 1
  | "bleed_burst" // 💥 consume all target Bleed stacks, deal as burst damage (or apply Bleed if none)
  | "drag" // ✋ applies Dragged status — target's dodge disabled next turn
  | "sneak_attack" // 🗡 only resolves if attacker is hidden; enables full symbol bag
  | "taunt" // 🛡 applies Taunt — while active, redirects damage from other enemies to this one
  | "focus"; // ◎ +1 Focus: next roll lets you choose the face

export interface FaceDef {
  readonly id: string;
  readonly label: string;
  readonly icon: React.FC<IconProps>;
  readonly color: FaceColor;
  readonly target: FaceTargetKind;
  readonly symbols?: readonly SymbolKey[];
}

export interface DieDef {
  readonly id: string;
  readonly slot: DieSlot;
  readonly name: string;
  readonly icon: React.FC<IconProps>;
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
  /** Stunned faces still count for the bust check but their symbols do nothing. */
  readonly stunned?: boolean;
  /** Face was chosen by the player via Focus rather than rolled randomly. */
  readonly focused?: boolean;
}

export interface PoolAssignment {
  readonly poolId: number;
  readonly targetUid: string | null;
  readonly resolved: boolean;
}

/* ── Enemy state ── */

/* ── Enemy dice ── */

/** A 6-faced enemy die. Faces use the same FaceDef grammar as the player's dice.
 * Enemy faces typically point at the player (offensive symbols) or at the enemy
 * itself (defensive symbols). Tags `unblockable`/`undodgeable` can be set per face. */
export interface EnemyDieDef {
  readonly id: string;
  readonly name: string;
  readonly icon: React.FC<IconProps>;
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
  readonly focused?: boolean;
}

export interface DiceEnemy {
  readonly uid: string;
  readonly id: string;
  readonly name: string;
  readonly icon: React.FC<IconProps>;
  readonly hp: number;
  readonly maxHp: number;
  readonly row: Row;
  readonly statuses: import("../types").Statuses;
  readonly isBoss: boolean;
  readonly untargetable: boolean;
  /** Phase index for phased bosses (Lich King, Vampire Lord). */
  readonly phaseIndex: number;
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
  /** Faces corrupted by poison — each entry adds a self_damage symbol when that face resolves. */
  readonly poisonedFaces: readonly { readonly slot: DieSlot; readonly faceIndex: number }[];
  /** False Sacrarium: the color that counts as Brine for bust purposes this turn. */
  readonly invertedColor: FaceColor | null;
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
  readonly icon: React.FC<IconProps>;
  readonly maxHp: number;
  readonly defaultRow: Row;
  readonly isBoss: boolean;
  readonly dice?: readonly EnemyDieDef[];
  /** Phase-switched dice (e.g. Lich King). Index matches DiceEnemy.phaseIndex; falls back to dice. */
  readonly phaseDice?: readonly (readonly EnemyDieDef[])[];
  readonly onDeath?: (self: DiceEnemy, state: DiceCombatState) => DiceCombatState;
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
}
