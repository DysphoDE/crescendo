// Ruhm: Da Capo (Prestige) und Ruhmeshalle
import { HALL, HALL_CATS, HALL_BY_ID, SKINS } from '../../data/hall.js';
import { GENRES, GENRE_BY_ID } from '../../data/genres.js';
import { fmt, fmtS, fmtPct } from '../../core/format.js';
import { icon, esc, modal, confirmModal } from '../dom.js';
import { CHALLENGES, CHALLENGE_BY_ID } from '../../data/challenges.js';

export class FamePanel {
  constructor(app) { this.app = app; }
  get g() { return this.app.game; }

  mount(el) {
    this.el = el;
    el.addEventListener('click', (e) => this.onClick(e));
    this.render();
  }
  onEvent() { this.render(); }
  update() {
    if (!this.el?.isConnected) return;
    const g = this.g;
    const gain = g.recordsGain();
    const gEl = this.el.querySelector('#fm-gain');
    if (gEl) gEl.textContent = fmt(gain);
    const nEl = this.el.querySelector('#fm-next');
    if (nEl) nEl.textContent = fmtS(g.notesForNextRecord());
    const btn = this.el.querySelector('[data-act="dacapo"]');
    if (btn) btn.disabled = gain < 1;
    const pr = this.el.querySelector('#fm-prog');
    if (pr) {
      const cur = g.potentialRecords();
      const a = Math.pow(cur / g.S.recordGain, 4) * 1e6, b = Math.pow((cur + 1) / g.S.recordGain, 4) * 1e6;
      pr.style.width = (Math.max(0, Math.min(1, (g.state.life.notes - a) / (b - a))) * 100).toFixed(1) + '%';
    }
    for (const b of this.el.querySelectorAll('[data-roy]')) b.disabled = g.state.royalties < Number(b.dataset.roy) || b.dataset.avail === '0';
  }

  onClick(e) {
    const t = e.target.closest('[data-act]'); if (!t) return;
    const g = this.g, a = this.app;
    if (t.dataset.act === 'dacapo') this.openDaCapo();
    else if (t.dataset.act === 'hall') {
      if (g.buyHall(t.dataset.id)) { a.audio.sfx('upgrade'); a.burstAt(t, '★'); this.render(); } else a.audio.sfx('error');
    } else if (t.dataset.act === 'challenge') {
      this.startChallenge(t.dataset.id);
    } else if (t.dataset.act === 'abandon') {
      confirmModal('Wettbewerb aufgeben?', 'Die Einschränkungen enden sofort, aber du erhältst keine Belohnung. Du kannst den Wettbewerb später erneut versuchen.', 'Aufgeben', 'danger').then((ok) => { if (ok) { g.abandonChallenge(); this.render(); } });
    } else if (t.dataset.act === 'skin') {
      g.state.settings.skin = t.dataset.id; a.stage.setSkin(t.dataset.id); a.audio.sfx('open'); this.render();
    }
  }

  openDaCapo() {
    const g = this.g;
    const gain = g.recordsGain();
    if (gain < 1) return;
    const genres = GENRES.filter((x) => g.genreUnlocked(x.id));
    let sel = g.state.run.genre && g.genreUnlocked(g.state.run.genre) ? g.state.run.genre : null;
    const body = document.createElement('div');
    const renderBody = () => {
      body.innerHTML = `<p class="lore">Der Vorhang fällt. Du beginnst noch einmal ganz von vorn – am Lagerfeuer. Deine Noten, Instrumente und Verbesserungen verklingen. Doch dein <b class="gold">Ruhm</b> bleibt: Legenden, Harmonielehre, Raritäten, Auszeichnungen und Inspiration nimmst du mit.</p>
        <div class="fame-hero" style="margin:12px 0"><div class="fame-stat"><div class="fs-val gold">+${fmt(gain)}</div><div class="fs-lbl">Goldene Schallplatten</div></div>
        <div class="fame-stat"><div class="fs-val" style="color:#ffb4e6">+${fmt(gain)}</div><div class="fs-lbl">Tantiemen</div></div>
        <div class="fame-stat"><div class="fs-val insp">+${fmt(Math.floor(2 * Math.log10(gain + 1) + 1))}</div><div class="fs-lbl">Inspiration</div></div></div>
        <div class="muted" style="font-size:13px">Neuer Produktionsbonus: ${fmtPct(g.state.records * g.S.recordBonus)} → <b class="gold">${fmtPct((g.state.records + gain) * g.S.recordBonus)}</b></div>
        ${genres.length ? `<div class="h3">${icon('headphones')} Genre für den nächsten Durchgang</div><div class="genre-pick">
          <button class="genre-opt ${sel === null ? 'sel' : ''}" data-genre=""><div class="go-name">${icon('musical-notes')} Freie Wahl</div><div class="go-text">Kein Genre – die Musik folgt den Epochen.</div></button>
          ${genres.map((x) => `<button class="genre-opt ${sel === x.id ? 'sel' : ''}" data-genre="${x.id}" style="--c:${x.color}"><div class="go-name" style="color:${x.color}">${icon(x.icon)} ${esc(x.name)}</div><div class="go-text">${esc(x.text)}</div></button>`).join('')}
        </div>` : '<p class="muted" style="font-size:13px">Tipp: In der Ruhmeshalle kannst du Genres freischalten, die einen Durchgang völlig verändern.</p>'}`;
    };
    renderBody();
    body.addEventListener('click', (e) => {
      const b = e.target.closest('[data-genre]'); if (!b) return;
      sel = b.dataset.genre || null; renderBody(); this.app.audio.sfx('tab');
    });
    modal({
      title: 'Da Capo – noch einmal von vorn', body, wide: true,
      actions: [{ label: 'Noch nicht' }, { label: `${icon('anticlockwise-rotation')} Da Capo!`, cls: 'primary', onClick: () => { this.app.doDaCapo(sel); } }],
    });
  }

  startChallenge(id) {
    const g = this.g, c = CHALLENGE_BY_ID[id];
    const gain = g.recordsGain();
    confirmModal(`Wettbewerb: ${esc(c.name)}`, `<b>Regel:</b> ${esc(c.rule)}<br><b>Ziel:</b> Erspiele ${fmt(c.goal, { trim: true })} Noten in diesem Durchgang.<br><b>Belohnung:</b> <span class="good">${esc(c.reward)}</span><br><br>Der Wettbewerb startet mit einem Da Capo${gain > 0 ? ` – du erhältst dabei ${fmt(gain)} Goldene Schallplatten` : ''}. Legenden, Wissen und Raritäten behältst du wie immer.`, 'Wettbewerb starten').then((ok) => {
      if (ok) this.app.doDaCapo(null, id);
    });
  }

  challengesHTML() {
    const g = this.g, st = g.state;
    const done = st.challengesDone || {};
    let html = `<div class="h3" style="margin-top:22px">${icon('podium-winner')} Wettbewerbe <span class="count">${Object.keys(done).length} / ${CHALLENGES.length}</span></div><p class="sec-sub" style="margin-top:0">Besondere Durchgänge mit strengen Regeln. Wer das Ziel erreicht, erhält einen dauerhaften Bonus.</p><div class="hall-grid">`;
    for (const c of CHALLENGES) {
      const isDone = !!done[c.id], active = st.challenge === c.id, avail = st.life.daCapos >= c.need;
      let right;
      if (isDone) right = '<span class="tag gold">✓ Gewonnen</span>';
      else if (active) right = `<button class="btn tiny danger" data-act="abandon">Aufgeben</button>`;
      else if (!avail) right = `<span class="tag">${icon('lock')} ${c.need}× Da Capo</span>`;
      else right = `<button class="btn tiny primary" data-act="challenge" data-id="${c.id}" ${st.challenge ? 'disabled' : ''}>Antreten</button>`;
      const prog = active ? `<div class="progress gold" style="margin-top:6px"><i style="width:${Math.min(100, Math.log10(st.run.total + 1) / Math.log10(c.goal) * 100).toFixed(1)}%"></i></div>` : '';
      html += `<div class="hall-item ${isDone ? 'owned' : avail ? '' : 'locked'}" style="flex-direction:column"><div class="row" style="width:100%;align-items:flex-start"><div class="ico-box sm" style="--c:${isDone ? '#f3b23a' : active ? '#5aa8ff' : '#6b5bb0'}">${icon(c.icon)}</div>
        <div style="flex:1;min-width:0"><div class="hi-name">${esc(c.name)}</div><div class="hi-text">${esc(c.rule)}</div><div class="hi-text">Ziel: <b>${fmt(c.goal, { trim: true })}</b> Noten · Belohnung: <span class="good">${esc(c.reward)}</span></div>${prog}</div>${right}</div></div>`;
    }
    return html + '</div>';
  }

  render() {
    if (!this.el?.isConnected) return;
    const g = this.g, st = g.state;
    const gain = g.recordsGain();
    const recBonus = st.records * g.S.recordBonus;
    const recommend = Math.max(10, Math.ceil(st.records * 0.5));
    let html = `<div class="sec-title">${icon('compact-disc')}<h2>Ruhm</h2></div>
      <div class="fame-hero">
        <div class="fame-stat"><div class="fs-val gold">${fmt(st.records)}</div><div class="fs-lbl">Goldene Schallplatten · ${fmtPct(recBonus)} Produktion</div></div>
        <div class="fame-stat"><div class="fs-val" style="color:#ffb4e6">${fmt(Math.floor(st.royalties))}</div><div class="fs-lbl">Tantiemen</div></div>
        <div class="fame-stat"><div class="fs-val">${fmt(st.life.daCapos)}</div><div class="fs-lbl">Da-Capo-Durchgänge</div></div>
      </div>
      <div class="dacapo-card"><div class="dc-sign">𝄊</div><div style="flex:1;min-width:220px">
        <h3 style="font-size:20px;color:var(--gold)">Da Capo</h3>
        <div class="muted" style="font-size:13.5px">„Von vorn“: Beginne einen neuen Durchgang und erhalte Goldene Schallplatten für alle Noten, die du je gespielt hast. Jede Schallplatte gibt dauerhaft <b>+${fmt(g.S.recordBonus * 100, { dec: 1 })} %</b> Produktion.</div>
        <div class="row" style="margin-top:10px;gap:14px;flex-wrap:wrap"><div>Jetzt: <b class="gold big-number" style="font-size:22px" id="fm-gain">${fmt(gain)}</b> Schallplatten</div><div class="muted" style="font-size:12.5px">Nächste in <span id="fm-next">${fmtS(g.notesForNextRecord())}</span> Noten</div></div>
        <div class="progress gold" style="margin-top:8px"><i id="fm-prog"></i></div>
        ${gain > 0 && gain < recommend ? `<div class="muted" style="font-size:12.5px;margin-top:6px">Empfehlung: Warte, bis du mindestens ${fmt(recommend)} Schallplatten erhältst – dann lohnt sich der Neustart richtig.</div>` : ''}
      </div><button class="btn primary" data-act="dacapo" ${gain < 1 ? 'disabled' : ''}>${icon('anticlockwise-rotation')} Da Capo</button></div>`;

    if (st.life.daCapos >= 2 || st.challenge) html += this.challengesHTML();
    if (st.records > 0 || st.royalties > 0) {
      html += `<div class="h3" style="margin-top:22px">${icon('laurels')} Ruhmeshalle <span class="count">Tantiemen: ${fmt(Math.floor(st.royalties))}</span></div><p class="sec-sub" style="margin-top:0">Dauerhafte Verbesserungen für alle kommenden Durchgänge.</p>`;
      for (const cat of HALL_CATS) {
        const items = HALL.filter((x) => x.cat === cat);
        if (cat === 'Schallplatten') continue;
        html += `<div class="h3" style="font-size:13.5px">${esc(cat)}<span class="count">${items.filter((x) => st.hall[x.id]).length} / ${items.length}</span></div><div class="hall-grid">`;
        for (const it of items) html += this.hallItem(it);
        html += '</div>';
      }
      // Kosmetik
      const skins = HALL.filter((x) => x.cat === 'Schallplatten');
      html += `<div class="h3" style="font-size:13.5px">Schallplatten-Designs</div><div class="hall-grid">`;
      html += `<div class="hall-item owned"><div class="ico-box sm" style="--c:#222">${icon('disc')}</div><div style="flex:1"><div class="hi-name">Schwarzes Vinyl</div><div class="hi-text">Der Klassiker.</div></div>${st.settings.skin === 'vinyl' ? '<span class="tag gold">aktiv</span>' : `<button class="btn tiny" data-act="skin" data-id="vinyl">Wählen</button>`}</div>`;
      for (const it of skins) {
        if (st.hall[it.id]) html += `<div class="hall-item owned"><div class="ico-box sm">${icon(it.icon)}</div><div style="flex:1"><div class="hi-name">${esc(it.name)}</div><div class="hi-text">${esc(it.text)}</div></div>${st.settings.skin === it.skin ? '<span class="tag gold">aktiv</span>' : `<button class="btn tiny" data-act="skin" data-id="${it.skin}">Wählen</button>`}</div>`;
        else html += this.hallItem(it);
      }
      html += '</div>';
    }
    this.el.innerHTML = html;
    this.update();
  }

  hallItem(it) {
    const g = this.g, st = g.state;
    const owned = !!st.hall[it.id];
    const avail = g.hallAvailable(it.id);
    const reqNames = it.req.filter((r) => !st.hall[r]).map((r) => HALL_BY_ID[r]?.name).join(', ');
    const genre = it.genre ? GENRE_BY_ID[it.genre] : null;
    return `<div class="hall-item ${owned ? 'owned' : avail ? '' : 'locked'}"><div class="ico-box sm" style="--c:${genre ? genre.color : owned ? '#f3b23a' : '#6b5bb0'}">${icon(it.icon)}</div>
      <div style="flex:1;min-width:0"><div class="hi-name">${esc(it.name)}</div><div class="hi-text">${esc(it.text)}</div>${!owned && !avail && reqNames ? `<div class="hi-text">${icon('lock')} Erfordert: ${esc(reqNames)}</div>` : ''}</div>
      ${owned ? '<span class="tag gold">✓</span>' : `<button class="btn tiny primary" data-act="hall" data-id="${it.id}" data-roy="${it.cost}" data-avail="${avail ? 1 : 0}" ${avail ? '' : 'disabled'}>${icon('coins')} ${fmt(it.cost)}</button>`}</div>`;
  }
}
