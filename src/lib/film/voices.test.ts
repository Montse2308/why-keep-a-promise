import { describe, expect, it } from 'vitest';
import { lookAt, LOOK_REACH, voicePlaces } from './voices';

describe('the two voices (ADR 0027)', () => {
  it('float over the circle, the scroll on the outside and the cloud towards the other', () => {
    for (const portrait of [false, true]) {
      const { word, expects } = voicePlaces([500, 500], portrait);
      expect(word[0]).toBeLessThan(500);
      expect(expects[0]).toBeGreaterThan(500);
      expect(Math.max(word[1], expects[1])).toBeLessThan(400);
    }
  });

  it('turn their pupils towards what they look at, never past the edge of the eye', () => {
    expect(lookAt([0, 0], [100, 0])).toEqual([LOOK_REACH, 0]);
    const [x, y] = lookAt([0, 0], [-30, 40]);
    expect(x).toBeLessThan(0);
    expect(y).toBeGreaterThan(0);
    expect(Math.hypot(x, y)).toBeLessThanOrEqual(LOOK_REACH);
    expect(lookAt([10, 10], [10, 10])).toEqual([0, 0]);
  });
});
