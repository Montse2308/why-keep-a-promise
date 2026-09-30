import { describe, expect, it } from 'vitest';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';
import { CITATIONS, FIGURES } from '../src/content/figures';
import { BUILT, CHAPTERS, LOCKED_BEATS, OPEN_CHAPTERS } from '../src/lib/chapters';
import { CURVE_VALUES } from '../src/lib/curve/values';
import { splitAtLock } from '../src/lib/film/captions';
import { FILM_VALUES } from '../src/lib/film/values';
import { LOCALES, type Locale } from '../src/lib/locales';
import { fill } from '../src/lib/template';
import { findMarks } from '../scripts/verify-dist.mjs';
import { CITATION, citationsIn, filledCaptions, numbersIn, readable } from './prose';

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
const filled = (file: CaptionFile | undefined) => filledCaptions(file?.body ?? '');
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
    for (const value of [...Object.values(FILM_VALUES), ...Object.values(CURVE_VALUES)]) expect(typeof value).toBe('number');
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

describe('chapter 2, what if they could talk? (ADR 0021)', () => {
  it.each(LOCALES)('%s: names cheap talk, the economists’ term, in its own words', (locale) => {
    expect(readable(captionsOf(locale, 'talk')?.body ?? '')).toContain('*cheap talk*');
  });
});

describe('chapter 3, the matrix folds (rule (g))', () => {
  const says = {
    en: ['another game, the same tension', "it is not the prisoner's dilemma"],
    es: ['otro juego, la misma tensión', 'no es el dilema del prisionero'],
  } as const;

  it.each(LOCALES)('%s: says on screen that Vanberg’s game is another game with the same tension', (locale) => {
    const text = readable(captionsOf(locale, 'fold')?.body ?? '').replace(/\s+/g, ' ').toLocaleLowerCase('und');
    for (const phrase of says[locale]) expect(text).toContain(phrase);
    expect(citationsIn(readable(captionsOf(locale, 'fold')?.body ?? ''))).toContain('Vanberg 2008');
  });

  it.each(LOCALES)('%s: never calls the table the prisoner’s dilemma in the decision', (locale) => {
    const decide = (captionsOf(locale, 'fold')?.body ?? '').split('<!-- beat:decide -->')[1] ?? '';
    expect(decide.toLocaleLowerCase('und')).not.toMatch(/prisoner|prisionero/);
  });
});

describe('chapter 4, two voices (rule (k))', () => {
  const names = {
    en: ['what the other expects', 'guilt aversion', 'your word'],
    es: ['lo que el otro espera', 'aversión a la culpa', 'tu palabra'],
  } as const;

  it.each(LOCALES)('%s: presents the two reasons with the guilt-aversion citations and Vanberg’s reading', (locale) => {
    const text = readable(captionsOf(locale, 'two-voices')?.body ?? '');
    for (const name of names[locale]) expect(text.replace(/\s+/g, ' ').toLocaleLowerCase('und')).toContain(name);
    expect(citationsIn(text).sort()).toEqual(['Battigalli+Dufwenberg 2007', 'Charness+Dufwenberg 2006', 'Vanberg 2008']);
  });

  it.each(LOCALES)('%s: names the voices as the character sheet does, and gives each its prediction', (locale) => {
    const d = dictionaries[locale];
    expect([d['film.voice.expects'], d['film.voice.word']]).toEqual(locale === 'en' ? ['What the other expects', 'My word'] : ['Lo que el otro espera', 'Mi palabra']);
    expect(d['film.two-voices.says.expects']).not.toBe(d['film.two-voices.says.word']);
  });
});

describe('chapter 5, the blackout (rule (k))', () => {
  const fixed = { en: /fixed (case|example)/, es: /(caso|ejemplo) fijo/ } as const;

  it.each(LOCALES)('%s: says on screen that the switch is always the same fixed case', (locale) => {
    const text = readable(captionsOf(locale, 'blackout')?.body ?? '').replace(/\s+/g, ' ').toLocaleLowerCase('und');
    expect(text).toMatch(fixed[locale]);
    // Once when the visitor decides, and again when the visitor receives.
    expect(text.match(new RegExp(fixed[locale].source, 'g'))?.length).toBe(2);
  });

  it.each(LOCALES)('%s: cites Vanberg (2008) where it shows what the real recipients bet', (locale) => {
    const reveal = (captionsOf(locale, 'blackout')?.body ?? '').split('<!-- beat:reveal -->')[1] ?? '';
    expect(citationsIn(readable(reveal))).toContain('Vanberg 2008');
    const d = dictionaries[locale];
    expect(numbersIn(fill(`${d['film.reveal.same']} ${d['film.reveal.switched']}`, FILM_VALUES))).toEqual([
      String(FILM_VALUES.expectsame),
      String(FILM_VALUES.expectswitched),
    ]);
  });
});

describe('the experiment’s results only in chapters 5 and 6 (rule (k))', () => {
  const RESULTS = ['73', '54', '70', '68'];
  const THEIRS = new Set(['blackout', 'real-people']);

  it.each(files.map((f) => [`${f.locale}/${f.name}`, f] as const))('%s shows them only if it is chapter 5 or 6', (_name, file) => {
    const shown = numbersIn(readable(filled(file))).filter((n) => RESULTS.includes(n));
    if (!THEIRS.has(file.chapter)) expect(shown).toEqual([]);
  });

  it.each(LOCALES)('%s: the film’s UI strings show them only in chapters 5 and 6', (locale) => {
    for (const [key, value] of filmKeys(locale)) {
      let text = value;
      try {
        text = fill(value, FILM_VALUES);
      } catch {
        // A string with placeholders of its own is filled by its chapter, never with the results.
      }
      const shown = numbersIn(text).filter((n) => RESULTS.includes(n));
      if (shown.length > 0) expect(key, key).toMatch(/^film\.(reveal|real-people)\./);
    }
  });
});

describe('chapter 6, the real people (rule (k))', () => {
  it.each(LOCALES)('%s: tells what the people of the experiment did, with the figures of act 4 it replaces, and their citation', (locale) => {
    const text = readable(filled(captionsOf(locale, 'real-people')));
    for (const figure of ['192', '8', '73', '54', '70', '68']) expect(numbersIn(text)).toContain(figure);
    expect(citationsIn(text)).toContain('Vanberg 2008');
  });

  it.each(LOCALES)('%s: counts rounds, not people, in the share that rolled', (locale) => {
    const text = readable(captionsOf(locale, 'real-people')?.body ?? '').replace(/\s+/g, ' ').toLocaleLowerCase('und');
    expect(text).toMatch(locale === 'en' ? /in the rounds where/ : /en las rondas en que/);
  });

  it.each(LOCALES)('%s: sets the guess beside the figure and says nothing about it', (locale) => {
    const out = dictionaries[locale]['film.real-people.guess.out'];
    expect(out).toContain('{real}');
    expect(out).toContain('{guess}');
    expect(out).not.toMatch(locale === 'en' ? /close|far|right|wrong|good|better/i : /cerca|lejos|acert|fall|bien|mejor/i);
  });
});

describe('chapter 7, this is where I come in (rule (j), ADR 0026)', () => {
  const parts = (locale: Locale) => splitAtLock(captionsOf(locale, 'my-research')?.body ?? '');
  const marks = (html: string) => [...html.matchAll(/<!--\s*beat:([a-z-]+)\s*-->/g)].map((m) => m[1]);
  /** What the open part may not say (rule (j)): nothing of the engine's workings, nor of the finding. */
  const outsideTheLock = /\b(tests?|seeds?|semillas?|generations?|generaci[oó]n(es)?|imitat\w*|imitaci[oó]n|provenance|procedencia|commits?|curves?|curvas?|parameters?|par[aá]metros?|finding|hallazgo)\b|θ/iu;
  const openKeys = (locale: Locale) => filmKeys(locale).filter(([key]) => key.startsWith('film.my-research.'));

  it.each(LOCALES)('%s: its open part says the question is Montse’s research question, and that she built a simulation engine in TypeScript', (locale) => {
    const open = readable(parts(locale).open).replace(/\s+/g, ' ');
    expect(open).toMatch(locale === 'en' ? /\bthe question of my research\b/ : /\bla pregunta de mi investigación\b/);
    expect(open).toMatch(locale === 'en' ? /\bI built a simulation engine\b/ : /\bconstruí un motor de simulación\b/);
    expect(open).toContain('TypeScript');
  });

  it.each(LOCALES)('%s: its open part says nothing else: not the engine’s workings, not the finding, no figure and no mark of the lock', (locale) => {
    const open = readable(parts(locale).open);
    expect(open).not.toMatch(outsideTheLock);
    expect(numbersIn(open)).toEqual([]);
    expect(findMarks(parts(locale).open)).toEqual([]);
    expect(parts(locale).open).not.toMatch(/TODO\(/);
    for (const [key, value] of openKeys(locale)) {
      expect(value, key).not.toMatch(outsideTheLock);
      expect(findMarks(value), key).toEqual([]);
    }
  });

  it.each(LOCALES)('%s: names the author in the first person, with her full name from its key', (locale) => {
    const me = dictionaries[locale]['film.my-research.me'];
    expect(me).toContain('{name}');
    expect(me).toMatch(locale === 'en' ? /^I’m / : /^Soy /);
    expect(dictionaries[locale]['author.name']).toBe(en['author.name']);
  });

  it.each(LOCALES)('%s: seals the envelope with nothing but the status sentence: its beat has no caption', (locale) => {
    const sealed = parts(locale).open.split('<!-- beat:sealed -->')[1] ?? 'missing';
    expect(sealed.trim()).toBe('');
  });

  it.each(LOCALES)('%s: puts the question, the engine and the envelope before the lock, and the finding after it', (locale) => {
    const { open, locked } = parts(locale);
    expect(marks(open)).toEqual(OPEN_CHAPTERS.find((c) => c.id === 'my-research')?.beats.map((b) => b.id));
    expect(marks(open)).toEqual(['question', 'engine', 'sealed']);
    expect(marks(locked)).toEqual(LOCKED_BEATS.map((b) => b.id));
    expect(LOCKED_BEATS.length).toBeGreaterThan(0);
  });

  it.each(LOCALES)('%s: behind the lock, tells act 5’s finding with its citation, and links the engine only there', (locale) => {
    const locked = readable(parts(locale).locked);
    expect(findMarks(locked).length).toBeGreaterThan(0);
    expect(citationsIn(locked)).toContain('Kawagoe+Narita 2014');
    expect([...parts(locale).locked.matchAll(/TODO\(([^)]*)\)/g)].map((m) => m[1])).toEqual(['launch']);
  });

  it.each(LOCALES)('%s: says the curve compares worlds, not a population’s history (rule (e))', (locale) => {
    const text = readable(parts(locale).locked).replace(/\s+/g, ' ').toLocaleLowerCase('und');
    expect(text).toMatch(locale === 'en' ? /a comparison across worlds/ : /una comparación entre mundos/);
    expect(text).toMatch(locale === 'en' ? /not a population moving along the curve/ : /no es una población que recorre la curva/);
  });
});
