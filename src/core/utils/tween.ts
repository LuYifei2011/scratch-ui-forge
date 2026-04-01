/**
 * Tween / easing utilities for animation frame generation.
 */

/**
 * Evaluate CSS cubic-bezier(x1, y1, x2, y2) at normalized time t ∈ [0, 1].
 * Anchor points are P0=(0,0) and P3=(1,1).
 * Uses Newton's method to find the curve parameter s where Bx(s)=t, then returns By(s).
 */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t: number
): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  const ax = 3 * x1 - 3 * x2 + 1;
  const bx = 3 * x2 - 6 * x1;
  const cx = 3 * x1;

  const ay = 3 * y1 - 3 * y2 + 1;
  const by = 3 * y2 - 6 * y1;
  const cy = 3 * y1;

  const sampleX = (s: number) => ((ax * s + bx) * s + cx) * s;
  const sampleY = (s: number) => ((ay * s + by) * s + cy) * s;
  const derivX = (s: number) => (3 * ax * s + 2 * bx) * s + cx;

  // Newton's method
  let s = t;
  for (let i = 0; i < 8; i++) {
    const dx = sampleX(s) - t;
    if (Math.abs(dx) < 1e-7) break;
    const d = derivX(s);
    if (Math.abs(d) < 1e-6) break;
    s -= dx / d;
  }

  return sampleY(s);
}

/**
 * easyEase: cubic-bezier(0.33, 0, 0.67, 1)
 * Smooth acceleration and deceleration with equal ease-in and ease-out.
 */
export function easyEase(t: number): number {
  return cubicBezier(0.33, 0, 0.67, 1, t);
}

/**
 * Generate normalized time values (0–1) for each frame of an animation.
 * @param fps   Frames per second (e.g. 30)
 * @param durationMs  Animation duration in milliseconds (e.g. 200)
 * @returns Array of t values in [0, 1], inclusive of both endpoints.
 */
export function generateFrameTimes(fps: number, durationMs: number): number[] {
  const totalFrames = Math.round((durationMs / 1000) * fps);
  const times: number[] = [];
  for (let i = 0; i <= totalFrames; i++) {
    times.push(totalFrames === 0 ? 0 : i / totalFrames);
  }
  return times;
}

/** Linearly interpolate between two numbers. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
