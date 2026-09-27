// Harmonielehre: Quintenzirkel, Kirchentonarten (Modi) und Rhythmik – bezahlt mit Inspiration ✦

// Positionen im Zirkel (0 = oben, im Uhrzeigersinn). pos 6 enthält Fis und Ges.
export const CIRCLE = [
  // Dur (außen)
  { id: 'C', name: 'C-Dur', pos: 0, ring: 'major', acc: '', cost: 5, fx: [{ t: 'prod', v: 1.1 }], text: 'Produktion +10 %', lore: 'Die „weiße“ Tonart ohne Vorzeichen – auf dem Klavier nur weiße Tasten. Beethoven, Mozart und Haydn schrieben hier ihre festlichsten Werke.' },
  { id: 'G', name: 'G-Dur', pos: 1, ring: 'major', acc: '1♯', cost: 10, fx: [{ t: 'click', v: 1.5 }], text: 'Klickkraft +50 %', lore: 'Ein Kreuz: Fis. Hell, ländlich, fröhlich – die Tonart vieler Volkslieder und von Mozarts „Eine kleine Nachtmusik“.' },
  { id: 'D', name: 'D-Dur', pos: 2, ring: 'major', acc: '2♯', cost: 20, fx: [{ t: 'grooveMax', v: 0.2 }], text: 'Maximaler Groove +20 %', lore: 'Die Tonart der Trompeten und Pauken, strahlend und festlich. Händels „Halleluja“ steht in D-Dur – ebenso Pachelbels Kanon.' },
  { id: 'A', name: 'A-Dur', pos: 3, ring: 'major', acc: '3♯', cost: 40, fx: [{ t: 'prod', v: 1.15 }], text: 'Produktion +15 %', lore: 'Warm und sonnig. Mozarts Klarinettenkonzert und Beethovens 7. Sinfonie leuchten in A-Dur. Der Kammerton a\' (440 Hz) ist der Stimmton des Orchesters.' },
  { id: 'E', name: 'E-Dur', pos: 4, ring: 'major', acc: '4♯', cost: 80, fx: [{ t: 'crit', v: 0.03 }], text: 'Volltreffer-Chance +3 %', lore: 'Brillant und durchdringend – die Tonart des „Frühlings“ in Vivaldis Vier Jahreszeiten. Gitarristen lieben sie, weil die leeren Saiten mitschwingen.' },
  { id: 'H', name: 'H-Dur', pos: 5, ring: 'major', acc: '5♯', cost: 160, fx: [{ t: 'click', v: 2 }], text: 'Klickkraft ×2', lore: 'Fünf Kreuze. Übrigens: „H“ gibt es vor allem im deutschsprachigen Raum (auch in Skandinavien und Osteuropa) – im Englischen heißt der Ton B. Unser „B“ ist dort ein B-flat.' },
  { id: 'Fis', name: 'Fis-Dur', pos: 6, ring: 'major', acc: '6♯', cost: 320, fx: [{ t: 'prod', v: 1.25 }], text: 'Produktion +25 %', lore: 'Sechs Kreuze – und klingt doch genauso wie Ges-Dur mit sechs Bs. Diese „enharmonische Verwechslung“ schließt den Quintenzirkel.' },
  { id: 'Ges', name: 'Ges-Dur', pos: 6, ring: 'major', acc: '6♭', cost: 320, fx: [{ t: 'prod', v: 1.25 }], text: 'Produktion +25 %', lore: 'Die Tonart der schwarzen Tasten: In Chopins „Black Key“-Etüde spielt die rechte Hand fast nur auf ihnen.' },
  { id: 'Des', name: 'Des-Dur', pos: 7, ring: 'major', acc: '5♭', cost: 160, fx: [{ t: 'insp', v: 1.15 }], text: 'Inspiration +15 %', lore: 'Weich und träumerisch. Debussys „Clair de Lune“ schwebt in Des-Dur.' },
  { id: 'As', name: 'As-Dur', pos: 8, ring: 'major', acc: '4♭', cost: 80, fx: [{ t: 'gigSpeed', v: 1.15 }], text: 'Konzerte 15 % schneller', lore: 'Feierlich und warm. Beethovens „Pathétique“ hat einen berühmten langsamen Satz in As-Dur.' },
  { id: 'Es', name: 'Es-Dur', pos: 9, ring: 'major', acc: '3♭', cost: 40, fx: [{ t: 'goldFreq', v: 1.1 }], text: 'Goldene Noten +10 % häufiger', lore: 'Drei Bs – die Zahl der Freimaurer. Mozarts „Zauberflöte“ beginnt mit drei Es-Dur-Akkorden. Beethovens heroische „Eroica“ steht ebenfalls in Es.' },
  { id: 'B', name: 'B-Dur', pos: 10, ring: 'major', acc: '2♭', cost: 20, fx: [{ t: 'cost', v: 0.97 }], text: 'Instrumente 3 % günstiger', lore: 'Die Tonart der Blasmusik: Trompeten, Klarinetten und Saxofone sind oft in B gestimmt.' },
  { id: 'F', name: 'F-Dur', pos: 11, ring: 'major', acc: '1♭', cost: 10, fx: [{ t: 'offline', v: 0.15 }], text: 'Offline-Produktion +15 %-Punkte', lore: 'Ländlich und friedlich – Beethovens „Pastorale“, die 6. Sinfonie, malt in F-Dur Bäche, Vögel und ein Gewitter.' },
  // Moll (innen) – Paralleltonarten
  { id: 'a', name: 'a-Moll', pos: 0, ring: 'minor', rel: 'C', acc: '', cost: 10, fx: [{ t: 'insp', v: 1.1 }], text: 'Inspiration +10 %', lore: 'Die Paralleltonart von C-Dur – ebenfalls ohne Vorzeichen. Beethovens „Für Elise“ beginnt in a-Moll.' },
  { id: 'e', name: 'e-Moll', pos: 1, ring: 'minor', rel: 'G', acc: '1♯', cost: 15, fx: [{ t: 'idle', v: 1.2 }], text: 'Ohne Klick seit 30 Sek.: Produktion +20 %', lore: 'Nachdenklich und sanft. Dvořáks Sinfonie „Aus der Neuen Welt“ steht in e-Moll.' },
  { id: 'h', name: 'h-Moll', pos: 2, ring: 'minor', rel: 'D', acc: '2♯', cost: 30, fx: [{ t: 'goldDur', v: 1.1 }], text: 'Effekte goldener Noten +10 % länger', lore: 'Bachs gewaltige „h-Moll-Messe“ und Schuberts „Unvollendete“ stehen in h-Moll.' },
  { id: 'fis', name: 'fis-Moll', pos: 3, ring: 'minor', rel: 'A', acc: '3♯', cost: 60, fx: [{ t: 'prod', v: 1.1 }], text: 'Produktion +10 %', lore: 'Leidenschaftlich und düster. Haydns „Abschiedssinfonie“ – bei der die Musiker nacheinander ihre Kerzen löschen – steht in fis-Moll.' },
  { id: 'cis', name: 'cis-Moll', pos: 4, ring: 'minor', rel: 'E', acc: '4♯', cost: 120, fx: [{ t: 'goldLife', v: 1.2 }], text: 'Goldene Noten bleiben 20 % länger', lore: 'Mondlicht auf dem Vierwaldstättersee: So beschrieb ein Kritiker Beethovens „Mondscheinsonate“ in cis-Moll.' },
  { id: 'gis', name: 'gis-Moll', pos: 5, ring: 'minor', rel: 'H', acc: '5♯', cost: 240, fx: [{ t: 'grooveGain', v: 1.15 }], text: 'Groove baut sich 15 % schneller auf', lore: 'Selten und geheimnisvoll. Liszts „La Campanella“ läutet in gis-Moll.' },
  { id: 'dis', name: 'dis-Moll', pos: 6, ring: 'minor', rel: 'Fis', acc: '6♯', cost: 480, fx: [{ t: 'prod', v: 1.2 }], text: 'Produktion +20 %', lore: 'Sechs Kreuze in Moll – fast niemand schreibt freiwillig in dieser Tonart. Skrjabin tat es trotzdem.' },
  { id: 'es', name: 'es-Moll', pos: 6, ring: 'minor', rel: 'Ges', acc: '6♭', cost: 480, fx: [{ t: 'prod', v: 1.2 }], text: 'Produktion +20 %', lore: 'Klingt wie dis-Moll, sieht aber ganz anders aus. Bach notierte im Wohltemperierten Klavier das Präludium Nr. 8 in es-Moll – und die zugehörige Fuge in dis-Moll.' },
  { id: 'b', name: 'b-Moll', pos: 7, ring: 'minor', rel: 'Des', acc: '5♭', cost: 240, fx: [{ t: 'insp', v: 1.15 }], text: 'Inspiration +15 %', lore: 'Chopins berühmter Trauermarsch aus der 2. Klaviersonate steht in b-Moll.' },
  { id: 'f', name: 'f-Moll', pos: 8, ring: 'minor', rel: 'As', acc: '4♭', cost: 120, fx: [{ t: 'offline', v: 0.15 }], text: 'Offline-Produktion +15 %-Punkte', lore: 'Beethovens stürmische „Appassionata“ wütet in f-Moll – ebenso der „Winter“ aus Vivaldis Vier Jahreszeiten.' },
  { id: 'c', name: 'c-Moll', pos: 9, ring: 'minor', rel: 'Es', acc: '3♭', cost: 60, fx: [{ t: 'critMult', v: 2 }], text: 'Volltreffer-Multiplikator +2', lore: 'Die Schicksalstonart: Beethovens 5. Sinfonie – „So pocht das Schicksal an die Pforte“ – beginnt in c-Moll.' },
  { id: 'g', name: 'g-Moll', pos: 10, ring: 'minor', rel: 'B', acc: '2♭', cost: 30, fx: [{ t: 'gigReward', v: 1.2 }], text: 'Konzert-Belohnungen +20 %', lore: 'Mozarts Lieblings-Molltonart: Seine 40. Sinfonie in g-Moll ist eine der meistgespielten der Welt.' },
  { id: 'd', name: 'd-Moll', pos: 11, ring: 'minor', rel: 'F', acc: '1♭', cost: 15, fx: [{ t: 'relicLuck', v: 1.1 }], text: 'Fundchance für Raritäten +10 %', lore: 'Ernst und würdevoll: Mozarts Requiem, Bachs Toccata und Beethovens 9. Sinfonie. In einem berühmten Film wird d-Moll „die traurigste aller Tonarten“ genannt.' },
];
export const CIRCLE_BY_ID = Object.fromEntries(CIRCLE.map((n) => [n.id, n]));

// Nachbarn im Quintenzirkel (für Freischaltung). Fis grenzt an H, Ges an Des.
const MAJOR_NEIGH = {
  C: ['G', 'F'], G: ['C', 'D'], D: ['G', 'A'], A: ['D', 'E'], E: ['A', 'H'], H: ['E', 'Fis'],
  Fis: ['H'], Ges: ['Des'], Des: ['Ges', 'As'], As: ['Des', 'Es'], Es: ['As', 'B'], B: ['Es', 'F'], F: ['B', 'C'],
};
export function circleAvailable(id, owned) {
  const n = CIRCLE_BY_ID[id];
  if (owned[id]) return false;
  if (n.ring === 'minor') return !!owned[n.rel];
  if (id === 'C') return true;
  return MAJOR_NEIGH[id].some((x) => owned[x]);
}
export const CIRCLE_BONUS = {
  enharmonic: { name: 'Enharmonische Verwechslung', text: 'Fis-Dur und Ges-Dur: Produktion ×1,25', fx: [{ t: 'prod', v: 1.25 }] },
  allMajor: { name: 'Der Zirkel schließt sich', text: 'Alle Dur-Tonarten: Produktion ×1,5', fx: [{ t: 'prod', v: 1.5 }] },
  allMinor: { name: 'Parallelwelten', text: 'Alle Moll-Tonarten: Inspiration ×1,5', fx: [{ t: 'insp', v: 1.5 }] },
};

// Kirchentonarten
export const MODES = [
  { id: 'ionian', name: 'Ionisch', alias: 'Dur', steps: [0, 2, 4, 5, 7, 9, 11], cost: 0,
    mood: 'Hell und ausgeglichen', fx: [{ t: 'prod', v: 1.1 }], text: 'Produktion +10 %',
    lore: 'Der ionische Modus ist unsere heutige Dur-Tonleiter. Im Mittelalter galt er als „lasziv“ und wurde lange gemieden – heute steht fast jeder Popsong in Dur.' },
  { id: 'aeolian', name: 'Äolisch', alias: 'Moll', steps: [0, 2, 3, 5, 7, 8, 10], cost: 25,
    mood: 'Melancholisch und inspirierend', fx: [{ t: 'insp', v: 1.3 }], text: 'Inspiration +30 %',
    lore: 'Der äolische Modus entspricht dem natürlichen Moll. Die kleine Terz gibt ihm seinen traurig-sehnsüchtigen Charakter.' },
  { id: 'mixolydian', name: 'Mixolydisch', alias: 'Dur mit kleiner Septime', steps: [0, 2, 4, 5, 7, 9, 10], cost: 50,
    mood: 'Rockig, bluesig, auf Tour', fx: [{ t: 'gigReward', v: 1.5 }, { t: 'gigSpeed', v: 1.2 }], text: 'Konzert-Belohnungen +50 %, Konzerte 20 % schneller',
    lore: 'Dur mit einer kleinen Septime – der Klang von Blues, Rock und keltischer Musik. Die Dudelsackmelodien Schottlands sind oft mixolydisch.' },
  { id: 'dorian', name: 'Dorisch', alias: 'Moll mit großer Sexte', steps: [0, 2, 3, 5, 7, 9, 10], cost: 75,
    mood: 'Jazzig und funky', fx: [{ t: 'grooveMax', v: 0.3 }, { t: 'grooveGain', v: 1.2 }], text: 'Maximaler Groove +30 %, Groove-Aufbau +20 %',
    lore: 'Moll mit einer hellen, großen Sexte: melancholisch, aber mit Hoffnung. Der Modus des Jazz, des Funk und von „Scarborough Fair“.' },
  { id: 'lydian', name: 'Lydisch', alias: 'Dur mit übermäßiger Quarte', steps: [0, 2, 4, 6, 7, 9, 11], cost: 125,
    mood: 'Schwebend und magisch', fx: [{ t: 'goldFreq', v: 1.3 }], text: 'Goldene Noten +30 % häufiger',
    lore: 'Die erhöhte Quarte lässt Lydisch schweben, als ob die Schwerkraft fehlte. Filmkomponisten nutzen ihn für Magie, Flug und Staunen.' },
  { id: 'phrygian', name: 'Phrygisch', alias: 'Moll mit kleiner Sekunde', steps: [0, 1, 3, 5, 7, 8, 10], cost: 200,
    mood: 'Feurig und spanisch', fx: [{ t: 'crit', v: 0.08 }, { t: 'critMult', v: 3 }], text: 'Volltreffer-Chance +8 %, Multiplikator +3',
    lore: 'Die kleine Sekunde gleich zu Beginn klingt nach Flamenco und Andalusien – und nach Heavy Metal.' },
  { id: 'locrian', name: 'Lokrisch', alias: 'der Instabile', steps: [0, 1, 3, 5, 6, 8, 10], cost: 375,
    mood: 'Instabil und riskant', fx: [{ t: 'prod', v: 1.6 }, { t: 'goldFreq', v: 0.5 }], text: 'Produktion +60 %, aber goldene Noten nur halb so oft',
    lore: 'Der Grundakkord ist vermindert – Lokrisch findet nie zur Ruhe. Lange galt er als rein theoretisch; heute nutzen ihn Metal-Bands für maximale Düsternis.' },
];
export const MODE_BY_ID = Object.fromEntries(MODES.map((m) => [m.id, m]));

// Rhythmik: lineare Lektionen
export const RHYTHM = [
  { id: 'r_eighth', name: 'Achtelnoten', cost: 40, fx: [{ t: 'eighths', v: 1 }], text: 'Treffer auf den Achteln zwischen den Schlägen zählen ebenfalls',
    lore: 'Eine Viertelnote teilt sich in zwei Achtel. Plötzlich gibt es doppelt so viele Gelegenheiten, im Takt zu sein.' },
  { id: 'r_dotted', name: 'Punktierte Rhythmen', cost: 60, fx: [{ t: 'window', v: 1.25 }], text: 'Treffer-Fenster +25 %',
    lore: 'Ein Punkt hinter der Note verlängert sie um die Hälfte ihres Wertes. Der typische „Lang-kurz“-Rhythmus der französischen Ouvertüre.' },
  { id: 'r_synco', name: 'Synkopen', cost: 100, fx: [{ t: 'syncopation', v: 0.5 }], text: 'Treffer auf dem Offbeat geben +50 % Groove',
    lore: 'Die Betonung rutscht auf die „unbetonte“ Zählzeit. Ohne Synkopen kein Ragtime, kein Jazz, kein Funk.' },
  { id: 'r_triplet', name: 'Triolen', cost: 150, fx: [{ t: 'comboEvery', v: 16 }], text: 'Inspiration schon alle 16 statt 24 Kombo-Treffer',
    lore: 'Drei Noten im Raum von zweien. Triolen geben dem Swing seine rollende Leichtigkeit.' },
  { id: 'r_rubato', name: 'Rubato', cost: 225, fx: [{ t: 'rubato', v: 1 }], text: 'Danebengeklickt? Kein Groove-Verlust mehr',
    lore: '„Geraubte Zeit“: Der Interpret dehnt und drängt das Tempo nach Gefühl. Chopin war ein Meister des Rubato.' },
  { id: 'r_poly', name: 'Polyrhythmik', cost: 350, fx: [{ t: 'grooveDecay', v: 0.5 }], text: 'Groove fällt 50 % langsamer ab',
    lore: 'Drei gegen zwei, vier gegen drei: Mehrere Rhythmen gleichzeitig. In westafrikanischer Trommelmusik ist das Alltag.' },
  { id: 'r_master', name: 'Groove-Meister', cost: 500, fx: [{ t: 'grooveMax', v: 1 }], text: 'Maximaler Groove +100 %',
    lore: 'Du denkst nicht mehr über den Beat nach. Du bist der Beat.' },
];
export const RHYTHM_BY_ID = Object.fromEntries(RHYTHM.map((r) => [r.id, r]));

// Musiktheorie-Helfer für Audio: Tonart-Grundtöne (MIDI, Oktave 4)
export const KEY_ROOT = { C: 60, G: 67, D: 62, A: 69, E: 64, H: 71, Fis: 66, Ges: 66, Des: 61, As: 68, Es: 63, B: 70, F: 65,
  a: 69, e: 64, h: 71, fis: 66, cis: 61, gis: 68, dis: 63, es: 63, b: 70, f: 65, c: 60, g: 67, d: 62 };
