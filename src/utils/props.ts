import type { PropAction, PropEffect, PropRequirements, PropState, RoomProp } from "../types";

type Flags = Record<string, boolean | number>;

function flagSet(flags: Flags, key: string): boolean {
  const v = flags[key];
  return typeof v === "number" ? v !== 0 : !!v;
}

export function checkRequirements(
  req: PropRequirements | undefined,
  flags: Flags,
  gold: number,
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
  if (req.gold != null && gold < req.gold) {
    return { ok: false, reason: `Needs ${req.gold} gold` };
  }
  return { ok: true };
}

export function canPerformAction(
  action: PropAction,
  flags: Flags,
  gold: number,
  propState: PropState | undefined,
): { readonly ok: boolean; readonly reason?: string } {
  if (propState?.actionsUsed.includes(action.id)) {
    return { ok: false, reason: "Already done" };
  }
  return checkRequirements(action.requires, flags, gold);
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
  goldDelta: number;
  hpDelta: number;
  flagSets: { flag: string; value: boolean | number }[];
  logMessages: string[];
  consumed: boolean;
}

/** Pure evaluator — caller dispatches the resulting deltas. */
export function evaluateEffects(effects: PropEffect[]): EffectOutcome {
  let goldDelta = 0;
  let hpDelta = 0;
  const flagSets: { flag: string; value: boolean | number }[] = [];
  const logMessages: string[] = [];
  let consumed = false;

  for (const e of effects) {
    switch (e.type) {
      case "set_flag":
        flagSets.push({ flag: e.flag, value: e.value ?? true });
        break;
      case "grant_gold":
        goldDelta += e.amount;
        break;
      case "remove_gold":
        goldDelta -= e.amount;
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
    }
  }

  return { goldDelta, hpDelta, flagSets, logMessages, consumed };
}
