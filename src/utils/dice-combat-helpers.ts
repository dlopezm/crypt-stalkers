import type { Player, CombatVictoryResult } from "../types";
import type { DiceLoadout } from "../dice-combat/types";
import { ARMOR_DICE, getAbilityDie, OFFHAND_DICE, WEAPON_DICE } from "../dice-combat/dice-defs";

const DEFAULT_WEAPON = "dagger";
const DEFAULT_OFFHAND = "torch";
const DEFAULT_ARMOR = "mail_hauberk";

function resolveWeapon(id: string | null | undefined): string {
  if (id && WEAPON_DICE[id]) return id;
  return DEFAULT_WEAPON;
}

function resolveOffhand(id: string | null | undefined): string {
  if (id && OFFHAND_DICE[id]) return id;
  return DEFAULT_OFFHAND;
}

function resolveArmor(id: string | null | undefined): string {
  if (id && ARMOR_DICE[id]) return id;
  return DEFAULT_ARMOR;
}

export function playerToDiceLoadout(player: Player): DiceLoadout {
  const abilityDie = getAbilityDie(player.activeAbilityId);
  return {
    mainWeaponId: resolveWeapon(player.weaponId),
    offhandId: resolveOffhand(player.offhandId),
    armorId: resolveArmor(player.armorId),
    abilityFaces: abilityDie.faces,
  };
}

export function diceResultToCombatVictory(
  player: Player,
  finalHp: number,
  finalSalt: number,
): CombatVictoryResult {
  return {
    hp: finalHp,
    maxHp: player.maxHp,
    salt: finalSalt,
    consumables: player.consumables,
  };
}
