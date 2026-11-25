// Dragonfire Kitchen: the loop. In a browser it runs the live game with a
// fixed-step simulation and a canvas that scales to the window. With
// ?shot=cover|decision|serve|feast&seed=7 it stages one screenshot scene
// and draws that single frame, so a screenshot is the game itself, frozen.

import { FIELD, STEP } from './config.js';
import { reset, step } from './world.js';
import { render } from './render.js';
import { handleClick, handleKey } from './input.js';
import { sfx } from './audio.js';
import { stageShot, SHOTS } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') ?? '20261125') || 20261125;

canvas.width = FIELD.width;
canvas.height = FIELD.height;

function fitCanvas() {
  const scale = Math.min(window.innerWidth / FIELD.width, window.innerHeight / FIELD.height);
  canvas.style.width = `${Math.floor(FIELD.width * scale)}px`;
  canvas.style.height = `${Math.floor(FIELD.height * scale)}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

function announce(state) {
  const ready = state.tickets.length;
  status.textContent = `Dragonfire Kitchen: ${ready} order${ready === 1 ? '' : 's'} open, ` +
    `${Math.ceil(state.timeLeft)} seconds left in the shift, ${state.coins} coins.`;
}

if (shot !== null && SHOTS.includes(shot)) {
  // Screenshot mode: stage the scene and draw one fixed frame. No clock
  // runs, so the frame is identical every time it is taken.
  const state = stageShot(shot, seed);
  render(ctx, state, 0);
  announce(state);
  document.title = `Dragonfire Kitchen — ${shot}`;
} else {
  let state = reset(seed);
  let last = performance.now();
  let acc = 0;
  let lastAnnounce = 0;

  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * FIELD.width;
    const y = ((event.clientY - rect.top) / rect.height) * FIELD.height;
    handleClick(state, x, y, sfx);
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === ' ') event.preventDefault();
    const result = handleKey(state, event.key, sfx);
    if (result === 'restart') state = reset((seed + Date.now()) % 2147483647);
  });

  function frame(now) {
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    acc += dt;
    while (acc >= STEP) {
      step(state, STEP);
      acc -= STEP;
    }
    render(ctx, state, now / 1000);
    if (now - lastAnnounce > 5000) {
      announce(state);
      lastAnnounce = now;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
