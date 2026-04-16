export function PhaseHeader({ phase, turn }: { readonly phase: string; readonly turn: number }) {
  const label =
    phase === "telegraph"
      ? "TELEGRAPH"
      : phase === "planning"
        ? "PLAN YOUR TURN"
        : phase === "execution"
          ? "EXECUTING..."
          : phase === "victory"
            ? "VICTORY"
            : phase === "defeat"
              ? "DEFEAT"
              : phase.toUpperCase();

  const color =
    phase === "planning"
      ? "#5dade2"
      : phase === "execution"
        ? "#f0c040"
        : phase === "victory"
          ? "#3ddc84"
          : phase === "defeat"
            ? "#c41c1c"
            : "#a89878";

  return (
    <div
      className="flex items-center gap-4 px-5 py-3 w-full border-b border-crypt-border"
      style={{ background: "#161210" }}
    >
      <span className="text-sm uppercase tracking-widest font-bold" style={{ color }}>
        {label}
      </span>
      <span className="text-sm text-crypt-dim">Turn {turn}</span>
    </div>
  );
}
