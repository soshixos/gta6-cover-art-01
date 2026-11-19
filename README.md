# Vice City Cover Studio

[![Make GTA 6 Cover Art](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/soshixos/gta6-cover-art-01/rank.svg)](https://make.fun/c/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/soshixos/gta6-cover-art-01/reward.svg)](https://make.fun/c/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice City Cover Studio turns your photo and a caption into GTA 6-style
multi-panel cover art: a Vice City sunset/neon grade, procedurally drawn
palm silhouettes and sun disc, neon panel seams, bold condensed lettering,
and a one-click PNG export in the sizes people actually post.

## What it does

- **Your photos:** pick up to 3 from your machine, drag & drop them onto
  the preview, or try the two built-in illustrated sample scenes
  (Boulevard and Pier Sunset, drawn in code — no stock photos).
- **Four layouts:** Classic (hero + two small panels), Triptych (three
  vertical panels), Duo (two panels) and Solo (full-bleed single photo).
  Panels can show different crops or different photos.
- **Crop & position:** per-photo zoom slider, drag on the preview to
  reposition, click to set the crop centre. Portrait, landscape and square
  photos all cover-fit.
- **Caption:** editable title + subtitle, three lettering presets (Sunset
  gradient, Neon glow, Chrome), outline and shadow, letter-spacing and size
  controls, top or bottom placement.
- **Grade:** warm magenta/orange/teal sunset wash, vignette, procedural
  palms and a slatted sun disc, neon outline strokes, and an optional
  halftone dot overlay.
- **Export:** PNG at 1080x1080, 1080x1350 or 1920x1080 — one size at a time
  or all three at once, straight from the canvas.

Everything is drawn on canvas in your browser. The app is static files
under `app/`, works fully offline, and never uploads a photo. All art is
original: no Rockstar logo, artwork or fonts. The display font is Anton
(SIL Open Font License), bundled under `app/fonts/`.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome.

## Files

- `app/index.html`, `app/style.css` — page and styling
- `app/src/main.js` — editor wiring (photos, controls, export)
- `app/src/cover.js` — the cover renderer (panels, grade, palms, caption)
- `app/src/shots.js` — deterministic `?shot=` scenes for screenshots
- `app/samples/` — the two illustrated sample scenes (PNG)
- `app/fonts/Anton-Regular.ttf` — Anton, SIL OFL
- `tools/gen-samples.mjs` — draws the sample scenes and renders them
  with the headless Chromium shell

Built for the [make.fun](https://make.fun/) "Make GTA 6 Cover Art" bounty.
