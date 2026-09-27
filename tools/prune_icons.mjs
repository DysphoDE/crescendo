// Entfernt ungenutzte Icons aus js/data/icons.js (sucht alle String-Literale im Code)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { ICONS } from '../js/data/icons.js';
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith('.js') && !p.endsWith('icons.js')) files.push(p); } })('js');
const used = new Set();
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/'([a-z0-9-]+)'/g)) if (ICONS[m[1]]) used.add(m[1]);
  for (const m of s.matchAll(/"([a-z0-9-]+)"/g)) if (ICONS[m[1]]) used.add(m[1]);
}
used.add('musical-notes');
const out = {};
for (const k of Object.keys(ICONS).sort()) if (used.has(k)) out[k] = ICONS[k];
const head = readFileSync('js/data/icons.js', 'utf8').split('\n').filter((l) => l.startsWith('//')).join('\n');
writeFileSync('js/data/icons.js', head + '\nexport const ICONS = ' + JSON.stringify(out, null, 0) + ';\n');
console.log('kept', Object.keys(out).length, 'of', Object.keys(ICONS).length);
