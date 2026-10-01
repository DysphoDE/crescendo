// Zahlen- und Zeitformatierung (Deutsch, lange Skala)

const LONG_SING = [];
const LONG_PLUR = [];
const SHORT = [];
(() => {
  const roots = ['M', 'B', 'Tr', 'Quadr', 'Quint', 'Sext', 'Sept', 'Okt', 'Non', 'Dez',
    'Undez', 'Duodez', 'Tredez', 'Quattuordez', 'Quindez', 'Sedez', 'Septendez', 'Dodevigint', 'Undevigint', 'Vigint'];
  const shortRoots = ['Mio', 'Bio', 'Trio', 'Quadr', 'Quint', 'Sext', 'Sept', 'Okt', 'Non', 'Dez',
    'Udez', 'Ddez', 'Tdez', 'Qadez', 'Qidez', 'Sdez', 'Spdez', 'Odez', 'Ndez', 'Vig'];
  roots.forEach((r, i) => {
    const base = (i === 0 ? 'Mill' : r + 'ill');
    LONG_SING.push(base + 'ion'); LONG_PLUR.push(base + 'ionen');
    LONG_SING.push(base + 'iarde'); LONG_PLUR.push(base + 'iarden');
    SHORT.push(shortRoots[i] + '.');
    SHORT.push(i === 0 ? 'Mrd.' : i === 1 ? 'Brd.' : i === 2 ? 'Trd.' : shortRoots[i] + 'd.');
  });
})();

export const numberFormat = { mode: 'words' }; // 'words' | 'short' | 'sci'

const deInt = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const de1 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
const de2 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
const de1f = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const de2f = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

function sci(n, digits = 2) {
  if (n === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(n)));
  const m = n / Math.pow(10, e);
  return m.toFixed(digits).replace('.', ',') + 'e' + e;
}

/**
 * fmt(n, opts)
 *  opts.dec: Nachkommastellen für kleine Zahlen (Standard 0)
 *  opts.short: erzwingt Kurzform
 */
export function fmt(n, opts = {}) {
  if (n === undefined || n === null || Number.isNaN(n)) return '0';
  if (!Number.isFinite(n)) return n > 0 ? '∞' : '-∞';
  const neg = n < 0; if (neg) n = -n;
  let s;
  const mode = opts.short && numberFormat.mode === 'words' ? 'short' : numberFormat.mode;
  if (n < 1e6) {
    if (n < 100 && opts.dec) s = (opts.dec >= 2 ? de2 : de1).format(Math.floor(n * 100) / 100);
    else s = deInt.format(Math.floor(n));
  } else if (mode === 'sci') {
    s = sci(n, 2);
  } else {
    const group = Math.floor(Math.log10(n) / 3); // 2 = Million
    const idx = group - 2;
    if (idx >= LONG_SING.length) s = sci(n, 2);
    else {
      const v = n / Math.pow(10, group * 3);
      if (mode === 'short') {
        s = (v >= 100 ? de1.format(Math.floor(v * 10) / 10) : de2.format(Math.floor(v * 100) / 100)) + ' ' + SHORT[idx];
      } else {
        // Höchstens 2 Nachkommastellen ohne angehängte Nullen – "4,003" sähe aus wie viertausendunddrei
        const vs = v >= 100 ? de1.format(Math.floor(v * 10) / 10) : de2.format(Math.floor(v * 100) / 100);
        s = vs + ' ' + (vs === '1' ? LONG_SING[idx] : LONG_PLUR[idx]);
      }
    }
  }
  return neg ? '-' + s : s;
}

/** Zerlegt eine Zahl in Ziffern und Zahlwort (für den großen Zähler) */
export function fmtParts(n) {
  if (numberFormat.mode !== 'words' || n < 1e6 || !Number.isFinite(n)) return { num: fmt(n), word: '' };
  const group = Math.floor(Math.log10(n) / 3);
  const idx = group - 2;
  if (idx >= LONG_SING.length) return { num: fmt(n), word: '' };
  const v = n / Math.pow(10, group * 3);
  // Feste Stellenzahl, damit der große Zähler nicht springt
  const vs = v >= 100 ? de1f.format(Math.floor(v * 10) / 10) : de2f.format(Math.floor(v * 100) / 100);
  return { num: vs, word: vs === '1,00' ? LONG_SING[idx] : LONG_PLUR[idx] };
}

/** Kompakte Form (für Buttons, Kosten) */
export function fmtS(n, dec = 0) { return fmt(n, { short: true, dec }); }

export function fmtPct(x, dec = 0) {
  // x = 0.25 -> "+25 %"
  const v = x * 100;
  const f = dec ? de1 : deInt;
  return (v >= 0 ? '+' : '') + f.format(v) + ' %';
}

export function fmtMult(x) {
  if (x >= 1e6) return '×' + fmtS(x);
  return '×' + (x >= 100 ? deInt.format(x) : de2.format(Math.round(x * 100) / 100));
}

export function fmtDec(x, d = 1) { return (d === 2 ? de2f : de1).format(x); }

export function fmtTime(sec, opts = {}) {
  sec = Math.max(0, Math.floor(sec));
  const d = Math.floor(sec / 86400); sec -= d * 86400;
  const h = Math.floor(sec / 3600); sec -= h * 3600;
  const m = Math.floor(sec / 60); const s = sec - m * 60;
  if (opts.clock) {
    const pad = (x) => String(x).padStart(2, '0');
    if (d || h) return (d ? d + 'd ' : '') + pad(h) + ':' + pad(m) + ':' + pad(s);
    return pad(m) + ':' + pad(s);
  }
  const parts = [];
  if (d) parts.push(d + ' Tg.');
  if (h) parts.push(h + ' Std.');
  if (m && parts.length < 2) parts.push(m + ' Min.');
  if ((s && parts.length < 2) || parts.length === 0) parts.push(s + ' Sek.');
  return parts.join(' ');
}

export function roman(n) {
  const map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let r = '';
  for (const [v, s] of map) while (n >= v) { r += s; n -= v; }
  return r;
}
