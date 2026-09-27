// Balancing-Simulation mit virtueller Zeit. Aufruf: node tools/sim.mjs [Stunden] [Profil]
// Profile: active (klickt im Takt, fängt goldene Noten), casual (abwechselnd), idle (fast nie)
let simMs = Date.UTC(2026, 0, 5, 12, 0, 0);
let simPerf = 1000;
Date.now = () => simMs;
performance.now = () => simPerf * 1000;
globalThis.document = undefined;

const { defaultState } = await import('../js/core/state.js');
const { Game } = await import('../js/core/game.js');
const { BUILDINGS } = await import('../js/data/buildings.js');
const { UPGRADES } = await import('../js/data/upgrades.js');
const { CIRCLE, MODES, RHYTHM } = await import('../js/data/theory.js');
const { VENUES } = await import('../js/data/venues.js');
const { HALL } = await import('../js/data/hall.js');
const { ERAS } = await import('../js/data/eras.js');
const { LEGENDS } = await import('../js/data/legends.js');
const { fmt, fmtTime } = await import('../js/core/format.js');
const { bus } = await import('../js/core/bus.js');

const HOURS = Number(process.argv[2] || 12);
const PROFILE = process.argv[3] || 'casual';
const st = defaultState();
st.settings.style = 'auto';
const g = new Game(st);
const log = [];
const t0 = simMs;
const stamp = () => fmtTime((simMs - t0) / 1000, { clock: true });
bus.on('era:new', ({ era }) => log.push(`${stamp()}  Epoche: ${era.name}`));
bus.on('legend:unlock', ({ id }) => log.push(`${stamp()}  Legende: ${id}`));
bus.on('dacapo', ({ gain }) => log.push(`${stamp()}  DA CAPO +${gain} Schallplatten (gesamt ${st.records})`));
const firstBuy = {};
bus.on('buy', ({ id }) => { if (!firstBuy[id]) { firstBuy[id] = stamp(); } });

function activeNow() {
  const min = (simMs - t0) / 60000;
  if (PROFILE === 'active') return true;
  if (PROFILE === 'idle') return min < 5;
  return Math.floor(min / 10) % 3 === 0; // 10 Min aktiv, 20 Min passiv
}

function bestPurchase() {
  const bank = st.run.notes;
  let best = null;
  const base = g.npsBase + 1e-9;
  const clickShare = activeNow() ? g.clickValue() * 1.5 : 0;
  for (const b of BUILDINGS) {
    const c = g.buildingCost(b.id);
    // Näherung: zusätzliche Produktion eines Stücks
    const own = g.own(b.id);
    const per = own ? (g.rawBuilding[b.id] / own) * g.globalMult : b.prod * (g.S.bmult[b.id] || 1) * g.globalMult;
    const score = c / Math.max(per, 1e-12);
    if (!best || score < best.score) best = { kind: 'b', id: b.id, c, score };
  }
  for (const u of g.availableUpgrades()) {
    const c = g.upgradeCost(u);
    let gain = 0;
    for (const e of u.effects) {
      if (e.t === 'bmult') gain += (g.rawBuilding[e.b] || 0) * g.globalMult * (e.v - 1);
      else if (e.t === 'prod') gain += base * (e.v - 1);
      else if (e.t === 'click' || e.t === 'clickNps') gain += clickShare * 0.5;
      else gain += base * 0.05;
    }
    const score = c / Math.max(gain, 1e-12);
    if (score < best.score * 1.2) best = { kind: 'u', id: u.id, c, score };
  }
  return best;
}

function spendInspiration() {
  // Ensemble auffüllen
  for (const L of LEGENDS) if (st.legends[L.id] && !g.inEnsemble(L.id) && st.ensemble.length < g.ensembleSlots()) g.toggleEnsemble(L.id);
  let guard = 0;
  while (guard++ < 50) {
    const opts = [];
    for (const c of CIRCLE) if (g.canBuyCircle(c.id)) opts.push([g.theoryCost(c.cost), () => g.buyCircle(c.id)]);
    for (const r of RHYTHM) if (g.rhythmAvailable(r.id)) opts.push([g.theoryCost(r.cost), () => g.buyRhythm(r.id)]);
    for (const m of MODES) if (!st.modesUnlocked[m.id] && m.id !== 'locrian') opts.push([g.theoryCost(m.cost), () => { g.buyMode(m.id); g.setMode('ionian'); }]);
    for (const id of st.ensemble) if (st.legends[id].level < 20) opts.push([g.legendCost(id), () => g.levelUpLegend(id)]);
    opts.sort((a, b) => a[0] - b[0]);
    if (!opts.length || opts[0][0] > st.inspiration) break;
    opts[0][1]();
  }
}

function gigs() {
  for (const gig of [...st.gigs]) if (gig.end <= simMs) g.claimGig(gig.key);
  const vs = VENUES.filter((v) => g.venueUnlocked(v) && !g.gigActive(v.id)).sort((a, b) => b.index - a.index);
  for (const v of vs) { if (st.gigs.length >= g.gigSlots()) break; g.startGig(v.id); }
}

function hall() {
  let guard = 0;
  while (guard++ < 30) {
    const av = HALL.filter((x) => g.hallAvailable(x.id) && !x.skin).sort((a, b) => a.cost - b.cost);
    if (!av.length || av[0].cost > st.royalties) break;
    g.buyHall(av[0].id);
  }
}

const SEC = HOURS * 3600;
let lastReport = 0;
const report = [];
for (let s = 0; s < SEC; s++) {
  const act = activeNow();
  // Klicks im Takt
  if (act && !g.transport.noBeat) {
    const bd = g.beatDur();
    const pStart = simPerf;
    let k = Math.ceil((pStart - g.transport.t0) / bd);
    while (g.transport.t0 + k * bd < pStart + 1) {
      simPerf = g.transport.t0 + k * bd + 0.01;
      g.click(simPerf, {});
      if (PROFILE === "spam") { for (let j = 1; j < 4; j++) g.click(simPerf + bd * j / 4, {}); }
      k++;
    }
    simPerf = pStart;
  } else if (act) { for (let i = 0; i < 3; i++) g.click(simPerf, {}); }
  simMs += 1000; simPerf += 1;
  g.tick(1);
  if (act) for (const gn of [...g.goldens]) g.clickGolden(gn.id);
  // Kaufen
  let guard = 0;
  while (guard++ < 40) {
    const b = bestPurchase();
    if (!b || b.c > st.run.notes) break;
    if (b.kind === 'b') g.buy(b.id, 1); else g.buyUpgrade(b.id);
  }
  if (s % 10 === 0) { spendInspiration(); gigs(); }
  // Da Capo, wenn sich die Schallplatten mindestens verdoppeln
  const gain = g.recordsGain();
  if (gain >= Math.max(15, st.records * 1.0) && st.run.playTime > 1200) {
    if (process.env.DBG2) {
      const S = g.S; const top = Object.entries(S.bmult).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>k+':'+v.toExponential(1)).join(' ');
      const syn = {}; for (const x of S.syn) syn[x.dst] = (syn[x.dst]||0) + x.v * g.own(x.src);
      console.log(`[DC ${stamp()}] rec=${st.records} gain=${gain} global=${g.globalMult.toExponential(2)} prod=${S.prod.toExponential(2)} recM=${(1+st.records*S.recordBonus).toExponential(2)} achM=${(1+g.achievementCount()*S.achBonus*S.achMult).toFixed(2)} ens=${st.ensemble.join(',')} slots=${g.ensembleSlots()} top=${top} total=${g.totalBuildings()} per100=${S.per100} perType=${S.perType} per50=${S.per50} perAch=${S.perAch} perOrgan=${S.perOrgan} twelve=${S.twelve} syn=${JSON.stringify(Object.fromEntries(Object.entries(syn).map(([k,v])=>[k,+v.toFixed(1)])))}`);
      console.log('   own', JSON.stringify(st.run.buildings));
    }
    g.daCapo(null); hall();
  }
  if (process.env.DBG && (s >= 470 && s <= 620 && s % 10 === 0)) {
    const S = g.S;
    console.log(`t=${s}s notes=${fmt(st.run.notes)} total=${fmt(st.run.total)} npsBase=${fmt(g.npsBase)} nps=${fmt(g.nps)} raw=${fmt(g.rawTotal)} global=${g.globalMult.toFixed(2)} prod=${S.prod.toFixed(2)} ach=${g.achievementCount()} groove=${g.groove.toFixed(2)} click=${fmt(g.clickValue())} clicks=${st.run.clicks} hand=${fmt(st.run.handmade)}`);
    console.log('  buildings', JSON.stringify(st.run.buildings), 'ups', g.upgradeCount(), 'ens', st.ensemble.join(','), 'theory', Object.keys(st.theory).join(','), 'insp', st.inspiration.toFixed(1), 'mode', st.mode);
    console.log('  bmult', JSON.stringify(Object.fromEntries(Object.entries(S.bmult).map(([k, v]) => [k, +v.toFixed(2)]))), 'dyn', g._dyn?.prod?.toFixed(2), 'buff', g._bm?.prod?.toFixed(2));
  }
  if (s - lastReport >= 1800) {
    lastReport = s;
    report.push(`${stamp()}  Noten/s ${fmt(g.npsBase).padEnd(22)} Run ${fmt(st.run.total).padEnd(24)} Epoche ${ERAS[g.eraIndex()].name.padEnd(14)} ✦${Math.floor(st.inspiration)} (ges. ${Math.floor(st.life.inspEarned)})  Platten ${st.records}  +${gain}  Leg ${Object.keys(st.legends).length}  Ach ${g.achievementCount()}  Rel ${Object.keys(st.relics).length}  Theo ${g.theoryCount()}`);
  }
}
console.log(`Profil: ${PROFILE}, ${HOURS} Std.\n`);
console.log(report.join('\n'));
console.log('\nEreignisse:');
console.log(log.join('\n'));
console.log('\nErster Kauf je Instrument (erster Durchgang):');
console.log(Object.entries(firstBuy).map(([k, v]) => `${k}:${v}`).join('  '));
