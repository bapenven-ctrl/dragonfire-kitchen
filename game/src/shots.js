// The screenshot scenes behind ?shot=cover|decision|serve|feast. Each one
// loads a real game state through the game's own state functions — a ticket
// with a named recipe and a set patience, a grill slot mid-cook, a plate
// half assembled — with a fixed seed, so the same seed always gives the
// same frame. Nothing here is a picture: the renderer draws the live state,
// and every value is one the rules can produce in play (the same recipes,
// the same patience ranges, the same grill and plate limits).

import { reset, spawnTicket, setTimeLeft, setGrill, setPlate, setHeld, setCoins, setBreath, setPepper, setMood } from './world.js';

export const SHOTS = ['cover', 'decision', 'serve', 'feast'];

/** Stage the named scene (any other name is the cover) and return its state. */
export function stageShot(name, seed = 7) {
  const state = reset(seed);
  // The reset opens one ticket per dragon; each scene replaces them with
  // the tickets its frame needs, so the frame is exact, not random.
  state.tickets = [];
  if (name === 'decision') {
    spawnTicket(state, 'pyra', 'feast').patience = 0.55;
    spawnTicket(state, 'ash', 'skewer').patience = 0.3;
    spawnTicket(state, 'bramble', 'tart').patience = 0.7;
    setGrill(state, 0, 'meat', 0.9);
    setGrill(state, 1, 'mushroom', 0.5);
    setGrill(state, 2, 'firepepper', 1);
    setGrill(state, 3, 'egg', 0.2);
    setPlate(state, ['meat', 'mushroom']);
    setHeld(state, []);
    setPepper(state, 1);
    setCoins(state, 210, 3);
    setBreath(state, 80);
    setTimeLeft(state, 58);
  } else if (name === 'serve') {
    spawnTicket(state, 'pyra', 'skewer').patience = 0.6;
    spawnTicket(state, 'ash', 'salad').patience = 0.8;
    spawnTicket(state, 'bramble', 'melt').patience = 0.4;
    setGrill(state, 0, 'mushroom', 0.4);
    setGrill(state, 2, 'egg', 0.7);
    setPlate(state, ['meat', 'firepepper']);
    setHeld(state, []);
    setCoins(state, 165, 3);
    setBreath(state, 75);
    setTimeLeft(state, 72);
    state.serveFlash = 0.6;
    state.floaters.push({ x: 560, y: 320, text: '+45', color: '#f2c94c', t: 1.2 });
    setMood(state, 'pyra', 'happy');
  } else if (name === 'feast') {
    spawnTicket(state, 'pyra', 'feast').patience = 0.4;
    spawnTicket(state, 'ash', 'steak').patience = 0.35;
    spawnTicket(state, 'bramble', 'soup').patience = 0.5;
    setGrill(state, 0, 'meat', 1);
    setGrill(state, 1, 'mushroom', 0.9);
    setGrill(state, 2, 'firepepper', 1);
    setGrill(state, 3, 'egg', 0.5);
    setPlate(state, ['meat', 'mushroom', 'mooncheese']);
    setHeld(state, []);
    setPepper(state, 0);
    setCoins(state, 340, 4);
    setBreath(state, 100);
    state.breathBurst = 0.8;
    setTimeLeft(state, 21);
  } else {
    // cover: mid-shift rush, every system visible at once.
    spawnTicket(state, 'pyra', 'steak').patience = 0.75;
    spawnTicket(state, 'ash', 'melt').patience = 0.5;
    spawnTicket(state, 'bramble', 'soup').patience = 0.85;
    setGrill(state, 0, 'meat', 0.6);
    setGrill(state, 1, 'firepepper', 0.8);
    setGrill(state, 2, 'mushroom', 0.3);
    setPlate(state, ['mooncheese', 'dragonfruit']);
    setHeld(state, ['firepepper']);
    setPepper(state, 2);
    setCoins(state, 120, 2);
    setBreath(state, 55);
    setTimeLeft(state, 107);
  }
  return state;
}
