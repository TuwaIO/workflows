# The generator of the previews

This folder renders three files of `preview/`:

| File | What it is |
|---|---|
| `tuwa_preview.mp4` | The preview video: 1280 × 720, 25 fps, a loop of 12 seconds, H.264 (`yuv420p`, faststart). |
| `tuwa_preview.gif` | The same loop for the README: 960 × 540, 15 fps. |
| `preview-banner.png` | The banner: 1376 × 462. |

The pictures are drawn in the dark theme of the TUWA sites: paper `#101014`, flat fills, lines of 1px, square corners, Geist Mono, the cyan of the logo (`#8ef5ff`) as the one accent.

## What it needs

- Node.js 22 or later (the script uses the WebSocket that Node ships). There are no npm packages to install.
- Google Chrome. Set `CHROME` to its path when it is not in the usual place.
- `ffmpeg` (the MP4 and the contact sheet) and `gifski` (the GIF) on the `PATH`, or `FFMPEG` and `GIFSKI` set to their paths.

## Commands

Run them from the root of the repository.

```sh
node preview/src/build.mjs            # the banner, the MP4 and the GIF, written to preview/
node preview/src/build.mjs banner     # only the banner
node preview/src/build.mjs mp4        # only the MP4
node preview/src/build.mjs gif        # only the GIF
```

While you work on a picture:

```sh
node preview/src/build.mjs frame --scene video --time 4.7 --out frame.png    # one frame of the video
node preview/src/build.mjs frame --scene video --scale 3 --time 4.7 --out frame.png    # the same frame at the size of the GIF
node preview/src/build.mjs frame --scene banner --out banner.png             # the banner
node preview/src/build.mjs sheet --out sheet.png                             # twelve moments of the video on one sheet
node preview/src/build.mjs sheet --times 2.3,2.4,2.5,2.6 --out sheet.png     # the moments you name
node preview/src/build.mjs serve                                             # plays the video in a browser, until stopped
```

`--to <folder>` writes the previews to another folder than `preview/`.

## How it works

`index.html` is a page with one canvas. `main.js` gives it `window.render({ scene, scale, time })`, which draws one picture and returns it as a PNG. A picture is a pure function of the time: the same time gives the same pixels on every run, and the last frame of the video leads into the first.

`build.mjs` serves this folder on a free local port, opens the page in headless Chrome, asks it for the banner and for every frame of the video in turn through the DevTools protocol, and pipes the frames to `ffmpeg` and `gifski`. It stops Chrome and the server when it ends.

A picture is laid out in units, and a unit is a whole number of pixels: 4 for the MP4 and 3 for the GIF (the video is drawn once at each size, so the GIF is not a scaled-down MP4), 2 for the banner. Every edge lies on a pixel.

| Path | What it holds |
|---|---|
| `scenes/video.js` | The video: its layout, its times and its drawing. |
| `scenes/banner.js` | The banner. |
| `lib/paint.js` | The colours and the drawing: fills, lines of 1px, corner marks, pixel pictures, text. |
| `lib/stars.js` | The star field of the sites. |
| `lib/logo.js` | The logo, read from `assets/logo_glow.svg` pixel by pixel. |
| `lib/art.js` | The pixel pictures the previews reuse: the craft and the Earth of the flight plan, the icons of the projects, three icons of Nova. |
| `lib/shape.js`, `lib/motion.js` | A shape sampled on a pixel grid; easing and repeatable random numbers. |
| `assets/` | The dark logo of the site, and Geist Mono in two weights. |

## What is copied from other TUWA repositories

- `assets/logo_glow.svg`: the dark logo of the site (`public/brand/logo_glow.svg` of the website). The logo is never redrawn: the generator reads the squares of this file.
- The pixel pictures in `lib/art.js`: from `packages/docs-ui/src/flightArt.ts` and `packages/docs-ui/src/projectIcons.ts` of `TuwaIO/docs`, and from `packages/nova-icons/src` of `TuwaIO/nova-uikit`. When one changes there, copy it here again.
- `assets/fonts/`: Geist Mono (weights 500 and 700, Latin), under the SIL Open Font License 1.1. The license is in `assets/fonts/OFL.txt`.
