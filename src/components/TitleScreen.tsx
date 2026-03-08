import { btnStyle } from "../styles";

export function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-crypt-bg text-crypt-text font-serif flex flex-col items-center justify-center relative overflow-hidden p-4">
      <div className="vignette" />
      <h1 className="text-[clamp(2.5rem,6vw,4rem)] tracking-[0.2em] uppercase text-crypt-red-glow font-bold relative z-1 mb-1"
        style={{ textShadow: "0 0 30px #8b0000, 0 0 60px #4a0000" }}>
        Crypt Crawler
      </h1>
      <div className="text-crypt-dim tracking-[0.3em] text-sm mb-8 relative z-1">
        {"\u25C6"} A CARD GAME OF DARKNESS {"\u25C6"}
      </div>
      <div className="panel max-w-lg text-center relative z-1">
        <p className="text-base text-crypt-muted leading-relaxed mb-4">
          A branching dungeon awaits. Choose your path.<br />
          Scout, set traps, rest {"\u2014"} or charge headlong into the dark.<br />
          <em className="text-crypt-dim">Every monster is a puzzle. Learn or perish.</em>
        </p>
        <div className="text-sm text-crypt-dim mb-6 leading-loose text-left space-y-0.5">
          <div>{"\u{1F5FA}"} Explore the node map freely {"\u2014"} plan your route</div>
          <div>{"\u{1F50D}"} Scout rooms before entering (listen / peek)</div>
          <div>{"\u{1FAA4}"} Set traps to weaken enemies before combat</div>
          <div>{"\u{1F6A7}"} Block doors to prevent roaming</div>
          <div>{"\u{1F56F}"} Find rest rooms to recover HP</div>
          <div>{"\u{1F4B0}"} Spend gold at the merchant for cards & items</div>
        </div>
        <button style={btnStyle("#8b0000")} className="text-lg! px-8! py-3! tracking-[0.2em]" onClick={onStart}>
          Enter the Crypt
        </button>
      </div>
    </div>
  );
}
