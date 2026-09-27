// Spielzustand: Standardwerte, Speichern, Laden, Export/Import
import { b64encode, b64decode } from './util.js';

export const SAVE_KEY = 'crescendo-save-v1';
export const SAVE_VERSION = 1;

export function newRun() {
  return {
    notes: 0, total: 0, handmade: 0, clicks: 0,
    buildings: {}, upgrades: {},
    startTime: Date.now(), playTime: 0,
    milestone: 2, genre: null,
    bestNps: 0,
  };
}

export function defaultState() {
  const t = Date.now();
  return {
    version: SAVE_VERSION,
    created: t, lastTick: t, lastSave: t,
    run: newRun(),
    life: {
      notes: 0, clicks: 0, handmade: 0, golden: 0, daCapos: 0, playTime: 0,
      bestNps: 0, maxCombo: 0, perfectHits: 0, goodHits: 0, offbeatHits: 0, crits: 0, bestCps: 0,
      gigsDone: 0, inspEarned: 0, buildingsBought: 0, upgradesBought: 0, bestPerfectStreak: 0,
      relicsFound: 0, sessionStart: t,
    },
    inspiration: 0,
    records: 0,
    royalties: 0,
    hall: {},
    theory: {},
    mode: 'ionian',
    modesUnlocked: { ionian: true },
    legends: {},
    ensemble: [],
    relics: {},
    gigs: [],
    challenge: null,
    challengesDone: {},
    achievements: {},
    melodies: {},
    discovered: {},
    seen: {},
    settings: {
      master: 0.8, music: 0.55, sfx: 0.7, musicOn: true, sfxOn: true,
      numbers: 'words', particles: 'high', reduceMotion: false, latency: 0,
      key: 'C', skin: 'vinyl', clickInstr: 'auto', style: 'auto',
      bgAudio: false, buyAmount: 1, ticker: true, confirmDaCapo: true, autoClaim: false, metronome: false,
    },
    flags: {
      tutorial: {}, silence433: false, logoClicks: 0, volumeTouched: false, muted: false,
      calibrated: false, seasons: 0, boleroDone: false, sacreMax: false, seasonsSeen: {},
    },
  };
}

function deepMerge(base, data) {
  if (data === null || data === undefined) return base;
  if (typeof base !== 'object' || base === null || Array.isArray(base)) return data;
  const out = { ...base };
  for (const k of Object.keys(data)) {
    const bv = base[k], dv = data[k];
    if (bv && typeof bv === 'object' && !Array.isArray(bv) && dv && typeof dv === 'object' && !Array.isArray(dv)) {
      out[k] = deepMerge(bv, dv);
    } else out[k] = dv;
  }
  return out;
}

export function migrate(data) {
  const st = deepMerge(defaultState(), data);
  // Bereinigung
  if (!Array.isArray(st.ensemble)) st.ensemble = [];
  if (!Array.isArray(st.gigs)) st.gigs = [];
  for (const k of ['notes', 'total', 'handmade']) if (!Number.isFinite(st.run[k])) st.run[k] = 0;
  if (!Number.isFinite(st.inspiration)) st.inspiration = 0;
  st.version = SAVE_VERSION;
  return st;
}

export const BACKUP_KEY = SAVE_KEY + '-sicherung';
let lastBackup = 0;

export function saveToStorage(state) {
  try {
    state.lastSave = Date.now();
    const json = JSON.stringify(state);
    localStorage.setItem(SAVE_KEY, json);
    // Alle 5 Minuten eine Sicherheitskopie
    if (Date.now() - lastBackup > 300000) {
      lastBackup = Date.now();
      localStorage.setItem(BACKUP_KEY, json);
    }
    return true;
  } catch (e) {
    console.warn('Speichern fehlgeschlagen', e);
    return false;
  }
}

export function loadFromStorage() {
  let raw = null;
  try {
    raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch (e) {
    console.warn('Laden fehlgeschlagen', e);
    // Beschädigten Stand nicht verlieren: wegsichern und Sicherheitskopie versuchen
    try {
      if (raw) localStorage.setItem(SAVE_KEY + '-beschaedigt-' + Date.now(), raw);
      const bak = localStorage.getItem(BACKUP_KEY);
      if (bak) return migrate(JSON.parse(bak));
    } catch (e2) { /* ignorieren */ }
    return null;
  }
}

export function loadBackup() {
  try {
    const bak = localStorage.getItem(BACKUP_KEY);
    return bak ? migrate(JSON.parse(bak)) : null;
  } catch (e) { return null; }
}

export function exportSave(state) {
  return 'CRESCENDO1:' + b64encode(JSON.stringify(state));
}

export function importSave(str) {
  str = (str || '').trim();
  if (str.startsWith('CRESCENDO1:')) str = str.slice(11);
  const data = JSON.parse(b64decode(str));
  if (!data || typeof data !== 'object' || !data.run) throw new Error('Ungültiger Spielstand');
  return migrate(data);
}

export function clearStorage() {
  try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(BACKUP_KEY); } catch (e) { /* ignorieren */ }
}
