import { useState } from "react";
import { TRAP_INFO, TYPE_COLOR } from "./data/rooms";
import { uid, makeStarterDeck } from "./utils/helpers";
import { generateDungeon, runDungeonAI } from "./utils/dungeon";
import { TitleScreen } from "./components/TitleScreen";
import { DungeonMap } from "./components/DungeonMap";
import { CombatScreen } from "./components/CombatScreen";
import { ShopScreen } from "./components/ShopScreen";
import { RestScreen } from "./components/RestScreen";
import { VictoryScreen, GameOverScreen } from "./components/EndScreens";
import type { DungeonNode, Player, CombatPlayer, DungeonLogEntry, ShopItem } from "./types";

type Screen = "title" | "map" | "combat" | "rest" | "shop" | "victory" | "gameover";

export default function App() {
  const [screen, setScreen] = useState<Screen>("title");
  const [dungeon, setDungeon] = useState<DungeonNode[] | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [dungeonLog, setDungeonLog] = useState<DungeonLogEntry[]>([]);
  const [dungeonTurn, setDungeonTurn] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  function addLog(entries: string[]) {
    const turn = dungeonTurn;
    setDungeonLog(prev => [...prev, ...entries.map(e => ({ turn, text: e }))].slice(-200));
  }

  function tickAI(currentDungeon: DungeonNode[], roomId: string, action: string) {
    const { newDungeon, log } = runDungeonAI(currentDungeon, roomId, action);
    setDungeonTurn(t => t + 1);
    if (log.length) addLog(log);
    return newDungeon;
  }

  function startGame() {
    const d = generateDungeon();
    const p: Player = { hp: 60, maxHp: 60, gold: 0, maxEnergy: 3, statuses: {}, deck: makeStarterDeck() };
    setDungeon(d); setPlayer(p); setCurrentRoomId("start");
    setDungeonLog([]); setDungeonTurn(0);
    setScreen("map");
  }

  function enterRoom(roomId: string) {
    if (!dungeon || !currentRoomId) return;
    const room = dungeon.find(n => n.id === roomId);
    if (!room) return;
    const currentRoom = dungeon.find(n => n.id === currentRoomId);
    if (!debugMode && currentRoom && !currentRoom.connections.includes(roomId)) return;
    const afterAI = tickAI(dungeon, roomId, "move");
    setDungeon(afterAI);
    setCurrentRoomId(roomId);
    if (room.type === "combat" || room.type === "boss") setScreen("combat");
    else if (room.type === "rest") setScreen("rest");
    else if (room.type === "shop") setScreen("shop");
  }

  function markCleared(roomId: string) {
    setCurrentRoomId(roomId);
    setDungeon(prev => {
      if (!prev) return prev;
      return prev.map(n => {
        if (n.id === roomId) return { ...n, state: "cleared" as const, enemies: [] };
        if (n.state === "locked" && prev.find(r => r.id === roomId)?.connections.includes(n.id))
          return { ...n, state: "reachable" as const };
        return n;
      });
    });
  }

  function onCombatVictory(newPlayer: CombatPlayer) {
    if (!dungeon || !currentRoomId) return;
    const afterAI = tickAI(dungeon, currentRoomId, "combat");
    setDungeon(() => {
      const base = afterAI.map(n => n.id === currentRoomId ? { ...n, state: "cleared" as const, enemies: [] } : n);
      return base.map(n => {
        if (n.state === "locked" && afterAI.find(r => r.id === currentRoomId)?.connections.includes(n.id))
          return { ...n, state: "reachable" as const };
        return n;
      });
    });
    const { hand: _, drawPile: _dp, discard: _d, energy: _e, block: _b, ...playerState } = newPlayer;
    setPlayer(playerState);
    const room = dungeon.find(n => n.id === currentRoomId);
    if (room?.type === "boss") { setScreen("victory"); return; }
    setScreen("map");
  }

  function onCombatDefeat(gold: number) {
    setPlayer(p => p ? { ...p, gold } : p);
    setScreen("gameover");
  }

  function onFleeToMap(newPlayer: CombatPlayer) {
    if (!dungeon || !currentRoomId) return;
    const afterAI = tickAI(dungeon, currentRoomId, "move");
    setDungeon(afterAI);
    const { hand: _, drawPile: _dp, discard: _d, energy: _e, block: _b, ...playerState } = newPlayer;
    setPlayer(playerState);
    setScreen("map");
  }

  function onRest(healAmt: number) {
    if (!dungeon || !currentRoomId) return;
    setPlayer(p => p ? { ...p, hp: Math.min(p.maxHp, p.hp + healAmt) } : p);
    const afterAI = tickAI(dungeon, currentRoomId, "rest");
    setDungeon(afterAI);
    markCleared(currentRoomId);
    setScreen("map");
  }

  function onShopBuy(item: ShopItem) {
    setPlayer(p => {
      if (!p) return p;
      const np = { ...p, gold: p.gold - item.cost };
      if (item.effect === "heal") np.hp = Math.min(np.maxHp, np.hp + item.value);
      if (item.effect === "energy") np.maxEnergy = np.maxEnergy + item.value;
      if (item.effect === "addcard" && item.card) np.deck = [...np.deck, { ...item.card, uid: uid(item.card.id) }];
      if (item.effect === "remove") np.deck = np.deck.filter(c => c.uid !== item.targetCard);
      return np;
    });
  }

  function onSetTrap(roomId: string, trapKey: string) {
    setPlayer(p => p ? { ...p, gold: p.gold - TRAP_INFO[trapKey].cost } : p);
    setDungeon(prev => prev ? prev.map(n => n.id === roomId ? { ...n, trap: trapKey } : n) : prev);
    addLog([`\u{1FAA4} [T${dungeonTurn}] Trap set in ${dungeon?.find(n => n.id === roomId)?.label || roomId}`]);
  }

  function onBlockDoor(roomId: string) {
    setPlayer(p => p ? { ...p, gold: p.gold - 10 } : p);
    setDungeon(prev => prev ? prev.map(n => n.id === roomId ? { ...n, blocked: true } : n) : prev);
    addLog([`\u{1F6A7} [T${dungeonTurn}] Door blocked in ${dungeon?.find(n => n.id === roomId)?.label || roomId}`]);
  }

  function onScout(roomId: string, scoutLevel: number) {
    if (!dungeon || !currentRoomId) return;
    const afterAI = tickAI(dungeon, currentRoomId, "scout");
    setDungeon(afterAI.map(n => n.id === roomId ? { ...n, scouted: true } : n));
    addLog([`\u{1F50D} [T${dungeonTurn}] Scout (level ${scoutLevel}) on ${dungeon.find(n => n.id === roomId)?.label || roomId}`]);
  }

  if (screen === "title") return <TitleScreen onStart={startGame} />;
  if (screen === "victory") return <VictoryScreen gold={player?.gold || 0} onRestart={() => setScreen("title")} />;
  if (screen === "gameover") return <GameOverScreen gold={player?.gold || 0} onRestart={() => setScreen("title")} />;

  if (!dungeon || !player || !currentRoomId) return null;

  const debugOverlay = showDebug && debugMode && (
    <div className="fixed top-0 right-0 w-[380px] h-screen bg-[#080610ee] border-l border-[#2a1f40] z-100 flex flex-col overflow-hidden font-mono text-sm">
      <div className="px-3 py-2 border-b border-[#2a1f40] flex justify-between items-center bg-[#0f0c1a]">
        <span className="text-crypt-purple font-bold tracking-wider">{"\u{1F6E0}"} DEBUG {"\u2014"} Turn {dungeonTurn}</span>
        <button onClick={() => setShowDebug(false)} className="bg-transparent border-none text-[#6a5a8a] cursor-pointer text-base">{"\u2715"}</button>
      </div>

      <div className="px-3 py-2 border-b border-[#1a1430] shrink-0">
        <div className="text-crypt-muted mb-1 tracking-wider text-xs">ROOMS</div>
        {dungeon.map(n => (
          <div key={n.id} className={`mb-1 leading-relaxed ${n.id === currentRoomId ? "text-crypt-gold" : "text-crypt-muted"}`}>
            {n.id === currentRoomId ? "\u25B6 " : "  "}
            <span style={{ color: TYPE_COLOR[n.type] || "#7f8c8d" }}>{n.label}</span>
            {" "}[{n.state}]
            {n.enemies.length > 0 && <span className="text-red-400"> {n.enemies.length}{"\u2716"} ({n.enemies.join(",")})</span>}
            {n.trap && <span className="text-orange-400"> {TRAP_INFO[n.trap]?.icon}</span>}
            {n.blocked && <span className="text-crypt-blue"> {"\u{1F6A7}"}</span>}
            <button className="ml-2 bg-[#2a1f40] border-none text-crypt-purple cursor-pointer text-xs px-1 rounded"
              onClick={() => enterRoom(n.id)}>teleport</button>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="text-crypt-muted mb-1 tracking-wider text-xs">AI LOG (newest first)</div>
        {[...dungeonLog].reverse().map((entry, i) => (
          <div key={i} className="text-[#9a8aaa] leading-relaxed border-b border-[#1a1428] pb-0.5 mb-0.5">
            <span className="text-[#6a5a8a]">[T{entry.turn}]</span> {entry.text}
          </div>
        ))}
        {!dungeonLog.length && <div className="text-[#3a2a50] italic">No AI actions yet.</div>}
      </div>
    </div>
  );

  if (screen === "map") return (
    <>
      {debugOverlay}
      {debugMode && (
        <button onClick={() => setShowDebug(s => !s)}
          className="fixed bottom-3 right-3 z-99 bg-[#2a1f40] border border-crypt-purple text-crypt-purple rounded px-3 py-1.5 cursor-pointer font-mono text-sm tracking-wider">
          {"\u{1F6E0}"} {showDebug ? "Hide" : "Debug"}
        </button>
      )}
      <DungeonMap dungeon={dungeon} player={player} currentRoomId={currentRoomId}
        debugMode={debugMode} dungeonTurn={dungeonTurn}
        onEnterRoom={enterRoom} onScout={onScout}
        onSetTrap={onSetTrap} onBlockDoor={onBlockDoor}
        onToggleDebug={() => setDebugMode(d => !d)} />
    </>
  );

  if (screen === "rest") {
    return <RestScreen player={player} onRest={onRest} onLeave={() => { markCleared(currentRoomId); setScreen("map"); }} />;
  }

  if (screen === "shop") {
    return <ShopScreen player={player} onBuy={onShopBuy} onLeave={() => { markCleared(currentRoomId); setScreen("map"); }} />;
  }

  if (screen === "combat") {
    const room = dungeon.find(n => n.id === currentRoomId);
    if (!room) return null;
    return <CombatScreen room={room} player={player}
      onVictory={onCombatVictory} onDefeat={onCombatDefeat} onFleeToMap={onFleeToMap} />;
  }

  return null;
}
