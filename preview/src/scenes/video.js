/**
 * @file The preview video: a loop of 12 seconds seen from the cockpit of the craft of the site's flight plan.
 *
 * The window looks out at the star field; under it runs the flight line with the craft and, at its end, the Earth;
 * under the line stand three instruments. One loop is one flight:
 *
 * 1. the logo, the line about TUWA and the Earth in the window, the craft docked: the frame a loop starts on;
 * 2. departure: the Earth sets and the pixels of the logo fly apart into the stack, seven icons joined by a route;
 * 3. the craft flies: each project is locked on with corner marks, lit and named, in the order of the stack;
 * 4. the pixels fly back into the logo, the line about TUWA is typed, and the instruments light one after another:
 *    wallet connected, signed in, transaction pending and then confirmed;
 * 5. arrival: the craft docks, the horizon of the Earth rises in the window and the lights on it come on.
 *
 * `draw` is a pure function of the time: the same time gives the same frame, and the end of a loop is its start.
 * Everything is laid out in units on a grid of 320 × 180 (a unit is 4px at 1280 × 720 and 3px at 960 × 540).
 */
import { cellsOf, EARTH_SMALL, isLit, NOVA_ICONS, PROJECT_ICONS, SHIP, SHIP_FLAME_CELLS } from '../lib/art.js';
import { createEarth } from '../lib/earth.js';
import { drawLogo, layoutLogo } from '../lib/logo.js';
import { arrive, clamp01, glide, lerp, noise, smooth, span } from '../lib/motion.js';
import { C, createPainter, mix } from '../lib/paint.js';
import { createStars, drawStars } from '../lib/stars.js';

/** The grid of the video in units, and the length of a loop in seconds. */
export const VIDEO = { width: 320, height: 180, duration: 12 };

// ── The layout, in units ──
const WINDOW = { x: 6, y: 6, w: 308, h: 112 };
const WINDOW_BOTTOM = WINDOW.y + WINDOW.h;
const MIDDLE = WINDOW.x + WINDOW.w / 2;
/** The corners of the window are cut in steps. */
const WINDOW_STEPS = 6;
const WINDOW_STEP = 2;
const LINE = { y: 131, x1: 12, x2: 308 };
const PANEL = { x: 6, y: 140, w: 308, h: 34 };
/** Where each of the three instruments starts, and how wide it is. */
const INSTRUMENTS = [
  { x: 6, w: 102 },
  { x: 108, w: 104 },
  { x: 212, w: 102 },
];

/** The logo: the distance between two of its pixels, and its top. */
const LOGO_PITCH = 3;
const LOGO_TOP = 26;
const TAGLINE = 'Open-source Web3 toolkit for EVM and Solana apps';
const TAGLINE_Y = 86;

/**
 * The Earth in the window, as in the banner: so large that only its horizon rises along the edge. Its pixels are a
 * unit; `EARTH_RISEN` is how far its horizon stands above the edge in the middle once it has risen.
 */
const EARTH = {
  columns: WINDOW.w,
  rows: 32,
  // Two rows of sky over the horizon, so the top of its line is part of the grid
  top: 2,
  radius: 600,
  outline: 2,
  block: 3,
  land: {
    under: 3,
    masses: [
      [58, 4, 26, 5],
      [136, 3, 30, 5],
      [198, 9, 22, 5],
      [254, 3, 20, 4],
    ],
  },
  lights: { count: 44, margin: 14, under: 4, spread: 13 },
  seed: 9,
};
const EARTH_RISEN = 22;

/** The stack, in its order: the icons stand in a row, joined by the route. */
const ICON_CELL = 3;
const ICON = 9 * ICON_CELL;
const STACK_Y = 45;
const STACK = [
  { name: 'ORBIT UTILS', icon: 'orbit' },
  { name: 'SIWX', icon: 'sign-in' },
  { name: 'PULSAR', icon: 'pulsar' },
  { name: 'SATELLITE CONNECT', icon: 'satellite' },
  { name: 'QUASAR', icon: 'cloud' },
  { name: 'NOVA UI KIT', icon: 'supernova' },
  { name: 'TUWA SDK', icon: 'terminal' },
].map((project, index) => ({
  ...project,
  x: 34 + index * 42 - ICON / 2,
  y: STACK_Y,
}));
/** How far outside an icon its corner marks stand, and how long their arms are. */
const MARK_SPREAD = 3;
const MARK_ARM = 4;

// ── The times of a loop, in seconds ──
const T = VIDEO.duration;
/** The frame of the start holds until here; then the craft leaves. */
const DEPART = 0.8;
/** The pixels of the logo fly apart into the icons. */
const APART = [1.0, 2.2];
/** When the craft locks on each project. */
const LOCKS = STACK.map((_, index) => 2.3 + index * 0.55);
/** The stack stands whole for a moment; then its names go and the pixels of the icons fly back into the logo. */
const UNNAMED = [6.25, 6.5];
const TOGETHER = [6.5, 7.7];
/** The line about TUWA is typed under the logo. */
const TYPED = [7.8, 8.4];
/** When each instrument lights; the transaction is pending first. */
const WALLET = 8.45;
const SIGN_IN = 9.1;
const PENDING = 9.75;
const CONFIRMED = 10.5;
/** The craft is drawn anew at the start of the line from here, and under way between these two. */
const DRAWN_ANEW = 1.3;
const UNDER_WAY = [1.9, 10.7];
const EARTH_RISE = [10.0, 11.3];
const EARTH_SET = [DEPART, 1.9];
/** How long what is lit takes to go out when the craft leaves. */
const OUT = 0.45;

/**
 * The share of a way covered by a time, for a speed that rises smoothly, holds and falls smoothly.
 * @param start When it starts to move.
 * @param end When it stops.
 * @param ramp How long it takes to reach its speed, and to lose it.
 * @returns The function from a time to the share of the way, from 0 to 1.
 */
function journey(start, end, ramp) {
  const steps = 2400;
  const table = new Float64Array(steps + 1);
  for (let step = 1; step <= steps; step++) {
    const t = (step / steps) * T;
    table[step] = table[step - 1] + smooth(span(t, start, start + ramp)) * (1 - smooth(span(t, end - ramp, end)));
  }
  return (t) => {
    const at = clamp01(t / T) * steps;
    const low = Math.min(Math.floor(at), steps - 1);
    return lerp(table[low], table[low + 1], at - low) / table[steps];
  };
}

/** The channels of a colour written as `#rrggbb` or `rgb(r, g, b)`. */
const channels = (colour) =>
  colour.startsWith('#')
    ? [1, 3, 5].map((at) => parseInt(colour.slice(at, at + 2), 16))
    : colour.match(/\d+/g).map(Number);

/** A colour between two colours, each `#rrggbb` or `rgb(r, g, b)`. */
function blend(from, to, amount) {
  const a = channels(from);
  const b = channels(to);
  return `rgb(${a.map((value, index) => Math.round(lerp(value, b[index], clamp01(amount)))).join(', ')})`;
}

/**
 * Draws a picture whose pixels fly in to their places from a few cells away, each after a wait of its own, as the
 * pixels of the site do.
 * @param p The painter.
 * @param rows The picture.
 * @param x Its left.
 * @param y Its top.
 * @param cell The side of one of its pixels.
 * @param since The seconds since it began to assemble: nothing shows at 0, all of it is in place after 0.75.
 * @param paint The look of a mark, as for `painter.art`.
 * @param salt Tells two pictures apart, so their pixels come from different places.
 */
function assemble(p, rows, x, y, cell, since, paint, salt) {
  if (since <= 0) return;
  const side = p.px(cell);
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (row[c] === '.') continue;
      const look = paint(row[c], c, r);
      const local = (since - noise(c, r, salt) * 0.24) / 0.5;
      if (!look || local <= 0) continue;
      const away = 1 - arrive(local);
      const angle = noise(c, r, salt + 1) * Math.PI * 2;
      const distance = (3 + noise(c, r, salt + 2) * 4) * cell * away;
      p.rectPx(
        p.px(x + c * cell + Math.cos(angle) * distance),
        p.px(y + r * cell + Math.sin(angle) * distance),
        side,
        side,
        look.colour,
        (look.alpha ?? 1) * clamp01(local / 0.4),
      );
    }
  });
}

/**
 * Makes the video.
 * @param assets `logo`: the logo as its pixels (`parseLogo`).
 * @returns `draw(ctx, scale, time)`, which draws the frame of a time (in seconds) on a canvas of 320 × 180 units.
 */
export function createVideo({ logo }) {
  // The stars reach past the window, so some come into it as they near
  const stars = createStars({
    x: WINDOW.x - 30,
    y: WINDOW.y - 24,
    w: WINDOW.w + 60,
    h: WINDOW.h + 48,
    count: 90,
    seed: 7,
    vanish: { x: MIDDLE, y: 58 },
  });
  const flown = journey(UNDER_WAY[0], UNDER_WAY[1], 0.9);
  const earth = createEarth(EARTH);

  // For each pixel of the logo, the pixel of an icon it flies to: the left of the logo goes to the first icons, the
  // right to the last, and every pixel of an icon gets one or two of the logo
  const iconPixels = STACK.flatMap((project) =>
    cellsOf(PROJECT_ICONS[project.icon]).map((cell) => ({
      lit: cell.lit,
      x: project.x + cell.c * ICON_CELL,
      y: project.y + cell.r * ICON_CELL,
    })),
  );
  const targetOf = new Array(logo.cells.length);
  logo.cells
    .map((cell, index) => ({ cell, index }))
    .sort((a, b) => a.cell.c - b.cell.c || a.cell.r - b.cell.r)
    .forEach(({ index }, rank) => {
      targetOf[index] = iconPixels[Math.floor((rank * iconPixels.length) / logo.cells.length)];
    });

  /** The colour of a pixel of an icon by how lit its project is: grey ahead of the craft (0), lit once reached (1). */
  const iconColour = (lit, amount) => (lit ? mix(C.textTertiary, C.lit, amount) : mix(C.lineStrong, C.text, amount));

  /** The window: the stars, the Earth, the frame and what its corners say. */
  const drawWindow = (p, t) => {
    const { ctx } = p;
    p.rect(WINDOW.x, WINDOW.y, WINDOW.w, WINDOW.h, C.paper);
    ctx.save();
    ctx.beginPath();
    ctx.rect(p.px(WINDOW.x), p.px(WINDOW.y), p.px(WINDOW.w), p.px(WINDOW.h));
    ctx.clip();
    drawStars(p, stars, { turn: t / T, travel: flown(t) });

    // The Earth rises at the end of a flight and sets at the start of the next; the line of its horizon and the
    // lights of its people come on when the craft docks
    const rising = t >= EARTH_RISE[0];
    const risen = Math.round(EARTH_RISEN * (rising ? glide(span(t, ...EARTH_RISE)) : 1 - glide(span(t, ...EARTH_SET))));
    if (risen > 0) {
      const lit = rising ? smooth(span(t, UNDER_WAY[1], UNDER_WAY[1] + 0.5)) : 1 - smooth(span(t, DEPART, DEPART + OUT));
      const tones = { horizon: mix(C.textTertiary, C.text, lit), land: C.line, sea: C.sunken };
      const top = WINDOW_BOTTOM - risen - EARTH.top;
      for (const { c, r, kind } of earth.cells) {
        if (top + r < WINDOW_BOTTOM) p.rect(WINDOW.x + c, top + r, 1, 1, tones[kind]);
      }
      for (const light of earth.lights) {
        if (top + light.r + light.size > WINDOW_BOTTOM) continue;
        const colour = light.lit ? mix(C.lineStrong, C.lit, lit) : mix(C.lineStrong, C.textSecondary, lit);
        p.rect(WINDOW.x + light.c, top + light.r, light.size, light.size, colour);
      }
    }
    p.scanlines(WINDOW.x, WINDOW.y, WINDOW.w, WINDOW.h);
    ctx.restore();

    p.steppedFrame(WINDOW.x, WINDOW.y, WINDOW.w, WINDOW.h, WINDOW_STEPS, WINDOW_STEP, C.raised, C.lineStrong);
    // What the corners of the window say, in line with the two ends of the stack
    const left = STACK[0].x;
    const right = STACK.at(-1).x + ICON;
    p.rect(left, 11.5, 2, 2, C.lit);
    p.text('TUWA · FLIGHT PLAN', left + 5, 14, { size: 4, colour: C.textSecondary });
    p.text('EVM · SOLANA', right, 14, { size: 4, colour: C.textSecondary, align: 'right' });
  };

  /** The route between the icons, a line of 1px through their middles: it draws in from the left, and is lit behind the craft. */
  const drawRoute = (p, t) => {
    const fade = 1 - span(t, ...UNNAMED);
    // The line stops short of the corner marks of both icons
    const clear = MARK_SPREAD + 2;
    const y = STACK_Y + ICON / 2;
    for (let index = 0; index < STACK.length - 1; index++) {
      const points = [
        [STACK[index].x + ICON + clear, y],
        [STACK[index + 1].x - clear, y],
      ];
      const drawn = glide(span(t, 1.6 + index * 0.08, 2.1 + index * 0.08));
      const lit = glide(span(t, LOCKS[index] + 0.12, LOCKS[index + 1] - 0.03));
      p.path(points, C.lineStrong, fade, lit, drawn);
      p.path(points, C.lit, fade, 0, Math.min(lit, drawn));
    }
  };

  /** The pixels in flight between the logo and the icons: apart at the start of a flight, together after the stack. */
  const drawFlight = (p, t, placed) => {
    const out = t < APART[1];
    const start = out ? APART[0] : TOGETHER[0];
    const iconSide = p.px(ICON_CELL);
    placed.cells.forEach((cell, index) => {
      const target = targetOf[index];
      // The pixels leave from the left of the logo first, and come back in no order
      const wait = out ? (cell.c / logo.columns) * 0.2 + noise(cell.c, cell.r, 3) * 0.26 : noise(cell.c, cell.r, 5) * 0.42;
      const local = glide(span(t, start + wait, start + wait + 0.74));
      // 0 at the logo, 1 at the icon
      const k = out ? local : 1 - local;
      const fromX = cell.x;
      const toX = p.px(target.x);
      const toY = p.px(target.y);
      const dx = toX - fromX;
      const dy = toY - cell.y;
      const length = Math.hypot(dx, dy) || 1;
      // Each pixel bends a little off the straight way, on its own side
      const bend = (Math.sin(Math.PI * k) * (noise(cell.c, cell.r, 7) - 0.5) * 16 * p.S) / length;
      p.rectPx(
        lerp(fromX, toX, k) - dy * bend,
        lerp(cell.y, toY, k) + dx * bend,
        Math.round(lerp(cell.side, iconSide, k)),
        Math.round(lerp(cell.side, iconSide, k)),
        blend(cell.fill, iconColour(target.lit, out ? 0 : 1), k),
      );
    });
  };

  /**
   * The stack: an icon ahead of the craft is grey; a reached one is lit and named; the corner marks close in on the
   * one the craft has locked on and open when it flies on.
   */
  const drawStack = (p, t) => {
    STACK.forEach((project, index) => {
      const last = index === STACK.length - 1;
      const lit = smooth(span(t, LOCKS[index], LOCKS[index] + 0.3));
      p.art(PROJECT_ICONS[project.icon], project.x, project.y, ICON_CELL, (mark) => ({
        colour: iconColour(isLit(mark), lit),
      }));

      const released = last ? UNNAMED[0] : LOCKS[index + 1];
      const release = span(t, released, released + 0.3);
      const marks = span(t, LOCKS[index], LOCKS[index] + 0.2) * (1 - release);
      if (marks > 0) {
        const closing = 1 - arrive(span(t, LOCKS[index], LOCKS[index] + 0.56));
        const spread = MARK_SPREAD + (ICON / 2 + MARK_SPREAD) * 0.9 * closing;
        p.corners(project.x, project.y, ICON, ICON, MARK_ARM, C.lit, marks, spread);
      }

      // The name is typed when the project is locked on, and all the names go together before the pixels fly back
      p.text(project.name, project.x + ICON / 2, project.y + ICON + 2 * MARK_SPREAD + 3.75, {
        size: 4,
        align: 'center',
        colour: mix(C.text, C.textSecondary, last ? 0 : release),
        reveal: span(t, LOCKS[index] + 0.08, LOCKS[index] + 0.36),
        alpha: 1 - span(t, ...UNNAMED),
      });
    });
  };

  /**
   * The flight line under the window: a ruler with a tick every 5% of the flight and a longer one every 25%, the
   * craft with the tag that reads the flight in percent, the line lit behind it, and the Earth at its end.
   */
  const drawFlightLine = (p, t) => {
    const { S } = p;
    const shipLength = SHIP[0].length;
    const earthSize = EARTH_SMALL.length;
    const earthX = LINE.x2 - earthSize;
    // The top of a picture whose middle row lies on the line
    const topOf = (rows) => (p.px(LINE.y) - Math.floor(rows / 2) * S - Math.floor(S / 2)) / S;

    // The craft is docked before the Earth until it leaves; then it is drawn anew at the start of the line
    const underWay = t >= UNDER_WAY[0] && t < UNDER_WAY[1];
    const share = t < DRAWN_ANEW ? 1 : flown(t);
    const x = Math.round(lerp(LINE.x1, earthX - 2 - shipLength, share));
    const middle = x + SHIP_FLAME_CELLS + (shipLength - SHIP_FLAME_CELLS) / 2;

    // The ruler: grey ahead of the craft, lit behind it, and lit to its end while the craft is docked
    const litTo = underWay ? middle : LINE.x2;
    const litAmount = underWay || t >= UNDER_WAY[1] ? 1 : 1 - smooth(span(t, DEPART, DEPART + OUT));
    p.hline(LINE.x1, LINE.x2, LINE.y, C.lineStrong);
    p.hline(LINE.x1, litTo, LINE.y, C.lit, litAmount);
    for (let tick = 0; tick <= 20; tick++) {
      const at = lerp(LINE.x1, LINE.x2 - 1 / S, tick / 20);
      const colour = at <= litTo ? mix(C.lineStrong, C.lit, litAmount) : C.lineStrong;
      p.vline(at, LINE.y, LINE.y + (tick % 5 === 0 ? 3 : 1.5), colour);
    }

    // The Earth at the end of the line: grey until the craft arrives
    const arrived = t >= UNDER_WAY[1] ? smooth(span(t, UNDER_WAY[1], UNDER_WAY[1] + 0.4)) : 1 - smooth(span(t, DEPART, DEPART + OUT));
    p.rect(earthX, topOf(earthSize), earthSize, earthSize, C.raised);
    p.art(EARTH_SMALL, earthX, topOf(earthSize), 1, (mark) => ({
      colour: mark === 'o' ? mix(C.lineStrong, C.lit, arrived) : mix(C.textSecondary, C.text, arrived),
    }));

    // The craft: its hull in ink, its cockpit and its flames lit; the flames burn only while it flies
    const burning = smooth(span(t, UNDER_WAY[0], UNDER_WAY[0] + 0.5)) * (1 - smooth(span(t, UNDER_WAY[1] - 0.7, UNDER_WAY[1])));
    const shipPaint = (mark) => {
      if (mark === '#') return { colour: C.text };
      if (mark === 'o') return { colour: C.lit };
      return underWay ? { colour: C.lit, alpha: burning * (mark === 'b' ? 0.5 : 1) } : null;
    };
    // Its pixels fly apart at the Earth and fly in again at the start of the line
    const since = t < DRAWN_ANEW ? 0.75 * (1 - span(t, DEPART, DEPART + OUT)) : t < UNDER_WAY[0] ? t - DRAWN_ANEW : 1;
    assemble(p, SHIP, x, topOf(SHIP.length), 1, since, shipPaint, t < DRAWN_ANEW ? 11 : 12);

    // The tag over the craft
    const tag = t < DRAWN_ANEW ? 1 - span(t, DEPART, DEPART + 0.3) : span(t, 1.6, 1.9);
    if (tag > 0) {
      const w = 16;
      const h = 5.5;
      // Over the middle of the craft, and never past an end of the line
      const tagX = Math.round(Math.min(Math.max(middle - w / 2, LINE.x1), LINE.x2 - w));
      const tagY = Math.floor(topOf(SHIP.length)) - 1.5 - h;
      p.rect(tagX, tagY, w, h, C.raised, tag);
      p.frame(tagX, tagY, w, h, C.lit, tag);
      // 100 only once the craft is docked
      const number = String(Math.floor(share * 100 + 1e-6)).padStart(3, '0');
      const width = p.text(number, tagX + 2.25, tagY + 4, { size: 3.5, tracking: 0.04, alpha: tag });
      p.text('%', tagX + 2.25 + width / S + 0.6, tagY + 4, { size: 3.5, weight: 500, tracking: 0, colour: C.textSecondary, alpha: tag });
    }
  };

  /** The three instruments under the flight line: each an icon, a lamp, what it watches, its state and a detail. */
  const drawInstruments = (p, t) => {
    const { S } = p;
    p.rect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, C.paper);
    p.scanlines(PANEL.x, PANEL.y, PANEL.w, PANEL.h);
    p.frame(PANEL.x, PANEL.y, PANEL.w, PANEL.h, C.lineStrong);
    for (const { x } of INSTRUMENTS.slice(1)) {
      p.vline(x, PANEL.y, PANEL.y + PANEL.h, C.line);
      p.cross(x, PANEL.y, 1.5, C.lineStrong);
      p.cross(x, PANEL.y + PANEL.h - 1 / S, 1.5, C.lineStrong);
    }
    p.corners(PANEL.x, PANEL.y, PANEL.w, PANEL.h, 3, C.lineStrong, 1, 2);

    // An instrument lights at its time and stays on until the craft leaves again: `since` is how long it has been
    // on in this flight (0 while it waits), `left` how much of the light of the flight before still shows
    const left = 1 - smooth(span(t, DEPART, DEPART + OUT));
    const rows = [
      { at: WALLET, icon: NOVA_ICONS.wallet, label: 'WALLET', state: 'CONNECTED', detail: '0x7f3a…e21c' },
      { at: SIGN_IN, icon: NOVA_ICONS.signIn, label: 'SIGN-IN', state: 'SIGNED IN', detail: 'SIWX · CAIP-122' },
      { at: PENDING, icon: NOVA_ICONS.transactions, label: 'TRANSACTION' },
    ];
    rows.forEach((row, index) => {
      const { x, w } = INSTRUMENTS[index];
      const since = Math.max(0, t - row.at);
      const before = since > 0 ? 0 : left;
      const on = since > 0 ? smooth(since / 0.3) : before;
      const iconX = x + 8;
      const iconY = PANEL.y + 9;
      const textX = x + 31;
      const transaction = index === 2;
      // A transaction is pending first: its lamp is the one warm lamp, and the lit pixels of its icon wait
      const confirmed = !transaction || before > 0 ? 1 : smooth(span(t, CONFIRMED, CONFIRMED + 0.3));

      // The icon: grey while the instrument waits; its pixels fly in when it lights
      p.art(row.icon, iconX, iconY, 1, () => ({ colour: C.line }));
      const lit = (mark) => ({ colour: mark === 'o' ? mix(C.textTertiary, C.lit, confirmed) : C.text, alpha: since > 0 ? 1 : before });
      if (since > 0) assemble(p, row.icon, iconX, iconY, 1, since, lit, 20 + index);
      else if (before > 0) p.art(row.icon, iconX, iconY, 1, lit);

      // The lamp: an empty square while it waits
      const lampX = x + w - 10.5;
      const lampY = PANEL.y + 7.5;
      p.frame(lampX, lampY, 2.5, 2.5, C.lineStrong);
      p.rect(lampX, lampY, 2.5, 2.5, transaction ? mix(C.warm, C.lit, confirmed) : C.lit, on);

      p.text(row.label, textX, PANEL.y + 10, { size: 4, colour: mix(C.textTertiary, C.textSecondary, on) });

      // The state and the detail are typed when the instrument lights, and cleared when the craft leaves
      const stateY = PANEL.y + 19.5;
      const detailY = PANEL.y + 27;
      if (!transaction) {
        p.text(row.state, textX, stateY, { size: 5.5, reveal: since > 0 ? span(since, 0.1, 0.4) : 1, alpha: on });
        p.text(row.detail, textX, detailY, {
          size: 4,
          weight: 500,
          tracking: 0.02,
          colour: C.textSecondary,
          reveal: since > 0 ? span(since, 0.3, 0.7) : 1,
          alpha: since > 0 ? 1 : before,
        });
        return;
      }
      const settled = before > 0 || t >= CONFIRMED - 0.12;
      p.text(settled ? 'CONFIRMED' : 'PENDING', textX, stateY, {
        size: 5.5,
        reveal: before > 0 ? 1 : settled ? span(t, CONFIRMED - 0.12, CONFIRMED + 0.2) : span(since, 0.1, 0.4),
        alpha: before > 0 ? before : settled ? 1 : 1 - span(t, CONFIRMED - 0.22, CONFIRMED - 0.12),
      });
      // The strip: its cells fill while the transaction is pending, and take the accent when it is confirmed
      const cells = 18;
      const filled = before > 0 ? cells : Math.round(cells * glide(span(t, PENDING + 0.25, CONFIRMED - 0.05)));
      for (let cell = 0; cell < cells; cell++) {
        p.rect(textX + cell * 3, detailY - 3, 2, 3, C.line);
        if (cell < filled) p.rect(textX + cell * 3, detailY - 3, 2, 3, mix(C.text, C.lit, confirmed), since > 0 ? 1 : before);
      }
    });
  };

  const draw = (ctx, scale, time) => {
    const p = createPainter(ctx, scale);
    const t = ((time % T) + T) % T;

    // The wall of the cockpit, with its scanlines
    p.rect(0, 0, VIDEO.width, VIDEO.height, C.raised);
    p.scanlines(0, 0, VIDEO.width, VIDEO.height);
    drawWindow(p, t);

    // The logo and the stack are the same pixels: whole, in flight, or apart as the icons
    const pitch = LOGO_PITCH * scale;
    const logoWidth = layoutLogo(logo, 0, 0, pitch).width;
    const placed = layoutLogo(logo, p.px(MIDDLE) - Math.round(logoWidth / 2), p.px(LOGO_TOP), pitch);
    const inFlight = (t >= APART[0] && t < APART[1]) || (t >= TOGETHER[0] && t < TOGETHER[1]);
    const apart = t >= APART[1] && t < TOGETHER[0];
    if (inFlight || apart) drawRoute(p, t);
    if (inFlight) drawFlight(p, t, placed);
    else if (apart) drawStack(p, t);
    else {
      const glow = t >= TOGETHER[1] ? smooth(span(t, TOGETHER[1], TOGETHER[1] + 0.5)) : 1 - smooth(span(t, DEPART, APART[0]));
      drawLogo(ctx, placed, glow, scale * 1.5);
    }

    // The line about TUWA: typed once the logo is whole, gone when the craft leaves
    p.text(TAGLINE, MIDDLE, TAGLINE_Y, {
      size: 6,
      weight: 500,
      tracking: -0.02,
      align: 'center',
      reveal: t >= TYPED[0] ? span(t, ...TYPED) : 1,
      alpha: t >= TYPED[0] ? 1 : 1 - span(t, DEPART, DEPART + 0.3),
    });

    drawFlightLine(p, t);
    drawInstruments(p, t);
  };

  return { draw };
}
