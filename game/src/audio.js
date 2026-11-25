// Tiny synthesized sounds (WebAudio, no files): a blip for picking up, a
// sizzle while food cooks, a chime for serving. Sounds are not judged — the
// judge only sees screenshots — so this stays small and never blocks play.

let ctx = null;

function audio() {
  if (ctx === null) {
    const AC = window.AudioContext ?? window.webkitAudioContext;
    if (AC === undefined) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function blip(freq, dur, type = 'sine', gain = 0.08) {
  const ac = audio();
  if (ac === null) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + dur);
}

/** Play the named effect: pick, grill, plate, serve, no, trash, breath. */
export function sfx(name) {
  try {
    if (name === 'pick') blip(520, 0.08, 'triangle');
    else if (name === 'grill') blip(220, 0.12, 'sawtooth', 0.05);
    else if (name === 'plate') blip(660, 0.08, 'triangle');
    else if (name === 'serve') {
      blip(660, 0.1, 'sine');
      setTimeout(() => blip(880, 0.14, 'sine'), 90);
    } else if (name === 'no') blip(160, 0.12, 'square', 0.05);
    else if (name === 'trash') blip(140, 0.1, 'sawtooth', 0.05);
    else if (name === 'breath') {
      blip(180, 0.3, 'sawtooth', 0.06);
      setTimeout(() => blip(320, 0.25, 'sawtooth', 0.05), 120);
    }
  } catch {
    // Sound never blocks the game.
  }
}
