import type { GridCombatLogEntry, GridCombatState } from "../types";

export interface ExecutionResult {
  readonly state: GridCombatState;
  readonly log: readonly GridCombatLogEntry[];
}

export const SYNTHETIC_ABILITY_ID = {
  stunned: "stunned",
  reforming: "reforming",
  metamorphosis: "metamorphosis",
} as const;
