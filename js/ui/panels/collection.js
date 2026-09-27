// Sammlung: Raritäten der Musikgeschichte
import { RELICS, RARITY, RELIC_MAX, RELIC_BY_ID } from '../../data/relics.js';
import { ERA_BY_ID } from '../../data/eras.js';
import { icon, esc, modal, registerTip } from '../dom.js';

export function stars(n) {
  let s = '';
  for (let i = 1; i <= RELIC_MAX; i++) s += i <= n ? '★' : '<span class="off">★</span>';
  return `<span class="stars">${s}</span>`;
}

export class CollectionPanel {
  constructor(app) {
    this.app = app;
    registerTip('relic', (id) => {
      const r = RELIC_BY_ID[id]; const n = this.app.game.state.relics[id] || 0;
      if (!r) return '';
      if (!n) return `<div class="tt-title">???</div><div class="tt-sub">${RARITY[r.rarity].name} · ${ERA_BY_ID[r.era].name}</div><div class="tt-body muted">Noch nicht gefunden. Vielleicht bei einem Konzert?</div>`;
      return `<div class="tt-title" style="color:${RARITY[r.rarity].color}">${esc(r.name)}</div><div class="tt-sub">${RARITY[r.rarity].name} · ${stars(n)}</div><div class="tt-body"><div class="fx-text">${esc(r.text(n))}</div></div>`;
    });
  }
  get g() { return this.app.game; }

  mount(el) {
    this.el = el;
    el.addEventListener('click', (e) => {
      const r = e.target.closest('[data-relic]'); if (!r) return;
      this.showInfo(r.dataset.relic);
    });
    this.render();
  }
  onEvent() { this.render(); }

  render() {
    if (!this.el?.isConnected) return;
    const st = this.g.state;
    const found = RELICS.filter((r) => st.relics[r.id]).length;
    let html = `<div class="sec-title">${icon('open-treasure-chest')}<h2>Sammlung</h2><span class="spacer"></span><span class="tag gold">${found} / ${RELICS.length}</span></div>
      <p class="sec-sub">Legendäre Instrumente und Fundstücke aus der Musikgeschichte. Jeder Fund wirkt dauerhaft – mehrfache Funde verbessern die Rarität auf bis zu ${RELIC_MAX} Sterne.</p>`;
    for (const [rid, R] of Object.entries(RARITY)) {
      const list = RELICS.filter((r) => r.rarity === rid);
      const f = list.filter((r) => st.relics[r.id]).length;
      html += `<div class="h3" style="color:${R.color}">${R.name}<span class="count">${f} / ${list.length}</span></div><div class="relic-grid">`;
      for (const r of list) {
        const n = st.relics[r.id] || 0;
        html += `<button class="relic ${n ? '' : 'lock'}" style="--rc:${R.color}" data-relic="${r.id}" data-tip="relic:${r.id}"><div class="r-ic">${icon(n ? r.icon : 'lock')}</div><div class="r-name">${n ? esc(r.name) : '???'}</div>${n ? stars(n) : ''}</button>`;
      }
      html += '</div>';
    }
    this.el.innerHTML = html;
  }

  showInfo(id) {
    const r = RELIC_BY_ID[id];
    const n = this.g.state.relics[id] || 0;
    if (!n) return;
    const R = RARITY[r.rarity];
    modal({
      title: `<span style="color:${R.color}">${esc(r.name)}</span>`,
      body: `<div class="m-hero"><div class="relic" style="--rc:${R.color};pointer-events:none;background:none;border:0"><div class="r-ic" style="width:80px;height:80px;font-size:48px">${icon(r.icon)}</div></div>
        <div><div class="row wrap"><span class="tag" style="color:${R.color}">${R.name}</span><span class="tag">${esc(ERA_BY_ID[r.era].name)}</span></div><div style="margin-top:6px">${stars(n)}</div><div class="fx-text" style="margin-top:6px">${esc(r.text(n))}</div>
        ${n < RELIC_MAX ? `<div class="muted" style="font-size:12.5px;margin-top:4px">Nächster Stern: ${esc(r.text(n + 1))}</div>` : ''}</div></div>
        <p class="lore">${esc(r.lore)}</p>`,
      actions: [{ label: 'Schließen' }],
    });
  }
}
