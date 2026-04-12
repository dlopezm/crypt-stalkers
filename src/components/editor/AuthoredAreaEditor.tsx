import { useEffect, useMemo, useRef, useState } from "react";
import { btnStyle } from "../../styles";
import { AREAS } from "../../data/rooms";
import { ENEMY_TYPES } from "../../data/enemies";
import { extractRoomsFromGrid } from "../../utils/area";
import type { AuthoredRoom, AreaDef, RoomExit } from "../../types";

/*
 * Authored Dungeon Editor
 * ───────────────────────
 * Visual editor for hand-authored dungeons (AreaDef.generator === "authored").
 *
 * - Paint cells with a palette: wall (1), corridor (0), or room IDs 2..9.
 * - Edit per-room metadata: label, hint, isStart/isBoss, enemy list.
 * - Live validation: orphan rooms, missing metadata, multiple starts/bosses,
 *   rooms in metadata that don't exist in the grid.
 * - "Copy as TS" emits the full source for src/data/dungeons/<id>.ts ready
 *   to paste over the file. No filesystem writes — round-trip is manual.
 *
 * Persistence model: edits live in component state. Reloading the editor
 * re-reads from the in-memory AreaDef (which only changes when you paste
 * the copied output and reload the dev server).
 */

const EDITOR_CELL_PX = 22;
const MIN_DIM = 8;
const MAX_DIM = 60;

type Cell = number;
type Grid = Cell[][];
type RoomsMeta = Record<number, AuthoredRoom>;

function cloneGrid(g: Grid): Grid {
  return g.map((row) => row.slice());
}

function cloneRooms(r: RoomsMeta): RoomsMeta {
  const out: RoomsMeta = {};
  for (const [k, v] of Object.entries(r)) {
    out[Number(k)] = { ...v, enemies: [...v.enemies] };
  }
  return out;
}

/** Serialize a notes string as a multi-line template literal, or omit the field
 * entirely when empty so round-tripped files stay clean. */
function serializeNotesField(indent: string, notes: string | undefined): string {
  if (!notes) return "";
  // Preserve newlines; escape only backticks and ${ so the template literal parses.
  const escaped = notes.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  return `\n${indent}notes: \`${escaped}\`,`;
}

/* ── Cell colors (must read clearly without hatching) ── */
const MAX_ROOM_ID = 20;
const ROOM_COLORS: Record<number, string> = {
  2: "#c8a8ff",
  3: "#a8d8ff",
  4: "#a8ffd0",
  5: "#ffe8a8",
  6: "#ffb8a8",
  7: "#ffa8e8",
  8: "#d8ffa8",
  9: "#a8ffff",
  10: "#e8c8ff",
  11: "#c8e8ff",
  12: "#c8ffc8",
  13: "#fff0c0",
  14: "#ffd0c0",
  15: "#ffc0e0",
  16: "#e0ffc0",
  17: "#c0ffe8",
  18: "#ffd8a0",
  19: "#a0d0ff",
  20: "#d0a0ff",
};

function cellFill(v: Cell): string {
  if (v === 1) return "#2a1f15"; // wall
  if (v === 0) return "#d0c4a8"; // corridor
  return ROOM_COLORS[v] || "#888";
}

function cellLabel(v: Cell): string {
  if (v === 1) return "Wall";
  if (v === 0) return "Corridor";
  return `Room ${v}`;
}

/* ── Connection extraction: delegates to shared extractRoomsFromGrid, adds orphan analysis ── */
function extractConnections(grid: Grid): {
  roomIds: number[];
  connections: Set<string>;
  orphans: number[];
} {
  const { rooms, connections } = extractRoomsFromGrid(grid);
  const roomIds = rooms.map((r) => r.gridId).sort((a, b) => a - b);
  const conns = new Set<string>();
  for (const [a, b] of connections) {
    conns.add(`${Math.min(a, b)},${Math.max(a, b)}`);
  }
  // Orphans: rooms not reachable from the first room via the connection graph
  const adj = new Map<number, Set<number>>();
  for (const id of roomIds) adj.set(id, new Set());
  for (const [a, b] of connections) {
    adj.get(a)?.add(b);
    adj.get(b)?.add(a);
  }
  let orphans: number[] = [];
  if (roomIds.length > 0) {
    const seen = new Set<number>([roomIds[0]]);
    const q = [roomIds[0]];
    while (q.length) {
      const cur = q.shift()!;
      for (const nb of adj.get(cur) || []) {
        if (!seen.has(nb)) {
          seen.add(nb);
          q.push(nb);
        }
      }
    }
    orphans = roomIds.filter((id) => !seen.has(id));
  }
  return { roomIds, connections: conns, orphans };
}

/* ── TS source serialization ── */
function serializeAreaFile(
  def: AreaDef,
  grid: Grid,
  rooms: RoomsMeta,
  areaNotes: string | undefined,
): string {
  const w = grid[0]?.length ?? 0;
  const colHeader =
    "  // " + Array.from({ length: w }, (_, i) => i.toString().padStart(2, " ")).join(", ") + "\n";
  const gridLines = grid
    .map((row, ri) => {
      const cells = row.map((c) => c.toString().padStart(2, " ")).join(", ");
      return `  [${cells}], // ${ri.toString().padStart(2, " ")}`;
    })
    .join("\n");

  const roomEntries = Object.keys(rooms)
    .map(Number)
    .sort((a, b) => a - b)
    .map((id) => {
      const r = rooms[id];
      const flags: string[] = [];
      if (r.isStart) flags.push("    isStart: true,");
      if (r.isBoss) flags.push("    isBoss: true,");
      if (r.exit) {
        flags.push(
          `    exit: { toAreaId: ${JSON.stringify(r.exit.toAreaId)}, toRoomGridId: ${r.exit.toRoomGridId} },`,
        );
      }
      const enemies =
        r.enemies.length > 0 ? `[${r.enemies.map((e) => JSON.stringify(e)).join(", ")}]` : "[]";
      const notesField = serializeNotesField("    ", r.notes);
      return `  ${id}: {
    label: ${JSON.stringify(r.label)},
    hint: ${JSON.stringify(r.hint)},${r.description ? `\n    description: ${JSON.stringify(r.description)},` : ""}
    enemies: ${enemies},${flags.length ? "\n" + flags.join("\n") : ""}${notesField}
  },`;
    })
    .join("\n");

  // Find boss room metadata for the optional bossRoom field
  const bossEntry = Object.values(rooms).find((r) => r.isBoss);
  const bossRoomBlock = bossEntry
    ? `\n  bossRoom: {
    label: ${JSON.stringify(bossEntry.label)},
    enemies: [${bossEntry.enemies.map((e) => JSON.stringify(e)).join(", ")}],
    hint: ${JSON.stringify(bossEntry.hint)},
  },`
    : "";

  const upperId = def.id.toUpperCase();
  const gridConst = `${upperId}_GRID`;
  const roomsConst = `${upperId}_ROOMS`;
  const defConst = upperId;

  const areaNotesField = serializeNotesField("  ", areaNotes);

  return `import type { AuthoredRoom, AreaDef } from "../../types";

/*
 * ${def.name}
 *
 * Generated/edited via the in-game Authored Area Editor.
 * Encoding: 1 = wall, 0 = corridor, integers >= 2 = room IDs.
 */

// prettier-ignore
export const ${gridConst}: number[][] = [
${colHeader}${gridLines}
];

export const ${roomsConst}: Record<number, AuthoredRoom> = {
${roomEntries}
};

export const ${defConst}: AreaDef = {
  id: ${JSON.stringify(def.id)},
  name: ${JSON.stringify(def.name)},
  desc: ${JSON.stringify(def.desc)},
  difficulty: ${def.difficulty},
  generator: "authored",
  authored: {
    grid: ${gridConst},
    rooms: ${roomsConst},
  },
  combatRooms: [],${bossRoomBlock}${areaNotesField}
};
`;
}

/* ── Component ── */
export function AuthoredAreaEditor({ onBack }: { onBack: () => void }) {
  const authoredAreas = useMemo(
    () => AREAS.filter((d) => d.generator === "authored" && d.authored),
    [],
  );
  const [defId, setDefId] = useState<string>(authoredAreas[0]?.id ?? "");
  const def = useMemo(
    () => authoredAreas.find((d) => d.id === defId) ?? authoredAreas[0],
    [authoredAreas, defId],
  );

  // If there are no authored dungeons, def is undefined and we early-return below
  // before these states are ever read. Initialize with empty defaults.
  const [grid, setGrid] = useState<Grid>(() => (def ? cloneGrid(def.authored!.grid) : []));
  const [rooms, setRooms] = useState<RoomsMeta>(() => (def ? cloneRooms(def.authored!.rooms) : {}));
  const [areaNotes, setAreaNotes] = useState<string>(() => def?.notes ?? "");
  const [paint, setPaint] = useState<Cell>(1);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [fallbackSource, setFallbackSource] = useState<string | null>(null);
  // Holds the stroke's locked-in paint value, or null when not dragging.
  const strokeValueRef = useRef<number | null>(null);

  // Reload state when switching dungeon
  useEffect(() => {
    if (!def) return;
    setGrid(cloneGrid(def.authored!.grid));
    setRooms(cloneRooms(def.authored!.rooms));
    setAreaNotes(def.notes ?? "");
    setSelectedRoomId(null);
  }, [def]);

  const h = grid.length;
  const w = grid[0]?.length ?? 0;

  const { roomIds, connections, orphans } = useMemo(() => extractConnections(grid), [grid]);

  // Validation
  const startRooms = Object.entries(rooms)
    .filter(([, r]) => r.isStart)
    .map(([k]) => Number(k));
  const bossRooms = Object.entries(rooms)
    .filter(([, r]) => r.isBoss)
    .map(([k]) => Number(k));
  const missingMeta = roomIds.filter((id) => !rooms[id]);
  const danglingMeta = Object.keys(rooms)
    .map(Number)
    .filter((id) => !roomIds.includes(id));

  function paintCell(r: number, c: number, value: number) {
    if (r < 0 || r >= h || c < 0 || c >= w) return;
    if (grid[r][c] === value) return;
    setGrid((prev) => {
      const next = cloneGrid(prev);
      next[r][c] = value;
      return next;
    });
  }

  function handleCanvasMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    const { r, c } = cellFromEvent(e);
    if (r < 0 || r >= h || c < 0 || c >= w) return;
    // If the clicked cell already matches the selected paint, this stroke erases to wall.
    // Otherwise it paints with the selected value.
    const strokeValue = grid[r][c] === paint ? 1 : paint;
    strokeValueRef.current = strokeValue;
    paintCell(r, c, strokeValue);
  }
  function handleCanvasMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const strokeValue = strokeValueRef.current;
    if (strokeValue == null) return;
    const { r, c } = cellFromEvent(e);
    paintCell(r, c, strokeValue);
  }
  function handleCanvasMouseUp() {
    strokeValueRef.current = null;
  }
  function cellFromEvent(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / EDITOR_CELL_PX);
    const r = Math.floor((e.clientY - rect.top) / EDITOR_CELL_PX);
    return { r, c };
  }

  function handleCellRightClick(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    const { r, c } = cellFromEvent(e);
    if (r < 0 || r >= h || c < 0 || c >= w) return;
    const v = grid[r][c];
    if (v >= 2) setSelectedRoomId(v);
  }

  function resizeGrid(newW: number, newH: number) {
    newW = Math.max(MIN_DIM, Math.min(MAX_DIM, newW));
    newH = Math.max(MIN_DIM, Math.min(MAX_DIM, newH));
    setGrid((prev) => {
      const next: Grid = Array.from({ length: newH }, (_, r) =>
        Array.from({ length: newW }, (_, c) => prev[r]?.[c] ?? 1),
      );
      return next;
    });
  }

  function updateRoom(id: number, patch: Partial<AuthoredRoom>) {
    setRooms((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function setRoomFlag(id: number, flag: "isStart" | "isBoss", value: boolean) {
    setRooms((prev) => {
      const next: RoomsMeta = {};
      for (const [k, v] of Object.entries(prev)) {
        const nid = Number(k);
        // Enforce single isStart / isBoss across all rooms
        const cleared = value ? { ...v, [flag]: false } : { ...v };
        next[nid] = cleared;
      }
      next[id] = { ...next[id], [flag]: value };
      return next;
    });
  }

  function addEnemy(id: number, typeId: string) {
    setRooms((prev) => ({
      ...prev,
      [id]: { ...prev[id], enemies: [...prev[id].enemies, typeId] },
    }));
  }

  function removeEnemyAt(id: number, idx: number) {
    setRooms((prev) => ({
      ...prev,
      [id]: { ...prev[id], enemies: prev[id].enemies.filter((_, i) => i !== idx) },
    }));
  }

  function setExit(id: number, patch: Partial<RoomExit> | null) {
    setRooms((prev) => {
      const r = prev[id];
      if (patch === null) {
        const { exit: _exit, ...rest } = r;
        void _exit;
        return { ...prev, [id]: rest };
      }
      const existing = r.exit ?? { toAreaId: "", toRoomGridId: 2 };
      // Exit rooms are travel-only: clear enemies and boss flag.
      return {
        ...prev,
        [id]: { ...r, enemies: [], isBoss: false, exit: { ...existing, ...patch } },
      };
    });
  }

  function copyToClipboard() {
    if (!def) return;
    const src = serializeAreaFile(def, grid, rooms, areaNotes);
    navigator.clipboard.writeText(src).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        // Fallback: render a textarea overlay the user can select & copy manually.
        setFallbackSource(src);
      },
    );
  }

  function resetToSource() {
    if (!def) return;
    setGrid(cloneGrid(def.authored!.grid));
    setRooms(cloneRooms(def.authored!.rooms));
    setAreaNotes(def.notes ?? "");
    setSelectedRoomId(null);
  }

  // Auto-create metadata when a new room ID is painted. Single setRooms call
  // using the prev snapshot avoids stale-closure issues when multiple ids are new.
  const roomIdsKey = roomIds.join(",");
  useEffect(() => {
    setRooms((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const id of roomIds) {
        if (!next[id]) {
          next[id] = { label: `Room ${id}`, hint: "", enemies: [] };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    // roomIdsKey is a stable signature of roomIds; we intentionally don't depend on `rooms`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomIdsKey]);

  if (!def) {
    return (
      <div className="p-6 text-crypt-text">
        <p>No authored areas found.</p>
        <button style={btnStyle("#3a2f25")} onClick={onBack}>
          ← Back
        </button>
      </div>
    );
  }

  const selectedRoom = selectedRoomId != null ? rooms[selectedRoomId] : null;

  return (
    <>
      <div className="flex h-screen w-screen bg-[#0c0a10] text-crypt-text font-mono text-sm overflow-hidden">
        {/* ── Left sidebar: palette + dungeon picker + sizing ── */}
        <div className="w-[260px] shrink-0 border-r border-[#2a1f15] p-3 overflow-y-auto flex flex-col gap-3">
          <div>
            <button style={btnStyle("#3a2f25")} className="w-full" onClick={onBack}>
              ← Back to Map
            </button>
          </div>

          <div>
            <div className="text-xs text-crypt-dim uppercase tracking-wider mb-1">Area</div>
            <select
              value={defId}
              onChange={(e) => setDefId(e.target.value)}
              className="w-full bg-[#1a1610] border border-[#3a2f25] text-crypt-text px-2 py-1"
            >
              {authoredAreas.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs text-crypt-dim uppercase tracking-wider mb-1">Palette</div>
            <div className="flex flex-wrap gap-1">
              {[1, 0, ...Array.from({ length: MAX_ROOM_ID - 1 }, (_, i) => i + 2)].map((v) => (
                <button
                  key={v}
                  onClick={() => setPaint(v)}
                  title={cellLabel(v)}
                  style={{
                    background: cellFill(v),
                    border: paint === v ? "2px solid #ffe080" : "1px solid #3a2f25",
                    width: 36,
                    height: 36,
                    color: v === 1 ? "#aaa" : "#000",
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  {v === 1 ? "█" : v === 0 ? "·" : v}
                </button>
              ))}
            </div>
            <div className="text-xs text-crypt-muted mt-1">
              Selected: <span className="text-crypt-gold">{cellLabel(paint)}</span>
            </div>
            <div className="text-xs text-crypt-dim mt-1">
              Click & drag to paint. Right-click a room to select it.
            </div>
          </div>

          <div>
            <div className="text-xs text-crypt-dim uppercase tracking-wider mb-1">Grid Size</div>
            <div className="flex gap-2 items-center">
              <label className="text-xs text-crypt-muted">W</label>
              <input
                type="number"
                value={w}
                min={MIN_DIM}
                max={MAX_DIM}
                onChange={(e) => resizeGrid(Number(e.target.value), h)}
                className="w-16 bg-[#1a1610] border border-[#3a2f25] text-crypt-text px-1 py-0.5"
              />
              <label className="text-xs text-crypt-muted">H</label>
              <input
                type="number"
                value={h}
                min={MIN_DIM}
                max={MAX_DIM}
                onChange={(e) => resizeGrid(w, Number(e.target.value))}
                className="w-16 bg-[#1a1610] border border-[#3a2f25] text-crypt-text px-1 py-0.5"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button style={btnStyle("#8b6914")} onClick={copyToClipboard}>
              {copied ? "✓ Copied!" : "📋 Copy as TS"}
            </button>
            <button style={btnStyle("#3a2f25")} onClick={resetToSource}>
              ↺ Reset to source
            </button>
          </div>

          <div>
            <div className="text-xs text-crypt-dim uppercase tracking-wider mb-1">Validation</div>
            <ValidationLine
              ok={startRooms.length === 1}
              label={`Start rooms: ${startRooms.length} (need 1)`}
            />
            <ValidationLine
              ok={bossRooms.length <= 1}
              label={`Boss rooms: ${bossRooms.length} (0 or 1)`}
            />
            <ValidationLine
              ok={missingMeta.length === 0}
              label={`Rooms missing metadata: ${missingMeta.join(", ") || "none"}`}
            />
            <ValidationLine
              ok={danglingMeta.length === 0}
              label={`Metadata for missing rooms: ${danglingMeta.join(", ") || "none"}`}
            />
            <ValidationLine
              ok={orphans.length === 0}
              label={`Orphaned rooms: ${orphans.join(", ") || "none"}`}
            />
            <ValidationLine ok={true} label={`Connections: ${connections.size}`} />
          </div>
        </div>

        {/* ── Center: canvas ── */}
        <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
          <div
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onContextMenu={handleCellRightClick}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${w}, ${EDITOR_CELL_PX}px)`,
              gridTemplateRows: `repeat(${h}, ${EDITOR_CELL_PX}px)`,
              gap: 0,
              border: "2px solid #3a2f25",
              background: "#0c0a10",
              userSelect: "none",
              cursor: "crosshair",
            }}
          >
            {grid.flatMap((row, r) =>
              row.map((v, c) => {
                const isSelected = v >= 2 && v === selectedRoomId;
                return (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      width: EDITOR_CELL_PX,
                      height: EDITOR_CELL_PX,
                      background: cellFill(v),
                      boxSizing: "border-box",
                      border: isSelected ? "2px solid #ffe080" : "1px solid rgba(0,0,0,0.15)",
                      color: v >= 2 ? "#000" : "transparent",
                      fontSize: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "auto",
                    }}
                  >
                    {v >= 2 ? v : ""}
                  </div>
                );
              }),
            )}
          </div>
        </div>

        {/* ── Right sidebar: room metadata + connection graph ── */}
        <div className="w-[320px] shrink-0 border-l border-[#2a1f15] p-3 overflow-y-auto flex flex-col gap-3">
          <div>
            <div className="text-xs text-crypt-dim uppercase tracking-wider mb-1">
              Area notes{" "}
              <span className="text-crypt-dim normal-case">
                (author-only: things this area still needs)
              </span>
            </div>
            <textarea
              value={areaNotes}
              onChange={(e) => setAreaNotes(e.target.value)}
              rows={4}
              placeholder="overarching clues, set pieces, cross-room hook-ups…"
              className="w-full bg-[#1a1610] border border-[#3a2f25] text-crypt-text px-1 py-0.5"
            />
          </div>

          <div>
            <div className="text-xs text-crypt-dim uppercase tracking-wider mb-1">
              Rooms in grid
            </div>
            <div className="flex flex-wrap gap-1">
              {roomIds.map((id) => (
                <button
                  key={id}
                  onClick={() => setSelectedRoomId(id)}
                  style={{
                    background: selectedRoomId === id ? "#ffe080" : ROOM_COLORS[id] || "#888",
                    border: "1px solid #3a2f25",
                    width: 32,
                    height: 32,
                    cursor: "pointer",
                    color: "#000",
                    fontWeight: "bold",
                  }}
                  title={rooms[id]?.label || `Room ${id}`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          {selectedRoomId != null && selectedRoom && (
            <div className="border border-[#3a2f25] p-2 flex flex-col gap-2 bg-[#140e08]">
              <div className="text-xs text-crypt-gold uppercase tracking-wider">
                Room {selectedRoomId}
              </div>
              <label className="text-xs text-crypt-muted">
                Label
                <input
                  type="text"
                  value={selectedRoom.label}
                  onChange={(e) => updateRoom(selectedRoomId, { label: e.target.value })}
                  className="w-full bg-[#1a1610] border border-[#3a2f25] text-crypt-text px-1 py-0.5 mt-0.5"
                />
              </label>
              <label className="text-xs text-crypt-muted">
                Hint
                <textarea
                  value={selectedRoom.hint}
                  onChange={(e) => updateRoom(selectedRoomId, { hint: e.target.value })}
                  rows={2}
                  className="w-full bg-[#1a1610] border border-[#3a2f25] text-crypt-text px-1 py-0.5 mt-0.5"
                />
              </label>
              <label className="text-xs text-crypt-muted">
                Description{" "}
                <span className="text-crypt-dim normal-case">(shown to player after visiting)</span>
                <textarea
                  value={selectedRoom.description ?? ""}
                  onChange={(e) =>
                    updateRoom(selectedRoomId, {
                      description: e.target.value === "" ? undefined : e.target.value,
                    })
                  }
                  rows={2}
                  placeholder="A damp chamber with crumbling pillars…"
                  className="w-full bg-[#1a1610] border border-[#3a2f25] text-crypt-text px-1 py-0.5 mt-0.5"
                />
              </label>
              <label className="text-xs text-crypt-muted">
                Notes{" "}
                <span className="text-crypt-dim normal-case">
                  (author-only: things this room still needs)
                </span>
                <textarea
                  value={selectedRoom.notes ?? ""}
                  onChange={(e) =>
                    updateRoom(selectedRoomId, {
                      notes: e.target.value === "" ? undefined : e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="clues, items, environment, hook-ups…"
                  className="w-full bg-[#1a1610] border border-[#3a2f25] text-crypt-text px-1 py-0.5 mt-0.5"
                />
              </label>
              <div className="flex gap-3 text-xs">
                <label className="flex items-center gap-1 text-crypt-muted">
                  <input
                    type="checkbox"
                    checked={!!selectedRoom.isStart}
                    onChange={(e) => setRoomFlag(selectedRoomId, "isStart", e.target.checked)}
                  />
                  isStart
                </label>
                {!selectedRoom.exit && (
                  <label className="flex items-center gap-1 text-crypt-muted">
                    <input
                      type="checkbox"
                      checked={!!selectedRoom.isBoss}
                      onChange={(e) => setRoomFlag(selectedRoomId, "isBoss", e.target.checked)}
                    />
                    isBoss
                  </label>
                )}
              </div>
              {!selectedRoom.exit && (
                <div>
                  <div className="text-xs text-crypt-muted mb-1">
                    Enemies ({selectedRoom.enemies.length})
                  </div>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {selectedRoom.enemies.map((e, i) => (
                      <button
                        key={i}
                        onClick={() => removeEnemyAt(selectedRoomId, i)}
                        className="text-xs bg-[#2a1f15] border border-[#3a2f25] text-crypt-text px-1 py-0.5"
                        title="Click to remove"
                      >
                        {e} ✕
                      </button>
                    ))}
                  </div>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) addEnemy(selectedRoomId, e.target.value);
                    }}
                    className="w-full bg-[#1a1610] border border-[#3a2f25] text-crypt-text px-1 py-0.5 text-xs"
                  >
                    <option value="">+ Add enemy…</option>
                    {ENEMY_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-crypt-muted">{"\u{1F6AA}"} Cross-area exit</div>
                  <label className="text-xs text-crypt-muted flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={!!selectedRoom.exit}
                      onChange={(e) => setExit(selectedRoomId, e.target.checked ? {} : null)}
                    />
                    enabled
                  </label>
                </div>
                {selectedRoom.exit &&
                  (() => {
                    const ex = selectedRoom.exit;
                    const targetArea = AREAS.find((a) => a.id === ex.toAreaId);
                    const targetOk = !!targetArea && !!targetArea.authored?.rooms[ex.toRoomGridId];
                    return (
                      <div className="border border-[#3a2f25] p-1 flex flex-col gap-1 bg-[#0c0a10]">
                        <div className="flex gap-1 items-center">
                          <select
                            value={ex.toAreaId}
                            onChange={(e) => setExit(selectedRoomId, { toAreaId: e.target.value })}
                            className="flex-1 bg-[#1a1610] border border-[#3a2f25] text-crypt-text px-1 py-0.5 text-xs"
                          >
                            <option value="">— area —</option>
                            {AREAS.filter((a) => a.id !== def.id).map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min={2}
                            max={MAX_ROOM_ID}
                            value={ex.toRoomGridId}
                            onChange={(e) =>
                              setExit(selectedRoomId, {
                                toRoomGridId: Number(e.target.value),
                              })
                            }
                            className="w-12 bg-[#1a1610] border border-[#3a2f25] text-crypt-text px-1 py-0.5 text-xs"
                          />
                        </div>
                        {ex.toAreaId && !targetOk && (
                          <div className="text-xs text-yellow-400">
                            ⚠ target area or grid room not found
                          </div>
                        )}
                      </div>
                    );
                  })()}
                <div className="text-xs text-crypt-dim mt-1">
                  Walking into this room will transport the player to the target area. The return
                  trip must be authored on a room in the target area.
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="text-xs text-crypt-dim uppercase tracking-wider mb-1">Connections</div>
            <div className="text-xs text-crypt-muted leading-relaxed">
              {connections.size === 0 ? (
                <span className="text-red-400">none</span>
              ) : (
                [...connections].sort().map((k) => {
                  const [a, b] = k.split(",");
                  return (
                    <div key={k}>
                      {a} ↔ {b}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      {fallbackSource != null && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-8 z-50"
          onClick={() => setFallbackSource(null)}
        >
          <div
            className="bg-[#140e08] border border-[#3a2f25] p-4 max-w-4xl w-full flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs text-crypt-gold uppercase tracking-wider">
              Clipboard unavailable — select all and copy manually
            </div>
            <textarea
              readOnly
              value={fallbackSource}
              onFocus={(e) => e.currentTarget.select()}
              autoFocus
              className="w-full h-96 bg-[#0c0a10] border border-[#3a2f25] text-crypt-text p-2 font-mono text-xs"
            />
            <button style={btnStyle("#3a2f25")} onClick={() => setFallbackSource(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function ValidationLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`text-xs leading-relaxed ${ok ? "text-green-400" : "text-red-400"}`}>
      {ok ? "✓" : "✗"} {label}
    </div>
  );
}
