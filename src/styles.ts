import type { CSSProperties } from "react";

export const FONT = "'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif";

export const S = {
  root: {
    minHeight: "100vh", background: "#0a0608", color: "#c9b99a", fontFamily: FONT,
    display: "flex", flexDirection: "column" as const, alignItems: "center" as const,
    padding: "0", position: "relative" as const, overflow: "hidden",
  } satisfies CSSProperties,

  vignette: {
    position: "fixed" as const, inset: 0,
    background: "radial-gradient(ellipse at center,transparent 40%,#000 100%)",
    pointerEvents: "none" as const, zIndex: 0,
  } satisfies CSSProperties,

  title: {
    fontSize: "clamp(2rem,5vw,3.2rem)", letterSpacing: "0.2em", textTransform: "uppercase" as const,
    color: "#8b0000", textShadow: "0 0 30px #8b0000,0 0 60px #4a0000",
    margin: "2rem 0 0.2rem", fontWeight: "bold", position: "relative" as const, zIndex: 1,
  } satisfies CSSProperties,

  subtitle: {
    color: "#5a4a3a", letterSpacing: "0.3em", fontSize: "0.8rem",
    marginBottom: "1.5rem", zIndex: 1, position: "relative" as const,
  } satisfies CSSProperties,

  panel: {
    background: "linear-gradient(180deg,#110d0a,#0d0a08)", border: "1px solid #2a1f15",
    borderRadius: "4px", padding: "1rem 1.2rem", position: "relative" as const,
    boxShadow: "0 4px 30px rgba(0,0,0,0.8),inset 0 1px 0 rgba(139,0,0,0.2)",
  } satisfies CSSProperties,

  btn: (color = "#8b0000", disabled = false): CSSProperties => ({
    background: disabled ? "#1a1210" : `linear-gradient(180deg,${color}cc,${color}88)`,
    border: `1px solid ${disabled ? "#2a1f15" : color}`,
    color: disabled ? "#3a2f25" : "#c9b99a",
    padding: "0.45rem 1rem", cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: FONT, fontSize: "0.82rem", letterSpacing: "0.08em",
    borderRadius: "2px", transition: "all 0.15s", textTransform: "uppercase" as const,
  }),
};
