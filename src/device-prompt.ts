/* Device prompt controller (mobile only).
 *
 * Two jobs, both surfaced through the #device-prompt overlay in index.html:
 *   1. Portrait  → ask the player to rotate to landscape (the game is designed
 *      for a wide viewport).
 *   2. Landscape → offer to enter fullscreen once, reclaiming the height the
 *      browser's URL/nav bar steals from the already-short landscape viewport.
 *
 * Constraints this works within:
 *   - The Fullscreen API can only be invoked from a user gesture, so we can
 *     only *offer* fullscreen (a tap), never force it on load.
 *   - iOS Safari has no Fullscreen API at all; there the fullscreen prompt is
 *     never shown (isFullscreenSupported() is false). iOS users get a
 *     chrome-free experience only via "Add to Home Screen" (PWA meta in
 *     index.html), which we detect and treat as already-fullscreen.
 *
 * Desktop is never touched: we gate everything on a coarse pointer.
 */

const DISMISS_KEY = "crypt-fullscreen-dismissed";

function isTouchDevice(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}

function isPortrait(): boolean {
  return window.matchMedia("(orientation: portrait)").matches;
}

function isFullscreenSupported(): boolean {
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
  };
  return (
    typeof el.requestFullscreen === "function" || typeof el.webkitRequestFullscreen === "function"
  );
}

/* True when the page is running without browser chrome: real fullscreen, or a
 * standalone (Added-to-Home-Screen) PWA on iOS/Android. */
function isChromeless(): boolean {
  if (document.fullscreenElement) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone) return true; // iOS home-screen web app
  return (
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

function requestFullscreen(): void {
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
  };
  const fn = el.requestFullscreen ?? el.webkitRequestFullscreen;
  if (!fn) return;
  // Fire-and-forget; a rejection (e.g. user-gesture lost) just means the
  // prompt stays and they can tap again.
  void Promise.resolve(fn.call(el)).catch(() => {});
}

export function initDevicePrompt(): void {
  const prompt = document.getElementById("device-prompt");
  if (!prompt) return;

  // Desktop: never show anything, and don't wire listeners.
  if (!isTouchDevice()) return;

  const enterBtn = document.getElementById("device-prompt-enter");
  const dismissBtn = document.getElementById("device-prompt-dismiss");

  let dismissed = false;
  try {
    dismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    /* sessionStorage unavailable — treat as not dismissed */
  }

  function setMode(mode: "rotate" | "fullscreen" | null): void {
    if (mode) {
      prompt!.setAttribute("data-mode", mode);
      prompt!.setAttribute("aria-hidden", "false");
    } else {
      prompt!.removeAttribute("data-mode");
      prompt!.setAttribute("aria-hidden", "true");
    }
  }

  function update(): void {
    if (isPortrait()) {
      setMode("rotate");
      return;
    }
    // Landscape. Offer fullscreen unless it's unavailable, already chromeless,
    // or the player opted out this session.
    if (!dismissed && isFullscreenSupported() && !isChromeless()) {
      setMode("fullscreen");
      return;
    }
    setMode(null);
  }

  enterBtn?.addEventListener("click", () => {
    requestFullscreen();
    // Hide immediately; fullscreenchange will re-run update() to confirm.
    setMode(null);
  });

  dismissBtn?.addEventListener("click", () => {
    dismissed = true;
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setMode(null);
  });

  // React to orientation changes, fullscreen enter/exit, and PWA display mode.
  const mqPortrait = window.matchMedia("(orientation: portrait)");
  mqPortrait.addEventListener("change", update);
  document.addEventListener("fullscreenchange", update);
  window.addEventListener("resize", update);

  update();
}
