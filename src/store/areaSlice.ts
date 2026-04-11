import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AreaNode, AreaDef, AreaGrid, AreaLogEntry, PropState } from "../types";
import { DUNGEON_LOG_MAX } from "../data/constants";

/** Snapshot of an area that the player has stepped out of but may return to. */
export interface VisitedAreaSnapshot {
  area: AreaNode[];
  grid: AreaGrid;
  def: AreaDef;
  currentRoomId: string;
  log: AreaLogEntry[];
  turn: number;
}

export interface AreaState {
  area: AreaNode[] | null;
  areaGrid: AreaGrid | null;
  areaDef: AreaDef | null;
  currentRoomId: string | null;
  areaLog: AreaLogEntry[];
  areaTurn: number;
  /** Snapshots of other areas in the current multi-area dungeon session. */
  visitedAreas: Record<string, VisitedAreaSnapshot>;
}

const initialState: AreaState = {
  area: null,
  areaGrid: null,
  areaDef: null,
  currentRoomId: null,
  areaLog: [],
  areaTurn: 0,
  visitedAreas: {},
};

const areaSlice = createSlice({
  name: "area",
  initialState,
  reducers: {
    setAreaFull: (
      state,
      action: PayloadAction<{
        area: AreaNode[] | null;
        areaGrid: AreaGrid | null;
        areaDef: AreaDef | null;
        currentRoomId: string | null;
        areaLog?: AreaLogEntry[];
        areaTurn?: number;
        visitedAreas?: Record<string, VisitedAreaSnapshot>;
      }>,
    ) => ({
      area: action.payload.area,
      areaGrid: action.payload.areaGrid,
      areaDef: action.payload.areaDef,
      currentRoomId: action.payload.currentRoomId,
      areaLog: action.payload.areaLog ?? [],
      areaTurn: action.payload.areaTurn ?? 0,
      // If the caller (e.g. loadGame) supplies visitedAreas, use it;
      // otherwise preserve existing snapshots. switchArea uses its own path.
      visitedAreas: action.payload.visitedAreas ?? state.visitedAreas,
    }),
    updateArea: (state, action: PayloadAction<AreaNode[]>) => {
      state.area = action.payload;
    },
    setCurrentRoomId: (state, action: PayloadAction<string | null>) => {
      state.currentRoomId = action.payload;
    },
    addLogEntries: (state, action: PayloadAction<{ entries: AreaLogEntry[] }>) => {
      state.areaLog = [...state.areaLog, ...action.payload.entries].slice(-DUNGEON_LOG_MAX);
    },
    incrementTurn: (state) => {
      state.areaTurn += 1;
    },
    /**
     * Swap the active area for another. If the target area has been visited
     * before in this session, its snapshot is restored; otherwise the caller
     * supplies a freshly generated area in `fresh`.
     */
    switchArea: (
      state,
      action: PayloadAction<{
        toAreaId: string;
        targetRoomId: string;
        fresh: {
          area: AreaNode[];
          grid: AreaGrid;
          def: AreaDef;
        };
      }>,
    ) => {
      const { toAreaId, targetRoomId, fresh } = action.payload;

      // Snapshot the currently active area, if any
      if (state.area && state.areaGrid && state.areaDef && state.currentRoomId) {
        state.visitedAreas[state.areaDef.id] = {
          area: state.area,
          grid: state.areaGrid,
          def: state.areaDef,
          currentRoomId: state.currentRoomId,
          log: state.areaLog,
          turn: state.areaTurn,
        };
      }

      // Restore snapshot if we've been here before, else use fresh
      const existing = state.visitedAreas[toAreaId];
      if (existing) {
        state.area = existing.area;
        state.areaGrid = existing.grid;
        state.areaDef = existing.def;
        state.areaLog = existing.log;
        state.areaTurn = existing.turn;
      } else {
        state.area = fresh.area;
        state.areaGrid = fresh.grid;
        state.areaDef = fresh.def;
        state.areaLog = [];
        state.areaTurn = 0;
      }
      state.currentRoomId = targetRoomId;

      // Mark the target room visited and unlock its neighbors
      if (state.area) {
        state.area = state.area.map((n) => {
          if (n.id === targetRoomId) return { ...n, state: "visited" as const };
          return n;
        });
        const target = state.area.find((n) => n.id === targetRoomId);
        if (target) {
          const hasEnemies = target.enemies.length > 0;
          if (!hasEnemies) {
            state.area = state.area.map((n) =>
              n.state === "locked" && target.connections.includes(n.id)
                ? { ...n, state: "reachable" as const }
                : n,
            );
          }
        }
      }

      // The newly active area is no longer a snapshot
      delete state.visitedAreas[toAreaId];
    },
    updatePropState: (
      state,
      action: PayloadAction<{
        roomId: string;
        propId: string;
        patch: Partial<PropState>;
      }>,
    ) => {
      if (!state.area) return;
      const { roomId, propId, patch } = action.payload;
      state.area = state.area.map((n) => {
        if (n.id !== roomId) return n;
        const prev: PropState = n.propStates?.[propId] ?? {
          examined: false,
          actionsUsed: [],
          consumed: false,
        };
        const next: PropState = {
          examined: patch.examined ?? prev.examined,
          actionsUsed: patch.actionsUsed ?? prev.actionsUsed,
          consumed: patch.consumed ?? prev.consumed,
        };
        return { ...n, propStates: { ...(n.propStates ?? {}), [propId]: next } };
      });
    },
    clearArea: () => initialState,
  },
});

export const {
  setAreaFull,
  updateArea,
  setCurrentRoomId,
  addLogEntries,
  incrementTurn,
  switchArea,
  updatePropState,
  clearArea,
} = areaSlice.actions;
export default areaSlice.reducer;
