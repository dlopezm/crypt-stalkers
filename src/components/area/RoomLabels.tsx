import { getActiveProps } from "../../utils/props";
import { ENEMY_TYPES } from "../../data/enemies";
import { getActiveEffects } from "../../data/environment";
import type { AreaNode, RoomProp, Player } from "../../types";

/* ── Individual sound icon ── */
function SoundIcon({
  icon,
  area,
  gridWidth,
  gridHeight,
  onSelectRoom,
}: {
  readonly icon: { roomId: string; texts: string[]; key: number };
  readonly area: AreaNode[];
  readonly gridWidth: number;
  readonly gridHeight: number;
  readonly onSelectRoom: (id: string) => void;
}) {
  const room = area.find((n) => n.id === icon.roomId);
  if (!room?.bbox) return null;
  const { minRow, maxRow, minCol, maxCol } = room.bbox;
  const cxPct = ((minCol + maxCol + 1) / 2 / gridWidth) * 100;
  const cyPct = ((minRow + maxRow + 1) / 2 / gridHeight) * 100;
  return (
    <div
      title={icon.texts.join("\n")}
      onClick={() => onSelectRoom(icon.roomId)}
      style={{
        position: "absolute",
        left: `${cxPct}%`,
        top: `${cyPct}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 10,
        pointerEvents: "auto",
        cursor: "pointer",
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
}

/* ── Resolve a prop's tile coordinate in the grid.
 * Uses gridPosition if set, otherwise auto-distributes along the room's edge cells. */
export function resolvePropTiles(
  props: RoomProp[],
  bbox: { minRow: number; maxRow: number; minCol: number; maxCol: number },
): Map<string, { row: number; col: number }> {
  const map = new Map<string, { row: number; col: number }>();
  const without: RoomProp[] = [];
  for (const p of props) {
    if (p.gridPosition) {
      map.set(p.id, { row: p.gridPosition.row, col: p.gridPosition.col });
    } else {
      without.push(p);
    }
  }
  if (without.length > 0) {
    // Distribute along top+bottom edges of the bbox, skipping the center where
    // single-cell rooms would collide with the default label slot.
    const slots: { row: number; col: number }[] = [];
    for (let c = bbox.minCol; c <= bbox.maxCol; c++) {
      slots.push({ row: bbox.minRow, col: c });
    }
    if (bbox.maxRow > bbox.minRow) {
      for (let c = bbox.minCol; c <= bbox.maxCol; c++) {
        slots.push({ row: bbox.maxRow, col: c });
      }
    }
    if (slots.length === 0) {
      slots.push({
        row: Math.floor((bbox.minRow + bbox.maxRow) / 2),
        col: Math.floor((bbox.minCol + bbox.maxCol) / 2),
      });
    }
    for (let i = 0; i < without.length; i++) {
      const step = slots.length / without.length;
      const idx = Math.floor(i * step + step / 2) % slots.length;
      map.set(without[i].id, slots[idx]);
    }
  }
  return map;
}

/* ── Threat indicator for scouted rooms ── */
function ThreatIndicator({
  node,
  gridWidth,
  gridHeight,
}: {
  readonly node: AreaNode;
  readonly gridWidth: number;
  readonly gridHeight: number;
}) {
  if (!node.bbox || !node.scouted || node.enemies.length === 0) return null;

  const { maxRow, minCol, maxCol } = node.bbox;
  const cxPct = ((minCol + maxCol + 1) / 2 / gridWidth) * 100;
  const bottomPct = ((maxRow + 1.3) / gridHeight) * 100;

  const types = node.enemies
    .map((e) => ENEMY_TYPES.find((t) => t.id === e.typeId))
    .filter((t): t is NonNullable<typeof t> => t != null);
  const asciiIcons = types
    .slice(0, 3)
    .map((t) => t.ascii)
    .join("");
  const tooltip = node.enemies
    .map((e) => ENEMY_TYPES.find((t) => t.id === e.typeId)?.name ?? e.typeId)
    .join(", ");

  return (
    <div
      title={tooltip}
      style={{
        position: "absolute",
        left: `${cxPct}%`,
        top: `${bottomPct}%`,
        transform: "translate(-50%, -50%)",
        fontSize: "0.55rem",
        color: "#c41c1c",
        zIndex: 4,
        pointerEvents: "none",
        whiteSpace: "nowrap",
        textShadow: "0 0 4px #000",
      }}
    >
      {asciiIcons}
      {node.enemies.length > 3 && `+${node.enemies.length - 3}`}
    </div>
  );
}

/* ── Safe room icon ── */
function SafeRoomIcon({
  node,
  gridWidth,
  gridHeight,
}: {
  readonly node: AreaNode;
  readonly gridWidth: number;
  readonly gridHeight: number;
}) {
  if (!node.bbox || !node.safeRoom) return null;
  if (node.state !== "visited" && node.state !== "reachable") return null;

  const { minRow, minCol, maxCol } = node.bbox;
  const cxPct = ((minCol + maxCol + 1) / 2 / gridWidth) * 100;
  const topPct = ((minRow - 0.3) / gridHeight) * 100;

  return (
    <div
      title="Safe room - enhanced rest, no ambushes"
      style={{
        position: "absolute",
        left: `${cxPct}%`,
        top: `${topPct}%`,
        transform: "translate(-50%, -50%)",
        fontSize: "0.6rem",
        zIndex: 4,
        pointerEvents: "none",
        textShadow: "0 0 6px rgba(100,200,255,0.6)",
      }}
    >
      ☀️
    </div>
  );
}

/* ── Room labels overlay ── */
export function RoomLabels({
  area,
  currentRoomId,
  debugMode,
  soundIcons,
  gridWidth,
  gridHeight,
  player,
  onSelectRoom,
  onExaminePropOnMap,
}: {
  area: AreaNode[];
  currentRoomId: string;
  debugMode: boolean;
  soundIcons: { roomId: string; texts: string[]; key: number }[];
  gridWidth: number;
  gridHeight: number;
  player: Player;
  onSelectRoom: (id: string) => void;
  onExaminePropOnMap: (roomId: string, propId: string) => void;
}) {
  return (
    <>
      {area.map((n) => {
        if (!n.bbox) return null;
        const isCurrent = n.id === currentRoomId;
        const visited = n.state === "visited";
        const isExit = !!n.exit;
        const exitVisible = isExit && (n.state === "reachable" || visited);
        if (!debugMode && !isCurrent && !visited && !exitVisible) return null;

        const { minRow, maxRow, minCol, maxCol } = n.bbox;
        const cxPct = ((minCol + maxCol + 1) / 2 / gridWidth) * 100;
        const cyPct = ((minRow + maxRow + 1) / 2 / gridHeight) * 100;

        const activeProps = isCurrent ? getActiveProps(n.props, player.flags, n.propStates) : [];
        const showPropIcons = isCurrent && activeProps.length > 0;

        return (
          <div key={n.id + "-lbl"}>
            {!showPropIcons && (
              <div
                style={{
                  position: "absolute",
                  left: `${cxPct}%`,
                  top: `${cyPct}%`,
                  transform: "translate(-50%, -50%)",
                  fontSize: isCurrent ? "0.75rem" : "0.65rem",
                  color: isCurrent ? "#ece0c0" : visited ? "#000000" : "#5a4028",
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
                {n.label}
              </div>
            )}

            {showPropIcons &&
              (() => {
                const tiles = resolvePropTiles(activeProps, n.bbox!);
                return activeProps.map((p) => {
                  const tile = tiles.get(p.id);
                  if (!tile) return null;
                  const leftPct = ((tile.col + 0.5) / gridWidth) * 100;
                  const topPct = ((tile.row + 0.5) / gridHeight) * 100;
                  const hasAction = !!(p.actions?.length || p.onExamine);
                  return (
                    <div
                      key={`${n.id}-prop-${p.id}`}
                      title={`${p.label}${hasAction ? " \u2014 click to interact" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onExaminePropOnMap(n.id, p.id);
                      }}
                      style={{
                        position: "absolute",
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        transform: "translate(-50%, -50%)",
                        fontSize: "1.1rem",
                        zIndex: 5,
                        pointerEvents: "auto",
                        cursor: "pointer",
                        padding: "4px",
                        textShadow: "0 0 6px #000, 0 0 10px #000",
                        filter: "drop-shadow(0 0 3px rgba(255,220,120,0.5))",
                      }}
                    >
                      {p.icon}
                    </div>
                  );
                });
              })()}
          </div>
        );
      })}

      {/* Environmental effect icons for scouted/visited rooms */}
      {area.map((n) => {
        if (!n.bbox || (!n.scouted && n.state !== "visited")) return null;
        const icons = getActiveEffects(n)
          .map((e) => e.icon)
          .filter((i): i is string => i !== undefined);
        if (icons.length === 0) return null;

        const { minRow, minCol, maxCol } = n.bbox;
        const cxPct = ((minCol + maxCol + 1) / 2 / gridWidth) * 100;
        const topPct = ((minRow - 0.7) / gridHeight) * 100;

        return (
          <div
            key={`env-${n.id}`}
            style={{
              position: "absolute",
              left: `${cxPct}%`,
              top: `${topPct}%`,
              transform: "translate(-50%, -50%)",
              fontSize: "0.5rem",
              zIndex: 4,
              pointerEvents: "none",
              textShadow: "0 0 4px #000",
              whiteSpace: "nowrap",
            }}
          >
            {icons.join("")}
          </div>
        );
      })}

      {/* Threat indicators for scouted rooms */}
      {area.map((n) => (
        <ThreatIndicator
          key={`threat-${n.id}`}
          node={n}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
        />
      ))}

      {/* Safe room icons */}
      {area.map((n) => (
        <SafeRoomIcon key={`safe-${n.id}`} node={n} gridWidth={gridWidth} gridHeight={gridHeight} />
      ))}

      {/* Sound icons */}
      {soundIcons.map((icon) => (
        <SoundIcon
          key={icon.key}
          icon={icon}
          area={area}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          onSelectRoom={onSelectRoom}
        />
      ))}
    </>
  );
}
