export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * Turns 0→1 scroll progress into step motion for a pinned "journey".
 * Each step holds still for `hold` of its share, then travels to the next one.
 *   i: current step, e: eased travel 0→1 to step i+1, a: i + e (where the object is now)
 */
export function stepState(t: number, count: number, tail = 0.5, hold = 0.3) {
  const u = Math.min(count - 1, clamp01(t) * (count - 1 + tail))
  const i = Math.min(count - 2, Math.floor(u))
  const e = easeInOut(clamp01((u - i - hold) / (1 - hold)))
  return { i, e, a: i + e }
}

/** Scroll progress (0→1) that lands on step k while it is holding still. */
export const stepTarget = (k: number, count: number, tail = 0.5) => Math.min(1, (k + 0.15) / (count - 1 + tail))
