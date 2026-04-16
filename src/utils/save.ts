import type { Player, AreaNode, AreaDef, AreaGrid, AreaLogEntry, Screen } from "../types";
import type { VisitedAreaSnapshot } from "../store/areaSlice";
import type { GridCombatSpawn } from "../store/combatSlice";
import type { GridCombatState } from "../grid-combat/types";

export interface CombatSave {
  spawn: GridCombatSpawn;
  state: GridCombatState | null;
}

export interface SaveGame {
  player: Player;
  screen: Screen;
  area: AreaNode[] | null;
  areaGrid?: AreaGrid | null;
  areaDef: AreaDef | null;
  currentRoomId: string | null;
  areaLog: AreaLogEntry[];
  areaTurn: number;
  visitedAreas?: Record<string, VisitedAreaSnapshot>;
  combat: CombatSave | null;
}

const SAVE_KEY = "crypt-crawler-save";

export function saveGame(state: SaveGame): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

export function loadGame(): SaveGame | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SaveGame;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}
