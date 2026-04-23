import { useState } from "react";
import { btnStyle } from "../styles";
import { useAppDispatch, useAppSelector } from "../store";
import { setCombatSystem, type CombatSystem } from "../store/settingsSlice";

export function TitleScreen({
  onStart,
  onContinue,
  onClearSave,
}: {
  onStart: () => void;
  onContinue?: () => void;
  onClearSave?: () => void;
}) {
  const dispatch = useAppDispatch();
  const combatSystem = useAppSelector((s) => s.settings.combatSystem);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);

  function pickCombatSystem(sys: CombatSystem) {
    dispatch(setCombatSystem(sys));
  }

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
        Crypt Stalkers
      </h1>
      <div className="text-crypt-dim tracking-[0.3em] text-sm mb-8 relative z-1">
        {"\u25C6"} THE SALT REMEMBERS YOUR NAME {"\u25C6"}
      </div>
      <div className="panel max-w-lg text-center relative z-1">
        <p className="text-base text-crypt-muted leading-relaxed mb-4">
          Four hundred years ago, your family lost a salt mine worth a barony. The order that bought
          it went silent. Whatever is down there
          {"\u2014"} the salt, the dead, the mine itself {"\u2014"} belongs to you.
        </p>
        <div className="text-sm text-crypt-dim mb-6 leading-loose text-left space-y-0.5">
          <div>
            {"\u{1F6E1}\uFE0F"} Your family{"'"}s crest still marks the entrance
          </div>
          <div>{"\u{1F480}"} The dead walk schedules older than memory</div>
          <div>
            {"\u2694\uFE0F"} Every weapon cuts differently. Every bone remembers how it broke
          </div>
          <div>{"\u{1FA99}"} Greed built this place. Greed is what keeps it going</div>
          <div>{"\u26CF\uFE0F"} The deeper you dig, the more it costs</div>
        </div>
        <div className="flex flex-col gap-3 items-center">
          <div className="w-full">
            <div className="text-xs uppercase tracking-[0.2em] text-crypt-dim mb-1.5 text-center">
              Combat System
            </div>
            <div className="flex gap-2 w-full">
              <button
                style={btnStyle(combatSystem === "card" ? "#6e5a2a" : "#3a3a3a")}
                className="text-sm! flex-1 px-3! py-2! tracking-[0.1em]"
                onClick={() => pickCombatSystem("card")}
                title="Card Quest-style: deck, stamina, distance"
              >
                {"\u{1F0CF}"} Cards
              </button>
              <button
                style={btnStyle(combatSystem === "grid" ? "#6e5a2a" : "#3a3a3a")}
                className="text-sm! flex-1 px-3! py-2! tracking-[0.1em]"
                onClick={() => pickCombatSystem("grid")}
                title="Into-the-Breach-style: tactical grid, AP, terrain"
              >
                {"▦"} Grid
              </button>
            </div>
            <div className="text-xs text-crypt-dim text-center mt-1.5 italic">
              {combatSystem === "card"
                ? "Draw cards, manage stamina, read telegraphs."
                : "Tactical grid with AP, terrain, and timeline insertion."}
            </div>
          </div>
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
