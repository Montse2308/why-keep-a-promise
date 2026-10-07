import { describe, expect, it } from 'vitest';
import en from '../../i18n/en.json';
import es from '../../i18n/es.json';
import { SUBPAGES } from '../routes';
import { CAST, CAST_LINE, creditPages } from './credits';

describe('the credits (chapter 8, ADR 0021, ADR 0024, ADR 0034)', () => {
  it('lead to every page of the notebook, and to /finding only with the lock open', () => {
    expect(creditPages(true)).toEqual(SUBPAGES);
    expect(creditPages(false)).toEqual(SUBPAGES.filter((subpage) => subpage !== 'finding'));
  });

  it('credit the whole cast of the character sheet, and the golden thread, each with its own line', () => {
    expect(CAST).toEqual(['you', 'other', 'partner', 'expects', 'word', 'thread']);
    for (const dictionary of [en, es]) {
      const lines = CAST.map((role) => dictionary[CAST_LINE[role]]);
      expect(new Set(lines).size).toBe(CAST.length);
    }
  });

  it('name each voice as the character sheet does', () => {
    expect(en['film.closing.cast.expects']).toContain(en['film.voice.expects'].toLocaleLowerCase('en'));
    expect(en['film.closing.cast.word']).toContain(en['film.voice.word'].toLocaleLowerCase('en'));
    expect(es['film.closing.cast.expects']).toContain(es['film.voice.expects'].toLocaleLowerCase('es'));
    expect(es['film.closing.cast.word']).toContain(es['film.voice.word'].toLocaleLowerCase('es'));
  });
});
