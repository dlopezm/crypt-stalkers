import { TRAP_INFO } from "./data/rooms";
import { REST_HEAL_FRACTION, BLOCK_DOOR_COST, GAME_OVER_GOLD_KEEP } from "./data/constants";
import { makeStarterPlayer, makeEnemyData } from "./utils/helpers";
import { generateDungeon } from "./utils/dungeon";
import { loadGame, clearSave, hasSave } from "./utils/save";
import { TitleScreen } from "./components/TitleScreen";
import { TownScreen } from "./components/TownScreen";
import { DungeonMap } from "./components/DungeonMap";
import { CombatScreen } from "./components/CombatScreen";
import { VictoryScreen, GameOverScreen } from "./components/EndScreens";
import type { DungeonNode, DungeonDef, DungeonLogEntry, Player } from "./types";
import { useAppDispatch, useAppSelector } from "./store";
import { setScreen } from "./store/screenSlice";
import { setPlayer } from "./store/playerSlice";
import {
  setDungeonFull,
  updateDungeon,
  setCurrentRoomId,
  addLogEntries,
  clearDungeon,
} from "./store/dungeonSlice";
import { startCombat, clearCombat } from "./store/combatSlice";
import { toggleDebugMode, toggleShowDebug, setShowDebug } from "./store/debugSlice";
import { tickAI as tickAIThunk } from "./store/thunks";

export default function App() {
  const dispatch = useAppDispatch();

  const screen = useAppSelector((s) => s.screen);
  const player = useAppSelector((s) => s.player);
  const dungeon = useAppSelector((s) => s.dungeon.dungeon);
  const dungeonGrid = useAppSelector((s) => s.dungeon.dungeonGrid);
  const dungeonDef = useAppSelector((s) => s.dungeon.dungeonDef);
  const currentRoomId = useAppSelector((s) => s.dungeon.currentRoomId);
  const dungeonLog = useAppSelector((s) => s.dungeon.dungeonLog);
  const dungeonTurn = useAppSelector((s) => s.dungeon.dungeonTurn);
  const debugMode = useAppSelector((s) => s.debug.debugMode);
  const showDebug = useAppSelector((s) => s.debug.showDebug);
  const combatKey = useAppSelector((s) => s.combat.combatKey);

  function addLog(
    entries: { text: string; roomId?: string }[] | string[],
    source: "player" | "monster" | "system" = "system",
    debugOnly = false,
  ) {
    const logEntries: DungeonLogEntry[] = entries.map((e) => {
      const text = typeof e === "string" ? e : e.text;
      const roomId = typeof e === "string" ? undefined : e.roomId;
      return { turn: dungeonTurn, text, source, roomId, ...(debugOnly ? { debugText: text } : {}) };
    });
    dispatch(addLogEntries({ entries: logEntries }));
  }

  function tickAI(currentDungeon: DungeonNode[], roomId: string, action: string) {
    return dispatch(tickAIThunk(currentDungeon, roomId, action));
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
      setDungeonFull({
        dungeon: save.dungeon,
        dungeonGrid: save.dungeonGrid ?? null,
        dungeonDef: save.dungeonDef,
        currentRoomId: save.currentRoomId,
        dungeonLog: save.dungeonLog,
        dungeonTurn: save.dungeonTurn,
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

  /* ── Enter Dungeon from Town ── */
  function enterDungeon(def: DungeonDef) {
    if (!player) return;
    const { nodes, grid } = generateDungeon(def);
    dispatch(
      setDungeonFull({
        dungeon: nodes,
        dungeonGrid: grid,
        dungeonDef: def,
        currentRoomId: "start",
        dungeonLog: [],
        dungeonTurn: 0,
      }),
    );
    dispatch(clearCombat());
    dispatch(setScreen("map"));
  }

  /* ── Return to Town ── */
  function returnToTown(p?: Player) {
    if (p) dispatch(setPlayer(p));
    dispatch(clearDungeon());
    dispatch(clearCombat());
    dispatch(setScreen("town"));
  }

  /* ── Check if the player's room has enemies after an AI tick ── */
  function checkAmbush(
    afterAI: DungeonNode[],
    roomId: string,
    opts?: { player?: Player },
  ): boolean {
    const roomAfterAI = afterAI.find((n) => n.id === roomId);
    if (!roomAfterAI || roomAfterAI.enemies.length === 0) return false;

    const updated = afterAI.map((n) => (n.id === roomId ? { ...n, state: "visited" as const } : n));
    dispatch(updateDungeon(updated));
    addLog(["\u26A0\uFE0F Monsters have found you!"], "system");
    if (opts?.player) dispatch(setPlayer(opts.player));
    dispatch(
      startCombat({
        enemies: roomAfterAI.enemies.map((e) => makeEnemyData(e.typeId, e.uid)),
        combatPlayer: null,
        surpriseRound: true,
      }),
    );
    dispatch(setScreen("combat"));
    return true;
  }

  /* ── Dungeon Navigation ── */
  function enterRoom(roomId: string) {
    if (!dungeon || !currentRoomId) return;
    const room = dungeon.find((n) => n.id === roomId);
    if (!room) return;
    if (room.blocked) return;
    const currentRoom = dungeon.find((n) => n.id === currentRoomId);
    if (!debugMode && currentRoom && !currentRoom.connections.includes(roomId)) return;

    addLog([`\u{1F6B6} Moved to ${room.label}`], "player");
    const hasEnemies = room.enemies.length > 0;
    const marked = dungeon.map((n) => {
      if (n.id !== roomId || n.state === "cleared") return n;
      return { ...n, state: hasEnemies ? ("visited" as const) : ("cleared" as const) };
    });
    const unlocked = hasEnemies
      ? marked
      : marked.map((n) =>
          n.state === "locked" && room.connections.includes(n.id)
            ? { ...n, state: "reachable" as const }
            : n,
        );

    const { newDungeon: afterAI } = tickAI(unlocked, roomId, "move");
    dispatch(setCurrentRoomId(roomId));

    if (hasEnemies) {
      dispatch(updateDungeon(afterAI));
      dispatch(
        startCombat({
          enemies: room.enemies.map((e) => makeEnemyData(e.typeId, e.uid)),
          combatPlayer: null,
          surpriseRound: false,
        }),
      );
      dispatch(setScreen("combat"));
    } else if (!checkAmbush(afterAI, roomId)) {
      dispatch(updateDungeon(afterAI));
    }
  }

  /* ── Map actions ── */
  function onRestOnMap() {
    if (!dungeon || !currentRoomId || !player) return;
    const healAmt = Math.floor(player.maxHp * REST_HEAL_FRACTION);
    const newPlayer = { ...player, hp: Math.min(player.maxHp, player.hp + healAmt) };
    dispatch(setPlayer(newPlayer));
    addLog([`\u{1FA79} Rested (+${healAmt} HP)`], "player");
    const { newDungeon: afterAI } = tickAI(dungeon, currentRoomId, "rest");
    if (!checkAmbush(afterAI, currentRoomId, { player: newPlayer })) {
      dispatch(updateDungeon(afterAI));
    }
  }

  function onSwitchWeaponOnMap(idx: number) {
    if (!player) return;
    dispatch(setPlayer({ ...player, activeWeaponIdx: idx }));
  }

  function onSetTrap(roomId: string, trapKey: string) {
    if (!player) return;
    dispatch(setPlayer({ ...player, gold: player.gold - TRAP_INFO[trapKey].cost }));
    if (dungeon)
      dispatch(updateDungeon(dungeon.map((n) => (n.id === roomId ? { ...n, trap: trapKey } : n))));
    addLog(
      [`\u{1FAA4} Trap set in ${dungeon?.find((n) => n.id === roomId)?.label || roomId}`],
      "player",
    );
  }

  function onBlockDoor(roomId: string) {
    if (!player) return;
    dispatch(setPlayer({ ...player, gold: player.gold - BLOCK_DOOR_COST }));
    if (dungeon)
      dispatch(updateDungeon(dungeon.map((n) => (n.id === roomId ? { ...n, blocked: true } : n))));
    addLog(
      [`\u{1F6A7} Door blocked in ${dungeon?.find((n) => n.id === roomId)?.label || roomId}`],
      "player",
    );
  }

  function onScout(roomId: string, _scoutLevel: number) {
    if (!dungeon || !currentRoomId) return;
    const { newDungeon: afterAI } = tickAI(dungeon, currentRoomId, "scout");
    const scoutedDungeon = afterAI.map((n) => (n.id === roomId ? { ...n, scouted: true } : n));
    addLog(
      [`\u{1F50D} Scouted ${dungeon.find((n) => n.id === roomId)?.label || roomId}`],
      "player",
    );
    if (!checkAmbush(scoutedDungeon, currentRoomId)) {
      dispatch(updateDungeon(scoutedDungeon));
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
        onEnterDungeon={enterDungeon}
      />
    );
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

  if (!dungeon || !player || !currentRoomId) return null;

  const dungeonName = dungeonDef?.name || "The Crypt";

  const debugOverlay = showDebug && debugMode && (
    <div className="fixed top-0 right-0 w-[380px] h-screen bg-[#080610ee] border-l border-[#2a1f40] z-100 flex flex-col overflow-hidden font-mono text-sm">
      <div className="px-3 py-2 border-b border-[#2a1f40] flex justify-between items-center bg-[#0f0c1a]">
        <span className="text-crypt-purple font-bold tracking-wider">
          {"\u{1F6E0}"} DEBUG {"\u2014"} Turn {dungeonTurn}
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
        {dungeon.map((n) => (
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
        {[...dungeonLog].reverse().map((entry, i) => (
          <div
            key={i}
            className={`leading-relaxed border-b border-[#1a1428] pb-0.5 mb-0.5 ${entry.debugText ? "text-crypt-purple" : "text-[#9a8aaa]"}`}
          >
            <span className="text-[#6a5a8a]">[T{entry.turn}]</span> {entry.text}
          </div>
        ))}
        {!dungeonLog.length && <div className="text-[#3a2a50] italic">No AI actions yet.</div>}
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
        <DungeonMap
          dungeon={dungeon}
          dungeonGrid={dungeonGrid}
          player={player}
          currentRoomId={currentRoomId}
          dungeonName={dungeonName}
          debugMode={debugMode}
          dungeonTurn={dungeonTurn}
          dungeonLog={dungeonLog}
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
    const room = dungeon.find((n) => n.id === currentRoomId);
    if (!room) return null;
    return <CombatScreen key={combatKey} room={room} />;
  }

  return null;
}
