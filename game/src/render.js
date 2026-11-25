// Every pixel of Dragonfire Kitchen: the stone wall, the order rail, the
// ingredient bins, the grill with its fire, the plate, the dragons at the
// serving counter, and the HUD. Nothing is loaded from outside: every shape
// is drawn here from the state, so a screenshot is a render of this code.

import { FIELD, PALETTE, FONT, INGREDIENTS, RECIPES, DRAGONS } from './config.js';
import { ingredientById, recipeById, dragonById, plateRecipe } from './world.js';

// ---------------------------------------------------------------- layout
// Hit regions are defined once here; input.js reads them from this module,
// so a click and a drawing can never disagree about where a thing is.

export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 48 },
  orderRail: { x: 0, y: 52, w: 1280, h: 76 },
  ticket: (i) => ({ x: 8 + i * 308, y: 54, w: 300, h: 72 }),
  bins: { x: 8, y: 136, w: 292, h: 316, cols: 3, cellW: 94, cellH: 76, gap: 4 },
  bin: (i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    return { x: 8 + col * 98, y: 136 + row * 80, w: 94, h: 76 };
  },
  grill: { x: 312, y: 140, w: 556, h: 112 },
  grillSlot: (i) => ({ x: 312 + i * 140, y: 140, w: 132, h: 104 }),
  fireStrip: { x: 312, y: 252, w: 556, h: 30 },
  plate: { cx: 470, cy: 366, r: 62 },
  plateRect: { x: 396, y: 296, w: 150, h: 144 },
  trash: { x: 576, y: 320, w: 84, h: 100 },
  breath: { x: 676, y: 300, w: 192, h: 140 },
  breathButton: { x: 692, y: 384, w: 160, h: 40 },
  dragons: { x: 880, y: 136, w: 392, h: 316 },
  dragon: (i) => ({ cx: 940 + i * 124, baseY: 404 }),
  bottomBar: { x: 0, y: 456, w: 1280, h: 24 },
};

// ---------------------------------------------------------------- helpers

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight = '600', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}

function bar(ctx, x, y, w, h, frac, fill, bg = '#00000088') {
  rr(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  if (frac > 0) {
    rr(ctx, x, y, Math.max(h, w * Math.min(1, frac)), h, h / 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }
}

function flame(ctx, x, y, s, t, seed) {
  const flick = Math.sin(t * 6 + seed * 2.1) * 0.12 + Math.sin(t * 11 + seed) * 0.06;
  const h = s * (1 + flick);
  ctx.beginPath();
  ctx.moveTo(x - s * 0.45, y);
  ctx.quadraticCurveTo(x - s * 0.5, y - h * 0.6, x, y - h);
  ctx.quadraticCurveTo(x + s * 0.5, y - h * 0.6, x + s * 0.45, y);
  ctx.closePath();
  ctx.fillStyle = PALETTE.fire1;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.25, y);
  ctx.quadraticCurveTo(x - s * 0.28, y - h * 0.45, x, y - h * 0.62);
  ctx.quadraticCurveTo(x + s * 0.28, y - h * 0.45, x + s * 0.25, y);
  ctx.closePath();
  ctx.fillStyle = PALETTE.fire2;
  ctx.fill();
}

// ---------------------------------------------------------------- ingredients

/** Draw one ingredient's icon centred at (x, y), fitting in `size` px. */
export function drawIngredient(ctx, id, x, y, size) {
  const s = size;
  ctx.save();
  ctx.translate(x, y);
  switch (id) {
    case 'meat': {
      ctx.fillStyle = '#b5542e';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.08, s * 0.34, s * 0.28, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f7ead0';
      ctx.lineWidth = s * 0.07;
      ctx.beginPath();
      ctx.moveTo(s * 0.22, -s * 0.05);
      ctx.lineTo(s * 0.42, -s * 0.28);
      ctx.moveTo(s * 0.28, s * 0.02);
      ctx.lineTo(s * 0.46, -s * 0.14);
      ctx.stroke();
      break;
    }
    case 'mushroom': {
      ctx.fillStyle = '#d8c9a3';
      ctx.fillRect(-s * 0.09, -s * 0.05, s * 0.18, s * 0.4);
      ctx.fillStyle = '#c65b4e';
      ctx.beginPath();
      ctx.arc(0, -s * 0.08, s * 0.36, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#f7ead0';
      ctx.beginPath();
      ctx.arc(-s * 0.16, -s * 0.22, s * 0.07, 0, Math.PI * 2);
      ctx.arc(s * 0.14, -s * 0.28, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'firepepper': {
      ctx.strokeStyle = '#e5322b';
      ctx.lineWidth = s * 0.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, -s * 0.3);
      ctx.quadraticCurveTo(s * 0.1, s * 0.1, s * 0.32, s * 0.32);
      ctx.stroke();
      ctx.strokeStyle = '#58b368';
      ctx.lineWidth = s * 0.08;
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, -s * 0.3);
      ctx.lineTo(-s * 0.42, -s * 0.42);
      ctx.stroke();
      ctx.fillStyle = '#ffc93c';
      ctx.beginPath();
      ctx.arc(s * 0.05, s * 0.05, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'mooncheese': {
      ctx.fillStyle = '#f2d060';
      ctx.beginPath();
      ctx.moveTo(-s * 0.34, s * 0.2);
      ctx.lineTo(s * 0.34, s * 0.2);
      ctx.lineTo(s * 0.1, -s * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d9a441';
      ctx.beginPath();
      ctx.arc(-s * 0.05, s * 0.02, s * 0.06, 0, Math.PI * 2);
      ctx.arc(s * 0.12, -s * 0.1, s * 0.045, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'skyherb': {
      ctx.fillStyle = '#58b368';
      for (const [dx, dy, rot] of [[-0.18, 0.05, -0.6], [0, -0.08, 0], [0.18, 0.05, 0.6]]) {
        ctx.save();
        ctx.translate(dx * s, dy * s);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.13, s * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.strokeStyle = '#2f7a44';
      ctx.lineWidth = s * 0.05;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.lineTo(0, -s * 0.1);
      ctx.stroke();
      break;
    }
    case 'dragonfruit': {
      ctx.fillStyle = '#e56ba0';
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.3, s * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#58b368';
      for (const [dx, dy] of [[-0.2, -0.2], [0.18, -0.24], [0, 0.1], [-0.22, 0.18]]) {
        ctx.beginPath();
        ctx.moveTo(dx * s - s * 0.07, dy * s);
        ctx.lineTo(dx * s, dy * s - s * 0.12);
        ctx.lineTo(dx * s + s * 0.07, dy * s);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'bread': {
      ctx.fillStyle = '#d9a441';
      rr(ctx, -s * 0.36, -s * 0.16, s * 0.72, s * 0.36, s * 0.16);
      ctx.fill();
      ctx.strokeStyle = '#a06a35';
      ctx.lineWidth = s * 0.05;
      ctx.beginPath();
      ctx.moveTo(-s * 0.18, -s * 0.14);
      ctx.lineTo(-s * 0.08, s * 0.14);
      ctx.moveTo(0, -s * 0.14);
      ctx.lineTo(s * 0.1, s * 0.14);
      ctx.moveTo(s * 0.18, -s * 0.14);
      ctx.lineTo(s * 0.28, s * 0.14);
      ctx.stroke();
      break;
    }
    case 'egg': {
      ctx.fillStyle = '#f7ead0';
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.3, s * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f0a818';
      ctx.beginPath();
      ctx.arc(s * 0.05, s * 0.05, s * 0.14, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'onion': {
      ctx.fillStyle = '#a86fc0';
      ctx.beginPath();
      ctx.arc(0, s * 0.05, s * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.2);
      ctx.quadraticCurveTo(s * 0.08, -s * 0.42, s * 0.2, -s * 0.44);
      ctx.quadraticCurveTo(s * 0.1, -s * 0.26, 0, -s * 0.2);
      ctx.fill();
      ctx.strokeStyle = '#7a4a9e';
      ctx.lineWidth = s * 0.04;
      ctx.beginPath();
      ctx.arc(0, s * 0.05, s * 0.2, 0.3, Math.PI - 0.3);
      ctx.stroke();
      break;
    }
    case 'tomato': {
      ctx.fillStyle = '#e84a3a';
      ctx.beginPath();
      ctx.arc(0, s * 0.06, s * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#58b368';
      for (let k = 0; k < 5; k++) {
        const a = -Math.PI / 2 + (k - 2) * 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.2);
        ctx.lineTo(Math.cos(a) * s * 0.2, -s * 0.2 + Math.sin(a) * s * 0.2);
        ctx.lineTo(Math.cos(a + 0.25) * s * 0.1, -s * 0.2 + Math.sin(a + 0.25) * s * 0.1);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'fish': {
      ctx.fillStyle = '#5aa8d8';
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.34, s * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, 0);
      ctx.lineTo(-s * 0.48, -s * 0.18);
      ctx.lineTo(-s * 0.48, s * 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#12303f';
      ctx.beginPath();
      ctx.arc(s * 0.18, -s * 0.04, s * 0.045, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'honey': {
      ctx.fillStyle = '#f0a818';
      rr(ctx, -s * 0.26, -s * 0.1, s * 0.52, s * 0.4, s * 0.1);
      ctx.fill();
      ctx.fillStyle = '#d98a06';
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.1, s * 0.26, s * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe9a8';
      ctx.beginPath();
      ctx.moveTo(s * 0.1, s * 0.3);
      ctx.quadraticCurveTo(s * 0.16, s * 0.42, s * 0.1, s * 0.46);
      ctx.quadraticCurveTo(s * 0.04, s * 0.42, s * 0.1, s * 0.3);
      ctx.fill();
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

// ---------------------------------------------------------------- dragons

/** A dragon's head, centred at (x, y), fitting in `size` px. */
export function drawDragonHead(ctx, dragon, x, y, size, mood = 'idle', t = 0) {
  const s = size;
  ctx.save();
  ctx.translate(x, y);
  // Horns.
  ctx.fillStyle = '#f7ead0';
  ctx.beginPath();
  ctx.moveTo(-s * 0.22, -s * 0.28);
  ctx.lineTo(-s * 0.34, -s * 0.52);
  ctx.lineTo(-s * 0.1, -s * 0.36);
  ctx.closePath();
  ctx.moveTo(s * 0.22, -s * 0.28);
  ctx.lineTo(s * 0.34, -s * 0.52);
  ctx.lineTo(s * 0.1, -s * 0.36);
  ctx.closePath();
  ctx.fill();
  // Head.
  ctx.fillStyle = dragon.color;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.34, 0, Math.PI * 2);
  ctx.fill();
  // Snout.
  ctx.fillStyle = dragon.dark;
  ctx.beginPath();
  ctx.ellipse(0, s * 0.16, s * 0.22, s * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff3d6';
  ctx.beginPath();
  ctx.arc(-s * 0.08, s * 0.12, s * 0.025, 0, Math.PI * 2);
  ctx.arc(s * 0.08, s * 0.12, s * 0.025, 0, Math.PI * 2);
  ctx.fill();
  // Eyes: happy = closed arcs, angry = slanted, else open.
  ctx.strokeStyle = '#1d110a';
  ctx.lineWidth = s * 0.045;
  ctx.lineCap = 'round';
  if (mood === 'happy') {
    ctx.beginPath();
    ctx.arc(-s * 0.16, -s * 0.06, s * 0.09, Math.PI * 1.15, Math.PI * 1.85);
    ctx.arc(s * 0.16, -s * 0.06, s * 0.09, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  } else if (mood === 'angry') {
    ctx.beginPath();
    ctx.moveTo(-s * 0.25, -s * 0.16);
    ctx.lineTo(-s * 0.07, -s * 0.04);
    ctx.moveTo(s * 0.25, -s * 0.16);
    ctx.lineTo(s * 0.07, -s * 0.04);
    ctx.stroke();
    ctx.fillStyle = '#ff5a3c';
    ctx.beginPath();
    ctx.arc(-s * 0.16, -s * 0.02, s * 0.05, 0, Math.PI * 2);
    ctx.arc(s * 0.16, -s * 0.02, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.arc(-s * 0.16, -s * 0.06, s * 0.09, 0, Math.PI * 2);
    ctx.arc(s * 0.16, -s * 0.06, s * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1d110a';
    ctx.beginPath();
    ctx.arc(-s * 0.16, -s * 0.06, s * 0.045, 0, Math.PI * 2);
    ctx.arc(s * 0.16, -s * 0.06, s * 0.045, 0, Math.PI * 2);
    ctx.fill();
  }
  // Breath smoke when angry.
  if (mood === 'angry') {
    ctx.fillStyle = '#8b93a388';
    ctx.beginPath();
    ctx.arc(-s * 0.1 + Math.sin(t * 3) * 2, s * 0.34, s * 0.07, 0, Math.PI * 2);
    ctx.arc(s * 0.12, s * 0.36, s * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** A whole dragon standing behind the counter, head at (cx, headY). */
function drawDragon(ctx, dragon, cx, headY, scale, mood, t, seed) {
  const bob = Math.sin(t * 1.4 + seed * 2) * 2;
  const y = headY + bob;
  // Body.
  ctx.fillStyle = dragon.color;
  ctx.beginPath();
  ctx.ellipse(cx, y + 78 * scale, 46 * scale, 58 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly.
  ctx.fillStyle = '#f7ead0';
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.ellipse(cx, y + 88 * scale, 28 * scale, 40 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Wing.
  ctx.fillStyle = dragon.dark;
  ctx.beginPath();
  ctx.moveTo(cx - 30 * scale, y + 40 * scale);
  ctx.quadraticCurveTo(cx - 78 * scale, y + 10 * scale, cx - 66 * scale, y + 52 * scale);
  ctx.quadraticCurveTo(cx - 52 * scale, y + 44 * scale, cx - 40 * scale, y + 66 * scale);
  ctx.closePath();
  ctx.fill();
  // Tail.
  ctx.strokeStyle = dragon.color;
  ctx.lineWidth = 12 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + 34 * scale, y + 120 * scale);
  ctx.quadraticCurveTo(cx + 78 * scale, y + 128 * scale, cx + 84 * scale, y + 96 * scale + Math.sin(t * 2 + seed) * 4);
  ctx.stroke();
  // Head.
  drawDragonHead(ctx, dragon, cx, y, 92 * scale, mood, t);
  // Happy heart.
  if (mood === 'happy') {
    ctx.fillStyle = '#ff5a7a';
    const hx = cx + 52 * scale;
    const hy = y - 18 * scale + Math.sin(t * 4) * 3;
    ctx.beginPath();
    ctx.moveTo(hx, hy + 8);
    ctx.bezierCurveTo(hx - 12, hy - 4, hx - 5, hy - 12, hx, hy - 5);
    ctx.bezierCurveTo(hx + 5, hy - 12, hx + 12, hy - 4, hx, hy + 8);
    ctx.fill();
  }
}

// ---------------------------------------------------------------- frame

function drawBackground(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, FIELD.height);
  g.addColorStop(0, PALETTE.wallTop);
  g.addColorStop(1, PALETTE.wallBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  // Stone courses.
  ctx.strokeStyle = '#00000033';
  ctx.lineWidth = 2;
  for (let y = 140; y < 456; y += 34) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(FIELD.width, y);
    ctx.stroke();
  }
  // Floor.
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, 440, FIELD.width, 16);
}

function drawTopBar(ctx, state) {
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, 0, FIELD.width, 48);
  ctx.fillStyle = PALETTE.hudEdge;
  ctx.fillRect(0, 48, FIELD.width, 2);
  // Mina's portrait: the named hearth-keeper, so the cover shows a named
  // character beside the dragons (metode-game M10b).
  ctx.save();
  ctx.beginPath();
  ctx.arc(286, 24, 16, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#f7ead0';
  ctx.fillRect(270, 8, 32, 32);
  ctx.fillStyle = '#5d3719';
  ctx.beginPath();
  ctx.arc(286, 26, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f7ead0';
  ctx.beginPath();
  ctx.ellipse(286, 12, 13, 6, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#1d110a';
  ctx.beginPath();
  ctx.arc(282, 25, 1.6, 0, Math.PI * 2);
  ctx.arc(290, 25, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(286, 24, 16, 0, Math.PI * 2);
  ctx.stroke();
  text(ctx, 'DRAGONFIRE KITCHEN', 16, 31, 20, PALETTE.text, '800');
  text(ctx, 'MINA', 308, 21, 10, PALETTE.gold, '800');
  text(ctx, 'HEARTH-KEEPER', 308, 34, 8, PALETTE.muted, '600');
  // Shift timer, big in the middle: a timer you can feel (kriteria 3).
  const mm = String(Math.floor(state.timeLeft / 60)).padStart(2, '0');
  const ss = String(Math.floor(state.timeLeft % 60)).padStart(2, '0');
  const urgent = state.timeLeft <= 30;
  text(ctx, 'SHIFT', 560, 18, 10, PALETTE.muted, '800', 'center');
  text(ctx, `${mm}:${ss}`, 560, 42, 26, urgent ? PALETTE.danger : PALETTE.text, '800', 'center');
  bar(ctx, 500, 44, 120, 3, state.timeLeft / 180, urgent ? PALETTE.danger : PALETTE.gold);
  // Coins and combo.
  ctx.fillStyle = PALETTE.gold;
  ctx.beginPath();
  ctx.arc(700, 24, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a06a35';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(700, 24, 7, 0, Math.PI * 2);
  ctx.stroke();
  text(ctx, `${state.coins}`, 716, 31, 20, PALETTE.text, '800');
  text(ctx, 'COINS', 716, 44, 8, PALETTE.muted, '700');
  if (state.combo > 1) {
    text(ctx, `COMBO ×${state.combo}`, 830, 31, 18, PALETTE.fire2, '800');
    bar(ctx, 830, 38, 90, 5, state.comboTimer / 25, PALETTE.fire1);
  } else {
    text(ctx, 'SERVE IN A ROW FOR COMBO', 830, 31, 11, PALETTE.muted, '600');
  }
  text(ctx, '8 RECIPES · 12 INGREDIENTS · 3 DRAGONS', 1272, 31, 11, PALETTE.muted, '700', 'right');
}

function drawTickets(ctx, state, t) {
  const shakeX = state.shake > 0 ? Math.sin(t * 40) * 3 : 0;
  for (let i = 0; i < 4; i++) {
    const r = LAYOUT.ticket(i);
    const ticket = state.tickets[i];
    rr(ctx, r.x + (ticket ? shakeX : 0), r.y, r.w, r.h, 8);
    ctx.fillStyle = ticket ? PALETTE.ticket : '#00000033';
    ctx.fill();
    if (!ticket) {
      ctx.strokeStyle = '#ffffff22';
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 2;
      rr(ctx, r.x, r.y, r.w, r.h, 8);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'NEXT ORDER COMING…', r.x + r.w / 2, r.y + 42, 12, PALETTE.muted, '700', 'center');
      continue;
    }
    const dragon = dragonById(ticket.dragonId);
    const recipe = recipeById(ticket.recipeId);
    ctx.strokeStyle = PALETTE.ticketEdge;
    ctx.lineWidth = 2;
    rr(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.stroke();
    // Portrait of the named dragon who ordered.
    ctx.save();
    ctx.beginPath();
    ctx.arc(r.x + 32, r.y + 32, 22, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = dragon.dark;
    ctx.fillRect(r.x + 8, r.y + 8, 48, 48);
    drawDragonHead(ctx, dragon, r.x + 32, r.y + 34, 44, state.moods[dragon.id], t);
    ctx.restore();
    ctx.strokeStyle = dragon.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(r.x + 32, r.y + 32, 22, 0, Math.PI * 2);
    ctx.stroke();
    text(ctx, `${dragon.name.toUpperCase()} · ${recipe.value}c`, r.x + 62, r.y + 20, 12, PALETTE.textDark, '800');
    text(ctx, recipe.name, r.x + 62, r.y + 38, 14, PALETTE.textDark, '800');
    // The dish's ingredients, as icons (readable at a glance).
    recipe.ings.forEach((ing, k) => {
      drawIngredient(ctx, ing, r.x + 72 + k * 26, r.y + 56, 20);
    });
    // Patience: the dragon's mood, draining in plain sight.
    const pColor = ticket.patience > 0.5 ? '#58b368' : ticket.patience > 0.25 ? PALETTE.gold : PALETTE.danger;
    bar(ctx, r.x + 10, r.y + r.h - 10, r.w - 20, 5, ticket.patience, pColor);
    if (recipe.id === 'feast') {
      // Pyra's feast intent, visible before she orders big (M8/S8).
      ctx.fillStyle = PALETTE.fire1;
      rr(ctx, r.x + r.w - 74, r.y - 2, 70, 16, 8);
      ctx.fill();
      text(ctx, '★ FEAST!', r.x + r.w - 39, r.y + 10, 10, '#fff', '800', 'center');
    }
  }
}

function drawBins(ctx, state) {
  text(ctx, 'INGREDIENTS — CLICK TO PICK UP', 8, 132, 10, PALETTE.muted, '800');
  INGREDIENTS.forEach((ing, i) => {
    const r = LAYOUT.bin(i);
    const empty = ing.id === 'firepepper' && state.pepper <= 0;
    const inTray = state.held.includes(ing.id);
    rr(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.fillStyle = empty ? '#00000044' : PALETTE.counter;
    ctx.fill();
    ctx.strokeStyle = inTray ? PALETTE.gold : PALETTE.counterEdge;
    ctx.lineWidth = inTray ? 3 : 1.5;
    rr(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.stroke();
    ctx.globalAlpha = empty ? 0.35 : 1;
    drawIngredient(ctx, ing.id, r.x + r.w / 2, r.y + 26, 34);
    ctx.globalAlpha = 1;
    text(ctx, ing.name.toUpperCase(), r.x + r.w / 2, r.y + 58, 9, empty ? PALETTE.muted : PALETTE.text, '700', 'center');
    if (ing.id === 'firepepper') {
      text(ctx, `×${state.pepper} LEFT`, r.x + r.w / 2, r.y + 70, 9, state.pepper > 0 ? PALETTE.fire2 : PALETTE.danger, '800', 'center');
    } else if (ing.grill) {
      text(ctx, 'GRILL', r.x + r.w / 2, r.y + 70, 8, PALETTE.muted, '700', 'center');
    }
  });
}

function drawGrill(ctx, state, t) {
  text(ctx, 'GRILL — CLICK A SLOT TO COOK / TAKE OFF', 312, 132, 10, PALETTE.muted, '800');
  for (let i = 0; i < 4; i++) {
    const r = LAYOUT.grillSlot(i);
    const item = state.grill[i];
    rr(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.fillStyle = PALETTE.grillStone;
    ctx.fill();
    ctx.strokeStyle = PALETTE.grillDark;
    ctx.lineWidth = 2;
    rr(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.stroke();
    // Grate lines.
    ctx.strokeStyle = '#00000055';
    ctx.lineWidth = 2;
    for (let g = 1; g < 4; g++) {
      ctx.beginPath();
      ctx.moveTo(r.x + 8, r.y + (r.h / 4) * g);
      ctx.lineTo(r.x + r.w - 8, r.y + (r.h / 4) * g);
      ctx.stroke();
    }
    if (item === null) {
      text(ctx, `SLOT ${i + 1}`, r.x + r.w / 2, r.y + r.h / 2 + 4, 11, '#ffffff55', '700', 'center');
      continue;
    }
    drawIngredient(ctx, item.ing, r.x + r.w / 2, r.y + 42, 52);
    if (item.burnt) {
      ctx.fillStyle = '#00000088';
      rr(ctx, r.x, r.y, r.w, r.h, 8);
      ctx.fill();
      text(ctx, 'BURNT!', r.x + r.w / 2, r.y + 30, 14, PALETTE.danger, '800', 'center');
      text(ctx, 'CLICK TO TRASH', r.x + r.w / 2, r.y + 88, 9, PALETTE.text, '700', 'center');
    } else if (item.done) {
      ctx.strokeStyle = PALETTE.good;
      ctx.lineWidth = 4;
      rr(ctx, r.x + 3, r.y + 3, r.w - 6, r.h - 6, 8);
      ctx.stroke();
      text(ctx, 'DONE — TAKE IT!', r.x + r.w / 2, r.y + 76, 11, PALETTE.good, '800', 'center');
      bar(ctx, r.x + 16, r.y + r.h - 12, r.w - 32, 5, 1 - item.doneTimer / 8, PALETTE.danger);
    } else {
      bar(ctx, r.x + 16, r.y + r.h - 12, r.w - 32, 6, item.progress, PALETTE.fire2);
      text(ctx, 'COOKING…', r.x + r.w / 2, r.y + 76, 10, PALETTE.fire2, '800', 'center');
    }
  }
  // Fire under the grill, always burning (and bursting on breath).
  const burst = state.breathBurst > 0 ? 1.6 : 1;
  for (let fx = 320; fx <= 860; fx += 26) {
    flame(ctx, fx, 282, 13 * burst, t, fx);
  }
  if (state.breathBurst > 0) {
    ctx.fillStyle = `rgba(255, 201, 60, ${state.breathBurst * 0.25})`;
    ctx.fillRect(312, 140, 556, 142);
  }
}

function drawPlate(ctx, state, t) {
  const { cx, cy, r } = LAYOUT.plate;
  text(ctx, 'PLATE — CLICK TO ADD FROM TRAY', 312, 292, 10, PALETTE.muted, '800');
  const recipe = plateRecipe(state);
  if (recipe !== null) {
    const glow = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 1.5);
    glow.addColorStop(0, '#7ee08144');
    glow.addColorStop(1, '#7ee08100');
    ctx.fillStyle = glow;
    ctx.fillRect(cx - r * 1.5, cy - r * 1.5, r * 3, r * 3);
  }
  ctx.fillStyle = PALETTE.plate;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
  ctx.stroke();
  state.plate.forEach((ing, k) => {
    const a = -Math.PI / 2 + (k / Math.max(1, state.plate.length)) * Math.PI * 2;
    drawIngredient(ctx, ing, cx + Math.cos(a) * 26, cy + Math.sin(a) * 26, 34);
  });
  if (state.plate.length === 0) {
    text(ctx, 'EMPTY', cx, cy + 5, 12, '#8a6a42', '700', 'center');
  }
  if (recipe !== null) {
    text(ctx, `✓ ${recipe.name.toUpperCase()} — READY!`, cx, cy + r + 20, 13, PALETTE.good, '800', 'center');
  } else if (state.plate.length > 0) {
    text(ctx, 'KEEP ADDING…', cx, cy + r + 20, 11, PALETTE.muted, '700', 'center');
  }
  // Trash can.
  const tr = LAYOUT.trash;
  ctx.fillStyle = PALETTE.counterDark;
  rr(ctx, tr.x, tr.y, tr.w, tr.h, 8);
  ctx.fill();
  ctx.strokeStyle = PALETTE.counterEdge;
  ctx.lineWidth = 2;
  rr(ctx, tr.x, tr.y, tr.w, tr.h, 8);
  ctx.stroke();
  ctx.fillStyle = '#8b93a3';
  ctx.beginPath();
  ctx.moveTo(tr.x + 18, tr.y + 22);
  ctx.lineTo(tr.x + 66, tr.y + 22);
  ctx.lineTo(tr.x + 60, tr.y + 82);
  ctx.lineTo(tr.x + 24, tr.y + 82);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5d3719';
  ctx.fillRect(tr.x + 12, tr.y + 12, 60, 8);
  text(ctx, 'TRASH', tr.x + tr.w / 2, tr.y + 96, 10, PALETTE.text, '800', 'center');
  // Fire-breath meter and button.
  const br = LAYOUT.breath;
  text(ctx, 'FIRE-BREATH', br.x, br.y + 12, 11, PALETTE.fire2, '800');
  text(ctx, 'A full meter finishes the whole grill at once.', br.x, br.y + 28, 10, PALETTE.muted, '600');
  bar(ctx, br.x, br.y + 40, 150, 14, state.breath / 100, PALETTE.fire1);
  text(ctx, `${Math.floor(state.breath)}%`, br.x + 158, br.y + 52, 11, PALETTE.text, '800');
  const bb = LAYOUT.breathButton;
  const ready = state.breath >= 100;
  rr(ctx, bb.x, bb.y, bb.w, bb.h, 10);
  ctx.fillStyle = ready ? PALETTE.fire1 : '#00000044';
  ctx.fill();
  ctx.strokeStyle = ready ? PALETTE.fire2 : '#ffffff33';
  ctx.lineWidth = 2;
  rr(ctx, bb.x, bb.y, bb.w, bb.h, 10);
  ctx.stroke();
  flame(ctx, bb.x + 22, bb.y + 30, 9, t, 3);
  text(ctx, ready ? 'BREATH! (B)' : 'BREATH — FILL IT UP', bb.x + 38, bb.y + 26, 12, ready ? '#fff' : PALETTE.muted, '800');
}

function drawDragons(ctx, state, t) {
  // Serving counter.
  ctx.fillStyle = PALETTE.counter;
  rr(ctx, 880, 400, 392, 40, 8);
  ctx.fill();
  ctx.fillStyle = PALETTE.counterEdge;
  ctx.fillRect(880, 400, 392, 6);
  DRAGONS.forEach((dragon, i) => {
    const { cx, baseY } = LAYOUT.dragon(i);
    const mood = state.moods[dragon.id];
    const ticket = state.tickets.find((tk) => tk.dragonId === dragon.id);
    // Name and patience bar above the dragon's head — the name alone, so
    // three labels never run into each other; the dish is on its ticket.
    if (ticket !== undefined) {
      text(ctx, dragon.name.toUpperCase(), cx, 158, 12, PALETTE.text, '800', 'center');
      bar(ctx, cx - 52, 166, 104, 8, ticket.patience, ticket.patience > 0.5 ? '#58b368' : ticket.patience > 0.25 ? PALETTE.gold : PALETTE.danger);
    } else {
      text(ctx, dragon.name.toUpperCase(), cx, 158, 12, PALETTE.muted, '800', 'center');
      text(ctx, 'WAITING…', cx, 180, 9, PALETTE.muted, '600', 'center');
    }
    drawDragon(ctx, dragon, cx, 248, 1, mood, t, i);
  });
  // Floating +coins text.
  for (const f of state.floaters) {
    ctx.globalAlpha = Math.min(1, f.t);
    text(ctx, f.text, f.x, f.y - (1.2 - f.t) * 30, 22, f.color, '800', 'center');
    ctx.globalAlpha = 1;
  }
}

function drawBottomBar(ctx, state) {
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, 456, FIELD.width, 24);
  text(ctx, 'TRAY:', 10, 472, 10, PALETTE.muted, '800');
  for (let i = 0; i < 3; i++) {
    const x = 52 + i * 30;
    rr(ctx, x, 460, 26, 17, 4);
    ctx.fillStyle = '#ffffff14';
    ctx.fill();
    ctx.strokeStyle = '#ffffff33';
    ctx.lineWidth = 1;
    rr(ctx, x, 460, 26, 17, 4);
    ctx.stroke();
    if (state.held[i] !== undefined) drawIngredient(ctx, state.held[i], x + 13, 468, 14);
  }
  text(ctx, 'CLICK BIN → GRILL → PLATE → TICKET · KEYS 1–0 BINS · Q/W/E/R GRILL · SPACE SERVE · B BREATH · T CLEAR TRAY', 640, 472, 10, PALETTE.muted, '600', 'center');
}

function drawGameOver(ctx, state) {
  ctx.fillStyle = '#1d110acc';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = PALETTE.ticket;
  rr(ctx, 340, 90, 600, 300, 16);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ticketEdge;
  ctx.lineWidth = 3;
  rr(ctx, 340, 90, 600, 300, 16);
  ctx.stroke();
  text(ctx, 'SHIFT OVER!', 640, 150, 34, PALETTE.textDark, '800', 'center');
  text(ctx, 'The dragons are fed — for tonight.', 640, 178, 14, '#8a6a42', '600', 'center');
  text(ctx, `COINS EARNED  ${state.coins}`, 640, 226, 20, PALETTE.textDark, '800', 'center');
  text(ctx, `DISHES SERVED  ${state.served}    MISSED  ${state.missed}    BEST COMBO  ×${state.bestCombo}`, 640, 262, 15, PALETTE.textDark, '700', 'center');
  text(ctx, 'Press R to cook another shift.', 640, 320, 14, '#8a6a42', '700', 'center');
  text(ctx, 'DRAGONFIRE KITCHEN — 8 recipes · 12 ingredients · 3 dragons', 640, 360, 11, PALETTE.muted, '600', 'center');
}

/** Draw the whole game for a state at animation time `t` (seconds). */
export function render(ctx, state, t = 0) {
  ctx.save();
  if (state.shake > 0) ctx.translate(Math.sin(t * 40) * 4, 0);
  drawBackground(ctx, t);
  drawTopBar(ctx, state);
  drawTickets(ctx, state, t);
  drawBins(ctx, state);
  drawGrill(ctx, state, t);
  drawPlate(ctx, state, t);
  drawDragons(ctx, state, t);
  drawBottomBar(ctx, state);
  if (state.screen === 'over') drawGameOver(ctx, state);
  ctx.restore();
}
