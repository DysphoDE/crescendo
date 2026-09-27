// Musikstile: Tempo, Takt, Groove, Akkordfolgen und Klangpalette.
// prog: Akkord-Stufen (0 = Tonika) pro Takt, bezogen auf die aktuelle Tonleiter (Modus).
// Die Rollen (Rhythmus, Bass, Harmonie, Fläche, Melodie) werden erst hörbar, wenn passende Instrumente gekauft sind.

export const STYLES = {
  urzeit: { gain: 1.5, name: 'Urzeit', bpm: 92, swing: 0, prog: [0, 0, 3, 4], kit: 'tribal', bass: 'none', harm: 'arp', harmI: 'kalimba', pad: null, lead: 'marimba', melody: 'flute', rev: 0.35, penta: true },
  antike: { gain: 1.48, name: 'Antike', bpm: 84, swing: 0, prog: [0, 3, 4, 0], kit: 'frame', bass: 'drone', harm: 'arp', harmI: 'harp', pad: null, lead: 'harp', melody: 'flute', rev: 0.4, penta: true },
  mittelalter: { gain: 1.35, name: 'Mittelalter', bpm: 72, swing: 0, prog: [0, 3, 0, 4], kit: 'frameSoft', bass: 'drone', harm: 'sustain', harmI: 'organSoft', pad: 'choir', lead: 'bell', melody: 'choirLead', rev: 0.65 },
  renaissance: { gain: 1.43, name: 'Renaissance', bpm: 88, swing: 0, prog: [0, 4, 5, 3], kit: 'frame', bass: 'root', bassI: 'pluckBass', harm: 'strum', harmI: 'lute', pad: 'choir', lead: 'harp', melody: 'flute', rev: 0.45 },
  barock: { gain: 1.43, name: 'Barock', bpm: 96, swing: 0, prog: [0, 4, 5, 2, 3, 0, 3, 4], kit: 'baroque', bass: 'baroque', bassI: 'harpsiBass', harm: 'arp', harmI: 'harpsichord', pad: 'organ', lead: 'harpsichord', melody: 'flute', rev: 0.45 },
  klassik: { gain: 1.26, name: 'Klassik', bpm: 104, swing: 0, prog: [0, 3, 4, 0], kit: 'timpani', bass: 'root8', bassI: 'cello', harm: 'alberti', harmI: 'piano', pad: 'strings', lead: 'piano', melody: 'strings', rev: 0.5 },
  romantik: { gain: 1.25, name: 'Romantik', bpm: 80, swing: 0, prog: [0, 5, 3, 4], kit: 'timpani', bass: 'root', bassI: 'cello', harm: 'arpWide', harmI: 'piano', pad: 'strings', lead: 'piano', melody: 'strings', rev: 0.6 },
  jazz: { gain: 1.06, name: 'Jazz', bpm: 128, swing: 0.62, prog: [1, 4, 0, 0], sevenths: true, kit: 'jazz', bass: 'walking', bassI: 'upright', harm: 'comp', harmI: 'epiano', pad: null, lead: 'vibes', melody: 'vibes', rev: 0.35 },
  rock: { gain: 0.72, name: 'Rock', bpm: 124, swing: 0, prog: [0, 4, 5, 3], kit: 'rock', bass: 'eighths', bassI: 'ebass', harm: 'power', harmI: 'guitar', pad: null, lead: 'guitarLead', melody: 'guitarLead', rev: 0.25 },
  elektronik: { gain: 1.17, name: 'Elektronik', bpm: 124, swing: 0, prog: [5, 3, 0, 4], kit: 'house', bass: 'offbeat', bassI: 'synthBass', harm: 'arp16', harmI: 'synthPluck', pad: 'synthPad', lead: 'squareLead', melody: 'squareLead', rev: 0.3 },
  digital: { gain: 0.8, name: 'Digital', bpm: 100, swing: 0.08, prog: [0, 5, 3, 4], kit: 'modern', bass: 'sub', bassI: 'sub', harm: 'stabs', harmI: 'epiano', pad: 'synthPad', lead: 'bell', melody: 'bell', rev: 0.35 },
  global: { gain: 1.15, name: 'Weltbühne', bpm: 126, swing: 0, prog: [5, 3, 0, 4], kit: 'house', bass: 'eighths', bassI: 'synthBass', harm: 'stabs', harmI: 'supersaw', pad: 'supersawPad', lead: 'squareLead', melody: 'squareLead', rev: 0.35 },
  zukunft: { gain: 0.91, name: 'Zukunft', bpm: 110, swing: 0, prog: [0, 2, 5, 3], kit: 'glitch', bass: 'sub', bassI: 'sub', harm: 'arp16', harmI: 'bell', pad: 'synthPad', lead: 'bell', melody: 'bell', rev: 0.45 },
  kosmos: { gain: 1.5, name: 'Kosmos', bpm: 66, swing: 0, prog: [0, 3, 5, 4], kit: 'cosmic', bass: 'drone', bassI: 'sub', harm: 'arpSlow', harmI: 'bell', pad: 'cosmic', lead: 'bell', melody: 'bell', rev: 0.8 },
  // Genre-Stile
  g_klassik: { gain: 1.27, name: 'Klassik', bpm: 96, swing: 0, prog: [0, 5, 1, 4], kit: 'timpani', bass: 'root8', bassI: 'cello', harm: 'alberti', harmI: 'piano', pad: 'strings', lead: 'piano', melody: 'strings', rev: 0.55 },
  g_jazz: { gain: 1.08, name: 'Jazz', bpm: 136, swing: 0.64, prog: [1, 4, 0, 5], sevenths: true, kit: 'jazz', bass: 'walking', bassI: 'upright', harm: 'comp', harmI: 'epiano', pad: null, lead: 'vibes', melody: 'vibes', rev: 0.35 },
  g_rock: { gain: 0.73, name: 'Rock', bpm: 132, swing: 0, prog: [0, 6, 3, 0], borrowed: true, kit: 'rock', bass: 'eighths', bassI: 'ebass', harm: 'power', harmI: 'guitar', pad: null, lead: 'guitarLead', melody: 'guitarLead', rev: 0.25 },
  g_pop: { gain: 1.11, name: 'Pop', bpm: 112, swing: 0, prog: [0, 4, 5, 3], kit: 'pop', bass: 'root8', bassI: 'synthBass', harm: 'block', harmI: 'piano', pad: 'synthPad', lead: 'bell', melody: 'squareLead', rev: 0.35 },
  g_elektro: { gain: 1.17, name: 'Elektro', bpm: 126, swing: 0, prog: [5, 3, 0, 4], kit: 'house', bass: 'offbeat', bassI: 'synthBass', harm: 'arp16', harmI: 'synthPluck', pad: 'synthPad', lead: 'squareLead', melody: 'squareLead', rev: 0.3 },
  g_hiphop: { gain: 0.88, name: 'Hip-Hop', bpm: 90, swing: 0.58, prog: [5, 3, 5, 4], sevenths: true, kit: 'boombap', bass: 'sub', bassI: 'sub', harm: 'comp', harmI: 'epiano', pad: null, lead: 'epianoLead', melody: 'bell', rev: 0.25 },
  g_metal: { gain: 0.66, name: 'Metal', bpm: 170, swing: 0, prog: [0, 5, 6, 4], kit: 'metal', bass: 'gallop', bassI: 'ebass', harm: 'power', harmI: 'guitarHeavy', pad: null, lead: 'guitarLead', melody: 'guitarLead', rev: 0.2 },
  g_reggae: { gain: 0.87, name: 'Reggae', bpm: 76, swing: 0.55, prog: [0, 3, 4, 3], kit: 'reggae', bass: 'reggae', bassI: 'ebass', harm: 'skank', harmI: 'organSkank', pad: null, lead: 'epianoLead', melody: 'bell', rev: 0.4 },
  g_ambient: { gain: 1.47, name: 'Ambient', bpm: 60, swing: 0, prog: [0, 3, 5, 4], kit: 'none', bass: 'drone', bassI: 'sub', harm: 'arpSlow', harmI: 'bell', pad: 'cosmic', lead: 'bell', melody: 'bell', rev: 0.85, noBeat: true },
  g_schlager: { gain: 1.1, name: 'Schlager', bpm: 118, swing: 0, prog: [0, 3, 4, 0], kit: 'schlager', bass: 'oompah', bassI: 'synthBass', harm: 'offchords', harmI: 'piano', pad: 'strings', lead: 'accordion', melody: 'accordion', rev: 0.35 },
  g_techno: { gain: 1.15, name: 'Techno', bpm: 132, swing: 0, prog: [5, 5, 3, 4], kit: 'techno', bass: 'rolling', bassI: 'synthBass', harm: 'stabs', harmI: 'synthStab', pad: 'synthPad', lead: 'squareLead', melody: 'squareLead', rev: 0.3 },
};

// Klick-Instrumente (Melodie beim Klicken)
export const CLICK_INSTR = [
  { id: 'auto', name: 'Passend zur Epoche' },
  { id: 'marimba', name: 'Marimba', need: 'clap' },
  { id: 'kalimba', name: 'Kalimba', need: 'drum' },
  { id: 'flute', name: 'Flöte', need: 'flute' },
  { id: 'harp', name: 'Harfe', need: 'lyre' },
  { id: 'bell', name: 'Glocke', need: 'choir' },
  { id: 'harpsichord', name: 'Cembalo', need: 'organ' },
  { id: 'piano', name: 'Klavier', need: 'piano' },
  { id: 'vibes', name: 'Vibraphon', need: 'jazz' },
  { id: 'guitarLead', name: 'E-Gitarre', need: 'rock' },
  { id: 'squareLead', name: 'Synth-Lead', need: 'synth' },
  { id: 'epianoLead', name: 'E-Piano', need: 'studio' },
  { id: 'accordion', name: 'Akkordeon', need: 'festival' },
  { id: 'glass', name: 'Glasharmonika', need: 'spheres' },
];

export function styleForEra(eraId) { return STYLES[eraId] || STYLES.urzeit; }
