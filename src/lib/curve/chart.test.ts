import { describe, expect, it } from 'vitest';
import { stepLine, xPercent, yPixel } from './chart';
import type { CurveRow } from './curve';
import { CURVE } from './data';

const row = (trust: number, personal: number, rest = 10): CurveRow => ({
  trust,
  payoff: { personal, partner: rest, general: rest },
  pulls: personal === 10,
});

describe('stepLine', () => {
  it('draws a flat reason as one horizontal segment across the axis', () => {
    expect(stepLine(CURVE.rows, 'partner')).toEqual([{ x1: 0, x2: 76, y1: 10, y2: 10 }]);
    expect(stepLine(CURVE.rows, 'general')).toEqual(stepLine(CURVE.rows, 'partner'));
  });

  it('draws the personal guilt window exactly from its first to its last row, 15 to 65', () => {
    expect(stepLine(CURVE.rows, 'personal')).toEqual([
      { x1: 0, x2: 15, y1: 5, y2: 5 },
      { x1: 15, x2: 65, y1: 10, y2: 10 },
      { x1: 65, x2: 76, y1: 5, y2: 5 },
      { x1: 15, x2: 15, y1: 5, y2: 10 },
      { x1: 65, x2: 65, y1: 10, y2: 5 },
    ]);
  });

  it('covers a gap between rows with the lower payoff, whichever side it is on', () => {
    expect(stepLine([row(0, 10), row(10, 5)], 'personal')).toEqual([
      { x1: 0, x2: 0, y1: 10, y2: 10 },
      { x1: 0, x2: 10, y1: 5, y2: 5 },
      { x1: 0, x2: 0, y1: 10, y2: 5 },
    ]);
  });

  it('only uses background trust values from the grid', () => {
    const grid = new Set(CURVE.rows.map((r) => r.trust));
    for (const segment of stepLine(CURVE.rows, 'personal')) {
      expect(grid.has(segment.x1) && grid.has(segment.x2)).toBe(true);
    }
  });
});

describe('scales', () => {
  it('maps the axis ends and the peak to 0 %, 100 % and the middle', () => {
    expect(xPercent(0, CURVE.axis)).toBe(0);
    expect(xPercent(76, CURVE.axis)).toBe(100);
    expect(xPercent(38, CURVE.axis)).toBe(50);
  });

  it('maps payoff 0 to the baseline and the highest payoff to the top', () => {
    const frame = { zero: 200, top: 72, high: 10 };
    expect(yPixel(0, frame)).toBe(200);
    expect(yPixel(10, frame)).toBe(72);
    expect(yPixel(5, frame)).toBe(136);
  });
});
