import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { btnStyle } from "../styles";
import { TRAP_INFO } from "../data/rooms";
import { REST_HEAL_FRACTION, BLOCK_DOOR_COST } from "../data/constants";
import { getScoutIntel } from "../utils/dungeon";
import { StatusBadges, HpBar } from "./shared";
import type { DungeonNode, DungeonGrid, Player, DungeonLogEntry } from "../types";

const CELL_PX = 14;

/* ── Room fill color by state ── */
function roomColor(node: DungeonNode, currentRoomId: string): string {
  if (node.id === currentRoomId) return "#3a2808";
  if (node.state === "cleared") return "#0e1a0a";
  if (node.state === "visited") return "#2a1c08";
  if (node.state === "reachable") return "#1a1006";
  return "#0c0a10";
}

/* ── Determine which rooms are visible ── */
function visibleRooms(dungeon: DungeonNode[], debugMode: boolean): Set<string> {
  const vis = new Set<string>();
  for (const node of dungeon) {
    if (
      debugMode ||
      node.state === "visited" ||
      node.state === "cleared" ||
      node.state === "reachable"
    ) {
      vis.add(node.id);
    }
  }
  return vis;
}

/* ── Compute the closest edge points between two room bboxes ── */
function connectorEndpoints(
  a: NonNullable<DungeonNode["bbox"]>,
  b: NonNullable<DungeonNode["bbox"]>,
): { x1: number; y1: number; x2: number; y2: number } {
  // Room pixel rects
  const ax1 = a.minCol * CELL_PX,
    ay1 = a.minRow * CELL_PX;
  const ax2 = (a.maxCol + 1) * CELL_PX,
    ay2 = (a.maxRow + 1) * CELL_PX;
  const bx1 = b.minCol * CELL_PX,
    by1 = b.minRow * CELL_PX;
  const bx2 = (b.maxCol + 1) * CELL_PX,
    by2 = (b.maxRow + 1) * CELL_PX;
  // Centers
  const acx = (ax1 + ax2) / 2,
    acy = (ay1 + ay2) / 2;
  const bcx = (bx1 + bx2) / 2,
    bcy = (by1 + by2) / 2;
  // Clamp connector start/end to the edge of each room along the center-to-center line
  function clampToEdge(
    cx: number,
    cy: number,
    tx: number,
    ty: number,
    rx1: number,
    ry1: number,
    rx2: number,
    ry2: number,
  ) {
    const dx = tx - cx,
      dy = ty - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };
    let t = Infinity;
    if (dx !== 0) {
      const tl = (dx > 0 ? rx2 : rx1) - cx;
      const tv = tl / dx;
      if (tv > 0) t = Math.min(t, tv);
    }
    if (dy !== 0) {
      const tl = (dy > 0 ? ry2 : ry1) - cy;
      const tv = tl / dy;
      if (tv > 0) t = Math.min(t, tv);
    }
    return { x: cx + dx * t, y: cy + dy * t };
  }
  const from = clampToEdge(acx, acy, bcx, bcy, ax1, ay1, ax2, ay2);
  const to = clampToEdge(bcx, bcy, acx, acy, bx1, by1, bx2, by2);
  return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
}

/* ── Grid Canvas Renderer (rectangle-based) ── */
function GridCanvas({
  grid,
  dungeon,
  currentRoomId,
  visible,
  onClickRoom,
}: {
  grid: DungeonGrid;
  dungeon: DungeonNode[];
  currentRoomId: string;
  visible: Set<string>;
  onClickRoom: (nodeId: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { height, width } = grid;
    canvas.width = width * CELL_PX;
    canvas.height = height * CELL_PX;

    ctx.fillStyle = "#080610";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw connectors between visible connected rooms (edge-to-edge)
    ctx.strokeStyle = "#2a1c10";
    ctx.lineWidth = 4;
    const drawnConnections = new Set<string>();
    for (const node of dungeon) {
      if (!visible.has(node.id) || !node.bbox) continue;
      for (const connId of node.connections) {
        const connKey = [node.id, connId].sort().join("-");
        if (drawnConnections.has(connKey)) continue;
        drawnConnections.add(connKey);
        const other = dungeon.find((n) => n.id === connId);
        if (!other?.bbox || !visible.has(other.id)) continue;
        const { x1, y1, x2, y2 } = connectorEndpoints(node.bbox, other.bbox);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    // Draw rooms as solid rectangles
    for (const node of dungeon) {
      if (!visible.has(node.id) || !node.bbox) continue;
      const { minRow, maxRow, minCol, maxCol } = node.bbox;
      const x = minCol * CELL_PX;
      const y = minRow * CELL_PX;
      const w = (maxCol - minCol + 1) * CELL_PX;
      const h = (maxRow - minRow + 1) * CELL_PX;

      // Fill
      ctx.fillStyle = roomColor(node, currentRoomId);
      ctx.fillRect(x, y, w, h);

      // Subtle grid lines inside room
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          ctx.strokeRect(c * CELL_PX, r * CELL_PX, CELL_PX, CELL_PX);
        }
      }
    }

    // Highlight current room border
    const curNode = dungeon.find((n) => n.id === currentRoomId);
    if (curNode?.bbox && visible.has(curNode.id)) {
      const { minRow, maxRow, minCol, maxCol } = curNode.bbox;
      ctx.strokeStyle = "#d4a830";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        minCol * CELL_PX - 1,
        minRow * CELL_PX - 1,
        (maxCol - minCol + 1) * CELL_PX + 2,
        (maxRow - minRow + 1) * CELL_PX + 2,
      );
    }

    // Highlight reachable room borders
    for (const node of dungeon) {
      if (node.state === "reachable" && node.bbox && visible.has(node.id)) {
        const { minRow, maxRow, minCol, maxCol } = node.bbox;
        ctx.strokeStyle = "#7a4018";
        ctx.lineWidth = 1;
        ctx.strokeRect(
          minCol * CELL_PX,
          minRow * CELL_PX,
          (maxCol - minCol + 1) * CELL_PX,
          (maxRow - minRow + 1) * CELL_PX,
        );
      }
    }
  }, [grid, dungeon, currentRoomId, visible]);

  useEffect(() => {
    draw();
  }, [draw]);

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Check which room bbox contains the click
    for (const node of dungeon) {
      if (!node.bbox || !visible.has(node.id)) continue;
      const { minRow, maxRow, minCol, maxCol } = node.bbox;
      if (
        x >= minCol * CELL_PX &&
        x < (maxCol + 1) * CELL_PX &&
        y >= minRow * CELL_PX &&
        y < (maxRow + 1) * CELL_PX
      ) {
        onClickRoom(node.id);
        return;
      }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ imageRendering: "pixelated", cursor: "pointer" }}
      onClick={handleClick}
    />
  );
}

/* ── Room labels overlay ── */
function RoomLabels({
  dungeon,
  currentRoomId,
  adjacentIds,
  debugMode,
  soundIcons,
}: {
  dungeon: DungeonNode[];
  currentRoomId: string;
  adjacentIds: Set<string>;
  debugMode: boolean;
  soundIcons: { roomId: string; texts: string[]; key: number }[];
}) {
  return (
    <>
      {dungeon.map((n) => {
        if (!n.bbox) return null;
        const visited = n.state === "visited" || n.state === "cleared";
        const reachable = n.state === "reachable";
        if (!debugMode && !visited && !reachable && !adjacentIds.has(n.id)) return null;

        const { minRow, maxRow, minCol, maxCol } = n.bbox;
        const cx = ((minCol + maxCol) / 2) * CELL_PX + CELL_PX / 2;
        const cy = ((minRow + maxRow) / 2) * CELL_PX + CELL_PX / 2;
        const isCurrent = n.id === currentRoomId;

        return (
          <div
            key={n.id + "-lbl"}
            style={{
              position: "absolute",
              left: cx,
              top: cy,
              transform: "translate(-50%, -50%)",
              fontSize: isCurrent ? "0.75rem" : "0.65rem",
              color: isCurrent ? "#ece0c0" : visited ? "#7f8c8d" : "#5a4028",
              whiteSpace: "nowrap",
              textShadow: "0 1px 4px #000, 0 0 8px #000",
              letterSpacing: "0.04em",
              zIndex: 3,
              pointerEvents: "none",
              fontWeight: isCurrent ? "bold" : "normal",
              maxWidth: `${(maxCol - minCol + 1) * CELL_PX}px`,
              overflow: "hidden",
              textOverflow: "ellipsis",
              textAlign: "center",
            }}
          >
            {isCurrent && <span style={{ marginRight: "3px" }}>{"\u2691"}</span>}
            {visited || debugMode ? n.label : "???"}
          </div>
        );
      })}

      {/* Sound icons */}
      {soundIcons.map((icon) => {
        const room = dungeon.find((n) => n.id === icon.roomId);
        if (!room?.bbox) return null;
        const { minRow, maxRow, minCol, maxCol } = room.bbox;
        const cx = ((minCol + maxCol) / 2) * CELL_PX + CELL_PX / 2;
        const cy = ((minRow + maxRow) / 2) * CELL_PX + CELL_PX / 2;
        return (
          <div
            key={icon.key}
            title={icon.texts.join("\n")}
            style={{
              position: "absolute",
              left: cx,
              top: cy,
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              pointerEvents: "auto",
              cursor: "help",
              animation: "soundFadeIn 0.3s ease-out, soundPulse 1.5s ease-in-out infinite",
            }}
          >
            <div
              style={{
                background: "rgba(140,20,20,0.9)",
                border: "1px solid #c41c1c",
                borderRadius: "4px",
                padding: "2px 6px",
                fontSize: "0.6rem",
                color: "#ffb0b0",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                boxShadow: "0 0 12px rgba(196,28,28,0.6), 0 0 24px rgba(196,28,28,0.3)",
                textShadow: "0 0 6px rgba(255,100,100,0.5)",
              }}
            >
              {"\u{1F442}"} {icon.texts.length > 1 ? `${icon.texts.length} sounds` : icon.texts[0]}
            </div>
          </div>
        );
      })}
    </>
  );
}

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
  onToggleDebug: () => void;
  onReturnToTown: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [scoutResult, setScoutResult] = useState<string | null>(null);
  const [scoutLevel, setScoutLevel] = useState(0);
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

  // Auto-scroll to current room on mount or room change
  useEffect(() => {
    const curNode = dungeon.find((n) => n.id === currentRoomId);
    if (!curNode?.bbox || !scrollRef.current) return;
    const { minRow, maxRow, minCol, maxCol } = curNode.bbox;
    const cx = ((minCol + maxCol) / 2) * CELL_PX;
    const cy = ((minRow + maxRow) / 2) * CELL_PX;
    const container = scrollRef.current;
    container.scrollTo({
      left: cx - container.clientWidth / 2,
      top: cy - container.clientHeight / 2,
      behavior: "smooth",
    });
  }, [currentRoomId, dungeon]);

  const node = selected ? dungeon.find((n) => n.id === selected) : null;
  const currentRoom = dungeon.find((n) => n.id === currentRoomId);
  const adjacentIds = new Set(currentRoom?.connections || []);

  const visible = useMemo(() => visibleRooms(dungeon, debugMode), [dungeon, debugMode]);

  function handleClickRoom(nodeId: string) {
    const n = dungeon.find((nd) => nd.id === nodeId);
    if (!n) return;
    const vis = n.state === "visited" || n.state === "cleared";
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

  if (!dungeonGrid) return null;

  const mapPxW = dungeonGrid.width * CELL_PX;
  const mapPxH = dungeonGrid.height * CELL_PX;

  return (
    <div className="min-h-screen bg-crypt-bg text-crypt-text font-serif flex flex-col items-center gap-3 relative overflow-hidden p-4">
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
            {"\u{1F5E1}\uFE0F"} {player.weapons[player.activeWeaponIdx]?.name}
          </span>
        </div>
      </div>

      <div className="flex gap-6 relative z-1 flex-wrap justify-center items-start w-full flex-1 min-h-0">
        {/* Map canvas — scrollable */}
        <div
          ref={scrollRef}
          className="relative shrink-0 overflow-auto rounded-md border border-crypt-border-dim"
          style={{
            maxWidth: "min(700px, 60vw)",
            maxHeight: "calc(100vh - 140px)",
            background: "#080610",
          }}
        >
          <div style={{ position: "relative", width: mapPxW, height: mapPxH }}>
            <GridCanvas
              grid={dungeonGrid}
              dungeon={dungeon}
              currentRoomId={currentRoomId}
              visible={visible}
              onClickRoom={handleClickRoom}
            />
            <RoomLabels
              dungeon={dungeon}
              currentRoomId={currentRoomId}
              adjacentIds={adjacentIds}
              debugMode={debugMode}
              soundIcons={soundIcons}
            />
          </div>
        </div>

        {/* Side panel */}
        <div className="flex-1 min-w-[280px] max-w-[360px] flex flex-col gap-3">
          {node ? (
            <div className="panel">
              <div className="text-lg font-bold text-crypt-text mb-2 leading-tight">
                {node.state === "locked" && !debugMode ? "???" : node.label}
              </div>
              {node.id === currentRoomId && (
                <p className="text-sm text-crypt-gold mb-1">{"\u2691"} You are here.</p>
              )}

              {node.id !== currentRoomId && node.enemies.length > 0 && (
                <div className="text-sm text-crypt-muted mb-2 leading-relaxed">
                  {debugMode ? (
                    <span className="text-crypt-purple">
                      {node.enemies.length} enemies: {node.enemies.join(", ")}
                    </span>
                  ) : scoutLevel === 0 ? (
                    <span className="text-crypt-dim italic">Unknown. Scout to learn more.</span>
                  ) : (
                    scoutResult
                  )}
                  {node.trap && (
                    <>
                      <br />
                      <span style={{ color: TRAP_INFO[node.trap].color }}>
                        {TRAP_INFO[node.trap].icon} {TRAP_INFO[node.trap].label} set.
                      </span>
                    </>
                  )}
                  {node.blocked && (
                    <>
                      <br />
                      <span className="text-crypt-blue">{"\u{1F6A7}"} Blocked.</span>
                    </>
                  )}
                </div>
              )}

              {scoutResult && scoutLevel > 0 && (
                <div className="text-sm text-amber-500 mb-2 italic leading-relaxed border-l-2 border-crypt-red-glow/30 pl-2">
                  {scoutResult}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                {(adjacentIds.has(node.id) || debugMode) &&
                  !node.blocked &&
                  node.id !== currentRoomId && (
                    <button
                      style={btnStyle("#8b0000")}
                      onClick={() => {
                        onEnterRoom(node.id);
                        setSelected(null);
                      }}
                    >
                      Enter
                    </button>
                  )}

                {adjacentIds.has(node.id) && node.enemies.length > 0 && (
                  <div className="flex gap-1">
                    <button
                      title="Listen at door (quiet, safe)"
                      style={btnStyle("#3a2a10")}
                      className={`text-xs! px-2! py-1! flex-1 ${scoutLevel >= 1 ? "opacity-50" : ""}`}
                      onClick={() => handleScout(1)}
                    >
                      {"\u{1F442}"} Listen
                    </button>
                    <button
                      title="Peek through keyhole"
                      style={btnStyle("#4a3010")}
                      className={`text-xs! px-2! py-1! flex-1 ${scoutLevel >= 2 ? "opacity-50" : ""}`}
                      onClick={() => handleScout(2)}
                    >
                      {"\u{1F511}"} Peek
                    </button>
                    <button
                      title="Full scout \u2014 risky"
                      style={btnStyle("#5a3a10")}
                      className={`text-xs! px-2! py-1! flex-1 ${scoutLevel >= 3 ? "opacity-50" : ""}`}
                      onClick={() => handleScout(3)}
                    >
                      {"\u{1F575}"} Scout
                    </button>
                  </div>
                )}

                {(adjacentIds.has(node.id) || node.id === currentRoomId) &&
                  node.enemies.length > 0 &&
                  !node.trap && (
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(TRAP_INFO).map(([key, t]) => (
                        <button
                          key={key}
                          title={t.desc}
                          disabled={player.gold < t.cost}
                          style={btnStyle(t.color, player.gold < t.cost)}
                          className="text-xs! px-2! py-1!"
                          onClick={() => {
                            onSetTrap(node.id, key);
                            setSelected(node.id);
                          }}
                        >
                          {t.icon}
                          {t.cost}
                          {"\u{1FA99}"}
                        </button>
                      ))}
                    </div>
                  )}

                {(adjacentIds.has(node.id) || node.id === currentRoomId) &&
                  node.enemies.length > 0 &&
                  !node.blocked && (
                    <button
                      style={btnStyle("#2980b9", player.gold < BLOCK_DOOR_COST)}
                      className="text-xs! px-2! py-1!"
                      disabled={player.gold < BLOCK_DOOR_COST}
                      onClick={() => {
                        onBlockDoor(node.id);
                        setSelected(node.id);
                      }}
                    >
                      {"\u{1F6A7}"} Block ({BLOCK_DOOR_COST}
                      {"\u{1FA99}"})
                    </button>
                  )}

                {!debugMode &&
                  node.state !== "locked" &&
                  !adjacentIds.has(node.id) &&
                  node.id !== currentRoomId && (
                    <div className="text-xs text-crypt-dim italic">
                      Not adjacent {"\u2014"} move closer.
                    </div>
                  )}
              </div>
            </div>
          ) : (
            <div className="panel">
              <p className="text-base text-crypt-muted leading-relaxed">Click any visible room.</p>
            </div>
          )}

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
