#!/usr/bin/env node
/**
 * @file Renders the previews of TUWA: `preview/tuwa_preview.mp4`, `preview/tuwa_preview.gif` and
 * `preview/preview-banner.png`.
 *
 * The pictures are drawn by the page in this folder (`index.html`), a pure function of the time on a canvas. This
 * script serves the folder on a local port, opens the page in headless Chrome, asks it for the banner and for every
 * frame of the video in turn through the DevTools protocol, and hands the frames to ffmpeg (the MP4) and gifski (the
 * GIF). The video is drawn twice, once at each size, so the pixels of the GIF are as crisp as those of the MP4.
 *
 * Needs Node 22 or later (it uses the WebSocket Node ships), Google Chrome, ffmpeg and gifski. No npm packages.
 *
 *   node preview/src/build.mjs                 the banner, the MP4 and the GIF
 *   node preview/src/build.mjs banner|mp4|gif  one of them
 *   node preview/src/build.mjs sheet           a contact sheet of the video (--out <file>, --times 0,1.5,3)
 *   node preview/src/build.mjs frame           one picture (--scene video|banner, --scale, --time, --out <file>)
 *   node preview/src/build.mjs serve           serves the page to look at it in a browser, until stopped
 *
 * `--to <folder>` writes the previews to another folder than `preview/`. `CHROME`, `FFMPEG` and `GIFSKI` name the
 * programs when they are not where this script looks for them.
 *
 * Side effects: a server on 127.0.0.1 (a free port) and a Chrome process with a profile of its own in the temporary
 * folder of the system, both stopped when the script ends; frames in that temporary folder, removed at the end; the
 * files it writes.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = dirname(fileURLToPath(import.meta.url));

/** The video: a loop of 12 seconds on a grid of 320 × 180 units. */
const DURATION = 12;
const MP4 = { scale: 4, fps: 25, name: 'tuwa_preview.mp4' };
const GIF = { scale: 3, fps: 15, name: 'tuwa_preview.gif' };
/** The banner: 688 × 231 units of 2px. */
const BANNER = { scale: 2, name: 'preview-banner.png' };
/** The moments of the contact sheet, in seconds. */
const SHEET_TIMES = [0, 1.3, 1.8, 2.5, 3.6, 4.7, 6.1, 7.1, 8.3, 9.4, 10.6, 11.5];

const CHROME_PATHS = [
  process.env.CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];
const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';
const GIFSKI = process.env.GIFSKI ?? 'gifski';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

/**
 * Serves this folder on a free local port.
 * @returns The server and the address of the page.
 */
async function serve() {
  const server = createServer(async (request, response) => {
    const path = normalize(decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    const file = join(SRC, path === '/' ? 'index.html' : path);
    if (!file.startsWith(SRC) || !MIME[extname(file)]) {
      response.writeHead(404).end();
      return;
    }
    try {
      const body = await readFile(file);
      response.writeHead(200, { 'content-type': MIME[extname(file)], 'cache-control': 'no-store' }).end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  return { server, url: `http://127.0.0.1:${server.address().port}/` };
}

/**
 * Starts headless Chrome and opens the page in it.
 * @param url The address of the page.
 * @returns `render(options)`, which asks the page for a picture and gives its PNG, and `close()`, which stops Chrome
 * and removes its profile.
 * @throws When Chrome is not found, does not start or the page does not load.
 */
async function openPage(url) {
  const chrome = CHROME_PATHS.find((path) => path && existsSync(path));
  if (!chrome) throw new Error('Google Chrome not found: set CHROME to its path');
  const profile = await mkdtemp(join(tmpdir(), 'tuwa-previews-chrome-'));
  const child = spawn(
    chrome,
    [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--force-device-scale-factor=1',
      '--force-color-profile=srgb',
      '--hide-scrollbars',
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );
  const close = async () => {
    child.kill();
    await new Promise((done) => (child.exitCode === null ? child.once('exit', done) : done()));
    await rm(profile, { recursive: true, force: true, maxRetries: 5 });
  };

  try {
    // Chrome prints the address of its DevTools on stderr
    const devtools = await new Promise((found, failed) => {
      let log = '';
      const timer = setTimeout(() => failed(new Error(`Chrome did not start:\n${log}`)), 20_000);
      child.stderr.on('data', (chunk) => {
        log += chunk;
        const match = log.match(/DevTools listening on (ws:\/\/[^\s]+)/);
        if (match) {
          clearTimeout(timer);
          found(match[1]);
        }
      });
      child.once('exit', () => failed(new Error(`Chrome stopped:\n${log}`)));
    });
    const { port } = new URL(devtools);
    const target = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(`${url}?driven`)}`, {
      method: 'PUT',
    }).then((response) => response.json());

    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((opened, failed) => {
      socket.addEventListener('open', opened, { once: true });
      socket.addEventListener('error', () => failed(new Error('No connection to the DevTools of Chrome')), { once: true });
    });
    let lastId = 0;
    const waiting = new Map();
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      const handlers = waiting.get(message.id);
      if (!handlers) return;
      waiting.delete(message.id);
      if (message.error) handlers.failed(new Error(message.error.message));
      else handlers.done(message.result);
    });
    const send = (method, params = {}) =>
      new Promise((done, failed) => {
        const id = ++lastId;
        waiting.set(id, { done, failed });
        socket.send(JSON.stringify({ id, method, params }));
      });
    const evaluate = async (expression) => {
      const { result, exceptionDetails } = await send('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (exceptionDetails) {
        throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
      }
      return result.value;
    };

    // The page is ready once its module has run
    for (let attempt = 0; ; attempt++) {
      if (await evaluate('typeof window.render === "function"')) break;
      if (attempt > 100) throw new Error('The page did not load');
      await new Promise((done) => setTimeout(done, 100));
    }

    const render = async (options) => {
      const dataUrl = await evaluate(`window.render(${JSON.stringify(options)})`);
      return Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
    };
    return { render, close };
  } catch (error) {
    await close();
    throw error;
  }
}

/**
 * Runs a program to its end.
 * @param command The program.
 * @param args Its arguments.
 * @param feed Called with the standard input of the program, to write to; the input is closed after it.
 * @throws When the program cannot start or ends with an error; the message holds what it printed.
 */
async function run(command, args, feed) {
  const child = spawn(command, args, { stdio: [feed ? 'pipe' : 'ignore', 'ignore', 'pipe'] });
  let log = '';
  child.stderr.on('data', (chunk) => (log += chunk));
  const ended = new Promise((done, failed) => {
    child.once('error', (error) => failed(new Error(`${command}: ${error.message}`)));
    child.once('exit', (code) => (code === 0 ? done() : failed(new Error(`${command} ended with ${code}:\n${log}`))));
  });
  if (feed) {
    child.stdin.on('error', () => {});
    await feed(child.stdin);
    child.stdin.end();
  }
  await ended;
}

const write = (stream, chunk) =>
  new Promise((done, failed) => stream.write(chunk, (error) => (error ? failed(error) : done())));

/** The frames of the video at a size, one after another: `each(png, index)` for every frame of a loop. */
async function frames(page, { scale, fps }, each) {
  const count = DURATION * fps;
  for (let index = 0; index < count; index++) {
    await each(await page.render({ scene: 'video', scale, time: index / fps }), index);
    if (index % fps === 0) process.stdout.write(`\r  frame ${index + 1} of ${count}`);
  }
  process.stdout.write(`\r  ${count} frames        \n`);
}

async function buildMp4(page, to) {
  const file = join(to, MP4.name);
  console.log(`${MP4.name}: ${320 * MP4.scale} × ${180 * MP4.scale}, ${MP4.fps} fps`);
  await run(
    FFMPEG,
    [
      ...['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(MP4.fps), '-c:v', 'png', '-i', '-'],
      // H.264 in yuv420p for every player, tagged BT.709, its index first so it plays while it loads
      ...['-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p'],
      ...['-c:v', 'libx264', '-preset', 'veryslow', '-crf', '14', '-tune', 'animation'],
      ...['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv'],
      ...['-movflags', '+faststart', '-an', file],
    ],
    (input) => frames(page, MP4, (png) => write(input, png)),
  );
  return file;
}

async function buildGif(page, to) {
  const file = join(to, GIF.name);
  console.log(`${GIF.name}: ${320 * GIF.scale} × ${180 * GIF.scale}, ${GIF.fps} fps`);
  const folder = await mkdtemp(join(tmpdir(), 'tuwa-previews-gif-'));
  try {
    const files = [];
    await frames(page, GIF, async (png, index) => {
      files.push(join(folder, `${String(index).padStart(4, '0')}.png`));
      await writeFile(files.at(-1), png);
    });
    await run(GIFSKI, ['--fps', String(GIF.fps), '--quality', '100', '--quiet', '-o', file, ...files]);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
  return file;
}

async function buildBanner(page, to) {
  const file = join(to, BANNER.name);
  console.log(BANNER.name);
  await writeFile(file, await page.render({ scene: 'banner', scale: BANNER.scale }));
  return file;
}

/**
 * A contact sheet of the video: moments of the MP4, four in a row, at half their size.
 * @param page The page.
 * @param file Where to write the sheet.
 * @param times The moments, in seconds.
 * @param scale The pixels of a unit: 4 for the MP4, 3 for the GIF.
 */
async function buildSheet(page, file, times, scale) {
  const folder = await mkdtemp(join(tmpdir(), 'tuwa-previews-sheet-'));
  try {
    for (const [index, time] of times.entries()) {
      await writeFile(join(folder, `${String(index).padStart(3, '0')}.png`), await page.render({ scene: 'video', scale, time }));
    }
    const rows = Math.ceil(times.length / 4);
    await run(FFMPEG, [
      ...['-y', '-loglevel', 'error', '-framerate', '1', '-i', join(folder, '%03d.png')],
      ...['-vf', `scale=640:-1:flags=lanczos,tile=4x${rows}:padding=8:margin=8:color=0x000000`, '-frames:v', '1', file],
    ]);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
  return file;
}

/** The value of an option of the command line (`--name value`). */
function option(name, fallback) {
  const at = process.argv.indexOf(`--${name}`);
  return at > 0 && process.argv[at + 1] ? process.argv[at + 1] : fallback;
}

const command = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'all';
const to = resolve(option('to', join(SRC, '..')));
const { server, url } = await serve();

if (command === 'serve') {
  console.log(`${url}  (the video; ${url}?scene=banner the banner). Ctrl+C stops it.`);
} else {
  let page;
  try {
    page = await openPage(url);
    await mkdir(to, { recursive: true });
    const written = [];
    if (command === 'all' || command === 'banner') written.push(await buildBanner(page, to));
    if (command === 'all' || command === 'mp4') written.push(await buildMp4(page, to));
    if (command === 'all' || command === 'gif') written.push(await buildGif(page, to));
    if (command === 'sheet') {
      const times = option('times')?.split(',').map(Number) ?? SHEET_TIMES;
      written.push(await buildSheet(page, resolve(option('out', 'contact-sheet.png')), times, Number(option('scale', MP4.scale))));
    }
    if (command === 'frame') {
      const file = resolve(option('out', 'frame.png'));
      const scene = option('scene', 'video');
      const picture = await page.render({
        scene,
        scale: Number(option('scale', scene === 'video' ? MP4.scale : BANNER.scale)),
        time: Number(option('time', 0)),
      });
      await writeFile(file, picture);
      written.push(file);
    }
    if (!written.length) throw new Error(`Unknown command: ${command}`);
    for (const file of written) console.log(`${file}  ${Math.round((await stat(file)).size / 1024)} KB`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await page?.close();
    server.close();
  }
}
