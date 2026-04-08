import type { AreaNode } from "../../types";

/* ── Individual sound icon ── */
function SoundIcon({
  icon,
  area,
  gridWidth,
  gridHeight,
  onSelectRoom,
}: {
  icon: { roomId: string; texts: string[]; key: number };
  area: AreaNode[];
  gridWidth: number;
  gridHeight: number;
  onSelectRoom: (id: string) => void;
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

/* ── Room labels overlay ── */
export function RoomLabels({
  area,
  currentRoomId,
  debugMode,
  soundIcons,
  gridWidth,
  gridHeight,
  onSelectRoom,
}: {
  area: AreaNode[];
  currentRoomId: string;
  debugMode: boolean;
  soundIcons: { roomId: string; texts: string[]; key: number }[];
  gridWidth: number;
  gridHeight: number;
  onSelectRoom: (id: string) => void;
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

        return (
          <div
            key={n.id + "-lbl"}
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
        );
      })}

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
