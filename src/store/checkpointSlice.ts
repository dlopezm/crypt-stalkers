import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Player, AreaNode, AreaDef, AreaGrid, AreaLogEntry } from "../types";
import type { VisitedAreaSnapshot } from "./areaSlice";

export interface Checkpoint {
  readonly player: Player;
  readonly area: AreaNode[];
  readonly areaGrid: AreaGrid;
  readonly areaDef: AreaDef;
  readonly currentRoomId: string;
  readonly areaLog: AreaLogEntry[];
  readonly areaTurn: number;
  readonly visitedAreas: Record<string, VisitedAreaSnapshot>;
}

export interface CheckpointState {
  readonly room: Checkpoint | null;
  readonly area: Checkpoint | null;
}

const initialState: CheckpointState = { room: null, area: null };

const checkpointSlice = createSlice({
  name: "checkpoint",
  initialState,
  reducers: {
    saveRoomCheckpoint: (state, action: PayloadAction<Checkpoint>) => {
      state.room = action.payload;
    },
    saveAreaCheckpoint: (state, action: PayloadAction<Checkpoint>) => {
      state.area = action.payload;
    },
  },
});

export const { saveRoomCheckpoint, saveAreaCheckpoint } = checkpointSlice.actions;
export default checkpointSlice.reducer;
