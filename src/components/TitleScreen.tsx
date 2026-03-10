import { useState } from "react";
import { btnStyle } from "../styles";

export function TitleScreen({
  onStart,
  onContinue,
  onClearSave,
}: {
  onStart: () => void;
  onContinue?: () => void;
  onClearSave?: () => void;
}) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);

  function handleClear() {
    onClearSave?.();
    setShowClearConfirm(false);
    setCleared(true);
  }

  const hasSave = !!onContinue && !cleared;

  return (
    <div className="min-h-screen bg-crypt-bg text-crypt-text font-serif flex flex-col items-center justify-center relative overflow-hidden p-4">
      <div className="vignette" />
      <h1
        className="text-[clamp(2.5rem,6vw,4rem)] tracking-[0.2em] uppercase text-crypt-red-glow font-bold relative z-1 mb-1"
        style={{ textShadow: "0 0 30px #8b0000, 0 0 60px #4a0000" }}
      >
        Crypt Crawler
      </h1>
      <div className="text-crypt-dim tracking-[0.3em] text-sm mb-8 relative z-1">
        {"\u25C6"} A DUNGEON OF DARKNESS {"\u25C6"}
      </div>
      <div className="panel max-w-lg text-center relative z-1">
        <p className="text-base text-crypt-muted leading-relaxed mb-4">
          A branching dungeon awaits. Choose your path.
          <br />
          Equip weapons, buy supplies, unlock abilities.
          <br />
          <em className="text-crypt-dim">Every monster is a puzzle. Learn or perish.</em>
        </p>
        <div className="text-sm text-crypt-dim mb-6 leading-loose text-left space-y-0.5">
          <div>{"\u{1F3F0}"} Visit the town to prepare for your descent</div>
          <div>{"\u2694\uFE0F"} Choose your weapon and fight strategically</div>
          <div>
            {"\u{1F5FA}"} Explore the dungeon map {"\u2014"} scout and set traps
          </div>
          <div>{"\u{1FAA4}"} Front and back row positioning matters</div>
          <div>{"\u{1F56F}"} Rest anywhere in the dungeon to recover HP</div>
          <div>{"\u2620"} Defeat the Lich King to conquer the crypt</div>
        </div>
        <div className="flex flex-col gap-3 items-center">
          {hasSave && (
            <button
              style={btnStyle("#2a6e2a")}
              className="text-lg! px-8! py-3! tracking-[0.2em] w-full"
              onClick={onContinue}
            >
              Continue
            </button>
          )}
          <button
            style={btnStyle("#8b0000")}
            className="text-lg! px-8! py-3! tracking-[0.2em] w-full"
            onClick={onStart}
          >
            {hasSave ? "New Game" : "Begin Your Journey"}
          </button>
          {hasSave && !showClearConfirm && (
            <button
              style={btnStyle("#3a3a3a")}
              className="text-sm! px-4! py-2! tracking-[0.1em] opacity-70 hover:opacity-100"
              onClick={() => setShowClearConfirm(true)}
            >
              Clear Save Data
            </button>
          )}
          {showClearConfirm && (
            <div className="border border-[#8b0000] rounded p-3 mt-1 bg-[#1a0a0a]">
              <p className="text-crypt-muted text-sm mb-3">
                Are you sure? This will permanently delete all saved progress.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  style={btnStyle("#8b0000")}
                  className="text-sm! px-4! py-1.5!"
                  onClick={handleClear}
                >
                  Yes, Delete
                </button>
                <button
                  style={btnStyle("#3a3a3a")}
                  className="text-sm! px-4! py-1.5!"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
