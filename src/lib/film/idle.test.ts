import { describe, expect, it } from 'vitest';
import { BLINK_GAPS, BLINK_MS, BLINK_OFFSET, blinking, blinkTransform, GAZE_LOOK, gazeAt, GAZES, REST_MS, ROCK_DEG, ROCK_EVERY, rockAt, rockTransform, type Blinker, type Gaze } from './idle';

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

  it('has the waiting square glance at the circle, then at the tickets, then back, over and over', () => {
    for (let t = 0; t < REST_MS + (GAZES[1]?.from ?? 0); t += 10) expect(gazeAt(t)).toBeNull();
    const seen: (Gaze | null)[] = [];
    for (const t of minute) {
      const gaze = gazeAt(t);
      if (seen.at(-1) !== gaze) seen.push(gaze);
    }
    expect(seen.slice(0, 7)).toEqual([null, 'circle', 'ticket', null, 'circle', 'ticket', null]);
    expect(gazeAt(-1)).toBeNull();
  });

  it('keeps every glance inside the eye', () => {
    // An eye is 14 by 16 units around its centre and a pupil 7 across (Character.astro).
    for (const [x, y] of Object.values(GAZE_LOOK)) {
      expect(Math.abs(x)).toBeLessThanOrEqual(7);
      expect(Math.abs(y)).toBeLessThanOrEqual(9);
    }
  });

  it('rocks the waiting die now and then, a little, and leaves it level in between', () => {
    expect(rockAt(-1)).toBe(0);
    for (let t = 0; t < REST_MS; t += 10) expect(rockAt(t)).toBe(0);
    let rocks = 0;
    let level = true;
    for (const t of minute) {
      const degrees = rockAt(t);
      expect(Math.abs(degrees)).toBeLessThanOrEqual(ROCK_DEG);
      if (degrees !== 0 && level) rocks++;
      level = degrees === 0;
    }
    expect(rocks).toBeGreaterThanOrEqual(12);
    // It starts and ends each rock level, so it never jumps.
    for (let t = REST_MS; t < REST_MS + 2 * ROCK_EVERY; t += 1) expect(Math.abs(rockAt(t + 1) - rockAt(t))).toBeLessThan(0.2);
  });

  it('tips the die over the corner it leans to', () => {
    expect(rockTransform(0)).toBe('rotate(0)');
    expect(rockTransform(5)).toBe('rotate(5.00 34 34)');
    expect(rockTransform(-5)).toBe('rotate(-5.00 -34 34)');
  });

  it('shuts the eyes to a sliver, and opens them with no transform at all', () => {
    expect(blinkTransform(false)).toBe('');
    expect(blinkTransform(true)).toMatch(/scale\(1 0\.\d+\)/);
  });
});
