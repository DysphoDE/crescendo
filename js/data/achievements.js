// Auszeichnungen. Jede gibt +1 % Produktion (verstärkbar) und +1 Inspiration.
import { BUILDINGS } from './buildings.js';
import { ERAS } from './eras.js';
import { GENRES } from './genres.js';
import { LEGENDS } from './legends.js';
import { RELICS } from './relics.js';
import { CIRCLE, MODES, RHYTHM } from './theory.js';
import { fmt } from '../core/format.js';
import { MELODIES } from './melodies.js';
import { CHALLENGES } from './challenges.js';

export const ACHIEVEMENTS = [];
const add = (a) => ACHIEVEMENTS.push(a);

// --- Noten insgesamt (Dynamik) ---
const DYN = [
  [100, 'Erster Ton', 'Jede Sinfonie beginnt mit einem einzigen Ton.'],
  [1e3, 'ppp – Pianississimo', 'Tschaikowski schrieb sogar pppppp.'],
  [1e4, 'pp – Pianissimo', 'Ein Flüstern im Konzertsaal.'],
  [1e5, 'p – Piano', 'Leise, aber bestimmt.'],
  [1e6, 'mp – Mezzopiano', 'Halbleise. Die Nachbarn werden aufmerksam.'],
  [1e7, 'mf – Mezzoforte', 'Halblaut. Die Nachbarn klopfen.'],
  [1e8, 'f – Forte', 'Laut! Die Nachbarn tanzen mit.'],
  [1e9, 'ff – Fortissimo', 'Sehr laut. Das ganze Viertel tanzt.'],
  [1e10, 'fff – Fortississimo', 'Noch lauter geht es kaum.'],
  [1e11, 'sfz – Sforzando', 'Ein plötzlicher, heftiger Akzent.'],
  [1e12, 'Crescendo', 'Immer lauter, immer mehr.'],
  [1e13, 'Tutti', 'Alle spielen. Alle!'],
  [1e14, 'Maestoso', 'Majestätisch.'],
  [1e15, 'Grandioso', 'Großartig in jeder Hinsicht.'],
  [1e16, 'Furioso', 'Wild und leidenschaftlich.'],
  [1e17, 'Con fuoco', 'Mit Feuer!'],
  [1e18, 'Apotheose', 'Die Vergöttlichung des Klangs.'],
  [1e19, 'Fanfare', 'Trompeten verkünden deinen Ruhm.'],
  [1e20, 'Götterdämmerung', 'Wagner wäre stolz.'],
  [1e21, 'Klangexplosion', 'Die Dezibel-Skala reicht nicht mehr.'],
  [1e22, 'Kakophonie der Sterne', 'Laut genug für andere Galaxien.'],
  [1e24, 'Urknall', 'Der erste Ton des Universums war vermutlich auch nicht leiser.'],
  [1e26, 'Weltenlied', 'Jeder Planet summt mit.'],
  [1e28, 'Unendliche Melodie', 'Wagners Begriff für Musik ohne Ende.'],
  [1e30, 'Jenseits des Fortissimo', 'Es gibt kein Wort mehr dafür.'],
  [1e33, 'Das Universum hört zu', 'Und es applaudiert.'],
];
DYN.forEach(([n, name, flavor], i) => add({
  id: `notes_${i}`, cat: 'Noten', name, flavor, icon: 'musical-notes',
  desc: `Erspiele insgesamt ${fmt(n)} Noten.`, check: (g) => g.state.life.notes >= n,
}));

// --- Noten pro Sekunde (Tempo) ---
const TEMPO = [
  [1, 'Grave', 'Schwer und sehr langsam.'],
  [10, 'Largo', 'Breit.'],
  [100, 'Lento', 'Langsam.'],
  [1e3, 'Adagio', 'Gemächlich.'],
  [1e4, 'Andante', 'Gehend.'],
  [1e5, 'Moderato', 'Mäßig bewegt.'],
  [1e6, 'Allegretto', 'Ein wenig lebhaft.'],
  [1e7, 'Allegro', 'Lebhaft, fröhlich.'],
  [1e8, 'Vivace', 'Lebendig!'],
  [1e9, 'Presto', 'Schnell!'],
  [1e10, 'Prestissimo', 'So schnell wie möglich!'],
  [1e11, 'Accelerando', 'Und noch schneller.'],
  [1e12, 'Hummelflug-Tempo', 'Rimski-Korsakow nickt anerkennend.'],
  [1e13, 'Schallgeschwindigkeit', '343 Meter pro Sekunde.'],
  [1e15, 'Überschall', 'Peng!'],
  [1e17, 'Lichtgeschwindigkeit', 'Musik schneller als ihr eigener Schall.'],
  [1e19, 'Warp-Tempo', 'Das Metronom ist geschmolzen.'],
  [1e21, 'Zeitlos', 'Tempo ist nur noch eine Idee.'],
];
TEMPO.forEach(([n, name, flavor], i) => add({
  id: `nps_${i}`, cat: 'Tempo', name, flavor, icon: 'metronome',
  desc: `Erreiche ${fmt(n)} Noten pro Sekunde.`, check: (g) => g.nps >= n,
}));

// --- Klicks ---
const CLICKS = [
  [1, 'Der erste Anschlag', 'Da war doch was!'],
  [100, 'Fingerübung', 'Übung macht den Meister.'],
  [1000, 'Etüde', 'Chopin schrieb 27 davon.'],
  [5000, 'Toccata', 'Von italienisch „toccare“ – berühren.'],
  [10000, 'Perpetuum mobile', 'Unaufhörlich in Bewegung.'],
  [50000, 'Sehnenscheide in Gefahr', 'Vielleicht eine kleine Pause?'],
  [100000, 'Unermüdlich', 'Legendäre Ausdauer.'],
];
CLICKS.forEach(([n, name, flavor], i) => add({
  id: `clicks_${i}`, cat: 'Klicks', name, flavor, icon: 'piano-keys',
  desc: `Klicke insgesamt ${fmt(n)}-mal.`, check: (g) => g.state.life.clicks >= n,
}));
const HAND = [
  [1e3, 'Handarbeit'], [1e6, 'Handverlesen'], [1e9, 'Goldene Hände'], [1e12, 'Tastenlöwe'], [1e15, 'Hände wie Liszt'], [1e18, 'Hände Gottes'],
];
HAND.forEach(([n, name], i) => add({
  id: `hand_${i}`, cat: 'Klicks', name, flavor: 'Selbstgemacht schmeckt am besten.', icon: 'hand-ok',
  desc: `Erklicke insgesamt ${fmt(n)} Noten.`, check: (g) => g.state.life.handmade >= n,
}));

// --- Instrumente ---
const BNAMES = {
  clap: ['Applaus!', 'Taktvoll', 'Beifallsorkan', 'Das Publikum tobt'],
  drum: ['Erster Schlag', 'Trommelfeuer', 'Trommelwirbel', 'Donnergrollen'],
  flute: ['Steinzeit-Solist', 'Flötentöne', 'Panflöten-Gang', 'Rattenfänger von Hameln'],
  lyre: ['Orpheus-Anwärter', 'Leierkasten', 'Saitenspiel des Olymp', 'Orpheus persönlich'],
  choir: ['Ora et labora', 'Klosterchor', 'Kathedralenhall', 'Himmlische Heerscharen'],
  lute: ['Troubadour', 'Minnesänger', 'Lautenmeister', 'Hofmusikus'],
  organ: ['Registerzieher', 'Orgelpfeifen', 'Pfeifenwald', 'Orgelgott'],
  quartet: ['Kammermusik', 'Streicherteppich', 'Bratschen-Armee', 'Quartett der Quartette'],
  piano: ['Tastenanschlag', 'Salonlöwe', 'Flügel-Park', 'Klavierhimmel'],
  orchestra: ['Tutti!', 'Philharmonie', 'Orchesterlandschaft', 'Ein Heer von Musikern'],
  opera: ['Premiere', 'Opernball', 'Primadonnen-Parade', 'Die Oper ist nie vorbei'],
  jazz: ['Swing Time', 'Jam Session', 'Big-Band-Boom', 'Jazz-Imperium'],
  rock: ['Garagenband', 'Stadionrock', 'Rock am Ring', 'Rock\'n\'Roll-Olymp'],
  synth: ['Strom an!', 'Modularwand', 'Synth-Pop', 'Elektronische Ekstase'],
  dj: ['Resident-DJ', 'Plattenteller-Karussell', 'Clubnacht', 'Parade der Liebe'],
  studio: ['Aufnahme läuft', 'Tonmeister', 'Studio-Imperium', 'Zebrastreifen'],
  stream: ['Erster Stream', 'Viral', 'Algorithmus-Liebling', 'Weltweit auf Repeat'],
  festival: ['Line-up steht', 'Festivalsommer', 'Festival-Kontinent', 'Summer of Love'],
  ai: ['Erwachen', 'Denkende Melodien', 'Synthetische Sinfonie', 'Singularität'],
  spheres: ['Himmelsmechanik', 'Planetenchor', 'Galaktisches Orchester', 'Musica universalis'],
};
const BN = [1, 50, 100, 200];
for (const b of BUILDINGS) {
  BN.forEach((n, i) => add({
    id: `b_${b.id}_${i}`, cat: 'Instrumente', name: BNAMES[b.id][i], icon: b.icon,
    flavor: b.desc,
    desc: n === 1 ? `Besitze ${b.one}.` : `Besitze ${n} ${b.plural}.`,
    check: (g) => (g.state.run.buildings[b.id] || 0) >= n,
  }));
}
[[100, 'Kleines Ensemble'], [500, 'Kammerorchester'], [1000, 'Musikalische Großstadt'], [2500, 'Musikmetropole'], [5000, 'Klangimperium']].forEach(([n, name], i) => add({
  id: `ball_${i}`, cat: 'Instrumente', name, icon: 'meeple-group', flavor: 'Mehr ist mehr.',
  desc: `Besitze ${fmt(n)} Instrumente gleichzeitig.`, check: (g) => g.totalBuildings() >= n,
}));
[[10, 'Weiterbildung'], [50, 'Meisterklasse'], [100, 'Hochschulabschluss'], [200, 'Professur']].forEach(([n, name], i) => add({
  id: `ups_${i}`, cat: 'Instrumente', name, icon: 'upgrade', flavor: 'Lebenslanges Lernen.',
  desc: `Besitze ${n} Upgrades in einem Durchgang.`, check: (g) => g.upgradeCount() >= n,
}));

// --- Goldene Noten ---
[[1, 'Goldkehlchen'], [7, 'Glückssträhne'], [27, 'Goldrausch'], [77, 'Midas-Hände'], [177, 'Schatzkammer'], [777, 'Goldene Ära']].forEach(([n, name], i) => add({
  id: `gold_${i}`, cat: 'Goldene Noten', name, icon: 'sparkles', flavor: 'Alles, was glänzt.',
  desc: `Fange ${n} goldene Note${n > 1 ? 'n' : ''}.`, check: (g) => g.state.life.golden >= n,
}));

// --- Rhythmus ---
[[16, 'Im Takt'], [32, 'Groovy'], [64, 'Tight'], [128, 'Rhythmusmaschine'], [256, 'Metronom-Mensch'], [512, 'Unaufhaltsam']].forEach(([n, name], i) => add({
  id: `combo_${i}`, cat: 'Rhythmus', name, icon: 'heart-beats', flavor: 'Eins, zwei, drei, vier …',
  desc: `Erreiche eine Takt-Kombo von ${n}.`, check: (g) => g.state.life.maxCombo >= n,
}));
[[100, 'Taktgefühl'], [1000, 'Präzisionsarbeit'], [10000, 'Taktmeister'], [50000, 'Lebendes Metronom']].forEach(([n, name], i) => add({
  id: `perfect_${i}`, cat: 'Rhythmus', name, icon: 'metronome', flavor: 'Genau auf den Punkt.',
  desc: `Triff ${fmt(n)}-mal perfekt im Takt.`, check: (g) => g.state.life.perfectHits >= n,
}));
add({ id: 'perfectStreak', cat: 'Rhythmus', name: 'Uhrwerk', icon: 'clockwork', flavor: 'Kein Tick daneben.',
  desc: 'Triff 50-mal hintereinander perfekt.', check: (g) => g.state.life.bestPerfectStreak >= 50 });

// --- Legenden ---
[[1, 'Erste Begegnung'], [5, 'Salon'], [15, 'Hall of Fame'], [30, 'Pantheon'], [LEGENDS.length, 'Unsterblich']].forEach(([n, name], i) => add({
  id: `leg_${i}`, cat: 'Legenden', name, icon: 'laurel-crown', flavor: 'Auf den Schultern von Riesen.',
  desc: n === LEGENDS.length ? 'Schalte alle Legenden frei.' : `Schalte ${n} Legende${n > 1 ? 'n' : ''} frei.`,
  check: (g) => Object.keys(g.state.legends).length >= n,
}));
add({ id: 'legMax', cat: 'Legenden', name: 'Meisterschüler', icon: 'star-medal', flavor: 'Du hast viel gelernt.',
  desc: 'Bringe eine Legende auf Stufe 10.', check: (g) => Object.values(g.state.legends).some((l) => l.level >= 10) });

// --- Harmonielehre ---
add({ id: 'th_1', cat: 'Harmonielehre', name: 'Erste Lektion', icon: 'g-clef', flavor: 'Do, Re, Mi …', desc: 'Erlerne eine Tonart im Quintenzirkel.', check: (g) => g.theoryCount() >= 1 });
add({ id: 'th_major', cat: 'Harmonielehre', name: 'Der Zirkel schließt sich', icon: 'g-clef', flavor: 'Zwölf Quinten und ein Komma.', desc: 'Erlerne alle Dur-Tonarten.', check: (g) => CIRCLE.filter((c) => c.ring === 'major').every((c) => g.state.theory[c.id]) });
add({ id: 'th_minor', cat: 'Harmonielehre', name: 'Parallelwelten', icon: 'f-clef', flavor: 'Jede Dur-Tonart hat eine Moll-Schwester.', desc: 'Erlerne alle Moll-Tonarten.', check: (g) => CIRCLE.filter((c) => c.ring === 'minor').every((c) => g.state.theory[c.id]) });
add({ id: 'th_modes', cat: 'Harmonielehre', name: 'Modal', icon: 'musical-score', flavor: 'Sieben Farben einer Tonleiter.', desc: 'Erlerne alle sieben Modi.', check: (g) => MODES.every((m) => g.state.modesUnlocked[m.id]) });
add({ id: 'th_rhythm', cat: 'Harmonielehre', name: 'Rhythmusgelehrte', icon: 'metronome', flavor: 'Von der Viertelnote bis zur Polyrhythmik.', desc: 'Erlerne alle Rhythmik-Lektionen.', check: (g) => RHYTHM.every((r) => g.state.theory[r.id]) });
add({ id: 'th_locrian', cat: 'Harmonielehre', name: 'Lokrischer Wahnsinn', icon: 'crowned-skull', flavor: 'Mutig.', desc: 'Spiele im lokrischen Modus.', check: (g) => g.state.mode === 'locrian' });

// --- Raritäten ---
[[1, 'Sammler'], [10, 'Kurator'], [25, 'Museum'], [RELICS.length, 'Musikhistorisches Museum']].forEach(([n, name], i) => add({
  id: `rel_${i}`, cat: 'Raritäten', name, icon: 'open-treasure-chest', flavor: 'Staub wischen nicht vergessen.',
  desc: n === RELICS.length ? 'Finde alle Raritäten.' : `Finde ${n} verschiedene Raritäten.`, check: (g) => Object.keys(g.state.relics).length >= n,
}));
add({ id: 'rel_myth', cat: 'Raritäten', name: 'Mythos', icon: 'crystal-shine', flavor: 'Es gibt sie also doch.', desc: 'Finde eine mythische Rarität.', check: (g) => RELICS.some((r) => r.rarity === 'mythic' && g.state.relics[r.id]) });
add({ id: 'rel_max', cat: 'Raritäten', name: 'Vollständige Edition', icon: 'gems', flavor: 'Fünf Sterne.', desc: 'Bringe eine Rarität auf die höchste Stufe.', check: (g) => Object.values(g.state.relics).some((n) => n >= 5) });

// --- Konzerte ---
[[1, 'Erster Auftritt'], [10, 'Tourneestart'], [50, 'Welttournee'], [200, 'Never Ending Tour'], [500, 'Lebende Legende']].forEach(([n, name], i) => add({
  id: `gig_${i}`, cat: 'Konzerte', name, icon: 'ticket', flavor: 'Die Show muss weitergehen.',
  desc: `Spiele ${n} Konzert${n > 1 ? 'e' : ''}.`, check: (g) => g.state.life.gigsDone >= n,
}));

// --- Da Capo & Ruhm ---
[[1, 'Da Capo'], [3, 'Dal Segno'], [10, 'Wiederholungszeichen'], [25, 'Endlosschleife'], [50, 'Ewige Wiederkunft']].forEach(([n, name], i) => add({
  id: `dc_${i}`, cat: 'Ruhm', name, icon: 'anticlockwise-rotation', flavor: 'Noch einmal von vorn – aber besser.',
  desc: `Beginne ${n}-mal Da Capo.`, check: (g) => g.state.life.daCapos >= n,
}));
[[10, 'Gold'], [100, 'Platin'], [1000, 'Diamant'], [10000, 'Doppel-Diamant'], [100000, 'Unbezahlbar']].forEach(([n, name], i) => add({
  id: `rec_${i}`, cat: 'Ruhm', name, icon: 'compact-disc', flavor: 'Für die Wand im Flur.',
  desc: `Besitze ${fmt(n)} Goldene Schallplatten.`, check: (g) => g.state.records >= n,
}));
[[10, 'Ideenreich'], [100, 'Musenkuss'], [1000, 'Genie'], [10000, 'Göttlicher Funke']].forEach(([n, name], i) => add({
  id: `insp_${i}`, cat: 'Ruhm', name, icon: 'light-bulb', flavor: 'Ein Geistesblitz jagt den nächsten.',
  desc: `Sammle insgesamt ${fmt(n)} Inspiration.`, check: (g) => g.state.life.inspEarned >= n,
}));
GENRES.forEach((gen) => add({
  id: `genre_${gen.id}`, cat: 'Ruhm', name: `Genre: ${gen.name}`, icon: gen.icon, flavor: gen.text,
  desc: `Spiele einen Durchgang im Genre ${gen.name}.`, check: (g) => g.state.run.genre === gen.id,
}));

// --- Wettbewerbe ---
add({ id: 'ch_1', cat: 'Ruhm', name: 'Preisträger', icon: 'podium-winner', flavor: 'Erster Preis!', desc: 'Gewinne einen Wettbewerb.', check: (g) => Object.keys(g.state.challengesDone || {}).length >= 1 });
add({ id: 'ch_all', cat: 'Ruhm', name: 'Meister aller Klassen', icon: 'diamond-trophy', flavor: 'Kein Wettbewerb ist dir zu schwer.', desc: 'Gewinne alle Wettbewerbe.', check: (g) => Object.keys(g.state.challengesDone || {}).length >= CHALLENGES.length });

// --- Epochen ---
ERAS.forEach((era) => add({
  id: `era_${era.id}`, cat: 'Epochen', name: era.name, icon: era.icon, flavor: era.years,
  desc: `Erreiche die Epoche ${era.name}.`, check: (g) => !!g.state.discovered['e_' + era.id],
}));

// --- Geheim & Kurios ---
const S = (a) => add({ cat: 'Geheim', secret: true, ...a });
S({ id: 's_silence', name: '4′33″', icon: 'sound-off', flavor: 'Die Stille ist auch Musik.', desc: 'Klicke 4 Minuten und 33 Sekunden lang nicht.', check: (g) => g.state.flags.silence433 });
S({ id: 's_night', name: 'Nachtmusik', icon: 'night-sky', flavor: 'Eine kleine Nachtmusik – um diese Uhrzeit?', desc: 'Spiele zwischen 0 und 4 Uhr nachts.', check: () => { const h = new Date().getHours(); return h >= 0 && h < 4; } });
S({ id: 's_xmas', name: 'Stille Nacht', icon: 'candles', flavor: 'Uraufgeführt 1818 in Oberndorf bei Salzburg – mit Gitarrenbegleitung.', desc: 'Spiele an Heiligabend.', check: () => { const d = new Date(); return d.getMonth() === 11 && d.getDate() === 24; } });
S({ id: 's_newyear', name: 'Neujahrskonzert', icon: 'champagne-cork', flavor: 'Prosit Neujahr – mit dem Radetzky-Marsch.', desc: 'Spiele am 1. Januar.', check: () => { const d = new Date(); return d.getMonth() === 0 && d.getDate() === 1; } });
S({ id: 's_fete', name: 'Fête de la Musique', icon: 'party-popper', flavor: 'Seit 1982 wird am 21. Juni überall auf der Straße musiziert.', desc: 'Spiele am 21. Juni.', check: () => { const d = new Date(); return d.getMonth() === 5 && d.getDate() === 21; } });
S({ id: 's_ludwig', name: 'Alles Gute, Ludwig!', icon: 'cake-slice', flavor: 'Beethoven wurde am 17. Dezember 1770 in Bonn getauft.', desc: 'Spiele am 17. Dezember.', check: () => { const d = new Date(); return d.getMonth() === 11 && d.getDate() === 17; } });
S({ id: 's_bumble', name: 'Hummelflug', icon: 'hummingbird', flavor: 'Bsssss!', desc: 'Klicke 12-mal in einer Sekunde.', check: (g) => g.state.life.bestCps >= 12 });
S({ id: 's_minimal', name: 'Minimal Music', icon: 'sound-waves', flavor: 'Steve Reich und Philip Glass nicken zufrieden.', desc: 'Erreiche 1 Milliarde Noten in einem Durchgang mit höchstens 15 Instrumenten.', check: (g) => g.state.run.total >= 1e9 && g.totalBuildings() <= 15 });
S({ id: 's_noclick', name: 'Nur Zuhören', icon: 'headphones', flavor: 'Manchmal ist Zuhören die größte Kunst.', desc: 'Erreiche 10 Millionen Noten in einem Durchgang mit höchstens 15 Klicks.', check: (g) => g.state.run.total >= 1e7 && g.state.run.clicks <= 15 });
S({ id: 's_logo', name: 'Crescendo!', icon: 'g-clef', flavor: 'Du hast den Titel gefunden. Er wird lauter.', desc: 'Klicke 10-mal auf das Logo.', check: (g) => g.state.flags.logoClicks >= 10 });
S({ id: 's_eleven', name: 'Eins lauter', icon: 'speaker', flavor: 'Diese Regler gehen bis elf.', desc: 'Drehe die Gesamtlautstärke ganz auf.', check: (g) => g.state.settings.master >= 1 && g.state.flags.volumeTouched });
S({ id: 's_mute', name: 'Pssst!', icon: 'sound-off', flavor: 'Auch Stille hat ihre Momente.', desc: 'Schalte die Musik stumm.', check: (g) => g.state.flags.muted });
S({ id: 's_calib', name: 'Wohltemperiert', icon: 'tuning-fork', flavor: 'Bach wäre zufrieden.', desc: 'Kalibriere die Latenz.', check: (g) => g.state.flags.calibrated });
S({ id: 's_lexicon', name: 'Wandelndes Lexikon', icon: 'book-pile', flavor: 'Du weißt jetzt mehr über Musik als die meisten Musiker.', desc: 'Entdecke alle Lexikon-Einträge.', check: (g) => g.lexiconComplete() });
S({ id: 's_seasons', name: 'Ein ganzes Jahr', icon: 'falling-leaf', flavor: 'Frühling, Sommer, Herbst und Winter.', desc: 'Erlebe mit Vivaldi alle vier Jahreszeiten.', check: (g) => g.state.flags.seasons >= 4 });
S({ id: 's_bolero', name: 'Bis zum Schluss', icon: 'drum', flavor: '15 Minuten Crescendo, ohne abzubrechen.', desc: 'Höre einen ganzen Boléro.', check: (g) => g.state.flags.boleroDone });
S({ id: 's_riot', name: 'Skandal!', icon: 'lightning-helix', flavor: 'Paris, 29. Mai 1913.', desc: 'Erlebe den höchsten Ausschlag von Le Sacre.', check: (g) => g.state.flags.sacreMax });

// --- Melodien am Übungsklavier ---
MELODIES.forEach((m) => add({
  id: `mel_${m.id}`, cat: 'Melodien', secret: true, name: m.name, icon: 'piano-keys', flavor: m.by,
  desc: `Spiele „${m.name}“ am Übungsklavier.`, hint: m.hint, check: (g) => !!g.state.melodies[m.id],
}));
add({ id: 'mel_5', cat: 'Melodien', name: 'Gehörbildung', icon: 'human-ear', flavor: 'Du erkennst Melodien im Schlaf.', desc: 'Entdecke 5 Melodien am Übungsklavier.', check: (g) => Object.keys(g.state.melodies).length >= 5 });
add({ id: 'mel_all', cat: 'Melodien', name: 'Wandelnde Jukebox', icon: 'audio-cassette', flavor: 'Wünsch dir was!', desc: 'Entdecke alle Melodien am Übungsklavier.', check: (g) => Object.keys(g.state.melodies).length >= MELODIES.length });

export const ACH_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
export const ACH_CATS = [...new Set(ACHIEVEMENTS.map((a) => a.cat))];
