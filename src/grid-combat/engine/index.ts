import type {
  GridAbility,
  GridCombatLogEntry,
  GridCombatState,
  GridEnemyState,
  GridEnemyTypeDef,
  GridObjectiveState,
  GridPlayerState,
  TacticalGrid,
  TimelineEntry,
} from "../types";
import { buildExecutionTimeline } from "./insertion";
import { generateEnemyTelegraphs } from "./telegraphs";
import { executePlayerAction } from "./execute-player";
import { executeEnemyAction } from "./execute-enemy";
import { checkVictoryDefeat, endOfTurnCleanup } from "./end-of-turn";
import type { ExecutionResult } from "./types";

export type { ExecutionResult } from "./types";
export { generateEnemyTelegraphs } from "./telegraphs";
export { buildExecutionTimeline, insertPlayerAction, removePlayerInsertion } from "./insertion";
export { checkVictoryDefeat, endOfTurnCleanup } from "./end-of-turn";

export function executeTimeline(
  state: GridCombatState,
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
  playerAbilities: ReadonlyMap<string, GridAbility>,
): ExecutionResult {
  const timeline = buildExecutionTimeline(state.timeline, state.playerInsertions);
  let current = state;
  const log: GridCombatLogEntry[] = [];

  for (const entry of timeline) {
    if (current.phase === "victory" || current.phase === "defeat") {
      break;
    }

    const result = executeSingleEntry(current, entry, enemyDefs, playerAbilities);
    current = result.state;
    log.push(...result.log);

    current = checkVictoryDefeat(current);
  }

  current = endOfTurnCleanup(current, enemyDefs);

  return { state: current, log };
}

export function executeSingleEntry(
  state: GridCombatState,
  entry: TimelineEntry,
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
  playerAbilities: ReadonlyMap<string, GridAbility>,
): ExecutionResult {
  if (entry.owner.type === "player") {
    return executePlayerAction(state, entry, playerAbilities);
  }

  return executeEnemyAction(state, entry, enemyDefs);
}

export function initGridCombatState(
  grid: TacticalGrid,
  player: GridPlayerState,
  enemies: readonly GridEnemyState[],
  objectiveType: GridCombatState["objectiveType"],
  objectiveState: GridObjectiveState | null,
): GridCombatState {
  return {
    grid,
    player,
    enemies,
    timeline: [],
    playerInsertions: [],
    turn: 1,
    phase: "telegraph",
    combatLog: [],
    deadEnemyPositions: [],
    objectiveType,
    objectiveState,
  };
}

export function advanceToPlanning(
  state: GridCombatState,
  enemyDefs: ReadonlyMap<string, GridEnemyTypeDef>,
): GridCombatState {
  const telegraphs = generateEnemyTelegraphs(state, enemyDefs);

  const newPlayer: GridPlayerState = {
    ...state.player,
    ap: state.player.maxAp,
    guardDamageReduction: 0,
    braceNegateActive: false,
    riposteActive: false,
  };

  return {
    ...state,
    timeline: telegraphs,
    playerInsertions: [],
    phase: "planning",
    player: newPlayer,
  };
}

export function advanceToExecution(state: GridCombatState): GridCombatState {
  return { ...state, phase: "execution" };
}

export function advanceToNextTurn(state: GridCombatState): GridCombatState {
  if (state.phase === "victory" || state.phase === "defeat") {
    return state;
  }

  return { ...state, phase: "telegraph" };
}
