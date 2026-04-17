import { memo, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type {
  GridAbility,
  GridEnemyState,
  GridPlayerState,
  GridPos,
  TacticalGrid,
  TelegraphType,
  TimelineEntry,
} from "../../grid-combat/types";
import { posEqual } from "../../grid-combat/types";
import { posKey } from "../../grid-combat/grid";
import { GRID_ENEMY_TYPE_MAP } from "../../grid-combat/enemy-defs";
import { getTarotSrc } from "../../data/tarot";
import {
  FACING_ROTATION,
  TELEGRAPH_TYPE_COLORS,
  TERRAIN_COLORS,
  TERRAIN_ICONS,
  TERRAIN_INFO,
  TILE_SIZE,
} from "./constants";

interface GridRendererProps {
  readonly grid: TacticalGrid;
  readonly player: GridPlayerState;
  readonly enemies: readonly GridEnemyState[];
  readonly tileOverlays: ReadonlyMap<string, TelegraphType>;
  readonly selectedAbility: GridAbility | null;
  readonly hoveredTile: GridPos | null;
  readonly playerInsertions: readonly TimelineEntry[];
  readonly onTileClick: (pos: GridPos) => void;
  readonly onTileHover: (pos: GridPos | null) => void;
  readonly enemyTurnOrder: ReadonlyMap<string, number>;
  readonly hoveredEnemyUid: string | null;
  readonly onHoverEnemy: (uid: string | null) => void;
  readonly enemyAffectedTiles: ReadonlyMap<string, ReadonlySet<string>>;
}

export const GridRenderer = memo(function GridRenderer({
  grid,
  player,
  enemies,
  tileOverlays,
  selectedAbility,
  hoveredTile,
  playerInsertions,
  onTileClick,
  onTileHover,
  enemyTurnOrder,
  hoveredEnemyUid,
  onHoverEnemy,
  enemyAffectedTiles,
}: GridRendererProps) {
  const playerActionTiles = useMemo(() => {
    const tiles = new Set<string>();
    for (const entry of playerInsertions) {
      for (const t of entry.affectedTiles) {
        tiles.add(posKey(t));
      }
    }
    return tiles;
  }, [playerInsertions]);

  const hoveredEnemyTargetTiles = useMemo(() => {
    if (!hoveredEnemyUid) {
      return null;
    }
    return enemyAffectedTiles.get(hoveredEnemyUid) ?? null;
  }, [hoveredEnemyUid, enemyAffectedTiles]);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current?.parentElement;
    if (!el) {
      return;
    }
    const rawW = grid.width * TILE_SIZE;
    const rawH = grid.height * TILE_SIZE;
    const compute = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }
      const next = Math.min(1, rect.width / rawW, rect.height / rawH);
      setScale(next);
    };
    compute();
    const obs = new ResizeObserver(compute);
    obs.observe(el);
    return () => obs.disconnect();
  }, [grid.width, grid.height]);

  const rawWidth = grid.width * TILE_SIZE;
  const rawHeight = grid.height * TILE_SIZE;

  return (
    <div
      ref={wrapperRef}
      style={{
        width: rawWidth * scale,
        height: rawHeight * scale,
        flexShrink: 0,
      }}
    >
      <div
        className="relative border border-crypt-border"
        style={{
          width: rawWidth,
          height: rawHeight,
          userSelect: "none",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {grid.tiles.map((row, r) =>
          row.map((tile, c) => {
            const pos: GridPos = { row: r, col: c };
            const key = posKey(pos);
            const overlayType = tileOverlays.get(key);
            const isPlayerAction = playerActionTiles.has(key);
            const isHovered = hoveredTile && posEqual(hoveredTile, pos);
            const isSelected = selectedAbility !== null && isHovered;
            const isEnemyTarget = hoveredEnemyTargetTiles?.has(key) ?? false;

            const overlayColors = overlayType ? TELEGRAPH_TYPE_COLORS[overlayType] : null;
            const terrainInfo = TERRAIN_INFO[tile.type];

            return (
              <div
                key={key}
                className="absolute cursor-pointer group"
                style={{
                  left: c * TILE_SIZE,
                  top: r * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  background: isSelected
                    ? "rgba(93, 173, 226, 0.4)"
                    : isPlayerAction
                      ? "rgba(61, 220, 132, 0.2)"
                      : overlayColors
                        ? overlayColors.bg
                        : (TERRAIN_COLORS[tile.type] ?? "#1a1610"),
                  border: isEnemyTarget
                    ? "2px solid rgba(255, 120, 80, 0.8)"
                    : "1px solid #2a201844",
                  transition: "background 0.1s, border 0.1s",
                  boxShadow: isEnemyTarget ? "inset 0 0 12px rgba(255, 120, 80, 0.3)" : "none",
                }}
                onClick={() => onTileClick(pos)}
                onMouseEnter={() => onTileHover(pos)}
                onMouseLeave={() => onTileHover(null)}
              >
                {TERRAIN_ICONS[tile.type] && (
                  <span className="absolute inset-0 flex items-center justify-center text-lg opacity-60 pointer-events-none">
                    {TERRAIN_ICONS[tile.type]}
                  </span>
                )}

                {overlayColors && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: overlayColors.pulse }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                {overlayType === "move" && !isPlayerAction && (
                  <span className="absolute inset-0 flex items-center justify-center text-base opacity-50 pointer-events-none">
                    👣
                  </span>
                )}

                {terrainInfo && (
                  <div
                    className="absolute z-40 hidden group-hover:block pointer-events-none"
                    style={{
                      bottom: "100%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      marginBottom: 6,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div
                      className="px-3 py-2 rounded text-left"
                      style={{
                        background: "#1a1610",
                        border: "1px solid #3a3020",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
                        maxWidth: 260,
                        whiteSpace: "normal",
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm">{TERRAIN_ICONS[tile.type] ?? ""}</span>
                        <span className="text-sm font-bold" style={{ color: "#ece0c8" }}>
                          {terrainInfo.name}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: "#a89878" }}>
                        {terrainInfo.effect}
                      </p>
                      {tile.turnsRemaining !== null && (
                        <p className="text-xs mt-0.5" style={{ color: "#f0c040" }}>
                          {tile.turnsRemaining} turn{tile.turnsRemaining !== 1 ? "s" : ""} remaining
                        </p>
                      )}
                      {tile.brazierLit !== null && (
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: tile.brazierLit ? "#f0c040" : "#5a4a38" }}
                        >
                          {tile.brazierLit ? "Lit" : "Extinguished"}
                        </p>
                      )}
                      {tile.hazardDamage !== null && (
                        <p className="text-xs mt-0.5" style={{ color: "#c41c1c" }}>
                          {tile.hazardDamage} damage on entry
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          }),
        )}

        <motion.div
          className="absolute z-20 flex items-center justify-center rounded-full border-2 border-crypt-green pointer-events-none"
          style={{
            left: player.pos.col * TILE_SIZE + 4,
            top: player.pos.row * TILE_SIZE + 4,
            width: TILE_SIZE - 8,
            height: TILE_SIZE - 8,
            background: "rgba(61, 220, 132, 0.3)",
            fontSize: "1.8rem",
          }}
          animate={{
            left: player.pos.col * TILE_SIZE + 4,
            top: player.pos.row * TILE_SIZE + 4,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          🗡️
        </motion.div>

        {enemies.map((enemy) => {
          if (enemy.hp <= 0) {
            return null;
          }

          const def = GRID_ENEMY_TYPE_MAP.get(enemy.id);
          const isHidden = (enemy.conditions.hidden ?? 0) > 0;
          const turnNum = enemyTurnOrder.get(enemy.uid);
          const isHighlighted = hoveredEnemyUid === enemy.uid;
          const tarotSrc = getTarotSrc(enemy.id);
          const rotation = FACING_ROTATION[enemy.facing];

          return (
            <motion.div
              key={enemy.uid}
              className="absolute z-10 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
              style={{
                left: enemy.pos.col * TILE_SIZE,
                top: enemy.pos.row * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                opacity: isHidden ? 0.3 : 1,
              }}
              animate={{
                left: enemy.pos.col * TILE_SIZE,
                top: enemy.pos.row * TILE_SIZE,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              onClick={() => onTileClick(enemy.pos)}
              onMouseEnter={() => onHoverEnemy(enemy.uid)}
              onMouseLeave={() => onHoverEnemy(null)}
            >
              {tarotSrc ? (
                <motion.div
                  className="pointer-events-none overflow-hidden rounded"
                  style={{
                    width: TILE_SIZE - 10,
                    height: TILE_SIZE - 10,
                    border: `2px solid ${isHighlighted ? "#fff" : enemy.isBoss ? "#f0c040" : "#8a6010"}`,
                    boxShadow: isHighlighted
                      ? "0 0 10px rgba(255,255,255,0.5)"
                      : enemy.isBoss
                        ? "0 0 8px rgba(240,192,64,0.4)"
                        : "0 0 6px rgba(138,96,16,0.3)",
                  }}
                  animate={{ rotate: rotation }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <img
                    src={tarotSrc}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center 20%",
                    }}
                    draggable={false}
                  />
                </motion.div>
              ) : (
                <div
                  className="pointer-events-none flex items-center justify-center rounded border"
                  style={{
                    width: TILE_SIZE - 8,
                    height: TILE_SIZE - 8,
                    background: enemy.isBoss ? "rgba(240,192,64,0.25)" : "rgba(196,28,28,0.25)",
                    borderColor: isHighlighted ? "#fff" : enemy.isBoss ? "#f0c040" : "#c41c1c",
                  }}
                >
                  <span className="text-2xl leading-none">{def?.ascii ?? "?"}</span>
                </div>
              )}

              <div
                className="absolute pointer-events-none"
                style={{
                  bottom: 1,
                  left: 6,
                  right: 6,
                  height: 4,
                  background: "#3a3020",
                  borderRadius: 2,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 2,
                    width: `${(enemy.hp / enemy.maxHp) * 100}%`,
                    background:
                      enemy.hp > enemy.maxHp * 0.5
                        ? "#3ddc84"
                        : enemy.hp > enemy.maxHp * 0.25
                          ? "#f0c040"
                          : "#c41c1c",
                  }}
                />
              </div>

              {turnNum !== undefined && (
                <div
                  className="absolute flex items-center justify-center rounded-full pointer-events-none"
                  style={{
                    top: -6,
                    left: -6,
                    width: 20,
                    height: 20,
                    background: "#c41c1c",
                    border: "1px solid #0c0a08",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  {turnNum}
                </div>
              )}
            </motion.div>
          );
        })}

        {player.overwatchTile && (
          <motion.div
            className="absolute z-5 pointer-events-none border-2 border-dashed border-crypt-blue rounded"
            style={{
              left: player.overwatchTile.col * TILE_SIZE,
              top: player.overwatchTile.row * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-lg pointer-events-none">
              🎯
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
});
