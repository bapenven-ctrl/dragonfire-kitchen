// The game's rules: orders, grill, plate, dragons, combo, fire-breath.
// No drawing here and no input here: this file only moves the state forward
// and answers what the player may do next, so a screenshot scene can stage
// the same state a real game reaches.

import {
  STEP, SHIFT_SECONDS, GRILL_SLOTS, BURN_AFTER_SECONDS,
  PEPPER_START, PEPPER_REFILL_SECONDS, PEPPER_MAX,
  BREATH_PER_SERVE, BREATH_MAX, COMBO_WINDOW_SECONDS, COMBO_MAX,
  TICKETS_START, TICKETS_MAX, ORDER_EVERY_START, ORDER_EVERY_END,
  INGREDIENTS, RECIPES, DRAGONS,
} from './config.js';
import { makeRng, pick } from './random.js';

export const ingredientById = (id) => INGREDIENTS.find((i) => i.id === id);
export const recipeById = (id) => RECIPES.find((r) => r.id === id);
export const dragonById = (id) => DRAGONS.find((d) => d.id === id);

/** The tray holds at most this many ingredients at once. */
export const TRAY_MAX = 3;
/** The plate holds at most this many ingredients at once. */
export const PLATE_MAX = 4;

/** A fresh state. `seed` fixes every random choice that follows. */
export function freshState(seed) {
  return {
    seed,
    rng: makeRng(seed),
    screen: 'play',
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    coins: 0,
    served: 0,
    missed: 0,
    bestCombo: 0,
    combo: 0,
    comboTimer: 0,
    held: [],
    grill: Array.from({ length: GRILL_SLOTS }, () => null),
    plate: [],
    tickets: [],
    nextTicketId: 1,
    pepper: PEPPER_START,
    pepperTimer: PEPPER_REFILL_SECONDS,
    breath: 0,
    breathBurst: 0,
    orderTimer: ORDER_EVERY_START,
    shake: 0,
    serveFlash: 0,
    floaters: [],
    moods: { pyra: 'idle', ash: 'idle', bramble: 'idle' },
    moodTimer: { pyra: 0, ash: 0, bramble: 0 },
  };
}

/** Start a shift: fresh state plus one ticket per dragon. */
export function reset(seed) {
  const state = freshState(seed);
  for (const dragon of DRAGONS) spawnTicket(state, dragon.id, null);
  return state;
}

/** The recipe a plate matches, or null. Order does not matter. */
export function plateRecipe(state) {
  if (state.plate.length === 0) return null;
  const have = [...state.plate].sort().join(',');
  return RECIPES.find((r) => [...r.ings].sort().join(',') === have) ?? null;
}

/** Spawn a ticket. With no dragon or recipe given, the game chooses: the
 *  dragon with the fewest open tickets, and a recipe it may order (only
 *  Pyra, and only when she has no ticket open, may order the Hoard Feast —
 *  she saves her patience for it instead of ordering constantly). */
export function spawnTicket(state, dragonId = null, recipeId = null) {
  const dragon = dragonId !== null
    ? dragonById(dragonId)
    : [...DRAGONS].sort((a, b) => openTickets(state, a.id) - openTickets(state, b.id))[0];
  let recipe;
  if (recipeId !== null) {
    recipe = recipeById(recipeId);
  } else if (dragon.id === 'pyra' && openTickets(state, 'pyra') === 0 && state.rng() < 0.35) {
    recipe = recipeById('feast');
  } else {
    const pool = RECIPES.filter((r) => r.id !== 'feast');
    recipe = pick(state.rng, pool);
  }
  const ticket = {
    id: state.nextTicketId++,
    dragonId: dragon.id,
    recipeId: recipe.id,
    patience: 1,
    maxPatience: dragon.patience,
  };
  state.tickets.push(ticket);
  return ticket;
}

export function openTickets(state, dragonId) {
  return state.tickets.filter((t) => t.dragonId === dragonId).length;
}

/** Pick an ingredient from its bin onto the tray. Fire pepper spends stock. */
export function pickIngredient(state, id) {
  if (state.screen !== 'play') return false;
  if (state.held.length >= TRAY_MAX) return false;
  if (id === 'firepepper' && state.pepper <= 0) return false;
  if (id === 'firepepper') state.pepper -= 1;
  state.held.push(id);
  return true;
}

/** Put the first grillable item from the tray onto a grill slot; picking a
 *  finished item off a slot returns it to the tray; a burnt item is trashed. */
export function grillSlot(state, slot) {
  if (state.screen !== 'play') return false;
  const item = state.grill[slot];
  if (item === null) {
    const heldIndex = state.held.findIndex((id) => ingredientById(id).grill);
    if (heldIndex < 0) return false;
    const id = state.held.splice(heldIndex, 1)[0];
    state.grill[slot] = { ing: id, progress: 0, done: false, doneTimer: 0 };
    return true;
  }
  if (item.done && !item.burnt) {
    if (state.held.length >= TRAY_MAX) return false;
    state.held.push(item.ing);
    state.grill[slot] = null;
    return true;
  }
  if (item.burnt) {
    state.grill[slot] = null;
    return true;
  }
  return false;
}

/** Move the first tray item onto the plate. */
export function addToPlate(state) {
  if (state.screen !== 'play') return false;
  if (state.held.length === 0 || state.plate.length >= PLATE_MAX) return false;
  state.plate.push(state.held.shift());
  return true;
}

/** Empty the tray (tapped ingredients go back to the bins, pepper included). */
export function clearHeld(state) {
  for (const id of state.held) if (id === 'firepepper') state.pepper = Math.min(PEPPER_MAX, state.pepper + 1);
  state.held = [];
}

/** Empty the plate. */
export function clearPlate(state) {
  state.plate = [];
}

/** Serve the plate to a ticket's dragon. Only an exact recipe match serves;
 *  anything else shakes the ticket and serves nothing. */
export function serveTicket(state, ticketId) {
  if (state.screen !== 'play') return false;
  const ticket = state.tickets.find((t) => t.id === ticketId);
  if (ticket === undefined) return false;
  const recipe = plateRecipe(state);
  if (recipe === null || recipe.id !== ticket.recipeId) {
    state.shake = 0.35;
    return false;
  }
  const tip = Math.round(recipe.value * ticket.patience * 0.5);
  const earned = recipe.value + tip;
  state.coins += earned;
  state.served += 1;
  state.combo = state.comboTimer > 0 ? Math.min(COMBO_MAX, state.combo + 1) : 1;
  state.comboTimer = COMBO_WINDOW_SECONDS;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.breath = Math.min(BREATH_MAX, state.breath + BREATH_PER_SERVE);
  state.tickets = state.tickets.filter((t) => t.id !== ticketId);
  state.plate = [];
  state.serveFlash = 0.6;
  state.moods[ticket.dragonId] = 'happy';
  state.moodTimer[ticket.dragonId] = 2;
  state.floaters.push({ x: 560, y: 320, text: `+${earned}`, color: '#f2c94c', t: 1.2 });
  return true;
}

/** Fire-breath: a full meter finishes everything on the grill at once. */
export function useBreath(state) {
  if (state.screen !== 'play') return false;
  if (state.breath < BREATH_MAX) return false;
  for (const item of state.grill) {
    if (item !== null && !item.done) {
      item.progress = 1;
      item.done = true;
      item.doneTimer = 0;
    }
  }
  state.breath = 0;
  state.breathBurst = 1;
  return true;
}

/** One fixed step of the shift. */
export function step(state, dt = STEP) {
  if (state.screen === 'over') {
    for (const f of state.floaters) f.t -= dt;
    state.floaters = state.floaters.filter((f) => f.t > 0);
    return;
  }
  state.elapsed += dt;
  state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);
  if (state.timeLeft <= 0) {
    state.screen = 'over';
    return;
  }
  // Grill: cook, then count down to burnt.
  for (const item of state.grill) {
    if (item === null) continue;
    if (!item.done) {
      item.progress = Math.min(1, item.progress + dt / ingredientById(item.ing).cook);
      if (item.progress >= 1) {
        item.done = true;
        item.doneTimer = 0;
      }
    } else if (!item.burnt) {
      item.doneTimer += dt;
      if (item.doneTimer >= BURN_AFTER_SECONDS) item.burnt = true;
    }
  }
  // Patience: a ticket whose dragon loses patience walks out angry.
  for (const ticket of [...state.tickets]) {
    ticket.patience -= dt / ticket.maxPatience;
    if (ticket.patience <= 0) {
      state.tickets = state.tickets.filter((t) => t.id !== ticket.id);
      state.missed += 1;
      state.combo = 0;
      state.comboTimer = 0;
      state.moods[ticket.dragonId] = 'angry';
      state.moodTimer[ticket.dragonId] = 2.5;
      state.shake = 0.5;
    }
  }
  // New orders arrive faster as the shift goes on.
  state.orderTimer -= dt;
  if (state.orderTimer <= 0) {
    if (state.tickets.length < TICKETS_MAX) spawnTicket(state);
    const frac = state.elapsed / SHIFT_SECONDS;
    state.orderTimer = ORDER_EVERY_START + (ORDER_EVERY_END - ORDER_EVERY_START) * frac;
  }
  // Fire pepper slowly restocks.
  state.pepperTimer -= dt;
  if (state.pepperTimer <= 0) {
    state.pepper = Math.min(PEPPER_MAX, state.pepper + 1);
    state.pepperTimer = PEPPER_REFILL_SECONDS;
  }
  // Combo, shake, flash and moods decay.
  if (state.comboTimer > 0) {
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) state.combo = 0;
  }
  if (state.shake > 0) state.shake -= dt;
  if (state.serveFlash > 0) state.serveFlash -= dt;
  if (state.breathBurst > 0) state.breathBurst -= dt;
  for (const id of Object.keys(state.moods)) {
    if (state.moodTimer[id] > 0) {
      state.moodTimer[id] -= dt;
      if (state.moodTimer[id] <= 0) state.moods[id] = 'idle';
    }
  }
  for (const f of state.floaters) f.t -= dt;
  state.floaters = state.floaters.filter((f) => f.t > 0);
}

// ---------------------------------------------------------------- staging
// These helpers exist so a screenshot scene can set the exact state a real
// game reaches (a ticket with a named recipe and a set patience, a grill
// slot mid-cook, a plate half assembled) through the game's own state. They
// change nothing the rules cannot produce; they only skip the playing time.

export function setTimeLeft(state, seconds) {
  state.elapsed = SHIFT_SECONDS - seconds;
  state.timeLeft = seconds;
}

export function setGrill(state, slot, ing, progress) {
  state.grill[slot] = { ing, progress, done: progress >= 1, doneTimer: 0, burnt: false };
}

export function setPlate(state, ings) {
  state.plate = [...ings];
}

export function setHeld(state, ings) {
  state.held = [...ings];
}

export function setCoins(state, coins, combo = 0) {
  state.coins = coins;
  state.combo = combo;
  state.comboTimer = combo > 0 ? COMBO_WINDOW_SECONDS : 0;
}

export function setBreath(state, value) {
  state.breath = value;
}

export function setPepper(state, stock) {
  state.pepper = stock;
}

export function setMood(state, dragonId, mood) {
  state.moods[dragonId] = mood;
  state.moodTimer[dragonId] = 99;
}
