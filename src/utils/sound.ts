// ═══════════════════════════════════════════════════════════════
// BUTTON HUNTER — Web Audio Sound Engine
// No external files — all sounds are synthesized procedurally
// ═══════════════════════════════════════════════════════════════

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let ambientOscillators: OscillatorNode[] = [];
let enabled = true;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function getMaster(): GainNode {
  getCtx();
  return masterGain!;
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (masterGain) masterGain.gain.value = on ? 0.4 : 0;
}

// ── Utility: play a tone burst ────────────────────────────────────
function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainVal = 0.3,
  detune = 0
) {
  if (!enabled) return;
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(gainVal, c.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(getMaster());
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch { /* ignore */ }
}

function playNoise(duration: number, gainVal = 0.1, filterFreq = 2000) {
  if (!enabled) return;
  try {
    const c = getCtx();
    const bufferSize = c.sampleRate * duration;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = c.createBufferSource();
    source.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.5;
    const gain = c.createGain();
    gain.gain.setValueAtTime(gainVal, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(getMaster());
    source.start();
    source.stop(c.currentTime + duration);
  } catch { /* ignore */ }
}

// ── Public Sound API ──────────────────────────────────────────────

/** Soft click when cursor moves */
export function playHoverSound() {
  playTone(800, 0.08, 'sine', 0.06);
}

/** Satisfying CLACK when capturing a button */
export function playCaptureSound() {
  if (!enabled) return;
  playTone(220, 0.15, 'sawtooth', 0.2);
  setTimeout(() => playTone(440, 0.2, 'sine', 0.3), 40);
  setTimeout(() => playTone(880, 0.25, 'triangle', 0.25), 80);
  setTimeout(() => playNoise(0.1, 0.15, 3000), 50);
}

/** Energetic explosion when button is killed */
export function playExplosionSound() {
  if (!enabled) return;
  playNoise(0.4, 0.3, 800);
  playTone(60, 0.4, 'sawtooth', 0.25);
  playTone(120, 0.3, 'square', 0.15);
}

/** Miss click — hollow thud */
export function playMissSound() {
  playTone(150, 0.12, 'sine', 0.12);
  playNoise(0.08, 0.05, 400);
}

/** Button squeak when it flees */
export function playSquealSound(personalityIndex: number) {
  const freqs = [600, 800, 1000, 750, 900, 500, 1200, 650, 450];
  const freq = freqs[personalityIndex % freqs.length];
  playTone(freq, 0.15, 'triangle', 0.08);
  playTone(freq * 1.5, 0.1, 'sine', 0.04, 200);
}

/** Button taunting laugh */
export function playTauntSound() {
  if (!enabled) return;
  [440, 523, 440, 392].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.12, 'square', 0.08), i * 90);
  });
}

/** Teleport whoosh */
export function playTeleportSound() {
  if (!enabled) return;
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(2000, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.3);
  gain.gain.setValueAtTime(0.15, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(getMaster());
  osc.start();
  osc.stop(c.currentTime + 0.3);
}

/** EMP blast — wide electronic crack */
export function playEMPSound() {
  if (!enabled) return;
  playNoise(0.6, 0.4, 1500);
  playTone(80, 0.5, 'sawtooth', 0.3);
  setTimeout(() => playNoise(0.3, 0.2, 3000), 100);
}

/** Time freeze — ethereal shimmer */
export function playFreezeSound() {
  if (!enabled) return;
  [1200, 1500, 1800, 2100].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.4, 'sine', 0.06), i * 50);
  });
}

/** Level up fanfare */
export function playLevelUpSound() {
  if (!enabled) return;
  [262, 330, 392, 523, 659, 784].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.18, 'triangle', 0.15), i * 80);
  });
}

/** Boss appear — dramatic low drone */
export function playBossAppearSound() {
  if (!enabled) return;
  playTone(55, 1.5, 'sawtooth', 0.4);
  playTone(110, 1.2, 'square', 0.2);
  playNoise(0.8, 0.25, 200);
  setTimeout(() => playTone(165, 0.8, 'sine', 0.3), 300);
}

/** Victory fanfare */
export function playVictorySound() {
  if (!enabled) return;
  const melody = [523, 659, 784, 1047, 784, 880, 1047];
  melody.forEach((f, i) => setTimeout(() => playTone(f, 0.3, 'triangle', 0.18), i * 120));
}

/** Secret event — eerie chord */
export function playSecretSound() {
  if (!enabled) return;
  [220, 261.6, 329.6].forEach((f, i) => {
    setTimeout(() => playTone(f, 2.0, 'sine', 0.05, -200 + i * 100), i * 200);
  });
}

/** Heartbeat — for cornered buttons */
export function playHeartbeatSound() {
  if (!enabled) return;
  playTone(60, 0.1, 'sine', 0.2);
  setTimeout(() => playTone(55, 0.1, 'sine', 0.15), 120);
}

// ── Ambient Cyber Background Loop ─────────────────────────────────
export function startAmbientLoop() {
  if (!enabled || ambientOscillators.length) return;
  try {
    const c = getCtx();
    const baseFreqs = [55, 82.5, 110];
    ambientOscillators = baseFreqs.map((freq) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      const filter = c.createBiquadFilter();
      osc.type = 'sine';
      osc.frequency.value = freq;
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      gain.gain.value = 0.04;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(getMaster());
      osc.start();
      return osc;
    });
  } catch { /* ignore */ }
}

export function stopAmbientLoop() {
  ambientOscillators.forEach((o) => { try { o.stop(); } catch { /* ignore */ } });
  ambientOscillators = [];
}

export function resumeAudioContext() {
  if (ctx && ctx.state === 'suspended') ctx.resume();
}
