import type { Player } from "../types";
import type { CombatLoadout } from "../card-combat/types";
import type { GridPlayerState } from "../grid-combat/types";
import { ARMOR_MAP, OFFHAND_MAP, WEAPON_MAP } from "../card-combat/cards";

const DEFAULT_WEAPON = "ashvere_knife";
const DEFAULT_ARMOR = "leather_coat";

function resolveWeapon(id: string | null | undefined): string {
  return id && WEAPON_MAP.has(id) ? id : DEFAULT_WEAPON;
}

function resolveArmor(id: string | null | undefined): string {
  return id && ARMOR_MAP.has(id) ? id : DEFAULT_ARMOR;
}

function resolveOffhand(id: string | null | undefined): string | null {
  return id && OFFHAND_MAP.has(id) ? id : null;
}

export function playerToCardLoadout(player: Player): CombatLoadout {
  return {
    weaponId: resolveWeapon(player.gridWeaponId),
    offhandId: resolveOffhand(player.gridOffhandId),
    armorId: resolveArmor(player.gridArmorId),
    bag: [],
    unlockedRites: ["rite_of_parting"],
  };
}

/** Build a minimal GridPlayerState adapter for card-combat victories, so the
 * existing gridCombatVictory thunk can consume the result without changes. */
export function cardResultToGridPlayerState(
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
