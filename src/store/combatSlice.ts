import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { EnemyData, CombatPlayer } from "../types";
import { LIGHT_START } from "../data/constants";

export interface DeathContext {
  readonly enemyIds: readonly string[];
}

export interface CombatState {
  /** Serializable enemy data; hydrate to Enemy[] via hydrateEnemy() before use. */
  enemies: EnemyData[] | null;
  /** null on fresh combat — CombatScreen derives it from playerSlice. */
  combatPlayer: CombatPlayer | null;
  lightLevel: number;
  combatLog: string[];
  surpriseRound: boolean;
  /** Changing this value forces CombatScreen to remount via key={combatKey}. */
  combatKey: number;
  deathContext?: DeathContext;
}

const initialState: CombatState = {
  enemies: null,
  combatPlayer: null,
  lightLevel: LIGHT_START,
  combatLog: [],
  surpriseRound: false,
  combatKey: 0,
};

const combatSlice = createSlice({
  name: "combat",
  initialState,
  reducers: {
    startCombat: (
      state,
      action: PayloadAction<{
        enemies: EnemyData[];
        combatPlayer?: CombatPlayer | null;
        surpriseRound: boolean;
        lightLevel?: number;
        combatLog?: string[];
      }>,
    ) => ({
      enemies: action.payload.enemies,
      combatPlayer: action.payload.combatPlayer ?? null,
      lightLevel: action.payload.lightLevel ?? LIGHT_START,
      combatLog: action.payload.combatLog ?? [],
      surpriseRound: action.payload.surpriseRound,
      combatKey: state.combatKey + 1,
    }),
    updateCombatState: (
      state,
      action: PayloadAction<
        Partial<Pick<CombatState, "enemies" | "combatPlayer" | "lightLevel" | "combatLog">>
      >,
    ) => ({ ...state, ...action.payload }),
    setDeathContext: (
      state,
      action: PayloadAction<DeathContext>,
    ) => ({ ...state, deathContext: action.payload }),
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

export const { startCombat, updateCombatState, setDeathContext, clearDeathContext, clearCombat } = combatSlice.actions;
export default combatSlice.reducer;
