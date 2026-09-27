// UI-Grundbausteine: Icons, Porträts, Tooltips, Toasts, Dialoge
import { ICONS } from '../data/icons.js';
import { h, clear, isTouch } from '../core/util.js';

export function icon(name, cls = '') {
  const inner = ICONS[name] || ICONS['musical-notes'];
  return `<svg class="ic ${cls}" viewBox="0 0 512 512" aria-hidden="true">${inner}</svg>`;
}
export function iconEl(name, cls = '') {
  const t = document.createElement('template');
  t.innerHTML = icon(name, cls);
  return t.content.firstChild;
}
export function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Porträt einer Legende (Foto oder Icon-Karte)
export function portraitHTML(L, { locked = false, size = '' } = {}) {
  const cls = `portrait ${size} ${L.icon ? 'icon' : ''} ${locked ? 'lock' : ''}`;
  if (L.icon) {
    const col = L.color || ({ band: '#7d4dff', star: '#ff5fa2' }[L.type]) || '#7d4dff';
    return `<div class="${cls}" style="--c:${col}">${locked ? '<span class="qm">?</span>' : icon(L.icon)}</div>`;
  }
  return `<div class="${cls}">${locked ? '<span class="qm">?</span>' : ''}<img src="assets/portraits/${L.id}.jpg" alt="" loading="lazy" draggable="false"></div>`;
}

// ---------------- Tooltip ----------------
const tip = { el: null, builders: {}, cur: null, x: 0, y: 0, timer: null, touchTimer: null };
export function registerTip(kind, fn) { tip.builders[kind] = fn; }
function tipHTML(key) {
  const i = key.indexOf(':');
  const kind = i < 0 ? key : key.slice(0, i), arg = i < 0 ? '' : key.slice(i + 1);
  const fn = tip.builders[kind];
  return fn ? fn(arg) : '';
}
function place() {
  const el = tip.el; if (!el) return;
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  let x = tip.x + 16, y = tip.y + 16;
  if (x + r.width > vw - 8) x = tip.x - r.width - 16;
  if (x < 8) x = 8;
  if (y + r.height > vh - 8) y = vh - r.height - 8;
  if (y < 8) y = 8;
  el.style.left = x + 'px'; el.style.top = y + 'px';
}
export function showTip(key, x, y) {
  tip.cur = key; tip.x = x; tip.y = y;
  const html = tipHTML(key);
  if (!html) { hideTip(); return; }
  tip.el.innerHTML = html;
  tip.el.classList.add('show');
  place();
}
export function hideTip() { tip.cur = null; tip.el?.classList.remove('show'); }
export function refreshTip() {
  if (!tip.cur) return;
  const html = tipHTML(tip.cur);
  if (html && tip.el._last !== html) { tip.el._last = html; tip.el.innerHTML = html; place(); }
}
export function initTooltips() {
  tip.el = document.getElementById('tooltip');
  const touch = isTouch();
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType === 'touch') return;
    const t = e.target.closest('[data-tip]');
    if (t) showTip(t.dataset.tip, e.clientX, e.clientY);
    else if (tip.cur) hideTip();
  });
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' || !tip.cur) return;
    tip.x = e.clientX; tip.y = e.clientY; place();
  });
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    hideTip();
    const t = e.target.closest('[data-tip]');
    clearTimeout(tip.touchTimer);
    if (t) {
      const x = e.clientX, y = e.clientY;
      tip.touchTimer = setTimeout(() => { showTip(t.dataset.tip, x, y - 60); tip.longPressed = true; }, 450);
    }
  }, { passive: true });
  const cancel = () => clearTimeout(tip.touchTimer);
  document.addEventListener('pointerup', cancel, { passive: true });
  document.addEventListener('pointercancel', cancel, { passive: true });
  document.addEventListener('scroll', () => { cancel(); if (touch) hideTip(); }, true);
  // Nach Long-Press den Klick unterdrücken
  document.addEventListener('click', (e) => {
    if (tip.longPressed) { tip.longPressed = false; e.stopPropagation(); e.preventDefault(); }
  }, true);
}

// ---------------- Toasts ----------------
export function toast({ title, text = '', icon: ic = 'musical-notes', kind = '', kicker = '', img = null, time = 5200, rc }) {
  const root = document.getElementById('toasts');
  const el = h('div.toast' + (kind ? '.' + kind : ''));
  if (rc) el.style.setProperty('--rc', rc);
  el.innerHTML = `<div class="t-ic">${img ? `<img src="${img}" alt="">` : icon(ic)}</div>
    <div class="t-body">${kicker ? `<div class="t-kicker">${esc(kicker)}</div>` : ''}<div class="t-title">${esc(title)}</div>${text ? `<div class="t-text">${text}</div>` : ''}</div>`;
  const close = () => { if (el._closed) return; el._closed = true; el.classList.add('out'); setTimeout(() => el.remove(), 360); };
  el.addEventListener('click', close);
  root.prepend(el);
  while (root.children.length > 4) root.lastChild.remove();
  setTimeout(close, time);
  return el;
}

// ---------------- Dialoge ----------------
let modalStack = [];
export function modal({ title = '', body = '', actions = [], wide = false, onClose, closable = true, cls = '' }) {
  const root = document.getElementById('modalRoot');
  const back = h('div.modal-back');
  const box = h('div.modal' + (wide ? '.wide' : '') + (cls ? '.' + cls : ''), { role: 'dialog', 'aria-modal': 'true' });
  if (title) box.appendChild(h('h2', { html: title }));
  const bodyEl = h('div.m-body');
  if (typeof body === 'string') bodyEl.innerHTML = body; else if (body) bodyEl.appendChild(body);
  box.appendChild(bodyEl);
  const close = (val) => {
    if (!wrap.isConnected) return;
    wrap.remove();
    modalStack = modalStack.filter((m) => m !== wrap);
    if (!modalStack.length) root.classList.remove('open');
    onClose?.(val);
  };
  if (closable) {
    const x = h('button.m-close', { type: 'button', 'aria-label': 'Schließen', html: '✕' });
    x.addEventListener('click', () => close());
    box.appendChild(x);
    back.addEventListener('click', () => close());
  }
  if (actions.length) {
    const act = h('div.m-actions');
    for (const a of actions) {
      const b = h('button.btn' + (a.cls ? '.' + a.cls.split(' ').join('.') : ''), { type: 'button', html: a.label });
      b.addEventListener('click', () => { const r = a.onClick?.(); if (r !== false) close(a.value); });
      act.appendChild(b);
    }
    box.appendChild(act);
  }
  const wrap = h('div', { style: { position: 'absolute', inset: '0' } }, back, box);
  root.appendChild(wrap);
  root.classList.add('open');
  modalStack.push(wrap);
  return { close, el: box, body: bodyEl };
}
export function closeAllModals() {
  const root = document.getElementById('modalRoot');
  clear(root); modalStack = []; root.classList.remove('open');
}
export function modalOpen() { return modalStack.length > 0; }

export function confirmModal(title, text, okLabel = 'OK', cls = 'primary') {
  return new Promise((res) => {
    modal({
      title, body: `<p class="lore">${text}</p>`,
      actions: [{ label: 'Abbrechen', onClick: () => res(false) }, { label: okLabel, cls, onClick: () => res(true) }],
      onClose: () => res(false),
    });
  });
}
