import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CombatSystem = "grid" | "card" | "line";

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
    const cs: CombatSystem =
      parsed.combatSystem === "grid" ? "grid" : parsed.combatSystem === "line" ? "line" : "card";
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
      const order: CombatSystem[] = ["card", "grid", "line"];
      const idx = order.indexOf(state.combatSystem);
      state.combatSystem = order[(idx + 1) % order.length];
      persist(state);
    },
  },
});

export const { setCombatSystem, toggleCombatSystem } = settingsSlice.actions;
export default settingsSlice.reducer;
