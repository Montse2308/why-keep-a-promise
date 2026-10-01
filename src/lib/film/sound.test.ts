import { describe, expect, it } from 'vitest';
import adr from '../../../docs/decisions/0025-technology.md?raw';
import film from '../../components/film/film.ts?raw';
import filmComponent from '../../components/film/Film.astro?raw';
import player from '../../components/film/sound.ts?raw';
import beatComponent from '../../components/film/Beat.astro?raw';
import baseLayout from '../../layouts/BaseLayout.astro?raw';
import {
  CUE_SIGHT,
  CUES,
  cueLength,
  envelopePoints,
  gainAt,
  MASTER_GAIN,
  midiToHz,
  SCORE,
  SILENT,
  THEME_NOTES,
  THEME_SCALE,
  THEME_TONIC,
  type Cue,
} from './sound';

const voices = CUES.flatMap((cue) => SCORE[cue].map((voice) => [cue, voice] as const));

describe('the score', () => {
  it('has the cues of ADR 0025: the die, the seal, the bubbles and a short theme at the end', () => {
    expect(adr).toContain('el dado, el sello, las burbujas, un tema corto al final');
    expect([...CUES]).toEqual(['roll', 'land', 'bubbles', 'stamp', 'theme']);
  });

  it('pairs every cue with something the stage shows (ADR 0025: everything that sounds is also seen)', () => {
    expect(Object.keys(CUE_SIGHT).sort()).toEqual([...CUES].sort());
    for (const cue of CUES) expect(CUE_SIGHT[cue].length).toBeGreaterThan(10);
  });

  it.each(voices)('%s: each voice starts at rest, rises, and falls back to silence', (_cue, voice) => {
    expect(voice.at).toBeGreaterThanOrEqual(0);
    expect(voice.attack).toBeGreaterThan(0);
    expect(voice.duration).toBeGreaterThan(voice.attack);
    expect(voice.gain).toBeGreaterThan(0);
    expect(voice.gain).toBeLessThanOrEqual(0.6);
    const [start, peak, end] = envelopePoints(voice);
    expect(start).toEqual([voice.at, 0]);
    expect(peak).toEqual([voice.at + voice.attack, voice.gain]);
    expect(end?.[1]).toBe(SILENT);
  });

  it.each(voices)('%s: each voice stays in a comfortable range of pitch', (_cue, voice) => {
    const pitches = voice.kind === 'tone' ? [voice.from, voice.to ?? voice.from] : [voice.frequency];
    for (const hz of pitches) {
      expect(hz).toBeGreaterThanOrEqual(40);
      expect(hz).toBeLessThanOrEqual(4000);
    }
  });

  it.each(CUES)('%s never clips: its voices together stay under full scale', (cue) => {
    const length = cueLength(cue);
    for (let t = 0; t <= length; t += 0.002) {
      const sum = SCORE[cue].reduce((total, voice) => total + gainAt(voice, t), 0);
      expect(sum * MASTER_GAIN).toBeLessThan(1);
      expect(sum).toBeLessThanOrEqual(1);
    }
  });

  it('keeps the effects short and the theme brief', () => {
    for (const cue of ['land', 'bubbles', 'stamp'] as const) expect(cueLength(cue)).toBeLessThanOrEqual(0.5);
    // The die spins for a second in the air (ROLL_MS in film.ts): its sound ends with the spin.
    expect(cueLength('roll')).toBeLessThanOrEqual(1);
    expect(film).toContain('const ROLL_MS = 1000;');
    expect(cueLength('theme')).toBeLessThanOrEqual(5);
  });

  it('ramps the envelope as Web Audio does: linear up, exponential down', () => {
    const voice = SCORE.stamp[0];
    if (!voice) throw new Error('no stamp');
    expect(gainAt(voice, voice.at)).toBe(0);
    expect(gainAt(voice, voice.at + voice.attack / 2)).toBeCloseTo(voice.gain / 2);
    expect(gainAt(voice, voice.at + voice.attack)).toBeCloseTo(voice.gain);
    const mid = voice.at + voice.attack + (voice.duration - voice.attack) / 2;
    expect(gainAt(voice, mid)).toBeCloseTo(Math.sqrt(voice.gain * SILENT));
    expect(gainAt(voice, voice.at + voice.duration)).toBe(0);
  });
});

describe('the theme', () => {
  it('tunes A4 to 440 Hz', () => {
    expect(midiToHz(69)).toBe(440);
    expect(midiToHz(81)).toBeCloseTo(880);
  });

  it('keeps to C major pentatonic, in order, and comes home to C', () => {
    for (const [note] of THEME_NOTES) expect(THEME_SCALE as readonly number[]).toContain(((note % 12) + 12) % 12);
    const beats = THEME_NOTES.map(([, beat]) => beat);
    expect(beats).toEqual([...beats].sort((a, b) => a - b));
    expect(THEME_NOTES.at(-1)?.[0]).toBe(THEME_TONIC);
  });
});

describe('playing it', () => {
  const played = (cue: Cue) => film.includes(`play('${cue}')`);

  it('plays each cue from the film’s script, where the stage shows it', () => {
    for (const cue of CUES) expect(played(cue) || film.includes(`'${cue}', 0.75)`), cue).toBe(true);
    // The seal and the credits' last line sound when they come into view, once.
    expect(film).toContain("onSight(envelope?.querySelector('.envelope__seal'), 'stamp', 0.75);");
    expect(film).toContain("onSight(film.querySelector('.credits__end'), 'theme', 0.75);");
    expect(film).toContain("play('roll');");
    expect(film).toContain("if (decision.phase === 'outcome' && decision.face !== null) play('land');");
    expect(film).toContain("play('bubbles');");
  });

  it('stays silent until the visitor presses the button, which shows only where Web Audio exists', () => {
    expect(filmComponent).toMatch(/<button type="button" class="film__sound" aria-pressed="false" hidden data-sound>/);
    expect(film).toContain("soundButton.setAttribute('aria-pressed', String(sound.toggle()))");
    expect(player).toContain('let on = false;');
    expect(player).toContain('if (!Context) return null;');
    expect(player).toContain('if (!on || !ctx || !master) return;');
    // Not stored: every visit starts silent (ADR 0023: nothing is stored).
    expect(player).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie/);
  });

  it('takes a real click or tap: every layer over the stage lets it through, but cards and the corner’s controls', () => {
    // The chapters lie over the whole stage, and the corner strip over its top: the button sits
    // under both. A script's .click() skips hit-testing, so only these rules keep a person's click.
    expect(filmComponent).toMatch(/:global\(html\.js\) \.film__chapters \{[^}]*pointer-events: none;/);
    expect(beatComponent).toMatch(/:global\(html\.js\) \.beat \{[^}]*pointer-events: none;/);
    expect(beatComponent).toMatch(/:global\(html\.js\) \.card \{[^}]*pointer-events: auto;/);
    expect(baseLayout).toMatch(/\.corner--film \{[^}]*pointer-events: none;/);
    expect(baseLayout).toMatch(/\.corner--film :global\(:is\(a, button, dialog\)\) \{\s*pointer-events: auto;/);
    // The button itself is not inside any of those layers: it is in the stage, beside the spool.
    expect(filmComponent.indexOf('data-sound')).toBeGreaterThan(filmComponent.indexOf('class="film__controls"'));
    expect(filmComponent.indexOf('data-sound')).toBeLessThan(filmComponent.indexOf('class="film__chapters"'));
  });

  it('makes its sounds in Web Audio, from no file', () => {
    expect(player).not.toMatch(/\.(mp3|ogg|wav|m4a|webm)\b|new Audio\(|fetch\(/);
  });
});
