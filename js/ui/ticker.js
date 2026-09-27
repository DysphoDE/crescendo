// Nachrichten-Ticker
import { NEWS, DYN_NEWS } from '../data/news.js';
import { pick } from '../core/util.js';
import { esc } from './dom.js';

export class Ticker {
  constructor(app) {
    this.app = app;
    this.wrap = document.getElementById('ticker');
    this.item = this.wrap.querySelector('.ticker-item');
    this.recent = [];
    this.x = 0; this.w = 0; this.running = false;
    this.next();
  }
  pickHeadline() {
    const g = this.app.game;
    const era = g.eraIndex();
    if (Math.random() < 0.2) {
      const dyn = DYN_NEWS.map((f) => { try { return f(g); } catch (e) { return null; } }).filter(Boolean);
      if (dyn.length) return pick(dyn);
    }
    let pool = NEWS.filter((n) => era >= n.era && era <= n.max && !this.recent.includes(n.t));
    if (!pool.length) { this.recent = []; pool = NEWS.filter((n) => era >= n.era && era <= n.max); }
    const n = pick(pool);
    this.recent.push(n.t);
    if (this.recent.length > 12) this.recent.shift();
    return n.t;
  }
  next() {
    const t = this.pickHeadline();
    this.item.innerHTML = `<b>♪</b> ${esc(t)}`;
    this.item.style.paddingLeft = '0';
    this.w = this.item.scrollWidth;
    this.boxW = this.wrap.clientWidth;
    this.x = this.boxW;
    this.item.style.transform = `translateX(${this.x}px)`;
  }
  frame(dt) {
    if (!this.app.game.state.settings.ticker) { this.wrap.style.visibility = 'hidden'; return; }
    this.wrap.style.visibility = '';
    if (!this.boxW) this.boxW = this.wrap.clientWidth;
    this.x -= 62 * dt;
    if (this.x < -this.w - 20) this.next();
    this.item.style.transform = `translateX(${this.x.toFixed(1)}px)`;
  }
}
