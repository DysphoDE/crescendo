// Upgrades, die mit Noten gekauft werden (werden bei Da Capo zurückgesetzt)
import { BUILDINGS, BUILDING_BY_ID, TIER_AT, TIER_COST } from './buildings.js';

// req(g) erhält das Game-Objekt; effects werden vom Effekt-System ausgewertet
export const UPGRADES = [];

const own = (g, id) => g.state.run.buildings[id] || 0;

// ---- 1. Stufen-Upgrades für jedes Instrument ----
for (const b of BUILDINGS) {
  b.tiers.forEach(([name, flavor], i) => {
    const up = {
      id: `t_${b.id}_${i}`, kind: 'tier', building: b.id, tier: i,
      name, flavor, icon: b.icon,
      cost: b.cost * TIER_COST[i],
      reqCount: TIER_AT[i],
      req: (g) => own(g, b.id) >= TIER_AT[i],
      effects: [{ t: 'bmult', b: b.id, v: 2 }],
      desc: `${b.name}: Leistung ×2`,
    };
    if (b.id === 'clap') {
      if (i < 3) {
        up.effects = [{ t: 'bmult', b: 'clap', v: 2 }, { t: 'click', v: 2 }];
        up.desc = 'Händeklatschen und Klicks: Leistung ×2';
        up.cost = [100, 500, 10000][i];
        up.reqCount = [1, 1, 10][i];
        up.req = (g) => own(g, 'clap') >= [1, 1, 10][i];
      } else {
        const flat = [0.1, 5, 10, 20, 20][i - 3];
        up.effects = i === 3 ? [{ t: 'clapFlat', v: 0.1 }] : [{ t: 'clapFlatMult', v: flat }];
        up.desc = i === 3
          ? 'Jeder Klatscher erzeugt +0,1 ♪/s für jedes andere Instrument, das du besitzt'
          : `Mitklatschen-Bonus ×${flat}`;
        up.cost = [1e5, 1e7, 1e9, 1e11, 1e13][i - 3];
        up.reqCount = [25, 50, 100, 150, 200][i - 3];
        up.req = (g) => own(g, 'clap') >= [25, 50, 100, 150, 200][i - 3];
      }
    }
    UPGRADES.push(up);
  });
}

// ---- 2. Klickkraft: Anteil der Produktion pro Klick ----
const CLICK_UPS = [
  ['Fingerübungen', 'Fünf Minuten am Tag. Jeden Tag.', 1e3, 5e4],
  ['Tonleitern üben', 'C-Dur, G-Dur, D-Dur … und zurück.', 1e5, 5e6],
  ['Czerny-Etüden', 'Carl Czerny schrieb über tausend Übungsstücke.', 1e7, 5e8],
  ['Hanon-Drills', '„Der virtuose Pianist in 60 Übungen“.', 1e9, 5e10],
  ['Virtuosen-Handgelenk', 'Locker aus dem Handgelenk.', 1e11, 5e12],
  ['Teufelstriller', 'Tartini träumte, der Teufel spiele ihm eine Sonate vor.', 1e13, 5e14],
  ['Transzendentale Technik', 'Jenseits dessen, was Hände können sollten.', 1e15, 5e16],
  ['Hände des Paganini', 'Man munkelte, er habe einen Pakt geschlossen.', 1e17, 5e18],
  ['Götterfunken', 'Freude, schöner Götterfunken – in jedem Finger.', 1e19, 5e20],
];
CLICK_UPS.forEach(([name, flavor, hand, cost], i) => {
  UPGRADES.push({
    id: `click_${i}`, kind: 'click', name, flavor, icon: 'piano-keys', cost,
    req: (g) => g.state.run.handmade >= hand,
    effects: [{ t: 'clickNps', v: 0.01 }],
    desc: 'Jeder Klick bringt zusätzlich 1 % deiner Produktion pro Sekunde',
  });
});
UPGRADES.push({
  id: 'baton_0', kind: 'click', name: 'Hölzerner Taktstock', flavor: 'Jean-Baptiste Lully stieß sich den Dirigierstab in den Fuß – und starb daran. Vorsicht!',
  icon: 'metronome', cost: 5e3, req: (g) => g.state.run.clicks >= 250,
  effects: [{ t: 'click', v: 2 }], desc: 'Klickkraft ×2',
});
UPGRADES.push({
  id: 'baton_1', kind: 'click', name: 'Elfenbein-Taktstock', flavor: 'Der Stab des Maestros.',
  icon: 'metronome', cost: 5e6, req: (g) => g.state.run.clicks >= 1500,
  effects: [{ t: 'click', v: 2 }], desc: 'Klickkraft ×2',
});
UPGRADES.push({
  id: 'baton_2', kind: 'click', name: 'Goldener Taktstock', flavor: 'Er glänzt schon, bevor du ihn hebst.',
  icon: 'metronome', cost: 5e9, req: (g) => g.state.run.clicks >= 5000,
  effects: [{ t: 'click', v: 3 }], desc: 'Klickkraft ×3',
});

// ---- 3. Groove ----
const GROOVE_UPS = [
  ['Metronom', 'Tick, tack, tick, tack. Johann Nepomuk Mälzel ließ es 1815 patentieren.', 500, 'metronome', [{ t: 'grooveMax', v: 0.25 }], 'Maximaler Groove-Bonus +25 %'],
  ['Taktgefühl', 'Du spürst die Eins, bevor sie kommt.', 5e4, 'heart-beats', [{ t: 'window', v: 1.2 }], 'Treffer-Fenster für den Takt +20 %'],
  ['Groove-Theorie', 'Wissenschaftlich belegt: Wippen macht glücklich.', 5e6, 'heart-beats', [{ t: 'grooveGain', v: 1.3 }], 'Groove baut sich 30 % schneller auf'],
  ['Rhythmusgruppe', 'Bass und Schlagzeug – das Fundament.', 5e8, 'drum-kit', [{ t: 'grooveMax', v: 0.25 }], 'Maximaler Groove-Bonus +25 %'],
  ['In der Tasche', 'Jazzmusiker sagen: Der Groove sitzt „in the pocket“.', 5e10, 'heart-beats', [{ t: 'grooveDecay', v: 0.65 }], 'Groove fällt 35 % langsamer ab'],
  ['Präzise wie ein Uhrwerk', 'Kein Tick daneben.', 5e12, 'clockwork', [{ t: 'grooveMax', v: 0.5 }], 'Maximaler Groove-Bonus +50 %'],
  ['Groove-Hände', 'Wer im Takt klickt, klickt härter.', 5e14, 'heart-beats', [{ t: 'grooveClick', v: 2 }], 'Groove verstärkt Klicks noch mehr: bei vollem Groove ×2,5 statt ×1,5'],
  ['Trance-Zustand', 'Du bist der Beat.', 5e17, 'vortex', [{ t: 'grooveMax', v: 1 }], 'Maximaler Groove-Bonus +100 %'],
];
GROOVE_UPS.forEach(([name, flavor, cost, icon, effects, desc], i) => {
  UPGRADES.push({
    id: `groove_${i}`, kind: 'groove', name, flavor, icon, cost, effects, desc,
    req: (g) => own(g, 'drum') > 0 && g.state.run.total >= cost * 0.2 && (i === 0 || g.state.life.perfectHits >= [0, 10, 30, 60, 100, 150, 200, 300][i]),
  });
});

// ---- 4. Goldene Noten ----
const GOLD_UPS = [
  ['Glückliche Fügung', 'Manchmal fällt einem einfach eine Melodie ein.', 7.77e6, 7, [{ t: 'goldFreq', v: 1.15 }, { t: 'goldLife', v: 1.15 }], 'Goldene Noten erscheinen 15 % öfter und bleiben 15 % länger'],
  ['Sternstunde', 'Einer dieser Abende, an denen alles gelingt.', 7.77e9, 27, [{ t: 'goldFreq', v: 1.15 }, { t: 'goldDur', v: 1.15 }], 'Goldene Noten erscheinen 15 % öfter, Effekte halten 15 % länger'],
  ['Goldenes Zeitalter', 'Die Welt hört dir zu.', 7.77e12, 77, [{ t: 'goldFreq', v: 1.15 }, { t: 'goldDur', v: 1.15 }], 'Goldene Noten erscheinen 15 % öfter, Effekte halten 15 % länger'],
  ['Midas-Klang', 'Was du anspielst, wird zu Gold.', 7.77e15, 177, [{ t: 'goldEffect', v: 1.5 }], 'Sofort-Belohnungen goldener Noten +50 %'],
];
GOLD_UPS.forEach(([name, flavor, cost, need, effects, desc], i) => {
  UPGRADES.push({
    id: `gold_${i}`, kind: 'golden', name, flavor, icon: 'sparkles', cost, effects, desc,
    req: (g) => g.state.life.golden >= need,
  });
});

// ---- 5. Synergien zwischen Instrumenten ----
const SYN = [
  ['drum', 'clap', 'Urknall-Rhythmus', 'Wer trommelt, klatscht auch.'],
  ['lyre', 'flute', 'Hirtenmusik', 'Arkadien klingt nach Flöte und Leier.'],
  ['choir', 'lyre', 'Hymnen', 'Gesungene Gebete, begleitet von Saiten.'],
  ['lute', 'choir', 'Madrigalchor', 'Fünf Stimmen und eine Laute.'],
  ['organ', 'choir', 'Hochamt', 'Wenn Orgel und Chor gemeinsam den Raum füllen.'],
  ['quartet', 'organ', 'Basso continuo', 'Das Fundament des Barock trägt die Klassik.'],
  ['piano', 'quartet', 'Klavierquintett', 'Schuberts „Forellenquintett“ lässt grüßen.'],
  ['orchestra', 'piano', 'Klavierkonzert', 'Solist gegen Orchester – oder miteinander?'],
  ['opera', 'orchestra', 'Orchestergraben', 'Unten spielen sie, oben wird gestorben.'],
  ['jazz', 'piano', 'Stride Piano', 'Die linke Hand springt, die rechte swingt.'],
  ['rock', 'orchestra', 'Rock-Sinfonie', 'Deep Purple spielte 1969 mit dem Royal Philharmonic.'],
  ['synth', 'rock', 'New Wave', 'Gitarren raus, Synthesizer rein!'],
  ['dj', 'synth', 'Techno', 'Detroit trifft Berlin.'],
  ['studio', 'rock', 'Konzeptalbum', 'Ein Album, eine Geschichte.'],
  ['stream', 'dj', 'Playlist-Kultur', 'Die DJs der Gegenwart sind Algorithmen.'],
  ['festival', 'rock', 'Headliner-Vertrag', 'Am Samstagabend auf der Hauptbühne.'],
  ['ai', 'stream', 'Empfehlungsmaschine', 'Sie kennt deinen Geschmack besser als du.'],
  ['spheres', 'choir', 'Chor der Sphären', 'Die Mönche hatten es immer geahnt.'],
];
SYN.forEach(([dst, src, name, flavor], i) => {
  const D = BUILDING_BY_ID[dst], S = BUILDING_BY_ID[src];
  UPGRADES.push({
    id: `syn_${i}`, kind: 'synergy', name, flavor, icon: D.icon, icon2: S.icon,
    cost: D.cost * 40,
    req: (g) => own(g, dst) >= 15 && own(g, src) >= 15,
    effects: [{ t: 'syn', dst, src, v: 0.01 }, { t: 'syn', dst: src, src: dst, v: 0.002 }],
    desc: `${D.name}: +1 % pro ${S.name.replace('Gregorianischer ', '')}. ${S.name.replace('Gregorianischer ', '')}: +0,2 % pro ${D.name}.`,
  });
});

// ---- 6. Kritiken & Auszeichnungen: globale Multiplikatoren ----
const GLOBAL = [
  ['Lob vom Dorfbarden', 'Er hat „ganz nett“ gesagt!', 1e4, 0.05],
  ['Erwähnung in der Chronik', 'Ein Mönch hat deinen Namen notiert.', 1e6, 0.05],
  ['Neue Zeitschrift für Musik', 'Gegründet 1834 von Robert Schumann – und er mag dich.', 1e8, 0.1],
  ['Wohlwollende Rezension', '„Ein Klangereignis von seltener Tiefe.“', 1e10, 0.1],
  ['Verriss (aber berühmt)', 'Schlechte Presse ist auch Presse.', 1e12, 0.1],
  ['Titelseite', 'Dein Gesicht an jedem Kiosk.', 1e14, 0.15],
  ['Platz 1 der Charts', 'Zwölf Wochen in Folge.', 1e16, 0.15],
  ['Goldene Stimmgabel', 'Die Branche verneigt sich.', 1e18, 0.2],
  ['Ehrendoktor der Musik', 'Dr. h. c. klingt einfach gut.', 1e20, 0.2],
  ['Stern auf dem Walk of Fame', 'Hollywood, Vine Street.', 1e22, 0.25],
  ['Denkmal auf dem Marktplatz', 'Tauben inklusive.', 1e24, 0.25],
  ['Nach dir benannter Asteroid', 'Es gibt wirklich Asteroiden namens Bach, Beethoven und Mozartia.', 1e26, 0.3],
];
GLOBAL.forEach(([name, flavor, at, v], i) => {
  UPGRADES.push({
    id: `glob_${i}`, kind: 'global', name, flavor, icon: i < 4 ? 'quill-ink' : i < 8 ? 'laurels' : 'star-medal',
    cost: at * 2,
    req: (g) => g.state.run.total >= at,
    effects: [{ t: 'prod', v: 1 + v }],
    desc: `Gesamte Produktion +${Math.round(v * 100)} %`,
  });
});

// ---- 7. Inspiration & Offline ----
const INSP = [
  ['Notizbuch', 'Für Ideen unterwegs.', 5e5, 'book-cover', [{ t: 'insp', v: 1.15 }], 'Inspiration +15 %'],
  ['Skizzenbuch', 'Beethoven trug immer eines bei sich.', 5e9, 'scroll-quill', [{ t: 'insp', v: 1.15 }], 'Inspiration +15 %'],
  ['Kaffeehaus-Gespräche', 'Bach schrieb sogar eine „Kaffeekantate“.', 5e13, 'coffee-cup', [{ t: 'insp', v: 1.2 }], 'Inspiration +20 %'],
  ['Radio-Übertragung', 'Deine Musik spielt, auch wenn du schläfst.', 5e7, 'pocket-radio', [{ t: 'offline', v: 0.1 }], 'Offline-Produktion +10 %-Punkte'],
  ['Schallplattenpresse', 'Deine Musik vervielfältigt sich von selbst.', 5e11, 'compact-disc', [{ t: 'offline', v: 0.1 }], 'Offline-Produktion +10 %-Punkte'],
  ['Dauerschleife', 'Repeat-Taste für die Ewigkeit.', 5e15, 'cycle', [{ t: 'offline', v: 0.15 }, { t: 'offlineCap', v: 4 }], 'Offline-Produktion +15 %-Punkte, +4 Std. Maximalzeit'],
];
INSP.forEach(([name, flavor, cost, icon, effects, desc], i) => {
  UPGRADES.push({
    id: `insp_${i}`, kind: 'misc', name, flavor, icon, cost, effects, desc,
    req: (g) => g.state.run.total >= cost * 0.25 && g.state.life.inspEarned > 0,
  });
});

// ---- 8. Konzert-Upgrades ----
const GIG = [
  ['Tourplakate', 'Bunt, laut, an jeder Litfaßsäule.', 5e8, [{ t: 'gigReward', v: 1.25 }], 'Konzert-Belohnungen +25 %'],
  ['Roadie-Team', 'Aufbau in Rekordzeit.', 5e11, [{ t: 'gigSpeed', v: 1.2 }], 'Konzerte 20 % schneller'],
  ['Merchandise-Stand', 'T-Shirts, Tassen, Turnbeutel.', 5e14, [{ t: 'gigReward', v: 1.5 }], 'Konzert-Belohnungen +50 %'],
  ['Pyrotechnik', 'Feuer frei!', 5e17, [{ t: 'gigReward', v: 1.5 }, { t: 'relicLuck', v: 1.2 }], 'Konzert-Belohnungen +50 %, Fundchance +20 %'],
];
GIG.forEach(([name, flavor, cost, effects, desc], i) => {
  UPGRADES.push({
    id: `gig_${i}`, kind: 'misc', name, flavor, icon: 'ticket', cost, effects, desc,
    req: (g) => g.state.life.gigsDone >= [1, 5, 15, 40][i] && g.state.run.total >= cost * 0.1,
  });
});

UPGRADES.forEach((u, i) => { u.order = i; });
export const UPGRADE_BY_ID = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));
