import { describe, expect, it } from 'vitest';
import en from '../i18n/en.json';
import es from '../i18n/es.json';
import { assertParity, findParityProblems, hasKey, isLocale, otherLocale, t } from './i18n';

describe('i18n parity', () => {
  it('holds for the real dictionaries', () => {
    expect(findParityProblems({ en, es })).toEqual([]);
    expect(() => assertParity({ en, es })).not.toThrow();
  });

  it('fails when a key exists in en but not in es', () => {
    const { ['notebook.label']: _removed, ...esMissing } = es;
    expect(() => assertParity({ en, es: esMissing })).toThrow('es: missing key "notebook.label"');
  });

  it('fails when a key exists in es but not in en', () => {
    const esExtra = { ...es, 'only.in.es': 'solo en español' };
    expect(() => assertParity({ en, es: esExtra })).toThrow('en: missing key "only.in.es"');
  });

  it('fails on empty or non-string values', () => {
    expect(findParityProblems({ en: { a: 'x', b: '' }, es: { a: 1, b: 'y' } })).toEqual([
      'en: key "b" must be a non-empty string',
      'es: key "a" must be a non-empty string',
    ]);
  });
});

describe('i18n helpers', () => {
  it('translates by locale', () => {
    expect(t('en', 'notebook.label')).toBe('Notebook');
    expect(t('es', 'notebook.label')).toBe('Cuaderno');
  });

  it('tells which keys exist', () => {
    expect(hasKey('notebook.label')).toBe(true);
    expect(hasKey('notebook.nothing')).toBe(false);
  });

  it('recognises locales and swaps them', () => {
    expect(isLocale('es')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(otherLocale('en')).toBe('es');
    expect(otherLocale('es')).toBe('en');
  });
});
