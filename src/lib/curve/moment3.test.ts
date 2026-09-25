import { describe, expect, it } from 'vitest';
import en from '../../i18n/en.json';
import es from '../../i18n/es.json';
import { CURVE } from './data';
import { announcement, indexOf, pullsText, rowAt, valueText } from './moment3';
import { curveStrings } from './strings';

const strings = {
  en: curveStrings((key) => en[key]),
  es: curveStrings((key) => es[key]),
};
const { rows } = CURVE;

describe('rowAt', () => {
  it('selects one of the 18 rows by index, never a value between them', () => {
    expect(rows).toHaveLength(18);
    rows.forEach((row, index) => expect(rowAt(rows, index)).toBe(row));
    expect(rowAt(rows, 8.4)).toBe(rows[8]);
  });

  it('snaps out-of-range and invalid input to an existing row', () => {
    expect(rowAt(rows, -3)).toBe(rows[0]);
    expect(rowAt(rows, 99)).toBe(rows[17]);
    expect(rowAt(rows, Number.NaN)).toBe(rows[0]);
  });

  it('starts at the peak', () => {
    expect(rows[indexOf(rows, CURVE.peak)]?.trust).toBe(38);
    expect(() => indexOf(rows, 37)).toThrow();
  });
});

describe('text', () => {
  const peak = rowAt(rows, indexOf(rows, 38));
  const outside = rowAt(rows, 0);

  it('gives the slider a value text in each language', () => {
    expect(valueText(strings.en, peak)).toBe('background trust 38 of 100');
    expect(valueText(strings.es, peak)).toBe('confianza de fondo 38 de 100');
  });

  it('says whether, moved by personal guilt, you roll', () => {
    expect(pullsText(strings.en, peak)).toBe('With personal guilt, you roll the die.');
    expect(pullsText(strings.en, outside)).toBe("With personal guilt, you don't roll the die.");
    expect(pullsText(strings.es, peak)).toBe('Con culpa personal, tiras el dado.');
    expect(pullsText(strings.es, outside)).toBe('Con culpa personal, no tiras el dado.');
  });

  it('announces background trust, the payoff of each reason and whether personal guilt pulls', () => {
    expect(announcement(strings.en, outside)).toBe(
      "Background trust 0 of 100. Personal guilt: 5. Partner-specific commitment: 10. General guilt (control): 10. With personal guilt, you don't roll the die.",
    );
    expect(announcement(strings.es, peak)).toBe(
      'Confianza de fondo 38 de 100. Culpa personal: 10. Compromiso específico a la pareja: 10. Culpa general (control): 10. Con culpa personal, tiras el dado.',
    );
  });
});
