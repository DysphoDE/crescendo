// Animierter Hintergrund: Farbverlauf der Epoche, wogende Notenlinien, schwebende Notenzeichen, Sterne
import { rand } from '../core/util.js';

const GLYPHS = ['♩', '♪', '♫', '♬', '𝄞', '𝄢', '♭', '♯', '𝄐', '♮'];

export class Background {
  constructor(canvas, audio) {
    this.c = canvas;
    this.g = canvas.getContext('2d');
    this.audio = audio;
    this.parts = [];
    this.stars = [];
    this.colors = { a: '#2a1406', b: '#120904', accent: '#ff9d4a', accent2: '#ffcf7a' };
    this.target = { ...this.colors };
    this.cosmic = 0;
    this.quality = 'high';
    this.level = 0;
    this.t = 0;
    this.notes = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, this.quality === 'low' ? 1 : 1.75);
    this.dpr = dpr;
    this.w = window.innerWidth; this.h = window.innerHeight;
    this.c.width = Math.floor(this.w * dpr); this.c.height = Math.floor(this.h * dpr);
    this.g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = this.quality === 'off' ? 0 : Math.round((this.w * this.h) / (this.quality === 'low' ? 60000 : 30000));
    this.parts = [];
    for (let i = 0; i < Math.min(60, n); i++) this.parts.push(this.newPart(true));
    this.stars = [];
    for (let i = 0; i < 140; i++) this.stars.push({ x: Math.random(), y: Math.random(), r: rand(0.3, 1.4), p: rand(0, 6.28), s: rand(0.5, 2) });
  }
  newPart(anywhere) {
    return {
      x: rand(0, this.w), y: anywhere ? rand(0, this.h) : this.h + 30,
      vy: rand(6, 20), sway: rand(10, 40), phase: rand(0, 6.28), size: rand(14, 38),
      rot: rand(-0.4, 0.4), vr: rand(-0.15, 0.15), a: rand(0.05, 0.16), glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    };
  }
  // Ein gespielter Ton erscheint als Notenkopf auf den Notenlinien
  addNote(midi, strong = false) {
    if (this.quality === 'off') return;
    if (this.notes.length > 60) this.notes.shift();
    const x1 = this.staff?.x1 ?? this.w * 0.68;
    this.notes.push({ midi, x: x1 - 30 - Math.random() * 20, life: 0, strong });
  }
  // Position der Notenlinien (wird von der App aus dem Layout berechnet)
  setStaff(y, x0, x1) { this.staff = { y, x0, x1 }; }
  gap() { return Math.max(10, Math.min(16, this.h / 52)); }
  staffY(x, i) {
    const gap = this.gap();
    const baseY = this.staff ? this.staff.y : this.h * 0.72;
    const amp = this._amp ?? 10;
    return baseY + i * gap + Math.sin(x * 0.006 + this.t * 0.9 + i * 0.25) * amp * 0.6 + Math.sin(x * 0.013 - this.t * 1.3) * amp * 0.25;
  }

  setEra(era) {
    this.target = { ...era.colors };
    this.cosmicTarget = era.id === 'kosmos' || era.id === 'zukunft' ? 1 : 0;
  }
  setQuality(q) { this.quality = q; this.resize(); }

  lerpColor(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round(((pa >> 16) & 255) + ((((pb >> 16) & 255) - ((pa >> 16) & 255)) * t));
    const g = Math.round(((pa >> 8) & 255) + ((((pb >> 8) & 255) - ((pa >> 8) & 255)) * t));
    const bl = Math.round((pa & 255) + (((pb & 255) - (pa & 255)) * t));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
  }

  frame(dt, beatPulse, groove) {
    const g = this.g, w = this.w, h = this.h;
    this.t += dt;
    // Farben weich überblenden
    const k = Math.min(1, dt * 0.8);
    for (const key of ['a', 'b', 'accent', 'accent2']) this.colors[key] = this.lerpColor(this.colors[key], this.target[key], k);
    this.cosmic += ((this.cosmicTarget || 0) - this.cosmic) * Math.min(1, dt * 0.5);

    // Pegel aus dem Analyser
    let lvl = 0;
    if (this.audio && this.audio.analyser) {
      const d = this.audio.getLevels();
      let s = 0; for (let i = 2; i < 40; i++) s += d[i];
      lvl = s / (38 * 255);
    }
    this.level += (lvl - this.level) * Math.min(1, dt * 6);

    const grad = g.createRadialGradient(w * 0.32, h * 0.25, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.95);
    grad.addColorStop(0, this.colors.a);
    grad.addColorStop(0.55, this.colors.b);
    grad.addColorStop(1, '#05030b');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);

    if (this.quality === 'off') return;

    // Sterne (stärker im Kosmos)
    const starA = 0.25 + this.cosmic * 0.75;
    g.fillStyle = '#fff';
    for (const s of this.stars) {
      const tw = 0.5 + 0.5 * Math.sin(this.t * s.s + s.p);
      g.globalAlpha = starA * tw * 0.7;
      g.beginPath(); g.arc(s.x * w, s.y * h, s.r, 0, 6.283); g.fill();
    }
    g.globalAlpha = 1;

    // Lichtschein, pulsiert mit dem Beat
    const glow = g.createRadialGradient(w * 0.5, h * 0.62, 0, w * 0.5, h * 0.62, Math.max(w, h) * 0.6);
    const ga = 0.06 + beatPulse * 0.05 + groove * 0.06 + this.level * 0.12;
    glow.addColorStop(0, hexA(this.colors.accent, ga));
    glow.addColorStop(1, hexA(this.colors.accent, 0));
    g.fillStyle = glow; g.fillRect(0, 0, w, h);

    // Notenlinien
    const lines = 5, gap = this.gap();
    const baseY = this.staff ? this.staff.y : h * 0.72;
    const amp = 10 + this.level * 60 + beatPulse * 8;
    this._amp = amp;
    g.lineWidth = 1.2;
    for (let i = 0; i < lines; i++) {
      g.strokeStyle = hexA(this.colors.accent2, 0.07 + this.level * 0.12);
      g.beginPath();
      for (let x = -20; x <= w + 20; x += 18) {
        const y = baseY + i * gap + Math.sin(x * 0.006 + this.t * 0.9 + i * 0.25) * amp * 0.6 + Math.sin(x * 0.013 - this.t * 1.3) * amp * 0.25;
        if (x === -20) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
    }

    // Notenschlüssel am Zeilenanfang
    const gap0 = this.gap();
    const cx = (this.staff?.x0 ?? 0) + 14;
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillStyle = hexA(this.colors.accent2, 0.14 + this.level * 0.18);
    g.font = `${gap0 * 6.2}px "Noto Music", serif`;
    g.fillText('𝄞', cx, this.staffY(cx + 20, 4) + gap0 * 1.2);
    // Lebende Partitur: gespielte Töne als Notenköpfe
    if (this.notes.length) {
      const LETTER = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
      const SHARP = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
      for (let i = this.notes.length - 1; i >= 0; i--) {
        const n = this.notes[i];
        n.life += dt; n.x -= (70 + this.level * 60) * dt;
        const x0 = (this.staff?.x0 ?? 0) + 50;
        const a = Math.min(1, n.life * 4) * Math.max(0, Math.min(1, (n.x - x0) / 80));
        if (n.x < -20 || a <= 0) { this.notes.splice(i, 1); continue; }
        const pc = ((n.midi % 12) + 12) % 12;
        const dia = LETTER[pc] + 7 * Math.floor(n.midi / 12);
        const step = dia - (2 + 7 * Math.floor(64 / 12)); // 0 = unterste Linie (E4)
        const bottom = this.staffY(n.x, 4);
        const top = this.staffY(n.x, 0);
        const half = (bottom - top) / 8;
        const y = bottom - step * half;
        g.save();
        g.globalAlpha = a * (n.strong ? 0.75 : 0.5);
        g.strokeStyle = this.colors.accent2; g.fillStyle = this.colors.accent2; g.lineWidth = 1.3;
        // Hilfslinien
        for (let s2 = step <= -2 ? -2 : 10; step <= -2 ? s2 >= step : s2 <= step; s2 += step <= -2 ? -2 : 2) {
          if (step > -2 && step < 10) break;
          const ly = bottom - s2 * half;
          g.beginPath(); g.moveTo(n.x - half * 2.2, ly); g.lineTo(n.x + half * 2.2, ly); g.stroke();
        }
        g.translate(n.x, y); g.rotate(-0.35);
        g.beginPath(); g.ellipse(0, 0, half * 1.35, half * 0.95, 0, 0, 6.283); g.fill();
        g.rotate(0.35);
        g.beginPath(); g.moveTo(half * 1.2, -half * 0.2); g.lineTo(half * 1.2, -half * 7); g.stroke();
        if (SHARP[pc]) { g.font = `${half * 3.2}px "Noto Music", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('♯', -half * 3, 0); }
        g.restore();
      }
    }
    // Schwebende Notenzeichen
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i];
      p.y -= p.vy * dt * (1 + this.level * 1.5);
      p.phase += dt; p.rot += p.vr * dt;
      if (p.y < -40) { this.parts[i] = this.newPart(false); continue; }
      const x = p.x + Math.sin(p.phase * 0.6) * p.sway;
      g.save();
      g.translate(x, p.y); g.rotate(p.rot);
      g.globalAlpha = p.a * (0.8 + beatPulse * 0.5);
      g.fillStyle = this.colors.accent2;
      g.font = `${p.size}px "Noto Music", serif`;
      g.fillText(p.glyph, 0, 0);
      g.restore();
    }
    g.globalAlpha = 1;
  }
}

export function hexA(hex, a) {
  const p = parseInt(hex.slice(1), 16);
  return `rgba(${(p >> 16) & 255},${(p >> 8) & 255},${p & 255},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
}
