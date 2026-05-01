/** Tiny mulberry32 PRNG for deterministic dice rolling in tests.
 * Returns a [next, value] pair; value is a uint32. */
export function nextRng(seed: number): { readonly seed: number; readonly value: number } {
  let t = (seed + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { seed: t >>> 0, value: (t ^ (t >>> 14)) >>> 0 };
}

/** Roll a fair d6 face index in [0, 5] using the seeded RNG. */
export function rollD6(seed: number): { readonly seed: number; readonly face: number } {
  const r = nextRng(seed);
  return { seed: r.seed, face: r.value % 6 };
}
