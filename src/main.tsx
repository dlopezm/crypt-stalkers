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
  const { player, dungeon: d, combat, screen } = state;

  if (screen === "title" || !player) return;
  // Skip if screen requires dungeon but it isn't set yet (mid-continueGame)
  if ((screen === "map" || screen === "combat") && !d.dungeon) return;

  saveGame({
    player,
    screen,
    dungeon: d.dungeon,
    dungeonGrid: d.dungeonGrid,
    dungeonDef: d.dungeonDef,
    currentRoomId: d.currentRoomId,
    dungeonLog: d.dungeonLog,
    dungeonTurn: d.dungeonTurn,
    combat:
      combat.enemies && combat.combatPlayer
        ? {
            enemies: combat.enemies,
            combatPlayer: combat.combatPlayer,
            lightLevel: combat.lightLevel,
            combatLog: combat.combatLog,
            surpriseRound: combat.surpriseRound,
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
