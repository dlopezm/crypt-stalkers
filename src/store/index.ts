import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import screenReducer from "./screenSlice";
import playerReducer from "./playerSlice";
import dungeonReducer from "./dungeonSlice";
import combatReducer from "./combatSlice";
import debugReducer from "./debugSlice";

export const store = configureStore({
  reducer: {
    screen: screenReducer,
    player: playerReducer,
    dungeon: dungeonReducer,
    combat: combatReducer,
    debug: debugReducer,
  },
  devTools: {
    name: "Crypt Stalkers",
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector(selector);
