import { STATUS_COLORS, STATUS_ICONS, STATUS_DESC } from "../data/status";
import type { Statuses, StatusKey } from "../types";

export function StatusBadges({ statuses = {} }: { statuses?: Statuses }) {
  const active = (Object.entries(statuses) as [StatusKey, number][]).filter(([, v]) => v > 0);
  if (!active.length) return null;
  return (
    <div className="flex gap-1 flex-wrap justify-center mt-1">
      {active.map(([k, v]) => (
        <div
          key={k}
          title={STATUS_DESC[k]}
          className="rounded px-1.5 py-0.5 text-xs flex items-center gap-1"
          style={{
            background: STATUS_COLORS[k] + "33",
            border: `1px solid ${STATUS_COLORS[k]}66`,
            color: STATUS_COLORS[k],
          }}
        >
          {(() => {
            const I = STATUS_ICONS[k];
            return (
              <I
                style={{
                  width: "1em",
                  height: "1em",
                  display: "inline-block",
                  verticalAlign: "middle",
                }}
              />
            );
          })()}{" "}
          {v}
        </div>
      ))}
    </div>
  );
}

export function HpBar({
  current,
  max,
  color = "#8b0000",
}: {
  current: number;
  max: number;
  color?: string;
}) {
  return (
    <div className="w-full">
      <div className="h-2 bg-crypt-bg rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-400"
          style={{
            width: `${Math.max(0, (current / max) * 100)}%`,
            background: `linear-gradient(90deg,${color}aa,${color})`,
          }}
        />
      </div>
      <div className="text-xs text-crypt-muted text-right mt-0.5">
        {Math.max(0, current)}/{max}
      </div>
    </div>
  );
}
