// Misst, wie stark die Noten eines Durchgangs mit dem Schallplatten-Multiplikator wachsen
let simMs = Date.UTC(2026, 0, 5, 12, 0, 0);
let simPerf = 1000;
Date.now = () => simMs;
performance.now = () => simPerf * 1000;
const { defaultState } = await import('../js/core/state.js');
const { Game } = await import('../js/core/game.js');
const { BUILDINGS } = await import('../js/data/buildings.js');
const { fmt } = await import('../js/core/format.js');
const MIN = Number(process.argv[2] || 30);
function runWith(R) {
  const st = defaultState();
  st.records = R;
  st.achievements = {}; // keine
  const g = new Game(st);
  g.checkAchievements = () => {}; g.checkUnlocks = () => {};
  for (let s = 0; s < MIN * 60; s++) {
    simMs += 1000; simPerf += 1;
    if (s < 120) for (let i = 0; i < 4; i++) g.click(simPerf, {});
    g.tick(1);
    let guard = 0;
    while (guard++ < 60) {
      let best = null;
      for (const b of BUILDINGS) {
        const c = g.buildingCost(b.id);
        const own = g.own(b.id);
        const per = own ? (g.rawBuilding[b.id] / own) * g.globalMult : b.prod * (g.S.bmult[b.id] || 1) * g.globalMult;
        const sc = c / Math.max(per, 1e-12);
        if (!best || sc < best.sc) best = { k: 'b', id: b.id, c, sc };
      }
      for (const u of g.availableUpgrades()) {
        const c = g.upgradeCost(u); let gain = 0;
        for (const e of u.effects) { if (e.t === 'bmult') gain += (g.rawBuilding[e.b] || 0) * g.globalMult * (e.v - 1); else if (e.t === 'prod') gain += g.npsBase * (e.v - 1); else gain += g.npsBase * 0.02; }
        const sc = c / Math.max(gain, 1e-12);
        if (sc < best.sc * 1.2) best = { k: 'u', id: u.id, c, sc };
      }
      if (best.c > st.run.notes) break;
      if (best.k === 'b') g.buy(best.id, 1); else g.buyUpgrade(best.id);
    }
  }
  const top = BUILDINGS.filter((b) => g.own(b.id) > 0).pop();
  return { N: st.run.total, top: top.id, M: 1 + R * g.S.recordBonus };
}
let prev = null;
for (const R of [0, 50, 500, 5000, 5e4, 5e5, 5e6, 5e7]) {
  const r = runWith(R);
  const el = prev ? (Math.log(r.N / prev.N) / Math.log(r.M / prev.M)).toFixed(2) : '-';
  console.log(`R=${String(R).padEnd(9)} M=${r.M.toExponential(2)}  N=${r.N.toExponential(2)}  top=${r.top.padEnd(9)} elasticity=${el}  → Platten(cbrt) ${Math.floor(Math.cbrt(r.N / 1e7))}`);
  prev = r;
}
