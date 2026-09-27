// Optionen: Klang, Anzeige, Spielstand, Mitwirkende
import { CLICK_INSTR, STYLES } from '../../audio/styles.js';
import { D } from '../../audio/instruments.js';
import { ERAS } from '../../data/eras.js';
import { GENRES } from '../../data/genres.js';
import { CIRCLE } from '../../data/theory.js';
import { numberFormat } from '../../core/format.js';
import { exportSave, importSave, loadBackup } from '../../core/state.js';
import { perf } from '../../core/util.js';
import { icon, esc, modal, confirmModal, toast } from '../dom.js';

export class SettingsPanel {
  constructor(app) { this.app = app; }
  get g() { return this.app.game; }
  mount(el) {
    this.el = el;
    el.addEventListener('input', (e) => this.onInput(e));
    el.addEventListener('change', (e) => this.onInput(e));
    el.addEventListener('click', (e) => this.onClick(e));
    this.render();
  }

  render() {
    const g = this.g, s = g.state.settings, st = g.state;
    const tog = (key, label, hint = '') => `<div class="set-row"><label>${label}</label><button class="toggle ${s[key] ? 'on' : ''}" data-toggle="${key}" aria-pressed="${!!s[key]}"></button>${hint ? `<div class="hint">${hint}</div>` : ''}</div>`;
    const slider = (key, label) => `<div class="set-row"><label>${label}</label><input type="range" min="0" max="1" step="0.01" value="${s[key]}" data-range="${key}"><span class="muted tnum" style="width:44px;text-align:right" data-val="${key}">${key === 'master' && s[key] >= 1 ? '11' : Math.round(s[key] * 100) + ' %'}</span></div>`;
    const instr = CLICK_INSTR.filter((c) => !c.need || st.discovered['b_' + c.need]);
    const styles = [['auto', 'Passend zur Epoche']].concat(ERAS.filter((e) => st.discovered['e_' + e.id]).map((e) => [e.id, 'Epoche: ' + e.name])).concat(GENRES.filter((x) => st.hall['h_genre_' + x.id]).map((x) => ['g_' + x.id, 'Genre: ' + x.name]));
    const keys = CIRCLE.filter((c) => st.theory[c.id] || c.id === 'C');
    this.el.innerHTML = `<div class="sec-title">${icon('cog')}<h2>Optionen</h2></div>
      <div class="grid two settings-grid">
        <div class="card set-group"><div class="h3" style="margin:0">${icon('speaker')} Klang</div>
          ${slider('master', 'Gesamtlautstärke')}${slider('music', 'Musik')}${slider('sfx', 'Klicks & Effekte')}
          ${tog('musicOn', 'Musik abspielen')}${tog('sfxOn', 'Klicks & Effekte abspielen')}
          ${tog('bgAudio', 'Im Hintergrund weiterspielen', 'Musik läuft weiter, wenn der Tab nicht sichtbar ist.')}
          ${tog('metronome', 'Metronom-Klick', 'Ein leises Ticken auf jedem Schlag – hilft beim Klicken im Takt.')}
          <div class="set-row"><label>Klick-Instrument</label><select data-sel="clickInstr">${instr.map((c) => `<option value="${c.id}" ${s.clickInstr === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select><div class="hint">Neue Klänge schaltest du mit neuen Instrumenten frei.</div></div>
          <div class="set-row"><label>Musikstil</label><select data-sel="style">${styles.map(([id, n]) => `<option value="${id}" ${s.style === id ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select><div class="hint">Ein gewähltes Genre im Durchgang hat Vorrang. Der Stil ändert auch das Tempo.</div></div>
          <div class="set-row"><label>Tonart der Musik</label><select data-sel="key">${keys.map((c) => `<option value="${c.id}" ${s.key === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select><div class="hint">Weitere Tonarten erlernst du im Quintenzirkel.</div></div>
        </div>
        <div class="card set-group"><div class="h3" style="margin:0">${icon('sparkles')} Anzeige & Spiel</div>
          <div class="set-row"><label>Zahlenformat</label><select data-sel="numbers"><option value="words" ${s.numbers === 'words' ? 'selected' : ''}>Wörter (1,23 Millionen)</option><option value="short" ${s.numbers === 'short' ? 'selected' : ''}>Kurz (1,23 Mio.)</option><option value="sci" ${s.numbers === 'sci' ? 'selected' : ''}>Wissenschaftlich (1,23e6)</option></select></div>
          <div class="set-row"><label>Effekte & Partikel</label><select data-sel="particles"><option value="high" ${s.particles === 'high' ? 'selected' : ''}>Hoch</option><option value="low" ${s.particles === 'low' ? 'selected' : ''}>Sparsam</option><option value="off" ${s.particles === 'off' ? 'selected' : ''}>Aus</option></select></div>
          ${tog('reduceMotion', 'Weniger Bewegung')}
          ${tog('ticker', 'Nachrichten-Ticker')}
          ${tog('autoClaim', 'Konzerte automatisch abholen')}
          <div class="set-row"><label>Latenz-Ausgleich</label><input type="range" min="-150" max="200" step="5" value="${s.latency}" data-range="latency"><span class="muted tnum" style="width:60px;text-align:right" data-val="latency">${s.latency} ms</span><div class="hint">Verschiebt die Taktbewertung, falls sich Treffer zu früh oder zu spät anfühlen (z. B. mit Bluetooth-Kopfhörern).</div></div>
          <div class="set-row"><button class="btn small" data-act="calibrate">${icon('tuning-fork')} Latenz kalibrieren</button></div>
        </div>
        <div class="card set-group"><div class="h3" style="margin:0">${icon('save-arrow')} Spielstand</div>
          <p class="muted" style="margin:0;font-size:13px">Das Spiel speichert automatisch alle 15 Sekunden in deinem Browser.</p>
          <div class="row wrap"><button class="btn small primary" data-act="save">${icon('save-arrow')} Jetzt speichern</button><button class="btn small" data-act="export">${icon('cloud-upload')} Exportieren</button><button class="btn small" data-act="import">${icon('cloud-download')} Importieren</button></div>
          <div class="row wrap"><button class="btn small" data-act="backup">${icon('anticlockwise-rotation')} Sicherheitskopie laden</button><button class="btn small danger" data-act="reset">${icon('trash-can')} Alles zurücksetzen</button></div>
        </div>
        <div class="card"><div class="h3" style="margin-top:0">${icon('laurels')} Mitwirkende</div>
          <div class="credits">
            <b>Crescendo</b> – ein musikalisches Idle-Spiel. Alle Klänge werden live im Browser synthetisiert.<br>
            Icons: <a href="https://game-icons.net" target="_blank" rel="noopener">game-icons.net</a> (CC BY 3.0) von Lorc, Delapouite, Skoll, Caro Asercion, Zajkonur, Sbed u. a.<br>
            Porträts: Wikimedia Commons / Wikipedia (gemeinfrei bzw. freie Lizenzen der jeweiligen Urheber).<br>
            Schriften: Cinzel, Nunito, Noto Music (SIL Open Font License).<br>
            Musikgeschichte: mit Liebe recherchiert – Fehler bitte der Muse melden.
          </div></div>
      </div>`;
  }

  onInput(e) {
    const g = this.g, s = g.state.settings, a = this.app;
    const r = e.target.closest('[data-range]');
    if (r) {
      const k = r.dataset.range;
      s[k] = Number(r.value);
      const v = this.el.querySelector(`[data-val="${k}"]`);
      if (v) v.textContent = k === 'latency' ? `${s[k]} ms` : k === 'master' && s[k] >= 1 ? '11' : Math.round(s[k] * 100) + ' %';
      if (k === 'master') g.state.flags.volumeTouched = true;
      a.applySettings();
      return;
    }
    const sel = e.target.closest('[data-sel]');
    if (sel && e.type === 'change') {
      s[sel.dataset.sel] = sel.value;
      a.applySettings();
      if (sel.dataset.sel === 'style') g.syncStyle();
      a.audio.sfx('open');
    }
  }

  async onClick(e) {
    const g = this.g, s = g.state.settings, a = this.app;
    const t = e.target.closest('[data-toggle]');
    if (t) {
      const k = t.dataset.toggle;
      s[k] = !s[k];
      t.classList.toggle('on', s[k]);
      if ((k === 'musicOn' || k === 'sfxOn') && !s[k]) g.state.flags.muted = true;
      a.applySettings();
      a.audio.sfx('tab');
      return;
    }
    const b = e.target.closest('[data-act]'); if (!b) return;
    switch (b.dataset.act) {
      case 'save': a.save(true); break;
      case 'export': {
        const str = exportSave(g.state);
        const m = modal({
          title: 'Spielstand exportieren', body: `<p class="muted">Kopiere diesen Text und bewahre ihn gut auf. Damit kannst du deinen Spielstand auf einem anderen Gerät importieren.</p><textarea readonly id="expTxt">${esc(str)}</textarea>`,
          actions: [{ label: 'Als Datei speichern', onClick: () => { const blob = new Blob([str], { type: 'text/plain' }); const u = URL.createObjectURL(blob); const l = document.createElement('a'); l.href = u; l.download = `crescendo-${new Date().toISOString().slice(0, 10)}.txt`; l.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); return false; } },
            { label: 'Kopieren', cls: 'primary', onClick: () => { navigator.clipboard?.writeText(str).then(() => toast({ title: 'Kopiert!', icon: 'check-mark', kind: 'info', time: 2000 })); return false; } }, { label: 'Schließen' }],
        });
        m.el.querySelector('#expTxt').addEventListener('focus', (ev) => ev.target.select());
        break;
      }
      case 'import': {
        const m = modal({
          title: 'Spielstand importieren', body: `<p class="muted">Füge hier einen exportierten Spielstand ein. <b class="bad">Der aktuelle Stand wird überschrieben.</b></p><textarea id="impTxt" placeholder="CRESCENDO1:…"></textarea>`,
          actions: [{ label: 'Abbrechen' }, {
            label: 'Importieren', cls: 'primary', onClick: () => {
              try { const st = importSave(m.el.querySelector('#impTxt').value); a.loadState(st); toast({ title: 'Spielstand geladen', icon: 'check-mark', kind: 'info' }); } catch (err) { toast({ title: 'Import fehlgeschlagen', text: 'Der Text ist kein gültiger Spielstand.', icon: 'cancel', kind: 'info' }); return false; }
              return true;
            },
          }],
        });
        break;
      }
      case 'reset': {
        if (await confirmModal('Alles zurücksetzen?', 'Dein gesamter Fortschritt – inklusive Legenden, Schallplatten und Auszeichnungen – wird unwiderruflich gelöscht.', 'Ja, löschen', 'danger')) {
          if (await confirmModal('Wirklich sicher?', 'Letzte Chance! Es gibt kein Zurück.', 'Endgültig löschen', 'danger')) a.hardReset();
        }
        break;
      }
      case 'calibrate': this.calibrate(); break;
      case 'backup': {
        const bak = loadBackup();
        if (!bak) { toast({ title: 'Keine Sicherheitskopie vorhanden', icon: 'info', kind: 'info' }); break; }
        const when = new Date(bak.lastSave || Date.now()).toLocaleString('de-DE');
        if (await confirmModal('Sicherheitskopie laden?', `Die automatische Kopie stammt vom <b>${when}</b>. Der aktuelle Stand wird ersetzt.`, 'Laden')) { a.loadState(bak); toast({ title: 'Sicherheitskopie geladen', icon: 'check-mark', kind: 'info' }); }
        break;
      }
    }
  }

  calibrate() {
    const a = this.app, au = a.audio;
    au.ensure();
    const bpm = 100, n = 12, bd = 60 / bpm;
    let t0 = 0, taps = [], running = false;
    const body = document.createElement('div');
    body.innerHTML = `<p class="lore">Tippe im Takt auf den Knopf (oder drücke die Leertaste), sobald du den Klick hörst. Nach ${n} Schlägen wird deine Latenz berechnet.</p>
      <div style="display:grid;place-items:center;margin:16px 0"><button class="btn primary" id="calTap" style="width:160px;height:160px;border-radius:50%;font-size:22px">Start</button></div>
      <div class="muted" id="calInfo" style="text-align:center">Bereit.</div>`;
    const tapBtn = body.querySelector('#calTap'), info = body.querySelector('#calInfo');
    const start = () => {
      running = true; taps = [];
      t0 = perf() + 0.6;
      for (let i = 0; i < n; i++) {
        const tt = au.toCtx(t0 + i * bd);
        D.snareRim(au, au.sfxBus, tt, 1.2); D.kickSoft(au, au.sfxBus, tt, 0.6);
      }
      tapBtn.textContent = 'Tippen!';
      info.textContent = 'Hör genau hin …';
      setTimeout(finish, (0.6 + n * bd + 0.4) * 1000);
    };
    const tap = (ts) => {
      if (!running) { start(); return; }
      const p = (ts - t0) / bd; const k = Math.round(p);
      if (k < 0 || k >= n) return;
      const d = (p - k) * bd;
      if (Math.abs(d) < 0.3) taps.push(d);
      info.textContent = `${taps.length} Treffer`;
      tapBtn.animate([{ transform: 'scale(.94)' }, { transform: 'scale(1)' }], { duration: 120 });
    };
    const finish = () => {
      running = false;
      if (taps.length < 5) { info.textContent = 'Zu wenige Treffer – versuch es noch einmal.'; tapBtn.textContent = 'Nochmal'; return; }
      taps.sort((x, y) => x - y);
      const med = taps[Math.floor(taps.length / 2)];
      const ms = Math.round(med * 1000 / 5) * 5;
      this.g.state.settings.latency = Math.max(-150, Math.min(200, ms));
      this.g.state.flags.calibrated = true;
      info.innerHTML = `Deine Latenz: <b class="gold">${ms} ms</b> – gespeichert.`;
      tapBtn.textContent = 'Nochmal';
      this.render();
    };
    tapBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); tap(e.timeStamp / 1000); });
    const key = (e) => { if (e.code === 'Space') { e.preventDefault(); e.stopPropagation(); tap(e.timeStamp / 1000); } };
    window.addEventListener('keydown', key, true);
    modal({ title: 'Latenz kalibrieren', body, actions: [{ label: 'Fertig' }], onClose: () => window.removeEventListener('keydown', key, true) });
    void STYLES; void numberFormat;
  }
}
