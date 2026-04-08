import { TRAP_INFO, AREAS } from "./data/rooms";
import { REST_HEAL_FRACTION, BLOCK_DOOR_COST, GAME_OVER_GOLD_KEEP } from "./data/constants";
import { makeStarterPlayer, makeEnemyData } from "./utils/helpers";
import { generateArea } from "./utils/area";
import { loadGame, clearSave, hasSave } from "./utils/save";
import { TitleScreen } from "./components/TitleScreen";
import { TownScreen } from "./components/TownScreen";
import { AuthoredAreaEditor } from "./components/editor/AuthoredAreaEditor";
import { AreaMap } from "./components/area/AreaMap";
import { CombatScreen } from "./components/CombatScreen";
import { VictoryScreen, GameOverScreen } from "./components/EndScreens";
import type { AreaNode, AreaDef, AreaLogEntry, Player } from "./types";
import { useAppDispatch, useAppSelector } from "./store";
import { setScreen } from "./store/screenSlice";
import { setPlayer } from "./store/playerSlice";
import {
  setAreaFull,
  updateArea,
  setCurrentRoomId,
  addLogEntries,
  clearArea,
  switchArea,
} from "./store/areaSlice";
import { startCombat, clearCombat } from "./store/combatSlice";
import { toggleDebugMode, toggleShowDebug, setShowDebug } from "./store/debugSlice";
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
    dispatch(setScreen("town"));
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

  /* ── Town: update player (unlock, buy, upgrade) ── */
  function updatePlayerAndSave(p: Player) {
    dispatch(setPlayer(p));
  }

  /* ── Enter Area from Town ── */
  function enterArea(def: AreaDef) {
    if (!player) return;
    const { nodes, grid } = generateArea(def);
    const startNode = nodes.find((n) => n.slot === "start") ?? nodes[0];
    dispatch(
      setAreaFull({
        area: nodes,
        areaGrid: grid,
        areaDef: def,
        currentRoomId: startNode?.id ?? "start",
        areaLog: [],
        areaTurn: 0,
      }),
    );
    dispatch(clearCombat());
    dispatch(setScreen("map"));
  }

  /* ── Return to Town ── */
  function returnToTown(p?: Player) {
    if (p) dispatch(setPlayer(p));
    dispatch(clearArea());
    dispatch(clearCombat());
    dispatch(setScreen("town"));
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
    if (!area || !currentRoomId) return;
    const room = area.find((n) => n.id === roomId);
    if (!room) return;
    if (room.blocked) return;
    const currentRoom = area.find((n) => n.id === currentRoomId);
    if (!debugMode && currentRoom && !currentRoom.connections.includes(roomId)) return;

    // Cross-area exit pseudo-room
    if (room.exit) {
      const targetDef = AREAS.find((a) => a.id === room.exit!.toAreaId);
      if (!targetDef) return;
      addLog([`\u{1F6AA} Stepped through to ${room.label}`], "player");
      // Build fresh area data; switchArea reducer will use it only if not already visited.
      const { nodes: freshNodes, grid: freshGrid } = generateArea(targetDef);
      const targetNode = freshNodes.find((n) => n.gridRoomId === room.exit!.toRoomGridId);
      const targetRoomId = targetNode?.id;
      if (!targetRoomId) return;
      dispatch(
        switchArea({
          toAreaId: targetDef.id,
          targetRoomId,
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
    const healAmt = Math.floor(player.maxHp * REST_HEAL_FRACTION);
    const newPlayer = { ...player, hp: Math.min(player.maxHp, player.hp + healAmt) };
    dispatch(setPlayer(newPlayer));
    addLog([`\u{1FA79} Rested (+${healAmt} HP)`], "player");
    const { newArea: afterAI } = tickAI(area, currentRoomId, "rest");
    if (!checkAmbush(afterAI, currentRoomId, { player: newPlayer })) {
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
    if (!player) return;
    dispatch(setPlayer({ ...player, gold: player.gold - TRAP_INFO[trapKey].cost }));
    if (area)
      dispatch(updateArea(area.map((n) => (n.id === roomId ? { ...n, trap: trapKey } : n))));
    addLog(
      [`\u{1FAA4} Trap set in ${area?.find((n) => n.id === roomId)?.label || roomId}`],
      "player",
    );
  }

  function onBlockDoor(roomId: string) {
    if (!player) return;
    dispatch(setPlayer({ ...player, gold: player.gold - BLOCK_DOOR_COST }));
    if (area)
      dispatch(updateArea(area.map((n) => (n.id === roomId ? { ...n, blocked: true } : n))));
    addLog(
      [`\u{1F6A7} Door blocked in ${area?.find((n) => n.id === roomId)?.label || roomId}`],
      "player",
    );
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

  if (screen === "town" && player) {
    return (
      <TownScreen
        player={player}
        onUpdatePlayer={updatePlayerAndSave}
        onEnterDungeon={enterArea}
        onOpenEditor={() => dispatch(setScreen("editor"))}
      />
    );
  }

  if (screen === "editor") {
    return <AuthoredAreaEditor onBack={() => dispatch(setScreen("town"))} />;
  }

  if (screen === "victory") {
    return <VictoryScreen gold={player?.gold || 0} onReturn={() => returnToTown()} />;
  }

  if (screen === "gameover") {
    const penaltyGold = Math.floor((player?.gold || 0) * GAME_OVER_GOLD_KEEP);
    return (
      <GameOverScreen
        gold={penaltyGold}
        onReturn={() => {
          if (player)
            dispatch(setPlayer({ ...player, gold: penaltyGold, hp: player.maxHp, statuses: {} }));
          returnToTown();
        }}
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
          onToggleDebug={() => dispatch(toggleDebugMode())}
          onReturnToTown={() => returnToTown()}
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
