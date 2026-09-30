import { describe, expect, it } from 'vitest';
import { contrastRatio, deltaE, parseHex, simulate, type Deficiency } from '../design/color';
import { FILM } from '../design/film';
import { MIN_CONTRAST, MIN_DISTANCE } from '../design/palette';
import { REASONS } from './curve';
import { CASED, FILM_CASING, FILM_PAPER, FILM_SERIES } from './film';

const visions: Array<Deficiency | 'typical'> = ['typical', 'protanopia', 'deuteranopia'];
const seen = (hex: string, vision: Deficiency | 'typical') => (vision === 'typical' ? parseHex(hex) : simulate(hex, vision));
const colour = (reason: (typeof REASONS)[number]) => FILM[FILM_SERIES[reason]];

describe('chapter 7’s curve on the film’s paper (ADR 0027)', () => {
  it('draws every line at 3:1 on the card: in its own colour, or in its ink casing', () => {
    for (const reason of REASONS) {
      const edge = CASED.includes(reason) ? FILM[FILM_CASING] : colour(reason);
      expect(contrastRatio(edge, FILM[FILM_PAPER]), reason).toBeGreaterThanOrEqual(MIN_CONTRAST.graphic);
    }
  });

  it('cases exactly the lines that would not hold on the card alone, and each shows inside its casing', () => {
    for (const reason of REASONS) {
      const holds = contrastRatio(colour(reason), FILM[FILM_PAPER]) >= MIN_CONTRAST.graphic;
      expect(CASED.includes(reason), reason).toBe(!holds);
      if (CASED.includes(reason)) expect(contrastRatio(colour(reason), FILM[FILM_CASING]), reason).toBeGreaterThanOrEqual(MIN_CONTRAST.graphic);
    }
  });

  it.each(visions)('keeps personal guilt and partner-specific commitment apart under %s vision, and the control apart from both', (vision) => {
    expect(deltaE(seen(colour('personal'), vision), seen(colour('partner'), vision))).toBeGreaterThanOrEqual(MIN_DISTANCE.series);
    for (const other of ['personal', 'partner'] as const) {
      expect(deltaE(seen(colour('general'), vision), seen(colour(other), vision)), other).toBeGreaterThanOrEqual(MIN_DISTANCE.seriesFromRoles);
    }
  });

  it('keeps every line apart from the cast it shares the film with', () => {
    for (const reason of REASONS) {
      for (const cast of [FILM.you, FILM.other, FILM.new]) {
        expect(deltaE(parseHex(colour(reason)), parseHex(cast)), `${reason} vs ${cast}`).toBeGreaterThanOrEqual(MIN_DISTANCE.seriesFromRoles);
      }
    }
  });
});
