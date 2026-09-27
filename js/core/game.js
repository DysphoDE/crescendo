// Spiellogik: Produktion, Klicks, Rhythmus, Buffs, goldene Noten, Konzerte, Freischaltungen, Da Capo
import { BUILDINGS, BUILDING_BY_ID } from '../data/buildings.js';
import { UPGRADES, UPGRADE_BY_ID } from '../data/upgrades.js';
import { LEGENDS, LEGEND_BY_ID, legendLevelCost, LEGEND_MAX_LEVEL } from '../data/legends.js';
import { CIRCLE, CIRCLE_BY_ID, CIRCLE_BONUS, MODES, MODE_BY_ID, RHYTHM, RHYTHM_BY_ID, circleAvailable } from '../data/theory.js';
import { GENRE_BY_ID } from '../data/genres.js';
import { VENUES, VENUE_BY_ID } from '../data/venues.js';
import { RELICS, RELIC_BY_ID, RARITY, RELIC_MAX } from '../data/relics.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { HALL, HALL_BY_ID } from '../data/hall.js';
import { ERAS, ERA_BY_ID } from '../data/eras.js';
import { MELODIES, matchMelody } from '../data/melodies.js';
import { STYLES } from '../audio/styles.js';
import { CHALLENGE_BY_ID } from '../data/challenges.js';
import { newRun } from './state.js';
import { bus } from './bus.js';
import { clamp, rand, pick, perf, weightedPick } from './util.js';
import { fmt } from './format.js';

const COST_GROWTH = 1.15;
const BASE_STATS = () => ({
  prod: 1, bmult: {}, click: 1, clickAdd: 0, clickNps: 0, clapFlat: 0, clapFlatMult: 1,
  syn: [], cost: 1, ucost: 1, goldFreq: 1, goldDur: 1, goldLife: 1, goldEffect: 1, applause: 1, museMult: 1,
  grooveMax: 0.5, grooveGain: 1, grooveDecay: 1, grooveMult: 1, grooveClick: 0, window: 1,
  insp: 1, comboInsp: 1, offline: 0.5, offlineX: 1, offlineCap: 8, gigSpeed: 1, gigReward: 1, gigSlots: 1, relicLuck: 1,
  crit: 0.02, critMult: 5, critX: 1, slots: 2, recordBonus: 0.02, recordGain: 1, achBonus: 0.01, achMult: 1,
  idle: 1, idle60: 1, theoryCost: 1, legendCost: 1, modeMult: 1, robot: 0, eighths: false, syncopation: 0, comboEvery: 24,
  rubato: false, scat: false, waltz: false, cannon: 0, silence: 0, bpm: 1, noBeat: false, offbeatOnly: false,
  perTheory: 0, perType: 0, perOrgan: 0, per50: 0, per100: 0, perEra: 0, perAch: 0, twelve: 0, perBuilding: [],
  start: [], startNotes: 0,
  noClickNotes: false, maxPerBuilding: Infinity, noUpgrades: false, ban: [], typeTax: 0, per12: 0,
});

const MULT_KEYS = new Set(['prod', 'click', 'cost', 'ucost', 'goldFreq', 'goldDur', 'goldLife', 'goldEffect', 'applause', 'museMult',
  'grooveGain', 'grooveDecay', 'grooveMult', 'window', 'insp', 'comboInsp', 'offlineX', 'gigSpeed', 'gigReward', 'relicLuck', 'critX',
  'recordGain', 'achMult', 'idle', 'idle60', 'theoryCost', 'legendCost', 'modeMult', 'bpm']);
const ADD_KEYS = new Set(['clickAdd', 'clickNps', 'clapFlat', 'grooveMax', 'grooveClick', 'offline', 'offlineCap', 'gigSlots', 'crit', 'critMult',
  'slots', 'recordBonus', 'achBonus', 'syncopation', 'perTheory', 'perType', 'perOrgan', 'per50', 'per100', 'perEra', 'perAch', 'twelve', 'startNotes', 'typeTax', 'per12']);
const FLAG_KEYS = new Set(['eighths', 'rubato', 'scat', 'waltz', 'noBeat', 'offbeatOnly', 'noClickNotes', 'noUpgrades']);
const MAX_KEYS = new Set(['robot', 'cannon', 'silence']);

function scaleMult(v, s) { return s === 1 ? v : 1 + (v - 1) * s; }

function applyFx(S, e, scale = 1) {
  const t = e.t;
  if (t === 'bmult') { S.bmult[e.b] = (S.bmult[e.b] || 1) * scaleMult(e.v, scale); return; }
  if (t === 'syn') { S.syn.push({ dst: e.dst, src: e.src, v: e.v * scale }); return; }
  if (t === 'perBuilding') { S.perBuilding.push({ b: e.b, v: e.v * scale }); return; }
  if (t === 'start') { S.start.push({ b: e.b, n: e.n }); return; }
  if (t === 'clapFlatMult') { S.clapFlatMult *= e.v; return; }
  if (t === 'comboEvery') { S.comboEvery = Math.min(S.comboEvery, e.v); return; }
  if (t === 'maxPerBuilding') { S.maxPerBuilding = Math.min(S.maxPerBuilding, e.v); return; }
  if (t === 'ban') { S.ban = S.ban.concat(e.v); return; }
  if (MULT_KEYS.has(t)) { S[t] *= scaleMult(e.v, scale); return; }
  if (ADD_KEYS.has(t)) { S[t] += e.v * scale; return; }
  if (FLAG_KEYS.has(t)) { S[t] = true; return; }
  if (MAX_KEYS.has(t)) { S[t] = Math.max(S[t], e.v); return; }
}

export const GOLDEN_EFFECTS = [
  { id: 'frenzy', name: 'Fortissimo!', desc: 'Produktion ×7', w: 40 },
  { id: 'applause', name: 'Applaus!', desc: 'Sofortiger Notenregen', w: 35 },
  { id: 'solo', name: 'Virtuosen-Solo!', desc: 'Klickkraft ×777', w: 8, req: (g) => g.state.run.clicks >= 30 },
  { id: 'muse', name: 'Musenkuss!', desc: 'Inspiration', w: 6, req: (g) => g.state.life.inspEarned > 0 },
  { id: 'rain', name: 'Notenregen!', desc: 'Fang die fallenden Noten', w: 5 },
  { id: 'groove', name: 'Groove-Welle!', desc: 'Voller Groove', w: 5, req: (g) => (g.state.run.buildings.drum || 0) > 0 && !g.S.noBeat },
  { id: 'bsolo', name: 'Solo', desc: 'Ein Instrument glänzt', w: 6, req: (g) => BUILDINGS.some((b) => (g.state.run.buildings[b.id] || 0) >= 10) },
  { id: 'encore', name: 'Zugabe!', desc: 'Noch eine goldene Note', w: 3 },
];

export class Game {
  constructor(state) {
    this.state = state;
    this.S = BASE_STATS();
    this.dirty = true;
    this.npsBase = 0; this.nps = 0; this.rawBuilding = {}; this.rawTotal = 0;
    this.buffs = [];
    this.goldens = [];
    this.goldSeq = 1;
    this.nextGolden = Date.now() + rand(90, 180) * 1000;
    this.groove = 0; this.combo = 0; this.perfectStreak = 0;
    this.lastScoredSlot = -1e9; this.lastScoredT = -1e9; this.grooveLockUntil = 0;
    this.lastClickMs = Date.now();
    this.clickStamps = [];
    this.transport = { bpm: 92, t0: perf(), meter: 4, swing: 0, styleId: 'urzeit' };
    this.beatIndex = Math.floor((perf() - this.transport.t0) * this.transport.bpm / 60);
    this.dyn = { seasonStart: Date.now(), boleroStart: Date.now(), sacre: 1, sacreNext: 0, mk: 0, surpriseNext: Date.now() + 60000, cannon: 0, season: -1 };
    this.timers = { ach: 0, unlock: 0, news: 0 };
    this.sessionStart = Date.now();
    this.pianoBuffer = []; this.pianoLast = 0;
    this.notifiedGigs = new Set();
    this.recompute();
    this.syncStyle(true);
  }

  // ---------- Zählhelfer ----------
  own(id) { return this.state.run.buildings[id] || 0; }
  totalBuildings() { let n = 0; for (const b of BUILDINGS) n += this.own(b.id); return n; }
  typesOwned() { return BUILDINGS.filter((b) => this.own(b.id) > 0).length; }
  upgradeCount() { return Object.keys(this.state.run.upgrades).length; }
  theoryCount() { return Object.keys(this.state.theory).length; }
  achievementCount() { return Object.keys(this.state.achievements).length; }
  eraIndex() {
    let idx = 0;
    for (const b of BUILDINGS) if (this.own(b.id) > 0) idx = Math.max(idx, ERA_BY_ID[b.era].index);
    return idx;
  }
  era() { return ERAS[this.eraIndex()]; }
  maxEraReached() {
    let idx = 0;
    for (const e of ERAS) if (this.state.discovered['e_' + e.id]) idx = Math.max(idx, ERA_BY_ID[e.id].index);
    return idx;
  }
  legendUnlocked(id) { return !!this.state.legends[id]; }
  inEnsemble(id) { return this.state.ensemble.includes(id); }
  legendLevel(id) { return this.state.legends[id]?.level || 0; }

  // ---------- Effekte & Werte ----------
  collectEffects() {
    const st = this.state;
    const list = [];
    for (const id of Object.keys(st.run.upgrades)) { const u = UPGRADE_BY_ID[id]; if (u) list.push([u.effects, 1]); }
    for (const id of Object.keys(st.theory)) {
      const n = CIRCLE_BY_ID[id] || RHYTHM_BY_ID[id];
      if (n) list.push([n.fx, 1]);
    }
    if (st.theory.Fis && st.theory.Ges) list.push([CIRCLE_BONUS.enharmonic.fx, 1]);
    if (CIRCLE.filter((c) => c.ring === 'major').every((c) => st.theory[c.id])) list.push([CIRCLE_BONUS.allMajor.fx, 1]);
    if (CIRCLE.filter((c) => c.ring === 'minor').every((c) => st.theory[c.id])) list.push([CIRCLE_BONUS.allMinor.fx, 1]);
    for (const id of Object.keys(st.hall)) { const hh = HALL_BY_ID[id]; if (hh) list.push([hh.fx, 1]); }
    if (st.run.genre && GENRE_BY_ID[st.run.genre]) list.push([GENRE_BY_ID[st.run.genre].fx, 1]);
    const ch = st.challenge ? CHALLENGE_BY_ID[st.challenge] : null;
    if (ch) list.push([ch.restrict, 1]);
    for (const id of Object.keys(st.challengesDone || {})) { const c = CHALLENGE_BY_ID[id]; if (c) list.push([c.fx, 1]); }
    const noLegends = ch && ch.restrict.some((r) => r.t === 'noLegends');
    for (const [id, data] of Object.entries(noLegends ? {} : st.legends)) {
      const L = LEGEND_BY_ID[id]; if (!L) continue;
      list.push([L.passive(data.level).fx, 1]);
      if (st.ensemble.includes(id)) list.push([L.ability(data.level).fx, 1]);
    }
    for (const [id, n] of Object.entries(st.relics)) { const r = RELIC_BY_ID[id]; if (r) list.push([r.fx(Math.min(n, RELIC_MAX)), 1]); }
    return list;
  }

  recompute() {
    const S = BASE_STATS();
    for (const [fx, sc] of this.collectEffects()) for (const e of fx) applyFx(S, e, sc);
    // Modus zuletzt – kann durch Miles Davis verstärkt werden
    const mode = MODE_BY_ID[this.state.mode] || MODE_BY_ID.ionian;
    for (const e of mode.fx) applyFx(S, e, S.modeMult);
    S.crit = clamp(S.crit, 0, 0.9);
    this.S = S;

    // Produktion je Instrument
    let raw = 0;
    const nonClap = this.totalBuildings() - this.own('clap');
    const organs = this.own('organ');
    for (const b of BUILDINGS) {
      const n = this.own(b.id);
      if (!n) { this.rawBuilding[b.id] = 0; continue; }
      let per = b.prod;
      if (b.id === 'clap') per += S.clapFlat * S.clapFlatMult * nonClap;
      let m = S.bmult[b.id] || 1;
      let syn = 1;
      for (const s of S.syn) if (s.dst === b.id) syn += s.v * this.own(s.src);
      syn += S.perOrgan * organs;
      const p = per * n * m * syn;
      this.rawBuilding[b.id] = p;
      raw += p;
    }
    this.rawTotal = raw;

    // Globale Multiplikatoren
    const nAch = this.achievementCount();
    let g = S.prod;
    g *= 1 + nAch * S.achBonus * S.achMult;
    g *= 1 + this.state.records * S.recordBonus;
    g *= 1 + S.perTheory * (this.theoryCount() + Object.keys(this.state.modesUnlocked).length - 1);
    g *= 1 + S.perType * this.typesOwned();
    g *= 1 + S.per50 * BUILDINGS.filter((b) => this.own(b.id) >= 50).length;
    g *= 1 + S.per100 * Math.floor(this.totalBuildings() / 100);
    g *= 1 + S.perEra * (this.eraIndex() + 1);
    g *= 1 + S.perAch * nAch;
    if (S.twelve > 0) {
      const t12 = BUILDINGS.filter((b) => this.own(b.id) >= 12).length;
      if (t12 >= 12) g *= 1 + S.twelve * t12;
    }
    for (const pb of S.perBuilding) g *= 1 + pb.v * this.own(pb.b);
    if (S.per12 > 0) g *= 1 + S.per12 * BUILDINGS.filter((b) => this.own(b.id) >= 12).length;
    this.globalMult = g;
    this.npsBase = raw * g;
    this.dirty = false;
    this.syncStyle();
  }

  // Zeitabhängige Multiplikatoren (Legenden-Mechaniken, Leerlauf, Genre)
  dynamic(nowMs) {
    const S = this.S, st = this.state;
    const out = { prod: 1, click: 1, goldFreq: 1, insp: 1, labels: [] };
    const since = (nowMs - this.lastClickMs) / 1000;
    if (since >= 30 && S.idle !== 1) { out.prod *= S.idle; out.labels.push(['Leerlauf', S.idle]); }
    if (since >= 60 && S.idle60 !== 1) { out.prod *= S.idle60; out.labels.push(['Taub, doch unbeirrt', S.idle60]); }
    if (S.silence > 0 && since >= 273) { out.prod *= S.silence; out.labels.push(['4′33″', S.silence]); }
    for (const id of st.ensemble) {
      const L = LEGEND_BY_ID[id]; if (!L || !L.dyn) continue;
      const l = this.legendLevel(id);
      if (L.dyn === 'seasons') {
        const idx = Math.floor((nowMs - this.dyn.seasonStart) / 90000) % 4;
        if (idx === 0) { const v = 1.5 + 0.1 * (l - 1); out.prod *= v; out.labels.push(['Frühling', v]); }
        else if (idx === 1) { const v = 3 + 0.3 * (l - 1); out.click *= v; out.labels.push(['Sommer (Klicks)', v]); }
        else if (idx === 2) { out.goldFreq *= 2; out.labels.push(['Herbst (goldene Noten)', 2]); }
        else { const v = 1.5 + 0.1 * (l - 1); out.insp *= v; out.labels.push(['Winter (Inspiration)', v]); }
        out.season = idx;
      } else if (L.dyn === 'nocturne') {
        const h = new Date(nowMs).getHours();
        const v = (h >= 20 || h < 6) ? 2 + 0.1 * (l - 1) : 1.2;
        out.prod *= v; out.labels.push(['Nocturne', v]);
      } else if (L.dyn === 'bolero') {
        const max = 3 + 0.2 * (l - 1);
        const frac = ((nowMs - this.dyn.boleroStart) % 900000) / 900000;
        const v = 1 + (max - 1) * frac; out.prod *= v; out.labels.push(['Boléro', v]); out.bolero = frac;
      } else if (L.dyn === 'sacre') {
        out.prod *= this.dyn.sacre; out.labels.push(['Le Sacre', this.dyn.sacre]);
      } else if (L.dyn === 'mountainKing') {
        const v = 1 + this.dyn.mk; out.prod *= v; out.labels.push(['Bergkönig', v]);
      } else if (L.dyn === 'satisfaction') {
        const v = 1 + Math.min(2, (0.1 + 0.01 * (l - 1)) * st.run.playTime / 3600); out.prod *= v; out.labels.push(['Satisfaction', v]);
      }
    }
    if (st.run.genre === 'techno') {
      const v = 1 + Math.min(5, 0.5 * (nowMs - this.sessionStart) / 3600000); out.prod *= v; out.labels.push(['Techno-Nacht', v]);
    }
    return out;
  }

  buffMult() {
    let prod = 1, click = 1;
    for (const b of this.buffs) {
      if (b.kind === 'prod') prod *= b.v;
      else if (b.kind === 'click') click *= b.v;
      else if (b.kind === 'building') {
        const share = this.rawTotal > 0 ? (this.rawBuilding[b.b] || 0) / this.rawTotal : 0;
        prod *= 1 + (b.v - 1) * share;
      }
    }
    return { prod, click };
  }

  grooveProdMult() { return 1 + this.S.grooveMax * this.S.grooveMult * this.groove; }

  computeNps(nowMs = Date.now()) {
    const d = this.dynamic(nowMs);
    const bm = this.buffMult();
    this._dyn = d; this._bm = bm;
    this.nps = this.npsBase * d.prod * bm.prod * this.grooveProdMult();
    return this.nps;
  }

  clickValue(nowMs = Date.now()) {
    const S = this.S;
    const d = this._dyn || this.dynamic(nowMs);
    const bm = this._bm || this.buffMult();
    let v = (1 + S.clickAdd) * S.click + this.nps * S.clickNps;
    v *= 1 + 0.5 * this.groove * (1 + S.grooveClick);
    v *= d.click * bm.click;
    return v;
  }

  // ---------- Kosten & Käufe ----------
  costMult() { return this.S.cost * (1 + this.S.typeTax * this.typesOwned()); }
  buildingLocked(id) {
    if (this.S.ban.includes(id)) return 'ban';
    if (this.own(id) >= this.S.maxPerBuilding) return 'max';
    return null;
  }
  buildingCost(id, n = 1) {
    const b = BUILDING_BY_ID[id];
    const owned = this.own(id);
    const base = b.cost * this.costMult() * Math.pow(COST_GROWTH, owned);
    if (n === 1) return Math.ceil(base);
    return Math.ceil(base * (Math.pow(COST_GROWTH, n) - 1) / (COST_GROWTH - 1));
  }
  maxAffordable(id) {
    const b = BUILDING_BY_ID[id];
    const base = b.cost * this.costMult() * Math.pow(COST_GROWTH, this.own(id));
    const bank = this.state.run.notes;
    if (bank < base || this.buildingLocked(id)) return 0;
    let n = Math.max(0, Math.floor(Math.log(1 + bank * (COST_GROWTH - 1) / base) / Math.log(COST_GROWTH)));
    if (Number.isFinite(this.S.maxPerBuilding)) n = Math.min(n, this.S.maxPerBuilding - this.own(id));
    return n;
  }
  buy(id, amount = 1) {
    if (this.buildingLocked(id)) return false;
    let n = amount === 'max' ? this.maxAffordable(id) : amount;
    if (Number.isFinite(this.S.maxPerBuilding)) n = Math.min(n, this.S.maxPerBuilding - this.own(id));
    if (n <= 0) return false;
    let cost = this.buildingCost(id, n);
    if (cost > this.state.run.notes) {
      if (amount === 'max') return false;
      n = Math.min(n, this.maxAffordable(id));
      if (n <= 0) return false;
      cost = this.buildingCost(id, n);
    }
    const first = !this.state.discovered['b_' + id];
    const eraBefore = this.eraIndex();
    this.state.run.notes -= cost;
    this.state.run.buildings[id] = this.own(id) + n;
    this.state.life.buildingsBought += n;
    this.state.discovered['b_' + id] = true;
    this.dirty = true;
    this.recompute();
    bus.emit('buy', { id, n, first });
    if (this.eraIndex() > eraBefore) this.onEraChange();
    return true;
  }

  upgradeCost(u) { return Math.ceil(u.cost * this.S.ucost); }
  availableUpgrades() {
    const out = [];
    if (this.S.noUpgrades) return out;
    for (const u of UPGRADES) {
      if (this.state.run.upgrades[u.id]) continue;
      if (u.req(this)) out.push(u);
    }
    out.sort((a, b) => a.cost - b.cost);
    return out;
  }
  buyUpgrade(id) {
    const u = UPGRADE_BY_ID[id];
    if (!u || this.state.run.upgrades[id] || !u.req(this) || this.S.noUpgrades) return false;
    const c = this.upgradeCost(u);
    if (c > this.state.run.notes) return false;
    this.state.run.notes -= c;
    this.state.run.upgrades[id] = 1;
    this.state.life.upgradesBought++;
    this.dirty = true; this.recompute();
    bus.emit('upgrade', { id });
    return true;
  }
  buyAllUpgrades() {
    let n = 0;
    for (const u of this.availableUpgrades()) if (this.buyUpgrade(u.id)) n++;
    return n;
  }

  // ---------- Noten & Inspiration ----------
  addNotes(v, src) {
    if (!(v > 0) || !Number.isFinite(v)) return;
    const r = this.state.run;
    r.notes += v; r.total += v;
    this.state.life.notes += v;
    if (src === 'click') { r.handmade += v; this.state.life.handmade += v; }
  }
  gainInsp(v, reason, silent) {
    const d = this._dyn || { insp: 1 };
    const val = v * this.S.insp * (d.insp || 1);
    this.state.inspiration += val;
    this.state.life.inspEarned += val;
    bus.emit('insp', { v: val, reason, silent });
    return val;
  }

  // ---------- Transport & Rhythmus ----------
  currentStyleId() {
    const st = this.state;
    if (st.run.genre) return 'g_' + st.run.genre;
    if (st.settings.style && st.settings.style !== 'auto' && STYLES[st.settings.style]) return st.settings.style;
    return this.era().id;
  }
  syncStyle(force) {
    const id = this.currentStyleId();
    const style = STYLES[id] || STYLES.urzeit;
    const meter = this.S.waltz ? 3 : 4;
    const bpm = Math.round(style.bpm * (this.S.bpm || 1));
    const tr = this.transport;
    if (force || tr.styleId !== id || tr.bpm !== bpm || tr.meter !== meter) {
      const t = perf();
      const beatNow = (t - tr.t0) * tr.bpm / 60;
      tr.bpm = bpm; tr.meter = meter; tr.swing = style.swing || 0; tr.styleId = id;
      tr.t0 = t - beatNow * 60 / bpm;
      tr.noBeat = !!(style.noBeat || this.S.noBeat);
      bus.emit('tempo', { ...tr });
    }
  }
  beatDur() { return 60 / this.transport.bpm; }
  beatPos(t) { return (t - this.transport.t0) / this.beatDur(); }

  /** Bewertet einen Klick zum Zeitpunkt t (perf-Sekunden) */
  judge(t) {
    const S = this.S, tr = this.transport;
    if (tr.noBeat || (this.own('drum') === 0 && this.own('clap') < 1)) return null;
    const bd = this.beatDur();
    const p = this.beatPos(t);
    const k = Math.floor(p);
    const f = p - k;
    const off = tr.swing > 0 ? tr.swing : 0.5;
    const cands = [[k, 0, false], [k + 1, 0, false]];
    if (S.eighths) cands.push([k, off, true]);
    let best = null;
    for (const [bk, sub, isOff] of cands) {
      const pos = bk + sub;
      const d = Math.abs(p - pos) * bd;
      if (!best || d < best.d) best = { d, slot: bk * 2 + (isOff ? 1 : 0), off: isOff, beat: bk };
    }
    const slotLen = S.eighths ? bd * 0.5 : bd;
    const perfectW = Math.min(0.075 * S.window, slotLen * 0.22);
    const goodW = Math.min(0.15 * S.window, slotLen * 0.4);
    let res;
    if (best.slot === this.lastScoredSlot) res = 'miss';
    else if (best.d <= perfectW) res = 'perfect';
    else if (best.d <= goodW) res = 'good';
    else res = 'miss';
    void f;
    return { judge: res, slot: best.slot, off: best.off, downbeat: !best.off && ((best.beat % tr.meter) + tr.meter) % tr.meter === 0, delta: best.d };
  }

  applyJudge(j, t, robot = false) {
    if (!j) return;
    const S = this.S, life = this.state.life;
    if (j.judge === 'miss') {
      if (robot) return;
      if (!S.rubato) this.groove = Math.max(0, this.groove - 0.05);
      if (!S.scat) this.combo = 0;
      this.perfectStreak = 0;
      return;
    }
    let gain = j.judge === 'perfect' ? 0.07 : 0.035;
    gain *= S.grooveGain;
    if (j.off) gain *= 1 + S.syncopation;
    if (S.offbeatOnly) gain *= j.off ? 2 : 0.5;
    if (S.waltz && j.downbeat && j.judge === 'perfect') gain *= 3;
    if (robot) {
      // Der Automat hält den Groove nur bis zu seiner Obergrenze – und stiehlt dem Spieler keinen Schlag
      if (this.groove < S.robot) this.groove = Math.min(S.robot, this.groove + gain);
      this.lastRobotT = t;
      return;
    }
    this.lastScoredSlot = j.slot;
    this.lastScoredT = t;
    this.groove = Math.min(1, this.groove + gain);
    this.combo++;
    if (j.judge === 'perfect') {
      life.perfectHits++; this.perfectStreak++;
      life.bestPerfectStreak = Math.max(life.bestPerfectStreak, this.perfectStreak);
    } else { life.goodHits++; this.perfectStreak = 0; }
    if (j.off) life.offbeatHits++;
    if (this.combo > life.maxCombo) life.maxCombo = this.combo;
    if (this.combo % S.comboEvery === 0) {
      this.gainInsp(1 * S.comboInsp, 'combo');
    }
  }

  // ---------- Klick ----------
  click(t, meta = {}) {
    const nowMs = Date.now();
    const st = this.state;
    const robot = !!meta.robot;
    if (!robot) {
      this.lastClickMs = nowMs;
      st.run.clicks++; st.life.clicks++;
      this.clickStamps.push(nowMs);
      while (this.clickStamps.length && nowMs - this.clickStamps[0] > 1000) this.clickStamps.shift();
      if (this.clickStamps.length > st.life.bestCps) st.life.bestCps = this.clickStamps.length;
    }
    const j = robot ? { judge: 'perfect', slot: Math.round(this.beatPos(t)) * 2, off: false, downbeat: false } : this.judge(t);
    this.applyJudge(j, t, robot);
    if (this.grooveLockUntil > nowMs) this.groove = 1;
    this.computeNps(nowMs);
    let v = this.clickValue(nowMs);
    let crit = false, cannon = false;
    if (!robot && Math.random() < this.S.crit) { crit = true; v *= this.S.critMult * this.S.critX; st.life.crits++; }
    if (!robot && this.S.cannon > 0) {
      this.dyn.cannon++;
      if (this.dyn.cannon % 12 === 0) { cannon = true; v *= this.S.cannon; }
    }
    if (robot) v *= 0.5;
    if (this.S.noClickNotes) v = 0;
    this.addNotes(v, 'click');
    const info = { v, crit, cannon, judge: j?.judge || null, off: j?.off, combo: this.combo, robot, x: meta.x, y: meta.y };
    bus.emit('click', info);
    return info;
  }

  // ---------- Tick ----------
  tick(dt) {
    const nowMs = Date.now();
    const t = perf();
    const st = this.state;
    if (this.dirty) this.recompute();
    dt = Math.max(0, Math.min(dt, 60));

    // Beats
    const bp = Math.floor(this.beatPos(t));
    if (bp !== this.beatIndex) {
      const steps = Math.min(4, bp - this.beatIndex);
      this.beatIndex = bp;
      if (steps > 0) {
        bus.emit('beat', { index: bp, meter: this.transport.meter });
        if (this.S.robot > 0 && !this.transport.noBeat && this.own('drum') > 0) {
          this.click(this.transport.t0 + bp * this.beatDur(), { robot: true });
        }
      }
    }

    // Groove-Zerfall
    const bd = this.beatDur();
    if (this.grooveLockUntil > nowMs) this.groove = 1;
    else if (t - this.lastScoredT > 2.2 * bd) {
      const robotOn = this.S.robot > 0 && t - (this.lastRobotT || -1e9) < 2.2 * bd;
      const floor = robotOn ? Math.min(this.groove, this.S.robot) : 0;
      this.groove = Math.max(floor, this.groove - 0.3 * this.S.grooveDecay * dt);
    }
    if (t - this.lastScoredT > 3.5 * bd && this.combo > 0 && !this.S.scat) this.combo = 0;
    if (this.transport.noBeat) this.groove = 0;

    // Dynamik-Zustände
    this.updateDyn(nowMs, dt);

    // Buffs ablaufen lassen
    if (this.buffs.length) {
      const before = this.buffs.length;
      this.buffs = this.buffs.filter((b) => b.end > nowMs);
      if (this.buffs.length !== before) bus.emit('buffs');
    }

    // Produktion
    this.computeNps(nowMs);
    this.addNotes(this.nps * dt, 'prod');
    st.run.playTime += dt; st.life.playTime += dt;
    if (this.nps > st.life.bestNps) st.life.bestNps = this.nps;
    if (this.nps > st.run.bestNps) st.run.bestNps = this.nps;

    // Meilensteine
    while (st.run.total >= Math.pow(10, st.run.milestone + 1)) {
      st.run.milestone++;
      const k = st.run.milestone;
      if (k >= 3) {
        const fresh = k > (st.life.bestMilestone || 2);
        if (fresh) st.life.bestMilestone = k;
        const v = fresh ? 2 : 1;
        this.gainInsp(v, 'milestone');
        bus.emit('milestone', { k, v, fresh });
      }
    }

    // Wettbewerb
    if (st.challenge) {
      const ch = CHALLENGE_BY_ID[st.challenge];
      if (!ch) st.challenge = null;
      else if (st.run.total >= ch.goal) {
        st.challengesDone = st.challengesDone || {};
        st.challengesDone[ch.id] = Date.now();
        st.challenge = null;
        this.dirty = true; this.recompute();
        bus.emit('challenge:done', { ch });
      }
    }

    // Goldene Noten
    this.updateGoldens(nowMs);

    // Konzerte
    for (const gig of st.gigs) {
      if (gig.end <= nowMs && !this.notifiedGigs.has(gig.key)) {
        this.notifiedGigs.add(gig.key);
        bus.emit('gig:done', gig);
        if (st.settings.autoClaim) this.claimGig(gig.key);
      }
    }

    // Stille (4′33″)
    if (!st.flags.silence433 && (typeof document === 'undefined' || document.visibilityState === 'visible') && (nowMs - this.lastClickMs) >= 273000 && st.life.clicks > 0) {
      st.flags.silence433 = true;
      bus.emit('toast', { title: '4′33″', text: 'Du hast der Stille gelauscht. John Cage wäre stolz.', icon: 'sound-off' });
    }

    // Periodische Prüfungen
    this.timers.ach -= dt; this.timers.unlock -= dt;
    if (this.timers.unlock <= 0) { this.timers.unlock = 1; this.checkUnlocks(); }
    if (this.timers.ach <= 0) { this.timers.ach = 1; this.checkAchievements(); }
  }

  updateDyn(nowMs, dt) {
    const st = this.state;
    const ens = st.ensemble;
    if (ens.includes('stravinsky') && nowMs >= this.dyn.sacreNext) {
      const l = this.legendLevel('stravinsky');
      const max = 4 + 0.2 * (l - 1);
      this.dyn.sacre = Math.exp(rand(Math.log(0.5), Math.log(max)));
      this.dyn.sacreNext = nowMs + 10000;
      if (this.dyn.sacre > max * 0.93) st.flags.sacreMax = true;
      bus.emit('sacre', this.dyn.sacre);
    }
    if (ens.includes('grieg')) {
      const l = this.legendLevel('grieg');
      const rate = (0.05 + 0.01 * (l - 1)) / 60;
      const max = 1 + 0.1 * (l - 1);
      if (this.groove > 0.15) this.dyn.mk = Math.min(max, this.dyn.mk + rate * dt);
      else this.dyn.mk = Math.max(0, this.dyn.mk - rate * 10 * dt);
    }
    if (ens.includes('haydn') && nowMs >= this.dyn.surpriseNext) {
      this.dyn.surpriseNext = nowMs + 60000;
      const l = this.legendLevel('haydn');
      const v = this.npsBase * (20 + 3 * (l - 1));
      if (v > 0) { this.addNotes(v, 'surprise'); bus.emit('surprise', { v }); }
    }
    if (ens.includes('vivaldi')) {
      const idx = Math.floor((nowMs - this.dyn.seasonStart) / 90000) % 4;
      if (idx !== this.dyn.season) {
        this.dyn.season = idx;
        st.flags.seasonsSeen[idx] = true;
        st.flags.seasons = Object.keys(st.flags.seasonsSeen).length;
        bus.emit('season', idx);
      }
    }
    if (ens.includes('ravel')) {
      const frac = ((nowMs - this.dyn.boleroStart) % 900000) / 900000;
      if (frac > 0.995 && nowMs - this.dyn.boleroStart > 890000) st.flags.boleroDone = true;
    }
  }

  // ---------- Buffs ----------
  addBuff(b) {
    const nowMs = Date.now();
    const ex = this.buffs.find((x) => x.id === b.id);
    const dur = b.dur * 1000;
    if (ex) { ex.end = Math.max(ex.end, nowMs + dur); ex.dur = Math.max(ex.dur, b.dur); ex.v = b.v; }
    else this.buffs.push({ ...b, end: nowMs + dur, start: nowMs });
    bus.emit('buffs');
  }

  // ---------- Goldene Noten ----------
  goldInterval() {
    const d = this._dyn || { goldFreq: 1 };
    const f = this.S.goldFreq * (d.goldFreq || 1);
    return rand(150, 420) / f;
  }
  updateGoldens(nowMs) {
    if (this.state.life.clicks < 5 && this.state.run.total < 100) return;
    if (nowMs >= this.nextGolden) {
      this.nextGolden = nowMs + this.goldInterval() * 1000;
      if (typeof document === 'undefined' || document.visibilityState === 'visible') this.spawnGolden();
    }
    if (this.goldens.length) {
      const before = this.goldens.length;
      this.goldens = this.goldens.filter((gn) => gn.born + gn.life * 1000 > nowMs);
      if (this.goldens.length !== before) bus.emit('golden:expire');
    }
  }
  spawnGolden(opts = {}) {
    const gn = {
      id: this.goldSeq++, born: Date.now(), life: (opts.mini ? 3.2 : 13) * this.S.goldLife,
      x: opts.x ?? rand(0.08, 0.92), y: opts.y ?? rand(0.15, 0.85), mini: !!opts.mini,
    };
    this.goldens.push(gn);
    bus.emit('golden:spawn', gn);
    return gn;
  }
  clickGolden(id) {
    const gn = this.goldens.find((x) => x.id === id);
    if (!gn) return null;
    this.goldens = this.goldens.filter((x) => x.id !== id);
    const S = this.S, st = this.state;
    if (gn.mini) {
      const v = Math.max(13, this.npsBase * 6 * S.goldEffect);
      this.addNotes(v, 'golden');
      const res = { id: 'mini', name: '', v, gn };
      bus.emit('golden:click', res);
      return res;
    }
    st.life.golden++;
    const eff = weightedPick(GOLDEN_EFFECTS.filter((e) => !e.req || e.req(this)), (e) => e.w);
    const res = { id: eff.id, name: eff.name, gn };
    const dm = S.goldDur;
    switch (eff.id) {
      case 'frenzy':
        this.addBuff({ id: 'frenzy', name: 'Fortissimo', icon: 'musical-notes', kind: 'prod', v: 7, dur: 77 * dm, desc: 'Produktion ×7' });
        res.text = 'Produktion ×7 für ' + Math.round(77 * dm) + ' Sek.';
        break;
      case 'applause': {
        const v = (Math.min(st.run.notes * 0.12, this.npsBase * 600) + 13) * S.goldEffect * S.applause;
        this.addNotes(v, 'golden'); res.v = v; res.text = '+' + fmt(v) + ' Noten';
        break;
      }
      case 'solo':
        this.addBuff({ id: 'solo', name: 'Virtuosen-Solo', icon: 'piano-keys', kind: 'click', v: 777, dur: 13 * dm, desc: 'Klickkraft ×777' });
        res.text = 'Klickkraft ×777 für ' + Math.round(13 * dm) + ' Sek. – klick, was das Zeug hält!';
        break;
      case 'muse': {
        const base = 2 + Math.floor(Math.log10(Math.max(10, st.run.total)) / 3);
        const v = this.gainInsp(base * S.museMult, 'muse', true);
        res.text = '+' + fmt(v, { dec: 1 }) + ' Inspiration';
        break;
      }
      case 'rain':
        this.startRain();
        res.text = 'Schnell, fang die fallenden Noten!';
        break;
      case 'groove':
        this.grooveLockUntil = Date.now() + 30000 * dm; this.groove = 1;
        this.addBuff({ id: 'groovewave', name: 'Groove-Welle', icon: 'heart-beats', kind: 'none', v: 1, dur: 30 * dm, desc: 'Groove auf Maximum' });
        res.text = 'Voller Groove für ' + Math.round(30 * dm) + ' Sek.';
        break;
      case 'bsolo': {
        const cands = BUILDINGS.filter((b) => this.own(b.id) >= 10);
        const b = pick(cands);
        const v = 1 + this.own(b.id) * 0.1;
        this.addBuff({ id: 'bsolo_' + b.id, name: 'Solo: ' + b.name, icon: b.icon, kind: 'building', b: b.id, v, dur: 30 * dm, desc: `${b.name} ×${fmt(v, { dec: 1 })}` });
        res.name = 'Solo: ' + b.name + '!';
        res.text = `${b.name} ×${fmt(v, { dec: 1 })} für ${Math.round(30 * dm)} Sek.`;
        break;
      }
      case 'encore':
        setTimeout(() => this.spawnGolden(), 400);
        res.text = 'Da kommt schon die nächste!';
        break;
    }
    bus.emit('golden:click', res);
    this.checkUnlocks();
    return res;
  }
  startRain() {
    let n = 0;
    const iv = setInterval(() => {
      this.spawnGolden({ mini: true, x: rand(0.1, 0.9), y: rand(0.1, 0.4) });
      if (++n >= 14) clearInterval(iv);
    }, 420);
  }

  // ---------- Konzerte ----------
  venueUnlocked(v) { return this.own(v.unlock.b) >= v.unlock.n || this.state.discovered['v_' + v.id]; }
  gigSlots() { return Math.max(1, Math.round(this.S.gigSlots)); }
  gigActive(vid) { return this.state.gigs.find((g) => g.venue === vid); }
  gigPreview(vid) {
    const v = VENUE_BY_ID[vid];
    const S = this.S;
    const mode = this.state.mode;
    void mode;
    return {
      dur: v.dur / S.gigSpeed,
      notes: this.npsBase * v.dur * 0.6 * S.gigReward,
      insp: v.insp * S.insp,
      relic: Math.min(0.98, v.relic * S.relicLuck),
    };
  }
  startGig(vid) {
    const v = VENUE_BY_ID[vid];
    if (!v || !this.venueUnlocked(v) || this.gigActive(vid)) return false;
    if (this.state.gigs.length >= this.gigSlots()) return false;
    const p = this.gigPreview(vid);
    const nowMs = Date.now();
    this.state.gigs.push({ key: vid + '_' + nowMs, venue: vid, start: nowMs, end: nowMs + p.dur * 1000, notes: p.notes, insp: v.insp, relic: p.relic });
    this.state.discovered['v_' + vid] = true;
    bus.emit('gig:start', { vid });
    return true;
  }
  claimGig(key) {
    const st = this.state;
    const idx = st.gigs.findIndex((g) => g.key === key);
    if (idx < 0) return null;
    const gig = st.gigs[idx];
    if (gig.end > Date.now()) return null;
    st.gigs.splice(idx, 1);
    this.notifiedGigs.delete(key);
    const v = VENUE_BY_ID[gig.venue];
    this.addNotes(gig.notes, 'gig');
    const insp = this.gainInsp(gig.insp, 'gig', true);
    st.life.gigsDone++;
    let relic = null, relicLevel = 0, relicNew = false;
    if (Math.random() < gig.relic) {
      const r = this.rollRelic(v);
      if (r) {
        const cur = st.relics[r.id] || 0;
        relicNew = cur === 0;
        st.relics[r.id] = Math.min(RELIC_MAX, cur + 1);
        relicLevel = st.relics[r.id];
        relic = r; st.life.relicsFound++;
        this.dirty = true;
      }
    }
    const res = { venue: v, notes: gig.notes, insp, relic, relicLevel, relicNew };
    bus.emit('gig:claim', res);
    return res;
  }
  rollRelic(v) {
    const vi = ERA_BY_ID[v.era].index;
    const pool = RELICS.filter((r) => ERA_BY_ID[r.era].index <= vi && (this.state.relics[r.id] || 0) < RELIC_MAX);
    if (!pool.length) return null;
    return weightedPick(pool, (r) => {
      let w = RARITY[r.rarity].weight;
      if (r.rarity === 'epic' || r.rarity === 'legendary' || r.rarity === 'mythic') w *= 1 + vi * 0.12;
      if (!this.state.relics[r.id]) w *= 1.6; // neue Funde bevorzugen
      return w;
    });
  }

  // ---------- Harmonielehre ----------
  theoryCost(base) { return Math.max(1, Math.ceil(base * this.S.theoryCost)); }
  canBuyCircle(id) { return circleAvailable(id, this.state.theory); }
  buyCircle(id) {
    const n = CIRCLE_BY_ID[id];
    if (!n || !this.canBuyCircle(id)) return false;
    const c = this.theoryCost(n.cost);
    if (this.state.inspiration < c) return false;
    this.state.inspiration -= c;
    this.state.theory[id] = 1;
    this.dirty = true; this.recompute();
    bus.emit('theory', { id });
    return true;
  }
  rhythmAvailable(id) {
    const i = RHYTHM.findIndex((r) => r.id === id);
    if (this.state.theory[id]) return false;
    return i === 0 || !!this.state.theory[RHYTHM[i - 1].id];
  }
  buyRhythm(id) {
    const r = RHYTHM_BY_ID[id];
    if (!r || !this.rhythmAvailable(id)) return false;
    const c = this.theoryCost(r.cost);
    if (this.state.inspiration < c) return false;
    this.state.inspiration -= c;
    this.state.theory[id] = 1;
    this.dirty = true; this.recompute();
    bus.emit('theory', { id });
    return true;
  }
  buyMode(id) {
    const m = MODE_BY_ID[id];
    if (!m || this.state.modesUnlocked[id]) return false;
    const c = this.theoryCost(m.cost);
    if (this.state.inspiration < c) return false;
    this.state.inspiration -= c;
    this.state.modesUnlocked[id] = true;
    this.setMode(id);
    bus.emit('theory', { id });
    return true;
  }
  setMode(id) {
    if (!this.state.modesUnlocked[id]) return false;
    this.state.mode = id;
    this.dirty = true; this.recompute();
    bus.emit('mode', { id });
    return true;
  }

  // ---------- Legenden ----------
  legendCost(id) { return Math.ceil(legendLevelCost(this.legendLevel(id)) * this.S.legendCost); }
  levelUpLegend(id) {
    const L = this.state.legends[id];
    if (!L || L.level >= LEGEND_MAX_LEVEL) return false;
    const c = this.legendCost(id);
    if (this.state.inspiration < c) return false;
    this.state.inspiration -= c;
    L.level++;
    this.dirty = true; this.recompute();
    bus.emit('legend:level', { id, level: L.level });
    return true;
  }
  ensembleSlots() { return Math.max(1, Math.round(this.S.slots)); }
  toggleEnsemble(id) {
    const st = this.state;
    if (!st.legends[id]) return false;
    const i = st.ensemble.indexOf(id);
    if (i >= 0) st.ensemble.splice(i, 1);
    else {
      if (st.ensemble.length >= this.ensembleSlots()) return false;
      st.ensemble.push(id);
      if (id === 'vivaldi') { this.dyn.seasonStart = Date.now(); this.dyn.season = -1; }
      if (id === 'ravel') this.dyn.boleroStart = Date.now();
      if (id === 'stravinsky') this.dyn.sacreNext = 0;
      if (id === 'grieg') this.dyn.mk = 0;
      if (id === 'haydn') this.dyn.surpriseNext = Date.now() + 60000;
    }
    this.dirty = true; this.recompute();
    bus.emit('ensemble', { id });
    return true;
  }

  // ---------- Ruhmeshalle ----------
  hallAvailable(id) {
    const hh = HALL_BY_ID[id];
    return hh && !this.state.hall[id] && hh.req.every((r) => this.state.hall[r]);
  }
  buyHall(id) {
    const hh = HALL_BY_ID[id];
    if (!this.hallAvailable(id) || this.state.royalties < hh.cost) return false;
    this.state.royalties -= hh.cost;
    this.state.hall[id] = 1;
    this.dirty = true; this.recompute();
    bus.emit('hall', { id });
    return true;
  }
  genreUnlocked(gid) { return !!this.state.hall['h_genre_' + gid]; }

  // ---------- Da Capo ----------
  potentialRecords(extraNotes = 0) {
    return Math.floor(Math.pow((this.state.life.notes + extraNotes) / 1e6, 0.25) * this.S.recordGain);
  }
  recordsGain() { return Math.max(0, this.potentialRecords() - this.state.records); }
  notesForNextRecord() {
    const next = this.potentialRecords() + 1;
    const need = Math.pow(next / this.S.recordGain, 4) * 1e6;
    return Math.max(0, need - this.state.life.notes);
  }
  daCapo(genre = null, challenge = null) {
    const gain = this.recordsGain();
    if (gain < 1 && !challenge) return false;
    const st = this.state;
    st.challenge = challenge && CHALLENGE_BY_ID[challenge] && !(st.challengesDone || {})[challenge] ? challenge : null;
    st.records += gain;
    st.royalties += gain;
    st.life.daCapos++;
    const inspBonus = gain > 0 ? Math.floor(2 * Math.log10(gain + 1) + 1) : 0;
    st.run = newRun();
    st.run.genre = genre && this.genreUnlocked(genre) ? genre : null;
    this.buffs = []; this.goldens = [];
    this.groove = 0; this.combo = 0;
    this.dirty = true; this.recompute();
    for (const s of this.S.start) st.run.buildings[s.b] = Math.max(st.run.buildings[s.b] || 0, s.n);
    st.run.notes += this.S.startNotes;
    this.dirty = true; this.recompute();
    if (inspBonus > 0) this.gainInsp(inspBonus, 'dacapo', true);
    this.syncStyle(true);
    bus.emit('dacapo', { gain, inspBonus, genre: st.run.genre });
    return { gain, inspBonus };
  }

  abandonChallenge() {
    if (!this.state.challenge) return;
    this.state.challenge = null;
    this.dirty = true; this.recompute();
    bus.emit('challenge:abort');
  }

  // ---------- Freischaltungen & Auszeichnungen ----------
  checkUnlocks() {
    const st = this.state;
    for (const L of LEGENDS) {
      if (st.legends[L.id]) continue;
      let ok = false;
      try { ok = L.unlock(this); } catch (e) { ok = false; }
      if (ok) {
        st.legends[L.id] = { level: 1 };
        this.dirty = true;
        if (st.ensemble.length < this.ensembleSlots()) st.ensemble.push(L.id);
        bus.emit('legend:unlock', { id: L.id });
      }
    }
    // Epochen
    const ei = this.eraIndex();
    for (let i = 0; i <= ei; i++) {
      const e = ERAS[i];
      if (!st.discovered['e_' + e.id] && BUILDINGS.some((b) => b.era === e.id && this.own(b.id) > 0)) {
        st.discovered['e_' + e.id] = true;
        if (i > 0) bus.emit('era:new', { era: e });
      }
    }
  }
  checkAchievements() {
    const st = this.state;
    let n = 0;
    for (const a of ACHIEVEMENTS) {
      if (st.achievements[a.id]) continue;
      let ok = false;
      try { ok = a.check(this); } catch (e) { ok = false; }
      if (ok) {
        st.achievements[a.id] = Date.now();
        n++;
        this.gainInsp(1, 'achievement', true);
        bus.emit('achievement', { a });
      }
    }
    if (n) { this.dirty = true; }
  }
  onEraChange() {
    this.checkUnlocks();
    this.syncStyle();
  }

  lexiconComplete() {
    const st = this.state;
    return BUILDINGS.every((b) => st.discovered['b_' + b.id]) && LEGENDS.every((l) => st.legends[l.id]) &&
      RELICS.every((r) => st.relics[r.id]) && MELODIES.every((m) => st.melodies[m.id]);
  }

  // ---------- Übungsklavier ----------
  pianoNote(midi) {
    const nowMs = Date.now();
    if (nowMs - this.pianoLast > 3500) this.pianoBuffer = [];
    this.pianoLast = nowMs;
    this.pianoBuffer.push(midi);
    if (this.pianoBuffer.length > 24) this.pianoBuffer.shift();
    const m = matchMelody(this.pianoBuffer, this.state.melodies);
    if (m) {
      this.state.melodies[m.id] = Date.now();
      this.pianoBuffer = [];
      const v = this.gainInsp(m.insp, 'melody', true);
      bus.emit('melody', { m, insp: v });
      this.checkAchievements();
    }
    return m;
  }

  // ---------- Offline ----------
  offlineProgress(sec) {
    if (sec < 10) return null;
    if (this.dirty) this.recompute();
    const S = this.S;
    const cap = S.offlineCap * 3600;
    const eff = S.offline * S.offlineX;
    const used = Math.min(sec, cap);
    let mult = S.idle * S.idle60;
    if (S.silence > 0 && used >= 273) mult *= S.silence;
    const gain = this.npsBase * used * eff * mult;
    this.addNotes(gain, 'offline');
    this.state.run.playTime += 0; // Offline zählt nicht als Spielzeit
    return { sec, used, gain, eff: eff * mult, capped: sec > cap };
  }
}
