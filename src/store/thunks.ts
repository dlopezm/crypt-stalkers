import type { AppDispatch, RootState } from "./index";
import type { AreaNode, CombatVictoryResult } from "../types";
import { setPlayer } from "./playerSlice";
import { setScreen } from "./screenSlice";
import { updateArea, incrementTurn } from "./areaSlice";
import { setDeathContext, clearCombat, startCombat } from "./combatSlice";

/* ── tickAI — STUB (area AI not yet implemented) ── */
export function tickAI(currentArea: AreaNode[], _roomId: string, _action: string) {
  return (dispatch: AppDispatch): { newArea: AreaNode[] } => {
    dispatch(incrementTurn());
    return { newArea: currentArea };
  };
}

export { startCombat };

export function combatVictory(result: CombatVictoryResult, loot: number) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const { area: areaState, player: currentPlayer } = getState();
    const { area, areaDef, currentRoomId } = areaState;
    if (!area || !currentRoomId || !currentPlayer) return;

    const curRoom = area.find((r) => r.id === currentRoomId);

    const base = area.map((n) =>
      n.id !== currentRoomId ? n : { ...n, state: "visited" as const, enemies: [] },
    );
    const newArea = base.map((n) =>
      n.state === "locked" && curRoom?.connections.includes(n.id)
        ? { ...n, state: "reachable" as const }
        : n,
    );

    const { newArea: afterAI } = dispatch(tickAI(newArea, currentRoomId, "combat"));
    dispatch(updateArea(afterAI));

    const withLoot = {
      ...currentPlayer,
      hp: result.hp,
      maxHp: result.maxHp,
      salt: result.salt + loot,
      consumables: [...result.consumables],
    };

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

export function combatDefeat(enemyIds: readonly string[]) {
  return (dispatch: AppDispatch) => {
    dispatch(setDeathContext({ enemyIds: [...new Set(enemyIds)] }));
    dispatch(clearCombat());
    dispatch(setScreen("gameover"));
  };
}
