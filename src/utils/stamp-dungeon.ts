/**
 * Stamp-based Dungeon Generator
 *
 * Iteratively stamps shaped rooms (circular, semicircular, L-shaped, etc.)
 * onto a grid, placing each 2-4 squares from an existing room.
 * Corridors are carved between rooms as marked grid squares.
 */

/* ── Room shape definitions ── */

type Shape = boolean[][]; // true = floor cell

/** Rotate a shape 90° clockwise */
function rotateCW(s: Shape): Shape {
  const h = s.length,
    w = s[0].length;
  const out: Shape = Array.from({ length: w }, () => Array(h).fill(false));
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) out[c][h - 1 - r] = s[r][c];
  return out;
}

function rotateN(s: Shape, n: number): Shape {
  let out = s;
  for (let i = 0; i < n % 4; i++) out = rotateCW(out);
  return out;
}

/** Build a rectangular shape */
function rect(w: number, h: number): Shape {
  return Array.from({ length: h }, () => Array(w).fill(true));
}

/** Build a circular/elliptical shape */
function circle(diam: number): Shape {
  const r = diam / 2;
  return Array.from({ length: diam }, (_, row) =>
    Array.from({ length: diam }, (_, col) => {
      const dx = col - r + 0.5,
        dy = row - r + 0.5;
      return dx * dx + dy * dy <= r * r;
    }),
  );
}

/** Build a semicircle */
function semicircle(diam: number): Shape {
  const r = diam / 2;
  const h = Math.ceil(r) + 1;
  return Array.from({ length: h }, (_, row) =>
    Array.from({ length: diam }, (_, col) => {
      const dx = col - r + 0.5,
        dy = row + 0.5;
      return dx * dx + dy * dy <= r * r;
    }),
  );
}

/** L-shape: two rectangles joined */
function lShape(armLen: number, armW: number): Shape {
  const size = armLen + armW;
  const s: Shape = Array.from({ length: size }, () => Array(size).fill(false));
  for (let r = 0; r < size; r++) for (let c = 0; c < armW; c++) s[r][c] = true;
  for (let r = size - armW; r < size; r++) for (let c = 0; c < size; c++) s[r][c] = true;
  return s;
}

/** T-shape */
function tShape(stemLen: number, stemW: number, capLen: number): Shape {
  const h = stemLen + stemW;
  const w = capLen;
  const s: Shape = Array.from({ length: h }, () => Array(w).fill(false));
  for (let r = 0; r < stemW; r++) for (let c = 0; c < w; c++) s[r][c] = true;
  const stemStart = Math.floor((w - stemW) / 2);
  for (let r = stemW; r < h; r++)
    for (let c = stemStart; c < stemStart + stemW; c++) s[r][c] = true;
  return s;
}

/** Cross / plus shape */
function crossShape(armLen: number, armW: number): Shape {
  const size = armLen * 2 + armW;
  const s: Shape = Array.from({ length: size }, () => Array(size).fill(false));
  const mid = armLen;
  for (let r = 0; r < size; r++) for (let c = mid; c < mid + armW; c++) s[r][c] = true;
  for (let r = mid; r < mid + armW; r++) for (let c = 0; c < size; c++) s[r][c] = true;
  return s;
}

/** Diamond shape */
function diamond(size: number): Shape {
  const mid = Math.floor(size / 2);
  return Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => Math.abs(r - mid) + Math.abs(c - mid) <= mid),
  );
}

/** Irregular blob — circle with random bumps */
function blob(diam: number): Shape {
  const base = circle(diam);
  const h = base.length,
    w = base[0].length;
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      if (!base[r][c]) continue;
      const isEdge = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ].some(([dr, dc]) => {
        const nr = r + dr,
          nc = c + dc;
        return nr < 0 || nr >= h || nc < 0 || nc >= w || !base[nr][nc];
      });
      if (isEdge && Math.random() < 0.3) base[r][c] = false;
    }
  }
  return base;
}

/** Generate a random room shape (min side ~4, max ~8) */
function randomShape(): Shape {
  const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
  const shapes = [
    () => rect(rand(4, 8), rand(4, 7)),
    () => circle(rand(5, 8)),
    () => semicircle(rand(5, 8)),
    () => lShape(rand(3, 5), rand(2, 4)),
    () => tShape(rand(3, 5), rand(2, 3), rand(5, 8)),
    () => crossShape(rand(2, 3), rand(2, 3)),
    () => diamond(rand(5, 8)),
    () => blob(rand(5, 8)),
  ];
  return shapes[Math.floor(Math.random() * shapes.length)]();
}

/* ── Grid placement ── */

interface PlacedRoom {
  id: number;
  cells: [number, number][];
  minR: number;
  maxR: number;
  minC: number;
  maxC: number;
  centerR: number;
  centerC: number;
}

function shapeFloorCells(shape: Shape, offR: number, offC: number): [number, number][] {
  const cells: [number, number][] = [];
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[0].length; c++) if (shape[r][c]) cells.push([offR + r, offC + c]);
  return cells;
}

function canPlace(
  grid: number[][],
  cells: [number, number][],
  gridH: number,
  gridW: number,
): boolean {
  for (const [r, c] of cells) {
    if (r < 2 || r >= gridH - 2 || c < 2 || c >= gridW - 2) return false;
    if (grid[r][c] !== 1) return false;
    // 1-cell buffer
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr,
          nc = c + dc;
        if (nr >= 0 && nr < gridH && nc >= 0 && nc < gridW && grid[nr][nc] !== 1) return false;
      }
    }
  }
  return true;
}

/** Find placement by radiating outward from a random anchor room's edge at a random angle */
function findPlacement(
  grid: number[][],
  shape: Shape,
  rooms: PlacedRoom[],
  gridH: number,
  gridW: number,
): { cells: [number, number][]; nearRooms: PlacedRoom[] } | null {
  const GAP_MIN = 2;
  const GAP_MAX = 4;
  const shapeH = shape.length,
    shapeW = shape[0].length;

  for (let attempt = 0; attempt < 120; attempt++) {
    const anchor = rooms[Math.floor(Math.random() * rooms.length)];

    // Pick a random angle and distance
    const angle = Math.random() * Math.PI * 2;
    const gap = GAP_MIN + Math.random() * (GAP_MAX - GAP_MIN);

    // Distance from anchor center to new room center
    const anchorW = anchor.maxC - anchor.minC + 1;
    const anchorH = anchor.maxR - anchor.minR + 1;
    const dist = gap + (anchorW + anchorH + shapeW + shapeH) / 4;

    const offR = Math.round(anchor.centerR + Math.sin(angle) * dist - shapeH / 2);
    const offC = Math.round(anchor.centerC + Math.cos(angle) * dist - shapeW / 2);

    // Add small random jitter for organic feel
    const jitterR = Math.floor(Math.random() * 3) - 1;
    const jitterC = Math.floor(Math.random() * 3) - 1;

    const cells = shapeFloorCells(shape, offR + jitterR, offC + jitterC);
    if (cells.length === 0) continue;
    if (!canPlace(grid, cells, gridH, gridW)) continue;

    // Find nearby rooms (bbox distance)
    let mnR = cells[0][0],
      mxR = cells[0][0],
      mnC = cells[0][1],
      mxC = cells[0][1];
    for (const [r, c] of cells) {
      if (r < mnR) mnR = r;
      if (r > mxR) mxR = r;
      if (c < mnC) mnC = c;
      if (c > mxC) mxC = c;
    }

    const nearRooms: PlacedRoom[] = [];
    for (const room of rooms) {
      const dR = Math.max(0, Math.max(room.minR - mxR, mnR - room.maxR));
      const dC = Math.max(0, Math.max(room.minC - mxC, mnC - room.maxC));
      if (dR + dC <= GAP_MAX + 3) nearRooms.push(room);
    }

    if (nearRooms.length > 0) return { cells, nearRooms };
  }

  return null;
}

/** Carve a corridor between two points using an L-shaped path */
function carveCorridor(
  grid: number[][],
  fromR: number,
  fromC: number,
  toR: number,
  toC: number,
  gridH: number,
  gridW: number,
): void {
  const hFirst = Math.random() < 0.5;
  const points: [number, number][] = hFirst
    ? [
        [fromR, fromC],
        [fromR, toC],
        [toR, toC],
      ]
    : [
        [fromR, fromC],
        [toR, fromC],
        [toR, toC],
      ];

  for (let seg = 0; seg < points.length - 1; seg++) {
    const [r1, c1] = points[seg];
    const [r2, c2] = points[seg + 1];
    const dr = Math.sign(r2 - r1);
    const dc = Math.sign(c2 - c1);
    let r = r1,
      c = c1;
    while (true) {
      if (r >= 0 && r < gridH && c >= 0 && c < gridW) {
        if (grid[r][c] === 1) grid[r][c] = 0;
      }
      if (r === r2 && c === c2) break;
      r += dr;
      c += dc;
    }
  }
}

/** Find the closest pair of cells between two rooms */
function closestCells(
  a: PlacedRoom,
  b: PlacedRoom,
): { ar: number; ac: number; br: number; bc: number } {
  let best = Infinity,
    ar = 0,
    ac = 0,
    br = 0,
    bc = 0;
  const sampleA = a.cells.length > 20 ? a.cells.filter((_, i) => i % 3 === 0) : a.cells;
  const sampleB = b.cells.length > 20 ? b.cells.filter((_, i) => i % 3 === 0) : b.cells;
  for (const [r1, c1] of sampleA) {
    for (const [r2, c2] of sampleB) {
      const d = Math.abs(r1 - r2) + Math.abs(c1 - c2);
      if (d < best) {
        best = d;
        ar = r1;
        ac = c1;
        br = r2;
        bc = c2;
      }
    }
  }
  return { ar, ac, br, bc };
}

/* ── Main generator ── */

export interface StampConfig {
  gridW: number;
  gridH: number;
  minRooms: number;
  maxRooms: number;
}

function makePlacedRoom(id: number, cells: [number, number][]): PlacedRoom {
  let mnR = cells[0][0],
    mxR = cells[0][0],
    mnC = cells[0][1],
    mxC = cells[0][1];
  for (const [r, c] of cells) {
    if (r < mnR) mnR = r;
    if (r > mxR) mxR = r;
    if (c < mnC) mnC = c;
    if (c > mxC) mxC = c;
  }
  return {
    id,
    cells,
    minR: mnR,
    maxR: mxR,
    minC: mnC,
    maxC: mxC,
    centerR: (mnR + mxR) / 2,
    centerC: (mnC + mxC) / 2,
  };
}

export function generateStampGrid(cfg: StampConfig): number[][] | null {
  const { gridW, gridH, minRooms, maxRooms } = cfg;

  const grid: number[][] = Array.from({ length: gridH }, () => Array(gridW).fill(1));
  const rooms: PlacedRoom[] = [];
  let nextId = 2;

  // Place first room near center
  const firstShape = rotateN(randomShape(), Math.floor(Math.random() * 4));
  const centerR = Math.floor(gridH / 2 - firstShape.length / 2);
  const centerC = Math.floor(gridW / 2 - firstShape[0].length / 2);
  const firstCells = shapeFloorCells(firstShape, centerR, centerC);

  const id = nextId++;
  for (const [r, c] of firstCells) grid[r][c] = id;
  rooms.push(makePlacedRoom(id, firstCells));

  // Iteratively place rooms
  let consecutiveFails = 0;
  const targetRooms = minRooms + Math.floor(Math.random() * (maxRooms - minRooms + 1));

  while (rooms.length < targetRooms && consecutiveFails < 8) {
    const shape = rotateN(randomShape(), Math.floor(Math.random() * 4));
    const placement = findPlacement(grid, shape, rooms, gridH, gridW);

    if (!placement) {
      consecutiveFails++;
      continue;
    }

    consecutiveFails = 0;
    const roomId = nextId++;
    const { cells, nearRooms } = placement;

    for (const [r, c] of cells) grid[r][c] = roomId;
    const newRoom = makePlacedRoom(roomId, cells);
    rooms.push(newRoom);

    // Connect to 1-3 nearby rooms (pre-compute distances to avoid redundant work)
    const numConnections = Math.min(nearRooms.length, 1 + Math.floor(Math.random() * 3));
    const nearWithDist = nearRooms.map((room) => {
      const pair = closestCells(newRoom, room);
      const dist = Math.abs(pair.ar - pair.br) + Math.abs(pair.ac - pair.bc);
      return { room, pair, dist };
    });
    nearWithDist.sort((a, b) => a.dist - b.dist);

    for (let i = 0; i < numConnections; i++) {
      const { pair } = nearWithDist[i];
      carveCorridor(grid, pair.ar, pair.ac, pair.br, pair.bc, gridH, gridW);
    }
  }

  if (rooms.length < minRooms) return null;

  return grid;
}
