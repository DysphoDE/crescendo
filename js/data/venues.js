// Konzerte / Auftrittsorte. dur in Sekunden.
// Belohnung: Noten (≈ Grundproduktion × Dauer × Faktor), Inspiration, Chance auf Raritäten.

export const VENUES = [
  { id: 'lagerfeuer', at: 'am Lagerfeuer', name: 'Lagerfeuer', icon: 'campfire', era: 'urzeit', dur: 120, unlock: { b: 'flute', n: 5 }, insp: 1, relic: 0.08,
    desc: 'Die Sippe versammelt sich um die Flammen.' },
  { id: 'agora', at: 'auf der Agora von Athen', name: 'Agora von Athen', icon: 'greek-temple', era: 'antike', dur: 300, unlock: { b: 'lyre', n: 5 }, insp: 2, relic: 0.15,
    desc: 'Der Marktplatz der Philosophen – und der Musiker.' },
  { id: 'dorffest', at: 'beim Dorffest', name: 'Dorffest', icon: 'beer-stein', era: 'mittelalter', dur: 600, unlock: { b: 'choir', n: 1 }, insp: 3, relic: 0.22,
    desc: 'Spielleute, Gaukler, Met und Tanz unter der Linde.' },
  { id: 'kathedrale', at: 'in der Kathedrale', name: 'Kathedrale', icon: 'church', era: 'mittelalter', dur: 1200, unlock: { b: 'choir', n: 15 }, insp: 5, relic: 0.3,
    desc: 'Acht Sekunden Nachhall unter gotischen Gewölben.' },
  { id: 'hof', at: 'am Fürstenhof', name: 'Fürstenhof', icon: 'castle', era: 'barock', dur: 1800, unlock: { b: 'organ', n: 1 }, insp: 7, relic: 0.36,
    desc: 'Tafelmusik für Kurfürsten und Kaiserinnen.' },
  { id: 'musikverein', at: 'im Wiener Musikverein', name: 'Wiener Musikverein', icon: 'violin', era: 'klassik', dur: 3600, unlock: { b: 'quartet', n: 1 }, insp: 12, relic: 0.48,
    desc: 'Der Goldene Saal – eine der besten Akustiken der Welt.' },
  { id: 'scala', at: 'im Teatro alla Scala', name: 'Teatro alla Scala', icon: 'theater-curtains', era: 'romantik', dur: 7200, unlock: { b: 'opera', n: 1 }, insp: 20, relic: 0.6,
    desc: 'Mailänder Opernglanz. Das Publikum ist gnadenlos.' },
  { id: 'cotton', at: 'im Cotton Club', name: 'Cotton Club', icon: 'saxophone', era: 'jazz', dur: 7200, unlock: { b: 'jazz', n: 1 }, insp: 20, relic: 0.6,
    desc: 'Harlem, 1927: Duke Ellington spielt jeden Abend.' },
  { id: 'cavern', at: 'im Kellerclub in Liverpool', name: 'Kellerclub in Liverpool', icon: 'guitar', era: 'rock', dur: 10800, unlock: { b: 'rock', n: 1 }, insp: 28, relic: 0.66,
    desc: 'Verschwitzt, eng, laut – hier begann eine Revolution.' },
  { id: 'bunker', at: 'im Techno-Bunker', name: 'Techno-Bunker Berlin', icon: 'speaker', era: 'elektronik', dur: 14400, unlock: { b: 'dj', n: 1 }, insp: 35, relic: 0.72,
    desc: 'Die Tür ist streng. Drinnen: Bass bis zum Morgen.' },
  { id: 'wembley', at: 'im Wembley-Stadion', name: 'Wembley-Stadion', icon: 'podium-winner', era: 'digital', dur: 21600, unlock: { b: 'stream', n: 1 }, insp: 50, relic: 0.8,
    desc: '90.000 Menschen singen jeden Refrain mit.' },
  { id: 'woodstock', at: 'auf der Festivalwiese', name: 'Festivalwiese', icon: 'camping-tent', era: 'global', dur: 28800, unlock: { b: 'festival', n: 1 }, insp: 62, relic: 0.85,
    desc: 'Drei Tage Frieden, Musik – und Schlamm.' },
  { id: 'iss', at: 'auf der Raumstation ISS', name: 'Raumstation ISS', icon: 'satellite', era: 'zukunft', dur: 43200, unlock: { b: 'ai', n: 1 }, insp: 85, relic: 0.9,
    desc: 'Das erste Konzert in der Schwerelosigkeit. Die Gitarre schwebt.' },
  { id: 'mond', at: 'im Mondkrater Tycho', name: 'Mondkrater Tycho', icon: 'moon', era: 'kosmos', dur: 86400, unlock: { b: 'spheres', n: 1 }, insp: 150, relic: 0.97,
    desc: 'Im Vakuum hört dich niemand. Aber das Universum spürt es.' },
];
export const VENUE_BY_ID = Object.fromEntries(VENUES.map((v, i) => [v.id, { ...v, index: i }]));
VENUES.forEach((v, i) => { v.index = i; });
