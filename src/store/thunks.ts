import { roomDistances, runAreaAI } from "../utils/area";
import { makeEnemyData } from "../utils/helpers";
import type { AppDispatch, RootState } from "./index";
import { setPlayer } from "./playerSlice";
import { setScreen } from "./screenSlice";
import { updateArea, addLogEntries, incrementTurn } from "./areaSlice";
import { startCombat, updateCombatState, clearCombat } from "./combatSlice";
import type { CombatPlayer, AreaLogEntry, AreaNode } from "../types";

/* ── tickAI ─────────────────────────────────────────────────────────────────
   Runs one area AI tick. Dispatches incrementTurn + log entries.
   Returns { newArea, arrivedInPlayerRoom } for callers to use.
────────────────────────────────────────────────────────────────────────────── */
export function tickAI(currentArea: AreaNode[], roomId: string, action: string) {
  return (
    dispatch: AppDispatch,
    getState: () => RootState,
  ): { newArea: AreaNode[]; arrivedInPlayerRoom: string[] } => {
    const turn = getState().area.areaTurn;
    const { newArea, aiLog, arrivedInPlayerRoom } = runAreaAI(currentArea, roomId, action);
    dispatch(incrementTurn());

    if (aiLog.length) {
      // Debug entries (always logged, visible in debug overlay)
      const debugEntries: AreaLogEntry[] = aiLog.map((e) => ({
        turn,
        text: e.debugText,
        source: "monster",
        roomId: e.roomId,
        debugText: e.debugText,
      }));
      dispatch(addLogEntries({ entries: debugEntries }));

      // Audible entries filtered by distance
      const maxRange: Record<string, number> = { quiet: 1, normal: 2, loud: Infinity };
      const dist = roomDistances(currentArea, roomId);
      const audible = aiLog.filter((e) => {
        const range = maxRange[e.volume] ?? 2;
        const d1 = dist.get(e.roomId) ?? Infinity;
        const d2 = e.toRoomId ? (dist.get(e.toRoomId) ?? Infinity) : Infinity;
        return Math.min(d1, d2) <= range;
      });
      if (audible.length) {
        const audibleEntries: AreaLogEntry[] = audible.map((e) => {
          const d1 = dist.get(e.roomId) ?? Infinity;
          const d2 = e.toRoomId ? (dist.get(e.toRoomId) ?? Infinity) : Infinity;
          const closestRoom = d2 < d1 ? e.toRoomId! : e.roomId;
          return { turn, text: e.text, source: "monster", roomId: closestRoom };
        });
        dispatch(addLogEntries({ entries: audibleEntries }));
      }
    }

    return { newArea, arrivedInPlayerRoom };
  };
}

/* ── combatVictory ───────────────────────────────────────────────────────────
   Called by CombatScreen when all enemies are dead.
────────────────────────────────────────────────────────────────────────────── */
export function combatVictory(newPlayer: CombatPlayer) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const { area: areaState, combat: combatState } = getState();
    const { area, areaDef, currentRoomId } = areaState;
    if (!area || !currentRoomId) return;

    // Tally dead enemies as corpses (exclude bosses and internal types like heap_of_bones)
    const SKIP_CORPSE = new Set([
      "heap_of_bones",
      "boss_skeleton_lord",
      "boss_vampire_lord",
      "boss_lich",
    ]);
    const newCorpses: Record<string, number> = {};
    for (const e of combatState.enemies ?? []) {
      if (!SKIP_CORPSE.has(e.id)) {
        newCorpses[e.id] = (newCorpses[e.id] ?? 0) + 1;
      }
    }

    const base = area.map((n) => {
      if (n.id !== currentRoomId) return n;
      const merged: Record<string, number> = { ...n.corpses };
      for (const [id, count] of Object.entries(newCorpses)) {
        merged[id] = (merged[id] ?? 0) + count;
      }
      return { ...n, state: "visited" as const, enemies: [], corpses: merged };
    });
    const curRoom = area.find((r) => r.id === currentRoomId);
    const newArea = base.map((n) => {
      if (n.state === "locked" && curRoom?.connections.includes(n.id))
        return { ...n, state: "reachable" as const };
      return n;
    });
    dispatch(updateArea(newArea));

    const {
      block: _b,
      stealthActive: _st,
      counterActive: _c,
      abilityCooldowns: _ac,
      chargingAbility: _ca,
      chargingTurnsLeft: _ct,
      chargingTargetUid: _ctu,
      blockReduction: _br,
      ...playerState
    } = newPlayer;

    // Only fire the victory screen if this area defines a boss room and the
    // defeated room is that boss. Areas without a boss (transit/ring segments)
    // are left in the map view — the player exits via inter-area doors.
    if (curRoom?.boss && areaDef?.bossRoom) {
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
export function combatDefeat() {
  return (dispatch: AppDispatch) => {
    dispatch(clearCombat());
    dispatch(setScreen("gameover"));
  };
}

/* ── fleeToMap ───────────────────────────────────────────────────────────────
   Called by CombatScreen on a successful flee attempt.
────────────────────────────────────────────────────────────────────────────── */
export function fleeToMap(newPlayer: CombatPlayer) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const { area: areaState } = getState();
    const { area, currentRoomId } = areaState;
    if (!area || !currentRoomId) return;

    const {
      block: _b,
      stealthActive: _st,
      counterActive: _c,
      abilityCooldowns: _ac,
      chargingAbility: _ca,
      chargingTurnsLeft: _ct,
      chargingTargetUid: _ctu,
      blockReduction: _br,
      ...playerState
    } = newPlayer;
    dispatch(setPlayer(playerState));

    const { newArea: afterAI } = dispatch(tickAI(area, currentRoomId, "move"));
    dispatch(updateArea(afterAI));
    dispatch(clearCombat());
    dispatch(setScreen("map"));
  };
}

/* ── updateCombatTurn ────────────────────────────────────────────────────────
   Called by CombatScreen at the end of each enemy turn to sync game state.
────────────────────────────────────────────────────────────────────────────── */
export { updateCombatState, startCombat, makeEnemyData };
