import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Player } from "../types";

const playerSlice = createSlice({
  name: "player",
  initialState: null as Player | null,
  reducers: {
    setPlayer: (_state, action: PayloadAction<Player | null>) => action.payload,
  },
});

export const { setPlayer } = playerSlice.actions;
export default playerSlice.reducer;
