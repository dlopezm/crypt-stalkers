import type { CSSProperties } from "react";

export const FONT = "'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif";

export function btnStyle(color = "#8b0000", disabled = false): CSSProperties {
  return {
    background: disabled ? "#1a1210" : `linear-gradient(180deg,${color}cc,${color}88)`,
    border: `1px solid ${disabled ? "#3a3020" : color}`,
    color: disabled ? "#5a4a38" : "#ece0c8",
    padding: "0.5rem 1.1rem",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: FONT,
    fontSize: "0.9rem",
    letterSpacing: "0.08em",
    borderRadius: "4px",
    transition: "all 0.15s",
    textTransform: "uppercase",
  };
}
