import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import screenReducer from "./screenSlice";
import playerReducer from "./playerSlice";
import areaReducer from "./areaSlice";
import combatReducer from "./combatSlice";
import debugReducer from "./debugSlice";
import checkpointReducer from "./checkpointSlice";
import settingsReducer from "./settingsSlice";

export const store = configureStore({
  reducer: {
    screen: screenReducer,
    player: playerReducer,
    area: areaReducer,
    combat: combatReducer,
    debug: debugReducer,
    checkpoint: checkpointReducer,
    settings: settingsReducer,
  },
  devTools: {
    name: "Crypt Stalkers",
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector(selector);
