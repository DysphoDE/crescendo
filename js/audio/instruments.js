// Synthetisierte Instrumente (Web Audio). Jede Stimme: play(eng, dest, t, midi, vel, dur, opts)
// eng liefert ctx, noise-Buffer, Hall-Send und Stimmenzähler.

export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

function track(eng, node, stopAt) {
  eng.voices++;
  node.onended = () => { eng.voices--; };
  node.stop(stopAt);
}

function out(eng, dest, t, { rev = 0.25, pan = 0 } = {}) {
  const ctx = eng.ctx;
  const g = ctx.createGain();
  let last = g;
  if (pan && ctx.createStereoPanner) {
    const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); last = p;
  }
  last.connect(dest);
  if (rev > 0 && eng.reverbIn) {
    const s = ctx.createGain(); s.gain.value = rev; last.connect(s); s.connect(eng.reverbIn);
  }
  return g;
}

// Einfache perkussive Hüllkurve
function perc(param, t, peak, decay) {
  param.cancelScheduledValues(t);
  param.setValueAtTime(0.0001, t);
  param.linearRampToValueAtTime(peak, t + 0.004);
  param.exponentialRampToValueAtTime(0.0001, t + decay);
}

// Anschlag + Halten + Ausklingen
function ahr(param, t, peak, a, hold, r) {
  param.cancelScheduledValues(t);
  param.setValueAtTime(0.0001, t);
  param.linearRampToValueAtTime(peak, t + a);
  param.setValueAtTime(peak, t + a + hold);
  param.exponentialRampToValueAtTime(0.0001, t + a + hold + r);
}

function oscNode(ctx, type, freq, t, detune = 0) {
  const o = ctx.createOscillator();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (detune) o.detune.setValueAtTime(detune, t);
  o.start(t);
  return o;
}

function noiseNode(eng, t) {
  const src = eng.ctx.createBufferSource();
  src.buffer = eng.noise;
  src.loop = true;
  src.start(t, Math.random() * 1.5);
  return src;
}

let _curves = {};
function distCurve(ctx, amount) {
  const key = amount;
  if (_curves[key]) return _curves[key];
  const n = 1024, c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    c[i] = ((1 + amount) * x) / (1 + amount * Math.abs(x));
  }
  _curves[key] = c;
  return c;
}

// ---------------- Melodische Instrumente ----------------
const V = {};

V.marimba = (eng, dest, t, m, vel = 0.7, dur = 0.5, o = {}) => {
  const ctx = eng.ctx, f = mtof(m);
  const g = out(eng, dest, t, { rev: o.rev ?? 0.3, pan: o.pan });
  const a = oscNode(ctx, 'sine', f, t); const ga = ctx.createGain(); a.connect(ga); ga.connect(g);
  const b = oscNode(ctx, 'sine', f * 3.98, t); const gb = ctx.createGain(); b.connect(gb); gb.connect(g);
  const c = oscNode(ctx, 'sine', f * 9.2, t); const gc = ctx.createGain(); c.connect(gc); gc.connect(g);
  perc(ga.gain, t, 0.5 * vel, 0.9);
  perc(gb.gain, t, 0.14 * vel, 0.18);
  perc(gc.gain, t, 0.05 * vel, 0.04);
  g.gain.value = 1;
  track(eng, a, t + 1); b.stop(t + 1); c.stop(t + 1);
};

V.kalimba = (eng, dest, t, m, vel = 0.7, dur = 0.5, o = {}) => {
  const ctx = eng.ctx, f = mtof(m);
  const g = out(eng, dest, t, { rev: o.rev ?? 0.35, pan: o.pan });
  const a = oscNode(ctx, 'sine', f, t); const ga = ctx.createGain(); a.connect(ga); ga.connect(g);
  const b = oscNode(ctx, 'sine', f * 5.4, t); const gb = ctx.createGain(); b.connect(gb); gb.connect(g);
  const c = oscNode(ctx, 'triangle', f * 2, t); const gc = ctx.createGain(); c.connect(gc); gc.connect(g);
  perc(ga.gain, t, 0.45 * vel, 1.6);
  perc(gb.gain, t, 0.08 * vel, 0.12);
  perc(gc.gain, t, 0.1 * vel, 0.3);
  track(eng, a, t + 1.7); b.stop(t + 1.7); c.stop(t + 1.7);
};

function plucked(eng, dest, t, m, vel, o, { bright = 4200, dark = 700, decay = 1.6, types = ['triangle', 'sawtooth'], mix = [0.5, 0.25], q = 1, rev = 0.3 }) {
  const ctx = eng.ctx, f = mtof(m);
  const g = out(eng, dest, t, { rev: o.rev ?? rev, pan: o.pan });
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = q;
  lp.frequency.setValueAtTime(Math.min(16000, bright * (0.6 + vel * 0.6)), t);
  lp.frequency.exponentialRampToValueAtTime(dark, t + decay * 0.35);
  lp.connect(g);
  const oscs = types.map((ty, i) => {
    const os = oscNode(ctx, ty, f, t, i ? 4 : 0);
    const gg = ctx.createGain(); gg.gain.value = mix[i]; os.connect(gg); gg.connect(lp); return os;
  });
  perc(g.gain, t, 0.55 * vel, decay);
  track(eng, oscs[0], t + decay + 0.05);
  for (let i = 1; i < oscs.length; i++) oscs[i].stop(t + decay + 0.05);
}

V.harp = (eng, dest, t, m, vel = 0.7, dur, o = {}) => plucked(eng, dest, t, m, vel, o, { bright: 3500, dark: 600, decay: 1.8, mix: [0.6, 0.12], rev: 0.4 });
V.lute = (eng, dest, t, m, vel = 0.7, dur, o = {}) => plucked(eng, dest, t, m, vel, o, { bright: 2600, dark: 500, decay: 1.2, mix: [0.35, 0.3], q: 2.5, rev: 0.35 });
V.pluckBass = (eng, dest, t, m, vel = 0.7, dur, o = {}) => plucked(eng, dest, t, m, vel, o, { bright: 1400, dark: 180, decay: 1.1, mix: [0.8, 0.2], rev: 0.15 });
V.harpsichord = (eng, dest, t, m, vel = 0.7, dur, o = {}) => plucked(eng, dest, t, m, vel, o, { bright: 7000, dark: 1800, decay: 0.9, types: ['sawtooth', 'square'], mix: [0.22, 0.1], q: 0.7, rev: 0.35 });
V.harpsiBass = (eng, dest, t, m, vel = 0.7, dur, o = {}) => plucked(eng, dest, t, m, vel, o, { bright: 3000, dark: 400, decay: 0.9, types: ['sawtooth', 'triangle'], mix: [0.25, 0.4], rev: 0.25 });
V.synthPluck = (eng, dest, t, m, vel = 0.7, dur, o = {}) => plucked(eng, dest, t, m, vel, o, { bright: 5000, dark: 280, decay: 0.45, types: ['sawtooth', 'square'], mix: [0.3, 0.12], q: 6, rev: 0.3 });

V.piano = (eng, dest, t, m, vel = 0.7, dur = 1, o = {}) => {
  const ctx = eng.ctx, f = mtof(m);
  const g = out(eng, dest, t, { rev: o.rev ?? 0.35, pan: o.pan });
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
  lp.frequency.setValueAtTime(1800 + vel * 4000, t);
  lp.frequency.exponentialRampToValueAtTime(900, t + 1.2);
  lp.connect(g);
  const decay = Math.max(1.2, 3.2 - (m - 60) * 0.04);
  const parts = eng.lite ? [[1, 'triangle', 0.6], [2, 'sine', 0.2]] : [[1, 'triangle', 0.5], [1.0015, 'sine', 0.4], [2, 'sine', 0.18], [3, 'sine', 0.07]];
  let first;
  for (const [r, ty, a] of parts) {
    const os = oscNode(ctx, ty, f * r, t);
    const gg = ctx.createGain(); os.connect(gg); gg.connect(lp);
    perc(gg.gain, t, a * vel, decay / (r > 1.5 ? r * 0.7 : 1));
    os.stop(t + decay + 0.1);
    if (!first) first = os;
  }
  g.gain.value = 0.6;
  eng.voices++; first.onended = () => eng.voices--;
};

V.epiano = (eng, dest, t, m, vel = 0.7, dur = 0.8, o = {}) => {
  const ctx = eng.ctx, f = mtof(m);
  const g = out(eng, dest, t, { rev: o.rev ?? 0.3, pan: o.pan });
  const car = oscNode(ctx, 'sine', f, t);
  const mod = oscNode(ctx, 'sine', f, t);
  const mg = ctx.createGain();
  mg.gain.setValueAtTime(f * 2.2 * vel, t);
  mg.gain.exponentialRampToValueAtTime(f * 0.15, t + 0.6);
  mod.connect(mg); mg.connect(car.frequency);
  const bell = oscNode(ctx, 'sine', f * 14, t); const bg = ctx.createGain(); bell.connect(bg); bg.connect(g);
  perc(bg.gain, t, 0.03 * vel, 0.12);
  const cg = ctx.createGain(); car.connect(cg); cg.connect(g);
  const d = Math.max(0.6, dur) + 0.8;
  cg.gain.setValueAtTime(0.0001, t);
  cg.gain.linearRampToValueAtTime(0.42 * vel, t + 0.005);
  cg.gain.setTargetAtTime(0.18 * vel, t + 0.01, 0.35);
  cg.gain.setTargetAtTime(0.0001, t + Math.max(0.3, dur), 0.25);
  track(eng, car, t + d); mod.stop(t + d); bell.stop(t + d);
};
V.epianoLead = (eng, dest, t, m, vel, dur, o) => V.epiano(eng, dest, t, m, vel, Math.max(dur || 0.6, 0.6), o);

V.vibes = (eng, dest, t, m, vel = 0.7, dur = 1, o = {}) => {
  const ctx = eng.ctx, f = mtof(m);
  const g = out(eng, dest, t, { rev: o.rev ?? 0.4, pan: o.pan });
  const trem = ctx.createGain(); trem.gain.value = 0.75; trem.connect(g);
  const lfo = oscNode(ctx, 'sine', 5.5, t); const lg = ctx.createGain(); lg.gain.value = 0.25; lfo.connect(lg); lg.connect(trem.gain);
  const a = oscNode(ctx, 'sine', f, t); const ga = ctx.createGain(); a.connect(ga); ga.connect(trem);
  const b = oscNode(ctx, 'sine', f * 4, t); const gb = ctx.createGain(); b.connect(gb); gb.connect(trem);
  perc(ga.gain, t, 0.5 * vel, 2.2);
  perc(gb.gain, t, 0.12 * vel, 0.35);
  track(eng, a, t + 2.3); b.stop(t + 2.3); lfo.stop(t + 2.3);
};

function fmBell(eng, dest, t, m, vel, o, { ratio = 3.5, index = 5, decay = 3, rev = 0.5, amp = 0.35 }) {
  const ctx = eng.ctx, f = mtof(m);
  const g = out(eng, dest, t, { rev: o.rev ?? rev, pan: o.pan });
  const car = oscNode(ctx, 'sine', f, t);
  const mod = oscNode(ctx, 'sine', f * ratio, t);
  const mg = ctx.createGain();
  mg.gain.setValueAtTime(f * index * vel, t);
  mg.gain.exponentialRampToValueAtTime(f * 0.05, t + decay * 0.7);
  mod.connect(mg); mg.connect(car.frequency);
  const cg = ctx.createGain(); car.connect(cg); cg.connect(g);
  perc(cg.gain, t, amp * vel, decay);
  track(eng, car, t + decay + 0.05); mod.stop(t + decay + 0.05);
}
V.bell = (eng, dest, t, m, vel = 0.7, dur, o = {}) => fmBell(eng, dest, t, m, vel, o, { ratio: 3.5, index: 3.2, decay: 2.6, amp: 0.3 });
V.glass = (eng, dest, t, m, vel = 0.7, dur, o = {}) => fmBell(eng, dest, t, m, vel, o, { ratio: 2.0, index: 1.2, decay: 3.2, amp: 0.3, rev: 0.6 });

function sustained(eng, dest, t, m, vel, dur, o, cfg) {
  const ctx = eng.ctx, f = mtof(m);
  const g = out(eng, dest, t, { rev: o.rev ?? cfg.rev ?? 0.35, pan: o.pan });
  let node = g;
  if (cfg.lp) {
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cfg.lp; lp.Q.value = cfg.q || 0.7;
    if (cfg.lpEnv) { lp.frequency.setValueAtTime(cfg.lp * 0.3, t); lp.frequency.linearRampToValueAtTime(cfg.lp, t + cfg.lpEnv); }
    lp.connect(node); node = lp;
  }
  if (cfg.formants) {
    const sum = ctx.createGain(); sum.gain.value = 1;
    for (const [ff, q, a] of cfg.formants) {
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = q;
      const bg = ctx.createGain(); bg.gain.value = a; bp.connect(bg); bg.connect(node); sum.connect(bp);
    }
    node = sum;
  }
  const oscs = [];
  const vib = cfg.vib ? oscNode(ctx, 'sine', cfg.vib[0], t) : null;
  let vg = null;
  if (vib) {
    vg = ctx.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(cfg.vib[1], t + (cfg.vib[2] ?? 0.3)); vib.connect(vg);
  }
  for (const [r, ty, a, det] of cfg.parts) {
    const os = oscNode(ctx, ty, f * r, t, det || 0);
    const gg = ctx.createGain(); gg.gain.value = a; os.connect(gg); gg.connect(node);
    if (vg) vg.connect(os.detune);
    oscs.push(os);
  }
  const A = cfg.a ?? 0.05, R = cfg.r ?? 0.3;
  const hold = Math.max(0.02, dur - A);
  ahr(g.gain, t, (cfg.amp ?? 0.3) * vel, A, hold, R);
  const end = t + A + hold + R + 0.05;
  track(eng, oscs[0], end);
  for (let i = 1; i < oscs.length; i++) oscs[i].stop(end);
  if (vib) vib.stop(end);
}

V.organ = (eng, dest, t, m, vel = 0.7, dur = 1, o = {}) => sustained(eng, dest, t, m, vel, dur, o, {
  parts: [[0.5, 'sine', 0.3], [1, 'sine', 0.5], [2, 'sine', 0.25], [3, 'sine', 0.12], [4, 'sine', 0.08]], a: 0.04, r: 0.25, amp: 0.2, vib: [5.8, 6, 0.4], rev: 0.5 });
V.organSoft = (eng, dest, t, m, vel = 0.7, dur = 1, o = {}) => sustained(eng, dest, t, m, vel, dur, o, {
  parts: [[1, 'sine', 0.6], [2, 'sine', 0.2], [4, 'sine', 0.05]], a: 0.25, r: 0.6, amp: 0.18, rev: 0.6 });
V.organSkank = (eng, dest, t, m, vel = 0.7, dur = 0.12, o = {}) => sustained(eng, dest, t, m, vel, Math.min(dur, 0.14), o, {
  parts: [[1, 'square', 0.15], [2, 'sine', 0.3], [3, 'sine', 0.1]], lp: 2600, a: 0.005, r: 0.06, amp: 0.3, rev: 0.25 });
V.strings = (eng, dest, t, m, vel = 0.7, dur = 1, o = {}) => sustained(eng, dest, t, m, vel, dur, o, {
  parts: [[1, 'sawtooth', 0.35, -8], [1, 'sawtooth', 0.35, 8], [2, 'sawtooth', 0.08, 3]], lp: 2200, q: 0.5, a: 0.35, r: 0.6, amp: 0.13, vib: [5.2, 9, 0.5], rev: 0.55 });
V.cello = (eng, dest, t, m, vel = 0.7, dur = 1, o = {}) => sustained(eng, dest, t, m, vel, dur, o, {
  parts: [[1, 'sawtooth', 0.4, -5], [1, 'sawtooth', 0.4, 5]], lp: 900, q: 0.8, a: 0.12, r: 0.4, amp: 0.18, vib: [5, 7, 0.4], rev: 0.4 });
V.choir = (eng, dest, t, m, vel = 0.7, dur = 1, o = {}) => sustained(eng, dest, t, m, vel, dur, o, {
  parts: [[1, 'sawtooth', 0.5, -7], [1, 'sawtooth', 0.5, 7], [1, 'sawtooth', 0.3, 0]], formants: [[700, 6, 1], [1150, 7, 0.6], [2600, 9, 0.25]], a: 0.5, r: 0.9, amp: 0.5, vib: [5, 10, 0.8], rev: 0.7 });
V.choirLead = (eng, dest, t, m, vel = 0.7, dur = 1, o = {}) => sustained(eng, dest, t, m, vel, dur, o, {
  parts: [[1, 'sawtooth', 0.6, -4], [1, 'sawtooth', 0.6, 4]], formants: [[600, 7, 1], [1000, 8, 0.6], [2400, 10, 0.2]], a: 0.12, r: 0.5, amp: 0.55, vib: [5.2, 12, 0.3], rev: 0.65 });
V.flute = (eng, dest, t, m, vel = 0.7, dur = 0.5, o = {}) => {
  sustained(eng, dest, t, m, vel, dur, o, { parts: [[1, 'sine', 0.8], [2, 'sine', 0.08], [1, 'triangle', 0.12]], a: 0.06, r: 0.25, amp: 0.3, vib: [5, 14, 0.25], rev: 0.45 });
  // Atemgeräusch
  const ctx = eng.ctx;
  const n = noiseNode(eng, t);
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = mtof(m) * 2; bp.Q.value = 3;
  const g = out(eng, dest, t, { rev: 0.3, pan: o.pan });
  n.connect(bp); bp.connect(g);
  perc(g.gain, t, 0.05 * vel, 0.25);
  track(eng, n, t + 0.3);
};
V.accordion = (eng, dest, t, m, vel = 0.7, dur = 0.5, o = {}) => sustained(eng, dest, t, m, vel, dur, o, {
  parts: [[1, 'square', 0.25, -9], [1, 'square', 0.25, 9], [2, 'sawtooth', 0.1]], lp: 2800, a: 0.03, r: 0.12, amp: 0.2, vib: [6, 4, 0.1], rev: 0.3 });
V.squareLead = (eng, dest, t, m, vel = 0.7, dur = 0.3, o = {}) => sustained(eng, dest, t, m, vel, Math.max(dur, 0.12), o, {
  parts: [[1, 'square', 0.4], [0.5, 'sawtooth', 0.2], [1, 'sawtooth', 0.2, 10]], lp: 3200, q: 3, lpEnv: 0.05, a: 0.008, r: 0.18, amp: 0.2, vib: [5.5, 8, 0.3], rev: 0.35 });
V.guitarLead = (eng, dest, t, m, vel = 0.7, dur = 0.4, o = {}) => {
  const ctx = eng.ctx, f = mtof(m);
  const g = out(eng, dest, t, { rev: o.rev ?? 0.3, pan: o.pan });
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200; lp.connect(g);
  const ws = ctx.createWaveShaper(); ws.curve = distCurve(ctx, 40); ws.oversample = '2x'; ws.connect(lp);
  const pre = ctx.createGain(); pre.gain.value = 0.8; pre.connect(ws);
  const a = oscNode(ctx, 'sawtooth', f, t); a.connect(pre);
  const b = oscNode(ctx, 'sawtooth', f * 1.003, t); b.connect(pre);
  const vib = oscNode(ctx, 'sine', 5.5, t); const vg = ctx.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(18, t + 0.35); vib.connect(vg); vg.connect(a.detune); vg.connect(b.detune);
  const d = Math.max(0.35, dur);
  ahr(g.gain, t, 0.13 * vel, 0.006, d, 0.35);
  track(eng, a, t + d + 0.45); b.stop(t + d + 0.45); vib.stop(t + d + 0.45);
};
V.guitar = (eng, dest, t, m, vel = 0.7, dur = 0.2, o = {}) => powerChord(eng, dest, t, m, vel, dur, o, 25, 2600);
V.guitarHeavy = (eng, dest, t, m, vel = 0.7, dur = 0.2, o = {}) => powerChord(eng, dest, t, m, vel, dur, o, 80, 2000);
function powerChord(eng, dest, t, m, vel, dur, o, drive, cut) {
  const ctx = eng.ctx;
  const g = out(eng, dest, t, { rev: o.rev ?? 0.2, pan: o.pan });
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cut; lp.connect(g);
  const pk = ctx.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 800; pk.gain.value = -4; pk.connect(lp);
  const ws = ctx.createWaveShaper(); ws.curve = distCurve(ctx, drive); ws.oversample = '2x'; ws.connect(pk);
  const pre = ctx.createGain(); pre.gain.value = 0.6; pre.connect(ws);
  const oscs = [m, m + 7, m + 12].map((mm, i) => { const os = oscNode(ctx, 'sawtooth', mtof(mm), t, i * 3 - 3); os.connect(pre); return os; });
  const d = Math.max(0.08, dur);
  ahr(g.gain, t, 0.1 * vel, 0.004, d, 0.12);
  track(eng, oscs[0], t + d + 0.2); oscs[1].stop(t + d + 0.2); oscs[2].stop(t + d + 0.2);
}
function superSaw(eng, dest, t, m, vel, dur, o, { a = 0.01, r = 0.3, cut = 4000, amp = 0.09, rev = 0.35 }) {
  const ctx = eng.ctx, f = mtof(m);
  const g = out(eng, dest, t, { rev: o.rev ?? rev, pan: o.pan });
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cut; lp.connect(g);
  const oscs = [-18, -8, 0, 8, 18].map((d) => { const os = oscNode(ctx, 'sawtooth', f, t, d); os.connect(lp); return os; });
  const hold = Math.max(0.03, dur - a);
  ahr(g.gain, t, amp * vel, a, hold, r);
  const end = t + a + hold + r + 0.05;
  track(eng, oscs[0], end); for (let i = 1; i < oscs.length; i++) oscs[i].stop(end);
}
V.supersaw = (eng, dest, t, m, vel = 0.7, dur = 0.2, o = {}) => superSaw(eng, dest, t, m, vel, dur, o, { a: 0.005, r: 0.2, cut: 4500, amp: 0.07 });
V.supersawPad = (eng, dest, t, m, vel = 0.7, dur = 2, o = {}) => superSaw(eng, dest, t, m, vel, dur, o, { a: 0.6, r: 1.2, cut: 1800, amp: 0.05, rev: 0.6 });
V.synthStab = (eng, dest, t, m, vel = 0.7, dur = 0.15, o = {}) => superSaw(eng, dest, t, m, vel, Math.min(dur, 0.18), o, { a: 0.003, r: 0.12, cut: 2200, amp: 0.08, rev: 0.4 });
V.synthPad = (eng, dest, t, m, vel = 0.7, dur = 2, o = {}) => sustained(eng, dest, t, m, vel, dur, o, {
  parts: [[1, 'sawtooth', 0.3, -12], [1, 'sawtooth', 0.3, 12], [0.5, 'triangle', 0.3]], lp: 1300, q: 1.5, lpEnv: 1.2, a: 0.9, r: 1.4, amp: 0.1, vib: [0.3, 8, 1], rev: 0.65 });
V.cosmic = (eng, dest, t, m, vel = 0.7, dur = 3, o = {}) => sustained(eng, dest, t, m, vel, dur, o, {
  parts: [[1, 'sine', 0.5, -5], [2, 'sine', 0.25, 5], [3, 'triangle', 0.08], [0.5, 'sine', 0.3]], a: 1.6, r: 2.5, amp: 0.16, vib: [0.2, 12, 2], rev: 0.85 });

// ---------------- Bässe ----------------
V.upright = (eng, dest, t, m, vel = 0.7, dur = 0.4, o = {}) => {
  const ctx = eng.ctx, f = mtof(m);
  const g = out(eng, dest, t, { rev: 0.12, pan: o.pan });
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(300, t + 0.4); lp.connect(g);
  const a = oscNode(ctx, 'triangle', f, t); a.connect(lp);
  const b = oscNode(ctx, 'sine', f, t); const bg = ctx.createGain(); bg.gain.value = 0.8; b.connect(bg); bg.connect(lp);
  perc(g.gain, t, 0.55 * vel, 0.9);
  track(eng, a, t + 1); b.stop(t + 1);
};
V.ebass = (eng, dest, t, m, vel = 0.7, dur = 0.3, o = {}) => {
  const ctx = eng.ctx, f = mtof(m);
  const g = out(eng, dest, t, { rev: 0.08, pan: o.pan });
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(1400, t); lp.frequency.exponentialRampToValueAtTime(400, t + 0.25); lp.connect(g);
  const a = oscNode(ctx, 'sawtooth', f, t); const ag = ctx.createGain(); ag.gain.value = 0.35; a.connect(ag); ag.connect(lp);
  const b = oscNode(ctx, 'sine', f, t); b.connect(lp);
  const d = Math.max(0.1, dur);
  ahr(g.gain, t, 0.42 * vel, 0.005, d * 0.8, 0.12);
  track(eng, a, t + d + 0.2); b.stop(t + d + 0.2);
};
V.synthBass = (eng, dest, t, m, vel = 0.7, dur = 0.2, o = {}) => {
  const ctx = eng.ctx, f = mtof(m);
  const g = out(eng, dest, t, { rev: 0.06, pan: o.pan });
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 7;
  lp.frequency.setValueAtTime(2400 * vel + 300, t); lp.frequency.exponentialRampToValueAtTime(180, t + 0.18); lp.connect(g);
  const a = oscNode(ctx, 'sawtooth', f, t); a.connect(lp);
  const b = oscNode(ctx, 'square', f * 0.5, t); const bg = ctx.createGain(); bg.gain.value = 0.4; b.connect(bg); bg.connect(lp);
  const d = Math.max(0.08, dur);
  ahr(g.gain, t, 0.28 * vel, 0.004, d, 0.08);
  track(eng, a, t + d + 0.15); b.stop(t + d + 0.15);
};
V.sub = (eng, dest, t, m, vel = 0.7, dur = 0.6, o = {}) => {
  const ctx = eng.ctx, f = mtof(m);
  const g = out(eng, dest, t, { rev: 0.02 });
  const a = oscNode(ctx, 'sine', f, t); a.connect(g);
  const b = oscNode(ctx, 'triangle', f * 2, t); const bg = ctx.createGain(); bg.gain.value = 0.12; b.connect(bg); bg.connect(g);
  const d = Math.max(0.15, dur);
  ahr(g.gain, t, 0.5 * vel, 0.01, d, 0.2);
  track(eng, a, t + d + 0.3); b.stop(t + d + 0.3);
};

// ---------------- Schlagwerk ----------------
function noiseHit(eng, dest, t, { type = 'highpass', freq = 7000, q = 0.7, peak = 0.3, decay = 0.05, rev = 0.1, pan = 0, freq2 }) {
  const ctx = eng.ctx;
  const n = noiseNode(eng, t);
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
  if (freq2) f.frequency.exponentialRampToValueAtTime(freq2, t + decay);
  const g = out(eng, dest, t, { rev, pan });
  n.connect(f); f.connect(g);
  perc(g.gain, t, peak, decay);
  track(eng, n, t + decay + 0.05);
}
function toneHit(eng, dest, t, { f0 = 150, f1 = 50, sweep = 0.1, peak = 0.8, decay = 0.4, type = 'sine', rev = 0.05 }) {
  const ctx = eng.ctx;
  const o = ctx.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + sweep);
  const g = out(eng, dest, t, { rev });
  o.connect(g); o.start(t);
  perc(g.gain, t, peak, decay);
  track(eng, o, t + decay + 0.05);
}
export const D = {
  kick: (e, d, t, v = 1) => { toneHit(e, d, t, { f0: 160, f1: 42, sweep: 0.11, peak: 0.95 * v, decay: 0.42 }); noiseHit(e, d, t, { type: 'lowpass', freq: 3000, peak: 0.08 * v, decay: 0.012 }); },
  kick808: (e, d, t, v = 1) => { toneHit(e, d, t, { f0: 120, f1: 38, sweep: 0.08, peak: 0.95 * v, decay: 0.9 }); },
  kickSoft: (e, d, t, v = 1) => { toneHit(e, d, t, { f0: 110, f1: 45, sweep: 0.12, peak: 0.55 * v, decay: 0.35 }); },
  snare: (e, d, t, v = 1) => { noiseHit(e, d, t, { type: 'highpass', freq: 1400, peak: 0.42 * v, decay: 0.19, rev: 0.2 }); toneHit(e, d, t, { f0: 240, f1: 170, sweep: 0.05, peak: 0.3 * v, decay: 0.1, type: 'triangle', rev: 0.15 }); },
  snareRim: (e, d, t, v = 1) => { toneHit(e, d, t, { f0: 1700, f1: 1500, sweep: 0.02, peak: 0.25 * v, decay: 0.04, type: 'triangle', rev: 0.15 }); noiseHit(e, d, t, { type: 'bandpass', freq: 3000, q: 2, peak: 0.15 * v, decay: 0.04 }); },
  clap: (e, d, t, v = 1) => { for (const o of [0, 0.011, 0.022]) noiseHit(e, d, t + o, { type: 'bandpass', freq: 1300, q: 1.2, peak: 0.34 * v, decay: 0.03 }); noiseHit(e, d, t + 0.03, { type: 'bandpass', freq: 1200, q: 1, peak: 0.24 * v, decay: 0.16, rev: 0.3 }); },
  hat: (e, d, t, v = 1) => noiseHit(e, d, t, { type: 'highpass', freq: 8000, peak: 0.14 * v, decay: 0.035, pan: 0.2 }),
  hatOpen: (e, d, t, v = 1) => noiseHit(e, d, t, { type: 'highpass', freq: 7500, peak: 0.12 * v, decay: 0.22, pan: 0.2 }),
  ride: (e, d, t, v = 1) => { noiseHit(e, d, t, { type: 'bandpass', freq: 6500, q: 1.2, peak: 0.1 * v, decay: 0.6, rev: 0.2, pan: -0.25 }); toneHit(e, d, t, { f0: 5200, f1: 5000, sweep: 0.3, peak: 0.02 * v, decay: 0.5, type: 'square', rev: 0.2 }); },
  crash: (e, d, t, v = 1) => noiseHit(e, d, t, { type: 'highpass', freq: 4500, peak: 0.18 * v, decay: 1.6, rev: 0.35, pan: 0.3 }),
  shaker: (e, d, t, v = 1) => noiseHit(e, d, t, { type: 'highpass', freq: 5500, peak: 0.07 * v, decay: 0.06, pan: -0.3 }),
  brush: (e, d, t, v = 1) => noiseHit(e, d, t, { type: 'bandpass', freq: 3500, q: 0.6, peak: 0.08 * v, decay: 0.12, rev: 0.2 }),
  djembeBass: (e, d, t, v = 1) => { toneHit(e, d, t, { f0: 110, f1: 65, sweep: 0.15, peak: 0.7 * v, decay: 0.35, rev: 0.15 }); },
  djembeTone: (e, d, t, v = 1) => { toneHit(e, d, t, { f0: 330, f1: 260, sweep: 0.05, peak: 0.28 * v, decay: 0.16, rev: 0.2 }); noiseHit(e, d, t, { type: 'bandpass', freq: 1500, q: 1.5, peak: 0.1 * v, decay: 0.03 }); },
  djembeSlap: (e, d, t, v = 1) => { noiseHit(e, d, t, { type: 'bandpass', freq: 2200, q: 1.3, peak: 0.3 * v, decay: 0.06, rev: 0.2 }); toneHit(e, d, t, { f0: 480, f1: 380, sweep: 0.03, peak: 0.15 * v, decay: 0.06 }); },
  frameDum: (e, d, t, v = 1) => { toneHit(e, d, t, { f0: 130, f1: 75, sweep: 0.12, peak: 0.55 * v, decay: 0.4, rev: 0.3 }); noiseHit(e, d, t, { type: 'lowpass', freq: 900, peak: 0.08 * v, decay: 0.05 }); },
  frameTek: (e, d, t, v = 1) => { noiseHit(e, d, t, { type: 'bandpass', freq: 3200, q: 1.5, peak: 0.16 * v, decay: 0.05, rev: 0.3 }); },
  timpani: (e, d, t, v = 1, m = 43) => { const f = mtof(m); toneHit(e, d, t, { f0: f * 1.03, f1: f, sweep: 0.2, peak: 0.6 * v, decay: 1.6, rev: 0.45 }); noiseHit(e, d, t, { type: 'lowpass', freq: 600, peak: 0.12 * v, decay: 0.08, rev: 0.3 }); },
  tom: (e, d, t, v = 1, m = 45) => toneHit(e, d, t, { f0: mtof(m) * 1.6, f1: mtof(m), sweep: 0.1, peak: 0.5 * v, decay: 0.35, rev: 0.2 }),
  blip: (e, d, t, v = 1, m = 84) => toneHit(e, d, t, { f0: mtof(m), f1: mtof(m) * 0.5, sweep: 0.04, peak: 0.08 * v, decay: 0.05, type: 'square', rev: 0.3 }),
  rumble: (e, d, t, v = 1) => noiseHit(e, d, t, { type: 'lowpass', freq: 220, q: 2, peak: 0.25 * v, decay: 0.3, rev: 0.5 }),
  cowbell: (e, d, t, v = 1) => { toneHit(e, d, t, { f0: 800, f1: 790, sweep: 0.1, peak: 0.08 * v, decay: 0.25, type: 'square', rev: 0.15 }); toneHit(e, d, t, { f0: 540, f1: 535, sweep: 0.1, peak: 0.08 * v, decay: 0.25, type: 'square', rev: 0.15 }); },
  sparkle: (e, d, t, v = 1) => noiseHit(e, d, t, { type: 'highpass', freq: 9000, peak: 0.05 * v, decay: 0.4, rev: 0.7 }),
  crackle: (e, d, t, v = 1) => noiseHit(e, d, t, { type: 'bandpass', freq: 900 + Math.random() * 2600, q: 2.5, peak: 0.06 * v, decay: 0.012 + Math.random() * 0.02, rev: 0.15, pan: Math.random() * 0.8 - 0.4 }),
};

export const VOICES = V;
