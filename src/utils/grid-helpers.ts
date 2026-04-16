/* ═══════════════════════════════════════════════════════════════════════════
   Grid Combat Helpers — bridge between Player (Redux) and GridPlayer
   ═══════════════════════════════════════════════════════════════════════════ */

import type { Player, AreaEnemy } from "../types";
import type { GridPlayer, GridPlayerState, GridPos } from "../grid-combat/types";
import { GRID_ARMOR_MAP, GRID_WEAPON_MAP, GRID_OFFHAND_MAP } from "../grid-combat/equipment";

const DEFAULT_WEAPON = "ashvere_knife";
const DEFAULT_ARMOR = "miners_leathers";

function resolveWeapon(id: string | null | undefined): string {
  return id && GRID_WEAPON_MAP.has(id) ? id : DEFAULT_WEAPON;
}

function resolveArmor(id: string | null | undefined): string {
  return id && GRID_ARMOR_MAP.has(id) ? id : DEFAULT_ARMOR;
}

function resolveOffhand(id: string | null | undefined): string | null {
  return id && GRID_OFFHAND_MAP.has(id) ? id : null;
}

export function playerToGridPlayer(p: Player): GridPlayer {
  return {
    hp: p.hp,
    maxHp: p.maxHp,
    salt: p.salt,
    mainWeaponId: resolveWeapon(p.gridWeaponId),
    offhandId: resolveOffhand(p.gridOffhandId),
    armorId: resolveArmor(p.gridArmorId),
    ownedWeaponIds: (p.ownedGridWeaponIds ?? [DEFAULT_WEAPON]).map(resolveWeapon),
    ownedOffhandIds: (p.ownedGridOffhandIds ?? [])
      .map(resolveOffhand)
      .filter((id): id is string => id !== null),
    ownedArmorIds: (p.ownedGridArmorIds ?? [DEFAULT_ARMOR]).map(resolveArmor),
    consumables: p.consumables,
    flags: p.flags,
  };
}

export function applyGridCombatResult(base: Player, result: GridPlayerState): Player {
  return {
    ...base,
    hp: result.hp,
    maxHp: result.maxHp,
    salt: result.salt,
    consumables: [...result.consumables],
  };
}

export function areaEnemiesToGridEnemies(
  enemies: readonly AreaEnemy[],
): readonly { readonly id: string; readonly uid: string; readonly pos: GridPos }[] {
  return enemies.map((e) => ({
    id: e.typeId,
    uid: e.uid,
    pos: { row: 0, col: 0 },
  }));
}
