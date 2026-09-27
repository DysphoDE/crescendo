// Übersicht: Epoche, Ziele, Produktionsverteilung, Multiplikatoren
import { ERAS, ERA_BY_ID } from '../../data/eras.js';
import { BUILDINGS } from '../../data/buildings.js';
import { LEGENDS } from '../../data/legends.js';
import { ACHIEVEMENTS } from '../../data/achievements.js';
import { MODE_BY_ID } from '../../data/theory.js';
import { GENRE_BY_ID } from '../../data/genres.js';
import { fmt, fmtS, fmtMult } from '../../core/format.js';
import { icon, esc, portraitHTML } from '../dom.js';

export class OverviewPanel {
  constructor(app) { this.app = app; }
  get g() { return this.app.game; }

  mount(el) {
    this.el = el;
    el.innerHTML = `<div class="sec-title">${icon('g-clef')}<h2>Übersicht</h2></div>
      <div id="ov-era"></div>
      <div class="h3">${icon('stairs-goal')} Nächste Ziele</div><div class="grid two" id="ov-goals"></div>
      <div class="h3">${icon('growth')} Woher deine Noten kommen <span class="count" id="ov-total"></span></div><div class="card"><div class="bar-list" id="ov-bars"></div></div>
      <div class="h3">${icon('sparkles')} Aktive Multiplikatoren</div><div class="mult-list" id="ov-mults"></div>`;
    this.render();
  }
  onEvent() { this.render(); }
  update() { this._t = (this._t || 0) + 1; if (this._t % 4 === 0) this.render(); }

  render() {
    if (!this.el || !this.el.isConnected) return;
    const g = this.g, st = g.state;
    const eraIdx = g.eraIndex();
    const era = ERAS[eraIdx];
    const next = ERAS[eraIdx + 1];
    const nextB = next ? BUILDINGS.find((b) => b.era === next.id) : null;
    const eraEl = this.el.querySelector('#ov-era');
    eraEl.innerHTML = `<div class="era-card"><div class="ico-box lg">${icon(era.icon)}</div><div style="flex:1;min-width:0">
      <div class="tag">Epoche ${eraIdx + 1} von ${ERAS.length}</div>
      <div class="era-name">${esc(era.name)}</div><div class="era-years">${esc(era.years)}</div>
      <p class="lore" style="margin:6px 0 0">${esc(era.desc)}</p>
      ${nextB ? `<p class="muted" style="margin:8px 0 0;font-size:13px">${icon('stairs')} Nächste Epoche: <b>${esc(next.name)}</b> – ${st.discovered['b_' + nextB.id] ? `kaufe dazu ${esc(nextB.one)}` : 'dazu brauchst du ein neues Instrument'}.</p>` : '<p class="gold" style="margin:8px 0 0">Du hast die letzte Epoche erreicht – das Universum singt!</p>'}
      <div class="era-track">${ERAS.map((e, i) => `<i class="${i <= eraIdx ? 'on' : ''} ${i === eraIdx ? 'cur' : ''}" data-tip="text:${esc(e.name)}"></i>`).join('')}</div>
    </div></div>`;

    // Ziele
    const goals = [];
    const nb = BUILDINGS.find((b) => g.own(b.id) === 0);
    if (nb) {
      const known = nb.index === 0 || st.discovered['b_' + nb.id] || st.run.total >= nb.cost * 0.4;
      const pct = Math.min(1, st.run.notes / g.buildingCost(nb.id));
      goals.push(goal(known ? nb.icon : 'help', known ? `Kaufe ${esc(nb.one)}` : 'Ein neues Instrument wartet', `${fmt(st.run.notes)} / ${fmt(g.buildingCost(nb.id))} ♪`, pct));
    }
    // nächste Legende (mit Hinweis)
    const lockedL = LEGENDS.filter((L) => !st.legends[L.id]);
    if (lockedL.length) {
      const L = lockedL.find((x) => x.era === era.id) || lockedL.find((x) => ERA_BY_ID[x.era].index <= eraIdx + 1) || lockedL[0];
      goals.push(`<div class="goal">${portraitHTML(L, { locked: true })}<div class="g-text"><div class="g-title">Eine Legende wartet …</div><div class="muted">${esc(L.hint)}</div></div></div>`);
    }
    // Auszeichnung in Reichweite
    const achs = ACHIEVEMENTS.filter((a) => !st.achievements[a.id] && !a.secret);
    const near = achs.find((a) => a.cat === 'Noten') || achs[0];
    if (near) goals.push(goal(near.icon, esc(near.name), esc(near.desc), null));
    // Da Capo
    if (st.life.notes >= 1e10 || st.records > 0) {
      const gain = g.recordsGain();
      goals.push(goal('compact-disc', 'Da Capo', gain > 0 ? `Ein Neustart brächte dir <b class="gold">${fmt(gain)}</b> Goldene Schallplatten.` : `Noch ${fmtS(g.notesForNextRecord())} Noten bis zur nächsten Schallplatte.`, null));
    }
    if (st.gigs.some((x) => x.end <= Date.now())) goals.unshift(goal('ticket', 'Konzert beendet!', 'Hol dir deine Belohnung im Reiter „Konzerte“ ab.', null));
    this.el.querySelector('#ov-goals').innerHTML = goals.join('');

    // Produktion
    const rows = BUILDINGS.filter((b) => g.own(b.id) > 0).map((b) => ({ b, v: (g.rawBuilding[b.id] || 0) * g.globalMult })).sort((a, b) => b.v - a.v);
    const max = rows[0]?.v || 1;
    const tot = rows.reduce((a, r) => a + r.v, 0) || 1;
    this.el.querySelector('#ov-total').textContent = `${fmt(g.npsBase, { dec: 1 })} ♪/s Grundproduktion`;
    this.el.querySelector('#ov-bars').innerHTML = rows.length ? rows.map(({ b, v }) => {
      const c = ERA_BY_ID[b.era].colors.accent;
      return `<div class="bar-item" style="--c:${c}" data-tip="bld:${b.id}">${icon(b.icon)}<div class="bl"><i style="width:${(v / max * 100).toFixed(1)}%"></i><span>${esc(b.name)} · ${g.own(b.id)}</span></div><span class="bv">${(v / tot * 100).toFixed(1).replace('.', ',')} %</span></div>`;
    }).join('') : '<div class="empty">Noch keine Instrumente – klick auf die Schallplatte und kauf dein erstes!</div>';

    // Multiplikatoren
    const m = [];
    const nAch = g.achievementCount();
    if (nAch) m.push(['Auszeichnungen', 1 + nAch * g.S.achBonus * g.S.achMult]);
    if (st.records) m.push(['Goldene Schallplatten', 1 + st.records * g.S.recordBonus]);
    m.push(['Verbesserungen & Wissen', g.S.prod]);
    const mode = MODE_BY_ID[st.mode];
    m.push([`Modus: ${mode.name}`, null, mode.text]);
    if (st.run.genre) m.push([`Genre: ${GENRE_BY_ID[st.run.genre].name}`, null, GENRE_BY_ID[st.run.genre].text]);
    if (g.groove > 0.01) m.push(['Groove', g.grooveProdMult()]);
    const bm = g._bm; if (bm && bm.prod > 1.001) m.push(['Goldene Effekte', bm.prod]);
    const d = g._dyn; if (d && d.prod !== 1) m.push(['Legenden & Zeit', d.prod]);
    m.push(['Klickkraft', null, `${fmt(g.clickValue(), { dec: 1 })} ♪ pro Klick`]);
    m.push(['Volltreffer', null, `${Math.round(g.S.crit * 100)} % Chance · ×${fmtS(g.S.critMult * g.S.critX, 1)}`]);
    this.el.querySelector('#ov-mults').innerHTML = m.map(([n, v, txt]) => `<div class="mult"><span>${esc(n)}</span><b>${v !== null && v !== undefined ? fmtMult(v) : esc(txt)}</b></div>`).join('');
  }
}

function goal(ic, title, text, pct) {
  return `<div class="goal"><div class="ico-box sm">${icon(ic)}</div><div class="g-text"><div class="g-title">${title}</div><div class="muted">${text}</div>${pct !== null ? `<div class="progress" style="margin-top:6px"><i style="width:${(pct * 100).toFixed(1)}%"></i></div>` : ''}</div></div>`;
}
