import { describe, expect, it } from 'vitest';
import filmCss from '../../styles/film.css?raw';
import { CHAPTERS } from '../chapters';
import { steepestColourRate } from '../film/track';
import { totalScreens } from '../film/spans';
import { contrastRatio, deltaE, parseHex, simulate, type Deficiency } from './color';
import { FILM, FILM_DISTANCE, FILM_TOKENS, LAMP_FROM, LIGHT, LIGHT_POINTS, LIGHT_SURFACES, MAX_LIGHT_CHANGE_PER_SCREEN } from './film';
import { MIN_CONTRAST } from './palette';

const visions: Array<Deficiency | 'typical'> = ['typical', 'protanopia', 'deuteranopia'];
const seen = (hex: string, vision: Deficiency | 'typical') => (vision === 'typical' ? parseHex(hex) : simulate(hex, vision));

describe('the cast and the thread (ADR 0027)', () => {
  const cast = { you: FILM.you, other: FILM.other, new: FILM.new };

  it.each(visions)('keeps the three characters apart under %s vision', (vision) => {
    const pairs = [['you', 'other'], ['you', 'new'], ['other', 'new']] as const;
    for (const [a, b] of pairs) {
      expect(deltaE(seen(cast[a], vision), seen(cast[b], vision)), `${a} vs ${b}`).toBeGreaterThanOrEqual(FILM_DISTANCE.cast);
    }
  });

  it.each(visions)('keeps the golden thread apart from every character under %s vision', (vision) => {
    for (const [name, hex] of Object.entries(cast)) {
      expect(deltaE(seen(FILM.thread, vision), seen(hex, vision)), name).toBeGreaterThanOrEqual(FILM_DISTANCE.thread);
    }
  });

  it('reads text on the paper cards', () => {
    expect(contrastRatio(FILM.ink, FILM.card)).toBeGreaterThanOrEqual(MIN_CONTRAST.text);
    expect(contrastRatio(FILM['card-muted'], FILM.card)).toBeGreaterThanOrEqual(MIN_CONTRAST.text);
  });

  it('draws the faces and the thread’s edge in ink that stands out from their fills', () => {
    for (const fill of [FILM.you, FILM.other, FILM.new, FILM.thread, FILM['voice-expects'], FILM['voice-word']]) {
      expect(contrastRatio(FILM.ink, fill), fill).toBeGreaterThanOrEqual(MIN_CONTRAST.graphic);
    }
  });
});

describe('the day’s light (ADR 0027)', () => {
  it('runs from the top of the film, in scroll order', () => {
    expect(LIGHT_POINTS[0]?.at).toBe(0);
    LIGHT_POINTS.slice(1).forEach((point, i) => expect(point.at).toBeGreaterThan(LIGHT_POINTS[i]?.at ?? 1));
    expect(LIGHT_POINTS.at(-1)?.at).toBeLessThan(LAMP_FROM + 0.1);
  });

  it.each(LIGHT_POINTS.map((p) => [p.name, p] as const))(
    'separates every cut-out from the stage at %s: paper rim or ink outline, at least 3:1',
    (_name, point) => {
      for (const surface of LIGHT_SURFACES) {
        const bg = point.colours[surface];
        const best = Math.max(contrastRatio(FILM.ink, bg), contrastRatio(FILM.rim, bg));
        expect(best, surface).toBeGreaterThanOrEqual(MIN_CONTRAST.graphic);
      }
    },
  );

  it('sets the opening title in ink on the dawn sky', () => {
    const dawn = LIGHT_POINTS[0]?.colours;
    expect(contrastRatio(FILM.ink, dawn?.['sky-top'] ?? '#000000')).toBeGreaterThanOrEqual(MIN_CONTRAST.text);
    expect(contrastRatio(FILM.ink, dawn?.['sky-bottom'] ?? '#000000')).toBeGreaterThanOrEqual(MIN_CONTRAST.text);
  });

  it.each(LIGHT_SURFACES)('never cuts: %s changes at most a few ΔE per screen of scroll', (surface) => {
    const perScreen = steepestColourRate(LIGHT[surface]) / totalScreens(CHAPTERS);
    expect(perScreen).toBeLessThanOrEqual(MAX_LIGHT_CHANGE_PER_SCREEN);
  });
});

describe('film.css', () => {
  it('carries exactly the values of film.ts', () => {
    const declared = Object.fromEntries([...filmCss.matchAll(/--film-([a-z-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2]?.trim()]));
    expect(declared).toEqual(Object.fromEntries(FILM_TOKENS.map((token) => [token, FILM[token]])));
  });
});
