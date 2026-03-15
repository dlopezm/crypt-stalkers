import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DungeonNode, DungeonDef, DungeonGrid, DungeonLogEntry } from "../types";
import { DUNGEON_LOG_MAX } from "../data/constants";

export interface DungeonState {
  dungeon: DungeonNode[] | null;
  dungeonGrid: DungeonGrid | null;
  dungeonDef: DungeonDef | null;
  currentRoomId: string | null;
  dungeonLog: DungeonLogEntry[];
  dungeonTurn: number;
}

const initialState: DungeonState = {
  dungeon: null,
  dungeonGrid: null,
  dungeonDef: null,
  currentRoomId: null,
  dungeonLog: [],
  dungeonTurn: 0,
};

const dungeonSlice = createSlice({
  name: "dungeon",
  initialState,
  reducers: {
    setDungeonFull: (
      _state,
      action: PayloadAction<{
        dungeon: DungeonNode[] | null;
        dungeonGrid: DungeonGrid | null;
        dungeonDef: DungeonDef | null;
        currentRoomId: string | null;
        dungeonLog?: DungeonLogEntry[];
        dungeonTurn?: number;
      }>,
    ) => ({
      dungeon: action.payload.dungeon,
      dungeonGrid: action.payload.dungeonGrid,
      dungeonDef: action.payload.dungeonDef,
      currentRoomId: action.payload.currentRoomId,
      dungeonLog: action.payload.dungeonLog ?? [],
      dungeonTurn: action.payload.dungeonTurn ?? 0,
    }),
    updateDungeon: (state, action: PayloadAction<DungeonNode[]>) => {
      state.dungeon = action.payload;
    },
    setCurrentRoomId: (state, action: PayloadAction<string | null>) => {
      state.currentRoomId = action.payload;
    },
    addLogEntries: (state, action: PayloadAction<{ entries: DungeonLogEntry[] }>) => {
      state.dungeonLog = [...state.dungeonLog, ...action.payload.entries].slice(-DUNGEON_LOG_MAX);
    },
    incrementTurn: (state) => {
      state.dungeonTurn += 1;
    },
    clearDungeon: () => initialState,
  },
});

export const {
  setDungeonFull,
  updateDungeon,
  setCurrentRoomId,
  addLogEntries,
  incrementTurn,
  clearDungeon,
} = dungeonSlice.actions;
export default dungeonSlice.reducer;
