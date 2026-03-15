# Redux Toolkit Migration

## Summary

Replace all `useState` in `App.tsx` and the game-state portions of `CombatScreen.tsx` local state with Redux Toolkit slices. Ephemeral UI state in `CombatScreen` stays local. Persistence wired via `store.subscribe()` using the existing `save.ts` utilities — no new persistence dependency.

---

## Affected Files

### New files
- `src/store/index.ts` — store configuration + typed hooks
- `src/store/screenSlice.ts`
- `src/store/playerSlice.ts`
- `src/store/dungeonSlice.ts`
- `src/store/combatSlice.ts`
- `src/store/debugSlice.ts`

### Modified files
- `package.json` — add `@reduxjs/toolkit`, `react-redux`
- `src/main.tsx` — wrap with `<Provider>`, wire `store.subscribe` for persistence
- `src/App.tsx` — remove `useState`, use `useAppSelector`/`useAppDispatch`, keep handler logic
- `src/components/CombatScreen.tsx` — move game state to combatSlice, keep UI state local, remove callback props
- `src/utils/save.ts` — remove duplicated `Screen` type (consolidate into `types.ts`)
- `src/types.ts` — add `Screen` type (move from App.tsx and save.ts)

---

## Implementation Steps

### Step 1 — Install packages

```bash
pnpm add @reduxjs/toolkit react-redux
```

### Step 2 — Move `Screen` type to `types.ts`

`Screen` is currently defined in both `App.tsx` and `save.ts`. Consolidate:

```typescript
// src/types.ts (add at bottom)
export type Screen = "title" | "town" | "map" | "combat" | "victory" | "gameover";
```

Update `App.tsx` and `save.ts` to import `Screen` from `../types`.

### Step 3 — Create slices

#### `src/store/screenSlice.ts`
```typescript
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
```

#### `src/store/playerSlice.ts`
```typescript
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Player } from "../types";

const playerSlice = createSlice({
  name: "player",
  initialState: null as Player | null,
  reducers: {
    setPlayer: (_state, action: PayloadAction<Player | null>) => action.payload,
  },
});

export const { setPlayer } = playerSlice.actions;
export default playerSlice.reducer;
```

#### `src/store/dungeonSlice.ts`
State: `dungeon`, `dungeonGrid`, `dungeonDef`, `currentRoomId`, `dungeonLog`, `dungeonTurn`.

Key actions:
- `setDungeonFull` — set dungeon + grid + def + roomId at once (used on enter/restore)
- `updateDungeon` — replace `DungeonNode[]` (after AI tick, room clear, etc.)
- `setCurrentRoomId`
- `addLogEntries({ entries, source, turn, debugOnly })` — appends to log, slices to `DUNGEON_LOG_MAX`
- `incrementTurn`
- `clearDungeon` — resets all fields to null/empty

```typescript
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DungeonNode, DungeonDef, DungeonGrid, DungeonLogEntry } from "../types";
import { DUNGEON_LOG_MAX } from "../data/constants";

interface DungeonState {
  dungeon: DungeonNode[] | null;
  dungeonGrid: DungeonGrid | null;
  dungeonDef: DungeonDef | null;
  currentRoomId: string | null;
  dungeonLog: DungeonLogEntry[];
  dungeonTurn: number;
}

const initialState: DungeonState = {
  dungeon: null, dungeonGrid: null, dungeonDef: null,
  currentRoomId: null, dungeonLog: [], dungeonTurn: 0,
};

const dungeonSlice = createSlice({
  name: "dungeon",
  initialState,
  reducers: {
    setDungeonFull: (state, action: PayloadAction<Omit<DungeonState, "dungeonLog" | "dungeonTurn"> & { dungeonLog?: DungeonLogEntry[]; dungeonTurn?: number }>) => ({
      ...state, ...action.payload,
      dungeonLog: action.payload.dungeonLog ?? [],
      dungeonTurn: action.payload.dungeonTurn ?? 0,
    }),
    updateDungeon: (state, action: PayloadAction<DungeonNode[]>) => { state.dungeon = action.payload; },
    setCurrentRoomId: (state, action: PayloadAction<string | null>) => { state.currentRoomId = action.payload; },
    addLogEntries: (state, action: PayloadAction<{ entries: DungeonLogEntry[] }>) => {
      state.dungeonLog = [...state.dungeonLog, ...action.payload.entries].slice(-DUNGEON_LOG_MAX);
    },
    incrementTurn: (state) => { state.dungeonTurn += 1; },
    clearDungeon: () => initialState,
  },
});

export const { setDungeonFull, updateDungeon, setCurrentRoomId, addLogEntries, incrementTurn, clearDungeon } = dungeonSlice.actions;
export default dungeonSlice.reducer;
```

#### `src/store/combatSlice.ts`
Replaces both `combatSave` in App.tsx **and** the game-state portions of CombatScreen local state (`enemies`, `p`/combatPlayer, `lightLevel`, `log`/combatLog).

Also holds `surpriseRound` and `combatKey` (the React key used to remount CombatScreen).

```typescript
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Enemy, CombatPlayer } from "../types";
import { LIGHT_START } from "../data/constants";

interface CombatState {
  enemies: EnemyData[] | null;   // serializable; hydrate to Enemy[] via selector
  combatPlayer: CombatPlayer | null;
  lightLevel: number;
  combatLog: string[];
  surpriseRound: boolean;
  combatKey: number;
}

const initialState: CombatState = {
  enemies: null, combatPlayer: null,
  lightLevel: LIGHT_START, combatLog: [],
  surpriseRound: false, combatKey: 0,
};

const combatSlice = createSlice({
  name: "combat",
  initialState,
  reducers: {
    startCombat: (state, action: PayloadAction<{ enemies: Enemy[]; combatPlayer: CombatPlayer; surpriseRound: boolean; lightLevel?: number; combatLog?: string[] }>) => ({
      ...initialState,
      ...action.payload,
      lightLevel: action.payload.lightLevel ?? LIGHT_START,
      combatLog: action.payload.combatLog ?? [],
      combatKey: state.combatKey + 1,
    }),
    updateCombatState: (state, action: PayloadAction<Partial<Pick<CombatState, "enemies" | "combatPlayer" | "lightLevel" | "combatLog">>>) => ({
      ...state, ...action.payload,
    }),
    clearCombat: (state) => ({ ...initialState, combatKey: state.combatKey }),
  },
});

export const { startCombat, updateCombatState, clearCombat } = combatSlice.actions;
export default combatSlice.reducer;
```

#### `src/store/debugSlice.ts`
```typescript
import { createSlice } from "@reduxjs/toolkit";

const debugSlice = createSlice({
  name: "debug",
  initialState: { debugMode: false, showDebug: false },
  reducers: {
    toggleDebugMode: (state) => { state.debugMode = !state.debugMode; },
    toggleShowDebug: (state) => { state.showDebug = !state.showDebug; },
    setShowDebug: (state, action) => { state.showDebug = action.payload; },
  },
});

export const { toggleDebugMode, toggleShowDebug, setShowDebug } = debugSlice.actions;
export default debugSlice.reducer;
```

### Step 4 — Create store + typed hooks

#### `src/store/index.ts`
```typescript
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
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: <T>(selector: (state: RootState) => T) => T = useSelector;
```

### Step 5 — Wire Provider + persistence in `main.tsx`

```typescript
import { Provider } from "react-redux";
import { store } from "./store";
import { saveGame } from "./utils/save";

// Subscribe: persist on every state change
store.subscribe(() => {
  const state = store.getState();
  const { player } = state.player;  // adjust for actual shape
  if (!player) return;
  // Only save when in a saveable screen
  const screen = state.screen;
  if (screen === "title") return;
  saveGame({
    player,
    screen,
    dungeon: state.dungeon.dungeon,
    dungeonGrid: state.dungeon.dungeonGrid,
    dungeonDef: state.dungeon.dungeonDef,
    currentRoomId: state.dungeon.currentRoomId,
    dungeonLog: state.dungeon.dungeonLog,
    dungeonTurn: state.dungeon.dungeonTurn,
    combat: state.combat.enemies ? {
      enemies: state.combat.enemies,
      combatPlayer: state.combat.combatPlayer!,
      lightLevel: state.combat.lightLevel,
      combatLog: state.combat.combatLog,
      surpriseRound: state.combat.surpriseRound,
    } : null,
  });
});

ReactDOM.createRoot(...).render(
  <Provider store={store}><App /></Provider>
);
```

**Important**: `store.subscribe` fires on every dispatch. Since the save is synchronous localStorage this is acceptable. If it becomes a concern, debounce or only save on specific action types using `listenerMiddleware`.

### Step 6 — Refactor `App.tsx`

Remove all `useState`. Replace with `useAppSelector` and `useAppDispatch`. Keep all handler functions but replace `setState` calls with `dispatch(...)`.

Key mapping:

| Old | New |
|-----|-----|
| `setScreen(s)` | `dispatch(setScreen(s))` |
| `setPlayer(p)` | `dispatch(setPlayer(p))` |
| `setDungeon(d)` | `dispatch(updateDungeon(d))` |
| `setCurrentRoomId(id)` | `dispatch(setCurrentRoomId(id))` |
| `setDungeonLog(...)` via `addLog()` | `dispatch(addLogEntries({ entries }))` |
| `setDungeonTurn(t+1)` | `dispatch(incrementTurn())` |
| `setCombatSave(...)` | `dispatch(startCombat(...))` or `dispatch(clearCombat())` |
| `setSurpriseRound(b)` | part of `dispatch(startCombat({ surpriseRound: b, ... }))` |
| `setCombatKey(k+1)` | handled inside `startCombat` reducer |
| `setDebugMode(...)` | `dispatch(toggleDebugMode())` |
| `setShowDebug(...)` | `dispatch(toggleShowDebug())` / `dispatch(setShowDebug(b))` |

Remove `doSave()` entirely — persistence is now handled by `store.subscribe` in `main.tsx`.

The `addLog` helper becomes a local function that constructs `DungeonLogEntry[]` and dispatches `addLogEntries`.

The `tickAI` helper becomes a local function that dispatches `incrementTurn()` and `addLogEntries(...)`, then returns `{ newDungeon, arrivedInPlayerRoom }` as before.

`continueGame` dispatches to all slices at once from the loaded save.

`startNewGame` dispatches `setPlayer(makeStarterPlayer())`, `setScreen("town")`, and calls `clearSave()`.

### Step 7 — Refactor `CombatScreen.tsx`

**Remove props**: `onVictory`, `onDefeat`, `onFleeToMap`, `onTurnEnd`, `initialCombat`, `surpriseRound`

**Keep props**: `room` (still needed to know current room context)

**Remove local state** (move to combatSlice):
- `enemies` → `useAppSelector(s => s.combat.enemies)`
- `p` (combatPlayer) → `useAppSelector(s => s.combat.combatPlayer)`
- `lightLevel` → `useAppSelector(s => s.combat.lightLevel)`
- `log` (combatLog) → `useAppSelector(s => s.combat.combatLog)`

**Keep local state** (ephemeral UI):
- `subAction`
- `pendingAbility`
- `pendingItem`
- `targetIdx`
- `animating`

**Initialization**: On mount, if `combatPlayer` is null in the store, dispatch `startCombat` with enemies initialized from `room.enemies`. If `combatPlayer` is already set (mid-combat restore), skip. This replaces the `initialCombat` prop pattern.

**Turn updates**: Instead of calling `onTurnEnd(combatSave)`, dispatch `updateCombatState({ enemies, combatPlayer, lightLevel, combatLog })`.

**Combat end**:
- Instead of calling `onVictory(newPlayer)`, dispatch the victory logic equivalent actions: update player in playerSlice, update dungeon in dungeonSlice, set screen, clear combat.
- Instead of calling `onDefeat(gold)`, dispatch to update player gold, set screen.
- Instead of `onFleeToMap(newPlayer)`, dispatch the flee logic.

These can be implemented as thunks in `src/store/combatSlice.ts` or as action sequences dispatched inline in CombatScreen — either works.

> **Recommendation**: Keep the logic in App.tsx as thunk-like functions that CombatScreen can import and call, so the screen transition logic stays in one place. Export them from a new `src/store/thunks.ts` file.

### Step 8 — Verify persistence

After migration, manually test the full save/load flow:
1. Start a new game → save is written
2. Enter dungeon → save updates
3. Enter combat → mid-combat state saved
4. Refresh browser → `continueGame` restores all state correctly

---

## Key Decisions

**CombatScreen game state in Redux (Option A)**: `enemies`, `combatPlayer`, `lightLevel`, `combatLog` move to `combatSlice`. This makes mid-combat state visible in Redux DevTools and eliminates the awkward `combatSave`/`initialCombat` round-trip. UI-only state (`subAction`, `animating`, etc.) stays local.

**`combatKey` in combatSlice**: The `combatKey` counter (used as React `key` on `<CombatScreen>`) is incremented inside the `startCombat` reducer. This couples the remount trigger to the action that starts combat, which is the correct semantic.

**`store.subscribe` for persistence**: Fires synchronously after every dispatch. This is slightly over-eager (saves on debug toggles too) but simple and correct. If perf becomes an issue, add a `listenerMiddleware` that only fires on specific action types, or debounce the subscriber.

**Screen type consolidation**: `Screen` is currently duplicated between `App.tsx` and `save.ts`. Moved to `types.ts` as the canonical location.

**No thunk files initially**: The complex handler logic in App.tsx stays in App.tsx as `dispatch`-based functions. Extracting to thunks can be done incrementally as a follow-up if desired.

---

## Risks / Considerations

- **`store.subscribe` save timing**: The subscriber saves on *every* dispatch, including intermediate states (e.g., dungeon updated but screen not yet changed). This is fine since the save is read atomically on load, but if a future bug causes partial state saves to corrupt saves, consider moving to `listenerMiddleware` with explicit action filtering.

- **`EnemyData` / `Enemy` split**: Redux and localStorage must only store serializable data. `Enemy` objects embed `combatMechanics` functions (from `EnemyType`) which cannot be serialized. Solution: introduce `EnemyData` (only the mutable runtime fields: `id, uid, hp, block, statuses, reassembled, summonCooldown, row, ambushTurns`) as the stored type. The runtime `Enemy` is derived on-the-fly via `hydrateEnemy(data: EnemyData): Enemy` which does `{ ...ENEMY_TYPES.find(e => e.id === data.id), ...data }`. Redux combat slice stores `EnemyData[] | null`. Combat code works with hydrated `Enemy[]` via a selector. Before dispatching state updates, strip enemies back to `EnemyData` with a `toEnemyData` helper. `makeEnemy` becomes `makeEnemyData` returning `EnemyData`; a separate `hydrateEnemy` reconstructs the full object. `ENEMY_TYPES` is a static constant, not state — functions live there only.

- **`CombatScreen` initialization on re-mount**: With `combatKey` as the React key, CombatScreen remounts for each new combat. The initialization `useEffect` must check whether to initialize fresh (enemies null in store) or restore (enemies already set). Be careful about the `startCombat` dispatch firing twice in strict mode — guard with a ref or check if `combatPlayer` is already set.

- **Incremental save subscriber correctness**: `clearSave()` in `startNewGame()` must run before or after the subscriber fires. Ensure calling `clearSave()` isn't immediately overwritten by the subscribe callback setting the save back. Solution: dispatch `setScreen("town")` last in `startNewGame`, and in the subscriber, skip saving when `screen === "title"`.
