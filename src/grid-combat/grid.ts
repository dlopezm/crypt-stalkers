/* ═══════════════════════════════════════════════════════════════════════════
   Grid Generation, LOS, and Pathfinding
   ═══════════════════════════════════════════════════════════════════════════ */

import type {
  TacticalGrid,
  TerrainTile,
  GridPos,
  RoomTerrainLayout,
  GridEnemyState,
  GridPlayerState,
  Direction,
} from "./types";
import {
  makeFloor,
  makeTerrain,
  inBounds,
  isWalkable,
  blocksLOS,
  getTile,
  posEqual,
  posAdd,
  DIR_DELTA,
  DIRECTIONS,
  TERRAIN_BLOCKS_MOVEMENT,
  directionFromTo,
  oppositeDirection,
} from "./types";

// ─── Grid Generation ───

export function generateGrid(layout: RoomTerrainLayout): TacticalGrid {
  const tiles: TerrainTile[][] = [];

  for (let r = 0; r < layout.gridHeight; r++) {
    const row: TerrainTile[] = [];
    for (let c = 0; c < layout.gridWidth; c++) {
      row.push(makeFloor());
    }
    tiles.push(row);
  }

  for (const placement of layout.terrainPlacements) {
    const { pos, terrain, railDirection, brazierLit, hazardDamage } = placement;
    if (inBounds(pos, layout.gridWidth, layout.gridHeight)) {
      tiles[pos.row][pos.col] = makeTerrain(terrain, {
        railDirection: railDirection ?? null,
        brazierLit: brazierLit ?? null,
        hazardDamage: hazardDamage ?? null,
      });
    }
  }

  return {
    width: layout.gridWidth,
    height: layout.gridHeight,
    tiles: tiles.map((row) => Object.freeze([...row])),
  };
}

export function setTile(grid: TacticalGrid, pos: GridPos, tile: TerrainTile): TacticalGrid {
  if (!inBounds(pos, grid.width, grid.height)) {
    return grid;
  }

  const newTiles = grid.tiles.map((row, r) => {
    if (r !== pos.row) {
      return row;
    }
    return row.map((t, c) => (c === pos.col ? tile : t));
  });

  return { ...grid, tiles: newTiles };
}

// ─── Light Calculation ───

export function computeLitTiles(grid: TacticalGrid): ReadonlySet<string> {
  const lit = new Set<string>();

  for (let r = 0; r < grid.height; r++) {
    for (let c = 0; c < grid.width; c++) {
      const tile = grid.tiles[r][c];

      if (tile.type === "brazier" && tile.brazierLit) {
        spreadLight(grid, { row: r, col: c }, 2, lit);
      }

      if (tile.lit && tile.type !== "dark_zone") {
        lit.add(posKey({ row: r, col: c }));
      }
    }
  }

  return lit;
}

function spreadLight(grid: TacticalGrid, center: GridPos, radius: number, lit: Set<string>): void {
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      const pos = { row: center.row + dr, col: center.col + dc };
      if (inBounds(pos, grid.width, grid.height) && Math.abs(dr) + Math.abs(dc) <= radius) {
        if (hasLineOfSight(grid, center, pos)) {
          lit.add(posKey(pos));
        }
      }
    }
  }
}

// ─── Line of Sight (Bresenham) ───

export function hasLineOfSight(grid: TacticalGrid, from: GridPos, to: GridPos): boolean {
  if (posEqual(from, to)) {
    return true;
  }

  const points = bresenhamLine(from, to);

  for (let i = 1; i < points.length - 1; i++) {
    if (blocksLOS(grid, points[i])) {
      return false;
    }
  }

  return true;
}

function bresenhamLine(from: GridPos, to: GridPos): readonly GridPos[] {
  const result: GridPos[] = [];
  let r0 = from.row;
  let c0 = from.col;
  const r1 = to.row;
  const c1 = to.col;

  const dr = Math.abs(r1 - r0);
  const dc = Math.abs(c1 - c0);
  const sr = r0 < r1 ? 1 : -1;
  const sc = c0 < c1 ? 1 : -1;
  let err = dr - dc;

  for (;;) {
    result.push({ row: r0, col: c0 });

    if (r0 === r1 && c0 === c1) {
      break;
    }

    const e2 = 2 * err;

    if (e2 > -dc) {
      err -= dc;
      r0 += sr;
    }

    if (e2 < dr) {
      err += dr;
      c0 += sc;
    }
  }

  return result;
}

// ─── Pathfinding (A* with Manhattan heuristic, orthogonal only) ───

export function findPathAStar(
  grid: TacticalGrid,
  from: GridPos,
  to: GridPos,
  occupiedPositions: ReadonlySet<string>,
  maxSteps: number = 50,
): readonly GridPos[] | null {
  if (posEqual(from, to)) {
    return [from];
  }

  if (!isWalkable(grid, to)) {
    return null;
  }

  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const cameFrom = new Map<string, string>();
  const openSet = new Set<string>();
  const closedSet = new Set<string>();

  const startKey = posKey(from);
  const endKey = posKey(to);

  gScore.set(startKey, 0);
  fScore.set(startKey, manhattan(from, to));
  openSet.add(startKey);

  while (openSet.size > 0) {
    let currentKey = "";
    let bestF = Infinity;

    for (const key of openSet) {
      const f = fScore.get(key) ?? Infinity;
      if (f < bestF) {
        bestF = f;
        currentKey = key;
      }
    }

    if (currentKey === endKey) {
      return traceBack(cameFrom, currentKey, from);
    }

    openSet.delete(currentKey);
    closedSet.add(currentKey);

    const current = keyToPos(currentKey);
    const currentG = gScore.get(currentKey) ?? Infinity;

    if (currentG >= maxSteps) {
      continue;
    }

    for (const dir of DIRECTIONS) {
      const neighbor = posAdd(current, DIR_DELTA[dir]);
      const nKey = posKey(neighbor);

      if (closedSet.has(nKey)) {
        continue;
      }

      if (!isWalkable(grid, neighbor)) {
        continue;
      }

      if (!posEqual(neighbor, to) && occupiedPositions.has(nKey)) {
        continue;
      }

      const tentativeG = currentG + 1;
      const existingG = gScore.get(nKey) ?? Infinity;

      if (tentativeG < existingG) {
        cameFrom.set(nKey, currentKey);
        gScore.set(nKey, tentativeG);
        fScore.set(nKey, tentativeG + manhattan(neighbor, to));
        openSet.add(nKey);
      }
    }
  }

  return null;
}

function traceBack(
  cameFrom: Map<string, string>,
  endKey: string,
  from: GridPos,
): readonly GridPos[] {
  const path: GridPos[] = [];
  let current = endKey;

  while (current) {
    path.unshift(keyToPos(current));
    const prev = cameFrom.get(current);
    if (!prev) {
      break;
    }
    current = prev;
  }

  if (!posEqual(path[0], from)) {
    path.unshift(from);
  }

  return path;
}

// ─── Movement helpers ───

export function getReachableTiles(
  grid: TacticalGrid,
  from: GridPos,
  maxDistance: number,
  occupiedPositions: ReadonlySet<string>,
): readonly GridPos[] {
  const result: GridPos[] = [];
  const visited = new Set<string>();
  const queue: Array<{ pos: GridPos; dist: number }> = [{ pos: from, dist: 0 }];
  visited.add(posKey(from));

  while (queue.length > 0) {
    const { pos, dist } = queue.shift()!;

    if (dist > 0) {
      result.push(pos);
    }

    if (dist >= maxDistance) {
      continue;
    }

    for (const dir of DIRECTIONS) {
      const neighbor = posAdd(pos, DIR_DELTA[dir]);
      const nKey = posKey(neighbor);

      if (visited.has(nKey)) {
        continue;
      }

      if (!isWalkable(grid, neighbor)) {
        continue;
      }

      if (occupiedPositions.has(nKey)) {
        continue;
      }

      visited.add(nKey);
      queue.push({ pos: neighbor, dist: dist + 1 });
    }
  }

  return result;
}

export function getOccupiedPositions(
  player: GridPlayerState,
  enemies: readonly GridEnemyState[],
): ReadonlySet<string> {
  const occupied = new Set<string>();
  occupied.add(posKey(player.pos));

  for (const e of enemies) {
    if (e.hp > 0) {
      occupied.add(posKey(e.pos));
    }
  }

  return occupied;
}

// ─── Push resolution ───

export function resolvePush(
  grid: TacticalGrid,
  targetPos: GridPos,
  direction: Direction,
  distance: number,
  occupiedPositions: ReadonlySet<string>,
): { readonly finalPos: GridPos; readonly hitObstacle: boolean; readonly hitPit: boolean } {
  let current = targetPos;
  let hitObstacle = false;
  let hitPit = false;

  for (let i = 0; i < distance; i++) {
    const next = posAdd(current, DIR_DELTA[direction]);

    if (!inBounds(next, grid.width, grid.height)) {
      hitObstacle = true;
      break;
    }

    const tile = getTile(grid, next)!;

    if (tile.type === "pit") {
      hitPit = true;
      current = next;
      break;
    }

    if (TERRAIN_BLOCKS_MOVEMENT.has(tile.type) || occupiedPositions.has(posKey(next))) {
      hitObstacle = true;
      break;
    }

    current = next;
  }

  return { finalPos: current, hitObstacle, hitPit };
}

// ─── Mine Cart Push ───

export function resolveMinecartPush(
  grid: TacticalGrid,
  cartPos: GridPos,
  direction: Direction,
  occupiedPositions: ReadonlySet<string>,
): {
  readonly cartPath: readonly GridPos[];
  readonly hitPositions: readonly GridPos[];
  readonly finalCartPos: GridPos;
} {
  const tile = getTile(grid, cartPos);
  if (!tile || tile.type !== "mine_cart") {
    return { cartPath: [], hitPositions: [], finalCartPos: cartPos };
  }

  const railDir = tile.railDirection;
  const pushDir = railDir !== null ? railDir : direction;

  const path: GridPos[] = [cartPos];
  const hits: GridPos[] = [];
  let current = cartPos;

  for (let i = 0; i < 20; i++) {
    const next = posAdd(current, DIR_DELTA[pushDir]);

    if (!inBounds(next, grid.width, grid.height)) {
      break;
    }

    const nextTile = getTile(grid, next)!;

    if (TERRAIN_BLOCKS_MOVEMENT.has(nextTile.type) && nextTile.type !== "mine_cart") {
      break;
    }

    if (occupiedPositions.has(posKey(next))) {
      hits.push(next);
    }

    path.push(next);
    current = next;

    if (nextTile.type !== "rail" && nextTile.type !== "floor") {
      break;
    }
  }

  return { cartPath: path, hitPositions: hits, finalCartPos: current };
}

// ─── Terrain tick (ward lines, smoke, hallowed ground expiry) ───

export function tickTerrainTimers(grid: TacticalGrid): TacticalGrid {
  const newTiles = grid.tiles.map((row) =>
    row.map((tile) => {
      if (tile.turnsRemaining === null) {
        return tile;
      }

      const remaining = tile.turnsRemaining - 1;

      if (remaining <= 0) {
        return makeFloor();
      }

      return { ...tile, turnsRemaining: remaining };
    }),
  );

  return { ...grid, tiles: newTiles };
}

// ─── Affected tile calculators ───

export function getAdjacentTiles(pos: GridPos, grid: TacticalGrid): readonly GridPos[] {
  const result: GridPos[] = [];

  for (const delta of [
    ...Object.values(DIR_DELTA),
    { row: -1, col: -1 },
    { row: -1, col: 1 },
    { row: 1, col: -1 },
    { row: 1, col: 1 },
  ]) {
    const p = posAdd(pos, delta);
    if (inBounds(p, grid.width, grid.height)) {
      result.push(p);
    }
  }

  return result;
}

export function getOrthogonalTiles(pos: GridPos, grid: TacticalGrid): readonly GridPos[] {
  const result: GridPos[] = [];

  for (const dir of DIRECTIONS) {
    const p = posAdd(pos, DIR_DELTA[dir]);
    if (inBounds(p, grid.width, grid.height)) {
      result.push(p);
    }
  }

  return result;
}

export function getLineTiles(
  from: GridPos,
  direction: Direction,
  maxRange: number,
  grid: TacticalGrid,
): readonly GridPos[] {
  const result: GridPos[] = [];
  let current = from;

  for (let i = 0; i < maxRange; i++) {
    current = posAdd(current, DIR_DELTA[direction]);

    if (!inBounds(current, grid.width, grid.height)) {
      break;
    }

    result.push(current);

    if (blocksLOS(grid, current)) {
      break;
    }
  }

  return result;
}

export function getRadiusTiles(
  center: GridPos,
  radius: number,
  grid: TacticalGrid,
): readonly GridPos[] {
  const result: GridPos[] = [];

  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      if (dr === 0 && dc === 0) {
        continue;
      }

      const pos = { row: center.row + dr, col: center.col + dc };

      if (inBounds(pos, grid.width, grid.height) && Math.abs(dr) + Math.abs(dc) <= radius) {
        result.push(pos);
      }
    }
  }

  return result;
}

export function getRingTiles(
  center: GridPos,
  range: number,
  grid: TacticalGrid,
): readonly GridPos[] {
  const result: GridPos[] = [];

  for (let dr = -range; dr <= range; dr++) {
    for (let dc = -range; dc <= range; dc++) {
      const pos = { row: center.row + dr, col: center.col + dc };

      if (inBounds(pos, grid.width, grid.height) && Math.abs(dr) + Math.abs(dc) === range) {
        result.push(pos);
      }
    }
  }

  return result;
}

export function getConeTiles(
  origin: GridPos,
  direction: Direction,
  depth: number,
  grid: TacticalGrid,
): readonly GridPos[] {
  const result: GridPos[] = [];
  const delta = DIR_DELTA[direction];

  const perpDelta: GridPos = delta.row === 0 ? { row: 1, col: 0 } : { row: 0, col: 1 };

  for (let d = 1; d <= depth; d++) {
    const centerOfSlice = {
      row: origin.row + delta.row * d,
      col: origin.col + delta.col * d,
    };

    const halfWidth = Math.floor(d / 2);

    for (let w = -halfWidth; w <= halfWidth; w++) {
      const pos = {
        row: centerOfSlice.row + perpDelta.row * w,
        col: centerOfSlice.col + perpDelta.col * w,
      };

      if (inBounds(pos, grid.width, grid.height)) {
        result.push(pos);
      }
    }
  }

  return result;
}

// ─── Facing helpers ───

export function computeEnemyFacing(
  enemyPos: GridPos,
  attackTargetTile: GridPos | null,
  playerPos: GridPos,
): Direction {
  const target = attackTargetTile ?? playerPos;
  return directionFromTo(enemyPos, target) ?? "south";
}

export function isBehind(
  attackerPos: GridPos,
  targetPos: GridPos,
  targetFacing: Direction,
): boolean {
  const behindDir = oppositeDirection(targetFacing);
  const delta = DIR_DELTA[behindDir];
  const behindPos = posAdd(targetPos, delta);
  return posEqual(attackerPos, behindPos);
}

// ─── Utility ───

export function posKey(pos: GridPos): string {
  return `${pos.row},${pos.col}`;
}

function keyToPos(key: string): GridPos {
  const [r, c] = key.split(",").map(Number);
  return { row: r, col: c };
}

function manhattan(a: GridPos, b: GridPos): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}
