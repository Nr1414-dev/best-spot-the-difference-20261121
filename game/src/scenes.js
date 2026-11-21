// Lantern Lane — scene painters.
//
// One painter per scene. Each painter draws the whole scene from code
// (no image assets), taking `diffs`: a Set of difference ids that are
// ACTIVE in this panel. Panel A is always painted with an empty set,
// panel B with the level's full difference set, so the two panels are
// pixel-identical except for the designed differences. Every difference
// is one localised conditional edit inside the painter, and its hit
// region in levels.js matches the coordinates used here.

import { SCENE_W, SCENE_H } from './levels.js';

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function cloud(ctx, x, y, s) {
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.beginPath();
  ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 22 * s, y - 6 * s, 15 * s, 0, Math.PI * 2);
  ctx.arc(x + 44 * s, y, 17 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 16 * s, y, 76 * s, 14 * s);
}

function birdOnWire(ctx, x, y, flip) {
  ctx.strokeStyle = '#33302e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x - 6, y - 2, 6, Math.PI * 1.05, Math.PI * 1.95);
  ctx.arc(x + 6, y - 2, 6, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  circle(ctx, x, y - 6, 5, '#3a3f5c');
  ctx.fillStyle = '#f2a541';
  ctx.beginPath();
  ctx.moveTo(x + (flip ? -5 : 5), y - 7);
  ctx.lineTo(x + (flip ? -11 : 11), y - 4);
  ctx.lineTo(x + (flip ? -5 : 5), y - 3);
  ctx.closePath();
  ctx.fill();
}

function drawMarket(ctx, diffs) {
  // Sky, sun and hills.
  const sky = ctx.createLinearGradient(0, 0, 0, 280);
  sky.addColorStop(0, '#8ec9ef');
  sky.addColorStop(1, '#e8f6ff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_W, 280);
  circle(ctx, 82, 62, 26, '#ffd94d');
  if (!diffs.has('sun-rays')) {
    ctx.strokeStyle = '#ffd94d';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(82 + Math.cos(a) * 33, 62 + Math.sin(a) * 33);
      ctx.lineTo(82 + Math.cos(a) * 44, 62 + Math.sin(a) * 44);
      ctx.stroke();
    }
  }
  cloud(ctx, 220, 52, 1);
  cloud(ctx, 470, 40, 0.8);
  ctx.fillStyle = '#9ec98f';
  ctx.beginPath();
  ctx.moveTo(0, 260);
  ctx.quadraticCurveTo(180, 210, 360, 252);
  ctx.quadraticCurveTo(500, 282, SCENE_W, 244);
  ctx.lineTo(SCENE_W, 280);
  ctx.lineTo(0, 280);
  ctx.closePath();
  ctx.fill();

  // Ground.
  ctx.fillStyle = '#e9d8a8';
  ctx.fillRect(0, 280, SCENE_W, 140);
  ctx.strokeStyle = 'rgba(120,90,40,0.25)';
  ctx.lineWidth = 2;
  for (let y = 306; y < 420; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(SCENE_W, y);
    ctx.stroke();
  }

  // Bird wire and birds.
  ctx.strokeStyle = '#5b4636';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, 96);
  ctx.quadraticCurveTo(320, 108, 610, 92);
  ctx.stroke();
  birdOnWire(ctx, 150, 100, false);
  birdOnWire(ctx, 240, 102, true);
  birdOnWire(ctx, 420, 99, false);
  if (diffs.has('bird')) birdOnWire(ctx, 318, 100, false);

  // Market stall: posts, striped awning, counter.
  rect(ctx, 62, 148, 10, 160, '#7a5230');
  rect(ctx, 288, 148, 10, 160, '#7a5230');
  for (let i = 0; i < 6; i++) {
    const x = 58 + i * 40;
    let fill = i % 2 === 0 ? '#e4572e' : '#fff3e0';
    if (diffs.has('awning') && i === 3) fill = '#2e86ab';
    rect(ctx, x, 112, 40, 38, fill);
  }
  ctx.fillStyle = '#c94f2e';
  ctx.fillRect(54, 148, 244, 8);
  // Shop sign with a star.
  rect(ctx, 66, 190, 116, 42, '#fff8e7');
  ctx.strokeStyle = '#7a5230';
  ctx.lineWidth = 3;
  ctx.strokeRect(66, 190, 116, 42);
  ctx.fillStyle = '#2e4a3d';
  ctx.font = 'bold 17px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('FRESH', 118, 208);
  ctx.font = '11px Georgia, serif';
  ctx.fillText('FRUIT', 118, 224);
  if (!diffs.has('sign-star')) star(ctx, 92, 208, 7, '#e8a13a');
  ctx.textAlign = 'left';

  // Counter and crates.
  rect(ctx, 58, 300, 240, 14, '#8a5a33');
  rect(ctx, 58, 314, 240, 10, '#6e4525');
  // Apple crate.
  rect(ctx, 318, 296, 76, 34, '#a9713f');
  ctx.strokeStyle = '#7a4a22';
  ctx.lineWidth = 2;
  ctx.strokeRect(318, 296, 76, 34);
  const appleSpots = [[330, 312], [350, 308], [370, 312], [340, 324], [360, 322], [380, 324]];
  appleSpots.forEach(([x, y], i) => {
    if (diffs.has('apple') && i === 1) return; // the missing apple
    circle(ctx, x, y, 9, '#d9382b');
    ctx.strokeStyle = '#5c7a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 9);
    ctx.lineTo(x + 3, y - 14);
    ctx.stroke();
  });
  // Orange basket.
  ctx.fillStyle = '#c98f3d';
  ctx.beginPath();
  ctx.moveTo(428, 306);
  ctx.lineTo(484, 306);
  ctx.lineTo(476, 334);
  ctx.lineTo(436, 334);
  ctx.closePath();
  ctx.fill();
  circle(ctx, 440, 300, 10, '#f28c1e');
  circle(ctx, 460, 296, 10, '#f28c1e');
  if (!diffs.has('oranges')) circle(ctx, 474, 302, 10, '#f28c1e');
  ctx.fillStyle = '#3f7a2e';
  ctx.beginPath();
  ctx.moveTo(460, 288);
  ctx.lineTo(468, 282);
  ctx.lineTo(470, 290);
  ctx.closePath();
  ctx.fill();

  // Cat sitting on the crate, tail up or down.
  ellipse(ctx, 512, 306, 26, 18, '#e8e3da');
  circle(ctx, 534, 288, 13, '#e8e3da');
  ctx.fillStyle = '#e8e3da';
  ctx.beginPath();
  ctx.moveTo(524, 280);
  ctx.lineTo(527, 266);
  ctx.lineTo(533, 278);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(540, 279);
  ctx.lineTo(544, 265);
  ctx.lineTo(548, 279);
  ctx.closePath();
  ctx.fill();
  circle(ctx, 538, 286, 2, '#222');
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(544, 292);
  ctx.quadraticCurveTo(548, 294, 550, 291);
  ctx.stroke();
  ctx.strokeStyle = '#e8e3da';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (diffs.has('cat-tail')) {
    ctx.moveTo(488, 306);
    ctx.quadraticCurveTo(476, 318, 482, 330);
  } else {
    ctx.moveTo(488, 306);
    ctx.quadraticCurveTo(470, 296, 474, 278);
  }
  ctx.stroke();
}

function drawHarbor(ctx, diffs) {
  // Dusk sky and low sun glow.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#5b4a8a');
  sky.addColorStop(0.55, '#c96f4a');
  sky.addColorStop(1, '#f2a35e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_W, 300);
  circle(ctx, 120, 210, 34, '#ffd9a0');
  circle(ctx, 120, 210, 52, 'rgba(255,217,160,0.25)');
  cloud(ctx, 300, 60, 1.1);
  cloud(ctx, 480, 110, 0.9);
  // Gulls.
  birdOnWire(ctx, 180, 70, false);
  birdOnWire(ctx, 260, 60, true);
  if (diffs.has('gull')) birdOnWire(ctx, 330, 78, false);

  // Sea.
  const sea = ctx.createLinearGradient(0, 280, 0, 420);
  sea.addColorStop(0, '#3d7d8c');
  sea.addColorStop(1, '#1d4e5e');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 280, SCENE_W, 140);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (const [x, y, w] of [[60, 310, 90], [300, 340, 110], [480, 306, 80], [180, 380, 120], [420, 390, 100]]) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + w / 2, y - 5, x + w, y);
    ctx.stroke();
  }

  // Little red boat with mast and flag.
  ctx.fillStyle = '#b23a2e';
  ctx.beginPath();
  ctx.moveTo(140, 252);
  ctx.lineTo(224, 252);
  ctx.lineTo(210, 276);
  ctx.lineTo(154, 276);
  ctx.closePath();
  ctx.fill();
  rect(ctx, 178, 196, 5, 58, '#5b4636');
  ctx.fillStyle = '#f4ead8';
  ctx.beginPath();
  ctx.moveTo(183, 200);
  ctx.lineTo(183, 244);
  ctx.lineTo(216, 244);
  ctx.closePath();
  ctx.fill();
  if (!diffs.has('flag')) {
    ctx.fillStyle = '#e8b93a';
    ctx.beginPath();
    ctx.moveTo(183, 196);
    ctx.lineTo(208, 202);
    ctx.lineTo(183, 209);
    ctx.closePath();
    ctx.fill();
  }

  // Jumping fish (only in panel B).
  if (diffs.has('fish')) {
    ctx.strokeStyle = '#9fd8e8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(268, 330, 14, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = '#7fb8c9';
    ctx.beginPath();
    ctx.ellipse(268, 314, 12, 6, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(256, 318);
    ctx.lineTo(248, 312);
    ctx.lineTo(252, 322);
    ctx.closePath();
    ctx.fill();
  }

  // Buoy.
  circle(ctx, 452, 322, 14, diffs.has('buoy') ? '#e8c832' : '#d9382b');
  rect(ctx, 448, 300, 8, 10, '#333');
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(446, 316, 12, 3);

  // Lighthouse on the rocky point.
  ctx.fillStyle = '#5c5148';
  ctx.beginPath();
  ctx.moveTo(500, 300);
  ctx.lineTo(520, 250);
  ctx.lineTo(592, 250);
  ctx.lineTo(612, 300);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f4ead8';
  ctx.fillRect(528, 120, 56, 132);
  ctx.fillStyle = '#b23a2e';
  ctx.fillRect(528, 150, 56, 18);
  ctx.fillRect(528, 200, 56, 18);
  ctx.fillStyle = '#2e3a4a';
  ctx.fillRect(524, 96, 64, 26);
  ctx.fillStyle = diffs.has('window') ? '#2e3a4a' : '#ffd94d';
  ctx.fillRect(548, 104, 16, 12);
  rect(ctx, 540, 168, 22, 26, diffs.has('window') ? '#3a2e28' : '#ffe9a8');
  ctx.strokeStyle = '#2e3a4a';
  ctx.lineWidth = 2;
  ctx.strokeRect(540, 168, 22, 26);
  ctx.fillStyle = '#2e3a4a';
  ctx.beginPath();
  ctx.moveTo(520, 96);
  ctx.lineTo(556, 76);
  ctx.lineTo(592, 96);
  ctx.closePath();
  ctx.fill();
  if (!diffs.has('beam')) {
    ctx.fillStyle = 'rgba(255,240,170,0.35)';
    ctx.beginPath();
    ctx.moveTo(528, 108);
    ctx.lineTo(300, 60);
    ctx.lineTo(300, 150);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,240,170,0.5)';
    ctx.beginPath();
    ctx.moveTo(528, 108);
    ctx.lineTo(330, 84);
    ctx.lineTo(330, 130);
    ctx.closePath();
    ctx.fill();
  }

  // Wooden dock and rope coil.
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(30, 352, 180, 68);
  ctx.strokeStyle = '#5b3a1e';
  ctx.lineWidth = 2;
  for (let x = 60; x < 210; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 352);
    ctx.lineTo(x, 420);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(30, 376);
  ctx.lineTo(210, 376);
  ctx.stroke();
  if (!diffs.has('rope')) {
    ctx.strokeStyle = '#d8c08a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(96, 372, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(96, 372, 9, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Crates on the dock.
  rect(ctx, 150, 330, 34, 24, '#a9713f');
  ctx.strokeStyle = '#7a4a22';
  ctx.lineWidth = 2;
  ctx.strokeRect(150, 330, 34, 24);
  rect(ctx, 158, 312, 26, 18, '#c98f3d');
  ctx.strokeRect(158, 312, 26, 18);
}

function drawLantern(ctx, diffs) {
  // Night sky, stars and moon.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#101736');
  sky.addColorStop(1, '#2c2358');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_W, 300);
  const stars = [[60, 40], [200, 30], [260, 80], [360, 36], [470, 110], [90, 120], [590, 40], [420, 44], [40, 180], [600, 150]];
  stars.forEach(([x, y]) => star(ctx, x, y, 3, '#ffe9a8'));
  if (diffs.has('star')) star(ctx, 130, 52, 3.5, '#ffe9a8');
  // Moon: full in A, crescent in B.
  if (diffs.has('moon')) {
    ctx.fillStyle = '#f4ead8';
    ctx.beginPath();
    ctx.arc(548, 62, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2c2358';
    ctx.beginPath();
    ctx.arc(560, 54, 22, 0, Math.PI * 2);
    ctx.fill();
  } else {
    circle(ctx, 548, 62, 26, '#f4ead8');
    circle(ctx, 540, 56, 5, '#e0d3b2');
    circle(ctx, 556, 70, 4, '#e0d3b2');
  }
  // Fireworks.
  function burst(x, y, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8);
      ctx.lineTo(x + Math.cos(a) * 22, y + Math.sin(a) * 22);
      ctx.stroke();
    }
    circle(ctx, x, y, 4, color);
  }
  burst(120, 88, '#ff8fa3');
  burst(300, 66, '#8fd8ff');
  if (diffs.has('firework')) burst(428, 88, '#ffe066');

  // Rooftops.
  ctx.fillStyle = '#1c1433';
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.lineTo(0, 250);
  ctx.lineTo(120, 250);
  ctx.lineTo(120, 300);
  ctx.lineTo(240, 300);
  ctx.lineTo(240, 262);
  ctx.lineTo(400, 262);
  ctx.lineTo(400, 300);
  ctx.lineTo(520, 300);
  ctx.lineTo(520, 244);
  ctx.lineTo(640, 244);
  ctx.lineTo(640, 300);
  ctx.lineTo(640, 420);
  ctx.lineTo(0, 420);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#241a42';
  ctx.fillRect(0, 300, SCENE_W, 120);
  // Warm windows on the rooftops.
  [[60, 330], [180, 340], [300, 336], [460, 344], [570, 330]].forEach(([x, y]) => {
    rect(ctx, x, y, 26, 30, '#ffd94d');
    ctx.strokeStyle = '#241a42';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 13, y);
    ctx.lineTo(x + 13, y + 30);
    ctx.stroke();
  });
  // Cat on the roof (only in panel A).
  if (!diffs.has('roof-cat')) {
    ellipse(ctx, 96, 268, 22, 13, '#0f0b22');
    circle(ctx, 114, 256, 10, '#0f0b22');
    ctx.fillStyle = '#0f0b22';
    ctx.beginPath();
    ctx.moveTo(106, 250);
    ctx.lineTo(108, 238);
    ctx.lineTo(114, 248);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(118, 249);
    ctx.lineTo(122, 237);
    ctx.lineTo(125, 249);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0f0b22';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(76, 266);
    ctx.quadraticCurveTo(62, 258, 66, 244);
    ctx.stroke();
  }

  // Lantern string across the sky.
  ctx.strokeStyle = '#3a2c5e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, 118);
  ctx.quadraticCurveTo(320, 168, 610, 122);
  ctx.stroke();
  const lanternSpots = [
    [96, 138, '#e4572e'], [168, 148, '#f2a541'], [236, 148, '#e4572e'],
    [312, 152, '#2e86ab'], [388, 158, '#f2a541'], [462, 152, '#e4572e'],
    [536, 142, '#2e86ab'],
  ];
  lanternSpots.forEach(([x, y, color], i) => {
    if (diffs.has('lantern-missing') && i === 4) return;
    let fill = color;
    if (diffs.has('lantern-color') && i === 2) fill = '#3fae6a';
    ctx.strokeStyle = '#3a2c5e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x, y - 8);
    ctx.stroke();
    ellipse(ctx, x, y, 14, 17, fill);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x - 8, y - 12, 4, 22);
    rect(ctx, x - 6, y - 20, 12, 4, '#c9a227');
    rect(ctx, x - 6, y + 15, 12, 4, '#c9a227');
    ctx.fillStyle = '#fff3c4';
    ctx.font = 'bold 10px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('福', x, y + 4);
    ctx.textAlign = 'left';
  });

  // Festival banner between two poles.
  rect(ctx, 180, 236, 8, 84, '#4a3566');
  rect(ctx, 452, 236, 8, 84, '#4a3566');
  ctx.fillStyle = '#e4572e';
  ctx.beginPath();
  ctx.moveTo(188, 244);
  ctx.lineTo(452, 244);
  ctx.lineTo(444, 276);
  ctx.lineTo(196, 276);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('LANTERN FESTIVAL', 320, 268);
  if (!diffs.has('banner')) star(ctx, 320, 252, 7, '#ffe066');
  ctx.textAlign = 'left';

  // Crowd silhouettes at the bottom.
  ctx.fillStyle = '#120d26';
  [[80, 400], [150, 392], [230, 402], [330, 394], [420, 402], [500, 392], [580, 400]].forEach(([x, y]) => {
    circle(ctx, x, y - 22, 10, '#120d26');
    ctx.beginPath();
    ctx.arc(x, y + 8, 16, Math.PI, 0);
    ctx.fill();
  });
}

export function drawScene(ctx, levelId, diffs) {
  ctx.clearRect(0, 0, SCENE_W, SCENE_H);
  if (levelId === 'market') drawMarket(ctx, diffs);
  else if (levelId === 'harbor') drawHarbor(ctx, diffs);
  else drawLantern(ctx, diffs);
}
