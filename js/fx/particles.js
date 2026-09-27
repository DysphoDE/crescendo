// Partikel & schwebende Zahlen auf einer Overlay-Leinwand
import { rand, pick } from '../core/util.js';
import { hexA } from './background.js';

const NOTE_GLYPHS = ['♪', '♫', '♩', '♬'];

export class Particles {
  constructor(canvas) {
    this.c = canvas;
    this.g = canvas.getContext('2d');
    this.parts = [];
    this.texts = [];
    this.rings = [];
    this.quality = 'high';
    this.accent = '#ff9d4a';
    this.accent2 = '#ffcf7a';
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth; this.h = window.innerHeight;
    this.c.width = Math.floor(this.w * dpr); this.c.height = Math.floor(this.h * dpr);
    this.g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  limit() { return this.quality === 'off' ? 0 : this.quality === 'low' ? 120 : 420; }

  burst(x, y, opts = {}) {
    const n = Math.min(opts.n ?? 6, Math.max(0, this.limit() - this.parts.length));
    for (let i = 0; i < n; i++) {
      const ang = opts.ang !== undefined ? opts.ang + rand(-0.6, 0.6) : rand(0, Math.PI * 2);
      const sp = rand(opts.sp0 ?? 90, opts.sp1 ?? 260);
      this.parts.push({
        x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - (opts.up ?? 120),
        life: 0, max: rand(0.7, 1.3) * (opts.life ?? 1), size: rand(opts.s0 ?? 14, opts.s1 ?? 24),
        rot: rand(-1, 1), vr: rand(-4, 4), glyph: opts.glyph || pick(NOTE_GLYPHS),
        color: opts.color || (Math.random() < 0.5 ? this.accent2 : '#ffffff'), grav: opts.grav ?? 420,
        type: opts.type || 'glyph',
      });
    }
  }
  confetti(x, y, n = 60) {
    const cols = ['#ffd36b', '#ff7aa2', '#8fd6ff', '#79e8a8', '#c77dff', '#ffffff'];
    for (let i = 0; i < Math.min(n, this.limit() - this.parts.length); i++) {
      const ang = rand(-Math.PI, 0);
      const sp = rand(200, 620);
      this.parts.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 0, max: rand(1.4, 2.4), size: rand(5, 10), rot: rand(0, 6), vr: rand(-10, 10), color: pick(cols), grav: 520, type: 'rect', drag: 1.6 });
    }
  }
  text(x, y, str, opts = {}) {
    if (this.quality === 'off' && !opts.force) return;
    if (this.texts.length > 40) this.texts.shift();
    this.texts.push({ x: x + rand(-14, 14), y, str, life: 0, max: opts.life ?? 1.1, size: opts.size ?? 22, color: opts.color || '#fff', vy: opts.vy ?? -70, bold: opts.bold ?? 900, stroke: opts.stroke ?? true });
  }
  ring(x, y, opts = {}) {
    this.rings.push({ x, y, r: opts.r0 ?? 10, r1: opts.r1 ?? 120, life: 0, max: opts.life ?? 0.6, color: opts.color || this.accent2, w: opts.w ?? 3 });
  }

  frame(dt) {
    const g = this.g;
    g.clearRect(0, 0, this.w, this.h);
    // Ringe
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life += dt;
      const t = r.life / r.max;
      if (t >= 1) { this.rings.splice(i, 1); continue; }
      const rad = r.r + (r.r1 - r.r) * (1 - Math.pow(1 - t, 3));
      g.strokeStyle = hexA(r.color, (1 - t) * 0.8);
      g.lineWidth = r.w * (1 - t) + 0.5;
      g.beginPath(); g.arc(r.x, r.y, rad, 0, 6.283); g.stroke();
    }
    // Partikel
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.life += dt;
      if (p.life >= p.max) { this.parts.splice(i, 1); continue; }
      if (p.drag) { p.vx -= p.vx * p.drag * dt; p.vy -= p.vy * p.drag * dt * 0.3; }
      p.vy += p.grav * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const t = p.life / p.max;
      const a = t < 0.1 ? t / 0.1 : 1 - Math.pow((t - 0.1) / 0.9, 2);
      g.save();
      g.translate(p.x, p.y); g.rotate(p.rot);
      g.globalAlpha = Math.max(0, a);
      if (p.type === 'rect') {
        g.fillStyle = p.color; g.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.type === 'spark') {
        g.fillStyle = p.color; g.beginPath(); g.arc(0, 0, p.size * 0.18, 0, 6.283); g.fill();
      } else {
        g.fillStyle = p.color;
        g.shadowColor = hexA(this.accent, 0.8); g.shadowBlur = 8;
        g.font = `${p.size}px "Noto Music", serif`;
        g.fillText(p.glyph, 0, 0);
      }
      g.restore();
    }
    // Texte
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const tx = this.texts[i];
      tx.life += dt;
      if (tx.life >= tx.max) { this.texts.splice(i, 1); continue; }
      tx.y += tx.vy * dt; tx.vy *= 1 - dt * 1.2;
      const t = tx.life / tx.max;
      const sc = t < 0.12 ? 0.6 + (t / 0.12) * 0.5 : 1.1 - Math.min(0.1, (t - 0.12));
      g.save();
      g.globalAlpha = t > 0.6 ? 1 - (t - 0.6) / 0.4 : 1;
      g.translate(tx.x, tx.y); g.scale(sc, sc);
      g.font = `${tx.bold} ${tx.size}px Nunito, sans-serif`;
      if (tx.stroke) { g.lineWidth = 4; g.strokeStyle = 'rgba(10,6,20,.75)'; g.strokeText(tx.str, 0, 0); }
      g.fillStyle = tx.color;
      g.fillText(tx.str, 0, 0);
      g.restore();
    }
  }
}
