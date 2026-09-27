// Musik-Ticker: Schlagzeilen passend zum Fortschritt. era = Mindest-Epoche (Index), max = höchste Epoche.
// Platzhalter: {name} = Name der Legende o. Ä. werden nicht benötigt – alles statisch, außer dynamischen Einträgen unten.

export const NEWS = [
  // Urzeit
  { era: 0, max: 1, t: 'Höhlenbewohner beschweren sich über rhythmisches Klatschen zur Schlafenszeit.' },
  { era: 0, max: 1, t: 'Neandertaler gründet erste Boyband. Name: „Die Keulen“.' },
  { era: 0, max: 1, t: 'Mammut flieht vor Trommelkreis. Jäger fordern mehr Musik.' },
  { era: 0, max: 2, t: 'Stammesältester: „Früher hat man noch mit Steinen geklatscht.“' },
  { era: 0, max: 2, t: 'Studie: Wer ums Lagerfeuer tanzt, friert weniger.' },
  { era: 0, max: 2, t: 'Eilmeldung: Jemand hat Löcher in einen Knochen gebohrt – und es klingt!' },
  { era: 0, max: 3, t: 'Geier-Population rückläufig. Flötenbauer weisen jede Schuld von sich.' },
  { era: 0, max: 3, t: 'Erste Lärmschutzverordnung in Stein gemeißelt. Niemand kann sie lesen.' },
  // Antike
  { era: 1, max: 3, t: 'Pythagoras entdeckt: Eine halbierte Saite klingt eine Oktave höher. Die Welt staunt.' },
  { era: 1, max: 3, t: 'Orpheus in der Unterwelt: Zerberus schläft beim zweiten Refrain ein.' },
  { era: 1, max: 3, t: 'Olympische Spiele erweitern Programm um „Kithara-Wettspiel“. Die Läufer sind skeptisch.' },
  { era: 1, max: 3, t: 'Platon warnt: Neue Tonarten verderben die Jugend!' },
  { era: 1, max: 4, t: 'Schildkröten gründen Interessenverband gegen Lyrabau.' },
  // Mittelalter
  { era: 2, max: 4, t: 'Mönche fordern längeren Nachhall. Kathedrale wird um 20 Meter erhöht.' },
  { era: 2, max: 4, t: 'Guido von Arezzo zieht Linien auf Pergament. Kopisten: „Endlich!“' },
  { era: 2, max: 4, t: 'Skandal im Kloster: Bruder Anselm singt eine zweite Stimme!' },
  { era: 2, max: 4, t: 'Spielleute am Dorfplatz: Pfarrer nennt Dudelsack „Werkzeug des Teufels“.' },
  { era: 2, max: 5, t: 'Hildegard von Bingen veröffentlicht neues Werk. Nebenbei: ein Buch über Heilkräuter.' },
  { era: 2, max: 5, t: 'Kirchenrat verbietet den Tritonus. Tritonus zeigt sich unbeeindruckt.' },
  // Renaissance
  { era: 3, max: 5, t: 'Venedig: Erster Notendruck erschienen! Kopistenmönche fürchten um ihre Jobs.' },
  { era: 3, max: 5, t: 'Lautenspieler singt vor der falschen Burg. Burgfräulein trotzdem beeindruckt.' },
  { era: 3, max: 6, t: 'Füssen im Allgäu: Lautenbauer exportieren bis nach Venedig. „Wir sind halt gut.“' },
  { era: 3, max: 6, t: 'Madrigalchor streitet über Stimmverteilung. Tenor droht mit Auszug.' },
  // Barock
  { era: 4, max: 6, t: 'Johann Sebastian Bach wieder Vater geworden. Es ist das 13. Kind. Er komponiert eine Kantate.' },
  { era: 4, max: 6, t: 'Orgel-Blasebalgtreter fordern Tarifvertrag.' },
  { era: 4, max: 6, t: 'Perückenknappheit in Leipzig! Hofmusiker verzweifelt.' },
  { era: 4, max: 7, t: 'Händel und Mattheson duellieren sich nach einem Opernstreit. Ein Knopf rettet Händel das Leben.' },
  { era: 4, max: 7, t: 'Vivaldi schreibt sein 500. Konzert. Kritiker: „Er schreibt immer dasselbe Konzert 500-mal.“' },
  { era: 4, max: 7, t: 'Kaffeesucht grassiert in Leipzig. Bach reagiert mit einer Kantate.' },
  // Klassik
  { era: 5, max: 7, t: 'Wunderkind Mozart spielt mit verbundenen Augen. Das Publikum schaut trotzdem hin.' },
  { era: 5, max: 7, t: 'Bratschisten veröffentlichen Protestbrief gegen Bratschenwitze. Niemand liest ihn bis zum Ende.' },
  { era: 5, max: 8, t: 'Haydn überrascht Publikum mit plötzlichem Paukenschlag. Mehrere Herren erwachen.' },
  { era: 5, max: 8, t: 'Beethoven zieht zum 60. Mal um. Vermieter atmen auf.' },
  { era: 5, max: 8, t: 'Metronom patentiert! Musiker fühlen sich erstmals kontrolliert.' },
  // Romantik
  { era: 6, max: 8, t: 'Lisztomanie: Damen streiten um die Kaffeereste des Pianisten.' },
  { era: 6, max: 8, t: 'Paganini spielt mit nur einer Saite. Die anderen drei gehen in Rente.' },
  { era: 6, max: 9, t: 'Wagner-Oper dauert länger als angekündigt. Publikum feiert Geburtstage im Saal.' },
  { era: 6, max: 9, t: 'Chopin sagt Konzert ab: „Zu viel Publikum.“ Es waren elf Leute.' },
  { era: 6, max: 9, t: 'Berlioz fordert 1000 Musiker für seine nächste Sinfonie. Stadt stellt einen Antrag.' },
  { era: 6, max: 9, t: 'Neuer Konzertflügel wiegt eine halbe Tonne. Klavierträger melden Rückenschmerzen.' },
  { era: 6, max: 10, t: 'Brahms verbrennt erneut unfertige Werke. Feuerwehr bittet um Vorwarnung.' },
  { era: 6, max: 10, t: 'Sopranistin lässt Weinglas zerspringen. Wirt stellt Rechnung.' },
  // Jazz
  { era: 7, max: 10, t: 'Swing breitet sich aus! Tanzschulen melden Rekordzahlen.' },
  { era: 7, max: 10, t: 'Saxofonist spielt 40-minütiges Solo. Band bestellt in der Zwischenzeit Essen.' },
  { era: 7, max: 10, t: 'Jazzmusiker verspielt sich absichtlich. Kritiker: „Genial!“' },
  { era: 7, max: 11, t: 'Scat-Gesang erfunden, weil ein Textblatt herunterfiel. Textdichter besorgt.' },
  // Rock
  { era: 8, max: 11, t: 'Eltern besorgt: Hüftschwung im Fernsehen! Kamera zeigt ab sofort nur Oberkörper.' },
  { era: 8, max: 11, t: 'Gitarrist zertrümmert Gitarre. Gitarrenbauer verzeichnen Umsatzplus.' },
  { era: 8, max: 11, t: 'Verstärker lässt sich jetzt bis elf aufdrehen. Physiker ratlos.' },
  { era: 8, max: 12, t: 'Rockband wirft Fernseher aus Hotelfenster. Hotel lässt Fenster vergittern.' },
  { era: 8, max: 12, t: 'Studie: 94 % aller Luftgitarristen spielen in E.' },
  { era: 8, max: 12, t: 'Schlagzeuger verliert Stick mitten im Solo. Niemand merkt es.' },
  // Elektronik
  { era: 9, max: 12, t: 'Düsseldorfer Band ersetzt sich selbst durch Roboter. Roboter geben Interviews.' },
  { era: 9, max: 12, t: 'Synthesizer so groß wie ein Kleiderschrank. Wohnungssuche wird schwierig.' },
  { era: 9, max: 13, t: 'Berliner Club lässt Gast nach 3 Tagen wieder hinaus. Gast: „Schon vorbei?“' },
  { era: 9, max: 13, t: 'DJ drückt 90 Minuten lang auf „Play“. Publikum rastet aus.' },
  { era: 9, max: 13, t: 'Drumcomputer „ohne Seele“ wird Kult. Seele meldet sich zu Wort.' },
  // Digital
  { era: 10, max: 13, t: 'Streamingdienst entdeckt neues Genre: „Traurige Lieder zum Bügeln“.' },
  { era: 10, max: 13, t: 'Algorithmus empfiehlt dir dein eigenes Lied. Du findest es gut.' },
  { era: 10, max: 13, t: 'Musikproduzent mischt Hit auf dem Smartphone. Studio vermietet Räume als Wohnungen.' },
  { era: 10, max: 13, t: 'Umfrage: Die Hälfte aller Deutschen summt gerade einen Ohrwurm.' },
  // Weltbühne & Zukunft
  { era: 11, max: 13, t: 'Festival so groß, dass es eine eigene Postleitzahl bekommt.' },
  { era: 11, max: 13, t: 'Moshpit vom Weltraum aus sichtbar.' },
  { era: 11, max: 13, t: 'Dixi-Klo-Hersteller dankt der Musikindustrie.' },
  { era: 12, max: 13, t: 'Neuronale Muse komponiert Sinfonie in 0,3 Sekunden. Bittet um Applaus.' },
  { era: 12, max: 13, t: 'KI weigert sich, Bratschenwitze zu erzählen. Bratschisten jubeln.' },
  { era: 12, max: 13, t: 'Maschine träumt von elektrischen Schafen – und vertont sie in Des-Dur.' },
  // Kosmos
  { era: 13, max: 13, t: 'Saturnringe vibrieren im Takt. NASA bestätigt: Es ist ein Walzer.' },
  { era: 13, max: 13, t: 'Außerirdische senden Antwort auf die Voyager-Platte: „Mehr Chuck Berry!“' },
  { era: 13, max: 13, t: 'Schwarzes Loch brummt ein tiefes B. 57 Oktaven unter dem mittleren C.' },
  { era: 13, max: 13, t: 'Kepler aus dem Jenseits: „Ich hab\'s euch ja gesagt.“' },
  // Epochenunabhängig
  { era: 0, max: 13, t: 'Tipp: Klicke im Takt der Musik, um Groove aufzubauen!' },
  { era: 0, max: 13, t: 'Tipp: Mit der Leertaste kannst du im Takt klicken.' },
  { era: 1, max: 13, t: 'Tipp: Goldene Noten verschwinden schnell – halte die Augen offen!' },
  { era: 0, max: 13, t: 'Wissenschaft: Musik setzt Dopamin frei – genau wie Schokolade.' },
  { era: 0, max: 13, t: 'Umfrage: Kühe geben angeblich mehr Milch bei ruhiger Musik. Die Kühe schweigen dazu.' },
  { era: 2, max: 13, t: 'Ein Straßenmusiker pfeift: E – Dis – E – Dis – E … Was war das nur?' },
  { era: 3, max: 13, t: 'Graffito an einer Kirchenmauer: „B – A – C – H“. Die Polizei ermittelt.' },
  { era: 4, max: 13, t: 'Nachts auf der Alm: Jemand spielt immer wieder G – G – G – Es. Die Kühe sind beunruhigt.' },
  { era: 2, max: 13, t: 'Ein Kind am Klavier: C – D – E – F – G – G … Eltern jubeln.' },
  { era: 5, max: 13, t: 'Filmkritik: „Zwei Töne, und alle haben Angst vor dem Wasser.“' },
  { era: 6, max: 13, t: 'Rätsel des Tages: Welcher Mönch schreibt Melodien auf Linien – und welche Hand kennt alle Töne?' },
  { era: 3, max: 13, t: 'Leser fragt: Warum heißt es in Deutschland H und nicht B? Die Redaktion zuckt mit den Schultern.' },
  { era: 0, max: 13, t: 'Studie: Wer ein Instrument lernt, verbessert sein Gedächtnis. Wie hieß die Studie noch gleich?' },
  { era: 5, max: 13, t: 'Wusstest du? Beethovens Metronomangaben gelten bis heute als rätselhaft schnell.' },
  { era: 0, max: 13, t: 'Wusstest du? Der Kammerton a\' schwingt 440-mal pro Sekunde – meistens.' },
  { era: 6, max: 13, t: 'Wusstest du? Das Wort „Orchester“ kommt vom griechischen Tanzplatz vor der Bühne.' },
  { era: 7, max: 13, t: 'Wusstest du? Das Saxofon wurde in den 1840ern vom Belgier Adolphe Sax erfunden – er wollte Holz und Blech vereinen.' },
];

// Dynamische Schlagzeilen (werden mit aktuellen Werten gefüllt)
export const DYN_NEWS = [
  (g) => g.state.run.buildings.clap > 50 && `${g.state.run.buildings.clap} Klatscher im Saal. Die Akustik ist überfordert.`,
  (g) => g.state.run.buildings.drum > 25 && `Anwohner zählen ${g.state.run.buildings.drum} Trommeln. Ohrstöpsel ausverkauft.`,
  (g) => g.state.run.buildings.orchestra > 10 && `${g.state.run.buildings.orchestra} Orchester stimmen gleichzeitig. Ein Oboist gibt das A.`,
  (g) => g.state.run.buildings.rock > 10 && `${g.state.run.buildings.rock} Rockbands suchen gleichzeitig einen neuen Bassisten.`,
  (g) => g.state.life.daCapos > 0 && `Fans feiern das ${g.state.life.daCapos}. Comeback. „Diesmal wird alles anders!“`,
  (g) => g.state.records > 0 && `Die Wand im Flur hängt voller Goldener Schallplatten: ${Math.floor(g.state.records)} Stück.`,
  (g) => g.state.life.golden > 10 && `Glückspilz! Schon ${g.state.life.golden} goldene Noten gefangen.`,
];
