import { CONSUMABLES, STARTER_CONSUMABLE_IDS } from "../data/consumables";
import { PLAYER_START_HP, PLAYER_START_SALT } from "../data/constants";
import type { Player } from "../types";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function uid(p: string): string {
  return `${p}-${Math.random().toString(36).slice(2, 7)}`;
}

export function makeStarterPlayer(): Player {
  return {
    hp: PLAYER_START_HP,
    maxHp: PLAYER_START_HP,
    salt: PLAYER_START_SALT,
    weaponId: "long_sword",
    offhandId: "torch_spec",
    armorId: "leather_armor",
    ownedWeaponIds: ["long_sword"],
    ownedOffhandIds: ["torch_spec"],
    ownedArmorIds: ["leather_armor"],
    consumables: STARTER_CONSUMABLE_IDS.map((id) => ({
      ...CONSUMABLES.find((c) => c.id === id)!,
    })),
    abilities: [],
    flags: {},
  };
}
