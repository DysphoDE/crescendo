// Epochen der Musikgeschichte – bestimmen Farbwelt, Musikstil und Ticker
export const ERAS = [
  {
    id: 'urzeit', name: 'Urzeit', years: 'vor 40.000 Jahren', icon: 'campfire',
    colors: { a: '#2a1406', b: '#120904', accent: '#ff9d4a', accent2: '#ffcf7a', glow: 'rgba(255,140,50,.35)' },
    desc: 'Am Lagerfeuer entdeckt die Menschheit den Rhythmus. Hände, Häute und Knochen werden zu den ersten Instrumenten.',
  },
  {
    id: 'antike', name: 'Antike', years: 'ca. 800 v. Chr. – 500 n. Chr.', icon: 'greek-temple',
    colors: { a: '#0b2a2c', b: '#06151a', accent: '#6fe0cf', accent2: '#e8e0c8', glow: 'rgba(80,220,200,.3)' },
    desc: 'Griechen erforschen die Mathematik der Töne. Pythagoras findet die Intervalle, Orpheus bezaubert die Welt mit der Lyra.',
  },
  {
    id: 'mittelalter', name: 'Mittelalter', years: 'ca. 500 – 1400', icon: 'church',
    colors: { a: '#0c1438', b: '#060818', accent: '#86a8ff', accent2: '#ffd36b', glow: 'rgba(110,140,255,.33)' },
    desc: 'In Klöstern hallt der Gregorianische Choral. Guido von Arezzo erfindet die Notenlinien – Musik wird aufschreibbar.',
  },
  {
    id: 'renaissance', name: 'Renaissance', years: 'ca. 1400 – 1600', icon: 'castle',
    colors: { a: '#1f2a10', b: '#0e1406', accent: '#c7e27a', accent2: '#ff9f80', glow: 'rgba(190,230,110,.3)' },
    desc: 'Der Buchdruck verbreitet Noten, die Mehrstimmigkeit blüht. Lautenisten und Spielleute ziehen durch Europa.',
  },
  {
    id: 'barock', name: 'Barock', years: '1600 – 1750', icon: 'pipe-organ',
    colors: { a: '#33150c', b: '#170805', accent: '#ffc94d', accent2: '#ff7a59', glow: 'rgba(255,190,70,.35)' },
    desc: 'Prunk, Pathos und Kontrapunkt: Bach, Händel und Vivaldi schreiben Musik für Kirchen und Königshöfe.',
  },
  {
    id: 'klassik', name: 'Wiener Klassik', years: '1750 – 1820', icon: 'violin',
    colors: { a: '#10233a', b: '#08111e', accent: '#a9d8ff', accent2: '#f4e3c1', glow: 'rgba(160,210,255,.32)' },
    desc: 'Klarheit und Balance. Haydn, Mozart und Beethoven formen Sinfonie, Sonate und Streichquartett.',
  },
  {
    id: 'romantik', name: 'Romantik', years: '1820 – 1910', icon: 'grand-piano',
    colors: { a: '#2c0c24', b: '#12050f', accent: '#ff7aa2', accent2: '#c9a6ff', glow: 'rgba(255,110,160,.32)' },
    desc: 'Gefühl über alles! Virtuosen füllen Konzertsäle, Orchester wachsen ins Riesenhafte, die Oper wird zum Gesamtkunstwerk.',
  },
  {
    id: 'jazz', name: 'Jazz-Zeitalter', years: '1910 – 1950', icon: 'saxophone',
    colors: { a: '#1e1a10', b: '#0b0905', accent: '#e9c46a', accent2: '#4fd1c5', glow: 'rgba(233,196,106,.32)' },
    desc: 'Aus New Orleans erobern Swing und Improvisation die Welt. Big Bands bringen die Ballsäle zum Beben.',
  },
  {
    id: 'rock', name: 'Rock-Ära', years: '1950 – 1980', icon: 'guitar',
    colors: { a: '#2d0808', b: '#110303', accent: '#ff5252', accent2: '#ffd166', glow: 'rgba(255,70,70,.35)' },
    desc: 'Verstärker auf elf! E-Gitarren, Hüftschwünge und Stadionhymnen lassen eine ganze Generation rebellieren.',
  },
  {
    id: 'elektronik', name: 'Elektronik', years: '1970 – 2000', icon: 'musical-keyboard',
    colors: { a: '#1d0833', b: '#0a0316', accent: '#ff4df0', accent2: '#3de8ff', glow: 'rgba(255,77,240,.33)' },
    desc: 'Oszillatoren und Drumcomputer erfinden den Klang neu. Aus Düsseldorf, Detroit und Berlin pulsiert der Beat.',
  },
  {
    id: 'digital', name: 'Digitalzeitalter', years: '1990 – heute', icon: 'earbuds',
    colors: { a: '#061a33', b: '#030a16', accent: '#4dd6ff', accent2: '#8cff9e', glow: 'rgba(77,214,255,.33)' },
    desc: 'Musik wird zu Daten: Studios im Laptop, Milliarden Streams, jeder Song überall und sofort.',
  },
  {
    id: 'global', name: 'Weltbühne', years: 'Gegenwart', icon: 'party-flags',
    colors: { a: '#2e0f1c', b: '#12050a', accent: '#ff8a5c', accent2: '#ffd86b', glow: 'rgba(255,138,92,.33)' },
    desc: 'Hunderttausende tanzen gemeinsam. Festivals verbinden Kontinente zu einem einzigen, pulsierenden Publikum.',
  },
  {
    id: 'zukunft', name: 'Zukunft', years: 'morgen', icon: 'brain',
    colors: { a: '#04241c', b: '#020f0b', accent: '#5cffb5', accent2: '#b5f3ff', glow: 'rgba(92,255,181,.3)' },
    desc: 'Neuronale Netze träumen Melodien, die noch nie ein Mensch gehört hat.',
  },
  {
    id: 'kosmos', name: 'Kosmos', years: 'jenseits der Zeit', icon: 'solar-system',
    colors: { a: '#150a33', b: '#05030f', accent: '#b98cff', accent2: '#7de3ff', glow: 'rgba(185,140,255,.36)' },
    desc: 'Kepler hatte recht: Die Planeten singen. Deine Musik erfüllt nun das Universum selbst.',
  },
];

export const ERA_BY_ID = Object.fromEntries(ERAS.map((e, i) => [e.id, { ...e, index: i }]));
