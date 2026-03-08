import { S } from "../styles";
import type { Player } from "../types";

export function RestScreen({ player, onRest, onLeave }: {
  player: Player;
  onRest: (healAmt: number) => void;
  onLeave: () => void;
}) {
  const heal = Math.floor(player.maxHp * 0.3);
  return (
    <div style={{ ...S.root, justifyContent: "center", gap: "1.2rem" }}>
      <div style={S.vignette} />
      <div style={{ fontSize: "2.5rem", zIndex: 1 }}>{"\u{1F56F}"}</div>
      <div style={{ ...S.title, fontSize: "1.5rem" }}>A moment of stillness</div>
      <div style={{ ...S.panel, maxWidth: "360px", textAlign: "center", zIndex: 1 }}>
        <p style={{ fontSize: "0.8rem", color: "#5a4a3a", lineHeight: 1.7, marginBottom: "1rem" }}>
          The dust settles. No eyes watch from the dark.<br />
          You allow yourself to breathe.
        </p>
        <div style={{ color: "#c9b99a", fontSize: "0.8rem", marginBottom: "1.2rem" }}>
          HP: {player.hp}/{player.maxHp}
        </div>
        <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button style={S.btn("#27ae60")} onClick={() => onRest(heal)}>
            {"\u{1FA79}"} Rest (+{heal} HP)
          </button>
          <button style={S.btn("#3a2f25")} onClick={onLeave}>
            Keep moving
          </button>
        </div>
      </div>
    </div>
  );
}
