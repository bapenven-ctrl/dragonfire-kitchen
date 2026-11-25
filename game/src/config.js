// Every tuning number, colour, ingredient, recipe and dragon in one place.
// The playfield is a fixed 1280x480 logical area; the renderer scales it to
// the window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 480 };

/** The simulation's fixed step, in seconds: 60 updates a second. */
export const STEP = 1 / 60;

/** One shift, in seconds. */
export const SHIFT_SECONDS = 180;

/** Grill slots and how long an item may sit done before it burns. */
export const GRILL_SLOTS = 4;
export const BURN_AFTER_SECONDS = 8;

/** Fire pepper is the scarce ingredient: stock at shift start, refill, cap. */
export const PEPPER_START = 3;
export const PEPPER_REFILL_SECONDS = 45;
export const PEPPER_MAX = 3;

/** Fire-breath: meter gained per serve, and what a full breath does. */
export const BREATH_PER_SERVE = 25;
export const BREATH_MAX = 100;

/** Combo: serves closer together than this keep the streak alive. */
export const COMBO_WINDOW_SECONDS = 25;
export const COMBO_MAX = 5;

/** Orders: first tickets at start, then one more this often (shrinking). */
export const TICKETS_START = 3;
export const TICKETS_MAX = 3;
export const ORDER_EVERY_START = 16;
export const ORDER_EVERY_END = 10;

/** The 12 ingredients. `grill` ones must be cooked before plating; `raw`
 *  ones go straight from the tray to the plate. `cook` is seconds on the grill. */
export const INGREDIENTS = [
  { id: 'meat', name: 'Ember Meat', color: '#b5542e', grill: true, cook: 6 },
  { id: 'mushroom', name: 'Cave Mushroom', color: '#d8c9a3', grill: true, cook: 5 },
  { id: 'firepepper', name: 'Fire Pepper', color: '#e5322b', grill: true, cook: 4 },
  { id: 'mooncheese', name: 'Moon Cheese', color: '#f2d060', grill: false, cook: 0 },
  { id: 'skyherb', name: 'Sky Herb', color: '#58b368', grill: false, cook: 0 },
  { id: 'dragonfruit', name: 'Dragonfruit', color: '#e56ba0', grill: false, cook: 0 },
  { id: 'bread', name: 'Hearth Bread', color: '#d9a441', grill: false, cook: 0 },
  { id: 'egg', name: 'Ember Egg', color: '#f7ead0', grill: true, cook: 5 },
  { id: 'onion', name: 'Onion', color: '#a86fc0', grill: false, cook: 0 },
  { id: 'tomato', name: 'Sun Tomato', color: '#e84a3a', grill: false, cook: 0 },
  { id: 'fish', name: 'River Fish', color: '#5aa8d8', grill: true, cook: 6 },
  { id: 'honey', name: 'Golden Honey', color: '#f0a818', grill: false, cook: 0 },
];

/** The 8 recipes. A plate matches a recipe when its set of ingredients is
 *  exactly the recipe's set (order does not matter). */
export const RECIPES = [
  { id: 'skewer', name: 'Ember Skewer', ings: ['meat', 'firepepper'], value: 30 },
  { id: 'melt', name: 'Mushroom Melt', ings: ['mushroom', 'mooncheese'], value: 25 },
  { id: 'tart', name: 'Dragonfruit Tart', ings: ['dragonfruit', 'bread', 'honey'], value: 30 },
  { id: 'steak', name: 'Fire Pepper Steak', ings: ['meat', 'firepepper', 'mooncheese'], value: 45 },
  { id: 'soup', name: 'Cave Cap Soup', ings: ['mushroom', 'skyherb', 'onion'], value: 35 },
  { id: 'platter', name: 'Moon Cheese Platter', ings: ['mooncheese', 'dragonfruit', 'honey'], value: 35 },
  { id: 'salad', name: 'Sky Herb Salad', ings: ['skyherb', 'tomato', 'egg'], value: 30 },
  { id: 'feast', name: 'Hoard Feast', ings: ['meat', 'mushroom', 'firepepper', 'mooncheese'], value: 70 },
];

/** The three dragon customers. `patience` is how many seconds a ticket of
 *  theirs lasts; `feast` means this dragon may order the Hoard Feast, and
 *  saves its patience for it (it never orders while another of its tickets
 *  is open, so the feast arrives as one big order). */
export const DRAGONS = [
  { id: 'pyra', name: 'Pyra', title: 'the Patient', color: '#e5534b', dark: '#8f2f28', patience: 100, feast: true },
  { id: 'ash', name: 'Ash', title: 'the Impatient', color: '#8b93a3', dark: '#565d6b', patience: 45, feast: false },
  { id: 'bramble', name: 'Bramble', title: 'the Steady', color: '#58b368', dark: '#2f7a44', patience: 65, feast: false },
];

export const PALETTE = {
  wallTop: '#4a2c1e',
  wallBottom: '#2a1810',
  floor: '#3d2718',
  counter: '#7a4a26',
  counterEdge: '#a06a35',
  counterDark: '#5d3719',
  grillStone: '#4c4c55',
  grillDark: '#33333c',
  plate: '#f7ead0',
  ticket: '#f7e8c8',
  ticketEdge: '#c9a86a',
  text: '#fff3d6',
  textDark: '#3a2412',
  muted: '#c9a582',
  danger: '#ff5a3c',
  gold: '#f2c94c',
  fire1: '#ff7a1a',
  fire2: '#ffc93c',
  fire3: '#ffe9a8',
  hud: '#1d110a',
  hudEdge: '#6b4423',
  good: '#7ee081',
  panel: '#2e1a10',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
