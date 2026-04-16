import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App";
import { store } from "./store";
import { saveGame } from "./utils/save";
import { preloadTarotImages } from "./data/tarot";

preloadTarotImages();

// Persist to localStorage after every dispatch.
// Guards prevent saving incomplete state during multi-dispatch operations.
store.subscribe(() => {
  const state = store.getState();
  const { player, area: a, combat, screen } = state;

  if (screen === "title" || screen === "intro" || !player) return;
  // Skip if screen requires area but it isn't set yet (mid-continueGame)
  if ((screen === "map" || screen === "combat") && !a.area) return;

  saveGame({
    player,
    screen,
    area: a.area,
    areaGrid: a.areaGrid,
    areaDef: a.areaDef,
    currentRoomId: a.currentRoomId,
    areaLog: a.areaLog,
    areaTurn: a.areaTurn,
    visitedAreas: a.visitedAreas,
    combat: combat.spawn
      ? {
          spawn: combat.spawn,
          // Only persist grid state at planning-phase checkpoints.
          // Mid-execution snapshots are dropped so reload rewinds to the
          // start of the current turn's planning phase.
          state: combat.state?.phase === "planning" ? combat.state : null,
        }
      : null,
  });
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
