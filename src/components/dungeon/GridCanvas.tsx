import { useRef, useEffect, useCallback } from "react";
import type { DungeonNode, DungeonGrid } from "../../types";

export const CELL_PX = 16;
const RENDER_SCALE = 4; // Internal render resolution multiplier
const R_CELL = CELL_PX * RENDER_SCALE; // Actual pixel size per cell on the canvas

/* ── Hatching tuning constants ─────────────────────────────────────
 *  All lengths are in CSS pixels (auto-multiplied by RENDER_SCALE).
 *  "dist" = BFS distance from nearest visible floor cell (0 = touching).
 * ─────────────────────────────────────────────────────────────────── */

// — Density —
// Min distance between Poisson sample points (CSS px). Lower = denser.
const HATCH_POISSON_SPACING = 7;
// Probability of skipping a cluster = dist * this. Higher = sparser far from walls.
const HATCH_DENSITY_FALLOFF = 0.8;

// — Voronoi-fit stroke length —
// Stroke length as fraction of nearest-neighbor distance. >1 for slight overlap / full coverage.
const HATCH_VORONOI_FILL = 0.95;
// Min stroke length (CSS px) — floor so tiny clusters don't vanish
const HATCH_LENGTH_MIN = 4;
// Max stroke length (CSS px) — cap so isolated clusters don't become huge
const HATCH_LENGTH_MAX = 12;
// Random multiplier range applied to base length: len * (MIN + rng * (MAX - MIN))
const HATCH_LENGTH_RAND_MIN = 0.7;
const HATCH_LENGTH_RAND_MAX = 1.3;

// — Angle (neighbor-relative) —
// Min angle offset from nearest neighbor (radians). ~30° = 0.52
const HATCH_NEIGHBOR_ANGLE_MIN = 0.5;
// Max angle offset from nearest neighbor (radians). ~60° = 1.05
const HATCH_NEIGHBOR_ANGLE_MAX = 1.0;
// Fallback jitter for isolated/first clusters (radians)
const HATCH_ANGLE_JITTER_BASE = 0.6;

// — Stroke count per cluster —
// Weighted pool: pick one at random. More 3s = mostly triples.
const HATCH_COUNT_POOL = [2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 5];

// — Thickness —
// Stroke width (CSS px)
const HATCH_STROKE_WIDTH = 0.5;
// Spacing between parallel strokes in a cluster (CSS px)
const HATCH_STROKE_SPACING = 3;
// Stroke color
const HATCH_STROKE_COLOR = "#2a1a0a";

// — Curvature —
// Max control-point offset perpendicular to the stroke (CSS px).
// 0 = straight lines, higher = more curved. Applied randomly per stroke.
const HATCH_CURVE_MAX = 1;

/* ── Seeded PRNG (mulberry32) ── */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Room fill color by state (parchment tones) ── */
function roomColor(node: DungeonNode, currentRoomId: string): string {
  if (node.id === currentRoomId) return "#ede4d0";
  if (node.state === "visited") return "#ddd0b8";
  if (node.state === "reachable") return "#b8a888";
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

/* ── Compute which wall cells should be visible ── */
function computeWallVisibility(
  cells: number[][],
  height: number,
  width: number,
  isFloorVis: (r: number, c: number) => boolean,
): Uint8Array[] {
  const wallVis = Array.from({ length: height }, () => new Uint8Array(width));
  const dirs4: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (cells[r][c] !== 1) continue;
      for (const [dr, dc] of dirs4) {
        if (isFloorVis(r + dr, c + dc)) {
          wallVis[r][c] = 1;
          break;
        }
      }
    }
  }

  for (let pass = 0; pass < 2; pass++) {
    const toMark: [number, number][] = [];
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (!wallVis[r][c]) continue;
        for (const [dr, dc] of dirs4) {
          const nr = r + dr,
            nc = c + dc;
          if (
            nr >= 0 &&
            nr < height &&
            nc >= 0 &&
            nc < width &&
            cells[nr][nc] === 1 &&
            !wallVis[nr][nc]
          ) {
            toMark.push([nr, nc]);
          }
        }
      }
    }
    for (const [r, c] of toMark) wallVis[r][c] = 1;
  }

  return wallVis;
}

/* ── Poisson Disk Sampling (Bridson's algorithm) restricted to visible wall area ── */
function poissonDiskWall(
  pxW: number,
  pxH: number,
  minDist: number,
  wallVis: Uint8Array[],
  cells: number[][],
  rng: () => number,
): { x: number; y: number }[] {
  const cellSize = minDist / Math.SQRT2;
  const gridW = Math.ceil(pxW / cellSize);
  const gridH = Math.ceil(pxH / cellSize);
  const grid: number[] = new Array(gridW * gridH).fill(-1);
  const points: { x: number; y: number }[] = [];
  const active: number[] = [];

  function gridIdx(x: number, y: number) {
    return Math.floor(y / cellSize) * gridW + Math.floor(x / cellSize);
  }

  function inWall(px: number, py: number): boolean {
    const c = Math.floor(px / R_CELL);
    const r = Math.floor(py / R_CELL);
    if (r < 0 || r >= cells.length || c < 0 || c >= cells[0].length) return false;
    return cells[r][c] === 1 && wallVis[r][c] === 1;
  }

  function tooClose(px: number, py: number): boolean {
    const gc = Math.floor(px / cellSize);
    const gr = Math.floor(py / cellSize);
    const search = 2;
    for (let dr = -search; dr <= search; dr++) {
      for (let dc = -search; dc <= search; dc++) {
        const nr = gr + dr,
          nc = gc + dc;
        if (nr < 0 || nr >= gridH || nc < 0 || nc >= gridW) continue;
        const idx = grid[nr * gridW + nc];
        if (idx === -1) continue;
        const p = points[idx];
        const dx = px - p.x,
          dy = py - p.y;
        if (dx * dx + dy * dy < minDist * minDist) return true;
      }
    }
    return false;
  }

  function addSeed(sx: number, sy: number) {
    if (!inWall(sx, sy) || tooClose(sx, sy)) return false;
    const idx = points.length;
    points.push({ x: sx, y: sy });
    grid[gridIdx(sx, sy)] = idx;
    active.push(idx);
    return true;
  }

  function runBridson() {
    const k = 30;
    while (active.length > 0) {
      const ai = Math.floor(rng() * active.length);
      const pi = active[ai];
      const p = points[pi];
      let found = false;

      for (let attempt = 0; attempt < k; attempt++) {
        const angle = rng() * Math.PI * 2;
        const dist = minDist + rng() * minDist;
        const cx = p.x + Math.cos(angle) * dist;
        const cy = p.y + Math.sin(angle) * dist;

        if (cx < 0 || cx >= pxW || cy < 0 || cy >= pxH) continue;
        if (!inWall(cx, cy)) continue;
        if (tooClose(cx, cy)) continue;

        const idx = points.length;
        points.push({ x: cx, y: cy });
        grid[gridIdx(cx, cy)] = idx;
        active.push(idx);
        found = true;
        break;
      }

      if (!found) {
        active[ai] = active[active.length - 1];
        active.pop();
      }
    }
  }

  // Seed every visible wall cell's center, then run Bridson from all of them.
  // This ensures all disconnected wall regions get covered.
  const rows = cells.length;
  const cols = cells[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r][c] === 1 && wallVis[r][c]) {
        addSeed((c + 0.5) * R_CELL, (r + 0.5) * R_CELL);
      }
    }
  }
  runBridson();

  return points;
}

/* ── Draw Dyson Logos-style hatching using Poisson disk clusters ── */
function drawWallHatching(
  ctx: CanvasRenderingContext2D,
  cells: number[][],
  height: number,
  width: number,
  wallVis: Uint8Array[],
  isFloorVis: (r: number, c: number) => boolean,
) {
  const rng = mulberry32(42);
  const dirs8: [number, number][] = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  const dirs4: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  // Phase 1a: BFS distance field
  const wallDist = Array.from({ length: height }, () => new Int8Array(width).fill(-1));
  const queue: [number, number][] = [];

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (cells[r][c] !== 1 || !wallVis[r][c]) continue;
      for (const [dr, dc] of dirs4) {
        if (isFloorVis(r + dr, c + dc)) {
          wallDist[r][c] = 0;
          queue.push([r, c]);
          break;
        }
      }
    }
  }

  let qi = 0;
  while (qi < queue.length) {
    const [cr, cc] = queue[qi++];
    const d = wallDist[cr][cc];
    for (const [dr, dc] of dirs4) {
      const nr = cr + dr,
        nc = cc + dc;
      if (
        nr >= 0 &&
        nr < height &&
        nc >= 0 &&
        nc < width &&
        cells[nr][nc] === 1 &&
        wallVis[nr][nc] &&
        wallDist[nr][nc] === -1
      ) {
        wallDist[nr][nc] = d + 1;
        queue.push([nr, nc]);
      }
    }
  }

  // Phase 1b: Gradient field (8-neighbor finite differences)
  const gradAngle = Array.from({ length: height }, () => new Float32Array(width));

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (wallDist[r][c] < 0) continue;
      let gx = 0,
        gy = 0;
      for (const [dr, dc] of dirs8) {
        const nr = r + dr,
          nc = c + dc;
        if (nr >= 0 && nr < height && nc >= 0 && nc < width && wallDist[nr][nc] >= 0) {
          const diff = wallDist[nr][nc] - wallDist[r][c];
          gx += diff * dc;
          gy += diff * dr;
        }
      }
      gradAngle[r][c] = Math.atan2(gy, gx);
    }
  }

  // Phase 2: Poisson disk sampling (in render-pixel space)
  const pxW = width * R_CELL;
  const pxH = height * R_CELL;
  const points = poissonDiskWall(
    pxW,
    pxH,
    HATCH_POISSON_SPACING * RENDER_SCALE,
    wallVis,
    cells,
    rng,
  );

  // Phase 3a: Spatial buckets + nearest-neighbor distances
  const BUCKET_SIZE = HATCH_POISSON_SPACING * RENDER_SCALE * 2;
  const bCols = Math.ceil(pxW / BUCKET_SIZE);
  const bRows = Math.ceil(pxH / BUCKET_SIZE);

  const posBuckets: number[][] = Array.from({ length: bRows * bCols }, () => []);
  for (let i = 0; i < points.length; i++) {
    const bx = Math.floor(points[i].x / BUCKET_SIZE);
    const by = Math.floor(points[i].y / BUCKET_SIZE);
    posBuckets[by * bCols + bx].push(i);
  }

  const nnDist = new Float32Array(points.length);
  for (let i = 0; i < points.length; i++) {
    const px = points[i].x,
      py = points[i].y;
    const bx = Math.floor(px / BUCKET_SIZE);
    const by = Math.floor(py / BUCKET_SIZE);
    let minD2 = Infinity;
    for (let dy = -2; dy <= 2; dy++) {
      const bry = by + dy;
      if (bry < 0 || bry >= bRows) continue;
      for (let dx = -2; dx <= 2; dx++) {
        const brx = bx + dx;
        if (brx < 0 || brx >= bCols) continue;
        for (const j of posBuckets[bry * bCols + brx]) {
          if (j === i) continue;
          const d2 = (px - points[j].x) ** 2 + (py - points[j].y) ** 2;
          if (d2 < minD2) minD2 = d2;
        }
      }
    }
    nnDist[i] = Math.sqrt(minD2);
  }

  // Phase 3b: Draw stroke clusters with neighbor-relative angles + Voronoi-fit sizing
  ctx.strokeStyle = HATCH_STROKE_COLOR;
  ctx.lineWidth = HATCH_STROKE_WIDTH * RENDER_SCALE;
  ctx.lineCap = "round";
  ctx.beginPath();

  const curveMax = HATCH_CURVE_MAX * RENDER_SCALE;

  // Angle buckets: store already-processed points with their assigned angles
  const anglePts: { x: number; y: number; angle: number }[] = [];
  const angleBuckets: number[][] = Array.from({ length: bRows * bCols }, () => []);

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const gc = Math.floor(pt.x / R_CELL);
    const gr = Math.floor(pt.y / R_CELL);
    if (gr < 0 || gr >= height || gc < 0 || gc >= width) continue;

    const dist = wallDist[gr][gc];
    if (dist < 0) continue;

    if (rng() < dist * HATCH_DENSITY_FALLOFF) continue;

    // --- Angle: neighbor-relative ---
    const bx = Math.floor(pt.x / BUCKET_SIZE);
    const by = Math.floor(pt.y / BUCKET_SIZE);
    let nearest: { x: number; y: number; angle: number } | null = null;
    let nearestD2 = Infinity;
    for (let dy = -1; dy <= 1; dy++) {
      const bry = by + dy;
      if (bry < 0 || bry >= bRows) continue;
      for (let dx = -1; dx <= 1; dx++) {
        const brx = bx + dx;
        if (brx < 0 || brx >= bCols) continue;
        for (const ai of angleBuckets[bry * bCols + brx]) {
          const nb = anglePts[ai];
          const d2 = (pt.x - nb.x) ** 2 + (pt.y - nb.y) ** 2;
          if (d2 < nearestD2) {
            nearestD2 = d2;
            nearest = nb;
          }
        }
      }
    }

    let angle: number;
    if (nearest) {
      const sign = rng() < 0.5 ? 1 : -1;
      const off =
        HATCH_NEIGHBOR_ANGLE_MIN + rng() * (HATCH_NEIGHBOR_ANGLE_MAX - HATCH_NEIGHBOR_ANGLE_MIN);
      angle = nearest.angle + sign * off;
    } else {
      angle = gradAngle[gr][gc] + (rng() - 0.5) * HATCH_ANGLE_JITTER_BASE;
    }

    const ai = anglePts.length;
    anglePts.push({ x: pt.x, y: pt.y, angle });
    angleBuckets[by * bCols + bx].push(ai);

    // --- Length: Voronoi-fit ---
    const fitLen =
      Math.max(
        HATCH_LENGTH_MIN,
        Math.min(HATCH_LENGTH_MAX, (nnDist[i] * HATCH_VORONOI_FILL) / RENDER_SCALE),
      ) * RENDER_SCALE;
    const len =
      fitLen * (HATCH_LENGTH_RAND_MIN + rng() * (HATCH_LENGTH_RAND_MAX - HATCH_LENGTH_RAND_MIN));

    // --- Draw strokes ---
    const cosA = Math.cos(angle),
      sinA = Math.sin(angle);
    const perpX = -sinA,
      perpY = cosA;
    const strokeCount = HATCH_COUNT_POOL[Math.floor(rng() * HATCH_COUNT_POOL.length)];
    const spacing = HATCH_STROKE_SPACING * RENDER_SCALE;
    const offset = (strokeCount - 1) / 2;
    for (let s = 0; s < strokeCount; s++) {
      const sx = pt.x + perpX * (s - offset) * spacing;
      const sy = pt.y + perpY * (s - offset) * spacing;
      const halfLen = len / 2;
      const x0 = sx - cosA * halfLen;
      const y0 = sy - sinA * halfLen;
      const x1 = sx + cosA * halfLen;
      const y1 = sy + sinA * halfLen;
      ctx.moveTo(x0, y0);
      if (curveMax > 0) {
        const curveOff = (rng() - 0.5) * 2 * curveMax;
        const mx = (x0 + x1) / 2 + perpX * curveOff;
        const my = (y0 + y1) / 2 + perpY * curveOff;
        ctx.quadraticCurveTo(mx, my, x1, y1);
      } else {
        ctx.lineTo(x1, y1);
      }
    }
  }

  ctx.stroke();
}

/* ── Grid Canvas Renderer (Dyson Logos style) ── */
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
    const canvasW = width * R_CELL;
    const canvasH = height * R_CELL;
    canvas.width = canvasW;
    canvas.height = canvasH;

    const gridIdToNode = new Map<number, DungeonNode>();
    for (const node of dungeon) {
      if (node.gridRoomId != null) gridIdToNode.set(node.gridRoomId, node);
    }

    // Helper: is (r,c) a visible floor cell?
    function isFloorVis(r: number, c: number): boolean {
      if (r < 0 || r >= height || c < 0 || c >= width) return false;
      const v = cells[r][c];
      if (v === 0) return !!corVisible[r][c];
      if (v >= 2) {
        const node = gridIdToNode.get(v);
        return !!(node && visible.has(node.id));
      }
      return false;
    }

    // ── Corridor visibility ──
    const corVisible = Array.from({ length: height }, () => new Uint8Array(width));
    const dirs4: [number, number][] = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    if (debugMode) {
      for (let r = 0; r < height; r++)
        for (let c = 0; c < width; c++) if (cells[r][c] === 0) corVisible[r][c] = 1;
    }

    for (const node of dungeon) {
      if (node.gridRoomId == null || !visible.has(node.id)) continue;
      if (node.state !== "visited") continue;
      const q: [number, number][] = [];
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
              q.push([nr, nc]);
            }
          }
        }
      }
      let qi = 0;
      while (qi < q.length) {
        const [cr, cc] = q[qi++];
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
            q.push([nr, nc]);
          }
        }
      }
    }

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

    // ── Wall visibility ──
    const wallVis = computeWallVisibility(cells, height, width, isFloorVis);

    // ── Pass 0: Background (fog/void) ──
    ctx.fillStyle = "#080610";
    ctx.fillRect(0, 0, canvasW, canvasH);

    // ── Pass 1: Wall cell background fill ──
    ctx.fillStyle = "#d8ccb0";
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (cells[r][c] === 1 && wallVis[r][c]) {
          ctx.fillRect(c * R_CELL, r * R_CELL, R_CELL, R_CELL);
        }
      }
    }

    // Fog fade on outermost wall cells
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (cells[r][c] !== 1 || !wallVis[r][c]) continue;
        let isEdge = false;
        for (const [dr, dc] of dirs4) {
          const nr = r + dr,
            nc = c + dc;
          if (nr < 0 || nr >= height || nc < 0 || nc >= width) {
            isEdge = true;
            break;
          }
          if (cells[nr][nc] === 1 && !wallVis[nr][nc]) {
            isEdge = true;
            break;
          }
        }
        if (isEdge) {
          ctx.fillStyle = "rgba(8,6,16,0.5)";
          ctx.fillRect(c * R_CELL, r * R_CELL, R_CELL, R_CELL);
        }
      }
    }

    // ── Pass 2: Poisson cluster hatching ──
    drawWallHatching(ctx, cells, height, width, wallVis, isFloorVis);

    // ── Pass 3: Floor fills ──
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const v = cells[r][c];
        if (v === 1) continue;

        const x = c * R_CELL;
        const y = r * R_CELL;

        if (v === 0) {
          if (corVisible[r][c]) {
            ctx.fillStyle = "#d0c4a8";
            ctx.fillRect(x, y, R_CELL, R_CELL);
          }
        } else {
          const node = gridIdToNode.get(v);
          if (!node || !visible.has(node.id)) continue;
          ctx.fillStyle = roomColor(node, currentRoomId);
          ctx.fillRect(x, y, R_CELL, R_CELL);
        }
      }
    }

    // ── Pass 4: Floor grid lines ──
    ctx.strokeStyle = "rgba(120,100,70,0.15)";
    ctx.lineWidth = 0.5 * RENDER_SCALE;
    ctx.beginPath();
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const v = cells[r][c];
        if (v === 1) continue;

        let isVisible = false;
        if (v === 0 && corVisible[r][c]) isVisible = true;
        else if (v >= 2) {
          const node = gridIdToNode.get(v);
          if (node && visible.has(node.id)) isVisible = true;
        }
        if (!isVisible) continue;

        const x = c * R_CELL;
        const y = r * R_CELL;

        ctx.moveTo(x, y + R_CELL);
        ctx.lineTo(x + R_CELL, y + R_CELL);
        ctx.moveTo(x + R_CELL, y);
        ctx.lineTo(x + R_CELL, y + R_CELL);
      }
    }
    ctx.stroke();

    // ── Pass 5: Thick wall outlines ──
    ctx.strokeStyle = "#1a0e05";
    ctx.lineWidth = 2.5 * RENDER_SCALE;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const v = cells[r][c];
        if (v === 1) continue;

        let isVisible = false;
        if (v === 0 && corVisible[r][c]) isVisible = true;
        else if (v >= 2) {
          const node = gridIdToNode.get(v);
          if (node && visible.has(node.id)) isVisible = true;
        }
        if (!isVisible) continue;

        const x = c * R_CELL;
        const y = r * R_CELL;

        if (r === 0 || cells[r - 1][c] === 1) {
          ctx.moveTo(x, y);
          ctx.lineTo(x + R_CELL, y);
        }
        if (r === height - 1 || cells[r + 1][c] === 1) {
          ctx.moveTo(x, y + R_CELL);
          ctx.lineTo(x + R_CELL, y + R_CELL);
        }
        if (c === 0 || cells[r][c - 1] === 1) {
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + R_CELL);
        }
        if (c === width - 1 || cells[r][c + 1] === 1) {
          ctx.moveTo(x + R_CELL, y);
          ctx.lineTo(x + R_CELL, y + R_CELL);
        }
      }
    }
    ctx.stroke();

    // ── Pass 6: Room state highlight outlines ──
    function outlineRoomCells(roomGridId: number, color: string, lw: number) {
      if (!ctx) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = lw * RENDER_SCALE;
      ctx.beginPath();
      for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
          if (cells[r][c] !== roomGridId) continue;
          const x = c * R_CELL,
            y = r * R_CELL;
          if (r === 0 || cells[r - 1][c] !== roomGridId) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + R_CELL, y);
          }
          if (r === height - 1 || cells[r + 1][c] !== roomGridId) {
            ctx.moveTo(x, y + R_CELL);
            ctx.lineTo(x + R_CELL, y + R_CELL);
          }
          if (c === 0 || cells[r][c - 1] !== roomGridId) {
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + R_CELL);
          }
          if (c === width - 1 || cells[r][c + 1] !== roomGridId) {
            ctx.moveTo(x + R_CELL, y);
            ctx.lineTo(x + R_CELL, y + R_CELL);
          }
        }
      }
      ctx.stroke();
    }

    const curNode = dungeon.find((n) => n.id === currentRoomId);
    if (curNode?.gridRoomId != null && visible.has(curNode.id)) {
      outlineRoomCells(curNode.gridRoomId, "#c8982a", 2.5);
    }

    for (const node of dungeon) {
      if (node.state === "reachable" && node.gridRoomId != null && visible.has(node.id)) {
        outlineRoomCells(node.gridRoomId, "#8a7050", 1.5);
      }
    }

    if (selectedRoomId && selectedRoomId !== currentRoomId) {
      const selNode = dungeon.find((n) => n.id === selectedRoomId);
      if (selNode?.gridRoomId != null && visible.has(selNode.id)) {
        outlineRoomCells(selNode.gridRoomId, "#b08828", 2);
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
    const scaleX = canvas.width / bcr.width;
    const scaleY = canvas.height / bcr.height;
    const x = (e.clientX - bcr.left) * scaleX;
    const y = (e.clientY - bcr.top) * scaleY;
    for (const node of dungeon) {
      if (!node.bbox || !visible.has(node.id)) continue;
      const { minRow, maxRow, minCol, maxCol } = node.bbox;
      if (
        x >= minCol * R_CELL &&
        x < (maxCol + 1) * R_CELL &&
        y >= minRow * R_CELL &&
        y < (maxRow + 1) * R_CELL
      ) {
        onClickRoom(node.id);
        return;
      }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ imageRendering: "auto", cursor: "pointer", width: "100%", height: "100%" }}
      onClick={handleClick}
    />
  );
}
