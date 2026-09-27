// Legenden: Komponist:innen & Stars, Ensemble, Aufwertung
import { LEGENDS, LEGEND_BY_ID, LEGEND_MAX_LEVEL, TYPE_LABEL } from '../../data/legends.js';
import { ERA_BY_ID } from '../../data/eras.js';
import { fmt } from '../../core/format.js';
import { icon, esc, portraitHTML, modal } from '../dom.js';

const FILTERS = [['all', 'Alle'], ['unlocked', 'Freigeschaltet'], ['composer', 'Komponist:innen'], ['modern', 'Stars & Bands'], ['locked', 'Unentdeckt']];

export class LegendsPanel {
  constructor(app) { this.app = app; this.filter = 'all'; }
  get g() { return this.app.game; }

  mount(el) {
    this.el = el;
    el.innerHTML = `<div class="sec-title">${icon('laurel-crown')}<h2>Legenden</h2><span class="spacer"></span><span class="chip insp">${icon('light-bulb')}<span id="lg-insp"></span></span></div>
      <p class="sec-sub">Große Musiker:innen schließen sich dir an. Ihre <b>Passive</b> wirkt immer – ihre <b class="gold">Meisterleistung</b> nur im Ensemble. Werte sie mit Inspiration auf.</p>
      <div id="lg-ens"></div>
      <div class="filter-row" id="lg-filter">${FILTERS.map(([id, n]) => `<button class="subtab" data-f="${id}">${n}</button>`).join('')}</div>
      <div class="legend-grid" id="lg-grid"></div>`;
    el.querySelector('#lg-filter').addEventListener('click', (e) => {
      const b = e.target.closest('[data-f]'); if (!b) return;
      this.filter = b.dataset.f; this.render(); this.app.audio.sfx('tab');
    });
    el.addEventListener('click', (e) => this.onClick(e));
    this.render();
  }
  onEvent(ev) { if (ev === 'insp') this.update(); else this.render(); }
  update() {
    if (!this.el?.isConnected) return;
    this.el.querySelector('#lg-insp').textContent = fmt(Math.floor(this.g.state.inspiration));
    for (const b of this.el.querySelectorAll('[data-lvl]')) b.disabled = this.g.state.inspiration < Number(b.dataset.lvl);
  }

  onClick(e) {
    const g = this.g, a = this.app;
    const t = e.target.closest('[data-act]');
    if (!t) return;
    const id = t.dataset.id;
    if (t.dataset.act === 'ens') {
      if (g.toggleEnsemble(id)) a.audio.sfx(g.inEnsemble(id) ? 'legend' : 'tab');
      else { a.audio.sfx('error'); a.toastInfo('Ensemble voll', `Du hast ${g.ensembleSlots()} Plätze. Nimm zuerst jemanden heraus – oder schalte in der Ruhmeshalle weitere Plätze frei.`); }
      this.render();
    } else if (t.dataset.act === 'lvl') {
      if (g.levelUpLegend(id)) { a.audio.sfx('upgrade'); a.burstAt(t, '✦'); } else a.audio.sfx('error');
      this.render();
    } else if (t.dataset.act === 'info') {
      this.showInfo(id);
    }
  }

  ensHTML() {
    const g = this.g, st = g.state;
    const slots = g.ensembleSlots();
    let html = `<div class="ensemble"><div style="min-width:120px"><div style="font-family:var(--font-head);font-weight:900;color:var(--gold)">Ensemble</div><div class="muted" style="font-size:12.5px">${st.ensemble.length} / ${slots} Plätze</div></div>`;
    for (let i = 0; i < slots; i++) {
      const id = st.ensemble[i];
      if (id) {
        const L = LEGEND_BY_ID[id];
        html += `<div class="ens-slot filled" data-act="info" data-id="${id}" data-tip="leg:${id}">${L.icon ? `<span class="ens-icon">${icon(L.icon)}</span>` : `<img src="assets/portraits/${id}.jpg" alt="">`}</div>`;
      } else html += `<div class="ens-slot">${icon('laurel-crown')}</div>`;
    }
    html += '</div>';
    return html;
  }

  render() {
    if (!this.el?.isConnected) return;
    const g = this.g, st = g.state;
    this.el.querySelector('#lg-ens').innerHTML = this.ensHTML();
    for (const b of this.el.querySelectorAll('#lg-filter .subtab')) b.classList.toggle('active', b.dataset.f === this.filter);
    const list = LEGENDS.filter((L) => {
      const un = !!st.legends[L.id];
      switch (this.filter) {
        case 'unlocked': return un;
        case 'locked': return !un;
        case 'composer': return L.type === 'composer' || L.type === 'theorist';
        case 'modern': return L.type === 'star' || L.type === 'band';
        default: return true;
      }
    });
    // Freigeschaltete zuerst, dann nach Epoche
    list.sort((a, b) => (st.legends[b.id] ? 1 : 0) - (st.legends[a.id] ? 1 : 0) || ERA_BY_ID[a.era].index - ERA_BY_ID[b.era].index || a.index - b.index);
    this.el.querySelector('#lg-grid').innerHTML = list.map((L) => this.cardHTML(L)).join('') || '<div class="empty">Hier ist noch niemand.</div>';
    this.update();
  }

  cardHTML(L) {
    const g = this.g, st = g.state;
    const data = st.legends[L.id];
    if (!data) {
      return `<div class="legend locked"><div class="legend-top">${portraitHTML(L, { locked: true })}<div style="min-width:0"><div class="lg-name">???</div><div class="lg-dates">${esc(ERA_BY_ID[L.era].name)} · ${esc(TYPE_LABEL[L.type])}</div></div></div>
        <div class="lg-fx"><div class="lbl">Wie finde ich sie/ihn?</div><div class="muted">${esc(L.hint)}</div></div></div>`;
    }
    const lvl = data.level;
    const pas = L.passive(lvl), ab = L.ability(lvl);
    const inEns = g.inEnsemble(L.id);
    const cost = g.legendCost(L.id);
    const max = lvl >= LEGEND_MAX_LEVEL;
    return `<div class="legend ${inEns ? 'in-ens' : ''}">
      <div class="legend-top" data-act="info" data-id="${L.id}">${portraitHTML(L)}<div style="min-width:0"><div class="lg-name">${esc(L.name)}</div><div class="lg-dates">${esc(L.dates)} · ${esc(TYPE_LABEL[L.type])}</div>
        <div class="lg-level"><span class="tag gold">Stufe ${lvl}${max ? ' · max' : ''}</span>${inEns ? '<span class="tag good">im Ensemble</span>' : ''}</div></div></div>
      <div class="lg-fx"><div class="lbl">Passiv</div><div>${esc(pas.text)}</div></div>
      <div class="lg-fx"><div class="lbl" style="color:${inEns ? 'var(--gold)' : ''}">${inEns ? '★ ' : ''}Meisterleistung: ${esc(ab.name)}</div><div class="${inEns ? 'fx-text' : 'muted'}" style="${inEns ? '' : 'font-weight:600'}">${esc(ab.text)}</div></div>
      <div class="lg-actions">
        <button class="btn small ${inEns ? '' : 'primary'}" data-act="ens" data-id="${L.id}">${inEns ? 'Herausnehmen' : 'Ins Ensemble'}</button>
        ${max ? '' : `<button class="btn small insp" data-act="lvl" data-id="${L.id}" data-lvl="${cost}" data-tip="text:Stufe ${lvl + 1}: ${esc(L.passive(lvl + 1).text)} · ${esc(L.ability(lvl + 1).text)}">${icon('upgrade')} ${fmt(cost)}</button>`}
      </div></div>`;
  }

  showInfo(id) {
    const L = LEGEND_BY_ID[id];
    const g = this.g;
    const data = g.state.legends[id];
    if (!data) return;
    const ab = L.ability(data.level), pas = L.passive(data.level);
    modal({
      title: esc(L.name),
      body: `<div class="m-hero">${portraitHTML(L, { size: 'lg' })}<div><div class="lg-dates">${esc(L.dates)}</div><div class="row wrap" style="margin-top:6px"><span class="tag">${esc(ERA_BY_ID[L.era].name)}</span><span class="tag">${esc(TYPE_LABEL[L.type])}</span><span class="tag gold">Stufe ${data.level}</span></div>
        <div class="lg-fx" style="margin-top:10px"><div class="lbl">Passiv</div>${esc(pas.text)}</div><div class="lg-fx" style="margin-top:6px"><div class="lbl gold">Meisterleistung: ${esc(ab.name)}</div>${esc(ab.text)}</div></div></div>
        <p class="lore">${esc(L.lore)}</p>`,
      actions: [{ label: g.inEnsemble(id) ? 'Aus dem Ensemble nehmen' : 'Ins Ensemble holen', cls: g.inEnsemble(id) ? '' : 'primary', onClick: () => { g.toggleEnsemble(id) ? this.app.audio.sfx('legend') : this.app.audio.sfx('error'); this.render(); } }, { label: 'Schließen' }],
    });
  }
}
