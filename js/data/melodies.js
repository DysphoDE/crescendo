// Geheime Melodien für das Übungsklavier. Erkennung über Intervallfolgen (transpositionsunabhängig),
// bei abs: true über Tonklassen (absolute Tonhöhe, Oktave egal).

const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
export function parseNotes(str) {
  return str.trim().split(/\s+/).map((n) => {
    const m = n.match(/^([A-G][#b]?)(-?\d)$/);
    return 12 * (parseInt(m[2], 10) + 1) + NOTE[m[1]];
  });
}

export const MELODIES = [
  { id: 'elise', name: 'Für Elise', by: 'Ludwig van Beethoven, um 1810', notes: 'E5 D#5 E5 D#5 E5 B4 D5 C5 A4', insp: 8,
    hint: 'Ein Albumblatt für eine gewisse Elise – vielleicht hieß sie in Wahrheit Therese. Es beginnt mit einem Hin und Her zwischen E und Dis …',
    lore: 'Das Albumblatt wurde erst 40 Jahre nach Beethovens Tod entdeckt. Ob „Elise“ ein Lesefehler für „Therese“ ist, weiß bis heute niemand genau.' },
  { id: 'ode', name: 'Ode an die Freude', by: 'Ludwig van Beethoven, 1824', notes: 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4 D4 D4', insp: 8,
    hint: 'Die Europahymne. Sie beginnt mit zwei gleichen Tönen und steigt dann Schritt für Schritt: E, E, F, G …',
    lore: 'Das Finale der 9. Sinfonie vertont Schillers Gedicht. Seit 1985 ist die Melodie die offizielle Hymne der Europäischen Gemeinschaft – heute der EU.' },
  { id: 'entchen', name: 'Alle meine Entchen', by: 'Volkslied', notes: 'C4 D4 E4 F4 G4 G4 A4 A4 A4 A4 G4', insp: 5,
    hint: 'Das erste Lied, das fast jedes Kind am Klavier lernt. Köpfchen in das Wasser …',
    lore: 'Das Kinderlied ist seit dem 19. Jahrhundert überliefert und besteht fast nur aus einer aufsteigenden Tonleiter – ideal für Anfänger.' },
  { id: 'schicksal', name: 'Das Schicksalsmotiv', by: 'Ludwig van Beethoven, 5. Sinfonie', notes: 'G4 G4 G4 D#4', insp: 6,
    hint: 'Dreimal kurz, einmal lang – so pocht das Schicksal an die Pforte.',
    lore: 'Die vier Töne sind das berühmteste Motiv der Musikgeschichte. Im Zweiten Weltkrieg nutzte die BBC es als Erkennungszeichen – im Morsecode steht kurz-kurz-kurz-lang für „V“ wie Victory.' },
  { id: 'bach', name: 'B–A–C–H', by: 'Johann Sebastian Bach', notes: 'A#4 A4 C5 B4', abs: true, insp: 10,
    hint: 'Ein Komponist, dessen Name selbst eine Melodie ist. Denk an die deutschen Notennamen: Das B liegt einen Halbton über dem A …',
    lore: 'In deutscher Notation entspricht B dem englischen B-flat und H dem englischen B. So wird B-A-C-H zur chromatischen Tonfolge. Bach selbst nutzte sie in der „Kunst der Fuge“, nach ihm Liszt, Schumann und viele andere.' },
  { id: 'tritonus', name: 'Diabolus in musica', by: 'Mittelalterliche Musiktheorie', notes: 'C4 F#4', insp: 4,
    hint: 'Das Intervall aus drei Ganztönen galt einst als Teufelswerk.',
    lore: 'Der Tritonus teilt die Oktave genau in der Mitte. Im Mittelalter galt er als „Teufel in der Musik“ und wurde gemieden. Heute steckt er in Jazzakkorden, in „Purple Haze“ und in Polizeisirenen.' },
  { id: 'tonleiter', name: 'Die C-Dur-Tonleiter', by: 'Grundlagen', notes: 'C4 D4 E4 F4 G4 A4 B4 C5', abs: true, insp: 3,
    hint: 'Alle weißen Tasten, eine nach der anderen, von C bis C.',
    lore: 'Die Dur-Tonleiter besteht aus fünf Ganz- und zwei Halbtonschritten – zwischen E und F sowie zwischen H und C.' },
  { id: 'chromatik', name: 'Chromatische Tonleiter', by: 'Grundlagen', notes: 'C4 C#4 D4 D#4 E4 F4 F#4 G4 G#4 A4 A#4 B4 C5', insp: 5,
    hint: 'Alle zwölf Halbtöne einer Oktave, schwarz und weiß, lückenlos aufwärts.',
    lore: '„Chroma“ heißt Farbe. Die chromatische Tonleiter nutzt alle zwölf Halbtöne und ist die Grundlage von Schönbergs Zwölftonmusik.' },
  { id: 'jakob', name: 'Bruder Jakob', by: 'Französisches Volkslied', notes: 'C4 D4 E4 C4 C4 D4 E4 C4', insp: 5,
    hint: 'Schläfst du noch? Ein Kanon, den man überall auf der Welt kennt.',
    lore: 'Gustav Mahler zitiert „Frère Jacques“ im dritten Satz seiner 1. Sinfonie – in Moll, als düsteren Trauermarsch.' },
  { id: 'haenschen', name: 'Hänschen klein', by: 'Volkslied', notes: 'G4 E4 E4 F4 D4 D4 C4 D4 E4 F4 G4 G4 G4', insp: 5,
    hint: 'Ging allein in die weite Welt hinein – beginnt mit G, E, E …',
    lore: 'Der Text stammt von 1860 – die Melodie ist ein noch älteres Volkslied. Vermutlich hat sie jeder schon einmal auf der Blockflöte gehört.' },
  { id: 'nachtmusik', name: 'Eine kleine Nachtmusik', by: 'W. A. Mozart, 1787', notes: 'G4 D4 G4 D4 G4 D4 G4 B4 D5', insp: 8,
    hint: 'Mozarts Serenade in G-Dur beginnt mit einem Frage-Antwort-Spiel zwischen G und D.',
    lore: 'Mozart notierte das Werk 1787 in seinem Werkverzeichnis. Wofür er die Serenade schrieb, ist unbekannt – veröffentlicht wurde sie erst nach seinem Tod.' },
  { id: 'zarathustra', name: 'Also sprach Zarathustra', by: 'Richard Strauss, 1896', notes: 'C4 G4 C5 E5 D#5', insp: 8,
    hint: 'Sonnenaufgang im Weltall: Grundton, Quinte, Oktave – und dann Dur oder Moll?',
    lore: 'Die Einleitung der Tondichtung wurde durch Stanley Kubricks „2001: Odyssee im Weltraum“ zum Inbegriff kosmischer Erhabenheit.' },
  { id: 'hai', name: 'Der weiße Hai', by: 'Filmmusik, 1975', notes: 'E3 F3 E3 F3 E3 F3', insp: 5,
    hint: 'Zwei Töne, ein Halbton Abstand, immer schneller … Du solltest nicht ins Wasser gehen.',
    lore: 'Zwei Töne reichen für die berühmteste Gruselmusik des Kinos. Der Regisseur hielt das Motiv zunächst für einen Witz.' },
  { id: 'birthday', name: 'Zum Geburtstag viel Glück', by: 'Mildred & Patty Hill, 1893', notes: 'G4 G4 A4 G4 C5 B4', insp: 5,
    hint: 'Das meistgesungene Lied der Welt. Es beginnt mit zwei gleichen Tönen …',
    lore: 'Die Melodie stammt von einem Kinderlied namens „Good Morning to All“. Erst 2016 wurde sie in den USA gemeinfrei.' },
  { id: 'stillenacht', name: 'Stille Nacht', by: 'Franz Xaver Gruber, 1818', notes: 'G4 A4 G4 E4 G4 A4 G4 E4', insp: 6,
    hint: 'Ein Weihnachtslied aus Oberndorf: G, A, G, E – und das Ganze noch einmal.',
    lore: 'Weil die Orgel defekt war, wurde „Stille Nacht“ 1818 mit Gitarrenbegleitung uraufgeführt. Heute gibt es Übersetzungen in über 300 Sprachen.' },
  { id: 'hymne', name: 'Einigkeit und Recht und Freiheit', by: 'Joseph Haydn, 1797', notes: 'C4 D4 E4 D4 F4 E4 D4 B3 C4', insp: 8,
    hint: 'Haydn schrieb sie als Kaiserhymne. Heute ist sie die Melodie der deutschen Nationalhymne.',
    lore: 'Haydn verwendete die Melodie auch im langsamen Satz seines „Kaiserquartetts“ op. 76 Nr. 3 – als Thema mit vier Variationen.' },
  { id: 'granvals', name: 'Gran Vals', by: 'Francisco Tárrega, 1902', notes: 'E5 D5 F#4 G#4 C#5 B4 D4 E4 B4 A4 C#4 E4 A4', insp: 10,
    hint: 'Ein Gitarrenwalzer, den Millionen als Handy-Klingelton kennen.',
    lore: 'Ein kleiner Ausschnitt aus Tárregas Gitarrenwalzer wurde als Klingelton eines finnischen Handyherstellers zu einer der meistgehörten Melodien der Welt.' },
  { id: 'korobeiniki', name: 'Korobeiniki', by: 'Russisches Volkslied', notes: 'E5 B4 C5 D5 C5 B4 A4 A4 C5 E5 D5 C5 B4', insp: 8,
    hint: 'Ein Lied über fahrende Händler – berühmt geworden durch fallende Blöcke.',
    lore: 'Das Volkslied aus dem 19. Jahrhundert erzählt von einem Hausierer und seiner Geliebten. Heute kennt man es vor allem aus einem Computerspiel mit fallenden Steinen.' },
  { id: 'kanon', name: 'Pachelbels Kanon', by: 'Johann Pachelbel, um 1680', notes: 'D4 A3 B3 F#3 G3 D3 G3 A3', insp: 8,
    hint: 'Acht Basstöne, die sich immer wiederholen. Beginnt auf D und springt hinab zum A.',
    lore: 'Über dieser Bassfolge schrieb Pachelbel einen Kanon für drei Violinen. Unzählige Popsongs nutzen dieselbe Akkordfolge.' },
  { id: 'wiegenlied', name: 'Guten Abend, gut\' Nacht', by: 'Johannes Brahms, 1868', notes: 'E4 E4 G4 E4 E4 G4 E4 G4 C5 B4 A4 A4 G4', insp: 6,
    hint: 'Brahms\' Wiegenlied – mit Rosen bedacht …',
    lore: 'Brahms schrieb das Wiegenlied zur Geburt des zweiten Sohnes einer Freundin. Es ist eines der bekanntesten Schlaflieder der Welt.' },
  { id: 'halleluja', name: 'Halleluja', by: 'G. F. Händel, Messias, 1741', notes: 'D5 A4 B4 A4 D5 A4 B4 A4', insp: 8,
    hint: 'Hal-le-lu-ja! Hal-le-lu-ja! Beginnt auf D, springt zum A.',
    lore: 'Händel komponierte den gesamten „Messias“ in nur 24 Tagen. Bei der Londoner Erstaufführung soll der König beim Halleluja aufgestanden sein.' },
  { id: 'morgen', name: 'Morgenstimmung', by: 'Edvard Grieg, Peer Gynt', notes: 'G5 E5 D5 C5 D5 E5 G5 E5 D5 C5 D5 E5', insp: 8,
    hint: 'Die Sonne geht auf – eine sanfte Flötenmelodie aus Peer Gynt, abwärts und wieder aufwärts.',
    lore: 'Die Szene spielt eigentlich in der marokkanischen Wüste – nicht in einem norwegischen Fjord, wie die meisten sich vorstellen.' },
  { id: 'smoke', name: 'Rauch über dem Wasser', by: 'Hardrock-Riff, 1972', notes: 'G4 A#4 C5 G4 A#4 C#5 C5', insp: 6,
    hint: 'Das berühmteste Gitarrenriff aller Zeiten – geschrieben nach einem Brand in Montreux.',
    lore: 'Das Riff entstand, nachdem 1971 das Casino von Montreux während eines Konzerts abbrannte. Der Rauch zog über den Genfersee.' },
];
MELODIES.forEach((m) => { m.midi = parseNotes(m.notes); });
export const MELODY_BY_ID = Object.fromEntries(MELODIES.map((m) => [m.id, m]));

/** Prüft den Puffer gespielter Töne (MIDI) auf eine bekannte Melodie. */
export function matchMelody(buffer, found) {
  for (const m of MELODIES) {
    if (found[m.id]) continue;
    const n = m.midi.length;
    if (buffer.length < n) continue;
    const tail = buffer.slice(-n);
    let ok = true;
    if (m.abs) {
      for (let i = 0; i < n; i++) if (((tail[i] % 12) + 12) % 12 !== ((m.midi[i] % 12) + 12) % 12) { ok = false; break; }
      // aufsteigend für Tonleiter
      if (ok && m.id === 'tonleiter') for (let i = 1; i < n; i++) if (tail[i] <= tail[i - 1]) { ok = false; break; }
    } else {
      for (let i = 1; i < n; i++) if (tail[i] - tail[i - 1] !== m.midi[i] - m.midi[i - 1]) { ok = false; break; }
    }
    if (ok) return m;
  }
  return null;
}
