/**
 * @file A flat shape as a pixel picture. A shape is a rule that says whether a point is inside it; it is sampled on a
 * grid, one answer for each cell, so the picture is made of whole pixels of one size: the cells on the edge of the
 * shape are its outline, the rest its fill.
 */

/**
 * Samples a shape on a grid of cells.
 * @param inside The shape: whether a point, in cells, is inside it.
 * @param options `columns` and `rows` (the size of the grid) and `outline` (how many cells thick the outline is; 1 by
 * default).
 * @returns The cells of the shape: for each its column `c`, its row `r` and `edge`, `true` on the outline. A cell
 * belongs to the shape when its middle does. The edge of the grid cuts a shape without an outline.
 */
export function sample(inside, { columns, rows, outline = 1 }) {
  const filled = new Set();
  const key = (c, r) => r * columns + c;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      if (inside(c + 0.5, r + 0.5)) filled.add(key(c, r));
    }
  }
  const empty = (c, r) => c >= 0 && c < columns && r >= 0 && r < rows && !filled.has(key(c, r));
  const rim = new Set(
    [...filled].filter((value) => {
      const c = value % columns;
      const r = Math.floor(value / columns);
      return empty(c - 1, r) || empty(c + 1, r) || empty(c, r - 1) || empty(c, r + 1);
    }),
  );
  // A thicker outline: the cells beside the outline, as many times as it takes
  for (let pass = 1; pass < outline; pass++) {
    for (const value of [...rim]) {
      const c = value % columns;
      if (c > 0 && filled.has(value - 1)) rim.add(value - 1);
      if (c < columns - 1 && filled.has(value + 1)) rim.add(value + 1);
      if (filled.has(value - columns)) rim.add(value - columns);
      if (filled.has(value + columns)) rim.add(value + columns);
    }
  }
  return [...filled].map((value) => ({ c: value % columns, r: Math.floor(value / columns), edge: rim.has(value) }));
}
