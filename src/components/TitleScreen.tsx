import { S } from "../styles";

export function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ ...S.root, justifyContent: "center", gap: "1.5rem" }}>
      <div style={S.vignette} />
      <div style={S.title}>Crypt Crawler</div>
      <div style={S.subtitle}>{"\u25C6"} A CARD GAME OF DARKNESS {"\u25C6"}</div>
      <div style={{ ...S.panel, maxWidth: "400px", zIndex: 1, textAlign: "center" }}>
        <p style={{ fontSize: "0.8rem", color: "#5a4a3a", lineHeight: 1.8, marginBottom: "1rem" }}>
          A branching dungeon awaits. Choose your path.<br />
          Scout, set traps, rest {"\u2014"} or charge headlong into the dark.<br />
          <em style={{ color: "#3a2a1a" }}>Every monster is a puzzle. Learn or perish.</em>
        </p>
        <div style={{ fontSize: "0.65rem", color: "#3a2a1a", marginBottom: "1.2rem", lineHeight: 1.8, textAlign: "left" }}>
          {"\u{1F5FA}"} Explore the node map freely {"\u2014"} plan your route<br />
          {"\u{1F50D}"} Scout rooms before entering (listen / peek)<br />
          {"\u{1FAA4}"} Set traps to weaken enemies before combat<br />
          {"\u{1F6A7}"} Block doors to prevent roaming<br />
          {"\u{1F56F}"} Find rest rooms to recover HP<br />
          {"\u{1F4B0}"} Spend gold at the merchant for cards & items
        </div>
        <button style={{ ...S.btn("#8b0000"), fontSize: "1rem", padding: "0.7rem 2rem", letterSpacing: "0.2em" }} onClick={onStart}>
          Enter the Crypt
        </button>
      </div>
    </div>
  );
}
