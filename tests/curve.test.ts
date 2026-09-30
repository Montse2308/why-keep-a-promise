import { describe, expect, it } from 'vitest';
import raw from '../src/data/curve.json';
import chapterEn from '../src/content/chapters/en/07-my-research.md?raw';
import chapterEs from '../src/content/chapters/es/07-my-research.md?raw';
import { CURVE_FIGURES } from '../src/content/figures';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';
import { payoffLevels, pullWindow, readCurve } from '../src/lib/curve/curve';
import { beliefWithoutSwitch, CURVE_VALUES, windowStep } from '../src/lib/curve/values';
import { splitAtLock } from '../src/lib/film/captions';
import { filledCaptions } from './prose';

const curve = readCurve(raw);
/** Chapter 7's finding, the part of its captions after the lock mark, as the visitor reads it. */
const findings = { en: filledCaptions(`<!-- lock -->${splitAtLock(chapterEn).locked}`), es: filledCaptions(`<!-- lock -->${splitAtLock(chapterEs).locked}`) };
const numbers = (text: string) => new Set(text.replace(/\(\d{4}\)/g, ' ').match(/\d+/g) ?? []);

/** A figure is stated in prose as a whole word: "15" must not be found inside "150". */
const states = (text: string, value: number) => new RegExp(`(^|[^\\d])${value}([^\\d]|$)`).test(text);

describe('src/data/curve.json itself (ADR 0010)', () => {
  // The file is copied from the engine and never edited; regenerating it is a manual step with its
  // own commit, which updates this fingerprint. Parsed JSON, so line endings do not matter.
  it('is the file copied in F3, unchanged', async () => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(raw)));
    const hex = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    expect(hex).toBe('a3d83e513eff6ca22ec6cddeb8255270d7b27752487a4fb1b6bc93bc313c21d3');
  });
});

describe("the curve's figures, checked against src/data/curve.json", () => {
  it('has the axis from 0 to 76', () => {
    expect(curve.axis).toEqual(CURVE_FIGURES.axis);
  });

  it('has the personal guilt window from 15 to 65: the first and last rows where it rolls', () => {
    expect(pullWindow(curve)).toEqual(CURVE_FIGURES.window);
  });

  it('measures the window in steps of 5: the rows next to its edges are 5 away', () => {
    const trust = curve.rows.map((row) => row.trust);
    const { from, to } = CURVE_FIGURES.window;
    expect(trust).toContain(from - CURVE_FIGURES.step);
    expect(trust).toContain(to + CURVE_FIGURES.step);
    expect(trust.filter((t) => t > from - CURVE_FIGURES.step && t < from)).toEqual([]);
    expect(trust.filter((t) => t > to && t < to + CURVE_FIGURES.step)).toEqual([]);
  });

  it('is a trust game in which the other sees your type: rolling pays 10 and not rolling pays 5', () => {
    expect(raw.params.game).toBe('trust');
    expect(raw.params.p).toBe(1);
    for (const row of raw.grid) {
      for (const id of ['PGA', 'MC-b', 'GA'] as const) {
        expect(row.payoff[id], `${id} at ${row.beta0.num}`).toBe(row.rolls[id] ? CURVE_FIGURES.payoffs.high : CURVE_FIGURES.payoffs.low);
      }
    }
  });

  it('has the payoffs 5 and 10, and no other', () => {
    expect(payoffLevels(curve)).toEqual([CURVE_FIGURES.payoffs.low, CURVE_FIGURES.payoffs.high]);
  });

  it('has the peak at 38', () => {
    expect(curve.peak).toBe(CURVE_FIGURES.peak);
  });

  it('holds the belief after a promise at 76, the top of the axis', () => {
    expect(raw.params.beta1).toEqual({ num: CURVE_FIGURES.beliefAfterPromise, den: 100 });
    expect(CURVE_FIGURES.axis.max).toBe(CURVE_FIGURES.beliefAfterPromise);
  });

  it('pays partner-specific commitment and general guilt the same in every row', () => {
    for (const row of curve.rows) {
      expect(row.payoff.partner).toBe(CURVE_FIGURES.payoffs.high);
      expect(row.payoff.general).toBe(row.payoff.partner);
    }
  });
});

describe("chapter 7's finding takes its numbers from the code, and they are those figures", () => {
  it('fills its placeholders from the curve and from Vanberg’s cells, never by hand', () => {
    expect(CURVE_VALUES).toEqual({
      min: CURVE_FIGURES.axis.min,
      max: CURVE_FIGURES.axis.max,
      outof: 100,
      peak: CURVE_FIGURES.peak,
      from: CURVE_FIGURES.window.from,
      to: CURVE_FIGURES.window.to,
      step: CURVE_FIGURES.step,
      low: CURVE_FIGURES.payoffs.low,
      high: CURVE_FIGURES.payoffs.high,
      belief: CURVE_FIGURES.beliefAfterPromise,
    });
    expect(windowStep(curve)).toBe(CURVE_FIGURES.step);
    // What Vanberg's dictators believed their partner expected, without a switch (vanberg-second-order).
    expect(beliefWithoutSwitch()).toBe(CURVE_FIGURES.beliefAfterPromise);
  });
});

describe("chapter 7's finding states those figures and no others", () => {
  const allowed = new Set(['100', ...Object.values(CURVE_FIGURES).flatMap((v) => (typeof v === 'number' ? [v] : Object.values(v))).map(String)]);

  it.each(['en', 'es'] as const)('%s captions', (locale) => {
    const text = findings[locale];
    for (const value of [...Object.values(CURVE_FIGURES.axis), ...Object.values(CURVE_FIGURES.window), ...Object.values(CURVE_FIGURES.payoffs), CURVE_FIGURES.peak, CURVE_FIGURES.step]) {
      expect(states(text, value), `${value}`).toBe(true);
    }
    expect([...numbers(text.replace(/^---[\s\S]*?---/, ''))].filter((n) => !allowed.has(n))).toEqual([]);
  });

  it.each([
    ['en', en],
    ['es', es],
  ] as const)('%s chart strings write no curve figure by hand except the held belief', (_locale, dictionary) => {
    const strings = Object.entries(dictionary).filter(([key]) => key.startsWith('curve.'));
    for (const [key, value] of strings) {
      const written = [...numbers(value)].filter((n) => n !== '100');
      expect(written, key).toEqual(key === 'curve.caption' ? [String(CURVE_FIGURES.beliefAfterPromise)] : []);
    }
  });
});
