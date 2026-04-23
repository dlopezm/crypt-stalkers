import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CombatSystem = "grid" | "card";

interface SettingsState {
  combatSystem: CombatSystem;
}

const STORAGE_KEY = "cryptStalkers_settings";

function loadInitial(): SettingsState {
  if (typeof localStorage === "undefined") return { combatSystem: "card" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { combatSystem: "card" };
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    const cs = parsed.combatSystem === "grid" ? "grid" : "card";
    return { combatSystem: cs };
  } catch {
    return { combatSystem: "card" };
  }
}

function persist(state: SettingsState): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / privacy-mode errors
  }
}

const settingsSlice = createSlice({
  name: "settings",
  initialState: loadInitial(),
  reducers: {
    setCombatSystem: (state, action: PayloadAction<CombatSystem>) => {
      state.combatSystem = action.payload;
      persist(state);
    },
    toggleCombatSystem: (state) => {
      state.combatSystem = state.combatSystem === "card" ? "grid" : "card";
      persist(state);
    },
  },
});

export const { setCombatSystem, toggleCombatSystem } = settingsSlice.actions;
export default settingsSlice.reducer;
