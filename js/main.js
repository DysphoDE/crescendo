// Crescendo – Einstiegspunkt
import { defaultState, loadFromStorage, saveToStorage, clearStorage, migrate } from './core/state.js';
import { Game } from './core/game.js';
import { bus } from './core/bus.js';
import { fmt, fmtS, fmtTime, numberFormat } from './core/format.js';
import { perf, h, rand } from './core/util.js';
import { AudioEngine } from './audio/engine.js';
import { STYLES } from './audio/styles.js';
import { Background, hexA } from './fx/background.js';
import { Particles } from './fx/particles.js';
import { Visualizer } from './fx/visualizer.js';
import { Stage } from './ui/stage.js';
import { Store } from './ui/store.js';
import { Tabs } from './ui/tabs.js';
import { Ticker } from './ui/ticker.js';
import { icon, esc, toast, modal, registerTip, initTooltips, refreshTip, portraitHTML, closeAllModals } from './ui/dom.js';
import { ERAS } from './data/eras.js';
import { BUILDING_BY_ID } from './data/buildings.js';
import { LEGEND_BY_ID } from './data/legends.js';
import { RARITY, RELIC_MAX } from './data/relics.js';
import { stars } from './ui/panels/collection.js';
import { CHALLENGE_BY_ID } from './data/challenges.js';
import { GENRE_BY_ID } from './data/genres.js';

const SEASONS = ['Frühling', 'Sommer', 'Herbst', 'Winter'];

class App {
  constructor() {
    let st = loadFromStorage();
    this.isNew = !st;
    if (!st) st = defaultState();
    this.game = new Game(st);
    this.audio = new AudioEngine(this.game);
    this.bg = new Background(document.getElementById('bg'), this.audio);
    this.particles = new Particles(document.getElementById('fx'));
    this.viz = new Visualizer(document.getElementById('viz'), this.audio);
    initTooltips();
    registerTip('text', (t) => `<div class="tt-body">${esc(t)}</div>`);
    registerTip('leg', (id) => {
      const L = LEGEND_BY_ID[id]; const d = this.game.state.legends[id]; if (!L || !d) return '';
      const ab = L.ability(d.level);
      return `<div class="tt-title">${esc(L.name)}</div><div class="tt-sub">Stufe ${d.level}</div><div class="tt-body"><b class="gold">${esc(ab.name)}</b>: ${esc(ab.text)}</div>`;
    });
    registerTip('nps', () => {
      const g = this.game, d = g._dyn || { prod: 1 }, bm = g._bm || { prod: 1 };
      const row = (k, v) => `<span>${k}</span><span>${v}</span>`;
      return `<div class="tt-title">Produktion</div><div class="kv" style="margin-top:8px">
        ${row('Grundproduktion', fmt(g.npsBase, { dec: 1 }) + ' /s')}
        ${row('Groove', '×' + g.grooveProdMult().toFixed(2).replace('.', ','))}
        ${bm.prod > 1.001 ? row('Goldene Effekte', '×' + fmtS(bm.prod, 2)) : ''}
        ${Math.abs(d.prod - 1) > 0.001 ? row('Legenden & Zeit', '×' + fmtS(d.prod, 2)) : ''}
        ${row('Gesamt', fmt(g.nps, { dec: 1 }) + ' /s')}
        ${row('Pro Klick', fmt(g.clickValue(), { dec: 1 }))}</div>`;
    });
    registerTip('groove', () => {
      const g = this.game;
      return `<div class="tt-title">Groove</div><div class="tt-body"><p>Klicke im Takt der Musik – mit der Maus, per Fingertipp oder mit der <b>Leertaste</b>. Die Ringe um die Schallplatte zeigen dir, wann der nächste Schlag kommt.</p>
        <p><b class="gold">Perfekt</b> und <b class="good">Gut</b> erhöhen den Groove, <b class="bad">Daneben</b> senkt ihn. Voller Groove erhöht die gesamte Produktion um <b>${Math.round(g.S.grooveMax * g.S.grooveMult * 100)} %</b> und verstärkt deine Klicks.</p>
        <p>Alle ${g.S.comboEvery} Treffer in Folge schenken dir <span class="insp">Inspiration</span>.</p></div>`;
    });
    this.stage = new Stage(this);
    this.store = new Store(this);
    this.tabs = new Tabs(this);
    this.ticker = new Ticker(this);
    this.pianoActive = false;
    this.shakeT = 0;
    this.lastEraId = null;
    this.bindEvents();
    this.bindTop();
    this.bindAudioUnlock();
    this.applySettings();
    this.applyEra(true);
    this.stage.setSkin(this.game.state.settings.skin);
    this.lastTickMs = Date.now();
    this.lastFrame = perf();
    this.startLoops();
    setTimeout(() => document.body.classList.remove('booting'), 350);
    this.onBoot();
  }

  // ---------- Start ----------
  onBoot() {
    const g = this.game, st = g.state;
    if (this.isNew) {
      this.intro();
      return;
    }
    const away = (Date.now() - st.lastTick) / 1000;
    const res = g.offlineProgress(away);
    const doneGigs = st.gigs.filter((x) => x.end <= Date.now()).length;
    if (res && res.gain > 0 && away > 60) {
      modal({
        title: 'Willkommen zurück!',
        body: `<p class="lore">Du warst <b>${fmtTime(away)}</b> fort. Während du weg warst, hat dein Orchester weitergespielt${res.capped ? ` (maximal ${fmtTime(res.used)})` : ''}:</p>
          <div style="text-align:center;margin:14px 0"><div class="big-number">+${fmt(res.gain)}</div><div class="muted">Noten · ${Math.round(res.eff * 100)} % Offline-Leistung</div></div>
          ${doneGigs ? `<p class="gold" style="text-align:center">${icon('ticket')} ${doneGigs} Konzert${doneGigs > 1 ? 'e sind' : ' ist'} beendet – hol dir die Belohnung ab!</p>` : ''}`,
        actions: [{ label: `${icon('musical-notes')} Weiterspielen`, cls: 'primary', onClick: () => this.audio.ensure() }],
        onClose: () => this.audio.ensure(),
      });
    } else {
      this.soundHint();
    }
  }
  intro() {
    modal({
      title: 'Crescendo',
      body: `<div style="text-align:center;margin:4px 0 10px"><span class="music" style="font-size:64px;color:var(--gold)">𝄞</span></div>
        <p class="lore">Vor über 40.000 Jahren, in einer Höhle auf der Schwäbischen Alb: Ein Mensch klatscht in die Hände. Ein zweiter antwortet. <b>Der erste Rhythmus.</b></p>
        <p class="lore">Führe die Menschheit durch die gesamte Musikgeschichte – vom Lagerfeuer über Bach, Beethoven und die Beatles bis zur Harmonie der Sphären. Jedes Instrument, das du erwirbst, verändert die Musik, die du hörst.</p>
        <p class="muted" style="font-size:13px">${icon('info')} Klicke auf die Schallplatte, um Noten zu erzeugen. Klickst du <b>im Takt</b> der Musik, baust du Groove auf. Mit Kopfhörern klingt es am schönsten.</p>`,
      actions: [{ label: `${icon('musical-notes')} Los geht's!`, cls: 'primary', onClick: () => { this.audio.ensure(); } }],
      onClose: () => this.audio.ensure(),
    });
  }
  soundHint() {
    const btn = document.getElementById('btnSound');
    btn.classList.add('pulse');
    const off = bus.on('audio:start', () => { btn.classList.remove('pulse'); off(); });
  }
  // iOS & Co. geben Audio nur innerhalb einer Nutzergeste frei – wir versuchen es bei jeder Art von Geste
  bindAudioUnlock() {
    const evs = ['pointerdown', 'touchend', 'click', 'keydown'];
    const unlock = () => {
      this.audio.ensure();
      const ctx = this.audio.ctx;
      if (ctx && ctx.state === 'running') evs.forEach((ev) => window.removeEventListener(ev, unlock, true));
    };
    evs.forEach((ev) => window.addEventListener(ev, unlock, true));
  }

  // ---------- Schleifen ----------
  startLoops() {
    const frame = () => {
      const t = perf();
      let dt = Math.min(0.1, t - this.lastFrame);
      this.lastFrame = t;
      this.frame(dt);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    this.tickIv = setInterval(() => this.tick(), 50);
    this.slowIv = setInterval(() => this.slow(), 250);
    this.saveIv = setInterval(() => this.save(), 15000);
  }
  tick() {
    const now = Date.now();
    let dt = (now - this.lastTickMs) / 1000;
    this.lastTickMs = now;
    if (dt > 60) {
      const res = this.game.offlineProgress(dt);
      if (res && res.gain > 0) toast({ kicker: 'Zurück!', title: `+${fmt(res.gain)} Noten`, text: `Du warst ${fmtTime(dt)} weg.`, icon: 'night-sleep', kind: 'info' });
      dt = 0.05;
    }
    this.game.tick(dt);
    this.game.state.lastTick = now;
  }
  frame(dt) {
    const g = this.game, tr = g.transport;
    const bp = g.beatPos(perf());
    const phase = bp - Math.floor(bp);
    const beatActive = !tr.noBeat && (g.own('drum') > 0 || g.own('clap') > 0);
    const pulse = beatActive ? Math.pow(1 - phase, 4) : 0;
    this.bg.frame(dt, pulse, g.groove);
    this.viz.frame(dt, phase, g.groove, tr.meter, Math.floor(bp), beatActive);
    this.particles.frame(dt);
    this.stage.frame(dt);
    this.ticker.frame(dt);
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      const m = this.shakeMag * Math.max(0, this.shakeT) / 0.4;
      document.getElementById('app').style.transform = `translate(${rand(-m, m).toFixed(1)}px, ${rand(-m, m).toFixed(1)}px)`;
      if (this.shakeT <= 0) document.getElementById('app').style.transform = '';
    }
  }
  // Notenlinien dorthin legen, wo der Hintergrund sichtbar ist
  layoutStaff() {
    const stage = document.getElementById('stage').getBoundingClientRect();
    const gp = document.getElementById('groovePanel').getBoundingClientRect();
    const info = document.getElementById('stageInfo').getBoundingClientRect();
    const rec = document.getElementById('recordWrap').getBoundingClientRect();
    const gap = this.bg.gap();
    let y;
    if (window.innerWidth < 760) y = rec.top + rec.height / 2 - gap * 2;
    else {
      const bottom = info.height > 0 ? info.top : stage.bottom;
      const space = bottom - gp.bottom;
      y = space > gap * 7 ? gp.bottom + (space - gap * 4) / 2 : rec.top + rec.height / 2 - gap * 2;
    }
    this.bg.setStaff(y, Math.max(0, stage.left - 10), window.innerWidth < 760 ? window.innerWidth : stage.right + 10);
  }
  slow() {
    this._staffT = (this._staffT || 0) + 1;
    if (this._staffT % 8 === 1) this.layoutStaff();
    this.stage.slowUpdate();
    this.store.update();
    this.tabs.update();
    refreshTip();
    const g = this.game;
    if (g.eraIndex() !== this._eraIdx) this.applyEra();
    this._titleT = (this._titleT || 0) + 1;
    if (this._titleT % 4 === 0) document.title = `${fmtS(g.state.run.notes)} Noten · Crescendo`;
    this.tutorial();
  }

  save(manual = false) {
    if (this._resetting) return;
    const ok = saveToStorage(this.game.state);
    if (manual) toast({ title: ok ? 'Gespeichert' : 'Speichern fehlgeschlagen', icon: ok ? 'save-arrow' : 'cancel', kind: 'info', time: 1800 });
  }

  // ---------- Einstellungen & Epoche ----------
  applySettings() {
    const s = this.game.state.settings;
    numberFormat.mode = s.numbers;
    this.particles.quality = s.particles;
    if (this.bg.quality !== s.particles) this.bg.setQuality(s.particles);
    document.body.classList.toggle('reduce-motion', !!s.reduceMotion);
    this.audio.applyVolumes();
    this.game.syncStyle();
    this.updateSoundBtn();
  }
  applyEra(initial = false) {
    const g = this.game;
    this._eraIdx = g.eraIndex();
    const era = ERAS[this._eraIdx];
    const c = era.colors;
    const root = document.documentElement.style;
    root.setProperty('--era-a', c.a); root.setProperty('--era-b', c.b);
    root.setProperty('--accent', c.accent); root.setProperty('--accent2', c.accent2);
    root.setProperty('--glow', c.glow);
    this.bg.setEra(era);
    if (initial) this.bg.colors = { ...c };
    this.particles.accent = c.accent; this.particles.accent2 = c.accent2;
    this.viz.accent = c.accent; this.viz.accent2 = c.accent2;
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', c.b);
    this.audio.applyVolumes();
  }

  updateSoundBtn() {
    const s = this.game.state.settings;
    const on = s.musicOn || s.sfxOn;
    const b = document.getElementById('btnSound');
    b.innerHTML = icon(on ? 'sound-on' : 'sound-off');
    b.classList.toggle('off', !on);
  }
  bindTop() {
    document.getElementById('btnSound').addEventListener('click', () => {
      const s = this.game.state.settings;
      this.audio.ensure();
      const on = s.musicOn || s.sfxOn;
      s.musicOn = !on; s.sfxOn = !on;
      if (on) this.game.state.flags.muted = true;
      this.applySettings();
    });
    const hb = document.getElementById('btnHelp');
    hb.innerHTML = icon('info');
    hb.addEventListener('click', () => { this.audio.ensure(); this.help(); });
    const sb = document.getElementById('btnSave');
    sb.innerHTML = icon('save-arrow');
    sb.addEventListener('click', () => this.save(true));
    document.getElementById('logo').addEventListener('click', () => {
      const f = this.game.state.flags;
      f.logoClicks = (f.logoClicks || 0) + 1;
      this.audio.ensure();
      if (this.audio.ctx) {
        import('./audio/instruments.js').then(({ VOICES }) => {
          const n = Math.min(f.logoClicks, 14);
          VOICES.bell(this.audio, this.audio.sfxBus, this.audio.ctx.currentTime + 0.01, this.audio.noteOf(n, 60), 0.3 + n * 0.04);
        });
      }
      const r = document.getElementById('logo').getBoundingClientRect();
      this.particles.burst(r.left + 20, r.top + r.height / 2, { n: 3 + Math.min(10, f.logoClicks), s0: 12, s1: 14 + f.logoClicks * 2 });
    });
    document.addEventListener('visibilitychange', () => {
      const hidden = document.visibilityState === 'hidden';
      this.audio.setHidden(hidden);
      if (hidden) this.save();
    });
    window.addEventListener('pagehide', () => this.save());
    window.addEventListener('beforeunload', () => this.save());
    window.addEventListener('resize', () => this.layoutStaff());
    // Tastenkürzel für Reiter
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || this.pianoActive) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
      if (e.key === 'Escape') { closeAllModals(); return; }
      if (e.key === 'm' || e.key === 'M') { document.getElementById('btnSound').click(); return; }
      if (/^[1-9]$/.test(e.key)) {
        const vis = [...document.querySelectorAll('#tabs .tab:not(.hidden)')].filter((b) => getComputedStyle(b).display !== 'none');
        const b = vis[Number(e.key) - 1];
        if (b) { this.tabs.open(b.dataset.id); this.audio.sfx('tab'); }
      }
    });
  }

  // ---------- Ereignisse ----------
  bindEvents() {
    const g = this.game;
    bus.on('buy', ({ id, first }) => {
      if (first) {
        const b = BUILDING_BY_ID[id];
        toast({ kicker: 'Neu entdeckt', title: b.name, text: esc(b.desc), icon: b.icon, kind: 'era' });
      }
    });
    bus.on('achievement', ({ a }) => {
      toast({ kicker: 'Auszeichnung', title: a.name, text: `${esc(a.desc)} <span class="gold">· +1 ✦</span>`, icon: a.icon });
      this.audio.sfx('achievement');
    });
    bus.on('legend:unlock', ({ id }) => {
      const L = LEGEND_BY_ID[id];
      toast({ kicker: 'Neue Legende', title: L.name, text: `${esc(L.ability(1).name)} – ${g.inEnsemble(id) ? 'tritt deinem Ensemble bei!' : 'wartet auf einen Platz im Ensemble.'}`, img: L.icon ? null : `assets/portraits/${id}.jpg`, icon: L.icon || 'laurel-crown', time: 7000 });
      this.audio.sfx('legend');
      const r = document.getElementById('record').getBoundingClientRect();
      this.particles.confetti(r.left + r.width / 2, r.top + r.height / 2, 40);
    });
    bus.on('era:new', ({ era }) => {
      this.applyEra();
      this.eraBanner(era);
      this.audio.sfx('era');
    });
    bus.on('insp', ({ v, reason, silent }) => {
      if (reason === 'combo') {
        const r = document.getElementById('record').getBoundingClientRect();
        this.particles.text(r.left + r.width / 2, r.top + 10, `+${fmt(v, { dec: 1 })} ✦`, { color: '#8fd6ff', size: 20, life: 1.4 });
        this.audio.sfx('combo', { k: g.combo / g.S.comboEvery });
      }
      if (!silent && reason === 'milestone') this.audio.sfx('insp');
    });
    bus.on('milestone', ({ k, v, fresh }) => {
      if (k < 3) return;
      toast({ kicker: fresh ? 'Neuer Meilenstein' : 'Meilenstein', title: `${fmt(Math.pow(10, k), { trim: true })} Noten`, text: `Die Muse küsst dich: <span class="insp">+${v} Inspiration</span>`, icon: 'light-bulb', kind: 'insp', time: 3500 });
    });
    bus.on('melody', ({ m, insp }) => {
      toast({ kicker: 'Melodie erkannt!', title: m.name, text: `${esc(m.by)} · <span class="insp">+${fmt(insp, { dec: 1 })} ✦</span>`, icon: 'piano-keys', kind: 'insp', time: 6000 });
      this.audio.sfx('melody');
    });
    bus.on('gig:done', (gig) => {
      if (g.state.settings.autoClaim) return;
      toast({ kicker: 'Konzert beendet', title: 'Standing Ovations!', text: 'Hol dir deine Belohnung im Reiter „Konzerte“ ab.', icon: 'ticket' });
    });
    bus.on('gig:claim', (res) => { if (g.state.settings.autoClaim && !this._manualClaim) this.gigToast(res); });
    bus.on('surprise', ({ v }) => {
      const r = document.getElementById('record').getBoundingClientRect();
      this.particles.text(r.left + r.width / 2, r.top + r.height / 2, `Paukenschlag! +${fmtS(v)}`, { color: '#ffd36b', size: 24, life: 1.8 });
      this.audio.sfx('surprise'); this.shake(6);
    });
    bus.on('season', (idx) => {
      toast({ kicker: 'Vivaldi', title: SEASONS[idx], text: ['Produktion blüht auf.', 'Heiße Klicks!', 'Goldene Blätter fallen – mehr goldene Noten.', 'Stille Inspiration.'][idx], icon: ['flowers', 'sun', 'falling-leaf', 'snowflake-1'][idx], kind: 'insp', time: 3500 });
    });
    bus.on('mode', () => this.audio.sfx('open'));
    bus.on('note', ({ midi, strong }) => this.bg.addNote(midi, strong));
    bus.on('challenge:done', ({ ch }) => {
      this.audio.sfx('achievement');
      const r = document.getElementById('record').getBoundingClientRect();
      this.particles.confetti(r.left + r.width / 2, r.top + r.height / 2, 120);
      modal({ title: `Wettbewerb gewonnen: ${esc(ch.name)}!`, body: `<div style="text-align:center;margin:8px 0"><span class="ico-box lg" style="display:inline-grid;--c:#f3b23a">${icon(ch.icon)}</span></div><p class="lore">${esc(ch.lore)}</p><p class="fx-text" style="text-align:center">Dauerhafte Belohnung: ${esc(ch.reward)}</p><p class="muted" style="text-align:center;font-size:13px">Die Einschränkungen sind aufgehoben – spiel einfach weiter!</p>`, actions: [{ label: 'Bravo!', cls: 'primary' }] });
    });
    bus.on('click', (info) => {
      if (!info.robot || this.game.state.settings.particles === 'off') return;
      const r = document.getElementById('record').getBoundingClientRect();
      const a = Math.random() * Math.PI * 2;
      this.particles.text(r.left + r.width / 2 + Math.cos(a) * r.width * 0.3, r.top + r.height / 2 + Math.sin(a) * r.height * 0.3, '+' + fmtS(info.v, 1), { color: '#9fd8ff', size: 15, life: 0.9, bold: 800 });
    });
    bus.on('golden:spawn', (gn) => {
      if (!gn.mini && !g.state.flags.tutorial.golden) {
        g.state.flags.tutorial.golden = true;
        toast({ kicker: 'Tipp', title: 'Eine goldene Note!', text: 'Schnell anklicken, bevor sie verschwindet – sie bringt mächtige Effekte.', icon: 'sparkles' });
      }
    });
  }

  onGoldenClicked(res, x, y) {
    this.particles.burst(x, y, { n: res.id === 'mini' ? 6 : 26, color: '#ffd36b', s0: 16, s1: 30, up: 200 });
    this.particles.ring(x, y, { r1: res.id === 'mini' ? 60 : 160, color: '#ffd36b', w: 4 });
    if (res.id === 'mini') {
      this.particles.text(x, y - 20, '+' + fmtS(res.v), { color: '#ffd36b', size: 20 });
      this.audio.sfx('mini');
      return;
    }
    this.audio.sfx('goldClick');
    this.particles.text(x, y - 34, res.name, { color: '#ffd36b', size: 28, life: 1.8 });
    if (res.text) toast({ kicker: 'Goldene Note', title: res.name, text: esc(res.text), icon: 'sparkles', time: 4200 });
    this.shake(4);
  }

  onTabUnlocked(t) {
    const txt = {
      theory: 'Erlerne Tonarten im Quintenzirkel, Kirchentonarten und Rhythmen.',
      legends: 'Große Musiker:innen schließen sich dir an!',
      gigs: 'Schick deine Musiker auf Tournee.',
      collection: 'Du hast eine Rarität der Musikgeschichte gefunden!',
      piano: 'Spiel frei – und entdecke versteckte Melodien.',
      achievements: 'Deine erste Auszeichnung!',
      lexicon: 'Alles Entdeckte zum Nachlesen.',
      fame: 'Da Capo: Beginne von vorn – mit all deinem Ruhm.',
    }[t.id] || '';
    toast({ kicker: 'Neuer Bereich', title: t.name, text: txt, icon: t.icon, kind: 'era', time: 6000 });
    this.audio.sfx('open');
  }

  claimGig(key) {
    this._manualClaim = true;
    const res = this.game.claimGig(key);
    this._manualClaim = false;
    if (!res) return;
    this.audio.sfx('gig');
    const r = document.getElementById('record').getBoundingClientRect();
    this.particles.confetti(r.left + r.width / 2, r.top + r.height * 0.3, 60);
    let relicHTML = '';
    if (res.relic) {
      const R = RARITY[res.relic.rarity];
      relicHTML = `<div class="card" style="margin-top:12px;border-color:${R.color};box-shadow:0 0 30px -10px ${R.color}"><div class="row"><div class="relic" style="--rc:${R.color};pointer-events:none;background:none;border:0;padding:0"><div class="r-ic">${icon(res.relic.icon)}</div></div>
        <div style="flex:1"><div class="t-kicker" style="color:${R.color};font-size:11px;letter-spacing:.14em;font-weight:900;text-transform:uppercase">${res.relicNew ? 'Neue Rarität' : 'Rarität verbessert'} · ${R.name}</div><div style="font-family:var(--font-head);font-weight:900;font-size:17px">${esc(res.relic.name)}</div>${stars(res.relicLevel)}<div class="fx-text">${esc(res.relic.text(res.relicLevel))}</div></div></div>
        ${res.relicNew ? `<p class="lore" style="margin-bottom:0">${esc(res.relic.lore)}</p>` : ''}</div>`;
      this.audio.sfx('achievement');
    }
    modal({
      title: `Standing Ovations ${esc(res.venue.at || 'beim Konzert')}!`,
      body: `<div class="fame-hero" style="margin:10px 0 0"><div class="fame-stat"><div class="fs-val gold">+${fmtS(res.notes)}</div><div class="fs-lbl">Noten</div></div><div class="fame-stat"><div class="fs-val insp">+${fmt(res.insp, { dec: 1 })}</div><div class="fs-lbl">Inspiration</div></div></div>${relicHTML}`,
      actions: [{ label: 'Weiter', cls: 'primary' }],
    });
    this.tabs.dirtyActive('gig:claim');
  }
  gigToast(res) {
    toast({ kicker: 'Konzert', title: res.venue.name, text: `+${fmtS(res.notes)} Noten · +${fmt(res.insp, { dec: 1 })} ✦${res.relic ? ` · <b style="color:${RARITY[res.relic.rarity].color}">${esc(res.relic.name)}</b>` : ''}`, icon: res.venue.icon });
  }

  doDaCapo(genre, challenge = null) {
    const g = this.game;
    const flash = h('div', { style: { position: 'fixed', inset: '0', zIndex: '150', background: 'radial-gradient(circle, #fff8e0, #ffd36b 40%, rgba(255,211,107,0) 75%)', opacity: '0', pointerEvents: 'none', transition: 'opacity .5s' } });
    document.body.appendChild(flash);
    requestAnimationFrame(() => { flash.style.opacity = '1'; });
    this.audio.sfx('dacapo');
    setTimeout(() => {
      const res = g.daCapo(genre, challenge);
      closeAllModals();
      this.stage.clearGoldens();
      this.store.renderBuildings();
      this.applyEra();
      this.save();
      this.tabs.open(this.tabs.narrow ? 'store' : 'overview');
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 700);
      if (res && g.state.challenge) {
        const c = CHALLENGE_BY_ID[g.state.challenge];
        toast({ kicker: 'Wettbewerb gestartet', title: c.name, text: `${esc(c.rule)} Ziel: ${fmt(c.goal, { trim: true })} Noten.`, icon: c.icon, kind: 'era', time: 9000 });
      } else if (res) {
        toast({ kicker: 'Da Capo', title: `+${fmt(res.gain)} Goldene Schallplatten`, text: `Ein neuer Anfang${g.state.run.genre ? ` im Genre <b>${esc(GENRE_BY_ID[g.state.run.genre]?.name || '')}</b>` : ''}. Deine Legenden und dein Wissen sind bei dir.`, icon: 'compact-disc', time: 7000 });
        const r = document.getElementById('record').getBoundingClientRect();
        this.particles.confetti(r.left + r.width / 2, r.top + r.height / 2, 90);
      }
    }, 650);
  }

  eraBanner(era) {
    if (this._banner) { this._banner.remove(); this._banner = null; }
    const el = h('div', { style: { position: 'fixed', left: '0', right: '0', top: '38%', zIndex: '70', textAlign: 'center', pointerEvents: 'none' } });
    el.innerHTML = `<div style="font-family:var(--font-head);letter-spacing:.3em;text-transform:uppercase;color:${era.colors.accent2};font-size:14px;font-weight:700">Neue Epoche</div>
      <div style="font-family:var(--font-head);font-weight:900;font-size:clamp(36px,7vw,72px);color:#fff;text-shadow:0 0 40px ${era.colors.accent},0 4px 20px rgba(0,0,0,.6)">${esc(era.name)}</div>
      <div style="color:${era.colors.accent2};font-style:italic">${esc(era.years)}</div>`;
    el.animate([{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'scale(1)', offset: 0.15 }, { opacity: 1, offset: 0.75 }, { opacity: 0, transform: 'scale(1.05)' }], { duration: 3600, easing: 'ease-out' });
    document.body.appendChild(el);
    this._banner = el;
    setTimeout(() => { el.remove(); if (this._banner === el) this._banner = null; }, 3600);
    // Bei mehreren Epochen kurz hintereinander nur einen Toast zeigen
    if (this._eraToast && !this._eraToast._closed) this._eraToast.remove();
    this._eraToast = toast({ kicker: 'Neue Epoche', title: era.name, text: esc(era.desc), icon: era.icon, kind: 'era', time: 8000 });
  }

  tutorial() {
    const g = this.game, st = g.state, tu = st.flags.tutorial;
    if (!tu.buy && st.run.notes >= 15 && g.totalBuildings() === 0) {
      tu.buy = true;
      toast({ kicker: 'Tipp', title: 'Dein erstes Instrument', text: this.tabs.narrow ? 'Öffne den Reiter „Instrumente“ und kaufe Händeklatschen.' : 'Kaufe rechts im Laden dein erstes Händeklatschen.', icon: 'high-five', time: 7000 });
    }
    if (!tu.groove && (g.own('drum') > 0 || g.own('clap') > 0)) {
      tu.groove = true;
      toast({ kicker: 'Tipp', title: 'Hörst du den Beat?', text: 'Klicke im Takt – auch mit der <b>Leertaste</b>. Perfekte Treffer bauen Groove auf und steigern deine gesamte Produktion!', icon: 'heart-beats', time: 9000 });
    }
    if (!tu.insp && st.inspiration > 0) {
      tu.insp = true;
    }
    if (!tu.legend && Object.keys(st.legends).length > 0) {
      tu.legend = true;
      setTimeout(() => toast({ kicker: 'Tipp', title: 'Das Ensemble', text: 'Legenden im Ensemble entfalten ihre Meisterleistung. Mit Inspiration kannst du sie aufwerten.', icon: 'laurel-crown', time: 8000 }), 1500);
    }
  }

  help() {
    const sec = (ic, title, text) => `<div class="goal" style="align-items:flex-start"><div class="ico-box sm">${icon(ic)}</div><div class="g-text"><div class="g-title">${title}</div><div class="muted" style="font-size:13px;line-height:1.5">${text}</div></div></div>`;
    modal({
      title: 'Spielanleitung', wide: true,
      body: `<p class="lore">Crescendo ist ein Idle-Spiel: Deine Musik spielt auch weiter, wenn du nichts tust – aber wer im Takt klickt, spielt besser.</p>
      <div class="grid two" style="margin-top:10px">
        ${sec('disc', 'Die Schallplatte', 'Klicke auf die Schallplatte (oder drücke die <b>Leertaste</b>), um Noten zu erzeugen. Jeder Klick spielt einen Ton, der zur Tonart passt.')}
        ${sec('drum', 'Instrumente', 'Kaufe Instrumente und Ensembles – sie erzeugen automatisch Noten. Jedes neue Instrument verändert auch die Musik, die du hörst.')}
        ${sec('heart-beats', 'Groove', 'Sobald ein Beat läuft, bewertet das Spiel deine Klicks: <b>Perfekt</b>, <b>Gut</b> oder <b>Daneben</b>. Treffer im Takt bauen Groove auf, der die gesamte Produktion erhöht. Lange Kombos schenken dir Inspiration.')}
        ${sec('sparkles', 'Goldene Noten', 'Ab und zu schwebt eine goldene Note über den Bildschirm. Klick sie an – sie bringt Produktionsschübe, Notenregen, Klick-Soli und mehr.')}
        ${sec('light-bulb', 'Inspiration', 'Entsteht durch Meilensteine, Auszeichnungen, Konzerte und Kombos. Damit lernst du Harmonielehre (Quintenzirkel, Modi, Rhythmik) und wertest Legenden auf. Inspiration bleibt immer erhalten.')}
        ${sec('laurel-crown', 'Legenden', 'Komponist:innen, Theoretiker und Stars schließen sich dir an, wenn du ihre Bedingung erfüllst. Ihre Passive wirkt immer, ihre Meisterleistung nur im Ensemble.')}
        ${sec('ticket', 'Konzerte', 'Schick deine Musiker auf Tournee. Konzerte laufen in Echtzeit – auch offline – und bringen Noten, Inspiration und Raritäten der Musikgeschichte.')}
        ${sec('compact-disc', 'Da Capo', 'Beginne von vorn und erhalte Goldene Schallplatten für all deine Noten. Sie erhöhen dauerhaft die Produktion; Tantiemen investierst du in der Ruhmeshalle – z. B. in Genres, die einen Durchgang völlig verändern.')}
        ${sec('piano-keys', 'Übungsklavier', 'Spiel frei auf dem Klavier. Erkennst du berühmte Melodien? Der Ticker und das Klavier verraten dir Hinweise.')}
        ${sec('keyboard', 'Tastenkürzel', '<b>Leertaste</b>: Klick im Takt · <b>1–9</b>: Reiter wechseln · <b>M</b>: Ton an/aus · <b>Esc</b>: Dialog schließen · <b>Umschalt</b>/<b>Strg</b> + Klick auf ein Instrument: 10/100 kaufen · Klavier: <b>A–K</b> und <b>W–P</b>')}
      </div>`,
      actions: [{ label: 'Alles klar!', cls: 'primary' }],
    });
  }

  // ---------- Hilfen ----------
  shake(mag = 5) {
    if (this.game.state.settings.reduceMotion) return;
    this.shakeT = 0.4; this.shakeMag = mag;
  }
  burstAt(el, glyph = '✦') {
    const r = el.getBoundingClientRect();
    this.particles.burst(r.left + r.width / 2, r.top + r.height / 2, { n: 10, glyph, color: '#8fd6ff', s0: 14, s1: 22 });
  }
  toastInfo(title, text) { toast({ title, text: esc(text), icon: 'info', kind: 'info' }); }

  loadState(st) {
    this.game.state = migrate(st);
    this.game.dirty = true; this.game.recompute(); this.game.syncStyle(true);
    this.stage.clearGoldens();
    this.store.renderBuildings();
    this.applySettings();
    this.applyEra();
    this.stage.setSkin(this.game.state.settings.skin);
    this.tabs.panels = {};
    this.tabs.open('overview');
    this.save();
  }
  hardReset() {
    this._resetting = true;
    clearStorage();
    location.reload();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  try {
    window.app = new App();
  } catch (e) {
    console.error(e);
    document.body.classList.remove('booting');
    document.body.insertAdjacentHTML('beforeend', `<div style="position:fixed;inset:0;display:grid;place-items:center;z-index:300;background:#0d0a1c;color:#fff;font-family:sans-serif;padding:20px;text-align:center"><div><h2>Ups – ein Fehler beim Start</h2><pre style="white-space:pre-wrap;color:#ff9aa8">${String(e && e.stack || e)}</pre></div></div>`);
  }
});
