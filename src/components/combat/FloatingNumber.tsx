import { motion } from "framer-motion";

type FloatingStyle = "damage" | "heal" | "block" | "status" | "miss" | "label";

interface FloatingNumberProps {
  value: number | string;
  color?: string;
  style?: FloatingStyle;
  onComplete?: () => void;
}

const styleConfig: Record<
  FloatingStyle,
  {
    fontSize: string;
    fontWeight: string;
    travel: number;
    duration: number;
    scale: [number, number];
    glow: string;
  }
> = {
  damage: {
    fontSize: "1.75rem",
    fontWeight: "900",
    travel: -48,
    duration: 1.08,
    scale: [1.3, 0.8],
    glow: "0 0 12px rgba(255,60,60,0.7), 0 0 4px rgba(255,60,60,0.9)",
  },
  heal: {
    fontSize: "1.5rem",
    fontWeight: "800",
    travel: -40,
    duration: 1.02,
    scale: [1.2, 0.9],
    glow: "0 0 10px rgba(61,220,132,0.6), 0 0 4px rgba(61,220,132,0.8)",
  },
  block: {
    fontSize: "1.25rem",
    fontWeight: "700",
    travel: -32,
    duration: 0.9,
    scale: [1.1, 0.9],
    glow: "0 0 8px rgba(93,173,226,0.6), 0 0 3px rgba(93,173,226,0.8)",
  },
  status: {
    fontSize: "1.5rem",
    fontWeight: "700",
    travel: -36,
    duration: 0.96,
    scale: [1.4, 1.0],
    glow: "0 0 8px currentColor",
  },
  miss: {
    fontSize: "1.25rem",
    fontWeight: "700",
    travel: -28,
    duration: 0.84,
    scale: [1.0, 0.8],
    glow: "0 0 6px rgba(136,153,170,0.5)",
  },
  label: {
    fontSize: "1rem",
    fontWeight: "600",
    travel: -24,
    duration: 0.84,
    scale: [1.0, 0.9],
    glow: "none",
  },
};

export function FloatingNumber({
  value,
  color = "#c41c1c",
  style = "damage",
  onComplete,
}: FloatingNumberProps) {
  const cfg = styleConfig[style];

  const displayValue =
    typeof value === "number" ? (value > 0 ? `-${value}` : `+${Math.abs(value)}`) : value;

  return (
    <motion.div
      className="absolute pointer-events-none z-50 whitespace-nowrap"
      style={{
        color,
        fontSize: cfg.fontSize,
        fontWeight: cfg.fontWeight,
        fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
        textShadow: `0 2px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.7), ${cfg.glow}`,
        left: "50%",
        top: "50%",
        transform: "translateX(-50%)",
        letterSpacing: "0.02em",
      }}
      initial={{ opacity: 1, y: 0, scale: cfg.scale[0] }}
      animate={{ opacity: 0, y: cfg.travel, scale: cfg.scale[1] }}
      transition={{ duration: cfg.duration, ease: [0.25, 0.1, 0.25, 1] }}
      onAnimationComplete={onComplete}
    >
      {displayValue}
    </motion.div>
  );
}
