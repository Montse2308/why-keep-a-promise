import { describe, expect, it } from 'vitest';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';

/**
 * The page calls itself a story, never a film (ADR 0036, Montse): it is read and played, and moves at
 * the pace of whoever scrolls. Everything the visitor reads is checked, in both languages: the UI
 * strings, the film's captions, the notebook's prose and the READMEs. Code keeps "film" as the
 * internal name of the layer (src/lib/film/, the `film.*` keys), which no visitor reads.
 */
const FILM = /\bfilm(s|’s|'s)?\b|pel[ií]culas?/i;

const prose = import.meta.glob(['../src/content/**/*.md', '../README.md', '../README.es.md'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** A README's own picture is a file, not words: its path may keep its old name. */
const words = (text: string) => text.replace(/\]\([^)]*\)/g, ']');

describe('the page calls itself a story, not a film (ADR 0036)', () => {
  it('in every UI string, in English and in Spanish', () => {
    for (const dictionary of [en, es]) {
      const named = Object.entries(dictionary).filter(([, text]) => FILM.test(text));
      expect(named).toEqual([]);
    }
  });

  it('in the captions, the notebook’s prose and the READMEs', () => {
    expect(Object.keys(prose).length).toBeGreaterThan(20);
    const named = Object.entries(prose).filter(([, text]) => FILM.test(words(text))).map(([file]) => file);
    expect(named).toEqual([]);
  });
});
