import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import type { AnimationEvent } from "../../types";
import { FloatingNumber } from "./FloatingNumber";
import { useScreenShake } from "./ScreenShake";
import { STATUS_ICONS, STATUS_COLORS, STATUS_DESC } from "../../data/status";
import { animationDelay } from "../../combat/animTiming";

interface AnimationLayerProps {
  events: AnimationEvent[];
  /** Map enemy uid → DOMRect for positioning overlays */
  panelRefs: React.RefObject<Map<string, HTMLDivElement>>;
  /** Ref to the player panel */
  playerPanelRef: React.RefObject<HTMLDivElement | null>;
  /** Ref to the combat container for relative positioning */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

interface ActiveEffect {
  id: number;
  event: AnimationEvent;
  x: number;
  y: number;
}

export function AnimationLayer({
  events,
  panelRefs,
  playerPanelRef,
  containerRef,
}: AnimationLayerProps) {
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevEvents, setPrevEvents] = useState(events);
  const shake = useScreenShake();
  const effectCounterRef = useRef(0);

  const getRelativePos = useCallback(
    (uid: string): { x: number; y: number } | null => {
      const container = containerRef.current;
      if (!container) return null;
      const containerRect = container.getBoundingClientRect();

      if (uid === "player") {
        const el = playerPanelRef.current;
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        };
      }

      const panels = panelRefs.current;
      if (!panels) return null;
      const el = panels.get(uid);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top,
      };
    },
    [panelRefs, playerPanelRef, containerRef],
  );

  /** Resolve which uid to position on and what offset to use for a given event. */
  const getEventPlacement = useCallback(
    (event: AnimationEvent): { uid: string; dx: number; dy: number } | null => {
      switch (event.type) {
        case "damage_enemy":
          return { uid: event.targetUid, dx: 0, dy: -10 };
        case "damage_player":
        case "heal_player":
          return { uid: "player", dx: 0, dy: -10 };
        case "heal_enemy":
          return { uid: event.targetUid, dx: 0, dy: -10 };
        case "block":
          return { uid: event.targetUid, dx: 24, dy: 0 };
        case "status_apply":
          return { uid: event.targetUid, dx: 0, dy: -16 };
        case "phase":
          return { uid: event.targetUid, dx: 0, dy: -10 };
        default:
          return null;
      }
    },
    [],
  );

  const processEvent = useCallback(
    (event: AnimationEvent) => {
      if (event.type === "screen_shake") {
        shake();
        return;
      }

      const placement = getEventPlacement(event);
      if (!placement) return; // non-visual event (drain_light, lifesteal, etc.)

      const pos = getRelativePos(placement.uid);
      if (!pos) return;

      const id = ++effectCounterRef.current;
      setActiveEffects((prev) => [
        ...prev,
        { id, event, x: pos.x + placement.dx, y: pos.y + placement.dy },
      ]);
    },
    [getRelativePos, getEventPlacement, shake],
  );

  // Play events sequentially with timing
  useEffect(() => {
    if (events.length === 0 || currentIndex >= events.length) {
      return;
    }

    const event = events[currentIndex];
    processEvent(event);

    const timer = setTimeout(() => {
      setCurrentIndex((i) => i + 1);
    }, animationDelay(event));

    return () => clearTimeout(timer);
  }, [currentIndex, events, processEvent]);

  // Reset when events array identity changes (state-based to avoid ref access during render)
  if (prevEvents !== events) {
    setPrevEvents(events);
    setCurrentIndex(0);
    setActiveEffects([]);
  }

  const removeEffect = useCallback((id: number) => {
    setActiveEffects((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {activeEffects.map((effect) => (
          <EffectRenderer
            key={effect.id}
            effect={effect}
            onComplete={() => removeEffect(effect.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function EffectRenderer({ effect, onComplete }: { effect: ActiveEffect; onComplete: () => void }) {
  const { event, x, y } = effect;

  // For unrendered event types, complete via effect instead of side-effecting in render
  const isUnhandled =
    event.type !== "damage_enemy" &&
    event.type !== "damage_player" &&
    event.type !== "heal_player" &&
    event.type !== "heal_enemy" &&
    event.type !== "block" &&
    event.type !== "status_apply" &&
    event.type !== "phase";

  useEffect(() => {
    if (isUnhandled) onComplete();
  }, [isUnhandled, onComplete]);

  switch (event.type) {
    case "damage_enemy":
      return (
        <div className="absolute" style={{ left: x, top: y, transform: "translateX(-50%)" }}>
          <FloatingNumber
            value={event.amount}
            color={event.amount >= 10 ? "#ff2222" : "#ee4444"}
            style="damage"
            onComplete={onComplete}
          />
        </div>
      );
    case "damage_player":
      return (
        <div className="absolute" style={{ left: x, top: y, transform: "translateX(-50%)" }}>
          <FloatingNumber
            value={event.amount}
            color={event.amount >= 8 ? "#ff0000" : "#ff4444"}
            style="damage"
            onComplete={onComplete}
          />
        </div>
      );
    case "heal_player":
      return (
        <div className="absolute" style={{ left: x, top: y, transform: "translateX(-50%)" }}>
          <FloatingNumber
            value={`+${event.amount}`}
            color="#3ddc84"
            style="heal"
            onComplete={onComplete}
          />
        </div>
      );
    case "heal_enemy":
      return (
        <div className="absolute" style={{ left: x, top: y, transform: "translateX(-50%)" }}>
          <FloatingNumber
            value={`+${event.amount}`}
            color="#3ddc84"
            style="heal"
            onComplete={onComplete}
          />
        </div>
      );
    case "block":
      return (
        <div className="absolute" style={{ left: x, top: y, transform: "translateX(-50%)" }}>
          <FloatingNumber
            value={`\u{1F6E1} ${event.amount}`}
            color="#5dade2"
            style="block"
            onComplete={onComplete}
          />
        </div>
      );
    case "status_apply":
      return (
        <div className="absolute" style={{ left: x, top: y, transform: "translateX(-50%)" }}>
          <FloatingNumber
            value={`${STATUS_ICONS[event.status]} ${STATUS_DESC[event.status]}`}
            color={STATUS_COLORS[event.status]}
            style="status"
            onComplete={onComplete}
          />
        </div>
      );
    case "phase":
      return (
        <div className="absolute" style={{ left: x, top: y, transform: "translateX(-50%)" }}>
          <FloatingNumber
            value="\u{1F47B} Miss!"
            color="#8899aa"
            style="miss"
            onComplete={onComplete}
          />
        </div>
      );
    default:
      return null;
  }
}
