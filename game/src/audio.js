// Lantern Lane — synthesised sound effects.
//
// No audio assets: every sound is built with the Web Audio API at run
// time, so the game needs no network and no sound files. M toggles mute.

let audioCtx = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function ensureCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, startAt, dur, type, vol, slideTo) {
  const ctx = ensureCtx();
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + startAt + dur);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + dur + 0.05);
}

// A bright two-note pop when a difference is found.
export function playFound() {
  tone(660, 0, 0.12, 'sine', 0.25, 990);
  tone(990, 0.07, 0.16, 'sine', 0.2, 1320);
}

// A low buzz for a wrong click.
export function playWrong() {
  tone(160, 0, 0.18, 'square', 0.12, 110);
}

// A soft chime when a hint is used.
export function playHint() {
  tone(880, 0, 0.14, 'triangle', 0.18);
  tone(1174, 0.12, 0.2, 'triangle', 0.15);
}

// A little arpeggio when a level is cleared.
export function playWin() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.22, 'triangle', 0.2));
}

// A tick when the timer drops under ten seconds.
export function playTick() {
  tone(1200, 0, 0.05, 'sine', 0.1);
}
