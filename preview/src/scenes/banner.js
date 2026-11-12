/**
 * @file The banner, 1376 × 462: the horizon. The Earth rises along the bottom, so large that the picture holds only
 * its horizon. Lights are lit on it, each a person; from thirteen of them a dotted path rises, and all the paths meet
 * at the TUWA logo. Craft fly along three of the paths, which are lit behind them. From everywhere, to one place.
 *
 * Laid out in units of 2px on a grid of 688 × 231; the Earth and the craft are made of pixels of 4px.
 */
import { SHIP_UP } from '../lib/art.js';
import { createEarth } from '../lib/earth.js';
import { drawLogo, layoutLogo } from '../lib/logo.js';
import { lerp } from '../lib/motion.js';
import { C, createPainter } from '../lib/paint.js';
import { createStars, drawStars } from '../lib/stars.js';

/** The grid of the banner in units. */
export const BANNER = { width: 688, height: 231 };
const W = BANNER.width;
const H = BANNER.height;

/** The side of a pixel of the Earth and of a craft, in units, and the grid of those pixels over the banner. */
const CELL = 2;
const COLUMNS = W / CELL;
const ROWS = Math.ceil(H / CELL);
/**
 * The Earth, in its pixels: the row its horizon reaches in the middle, its radius, the line of its horizon, its land
 * (masses of blocks, the first of them a few pixels under the horizon) and its lights.
 */
const EARTH = {
  columns: COLUMNS,
  rows: ROWS,
  top: 80,
  radius: 372,
  outline: 2,
  block: 4,
  land: {
    under: 5,
    masses: [
      [36, 8, 30, 9],
      [92, 14, 22, 8],
      [150, 6, 34, 7],
      [176, 22, 20, 9],
      [228, 10, 30, 8],
      [292, 12, 26, 10],
      [322, 2, 14, 5],
    ],
  },
  lights: { count: 46, margin: 8, under: 7, spread: 26 },
  seed: 5,
};

/** The logo: the distance between two of its pixels, and its top. */
const LOGO_PITCH = 5;
const LOGO_TOP = 15;
/** How far outside the logo the paths end, and what share of its height they may end beside. */
const LOGO_GAP = 7;
const LOGO_SIDE = 0.42;

/** How many paths rise to the logo, and how far apart the dots of a path are. */
const PATHS = 13;
const DOT_STEP = 5;
/** The paths with a craft, by their place from the left, and how far along its path each craft is. */
const CRAFT = new Map([
  [3, 0.36],
  [6, 0.6],
  [9, 0.44],
]);
/** What share of a path, either side of its craft, has no dots. */
const CRAFT_CLEAR = 0.06;

/**
 * Makes the banner.
 * @param assets `logo`: the logo as its pixels (`parseLogo`).
 * @returns `draw(ctx, scale)`, which draws the banner on a canvas of 688 × 231 units.
 */
export function createBanner({ logo }) {
  const stars = createStars({ x: 0, y: 0, w: W, h: H, count: 120, seed: 11 });

  // The Earth with the people on it, and the thirteen of them the paths start from, across the whole horizon. The
  // same on every run
  const earth = createEarth(EARTH);
  const origins = Array.from({ length: PATHS }, (_, index) => {
    const c = Math.round(lerp(20, COLUMNS - 20, index / (PATHS - 1)) + (earth.next() - 0.5) * 8);
    return { c, r: Math.round(earth.horizon(c) + 6 + earth.next() * 5) };
  });

  const draw = (ctx, scale) => {
    const p = createPainter(ctx, scale);
    p.rect(0, 0, W, H, C.paper);
    drawStars(p, stars, { dust: scale });
    p.scanlines(0, 0, W, H);

    const pitch = LOGO_PITCH * scale;
    const size = layoutLogo(logo, 0, 0, pitch);
    const placed = layoutLogo(logo, p.px(W / 2) - Math.round(size.width / 2), p.px(LOGO_TOP), pitch);
    const box = { x: W / 2 - size.width / scale / 2, y: LOGO_TOP, w: size.width / scale, h: size.height / scale };

    // The Earth: its horizon a line of ink, flat inside, its land a shade lighter, and the lights on it
    const tones = { horizon: C.text, land: C.sunken, sea: C.raised };
    for (const { c, r, kind } of earth.cells) p.rect(c * CELL, r * CELL, CELL, CELL, tones[kind]);
    for (const light of earth.lights) {
      p.rect(light.c * CELL, light.r * CELL, light.size * CELL, light.size * CELL, light.lit ? C.lit : C.textSecondary);
    }

    // Where a path ends: the paths end round the lower half of the logo, in the order they start in, so no two cross
    const side = box.h * LOGO_SIDE;
    const around = 2 * side + box.w + 2 * LOGO_GAP;
    const end = (share) => {
      const along = share * around;
      if (along < side) return [box.x - LOGO_GAP, box.y + box.h - side + along];
      if (along > around - side) return [box.x + box.w + LOGO_GAP, box.y + box.h - (around - along)];
      return [box.x - LOGO_GAP + (along - side), box.y + box.h + LOGO_GAP];
    };

    origins.forEach((origin, index) => {
      const from = [(origin.c + 0.5) * CELL, (origin.r + 0.5) * CELL];
      const to = end(index / (PATHS - 1));
      // A path leaves the Earth upwards and bends towards the logo
      const bend = [lerp(from[0], to[0], 0.22), lerp(from[1], to[1], 0.82)];
      const at = (k) => [
        (1 - k) ** 2 * from[0] + 2 * k * (1 - k) * bend[0] + k ** 2 * to[0],
        (1 - k) ** 2 * from[1] + 2 * k * (1 - k) * bend[1] + k ** 2 * to[1],
      ];

      // Its dots, a fixed way apart along the curve: lit behind a craft, and none on the line of the horizon
      const craft = CRAFT.get(index) ?? -1;
      let walked = 0;
      let last = at(0);
      let due = DOT_STEP + 1;
      for (let step = 1; step <= 600; step++) {
        const k = step / 600;
        const point = at(k);
        walked += Math.hypot(point[0] - last[0], point[1] - last[1]);
        last = point;
        if (walked < due) continue;
        due += DOT_STEP;
        const x = Math.round(point[0] - 0.5);
        const y = Math.round(point[1] - 0.5);
        if (Math.abs(k - craft) < CRAFT_CLEAR || earth.onHorizon(Math.floor(x / CELL), Math.floor(y / CELL))) continue;
        p.rect(x, y, 1.5, 1.5, k < craft ? C.lit : C.textSecondary);
      }

      // The person the path starts from, and its end at the logo: a small square, as the ends of the lines inside
      // the logo
      p.rect((origin.c - 0.5) * CELL, (origin.r - 0.5) * CELL, 2 * CELL, 2 * CELL, C.lit);
      p.rect(Math.round(to[0]) - 1.5, Math.round(to[1]) - 1.5, 3, 3, C.text);

      if (craft > 0) {
        // The craft, nose up, its middle on the path: its hull in ink, its cockpit and its flames lit
        const [x, y] = at(craft);
        const half = (SHIP_UP[0].length * CELL) / 2;
        const left = Math.round((x - half) / CELL) * CELL;
        const top = Math.round((y - half) / CELL) * CELL;
        p.art(SHIP_UP, left, top, CELL, (mark) => ({ colour: mark === '#' ? C.text : C.lit, alpha: mark === 'b' ? 0.5 : 1 }));
      }
    });

    drawLogo(ctx, placed, 1, 3 * scale);
  };

  return { draw };
}
