// Lexikon: alles Entdeckte zum Nachlesen
import { BUILDINGS } from '../../data/buildings.js';
import { LEGENDS, TYPE_LABEL } from '../../data/legends.js';
import { ERAS, ERA_BY_ID } from '../../data/eras.js';
import { CIRCLE, MODES, RHYTHM } from '../../data/theory.js';
import { GENRES } from '../../data/genres.js';
import { VENUES } from '../../data/venues.js';
import { RELICS, RARITY } from '../../data/relics.js';
import { MELODIES } from '../../data/melodies.js';
import { icon, esc, modal, portraitHTML } from '../dom.js';

function cats(g) {
  const st = g.state;
  return [
    { id: 'b', name: 'Instrumente', icon: 'drum', items: BUILDINGS.map((b) => ({ id: b.id, on: !!st.discovered['b_' + b.id], title: b.name, sub: ERA_BY_ID[b.era].name, icon: b.icon, text: b.lore, c: ERA_BY_ID[b.era].colors.accent })) },
    { id: 'l', name: 'Legenden', icon: 'laurel-crown', items: LEGENDS.map((L) => ({ id: L.id, on: !!st.legends[L.id], title: L.name, sub: `${L.dates} · ${TYPE_LABEL[L.type]}`, legend: L, text: L.lore })) },
    { id: 'e', name: 'Epochen', icon: 'hourglass', items: ERAS.map((e) => ({ id: e.id, on: !!st.discovered['e_' + e.id], title: e.name, sub: e.years, icon: e.icon, text: e.desc, c: e.colors.accent })) },
    { id: 't', name: 'Tonarten', icon: 'g-clef', items: CIRCLE.map((c) => ({ id: c.id, on: !!st.theory[c.id], title: c.name, sub: c.acc || 'ohne Vorzeichen', icon: c.ring === 'major' ? 'g-clef' : 'f-clef', text: c.lore })) },
    { id: 'm', name: 'Kirchentonarten', icon: 'musical-score', items: MODES.map((m) => ({ id: m.id, on: !!st.modesUnlocked[m.id], title: m.name, sub: m.alias, icon: 'musical-score', text: m.lore })) },
    { id: 'r', name: 'Rhythmik', icon: 'metronome', items: RHYTHM.map((r) => ({ id: r.id, on: !!st.theory[r.id], title: r.name, sub: 'Rhythmik', icon: 'metronome', text: r.lore })) },
    { id: 'g', name: 'Genres', icon: 'headphones', items: GENRES.map((x) => ({ id: x.id, on: !!st.hall['h_genre_' + x.id], title: x.name, sub: 'Genre', icon: x.icon, text: x.lore, c: x.color })) },
    { id: 'v', name: 'Konzertorte', icon: 'ticket', items: VENUES.map((v) => ({ id: v.id, on: !!st.discovered['v_' + v.id], title: v.name, sub: ERA_BY_ID[v.era].name, icon: v.icon, text: v.desc, c: ERA_BY_ID[v.era].colors.accent })) },
    { id: 'x', name: 'Raritäten', icon: 'open-treasure-chest', items: RELICS.map((r) => ({ id: r.id, on: !!st.relics[r.id], title: r.name, sub: RARITY[r.rarity].name, icon: r.icon, text: r.lore, c: RARITY[r.rarity].color })) },
    { id: 'y', name: 'Melodien', icon: 'piano-keys', items: MELODIES.map((m) => ({ id: m.id, on: !!st.melodies[m.id], title: m.name, sub: m.by, icon: 'piano-keys', text: m.lore })) },
  ];
}

export class LexiconPanel {
  constructor(app) { this.app = app; this.cat = 'b'; }
  get g() { return this.app.game; }
  mount(el) {
    this.el = el;
    el.addEventListener('click', (e) => {
      const c = e.target.closest('[data-cat]');
      if (c) { this.cat = c.dataset.cat; this.render(); this.app.audio.sfx('tab'); return; }
      const it = e.target.closest('[data-item]');
      if (it) this.show(it.dataset.item);
    });
    this.render();
  }
  onEvent() { this.render(); }

  render() {
    if (!this.el?.isConnected) return;
    const all = cats(this.g);
    const total = all.reduce((a, c) => a + c.items.length, 0);
    const got = all.reduce((a, c) => a + c.items.filter((i) => i.on).length, 0);
    const cur = all.find((c) => c.id === this.cat) || all[0];
    this.el.innerHTML = `<div class="sec-title">${icon('book-cover')}<h2>Lexikon</h2><span class="spacer"></span><span class="tag gold">${got} / ${total} entdeckt</span></div>
      <p class="sec-sub">Alles, was du auf deiner Reise durch die Musikgeschichte entdeckst, wird hier festgehalten.</p>
      <div class="lex-wrap"><div class="lex-cats">${all.map((c) => {
        const n = c.items.filter((i) => i.on).length;
        return `<button class="lex-cat ${c.id === cur.id ? 'active' : ''}" data-cat="${c.id}"><span class="row">${icon(c.icon)} ${esc(c.name)}<span class="spacer"></span><span class="muted" style="font-size:12px">${n}/${c.items.length}</span></span><span class="progress gold"><i style="width:${(n / c.items.length * 100).toFixed(1)}%"></i></span></button>`;
      }).join('')}</div>
      <div class="lex-list">${cur.items.map((i) => {
        if (!i.on) return `<div class="lex-item lock"><div class="ico-box sm locked">?</div><div><div class="li-name">???</div><div class="li-sub">Noch nicht entdeckt</div></div></div>`;
        const vis = i.legend ? portraitHTML(i.legend) : `<div class="ico-box sm" style="--c:${i.c || 'var(--accent)'}">${icon(i.icon)}</div>`;
        return `<button class="lex-item" data-item="${cur.id}:${i.id}">${i.legend ? `<div style="transform:scale(.62);margin:-15px -12px">${vis}</div>` : vis}<div style="min-width:0"><div class="li-name">${esc(i.title)}</div><div class="li-sub">${esc(i.sub)}</div></div></button>`;
      }).join('')}</div></div>`;
  }

  show(key) {
    const [cid, id] = key.split(':');
    const c = cats(this.g).find((x) => x.id === cid);
    const i = c?.items.find((x) => x.id === id);
    if (!i || !i.on) return;
    const vis = i.legend ? portraitHTML(i.legend, { size: 'lg' }) : `<div class="ico-box lg" style="--c:${i.c || 'var(--accent)'}">${icon(i.icon)}</div>`;
    modal({ title: esc(i.title), body: `<div class="m-hero">${vis}<div><div class="tag">${esc(c.name)}</div><div class="muted" style="margin-top:6px">${esc(i.sub)}</div></div></div><p class="lore">${esc(i.text)}</p>`, actions: [{ label: 'Schließen' }] });
  }
}
