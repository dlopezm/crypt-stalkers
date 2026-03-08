import { useState } from "react";
import { S } from "../styles";
import { TRAP_INFO, TYPE_COLOR, TYPE_ICON, SLOT_POS, MAP_W, MAP_H, ROOM_W_SM, ROOM_H_SM, ROOM_W_LG, ROOM_H_LG, COR_THICK } from "../data/rooms";
import { getScoutIntel } from "../utils/dungeon";
import { StatusBadges, HpBar } from "./shared";
import type { DungeonNode, Player } from "../types";

function corridorRect(a: DungeonNode, b: DungeonNode) {
  const hw = ROOM_W_SM / 2, hh = ROOM_H_SM / 2;
  const { cx: ax, cy: ay } = SLOT_POS[a.slot];
  const { cx: bx, cy: by } = SLOT_POS[b.slot];
  if (Math.abs(by - ay) >= Math.abs(bx - ax)) {
    const top = Math.min(ay, by) + hh, bottom = Math.max(ay, by) - hh;
    return { x: (ax + bx) / 2 - COR_THICK / 2, y: Math.min(top, bottom), w: COR_THICK, h: Math.abs(bottom - top) };
  } else {
    const left = Math.min(ax, bx) + hw, right = Math.max(ax, bx) - hw;
    return { x: Math.min(left, right), y: (ay + by) / 2 - COR_THICK / 2, w: Math.abs(right - left), h: COR_THICK };
  }
}

function RoomTile({ node, isSelected, isAdjacent, onClick }: {
  node: DungeonNode; isSelected: boolean; isAdjacent: boolean; onClick: () => void;
}) {
  const { type, state, enemies, trap } = node;
  const visited = state === "visited" || state === "cleared";
  const cleared = state === "cleared";
  const canClick = isAdjacent && state !== "locked";

  const bg = cleared ? "#0c1208" : visited ? "#181208" : isAdjacent ? "#160d06" : "#0a080c";
  const border = isSelected ? "#e74c3c" : isAdjacent && !visited ? "#6a3010" : visited ? "#2e2010" : "#130e18";
  const wallCol = visited ? "#3a2a14" : isAdjacent ? "#2a1a0c" : "#1a1620";
  const dotCol = visited ? "#2a1e0c" : isAdjacent ? "#1e1208" : "#141018";
  const featColor = type === "boss" ? "#e74c3c" : type === "rest" ? "#2ecc71" : type === "shop" ? "#f0c040" : "#e07060";
  const featGlyph = cleared ? "\u2713" : type === "combat" ? "\u2716" : type === "rest" ? "\u263D" : type === "shop" ? "$" : type === "boss" ? "\u2620" : "\u2191";
  const { cx, cy } = SLOT_POS[node.slot];

  const COLS = 4, ROWS = 3;
  const grid = Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => {
    if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) return "wall";
    if (r === 1 && c === 2 && visited) return "feat";
    return "floor";
  }));

  return (
    <div onClick={canClick ? onClick : undefined} style={{
      position: "absolute",
      left: cx - ROOM_W_SM / 2, top: cy - ROOM_H_SM / 2,
      width: ROOM_W_SM, height: ROOM_H_SM,
      background: bg, border: `1.5px solid ${border}`, borderRadius: "2px",
      cursor: canClick ? "pointer" : "default",
      boxShadow: isSelected ? "0 0 12px rgba(231,76,60,0.5)" : isAdjacent ? "0 0 7px rgba(100,48,16,0.4)" : "none",
      opacity: !visited && !isAdjacent ? 0.18 : 1,
      overflow: "hidden", zIndex: 2, transition: "all 0.2s", userSelect: "none",
    }}>
      <div style={{
        position: "absolute", inset: 0, display: "grid",
        gridTemplateColumns: `repeat(${COLS},1fr)`, gridTemplateRows: `repeat(${ROWS},1fr)`, padding: "1px",
      }}>
        {grid.flat().map((cell, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: cell === "feat" ? "0.55rem" : "0.28rem",
            color: cell === "wall" ? wallCol : cell === "floor" ? dotCol : featColor,
            fontWeight: cell === "feat" ? "bold" : "normal", lineHeight: 1,
          }}>{cell === "wall" ? "\u25AA" : cell === "floor" ? "\u00B7" : featGlyph}</div>
        ))}
      </div>

      {!visited && !isAdjacent && (
        <div style={{
          position: "absolute", inset: 0, background: "#080610e0",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.75rem", color: "#16121e",
        }}>?</div>
      )}

      {(visited || isAdjacent) && !cleared && enemies.length > 0 && (
        <div style={{
          position: "absolute", top: "1px", right: "2px",
          background: "rgba(160,20,20,0.9)", borderRadius: "1px",
          fontSize: "0.42rem", color: "#ffc8c8", padding: "0px 2px", lineHeight: 1.4, fontWeight: "bold",
        }}>{enemies.length}{"\u2716"}</div>
      )}
      {trap && <div style={{ position: "absolute", top: "1px", left: "2px", fontSize: "0.5rem" }}>{TRAP_INFO[trap]?.icon}</div>}
    </div>
  );
}

function CurrentRoomTile({ node, isSelected, onClick }: {
  node: DungeonNode; isSelected: boolean; onClick: () => void;
}) {
  const { type, state, enemies, trap, blocked } = node;
  const cleared = state === "cleared";
  const tc = TYPE_COLOR[type] || "#7f8c8d";
  const featColor = type === "boss" ? "#e74c3c" : type === "rest" ? "#2ecc71" : type === "shop" ? "#f0c040" : type === "start" ? "#95a5a6" : "#e07060";
  const featGlyph = cleared ? "\u2713" : type === "combat" ? "\u2716" : type === "rest" ? "\u263D" : type === "shop" ? "$" : type === "boss" ? "\u2620" : "\u2191";
  const { cx, cy } = SLOT_POS[node.slot];

  const COLS = 9, ROWS = 6;
  const grid = Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => {
    if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) return "wall";
    if ((r === 1 && c === 1) || (r === 1 && c === COLS - 2) || (r === ROWS - 2 && c === 1) || (r === ROWS - 2 && c === COLS - 2)) return "pillar";
    if (r === Math.floor(ROWS / 2) && c === Math.floor(COLS / 2)) return "feat";
    return "floor";
  }));

  return (
    <div onClick={onClick} style={{
      position: "absolute",
      left: cx - ROOM_W_LG / 2, top: cy - ROOM_H_LG / 2,
      width: ROOM_W_LG, height: ROOM_H_LG,
      background: "#1c1408",
      border: `2px solid ${isSelected ? "#e74c3c" : "#c8a030"}`,
      borderRadius: "4px",
      boxShadow: "0 0 30px rgba(200,160,48,0.3), 0 0 60px rgba(200,160,48,0.1), inset 0 0 20px rgba(0,0,0,0.5)",
      overflow: "hidden", zIndex: 5, cursor: "pointer", userSelect: "none",
    }}>
      <div style={{
        position: "absolute", inset: 0, display: "grid",
        gridTemplateColumns: `repeat(${COLS},1fr)`, gridTemplateRows: `repeat(${ROWS},1fr)`, padding: "3px",
      }}>
        {grid.flat().map((cell, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: cell === "feat" ? "1.1rem" : cell === "pillar" ? "0.5rem" : "0.32rem",
            color: cell === "wall" ? "#4a3820" : cell === "floor" ? "#2e2210" : cell === "pillar" ? "#5a4228" : featColor,
            fontWeight: cell === "feat" ? "bold" : "normal", lineHeight: 1,
          }}>{cell === "wall" ? "\u25AA" : cell === "floor" ? "\u00B7" : cell === "pillar" ? "\u25AA" : featGlyph}</div>
        ))}
      </div>

      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "linear-gradient(transparent,rgba(0,0,0,0.9) 40%)",
        padding: "10px 8px 5px",
      }}>
        <div style={{ fontSize: "0.52rem", color: tc, letterSpacing: "0.14em", textTransform: "uppercase", lineHeight: 1, marginBottom: "2px" }}>
          {TYPE_ICON[type]} {type}
        </div>
        <div style={{ fontSize: "0.82rem", fontWeight: "bold", color: "#e8d8b0", lineHeight: 1.15 }}>{node.label}</div>
      </div>

      <div style={{ position: "absolute", top: "5px", right: "6px", fontSize: "0.9rem", filter: "drop-shadow(0 0 5px #c8a030)" }}>{"\u2691"}</div>

      {!cleared && enemies.length > 0 && (
        <div style={{
          position: "absolute", top: "5px", left: "6px",
          background: "rgba(180,30,30,0.92)", borderRadius: "2px",
          fontSize: "0.65rem", color: "#ffd5c8", padding: "2px 6px", fontWeight: "bold",
        }}>{enemies.length}{"\u2716"}</div>
      )}
      {cleared && (
        <div style={{
          position: "absolute", top: "5px", left: "6px",
          background: "rgba(30,80,30,0.85)", borderRadius: "2px",
          fontSize: "0.6rem", color: "#a0e8a0", padding: "2px 6px",
        }}>cleared</div>
      )}
      {trap && <div style={{ position: "absolute", top: "28px", left: "6px", fontSize: "0.8rem" }}>{TRAP_INFO[trap]?.icon}</div>}
      {blocked && <div style={{ position: "absolute", top: "28px", right: "6px", fontSize: "0.75rem" }}>{"\u{1F6A7}"}</div>}
    </div>
  );
}

export function DungeonMap({ dungeon, player, currentRoomId, debugMode, dungeonTurn, onEnterRoom, onScout, onSetTrap, onBlockDoor, onToggleDebug }: {
  dungeon: DungeonNode[];
  player: Player;
  currentRoomId: string;
  debugMode: boolean;
  dungeonTurn: number;
  onEnterRoom: (id: string) => void;
  onScout: (id: string, level: number) => void;
  onSetTrap: (id: string, trap: string) => void;
  onBlockDoor: (id: string) => void;
  onToggleDebug: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [scoutResult, setScoutResult] = useState<string | null>(null);
  const [scoutLevel, setScoutLevel] = useState(0);

  const node = selected ? dungeon.find(n => n.id === selected) : null;
  const typeColor: Record<string, string> = { combat: "#c0392b", rest: "#2ecc71", shop: "#f0c040", boss: "#e74c3c", start: "#7f8c8d" };

  const corridors: { a: DungeonNode; b: DungeonNode; key: string }[] = [];
  const seen = new Set<string>();
  dungeon.forEach(a => {
    a.connections.forEach(bid => {
      const key = [a.id, bid].sort().join("|");
      if (seen.has(key)) return; seen.add(key);
      const b = dungeon.find(n => n.id === bid);
      if (b) corridors.push({ a, b, key });
    });
  });

  const currentRoom = dungeon.find(n => n.id === currentRoomId);
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
    if (states.includes("reachable")) return "#4a2a14";
    if (states.includes("visited") || states.includes("cleared")) return "#2e2010";
    return "#160f08";
  }

  return (
    <div style={{ ...S.root, padding: "0.8rem", gap: "0.7rem", overflowY: "auto" }}>
      <div style={S.vignette} />

      <div style={{ display: "flex", gap: "1rem", alignItems: "center", zIndex: 1, flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ ...S.title, fontSize: "1.3rem", margin: "0.3rem 0 0" }}>{"\u2620"} The Crypt</div>
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.72rem", color: "#c9b99a" }}>{"\u2764"} {player.hp}/{player.maxHp}</span>
          <span style={{ fontSize: "0.72rem", color: "#f0c040" }}>{"\u{1FA99}"} {player.gold}</span>
          <span style={{ fontSize: "0.72rem", color: "#7f8c8d" }}>{"\u{1F4DC}"} {player.deck.length}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", zIndex: 1, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", width: "100%", maxWidth: "820px" }}>
        <div style={{
          position: "relative", width: `${MAP_W}px`, height: `${MAP_H}px`,
          background: "#09070d", border: "1px solid #2a1f1a", borderRadius: "4px",
          flexShrink: 0, overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.04,
            backgroundImage: "repeating-linear-gradient(0deg,#ccc 0,#ccc 1px,transparent 1px,transparent 10px),repeating-linear-gradient(90deg,#ccc 0,#ccc 1px,transparent 1px,transparent 10px)",
          }} />

          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }}>
            {corridors.map(({ a, b, key }) => {
              const aSeen = a.id === currentRoomId || a.state === "visited" || a.state === "cleared";
              const bSeen = b.id === currentRoomId || b.state === "visited" || b.state === "cleared";
              if (!aSeen && !bSeen) return null;
              const r = corridorRect(a, b);
              const col = corColor(a, b);
              const isHot = a.id === currentRoomId || b.id === currentRoomId;
              return (
                <g key={key}>
                  <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={col} />
                  <rect
                    x={r.w > r.h ? r.x + 1 : r.x + 2} y={r.w > r.h ? r.y + 2 : r.y + 1}
                    width={r.w > r.h ? r.w - 2 : r.w - 4} height={r.w > r.h ? r.h - 4 : r.h - 2}
                    fill={isHot ? "#6a4018" : "#2a1c0c"} opacity="0.6"
                  />
                </g>
              );
            })}
          </svg>

          {dungeon.map(n => {
            if (n.id === currentRoomId) return (
              <CurrentRoomTile key={n.id} node={n}
                isSelected={selected === n.id}
                onClick={() => handleClick(n)} />
            );
            return (
              <RoomTile key={n.id} node={n}
                isSelected={selected === n.id}
                isAdjacent={adjacentIds.has(n.id)}
                onClick={() => handleClick(n)} />
            );
          })}

          {dungeon.map(n => {
            if (n.id === currentRoomId) return null;
            const visited = n.state === "visited" || n.state === "cleared";
            if (!visited && !adjacentIds.has(n.id)) return null;
            const { cx, cy } = SLOT_POS[n.slot];
            const tc = TYPE_COLOR[n.type] || "#7f8c8d";
            return (
              <div key={n.id + "-lbl"} style={{
                position: "absolute",
                left: cx, top: cy + ROOM_H_SM / 2 + 2,
                transform: "translateX(-50%)",
                fontSize: "0.46rem",
                color: visited ? tc : "#4a3020",
                whiteSpace: "nowrap",
                textShadow: "0 1px 3px #000",
                letterSpacing: "0.04em",
                zIndex: 3, pointerEvents: "none",
                maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {visited ? n.label : "???"}
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1, minWidth: "190px", maxWidth: "230px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {node ? (
            <div style={{ ...S.panel, padding: "0.8rem 1rem" }}>
              <div style={{ fontSize: "0.6rem", color: typeColor[node.type], letterSpacing: "0.15em", marginBottom: "3px", textTransform: "uppercase" }}>
                {TYPE_ICON[node.type]} {node.type}
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: "bold", color: "#ddd0b8", marginBottom: "6px", lineHeight: 1.2 }}>
                {node.state === "locked" && !debugMode ? "???" : node.label}
              </div>

              {node.state === "cleared" && <p style={{ fontSize: "0.65rem", color: "#3a5a3a", margin: "0 0 4px" }}>Room cleared.</p>}
              {node.id === currentRoomId && <p style={{ fontSize: "0.65rem", color: "#f0c040", margin: "0 0 4px" }}>{"\u2691"} You are here.</p>}

              {(node.state === "reachable" || node.state === "visited") && node.type === "combat" && (
                <div style={{ fontSize: "0.65rem", color: "#7a6a52", marginBottom: "6px", lineHeight: 1.7 }}>
                  {debugMode
                    ? <span style={{ color: "#9b59b6" }}>{node.enemies.length} enemies: {node.enemies.join(", ")}</span>
                    : scoutLevel === 0
                      ? <span style={{ color: "#3a2a1a", fontStyle: "italic" }}>Unknown. Scout to learn more.</span>
                      : scoutResult
                  }
                  {node.trap && <><br /><span style={{ color: TRAP_INFO[node.trap].color }}>{TRAP_INFO[node.trap].icon} {TRAP_INFO[node.trap].label} set.</span></>}
                  {node.blocked && <><br /><span style={{ color: "#3498db" }}>{"\u{1F6A7}"} Blocked.</span></>}
                </div>
              )}

              {scoutResult && scoutLevel > 0 && (
                <div style={{
                  fontSize: "0.65rem", color: "#d09040", margin: "0 0 7px", fontStyle: "italic",
                  lineHeight: 1.5, borderLeft: "2px solid #8b000055", paddingLeft: "7px",
                }}>{scoutResult}</div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {(adjacentIds.has(node.id) || debugMode) && node.state !== "cleared" && node.state !== "locked" && (
                  <button style={S.btn(typeColor[node.type] || "#8b0000")}
                    onClick={() => { onEnterRoom(node.id); setSelected(null); }}>
                    {node.type === "combat" ? "\u2694 Enter" : node.type === "rest" ? "\u{1F56F} Rest" : node.type === "shop" ? "\u{1F4B0} Shop" : "\u2620 Enter \u2014 Lich"}
                  </button>
                )}

                {adjacentIds.has(node.id) && node.type === "combat" && node.state !== "cleared" && (
                  <div style={{ display: "flex", gap: "3px" }}>
                    <button title="Listen at door (quiet, safe)" style={{ ...S.btn("#3a2a10"), fontSize: "0.65rem", padding: "0.25rem 0.45rem", flex: 1, opacity: scoutLevel >= 1 ? 0.5 : 1 }}
                      onClick={() => handleScout(1)}>{"\u{1F442}"} Listen</button>
                    <button title="Peek through keyhole (takes time)" style={{ ...S.btn("#4a3010"), fontSize: "0.65rem", padding: "0.25rem 0.45rem", flex: 1, opacity: scoutLevel >= 2 ? 0.5 : 1 }}
                      onClick={() => handleScout(2)}>{"\u{1F511}"} Peek</button>
                    <button title="Full scout \u2014 loud, risky" style={{ ...S.btn("#5a3a10"), fontSize: "0.65rem", padding: "0.25rem 0.45rem", flex: 1, opacity: scoutLevel >= 3 ? 0.5 : 1 }}
                      onClick={() => handleScout(3)}>{"\u{1F575}"} Scout</button>
                  </div>
                )}

                {(adjacentIds.has(node.id) || node.id === currentRoomId) && node.type === "combat" && !node.trap && node.state !== "cleared" && (
                  <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
                    {Object.entries(TRAP_INFO).map(([key, t]) => (
                      <button key={key} title={t.desc} disabled={player.gold < t.cost}
                        style={{ ...S.btn(t.color, player.gold < t.cost), fontSize: "0.62rem", padding: "0.22rem 0.45rem" }}
                        onClick={() => { onSetTrap(node.id, key); setSelected(node.id); }}>
                        {t.icon}{t.cost}{"\u{1FA99}"}
                      </button>
                    ))}
                  </div>
                )}

                {(adjacentIds.has(node.id) || node.id === currentRoomId) && node.type === "combat" && !node.blocked && node.state !== "cleared" && (
                  <button style={{ ...S.btn("#2980b9"), fontSize: "0.62rem", padding: "0.22rem 0.45rem" }}
                    disabled={player.gold < 10}
                    onClick={() => { onBlockDoor(node.id); setSelected(node.id); }}>
                    {"\u{1F6A7}"} Block (10{"\u{1FA99}"})
                  </button>
                )}

                {!debugMode && node.state !== "locked" && !adjacentIds.has(node.id) && node.id !== currentRoomId && (
                  <div style={{ fontSize: "0.6rem", color: "#2a1a10", fontStyle: "italic" }}>Not adjacent {"\u2014"} move closer.</div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ ...S.panel, padding: "0.8rem 1rem" }}>
              <p style={{ fontSize: "0.7rem", color: "#7a6a5a", lineHeight: 1.8, margin: 0 }}>Click any visible room.</p>
              <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "3px" }}>
                {([["\u2694", "combat", "#c0392b"], ["\u{1F56F}", "rest", "#2ecc71"], ["\u{1F4B0}", "shop", "#f0c040"], ["\u2620", "boss", "#e74c3c"]] as const).map(([icon, label, color]) => (
                  <span key={label} style={{ fontSize: "0.6rem", color }}>{icon} {label}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ ...S.panel, padding: "0.6rem 0.8rem" }}>
            <div style={{ fontSize: "0.56rem", color: "#4a3a2a", marginBottom: "3px", letterSpacing: "0.1em" }}>YOUR STATUS {"\u00B7"} Turn {dungeonTurn}</div>
            <HpBar current={player.hp} max={player.maxHp} color="#22a55a" />
            <StatusBadges statuses={player.statuses} />
            <div style={{ fontSize: "0.56rem", color: "#3a2a1a", marginTop: "3px" }}>
              {"\u26A1"} {player.maxEnergy} energy {"\u00B7"} {"\u{1F4DC}"} {player.deck.length} cards
            </div>
          </div>

          <button onClick={onToggleDebug} style={{
            ...S.btn(debugMode ? "#9b59b6" : "#2a1f40"),
            fontSize: "0.62rem", padding: "0.3rem 0.6rem",
            border: `1px solid ${debugMode ? "#9b59b6" : "#3a2f5a"}`,
          }}>
            {"\u{1F6E0}"} Debug {debugMode ? "ON" : "OFF"}
          </button>
        </div>
      </div>
    </div>
  );
}
