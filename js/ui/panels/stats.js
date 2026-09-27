// Statistik
import { fmt, fmtTime } from '../../core/format.js';
import { BUILDINGS } from '../../data/buildings.js';
import { UPGRADES } from '../../data/upgrades.js';
import { LEGENDS } from '../../data/legends.js';
import { RELICS } from '../../data/relics.js';
import { ACHIEVEMENTS } from '../../data/achievements.js';
import { icon } from '../dom.js';
import { GENRE_BY_ID } from '../../data/genres.js';

export class StatsPanel {
  constructor(app) { this.app = app; }
  get g() { return this.app.game; }
  mount(el) { this.el = el; this.render(); }
  update() { this._t = (this._t || 0) + 1; if (this._t % 4 === 0) this.render(); }

  render() {
    if (!this.el?.isConnected) return;
    const g = this.g, st = g.state, r = st.run, l = st.life;
    const kv = (rows) => `<div class="kv">${rows.map(([k, v]) => `<span>${k}</span><span>${v}</span>`).join('')}</div>`;
    this.el.innerHTML = `<div class="sec-title">${icon('growth')}<h2>Statistik</h2></div>
      <div class="grid two">
        <div class="card"><div class="h3" style="margin-top:0">Dieser Durchgang</div>${kv([
          ['Noten im Besitz', fmt(r.notes)],
          ['Noten erspielt', fmt(r.total)],
          ['Davon erklickt', fmt(r.handmade)],
          ['Klicks', fmt(r.clicks)],
          ['Instrumente', fmt(g.totalBuildings())],
          ['Verbesserungen', `${g.upgradeCount()} / ${UPGRADES.length}`],
          ['Spielzeit', fmtTime(r.playTime)],
          ['Beste Produktion', fmt(r.bestNps, { dec: 1 }) + ' /s'],
          ['Genre', r.genre ? GENRE_BY_ID[r.genre]?.name || r.genre : '–'],
        ])}</div>
        <div class="card"><div class="h3" style="margin-top:0">Gesamte Karriere</div>${kv([
          ['Noten insgesamt', fmt(l.notes)],
          ['Klicks insgesamt', fmt(l.clicks)],
          ['Erklickte Noten', fmt(l.handmade)],
          ['Gesamte Spielzeit', fmtTime(l.playTime)],
          ['Da Capo', fmt(l.daCapos)],
          ['Goldene Schallplatten', fmt(st.records)],
          ['Gekaufte Instrumente', fmt(l.buildingsBought)],
          ['Beste Produktion', fmt(l.bestNps, { dec: 1 }) + ' /s'],
          ['Spielbeginn', new Date(st.created).toLocaleDateString('de-DE')],
        ])}</div>
        <div class="card"><div class="h3" style="margin-top:0">Rhythmus & Glück</div>${kv([
          ['Perfekte Treffer', fmt(l.perfectHits)],
          ['Gute Treffer', fmt(l.goodHits)],
          ['Offbeat-Treffer', fmt(l.offbeatHits)],
          ['Längste Kombo', fmt(l.maxCombo)],
          ['Längste Perfekt-Serie', fmt(l.bestPerfectStreak)],
          ['Volltreffer', fmt(l.crits)],
          ['Klicks pro Sekunde (Rekord)', fmt(l.bestCps)],
          ['Goldene Noten', fmt(l.golden)],
        ])}</div>
        <div class="card"><div class="h3" style="margin-top:0">Sammlungen</div>${kv([
          ['Legenden', `${Object.keys(st.legends).length} / ${LEGENDS.length}`],
          ['Raritäten', `${Object.keys(st.relics).length} / ${RELICS.length}`],
          ['Auszeichnungen', `${g.achievementCount()} / ${ACHIEVEMENTS.length}`],
          ['Konzerte gespielt', fmt(l.gigsDone)],
          ['Melodien entdeckt', fmt(Object.keys(st.melodies).length)],
          ['Inspiration gesammelt', fmt(l.inspEarned, { dec: 1 })],
          ['Instrumententypen', `${g.typesOwned()} / ${BUILDINGS.length}`],
        ])}</div>
      </div>`;
  }
}
