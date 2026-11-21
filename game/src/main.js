// Lantern Lane — entry point.
//
// Wires the page's elements into the game and reads the URL for a
// screenshot preset: ?shot=cover starts level 1 with three differences
// already found, ?shot=level2 and ?shot=level3 do the same on the later
// levels, ?shot=menu shows the title screen. These are the game's own
// states (the same found markers a player would earn), used to take the
// entry's screenshots. Without a preset the game opens on the menu.

import { LEVELS } from './levels.js';
import { SpotDifferenceGame } from './game.js';

const $ = (id) => document.getElementById(id);

const game = new SpotDifferenceGame({
  leftCanvas: $('panel-left'),
  rightCanvas: $('panel-right'),
  hud: $('hud'),
  screens: {
    menu: $('screen-menu'),
    game: $('screen-game'),
    clear: $('screen-clear'),
    fail: $('screen-fail'),
  },
  levelCards: [...document.querySelectorAll('.level-card')],
  levelName: $('level-name'),
  foundCount: $('found-count'),
  foundPips: $('found-pips'),
  timerText: $('timer-text'),
  timerBar: $('timer-bar'),
  scoreText: $('score-text'),
  hintButton: $('hint-button'),
  hintText: $('hint-text'),
  muteButton: $('mute-button'),
  restartButton: $('restart-button'),
  menuButton: $('menu-button'),
  nextButton: $('next-button'),
  retryButton: $('retry-button'),
  againButton: $('again-button'),
  foundList: $('found-list'),
  clearTitle: $('clear-title'),
  clearStars: $('clear-stars'),
  clearDetail: $('clear-detail'),
  failDetail: $('fail-detail'),
});

// Screenshot presets: real game states, reached through the same code
// a player uses. The cover shows level 1 mid-hunt: three differences
// found and circled, four still hiding, the counter reading 3 / 7.
const shot = new URLSearchParams(location.search).get('shot');
const presets = {
  cover: { level: 0, found: ['apple', 'sun-rays', 'awning'], timeLeft: 96, score: 300 },
  level2: { level: 1, found: ['beam', 'buoy'], timeLeft: 121, score: 200 },
  level3: { level: 2, found: ['moon', 'firework', 'lantern-color', 'star', 'banner'], timeLeft: 74, score: 500 },
  menu: null,
};
if (shot && shot in presets && presets[shot]) {
  const p = presets[shot];
  const ids = LEVELS[p.level].differences.map((d) => d.id);
  game.startLevel(p.level, { found: p.found.filter((id) => ids.includes(id)), timeLeft: p.timeLeft, score: p.score });
}
