// Übungsklavier: frei spielen, geheime Melodien entdecken
import { MELODIES } from '../../data/melodies.js';
import { icon, esc } from '../dom.js';

const DE = ['C', 'Cis', 'D', 'Dis', 'E', 'F', 'Fis', 'G', 'Gis', 'A', 'B', 'H'];
const BLACK = new Set([1, 3, 6, 8, 10]);
// Tastatur-Belegung (zwei Reihen wie in DAWs)
const KEYMAP = {
  KeyA: 0, KeyW: 1, KeyS: 2, KeyE: 3, KeyD: 4, KeyF: 5, KeyT: 6, KeyG: 7, KeyZ: 8, KeyY: 8, KeyH: 9, KeyU: 10, KeyJ: 11,
  KeyK: 12, KeyO: 13, KeyL: 14, KeyP: 15, Semicolon: 16, Quote: 17, BracketLeft: 17,
};

export class PianoPanel {
  constructor(app) { this.app = app; this.base = 60; this.octaves = 2; this.recent = []; this.down = new Set(); }
  get g() { return this.app.game; }

  mount(el) {
    this.el = el;
    this.app.pianoActive = true;
    const small = window.innerWidth < 560;
    this.octaves = small ? 1.5 : 2;
    el.innerHTML = `<div class="sec-title">${icon('piano-keys')}<h2>Übungsklavier</h2><span class="spacer"></span>
        <button class="btn small" data-oct="-1">${icon('plain-arrow')} Oktave tiefer</button><button class="btn small" data-oct="1">Oktave höher</button></div>
      <p class="sec-sub">Spiel frei – oder entdecke berühmte Melodien! Wer eine erkennt, wird mit <b class="insp">Inspiration</b> belohnt. Am Computer spielst du mit den Tasten <b>A S D F G H J K</b> (weiß) und <b>W E T Z U O P</b> (schwarz).</p>
      <div class="piano" id="pn-keys"></div>
      <div class="piano-notes" id="pn-notes"><span class="muted" style="background:none">Gespielte Töne erscheinen hier …</span></div>
      <div class="h3">${icon('musical-score')} Entdeckte Melodien <span class="count" id="pn-count"></span></div>
      <div class="grid two" id="pn-list"></div>`;
    el.querySelector('[data-oct="-1"]').firstElementChild.style.transform = 'rotate(90deg)';
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-oct]'); if (!b) return;
      this.base = Math.max(36, Math.min(72, this.base + 12 * Number(b.dataset.oct)));
      this.buildKeys();
    });
    this.buildKeys();
    this.renderList();
    this.onKey = (e) => this.key(e, true);
    this.onKeyUp = (e) => this.key(e, false);
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('keyup', this.onKeyUp);
  }
  unmount() {
    this.app.pianoActive = false;
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('keyup', this.onKeyUp);
  }
  onEvent(ev) { if (ev === 'melody') this.renderList(); }

  buildKeys() {
    const wrap = this.el.querySelector('#pn-keys');
    const n = Math.round(12 * this.octaves) + 1;
    const whites = [];
    for (let i = 0; i < n; i++) if (!BLACK.has((this.base + i) % 12)) whites.push(i);
    wrap.style.setProperty('--whites', whites.length);
    let html = '';
    for (let i = 0; i < n; i++) {
      const m = this.base + i;
      const pc = m % 12;
      if (BLACK.has(pc)) continue;
      html += `<div class="pkey" data-m="${m}">${pc === 0 ? 'C' + (Math.floor(m / 12) - 1) : DE[pc]}</div>`;
    }
    wrap.innerHTML = html;
    // Schwarze Tasten absolut positionieren
    const wCount = whites.length;
    let wi = 0;
    for (let i = 0; i < n; i++) {
      const m = this.base + i;
      if (!BLACK.has(m % 12)) { wi++; continue; }
      const k = document.createElement('div');
      k.className = 'pkey black'; k.dataset.m = m;
      k.textContent = DE[m % 12];
      k.style.left = `calc(6px + (100% - 12px) * ${wi / wCount} - (100% - 12px) / ${wCount} * 0.31)`;
      wrap.appendChild(k);
    }
    const press = (el) => {
      if (!el) return;
      const m = Number(el.dataset.m);
      this.play(m, el);
    };
    wrap.onpointerdown = (e) => {
      e.preventDefault();
      const el = e.target.closest('.pkey');
      press(el);
      this.dragging = true;
      this.lastEl = el;
      wrap.setPointerCapture?.(e.pointerId);
    };
    wrap.onpointermove = (e) => {
      if (!this.dragging) return;
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.pkey');
      if (el && el !== this.lastEl && wrap.contains(el)) { this.lastEl = el; press(el); }
    };
    wrap.onpointerup = wrap.onpointercancel = () => { this.dragging = false; this.lastEl = null; };
  }

  key(e, isDown) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    const off = KEYMAP[e.code];
    if (off === undefined) return;
    e.preventDefault();
    if (isDown) {
      if (this.down.has(e.code)) return;
      this.down.add(e.code);
      const m = this.base + off;
      this.play(m, this.el.querySelector(`.pkey[data-m="${m}"]`));
    } else this.down.delete(e.code);
  }

  play(m, el) {
    this.app.audio.playPiano(m, 0.75);
    if (el) { el.classList.add('down'); setTimeout(() => el.classList.remove('down'), 160); }
    this.recent.push(DE[m % 12] + (Math.floor(m / 12) - 1));
    if (this.recent.length > 12) this.recent.shift();
    const notes = this.el.querySelector('#pn-notes');
    notes.innerHTML = this.recent.map((n) => `<span>${n}</span>`).join('');
    const found = this.g.pianoNote(m);
    if (found) {
      this.recent = [];
      const r = el ? el.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0 };
      this.app.particles.confetti(r.left + r.width / 2, r.top, 50);
    }
  }

  renderList() {
    if (!this.el?.isConnected) return;
    const st = this.g.state;
    const n = Object.keys(st.melodies).length;
    this.el.querySelector('#pn-count').textContent = `${n} / ${MELODIES.length}`;
    // Hinweise: alle gefundenen + die nächsten drei ungefundenen
    let hints = 0;
    this.el.querySelector('#pn-list').innerHTML = MELODIES.map((m) => {
      const f = st.melodies[m.id];
      if (f) return `<div class="melody-item found"><div class="ico-box sm" style="--c:#f3b23a">${icon('check-mark')}</div><div><b>${esc(m.name)}</b><div class="muted" style="font-size:12px">${esc(m.by)}</div><div class="lore" style="font-size:12.5px;margin-top:4px">${esc(m.lore)}</div></div></div>`;
      if (hints++ >= 3) return '';
      return `<div class="melody-item"><div class="ico-box sm locked">?</div><div><b>Unbekannte Melodie</b><div class="muted" style="font-size:12.5px;margin-top:2px">${esc(m.hint)}</div></div></div>`;
    }).join('');
  }
}
