import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Player } from "../types";

const playerSlice = createSlice({
  name: "player",
  initialState: null as Player | null,
  reducers: {
    setPlayer: (_state, action: PayloadAction<Player | null>) => action.payload,
    setFlag: (state, action: PayloadAction<{ flag: string; value?: boolean | number }>) => {
      if (!state) return;
      const value = action.payload.value ?? true;
      state.flags = { ...state.flags, [action.payload.flag]: value };
    },
  },
});

export const { setPlayer, setFlag } = playerSlice.actions;
export default playerSlice.reducer;
