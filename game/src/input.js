// Mouse and keyboard: every click lands on a region render.js drew, read
// from the same LAYOUT, so a click and a drawing can never disagree.

import { LAYOUT } from './render.js';
import { INGREDIENTS } from './config.js';
import {
  pickIngredient, grillSlot, addToPlate, clearHeld, clearPlate,
  serveTicket, useBreath, plateRecipe,
} from './world.js';

function inside(x, y, r) {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

function plateInside(x, y) {
  const { cx, cy, r } = LAYOUT.plate;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

/** Handle a click at logical coordinates (x, y). Returns what happened. */
export function handleClick(state, x, y, sfx) {
  // Tickets first: a ticket click serves the plate to that dragon.
  for (let i = 0; i < state.tickets.length; i++) {
    if (inside(x, y, LAYOUT.ticket(i))) {
      const ok = serveTicket(state, state.tickets[i].id);
      if (ok && sfx) sfx('serve');
      else if (sfx) sfx('no');
      return ok ? 'served' : 'no-match';
    }
  }
  // Ingredient bins.
  for (let i = 0; i < INGREDIENTS.length; i++) {
    if (inside(x, y, LAYOUT.bin(i))) {
      const ok = pickIngredient(state, INGREDIENTS[i].id);
      if (ok && sfx) sfx('pick');
      return ok ? 'picked' : 'full';
    }
  }
  // Grill slots.
  for (let i = 0; i < 4; i++) {
    if (inside(x, y, LAYOUT.grillSlot(i))) {
      const ok = grillSlot(state, i);
      if (ok && sfx) sfx('grill');
      return ok ? 'grill' : 'noop';
    }
  }
  // Plate: add the next tray item.
  if (plateInside(x, y) || inside(x, y, LAYOUT.plateRect)) {
    const ok = addToPlate(state);
    if (ok && sfx) sfx('plate');
    return ok ? 'plated' : 'noop';
  }
  // Trash: clear the tray first, else the plate.
  if (inside(x, y, LAYOUT.trash)) {
    if (state.held.length > 0) clearHeld(state);
    else clearPlate(state);
    if (sfx) sfx('trash');
    return 'trashed';
  }
  // Fire-breath button.
  if (inside(x, y, LAYOUT.breathButton)) {
    const ok = useBreath(state);
    if (ok && sfx) sfx('breath');
    return ok ? 'breath' : 'noop';
  }
  return 'noop';
}

/** Handle a key. Returns what happened. */
export function handleKey(state, key, sfx) {
  const k = key.toLowerCase();
  if (state.screen === 'over') {
    if (k === 'r') return 'restart';
    return 'noop';
  }
  // Bins: 1..9, 0, -, = map to the 12 ingredients in order.
  const binKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
  const binIndex = binKeys.indexOf(k);
  if (binIndex >= 0 && binIndex < INGREDIENTS.length) {
    const ok = pickIngredient(state, INGREDIENTS[binIndex].id);
    if (ok && sfx) sfx('pick');
    return ok ? 'picked' : 'full';
  }
  // Grill slots Q W E R.
  const slotKeys = ['q', 'w', 'e', 'r'];
  const slotIndex = slotKeys.indexOf(k);
  if (slotIndex >= 0) {
    const ok = grillSlot(state, slotIndex);
    if (ok && sfx) sfx('grill');
    return ok ? 'grill' : 'noop';
  }
  if (k === ' ') {
    const recipe = plateRecipe(state);
    if (recipe === null) return 'noop';
    const ticket = state.tickets.find((tk) => tk.recipeId === recipe.id);
    if (ticket === undefined) return 'noop';
    const ok = serveTicket(state, ticket.id);
    if (ok && sfx) sfx('serve');
    return ok ? 'served' : 'no-match';
  }
  if (k === 'b') {
    const ok = useBreath(state);
    if (ok && sfx) sfx('breath');
    return ok ? 'breath' : 'noop';
  }
  if (k === 't') {
    clearHeld(state);
    if (sfx) sfx('trash');
    return 'trashed';
  }
  if (k === 'p') {
    const ok = addToPlate(state);
    if (ok && sfx) sfx('plate');
    return ok ? 'plated' : 'noop';
  }
  return 'noop';
}
