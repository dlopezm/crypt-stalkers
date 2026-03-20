import type { AnimationEvent } from "../types";

/** How long to wait after dispatching an animation event before moving to the next. */
export function animationDelay(event: AnimationEvent): number {
  switch (event.type) {
    case "screen_shake":
      return 60;
    case "turn_label":
      return 420;
    case "death":
      return 480;
    case "spawn":
      return 540;
    case "block":
      return 180;
    default:
      return 300;
  }
}
