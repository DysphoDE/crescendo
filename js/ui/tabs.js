// Reiter-Verwaltung
import { bus } from '../core/bus.js';
import { VENUES } from '../data/venues.js';
import { CIRCLE, MODES, RHYTHM } from '../data/theory.js';
import { LEGENDS } from '../data/legends.js';
import { icon, hideTip } from './dom.js';
import { OverviewPanel } from './panels/overview.js';
import { TheoryPanel } from './panels/theory.js';
import { LegendsPanel } from './panels/legends.js';
import { GigsPanel } from './panels/gigs.js';
import { CollectionPanel } from './panels/collection.js';
import { PianoPanel } from './panels/piano.js';
import { AchievementsPanel } from './panels/achievements.js';
import { LexiconPanel } from './panels/lexicon.js';
import { FamePanel } from './panels/fame.js';
import { StatsPanel } from './panels/stats.js';
import { SettingsPanel } from './panels/settings.js';

export const TAB_DEFS = [
  { id: 'store', name: 'Instrumente', icon: 'drum', store: true, unlocked: () => true },
  { id: 'overview', name: 'Übersicht', icon: 'g-clef', panel: OverviewPanel, unlocked: () => true },
  { id: 'theory', name: 'Harmonielehre', short: 'Theorie', icon: 'musical-score', panel: TheoryPanel, unlocked: (g) => g.state.life.inspEarned >= 5 || g.theoryCount() > 0 },
  { id: 'legends', name: 'Legenden', icon: 'laurel-crown', panel: LegendsPanel, unlocked: (g) => Object.keys(g.state.legends).length > 0 },
  { id: 'gigs', name: 'Konzerte', icon: 'ticket', panel: GigsPanel, unlocked: (g) => VENUES.some((v) => g.venueUnlocked(v)) },
  { id: 'collection', name: 'Sammlung', icon: 'open-treasure-chest', panel: CollectionPanel, unlocked: (g) => Object.keys(g.state.relics).length > 0 },
  { id: 'piano', name: 'Klavier', icon: 'piano-keys', panel: PianoPanel, unlocked: (g) => g.theoryCount() > 0 || g.own('piano') > 0 || Object.keys(g.state.melodies).length > 0 },
  { id: 'achievements', name: 'Erfolge', icon: 'trophy', panel: AchievementsPanel, unlocked: (g) => g.achievementCount() > 0 },
  { id: 'lexicon', name: 'Lexikon', icon: 'book-cover', panel: LexiconPanel, unlocked: (g) => g.achievementCount() >= 3 },
  { id: 'fame', name: 'Ruhm', icon: 'compact-disc', panel: FamePanel, unlocked: (g) => g.state.life.notes >= 1e10 || g.state.records > 0 },
  { id: 'stats', name: 'Statistik', icon: 'growth', panel: StatsPanel, unlocked: () => true },
  { id: 'settings', name: 'Optionen', icon: 'cog', panel: SettingsPanel, unlocked: () => true },
];

export class Tabs {
  constructor(app) {
    this.app = app;
    this.nav = document.getElementById('tabs');
    this.content = document.getElementById('content');
    this.panels = {};
    this.buttons = {};
    this.active = null;
    this.unlockedKey = '';
    this.narrow = window.innerWidth < 1200;
    this.build();
    window.addEventListener('resize', () => this.onResize());
    this.nav.addEventListener('click', (e) => {
      const b = e.target.closest('.tab'); if (!b) return;
      this.open(b.dataset.id);
      this.app.audio.sfx('tab');
    });
    for (const ev of ['legend:unlock', 'legend:level', 'ensemble', 'theory', 'mode', 'hall', 'dacapo', 'gig:start', 'gig:claim', 'gig:done', 'achievement', 'melody', 'insp']) {
      bus.on(ev, () => this.dirtyActive(ev));
    }
  }
  get game() { return this.app.game; }

  build() {
    this.nav.innerHTML = '';
    for (const t of TAB_DEFS) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tab hidden' + (t.store ? ' store-tab-btn' : '');
      b.dataset.id = t.id;
      b.innerHTML = `${icon(t.icon)}<span class="tl">${window.innerWidth < 760 ? (t.short || t.name) : t.name}</span><span class="badge hidden"></span>`;
      this.nav.appendChild(b);
      this.buttons[t.id] = b;
    }
    this.refreshUnlocked(true);
    const saved = this.game.state.settings.lastTab;
    this.open(this.narrow ? (saved && this.isUnlocked(saved) ? saved : 'store') : (saved && saved !== 'store' && this.isUnlocked(saved) ? saved : 'overview'), true);
  }

  isUnlocked(id) {
    const t = TAB_DEFS.find((x) => x.id === id);
    return !!t && t.unlocked(this.game);
  }

  refreshUnlocked(initial = false) {
    const g = this.game;
    let key = '';
    for (const t of TAB_DEFS) {
      const u = t.unlocked(g);
      key += u ? '1' : '0';
      const b = this.buttons[t.id];
      b.classList.toggle('hidden', !u);
      if (u && !g.state.seen['tab_' + t.id] && !t.store && t.id !== 'overview' && t.id !== 'stats' && t.id !== 'settings') {
        if (initial) g.state.seen['tab_' + t.id] = true;
        else if (!b._fresh) {
          b._fresh = true; b.classList.add('fresh');
          this.app.onTabUnlocked(t);
        }
      }
    }
    this.unlockedKey = key;
  }

  onResize() {
    const narrow = window.innerWidth < 1200;
    for (const t of TAB_DEFS) {
      const lbl = this.buttons[t.id].querySelector('.tl');
      if (lbl) lbl.textContent = window.innerWidth < 760 ? (t.short || t.name) : t.name;
    }
    if (narrow !== this.narrow) {
      this.narrow = narrow;
      if (!narrow && this.active === 'store') this.open('overview');
      else this.syncBodyClass();
    }
  }

  syncBodyClass() {
    document.body.classList.toggle('tab-store', this.active === 'store');
  }

  open(id, silent = false) {
    if (!this.isUnlocked(id)) id = 'overview';
    const g = this.game;
    hideTip();
    if (this.active && this.panels[this.active]?.unmount) this.panels[this.active].unmount();
    this.active = id;
    g.state.settings.lastTab = id;
    for (const [tid, b] of Object.entries(this.buttons)) b.classList.toggle('active', tid === id);
    const b = this.buttons[id];
    if (b._fresh) { b._fresh = false; b.classList.remove('fresh'); }
    g.state.seen['tab_' + id] = true;
    this.syncBodyClass();
    const def = TAB_DEFS.find((t) => t.id === id);
    if (def.store) { this.app.store.update(true); return; }
    let p = this.panels[id];
    if (!p) p = this.panels[id] = new def.panel(this.app);
    // Jeder Reiter bekommt einen frischen Container – so bleiben keine alten Ereignis-Handler hängen
    this.content.innerHTML = '';
    this.content.scrollTop = 0;
    const root = document.createElement('div');
    root.className = 'panel-root';
    this.content.appendChild(root);
    p.mount(root);
    if (!silent) b.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }

  dirtyActive(ev) {
    const p = this.panels[this.active];
    if (p && p.onEvent) p.onEvent(ev);
  }

  update() {
    const g = this.game;
    this.refreshUnlocked();
    const p = this.panels[this.active];
    if (p && p.update && this.active !== 'store') p.update();
    // Abzeichen
    this.setBadge('theory', this.theoryAffordable());
    this.setBadge('legends', this.legendsAffordable());
    const done = g.state.gigs.filter((x) => x.end <= Date.now()).length;
    const free = g.gigSlots() - g.state.gigs.length;
    const idle = free > 0 && VENUES.some((v) => g.venueUnlocked(v) && !g.gigActive(v.id));
    this.setBadge('gigs', done ? done : idle ? '♪' : 0, !done);
    this.setBadge('fame', g.recordsGain() >= Math.max(5, g.state.records * 0.5) ? '!' : 0, true);
    for (const t of TAB_DEFS) {
      const b = this.buttons[t.id];
      if (b._fresh) this.setBadge(t.id, 'Neu', true);
    }
  }

  setBadge(id, v, isNew = false) {
    const b = this.buttons[id]; if (!b) return;
    const el = b.querySelector('.badge');
    if (b._fresh) { v = 'Neu'; isNew = true; }
    const show = !!v && id !== this.active;
    el.classList.toggle('hidden', !show);
    el.classList.toggle('new', isNew);
    if (show && el.textContent !== String(v)) el.textContent = String(v);
  }

  theoryAffordable() {
    const g = this.game;
    if (!this.isUnlocked('theory')) return 0;
    const insp = g.state.inspiration;
    let n = 0;
    for (const c of CIRCLE) if (g.canBuyCircle(c.id) && insp >= g.theoryCost(c.cost)) n++;
    for (const m of MODES) if (!g.state.modesUnlocked[m.id] && insp >= g.theoryCost(m.cost)) n++;
    for (const r of RHYTHM) if (g.rhythmAvailable(r.id) && insp >= g.theoryCost(r.cost)) n++;
    return n;
  }
  legendsAffordable() {
    const g = this.game;
    let n = 0;
    for (const L of LEGENDS) {
      if (!g.state.legends[L.id]) continue;
      if (g.inEnsemble(L.id) && g.state.inspiration >= g.legendCost(L.id) && g.state.legends[L.id].level < 20) n++;
    }
    const freeSlot = g.state.ensemble.length < g.ensembleSlots() && Object.keys(g.state.legends).length > g.state.ensemble.length;
    return n + (freeSlot ? 1 : 0);
  }
}
