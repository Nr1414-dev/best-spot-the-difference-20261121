# Lantern Lane — Spot the Difference

An original spot-the-difference game for the make.fun bounty
`best-spot-the-difference-game-20261121-0451`. It runs offline in a desktop
browser from static files — no network, no libraries, no assets.

## How to play

Open `game/index.html` (or serve `game/` with any static server) and pick a
level. Two pictures hang side by side: they look the same, but **7
differences** hide between them. Click a difference on either picture to
circle it in green on both. A wrong click costs 25 points and 5 seconds.
Find all 7 before the timer runs out.

- **3 levels**, rising difficulty: Morning Market (easy), Harbor at Dusk
  (medium), Lantern Festival (hard). Difficulty is tuned on salience,
  placement and crowding — early differences sit central and obvious,
  later ones hide at the edges and inside busy detail.
- **Hints** (H or the Hint button, 3 per level, −50 points): a pulsing ring
  and a riddle line point at one difference still hiding.
- **Timer pressure**: a shrinking bar, ticks under 10 seconds, −5s per
  wrong click; a time bonus when you clear a level.
- **Scoring**: +100 per find, stars for clean fast play, best score saved
  per level. Keyboard: `1/2/3` pick a level, `H` hint, `M` mute, `R`
  restart, `Esc` menu.
- **Sound**: all effects are synthesised with the Web Audio API — no audio
  files. Every scene is drawn by hand in code (canvas), so there are no
  image assets either.

## Layout

- `game/index.html` — the page: menu, HUD, the two panels, overlays
- `game/style.css` — presentation
- `game/src/main.js` — bootstrap and screenshot presets (`?shot=cover`)
- `game/src/game.js` — session logic: clicks, timer, scoring, hints, markers
- `game/src/levels.js` — the three levels and their difference answer keys
- `game/src/scenes.js` — the scene painters (one per level, drawn twice)
- `game/src/audio.js` — synthesised sound effects
- `main.ts` — the make.fun entry program: copies `game/` and `screenshots/`
  to the output directory and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
- `screenshots/` — real renders of the game in a browser

## Screenshots

The screenshots are real renders of this game's own code, taken in headless
Chromium: `1-cover.png` shows level 1 mid-hunt (3 found and circled, 4
still hiding, counter 3 / 7); `2-harbor.png` and `3-lantern.png` show the
later levels the same way; `4-menu.png` shows the level select.
