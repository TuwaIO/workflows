/**
 * @file Drawing in paper and ink on a canvas: flat fills, lines of 1px, corner marks, pixel pictures and mono labels.
 * A picture is laid out in units; a painter turns a unit into a whole number of pixels (4 for the MP4, 3 for the GIF,
 * 2 for the banner), so every edge lies on a pixel at each size and nothing is blurred.
 */

/** The colours of the dark theme of TUWA (the tokens of Nova Core), and the one warm colour. */
export const C = {
  paper: '#101014',
  raised: '#17181b',
  sunken: '#222327',
  line: '#2b2c30',
  lineStrong: '#55565a',
  text: '#f2f1ee',
  textSecondary: '#9d9c9a',
  textTertiary: '#77767a',
  /** The lit colour of the dark theme: the cyan of the logo */
  lit: '#8ef5ff',
  /** The TUWA orange (`--tuwa-text-accent` of the light theme): one lamp at most */
  warm: '#b93b0a',
};

const clamp01 = (value) => Math.max(0, Math.min(1, value));

const channels = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));

/**
 * A colour between two colours.
 * @param from The colour at 0, as `#rrggbb`.
 * @param to The colour at 1, as `#rrggbb`.
 * @param amount How far from the first to the second, from 0 to 1.
 * @returns The colour, as `rgb(r, g, b)`.
 */
export function mix(from, to, amount) {
  const a = channels(from);
  const b = channels(to);
  const k = clamp01(amount);
  return `rgb(${a.map((value, index) => Math.round(value + (b[index] - value) * k)).join(', ')})`;
}

/**
 * A painter for a canvas of one size.
 * @param ctx The 2D context of the canvas.
 * @param scale How many pixels a unit is: a whole number.
 * @returns The painter: its methods take units unless their name ends in `Px`.
 */
export function createPainter(ctx, scale) {
  const S = scale;
  const px = (units) => Math.round(units * S);

  const rectPx = (x, y, w, h, colour, alpha = 1) => {
    if (alpha <= 0 || w <= 0 || h <= 0) return;
    ctx.globalAlpha = clamp01(alpha);
    ctx.fillStyle = colour;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };

  const painter = {
    S,
    ctx,
    px,
    rectPx,

    /** A flat fill. */
    rect(x, y, w, h, colour, alpha = 1) {
      rectPx(px(x), px(y), px(x + w) - px(x), px(y + h) - px(y), colour, alpha);
    },

    /** A horizontal line of 1px from `x1` to `x2`, its top edge at `y`. */
    hline(x1, x2, y, colour, alpha = 1) {
      rectPx(px(x1), px(y), px(x2) - px(x1), 1, colour, alpha);
    },

    /** A vertical line of 1px from `y1` to `y2`, its left edge at `x`. */
    vline(x, y1, y2, colour, alpha = 1) {
      rectPx(px(x), px(y1), 1, px(y2) - px(y1), colour, alpha);
    },

    /** A frame of 1px inside a box. */
    frame(x, y, w, h, colour, alpha = 1) {
      const left = px(x);
      const top = px(y);
      const width = px(x + w) - left;
      const height = px(y + h) - top;
      rectPx(left, top, width, 1, colour, alpha);
      rectPx(left, top + height - 1, width, 1, colour, alpha);
      rectPx(left, top, 1, height, colour, alpha);
      rectPx(left + width - 1, top, 1, height, colour, alpha);
    },

    /**
     * Corner marks: four L-shaped marks of 1px at the corners of a box.
     * @param x The left of the box.
     * @param y Its top.
     * @param w Its width.
     * @param h Its height.
     * @param arm The length of an arm of a mark.
     * @param colour The colour of the marks.
     * @param alpha Their opacity.
     * @param spread How far outside the box the marks stand (0: on its corners).
     */
    corners(x, y, w, h, arm, colour, alpha = 1, spread = 0) {
      const left = px(x - spread);
      const top = px(y - spread);
      const right = px(x + w + spread);
      const bottom = px(y + h + spread);
      const a = px(arm);
      rectPx(left, top, a, 1, colour, alpha);
      rectPx(left, top, 1, a, colour, alpha);
      rectPx(right - a, top, a, 1, colour, alpha);
      rectPx(right - 1, top, 1, a, colour, alpha);
      rectPx(left, bottom - 1, a, 1, colour, alpha);
      rectPx(left, bottom - a, 1, a, colour, alpha);
      rectPx(right - a, bottom - 1, a, 1, colour, alpha);
      rectPx(right - 1, bottom - a, 1, a, colour, alpha);
    },

    /**
     * A frame of 1px whose corners are cut in steps, as a pixel picture cuts a corner: the frame of a window. The
     * steps of each corner are filled with the colour of what is around the window, over what was drawn in it.
     * @param x The left of the box.
     * @param y Its top.
     * @param w Its width.
     * @param h Its height.
     * @param count How many steps cut a corner.
     * @param step The side of a step.
     * @param around The colour outside the window.
     * @param colour The colour of the frame.
     */
    steppedFrame(x, y, w, h, count, step, around, colour) {
      const left = px(x);
      const top = px(y);
      const right = px(x + w) - 1;
      const bottom = px(y + h) - 1;
      const sp = px(step);
      const run = (from, to) => [Math.min(from, to), Math.abs(to - from) + 1];
      for (const [cx, sx] of [[left, 1], [right, -1]]) {
        for (const [cy, sy] of [[top, 1], [bottom, -1]]) {
          for (let k = 0; k < count; k++) {
            const reach = (count - k) * sp;
            const [coverX, coverW] = run(cx, cx + sx * (reach - 1));
            const [coverY, coverH] = run(cy + sy * k * sp, cy + sy * ((k + 1) * sp - 1));
            rectPx(coverX, coverY, coverW, coverH, around);
            const [lineY, lineH] = run(cy + sy * k * sp, cy + sy * (k + 1) * sp);
            rectPx(cx + sx * reach, lineY, 1, lineH, colour);
            const [lineX, lineW] = run(cx + sx * (reach - sp), cx + sx * reach);
            rectPx(lineX, cy + sy * (k + 1) * sp, lineW, 1, colour);
          }
        }
      }
      const cut = count * sp;
      rectPx(left + cut, top, right - left - 2 * cut + 1, 1, colour);
      rectPx(left + cut, bottom, right - left - 2 * cut + 1, 1, colour);
      rectPx(left, top + cut, 1, bottom - top - 2 * cut + 1, colour);
      rectPx(right, top + cut, 1, bottom - top - 2 * cut + 1, colour);
    },

    /** A cross of two lines of 1px where two lines of a frame meet: `x`, `y` is the pixel they share. */
    cross(x, y, arm, colour, alpha = 1) {
      const a = px(arm);
      rectPx(px(x) - a, px(y), 2 * a + 1, 1, colour, alpha);
      rectPx(px(x), px(y) - a, 1, 2 * a + 1, colour, alpha);
    },

    /**
     * A pixel picture, row by row: `.` is empty, any other mark a pixel.
     * @param rows The rows of the picture.
     * @param x Its left.
     * @param y Its top.
     * @param cell The side of a pixel of the picture.
     * @param paint What a mark is drawn with: `(mark, column, row)` gives `{ colour, alpha }`, or nothing to skip it.
     */
    art(rows, x, y, cell, paint) {
      rows.forEach((row, r) => {
        for (let c = 0; c < row.length; c++) {
          const mark = row[c];
          if (mark === '.') continue;
          const look = paint(mark, c, r);
          if (!look) continue;
          const left = px(x + c * cell);
          const top = px(y + r * cell);
          rectPx(left, top, px(x + (c + 1) * cell) - left, px(y + (r + 1) * cell) - top, look.colour, look.alpha ?? 1);
        }
      });
    },

    /**
     * A line of text in Geist Mono.
     * @param string The text.
     * @param x Where it is anchored.
     * @param y Its baseline.
     * @param options `size` (the font size), `weight` (500 or 700), `colour`, `alpha`, `align` (`left`, `center`,
     * `right`), `tracking` (in em) and `reveal` (how much of the text shows, from 0 to 1, a character at a time; the
     * text keeps the place of the whole line).
     * @returns The width of the whole line, in pixels.
     */
    text(string, x, y, options = {}) {
      const {
        size = 4,
        weight = 700,
        colour = C.text,
        alpha = 1,
        align = 'left',
        tracking = 0.12,
        reveal = 1,
      } = options;
      const fontPx = size * S;
      const trackPx = tracking * fontPx;
      ctx.font = `${weight} ${fontPx}px "Geist Mono"`;
      ctx.letterSpacing = `${trackPx}px`;
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
      const width = string ? ctx.measureText(string).width - trackPx : 0;
      const shown = string.slice(0, Math.round(string.length * clamp01(reveal)));
      if (shown && alpha > 0) {
        const left = align === 'center' ? px(x) - Math.round(width / 2) : align === 'right' ? px(x) - Math.round(width) : px(x);
        ctx.globalAlpha = clamp01(alpha);
        ctx.fillStyle = colour;
        ctx.fillText(shown, left, px(y));
      }
      ctx.letterSpacing = '0px';
      return width;
    },

    /**
     * A line of 1px along a path of horizontal and vertical runs, drawn from its start as far as `to`.
     * @param points The corners of the path, each `[x, y]`.
     * @param colour The colour of the line.
     * @param alpha Its opacity.
     * @param from Where the part that shows starts, as a share of the length of the path.
     * @param to Where it ends.
     */
    path(points, colour, alpha = 1, from = 0, to = 1) {
      if (to <= from || alpha <= 0) return;
      const corners = points.map(([cx, cy]) => [px(cx), px(cy)]);
      const lengths = corners.slice(1).map(([cx, cy], index) => Math.abs(cx - corners[index][0]) + Math.abs(cy - corners[index][1]));
      const total = lengths.reduce((sum, length) => sum + length, 0);
      let walked = 0;
      lengths.forEach((length, index) => {
        const start = Math.max(from * total - walked, 0);
        const end = Math.min(to * total - walked, length);
        walked += length;
        if (end <= start || !length) return;
        const [ax, ay] = corners[index];
        const [bx, by] = corners[index + 1];
        const x1 = Math.round(ax + ((bx - ax) * start) / length);
        const y1 = Math.round(ay + ((by - ay) * start) / length);
        const x2 = Math.round(ax + ((bx - ax) * end) / length);
        const y2 = Math.round(ay + ((by - ay) * end) / length);
        rectPx(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1) + 1, Math.abs(y2 - y1) + 1, colour, alpha);
      });
    },

    /** Scanlines over a box: a line of 1px every 4px, barely there. */
    scanlines(x, y, w, h, alpha = 0.013) {
      const left = px(x);
      const width = px(x + w) - left;
      const bottom = px(y + h);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = C.text;
      for (let top = px(y); top < bottom; top += 4) ctx.fillRect(left, top, width, 1);
    },
  };
  return painter;
}
