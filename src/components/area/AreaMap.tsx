import { useState, useMemo, useEffect, useRef } from "react";
import { btnStyle } from "../../styles";
import { REST_HEAL_FRACTION } from "../../data/constants";
import { getScoutIntel } from "../../utils/area";
import { StatusBadges, HpBar } from "../shared";
import { GridCanvas, visibleRooms, CELL_PX } from "./GridCanvas";
import { RoomLabels } from "./RoomLabels";
import { RoomPanel } from "./RoomPanel";
import type { AreaNode, AreaGrid, Player, AreaLogEntry } from "../../types";

/* ── Main DungeonMap Component ── */
export function AreaMap({
  area,
  areaGrid,
  player,
  currentRoomId,
  areaName,
  debugMode,
  areaTurn,
  areaLog,
  onEnterRoom,
  onScout,
  onSetTrap,
  onBlockDoor,
  onRest,
  onSwitchWeapon,
  onToggleDebug,
  onReturnToTown,
}: {
  area: AreaNode[];
  areaGrid: AreaGrid | null;
  player: Player;
  currentRoomId: string;
  areaName: string;
  debugMode: boolean;
  areaTurn: number;
  areaLog: AreaLogEntry[];
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
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setContainerSize({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Track sound icons — cleared each new dungeon turn, only shows current turn's sounds
  const [soundIcons, setSoundIcons] = useState<{ roomId: string; texts: string[]; key: number }[]>(
    [],
  );
  const soundKeyRef = useRef(0);
  const prevLogLen = useRef(areaLog.length);
  const prevTurn = useRef(areaTurn);

  useEffect(() => {
    // New turn started — clear old icons and show only this turn's sounds
    if (areaTurn !== prevTurn.current) {
      prevTurn.current = areaTurn;

      if (areaLog.length > prevLogLen.current) {
        const newEntries = areaLog.slice(prevLogLen.current);
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
    prevLogLen.current = areaLog.length;
  }, [areaLog, areaTurn]);

  const node = selected ? area.find((n) => n.id === selected) : null;
  const currentRoom = area.find((n) => n.id === currentRoomId);
  const adjacentIds = new Set(currentRoom?.connections || []);

  const visible = useMemo(() => visibleRooms(area, debugMode), [area, debugMode]);

  function handleClickRoom(nodeId: string) {
    const n = area.find((nd) => nd.id === nodeId);
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

  if (!areaGrid) return null;

  const mapPxW = areaGrid.width * CELL_PX;
  const mapPxH = areaGrid.height * CELL_PX;
  const ratio = mapPxW / mapPxH;
  let fitW = 0,
    fitH = 0;
  if (containerSize.w > 0 && containerSize.h > 0) {
    if (containerSize.w / containerSize.h > ratio) {
      fitH = containerSize.h;
      fitW = fitH * ratio;
    } else {
      fitW = containerSize.w;
      fitH = fitW / ratio;
    }
  }

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
          {"\u2620"} {areaName}
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
                      lg:flex-nowrap lg:items-stretch"
      >
        {/* Map canvas — fills available space, inner box keeps square cells */}
        <div
          ref={scrollRef}
          className="relative flex-1 min-w-0 min-h-0 flex items-center justify-center
                     w-full max-h-[calc(100vh-160px)]
                     lg:max-h-full"
        >
          <div
            className="relative rounded-md border border-crypt-border-dim"
            style={{
              width: fitW ? `${fitW}px` : undefined,
              height: fitH ? `${fitH}px` : undefined,
              background: "#080610",
            }}
          >
            <GridCanvas
              grid={areaGrid}
              area={area}
              currentRoomId={currentRoomId}
              selectedRoomId={selected}
              visible={visible}
              debugMode={debugMode}
              onClickRoom={handleClickRoom}
            />
            <RoomLabels
              area={area}
              currentRoomId={currentRoomId}
              debugMode={debugMode}
              soundIcons={soundIcons}
              gridWidth={areaGrid.width}
              gridHeight={areaGrid.height}
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
              Your Status {"\u00B7"} Turn {areaTurn}
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
              {areaLog.length === 0 && (
                <div className="text-xs text-crypt-dim italic">No activity yet.</div>
              )}
              {[...areaLog]
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
