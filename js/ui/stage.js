// Bühne: Zähler, Schallplatte, Groove, Buffs, goldene Noten
import { fmt, fmtS, fmtDec, fmtMult, fmtParts } from '../core/format.js';
import { bus } from '../core/bus.js';
import { setText, toggleClass, clamp, h, perf, rand } from '../core/util.js';
import { icon, toast } from './dom.js';
import { STYLES } from '../audio/styles.js';
import { CHALLENGE_BY_ID } from '../data/challenges.js';
import { LEGEND_BY_ID } from '../data/legends.js';
import { MODE_BY_ID } from '../data/theory.js';
import { GENRE_BY_ID } from '../data/genres.js';

const JUDGE_LABEL = { perfect: 'Perfekt!', good: 'Gut', miss: 'Daneben' };

export class Stage {
  constructor(app) {
    this.app = app;
    const $ = (id) => document.getElementById(id);
    this.el = {
      notes: $('notesVal'), unit: document.querySelector('.notes-unit'), nps: $('npsVal'), curr: $('currRow'), record: $('record'), spin: $('recordSpin'),
      label: $('recordLabel'), wrap: $('recordWrap'), ring: $('beatRing'), hint: $('clickHint'),
      groovePanel: $('groovePanel'), tempo: $('tempoVal'), grooveFill: $('grooveFill'), grooveMult: $('grooveMult'), combo: $('comboVal'),
      judge: $('judgeText'), buffs: $('buffs'), info: $('stageInfo'), beats: $('grooveBeats'), gold: $('goldLayer'),
    };
    this.angle = 0;
    this.pressT = 0;
    this.goldEls = new Map();
    this.lastBuffKey = '';
    this.chipVals = {};
    this.bind();
  }

  bind() {
    const rec = this.el.record;
    rec.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button > 0) return;
      e.preventDefault();
      this.hit(e.timeStamp / 1000, e.clientX, e.clientY);
    });
    rec.addEventListener('contextmenu', (e) => e.preventDefault());
    rec.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this.hitCenter(); } });
    window.addEventListener('keydown', (e) => {
      if (e.code !== 'Space' || e.repeat) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (this.app.pianoActive) return;
      e.preventDefault();
      this.hitCenter(e.timeStamp / 1000);
    });

    bus.on('golden:spawn', (gn) => this.spawnGolden(gn));
    bus.on('golden:expire', () => this.syncGoldens());
    bus.on('tempo', (tr) => this.buildBeatTicks(tr.meter));
    bus.on('beat', (b) => this.onBeat(b));
    this.buildBeatTicks(4);
  }

  hitCenter(ts) {
    const r = this.el.record.getBoundingClientRect();
    this.hit(ts ?? performance.now() / 1000, r.left + r.width / 2 + rand(-r.width * 0.2, r.width * 0.2), r.top + r.height / 2 + rand(-r.height * 0.2, r.height * 0.2));
  }

  hit(ts, x, y) {
    const app = this.app, g = app.game;
    app.audio.ensure();
    const lat = (g.state.settings.latency || 0) / 1000;
    const info = g.click(ts - lat, { x, y });
    app.audio.playClick(info);
    // Optik
    this.pressT = 0.09;
    this.el.record.classList.add('press');
    clearTimeout(this._pt);
    this._pt = setTimeout(() => this.el.record.classList.remove('press'), 70);
    const P = app.particles;
    const color = info.crit ? '#ffd36b' : '#ffffff';
    P.burst(x, y, { n: info.crit ? 12 : info.judge === 'perfect' ? 5 : 3, up: 160, s0: 16, s1: info.crit ? 32 : 24 });
    P.text(x, y - 18, '+' + fmtS(info.v, 1), { color, size: info.crit ? 30 : 22 });
    if (info.crit) { P.text(x, y - 56, 'Volltreffer!', { color: '#ffd36b', size: 18, life: 1.2 }); P.ring(x, y, { r1: 90, color: '#ffd36b' }); }
    if (info.cannon) { P.text(x, y - 80, 'KANONENSCHUSS!', { color: '#ff7a59', size: 22, life: 1.4 }); P.confetti(x, y, 30); app.shake(8); }
    if (info.judge) this.showJudge(info.judge, info.combo);
    if (info.judge && info.judge !== 'miss' && info.combo >= 16 && (info.combo & (info.combo - 1)) === 0) {
      const r = this.el.record.getBoundingClientRect();
      P.text(r.left + r.width / 2, r.top - 4, `${info.combo}er-Kombo!`, { color: '#ffd36b', size: 26, life: 1.6 });
      P.ring(r.left + r.width / 2, r.top + r.height / 2, { r0: r.width * 0.5, r1: r.width * 0.95, life: 0.8, w: 4, color: '#ffd36b' });
      app.audio.sfx('combo', { k: Math.log2(info.combo) });
    }
    if (g.groove >= 0.999 && !this._flow && info.judge && info.judge !== 'miss') {
      this._flow = true;
      const r = this.el.record.getBoundingClientRect();
      P.text(r.left + r.width / 2, r.top + r.height * 0.15, 'Im Flow!', { color: '#ffffff', size: 30, life: 1.8 });
      P.burst(r.left + r.width / 2, r.top + r.height / 2, { n: 24, s0: 16, s1: 28, up: 220 });
    }
    if (g.groove < 0.6) this._flow = false;
    if (info.judge === 'perfect') {
      const r = this.el.record.getBoundingClientRect();
      P.ring(r.left + r.width / 2, r.top + r.height / 2, { r0: r.width * 0.5, r1: r.width * 0.62, life: 0.45, w: 2 });
    }
    if (!g.state.flags.tutorial.firstClick) {
      g.state.flags.tutorial.firstClick = true;
      this.el.hint.classList.add('hidden');
    }
  }

  showJudge(j, combo) {
    const el = this.el.judge;
    el.className = 'judge-text';
    void el.offsetWidth;
    el.textContent = JUDGE_LABEL[j] + (j !== 'miss' && combo > 1 ? `  ·  ${combo}` : '');
    el.classList.add('show', j);
  }

  onBeat(b) {
    const g = this.app.game;
    if (g.transport.noBeat || !this.beatVisible()) return;
    const ring = this.el.ring;
    ring.classList.remove('hit'); void ring.offsetWidth; ring.classList.add('hit');
    if (b.index % b.meter === 0) ring.style.borderWidth = '3px'; else ring.style.borderWidth = '2px';
  }
  beatVisible() {
    const g = this.app.game;
    return g.own('drum') > 0 || g.own('clap') > 0;
  }

  buildBeatTicks(meter) {
    const el = this.el.beats;
    el.innerHTML = '';
    for (let i = 1; i < 10; i++) el.appendChild(document.createElement('i'));
    void meter;
  }

  // ---------- Goldene Noten ----------
  spawnGolden(gn) {
    const el = h('button.golden' + (gn.mini ? '.mini' : ''), { type: 'button', 'aria-label': 'Goldene Note' });
    el.innerHTML = `<span class="gn">${gn.mini ? '♪' : Math.random() < 0.5 ? '♫' : '♬'}</span>`;
    const vw = window.innerWidth, vh = window.innerHeight;
    const x = clamp(gn.x * vw, 50, vw - 50), y = clamp(gn.y * vh, 80, vh - 100);
    el.style.left = x + 'px'; el.style.top = y + 'px';
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      this.app.audio.ensure();
      const res = this.app.game.clickGolden(gn.id);
      if (!res) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      this.app.onGoldenClicked(res, cx, cy);
      el.classList.add('leaving');
      this.goldEls.delete(gn.id);
      setTimeout(() => el.remove(), 480);
    });
    this.el.gold.appendChild(el);
    this.goldEls.set(gn.id, el);
    if (!gn.mini) this.app.audio.sfx('goldSpawn');
  }
  syncGoldens() {
    const alive = new Set(this.app.game.goldens.map((g) => g.id));
    for (const [id, el] of this.goldEls) {
      if (!alive.has(id)) {
        el.classList.add('leaving');
        setTimeout(() => el.remove(), 480);
        this.goldEls.delete(id);
      }
    }
  }
  clearGoldens() { for (const el of this.goldEls.values()) el.remove(); this.goldEls.clear(); }

  // ---------- Zeichnen ----------
  frame(dt) {
    const g = this.app.game;
    const st = g.state;
    // Funkenspur der goldenen Noten
    this._sparkT = (this._sparkT || 0) - dt;
    if (this._sparkT <= 0 && this.goldEls.size) {
      this._sparkT = 0.12;
      for (const el of this.goldEls.values()) {
        if (el.classList.contains('mini') || el.classList.contains('leaving')) continue;
        const r = el.getBoundingClientRect();
        this.app.particles.burst(r.left + r.width / 2, r.top + r.height / 2, { n: 1, type: 'spark', color: '#ffe08a', sp0: 20, sp1: 70, up: 30, grav: 60, s0: 10, s1: 18, life: 0.9 });
      }
    }
    // Zähler
    const parts = fmtParts(st.run.notes);
    setText(this.el.notes, parts.num);
    setText(this.el.unit, parts.word ? parts.word + ' Noten' : 'Noten');
    const boosted = g.nps > g.npsBase * 1.01;
    setText(this.el.nps, fmt(g.nps, { dec: 1 }));
    toggleClass(this.el.nps, 'boosted', boosted);
    // Schallplatte dreht
    const speed = 0.35 + Math.min(1.6, Math.log10(g.nps + 1) / 9);
    this.angle = (this.angle + speed * 360 * dt * (0.4 + g.groove * 0.6 + 0.2)) % 360;
    this.el.spin.style.transform = `rotate(${this.angle.toFixed(2)}deg)`;
    // Groove
    const showGroove = this.beatVisible() && !g.transport.noBeat;
    toggleClass(this.el.groovePanel, 'locked', !showGroove);
    if (showGroove) {
      this.el.grooveFill.style.width = (g.groove * 100).toFixed(1) + '%';
      setText(this.el.grooveMult, fmtMult(g.grooveProdMult()));
      setText(this.el.combo, g.combo > 1 ? `Kombo ${g.combo}` : '');
    }
  }

  slowUpdate() {
    const g = this.app.game, st = g.state;
    // Währungen
    const chips = [];
    if (st.life.inspEarned > 0 || st.inspiration > 0) chips.push(['insp', 'light-bulb', fmt(Math.floor(st.inspiration)), 'Inspiration – für Harmonielehre & Legenden']);
    if (st.records > 0) chips.push(['rec', 'compact-disc', fmt(st.records), 'Goldene Schallplatten – jede erhöht die Produktion']);
    if (st.records > 0 || st.royalties > 0) chips.push(['roy', 'coins', fmt(Math.floor(st.royalties)), 'Tantiemen – für die Ruhmeshalle']);
    const key = chips.map((c) => c[0]).join();
    if (key !== this._chipKey) {
      this._chipKey = key;
      this.el.curr.innerHTML = chips.map(([k, ic, v, tipText]) => `<span class="chip ${k}" data-tip="text:${tipText}" data-k="${k}">${icon(ic)}<span class="cv">${v}</span></span>`).join('');
    } else {
      for (const [k, , v] of chips) {
        const c = this.el.curr.querySelector(`[data-k="${k}"]`);
        if (!c) continue;
        const cv = c.querySelector('.cv');
        if (cv.textContent !== v) {
          const up = this.chipVals[k] !== undefined && v !== this.chipVals[k];
          cv.textContent = v;
          if (up) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); }
        }
        this.chipVals[k] = v;
      }
    }
    const tr = g.transport;
    const tempoTxt = `<span class="music">♩</span> = ${tr.bpm} · ${tr.meter}/4${tr.swing > 0.55 ? ' · Swing' : ''}`;
    if (this.el.tempo._h !== tempoTxt) { this.el.tempo._h = tempoTxt; this.el.tempo.innerHTML = tempoTxt; }
    // Label der Schallplatte
    const style = STYLES[g.transport.styleId];
    setText(this.el.label, style ? style.name : '');
    // Buffs
    this.renderBuffs();
    this.renderInfo();
    // Hinweis
    if (st.flags.tutorial.firstClick) this.el.hint.classList.add('hidden');
  }

  renderInfo() {
    const g = this.app.game, st = g.state;
    let html = '';
    if (st.ensemble.length) {
      html += `<div class="si-ens" data-go="legends" data-tip="text:Dein Ensemble – klicke für die Legenden">${st.ensemble.map((id) => {
        const L = LEGEND_BY_ID[id];
        return `<span class="si-p">${L.icon ? icon(L.icon) : `<img src="assets/portraits/${id}.jpg" alt="">`}</span>`;
      }).join('')}<span class="si-l">Ensemble</span></div>`;
    }
    if (Object.keys(st.modesUnlocked).length > 1) {
      const m = MODE_BY_ID[st.mode];
      html += `<span class="si-chip" data-go="theory" data-tip="text:${m.name}: ${m.text}">${icon('musical-score')} <b>${m.name}</b></span>`;
    }
    if (st.run.genre) {
      const gen = GENRE_BY_ID[st.run.genre];
      html += `<span class="si-chip" data-tip="text:Genre: ${gen.text}" style="border-color:${gen.color}55">${icon(gen.icon)} <b style="color:${gen.color}">${gen.name}</b></span>`;
    }
    if (html !== this._infoH) {
      this._infoH = html;
      this.el.info.innerHTML = html;
      if (!this._infoBound) {
        this._infoBound = true;
        this.el.info.addEventListener('click', (e) => {
          const t = e.target.closest('[data-go]');
          if (t && this.app.tabs.isUnlocked(t.dataset.go)) { this.app.tabs.open(t.dataset.go); this.app.audio.sfx('tab'); }
        });
      }
    }
  }

  renderBuffs() {
    const g = this.app.game;
    const nowMs = Date.now();
    const parts = [];
    for (const b of g.buffs) {
      const left = Math.max(0, (b.end - nowMs) / 1000);
      const pct = clamp(left / b.dur, 0, 1) * 100;
      parts.push(`<div class="buff" data-tip="text:${b.name} – ${b.desc}"><span class="bi">${icon(b.icon)}</span><span>${b.name}</span><span class="bt">${Math.ceil(left)}s</span><i class="bp" style="width:${pct.toFixed(1)}%"></i></div>`);
    }
    if (g.state.challenge) {
      const c = CHALLENGE_BY_ID[g.state.challenge];
      if (c) {
        const pct = Math.min(100, Math.log10(g.state.run.total + 1) / Math.log10(c.goal) * 100);
        parts.push(`<div class="buff dyn" data-tip="text:Wettbewerb – ${c.rule}"><span class="bi">${icon(c.icon)}</span><span>${c.name}</span><span class="bt">${pct.toFixed(0)} %</span><i class="bp" style="width:${pct.toFixed(1)}%;background:var(--insp)"></i></div>`);
      }
    }
    const d = g._dyn;
    if (d && d.labels) {
      for (const [name, v] of d.labels) {
        if (Math.abs(v - 1) < 0.005) continue;
        parts.push(`<div class="buff dyn"><span class="bi">${icon('sparkles')}</span><span>${name}</span><span class="bt">${fmtMult(v)}</span></div>`);
      }
    }
    const html = parts.join('');
    if (html !== this.lastBuffKey) { this.lastBuffKey = html; this.el.buffs.innerHTML = html; }
  }

  setSkin(skin) {
    this.el.record.className = 'record skin-' + (skin || 'vinyl');
  }
}
