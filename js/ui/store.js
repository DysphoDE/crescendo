// Laden: Instrumente (Gebäude) und Verbesserungen
import { BUILDINGS, BUILDING_BY_ID } from '../data/buildings.js';
import { UPGRADE_BY_ID, UPGRADES } from '../data/upgrades.js';
import { ERA_BY_ID } from '../data/eras.js';
import { fmt, fmtS, roman, fmtTime } from '../core/format.js';
import { bus } from '../core/bus.js';
import { setText, toggleClass, isTouch } from '../core/util.js';
import { icon, esc, registerTip, modal, showTip, hideTip } from './dom.js';

const KIND_COLOR = { click: '#e07bff', groove: '#ff7a59', golden: '#f3b23a', synergy: '#4fd1c5', global: '#7c9cff', misc: '#6fcf97' };

export class Store {
  constructor(app) {
    this.app = app;
    this.list = document.getElementById('buildingList');
    this.upBox = document.getElementById('upgradesBox');
    this.amountEl = document.getElementById('buyAmount');
    this.rows = new Map();
    this.upKey = '';
    this.showAllUps = false;
    this.bind();
    this.registerTips();
    this.renderBuildings();
    this.renderUpgrades(true);
  }

  get game() { return this.app.game; }

  bind() {
    this.amountEl.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const v = b.dataset.amt;
      this.game.state.settings.buyAmount = v === 'max' ? 'max' : Number(v);
      this.syncAmount();
      this.app.audio.sfx('tab');
    });
    this.syncAmount();
    this.list.addEventListener('click', (e) => {
      const info = e.target.closest('.b-info');
      const row = e.target.closest('.b-row');
      if (!row || row.classList.contains('mystery')) return;
      const id = row.dataset.id;
      if (info) { e.stopPropagation(); this.showBuildingInfo(id); return; }
      const amt = e.ctrlKey || e.metaKey ? 100 : e.shiftKey ? 10 : null;
      this.buy(id, row, amt);
    });
    this.upBox.addEventListener('click', (e) => {
      const all = e.target.closest('[data-act="buyall"]');
      if (all) { const n = this.game.buyAllUpgrades(); if (n) this.app.audio.sfx('upgrade'); return; }
      const more = e.target.closest('[data-act="more"]');
      if (more) { this.showAllUps = !this.showAllUps; this.renderUpgrades(true); return; }
      const u = e.target.closest('.upg'); if (!u) return;
      if (isTouch() && !u.classList.contains('armed')) {
        // Erst antippen = Info, zweites Antippen = Kaufen
        this.upBox.querySelectorAll('.upg.armed').forEach((x) => x.classList.remove('armed'));
        u.classList.add('armed');
        const r = u.getBoundingClientRect();
        showTip('upg:' + u.dataset.id, r.left, r.bottom + 4);
        return;
      }
      this.buyUpgrade(u.dataset.id, u);
    });
    bus.on('buy', () => this.update(true));
    bus.on('upgrade', () => { this.renderUpgrades(true); this.update(true); });
    bus.on('dacapo', () => { this.renderBuildings(); this.renderUpgrades(true); });
  }

  syncAmount() {
    const a = String(this.game.state.settings.buyAmount);
    for (const b of this.amountEl.children) b.classList.toggle('active', b.dataset.amt === a);
    this.update(true);
  }

  buy(id, row, override = null) {
    const g = this.game;
    this.app.audio.ensure();
    const amt = override || g.state.settings.buyAmount;
    if (g.buy(id, amt)) {
      this.app.audio.sfx('buy', { id });
      row.classList.remove('bought'); void row.offsetWidth; row.classList.add('bought');
      const r = row.getBoundingClientRect();
      this.app.particles.burst(r.left + 32, r.top + r.height / 2, { n: 4, up: 60, sp0: 40, sp1: 140, s0: 12, s1: 18 });
    } else {
      this.app.audio.sfx('error');
      row.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 220 });
    }
  }
  buyUpgrade(id, el) {
    this.app.audio.ensure();
    if (this.game.buyUpgrade(id)) {
      this.app.audio.sfx('upgrade');
      const r = el.getBoundingClientRect();
      this.app.particles.burst(r.left + r.width / 2, r.top + r.height / 2, { n: 8, glyph: '✦', color: '#ffd36b' });
      hideTip();
    } else this.app.audio.sfx('error');
  }

  // Welche Instrumente sind sichtbar?
  visibleCount() {
    const g = this.game, st = g.state;
    let last = 0;
    BUILDINGS.forEach((b, i) => {
      if (g.own(b.id) > 0 || st.discovered['b_' + b.id] || st.run.total >= b.cost * 0.4 || st.run.notes >= b.cost * 0.6) last = Math.max(last, i + 1);
    });
    return Math.min(BUILDINGS.length, Math.max(2, last + 1));
  }

  renderBuildings() {
    this.list.innerHTML = '';
    this.rows.clear();
    this.visible = -1;
    this.update(true);
  }

  ensureRows() {
    const n = this.visibleCount();
    if (n === this.visible) return;
    this.visible = n;
    for (let i = 0; i < n; i++) {
      const b = BUILDINGS[i];
      let r = this.rows.get(b.id);
      if (!r) {
        const col = ERA_BY_ID[b.era].colors.accent;
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'b-row';
        el.dataset.id = b.id;
        el.style.setProperty('--c', col);
        el.innerHTML = `<div class="ico-box" style="--c:${col}">${icon(b.icon)}</div>
          <div class="b-main"><div class="b-name"></div><div class="b-sub"><span class="b-cost"><span class="note-ic">♪</span><span class="bc"></span></span><span class="b-prod"></span></div></div>
          <div class="b-count"></div><span class="b-info" role="button" aria-label="Info">${icon('info')}</span><i class="b-share"></i>`;
        r = { el, name: el.querySelector('.b-name'), cost: el.querySelector('.bc'), prod: el.querySelector('.b-prod'), count: el.querySelector('.b-count'), share: el.querySelector('.b-share') };
        this.rows.set(b.id, r);
        this.list.appendChild(el);
      }
    }
  }

  update(force = false) {
    const g = this.game;
    if (!g) return;
    this.ensureRows();
    const amt = g.state.settings.buyAmount;
    const bank = g.state.run.notes;
    for (let i = 0; i < this.visible; i++) {
      const b = BUILDINGS[i];
      const r = this.rows.get(b.id);
      const owned = g.own(b.id);
      const known = i === 0 || owned > 0 || g.state.discovered['b_' + b.id] || g.state.run.total >= b.cost * 0.4 || g.state.run.notes >= b.cost * 0.4;
      const mystery = !known;
      let n = amt === 'max' ? Math.max(1, g.maxAffordable(b.id)) : amt;
      const cost = g.buildingCost(b.id, n);
      const can = bank >= cost;
      toggleClass(r.el, 'mystery', mystery);
      toggleClass(r.el, 'can', can && !mystery);
      toggleClass(r.el, 'no', !can && !mystery);
      r.el.dataset.tip = mystery ? '' : 'bld:' + b.id;
      if (mystery) {
        setText(r.name, '???');
        setText(r.prod, '');
        setText(r.count, '');
      } else {
        setText(r.name, b.name);
        const each = g.rawBuilding[b.id] && owned ? g.rawBuilding[b.id] / owned * g.globalMult : b.prod * (g.S.bmult[b.id] || 1) * g.globalMult;
        setText(r.prod, owned ? `${fmtS(each * owned, 1)}/s` : `+${fmtS(each, 1)}/s je`);
        setText(r.count, owned ? String(owned) : '');
      }
      const lock = g.buildingLocked(b.id);
      if (lock) { toggleClass(r.el, 'can', false); toggleClass(r.el, 'no', true); }
      setText(r.cost, lock === 'ban' ? 'Gesperrt' : lock === 'max' ? 'Maximum' : fmtS(cost) + (n > 1 ? `  (×${n})` : ''));
      const share = g.rawTotal > 0 ? (g.rawBuilding[b.id] || 0) / g.rawTotal : 0;
      r.share.style.width = (share * 100).toFixed(1) + '%';
    }
    // Upgrades
    this.renderUpgrades(force);
  }

  renderUpgrades(force) {
    const g = this.game;
    const ups = g.availableUpgrades();
    const bank = g.state.run.notes;
    const key = ups.map((u) => u.id).join(',') + '|' + this.showAllUps;
    if (key !== this.upKey || force) {
      this.upKey = key;
      if (!ups.length) { this.upBox.innerHTML = ''; return; }
      const w = this.upBox.clientWidth || 360;
      const perRow = Math.max(4, Math.floor((w + 6) / 56));
      const rows = window.innerWidth < 760 ? 1 : 2;
      const cap = perRow * rows;
      const limit = this.showAllUps || ups.length <= cap ? ups.length : cap - 1;
      let html = `<div class="upg-head"><h3>Verbesserungen · ${ups.length}</h3><button class="btn tiny" data-act="buyall" data-tip="text:Kauft alle bezahlbaren Verbesserungen, günstigste zuerst">Alle kaufen</button></div><div class="upg-grid">`;
      const prev = this._prevUps || new Set();
      const cur = new Set(ups.map((u) => u.id));
      this._prevUps = cur;
      const first = !this._upsInit; this._upsInit = true;
      for (let i = 0; i < limit; i++) {
        const u = ups[i];
        const fresh = !first && !prev.has(u.id);
        const col = u.kind === 'tier' ? ERA_BY_ID[BUILDING_BY_ID[u.building].era].colors.accent : KIND_COLOR[u.kind] || '#888';
        html += `<button class="upg${fresh ? ' fresh' : ''}" type="button" data-id="${u.id}" data-tip="upg:${u.id}" style="--c:${col}">${icon(u.icon)}${u.icon2 ? `<span class="ic2">${icon(u.icon2)}</span>` : ''}${u.kind === 'tier' ? `<span class="tier">${roman(u.tier + 1)}</span>` : ''}</button>`;
      }
      if (limit < ups.length) html += `<button class="upg upg-plus" type="button" data-act="more" data-tip="text:Alle ${ups.length} Verbesserungen anzeigen">+${ups.length - limit}</button>`;
      else if (this.showAllUps && ups.length > cap) html += `<button class="btn tiny upg-more" data-act="more">Weniger anzeigen</button>`;
      html += '</div>';
      this.upBox.innerHTML = html;
    }
    for (const el of this.upBox.querySelectorAll('.upg[data-id]')) {
      const u = UPGRADE_BY_ID[el.dataset.id];
      const can = bank >= g.upgradeCost(u);
      toggleClass(el, 'no', !can);
      toggleClass(el, 'can', can);
    }
  }

  showBuildingInfo(id) {
    const b = BUILDING_BY_ID[id];
    const g = this.game;
    const era = ERA_BY_ID[b.era];
    modal({
      title: esc(b.name),
      body: `<div class="m-hero"><div class="ico-box lg" style="--c:${era.colors.accent}">${icon(b.icon)}</div><div><div class="tag">${esc(era.name)}</div><p class="flavor">${esc(b.desc)}</p></div></div>
        ${buildingTipBody(g, b)}<div class="tt-sep"></div><p class="lore">${esc(b.lore)}</p>`,
      actions: [{ label: 'Schließen' }],
    });
  }

  registerTips() {
    registerTip('bld', (id) => {
      const g = this.game; const b = BUILDING_BY_ID[id];
      if (!b) return '';
      const era = ERA_BY_ID[b.era];
      return `<div class="tt-head"><div class="ico-box sm" style="--c:${era.colors.accent}">${icon(b.icon)}</div><div><div class="tt-title">${esc(b.name)}</div><div class="tt-sub">${esc(era.name)} · Besitz: ${g.own(id)}</div></div></div>
        <div class="tt-body"><div class="flavor">${esc(b.desc)}</div>${buildingTipBody(g, b)}</div>`;
    });
    registerTip('upg', (id) => {
      const g = this.game; const u = UPGRADE_BY_ID[id];
      if (!u) return '';
      const cost = g.upgradeCost(u);
      const can = g.state.run.notes >= cost;
      const sub = u.kind === 'tier' ? `Stufe ${roman(u.tier + 1)} · ${BUILDING_BY_ID[u.building].name}` : { click: 'Klickkraft', groove: 'Groove', golden: 'Goldene Noten', synergy: 'Synergie', global: 'Ruhm & Kritik', misc: 'Verbesserung' }[u.kind];
      return `<div class="tt-head"><div class="ico-box sm" style="--c:${u.kind === 'tier' ? ERA_BY_ID[BUILDING_BY_ID[u.building].era].colors.accent : KIND_COLOR[u.kind]}">${icon(u.icon)}</div><div><div class="tt-title">${esc(u.name)}</div><div class="tt-sub">${esc(sub)}</div></div></div>
        <div class="tt-body"><div class="fx-text">${esc(u.desc)}</div><p class="flavor">„${esc(u.flavor)}“</p></div>
        <div class="tt-cost ${can ? 'good' : 'bad'}"><span class="note-ic">♪</span> ${fmt(cost)}</div>${can ? '' : etaHTML(g, cost)}${isTouch() ? '<div class="tt-sub" style="margin-top:6px">Erneut antippen zum Kaufen</div>' : ''}`;
    });
  }
}

export function etaHTML(g, cost) {
  const need = cost - g.state.run.notes;
  if (need <= 0 || !(g.nps > 0)) return '';
  return `<div class="tt-sub" style="margin-top:4px">${icon('hourglass')} bezahlbar in ca. ${fmtTime(need / g.nps)}</div>`;
}

export function buildingTipBody(g, b) {
  const owned = g.own(b.id);
  const total = (g.rawBuilding[b.id] || 0) * g.globalMult;
  const each = owned ? total / owned : b.prod * (g.S.bmult[b.id] || 1) * g.globalMult;
  const share = g.rawTotal > 0 ? (g.rawBuilding[b.id] || 0) / g.rawTotal : 0;
  const nextTier = UPGRADES.filter((u) => u.kind === 'tier' && u.building === b.id && u.reqCount > owned).map((u) => u.reqCount).sort((x, y) => x - y)[0];
  let s = `<div class="kv" style="margin-top:8px"><span>Pro Stück</span><span>${fmt(each, { dec: 1 })} ♪/s</span>`;
  if (owned) s += `<span>Gesamt</span><span>${fmt(total, { dec: 1 })} ♪/s</span><span>Anteil</span><span>${(share * 100).toFixed(1).replace('.', ',')} %</span>`;
  s += `<span>Multiplikator</span><span>×${fmtS(g.S.bmult[b.id] || 1, 1)}</span>`;
  if (nextTier) s += `<span>Nächste Stufe bei</span><span>${nextTier} Stück</span>`;
  s += '</div>';
  const cost = g.buildingCost(b.id, 1);
  s += `<div class="tt-cost ${g.state.run.notes >= cost ? 'good' : 'bad'}"><span class="note-ic">♪</span> ${fmt(cost)}</div>`;
  if (g.state.run.notes < cost) s += etaHTML(g, cost);
  return s;
}
