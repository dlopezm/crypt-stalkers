import { btnStyle } from "../styles";

export function VictoryScreen({ gold, onReturn }: { gold: number; onReturn: () => void }) {
  return (
    <div className="min-h-screen bg-crypt-bg text-crypt-text font-serif flex flex-col items-center justify-center gap-6 relative overflow-hidden p-4">
      <div className="vignette" />
      <div className="text-6xl relative z-1">{"\u{1F451}"}</div>
      <h1 className="text-3xl tracking-[0.2em] uppercase text-crypt-gold font-bold relative z-1"
        style={{ textShadow: "0 0 30px #f0c040, 0 0 60px #8a6010" }}>
        VICTORY
      </h1>
      <div className="panel max-w-sm text-center relative z-1">
        <p className="text-crypt-muted text-base mb-4">The Lich King is vanquished. The crypt falls silent.</p>
        <div className="text-crypt-gold text-lg mb-6">Gold: {gold} {"\u{1FA99}"}</div>
        <button style={btnStyle("#8b0000")} onClick={onReturn}>Return to Town</button>
      </div>
    </div>
  );
}

export function GameOverScreen({ gold, onReturn }: { gold: number; onReturn: () => void }) {
  return (
    <div className="min-h-screen bg-crypt-bg text-crypt-text font-serif flex flex-col items-center justify-center gap-6 relative overflow-hidden p-4">
      <div className="vignette" />
      <div className="text-6xl relative z-1">{"\u{1F480}"}</div>
      <h1 className="text-3xl tracking-[0.2em] uppercase text-crypt-red font-bold relative z-1"
        style={{ textShadow: "0 0 30px #8b0000, 0 0 60px #4a0000" }}>
        YOU HAVE FALLEN
      </h1>
      <div className="panel max-w-sm text-center relative z-1">
        <p className="text-crypt-muted text-base mb-2">The darkness claims another soul.</p>
        <p className="text-crypt-dim text-sm mb-4">You lost 25% of your gold.</p>
        <div className="text-crypt-gold text-lg mb-6">Remaining Gold: {gold} {"\u{1FA99}"}</div>
        <button style={btnStyle("#8b0000")} onClick={onReturn}>Limp back to Town</button>
      </div>
    </div>
  );
}
