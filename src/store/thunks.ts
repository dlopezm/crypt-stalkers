import { applyGridCombatResult } from "../utils/grid-helpers";
import type { AppDispatch, RootState } from "./index";
import { setPlayer } from "./playerSlice";
import { setScreen } from "./screenSlice";
import { updateArea, incrementTurn } from "./areaSlice";
import { setDeathContext, clearCombat, startGridCombat } from "./combatSlice";
import type { AreaNode } from "../types";
import type { GridPlayerState } from "../grid-combat/types";

/* ── tickAI — STUB (area AI not yet ported to grid combat) ── */
export function tickAI(currentArea: AreaNode[], _roomId: string, _action: string) {
  return (dispatch: AppDispatch): { newArea: AreaNode[] } => {
    dispatch(incrementTurn());
    return { newArea: currentArea };
  };
}

export { startGridCombat };

export function gridCombatVictory(result: GridPlayerState, loot: number) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const { area: areaState, player: currentPlayer } = getState();
    const { area, areaDef, currentRoomId } = areaState;
    if (!area || !currentRoomId || !currentPlayer) {
      return;
    }

    const curRoom = area.find((r) => r.id === currentRoomId);

    const base = area.map((n) => {
      if (n.id !== currentRoomId) {
        return n;
      }
      return { ...n, state: "visited" as const, enemies: [] };
    });

    const newArea = base.map((n) => {
      if (n.state === "locked" && curRoom?.connections.includes(n.id)) {
        return { ...n, state: "reachable" as const };
      }
      return n;
    });

    const { newArea: afterAI } = dispatch(tickAI(newArea, currentRoomId, "combat"));
    dispatch(updateArea(afterAI));

    const updated = applyGridCombatResult(currentPlayer, result);
    const withLoot = { ...updated, salt: updated.salt + loot };

    if (curRoom?.boss && areaDef?.bossRoom) {
      dispatch(setPlayer({ ...withLoot, hp: withLoot.maxHp }));
      dispatch(clearCombat());
      dispatch(setScreen("victory"));
      return;
    }

    dispatch(setPlayer(withLoot));
    dispatch(clearCombat());
    dispatch(setScreen("map"));
  };
}

export function gridCombatDefeat(enemyIds: readonly string[]) {
  return (dispatch: AppDispatch) => {
    dispatch(setDeathContext({ enemyIds: [...new Set(enemyIds)] }));
    dispatch(clearCombat());
    dispatch(setScreen("gameover"));
  };
}
