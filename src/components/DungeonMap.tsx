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

/* ── Grid Canvas Renderer (cell-based) ── */
function GridCanvas({
  grid,
  dungeon,
  currentRoomId,
  visible,
  debugMode,
  onClickRoom,
}: {
  grid: DungeonGrid;
  dungeon: DungeonNode[];
  currentRoomId: string;
  visible: Set<string>;
  debugMode: boolean;
  onClickRoom: (nodeId: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { height, width, cells } = grid;
    canvas.width = width * CELL_PX;
    canvas.height = height * CELL_PX;

    ctx.fillStyle = "#080610";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Build gridRoomId → node lookup for coloring
    const gridIdToNode = new Map<number, DungeonNode>();
    for (const node of dungeon) {
      if (node.gridRoomId != null) gridIdToNode.set(node.gridRoomId, node);
    }

    // Build corridor visibility map
    // debug mode: all corridors visible
    // visited/cleared rooms: BFS flood all reachable corridor cells
    // reachable rooms: only corridor cells directly adjacent to room cells
    const corVisible = Array.from({ length: height }, () => new Uint8Array(width));
    const dirs4 = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    if (debugMode) {
      for (let r = 0; r < height; r++)
        for (let c = 0; c < width; c++) if (cells[r][c] === 0) corVisible[r][c] = 1;
    }

    // Pass 1: flood corridors from visited/cleared rooms
    for (const node of dungeon) {
      if (node.gridRoomId == null || !visible.has(node.id)) continue;
      const isExplored = node.state === "visited" || node.state === "cleared";
      if (!isExplored) continue;
      // Find corridor cells adjacent to this room's cells, then BFS
      const queue: [number, number][] = [];
      for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
          if (cells[r][c] !== node.gridRoomId) continue;
          for (const [dr, dc] of dirs4) {
            const nr = r + dr,
              nc = c + dc;
            if (
              nr >= 0 &&
              nr < height &&
              nc >= 0 &&
              nc < width &&
              cells[nr][nc] === 0 &&
              !corVisible[nr][nc]
            ) {
              corVisible[nr][nc] = 1;
              queue.push([nr, nc]);
            }
          }
        }
      }
      // BFS through corridor cells
      let qi = 0;
      while (qi < queue.length) {
        const [cr, cc] = queue[qi++];
        for (const [dr, dc] of dirs4) {
          const nr = cr + dr,
            nc = cc + dc;
          if (
            nr >= 0 &&
            nr < height &&
            nc >= 0 &&
            nc < width &&
            cells[nr][nc] === 0 &&
            !corVisible[nr][nc]
          ) {
            corVisible[nr][nc] = 1;
            queue.push([nr, nc]);
          }
        }
      }
    }

    // Pass 2: reachable rooms — only 1 cell deep into corridors
    for (const node of dungeon) {
      if (node.gridRoomId == null || !visible.has(node.id)) continue;
      if (node.state !== "reachable") continue;
      for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
          if (cells[r][c] !== node.gridRoomId) continue;
          for (const [dr, dc] of dirs4) {
            const nr = r + dr,
              nc = c + dc;
            if (
              nr >= 0 &&
              nr < height &&
              nc >= 0 &&
              nc < width &&
              cells[nr][nc] === 0 &&
              !corVisible[nr][nc]
            ) {
              corVisible[nr][nc] = 1;
            }
          }
        }
      }
    }

    // Paint every cell from the raw grid
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const v = cells[r][c];
        if (v === 1) continue;

        const x = c * CELL_PX;
        const y = r * CELL_PX;

        if (v === 0) {
          if (corVisible[r][c]) {
            ctx.fillStyle = "#1a1208";
            ctx.fillRect(x, y, CELL_PX, CELL_PX);
            ctx.strokeStyle = "rgba(255,255,255,0.02)";
            ctx.strokeRect(x, y, CELL_PX, CELL_PX);
          }
        } else {
          // Room cell (v >= 2)
          const node = gridIdToNode.get(v);
          if (!node || !visible.has(node.id)) continue;
          ctx.fillStyle = roomColor(node, currentRoomId);
          ctx.fillRect(x, y, CELL_PX, CELL_PX);
          ctx.strokeStyle = "rgba(255,255,255,0.03)";
          ctx.strokeRect(x, y, CELL_PX, CELL_PX);
        }
      }
    }

    // Draw organic outline around room cells (highlight edges adjacent to walls)
    function outlineRoomCells(roomGridId: number, color: string, lw: number) {
      if (!ctx) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.beginPath();
      for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
          if (cells[r][c] !== roomGridId) continue;
          const x = c * CELL_PX,
            y = r * CELL_PX;
          // Draw edge segments where neighbor is wall or out of bounds
          if (r === 0 || cells[r - 1][c] !== roomGridId) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + CELL_PX, y);
          }
          if (r === height - 1 || cells[r + 1][c] !== roomGridId) {
            ctx.moveTo(x, y + CELL_PX);
            ctx.lineTo(x + CELL_PX, y + CELL_PX);
          }
          if (c === 0 || cells[r][c - 1] !== roomGridId) {
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + CELL_PX);
          }
          if (c === width - 1 || cells[r][c + 1] !== roomGridId) {
            ctx.moveTo(x + CELL_PX, y);
            ctx.lineTo(x + CELL_PX, y + CELL_PX);
          }
        }
      }
      ctx.stroke();
    }

    // Highlight current room
    const curNode = dungeon.find((n) => n.id === currentRoomId);
    if (curNode?.gridRoomId != null && visible.has(curNode.id)) {
      outlineRoomCells(curNode.gridRoomId, "#d4a830", 2);
    }

    // Highlight reachable rooms
    for (const node of dungeon) {
      if (node.state === "reachable" && node.gridRoomId != null && visible.has(node.id)) {
        outlineRoomCells(node.gridRoomId, "#7a4018", 1);
      }
    }
  }, [grid, dungeon, currentRoomId, visible, debugMode]);

  useEffect(() => {
    draw();
  }, [draw]);

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bcr = canvas.getBoundingClientRect();
    // Scale click coords from CSS size to canvas pixel size
    const scaleX = canvas.width / bcr.width;
    const scaleY = canvas.height / bcr.height;
    const x = (e.clientX - bcr.left) * scaleX;
    const y = (e.clientY - bcr.top) * scaleY;
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
      style={{ imageRendering: "pixelated", cursor: "pointer", width: "100%", height: "100%" }}
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
  gridWidth,
  gridHeight,
}: {
  dungeon: DungeonNode[];
  currentRoomId: string;
  adjacentIds: Set<string>;
  debugMode: boolean;
  soundIcons: { roomId: string; texts: string[]; key: number }[];
  gridWidth: number;
  gridHeight: number;
}) {
  return (
    <>
      {dungeon.map((n) => {
        if (!n.bbox) return null;
        const visited = n.state === "visited" || n.state === "cleared";
        const reachable = n.state === "reachable";
        if (!debugMode && !visited && !reachable && !adjacentIds.has(n.id)) return null;

        const { minRow, maxRow, minCol, maxCol } = n.bbox;
        const cxPct = ((minCol + maxCol + 1) / 2 / gridWidth) * 100;
        const cyPct = ((minRow + maxRow + 1) / 2 / gridHeight) * 100;
        const isCurrent = n.id === currentRoomId;

        return (
          <div
            key={n.id + "-lbl"}
            style={{
              position: "absolute",
              left: `${cxPct}%`,
              top: `${cyPct}%`,
              transform: "translate(-50%, -50%)",
              fontSize: isCurrent ? "0.75rem" : "0.65rem",
              color: isCurrent ? "#ece0c0" : visited ? "#7f8c8d" : "#5a4028",
              whiteSpace: "nowrap",
              textShadow: "0 1px 4px #000, 0 0 8px #000",
              letterSpacing: "0.04em",
              zIndex: 3,
              pointerEvents: "none",
              fontWeight: isCurrent ? "bold" : "normal",
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
        const cxPct = ((minCol + maxCol + 1) / 2 / gridWidth) * 100;
        const cyPct = ((minRow + maxRow + 1) / 2 / gridHeight) * 100;
        return (
          <div
            key={icon.key}
            title={icon.texts.join("\n")}
            style={{
              position: "absolute",
              left: `${cxPct}%`,
              top: `${cyPct}%`,
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
        {/* Map canvas */}
        <div
          ref={scrollRef}
          className="relative shrink-0 rounded-md border border-crypt-border-dim"
          style={{
            width: "min(700px, 55vw, calc(100vh - 160px))",
            aspectRatio: `${mapPxW} / ${mapPxH}`,
            maxHeight: "calc(100vh - 160px)",
            background: "#080610",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <GridCanvas
              grid={dungeonGrid}
              dungeon={dungeon}
              currentRoomId={currentRoomId}
              visible={visible}
              debugMode={debugMode}
              onClickRoom={handleClickRoom}
            />
            <RoomLabels
              dungeon={dungeon}
              currentRoomId={currentRoomId}
              adjacentIds={adjacentIds}
              debugMode={debugMode}
              soundIcons={soundIcons}
              gridWidth={dungeonGrid.width}
              gridHeight={dungeonGrid.height}
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

                {adjacentIds.has(node.id) && node.id !== currentRoomId && (
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
