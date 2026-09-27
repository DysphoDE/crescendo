// Auszeichnungen
import { ACHIEVEMENTS, ACH_CATS, ACH_BY_ID } from '../../data/achievements.js';
import { fmtPct } from '../../core/format.js';
import { icon, esc, registerTip } from '../dom.js';

export class AchievementsPanel {
  constructor(app) {
    this.app = app;
    registerTip('ach', (id) => {
      const a = ACH_BY_ID[id]; if (!a) return '';
      const on = this.app.game.state.achievements[id];
      if (!on && a.secret) return `<div class="tt-title">Geheime Auszeichnung</div><div class="tt-body muted">${a.hint ? esc(a.hint) : 'Wie man sie bekommt? Das musst du selbst herausfinden …'}</div>`;
      return `<div class="tt-head"><div class="ico-box sm" style="--c:${on ? '#f3b23a' : '#3a3552'}">${icon(a.icon)}</div><div><div class="tt-title">${esc(a.name)}</div><div class="tt-sub">${esc(a.cat)}${on ? ' · ' + new Date(on).toLocaleDateString('de-DE') : ''}</div></div></div>
        <div class="tt-body"><div>${esc(a.desc)}</div>${a.flavor ? `<p class="flavor">„${esc(a.flavor)}“</p>` : ''}</div>`;
    });
  }
  get g() { return this.app.game; }
  mount(el) { this.el = el; this.render(); }
  onEvent(ev) { if (ev === 'achievement') this.render(); }

  render() {
    if (!this.el?.isConnected) return;
    const g = this.g, st = g.state;
    const n = g.achievementCount();
    const bonus = n * g.S.achBonus * g.S.achMult;
    let html = `<div class="sec-title">${icon('trophy')}<h2>Auszeichnungen</h2><span class="spacer"></span><span class="tag gold">${n} / ${ACHIEVEMENTS.length}</span></div>
      <p class="sec-sub">Jede Auszeichnung erhöht deine Produktion und schenkt dir Inspiration. Aktueller Bonus: <b class="gold">${fmtPct(bonus)}</b></p>`;
    for (const cat of ACH_CATS) {
      const list = ACHIEVEMENTS.filter((a) => a.cat === cat);
      const got = list.filter((a) => st.achievements[a.id]).length;
      html += `<div class="h3">${esc(cat)}<span class="count">${got} / ${list.length}</span></div><div class="ach-grid">`;
      for (const a of list) {
        const on = !!st.achievements[a.id];
        html += `<div class="ach ${on ? 'on' : ''} ${a.secret ? 'secret' : ''}" data-tip="ach:${a.id}">${on || !a.secret ? icon(a.icon) : ''}</div>`;
      }
      html += '</div>';
    }
    this.el.innerHTML = html;
  }
}
