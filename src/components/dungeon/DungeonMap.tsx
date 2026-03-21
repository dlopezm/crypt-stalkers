import { useState, useMemo, useEffect, useRef } from "react";
import { btnStyle } from "../../styles";
import { REST_HEAL_FRACTION } from "../../data/constants";
import { getScoutIntel } from "../../utils/dungeon";
import { StatusBadges, HpBar } from "../shared";
import { GridCanvas, visibleRooms, CELL_PX } from "./GridCanvas";
import { RoomLabels } from "./RoomLabels";
import { RoomPanel } from "./RoomPanel";
import type { DungeonNode, DungeonGrid, Player, DungeonLogEntry } from "../../types";

/* ── Main DungeonMap Component ── */
export function DungeonMap({
  dungeon,
  dungeonGrid,
  player,
  currentRoomId,
  dungeonName,
  debugMode,
  dungeonTurn,
  dungeonLog,
  onEnterRoom,
  onScout,
  onSetTrap,
  onBlockDoor,
  onRest,
  onSwitchWeapon,
  onToggleDebug,
  onReturnToTown,
}: {
  dungeon: DungeonNode[];
  dungeonGrid: DungeonGrid | null;
  player: Player;
  currentRoomId: string;
  dungeonName: string;
  debugMode: boolean;
  dungeonTurn: number;
  dungeonLog: DungeonLogEntry[];
  onEnterRoom: (id: string) => void;
  onScout: (id: string, level: number) => void;
  onSetTrap: (id: string, trap: string) => void;
  onBlockDoor: (id: string) => void;
  onRest: () => void;
  onSwitchWeapon: (weaponId: string) => void;
  onToggleDebug: () => void;
  onReturnToTown: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [scoutResult, setScoutResult] = useState<string | null>(null);
  const [scoutLevel, setScoutLevel] = useState(0);
  const [showWeaponPicker, setShowWeaponPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Track sound icons — cleared each new dungeon turn, only shows current turn's sounds
  const [soundIcons, setSoundIcons] = useState<{ roomId: string; texts: string[]; key: number }[]>(
    [],
  );
  const soundKeyRef = useRef(0);
  const prevLogLen = useRef(dungeonLog.length);
  const prevTurn = useRef(dungeonTurn);

  useEffect(() => {
    // New turn started — clear old icons and show only this turn's sounds
    if (dungeonTurn !== prevTurn.current) {
      prevTurn.current = dungeonTurn;

      if (dungeonLog.length > prevLogLen.current) {
        const newEntries = dungeonLog.slice(prevLogLen.current);
        const monsterEntries = newEntries.filter(
          (e) => e.source === "monster" && e.roomId && !e.debugText,
        );

        if (monsterEntries.length > 0) {
          const byRoom = new Map<string, string[]>();
          for (const e of monsterEntries) {
            const arr = byRoom.get(e.roomId!) || [];
            arr.push(e.text);
            byRoom.set(e.roomId!, arr);
          }
          const newIcons = [...byRoom.entries()].map(([roomId, texts]) => ({
            roomId,
            texts,
            key: ++soundKeyRef.current,
          }));
          // Replace (not append) — only current turn's sounds shown
          setSoundIcons(newIcons);
        } else {
          setSoundIcons([]);
        }
      } else {
        setSoundIcons([]);
      }
    }
    prevLogLen.current = dungeonLog.length;
  }, [dungeonLog, dungeonTurn]);

  const node = selected ? dungeon.find((n) => n.id === selected) : null;
  const currentRoom = dungeon.find((n) => n.id === currentRoomId);
  const adjacentIds = new Set(currentRoom?.connections || []);

  const visible = useMemo(() => visibleRooms(dungeon, debugMode), [dungeon, debugMode]);

  function handleClickRoom(nodeId: string) {
    const n = dungeon.find((nd) => nd.id === nodeId);
    if (!n) return;
    const vis = n.state === "visited";
    if (!debugMode && n.id !== currentRoomId && !adjacentIds.has(n.id) && !vis) return;
    setSelected(n.id === selected ? null : n.id);
    setScoutResult(null);
    setScoutLevel(0);
  }

  function handleScout(level: number) {
    if (!node) return;
    const intel = getScoutIntel(node, level);
    const icons: Record<number, string> = { 1: "\u{1F442}", 2: "\u{1F511}", 3: "\u{1F575}" };
    setScoutResult(`${icons[level] || ""} ${intel}`);
    setScoutLevel(level);
    onScout(node.id, level);
  }

  function handleEnterRoom(id: string) {
    onEnterRoom(id);
    setSelected(null);
  }

  function handleSetTrap(id: string, trap: string) {
    onSetTrap(id, trap);
    setSelected(id);
  }

  function handleBlockDoor(id: string) {
    onBlockDoor(id);
    setSelected(id);
  }

  if (!dungeonGrid) return null;

  const mapPxW = dungeonGrid.width * CELL_PX;
  const mapPxH = dungeonGrid.height * CELL_PX;

  return (
    <div
      className="min-h-screen bg-crypt-bg text-crypt-text font-serif flex flex-col items-center gap-3 relative overflow-hidden p-4
                    lg:h-dvh lg:overflow-hidden"
    >
      <div className="vignette" />

      {/* Top bar */}
      <div className="flex gap-4 items-center relative z-1 flex-wrap justify-center shrink-0">
        <h2
          className="text-xl tracking-[0.15em] uppercase text-crypt-red-glow font-bold"
          style={{ textShadow: "0 0 20px #8b0000" }}
        >
          {"\u2620"} {dungeonName}
        </h2>
        <div className="flex gap-4 items-center text-base">
          <span className="text-crypt-text">
            {"\u2764"} {player.hp}/{player.maxHp}
          </span>
          <span className="text-crypt-gold">
            {"\u{1FA99}"} {player.gold}
          </span>
          <span className="text-crypt-muted">
            {"\u{1F5E1}\uFE0F"} {player.mainWeapon.name}
          </span>
        </div>
      </div>

      <div
        className="flex gap-6 relative z-1 flex-wrap justify-center items-start w-full flex-1 min-h-0
                      lg:flex-nowrap"
      >
        {/* Map canvas */}
        <div
          ref={scrollRef}
          className="relative shrink-0 rounded-md border border-crypt-border-dim
                     w-[min(700px,55vw,calc(100vh-160px))] max-h-[calc(100vh-160px)]
                     lg:w-auto lg:shrink lg:flex-1 lg:max-h-full lg:min-h-0"
          style={{
            aspectRatio: `${mapPxW} / ${mapPxH}`,
            background: "#080610",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <GridCanvas
              grid={dungeonGrid}
              dungeon={dungeon}
              currentRoomId={currentRoomId}
              selectedRoomId={selected}
              visible={visible}
              debugMode={debugMode}
              onClickRoom={handleClickRoom}
            />
            <RoomLabels
              dungeon={dungeon}
              currentRoomId={currentRoomId}
              debugMode={debugMode}
              soundIcons={soundIcons}
              gridWidth={dungeonGrid.width}
              gridHeight={dungeonGrid.height}
              onSelectRoom={setSelected}
            />
          </div>
        </div>

        {/* Side panel */}
        <div className="flex-1 min-w-[280px] max-w-[360px] flex flex-col gap-3 lg:overflow-y-auto lg:max-h-full">
          <RoomPanel
            node={node ?? null}
            currentRoomId={currentRoomId}
            adjacentIds={adjacentIds}
            debugMode={debugMode}
            scoutLevel={scoutLevel}
            scoutResult={scoutResult}
            player={player}
            onEnterRoom={handleEnterRoom}
            onScout={handleScout}
            onSetTrap={handleSetTrap}
            onBlockDoor={handleBlockDoor}
          />

          {/* Player status */}
          <div className="panel">
            <div className="text-sm text-crypt-dim mb-2 tracking-wider uppercase">
              Your Status {"\u00B7"} Turn {dungeonTurn}
            </div>
            <HpBar current={player.hp} max={player.maxHp} color="#3ddc84" />
            <StatusBadges statuses={player.statuses} />
            <div className="text-sm text-crypt-muted mt-2">
              {"\u{1F392}"} {player.consumables.length} items
            </div>
            {player.ownedWeapons.length > 1 && (
              <div className="mt-2">
                <button
                  style={btnStyle("#5a4a20")}
                  className="text-xs! px-2! py-1!"
                  onClick={() => setShowWeaponPicker((v) => !v)}
                >
                  {"\u{1F504}"} Switch Weapon
                </button>
                {showWeaponPicker && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {player.ownedWeapons
                      .filter((w) => w.hand !== "offhand")
                      .map((w) => (
                        <button
                          key={w.id}
                          style={btnStyle(
                            w.id === player.mainWeapon.id ? "#3a3020" : "#6a3a1a",
                            w.id === player.mainWeapon.id,
                          )}
                          className="text-xs! px-2! py-1!"
                          disabled={w.id === player.mainWeapon.id}
                          onClick={() => {
                            onSwitchWeapon(w.id);
                            setShowWeaponPicker(false);
                          }}
                        >
                          {w.icon} {w.name}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onRest}
            disabled={player.hp >= player.maxHp}
            style={btnStyle("#27ae60", player.hp >= player.maxHp)}
          >
            {"\u{1FA79}"} Rest (+{Math.floor(player.maxHp * REST_HEAL_FRACTION)} HP)
          </button>

          {/* Activity Log */}
          <div className="panel" style={{ maxHeight: "240px", overflow: "hidden" }}>
            <div className="text-sm text-crypt-dim mb-2 tracking-wider uppercase">Activity Log</div>
            <div
              className="flex flex-col gap-0.5"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              {dungeonLog.length === 0 && (
                <div className="text-xs text-crypt-dim italic">No activity yet.</div>
              )}
              {[...dungeonLog]
                .filter((e) => !e.debugText)
                .reverse()
                .slice(0, 20)
                .map((entry, i) => (
                  <div
                    key={i}
                    className={`text-xs leading-relaxed ${
                      entry.source === "monster"
                        ? "text-red-400 font-bold"
                        : entry.source === "player"
                          ? "text-crypt-gold"
                          : "text-crypt-muted"
                    }`}
                    style={{ opacity: Math.max(0.4, 1 - i * 0.04) }}
                  >
                    <span className="text-crypt-dim font-normal">T{entry.turn}</span> {entry.text}
                  </div>
                ))}
            </div>
          </div>

          <button onClick={onReturnToTown} style={btnStyle("#3a2f25")} className="text-xs!">
            {"\u{1F3F0}"} Abandon Dungeon
          </button>

          <button
            onClick={onToggleDebug}
            style={btnStyle(debugMode ? "#9b59b6" : "#2a1f40")}
            className="text-xs!"
          >
            {"\u{1F6E0}"} Debug {debugMode ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes soundPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.85; }
        }
        @keyframes soundFadeIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
