import { useState, useCallback, createContext, useContext, type ReactNode } from "react";
import { motion } from "framer-motion";

const ScreenShakeContext = createContext<() => void>(() => {});
export const useScreenShake = () => useContext(ScreenShakeContext);

interface ScreenShakeProps {
  children: ReactNode;
}

export function ScreenShake({ children }: ScreenShakeProps) {
  const [isShaking, setIsShaking] = useState(false);

  const trigger = useCallback(() => {
    // Reset to idle first so re-triggering mid-shake restarts the animation
    setIsShaking(false);
    requestAnimationFrame(() => setIsShaking(true));
  }, []);

  return (
    <ScreenShakeContext.Provider value={trigger}>
      <motion.div
        animate={isShaking ? { x: [0, -3, 3, -2, 2, 0], y: [0, 2, -2, 1, -1, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
        onAnimationComplete={() => setIsShaking(false)}
      >
        {children}
      </motion.div>
    </ScreenShakeContext.Provider>
  );
}
