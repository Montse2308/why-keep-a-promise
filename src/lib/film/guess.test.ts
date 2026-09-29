import { describe, expect, it } from 'vitest';
import { ROLL_COUNTS } from '../table/results';
import { GUESS_START, guessOf, GUESSES, truth } from './guess';

describe('the guesses of chapter 6 (ADR 0023, interaction 8)', () => {
  it('asks, in order, about the headline pair: promised with the same partner, then after a switch', () => {
    expect(GUESSES.map((guess) => guess.cell)).toEqual(['promised-same', 'promised-switched']);
  });

  it('sets each guess beside the figure of Vanberg (2008), from the exact counts: 73 and 54', () => {
    expect(truth('same')).toBe(73);
    expect(truth('switched')).toBe(54);
    const { rolled, n } = ROLL_COUNTS['promised-same'];
    expect(Math.round((100 * rolled) / n)).toBe(truth('same'));
  });

  it('reads the bar as a whole number from 0 to 100, starting in the middle', () => {
    expect(GUESS_START).toBe(50);
    expect([guessOf(-3), guessOf(12.6), guessOf(140), guessOf(Number.NaN)]).toEqual([0, 13, 100, 50]);
  });
});
