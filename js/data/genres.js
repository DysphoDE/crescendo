// Genres: werden in der Ruhmeshalle freigeschaltet und beim Da Capo für den nächsten Durchgang gewählt.
// Sie verändern Spielweise UND Musikstil.

export const GENRES = [
  {
    id: 'klassik', name: 'Klassik', icon: 'violin', color: '#f4d58d', cost: 5,
    text: 'Orgel, Streichquartett, Flügel, Orchester und Oper ×3',
    fx: [{ t: 'bmult', b: 'organ', v: 3 }, { t: 'bmult', b: 'quartet', v: 3 }, { t: 'bmult', b: 'piano', v: 3 }, { t: 'bmult', b: 'orchestra', v: 3 }, { t: 'bmult', b: 'opera', v: 3 }],
    style: 'klassik',
    lore: 'Im engeren Sinn meint „Klassik“ die Wiener Klassik um Haydn, Mozart und Beethoven. Im Alltag steht das Wort für alle Kunstmusik von Bach bis heute.',
  },
  {
    id: 'jazz', name: 'Jazz', icon: 'saxophone', color: '#e9c46a', cost: 25,
    text: 'Swing-Rhythmus · goldene Noten doppelt so häufig · Big Band ×5',
    fx: [{ t: 'goldFreq', v: 2 }, { t: 'bmult', b: 'jazz', v: 5 }],
    style: 'jazz',
    lore: 'Jazz lebt vom Swing, von „Blue Notes“ und von Improvisation. Er entstand um 1900 in New Orleans und wurde zur ersten Weltmusik des 20. Jahrhunderts.',
  },
  {
    id: 'rock', name: 'Rock', icon: 'guitar', color: '#ff5252', cost: 50,
    text: 'Klickkraft ×5 · Volltreffer-Chance +10 % · Rockband ×5',
    fx: [{ t: 'click', v: 5 }, { t: 'crit', v: 0.1 }, { t: 'bmult', b: 'rock', v: 5 }],
    style: 'rock',
    lore: 'Laute Gitarren, treibendes Schlagzeug, Rebellion. Aus dem Rock\'n\'Roll der 50er entwickelten sich Hard Rock, Punk, Grunge und unzählige weitere Stile.',
  },
  {
    id: 'pop', name: 'Pop', icon: 'microphone', color: '#ff7ad9', cost: 100,
    text: 'Konzert-Belohnungen ×3 · Konzerte 50 % schneller · Streaming ×5',
    fx: [{ t: 'gigReward', v: 3 }, { t: 'gigSpeed', v: 1.5 }, { t: 'bmult', b: 'stream', v: 5 }],
    style: 'pop',
    lore: 'Populäre Musik für alle: eingängige Refrains, drei bis vier Minuten, Strophe–Refrain–Strophe. Die berühmteste Akkordfolge der Popgeschichte: I–V–vi–IV.',
  },
  {
    id: 'elektro', name: 'Elektro', icon: 'musical-keyboard', color: '#3de8ff', cost: 250,
    text: 'Ein Roboter klickt auf jedem Schlag · Synthesizer & DJ-Pult ×5',
    fx: [{ t: 'robot', v: 0.6 }, { t: 'bmult', b: 'synth', v: 5 }, { t: 'bmult', b: 'dj', v: 5 }],
    style: 'elektro',
    lore: 'Von Kraftwerk über Detroit-Techno bis zu Berliner Clubnächten: Elektronische Musik entsteht aus Maschinen – und bringt Menschen zum Tanzen.',
  },
  {
    id: 'hiphop', name: 'Hip-Hop', icon: 'headphones', color: '#ffb347', cost: 500,
    text: 'Groove-Bonus ×3 · Groove fällt langsamer ab',
    fx: [{ t: 'grooveMult', v: 3 }, { t: 'grooveDecay', v: 0.6 }],
    style: 'hiphop',
    lore: 'In den 1970ern in der Bronx geboren: DJing, Rap, Breakdance und Graffiti. Der entspannte „Boom-Bap“-Beat mit schwerem Kick und knallender Snare ist sein Fundament.',
  },
  {
    id: 'metal', name: 'Metal', icon: 'crowned-skull', color: '#b0b0b0', cost: 1000,
    text: 'Tempo 170 BPM · Volltreffer ×3 stärker · Rockband ×10, Festival ×5',
    fx: [{ t: 'critX', v: 3 }, { t: 'bmult', b: 'rock', v: 10 }, { t: 'bmult', b: 'festival', v: 5 }],
    style: 'metal',
    lore: 'Härter, schneller, lauter: Aus dem Hard Rock entstand Ende der 60er der Heavy Metal. Doublebass-Drums, verzerrte Gitarren und phrygische Skalen gehören dazu.',
  },
  {
    id: 'reggae', name: 'Reggae', icon: 'sunrise', color: '#7bd66b', cost: 2000,
    text: 'Treffer auf dem Offbeat zählen doppelt · Offline-Produktion ×3',
    fx: [{ t: 'eighths', v: 1 }, { t: 'offbeatOnly', v: 1 }, { t: 'offlineX', v: 3 }],
    style: 'reggae',
    lore: 'Der jamaikanische Reggae betont die „falschen“ Zählzeiten: Die Gitarre spielt den „Skank“ zwischen den Schlägen, der Bass groovt tief und entspannt.',
  },
  {
    id: 'ambient', name: 'Ambient', icon: 'night-sky', color: '#9fb4ff', cost: 5000,
    text: 'Kein Beat, kein Groove · ohne Klick: Produktion ×4 · Klicks ×0,5',
    fx: [{ t: 'noBeat', v: 1 }, { t: 'idle', v: 4 }, { t: 'click', v: 0.5 }],
    style: 'ambient',
    lore: 'Brian Eno prägte den Begriff 1978 mit „Music for Airports“: Musik, die „so ignorierbar wie interessant“ sein soll – ein Klangraum statt eines Songs.',
  },
  {
    id: 'schlager', name: 'Schlager', icon: 'high-five', color: '#ffd166', cost: 7777,
    text: 'Das ganze Publikum klatscht mit: Händeklatschen ×1000, Mitklatschen ×10',
    fx: [{ t: 'bmult', b: 'clap', v: 1000 }, { t: 'clapFlatMult', v: 10 }],
    style: 'schlager',
    lore: 'Eingängig, gefühlvoll, zum Mitsingen – und vor allem zum Mitklatschen auf der Eins und der Drei. Ein Genre, das in Deutschland Stadien füllt.',
  },
  {
    id: 'techno', name: 'Techno', icon: 'speaker', color: '#c77dff', cost: 15000,
    text: 'Pro Stunde ununterbrochenen Spielens Produktion +50 % (max. +500 %) · DJ-Pult ×10',
    fx: [{ t: 'bmult', b: 'dj', v: 10 }],
    dyn: 'techno',
    style: 'techno',
    lore: 'Detroit erfand ihn, Berlin machte ihn nach dem Mauerfall zum Lebensgefühl: In alten Kraftwerken und Bunkern wird bis zum Morgen getanzt.',
  },
];
export const GENRE_BY_ID = Object.fromEntries(GENRES.map((g) => [g.id, g]));
