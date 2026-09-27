// Kreisförmiger Audio-Visualizer um die Schallplatte + Beat-Anzeige
import { hexA } from './background.js';

export class Visualizer {
  constructor(canvas, audio) {
    this.c = canvas;
    this.g = canvas.getContext('2d');
    this.audio = audio;
    this.smooth = new Float32Array(64);
    this.accent = '#ff9d4a'; this.accent2 = '#ffcf7a';
    this.resize();
    window.addEventListener('resize', () => this.resize());
    // Die Bühne ändert ihre Größe auch ohne Fenster-Resize (z. B. wenn neue Währungen erscheinen)
    if (window.ResizeObserver) new ResizeObserver(() => this.resize()).observe(canvas);
  }
  resize() {
    const r = this.c.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.size = Math.max(10, Math.min(r.width, r.height));
    this.c.width = Math.floor(r.width * dpr); this.c.height = Math.floor(r.height * dpr);
    this.g.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cw = r.width; this.ch = r.height;
  }
  frame(dt, beatPhase, groove, meter, beatIdx, active) {
    const g = this.g, w = this.cw, h = this.ch;
    g.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const R0 = this.size * 0.305; // knapp außerhalb der Platte (Platte = 70 % von 86 %)
    const N = 64;
    let data = null;
    if (this.audio && this.audio.analyser) data = this.audio.getLevels();
    // Balken
    for (let i = 0; i < N; i++) {
      const src = data ? data[2 + Math.floor((i < N / 2 ? i : N - 1 - i) * 1.4)] / 255 : 0;
      this.smooth[i] += (src - this.smooth[i]) * Math.min(1, dt * 14);
    }
    const pulse = Math.pow(1 - beatPhase, 3);
    g.save();
    g.translate(cx, cy);
    g.lineCap = 'round';
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2;
      const v = this.smooth[i];
      const len = 3 + v * this.size * 0.12 + groove * 4 + pulse * 3;
      const x0 = Math.cos(a) * (R0 + 4), y0 = Math.sin(a) * (R0 + 4);
      const x1 = Math.cos(a) * (R0 + 4 + len), y1 = Math.sin(a) * (R0 + 4 + len);
      g.strokeStyle = hexA(i % 2 ? this.accent : this.accent2, 0.35 + v * 0.65);
      g.lineWidth = Math.max(1.5, this.size * 0.012);
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
    // Anflug-Ring: schrumpft bis zum nächsten Schlag auf die Plattenkante
    if (active) {
      const rEdge = this.size * 0.305;
      const rem0 = 1 - beatPhase; // Anteil des Schlags bis zum nächsten Beat (1 → 0)
      for (const rem of [rem0, rem0 + 1]) {
        const rad = rEdge + rem * this.size * 0.075;
        const alpha = Math.max(0, 1 - rem / 2) * 0.6;
        if (alpha <= 0.02 || rad > this.size * 0.5) continue;
        g.strokeStyle = hexA(this.accent2, alpha);
        g.lineWidth = 1 + (1 - Math.min(1, rem)) * 3;
        g.beginPath(); g.arc(0, 0, rad, 0, 6.283); g.stroke();
      }
    }
    // Beat-Punkte (Taktschläge) auf einem inneren Ring
    if (active) {
      const Rb = R0 - this.size * 0.0; void Rb;
      const rr = this.size * 0.46;
      for (let b = 0; b < meter; b++) {
        const a = (b / meter) * Math.PI * 2 - Math.PI / 2;
        const cur = ((beatIdx % meter) + meter) % meter === b;
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        g.fillStyle = cur ? hexA(this.accent2, 0.4 + pulse * 0.6) : 'rgba(255,255,255,.12)';
        g.beginPath(); g.arc(x, y, (cur ? 4 + pulse * 3 : 3) * (b === 0 ? 1.3 : 1), 0, 6.283); g.fill();
      }
      // Zeiger – kreist einmal pro Takt
      const frac = ((((beatIdx % meter) + meter) % meter) + beatPhase) / meter;
      const a = frac * Math.PI * 2 - Math.PI / 2;
      g.strokeStyle = hexA(this.accent2, 0.25 + groove * 0.4);
      g.lineWidth = 2;
      g.beginPath(); g.arc(0, 0, rr, -Math.PI / 2, a); g.stroke();
      // Groove-Aura
      if (groove > 0.02) {
        const grad = g.createRadialGradient(0, 0, R0 * 0.9, 0, 0, R0 * 1.5);
        grad.addColorStop(0, hexA(this.accent, 0.18 * groove + pulse * 0.08 * groove));
        grad.addColorStop(1, hexA(this.accent, 0));
        g.fillStyle = grad; g.beginPath(); g.arc(0, 0, R0 * 1.5, 0, 6.283); g.fill();
      }
    }
    g.restore();
  }
}
