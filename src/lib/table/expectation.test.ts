import { describe, expect, it } from 'vitest';
import { add, fraction, outOf100, toNumber } from './fraction';
import { promisedExpectation, PROMISED_RECIPIENT_BELIEFS, RECIPIENT_BELIEFS, SCALE_POINTS, scaleValue } from './expectation';
import { ROLL_COUNTS } from './results';
import { cell } from '../vanberg/cells';

describe('what the promised recipients expected, by switch (docs/sources.md, `vanberg-beliefs`)', () => {
  it('reads 70 without a switch and 68 with one, from the means of the sources', () => {
    expect(outOf100(promisedExpectation('same'))).toBe(70);
    expect(outOf100(promisedExpectation('switched'))).toBe(68);
    expect(toNumber(promisedExpectation('same')).toFixed(3)).toBe('0.696');
    expect(toNumber(promisedExpectation('switched')).toFixed(3)).toBe('0.682');
  });

  it('adds up to all the recipients who received a promise', () => {
    const { same, switched } = PROMISED_RECIPIENT_BELIEFS;
    expect(add(same.sum, switched.sum)).toEqual(RECIPIENT_BELIEFS.promise.sum);
    expect(same.n + switched.n).toBe(RECIPIENT_BELIEFS.promise.n);
  });

  it('counts the recipients of the dictators in each cell: the same partner, or a new one promised by another', () => {
    expect(PROMISED_RECIPIENT_BELIEFS.same.n).toBe(ROLL_COUNTS['promised-same'].n);
    expect(PROMISED_RECIPIENT_BELIEFS.switched.n).toBe(cell(true, 'new-promised').n + cell(false, 'new-promised').n);
  });

  it('keeps each sum on the scale’s quarters, the only sum those means allow', () => {
    for (const { sum, n } of Object.values(PROMISED_RECIPIENT_BELIEFS)) {
      expect(4 % sum.den).toBe(0);
      const mean = (sum.num / sum.den / n).toFixed(3);
      const neighbours = [-0.25, 0.25].map((step) => ((sum.num / sum.den + step) / n).toFixed(3));
      expect(neighbours).not.toContain(mean);
    }
  });
});

describe('the five-point scale (Suppl. B, Screen 5B)', () => {
  it('runs in quarters from 0, certainly doesn’t roll, to 1, certainly rolls', () => {
    expect(SCALE_POINTS.map((point) => outOf100(scaleValue(point)))).toEqual([0, 25, 50, 75, 100]);
    expect(scaleValue(4)).toEqual(fraction(1));
  });
});
