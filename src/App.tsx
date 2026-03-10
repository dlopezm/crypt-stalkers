import { useState } from "react";
import { TRAP_INFO, TYPE_COLOR } from "./data/rooms";
import {
  REST_HEAL_FRACTION,
  BLOCK_DOOR_COST,
  GAME_OVER_GOLD_KEEP,
  DUNGEON_LOG_MAX,
} from "./data/constants";
import { makeStarterPlayer } from "./utils/helpers";
import { generateDungeon, runDungeonAI } from "./utils/dungeon";
import { saveGame, loadGame, clearSave, hasSave, type CombatSave } from "./utils/save";
import { TitleScreen } from "./components/TitleScreen";
import { TownScreen } from "./components/TownScreen";
import { DungeonMap } from "./components/DungeonMap";
import { CombatScreen } from "./components/CombatScreen";
import { VictoryScreen, GameOverScreen } from "./components/EndScreens";
import type { DungeonNode, DungeonDef, Player, CombatPlayer, DungeonLogEntry } from "./types";

type Screen = "title" | "town" | "map" | "combat" | "victory" | "gameover";

export default function App() {
  const [screen, setScreen] = useState<Screen>("title");
  const [dungeon, setDungeon] = useState<DungeonNode[] | null>(null);
  const [dungeonDef, setDungeonDef] = useState<DungeonDef | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [dungeonLog, setDungeonLog] = useState<DungeonLogEntry[]>([]);
  const [dungeonTurn, setDungeonTurn] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [combatSave, setCombatSave] = useState<CombatSave | null>(null);

  function doSave(opts: {
    scr: Screen;
    p?: Player;
    d?: DungeonNode[] | null;
    dd?: DungeonDef | null;
    rid?: string | null;
    dl?: DungeonLogEntry[];
    dt?: number;
    combat?: CombatSave | null;
  }) {
    const sp = opts.p ?? player;
    if (!sp) return;
    saveGame({
      player: sp,
      screen: opts.scr,
      dungeon: opts.d !== undefined ? opts.d : dungeon,
      dungeonDef: opts.dd !== undefined ? opts.dd : dungeonDef,
      currentRoomId: opts.rid !== undefined ? opts.rid : currentRoomId,
      dungeonLog: opts.dl ?? dungeonLog,
      dungeonTurn: opts.dt ?? dungeonTurn,
      combat: opts.combat ?? null,
    });
  }

  function addLog(entries: string[]) {
    const turn = dungeonTurn;
    setDungeonLog((prev) =>
      [...prev, ...entries.map((e) => ({ turn, text: e }))].slice(-DUNGEON_LOG_MAX),
    );
  }

  function tickAI(currentDungeon: DungeonNode[], roomId: string, action: string) {
    const { newDungeon, log } = runDungeonAI(currentDungeon, roomId, action);
    setDungeonTurn((t) => t + 1);
    if (log.length) addLog(log);
    return newDungeon;
  }

  /* ── New Game ── */
  function startNewGame() {
    setPlayer(makeStarterPlayer());
    setScreen("town");
    clearSave();
  }

  /* ── Continue from Save ── */
  function continueGame() {
    const save = loadGame();
    if (!save) return;
    setPlayer(save.player);
    setDungeon(save.dungeon);
    setDungeonDef(save.dungeonDef);
    setCurrentRoomId(save.currentRoomId);
    setDungeonLog(save.dungeonLog);
    setDungeonTurn(save.dungeonTurn);
    setCombatSave(save.combat);
    setScreen(save.screen);
  }

  /* ── Town: update player (unlock, buy, upgrade) → save ── */
  function updatePlayerAndSave(p: Player) {
    setPlayer(p);
    doSave({ scr: "town", p });
  }

  /* ── Enter Dungeon from Town ── */
  function enterDungeon(def: DungeonDef) {
    if (!player) return;
    const d = generateDungeon(def);
    setDungeon(d);
    setDungeonDef(def);
    setCurrentRoomId("start");
    setDungeonLog([]);
    setDungeonTurn(0);
    setScreen("map");
    doSave({ scr: "map", d, dd: def, rid: "start", dl: [], dt: 0 });
  }

  /* ── Return to Town ── */
  function returnToTown(p?: Player) {
    if (p) setPlayer(p);
    setDungeon(null);
    setDungeonDef(null);
    setCurrentRoomId(null);
    setCombatSave(null);
    setScreen("town");
    doSave({ scr: "town", p: p ?? undefined, d: null, dd: null, rid: null, dl: [], dt: 0 });
  }

  /* ── Dungeon Navigation ── */
  function enterRoom(roomId: string) {
    if (!dungeon || !currentRoomId) return;
    const room = dungeon.find((n) => n.id === roomId);
    if (!room) return;
    const currentRoom = dungeon.find((n) => n.id === currentRoomId);
    if (!debugMode && currentRoom && !currentRoom.connections.includes(roomId)) return;
    const afterAI = tickAI(dungeon, roomId, "move");
    setDungeon(afterAI);
    setCurrentRoomId(roomId);
    const newScreen = room.type === "combat" || room.type === "boss" ? "combat" : "map";
    if (newScreen === "combat") setScreen("combat");
    setCombatSave(null);
    doSave({ scr: newScreen as Screen, d: afterAI, rid: roomId });
  }

  /* ── Combat turn ended → save mid-combat state ── */
  function onCombatTurnEnd(combat: CombatSave) {
    setCombatSave(combat);
    doSave({ scr: "combat", combat });
  }

  function onCombatVictory(newPlayer: CombatPlayer) {
    if (!dungeon || !currentRoomId) return;
    const afterAI = tickAI(dungeon, currentRoomId, "combat");
    const newDungeon = (() => {
      const base = afterAI.map((n) =>
        n.id === currentRoomId ? { ...n, state: "cleared" as const, enemies: [] } : n,
      );
      return base.map((n) => {
        if (
          n.state === "locked" &&
          afterAI.find((r) => r.id === currentRoomId)?.connections.includes(n.id)
        )
          return { ...n, state: "reachable" as const };
        return n;
      });
    })();
    setDungeon(newDungeon);
    const { block: _b, stealthActive: _st, counterActive: _c, ...playerState } = newPlayer;
    const room = dungeon.find((n) => n.id === currentRoomId);
    if (room?.type === "boss") {
      const victoryPlayer = { ...playerState, hp: playerState.maxHp };
      setPlayer(victoryPlayer);
      setScreen("victory");
      setCombatSave(null);
      doSave({ scr: "victory", p: victoryPlayer, d: newDungeon });
      return;
    }
    setPlayer(playerState);
    setScreen("map");
    setCombatSave(null);
    doSave({ scr: "map", p: playerState, d: newDungeon });
  }

  function onCombatDefeat(gold: number) {
    const newPlayer = player ? { ...player, gold } : player;
    setPlayer(newPlayer);
    setScreen("gameover");
    setCombatSave(null);
    if (newPlayer) {
      doSave({ scr: "gameover", p: newPlayer });
    }
  }

  function onFleeToMap(newPlayer: CombatPlayer) {
    if (!dungeon || !currentRoomId) return;
    const afterAI = tickAI(dungeon, currentRoomId, "move");
    setDungeon(afterAI);
    const { block: _b, stealthActive: _st, counterActive: _c, ...playerState } = newPlayer;
    setPlayer(playerState);
    setScreen("map");
    setCombatSave(null);
    doSave({ scr: "map", p: playerState, d: afterAI });
  }

  function onRestOnMap() {
    if (!dungeon || !currentRoomId || !player) return;
    const healAmt = Math.floor(player.maxHp * REST_HEAL_FRACTION);
    const newPlayer = { ...player, hp: Math.min(player.maxHp, player.hp + healAmt) };
    setPlayer(newPlayer);
    const afterAI = tickAI(dungeon, currentRoomId, "rest");
    setDungeon(afterAI);
    doSave({ scr: "map", p: newPlayer, d: afterAI });
  }

  function onSetTrap(roomId: string, trapKey: string) {
    setPlayer((p) => (p ? { ...p, gold: p.gold - TRAP_INFO[trapKey].cost } : p));
    setDungeon((prev) =>
      prev ? prev.map((n) => (n.id === roomId ? { ...n, trap: trapKey } : n)) : prev,
    );
    addLog([
      `\u{1FAA4} [T${dungeonTurn}] Trap set in ${dungeon?.find((n) => n.id === roomId)?.label || roomId}`,
    ]);
  }

  function onBlockDoor(roomId: string) {
    setPlayer((p) => (p ? { ...p, gold: p.gold - BLOCK_DOOR_COST } : p));
    setDungeon((prev) =>
      prev ? prev.map((n) => (n.id === roomId ? { ...n, blocked: true } : n)) : prev,
    );
    addLog([
      `\u{1F6A7} [T${dungeonTurn}] Door blocked in ${dungeon?.find((n) => n.id === roomId)?.label || roomId}`,
    ]);
  }

  function onScout(roomId: string, scoutLevel: number) {
    if (!dungeon || !currentRoomId) return;
    const afterAI = tickAI(dungeon, currentRoomId, "scout");
    setDungeon(afterAI.map((n) => (n.id === roomId ? { ...n, scouted: true } : n)));
    addLog([
      `\u{1F50D} [T${dungeonTurn}] Scout (level ${scoutLevel}) on ${dungeon.find((n) => n.id === roomId)?.label || roomId}`,
    ]);
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
          if (player) setPlayer({ ...player, gold: penaltyGold, hp: player.maxHp, statuses: {} });
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
          onClick={() => setShowDebug(false)}
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
            <span style={{ color: TYPE_COLOR[n.type] || "#7f8c8d" }}>{n.label}</span> [{n.state}]
            {n.enemies.length > 0 && (
              <span className="text-red-400">
                {" "}
                {n.enemies.length}
                {"\u2716"} ({n.enemies.join(",")})
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
            className="text-[#9a8aaa] leading-relaxed border-b border-[#1a1428] pb-0.5 mb-0.5"
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
            onClick={() => setShowDebug((s) => !s)}
            className="fixed bottom-3 right-3 z-99 bg-[#2a1f40] border border-crypt-purple text-crypt-purple rounded px-3 py-1.5 cursor-pointer font-mono text-sm tracking-wider"
          >
            {"\u{1F6E0}"} {showDebug ? "Hide" : "Debug"}
          </button>
        )}
        <DungeonMap
          dungeon={dungeon}
          player={player}
          currentRoomId={currentRoomId}
          dungeonName={dungeonName}
          debugMode={debugMode}
          dungeonTurn={dungeonTurn}
          onEnterRoom={enterRoom}
          onScout={onScout}
          onSetTrap={onSetTrap}
          onBlockDoor={onBlockDoor}
          onRest={onRestOnMap}
          onToggleDebug={() => setDebugMode((d) => !d)}
          onReturnToTown={() => returnToTown()}
        />
      </>
    );

  if (screen === "combat") {
    const room = dungeon.find((n) => n.id === currentRoomId);
    if (!room) return null;
    return (
      <CombatScreen
        room={room}
        player={player}
        onVictory={onCombatVictory}
        onDefeat={onCombatDefeat}
        onFleeToMap={onFleeToMap}
        onTurnEnd={onCombatTurnEnd}
        initialCombat={combatSave}
      />
    );
  }

  return null;
}
