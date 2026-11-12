/**
 * @file Time: easing curves, the progress of a moment between two times, and numbers that look random but are the
 * same on every run.
 */

export const clamp01 = (value) => Math.max(0, Math.min(1, value));

/** A number between two numbers. */
export const lerp = (from, to, amount) => from + (to - from) * amount;

/**
 * How far a moment is between two times.
 * @param t The time.
 * @param start When it starts.
 * @param end When it ends.
 * @returns 0 before the start, 1 after the end, and the share of the way between them.
 */
export const span = (t, start, end) => clamp01((t - start) / (end - start));

/**
 * A CSS `cubic-bezier` timing function.
 * @param x1 The x of the first control point.
 * @param y1 Its y.
 * @param x2 The x of the second control point.
 * @param y2 Its y.
 * @returns The function from the share of the time to the share of the way.
 */
export function cubicBezier(x1, y1, x2, y2) {
  const curve = (a, b, u) => 3 * a * u * (1 - u) ** 2 + 3 * b * u ** 2 * (1 - u) + u ** 3;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let low = 0;
    let high = 1;
    for (let step = 0; step < 24; step++) {
      const mid = (low + high) / 2;
      if (curve(x1, x2, mid) < x) low = mid;
      else high = mid;
    }
    return curve(y1, y2, (low + high) / 2);
  };
}

/** The curve of the pixels of the site as they fly in to their places. */
export const arrive = cubicBezier(0.2, 0.9, 0.25, 1);
/** A calm start and a calm end. */
export const glide = cubicBezier(0.45, 0, 0.2, 1);
/** A smooth step from 0 to 1. */
export const smooth = (x) => {
  const k = clamp01(x);
  return k * k * (3 - 2 * k);
};

/**
 * A source of numbers in [0, 1) that gives the same numbers for the same seed.
 * @param seed A whole number.
 * @returns The source.
 */
export function random(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** A number in [0, 1) of two whole numbers and a salt: the same on every run. */
export function noise(x, y, salt = 0) {
  let hash = Math.imul(x + 1, 0x27d4eb2d) ^ Math.imul(y + 1, 0x165667b1) ^ Math.imul(salt + 1, 0x9e3779b9);
  hash = Math.imul(hash ^ (hash >>> 15), 0x85ebca6b);
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
}
