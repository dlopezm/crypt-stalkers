import { useEffect, useRef } from "react";
import type { TelegraphType, TimelineEntry } from "../../grid-combat/types";

export type InsertionSlotItem = { readonly _kind: "insertion_slot"; readonly index: number };
export type MergedTimelineItem = TimelineEntry | InsertionSlotItem;

export function isInsertionSlot(item: MergedTimelineItem): item is InsertionSlotItem {
  return "_kind" in item;
}

interface TimelineSidebarProps {
  readonly mergedTimeline: readonly MergedTimelineItem[];
  readonly phase: string;
  readonly insertionSlot: number;
  readonly onSlotChange: (slot: number) => void;
  readonly onRemovePlayerAction: (entryId: string) => void;
  readonly turn: number;
  readonly enemyTurnOrder: ReadonlyMap<string, number>;
  readonly hoveredEnemyUid: string | null;
  readonly onHoverEnemy: (uid: string | null) => void;
  readonly executingEntryId: string | null;
}

export function TimelineSidebar({
  mergedTimeline,
  phase,
  insertionSlot,
  onSlotChange,
  onRemovePlayerAction,
  turn,
  enemyTurnOrder,
  hoveredEnemyUid,
  onHoverEnemy,
  executingEntryId,
}: TimelineSidebarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!executingEntryId || !scrollRef.current) {
      return;
    }
    const el = scrollRef.current.querySelector(`[data-entry-id="${executingEntryId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [executingEntryId]);

  return (
    <div
      ref={scrollRef}
      className="flex flex-col w-72 flex-shrink-0 border-r border-crypt-border overflow-y-auto"
      style={{ background: "#161210" }}
    >
      <div className="px-3 py-2.5 border-b border-crypt-border">
        <h3 className="text-sm uppercase tracking-widest text-crypt-muted">
          Timeline — Turn {turn}
        </h3>
      </div>

      <div className="flex-1 p-2.5 space-y-1.5">
        {mergedTimeline.map((item) => {
          if (isInsertionSlot(item)) {
            if (phase !== "planning") {
              return null;
            }
            return (
              <InsertionSlotButton
                key={`slot_${item.index}`}
                isActive={insertionSlot === item.index}
                onClick={() => onSlotChange(item.index)}
              />
            );
          }

          const entry = item as TimelineEntry;
          const isPlayer = entry.owner.type === "player";
          const enemyUid = entry.owner.type === "enemy" ? entry.owner.uid : null;
          const turnNum = enemyUid ? enemyTurnOrder.get(enemyUid) : undefined;
          const isHighlighted = enemyUid !== null && hoveredEnemyUid === enemyUid;

          return (
            <TimelineEntryCard
              key={entry.id}
              entry={entry}
              isPlayer={isPlayer}
              turnNum={turnNum}
              isHighlighted={isHighlighted}
              isExecuting={executingEntryId === entry.id}
              canRemove={isPlayer && phase === "planning"}
              onRemove={() => onRemovePlayerAction(entry.id)}
              onMouseEnter={() => enemyUid && onHoverEnemy(enemyUid)}
              onMouseLeave={() => onHoverEnemy(null)}
            />
          );
        })}
      </div>
    </div>
  );
}

function InsertionSlotButton({
  isActive,
  onClick,
}: {
  readonly isActive: boolean;
  readonly onClick: () => void;
}) {
  return (
    <button
      className="w-full py-1 rounded text-center text-sm transition-colors"
      style={{
        background: isActive ? "rgba(93, 173, 226, 0.3)" : "transparent",
        color: isActive ? "#5dade2" : "#786848",
        border: isActive ? "1px dashed #5dade2" : "1px dashed transparent",
      }}
      onClick={onClick}
    >
      {isActive ? "▶ Insert here" : "· · ·"}
    </button>
  );
}

const TIMELINE_ENTRY_BORDER: Record<TelegraphType, string> = {
  attack: "#c41c1c55",
  move: "#f0c04055",
  buff: "#5dade255",
  special: "#b478ff55",
};

const TIMELINE_ENTRY_BG: Record<TelegraphType, string> = {
  attack: "rgba(196, 28, 28, 0.10)",
  move: "rgba(240, 192, 64, 0.08)",
  buff: "rgba(93, 173, 226, 0.08)",
  special: "rgba(180, 120, 255, 0.08)",
};

function TimelineEntryCard({
  entry,
  isPlayer,
  turnNum,
  isHighlighted,
  isExecuting,
  canRemove,
  onRemove,
  onMouseEnter,
  onMouseLeave,
}: {
  readonly entry: TimelineEntry;
  readonly isPlayer?: boolean;
  readonly turnNum?: number;
  readonly isHighlighted?: boolean;
  readonly isExecuting?: boolean;
  readonly canRemove?: boolean;
  readonly onRemove?: () => void;
  readonly onMouseEnter?: () => void;
  readonly onMouseLeave?: () => void;
}) {
  const bg = isExecuting
    ? isPlayer
      ? "rgba(61, 220, 132, 0.35)"
      : "rgba(240, 192, 64, 0.3)"
    : isPlayer
      ? "rgba(61, 220, 132, 0.15)"
      : isHighlighted
        ? "rgba(255, 255, 255, 0.1)"
        : (TIMELINE_ENTRY_BG[entry.telegraphType] ?? "rgba(196, 28, 28, 0.1)");

  const border = isExecuting
    ? isPlayer
      ? "#3ddc84"
      : "#f0c040"
    : isPlayer
      ? "#3ddc8444"
      : isHighlighted
        ? "#ffffff88"
        : (TIMELINE_ENTRY_BORDER[entry.telegraphType] ?? "#c41c1c33");

  return (
    <div
      data-entry-id={entry.id}
      className="flex items-center gap-2 px-2.5 py-1.5 rounded text-sm transition-all"
      style={{
        background: bg,
        border: `2px solid ${border}`,
        boxShadow: isExecuting
          ? `0 0 12px ${isPlayer ? "rgba(61, 220, 132, 0.5)" : "rgba(240, 192, 64, 0.5)"}`
          : isHighlighted
            ? "0 0 6px rgba(255,255,255,0.2)"
            : "none",
        transform: isExecuting ? "scale(1.03)" : "none",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {turnNum !== undefined && (
        <span
          className="flex items-center justify-center rounded-full shrink-0"
          style={{
            width: 20,
            height: 20,
            background: "#c41c1c",
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1,
          }}
        >
          {turnNum}
        </span>
      )}

      {isPlayer && (
        <span
          className="flex items-center justify-center rounded-full shrink-0"
          style={{
            width: 20,
            height: 20,
            background: "#3ddc84",
            fontSize: 11,
            fontWeight: 700,
            color: "#0c0a08",
            lineHeight: 1,
          }}
        >
          P
        </span>
      )}

      <span>{entry.icon}</span>
      <span className="flex-1 truncate">{entry.label}</span>

      {canRemove && (
        <button
          className="shrink-0 flex items-center justify-center rounded-full hover:bg-red-900/50 transition-colors"
          style={{
            width: 20,
            height: 20,
            fontSize: 12,
            color: "#c41c1c",
            lineHeight: 1,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          title="Remove action"
        >
          ✕
        </button>
      )}
    </div>
  );
}
