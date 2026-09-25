import { describe, expect, it } from 'vitest';
import raw from '../src/data/curve.json';
import actEn from '../src/content/acts/en/05-finding.md?raw';
import actEs from '../src/content/acts/es/05-finding.md?raw';
import { CURVE_FIGURES } from '../src/content/figures';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';
import { payoffLevels, pullWindow, readCurve } from '../src/lib/curve/curve';

const curve = readCurve(raw);
const acts = { en: actEn, es: actEs };
const numbers = (text: string) => new Set(text.replace(/\(\d{4}\)/g, ' ').match(/\d+/g) ?? []);

/** A figure is stated in prose as a whole word: "15" must not be found inside "150". */
const states = (text: string, value: number) => new RegExp(`(^|[^\\d])${value}([^\\d]|$)`).test(text);

describe("the curve's figures, checked against src/data/curve.json", () => {
  it('has the axis from 0 to 76', () => {
    expect(curve.axis).toEqual(CURVE_FIGURES.axis);
  });

  it('has the personal guilt window from 15 to 65: the first and last rows where it rolls', () => {
    expect(pullWindow(curve)).toEqual(CURVE_FIGURES.window);
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

describe('act 5 states those figures and no others', () => {
  const allowed = new Set(['100', ...Object.values(CURVE_FIGURES).flatMap((v) => (typeof v === 'number' ? [v] : Object.values(v))).map(String)]);

  it.each(['en', 'es'] as const)('%s prose', (locale) => {
    const text = acts[locale];
    for (const value of [...Object.values(CURVE_FIGURES.axis), ...Object.values(CURVE_FIGURES.window), ...Object.values(CURVE_FIGURES.payoffs), CURVE_FIGURES.peak]) {
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
