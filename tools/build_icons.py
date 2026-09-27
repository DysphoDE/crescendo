#!/usr/bin/env python3
"""Baut js/data/icons.js aus einem Ordner mit game-icons.net-SVGs (CC BY 3.0)."""
import re, sys, os, json
src = sys.argv[1]
skip = set()  # Badge-Varianten mit Kreis-Hintergrund
out = {}
for fn in sorted(os.listdir(src)):
    if not fn.endswith('.svg'): continue
    name = fn[:-4]
    if name in skip: continue
    s = open(os.path.join(src, fn)).read()
    m = re.search(r'<svg[^>]*>(.*)</svg>', s, re.S)
    inner = m.group(1)
    inner = inner.replace('<path d="M0 0h512v512H0z"/>', '')
    inner = re.sub(r'\sfill="#(?:fff|000)"', '', inner)
    inner = re.sub(r'\s+', ' ', inner).strip()
    out[name] = inner
with open('js/data/icons.js', 'w') as f:
    f.write('// Icons: game-icons.net (CC BY 3.0) – Autoren: Lorc, Delapouite, Skoll, Caro Asercion, Zajkonur u.a.\n')
    f.write('// Laute & Stimmgabel: eigene Zeichnungen.\n')
    f.write('export const ICONS = ' + json.dumps(out, ensure_ascii=False, indent=0) + ';\n')
print(len(out), 'icons,', os.path.getsize('js/data/icons.js')//1024, 'KB')
