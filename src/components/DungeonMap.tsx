import { useState } from "react";
import { btnStyle } from "../styles";
import {
  TRAP_INFO,
  TYPE_COLOR,
  TYPE_ICON,
  ROOM_W_SM,
  ROOM_H_SM,
  ROOM_W_LG,
  ROOM_H_LG,
  COR_THICK,
} from "../data/rooms";
import { getScoutIntel } from "../utils/dungeon";
import { StatusBadges, HpBar } from "./shared";
import type { DungeonNode, Player } from "../types";

function corridorRect(a: DungeonNode, b: DungeonNode) {
  const hw = ROOM_W_SM / 2,
    hh = ROOM_H_SM / 2;
  const ax = a.cx,
    ay = a.cy,
    bx = b.cx,
    by = b.cy;
  if (Math.abs(by - ay) >= Math.abs(bx - ax)) {
    const top = Math.min(ay, by) + hh,
      bottom = Math.max(ay, by) - hh;
    return {
      x: (ax + bx) / 2 - COR_THICK / 2,
      y: Math.min(top, bottom),
      w: COR_THICK,
      h: Math.abs(bottom - top),
    };
  } else {
    const left = Math.min(ax, bx) + hw,
      right = Math.max(ax, bx) - hw;
    return {
      x: Math.min(left, right),
      y: (ay + by) / 2 - COR_THICK / 2,
      w: Math.abs(right - left),
      h: COR_THICK,
    };
  }
}

function RoomTile({
  node,
  isSelected,
  isAdjacent,
  onClick,
}: {
  node: DungeonNode;
  isSelected: boolean;
  isAdjacent: boolean;
  onClick: () => void;
}) {
  const { type, state, enemies, trap } = node;
  const visited = state === "visited" || state === "cleared";
  const cleared = state === "cleared";
  const canClick = isAdjacent && state !== "locked";

  const bg = cleared ? "#0e1a0a" : visited ? "#1c1608" : isAdjacent ? "#1a1006" : "#0c0a10";
  const border = isSelected
    ? "#e74c3c"
    : isAdjacent && !visited
      ? "#7a4018"
      : visited
        ? "#3a2a14"
        : "#18121e";
  const wallCol = visited ? "#4a3a1e" : isAdjacent ? "#382818" : "#201828";
  const dotCol = visited ? "#342810" : isAdjacent ? "#28180c" : "#181220";
  const featColor = type === "boss" ? "#e74c3c" : type === "rest" ? "#3ddc84" : "#e88070";
  const featGlyph = cleared
    ? "\u2713"
    : type === "combat"
      ? "\u2716"
      : type === "rest"
        ? "\u263D"
        : type === "boss"
          ? "\u2620"
          : "\u2191";

  const COLS = 4,
    ROWS = 3;
  const grid = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => {
      if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) return "wall";
      if (r === 1 && c === 2 && visited) return "feat";
      return "floor";
    }),
  );

  return (
    <div
      onClick={canClick ? onClick : undefined}
      style={{
        position: "absolute",
        left: node.cx - ROOM_W_SM / 2,
        top: node.cy - ROOM_H_SM / 2,
        width: ROOM_W_SM,
        height: ROOM_H_SM,
        background: bg,
        border: `2px solid ${border}`,
        borderRadius: "3px",
        cursor: canClick ? "pointer" : "default",
        boxShadow: isSelected
          ? "0 0 14px rgba(231,76,60,0.5)"
          : isAdjacent
            ? "0 0 10px rgba(120,64,24,0.4)"
            : "none",
        opacity: !visited && !isAdjacent ? 0.18 : 1,
        overflow: "hidden",
        zIndex: 2,
        transition: "all 0.2s",
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          gridTemplateColumns: `repeat(${COLS},1fr)`,
          gridTemplateRows: `repeat(${ROWS},1fr)`,
          padding: "2px",
        }}
      >
        {grid.flat().map((cell, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: cell === "feat" ? "0.65rem" : "0.35rem",
              color: cell === "wall" ? wallCol : cell === "floor" ? dotCol : featColor,
              fontWeight: cell === "feat" ? "bold" : "normal",
              lineHeight: 1,
            }}
          >
            {cell === "wall" ? "\u25AA" : cell === "floor" ? "\u00B7" : featGlyph}
          </div>
        ))}
      </div>

      {!visited && !isAdjacent && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#080610e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.9rem",
            color: "#201830",
          }}
        >
          ?
        </div>
      )}

      {(visited || isAdjacent) && !cleared && enemies.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "2px",
            right: "3px",
            background: "rgba(196,28,28,0.9)",
            borderRadius: "2px",
            fontSize: "0.55rem",
            color: "#ffd0d0",
            padding: "0px 3px",
            lineHeight: 1.5,
            fontWeight: "bold",
          }}
        >
          {enemies.length}
          {"\u2716"}
        </div>
      )}
      {trap && (
        <div style={{ position: "absolute", top: "2px", left: "3px", fontSize: "0.6rem" }}>
          {TRAP_INFO[trap]?.icon}
        </div>
      )}
    </div>
  );
}

function CurrentRoomTile({
  node,
  isSelected,
  onClick,
}: {
  node: DungeonNode;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { type, state, enemies, trap, blocked } = node;
  const cleared = state === "cleared";
  const tc = TYPE_COLOR[type] || "#7f8c8d";
  const featColor =
    type === "boss"
      ? "#e74c3c"
      : type === "rest"
        ? "#3ddc84"
        : type === "start"
          ? "#a0b0b8"
          : "#e88070";
  const featGlyph = cleared
    ? "\u2713"
    : type === "combat"
      ? "\u2716"
      : type === "rest"
        ? "\u263D"
        : type === "boss"
          ? "\u2620"
          : "\u2191";

  const COLS = 9,
    ROWS = 6;
  const grid = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => {
      if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) return "wall";
      if (
        (r === 1 && c === 1) ||
        (r === 1 && c === COLS - 2) ||
        (r === ROWS - 2 && c === 1) ||
        (r === ROWS - 2 && c === COLS - 2)
      )
        return "pillar";
      if (r === Math.floor(ROWS / 2) && c === Math.floor(COLS / 2)) return "feat";
      return "floor";
    }),
  );

  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        left: node.cx - ROOM_W_LG / 2,
        top: node.cy - ROOM_H_LG / 2,
        width: ROOM_W_LG,
        height: ROOM_H_LG,
        background: "#201808",
        border: `2px solid ${isSelected ? "#e74c3c" : "#d4a830"}`,
        borderRadius: "5px",
        boxShadow:
          "0 0 35px rgba(212,168,48,0.3), 0 0 70px rgba(212,168,48,0.1), inset 0 0 25px rgba(0,0,0,0.5)",
        overflow: "hidden",
        zIndex: 5,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          gridTemplateColumns: `repeat(${COLS},1fr)`,
          gridTemplateRows: `repeat(${ROWS},1fr)`,
          padding: "4px",
        }}
      >
        {grid.flat().map((cell, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: cell === "feat" ? "1.2rem" : cell === "pillar" ? "0.55rem" : "0.38rem",
              color:
                cell === "wall"
                  ? "#5a4828"
                  : cell === "floor"
                    ? "#382c18"
                    : cell === "pillar"
                      ? "#6a5230"
                      : featColor,
              fontWeight: cell === "feat" ? "bold" : "normal",
              lineHeight: 1,
            }}
          >
            {cell === "wall"
              ? "\u25AA"
              : cell === "floor"
                ? "\u00B7"
                : cell === "pillar"
                  ? "\u25AA"
                  : featGlyph}
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(transparent,rgba(0,0,0,0.9) 40%)",
          padding: "14px 12px 8px",
        }}
      >
        <div className="text-sm tracking-widest uppercase leading-none mb-1" style={{ color: tc }}>
          {TYPE_ICON[type]} {type}
        </div>
        <div className="text-lg font-bold leading-tight" style={{ color: "#ece0c0" }}>
          {node.label}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: "6px",
          right: "8px",
          fontSize: "1rem",
          filter: "drop-shadow(0 0 6px #d4a830)",
        }}
      >
        {"\u2691"}
      </div>

      {!cleared && enemies.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "6px",
            left: "8px",
            background: "rgba(196,28,28,0.92)",
            borderRadius: "3px",
            fontSize: "0.75rem",
            color: "#ffd5c8",
            padding: "2px 8px",
            fontWeight: "bold",
          }}
        >
          {enemies.length}
          {"\u2716"}
        </div>
      )}
      {cleared && (
        <div
          style={{
            position: "absolute",
            top: "6px",
            left: "8px",
            background: "rgba(30,100,30,0.85)",
            borderRadius: "3px",
            fontSize: "0.7rem",
            color: "#b0f0b0",
            padding: "2px 8px",
          }}
        >
          cleared
        </div>
      )}
      {trap && (
        <div style={{ position: "absolute", top: "30px", left: "8px", fontSize: "0.9rem" }}>
          {TRAP_INFO[trap]?.icon}
        </div>
      )}
      {blocked && (
        <div style={{ position: "absolute", top: "30px", right: "8px", fontSize: "0.85rem" }}>
          {"\u{1F6A7}"}
        </div>
      )}
    </div>
  );
}

export function DungeonMap({
  dungeon,
  player,
  currentRoomId,
  dungeonName,
  debugMode,
  dungeonTurn,
  onEnterRoom,
  onScout,
  onSetTrap,
  onBlockDoor,
  onToggleDebug,
  onReturnToTown,
}: {
  dungeon: DungeonNode[];
  player: Player;
  currentRoomId: string;
  dungeonName: string;
  debugMode: boolean;
  dungeonTurn: number;
  onEnterRoom: (id: string) => void;
  onScout: (id: string, level: number) => void;
  onSetTrap: (id: string, trap: string) => void;
  onBlockDoor: (id: string) => void;
  onToggleDebug: () => void;
  onReturnToTown: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [scoutResult, setScoutResult] = useState<string | null>(null);
  const [scoutLevel, setScoutLevel] = useState(0);

  const node = selected ? dungeon.find((n) => n.id === selected) : null;
  const typeColor: Record<string, string> = {
    combat: "#c0392b",
    rest: "#3ddc84",
    boss: "#e74c3c",
    start: "#7f8c8d",
  };

  const mapW = Math.max(...dungeon.map((n) => n.cx)) + 140;
  const mapH = Math.max(...dungeon.map((n) => n.cy)) + 80;

  const corridors: { a: DungeonNode; b: DungeonNode; key: string }[] = [];
  const seen = new Set<string>();
  dungeon.forEach((a) => {
    a.connections.forEach((bid) => {
      const key = [a.id, bid].sort().join("|");
      if (seen.has(key)) return;
      seen.add(key);
      const b = dungeon.find((n) => n.id === bid);
      if (b) corridors.push({ a, b, key });
    });
  });

  const currentRoom = dungeon.find((n) => n.id === currentRoomId);
  const adjacentIds = new Set(currentRoom?.connections || []);

  function handleClick(n: DungeonNode) {
    if (n.state === "locked" && !debugMode) return;
    if (!debugMode && n.id !== currentRoomId && !adjacentIds.has(n.id)) return;
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

  function corColor(a: DungeonNode, b: DungeonNode) {
    const states = [a.state, b.state];
    if (states.includes("reachable")) return "#5a3618";
    if (states.includes("visited") || states.includes("cleared")) return "#3a2814";
    return "#1c140c";
  }

  return (
    <div className="min-h-screen bg-crypt-bg text-crypt-text font-serif flex flex-col items-center gap-3 relative overflow-y-auto p-4">
      <div className="vignette" />

      {/* Top bar */}
      <div className="flex gap-4 items-center relative z-1 flex-wrap justify-center">
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

      <div className="flex gap-6 relative z-1 flex-wrap justify-center items-start w-full px-4">
        {/* Map canvas */}
        <div
          className="relative shrink-0 overflow-hidden rounded-md border border-crypt-border-dim"
          style={{ width: `${mapW}px`, height: `${mapH}px`, background: "#0a0810" }}
        >
          {/* Grid texture */}
          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,#ccc 0,#ccc 1px,transparent 1px,transparent 10px),repeating-linear-gradient(90deg,#ccc 0,#ccc 1px,transparent 1px,transparent 10px)",
            }}
          />

          <svg
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 1, pointerEvents: "none" }}
          >
            {corridors.map(({ a, b, key }) => {
              const aSeen =
                a.id === currentRoomId || a.state === "visited" || a.state === "cleared";
              const bSeen =
                b.id === currentRoomId || b.state === "visited" || b.state === "cleared";
              if (!aSeen && !bSeen) return null;
              const r = corridorRect(a, b);
              const col = corColor(a, b);
              const isHot = a.id === currentRoomId || b.id === currentRoomId;
              return (
                <g key={key}>
                  <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={col} />
                  <rect
                    x={r.w > r.h ? r.x + 1 : r.x + 2}
                    y={r.w > r.h ? r.y + 2 : r.y + 1}
                    width={r.w > r.h ? r.w - 2 : r.w - 4}
                    height={r.w > r.h ? r.h - 4 : r.h - 2}
                    fill={isHot ? "#7a4820" : "#342010"}
                    opacity="0.6"
                  />
                </g>
              );
            })}
          </svg>

          {dungeon.map((n) => {
            if (n.id === currentRoomId)
              return (
                <CurrentRoomTile
                  key={n.id}
                  node={n}
                  isSelected={selected === n.id}
                  onClick={() => handleClick(n)}
                />
              );
            return (
              <RoomTile
                key={n.id}
                node={n}
                isSelected={selected === n.id}
                isAdjacent={adjacentIds.has(n.id)}
                onClick={() => handleClick(n)}
              />
            );
          })}

          {/* Room labels */}
          {dungeon.map((n) => {
            if (n.id === currentRoomId) return null;
            const visited = n.state === "visited" || n.state === "cleared";
            if (!visited && !adjacentIds.has(n.id)) return null;
            const tc = TYPE_COLOR[n.type] || "#7f8c8d";
            return (
              <div
                key={n.id + "-lbl"}
                style={{
                  position: "absolute",
                  left: n.cx,
                  top: n.cy + ROOM_H_SM / 2 + 4,
                  transform: "translateX(-50%)",
                  fontSize: "0.7rem",
                  color: visited ? tc : "#5a4028",
                  whiteSpace: "nowrap",
                  textShadow: "0 1px 4px #000",
                  letterSpacing: "0.04em",
                  zIndex: 3,
                  pointerEvents: "none",
                  maxWidth: "90px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {visited ? n.label : "???"}
              </div>
            );
          })}
        </div>

        {/* Side panel */}
        <div className="flex-1 min-w-[280px] max-w-[360px] flex flex-col gap-3">
          {node ? (
            <div className="panel">
              <div
                className="text-sm tracking-widest mb-1 uppercase"
                style={{ color: typeColor[node.type] }}
              >
                {TYPE_ICON[node.type]} {node.type}
              </div>
              <div className="text-lg font-bold text-crypt-text mb-2 leading-tight">
                {node.state === "locked" && !debugMode ? "???" : node.label}
              </div>

              {node.state === "cleared" && (
                <p className="text-sm text-crypt-green mb-1">Room cleared.</p>
              )}
              {node.id === currentRoomId && (
                <p className="text-sm text-crypt-gold mb-1">{"\u2691"} You are here.</p>
              )}

              {(node.state === "reachable" || node.state === "visited") &&
                node.type === "combat" && (
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
                  node.state !== "cleared" &&
                  node.state !== "locked" && (
                    <button
                      style={btnStyle(typeColor[node.type] || "#8b0000")}
                      onClick={() => {
                        onEnterRoom(node.id);
                        setSelected(null);
                      }}
                    >
                      {node.type === "combat"
                        ? "\u2694 Enter"
                        : node.type === "rest"
                          ? "\u{1F56F} Rest"
                          : "\u2620 Enter \u2014 Boss"}
                    </button>
                  )}

                {adjacentIds.has(node.id) && node.type === "combat" && node.state !== "cleared" && (
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
                  node.type === "combat" &&
                  !node.trap &&
                  node.state !== "cleared" && (
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
                  node.type === "combat" &&
                  !node.blocked &&
                  node.state !== "cleared" && (
                    <button
                      style={btnStyle("#2980b9", player.gold < 10)}
                      className="text-xs! px-2! py-1!"
                      disabled={player.gold < 10}
                      onClick={() => {
                        onBlockDoor(node.id);
                        setSelected(node.id);
                      }}
                    >
                      {"\u{1F6A7}"} Block (10{"\u{1FA99}"})
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
              <p className="text-base text-crypt-muted leading-relaxed mb-3">
                Click any visible room.
              </p>
              <div className="flex flex-col gap-1.5">
                {(
                  [
                    ["\u2694", "combat", "#c0392b"],
                    ["\u{1F56F}", "rest", "#3ddc84"],
                    ["\u2620", "boss", "#e74c3c"],
                  ] as const
                ).map(([icon, label, color]) => (
                  <span key={label} className="text-sm" style={{ color }}>
                    {icon} {label}
                  </span>
                ))}
              </div>
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
    </div>
  );
}
