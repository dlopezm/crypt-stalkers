import { useRef, useEffect, useCallback } from "react";
import type { DungeonNode, DungeonGrid } from "../../types";

export const CELL_PX = 14;

/* ── Room fill color by state ── */
function roomColor(node: DungeonNode, currentRoomId: string): string {
  if (node.id === currentRoomId) return "#3a2808";
  if (node.state === "visited") return "#2a1c08";
  if (node.state === "reachable") return "#1a1006";
  return "#0c0a10";
}

/* ── Determine which rooms are visible ── */
export function visibleRooms(dungeon: DungeonNode[], debugMode: boolean): Set<string> {
  const vis = new Set<string>();
  for (const node of dungeon) {
    if (debugMode || node.state === "visited" || node.state === "reachable") {
      vis.add(node.id);
    }
  }
  return vis;
}

/* ── Grid Canvas Renderer (cell-based) ── */
export function GridCanvas({
  grid,
  dungeon,
  currentRoomId,
  selectedRoomId,
  visible,
  debugMode,
  onClickRoom,
}: {
  grid: DungeonGrid;
  dungeon: DungeonNode[];
  currentRoomId: string;
  selectedRoomId: string | null;
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
    // visited rooms: BFS flood all reachable corridor cells
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

    // Pass 1: flood corridors from visited rooms
    for (const node of dungeon) {
      if (node.gridRoomId == null || !visible.has(node.id)) continue;
      const isExplored = node.state === "visited";
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

    // Highlight selected room
    if (selectedRoomId && selectedRoomId !== currentRoomId) {
      const selNode = dungeon.find((n) => n.id === selectedRoomId);
      if (selNode?.gridRoomId != null && visible.has(selNode.id)) {
        outlineRoomCells(selNode.gridRoomId, "#c09838", 1.5);
      }
    }
  }, [grid, dungeon, currentRoomId, selectedRoomId, visible, debugMode]);

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
