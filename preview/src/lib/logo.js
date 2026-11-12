/**
 * @file The TUWA logo as its own pixels. The logo is never redrawn: `assets/logo_glow.svg` (the dark logo of the
 * site) is read as it is, and every square of its paths becomes a cell with its place and its fill, so a preview can
 * draw the logo on whole pixels and let its pixels fly.
 */

/**
 * Reads the squares of the logo.
 * @param svg The text of the SVG: paths with a `fill`, each a list of squares (`M x y h s v s h -s z`).
 * @returns `columns` and `rows` (the grid of the logo) and `cells`: for each square its column and row on that grid,
 * its `fill`, and `node`, `true` for the larger squares at the ends of the lines inside the letters.
 * @throws When the SVG holds no squares: the file is not the logo this reads.
 */
export function parseLogo(svg) {
  const cells = [];
  for (const [, fill, data] of svg.matchAll(/<path fill="([^"]+)" d="([^"]+)"/g)) {
    for (const [, x, y, side] of data.matchAll(/M([\d.]+) ([\d.]+)h([\d.]+)v[\d.]+h-[\d.]+z/g)) {
      const node = Number(side) > 1;
      // A cell is inset by 0.235 of the pitch; a node starts on the pitch and is centred on its cell
      cells.push({ c: Math.floor(Number(x)), r: Math.floor(Number(y)), fill, node });
    }
  }
  if (!cells.length) throw new Error('The logo has no squares to read');
  return {
    columns: Math.max(...cells.map((cell) => cell.c)) + 1,
    rows: Math.max(...cells.map((cell) => cell.r)) + 1,
    cells,
  };
}

/** What of the pitch of the logo a cell fills (0.9, with 0.1 between two cells) and a node (1.37). */
const CELL = 0.9;
const NODE = 1.37;
const INSET = 0.235;

/**
 * Where the cells of the logo are on a canvas, on whole pixels.
 * @param logo The logo ({@link parseLogo}).
 * @param left The left of the logo, in pixels.
 * @param top Its top, in pixels.
 * @param pitch The distance between two cells, in pixels: a whole number.
 * @returns `width` and `height` of the logo in pixels and `cells`: the logo's cells with `x`, `y` and `side` in
 * pixels.
 */
export function layoutLogo(logo, left, top, pitch) {
  const side = Math.round(CELL * pitch);
  const inset = Math.round(INSET * pitch);
  // A node is as much larger than a cell on each side, so it stays centred on it
  const grow = Math.round(((NODE - CELL) * pitch) / 2);
  return {
    width: logo.columns * pitch + 2 * inset - (pitch - side),
    height: logo.rows * pitch + 2 * inset - (pitch - side),
    cells: logo.cells.map((cell) => {
      const x = left + cell.c * pitch + inset;
      const y = top + cell.r * pitch + inset;
      return cell.node
        ? { ...cell, x: x - grow, y: y - grow, side: side + 2 * grow }
        : { ...cell, x, y, side };
    }),
  };
}

/**
 * Draws the logo, whole, on whole pixels, with its glow: the quiet one of the site (a few pixels, a third opaque).
 * @param ctx The context of the canvas.
 * @param placed The logo laid out ({@link layoutLogo}).
 * @param glow How much of the glow shows, from 0 to 1.
 * @param blur How far the glow reaches, in pixels.
 * @param skip The cells to leave out, by their index in the logo: a logo that is still being put together.
 */
export function drawLogo(ctx, placed, glow, blur, skip = new Set()) {
  const left = Math.min(...placed.cells.map((cell) => cell.x));
  const top = Math.min(...placed.cells.map((cell) => cell.y));
  const sheet = new OffscreenCanvas(placed.width, placed.height);
  const sheetCtx = sheet.getContext('2d');
  placed.cells.forEach((cell, index) => {
    if (skip.has(index)) return;
    sheetCtx.fillStyle = cell.fill;
    sheetCtx.fillRect(cell.x - left, cell.y - top, cell.side, cell.side);
  });
  ctx.save();
  ctx.globalAlpha = 1;
  if (glow > 0) {
    ctx.shadowColor = `rgba(34, 195, 230, ${0.32 * glow})`;
    ctx.shadowBlur = blur;
  }
  ctx.drawImage(sheet, left, top);
  ctx.restore();
}
