// Harmonielehre: Quintenzirkel, Modi, Rhythmik
import { CIRCLE, CIRCLE_BY_ID, CIRCLE_BONUS, MODES, RHYTHM, KEY_ROOT } from '../../data/theory.js';
import { fmt } from '../../core/format.js';
import { icon, esc } from '../dom.js';
import { VOICES } from '../../audio/instruments.js';

const TABS = [['circle', 'Quintenzirkel'], ['modes', 'Modi'], ['rhythm', 'Rhythmik']];

export class TheoryPanel {
  constructor(app) { this.app = app; this.sub = 'circle'; this.sel = 'C'; }
  get g() { return this.app.game; }

  mount(el) {
    this.el = el;
    el.innerHTML = `<div class="sec-title">${icon('musical-score')}<h2>Harmonielehre</h2><span class="spacer"></span><span class="chip insp">${icon('light-bulb')}<span id="th-insp"></span></span></div>
      <p class="sec-sub">Mit <b class="insp">Inspiration</b> erlernst du Tonarten, Kirchentonarten und Rhythmen. Dein Wissen bleibt dir auch nach einem Da Capo erhalten.</p>
      <div class="subtabs" id="th-tabs">${TABS.map(([id, n]) => `<button class="subtab" data-sub="${id}">${n}</button>`).join('')}</div>
      <div id="th-body"></div>`;
    el.querySelector('#th-tabs').addEventListener('click', (e) => {
      const b = e.target.closest('[data-sub]'); if (!b) return;
      this.sub = b.dataset.sub; this.render(); this.app.audio.sfx('tab');
    });
    el.querySelector('#th-body').addEventListener('click', (e) => this.onClick(e));
    this.render();
  }
  onEvent(ev) { if (ev !== 'insp') this.render(); else this.update(); }
  update() {
    if (!this.el?.isConnected) return;
    this.el.querySelector('#th-insp').textContent = fmt(Math.floor(this.g.state.inspiration));
    for (const b of this.el.querySelectorAll('[data-cost]')) b.disabled = this.g.state.inspiration < Number(b.dataset.cost) || b.dataset.avail === '0';
  }

  render() {
    if (!this.el?.isConnected) return;
    for (const b of this.el.querySelectorAll('.subtab')) b.classList.toggle('active', b.dataset.sub === this.sub);
    const body = this.el.querySelector('#th-body');
    if (this.sub === 'circle') body.innerHTML = this.circleHTML();
    else if (this.sub === 'modes') body.innerHTML = this.modesHTML();
    else body.innerHTML = this.rhythmHTML();
    this.update();
  }

  onClick(e) {
    const g = this.g, a = this.app;
    const node = e.target.closest('[data-node]');
    if (node) { this.sel = node.dataset.node; this.render(); a.audio.ensure(); this.previewKey(this.sel); return; }
    const act = e.target.closest('[data-act]'); if (!act) return;
    const id = act.dataset.id;
    switch (act.dataset.act) {
      case 'learn':
        if (g.buyCircle(id)) { a.audio.sfx('upgrade'); a.burstAt(act, '✦'); } else a.audio.sfx('error');
        break;
      case 'key':
        g.state.settings.key = id; a.audio.sfx('open'); this.render();
        break;
      case 'mode-buy':
        if (g.buyMode(id)) { a.audio.sfx('upgrade'); a.burstAt(act, '✦'); } else a.audio.sfx('error');
        break;
      case 'mode-set':
        g.setMode(id); a.audio.sfx('open'); this.render();
        break;
      case 'mode-play':
        this.playScale(id);
        break;
      case 'rhythm':
        if (g.buyRhythm(id)) { a.audio.sfx('upgrade'); a.burstAt(act, '✦'); } else a.audio.sfx('error');
        break;
    }
    this.render();
  }

  previewKey(id) {
    const au = this.app.audio;
    if (!au.ctx) return;
    const n = CIRCLE_BY_ID[id];
    const root = (KEY_ROOT[id] % 12) + 60;
    const third = n.ring === 'major' ? 4 : 3;
    const t = au.ctx.currentTime + 0.01;
    [0, third, 7, 12].forEach((x, i) => VOICES.harp(au, au.sfxBus, t + i * 0.06, root + x, 0.45));
  }
  playScale(mid) {
    const au = this.app.audio;
    au.ensure(); if (!au.ctx) return;
    const m = MODES.find((x) => x.id === mid);
    const root = (KEY_ROOT[this.g.state.settings.key] % 12) + 60;
    const t = au.ctx.currentTime + 0.02;
    [...m.steps, 12].forEach((x, i) => VOICES.piano(au, au.sfxBus, t + i * 0.22, root + x, 0.55, 0.4));
  }

  circleHTML() {
    const g = this.g, st = g.state;
    const cx = 200, cy = 200;
    const pos = (n) => {
      const R = n.ring === 'major' ? 162 : 104;
      let ang = n.pos * 30 - 90;
      if (n.pos === 6) ang += (n.id === 'Fis' || n.id === 'dis') ? -11 : 11;
      const rad = (ang * Math.PI) / 180;
      return [cx + Math.cos(rad) * R, cy + Math.sin(rad) * R];
    };
    let svg = `<svg class="circle-svg" viewBox="0 0 400 400" role="img" aria-label="Quintenzirkel">
      <defs><radialGradient id="goldGrad" cx="35%" cy="30%"><stop offset="0" stop-color="#fff6d0"/><stop offset=".5" stop-color="#ffd36b"/><stop offset="1" stop-color="#d9962a"/></radialGradient></defs>
      <circle cx="200" cy="200" r="162" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="44"/>
      <circle cx="200" cy="200" r="104" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="36"/>
      <circle cx="200" cy="200" r="58" fill="rgba(0,0,0,.25)" stroke="rgba(255,255,255,.08)"/>
      <text x="200" y="190" text-anchor="middle" fill="#a9a1c6" font-size="11" font-family="Cinzel" letter-spacing="2">QUINTEN</text>
      <text x="200" y="205" text-anchor="middle" fill="#a9a1c6" font-size="11" font-family="Cinzel" letter-spacing="2">ZIRKEL</text>
      <text x="200" y="226" text-anchor="middle" fill="#ffd36b" font-size="12" font-family="Nunito" font-weight="800">${g.theoryCount() ? CIRCLE.filter((c) => st.theory[c.id]).length + ' / ' + CIRCLE.length : ''}</text>`;
    // Verbindungslinien Dur–Moll
    for (const n of CIRCLE.filter((c) => c.ring === 'minor')) {
      const [x1, y1] = pos(n), [x2, y2] = pos(CIRCLE_BY_ID[n.rel]);
      const on = st.theory[n.id] && st.theory[n.rel];
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${on ? 'rgba(255,211,107,.55)' : 'rgba(255,255,255,.08)'}" stroke-width="2"/>`;
    }
    for (const n of CIRCLE) {
      const [x, y] = pos(n);
      const owned = !!st.theory[n.id];
      const avail = g.canBuyCircle(n.id);
      const r = n.ring === 'major' ? (n.pos === 6 ? 20 : 24) : (n.pos === 6 ? 16 : 18);
      const cls = `cnode ${owned ? 'owned' : avail ? 'avail' : 'locked'} ${this.sel === n.id ? 'sel' : ''}`;
      const label = n.ring === 'major' ? n.id : n.id;
      svg += `<g class="${cls}" data-node="${n.id}"><circle class="bg" cx="${x}" cy="${y}" r="${r}"/><text x="${x}" y="${y - (n.acc ? 3 : 0)}" font-size="${n.ring === 'major' ? (label.length > 2 ? 12 : 15) : 12}">${label}</text>${n.acc ? `<text x="${x}" y="${y + 11}" font-size="8.5" font-family="Nunito">${n.acc}</text>` : ''}</g>`;
    }
    svg += '</svg>';
    const n = CIRCLE_BY_ID[this.sel] || CIRCLE[0];
    const owned = !!st.theory[n.id];
    const avail = g.canBuyCircle(n.id);
    const cost = g.theoryCost(n.cost);
    let req = '';
    if (!owned && !avail) req = n.ring === 'minor' ? `Erfordert zuerst ${CIRCLE_BY_ID[n.rel].name}.` : 'Erfordert eine benachbarte Dur-Tonart.';
    const bon = Object.values(CIRCLE_BONUS);
    const bonDone = [st.theory.Fis && st.theory.Ges, CIRCLE.filter((c) => c.ring === 'major').every((c) => st.theory[c.id]), CIRCLE.filter((c) => c.ring === 'minor').every((c) => st.theory[c.id])];
    return `<div class="circle-wrap"><div>${svg}</div><div class="circle-detail">
      <div class="card glow">
        <div class="row"><h3 style="font-size:22px">${esc(n.name)}</h3><span class="spacer"></span><span class="tag">${n.acc ? esc(n.acc) : 'keine Vorzeichen'}</span></div>
        <div class="fx-text" style="margin:8px 0">${esc(n.text)}</div>
        <p class="lore">${esc(n.lore)}</p>
        ${req ? `<p class="muted">${icon('lock')} ${req}</p>` : ''}
        <div class="row wrap" style="margin-top:10px">
          ${owned ? `<span class="tag good">✓ Erlernt</span>` : `<button class="btn insp" data-act="learn" data-id="${n.id}" data-cost="${cost}" data-avail="${avail ? 1 : 0}" ${avail ? '' : 'disabled'}>${icon('light-bulb')} Erlernen · ${fmt(cost)}</button>`}
          ${owned ? (st.settings.key === n.id ? `<span class="tag gold">♪ Aktuelle Tonart</span>` : `<button class="btn small" data-act="key" data-id="${n.id}">♪ In ${esc(n.name)} spielen</button>`) : ''}
        </div>
      </div>
      <div class="h3">${icon('star-medal')} Zirkel-Boni</div>
      <div class="grid">${bon.map((b, i) => `<div class="goal"><div class="ico-box sm" style="--c:${bonDone[i] ? '#f3b23a' : '#3a3552'}">${icon(bonDone[i] ? 'check-mark' : 'lock')}</div><div class="g-text"><div class="g-title">${esc(b.name)}</div><div class="muted">${esc(b.text)}</div></div></div>`).join('')}</div>
      <p class="muted" style="font-size:12.5px;margin-top:12px">Tipp: Tippe eine Tonart an, um ihren Dur- oder Moll-Akkord zu hören. Benachbarte Tonarten im Zirkel sind eine Quinte voneinander entfernt – deshalb kommt pro Schritt genau ein Vorzeichen hinzu.</p>
    </div></div>`;
  }

  modesHTML() {
    const g = this.g, st = g.state;
    return `<p class="sec-sub" style="margin-top:0">Jeder Modus färbt deine Musik anders – und gibt einen eigenen Bonus. Es ist immer genau ein Modus aktiv. Die Melodien deiner Klicks und die Akkorde der Begleitung folgen dem gewählten Modus.</p>
      <div class="grid two">${MODES.map((m) => {
        const un = !!st.modesUnlocked[m.id];
        const act = st.mode === m.id;
        const cost = g.theoryCost(m.cost);
        const dots = m.steps.map((s, i) => `<i style="height:${10 + s * 2}px;opacity:${[0, 2, 4].includes(i) ? 1 : 0.55}"></i>`).join('') + '<i style="height:34px"></i>';
        return `<div class="card mode-card ${act ? 'active' : ''}">
          <div class="row"><div><div class="mode-name">${esc(m.name)}</div><div class="muted" style="font-size:12.5px">${esc(m.alias)} · ${esc(m.mood)}</div></div><span class="spacer"></span><div class="scale-dots">${dots}</div></div>
          <div class="fx-text">${esc(m.text)}</div>
          <p class="lore" style="margin:0;font-size:13px">${esc(m.lore)}</p>
          <div class="row wrap" style="margin-top:4px">
            ${act ? '<span class="tag gold">★ Aktiv</span>' : un ? `<button class="btn small primary" data-act="mode-set" data-id="${m.id}">Aktivieren</button>` : `<button class="btn small insp" data-act="mode-buy" data-id="${m.id}" data-cost="${cost}">${icon('light-bulb')} Erlernen · ${fmt(cost)}</button>`}
            <button class="btn small" data-act="mode-play" data-id="${m.id}">▶ Tonleiter</button>
          </div></div>`;
      }).join('')}</div>`;
  }

  rhythmHTML() {
    const g = this.g, st = g.state;
    const glyphs = ['♪', '♪.', '♬', '♫', '𝄐', '♩', '𝄞'];
    return `<p class="sec-sub" style="margin-top:0">Rhythmus ist das Herz der Musik. Diese Lektionen verbessern, wie du im Takt Groove aufbaust.</p>
      <div class="rhythm-track">${RHYTHM.map((r, i) => {
        const owned = !!st.theory[r.id];
        const avail = g.rhythmAvailable(r.id);
        const cost = g.theoryCost(r.cost);
        return `<div class="card rhythm-step ${owned ? 'owned' : avail ? 'avail' : ''}">
          <div class="rs-dot">${glyphs[i] || '♪'}</div>
          <div style="flex:1;min-width:0"><div class="row"><b style="font-family:var(--font-head);font-size:15.5px">${esc(r.name)}</b></div><div class="fx-text">${esc(r.text)}</div><div class="muted" style="font-size:12.5px;margin-top:2px">${esc(r.lore)}</div></div>
          ${owned ? '<span class="tag good">✓</span>' : `<button class="btn small insp" data-act="rhythm" data-id="${r.id}" data-cost="${cost}" data-avail="${avail ? 1 : 0}" ${avail ? '' : 'disabled'}>${icon('light-bulb')} ${fmt(cost)}</button>`}
        </div>`;
      }).join('')}</div>`;
  }
}
