// Lantern Lane — a spot-the-difference game (Node 22, standard library only).
//
// This program hands the game in: it copies this repository's game/ and
// screenshots/ folders into the output directory and writes
// output/dossier.json with the make.fun library's buildDossier, so the
// judge can read the game from the dossier. It runs twice in the grader
// and must write identical bytes both times, so it does no work that
// depends on time, randomness or the network.
//
// Local run:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's caps for this bounty: the dossier text is capped at
// 160 KiB, at most 4 screenshots of 256 KiB each, and game/ stays under
// 993 files, 48 MiB and 1,000-byte paths.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
