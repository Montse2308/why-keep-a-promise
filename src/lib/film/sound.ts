/**
 * The film's sound (ADR 0025): off until the visitor turns it on, synthesised with Web Audio, so
 * there are no audio files and no licences. This module is the score, pure: each cue is a few tones
 * and bursts of noise with their envelopes, and src/components/film/sound.ts plays them. Every cue
 * goes with something the stage shows at the same moment (`CUE_SIGHT`): nothing is only heard. Only
 * the cues of ADR 0030's closed list sound.
 */

/**
 * The cues: the die in the air and on the table, the chat's bubbles, the seal and a short theme at
 * the end (P6); the chord when the sound is turned on and the coins (ADR 0030).
 */
export const CUES = ['roll', 'land', 'bubbles', 'stamp', 'theme', 'on', 'coins'] as const;
export type Cue = (typeof CUES)[number];

/** What the visitor sees while each cue sounds. */
export const CUE_SIGHT: Record<Cue, string> = {
  roll: 'chapter 3: the die jumps and spins in the air',
  land: 'chapter 3: the die lands on the face the decision drew',
  bubbles: "chapter 2: the visitor's message goes, and the other's answer appears",
  stamp: "chapter 7: the envelope's seal comes into view",
  theme: "chapter 8: the credits' last line comes into view",
  on: 'the sound button turns on: its icon changes, and it is pressed',
  coins: 'chapters 1 and 3: the coins appear over each character and are counted',
};

interface Envelope {
  /** Start, in seconds from the cue's start. */
  readonly at: number;
  /** Seconds from silence to the peak. */
  readonly attack: number;
  /** Seconds from the start to silence again. */
  readonly duration: number;
  /** Peak gain, before the master volume. */
  readonly gain: number;
}

export interface Tone extends Envelope {
  readonly kind: 'tone';
  readonly wave: 'sine' | 'triangle';
  /** Frequency in Hz, gliding to `to` if given. */
  readonly from: number;
  readonly to?: number;
}

export interface Noise extends Envelope {
  readonly kind: 'noise';
  readonly filter: 'bandpass' | 'lowpass' | 'highpass';
  /** The filter's frequency, in Hz, and its Q. */
  readonly frequency: number;
  readonly q: number;
}

export type Voice = Tone | Noise;

/** The master volume: with every cue summing to at most 1 (a test), the loudest peak stays under 0.6. */
export const MASTER_GAIN = 0.6;

/** Equal temperament: MIDI note 69 is A4, 440 Hz. */
export function midiToHz(note: number): number {
  return 440 * 2 ** ((note - 69) / 12);
}

/** C major pentatonic: C, D, E, G, A. The theme keeps to it and comes home to C. */
export const THEME_SCALE = [0, 2, 4, 7, 9] as const;
export const THEME_TONIC = 72;

/** The theme: a music-box phrase, MIDI note and start in beats, at `THEME_BEAT` seconds a beat. */
export const THEME_NOTES: readonly (readonly [note: number, beat: number, beats: number])[] = [
  [67, 0, 1],
  [72, 1, 1],
  [76, 2, 1],
  [74, 3, 0.5],
  [72, 3.5, 0.5],
  [74, 4, 1],
  [79, 5, 1.5],
  [76, 6.5, 0.5],
  [72, 7, 2],
];
export const THEME_BEAT = 0.34;

/** The chord of `on`: the theme's first two notes, G and C, and how long it rings in its beats, under a second. */
export const ON_NOTES = [67, 72] as const;
const ON_BEATS = 1.5;

/** A music-box note: a triangle with a soft sine an octave up, ringing out. */
function bell(note: number, at: number, beats: number): Voice[] {
  const duration = Math.max(0.5, beats * THEME_BEAT * 1.6);
  return [
    { kind: 'tone', wave: 'triangle', from: midiToHz(note), at, attack: 0.008, duration, gain: 0.22 },
    { kind: 'tone', wave: 'sine', from: midiToHz(note + 12), at, attack: 0.004, duration: duration * 0.6, gain: 0.06 },
  ];
}

/** A tick of the die's corner on the air: a short, bright burst. */
const tick = (at: number, gain: number): Noise => ({ kind: 'noise', filter: 'bandpass', frequency: 3200, q: 2.5, at, attack: 0.002, duration: 0.035, gain });

/** A coin set on its pile: two bright partials that do not make a chord, ringing briefly, and the touch. */
const clink = (at: number, gain: number): Voice[] => [
  { kind: 'tone', wave: 'sine', from: 2637, at, attack: 0.002, duration: 0.14, gain },
  { kind: 'tone', wave: 'sine', from: 3729, at, attack: 0.002, duration: 0.09, gain: gain * 0.5 },
  { kind: 'noise', filter: 'highpass', frequency: 3000, q: 0.7, at, attack: 0.001, duration: 0.02, gain: gain * 0.6 },
];

export const SCORE: Record<Cue, readonly Voice[]> = {
  // The die is tossed: a lift in pitch as it leaves the hand, the air past it, and its corners
  // turning, for the second it spins (ROLL_MS in film.ts).
  roll: [
    { kind: 'tone', wave: 'triangle', from: 260, to: 520, at: 0, attack: 0.01, duration: 0.2, gain: 0.16 },
    { kind: 'noise', filter: 'bandpass', frequency: 900, q: 0.8, at: 0.04, attack: 0.35, duration: 0.86, gain: 0.12 },
    tick(0.18, 0.12),
    tick(0.34, 0.1),
    tick(0.52, 0.09),
    tick(0.7, 0.07),
  ],
  // It lands: a wooden knock, and a smaller bounce.
  land: [
    { kind: 'noise', filter: 'bandpass', frequency: 1800, q: 1.2, at: 0, attack: 0.002, duration: 0.08, gain: 0.42 },
    { kind: 'tone', wave: 'sine', from: 190, to: 110, at: 0, attack: 0.003, duration: 0.14, gain: 0.34 },
    { kind: 'noise', filter: 'bandpass', frequency: 2100, q: 1.2, at: 0.13, attack: 0.002, duration: 0.05, gain: 0.16 },
    { kind: 'tone', wave: 'sine', from: 210, to: 140, at: 0.13, attack: 0.003, duration: 0.08, gain: 0.12 },
  ],
  // Two bubbles: the visitor's message, up; the other's answer, a little lower.
  bubbles: [
    { kind: 'tone', wave: 'sine', from: 420, to: 860, at: 0, attack: 0.006, duration: 0.13, gain: 0.3 },
    { kind: 'tone', wave: 'sine', from: 330, to: 660, at: 0.17, attack: 0.006, duration: 0.13, gain: 0.26 },
  ],
  // The seal pressed into the wax: a low thump and the paper under it.
  stamp: [
    { kind: 'tone', wave: 'sine', from: 150, to: 58, at: 0, attack: 0.004, duration: 0.28, gain: 0.5 },
    { kind: 'noise', filter: 'lowpass', frequency: 700, q: 0.7, at: 0, attack: 0.002, duration: 0.09, gain: 0.32 },
  ],
  // The sound is turned on: the theme's first two notes, G and C, together, so the visitor hears at
  // once that it is on.
  on: ON_NOTES.flatMap((note) => bell(note, 0, ON_BEATS)),
  // The coins are counted onto their piles: four clinks over the count (COUNT_MS in film.ts), the
  // same for 0 coins as for 14, so the sound never judges a choice (ADR 0030, rule 3).
  coins: [...clink(0, 0.2), ...clink(0.1, 0.17), ...clink(0.2, 0.15), ...clink(0.32, 0.13)],
  // The credits end on a short phrase, and a low C under its last note.
  theme: [
    ...THEME_NOTES.flatMap(([note, beat, beats]) => bell(note, beat * THEME_BEAT, beats)),
    { kind: 'tone', wave: 'sine', from: midiToHz(THEME_TONIC - 24), at: 7 * THEME_BEAT, attack: 0.05, duration: 1.4, gain: 0.12 },
  ],
};

/** Below this an exponential ramp is silence; Web Audio cannot ramp to zero itself. */
export const SILENT = 0.0001;

/** A voice's envelope as points [seconds from the cue's start, gain]: up to the peak, then a fall to silence. */
export function envelopePoints(voice: Voice): readonly (readonly [number, number])[] {
  return [
    [voice.at, 0],
    [voice.at + voice.attack, voice.gain],
    [voice.at + voice.duration, SILENT],
  ];
}

/** The gain of a voice at a moment: linear up, exponential down, as Web Audio ramps it. */
export function gainAt(voice: Voice, t: number): number {
  const start = voice.at;
  const peak = voice.at + voice.attack;
  const end = voice.at + voice.duration;
  if (t <= start || t >= end) return 0;
  if (t <= peak) return (voice.gain * (t - start)) / voice.attack;
  return voice.gain * (SILENT / voice.gain) ** ((t - peak) / (end - peak));
}

/** How long a cue lasts, in seconds. */
export function cueLength(cue: Cue): number {
  return Math.max(...SCORE[cue].map((voice) => voice.at + voice.duration));
}

/**
 * Chapter 3's cues once the decision lands, each with its delay in seconds: if the die was thrown,
 * its knock, and the coins once the knock is over, so they never sound on top of each other
 * (ADR 0030, rule 4).
 */
export function foldCues(thrown: boolean): readonly (readonly [cue: Cue, after: number])[] {
  const cues: [Cue, number][] = [];
  let at = 0;
  if (thrown) {
    cues.push(['land', at]);
    at += cueLength('land');
  }
  cues.push(['coins', at]);
  return cues;
}
