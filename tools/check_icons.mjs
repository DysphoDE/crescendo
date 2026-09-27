// Prüft, ob alle im Code verwendeten Icon-Namen existieren
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { ICONS } from '../js/data/icons.js';
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith('.js') && !p.endsWith('icons.js')) files.push(p); } })('js');
const used = new Set();
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/icon(?:2)?:\s*'([a-z0-9-]+)'/g)) used.add(m[1]);
  for (const m of s.matchAll(/icon\(\s*'([a-z0-9-]+)'/g)) used.add(m[1]);
  for (const m of s.matchAll(/iconEl\(\s*'([a-z0-9-]+)'/g)) used.add(m[1]);
  for (const m of s.matchAll(/\[\s*'([a-z0-9-]+)'\s*,\s*'([a-z0-9-]+)'\s*,\s*'([a-z0-9-]+)'\s*,\s*'([a-z0-9-]+)'\s*\]\[idx\]/g)) for (let i = 1; i <= 4; i++) used.add(m[i]);
}
// Icons aus Daten (dynamisch)
const mods = ['buildings', 'upgrades', 'legends', 'relics', 'venues', 'genres', 'hall', 'achievements', 'eras'];
for (const m of mods) {
  const mod = await import(`../js/data/${m}.js`);
  for (const v of Object.values(mod)) if (Array.isArray(v)) for (const it of v) { if (it && it.icon) used.add(it.icon); if (it && it.icon2) used.add(it.icon2); }
}
const missing = [...used].filter((n) => !ICONS[n]);
console.log('used', used.size, 'missing:', missing.join(' ') || '(none)');
const unused = Object.keys(ICONS).filter((k) => !used.has(k));
console.log('unused', unused.length);
