import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { INTRO_SLIDES } from "../data/intro";
import { btnStyle } from "../styles";

export function IntroScreen({ onFinish }: { readonly onFinish: () => void }) {
  const [index, setIndex] = useState(0);
  const slide = INTRO_SLIDES[index];
  const isLast = index === INTRO_SLIDES.length - 1;

  function advance() {
    if (isLast) {
      onFinish();
    } else {
      setIndex(index + 1);
    }
  }

  return (
    <div
      className="min-h-screen bg-crypt-bg text-crypt-text font-serif flex flex-col items-center justify-center relative overflow-hidden p-4 cursor-pointer select-none"
      onClick={advance}
    >
      <div className="vignette" />

      <div className="relative z-1 max-w-lg w-full flex flex-col items-center gap-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="text-crypt-muted text-lg leading-relaxed text-center"
          >
            {slide.text}
          </motion.p>
        </AnimatePresence>

        <div className="flex items-center gap-4">
          {INTRO_SLIDES.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                i === index ? "bg-crypt-muted" : "bg-crypt-border"
              }`}
            />
          ))}
        </div>

        <motion.div
          key={`btn-${isLast}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <button
            style={btnStyle(isLast ? "#8b0000" : "#3a3a3a")}
            className="text-sm! px-6! py-2! tracking-[0.15em]"
            onClick={(e) => {
              e.stopPropagation();
              advance();
            }}
          >
            {isLast ? "Enter the Mine" : "Continue"}
          </button>
        </motion.div>

        <div className="text-crypt-dim text-xs tracking-wider opacity-50">
          Click anywhere to continue
        </div>
      </div>
    </div>
  );
}
