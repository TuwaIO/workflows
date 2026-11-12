/**
 * @file The page of the previews. It draws one picture at a time on its canvas and hands it back as a PNG:
 * `build.mjs` opens the page in headless Chrome and asks for the banner and for every frame of the video in turn.
 * Opened in a browser by hand (through `node build.mjs serve`), it plays the video.
 */
import { parseLogo } from './lib/logo.js';
import { BANNER, createBanner } from './scenes/banner.js';
import { createVideo, VIDEO } from './scenes/video.js';

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

/** The scenes by name, once the logo and the fonts are loaded. */
const scenes = (async () => {
  const [svg] = await Promise.all([
    fetch('assets/logo_glow.svg').then((response) => response.text()),
    document.fonts.load('500 16px "Geist Mono"'),
    document.fonts.load('700 16px "Geist Mono"'),
  ]);
  const logo = parseLogo(svg);
  return {
    video: { ...VIDEO, ...createVideo({ logo }) },
    banner: { ...BANNER, ...createBanner({ logo }) },
  };
})();

/**
 * Draws a picture and gives it back.
 * @param options `scene` (`video` or `banner`), `scale` (the pixels of a unit of the scene: a whole number) and
 * `time` (the time of the frame in seconds; the banner has none).
 * @returns The picture as a PNG data URL.
 */
window.render = async ({ scene, scale, time = 0 }) => {
  const { width, height, draw } = (await scenes)[scene];
  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.imageSmoothingEnabled = false;
  draw(ctx, scale, time);
  return canvas.toDataURL('image/png');
};

// By hand: play the video (`?scene=banner` shows the banner, `?scale=3` the size of the GIF). `build.mjs` opens the
// page with `?driven` and asks for the pictures itself
const query = new URLSearchParams(location.search);
if (!query.has('driven')) {
  const scene = query.get('scene') ?? 'video';
  const scale = Number(query.get('scale')) || (scene === 'video' ? 4 : 2);
  const started = performance.now();
  const tick = async () => {
    await window.render({ scene, scale, time: (performance.now() - started) / 1000 });
    if (scene === 'video') requestAnimationFrame(tick);
  };
  tick();
}
