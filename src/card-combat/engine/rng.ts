export function nextRng(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (t ^ (t >>> 14)) >>> 0;
}

export function randomInt(seed: number, maxExclusive: number): { value: number; next: number } {
  const n = nextRng(seed);
  return { value: n % maxExclusive, next: n };
}

export function shuffle<T>(arr: readonly T[], seed: number): { result: T[]; next: number } {
  const result = arr.slice();
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    const step = randomInt(s, i + 1);
    s = step.next;
    const j = step.value;
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return { result, next: s };
}
