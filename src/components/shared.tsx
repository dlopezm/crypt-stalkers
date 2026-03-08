import { STATUS_COLORS, STATUS_ICONS, STATUS_DESC } from "../data/status";
import type { Statuses, Card, CardTemplate, StatusKey } from "../types";

export function StatusBadges({ statuses = {} }: { statuses?: Statuses }) {
  const active = (Object.entries(statuses) as [StatusKey, number][]).filter(([, v]) => v > 0);
  if (!active.length) return null;
  return (
    <div className="flex gap-1 flex-wrap justify-center mt-1">
      {active.map(([k, v]) => (
        <div key={k} title={STATUS_DESC[k]}
          className="rounded px-1.5 py-0.5 text-xs flex items-center gap-1"
          style={{
            background: STATUS_COLORS[k] + "33",
            border: `1px solid ${STATUS_COLORS[k]}66`,
            color: STATUS_COLORS[k],
          }}>
          {STATUS_ICONS[k]} {v}
        </div>
      ))}
    </div>
  );
}

export function HpBar({ current, max, color = "#8b0000" }: { current: number; max: number; color?: string }) {
  return (
    <div className="w-full">
      <div className="h-2 bg-crypt-bg rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-[width] duration-400"
          style={{
            width: `${Math.max(0, (current / max) * 100)}%`,
            background: `linear-gradient(90deg,${color}aa,${color})`,
          }} />
      </div>
      <div className="text-xs text-crypt-muted text-right mt-0.5">
        {Math.max(0, current)}/{max}
      </div>
    </div>
  );
}

export function CardUI({ card, selected, affordable, onClick, large }: {
  card: Card | CardTemplate;
  selected?: boolean;
  affordable?: boolean;
  onClick?: () => void;
  large?: boolean;
}) {
  return (
    <div onClick={onClick}
      className={`
        relative flex flex-col items-center rounded-lg p-2 select-none
        transition-all duration-150
        ${selected ? "-translate-y-3 shadow-[0_8px_24px_rgba(139,0,0,0.5)]" : "shadow-[0_2px_8px_rgba(0,0,0,0.5)]"}
        ${affordable ? "cursor-pointer" : "cursor-not-allowed opacity-40"}
      `}
      style={{
        width: large ? "140px" : "124px",
        minHeight: "164px",
        background: selected ? "#1e1208" : "#161008",
        border: `1px solid ${selected ? "#c41c1c" : card.holy ? "#e67e2244" : "#3a3020"}`,
      }}>
      <div className="text-[0.65rem] tracking-widest uppercase mb-0.5" style={{ color: card.color }}>{card.type}</div>
      <div className="text-sm font-bold text-crypt-text text-center leading-tight mb-1">{card.name}</div>
      <div className="text-xl my-1">{card.type === "attack" ? "\u2694\uFE0F" : card.type === "defend" ? "\u{1F6E1}\uFE0F" : "\u2728"}</div>
      <div className="text-xs text-crypt-muted text-center leading-snug flex-1">{card.desc}</div>
      <div className="absolute top-1 right-1.5 bg-crypt-red text-crypt-text rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
        {card.cost}
      </div>
    </div>
  );
}
