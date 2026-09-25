import { describe, expect, it } from 'vitest';
import { add, fraction, multiply } from './fraction';
import {
  branches,
  CHOICES,
  DIE_FACES,
  drawWith,
  expectedPayoffs,
  PAYOFFS,
  realizedPayoffs,
  ROLL_SUCCESS,
  throwDie,
} from './game';
import { sequence } from './testing';

describe('payoffs', () => {
  it('gives the recipient an expected 12 · 5 / 6 = exactly 10 after Roll', () => {
    expect(multiply(fraction(12), fraction(5, 6))).toEqual(fraction(10));
    expect(expectedPayoffs('roll').other).toEqual({ num: 10, den: 1 });
  });

  it('spares the recipient with probability 5/6: only face 1 gives 0', () => {
    expect(ROLL_SUCCESS).toEqual(fraction(5, 6));
    expect(PAYOFFS.roll.failureFaces).toEqual([1]);
  });

  it('gives the dictator 10 after Roll and 14 after Don’t Roll, for certain', () => {
    expect(expectedPayoffs('roll').you).toEqual(fraction(10));
    expect(expectedPayoffs('dont')).toEqual({ you: fraction(14), other: fraction(0) });
  });

  it.each(CHOICES)('has probabilities that sum to exactly 1 after %s', (choice) => {
    const { you, other } = branches(choice);
    for (const options of [you, other]) {
      expect(options.reduce((sum, { probability }) => add(sum, probability), fraction(0))).toEqual(fraction(1));
    }
  });

  it('realises the payoffs from the die face', () => {
    expect(realizedPayoffs('roll', 1)).toEqual({ you: 10, other: 0 });
    for (const face of DIE_FACES.filter((f) => f !== 1)) {
      expect(realizedPayoffs('roll', face)).toEqual({ you: 10, other: 12 });
    }
    expect(realizedPayoffs('dont', null)).toEqual({ you: 14, other: 0 });
    expect(() => realizedPayoffs('roll', null)).toThrow();
  });
});

describe('random draws', () => {
  it('maps [0, 1) onto the six faces in equal slices', () => {
    for (const face of DIE_FACES) {
      expect(throwDie(sequence((face - 1) / 6))).toBe(face);
      expect(throwDie(sequence(face / 6 - 1e-9))).toBe(face);
    }
  });

  it('rejects an RNG value outside [0, 1)', () => {
    for (const bad of [1, -0.1, Number.NaN]) {
      expect(() => throwDie(sequence(bad))).toThrow(RangeError);
    }
  });

  it('draws true with exactly the given probability', () => {
    expect(drawWith(fraction(1, 2), sequence(0))).toBe(true);
    expect(drawWith(fraction(1, 2), sequence(0.4999))).toBe(true);
    expect(drawWith(fraction(1, 2), sequence(0.5))).toBe(false);
  });
});
