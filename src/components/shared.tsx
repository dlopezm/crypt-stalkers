import { STATUS_COLORS, STATUS_ICONS, STATUS_DESC } from "../data/status";
import type { Statuses, Card, CardTemplate, StatusKey } from "../types";

export function StatusBadges({ statuses = {} }: { statuses?: Statuses }) {
  const active = (Object.entries(statuses) as [StatusKey, number][]).filter(([, v]) => v > 0);
  if (!active.length) return null;
  return (
    <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", justifyContent: "center", marginTop: "4px" }}>
      {active.map(([k, v]) => (
        <div key={k} title={STATUS_DESC[k]} style={{
          background: STATUS_COLORS[k] + "33", border: `1px solid ${STATUS_COLORS[k]}66`,
          borderRadius: "3px", padding: "1px 4px", fontSize: "0.55rem", color: STATUS_COLORS[k],
          display: "flex", alignItems: "center", gap: "2px",
        }}>{STATUS_ICONS[k]} {v}</div>
      ))}
    </div>
  );
}

export function HpBar({ current, max, color = "#8b0000" }: { current: number; max: number; color?: string }) {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ height: "6px", background: "#1a1210", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${Math.max(0, (current / max) * 100)}%`,
          background: `linear-gradient(90deg,${color}aa,${color})`,
          transition: "width 0.4s", borderRadius: "3px",
        }} />
      </div>
      <div style={{ fontSize: "0.68rem", color: "#5a4a3a", textAlign: "right", marginTop: "1px" }}>
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
    <div onClick={onClick} style={{
      width: large ? "122px" : "106px", minHeight: "142px",
      background: selected ? "#1e1208" : "#130e0a",
      border: `1px solid ${selected ? "#8b0000" : card.holy ? "#e67e2244" : "#2a1f15"}`,
      borderRadius: "6px", padding: "0.45rem",
      cursor: affordable ? "pointer" : "not-allowed", opacity: affordable ? 1 : 0.45,
      transition: "all 0.15s", transform: selected ? "translateY(-12px)" : "translateY(0)",
      boxShadow: selected ? "0 8px 20px rgba(139,0,0,0.5)" : "0 2px 6px rgba(0,0,0,0.5)",
      display: "flex", flexDirection: "column", alignItems: "center", userSelect: "none", position: "relative",
    }}>
      <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", color: card.color, textTransform: "uppercase", marginBottom: "2px" }}>{card.type}</div>
      <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#c9b99a", textAlign: "center", lineHeight: 1.2, marginBottom: "3px" }}>{card.name}</div>
      <div style={{ fontSize: "1.4rem", margin: "2px 0" }}>{card.type === "attack" ? "\u2694\uFE0F" : card.type === "defend" ? "\u{1F6E1}\uFE0F" : "\u2728"}</div>
      <div style={{ fontSize: "0.6rem", color: "#7a6a5a", textAlign: "center", lineHeight: 1.3, flex: 1 }}>{card.desc}</div>
      <div style={{
        position: "absolute", top: "4px", right: "5px", background: "#8b0000", color: "#c9b99a",
        borderRadius: "50%", width: "17px", height: "17px", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "0.68rem", fontWeight: "bold",
      }}>{card.cost}</div>
    </div>
  );
}
