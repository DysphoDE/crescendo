// Konzerte: Auftritte starten, Fortschritt, Belohnungen abholen
import { VENUES } from '../../data/venues.js';
import { BUILDING_BY_ID } from '../../data/buildings.js';
import { ERA_BY_ID } from '../../data/eras.js';
import { fmt, fmtS, fmtTime } from '../../core/format.js';
import { icon, esc } from '../dom.js';

export class GigsPanel {
  constructor(app) { this.app = app; }
  get g() { return this.app.game; }

  mount(el) {
    this.el = el;
    el.innerHTML = `<div class="sec-title">${icon('ticket')}<h2>Konzerte</h2><span class="spacer"></span><span class="tag" id="gg-slots"></span></div>
      <p class="sec-sub">Schick deine Musiker auf Tournee! Konzerte laufen in Echtzeit – auch wenn das Spiel geschlossen ist. Sie bringen Noten, Inspiration und mit etwas Glück eine <b class="gold">Rarität der Musikgeschichte</b>.</p>
      <div class="grid" id="gg-list"></div>`;
    el.addEventListener('click', (e) => this.onClick(e));
    this.render();
  }
  onEvent() { this.render(); }

  onClick(e) {
    const t = e.target.closest('[data-act]'); if (!t) return;
    const g = this.g, a = this.app;
    if (t.dataset.act === 'start') {
      if (g.startGig(t.dataset.id)) a.audio.sfx('open'); else { a.audio.sfx('error'); }
    } else if (t.dataset.act === 'claim') {
      a.claimGig(t.dataset.key);
    }
    this.render();
  }

  render() {
    if (!this.el?.isConnected) return;
    const g = this.g;
    const slots = g.gigSlots();
    this.el.querySelector('#gg-slots').innerHTML = `${icon('bus')} ${g.state.gigs.length} / ${slots} unterwegs`;
    const shown = [];
    let lockedShown = 0;
    for (const v of VENUES) {
      const un = g.venueUnlocked(v);
      if (!un) { if (lockedShown++ >= 1) continue; }
      shown.push(this.venueHTML(v, un));
    }
    this.el.querySelector('#gg-list').innerHTML = shown.join('');
    this.update();
  }

  venueHTML(v, un) {
    const g = this.g;
    const col = ERA_BY_ID[v.era].colors.accent;
    if (!un) {
      const b = BUILDING_BY_ID[v.unlock.b];
      return `<div class="venue locked"><div class="ico-box locked">${icon('lock')}</div><div class="v-main"><div class="v-name">???</div><div class="v-desc">Freischaltung: Besitze ${v.unlock.n > 1 ? v.unlock.n + ' ' + esc(b.plural) : esc(b.one)}.</div></div></div>`;
    }
    const gig = g.gigActive(v.id);
    const p = g.gigPreview(v.id);
    if (gig) {
      const done = gig.end <= Date.now();
      return `<div class="venue ${done ? 'done' : 'active'}" data-gig="${gig.key}"><div class="ico-box" style="--c:${col}">${icon(v.icon)}</div>
        <div class="v-main"><div class="v-name">${esc(v.name)}</div>
          <div class="v-meta"><span class="tag gold"><span class="note-ic">♪</span> ${fmtS(gig.notes)}</span><span class="tag insp">${icon('light-bulb')} ${fmt(gig.insp * g.S.insp, { dec: 1 })}</span><span class="tag">${icon('open-treasure-chest')} ${Math.round(gig.relic * 100)} %</span></div>
          <div class="progress ${done ? 'gold' : 'insp'}"><i data-prog="${gig.key}"></i></div>
          <div class="v-desc" data-left="${gig.key}"></div></div>
        ${done ? `<button class="btn primary" data-act="claim" data-key="${gig.key}">${icon('party-popper')} Abholen</button>` : ''}</div>`;
    }
    const full = g.state.gigs.length >= g.gigSlots();
    return `<div class="venue"><div class="ico-box" style="--c:${col}">${icon(v.icon)}</div>
      <div class="v-main"><div class="v-name">${esc(v.name)}</div><div class="v-desc">${esc(v.desc)}</div>
        <div class="v-meta"><span class="tag">${icon('hourglass')} ${fmtTime(p.dur)}</span><span class="tag gold"><span class="note-ic">♪</span> ${fmtS(p.notes)}</span><span class="tag insp">${icon('light-bulb')} ${fmt(p.insp, { dec: 1 })}</span><span class="tag" data-tip="text:Chance, eine Rarität der Musikgeschichte zu finden">${icon('open-treasure-chest')} ${Math.round(p.relic * 100)} %</span></div></div>
      <button class="btn ${full ? '' : 'primary'}" data-act="start" data-id="${v.id}" ${full ? 'disabled' : ''}>${icon('ticket')} Auftreten</button></div>`;
  }

  update() {
    if (!this.el?.isConnected) return;
    const g = this.g, now = Date.now();
    let needRender = false;
    for (const gig of g.state.gigs) {
      const bar = this.el.querySelector(`[data-prog="${gig.key}"]`);
      const left = this.el.querySelector(`[data-left="${gig.key}"]`);
      const pct = Math.min(1, (now - gig.start) / (gig.end - gig.start));
      if (bar) bar.style.width = (pct * 100).toFixed(2) + '%';
      if (left) left.textContent = gig.end > now ? `Noch ${fmtTime((gig.end - now) / 1000, { clock: true })}` : 'Das Publikum tobt – hol dir deine Belohnung!';
      const card = this.el.querySelector(`[data-gig="${gig.key}"]`);
      if (card && gig.end <= now && !card.classList.contains('done')) needRender = true;
    }
    if (needRender) this.render();
  }
}
