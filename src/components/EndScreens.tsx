import { useState } from "react";
import { btnStyle } from "../styles";
import type { Ending } from "../data/endings";

export function VictoryScreen({
  ending,
  onReturn,
}: {
  readonly ending: Ending;
  readonly onReturn: () => void;
}) {
  const [slideIdx, setSlideIdx] = useState(0);
  const isLast = slideIdx >= ending.slides.length - 1;

  return (
    <div className="min-h-screen bg-crypt-bg text-crypt-text font-serif flex flex-col items-center justify-center gap-6 relative overflow-hidden p-4">
      <div className="vignette" />

      {slideIdx === 0 && (
        <>
          <div className="text-6xl relative z-1">{"\u{1F451}"}</div>
          <h1
            className="text-3xl tracking-[0.2em] uppercase text-crypt-gold font-bold relative z-1"
            style={{ textShadow: "0 0 30px #f0c040, 0 0 60px #8a6010" }}
          >
            {ending.title}
          </h1>
          <p className="text-crypt-muted italic text-lg relative z-1 max-w-md text-center">
            &ldquo;{ending.quote}&rdquo;
          </p>
        </>
      )}

      <div className="panel max-w-lg text-center relative z-1">
        <p className="text-crypt-muted text-base leading-relaxed mb-6">
          {ending.slides[slideIdx].text}
        </p>

        {isLast ? (
          <button style={btnStyle("#8b0000")} onClick={onReturn}>
            Return to Title
          </button>
        ) : (
          <button style={btnStyle("#3a2a14")} onClick={() => setSlideIdx(slideIdx + 1)}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

export function GameOverScreen({
  onRetryRoom,
  onRetryArea,
}: {
  readonly onRetryRoom?: () => void;
  readonly onRetryArea?: () => void;
}) {
  return (
    <div className="min-h-screen bg-crypt-bg text-crypt-text font-serif flex flex-col items-center justify-center gap-6 relative overflow-hidden p-4">
      <div className="vignette" />
      <div className="text-6xl relative z-1">{"\u{1F480}"}</div>
      <h1
        className="text-3xl tracking-[0.2em] uppercase text-crypt-red font-bold relative z-1"
        style={{ textShadow: "0 0 30px #8b0000, 0 0 60px #4a0000" }}
      >
        YOU HAVE FALLEN
      </h1>
      <div className="panel max-w-sm text-center relative z-1">
        <p className="text-crypt-muted text-base mb-4">The darkness claims another soul.</p>

        <div className="flex flex-col gap-2">
          {onRetryRoom && (
            <button style={btnStyle("#8b0000")} onClick={onRetryRoom}>
              Retry Room
            </button>
          )}

          {onRetryArea && (
            <button style={btnStyle("#3a2a14")} onClick={onRetryArea}>
              Restart Area
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
