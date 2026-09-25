import { describe, expect, it } from 'vitest';
import { recipientAfterDraw } from './expectation';
import { fraction, outOf100 } from './fraction';
import { moment2, MOMENT2_START, type Moment2Event, type Moment2State } from './moment2';
import { cellFor, CELLS, HEADLINE, ROLL_COUNTS, rollShare } from './results';
import { sequence } from './testing';

describe('what real dictators did', () => {
  it('keeps the exact counts', () => {
    expect(ROLL_COUNTS).toEqual({
      'promised-same': { rolled: 227, n: 309 },
      'promised-switched': { rolled: 129, n: 238 },
      'not-promised-same': { rolled: 39, n: 75 },
      'not-promised-switched': { rolled: 30, n: 56 },
    });
  });

  it('rounds the four roll rates to 73, 54, 52 and 54 from their counts', () => {
    expect(CELLS.map((cell) => outOf100(rollShare(cell)))).toEqual([73, 54, 52, 54]);
    expect(rollShare('promised-same')).toEqual(fraction(227, 309));
  });

  it('heads with 73 against 54: promised, same partner against switched', () => {
    expect(HEADLINE).toEqual(['promised-same', 'promised-switched']);
    expect(HEADLINE.map((cell) => outOf100(rollShare(cell)))).toEqual([73, 54]);
  });
});

describe('the visitor’s cell in the reveal', () => {
  const SWITCHED = 0;
  const SAME = 0.5;
  const reveal = (promised: boolean, draw: number): Moment2State => {
    const events: Moment2Event[] = [
      { type: 'promise', promised },
      { type: 'draw' },
      { type: 'choose', choice: 'dont' },
      { type: 'settle' },
      { type: 'reveal' },
    ];
    const rng = sequence(draw);
    return events.reduce((state, event) => moment2(state, event, rng), MOMENT2_START);
  };

  it.each([
    [true, SAME, 'promised-same'],
    [true, SWITCHED, 'promised-switched'],
    [false, SAME, 'not-promised-same'],
    [false, SWITCHED, 'not-promised-switched'],
  ] as const)('promised=%s, draw=%s → %s', (promised, draw, expected) => {
    const state = reveal(promised, draw);
    if (state.phase !== 'reveal') throw new Error('expected reveal');
    expect(cellFor(state.promised, state.partner)).toBe(expected);
  });

  it('a switched partner is always one promised by another dictator, matching the switched rows', () => {
    for (const promised of [true, false]) {
      expect(recipientAfterDraw(promised, 'switched').promiser).toBe('another-dictator');
    }
  });
});
