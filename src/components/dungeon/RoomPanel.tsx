import { btnStyle } from "../../styles";
import { TRAP_INFO } from "../../data/rooms";
import { BLOCK_DOOR_COST } from "../../data/constants";
import type { DungeonNode, Player } from "../../types";

export function RoomPanel({
  node,
  currentRoomId,
  adjacentIds,
  debugMode,
  scoutLevel,
  scoutResult,
  player,
  onEnterRoom,
  onScout,
  onSetTrap,
  onBlockDoor,
}: {
  node: DungeonNode | null;
  currentRoomId: string;
  adjacentIds: Set<string>;
  debugMode: boolean;
  scoutLevel: number;
  scoutResult: string | null;
  player: Player;
  onEnterRoom: (id: string) => void;
  onScout: (level: number) => void;
  onSetTrap: (id: string, trap: string) => void;
  onBlockDoor: (id: string) => void;
}) {
  if (!node) {
    return (
      <div className="panel">
        <p className="text-base text-crypt-muted leading-relaxed">Click any visible room.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="text-lg font-bold text-crypt-text mb-2 leading-tight">
        {!debugMode && node.state !== "visited" && node.id !== currentRoomId ? "???" : node.label}
      </div>
      {node.id === currentRoomId && (
        <p className="text-sm text-crypt-gold mb-1">{"\u2691"} You are here.</p>
      )}

      {node.id !== currentRoomId && node.enemies.length > 0 && (
        <div className="text-sm text-crypt-muted mb-2 leading-relaxed">
          {debugMode ? (
            <span className="text-crypt-purple">
              {node.enemies.length} enemies: {node.enemies.map((e) => e.typeId).join(", ")}
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
        {(adjacentIds.has(node.id) || debugMode) && !node.blocked && node.id !== currentRoomId && (
          <button style={btnStyle("#8b0000")} onClick={() => onEnterRoom(node.id)}>
            Enter
          </button>
        )}

        {adjacentIds.has(node.id) && node.id !== currentRoomId && (
          <div className="flex gap-1">
            <button
              title="Listen at door (quiet, safe)"
              style={btnStyle("#3a2a10")}
              className={`text-xs! px-2! py-1! flex-1 ${scoutLevel >= 1 ? "opacity-50" : ""}`}
              onClick={() => onScout(1)}
            >
              {"\u{1F442}"} Listen
            </button>
            <button
              title="Peek through keyhole"
              style={btnStyle("#4a3010")}
              className={`text-xs! px-2! py-1! flex-1 ${scoutLevel >= 2 ? "opacity-50" : ""}`}
              onClick={() => onScout(2)}
            >
              {"\u{1F511}"} Peek
            </button>
            <button
              title="Full scout \u2014 risky"
              style={btnStyle("#5a3a10")}
              className={`text-xs! px-2! py-1! flex-1 ${scoutLevel >= 3 ? "opacity-50" : ""}`}
              onClick={() => onScout(3)}
            >
              {"\u{1F575}"} Scout
            </button>
          </div>
        )}

        {(adjacentIds.has(node.id) || node.id === currentRoomId) &&
          node.enemies.length > 0 &&
          !node.trap && (
            <div className="flex gap-1 flex-wrap">
              {Object.entries(TRAP_INFO).map(([key, t]) => (
                <button
                  key={key}
                  title={t.desc}
                  disabled={player.gold < t.cost}
                  style={btnStyle(t.color, player.gold < t.cost)}
                  className="text-xs! px-2! py-1!"
                  onClick={() => onSetTrap(node.id, key)}
                >
                  {t.icon}
                  {t.cost}
                  {"\u{1FA99}"}
                </button>
              ))}
            </div>
          )}

        {(adjacentIds.has(node.id) || node.id === currentRoomId) &&
          node.enemies.length > 0 &&
          !node.blocked && (
            <button
              style={btnStyle("#2980b9", player.gold < BLOCK_DOOR_COST)}
              className="text-xs! px-2! py-1!"
              disabled={player.gold < BLOCK_DOOR_COST}
              onClick={() => onBlockDoor(node.id)}
            >
              {"\u{1F6A7}"} Block ({BLOCK_DOOR_COST}
              {"\u{1FA99}"})
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
  );
}
