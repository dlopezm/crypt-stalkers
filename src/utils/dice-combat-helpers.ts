import type { Player } from "../types";
import type { DiceLoadout } from "../dice-combat/types";
import {
  ARMOR_DICE,
  OFFHAND_DICE,
  SOUL_STARTING_FACES,
  WEAPON_DICE,
} from "../dice-combat/dice-defs";
import type { GridPlayerState } from "../grid-combat/types";

const DEFAULT_WEAPON = "dagger";
const DEFAULT_ARMOR = "mail_hauberk";

function resolveWeapon(id: string | null | undefined): string {
  if (id && WEAPON_DICE[id]) return id;
  // Player.mainWeapon.id might map; honour known weapon ids that have a dice mapping.
  return DEFAULT_WEAPON;
}

function resolveOffhand(id: string | null | undefined): string | null {
  if (!id) return null;
  return OFFHAND_DICE[id] ? id : null;
}

function resolveArmor(id: string | null | undefined): string {
  if (id && ARMOR_DICE[id]) return id;
  return DEFAULT_ARMOR;
}

export function playerToDiceLoadout(player: Player): DiceLoadout {
  return {
    mainWeaponId: resolveWeapon(player.mainWeapon?.id),
    offhandId: resolveOffhand(player.offhandWeapon?.id ?? null),
    armorId: resolveArmor(player.gridArmorId),
    soulFaces: SOUL_STARTING_FACES,
  };
}

/** Build a minimal GridPlayerState adapter for dice-combat victories so the
 * existing gridCombatVictory thunk can consume the result without changes. */
export function diceResultToGridPlayerState(
  player: Player,
  finalHp: number,
  finalSalt: number,
): GridPlayerState {
  return {
    hp: finalHp,
    maxHp: player.maxHp,
    salt: finalSalt,
    pos: { row: 0, col: 0 },
    ap: 0,
    maxAp: 0,
    conditions: {},
    armor: 0,
    thorns: 0,
    mainWeaponId: player.gridWeaponId ?? "ashvere_knife",
    offhandId: player.gridOffhandId ?? null,
    armorId: player.gridArmorId ?? "miners_leathers",
    consumables: player.consumables,
    abilityCooldowns: {},
    boneResonanceStacks: 0,
    overwatchTile: null,
    overwatchDamage: 0,
    riposteActive: false,
    guardDamageReduction: 0,
    braceNegateActive: false,
    blockFirstHitReduction: 0,
  };
}
