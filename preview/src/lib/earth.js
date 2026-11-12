/**
 * @file The Earth seen from near: so large that a picture holds only its horizon, a line of ink over a flat body.
 * Its land is drawn in blocks, as the continents of the small Earth of the flight plan are, and lights are lit on it:
 * each light is a person.
 */
import { random } from './motion.js';
import { sample } from './shape.js';

/**
 * Makes the part of the Earth a picture shows.
 * @param options `columns` and `rows` (the grid of the picture, in pixels of the Earth), `top` (the row its horizon
 * reaches in the middle column), `radius` (in pixels of the Earth), `outline` (how many pixels thick the line of the
 * horizon is), `block` (the side of a block of land), `land` (for each mass the column of its middle, how deep under
 * the horizon its middle is, and its two radii), `lights` (how many lights to try to place, how deep under the horizon
 * the first may be and over how many rows they spread) and `seed`.
 * @returns `cells` (for each pixel of the Earth its column `c`, its row `r` and `kind`: `horizon`, `land` or `sea`),
 * `lights` (for each its column, its row, its `size` in pixels and whether it is `lit` in the accent), `horizon(c)`
 * (the row of the horizon in a column), `onHorizon(c, r)` (whether a pixel is on the line of the horizon) and `next`
 * (the source of numbers the lights were placed with, to place more things the same way on every run).
 */
export function createEarth({ columns, rows, top, radius, outline, block, land, lights, seed }) {
  const middle = columns / 2;
  const horizon = (c) => top + radius - Math.sqrt(radius ** 2 - (c - middle) ** 2);
  const isLand = (c, r) => {
    const bc = Math.floor(c / block) * block + block / 2;
    const depth = Math.floor(r / block) * block + block / 2 - horizon(bc);
    return depth > land.under && land.masses.some(([at, deep, across, down]) => ((bc - at) / across) ** 2 + ((depth - deep - land.under - 1) / down) ** 2 <= 1);
  };
  const cells = sample((c, r) => Math.hypot(c - middle, r - top - radius) <= radius, { columns, rows, outline }).map(
    ({ c, r, edge }) => ({ c, r, kind: edge ? 'horizon' : isLand(c, r) ? 'land' : 'sea' }),
  );
  const line = new Set(cells.filter((cell) => cell.kind === 'horizon').map((cell) => cell.r * columns + cell.c));

  const next = random(seed);
  const placed = Array.from({ length: lights.count }, () => {
    const c = lights.margin + Math.floor(next() * (columns - 2 * lights.margin));
    const r = Math.floor(horizon(c) + lights.under + next() * lights.spread);
    return { c, r, size: next() < 0.3 ? 2 : 1, lit: next() < 0.55 };
  }).filter((light) => light.r < rows - 1);

  return { cells, lights: placed, horizon, onHorizon: (c, r) => line.has(r * columns + c), next };
}
