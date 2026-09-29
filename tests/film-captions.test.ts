import { describe, expect, it } from 'vitest';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';
import { CITATIONS, FIGURES } from '../src/content/figures';
import { BUILT, CHAPTERS } from '../src/lib/chapters';
import { FILM_VALUES } from '../src/lib/film/values';
import { LOCALES, type Locale } from '../src/lib/locales';
import { fill } from '../src/lib/template';
import { CITATION, citationsIn, numbersIn, readable } from './prose';

type Raw = Record<string, string>;
const sources = import.meta.glob('../src/content/chapters/*/*.md', { query: '?raw', import: 'default', eager: true }) as Raw;
const dictionaries: Record<Locale, Record<string, string>> = { en, es };

interface CaptionFile {
  locale: Locale;
  name: string;
  chapter: string;
  title: string;
  body: string;
}

const files: CaptionFile[] = Object.entries(sources).map(([path, raw]) => {
  const match = /\/chapters\/(\w+)\/([^/]+)\.md$/.exec(path);
  const parts = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw.replace(/\r\n/g, '\n'));
  if (!match || !parts) throw new Error(`Unreadable caption file ${path}`);
  const field = (name: string) => new RegExp(`^${name}:\\s*(.+?)\\s*$`, 'm').exec(parts[1] ?? '')?.[1] ?? '';
  return { locale: match[1] as Locale, name: match[2] ?? '', chapter: field('chapter'), title: field('title'), body: parts[2] ?? '' };
});

const captionsOf = (locale: Locale, id: string) => files.find((f) => f.locale === locale && f.chapter === id);
/** A caption as the visitor reads it: placeholders filled from the code. */
const filled = (file: CaptionFile | undefined) => fill(file?.body ?? '', FILM_VALUES);
const filmKeys = (locale: Locale) => Object.entries(dictionaries[locale]).filter(([key]) => key.startsWith('film.'));

describe('the film’s caption files (ADR 0021)', () => {
  it('exist for exactly the built chapters, in every locale, named by number and id', () => {
    for (const locale of LOCALES) {
      const names = files.filter((f) => f.locale === locale).map((f) => f.name).sort();
      expect(names).toEqual(BUILT.map((c) => `${String(c.number).padStart(2, '0')}-${c.id}`).sort());
    }
    for (const file of files) expect(file.name.endsWith(`-${file.chapter}`)).toBe(true);
  });

  it.each(LOCALES.flatMap((locale) => BUILT.map((c) => [locale, c.id] as const)))(
    '%s/%s marks its beats, in order, before any text',
    (locale, id) => {
      const body = captionsOf(locale, id)?.body ?? '';
      const marks = [...body.matchAll(/<!--\s*beat:([a-z-]+)\s*-->/g)].map((m) => m[1]);
      expect(marks).toEqual(CHAPTERS.find((c) => c.id === id)?.beats.map((b) => b.id));
      expect(body.slice(0, body.indexOf('<!--')).trim()).toBe('');
    },
  );

  it('titles every chapter, chapter 0 with the site’s question', () => {
    for (const file of files) expect(file.title.length).toBeGreaterThan(0);
    for (const locale of LOCALES) expect(captionsOf(locale, 'arrival')?.title).toBe(dictionaries[locale]['site.title']);
  });
});

describe('every number of the film comes from the code (rule (k))', () => {
  it.each(files.map((f) => [`${f.locale}/${f.name}`, f] as const))('%s writes no figure by hand, only placeholders the film fills', (_name, file) => {
    expect(numbersIn(readable(file.body))).toEqual([]);
    expect(() => filled(file)).not.toThrow();
  });

  it.each(LOCALES)('%s: the film’s UI strings write no figure by hand either', (locale) => {
    for (const [key, value] of filmKeys(locale)) expect(value, key).not.toMatch(/\d/);
  });

  it('fills the placeholders with numbers, not with words', () => {
    for (const value of Object.values(FILM_VALUES)) expect(typeof value).toBe('number');
  });

  it('would catch a figure written in a caption', () => {
    expect(numbersIn(readable('If both cooperate, 3 each.'))).toEqual(['3']);
    expect(numbersIn(readable('If both cooperate, {R} each, as Case (2017) says.'))).toEqual([]);
    expect(() => fill('{nope}', FILM_VALUES)).toThrow();
  });
});

describe('figures and citations in the captions (rule (a))', () => {
  const allowed = new Set(FIGURES.map((f) => f.value));
  const registered = new Set(CITATIONS.map((c) => `${c.authors.join('+')} ${c.year}`));

  it.each(files.map((f) => [`${f.locale}/${f.name}`, f] as const))('%s, filled, uses only registered figures and works', (_name, file) => {
    const text = readable(filled(file));
    expect(numbersIn(text).filter((n) => !allowed.has(n))).toEqual([]);
    expect(citationsIn(text).filter((c) => !registered.has(c))).toEqual([]);
  });

  it.each(BUILT.map((c) => c.id))('%s says the same figures and citations in both languages', (id) => {
    const [a, b] = LOCALES.map((locale) => readable(filled(captionsOf(locale, id))));
    expect(numbersIn(b ?? '').sort()).toEqual(numbersIn(a ?? '').sort());
    expect(citationsIn(b ?? '').sort()).toEqual(citationsIn(a ?? '').sort());
  });

  it('cites only in the "Author (year)" form', () => {
    for (const file of files) {
      const years = readable(file.body).match(/\b(19|20)\d\d\b/g) ?? [];
      expect(years.length).toBe([...readable(file.body).matchAll(CITATION)].length);
    }
  });
});

describe('chapter 1, two rooms (rule (f))', () => {
  it.each(LOCALES)('%s: links the repeated dilemma to The Evolution of Trust, by Case (2017)', (locale) => {
    const body = captionsOf(locale, 'two-rooms')?.body ?? '';
    expect(body).toContain('(https://ncase.me/trust/)');
    expect(citationsIn(readable(body))).toContain('Case 2017');
  });
});
