import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface DebugState {
  debugMode: boolean;
  showDebug: boolean;
}

const debugSlice = createSlice({
  name: "debug",
  initialState: { debugMode: false, showDebug: false } as DebugState,
  reducers: {
    toggleDebugMode: (state) => {
      state.debugMode = !state.debugMode;
    },
    toggleShowDebug: (state) => {
      state.showDebug = !state.showDebug;
    },
    setShowDebug: (state, action: PayloadAction<boolean>) => {
      state.showDebug = action.payload;
    },
  },
});

export const { toggleDebugMode, toggleShowDebug, setShowDebug } = debugSlice.actions;
export default debugSlice.reducer;
