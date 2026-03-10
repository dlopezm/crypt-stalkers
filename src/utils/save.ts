import type {
  Player,
  DungeonNode,
  DungeonDef,
  DungeonLogEntry,
  Enemy,
  CombatPlayer,
} from "../types";

type Screen = "title" | "town" | "map" | "combat" | "victory" | "gameover";

export interface CombatSave {
  enemies: Enemy[];
  combatPlayer: CombatPlayer;
  lightLevel: number;
  combatLog: string[];
}

export interface SaveGame {
  player: Player;
  screen: Screen;
  dungeon: DungeonNode[] | null;
  dungeonDef: DungeonDef | null;
  currentRoomId: string | null;
  dungeonLog: DungeonLogEntry[];
  dungeonTurn: number;
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
