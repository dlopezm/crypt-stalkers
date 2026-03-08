import { btnStyle } from "../styles";
import type { Player } from "../types";

export function RestScreen({ player, onRest, onLeave }: {
  player: Player;
  onRest: (healAmt: number) => void;
  onLeave: () => void;
}) {
  const heal = Math.floor(player.maxHp * 0.3);
  return (
    <div className="min-h-screen bg-crypt-bg text-crypt-text font-serif flex flex-col items-center justify-center gap-5 relative overflow-hidden p-4">
      <div className="vignette" />
      <div className="text-5xl relative z-1">{"\u{1F56F}"}</div>
      <h1 className="text-2xl tracking-[0.2em] uppercase text-crypt-red-glow font-bold relative z-1"
        style={{ textShadow: "0 0 30px #8b0000, 0 0 60px #4a0000" }}>
        A moment of stillness
      </h1>
      <div className="panel max-w-sm text-center relative z-1">
        <p className="text-base text-crypt-muted leading-relaxed mb-4">
          The dust settles. No eyes watch from the dark.<br />
          You allow yourself to breathe.
        </p>
        <div className="text-crypt-text text-base mb-5">
          HP: {player.hp}/{player.maxHp}
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          <button style={btnStyle("#27ae60")} onClick={() => onRest(heal)}>
            {"\u{1FA79}"} Rest (+{heal} HP)
          </button>
          <button style={btnStyle("#3a2f25")} onClick={onLeave}>
            Keep moving
          </button>
        </div>
      </div>
    </div>
  );
}
