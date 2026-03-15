import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Screen } from "../types";

const screenSlice = createSlice({
  name: "screen",
  initialState: "title" as Screen,
  reducers: {
    setScreen: (_state, action: PayloadAction<Screen>) => action.payload,
  },
});

export const { setScreen } = screenSlice.actions;
export default screenSlice.reducer;
