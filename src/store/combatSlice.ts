import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GridCombatState, GridPos } from "../grid-combat/types";
import type { RoomBBox } from "../types";

export interface DeathContext {
  readonly enemyIds: readonly string[];
}

export interface GridCombatSpawn {
  readonly enemies: readonly { readonly id: string; readonly uid: string; readonly pos: GridPos }[];
  readonly roomLabel: string;
  readonly overmapGrid?: readonly (readonly number[])[];
  readonly gridRoomId?: number;
  readonly bbox?: RoomBBox;
}

export interface CombatState {
  /** Spawn metadata — needed to re-initialize GridCombatScreen after reload. */
  spawn: GridCombatSpawn | null;
  /** Full grid combat snapshot, synced at each planning-phase transition. */
  state: GridCombatState | null;
  /** Changing this forces GridCombatScreen to remount via key={combatKey}. */
  combatKey: number;
  deathContext?: DeathContext;
}

const initialState: CombatState = {
  spawn: null,
  state: null,
  combatKey: 0,
};

const combatSlice = createSlice({
  name: "combat",
  initialState,
  reducers: {
    startGridCombat: (state, action: PayloadAction<{ spawn: GridCombatSpawn }>) => ({
      spawn: action.payload.spawn,
      state: null,
      combatKey: state.combatKey + 1,
      deathContext: state.deathContext,
    }),
    syncGridCombatState: (state, action: PayloadAction<GridCombatState>) => ({
      ...state,
      state: action.payload,
    }),
    hydrateGridCombat: (
      state,
      action: PayloadAction<{ spawn: GridCombatSpawn; state: GridCombatState | null }>,
    ) => ({
      spawn: action.payload.spawn,
      state: action.payload.state,
      combatKey: state.combatKey + 1,
      deathContext: state.deathContext,
    }),
    setDeathContext: (state, action: PayloadAction<DeathContext>) => ({
      ...state,
      deathContext: action.payload,
    }),
    clearDeathContext: (state) => {
      const { deathContext: _, ...rest } = state;
      return rest;
    },
    clearCombat: (state) => ({
      ...initialState,
      combatKey: state.combatKey,
      deathContext: state.deathContext,
    }),
  },
});

export const {
  startGridCombat,
  syncGridCombatState,
  hydrateGridCombat,
  setDeathContext,
  clearDeathContext,
  clearCombat,
} = combatSlice.actions;
export default combatSlice.reducer;
