import { roomDistances, runDungeonAI } from "../utils/dungeon";
import { makeEnemyData } from "../utils/helpers";
import type { AppDispatch, RootState } from "./index";
import { setPlayer } from "./playerSlice";
import { setScreen } from "./screenSlice";
import { updateDungeon, addLogEntries, incrementTurn } from "./dungeonSlice";
import { startCombat, updateCombatState, clearCombat } from "./combatSlice";
import type { CombatPlayer, DungeonLogEntry, DungeonNode } from "../types";

/* ── tickAI ─────────────────────────────────────────────────────────────────
   Runs one dungeon AI tick. Dispatches incrementTurn + log entries.
   Returns { newDungeon, arrivedInPlayerRoom } for callers to use.
────────────────────────────────────────────────────────────────────────────── */
export function tickAI(currentDungeon: DungeonNode[], roomId: string, action: string) {
  return (
    dispatch: AppDispatch,
    getState: () => RootState,
  ): { newDungeon: DungeonNode[]; arrivedInPlayerRoom: string[] } => {
    const turn = getState().dungeon.dungeonTurn;
    const { newDungeon, aiLog, arrivedInPlayerRoom } = runDungeonAI(currentDungeon, roomId, action);
    dispatch(incrementTurn());

    if (aiLog.length) {
      // Debug entries (always logged, visible in debug overlay)
      const debugEntries: DungeonLogEntry[] = aiLog.map((e) => ({
        turn,
        text: e.debugText,
        source: "monster",
        roomId: e.roomId,
        debugText: e.debugText,
      }));
      dispatch(addLogEntries({ entries: debugEntries }));

      // Audible entries filtered by distance
      const maxRange: Record<string, number> = { quiet: 1, normal: 2, loud: Infinity };
      const dist = roomDistances(currentDungeon, roomId);
      const audible = aiLog.filter((e) => {
        const range = maxRange[e.volume] ?? 2;
        const d1 = dist.get(e.roomId) ?? Infinity;
        const d2 = e.toRoomId ? (dist.get(e.toRoomId) ?? Infinity) : Infinity;
        return Math.min(d1, d2) <= range;
      });
      if (audible.length) {
        const audibleEntries: DungeonLogEntry[] = audible.map((e) => {
          const d1 = dist.get(e.roomId) ?? Infinity;
          const d2 = e.toRoomId ? (dist.get(e.toRoomId) ?? Infinity) : Infinity;
          const closestRoom = d2 < d1 ? e.toRoomId! : e.roomId;
          return { turn, text: e.text, source: "monster", roomId: closestRoom };
        });
        dispatch(addLogEntries({ entries: audibleEntries }));
      }
    }

    return { newDungeon, arrivedInPlayerRoom };
  };
}

/* ── combatVictory ───────────────────────────────────────────────────────────
   Called by CombatScreen when all enemies are dead.
────────────────────────────────────────────────────────────────────────────── */
export function combatVictory(newPlayer: CombatPlayer) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const { dungeon: dungeonState } = getState();
    const { dungeon, currentRoomId } = dungeonState;
    if (!dungeon || !currentRoomId) return;

    const base = dungeon.map((n) =>
      n.id === currentRoomId ? { ...n, state: "visited" as const, enemies: [] } : n,
    );
    const curRoom = dungeon.find((r) => r.id === currentRoomId);
    const newDungeon = base.map((n) => {
      if (n.state === "locked" && curRoom?.connections.includes(n.id))
        return { ...n, state: "reachable" as const };
      return n;
    });
    dispatch(updateDungeon(newDungeon));

    const { block: _b, stealthActive: _st, counterActive: _c, ...playerState } = newPlayer;

    if (curRoom?.boss) {
      dispatch(setPlayer({ ...playerState, hp: playerState.maxHp }));
      dispatch(clearCombat());
      dispatch(setScreen("victory"));
      return;
    }

    dispatch(setPlayer(playerState));
    dispatch(clearCombat());
    dispatch(setScreen("map"));
  };
}

/* ── combatDefeat ────────────────────────────────────────────────────────────
   Called by CombatScreen when the player's HP reaches 0.
────────────────────────────────────────────────────────────────────────────── */
export function combatDefeat(gold: number) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const player = getState().player;
    if (player) dispatch(setPlayer({ ...player, gold }));
    dispatch(clearCombat());
    dispatch(setScreen("gameover"));
  };
}

/* ── fleeToMap ───────────────────────────────────────────────────────────────
   Called by CombatScreen on a successful flee attempt.
────────────────────────────────────────────────────────────────────────────── */
export function fleeToMap(newPlayer: CombatPlayer) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const { dungeon: dungeonState } = getState();
    const { dungeon, currentRoomId } = dungeonState;
    if (!dungeon || !currentRoomId) return;

    const { block: _b, stealthActive: _st, counterActive: _c, ...playerState } = newPlayer;
    dispatch(setPlayer(playerState));

    const { newDungeon: afterAI } = dispatch(tickAI(dungeon, currentRoomId, "move"));
    dispatch(updateDungeon(afterAI));
    dispatch(clearCombat());
    dispatch(setScreen("map"));
  };
}

/* ── updateCombatTurn ────────────────────────────────────────────────────────
   Called by CombatScreen at the end of each enemy turn to sync game state.
────────────────────────────────────────────────────────────────────────────── */
export { updateCombatState, startCombat, makeEnemyData };
