import { useState } from "react";
import { btnStyle } from "../../styles";
import { ENEMY_TYPES } from "../../data/enemies";
import { getActiveEffects, isHazardousRoom } from "../../data/environment";
import { getActiveProps } from "../../utils/props";
import type { AreaNode, Player } from "../../types";

function ThreatPanel({ threats }: { readonly threats: readonly string[] }) {
  if (threats.length === 0) return null;
  return (
    <div className="mb-2 border-t border-crypt-muted/20 pt-2">
      <p className="text-xs text-crypt-red uppercase tracking-widest mb-1">Threat Assessment</p>
      {threats.map((t, i) => (
        <p key={i} className="text-xs text-crypt-muted leading-relaxed">
          {"⚠"} {t}
        </p>
      ))}
    </div>
  );
}

function buildThreatSummary(node: AreaNode): readonly string[] {
  const threats: string[] = [];

  if (node.enemies.length > 0) {
    const counts = new Map<string, number>();
    for (const e of node.enemies) {
      counts.set(e.typeId, (counts.get(e.typeId) ?? 0) + 1);
    }
    const parts: string[] = [];
    for (const [typeId, count] of counts) {
      const name = ENEMY_TYPES.find((t) => t.id === typeId)?.name ?? typeId;
      parts.push(count > 1 ? `${count}x ${name}` : name);
    }
    threats.push(`Hostiles: ${parts.join(", ")}`);
  }

  for (const eff of getActiveEffects(node)) {
    threats.push(eff.threat);
  }

  return threats;
}

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
  onExamineProp,
}: {
  readonly node: AreaNode | null;
  readonly currentRoomId: string;
  readonly adjacentIds: Set<string>;
  readonly debugMode: boolean;
  readonly scoutLevel: number;
  readonly scoutResult: string | null;
  readonly player: Player;
  readonly onEnterRoom: (id: string) => void;
  readonly onScout: (level: number) => void;
  readonly onExamineProp: (roomId: string, propId: string) => void;
}) {
  const [showDesc, setShowDesc] = useState(false);

  if (!node) {
    return (
      <div className="panel">
        <p className="text-sm text-crypt-muted leading-relaxed">Click any visible room.</p>
      </div>
    );
  }

  const label =
    !debugMode && node.state !== "visited" && node.id !== currentRoomId ? "???" : node.label;
  const canSeeDesc = !!(
    node.description &&
    (node.state === "visited" || node.id === currentRoomId)
  );

  const envDescs =
    node.state === "visited" || node.id === currentRoomId || node.scouted
      ? (() => {
          const d = getActiveEffects(node).map((e) => e.description);
          if (node.looted?.length) d.push("Someone has been here before you. Drawers left open.");
          return d;
        })()
      : [];

  return (
    <div className="panel">
      {/* Room header — always visible */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div>
          <div className="text-base font-bold text-crypt-text leading-tight">{label}</div>
          {node.id === currentRoomId && (
            <p className="text-xs text-crypt-gold mt-0.5">{"⚑"} You are here.</p>
          )}
        </div>
        {canSeeDesc && (
          <button
            onClick={() => setShowDesc((v) => !v)}
            className="text-xs text-crypt-dim/60 shrink-0 mt-0.5"
            title={showDesc ? "Hide description" : "Show description"}
          >
            {showDesc ? "▴" : "▾"}
          </button>
        )}
      </div>

      {/* Description + env notes — collapsed by default */}
      {showDesc && canSeeDesc && (
        <p className="text-sm text-crypt-muted mb-2 italic leading-relaxed">{node.description}</p>
      )}

      {showDesc && envDescs.length > 0 && (
        <div className="text-xs text-crypt-dim mb-2 italic leading-relaxed border-l-2 border-crypt-purple/30 pl-2">
          {envDescs.map((d, i) => (
            <span key={i}>
              {d}
              {i < envDescs.length - 1 && " "}
            </span>
          ))}
        </div>
      )}

      {node.id !== currentRoomId && node.enemies.length > 0 && !node.exit && (
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
        </div>
      )}

      {scoutResult && scoutLevel > 0 && (
        <div className="text-sm text-amber-500 mb-2 italic leading-relaxed border-l-2 border-crypt-red-glow/30 pl-2">
          {scoutResult}
        </div>
      )}

      {node.exit && node.id !== currentRoomId && (
        <p className="text-sm text-crypt-gold mb-2 leading-relaxed">
          {"\u{1F6AA}"} A way through to another part of the dungeon.
        </p>
      )}

      {adjacentIds.has(node.id) &&
        node.id !== currentRoomId &&
        (() => {
          const isScouted = node.scouted || node.state === "visited";
          const threats = isScouted ? buildThreatSummary(node) : [];
          return <ThreatPanel threats={threats} />;
        })()}

      {/* In-room props — hidden on mobile (tap them on the map), shown on desktop */}
      {node.id === currentRoomId &&
        (() => {
          const activeProps = getActiveProps(node.props, player.flags, node.propStates);
          if (activeProps.length === 0) return null;
          return (
            <div className="hidden lg:block mb-2 pt-2" style={{ borderTop: "1px solid #2a2015" }}>
              <div className="text-xs text-crypt-dim mb-1 tracking-wider uppercase">
                In this room
              </div>
              <div className="flex flex-col gap-1">
                {activeProps.map((p) => {
                  const state = node.propStates?.[p.id];
                  const examined = state?.examined ?? false;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onExamineProp(node.id, p.id)}
                      style={btnStyle(examined ? "#3a3020" : "#6a3a1a")}
                      className="text-xs! px-2! py-1! text-left! flex! items-center! gap-2!"
                    >
                      <span style={{ fontSize: "1rem" }}>{p.icon}</span>
                      <span className="flex-1">{p.label}</span>
                      {examined && <span style={{ color: "#8a7a5a" }}>{"✓"}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

      <div className="flex flex-col gap-1.5">
        {(adjacentIds.has(node.id) || debugMode) && node.id !== currentRoomId && (
          <button
            style={btnStyle(node.exit ? "#8b6914" : "#8b0000")}
            onClick={() => onEnterRoom(node.id)}
          >
            {node.exit
              ? `\u{1F6AA} Travel — ${node.label}`
              : isHazardousRoom(node)
                ? "⚠ Enter (hazardous)"
                : "Enter"}
          </button>
        )}

        {adjacentIds.has(node.id) && node.id !== currentRoomId && !node.exit && (
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
              title={`Full scout — risky`}
              style={btnStyle("#5a3a10")}
              className={`text-xs! px-2! py-1! flex-1 ${scoutLevel >= 3 ? "opacity-50" : ""}`}
              onClick={() => onScout(3)}
            >
              {"\u{1F575}"} Scout
            </button>
          </div>
        )}

        {!debugMode &&
          node.state !== "locked" &&
          !adjacentIds.has(node.id) &&
          node.id !== currentRoomId && (
            <div className="text-xs text-crypt-dim italic">Not adjacent {"—"} move closer.</div>
          )}
      </div>
    </div>
  );
}
