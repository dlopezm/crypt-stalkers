import { useState } from "react";
import { motion } from "framer-motion";
import { getTarotSrc, TAROT_BACK } from "../../data/tarot";

interface TarotCardProps {
  enemyId: string;
  ascii: string;
  isBoss?: boolean;
  /** Whether to play the card-flip reveal animation on mount */
  flipReveal?: boolean;
}

export function TarotCard({ enemyId, ascii, isBoss, flipReveal }: TarotCardProps) {
  const src = getTarotSrc(enemyId);
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return <div className="text-center text-2xl mb-0.5">{ascii}</div>;
  }

  if (flipReveal) {
    return <FlipRevealCard src={src} backSrc={TAROT_BACK} isBoss={isBoss} />;
  }

  return (
    <div className="flex justify-center mb-0.5">
      <div
        className="relative overflow-hidden rounded"
        style={{
          width: isBoss ? 80 : 64,
          border: `2px solid ${isBoss ? "#c41c1c" : "#8a6010"}`,
          boxShadow: isBoss ? "0 0 12px rgba(196,28,28,0.4)" : "0 0 8px rgba(138,96,16,0.3)",
        }}
      >
        <img
          src={src}
          alt=""
          className="w-full h-auto block"
          onError={() => setImgError(true)}
          draggable={false}
        />
      </div>
    </div>
  );
}

function FlipRevealCard({
  src,
  backSrc,
  isBoss,
}: {
  src: string;
  backSrc: string;
  isBoss?: boolean;
}) {
  const width = isBoss ? 80 : 64;
  const borderColor = isBoss ? "#c41c1c" : "#8a6010";
  const shadow = isBoss ? "0 0 12px rgba(196,28,28,0.4)" : "0 0 8px rgba(138,96,16,0.3)";

  return (
    <div className="flex justify-center mb-0.5" style={{ perspective: 600 }}>
      <motion.div
        className="relative overflow-hidden rounded"
        style={{
          width,
          border: `2px solid ${borderColor}`,
          boxShadow: shadow,
          transformStyle: "preserve-3d",
        }}
        initial={{ rotateY: 180 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Front face — enemy card */}
        <div style={{ backfaceVisibility: "hidden" }}>
          <img src={src} alt="" className="w-full h-auto block" draggable={false} />
        </div>
        {/* Back face — card back */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <img src={backSrc} alt="" className="w-full h-auto block" draggable={false} />
        </div>
      </motion.div>
    </div>
  );
}
