import { describe, expect, it } from 'vitest';
import { BLINK_GAPS, BLINK_MS, BLINK_OFFSET, blinking, blinkTransform, REST_MS, type Blinker } from './idle';

const WHO: readonly Blinker[] = ['you', 'other', 'partner'];
/** A minute at rest, in steps of 10 ms. */
const minute = Array.from({ length: 6000 }, (_, i) => i * 10);

/** The blinks one of the cast makes over a minute at rest: when each starts and how long it lasts. */
function blinks(who: Blinker): { start: number; length: number }[] {
  const found: { start: number; length: number }[] = [];
  for (const t of minute) {
    if (!blinking(t, who)) continue;
    const last = found.at(-1);
    if (last && t - (last.start + last.length) <= 10) last.length += 10;
    else found.push({ start: t, length: 10 });
  }
  return found;
}

describe('life at rest', () => {
  it('waits for the scroll to rest: nobody blinks while it moves or just after', () => {
    for (const who of WHO) {
      expect(blinking(-1, who)).toBe(false);
      expect(blinking(Number.NaN, who)).toBe(false);
      for (let t = 0; t < REST_MS; t += 10) expect(blinking(t, who)).toBe(false);
    }
  });

  it('blinks every few seconds, briefly, for as long as the scroll rests', () => {
    for (const who of WHO) {
      const found = blinks(who);
      expect(found.length).toBeGreaterThanOrEqual(12);
      for (const blink of found) expect(blink.length).toBeLessThanOrEqual(BLINK_MS + 10);
      found.slice(1).forEach((blink, i) => {
        const gap = blink.start - (found[i]?.start ?? 0);
        expect(gap).toBeGreaterThanOrEqual(Math.min(...BLINK_GAPS) - 10);
        expect(gap).toBeLessThanOrEqual(Math.max(...BLINK_GAPS) + 10);
      });
    }
  });

  it('starts within a few seconds of resting, so a first screen comes to life soon', () => {
    for (const who of WHO) expect(blinks(who)[0]?.start).toBeLessThanOrEqual(REST_MS + Math.max(...Object.values(BLINK_OFFSET)) + 10);
  });

  it('never has two of the cast blink as one', () => {
    for (const t of minute) expect(WHO.filter((who) => blinking(t, who)).length).toBeLessThanOrEqual(1);
  });

  it('shuts the eyes to a sliver, and opens them with no transform at all', () => {
    expect(blinkTransform(false)).toBe('');
    expect(blinkTransform(true)).toMatch(/scale\(1 0\.\d+\)/);
  });
});
