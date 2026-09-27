// Legenden: Komponist:innen, Theoretiker und Stars.
// passive(lvl): wirkt immer, sobald freigeschaltet.
// ability(lvl): wirkt nur, wenn die Legende im Ensemble sitzt.
// dyn: Schlüssel für spezielle, zeitabhängige Mechaniken (in game.js ausgewertet)

const own = (g, id) => g.state.run.buildings[id] || 0;
const bm = (b, v) => ({ t: 'bmult', b, v });
const pct = (x) => Math.round(x * 100);

export const LEGENDS = [
  // ---------- Antike & Mittelalter ----------
  {
    id: 'pythagoras', name: 'Pythagoras', dates: 'ca. 570 – 510 v. Chr.', era: 'antike', type: 'theorist',
    unlock: (g) => own(g, 'lyre') >= 25, hint: 'Besitze 25 Lyren.',
    passive: (l) => ({ text: `Lyra +${15 * l} %`, fx: [bm('lyre', 1 + 0.15 * l)] }),
    ability: (l) => ({ name: 'Harmonie der Zahlen', text: `+${(1 + 0.2 * (l - 1)).toFixed(1).replace('.', ',')} % Produktion pro erlernter Harmonielehre-Lektion`, fx: [{ t: 'perTheory', v: 0.01 + 0.002 * (l - 1) }] }),
    lore: 'Pythagoras entdeckte am Monochord, dass harmonische Intervalle einfachen Zahlenverhältnissen entsprechen: Oktave 2:1, Quinte 3:2, Quarte 4:3. Stapelt man zwölf Quinten, landet man fast wieder beim Ausgangston – die kleine Differenz heißt bis heute „pythagoreisches Komma“.',
  },
  {
    id: 'guido', name: 'Guido von Arezzo', dates: 'ca. 992 – 1050', era: 'mittelalter', type: 'theorist',
    unlock: (g) => own(g, 'choir') >= 10, hint: 'Besitze 10 Gregorianische Chöre.',
    passive: (l) => ({ text: `Klickkraft +${10 * l} %`, fx: [{ t: 'click', v: 1 + 0.1 * l }] }),
    ability: (l) => ({ name: 'Notenlinien', text: `Instrumente ${5 + (l - 1) * 0.5} % günstiger`.replace('.', ','), fx: [{ t: 'cost', v: 1 - (0.05 + 0.005 * (l - 1)) }] }),
    lore: 'Der Benediktinermönch erfand das Liniensystem, auf dem wir bis heute Noten schreiben, und die Silben Ut–Re–Mi–Fa–Sol–La, gewonnen aus einem Johannes-Hymnus. So konnten Sänger neue Melodien erstmals vom Blatt lernen, statt sie jahrelang auswendig zu pauken.',
  },
  {
    id: 'hildegard', name: 'Hildegard von Bingen', dates: '1098 – 1179', era: 'mittelalter', type: 'composer',
    unlock: (g) => own(g, 'choir') >= 50, hint: 'Besitze 50 Gregorianische Chöre.',
    passive: (l) => ({ text: `Chor +${15 * l} %`, fx: [bm('choir', 1 + 0.15 * l)] }),
    ability: (l) => ({ name: 'Visionen', text: `Inspiration +${25 + 5 * (l - 1)} %`, fx: [{ t: 'insp', v: 1.25 + 0.05 * (l - 1) }] }),
    lore: 'Äbtissin, Naturforscherin, Heilkundige, Mystikerin – und eine der ersten namentlich bekannten Komponistinnen. Ihre rund 77 Gesänge sprengen den Tonumfang des üblichen Chorals. Sie selbst sagte, sie empfange ihre Musik in göttlichen Visionen.',
  },
  // ---------- Renaissance ----------
  {
    id: 'palestrina', name: 'Giovanni Pierluigi da Palestrina', short: 'Palestrina', dates: '1525 – 1594', era: 'renaissance', type: 'composer',
    unlock: (g) => own(g, 'lute') >= 50, hint: 'Besitze 50 Lauten.',
    passive: (l) => ({ text: `Laute & Chor +${10 * l} %`, fx: [bm('lute', 1 + 0.1 * l), bm('choir', 1 + 0.1 * l)] }),
    ability: (l) => ({ name: 'Polyphonie', text: `+${fmtN(2 + 0.4 * (l - 1))} % Produktion pro Instrumententyp, den du besitzt`, fx: [{ t: 'perType', v: 0.02 + 0.004 * (l - 1) }] }),
    lore: 'Palestrina gilt als Vollender der Vokalpolyphonie. Eine Legende erzählt, er habe mit seiner „Missa Papae Marcelli“ die mehrstimmige Kirchenmusik gerettet, als das Konzil von Trient sie verbieten wollte – weil man die Worte nicht mehr verstand.',
  },
  {
    id: 'monteverdi', name: 'Claudio Monteverdi', short: 'Monteverdi', dates: '1567 – 1643', era: 'renaissance', type: 'composer',
    unlock: (g) => own(g, 'opera') >= 1 && own(g, 'lyre') >= 50, hint: 'Besitze ein Opernhaus und 50 Lyren – Orpheus singt.',
    passive: (l) => ({ text: `Opernhaus +${15 * l} %`, fx: [bm('opera', 1 + 0.15 * l)] }),
    ability: (l) => ({ name: 'L\'Orfeo', text: `Lyra & Opernhaus ×${3 + 0.5 * (l - 1)}`.replace('.', ','), fx: [bm('lyre', 3 + 0.5 * (l - 1)), bm('opera', 3 + 0.5 * (l - 1))] }),
    lore: 'Mit „L\'Orfeo“ schrieb Monteverdi 1607 die erste große Oper der Musikgeschichte – passenderweise über Orpheus, den Sänger mit der Lyra. Er stand an der Schwelle zwischen Renaissance und Barock und nannte seinen neuen, ausdrucksstarken Stil „seconda pratica“.',
  },
  // ---------- Barock ----------
  {
    id: 'vivaldi', name: 'Antonio Vivaldi', short: 'Vivaldi', dates: '1678 – 1741', era: 'barock', type: 'composer',
    unlock: (g) => own(g, 'quartet') >= 25, hint: 'Besitze 25 Streichquartette.',
    passive: (l) => ({ text: `Streichquartett +${10 * l} %`, fx: [bm('quartet', 1 + 0.1 * l)] }),
    ability: (l) => ({ name: 'Die vier Jahreszeiten', text: `Alle 90 Sek. wechselt die Jahreszeit: Frühling ×${fmtN(1.5 + 0.1 * (l - 1))} Produktion · Sommer ×${fmtN(3 + 0.3 * (l - 1))} Klicks · Herbst doppelt so viele goldene Noten · Winter ×${fmtN(1.5 + 0.1 * (l - 1))} Inspiration`, fx: [] }),
    dyn: 'seasons',
    lore: 'Der „rote Priester“ – wegen seiner Haare – unterrichtete an einem venezianischen Waisenhaus für Mädchen, dessen Orchester berühmt war. Seine „Vier Jahreszeiten“ von 1725 sind frühe Programmmusik: Man hört Vogelgezwitscher, Gewitter und klappernde Zähne im Winter.',
  },
  {
    id: 'bach', name: 'Johann Sebastian Bach', short: 'Bach', dates: '1685 – 1750', era: 'barock', type: 'composer',
    unlock: (g) => own(g, 'organ') >= 50, hint: 'Besitze 50 Orgeln.',
    passive: (l) => ({ text: `Orgel +${15 * l} %`, fx: [bm('organ', 1 + 0.15 * l)] }),
    ability: (l) => ({ name: 'Die Kunst der Fuge', text: `Alle Instrumente +${fmtN(0.5 + 0.1 * (l - 1))} % pro Orgel`, fx: [{ t: 'perOrgan', v: 0.005 + 0.001 * (l - 1) }] }),
    lore: 'Thomaskantor in Leipzig, Vater von 20 Kindern und Meister des Kontrapunkts. Zu Lebzeiten galt er eher als altmodisch; erst Felix Mendelssohn machte ihn 1829 mit der Matthäus-Passion wieder berühmt. Sein Name ist selbst ein Motiv: B–A–C–H.',
  },
  {
    id: 'handel', name: 'Georg Friedrich Händel', short: 'Händel', dates: '1685 – 1759', era: 'barock', type: 'composer',
    unlock: (g) => g.state.life.golden >= 13, hint: 'Fange 13 goldene Noten.',
    passive: (l) => ({ text: `Effekte goldener Noten +${5 * l} % länger`, fx: [{ t: 'goldDur', v: 1 + 0.05 * l }] }),
    ability: (l) => ({ name: 'Halleluja!', text: `Goldene Noten ${50 + 5 * (l - 1)} % häufiger, Applaus-Belohnung ×2`, fx: [{ t: 'goldFreq', v: 1.5 + 0.05 * (l - 1) }, { t: 'applause', v: 2 }] }),
    lore: 'Der gebürtige Hallenser machte in London Karriere. Bei der Aufführung des „Messias“ soll König Georg II. beim Halleluja aufgestanden sein – seitdem erhebt sich das Publikum traditionell. Für eine königliche Bootsfahrt auf der Themse schrieb er die „Wassermusik“.',
  },
  // ---------- Klassik ----------
  {
    id: 'haydn', name: 'Joseph Haydn', short: 'Haydn', dates: '1732 – 1809', era: 'klassik', type: 'composer',
    unlock: (g) => own(g, 'quartet') >= 68, hint: 'Besitze 68 Streichquartette – so viele schrieb er.',
    passive: (l) => ({ text: `Streichquartett +${15 * l} %`, fx: [bm('quartet', 1 + 0.15 * l)] }),
    ability: (l) => ({ name: 'Paukenschlag', text: `Jede Minute eine Überraschung: sofort ${20 + 3 * (l - 1)} Sekunden Produktion`, fx: [] }),
    dyn: 'surprise',
    lore: '„Papa Haydn“ diente 30 Jahre am Hof der Fürsten Esterházy und erfand dort Sinfonie und Streichquartett quasi neu. In seiner Sinfonie Nr. 94 weckt ein plötzlicher Paukenschlag das schläfrige Publikum – daher der Name „mit dem Paukenschlag“.',
  },
  {
    id: 'mozart', name: 'Wolfgang Amadeus Mozart', short: 'Mozart', dates: '1756 – 1791', era: 'klassik', type: 'composer',
    unlock: (g) => g.state.life.clicks >= 3500, hint: 'Klicke insgesamt 3.500-mal – ein Wunderkind übt fleißig.',
    passive: (l) => ({ text: `Klickkraft +${15 * l} %`, fx: [{ t: 'click', v: 1 + 0.15 * l }] }),
    ability: (l) => ({ name: 'Wunderkind', text: `Klicks bringen zusätzlich ${fmtN(3 + 0.5 * (l - 1))} % der Produktion`, fx: [{ t: 'clickNps', v: 0.03 + 0.005 * (l - 1) }] }),
    lore: 'Mit fünf Jahren komponierte er, mit sechs tourte er durch Europas Fürstenhöfe. In seinem kurzen Leben schrieb er über 600 Werke. Mit 14 hörte er in der Sixtinischen Kapelle Allegris geheimes „Miserere“ – und schrieb es danach aus dem Gedächtnis auf.',
  },
  {
    id: 'beethoven', name: 'Ludwig van Beethoven', short: 'Beethoven', dates: '1770 – 1827', era: 'klassik', type: 'composer',
    unlock: (g) => own(g, 'orchestra') >= 50, hint: 'Besitze 50 Sinfonieorchester.',
    passive: (l) => ({ text: `Orchester +${15 * l} %`, fx: [bm('orchestra', 1 + 0.15 * l)] }),
    ability: (l) => ({ name: 'Taub, doch unbeirrt', text: `Offline-Produktion +${50 + 10 * (l - 1)} %-Punkte · ohne Klick seit 60 Sek.: Produktion ×1,5`, fx: [{ t: 'offline', v: 0.5 + 0.1 * (l - 1) }, { t: 'idle60', v: 1.5 }] }),
    lore: 'Der Bonner Komponist wurde ab etwa 30 Jahren zunehmend taub – und schrieb trotzdem seine größten Werke. Bei der Uraufführung der 9. Sinfonie musste man ihn umdrehen, damit er den tosenden Applaus sehen konnte. Die „Ode an die Freude“ ist heute die Europahymne.',
  },
  // ---------- Romantik ----------
  {
    id: 'paganini', name: 'Niccolò Paganini', short: 'Paganini', dates: '1782 – 1840', era: 'romantik', type: 'composer',
    unlock: (g) => g.state.life.crits >= 24 && own(g, 'quartet') >= 24, hint: 'Lande 24 Volltreffer-Klicks und besitze 24 Streichquartette (Caprice Nr. 24!).',
    passive: (l) => ({ text: `Volltreffer-Multiplikator +${l}`, fx: [{ t: 'critMult', v: l }] }),
    ability: (l) => ({ name: 'Teufelsgeiger', text: `Volltreffer-Chance +${10 + (l - 1)} %`, fx: [{ t: 'crit', v: 0.1 + 0.01 * (l - 1) }] }),
    lore: 'Paganini spielte so unfassbar virtuos, dass man munkelte, er habe seine Seele dem Teufel verkauft. Er soll ganze Stücke auf einer einzigen Saite gespielt haben, wenn die anderen rissen. Seine 24. Caprice wurde von Liszt, Brahms und Rachmaninow neu bearbeitet.',
  },
  {
    id: 'schubert', name: 'Franz Schubert', short: 'Schubert', dates: '1797 – 1828', era: 'romantik', type: 'composer',
    unlock: (g) => g.totalBuildings() >= 600, hint: 'Besitze 600 Instrumente gleichzeitig – so viele Lieder schrieb er.',
    passive: (l) => ({ text: `+${l} % Produktion`, fx: [{ t: 'prod', v: 1 + 0.01 * l }] }),
    ability: (l) => ({ name: 'Die Unvollendete', text: `Upgrades ${15 + (l - 1)} % günstiger`, fx: [{ t: 'ucost', v: 1 - (0.15 + 0.01 * (l - 1)) }] }),
    lore: 'Schubert schrieb in nur 31 Lebensjahren rund 600 Lieder, darunter den „Erlkönig“ mit 18. Seine Sinfonie in h-Moll blieb unvollendet – nur zwei Sätze wurden fertig. Warum er sie nicht beendete, ist eines der großen Rätsel der Musikgeschichte.',
  },
  {
    id: 'chopin', name: 'Frédéric Chopin', short: 'Chopin', dates: '1810 – 1849', era: 'romantik', type: 'composer',
    unlock: (g) => own(g, 'piano') >= 50, hint: 'Besitze 50 Konzertflügel.',
    passive: (l) => ({ text: `Konzertflügel +${15 * l} %`, fx: [bm('piano', 1 + 0.15 * l)] }),
    ability: (l) => ({ name: 'Nocturne', text: `Zwischen 20 und 6 Uhr Produktion ×${fmtN(2 + 0.1 * (l - 1))}, sonst ×1,2`, fx: [] }),
    dyn: 'nocturne',
    lore: 'Der „Poet des Klaviers“ schrieb fast ausschließlich für sein Instrument. Seine 21 Nocturnes sind Inbegriff romantischer Nachtmusik. Sein Herz liegt – auf eigenen Wunsch – in einer Säule der Heilig-Kreuz-Kirche in Warschau.',
  },
  {
    id: 'liszt', name: 'Franz Liszt', short: 'Liszt', dates: '1811 – 1886', era: 'romantik', type: 'composer',
    unlock: (g) => g.state.life.maxCombo >= 100 && own(g, 'piano') >= 25, hint: 'Erreiche eine Takt-Kombo von 100 und besitze 25 Konzertflügel.',
    passive: (l) => ({ text: `Maximaler Groove +${5 * l} %`, fx: [{ t: 'grooveMax', v: 0.05 * l }] }),
    ability: (l) => ({ name: 'Lisztomanie', text: `Groove-Bonus ×${fmtN(2 + 0.1 * (l - 1))}`, fx: [{ t: 'grooveMult', v: 2 + 0.1 * (l - 1) }] }),
    lore: 'Liszt war der erste Popstar: Frauen fielen in Ohnmacht, stritten um seine Handschuhe und Zigarrenstummel. Heinrich Heine erfand dafür das Wort „Lisztomanie“. Er erfand den Klavierabend als Solokonzert und drehte den Flügel seitlich zum Publikum.',
  },
  {
    id: 'clara', name: 'Clara Schumann', short: 'Clara Schumann', dates: '1819 – 1896', era: 'romantik', type: 'composer',
    unlock: (g) => g.state.life.gigsDone >= 10 && own(g, 'piano') >= 10, hint: 'Spiele 10 Konzerte und besitze 10 Konzertflügel.',
    passive: (l) => ({ text: `Konzert-Belohnungen +${10 * l} %`, fx: [{ t: 'gigReward', v: 1 + 0.1 * l }] }),
    ability: (l) => ({ name: 'Virtuosin auf Tournee', text: `Konzerte ${25 + 2 * (l - 1)} % schneller, Fundchance +25 %`, fx: [{ t: 'gigSpeed', v: 1 / (1 - (0.25 + 0.02 * (l - 1))) }, { t: 'relicLuck', v: 1.25 }] }),
    lore: 'Clara Wieck war schon als Kind eine gefeierte Pianistin und gab in über 60 Jahren mehr als 1300 Konzerte in ganz Europa. Sie komponierte, zog acht Kinder groß und machte die Werke ihres Mannes Robert Schumann berühmt. Sie zierte den 100-DM-Schein.',
  },
  {
    id: 'fanny', name: 'Fanny Hensel', short: 'Fanny Hensel', dates: '1805 – 1847', era: 'romantik', type: 'composer',
    unlock: (g) => g.achievementCount() >= 60, hint: 'Sammle 60 Auszeichnungen.',
    passive: (l) => ({ text: `+${5 * l} % Produktion`, fx: [{ t: 'prod', v: 1 + 0.05 * l }] }),
    ability: (l) => ({ name: 'Das Jahr', text: `+${fmtN(1 + 0.2 * (l - 1))} % Produktion pro Auszeichnung`, fx: [{ t: 'perAch', v: 0.01 + 0.002 * (l - 1) }] }),
    lore: 'Die ältere Schwester von Felix Mendelssohn war mindestens ebenso begabt, durfte als Frau aber kaum öffentlich auftreten. Einige ihrer Lieder erschienen unter dem Namen ihres Bruders. Ihr Klavierzyklus „Das Jahr“ zeichnet zwölf Monate in Tönen.',
  },
  {
    id: 'berlioz', name: 'Hector Berlioz', short: 'Berlioz', dates: '1803 – 1869', era: 'romantik', type: 'composer',
    unlock: (g) => own(g, 'orchestra') >= 75, hint: 'Besitze 75 Sinfonieorchester.',
    passive: (l) => ({ text: `Orchester +${10 * l} %`, fx: [bm('orchestra', 1 + 0.1 * l)] }),
    ability: (l) => ({ name: 'Idée fixe', text: `+${fmtN(1 + 0.2 * (l - 1))} % Gesamtproduktion pro Orchester`, fx: [{ t: 'perBuilding', b: 'orchestra', v: 0.01 + 0.002 * (l - 1) }] }),
    lore: 'Berlioz liebte das Gigantische: Er dirigierte Orchester mit Hunderten Musikern und schrieb ein bahnbrechendes Lehrbuch der Instrumentation. In seiner „Symphonie fantastique“ kehrt eine Melodie – die „idée fixe“ – als Bild der Geliebten immer wieder.',
  },
  {
    id: 'wagner', name: 'Richard Wagner', short: 'Wagner', dates: '1813 – 1883', era: 'romantik', type: 'composer',
    unlock: (g) => own(g, 'opera') >= 50, hint: 'Besitze 50 Opernhäuser.',
    passive: (l) => ({ text: `Opernhaus +${15 * l} %`, fx: [bm('opera', 1 + 0.15 * l)] }),
    ability: (l) => ({ name: 'Gesamtkunstwerk', text: `+${10 + 2 * (l - 1)} % Produktion für jeden Instrumententyp mit mindestens 50 Stück`, fx: [{ t: 'per50', v: 0.1 + 0.02 * (l - 1) }] }),
    lore: 'Wagner wollte Musik, Dichtung, Bühne und Bild zum „Gesamtkunstwerk“ verschmelzen. Für seinen „Ring des Nibelungen“ ließ er sich in Bayreuth ein eigenes Festspielhaus bauen – mit verdecktem Orchestergraben. Seine Leitmotive prägen bis heute die Filmmusik.',
  },
  {
    id: 'verdi', name: 'Giuseppe Verdi', short: 'Verdi', dates: '1813 – 1901', era: 'romantik', type: 'composer',
    unlock: (g) => own(g, 'opera') >= 75, hint: 'Besitze 75 Opernhäuser.',
    passive: (l) => ({ text: `Opernhaus +${10 * l} %`, fx: [bm('opera', 1 + 0.1 * l)] }),
    ability: (l) => ({ name: 'Triumphmarsch', text: `Konzert-Belohnungen ×${fmtN(2 + 0.2 * (l - 1))}`, fx: [{ t: 'gigReward', v: 2 + 0.2 * (l - 1) }] }),
    lore: 'Verdis Opern wie „Aida“, „La Traviata“ und „Rigoletto“ sind Dauerbrenner auf allen Bühnen. Der Gefangenenchor aus „Nabucco“ wurde zur heimlichen Hymne der italienischen Einigung. Bei seiner Beerdigung sangen Zehntausende spontan „Va, pensiero“.',
  },
  {
    id: 'strauss', name: 'Johann Strauss (Sohn)', short: 'Johann Strauss', dates: '1825 – 1899', era: 'romantik', type: 'composer',
    unlock: (g) => g.state.life.perfectHits >= 1000, hint: 'Triff 1.000-mal perfekt im Takt – eins, zwei, drei!',
    passive: (l) => ({ text: `Groove baut sich ${10 * l} % schneller auf`, fx: [{ t: 'grooveGain', v: 1 + 0.1 * l }] }),
    ability: (l) => ({ name: 'Walzerkönig', text: `Die Musik wechselt in den ¾-Takt. Perfekte Treffer auf der Eins geben dreifachen Groove, Groove-Maximum +${50 + 5 * (l - 1)} %`, fx: [{ t: 'waltz', v: 1 }, { t: 'grooveMax', v: 0.5 + 0.05 * (l - 1) }] }),
    lore: 'Der „Walzerkönig“ schrieb über 500 Tänze, darunter „An der schönen blauen Donau“, die inoffizielle Hymne Österreichs. Sie erklingt jedes Jahr beim Neujahrskonzert der Wiener Philharmoniker – und auch im Weltraum, im Film „2001“.',
  },
  {
    id: 'tchaikovsky', name: 'Pjotr Iljitsch Tschaikowski', short: 'Tschaikowski', dates: '1840 – 1893', era: 'romantik', type: 'composer',
    unlock: (g) => own(g, 'orchestra') >= 18 && own(g, 'opera') >= 12, hint: 'Besitze 18 Orchester und 12 Opernhäuser – achtzehn-zwölf!',
    passive: (l) => ({ text: `Orchester +${10 * l} %`, fx: [bm('orchestra', 1 + 0.1 * l)] }),
    ability: (l) => ({ name: 'Ouvertüre 1812', text: `Jeder 12. Klick feuert eine Kanone: Klickkraft ×${18 + 2 * (l - 1)}`, fx: [{ t: 'cannon', v: 18 + 2 * (l - 1) }] }),
    lore: 'Seine Ballette „Schwanensee“, „Dornröschen“ und „Der Nussknacker“ sind Weltklassiker. In der Ouvertüre „1812“ verlangt die Partitur echte Kanonenschüsse – bei Freiluftaufführungen wird tatsächlich gefeuert. Er eröffnete 1891 die Carnegie Hall in New York.',
  },
  {
    id: 'dvorak', name: 'Antonín Dvořák', short: 'Dvořák', dates: '1841 – 1904', era: 'romantik', type: 'composer',
    unlock: (g) => own(g, 'jazz') >= 9, hint: 'Besitze 9 Big Bands – wie seine 9. Sinfonie.',
    passive: (l) => ({ text: `Big Band +${15 * l} %`, fx: [bm('jazz', 1 + 0.15 * l)] }),
    ability: (l) => ({ name: 'Aus der Neuen Welt', text: `+${5 + (l - 1)} % Produktion pro erreichter Epoche`, fx: [{ t: 'perEra', v: 0.05 + 0.01 * (l - 1) }] }),
    lore: 'Der Böhme leitete ab 1892 das Konservatorium in New York und ließ sich von Spirituals und der Musik der amerikanischen Ureinwohner inspirieren. Seine 9. Sinfonie „Aus der Neuen Welt“ nahm Neil Armstrong 1969 mit zum Mond.',
  },
  {
    id: 'grieg', name: 'Edvard Grieg', short: 'Grieg', dates: '1843 – 1907', era: 'romantik', type: 'composer',
    unlock: (g) => own(g, 'drum') >= 150, hint: 'Besitze 150 Trommeln.',
    passive: (l) => ({ text: `Trommel +${25 * l} %`, fx: [bm('drum', 1 + 0.25 * l)] }),
    ability: (l) => ({ name: 'In der Halle des Bergkönigs', text: `Solange du Groove hast, steigt die Produktion jede Minute um ${5 + (l - 1)} % (max. +${100 + 10 * (l - 1)} %)`, fx: [] }),
    dyn: 'mountainKing',
    lore: 'Für Ibsens Drama „Peer Gynt“ schrieb der Norweger die Schauspielmusik – darunter „Morgenstimmung“ und „In der Halle des Bergkönigs“, das immer schneller und lauter wird, bis die Trolle toben. Grieg selbst fand das Stück übrigens „schrecklich“.',
  },
  {
    id: 'rimsky', name: 'Nikolai Rimski-Korsakow', short: 'Rimski-Korsakow', dates: '1844 – 1908', era: 'romantik', type: 'composer',
    unlock: (g) => g.state.life.bestCps >= 12, hint: 'Klicke 12-mal innerhalb einer Sekunde.',
    passive: (l) => ({ text: `Klickkraft +${10 * l} %`, fx: [{ t: 'click', v: 1 + 0.1 * l }] }),
    ability: (l) => ({ name: 'Hummelflug', text: `Klickkraft ×${fmtN(2 + 0.2 * (l - 1))}`, fx: [{ t: 'click', v: 2 + 0.2 * (l - 1) }] }),
    lore: 'Der russische Marineoffizier wurde zum Meister der Orchesterfarben. Aus seiner Oper „Das Märchen vom Zaren Saltan“ stammt der rasende „Hummelflug“ – ein Paradestück für flinke Finger auf allen Instrumenten.',
  },
  {
    id: 'mahler', name: 'Gustav Mahler', short: 'Mahler', dates: '1860 – 1911', era: 'romantik', type: 'composer',
    unlock: (g) => g.totalBuildings() >= 1000, hint: 'Besitze 1.000 Instrumente gleichzeitig.',
    passive: (l) => ({ text: `Orchester +${10 * l} %`, fx: [bm('orchestra', 1 + 0.1 * l)] }),
    ability: (l) => ({ name: 'Sinfonie der Tausend', text: `+${fmtN(1 + 0.2 * (l - 1))} % Produktion pro 100 Instrumente`, fx: [{ t: 'per100', v: 0.01 + 0.002 * (l - 1) }] }),
    lore: '„Eine Sinfonie muss sein wie die Welt – sie muss alles umfassen.“ Mahlers 8. Sinfonie wurde 1910 in München mit über 1000 Mitwirkenden uraufgeführt. Als Dirigent der Wiener Hofoper war er gefürchtet und bewundert zugleich.',
  },
  {
    id: 'debussy', name: 'Claude Debussy', short: 'Debussy', dates: '1862 – 1918', era: 'romantik', type: 'composer',
    unlock: (g) => !!g.state.modesUnlocked.lydian, hint: 'Erlerne den lydischen Modus.',
    passive: (l) => ({ text: `+${3 * l} % Produktion`, fx: [{ t: 'prod', v: 1 + 0.03 * l }] }),
    ability: (l) => ({ name: 'Clair de Lune', text: `Goldene Noten bleiben doppelt so lange, Effekte +${50 + 5 * (l - 1)} % länger`, fx: [{ t: 'goldLife', v: 2 }, { t: 'goldDur', v: 1.5 + 0.05 * (l - 1) }] }),
    lore: 'Debussy malte mit Klängen wie die Impressionisten mit Licht. Er nutzte Ganztonleitern, Pentatonik und alte Kirchentonarten und befreite die Harmonik von ihren Regeln. „Clair de Lune“ gehört zu den meistgespielten Klavierstücken der Welt.',
  },
  {
    id: 'satie', name: 'Erik Satie', short: 'Satie', dates: '1866 – 1925', era: 'romantik', type: 'composer',
    unlock: (g) => g.state.run.clicks >= 840 && own(g, 'organ') >= 1, hint: 'Klicke in einem Durchgang 840-mal und besitze eine Orgel.',
    passive: (l) => ({ text: `Offline-Produktion +${5 * l} %-Punkte`, fx: [{ t: 'offline', v: 0.05 * l }] }),
    ability: (l) => ({ name: 'Gymnopédie', text: `Ohne Klick seit 30 Sek.: Produktion ×${fmtN(1.8 + 0.1 * (l - 1))}`, fx: [{ t: 'idle', v: 1.8 + 0.1 * (l - 1) }] }),
    lore: 'Der Pariser Exzentriker besaß zwölf identische graue Samtanzüge und schrieb Stücke mit Titeln wie „Drei Stücke in Form einer Birne“. Sein „Vexations“ soll 840-mal wiederholt werden – die erste vollständige Aufführung 1963 dauerte über 18 Stunden.',
  },
  {
    id: 'joplin', name: 'Scott Joplin', short: 'Scott Joplin', dates: '1868 – 1917', era: 'jazz', type: 'composer',
    unlock: (g) => own(g, 'jazz') >= 25, hint: 'Besitze 25 Big Bands.',
    passive: (l) => ({ text: `Konzertflügel +${10 * l} %`, fx: [bm('piano', 1 + 0.1 * l)] }),
    ability: (l) => ({ name: 'Ragtime', text: `Treffer auf den Achteln zwischen den Schlägen zählen – und geben +${50 + 5 * (l - 1)} % Groove`, fx: [{ t: 'eighths', v: 1 }, { t: 'syncopation', v: 0.5 + 0.05 * (l - 1) }] }),
    lore: 'Der „King of Ragtime“ verband europäische Klaviermusik mit afroamerikanischen, synkopierten Rhythmen – ein wichtiger Vorläufer des Jazz. „The Entertainer“ wurde 1973 durch den Film „Der Clou“ weltberühmt, 56 Jahre nach seinem Tod.',
  },
  {
    id: 'schoenberg', name: 'Arnold Schönberg', short: 'Schönberg', dates: '1874 – 1951', era: 'jazz', type: 'composer',
    unlock: (g) => g.typesOwned() >= 12, hint: 'Besitze 12 verschiedene Instrumententypen.',
    passive: (l) => ({ text: `+${3 * l} % Produktion`, fx: [{ t: 'prod', v: 1 + 0.03 * l }] }),
    ability: (l) => ({ name: 'Zwölftontechnik', text: `Bei mind. 12 Typen mit je 12 Stück: +${12 + 2 * (l - 1)} % Produktion pro solchem Typ`, fx: [{ t: 'twelve', v: 0.12 + 0.02 * (l - 1) }] }),
    lore: 'Schönberg löste die Musik von der Tonalität und entwickelte die „Methode der Komposition mit zwölf nur aufeinander bezogenen Tönen“: Alle zwölf Halbtöne kommen in einer festgelegten Reihe vor, keiner darf bevorzugt werden. Er litt an Triskaidekaphobie – der Angst vor der Zahl 13.',
  },
  {
    id: 'ravel', name: 'Maurice Ravel', short: 'Ravel', dates: '1875 – 1937', era: 'jazz', type: 'composer',
    unlock: (g) => g.state.run.total >= 1e14, hint: 'Erspiele in einem Durchgang 100 Billionen Noten.',
    passive: (l) => ({ text: `Orchester +${10 * l} %`, fx: [bm('orchestra', 1 + 0.1 * l)] }),
    ability: (l) => ({ name: 'Boléro', text: `Die Produktion schwillt über 15 Minuten von ×1 bis ×${fmtN(3 + 0.2 * (l - 1))} an – dann beginnt der Boléro von vorn`, fx: [] }),
    dyn: 'bolero',
    lore: 'Ravels „Boléro“ (1928) ist ein einziges, 15-minütiges Crescendo: Ein Rhythmus, zwei Melodien, und das Orchester wird immer lauter. Ravel selbst hielt es für ein Experiment „ohne Musik“. Es wurde sein berühmtestes Werk.',
  },
  {
    id: 'stravinsky', name: 'Igor Strawinsky', short: 'Strawinsky', dates: '1882 – 1971', era: 'jazz', type: 'composer',
    unlock: (g) => g.state.run.total >= 1e16, hint: 'Erspiele in einem Durchgang 10 Billiarden Noten.',
    passive: (l) => ({ text: `+${5 * l} % Produktion`, fx: [{ t: 'prod', v: 1 + 0.05 * l }] }),
    ability: (l) => ({ name: 'Le Sacre du printemps', text: `Alle 10 Sek. schwankt die Produktion wild zwischen ×0,5 und ×${fmtN(4 + 0.2 * (l - 1))}`, fx: [] }),
    dyn: 'sacre',
    lore: 'Die Uraufführung von „Le Sacre du printemps“ 1913 in Paris endete im Tumult: Das Publikum schrie, pfiff und prügelte sich, weil Rhythmen und Dissonanzen so unerhört waren. Heute gilt das Werk als Urknall der modernen Musik.',
  },
  {
    id: 'gershwin', name: 'George Gershwin', short: 'Gershwin', dates: '1898 – 1937', era: 'jazz', type: 'composer',
    unlock: (g) => own(g, 'jazz') >= 25 && own(g, 'orchestra') >= 50, hint: 'Besitze 25 Big Bands und 50 Orchester.',
    passive: (l) => ({ text: `Big Band +${10 * l} %`, fx: [bm('jazz', 1 + 0.1 * l)] }),
    ability: (l) => ({ name: 'Rhapsody in Blue', text: `Big Band +${fmtN(1 + 0.2 * (l - 1))} % pro Orchester, Orchester +${fmtN(1 + 0.2 * (l - 1))} % pro Big Band`, fx: [{ t: 'syn', dst: 'jazz', src: 'orchestra', v: 0.01 + 0.002 * (l - 1) }, { t: 'syn', dst: 'orchestra', src: 'jazz', v: 0.01 + 0.002 * (l - 1) }] }),
    lore: 'Gershwin schlug die Brücke zwischen Jazz und Konzertsaal. Die „Rhapsody in Blue“ beginnt mit einem legendären Klarinetten-Glissando – eine Idee, die der Klarinettist bei der Probe als Scherz spielte. Seine Oper „Porgy and Bess“ enthält „Summertime“.',
  },
  {
    id: 'cage', name: 'John Cage', short: 'John Cage', dates: '1912 – 1992', era: 'rock', type: 'composer',
    unlock: (g) => g.state.flags.silence433 && own(g, 'rock') >= 1, hint: 'Klicke 4 Minuten und 33 Sekunden lang nicht (bei geöffnetem Spiel) – und besitze eine Rockband.',
    passive: (l) => ({ text: `Offline-Produktion +${5 * l} %-Punkte`, fx: [{ t: 'offline', v: 0.05 * l }] }),
    ability: (l) => ({ name: '4′33″', text: `Nach 4:33 ohne Klick: Produktion ×${fmtN(4.33 + 0.33 * (l - 1))} – bis zum nächsten Klick`, fx: [{ t: 'silence', v: 4.33 + 0.33 * (l - 1) }] }),
    lore: 'In „4′33″“ (1952) spielt der Pianist keinen einzigen Ton. Die Musik sind die Geräusche des Saales: Husten, Rascheln, Regen. Außerdem „präparierte“ Cage Klaviere mit Schrauben und Radiergummis zwischen den Saiten.',
  },
  {
    id: 'kepler', name: 'Johannes Kepler', short: 'Kepler', dates: '1571 – 1630', era: 'kosmos', type: 'theorist',
    unlock: (g) => own(g, 'spheres') >= 1, hint: 'Besitze eine Sphärenharmonie.',
    passive: (l) => ({ text: `Sphärenharmonie +${20 * l} %`, fx: [bm('spheres', 1 + 0.2 * l)] }),
    ability: (l) => ({ name: 'Weltharmonik', text: `Sphärenharmonie ×${5 + (l - 1)}, gesamte Produktion +${25 + 5 * (l - 1)} %`, fx: [bm('spheres', 5 + (l - 1)), { t: 'prod', v: 1.25 + 0.05 * (l - 1) }] }),
    lore: 'Der Astronom aus Weil der Stadt suchte die Harmonie des Kosmos. In „Harmonices Mundi“ (1619) ordnete er jedem Planeten Töne zu – je nach Geschwindigkeit auf seiner Bahn. Nebenbei entdeckte er dabei sein drittes Gesetz der Planetenbewegung.',
  },
  // ---------- Stars der Moderne ----------
  {
    id: 'louis', name: 'Louis Armstrong', short: 'Satchmo', dates: '1901 – 1971', era: 'jazz', type: 'star',
    unlock: (g) => own(g, 'jazz') >= 50, hint: 'Besitze 50 Big Bands.',
    passive: (l) => ({ text: `Big Band +${15 * l} %`, fx: [bm('jazz', 1 + 0.15 * l)] }),
    ability: (l) => ({ name: 'Satchmo', text: `Goldene Noten ${25 + 5 * (l - 1)} % häufiger, Musen-Küsse geben doppelt Inspiration`, fx: [{ t: 'goldFreq', v: 1.25 + 0.05 * (l - 1) }, { t: 'museMult', v: 2 }] }),
    lore: 'Der Trompeter aus New Orleans machte das improvisierte Solo zum Herzstück des Jazz und popularisierte den Scat-Gesang – angeblich, als ihm bei einer Aufnahme das Textblatt herunterfiel. Mit „Hello, Dolly!“ verdrängte er 1964 die Beatles von Platz 1.',
  },
  {
    id: 'ellington', name: 'Duke Ellington', short: 'Duke Ellington', dates: '1899 – 1974', era: 'jazz', type: 'star',
    unlock: (g) => own(g, 'jazz') >= 100, hint: 'Besitze 100 Big Bands.',
    passive: (l) => ({ text: `Big Band +${10 * l} %`, fx: [bm('jazz', 1 + 0.1 * l)] }),
    ability: (l) => ({ name: 'It Don\'t Mean a Thing', text: `Maximaler Groove +${100 + 10 * (l - 1)} %`, fx: [{ t: 'grooveMax', v: 1 + 0.1 * (l - 1) }] }),
    lore: 'Ellington leitete fast 50 Jahre lang sein eigenes Orchester und schrieb über 1000 Kompositionen. Er schrieb für die individuellen Stimmen seiner Musiker statt für Instrumente. Sein Credo: „It don\'t mean a thing if it ain\'t got that swing.“',
  },
  {
    id: 'ella', name: 'Ella Fitzgerald', short: 'Ella', dates: '1917 – 1996', era: 'jazz', type: 'star',
    unlock: (g) => g.state.life.maxCombo >= 256, hint: 'Erreiche eine Takt-Kombo von 256.',
    passive: (l) => ({ text: `Groove baut sich ${10 * l} % schneller auf`, fx: [{ t: 'grooveGain', v: 1 + 0.1 * l }] }),
    ability: (l) => ({ name: 'Scat', text: `Danebengeklickt? Improvisiert! Fehler brechen die Kombo nicht mehr, Inspiration aus Kombos +${25 + 5 * (l - 1)} %`, fx: [{ t: 'scat', v: 1 }, { t: 'comboInsp', v: 1.25 + 0.05 * (l - 1) }] }),
    lore: 'Die „First Lady of Song“ hatte einen Stimmumfang von drei Oktaven und improvisierte mit ihrer Stimme wie ein Saxofon. Als ihr 1960 in Berlin der Text von „Mack the Knife“ entfiel, erfand sie einfach neue Strophen – die Aufnahme gewann einen Grammy.',
  },
  {
    id: 'miles', name: 'Miles Davis', short: 'Miles Davis', dates: '1926 – 1991', era: 'jazz', type: 'star',
    unlock: (g) => !!g.state.modesUnlocked.dorian && own(g, 'jazz') >= 50, hint: 'Erlerne den dorischen Modus und besitze 50 Big Bands.',
    passive: (l) => ({ text: `+${5 * l} % Produktion`, fx: [{ t: 'prod', v: 1 + 0.05 * l }] }),
    ability: (l) => ({ name: 'Kind of Blue', text: `Der Bonus des aktiven Modus wirkt ×${fmtN(2 + 0.1 * (l - 1))}`, fx: [{ t: 'modeMult', v: 2 + 0.1 * (l - 1) }] }),
    lore: 'Miles Davis erfand den Jazz mehrmals neu: Cool Jazz, Modal Jazz, Fusion. „Kind of Blue“ (1959) basiert statt auf Akkordfolgen auf Modi wie dem Dorischen – und ist das meistverkaufte Jazzalbum aller Zeiten.',
  },
  {
    id: 'elvis', name: 'Elvis Presley', short: 'Elvis', dates: '1935 – 1977', era: 'rock', type: 'star',
    unlock: (g) => own(g, 'rock') >= 10, hint: 'Besitze 10 Rockbands.',
    passive: (l) => ({ text: `Rockband +${15 * l} %`, fx: [bm('rock', 1 + 0.15 * l)] }),
    ability: (l) => ({ name: 'Hüftschwung', text: `Klickkraft ×${fmtN(3 + 0.3 * (l - 1))}`, fx: [{ t: 'click', v: 3 + 0.3 * (l - 1) }] }),
    lore: 'Der „King of Rock\'n\'Roll“ brachte schwarze Rhythm-&-Blues-Musik in die weißen Wohnzimmer Amerikas. Sein Hüftschwung galt als so skandalös, dass ihn das Fernsehen 1957 nur von der Hüfte aufwärts zeigte. Er diente als GI im hessischen Friedberg.',
  },
  {
    id: 'cash', name: 'Johnny Cash', short: 'Johnny Cash', dates: '1932 – 2003', era: 'rock', type: 'star',
    unlock: (g) => g.state.life.gigsDone >= 50, hint: 'Spiele 50 Konzerte.',
    passive: (l) => ({ text: `Konzerte ${5 * l} % schneller`, fx: [{ t: 'gigSpeed', v: 1 + 0.05 * l }] }),
    ability: (l) => ({ name: 'Man in Black', text: `+1 Konzert-Slot, Konzert-Belohnungen +${30 + 5 * (l - 1)} %`, fx: [{ t: 'gigSlots', v: 1 }, { t: 'gigReward', v: 1.3 + 0.05 * (l - 1) }] }),
    lore: 'Seine Konzerte in den Gefängnissen Folsom und San Quentin wurden legendär. Er trug Schwarz, wie er sang, „für die Armen und die Geschlagenen“. Einige seiner ersten Songs schrieb er als Funker der US Air Force in Landsberg am Lech.',
  },
  {
    id: 'hendrix', name: 'Jimi Hendrix', short: 'Hendrix', dates: '1942 – 1970', era: 'rock', type: 'star',
    unlock: (g) => own(g, 'rock') >= 50, hint: 'Besitze 50 Rockbands.',
    passive: (l) => ({ text: `Rockband +${10 * l} %`, fx: [bm('rock', 1 + 0.1 * l)] }),
    ability: (l) => ({ name: 'Feedback', text: `Volltreffer-Multiplikator ×2, Chance +${5 + (l - 1)} %`, fx: [{ t: 'critX', v: 2 }, { t: 'crit', v: 0.05 + 0.01 * (l - 1) }] }),
    lore: 'In nur vier Jahren revolutionierte Hendrix das Gitarrenspiel mit Rückkopplung, Wah-Wah und Verzerrung. Beim Monterey Pop Festival 1967 zündete er seine Gitarre an. Seine Woodstock-Version der US-Hymne ist ein Stück Zeitgeschichte.',
  },
  {
    id: 'marley', name: 'Bob Marley', short: 'Bob Marley', dates: '1945 – 1981', era: 'rock', type: 'star',
    unlock: (g) => g.state.life.offbeatHits >= 1000, hint: 'Triff 1.000-mal auf dem Offbeat (braucht Achtelnoten).',
    passive: (l) => ({ text: `Offline-Produktion +${10 * l} %-Punkte`, fx: [{ t: 'offline', v: 0.1 * l }] }),
    ability: (l) => ({ name: 'One Love', text: `Groove fällt ${50 + 2 * (l - 1)} % langsamer ab, Offline ×2`, fx: [{ t: 'grooveDecay', v: 0.5 - 0.02 * (l - 1) }, { t: 'offlineX', v: 2 }] }),
    lore: 'Der Jamaikaner brachte den Reggae in die ganze Welt – eine Musik, bei der die Betonung auf dem Offbeat liegt: der typische „Skank“ der Gitarre zwischen den Schlägen. 1978 brachte er bei einem Konzert zwei verfeindete Politiker auf der Bühne zum Händeschütteln.',
  },
  {
    id: 'kraftwerk', name: 'Kraftwerk', short: 'Kraftwerk', dates: 'seit 1970', era: 'elektronik', type: 'band', icon: 'robot-antennas',
    unlock: (g) => own(g, 'synth') >= 25, hint: 'Besitze 25 Synthesizer.',
    passive: (l) => ({ text: `Synthesizer +${15 * l} %`, fx: [bm('synth', 1 + 0.15 * l)] }),
    ability: (l) => ({ name: 'Die Mensch-Maschine', text: `Ein Roboter klickt auf jedem Schlag – perfekt im Takt (max. ${50 + 5 * (l - 1)} % Groove)`, fx: [{ t: 'robot', v: 0.5 + 0.05 * (l - 1) }] }),
    lore: 'Die Düsseldorfer Band baute sich im „Kling Klang“-Studio ihre Instrumente selbst und erfand mit „Autobahn“, „Die Roboter“ und „Trans Europa Express“ die elektronische Popmusik. Ohne Kraftwerk kein Techno, kein Synthpop, kein Hip-Hop, wie wir ihn kennen.',
  },
  {
    id: 'queen', name: 'Queen', short: 'Queen', dates: '1970 – 1991', era: 'rock', type: 'band', icon: 'crown',
    unlock: (g) => own(g, 'rock') >= 100 && own(g, 'opera') >= 50, hint: 'Besitze 100 Rockbands und 50 Opernhäuser – Rock trifft Oper.',
    passive: (l) => ({ text: `Musikfestival +${15 * l} %`, fx: [bm('festival', 1 + 0.15 * l)] }),
    ability: (l) => ({ name: 'Stampf, stampf, klatsch!', text: `Händeklatschen ×${50 + 10 * (l - 1)}, Festival ×3`, fx: [bm('clap', 50 + 10 * (l - 1)), bm('festival', 3)] }),
    lore: '„Bohemian Rhapsody“ (1975) mischt Ballade, Oper und Hardrock – sechs Minuten, die als unmöglich radiotauglich galten und doch neun Wochen Platz 1 belegten. Beim Live-Aid-Konzert 1985 ließ Freddie Mercury 72.000 Menschen im Wembley-Stadion gemeinsam singen.',
  },
  {
    id: 'bowie', name: 'David Bowie', short: 'Bowie', dates: '1947 – 2016', era: 'rock', type: 'star',
    unlock: (g) => own(g, 'festival') >= 1 && own(g, 'studio') >= 10, hint: 'Besitze 10 Tonstudios und ein Festival.',
    passive: (l) => ({ text: `Tonstudio +${15 * l} %`, fx: [bm('studio', 1 + 0.15 * l)] }),
    ability: (l) => ({ name: 'Ziggy Stardust', text: `Neuronale Muse & Sphärenharmonie ×${3 + 0.5 * (l - 1)}`.replace('.', ','), fx: [bm('ai', 3 + 0.5 * (l - 1)), bm('spheres', 3 + 0.5 * (l - 1))] }),
    lore: 'Das Chamäleon des Pop erfand sich ständig neu: als Astronaut Major Tom, als außerirdischer Rockstar Ziggy Stardust, als „Thin White Duke“. In Berlin nahm er in den Hansa-Studios nahe der Mauer „Heroes“ auf.',
  },
  {
    id: 'mj', name: 'Michael Jackson', short: 'Michael Jackson', dates: '1958 – 2009', era: 'digital', type: 'star',
    unlock: (g) => own(g, 'stream') >= 50, hint: 'Besitze 50 Streaming-Netzwerke.',
    passive: (l) => ({ text: `Streaming +${15 * l} %`, fx: [bm('stream', 1 + 0.15 * l)] }),
    ability: (l) => ({ name: 'Thriller', text: `Gesamte Produktion +${50 + 5 * (l - 1)} %`, fx: [{ t: 'prod', v: 1.5 + 0.05 * (l - 1) }] }),
    lore: '„Thriller“ (1982) ist das meistverkaufte Album aller Zeiten. Sein 14-minütiges Musikvideo machte MTV groß, der Moonwalk bei einer TV-Show 1983 wurde zum berühmtesten Tanzschritt der Welt.',
  },
  {
    id: 'aretha', name: 'Aretha Franklin', short: 'Aretha', dates: '1942 – 2018', era: 'rock', type: 'star',
    unlock: (g) => g.achievementCount() >= 150, hint: 'Sammle 150 Auszeichnungen.',
    passive: (l) => ({ text: `Jede Auszeichnung +${fmtN(0.1 * l)} %-Punkte stärker`, fx: [{ t: 'achBonus', v: 0.001 * l }] }),
    ability: (l) => ({ name: 'R-E-S-P-E-C-T', text: `Bonus aller Auszeichnungen ×${fmtN(2 + 0.1 * (l - 1))}`, fx: [{ t: 'achMult', v: 2 + 0.1 * (l - 1) }] }),
    lore: 'Die „Queen of Soul“ wuchs in der Kirche ihres Vaters in Detroit auf und sang mit einer Kraft, die Gospel, Soul und Pop verband. 1987 wurde sie als erste Frau in die Rock and Roll Hall of Fame aufgenommen.',
  },
  {
    id: 'abba', name: 'ABBA', short: 'ABBA', dates: 'seit 1972', era: 'elektronik', type: 'band', icon: 'microphone',
    unlock: (g) => g.state.life.gigsDone >= 100, hint: 'Spiele 100 Konzerte.',
    passive: (l) => ({ text: `Konzert-Belohnungen +${15 * l} %`, fx: [{ t: 'gigReward', v: 1 + 0.15 * l }] }),
    ability: (l) => ({ name: 'Waterloo', text: `Konzert-Belohnungen ×${fmtN(2 + 0.2 * (l - 1))}, Fundchance +50 %`, fx: [{ t: 'gigReward', v: 2 + 0.2 * (l - 1) }, { t: 'relicLuck', v: 1.5 }] }),
    lore: 'Mit „Waterloo“ gewannen die vier Schweden 1974 den Eurovision Song Contest und wurden zur erfolgreichsten Popgruppe Europas. Das erste industriell gepresste CD-Album der Welt war 1982 ABBAs „The Visitors“ – aus einem Werk in Langenhagen bei Hannover.',
  },
  {
    id: 'daftpunk', name: 'Daft Punk', short: 'Daft Punk', dates: '1993 – 2021', era: 'elektronik', type: 'band', icon: 'vr-headset',
    unlock: (g) => own(g, 'dj') >= 50, hint: 'Besitze 50 DJ-Pulte.',
    passive: (l) => ({ text: `DJ-Pult +${15 * l} %`, fx: [bm('dj', 1 + 0.15 * l)] }),
    ability: (l) => ({ name: 'Härter, besser, schneller', text: `Tempo +15 %, DJ-Pult ×${3 + 0.5 * (l - 1)}`.replace('.', ','), fx: [{ t: 'bpm', v: 1.15 }, bm('dj', 3 + 0.5 * (l - 1))] }),
    lore: 'Das Pariser Duo trat fast nur mit Roboterhelmen auf und prägte den „French House“. Ihre Konzerte in einer leuchtenden Pyramide gelten als Meilenstein der Bühnenshow. 2014 gewannen sie fünf Grammys, darunter „Album des Jahres“.',
  },
  {
    id: 'pinkfloyd', name: 'Pink Floyd', short: 'Pink Floyd', dates: '1965 – 2014', era: 'rock', type: 'band', icon: 'moon',
    unlock: (g) => g.state.run.total >= 1e24, hint: 'Erspiele in einem Durchgang eine Quadrillion Noten.',
    passive: (l) => ({ text: `Offline-Maximalzeit +${2 * l} Std.`, fx: [{ t: 'offlineCap', v: 2 * l }] }),
    ability: (l) => ({ name: 'Dark Side of the Moon', text: `Ohne Klick seit 30 Sek.: Produktion ×${fmtN(2 + 0.2 * (l - 1))}`, fx: [{ t: 'idle', v: 2 + 0.2 * (l - 1) }] }),
    lore: '„The Dark Side of the Moon“ (1973) blieb über 900 Wochen in den US-Albumcharts – ein Rekord für die Ewigkeit. Pink Floyd experimentierte mit Tonbandschleifen, Uhrenticken und Kassenklingeln. Roger Waters führte ihr Konzeptalbum „The Wall“ 1990 am Potsdamer Platz auf.',
  },
  {
    id: 'stones', name: 'The Rolling Stones', short: 'Rolling Stones', dates: 'seit 1962', era: 'rock', type: 'band', icon: 'lips',
    unlock: (g) => g.state.life.playTime >= 36000, hint: 'Spiele insgesamt 10 Stunden.',
    passive: (l) => ({ text: `Rockband +${10 * l} %`, fx: [bm('rock', 1 + 0.1 * l)] }),
    ability: (l) => ({ name: 'Satisfaction', text: `+${10 + (l - 1)} % Produktion pro Stunde in diesem Durchgang (max. +200 %)`, fx: [] }),
    dyn: 'satisfaction',
    lore: 'Seit über 60 Jahren auf Tour – länger als jede andere Rockband. Das Zungen-Logo entwarf 1970 ein Kunststudent für 50 Pfund. Keith Richards fiel das Riff von „Satisfaction“ im Schlaf ein; er nahm es auf Kassette auf und schnarchte danach 40 Minuten weiter.',
  },
];

function fmtN(x) { return (Math.round(x * 100) / 100).toString().replace('.', ','); }

export const LEGEND_BY_ID = Object.fromEntries(LEGENDS.map((l, i) => [l.id, { ...l, index: i }]));
LEGENDS.forEach((l, i) => { l.index = i; });

export const LEGEND_MAX_LEVEL = 20;
export function legendLevelCost(lvl) {
  // Kosten in Inspiration für Stufe lvl -> lvl+1
  return Math.ceil(6 * Math.pow(1.55, lvl - 1));
}
export const TYPE_LABEL = { composer: 'Komponist:in', theorist: 'Theoretiker', star: 'Star', band: 'Band' };
