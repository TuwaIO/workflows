/**
 * @file The star field of the site (`StarryBackground` of docs-ui), for a picture rather than a page: crisp pixel
 * stars in paper-white (specks of dust, larger stars and sparkles with four arms), one in ten lit in the accent, and
 * dotted lines of 1px pixels between neighbours, all faint. The same field on every run. In a video the stars come
 * slowly towards the viewer, as seen from a craft that flies ahead, and twinkle; both repeat with the loop.
 */
import { C } from './paint.js';
import { clamp01, random, smooth } from './motion.js';

/**
 * How faint the field is: the stars between their dimmest and their brightest (a little brighter than on the site,
 * where the field lies under text), and a line where it is shortest.
 */
const INK = [0.2, 0.62];
const LIT = [0.3, 0.85];
const LINE = 0.2;
/** How far apart two stars may be and be joined by a line, in units, and how far apart they may drift before it is gone. */
const LINE_REACH = 26;
const LINE_END = 32;
/** The share of the stars lit in the accent, and the shares of the kinds. */
const LIT_SHARE = 0.1;
const DUST_SHARE = 0.55;
const STAR_SHARE = 0.33;
/** How much farther from the middle of the view a star is at the end of its way than at its start. */
const APPROACH = 2;

/**
 * Makes a star field.
 * @param options `x`, `y`, `w`, `h` (the box the stars fill, in units), `count`, `seed`, and `vanish` (the point the
 * stars come from, in units; the middle of the box by default).
 * @returns The field, for {@link drawStars}.
 */
export function createStars({ x, y, w, h, count, seed, vanish }) {
  const next = random(seed);
  const stars = Array.from({ length: count }, () => {
    const pick = next();
    return {
      x: x + next() * w,
      y: y + next() * h,
      kind: pick < DUST_SHARE ? 'dust' : pick < DUST_SHARE + STAR_SHARE ? 'star' : 'sparkle',
      lit: next() < LIT_SHARE,
      // Where the star is on its way at the start of the loop, and its twinkle: whole cycles in a loop
      phase: next(),
      twinkles: 3 + Math.floor(next() * 3),
      twinklePhase: next() * Math.PI * 2,
    };
  });
  // A star is joined to its nearest neighbour, when one is near enough: pairs and short chains, never a web
  const links = new Map();
  stars.forEach((star, index) => {
    let nearest = -1;
    let least = LINE_REACH;
    stars.forEach((other, otherIndex) => {
      const distance = Math.hypot(other.x - star.x, other.y - star.y);
      if (otherIndex !== index && distance < least) {
        least = distance;
        nearest = otherIndex;
      }
    });
    if (nearest >= 0) links.set(`${Math.min(index, nearest)}-${Math.max(index, nearest)}`, [index, nearest]);
  });
  return { stars, links: [...links.values()], vanish: vanish ?? { x: x + w / 2, y: y + h / 2 } };
}

/**
 * Draws a star field.
 * @param painter The painter.
 * @param field The field ({@link createStars}).
 * @param options `turn` (the time as a share of the loop, from 0 to 1: the twinkle), `travel` (how far the craft has
 * flown, as a share of the way of a star; a whole number more brings every star back to its place; leave it out for
 * a still picture, where the stars stay where they are and none fades) and `dust` (the side of a speck of dust in
 * pixels; by default the smallest pixel that shows at the size of the picture).
 */
export function drawStars(painter, field, { turn = 0, travel = null, dust = Math.max(1, Math.round(painter.S / 2.4)) } = {}) {
  const { S, rectPx, px } = painter;
  const { stars, vanish } = field;

  const placed = stars.map((star) => {
    let sx = star.x;
    let sy = star.y;
    let shown = 1;
    if (travel !== null) {
      const way = (star.phase + travel) % 1;
      const reach = APPROACH ** (way - 0.5);
      sx = vanish.x + (star.x - vanish.x) * reach;
      sy = vanish.y + (star.y - vanish.y) * reach;
      // A star comes out of the dark at the start of its way and goes back into it at the end
      shown = smooth(way / 0.14) * smooth((1 - way) / 0.14);
    }
    const twinkle = 0.5 + 0.5 * Math.sin(turn * star.twinkles * Math.PI * 2 + star.twinklePhase);
    return { star, x: px(sx), y: px(sy), shown, twinkle };
  });

  // The dotted lines between neighbours: a pixel of 1px, then a gap of 2px
  const reach = LINE_END * S;
  for (const [a, b] of field.links) {
    const from = placed[a];
    const to = placed[b];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);
    if (distance >= reach || distance <= 6) continue;
    const alpha = LINE * (1 - (distance * distance) / (reach * reach)) * Math.min(from.shown, to.shown);
    if (alpha < 0.01) continue;
    for (let at = 3; at <= distance - 3; at += 3)
      rectPx(from.x + Math.round((dx / distance) * at), from.y + Math.round((dy / distance) * at), 1, 1, C.text, alpha);
  }

  for (const { star, x, y, shown, twinkle } of placed) {
    const [dimmest, brightest] = star.lit ? LIT : INK;
    const alpha = clamp01((dimmest + (brightest - dimmest) * twinkle) * shown);
    const colour = star.lit ? C.lit : C.text;
    // A star and the middle of a sparkle are a pixel larger than a speck of dust
    const size = star.kind === 'dust' ? dust : dust + 1;
    rectPx(x, y, size, size, colour, alpha);
    if (star.kind !== 'sparkle') continue;
    rectPx(x - size, y, size, size, colour, alpha * 0.5);
    rectPx(x + size, y, size, size, colour, alpha * 0.5);
    rectPx(x, y - size, size, size, colour, alpha * 0.5);
    rectPx(x, y + size, size, size, colour, alpha * 0.5);
    // The far ends of the arms come in as the sparkle nears its brightest
    const far = alpha * 0.25 * clamp01((twinkle - 0.6) / 0.4);
    if (far <= 0) continue;
    const middle = Math.floor(size / 2);
    rectPx(x - size - 1, y + middle, 1, 1, colour, far);
    rectPx(x + size * 2, y + middle, 1, 1, colour, far);
    rectPx(x + middle, y - size - 1, 1, 1, colour, far);
    rectPx(x + middle, y + size * 2, 1, 1, colour, far);
  }
}
