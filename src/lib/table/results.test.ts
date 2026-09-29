import { describe, expect, it } from 'vitest';
import { SWITCHED_PARTNER_RECEIVED_PROMISE } from './expectation';
import { fraction, outOf100 } from './fraction';
import { CELLS, HEADLINE, ROLL_COUNTS, rollShare } from './results';

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

  it('counts, after a switch, only new partners promised by another dictator: the fixed case the film uses', () => {
    expect(SWITCHED_PARTNER_RECEIVED_PROMISE).toBe(true);
    for (const cell of CELLS.filter((c) => c.endsWith('-switched'))) expect(ROLL_COUNTS[cell].n).toBeGreaterThan(0);
  });
});
