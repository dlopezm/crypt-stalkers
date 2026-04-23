import type { DamageType } from "../types";

export type Distance = number;

export interface Reach {
  readonly min: Distance;
  readonly max: Distance;
}

export type CardCombatConditionKey =
  | "poisoned"
  | "burning"
  | "stunned"
  | "immobilized"
  | "slowed"
  | "silenced"
  | "hidden"
  | "marked"
  | "bleeding"
  | "dimmed"
  | "cursed"
  | "hungered"
  | "unaware";

export type CardConditions = Partial<Record<CardCombatConditionKey, number>>;

export type CardSource = "universal" | "weapon" | "offhand" | "armor" | "bag" | "salt_rite";

export type TargetKind = "self" | "enemy" | "none";

export interface CardConditionApply {
  readonly condition: CardCombatConditionKey;
  readonly stacks: number;
  readonly target: "self" | "enemy";
}

export type CardSpecial =
  | { readonly type: "heal"; readonly amount: number }
  | { readonly type: "cleanse_conditions" }
  | { readonly type: "damage_reduction"; readonly amount: number }
  | { readonly type: "armor_this_turn"; readonly amount: number }
  | { readonly type: "negate_hit" }
  | { readonly type: "riposte"; readonly damage: number }
  | {
      readonly type: "overwatch";
      readonly damage: number;
      readonly triggerBelowDistance: number;
    }
  | { readonly type: "close_distance"; readonly amount: number }
  | { readonly type: "retreat"; readonly amount: number }
  | { readonly type: "push_enemy"; readonly amount: number }
  | { readonly type: "draw_cards"; readonly amount: number }
  | { readonly type: "hide_self"; readonly stacks: number }
  | { readonly type: "consume_corpse" }
  | { readonly type: "disarm_telegraph" }
  | { readonly type: "requires_helpless" }
  | { readonly type: "requires_hidden_self" }
  | { readonly type: "end_turn_draw_next_turn"; readonly bonusStamina: number }
  | { readonly type: "aoe_adjacent_distance" }
  | { readonly type: "salt_rite"; readonly saltCost: number }
  | { readonly type: "gain_salt"; readonly amount: number };

export interface CardDef {
  readonly id: string;
  readonly name: string;
  readonly desc: string;
  readonly icon: string;
  readonly stamina: number;
  readonly reach: Reach | "self";
  readonly targetKind: TargetKind;
  readonly damage: number;
  readonly damageType: DamageType | null;
  readonly conditions: readonly CardConditionApply[];
  readonly special: readonly CardSpecial[];
  readonly source: CardSource;
}

export type EnemyIntentKind = "attack" | "move_close" | "move_retreat" | "buff" | "summon" | "wait";

export interface EnemyIntent {
  readonly abilityId: string;
  readonly label: string;
  readonly icon: string;
  readonly kind: EnemyIntentKind;
  readonly resolveInTurns: number;
  readonly projectedDistance?: number;
}

export type EnemyPassiveKey =
  | "swarm_bonus"
  | "reform_on_non_bludgeoning"
  | "incorporeal"
  | "lifesteal"
  | "dark_empowered"
  | "ever_growing"
  | "bound_to_salt"
  | "perjured_aura"
  | "pack_tactics"
  | "phylactery_shield"
  | "shield_while_minions"
  | "fleeing"
  | "feast_on_corpse"
  | "hidden_in_dark";

export interface EnemyPassive {
  readonly key: EnemyPassiveKey;
  readonly value?: number;
}

export interface CardCombatEnemy {
  readonly uid: string;
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly hp: number;
  readonly maxHp: number;
  readonly distance: Distance;
  readonly conditions: CardConditions;
  readonly armor: number;
  readonly resistances: Partial<Record<DamageType, number>>;
  readonly vulnerabilities: Partial<Record<DamageType, number>>;
  readonly passives: readonly EnemyPassive[];
  readonly intents: readonly EnemyIntent[];
  readonly telegraphIndex: number;
  readonly isBoss: boolean;
}

export interface CardCombatPlayerReactions {
  readonly ripostePending: number;
  readonly overwatch: { readonly damage: number; readonly triggerBelowDistance: number } | null;
  readonly negateNextHit: boolean;
}

export interface CardCombatPlayer {
  readonly hp: number;
  readonly maxHp: number;
  readonly stamina: number;
  readonly maxStamina: number;
  readonly salt: number;
  readonly armor: number;
  readonly armorThisTurn: number;
  readonly conditions: CardConditions;
  readonly weaponId: string;
  readonly offhandId: string | null;
  readonly armorId: string;
  readonly deck: readonly string[];
  readonly hand: readonly string[];
  readonly discard: readonly string[];
  readonly exhausted: readonly string[];
  readonly bag: readonly string[];
  readonly reactions: CardCombatPlayerReactions;
  readonly holdBreathUsed: boolean;
}

export interface Corpse {
  readonly enemyId: string;
  readonly distance: Distance;
  readonly ageTurns: number;
}

export type CardCombatPhase = "planning" | "resolving" | "victory" | "defeat";

export interface CardCombatLogEntry {
  readonly turn: number;
  readonly text: string;
  readonly source: "player" | "enemy" | "system";
}

export interface CardCombatState {
  readonly player: CardCombatPlayer;
  readonly enemies: readonly CardCombatEnemy[];
  readonly corpses: readonly Corpse[];
  readonly turn: number;
  readonly phase: CardCombatPhase;
  readonly log: readonly CardCombatLogEntry[];
  readonly rng: number;
}

export interface WeaponDef {
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
  readonly icon: string;
  readonly hand: "1h" | "2h";
  readonly primaryDamageType: DamageType;
  readonly cardIds: readonly string[];
}

export interface OffhandDef {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly subtitle: string;
  readonly cardIds: readonly string[];
  readonly passiveBlockFirstHit?: number;
}

export interface ArmorDef {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly subtitle: string;
  readonly armor: number;
  readonly maxHpBonus: number;
  readonly maxStaminaModifier: number;
  readonly cardIds: readonly string[];
}

export interface EnemyDef {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly maxHp: number;
  readonly armor: number;
  readonly resistances: Partial<Record<DamageType, number>>;
  readonly vulnerabilities: Partial<Record<DamageType, number>>;
  readonly passives: readonly EnemyPassive[];
  readonly intents: readonly EnemyIntent[];
  readonly startDistance: number;
  readonly isBoss: boolean;
}

export interface EnemyCardDef {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly kind: EnemyIntentKind;
  readonly reach: Reach;
  readonly damage: number;
  readonly damageType: DamageType | null;
  readonly conditions: readonly CardConditionApply[];
  readonly selfMove: number;
  readonly description: string;
}

export interface CombatLoadout {
  readonly weaponId: string;
  readonly offhandId: string | null;
  readonly armorId: string;
  readonly bag: readonly string[];
  readonly unlockedRites: readonly string[];
}
