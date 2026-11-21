// Lantern Lane — game logic.
//
// Owns the whole play session: level select, the countdown, clicks on
// either panel, found markers, wrong-click penalties, hints, scoring
// and the end-of-level overlays. The two panels are painted every frame
// from the same scene painter (see scenes.js): panel A with no
// differences active, panel B with the level's full set, then the
// markers for what the player has already found are drawn on both.

import { LEVELS, SCENE_W, SCENE_H } from './levels.js';
import { drawScene } from './scenes.js';
import { playFound, playWrong, playHint, playWin, playTick, toggleMute, isMuted } from './audio.js';

const WRONG_TIME_PENALTY = 5;
const WRONG_SCORE_PENALTY = 25;
const FOUND_SCORE = 100;
const HINT_SCORE_COST = 50;
const HINTS_PER_LEVEL = 3;

export class SpotDifferenceGame {
  constructor(elements) {
    this.el = elements;
    this.leftCtx = elements.leftCanvas.getContext('2d');
    this.rightCtx = elements.rightCanvas.getContext('2d');
    this.state = 'menu';
    this.levelIndex = 0;
    this.found = new Set();
    this.hintsLeft = HINTS_PER_LEVEL;
    this.score = 0;
    this.timeLeft = 0;
    this.wrongClicks = 0;
    this.hintsUsed = 0;
    this.wrongMarks = [];
    this.floatTexts = [];
    this.hintPulse = null;
    this.hover = null;
    this.shakeUntil = 0;
    this.lastTickSecond = -1;
    this.bestScores = this.loadBest();
    this.bindInput();
    this.renderMenu();
    requestAnimationFrame((t) => this.frame(t));
  }

  loadBest() {
    try {
      return JSON.parse(localStorage.getItem('lantern-lane-best') || '{}');
    } catch {
      return {};
    }
  }

  saveBest() {
    try {
      localStorage.setItem('lantern-lane-best', JSON.stringify(this.bestScores));
    } catch {
      // Storage unavailable (file://, private mode): best scores just do not persist.
    }
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  bindInput() {
    const { leftCanvas, rightCanvas } = this.el;
    for (const canvas of [leftCanvas, rightCanvas]) {
      canvas.addEventListener('click', (e) => this.onPanelClick(e, canvas));
      canvas.addEventListener('mousemove', (e) => this.onPanelHover(e, canvas));
      canvas.addEventListener('mouseleave', () => {
        this.hover = null;
      });
    }
    this.el.hintButton.addEventListener('click', () => this.useHint());
    this.el.muteButton.addEventListener('click', () => this.updateMuteButton(toggleMute()));
    this.el.restartButton.addEventListener('click', () => this.startLevel(this.levelIndex));
    this.el.menuButton.addEventListener('click', () => this.showMenu());
    this.el.nextButton.addEventListener('click', () => this.nextLevel());
    this.el.retryButton.addEventListener('click', () => this.startLevel(this.levelIndex));
    this.el.againButton.addEventListener('click', () => this.showMenu());
    document.addEventListener('keydown', (e) => this.onKey(e));
    this.el.levelCards.forEach((card) => {
      card.addEventListener('click', () => this.startLevel(Number(card.dataset.level)));
    });
  }

  onKey(e) {
    if (e.key === 'm' || e.key === 'M') {
      this.updateMuteButton(toggleMute());
    } else if (e.key === 'h' || e.key === 'H') {
      if (this.state === 'playing') this.useHint();
    } else if (e.key === 'r' || e.key === 'R') {
      if (this.state === 'playing') this.startLevel(this.levelIndex);
    } else if (e.key === 'Escape') {
      this.showMenu();
    } else if (this.state === 'menu' && ['1', '2', '3'].includes(e.key)) {
      this.startLevel(Number(e.key) - 1);
    }
  }

  onPanelHover(e, canvas) {
    if (this.state !== 'playing') {
      this.hover = null;
      return;
    }
    const rect = canvas.getBoundingClientRect();
    this.hover = {
      x: ((e.clientX - rect.left) / rect.width) * SCENE_W,
      y: ((e.clientY - rect.top) / rect.height) * SCENE_H,
      side: canvas === this.el.leftCanvas ? 'left' : 'right',
    };
  }

  onPanelClick(e, canvas) {
    if (this.state !== 'playing') return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * SCENE_W;
    const y = ((e.clientY - rect.top) / rect.height) * SCENE_H;
    const hit = this.level.differences.find(
      (d) => !this.found.has(d.id) && Math.hypot(d.x - x, d.y - y) <= d.r + 6,
    );
    if (hit) {
      this.found.add(hit.id);
      this.score += FOUND_SCORE;
      this.floatTexts.push({ x: hit.x, y: hit.y, text: `+${FOUND_SCORE}`, until: performance.now() + 1100 });
      playFound();
      this.updateHud();
      if (this.found.size === this.level.differences.length) this.completeLevel();
    } else {
      this.wrongClicks += 1;
      this.score = Math.max(0, this.score - WRONG_SCORE_PENALTY);
      this.timeLeft = Math.max(0, this.timeLeft - WRONG_TIME_PENALTY);
      this.wrongMarks.push({ x, y, until: performance.now() + 900 });
      this.shakeUntil = performance.now() + 250;
      playWrong();
      this.updateHud();
    }
  }

  useHint() {
    if (this.state !== 'playing' || this.hintsLeft <= 0) return;
    const remaining = this.level.differences.filter((d) => !this.found.has(d.id));
    if (remaining.length === 0) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintsLeft -= 1;
    this.hintsUsed += 1;
    this.score = Math.max(0, this.score - HINT_SCORE_COST);
    this.hintPulse = { diff: pick, until: performance.now() + 3000 };
    this.el.hintText.textContent = pick.hint;
    playHint();
    this.updateHud();
  }

  startLevel(index, preset) {
    const restartingSameLevel = index === this.levelIndex && this.state !== 'menu';
    this.levelIndex = index;
    this.state = 'playing';
    this.found = new Set(preset?.found ?? []);
    this.score = preset?.score ?? (restartingSameLevel ? (this.scoreAtLevelStart ?? 0) : this.score);
    this.scoreAtLevelStart = this.score;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.timeLeft = preset?.timeLeft ?? this.level.timeLimit;
    this.wrongClicks = 0;
    this.hintsUsed = 0;
    this.wrongMarks = [];
    this.floatTexts = [];
    this.hintPulse = null;
    this.lastTickSecond = -1;
    this.el.hintText.textContent = 'Stuck? Press H or the Hint button — it costs 50 points.';
    this.showScreen('game');
    this.updateHud();
    this.updateMuteButton(isMuted());
  }

  nextLevel() {
    if (this.levelIndex + 1 < LEVELS.length) this.startLevel(this.levelIndex + 1);
    else this.showMenu();
  }

  completeLevel() {
    const timeBonus = this.timeLeft * 5;
    this.score += timeBonus;
    playWin();
    const best = this.bestScores[this.level.id] || 0;
    if (this.score > best) {
      this.bestScores[this.level.id] = this.score;
      this.saveBest();
    }
    const stars = this.starsEarned();
    this.el.clearTitle.textContent = `${this.level.name} complete!`;
    this.el.clearStars.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    this.el.clearDetail.textContent =
      `You found all ${this.level.differences.length} differences with ${this.timeLeft}s to spare. ` +
      `Time bonus +${timeBonus}. Score ${this.score} (best ${this.bestScores[this.level.id]}).`;
    this.el.nextButton.textContent =
      this.levelIndex + 1 < LEVELS.length ? `Next: ${LEVELS[this.levelIndex + 1].name} →` : 'Back to the lane →';
    this.state = 'level-clear';
    this.showScreen('clear');
    this.updateHud();
  }

  starsEarned() {
    if (this.wrongClicks === 0 && this.hintsUsed === 0 && this.timeLeft >= this.level.timeLimit * 0.4) return 3;
    if (this.wrongClicks <= 3 && this.hintsUsed <= 1) return 2;
    return 1;
  }

  failLevel() {
    this.state = 'level-fail';
    this.el.failDetail.textContent =
      `Time ran out with ${this.level.differences.length - this.found.size} difference` +
      `${this.level.differences.length - this.found.size === 1 ? '' : 's'} still hiding. ` +
      `You found: ${[...this.found].map((id) => this.level.differences.find((d) => d.id === id).label).join(', ') || 'none yet'}.`;
    this.showScreen('fail');
  }

  showMenu() {
    this.state = 'menu';
    this.renderMenu();
    this.showScreen('menu');
  }

  renderMenu() {
    this.el.levelCards.forEach((card, i) => {
      const best = this.bestScores[LEVELS[i].id];
      card.querySelector('.best').textContent = best ? `Best: ${best}` : 'Not played yet';
    });
  }

  showScreen(name) {
    for (const [key, screen] of Object.entries(this.el.screens)) {
      screen.classList.toggle('active', key === name);
    }
    this.el.hud.classList.toggle('hidden', name !== 'game');
  }

  updateHud() {
    const level = this.level;
    this.el.levelName.textContent = `${level.name} · ${level.difficultyLabel}`;
    this.el.foundCount.textContent = `${this.found.size} / ${level.differences.length} found`;
    this.el.foundPips.innerHTML = level.differences
      .map((d) => `<span class="pip ${this.found.has(d.id) ? 'found' : ''}" title="${d.label}">●</span>`)
      .join('');
    this.el.timerText.textContent = `${Math.ceil(this.timeLeft)}s`;
    this.el.timerBar.style.width = `${(this.timeLeft / level.timeLimit) * 100}%`;
    this.el.timerBar.classList.toggle('low', this.timeLeft <= 10);
    this.el.scoreText.textContent = `${this.score}`;
    this.el.hintButton.textContent = `💡 Hint (${this.hintsLeft})`;
    this.el.hintButton.disabled = this.hintsLeft <= 0 || this.state !== 'playing';
    this.el.foundList.innerHTML = level.differences
      .map(
        (d) =>
          `<li class="${this.found.has(d.id) ? 'found' : ''}">${this.found.has(d.id) ? '✓' : '○'} ${d.label}</li>`,
      )
      .join('');
  }

  updateMuteButton(muted) {
    this.el.muteButton.textContent = muted ? '🔇 Muted' : '🔊 Sound';
  }

  frame(now) {
    if (this.state === 'playing') {
      const prev = this.timeLeft;
      this.timeLeft = Math.max(0, this.timeLeft - 1 / 60);
      const whole = Math.ceil(this.timeLeft);
      if (whole !== this.lastTickSecond) {
        this.lastTickSecond = whole;
        if (whole <= 10 && whole > 0) playTick();
        this.updateHud();
      }
      if (this.timeLeft <= 0 && prev > 0) {
        this.timeLeft = 0;
        this.updateHud();
        this.failLevel();
      }
    }
    if (this.state === 'playing' || this.state === 'level-clear' || this.state === 'level-fail') {
      this.paint(now);
    }
    requestAnimationFrame((t) => this.frame(t));
  }

  paint(now) {
    const level = this.level;
    const allDiffs = new Set(level.differences.map((d) => d.id));
    const shake = now < this.shakeUntil ? (Math.random() - 0.5) * 6 : 0;
    this.paintPanel(this.leftCtx, level, new Set(), now, shake);
    this.paintPanel(this.rightCtx, level, allDiffs, now, shake);
  }

  paintPanel(ctx, level, activeDiffs, now, shake) {
    ctx.save();
    ctx.translate(shake, 0);
    drawScene(ctx, level.id, activeDiffs);
    // Found markers: a green ring and check on both panels.
    for (const diff of level.differences) {
      if (!this.found.has(diff.id)) continue;
      ctx.strokeStyle = '#2fae4e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, diff.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, diff.r - 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#2fae4e';
      ctx.beginPath();
      ctx.arc(diff.x + diff.r - 6, diff.y - diff.r + 6, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(diff.x + diff.r - 11, diff.y - diff.r + 6);
      ctx.lineTo(diff.x + diff.r - 7, diff.y - diff.r + 10);
      ctx.lineTo(diff.x + diff.r - 1, diff.y - diff.r + 1);
      ctx.stroke();
    }
    // Hint pulse: a shrinking ring over one unfound difference.
    if (this.hintPulse && now < this.hintPulse.until) {
      const d = this.hintPulse.diff;
      const phase = (now % 700) / 700;
      ctx.strokeStyle = `rgba(232,161,58,${1 - phase})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r + phase * 18, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Wrong-click marks: a fading red X where the player clicked.
    for (const mark of this.wrongMarks) {
      if (now > mark.until) continue;
      const alpha = (mark.until - now) / 900;
      ctx.strokeStyle = `rgba(217,56,43,${alpha})`;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(mark.x - 12, mark.y - 12);
      ctx.lineTo(mark.x + 12, mark.y + 12);
      ctx.moveTo(mark.x + 12, mark.y - 12);
      ctx.lineTo(mark.x - 12, mark.y + 12);
      ctx.stroke();
    }
    // Floating score text.
    for (const ft of this.floatTexts) {
      if (now > ft.until) continue;
      const alpha = (ft.until - now) / 1100;
      const rise = (1 - alpha) * 24;
      ctx.fillStyle = `rgba(47,174,78,${alpha})`;
      ctx.font = 'bold 20px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y - 20 - rise);
      ctx.textAlign = 'left';
    }
    // Hover crosshair: a faint ring on both panels at the mirrored spot.
    if (this.hover && this.state === 'playing') {
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.hover.x, this.hover.y, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(this.hover.x - 18, this.hover.y);
      ctx.lineTo(this.hover.x - 8, this.hover.y);
      ctx.moveTo(this.hover.x + 8, this.hover.y);
      ctx.lineTo(this.hover.x + 18, this.hover.y);
      ctx.moveTo(this.hover.x, this.hover.y - 18);
      ctx.lineTo(this.hover.x, this.hover.y - 8);
      ctx.moveTo(this.hover.x, this.hover.y + 8);
      ctx.lineTo(this.hover.x, this.hover.y + 18);
      ctx.stroke();
    }
    ctx.restore();
  }
}
