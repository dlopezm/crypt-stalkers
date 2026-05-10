import type { PropAction, PropEffect, PropRequirements, PropState, RoomProp } from "../types";

type Flags = Record<string, boolean | number>;

function flagSet(flags: Flags, key: string): boolean {
  const v = flags[key];
  return typeof v === "number" ? v !== 0 : !!v;
}

export function checkRequirements(
  req: PropRequirements | undefined,
  flags: Flags,
  salt: number,
): { readonly ok: boolean; readonly reason?: string } {
  if (!req) return { ok: true };
  if (req.flags) {
    for (const f of req.flags) {
      if (!flagSet(flags, f)) return { ok: false, reason: `Requires: ${f}` };
    }
  }
  if (req.notFlags) {
    for (const f of req.notFlags) {
      if (flagSet(flags, f)) return { ok: false, reason: `Blocked by: ${f}` };
    }
  }
  if (req.salt != null && salt < req.salt) {
    return { ok: false, reason: `Needs ${req.salt} salt` };
  }
  return { ok: true };
}

export function canPerformAction(
  action: PropAction,
  flags: Flags,
  salt: number,
  propState: PropState | undefined,
): { readonly ok: boolean; readonly reason?: string } {
  if (propState?.actionsUsed.includes(action.id)) {
    return { ok: false, reason: "Already done" };
  }
  return checkRequirements(action.requires, flags, salt);
}

export function isPropActive(
  prop: RoomProp,
  flags: Flags,
  propState: PropState | undefined,
): boolean {
  if (propState?.consumed) return false;
  const cond = checkRequirements(prop.condition, flags, 0);
  return cond.ok;
}

export function getActiveProps(
  props: RoomProp[] | undefined,
  flags: Flags,
  propStates: Record<string, PropState> | undefined,
): RoomProp[] {
  if (!props) return [];
  return props.filter((p) => isPropActive(p, flags, propStates?.[p.id]));
}

export interface EffectOutcome {
  readonly saltDelta: number;
  readonly hpDelta: number;
  readonly flagSets: readonly { readonly flag: string; readonly value: boolean | number }[];
  readonly logMessages: readonly string[];
  readonly consumed: boolean;
  readonly grantedWeapons: readonly string[];
  readonly grantedConsumables: readonly string[];
  readonly grantedAbilities: readonly string[];
  readonly grantedGridWeapons: readonly string[];
  readonly grantedGridOffhands: readonly string[];
  readonly grantedGridArmors: readonly string[];
}

/** Pure evaluator - caller dispatches the resulting deltas. */
export function evaluateEffects(effects: PropEffect[]): EffectOutcome {
  let saltDelta = 0;
  let hpDelta = 0;
  const flagSets: { flag: string; value: boolean | number }[] = [];
  const logMessages: string[] = [];
  let consumed = false;
  const grantedWeapons: string[] = [];
  const grantedConsumables: string[] = [];
  const grantedAbilities: string[] = [];
  const grantedGridWeapons: string[] = [];
  const grantedGridOffhands: string[] = [];
  const grantedGridArmors: string[] = [];

  for (const e of effects) {
    switch (e.type) {
      case "set_flag":
        flagSets.push({ flag: e.flag, value: e.value ?? true });
        break;
      case "grant_salt":
        saltDelta += e.amount;
        break;
      case "remove_salt":
        saltDelta -= e.amount;
        break;
      case "heal_player":
        hpDelta += e.amount;
        break;
      case "damage_player":
        hpDelta -= e.amount;
        break;
      case "log":
        logMessages.push(e.message);
        break;
      case "consume_prop":
        consumed = true;
        break;
      case "grant_weapon":
        grantedWeapons.push(e.weaponId);
        break;
      case "grant_consumable":
        grantedConsumables.push(e.consumableId);
        break;
      case "grant_ability":
        grantedAbilities.push(e.abilityId);
        break;
      case "grant_grid_weapon":
        grantedGridWeapons.push(e.weaponId);
        break;
      case "grant_grid_offhand":
        grantedGridOffhands.push(e.offhandId);
        break;
      case "grant_grid_armor":
        grantedGridArmors.push(e.armorId);
        break;
    }
  }

  return {
    saltDelta,
    hpDelta,
    flagSets,
    logMessages,
    consumed,
    grantedWeapons,
    grantedConsumables,
    grantedAbilities,
    grantedGridWeapons,
    grantedGridOffhands,
    grantedGridArmors,
  };
}
