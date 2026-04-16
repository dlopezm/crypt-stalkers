import type { GridCombatLogEntry, GridCombatState } from "../types";

export interface ExecutionResult {
  readonly state: GridCombatState;
  readonly log: readonly GridCombatLogEntry[];
}
