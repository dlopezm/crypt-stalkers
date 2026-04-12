import { TRAP_INFO, AREAS } from "./data/rooms";
import { REST_HEAL_FRACTION, SAFE_REST_HEAL_FRACTION } from "./data/constants";
import { WEAPONS } from "./data/weapons";
import { CONSUMABLES } from "./data/consumables";
import { ABILITIES } from "./data/abilities";
import { determineEnding } from "./data/endings";
import { makeStarterPlayer, makeEnemyData } from "./utils/helpers";
import { generateArea } from "./utils/area";
import { loadGame, clearSave, hasSave } from "./utils/save";
import { TitleScreen } from "./components/TitleScreen";
import { IntroScreen } from "./components/IntroScreen";
import { AuthoredAreaEditor } from "./components/editor/AuthoredAreaEditor";
import { AreaMap } from "./components/area/AreaMap";
import { CombatScreen } from "./components/CombatScreen";
import { VictoryScreen, GameOverScreen } from "./components/EndScreens";
import type { AreaNode, AreaDef, AreaLogEntry, Player, PropEffect } from "./types";
import { useAppDispatch, useAppSelector } from "./store";
import { setScreen } from "./store/screenSlice";
import { setPlayer, setFlag } from "./store/playerSlice";
import {
  setAreaFull,
  updateArea,
  setCurrentRoomId,
  addLogEntries,
  clearArea,
  switchArea,
  updatePropState,
} from "./store/areaSlice";
import { canPerformAction, evaluateEffects } from "./utils/props";
import { startCombat, clearCombat, clearDeathContext } from "./store/combatSlice";
import { toggleDebugMode, toggleShowDebug, setShowDebug } from "./store/debugSlice";
import { saveRoomCheckpoint, saveAreaCheckpoint, type Checkpoint } from "./store/checkpointSlice";
import { tickAI as tickAIThunk } from "./store/thunks";

export default function App() {
  const dispatch = useAppDispatch();

  const screen = useAppSelector((s) => s.screen);
  const player = useAppSelector((s) => s.player);
  const area = useAppSelector((s) => s.area.area);
  const areaGrid = useAppSelector((s) => s.area.areaGrid);
  const areaDef = useAppSelector((s) => s.area.areaDef);
  const currentRoomId = useAppSelector((s) => s.area.currentRoomId);
  const areaLog = useAppSelector((s) => s.area.areaLog);
  const areaTurn = useAppSelector((s) => s.area.areaTurn);
  const debugMode = useAppSelector((s) => s.debug.debugMode);
  const showDebug = useAppSelector((s) => s.debug.showDebug);
  const combatKey = useAppSelector((s) => s.combat.combatKey);
  const deathContext = useAppSelector((s) => s.combat.deathContext);
  const roomCheckpoint = useAppSelector((s) => s.checkpoint.room);
  const areaCheckpoint = useAppSelector((s) => s.checkpoint.area);
  const visitedAreas = useAppSelector((s) => s.area.visitedAreas);

  function addLog(
    entries: { text: string; roomId?: string }[] | string[],
    source: "player" | "monster" | "system" = "system",
    debugOnly = false,
  ) {
    const logEntries: AreaLogEntry[] = entries.map((e) => {
      const text = typeof e === "string" ? e : e.text;
      const roomId = typeof e === "string" ? undefined : e.roomId;
      return { turn: areaTurn, text, source, roomId, ...(debugOnly ? { debugText: text } : {}) };
    });
    dispatch(addLogEntries({ entries: logEntries }));
  }

  function tickAI(currentArea: AreaNode[], roomId: string, action: string) {
    return dispatch(tickAIThunk(currentArea, roomId, action));
  }

  /* ── New Game ── */
  function startNewGame() {
    clearSave();
    dispatch(setPlayer(makeStarterPlayer()));
    dispatch(setScreen("intro"));
  }

  /* ── Continue from Save ── */
  function continueGame() {
    const save = loadGame();
    if (!save) return;
    dispatch(setPlayer(save.player));
    dispatch(
      setAreaFull({
        area:
          save.area?.map((n) => ({
            ...n,
            corpses: n.corpses ?? {},
            necroRitual: n.necroRitual ?? null,
          })) ?? null,
        areaGrid: save.areaGrid ?? null,
        areaDef: save.areaDef,
        currentRoomId: save.currentRoomId,
        areaLog: save.areaLog,
        areaTurn: save.areaTurn,
        visitedAreas: save.visitedAreas ?? {},
      }),
    );
    if (save.combat) {
      dispatch(
        startCombat({
          enemies: save.combat.enemies,
          combatPlayer: save.combat.combatPlayer,
          surpriseRound: save.combat.surpriseRound ?? false,
          lightLevel: save.combat.lightLevel,
          combatLog: save.combat.combatLog,
        }),
      );
    } else {
      dispatch(clearCombat());
    }
    dispatch(setScreen(save.screen));
  }

  /* ── Enter Area ── */
  function enterArea(def: AreaDef) {
    if (!player) return;
    const { nodes, grid } = generateArea(def);
    const startNode = nodes.find((n) => n.slot === "start") ?? nodes[0];
    const startRoomId = startNode?.id ?? "start";

    dispatch(
      setAreaFull({
        area: nodes,
        areaGrid: grid,
        areaDef: def,
        currentRoomId: startRoomId,
        areaLog: [],
        areaTurn: 0,
      }),
    );
    dispatch(clearCombat());

    const cp: Checkpoint = {
      player,
      area: nodes,
      areaGrid: grid,
      areaDef: def,
      currentRoomId: startRoomId,
      areaLog: [],
      areaTurn: 0,
      visitedAreas,
    };
    dispatch(saveAreaCheckpoint(cp));
    dispatch(saveRoomCheckpoint(cp));

    dispatch(setScreen("map"));
  }

  function returnToTitle() {
    clearSave();
    dispatch(clearArea());
    dispatch(clearCombat());
    dispatch(setScreen("title"));
  }

  /* ── Check if the player's room has enemies after an AI tick ── */
  function checkAmbush(afterAI: AreaNode[], roomId: string, opts?: { player?: Player }): boolean {
    const roomAfterAI = afterAI.find((n) => n.id === roomId);
    if (!roomAfterAI || roomAfterAI.enemies.length === 0) return false;

    const updated = afterAI.map((n) => (n.id === roomId ? { ...n, state: "visited" as const } : n));
    dispatch(updateArea(updated));
    addLog(["\u26A0\uFE0F Monsters have found you!"], "system");
    if (opts?.player) dispatch(setPlayer(opts.player));
    dispatch(
      startCombat({
        enemies: roomAfterAI.enemies.map((e) => makeEnemyData(e.typeId, e.uid, e.hpOverride)),
        combatPlayer: null,
        surpriseRound: true,
      }),
    );
    dispatch(setScreen("combat"));
    return true;
  }

  /* ── Area Navigation ── */
  function enterRoom(roomId: string) {
    if (!area || !currentRoomId || !player || !areaGrid || !areaDef) return;
    const room = area.find((n) => n.id === roomId);
    if (!room) return;
    if (room.blocked) return;
    const currentRoom = area.find((n) => n.id === currentRoomId);
    if (!debugMode && currentRoom && !currentRoom.connections.includes(roomId)) return;

    dispatch(
      saveRoomCheckpoint({
        player,
        area,
        areaGrid,
        areaDef,
        currentRoomId,
        areaLog,
        areaTurn,
        visitedAreas,
      }),
    );

    // Cross-area exit pseudo-room
    if (room.exit) {
      const targetDef = AREAS.find((a) => a.id === room.exit!.toAreaId);
      if (!targetDef) return;
      addLog([`\u{1F6AA} Stepped through to ${room.label}`], "player");
      // Build fresh area data; switchArea reducer will use it only if not already visited.
      const { nodes: freshNodes, grid: freshGrid } = generateArea(targetDef);
      dispatch(
        switchArea({
          toAreaId: targetDef.id,
          targetGridRoomId: room.exit!.toRoomGridId,
          fresh: { area: freshNodes, grid: freshGrid, def: targetDef },
        }),
      );
      return;
    }

    addLog([`\u{1F6B6} Moved to ${room.label}`], "player");
    const hasEnemies = room.enemies.length > 0;
    const marked = area.map((n) => {
      if (n.id !== roomId) return n;
      return { ...n, state: "visited" as const };
    });
    const unlocked = hasEnemies
      ? marked
      : marked.map((n) =>
          n.state === "locked" && room.connections.includes(n.id)
            ? { ...n, state: "reachable" as const }
            : n,
        );

    const { newArea: afterAI } = tickAI(unlocked, roomId, "move");
    dispatch(setCurrentRoomId(roomId));

    if (hasEnemies) {
      dispatch(updateArea(afterAI));
      dispatch(
        startCombat({
          enemies: room.enemies.map((e) => makeEnemyData(e.typeId, e.uid, e.hpOverride)),
          combatPlayer: null,
          surpriseRound: false,
        }),
      );
      dispatch(setScreen("combat"));
    } else if (!checkAmbush(afterAI, roomId)) {
      dispatch(updateArea(afterAI));
    }
  }

  /* ── Map actions ── */
  function onRestOnMap() {
    if (!area || !currentRoomId || !player) return;
    const curRoom = area.find((n) => n.id === currentRoomId);
    const isSafe = curRoom?.safeRoom === true;
    const fraction = isSafe ? SAFE_REST_HEAL_FRACTION : REST_HEAL_FRACTION;
    const healAmt = Math.floor(player.maxHp * fraction);
    const newPlayer = { ...player, hp: Math.min(player.maxHp, player.hp + healAmt) };
    dispatch(setPlayer(newPlayer));

    const safeLabel = isSafe ? " (safe)" : "";
    addLog([`\u{1FA79} Rested${safeLabel} (+${healAmt} HP)`], "player");

    const { newArea: afterAI } = tickAI(area, currentRoomId, "rest");
    const ambushed = !isSafe && checkAmbush(afterAI, currentRoomId, { player: newPlayer });
    if (!ambushed) {
      dispatch(updateArea(afterAI));
    }
  }

  function onSwitchWeaponOnMap(weaponId: string) {
    if (!player) return;
    const weapon = player.ownedWeapons.find((w) => w.id === weaponId);
    if (!weapon) return;
    const offhand = weapon.hand === "2" ? null : player.offhandWeapon;
    dispatch(setPlayer({ ...player, mainWeapon: weapon, offhandWeapon: offhand }));
  }

  function onSetTrap(roomId: string, trapKey: string) {
    if (!area || !currentRoomId) return;
    const trapped = area.map((n) => (n.id === roomId ? { ...n, trap: trapKey } : n));
    addLog(
      [`\u{1FAA4} Trap set in ${area.find((n) => n.id === roomId)?.label || roomId}`],
      "player",
    );
    const { newArea: afterAI } = tickAI(trapped, currentRoomId, "trap");
    if (!checkAmbush(afterAI, currentRoomId)) {
      dispatch(updateArea(afterAI));
    }
  }

  function onBlockDoor(roomId: string) {
    if (!area || !currentRoomId) return;
    const blocked = area.map((n) => (n.id === roomId ? { ...n, blocked: true } : n));
    addLog(
      [`\u{1F6A7} Door blocked in ${area.find((n) => n.id === roomId)?.label || roomId}`],
      "player",
    );
    const { newArea: afterAI } = tickAI(blocked, currentRoomId, "block");
    if (!checkAmbush(afterAI, currentRoomId)) {
      dispatch(updateArea(afterAI));
    }
  }

  /* ── Prop interactions ──
   * applyEffects dispatches each outcome separately so flag sets go through
   * setFlag (which reads current state) rather than being folded into a
   * single setPlayer that could clobber a concurrent update. */
  function applyEffects(effects: PropEffect[], roomId: string, propId: string) {
    if (!player) return;
    const outcome = evaluateEffects(effects);

    let updated = player;

    if (outcome.saltDelta !== 0 || outcome.hpDelta !== 0) {
      updated = {
        ...updated,
        salt: Math.max(0, updated.salt + outcome.saltDelta),
        hp: Math.max(0, Math.min(updated.maxHp, updated.hp + outcome.hpDelta)),
      };
    }

    for (const wId of outcome.grantedWeapons) {
      const weapon = WEAPONS.find((w) => w.id === wId);
      if (weapon && !updated.ownedWeapons.some((w) => w.id === wId)) {
        updated = { ...updated, ownedWeapons: [...updated.ownedWeapons, { ...weapon }] };
      }
    }

    for (const cId of outcome.grantedConsumables) {
      const consumable = CONSUMABLES.find((c) => c.id === cId);
      if (consumable) {
        updated = { ...updated, consumables: [...updated.consumables, { ...consumable }] };
      }
    }

    for (const aId of outcome.grantedAbilities) {
      const ability = ABILITIES.find((a) => a.id === aId);
      if (ability && !updated.abilities.includes(aId)) {
        updated = { ...updated, abilities: [...updated.abilities, aId] };
      }
    }

    if (updated !== player) {
      dispatch(setPlayer(updated));
    }

    for (const f of outcome.flagSets) {
      dispatch(setFlag({ flag: f.flag, value: f.value }));
    }

    if (outcome.logMessages.length > 0) {
      addLog(
        outcome.logMessages.map((text) => ({ text, roomId })),
        "player",
      );
    }

    if (outcome.consumed) {
      dispatch(updatePropState({ roomId, propId, patch: { consumed: true } }));
    }
  }

  function onExamineProp(roomId: string, propId: string) {
    if (!area) return;
    const room = area.find((n) => n.id === roomId);
    const prop = room?.props?.find((p) => p.id === propId);
    if (!prop) return;
    const state = room?.propStates?.[propId];
    // Examine effects fire exactly once. Re-opening an examined prop just
    // shows the dialog again without re-triggering flags/logs/etc.
    if (!state?.examined) {
      dispatch(updatePropState({ roomId, propId, patch: { examined: true } }));
      if (prop.onExamine && prop.onExamine.length > 0) {
        applyEffects(prop.onExamine, roomId, propId);
      }
    }
  }

  function onPropAction(roomId: string, propId: string, actionId: string) {
    if (!area || !player) return;
    const room = area.find((n) => n.id === roomId);
    const prop = room?.props?.find((p) => p.id === propId);
    const action = prop?.actions?.find((a) => a.id === actionId);
    if (!prop || !action) return;
    const state = room?.propStates?.[propId];
    const check = canPerformAction(action, player.flags, player.salt, state);
    if (!check.ok) return;
    const nextUsed = [...(state?.actionsUsed ?? []), actionId];
    dispatch(updatePropState({ roomId, propId, patch: { actionsUsed: nextUsed } }));
    applyEffects(action.effects, roomId, propId);
  }

  function onScout(roomId: string, _scoutLevel: number) {
    if (!area || !currentRoomId) return;
    const { newArea: afterAI } = tickAI(area, currentRoomId, "scout");
    const scoutedArea = afterAI.map((n) => (n.id === roomId ? { ...n, scouted: true } : n));
    addLog([`\u{1F50D} Scouted ${area.find((n) => n.id === roomId)?.label || roomId}`], "player");
    if (!checkAmbush(scoutedArea, currentRoomId)) {
      dispatch(updateArea(scoutedArea));
    }
  }

  /* ── Rendering ── */
  if (screen === "title")
    return (
      <TitleScreen
        onStart={startNewGame}
        onContinue={hasSave() ? continueGame : undefined}
        onClearSave={hasSave() ? clearSave : undefined}
      />
    );

  if (screen === "intro") {
    return (
      <IntroScreen
        onFinish={() => {
          const startArea = AREAS.find((a) => a.id === "a1_mine_mouth");
          if (startArea) {
            enterArea(startArea);
          }
        }}
      />
    );
  }

  if (screen === "editor") {
    return <AuthoredAreaEditor onBack={() => dispatch(setScreen("map"))} />;
  }

  if (screen === "victory") {
    const ending = determineEnding({
      salt: player?.salt || 0,
      flags: player?.flags || {},
    });
    return <VictoryScreen ending={ending} onReturn={() => returnToTitle()} />;
  }

  if (screen === "gameover") {
    function restoreCheckpoint(cp: Checkpoint) {
      dispatch(setPlayer(cp.player));
      dispatch(
        setAreaFull({
          area: cp.area,
          areaGrid: cp.areaGrid,
          areaDef: cp.areaDef,
          currentRoomId: cp.currentRoomId,
          areaLog: cp.areaLog,
          areaTurn: cp.areaTurn,
          visitedAreas: cp.visitedAreas,
        }),
      );
      dispatch(clearDeathContext());
      dispatch(clearCombat());
      dispatch(setScreen("map"));
    }

    return (
      <GameOverScreen
        onRetryRoom={roomCheckpoint ? () => restoreCheckpoint(roomCheckpoint) : undefined}
        onRetryArea={areaCheckpoint ? () => restoreCheckpoint(areaCheckpoint) : undefined}
        deathEnemyIds={deathContext?.enemyIds}
      />
    );
  }

  if (!area || !player || !currentRoomId) return null;

  const areaName = areaDef?.name || "The Crypt";

  const debugOverlay = showDebug && debugMode && (
    <div className="fixed top-0 right-0 w-[380px] h-screen bg-[#080610ee] border-l border-[#2a1f40] z-100 flex flex-col overflow-hidden font-mono text-sm">
      <div className="px-3 py-2 border-b border-[#2a1f40] flex justify-between items-center bg-[#0f0c1a]">
        <span className="text-crypt-purple font-bold tracking-wider">
          {"\u{1F6E0}"} DEBUG {"\u2014"} Turn {areaTurn}
        </span>
        <button
          onClick={() => dispatch(setShowDebug(false))}
          className="bg-transparent border-none text-[#6a5a8a] cursor-pointer text-base"
        >
          {"\u2715"}
        </button>
      </div>

      <div className="px-3 py-2 border-b border-[#1a1430] shrink-0">
        <div className="text-crypt-muted mb-1 tracking-wider text-xs">ROOMS</div>
        {area.map((n) => (
          <div
            key={n.id}
            className={`mb-1 leading-relaxed ${n.id === currentRoomId ? "text-crypt-gold" : "text-crypt-muted"}`}
          >
            {n.id === currentRoomId ? "\u25B6 " : "  "}
            <span style={{ color: "#7f8c8d" }}>{n.label}</span> [{n.state}]
            {n.enemies.length > 0 && (
              <span className="text-red-400">
                {" "}
                {n.enemies.length}
                {"\u2716"} ({n.enemies.map((e) => e.typeId).join(",")})
              </span>
            )}
            {n.trap && <span className="text-orange-400"> {TRAP_INFO[n.trap]?.icon}</span>}
            {n.blocked && <span className="text-crypt-blue"> {"\u{1F6A7}"}</span>}
            <button
              className="ml-2 bg-[#2a1f40] border-none text-crypt-purple cursor-pointer text-xs px-1 rounded"
              onClick={() => enterRoom(n.id)}
            >
              teleport
            </button>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="text-crypt-muted mb-1 tracking-wider text-xs">AI LOG (newest first)</div>
        {[...areaLog].reverse().map((entry, i) => (
          <div
            key={i}
            className={`leading-relaxed border-b border-[#1a1428] pb-0.5 mb-0.5 ${entry.debugText ? "text-crypt-purple" : "text-[#9a8aaa]"}`}
          >
            <span className="text-[#6a5a8a]">[T{entry.turn}]</span> {entry.text}
          </div>
        ))}
        {!areaLog.length && <div className="text-[#3a2a50] italic">No AI actions yet.</div>}
      </div>
    </div>
  );

  if (screen === "map")
    return (
      <>
        {debugOverlay}
        {debugMode && (
          <button
            onClick={() => dispatch(toggleShowDebug())}
            className="fixed bottom-3 right-3 z-99 bg-[#2a1f40] border border-crypt-purple text-crypt-purple rounded px-3 py-1.5 cursor-pointer font-mono text-sm tracking-wider"
          >
            {"\u{1F6E0}"} {showDebug ? "Hide" : "Debug"}
          </button>
        )}
        <AreaMap
          area={area}
          areaGrid={areaGrid}
          player={player}
          currentRoomId={currentRoomId}
          areaName={areaName}
          debugMode={debugMode}
          areaTurn={areaTurn}
          areaLog={areaLog}
          onEnterRoom={enterRoom}
          onScout={onScout}
          onSetTrap={onSetTrap}
          onBlockDoor={onBlockDoor}
          onRest={onRestOnMap}
          onSwitchWeapon={onSwitchWeaponOnMap}
          onExamineProp={onExamineProp}
          onPropAction={onPropAction}
          onToggleDebug={() => dispatch(toggleDebugMode())}
          onReturnToTitle={() => returnToTitle()}
          onOpenEditor={() => dispatch(setScreen("editor"))}
          onAddSalt={() => {
            if (player) {
              dispatch(setPlayer({ ...player, salt: player.salt + 500 }));
            }
          }}
        />
      </>
    );

  if (screen === "combat") {
    const room = area.find((n) => n.id === currentRoomId);
    if (!room) return null;
    return <CombatScreen key={combatKey} room={room} />;
  }

  return null;
}
