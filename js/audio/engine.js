// Audio-Engine: Mischpult, Hall, generativer Sequencer und Sound-Effekte
import { VOICES as V, D } from './instruments.js';
import { STYLES } from './styles.js';
import { MODE_BY_ID, KEY_ROOT } from '../data/theory.js';
import { BUILDING_BY_ID } from '../data/buildings.js';
import { bus } from '../core/bus.js';
import { perf, rand, pick, clamp, isTouch } from '../core/util.js';

const CLAP_KITS = new Set(['tribal', 'frame', 'pop', 'house', 'schlager', 'techno', 'modern', 'rock']);
let MAX_VOICES = 110;

export class AudioEngine {
  constructor(game) {
    this.game = game;
    this.ctx = null;
    this.voices = 0;
    this.nextStep = null;
    this.chord = null;
    this.mel = 7;
    this.lastClickNote = 0;
    this.started = false;
    this.hidden = false;
    this.barCache = -1;
    this.fillBar = -1;
    this.levels = new Uint8Array(128);
    bus.on('tempo', () => this.applyVolumes());
  }

  // Muss in einer Nutzer-Geste aufgerufen werden
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended' && !this.hidden) this.ctx.resume();
      return true;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'playback';
    } catch (e) { /* optional */ }
    this.ctx = new AC({ latencyHint: 'interactive' });
    this.lite = isTouch();
    if (this.lite) MAX_VOICES = 70;
    this.build();
    this.applyVolumes();
    this.startTimer();
    this.started = true;
    bus.emit('audio:start');
    return true;
  }

  // Ein Worker-Takt wird im Hintergrund-Tab kaum gedrosselt
  startTimer() {
    try {
      const src = 'let iv=null;onmessage=(e)=>{clearInterval(iv);if(e.data>0)iv=setInterval(()=>postMessage(0),e.data);};';
      const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      this.worker = new Worker(url);
      this.worker.onmessage = () => this.schedule();
      this.worker.postMessage(25);
    } catch (e) {
      this.timer = setInterval(() => this.schedule(), 25);
    }
  }

  build() {
    const ctx = this.ctx;
    // Rauschen
    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    this.master = ctx.createGain();
    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -16; this.comp.knee.value = 12; this.comp.ratio.value = 4;
    this.comp.attack.value = 0.004; this.comp.release.value = 0.2;
    this.analyser = ctx.createAnalyser(); this.analyser.fftSize = 256; this.analyser.smoothingTimeConstant = 0.78;
    this.master.connect(this.comp); this.comp.connect(this.analyser); this.analyser.connect(ctx.destination);

    this.musicBus = ctx.createGain(); this.musicBus.connect(this.master);
    this.drumBus = ctx.createGain(); this.drumBus.gain.value = 0.9; this.drumBus.connect(this.musicBus);
    this.sfxBus = ctx.createGain(); this.sfxBus.connect(this.master);

    // Hall
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.makeIR(2.8, 2.6);
    this.reverbIn = ctx.createGain(); this.reverbIn.gain.value = 0.9;
    this.reverbOut = ctx.createGain(); this.reverbOut.gain.value = 0.55;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 180;
    this.reverbIn.connect(hp); hp.connect(this.reverb); this.reverb.connect(this.reverbOut); this.reverbOut.connect(this.master);
  }

  makeIR(sec, decay) {
    const ctx = this.ctx, rate = ctx.sampleRate, len = Math.floor(rate * sec);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const tt = i / len;
        const n = Math.random() * 2 - 1;
        lp = lp * 0.55 + n * 0.45; // leicht gedämpft
        const early = i < rate * 0.08 && Math.random() < 0.004 ? (Math.random() * 2 - 1) * 0.8 : 0;
        d[i] = (lp * Math.pow(1 - tt, decay) + early) * 0.6;
      }
    }
    return buf;
  }

  applyVolumes() {
    if (!this.ctx) return;
    const s = this.game.state.settings;
    const t = this.ctx.currentTime;
    const master = this.hidden && !s.bgAudio ? 0 : s.master;
    this.master.gain.setTargetAtTime(master * 0.9, t, 0.05);
    const style = STYLES[this.game.transport.styleId] || STYLES.urzeit;
    this.musicBus.gain.setTargetAtTime(s.musicOn ? s.music * (style.gain || 1) : 0, t, 0.3);
    this.sfxBus.gain.setTargetAtTime(s.sfxOn ? s.sfx : 0, t, 0.05);
    this.reverbOut.gain.setTargetAtTime(0.35 + (style.rev || 0.35) * 0.5, t, 0.5);
  }

  setHidden(h) {
    this.hidden = h;
    if (!this.ctx) return;
    const bg = this.game.state.settings.bgAudio;
    if (h && !bg) {
      this.applyVolumes();
      setTimeout(() => { if (this.hidden && this.ctx.state === 'running') this.ctx.suspend(); }, 300);
    } else {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this.nextStep = null;
      this.applyVolumes();
    }
  }

  getLevels() {
    if (this.analyser) this.analyser.getByteFrequencyData(this.levels);
    return this.levels;
  }

  // ---------- Zeit ----------
  toCtx(tPerf) {
    const ctx = this.ctx;
    const off = perf() - ctx.currentTime;
    if (this.offset === undefined || Math.abs(off - this.offset) > 0.03) this.offset = off;
    else this.offset = this.offset * 0.95 + off * 0.05;
    const lat = (ctx.outputLatency || 0) + (ctx.baseLatency || 0) * 0.5;
    return Math.max(ctx.currentTime + 0.002, tPerf - this.offset - lat);
  }
  stepTime(s) {
    const tr = this.game.transport;
    const bd = 60 / tr.bpm;
    const sw = tr.swing > 0 ? tr.swing : 0.5;
    const sub = ((s % 4) + 4) % 4;
    const pos = [0, sw / 2, sw, sw + (1 - sw) / 2][sub];
    return tr.t0 + (Math.floor(s / 4) + pos) * bd;
  }

  schedule() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const s = this.game.state.settings;
    if (!s.musicOn || s.music <= 0.001) { this.nextStep = null; return; }
    const tr = this.game.transport;
    const now = perf();
    const horizon = now + 0.16;
    const sd = 60 / tr.bpm / 4;
    if (this.nextStep === null || this.lastT0 !== tr.t0 || this.lastBpm !== tr.bpm) {
      this.nextStep = Math.ceil((now - tr.t0) / sd);
      this.lastT0 = tr.t0; this.lastBpm = tr.bpm;
    }
    let guard = 0;
    while (this.stepTime(this.nextStep) < horizon && guard++ < 16) {
      const tt = this.stepTime(this.nextStep);
      if (tt >= now - 0.03) {
        try { this.playStep(this.nextStep, this.toCtx(tt)); } catch (e) { console.warn(e); }
      }
      this.nextStep++;
    }
  }

  // ---------- Musiktheorie ----------
  scale() {
    const mode = MODE_BY_ID[this.game.state.mode] || MODE_BY_ID.ionian;
    return mode.steps;
  }
  tonicPc() {
    const k = this.game.state.settings.key || 'C';
    return (KEY_ROOT[k] ?? 60) % 12;
  }
  noteOf(deg, octaveBase) {
    const sc = this.scale();
    const o = Math.floor(deg / 7);
    const i = ((deg % 7) + 7) % 7;
    return octaveBase + this.tonicPc() + sc[i] + 12 * o;
  }
  // Songform über 32 Takte: A (16) – B/Bridge (8) – A (8)
  section(bar) {
    const b = ((bar % 32) + 32) % 32;
    return b >= 16 && b < 24 ? 'B' : 'A';
  }
  progFor(bar, style) {
    if (this.section(bar) === 'B' && style.prog.length <= 4) {
      return style.progB || (style.sevenths ? [3, 2, 1, 4] : [3, 0, 4, 4]);
    }
    return style.prog;
  }
  makeChord(bar, style) {
    const prog = this.progFor(bar, style);
    const deg = prog[((bar % prog.length) + prog.length) % prog.length];
    const sc = this.scale();
    let tones;
    if (style.borrowed && deg === 6) tones = [10, 14, 17, 20];
    else tones = [0, 2, 4, 6].map((k) => { const d2 = deg + k; return sc[d2 % 7] + 12 * Math.floor(d2 / 7); });
    return { deg, tones, seventh: !!style.sevenths };
  }

  // Aktive Rollen & Dichte aus dem Instrumentenbestand
  roles() {
    const g = this.game;
    const o = (id) => g.own(id);
    const total = g.totalBuildings();
    const dens = total < 30 ? 1 : total < 150 ? 2 : 3;
    return {
      claps: o('clap') > 0,
      kit: o('drum') > 0,
      melody: o('flute') > 0,
      harm: o('lyre') > 0 || o('flute') >= 10,
      bass: o('lute') > 0 || o('choir') > 0 || o('lyre') >= 10,
      pad: o('choir') > 0,
      dens,
      drumN: o('drum'), clapN: o('clap'),
    };
  }

  playStep(step, t) {
    const g = this.game, tr = g.transport;
    const style = STYLES[tr.styleId] || STYLES.urzeit;
    const meter = tr.meter || 4;
    const spb = meter * 4;
    const bar = Math.floor(step / spb);
    const s = ((step % spb) + spb) % spb;
    const beat = Math.floor(s / 4), sub = s % 4;
    if (s === 0 || !this.chord || this.barCache !== bar) {
      this.barCache = bar;
      this.chord = this.makeChord(bar, style);
      this.rolesNow = this.roles();
      this.fillBar = (bar % 4 === 3) ? bar : -1;
    }
    const R = this.rolesNow || this.roles();
    const ch = this.chord;
    const busy = this.voices > MAX_VOICES;
    const ctx = { t, s, beat, sub, bar, meter, style, R, ch };

    // Lagerfeuer-Knistern zu Beginn der Urzeit
    if (tr.styleId === 'urzeit') {
      const tot = g.totalBuildings();
      if (tot < 25 && Math.random() < 0.35 * (1 - tot / 25)) {
        const n = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) D.crackle(this, this.musicBus, t + Math.random() * 0.1, 0.6 + Math.random() * 0.8);
      }
    }
    // Schlagwerk
    if (!tr.noBeat) this.drums(ctx);
    // Optionaler Metronom-Klick
    if (g.state.settings.metronome && !tr.noBeat && sub === 0 && (R.kit || R.claps)) {
      D.blip(this, this.sfxBus, t, beat === 0 ? 1.4 : 0.8, beat === 0 ? 96 : 89);
    }
    if (busy) return;
    // Bass
    if (R.bass && style.bass !== 'none') this.bass(ctx);
    // Harmonie
    if (R.harm) this.harmony(ctx);
    // Fläche
    if (R.pad && style.pad && s === 0) {
      const dur = (60 / tr.bpm) * meter * 0.98;
      const notes = ch.tones.slice(0, 3).map((x) => 60 + this.tonicPc() + x);
      const vel = 0.5;
      for (const n of notes) V[style.pad](this, this.musicBus, t, n - (style.pad === 'cosmic' ? 0 : 0), vel, dur, { pan: rand(-0.3, 0.3) });
    }
    // Melodie-Phrasen (wenn der Spieler gerade nicht klickt)
    if (R.melody && Date.now() - g.lastClickMs > 3000) this.autoMelody(ctx);
  }

  drums(c) {
    const { t, s, beat, sub, meter, style, R, bar } = c;
    const DB = this.drumBus;
    const kit = R.kit ? style.kit : 'none';
    const lvl = R.dens;
    const on = (x) => s === x;
    const g = this.game;
    // Stop-Time-Break am Ende des ersten A-Teils: nur die Eins
    if (R.kit && ((bar % 32) + 32) % 32 === 15 && kit !== 'none' && kit !== 'cosmic') {
      if (s === 0) { D.kick(this, DB, t, 0.9); D.crash(this, DB, t, 0.5); }
      if (s === 12 || s === 14) D.snare(this, DB, t, 0.35 + (s - 12) * 0.12);
      return;
    }
    // Hoher Groove: zusätzliche Perkussion
    if (R.kit && g.groove > 0.7 && (sub === 1 || sub === 3) && kit !== 'cosmic') D.shaker(this, DB, t, 0.25 + (g.groove - 0.7));
    // Goldene Effekte: Glitzern auf den Offbeats
    if (g.buffs && g.buffs.length && sub === 2 && Math.random() < 0.5) D.sparkle(this, DB, t, 0.5);
    // Nur Klatschen (noch keine Trommel): auf 2 und 4
    if (!R.kit) {
      if (R.claps && sub === 0 && (meter === 3 ? beat > 0 : beat % 2 === 1)) D.clap(this, DB, t, 0.55);
      return;
    }
    const claps = R.claps && CLAP_KITS.has(kit);
    if (meter === 3 && kit !== 'none') {
      // Walzer: Umm-pa-pa
      if (s === 0) D.kickSoft(this, DB, t, 0.9);
      if (sub === 0 && beat > 0) { D.snareRim(this, DB, t, 0.5); D.hat(this, DB, t, 0.6); }
      if (claps && sub === 0 && beat > 0) D.clap(this, DB, t, 0.3);
      return;
    }
    switch (kit) {
      case 'tribal':
        if (on(0) || on(10)) D.djembeBass(this, DB, t, 0.9);
        if (on(6) || on(14)) D.djembeTone(this, DB, t, 0.7);
        if (on(4) || on(12)) D.djembeSlap(this, DB, t, 0.8);
        if (lvl >= 2 && sub === 2) D.shaker(this, DB, t, 0.8);
        if (R.drumN >= 10 && (on(3) || on(15) && bar % 2)) D.djembeTone(this, DB, t, 0.4);
        if (claps && (on(4) || on(12))) D.clap(this, DB, t, 0.45);
        break;
      case 'frame':
      case 'frameSoft': {
        const v = kit === 'frameSoft' ? 0.55 : 0.85;
        if (on(0)) D.frameDum(this, DB, t, v);
        if (on(6) || on(10)) D.frameTek(this, DB, t, v * 0.8);
        if (on(8) && kit === 'frame') D.frameDum(this, DB, t, v * 0.7);
        if (on(12)) D.frameTek(this, DB, t, v);
        if (lvl >= 2 && sub === 2 && kit === 'frame') D.shaker(this, DB, t, 0.6);
        if (claps && (on(4) || on(12))) D.clap(this, DB, t, 0.35);
        break;
      }
      case 'timpani': {
        const root = 36 + this.tonicPc() + (c.ch.tones[0] % 12);
        if (on(0)) D.timpani(this, DB, t, 0.8, root + (root < 40 ? 12 : 0));
        if (on(8) && lvl >= 2) D.timpani(this, DB, t, 0.45, root + 7 + (root < 40 ? 12 : 0));
        if (this.fillBar === bar && s >= 12) D.timpani(this, DB, t, 0.3 + 0.1 * sub, root + (root < 40 ? 12 : 0));
        break;
      }
      case 'jazz':
        if (sub === 0 || sub === 2) D.ride(this, DB, t, sub === 0 ? 0.8 : 0.55);
        if (on(4) || on(12)) D.hat(this, DB, t, 0.7);
        if (sub === 0) D.kickSoft(this, DB, t, 0.3);
        if (sub === 2 && Math.random() < 0.18) D.snareRim(this, DB, t, 0.35);
        if (lvl >= 2 && sub === 0 && Math.random() < 0.3) D.brush(this, DB, t, 0.6);
        break;
      case 'rock':
        if (on(0) || on(8) || (lvl >= 2 && on(10))) D.kick(this, DB, t, 1);
        if (on(4) || on(12)) D.snare(this, DB, t, 1);
        if (sub === 0 || sub === 2) D.hat(this, DB, t, sub === 0 ? 0.9 : 0.6);
        if (on(0) && bar % 4 === 0) D.crash(this, DB, t, 0.8);
        if (this.fillBar === bar && s >= 12) D.tom(this, DB, t, 0.8, 50 - (s - 12) * 3);
        if (claps && (on(4) || on(12)) && lvl >= 2) D.clap(this, DB, t, 0.3);
        break;
      case 'house':
      case 'schlager':
        if (sub === 0) D.kick(this, DB, t, 0.95);
        if (on(4) || on(12)) D.clap(this, DB, t, claps ? 0.7 : 0.5);
        if (sub === 2) D.hatOpen(this, DB, t, 0.75);
        if (lvl >= 2 && (sub === 1 || sub === 3)) D.hat(this, DB, t, 0.4);
        if (kit === 'schlager' && sub === 0 && beat % 2 === 1) D.snare(this, DB, t, 0.5);
        if (on(0) && bar % 8 === 0) D.crash(this, DB, t, 0.5);
        break;
      case 'techno':
        if (sub === 0) D.kick(this, DB, t, 1);
        if (sub === 2) D.hatOpen(this, DB, t, 0.8);
        if (sub === 1 || sub === 3) D.hat(this, DB, t, 0.35);
        if (on(12)) D.clap(this, DB, t, 0.6);
        if (sub === 3 && lvl >= 2) D.rumble(this, DB, t, 0.5);
        break;
      case 'pop':
        if (on(0) || on(8) || on(10)) D.kick(this, DB, t, 0.9);
        if (on(4) || on(12)) { D.snare(this, DB, t, 0.85); if (claps) D.clap(this, DB, t, 0.4); }
        if (sub === 0 || sub === 2) D.hat(this, DB, t, 0.55);
        break;
      case 'boombap':
        if (on(0) || on(7) || on(10)) D.kick(this, DB, t, on(7) ? 0.6 : 0.95);
        if (on(4) || on(12)) D.snare(this, DB, t, 0.95);
        if (sub === 0 || sub === 2) D.hat(this, DB, t, sub === 0 ? 0.6 : 0.4);
        break;
      case 'metal':
        D.kick(this, DB, t, sub % 2 === 0 ? 0.9 : 0.7);
        if (on(4) || on(12)) D.snare(this, DB, t, 1);
        if (sub === 0) D.hat(this, DB, t, 0.6);
        if (on(0) && bar % 2 === 0) D.crash(this, DB, t, 0.7);
        break;
      case 'reggae':
        if (on(8)) { D.kick(this, DB, t, 0.9); D.snareRim(this, DB, t, 0.8); }
        if (sub === 0 || sub === 2) D.hat(this, DB, t, sub === 2 ? 0.6 : 0.35);
        if (lvl >= 2 && on(14)) D.snareRim(this, DB, t, 0.3);
        break;
      case 'modern':
        if (on(0) || on(10)) D.kick808(this, DB, t, 0.9);
        if (on(8)) { D.snare(this, DB, t, 0.8); if (claps) D.clap(this, DB, t, 0.5); }
        if (sub === 0 || sub === 2 || (lvl >= 2 && bar % 2 === 1 && s >= 12)) D.hat(this, DB, t, 0.5);
        break;
      case 'glitch':
        if (on(0) || on(9)) D.kick(this, DB, t, 0.9);
        if (on(4) || on(12)) D.snare(this, DB, t, 0.7);
        if (sub === 2) D.hat(this, DB, t, 0.5);
        if (Math.random() < 0.18) D.blip(this, DB, t, 0.8, 72 + Math.floor(rand(0, 24)));
        break;
      case 'baroque': {
        // Dezenter Puls: Pauke auf der Eins, gezupftes Ticken auf jedem Schlag
        const root = 36 + this.tonicPc() + (c.ch.tones[0] % 12);
        if (on(0)) D.timpani(this, DB, t, 0.45, root + (root < 40 ? 12 : 0));
        if (sub === 0) D.frameTek(this, DB, t, beat === 0 ? 0.55 : 0.35);
        if (lvl >= 2 && sub === 2) D.shaker(this, DB, t, 0.35);
        break;
      }
      case 'cosmic':
        if (on(0)) D.kickSoft(this, DB, t, 0.5);
        if (on(8) && lvl >= 2) D.frameTek(this, DB, t, 0.3);
        if (sub === 2 && Math.random() < 0.3) D.sparkle(this, DB, t, 0.6);
        break;
      case 'none':
      default:
        if (claps && (on(4) || on(12))) D.clap(this, DB, t, 0.3);
        break;
    }
  }

  bass(c) {
    const { t, s, beat, sub, style, ch, meter, bar } = c;
    const bd = 60 / this.game.transport.bpm;
    const I = V[style.bassI || 'sub'] || V.sub;
    const root = 36 + this.tonicPc() + (ch.tones[0] % 12);
    const fifth = root + 7;
    const oct = root + 12;
    const B = this.musicBus;
    const vel = 0.75;
    switch (style.bass) {
      case 'drone':
        if (s === 0) (V.organSoft)(this, B, t, root, 0.8, bd * meter * 0.98, { rev: 0.3 });
        break;
      case 'root':
        if (s === 0) I(this, B, t, root, vel, bd * 2);
        if (s === 8 && meter === 4) I(this, B, t, fifth, vel * 0.8, bd * 2);
        break;
      case 'root8':
        if (sub === 0 || sub === 2) I(this, B, t, s === 8 ? fifth : root, vel * (sub === 0 ? 1 : 0.7), bd * 0.45);
        break;
      case 'baroque': {
        if (sub === 0 || sub === 2) {
          const seq = [0, 7, 12, 7, 4, 7, 12, 16];
          const idx = (beat * 2 + (sub === 2 ? 1 : 0)) % 8;
          const tone = root + (seq[idx] === 4 ? ch.tones[1] - ch.tones[0] : seq[idx] === 16 ? 12 + ch.tones[1] - ch.tones[0] : seq[idx]);
          I(this, B, t, tone, vel * 0.8, bd * 0.45);
        }
        break;
      }
      case 'walking': {
        if (sub === 0) {
          let tone;
          if (beat === 0) tone = root;
          else if (beat === meter - 1) {
            const nextCh = this.makeChord(bar + 1, style);
            const nr = 36 + this.tonicPc() + (nextCh.tones[0] % 12);
            tone = nr + (Math.random() < 0.5 ? -1 : 1);
          } else tone = root + pick([ch.tones[1] - ch.tones[0], ch.tones[2] - ch.tones[0], 12, 5, 9]);
          I(this, B, t, tone, vel, bd * 0.9);
        }
        break;
      }
      case 'eighths':
        if (sub === 0 || sub === 2) I(this, B, t, root, vel * (sub === 0 ? 1 : 0.75), bd * 0.4);
        break;
      case 'offbeat':
        if (sub === 2) I(this, B, t, s % 8 === 6 ? oct : root, vel, bd * 0.35);
        break;
      case 'sub':
        if (s === 0) I(this, B, t, root, vel, bd * 1.4);
        if (s === 10) I(this, B, t, root, vel * 0.8, bd * 1.2);
        break;
      case 'gallop':
        if (sub !== 1) I(this, B, t, root, vel * (sub === 0 ? 1 : 0.7), bd * 0.2);
        break;
      case 'reggae':
        if (s === 0 || s === 3 || s === 6 || s === 8 || s === 11) I(this, B, t, s === 6 ? fifth : s === 11 ? oct - 2 : root, vel, bd * 0.6);
        break;
      case 'oompah':
        if (s === 0) I(this, B, t, root, vel, bd * 0.8);
        if (s === 8) I(this, B, t, fifth - 12, vel * 0.9, bd * 0.8);
        break;
      case 'rolling':
        if (sub !== 0) I(this, B, t, root, vel * 0.8, bd * 0.15);
        break;
    }
  }

  harmony(c) {
    const { t, s, beat, sub, style, ch, meter, R } = c;
    const bd = 60 / this.game.transport.bpm;
    const I = V[style.harmI] || V.harp;
    const base = 60 + this.tonicPc();
    const tones = ch.tones.map((x) => base + x);
    const tri = tones.slice(0, 3);
    const H = this.musicBus;
    const dens = R.dens;
    switch (style.harm) {
      case 'arp': {
        if (sub === 0 || sub === 2) {
          const pat = [0, 1, 2, 3, 2, 1, 0, 1];
          const i = pat[(beat * 2 + (sub ? 1 : 0)) % 8];
          const n = i === 3 ? tri[0] + 12 : tri[i];
          if (dens >= 1 && (dens > 1 || sub === 0 || beat % 2 === 0)) I(this, H, t, n, 0.45, bd, { pan: (i - 1.5) * 0.2 });
        }
        break;
      }
      case 'arpWide': {
        const pat = [0, 1, 2, 3, 4, 3, 2, 1];
        const notes = [tri[0] - 12, tri[0], tri[1], tri[2], tri[0] + 12];
        if (dens >= 2 || sub % 2 === 0) {
          const i = pat[(beat * 4 + sub) % 8];
          I(this, H, t, notes[i], 0.32, bd, { pan: (i - 2) * 0.12 });
        }
        break;
      }
      case 'arpSlow':
        if (sub === 0) I(this, H, t, [tri[0], tri[1], tri[2], tri[0] + 12][beat % 4] + 12, 0.35, bd * 2, { pan: rand(-0.5, 0.5) });
        break;
      case 'arp16': {
        const notes = [tri[0], tri[1], tri[2], tri[0] + 12];
        if (dens >= 2 || sub % 2 === 0) I(this, H, t, notes[(s * 3) % 4] + (s >= 8 ? 12 : 0), 0.35, bd * 0.3, { pan: s % 2 ? 0.25 : -0.25 });
        break;
      }
      case 'strum':
        if (s === 0 || s === 8 || (dens >= 2 && s === 6)) {
          const v = s === 6 ? 0.25 : 0.4;
          tri.concat([tri[0] + 12]).forEach((n, i) => I(this, H, t + i * 0.018, n - 12, v, bd));
        }
        break;
      case 'sustain':
        if (s === 0) tri.forEach((n) => I(this, H, t, n, 0.4, bd * meter * 0.97));
        break;
      case 'alberti':
        if (sub === 0 || sub === 2) {
          const seq = [tri[0], tri[2], tri[1], tri[2]];
          I(this, H, t, seq[(beat * 2 + (sub ? 1 : 0)) % 4], 0.3, bd * 0.5);
        }
        break;
      case 'comp': {
        const voic = [tones[1], tones[3] ?? tones[2] + 3, tones[0] + 14];
        if (s === 0 || s === 6 || (dens >= 2 && s === 14 && Math.random() < 0.5)) voic.forEach((n) => I(this, H, t, n - 12, 0.28, bd * 0.6));
        break;
      }
      case 'power':
        if (sub === 0 || sub === 2) I(this, H, t, tones[0] - 12, sub === 0 ? 0.8 : 0.55, bd * (s === 0 ? 0.7 : 0.18));
        break;
      case 'stabs':
        if (s === 2 || s === 6 || s === 10 || s === 14 || (s === 0 && dens >= 2)) tri.forEach((n) => I(this, H, t, n, 0.3, bd * 0.2));
        break;
      case 'block':
        if (sub === 0) tri.forEach((n) => I(this, H, t, n, beat === 0 ? 0.3 : 0.2, bd * 0.8));
        break;
      case 'skank':
      case 'offchords':
        if (sub === 2) tri.forEach((n) => I(this, H, t, n, 0.28, bd * 0.18));
        break;
    }
  }

  autoMelody(c) {
    const { t, s, bar, style, ch, R } = c;
    const n = this.game.own('flute') + this.game.own('choir') + this.game.own('opera');
    const bd = 60 / this.game.transport.bpm;
    if (s !== 0 && s !== 6 && s !== 8 && s !== 12) return;
    // Phrase nur in bestimmten Takten
    const phraseBar = bar % 4;
    if (phraseBar === 3 && s > 0) return;
    const p = 0.28 + Math.min(0.35, n / 200);
    if (Math.random() > p) return;
    const I = V[style.melody] || V.flute;
    const base = 72 + this.tonicPc();
    const tone = pick(ch.tones.slice(0, 3)) + (Math.random() < 0.3 ? this.scale()[1] : 0);
    I(this, this.musicBus, t, base + tone - (style.melody === 'choirLead' ? 12 : 0), 0.28, bd * (s === 0 ? 1.5 : 0.9), { pan: 0.2 });
    void R;
  }

  // ---------- Klick-Noten ----------
  clickInstrument() {
    const s = this.game.state.settings;
    if (s.clickInstr && s.clickInstr !== 'auto' && V[s.clickInstr]) return s.clickInstr;
    const style = STYLES[this.game.transport.styleId] || STYLES.urzeit;
    return style.lead || 'marimba';
  }
  playClick(info) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const st = this.game.state.settings;
    if (!st.sfxOn) return;
    const now = this.ctx.currentTime;
    if (now - this.lastClickNote < 0.045 && !info.crit) return;
    this.lastClickNote = now;
    const style = STYLES[this.game.transport.styleId] || STYLES.urzeit;
    const instr = this.clickInstrument();
    const I = V[instr] || V.marimba;
    // Melodische Wanderung
    const steps = [-2, -1, 1, 2, 3, -3, 4];
    const w = [2, 4, 4, 2, 0.6, 0.6, 0.3];
    let tot = w.reduce((a, b) => a + b, 0), r = Math.random() * tot, st2 = 1;
    for (let i = 0; i < steps.length; i++) { r -= w[i]; if (r <= 0) { st2 = steps[i]; break; } }
    let m = this.mel + st2;
    if (m < 0) m = -m; if (m > 14) m = 28 - m;
    // Akkordtöne auf starken Schlägen bevorzugen
    if (info.judge === 'perfect' && this.chord) {
      const chordDegs = [0, 2, 4].map((k) => this.chord.deg + k);
      let best = m, bd = 99;
      for (const cd of chordDegs) for (const oo of [0, 7, 14]) { const d2 = Math.abs(cd + oo - m); if (d2 < bd && cd + oo <= 14) { bd = d2; best = cd + oo; } }
      if (bd <= 1) m = best;
    }
    this.mel = m;
    let deg = m;
    if (style.penta) { const map = [0, 1, 2, 4, 5]; deg = map[m % 5] + 7 * Math.floor(m / 5); }
    const midi = this.noteOf(deg, 60);
    const vel = clamp((info.judge === 'perfect' ? 0.75 : info.judge === 'good' ? 0.62 : 0.5) + rand(-0.05, 0.05), 0.2, 1);
    const t = now + 0.001;
    I(this, this.sfxBus, t, midi, vel * 0.9, 0.3, { pan: rand(-0.2, 0.2) });
    bus.emit('note', { midi, strong: info.judge === 'perfect' || info.crit });
    if (info.crit) {
      I(this, this.sfxBus, t + 0.02, midi + 4, vel * 0.6, 0.3);
      I(this, this.sfxBus, t + 0.04, midi + 7, vel * 0.6, 0.3);
      V.glass(this, this.sfxBus, t + 0.05, midi + 24, 0.4);
    }
    if (info.cannon) { D.kick808(this, this.sfxBus, t, 1); D.crash(this, this.sfxBus, t, 1); D.rumble(this, this.sfxBus, t, 1); }
  }

  playPiano(midi, vel = 0.75) {
    if (!this.ensure() || this.ctx.state !== 'running') return;
    V.piano(this, this.sfxBus, this.ctx.currentTime + 0.001, midi, vel, 1.5);
  }

  // ---------- Effekte ----------
  sfx(name, opt = {}) {
    if (!this.ctx || this.ctx.state !== 'running' || !this.game.state.settings.sfxOn) return;
    const t = this.ctx.currentTime + 0.005;
    const B = this.sfxBus;
    const base = 72 + this.tonicPc();
    switch (name) {
      case 'buy': {
        const idx = BUILDING_BY_ID[opt.id]?.index ?? 0;
        const m = 60 + this.tonicPc() + this.scale()[idx % 7] + 12 * Math.floor(idx / 7) % 24;
        V.kalimba(this, B, t, m, 0.5); V.kalimba(this, B, t + 0.06, m + 7, 0.4);
        break;
      }
      case 'upgrade':
        [0, 4, 7, 12].forEach((x, i) => V.bell(this, B, t + i * 0.055, base + x, 0.45));
        break;
      case 'achievement':
        [0, 4, 7, 12, 16].forEach((x, i) => V.squareLead(this, B, t + i * 0.08, base - 12 + x, 0.35, 0.12 + (i === 4 ? 0.5 : 0)));
        V.glass(this, B, t + 0.4, base + 24, 0.4);
        break;
      case 'goldSpawn':
        V.glass(this, B, t, base + 19, 0.3); V.glass(this, B, t + 0.12, base + 24, 0.25);
        break;
      case 'goldClick':
        for (let i = 0; i < 10; i++) V.harp(this, B, t + i * 0.028, this.noteOf(i + 3, 60), 0.5, 0.4, { pan: -0.5 + i * 0.1 });
        V.bell(this, B, t + 0.3, base + 12, 0.5);
        break;
      case 'mini':
        V.glass(this, B, t, base + 12 + Math.floor(rand(0, 12)), 0.3);
        break;
      case 'legend':
        [0, 4, 7].forEach((x) => V.choir(this, B, t, base - 12 + x, 0.6, 1.4));
        V.bell(this, B, t, base + 12, 0.4);
        break;
      case 'era':
        [0, 7, 12, 16, 19].forEach((x, i) => V.bell(this, B, t + i * 0.09, base - 12 + x, 0.45));
        D.timpani(this, B, t, 0.8, 43);
        break;
      case 'gig':
        this.applause(t, 1.8);
        break;
      case 'dacapo':
        [0, 4, 7, 12, 16].forEach((x) => V.cosmic(this, B, t, base - 24 + x, 0.9, 3));
        D.timpani(this, B, t, 1, 43); D.crash(this, B, t + 0.02, 1);
        for (let i = 0; i < 14; i++) V.harp(this, B, t + 0.1 + i * 0.05, this.noteOf(i, 60), 0.4);
        break;
      case 'insp':
        V.bell(this, B, t, base + 16, 0.3);
        break;
      case 'combo':
        V.glass(this, B, t, base + 12 + (opt.k || 0) % 12, 0.3);
        break;
      case 'surprise':
        D.timpani(this, B, t, 1.2, 40); D.crash(this, B, t, 0.8);
        break;
      case 'melody':
        [0, 4, 7, 11, 14].forEach((x, i) => V.vibes(this, B, t + i * 0.1, base + x, 0.5));
        break;
      case 'tab':
        D.blip(this, B, t, 0.5, 96);
        break;
      case 'error':
        V.pluckBass(this, B, t, 40, 0.6);
        break;
      case 'open':
        V.bell(this, B, t, base + 7, 0.25);
        break;
    }
  }

  applause(t, dur) {
    const n = Math.round(35 * dur);
    for (let i = 0; i < n; i++) {
      const tt = t + Math.pow(Math.random(), 1.3) * dur;
      const f = 900 + Math.random() * 1800;
      const env = 1 - (tt - t) / dur;
      const node = this.ctx.createBufferSource();
      node.buffer = this.noise;
      const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 1.1;
      const g = this.ctx.createGain();
      node.connect(bp); bp.connect(g); g.connect(this.sfxBus);
      g.gain.setValueAtTime(0.0001, tt);
      g.gain.linearRampToValueAtTime(0.12 * env + 0.02, tt + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.04);
      node.start(tt, Math.random()); node.stop(tt + 0.06);
    }
  }
}
