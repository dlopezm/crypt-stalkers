import { S } from "../styles";

export function VictoryScreen({ gold, onRestart }: { gold: number; onRestart: () => void }) {
  return (
    <div style={{ ...S.root, justifyContent: "center", gap: "1.5rem" }}>
      <div style={S.vignette} />
      <div style={{ fontSize: "3rem", zIndex: 1 }}>{"\u{1F451}"}</div>
      <div style={{ ...S.title, color: "#f0c040" }}>VICTORY</div>
      <div style={{ ...S.panel, maxWidth: "320px", textAlign: "center", zIndex: 1 }}>
        <p style={{ color: "#5a4a3a", fontSize: "0.85rem", marginBottom: "1rem" }}>The Lich King is vanquished. The crypt falls silent.</p>
        <div style={{ color: "#f0c040", marginBottom: "1.5rem" }}>Gold: {gold} {"\u{1FA99}"}</div>
        <button style={S.btn("#8b0000")} onClick={onRestart}>Descend again</button>
      </div>
    </div>
  );
}

export function GameOverScreen({ gold, onRestart }: { gold: number; onRestart: () => void }) {
  return (
    <div style={{ ...S.root, justifyContent: "center", gap: "1.5rem" }}>
      <div style={S.vignette} />
      <div style={{ fontSize: "3rem", zIndex: 1 }}>{"\u{1F480}"}</div>
      <div style={{ ...S.title, color: "#8b0000" }}>YOU HAVE FALLEN</div>
      <div style={{ ...S.panel, maxWidth: "320px", textAlign: "center", zIndex: 1 }}>
        <p style={{ color: "#5a4a3a", fontSize: "0.85rem", marginBottom: "1rem" }}>The darkness claims another soul.</p>
        <div style={{ color: "#f0c040", marginBottom: "1.5rem" }}>Gold: {gold} {"\u{1FA99}"}</div>
        <button style={S.btn("#8b0000")} onClick={onRestart}>Try again</button>
      </div>
    </div>
  );
}
