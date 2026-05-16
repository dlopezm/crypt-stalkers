import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface DeathContext {
  readonly enemyIds: readonly string[];
}

export interface CombatSpawn {
  readonly enemies: readonly { readonly id: string; readonly uid: string }[];
}

export interface CombatState {
  spawn: CombatSpawn | null;
  combatKey: number;
  deathContext?: DeathContext;
}

const initialState: CombatState = {
  spawn: null,
  combatKey: 0,
};

const combatSlice = createSlice({
  name: "combat",
  initialState,
  reducers: {
    startCombat: (state, action: PayloadAction<{ spawn: CombatSpawn }>) => ({
      spawn: action.payload.spawn,
      combatKey: state.combatKey + 1,
      deathContext: state.deathContext,
    }),
    hydrateCombat: (state, action: PayloadAction<{ spawn: CombatSpawn }>) => ({
      spawn: action.payload.spawn,
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

export const { startCombat, hydrateCombat, setDeathContext, clearDeathContext, clearCombat } =
  combatSlice.actions;
export default combatSlice.reducer;
