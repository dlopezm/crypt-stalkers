import { useState } from "react";
import { TRAP_INFO } from "./data/rooms";
import {
  REST_HEAL_FRACTION,
  BLOCK_DOOR_COST,
  GAME_OVER_GOLD_KEEP,
  DUNGEON_LOG_MAX,
} from "./data/constants";
import { makeStarterPlayer } from "./utils/helpers";
import { generateDungeon, runDungeonAI, roomDistances } from "./utils/dungeon";
import { saveGame, loadGame, clearSave, hasSave, type CombatSave } from "./utils/save";
import { TitleScreen } from "./components/TitleScreen";
import { TownScreen } from "./components/TownScreen";
import { DungeonMap } from "./components/DungeonMap";
import { CombatScreen } from "./components/CombatScreen";
import { VictoryScreen, GameOverScreen } from "./components/EndScreens";
import type {
  DungeonNode,
  DungeonDef,
  DungeonGrid,
  Player,
  CombatPlayer,
  DungeonLogEntry,
} from "./types";

type Screen = "title" | "town" | "map" | "combat" | "victory" | "gameover";

export default function App() {
  const [screen, setScreen] = useState<Screen>("title");
  const [dungeon, setDungeon] = useState<DungeonNode[] | null>(null);
  const [dungeonGrid, setDungeonGrid] = useState<DungeonGrid | null>(null);
  const [dungeonDef, setDungeonDef] = useState<DungeonDef | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [dungeonLog, setDungeonLog] = useState<DungeonLogEntry[]>([]);
  const [dungeonTurn, setDungeonTurn] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [combatSave, setCombatSave] = useState<CombatSave | null>(null);
  const [surpriseRound, setSurpriseRound] = useState(false);
  const [combatKey, setCombatKey] = useState(0);

  function doSave(opts: {
    scr: Screen;
    p?: Player;
    d?: DungeonNode[] | null;
    dg?: DungeonGrid | null;
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
      dungeonGrid: opts.dg !== undefined ? opts.dg : dungeonGrid,
      dungeonDef: opts.dd !== undefined ? opts.dd : dungeonDef,
      currentRoomId: opts.rid !== undefined ? opts.rid : currentRoomId,
      dungeonLog: opts.dl ?? dungeonLog,
      dungeonTurn: opts.dt ?? dungeonTurn,
      combat: opts.combat ?? null,
    });
  }

  function addLog(
    entries: { text: string; roomId?: string }[] | string[],
    source: "player" | "monster" | "system" = "system",
    debugOnly = false,
  ) {
    const turn = dungeonTurn;
    setDungeonLog((prev) =>
      [
        ...prev,
        ...entries.map((e) => {
          const text = typeof e === "string" ? e : e.text;
          const roomId = typeof e === "string" ? undefined : e.roomId;
          return { turn, text, source, roomId, ...(debugOnly ? { debugText: text } : {}) };
        }),
      ].slice(-DUNGEON_LOG_MAX),
    );
  }

  function tickAI(currentDungeon: DungeonNode[], roomId: string, action: string) {
    const { newDungeon, aiLog, arrivedInPlayerRoom } = runDungeonAI(currentDungeon, roomId, action);
    setDungeonTurn((t) => t + 1);

    if (aiLog.length) {
      // Always log all AI actions with debugText for the debug overlay
      addLog(
        aiLog.map((e) => ({ text: e.debugText, roomId: e.roomId })),
        "monster",
        true,
      );

      // Filter by distance for audible flavor text: quiet=1 room, normal=2 rooms, loud=whole dungeon
      const maxRange: Record<string, number> = { quiet: 1, normal: 2, loud: Infinity };
      const dist = roomDistances(currentDungeon, roomId);
      const audible = aiLog.filter((e) => {
        const range = maxRange[e.volume] ?? 2;
        const d1 = dist.get(e.roomId) ?? Infinity;
        const d2 = e.toRoomId ? (dist.get(e.toRoomId) ?? Infinity) : Infinity;
        return Math.min(d1, d2) <= range;
      });
      if (audible.length) {
        // Pick the closest room (of from/to) to show the icon on
        addLog(
          audible.map((e) => {
            const d1 = dist.get(e.roomId) ?? Infinity;
            const d2 = e.toRoomId ? (dist.get(e.toRoomId) ?? Infinity) : Infinity;
            const closestRoom = d2 < d1 ? e.toRoomId! : e.roomId;
            return { text: e.text, roomId: closestRoom };
          }),
          "monster",
        );
      }
    }

    return { newDungeon, arrivedInPlayerRoom };
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
    setDungeonGrid(save.dungeonGrid ?? null);
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
    const { nodes, grid } = generateDungeon(def);
    setDungeon(nodes);
    setDungeonGrid(grid);
    setDungeonDef(def);
    setCurrentRoomId("start");
    setDungeonLog([]);
    setDungeonTurn(0);
    setScreen("map");
    doSave({ scr: "map", d: nodes, dg: grid, dd: def, rid: "start", dl: [], dt: 0 });
  }

  /* ── Return to Town ── */
  function returnToTown(p?: Player) {
    if (p) setPlayer(p);
    setDungeon(null);
    setDungeonGrid(null);
    setDungeonDef(null);
    setCurrentRoomId(null);
    setCombatSave(null);
    setScreen("town");
    doSave({
      scr: "town",
      p: p ?? undefined,
      d: null,
      dg: null,
      dd: null,
      rid: null,
      dl: [],
      dt: 0,
    });
  }

  /* ── Check if the player's room has enemies after an AI tick ── */
  function checkAmbush(
    afterAI: DungeonNode[],
    roomId: string,
    opts?: { player?: Player },
  ): boolean {
    const roomAfterAI = afterAI.find((n) => n.id === roomId);
    if (!roomAfterAI || roomAfterAI.enemies.length === 0) return false;
    // Mark room as visited (it has enemies now)
    const updated = afterAI.map((n) => (n.id === roomId ? { ...n, state: "visited" as const } : n));
    setDungeon(updated);
    addLog(["\u26A0\uFE0F Monsters have found you!"], "system");
    setSurpriseRound(true);
    setCombatKey((k) => k + 1);
    setScreen("combat");
    setCombatSave(null);
    doSave({ scr: "combat", p: opts?.player, d: updated, rid: roomId });
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
      // Rooms with no enemies are immediately cleared
      return { ...n, state: hasEnemies ? ("visited" as const) : ("cleared" as const) };
    });
    // If room has no enemies (now cleared), unlock its neighbors
    const unlocked = hasEnemies
      ? marked
      : marked.map((n) =>
          n.state === "locked" && room.connections.includes(n.id)
            ? { ...n, state: "reachable" as const }
            : n,
        );
    const { newDungeon: afterAI } = tickAI(unlocked, roomId, "move");
    setCurrentRoomId(roomId);
    if (hasEnemies) {
      // Room already had enemies — normal combat (not surprise)
      setSurpriseRound(false);
      setCombatKey((k) => k + 1);
      setDungeon(afterAI);
      setScreen("combat");
      setCombatSave(null);
      doSave({ scr: "combat", d: afterAI, rid: roomId });
    } else if (!checkAmbush(afterAI, roomId)) {
      // No enemies arrived — stay on map
      setDungeon(afterAI);
      setCombatSave(null);
      doSave({ scr: "map", d: afterAI, rid: roomId });
    }
  }

  /* ── Combat turn ended → save mid-combat state ── */
  function onCombatTurnEnd(combat: CombatSave) {
    setCombatSave(combat);
    doSave({ scr: "combat", combat });
  }

  function onCombatVictory(newPlayer: CombatPlayer) {
    if (!dungeon || !currentRoomId) return;
    // No dungeon tick after combat — just clear the room and unlock neighbors
    const newDungeon = (() => {
      const base = dungeon.map((n) =>
        n.id === currentRoomId ? { ...n, state: "cleared" as const, enemies: [] } : n,
      );
      const curRoom = dungeon.find((r) => r.id === currentRoomId);
      return base.map((n) => {
        if (n.state === "locked" && curRoom?.connections.includes(n.id))
          return { ...n, state: "reachable" as const };
        return n;
      });
    })();
    setDungeon(newDungeon);
    const { block: _b, stealthActive: _st, counterActive: _c, ...playerState } = newPlayer;
    const room = dungeon.find((n) => n.id === currentRoomId);
    if (room?.boss) {
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
    // After flee, no auto-combat — player always sees the map and can move away
    const { newDungeon: afterAI } = tickAI(dungeon, currentRoomId, "move");
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
    addLog([`\u{1FA79} Rested (+${healAmt} HP)`], "player");
    const { newDungeon: afterAI } = tickAI(dungeon, currentRoomId, "rest");
    if (!checkAmbush(afterAI, currentRoomId, { player: newPlayer })) {
      setDungeon(afterAI);
      doSave({ scr: "map", p: newPlayer, d: afterAI });
    }
  }

  function onSetTrap(roomId: string, trapKey: string) {
    setPlayer((p) => (p ? { ...p, gold: p.gold - TRAP_INFO[trapKey].cost } : p));
    setDungeon((prev) =>
      prev ? prev.map((n) => (n.id === roomId ? { ...n, trap: trapKey } : n)) : prev,
    );
    addLog(
      [`\u{1FAA4} Trap set in ${dungeon?.find((n) => n.id === roomId)?.label || roomId}`],
      "player",
    );
  }

  function onBlockDoor(roomId: string) {
    setPlayer((p) => (p ? { ...p, gold: p.gold - BLOCK_DOOR_COST } : p));
    setDungeon((prev) =>
      prev ? prev.map((n) => (n.id === roomId ? { ...n, blocked: true } : n)) : prev,
    );
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
      setDungeon(scoutedDungeon);
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
            <span style={{ color: "#7f8c8d" }}>{n.label}</span> [{n.state}]
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
            onClick={() => setShowDebug((s) => !s)}
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
        key={combatKey}
        room={room}
        player={player}
        onVictory={onCombatVictory}
        onDefeat={onCombatDefeat}
        onFleeToMap={onFleeToMap}
        onTurnEnd={onCombatTurnEnd}
        initialCombat={combatSave}
        surpriseRound={surpriseRound}
      />
    );
  }

  return null;
}
