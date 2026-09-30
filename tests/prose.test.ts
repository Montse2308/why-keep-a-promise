import { describe, expect, it } from 'vitest';
import sources from '../docs/sources.md?raw';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';
import { CITATIONS, FIGURES, SOURCE_KEYS } from '../src/content/figures';
import { ACTS } from '../src/lib/acts';
import { LOCALES, type Locale } from '../src/lib/locales';
import { splitAtLock } from '../src/lib/film/captions';
import { SUBPAGES, type Subpage } from '../src/lib/routes';
import { SECTIONS } from '../src/lib/sections';
import { slotsIn, splitSubpage } from '../src/lib/subpages';
import { citationsIn, filledCaptions, numbersIn, readable, sentences, wordCount } from './prose';

type Raw = Record<string, string>;
const actSources = import.meta.glob('../src/content/acts/*/*.md', { query: '?raw', import: 'default', eager: true }) as Raw;
const subpageSources = import.meta.glob('../src/content/subpages/*/*.md', { query: '?raw', import: 'default', eager: true }) as Raw;
const sectionSources = import.meta.glob('../src/content/sections/*/*.md', { query: '?raw', import: 'default', eager: true }) as Raw;
const captionSources = import.meta.glob('../src/content/chapters/*/*.md', { query: '?raw', import: 'default', eager: true }) as Raw;

interface ProseFile {
  locale: Locale;
  name: string;
  data: Record<string, string>;
  body: string;
}

function parse(files: Raw, collection: 'acts' | 'subpages' | 'sections'): ProseFile[] {
  return Object.entries(files).map(([path, raw]) => {
    const match = new RegExp(`/${collection}/(\\w+)/([^/]+)\\.md$`).exec(path);
    const parts = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw.replace(/\r\n/g, '\n'));
    if (!match || !parts) throw new Error(`Unreadable prose file ${path}`);
    const data = Object.fromEntries(
      (parts[1] ?? '').split('\n').map((line) => {
        const [key, ...rest] = line.split(':');
        return [key?.trim() ?? '', rest.join(':').trim()];
      }),
    );
    return { locale: match[1] as Locale, name: match[2] ?? '', data, body: parts[2] ?? '' };
  });
}

const actFiles = parse(actSources, 'acts');
const subpageFiles = parse(subpageSources, 'subpages');
const sectionFiles = parse(sectionSources, 'sections');

const byAct = (locale: Locale, act: number) => actFiles.find((f) => f.locale === locale && Number(f.data.act) === act);
const bySubpage = (locale: Locale, subpage: Subpage) => subpageFiles.find((f) => f.locale === locale && f.name === subpage);

/** The acts still on `/`, by number: the film tells the others now, and their prose is retired (ADR 0021). */
const WRITTEN_ACTS = [6] as const;
/** Words per act and language. R4 shortened acts 1–4 and 6 (ADR 0019). */
const WORD_BUDGET: Record<(typeof WRITTEN_ACTS)[number], { max: number; tables: boolean }> = {
  6: { max: 145, tables: true },
};

/** Chapter 7's captions in a locale, split at its lock mark (ADR 0026). */
const seventh = (locale: Locale) =>
  splitAtLock((Object.entries(captionSources).find(([path]) => path.endsWith(`/chapters/${locale}/07-my-research.md`))?.[1] ?? '').replace(/^---[\s\S]*?---/, ''));

/** Words per subpage and language, tables not counted (the F4 session's budget). */
const SUBPAGE_BUDGET: Record<Subpage, number> = { dilemma: 600, vanberg: 700, finding: 700, 'how-its-built': 600 };

describe('act files', () => {
  it('exist for every act the film does not tell yet, in every locale, with the same file names', () => {
    expect(ACTS.filter((act) => !act.film).map((act) => ACTS.indexOf(act) + 1)).toEqual([...WRITTEN_ACTS]);
    for (const locale of LOCALES) {
      const names = actFiles.filter((f) => f.locale === locale).map((f) => f.name).sort();
      expect(names).toEqual(['06-how-its-built']);
    }
  });

  it.each(actFiles.map((f) => [`${f.locale}/${f.name}`, f] as const))('%s matches its act', (_name, file) => {
    const index = Number(file.data.act) - 1;
    const act = ACTS[index];
    expect(act).toBeDefined();
    expect(file.name).toBe(`${String(index + 1).padStart(2, '0')}-${act?.id}`);
    expect(file.data.deeper).toBe(act?.deeper ?? 'null');
    const dictionary = file.locale === 'en' ? en : es;
    expect(act?.film).toBeNull();
    expect(file.data.title).toBe(act && dictionary[act.titleKey]);
  });
});

describe('subpage files', () => {
  it('exist for every subpage in every locale, named by its slug', () => {
    for (const locale of LOCALES) {
      expect(subpageFiles.filter((f) => f.locale === locale).map((f) => f.name).sort()).toEqual([...SUBPAGES].sort());
    }
  });

  it.each(subpageFiles.map((f) => [`${f.locale}/${f.name}`, f] as const))('%s deepens the act that links to it, with its title', (_name, file) => {
    const act = ACTS[Number(file.data.act) - 1];
    expect(act?.deeper).toBe(file.name);
    const dictionary = file.locale === 'en' ? en : es;
    expect(file.data.title).toBe(act && dictionary[act.titleKey]);
  });
});

describe('home section files (ADR 0019)', () => {
  it('exist for every section in every locale, named by its id', () => {
    for (const locale of LOCALES) {
      expect(sectionFiles.filter((f) => f.locale === locale).map((f) => f.name).sort()).toEqual(SECTIONS.map((s) => s.id).sort());
    }
  });

  it.each(sectionFiles.map((f) => [`${f.locale}/${f.name}`, f] as const))('%s carries its section title and only its own slots', (_name, file) => {
    const section = SECTIONS.find((candidate) => candidate.id === file.name);
    const dictionary = file.locale === 'en' ? en : es;
    expect(file.data.title).toBe(section && dictionary[section.titleKey]);
    const { open, locked } = splitSubpage(file.body);
    expect(slotsIn([...open, ...locked])).toEqual(section?.slots);
  });

  it('keeps "About" to the facts Montse gave: the author links, and a TODO for the rest', () => {
    for (const locale of LOCALES) {
      const body = sectionFiles.find((f) => f.locale === locale && f.name === 'about')?.body ?? '';
      expect(readable(body).trim()).toBe('');
      expect([...body.matchAll(/TODO\(([^)]*)\)/g)].map((m) => m[1])).toEqual(['F5']);
    }
  });
});

describe('figures in the prose', () => {
  const allowed = new Set(FIGURES.map((f) => f.value));
  const proseFiles = [
    ...actFiles,
    ...subpageFiles.map((f) => ({ ...f, name: `subpage ${f.name}` })),
    ...sectionFiles.map((f) => ({ ...f, name: `section ${f.name}` })),
  ];

  it.each(proseFiles.map((f) => [`${f.locale}/${f.name}`, f] as const))('%s uses only registered figures', (_name, file) => {
    expect(numbersIn(readable(file.body)).filter((n) => !allowed.has(n))).toEqual([]);
  });

  it.each(proseFiles.map((f) => [`${f.locale}/${f.name}`, f] as const))(
    '%s cites only registered works, as "Author (year)"',
    (_name, file) => {
      const registered = new Set(CITATIONS.map((c) => `${c.authors.join('+')} ${c.year}`));
      expect(citationsIn(readable(file.body)).filter((c) => !registered.has(c))).toEqual([]);
    },
  );

  it.each(WRITTEN_ACTS)('act %i says the same figures and citations in both languages', (act) => {
    const [a, b] = LOCALES.map((locale) => readable(byAct(locale, act)?.body ?? ''));
    expect(numbersIn(b ?? '').sort()).toEqual(numbersIn(a ?? '').sort());
    expect(citationsIn(b ?? '').sort()).toEqual(citationsIn(a ?? '').sort());
  });

  it.each(SUBPAGES)('subpage %s says the same figures and citations in both languages', (subpage) => {
    const [a, b] = LOCALES.map((locale) => readable(bySubpage(locale, subpage)?.body ?? ''));
    expect(numbersIn(b ?? '').sort()).toEqual(numbersIn(a ?? '').sort());
    expect(citationsIn(b ?? '').sort()).toEqual(citationsIn(a ?? '').sort());
  });

  it('rejects an unregistered number and a bare year', () => {
    const allowedNumbers = (text: string) => numbersIn(text).filter((n) => !allowed.has(n));
    expect(allowedNumbers('About 75% rolled.')).toEqual(['75']);
    expect(allowedNumbers('In 2008 the study ran.')).toEqual(['2008']);
    expect(allowedNumbers('As Vanberg (2008) shows, 73% rolled.')).toEqual([]);
  });

  it('reads a citation with a section as a citation, not as figures', () => {
    expect(citationsIn('as Kawagoe and Narita (2014, §3.2(ii)) derive')).toEqual(['Kawagoe+Narita 2014']);
    expect(numbersIn('as Kawagoe and Narita (2014, §3.2(ii)) derive')).toEqual([]);
  });

  it('does not check code blocks or markers as prose', () => {
    expect(numbersIn(readable('Text.\n\n```ts\nconst x = 200;\n```\n\n<!-- slot:guilt-chart -->\n'))).toEqual([]);
  });

  it('points every figure and citation at an entry in docs/sources.md', () => {
    for (const key of SOURCE_KEYS) expect(sources, key).toMatch(new RegExp(`Clave:(\\*\\*)? \`${key}\``));
    for (const { source } of [...FIGURES, ...CITATIONS]) expect(SOURCE_KEYS).toContain(source);
  });
});

describe('voice', () => {
  it.each(LOCALES.flatMap((locale) => WRITTEN_ACTS.map((act) => [locale, act] as const)))(
    '%s act %i stays within its word budget',
    (locale, act) => {
      const { max, tables } = WORD_BUDGET[act];
      expect(wordCount(readable(byAct(locale, act)?.body ?? '', { tables }))).toBeLessThanOrEqual(max);
    },
  );

  it.each(LOCALES.flatMap((locale) => SUBPAGES.map((subpage) => [locale, subpage] as const)))(
    '%s subpage %s stays within its word budget, tables not counted',
    (locale, subpage) => {
      expect(wordCount(readable(bySubpage(locale, subpage)?.body ?? '', { tables: false }))).toBeLessThanOrEqual(SUBPAGE_BUDGET[subpage]);
    },
  );

  it("ends /dilemma's paragraph on the repeated dilemma with the link to The Evolution of Trust", () => {
    for (const locale of LOCALES) {
      const paragraph = (bySubpage(locale, 'dilemma')?.body ?? '').split(/\n\s*\n/).find((p) => p.includes('Tit-for-Tat')) ?? '';
      expect(paragraph).toContain('(https://ncase.me/trust/)');
      expect(paragraph.trim()).toMatch(/Case \(2017\)\.$/);
    }
  });

  it("quotes Vanberg's abstract on /dilemma, and marks the Spanish as a translation of our own", () => {
    const quote = 'Numerous psychological and economic experiments have shown that the exchange of promises greatly enhances cooperative behavior in experimental games.';
    expect(bySubpage('en', 'dilemma')?.body.replace(/\s+/g, ' ')).toContain(`"${quote}"`);
    expect(bySubpage('es', 'dilemma')?.body.replace(/\s+/g, ' ')).toMatch(/«[^»]+» \(traducción propia\)/);
  });

  it("ends chapter 6 at Vanberg's conclusion, where act 4 ended, and chapter 7's finding opens with act 5's transition", () => {
    const conclusion = { en: "a preference for keeping one's word in itself.", es: 'una preferencia por cumplir la palabra en sí.' };
    const transition = { en: "Vanberg's design separates", es: 'El diseño de Vanberg separa' };
    for (const locale of LOCALES) {
      const sixth = Object.entries(captionSources).find(([path]) => path.endsWith(`/chapters/${locale}/06-real-people.md`))?.[1] ?? '';
      expect(sixth.trim().replace(/\s+/g, ' ').endsWith(conclusion[locale])).toBe(true);
      const finding = readable(seventh(locale).locked).replace(/^\s*#+.*$/m, '').trim();
      expect(finding.startsWith(transition[locale])).toBe(true);
    }
  });

  it("names chapter 7's finding's and /finding's reasons in words, never by the curve's series ids", () => {
    const names = {
      en: ['personal guilt', 'partner-specific commitment', 'general guilt'],
      es: ['culpa personal', 'compromiso específico a la pareja', 'culpa general'],
    };
    for (const locale of LOCALES) {
      for (const text of [seventh(locale).locked, bySubpage(locale, 'finding')?.body]) {
        const body = readable(text ?? '').replace(/\s+/g, ' ').toLowerCase();
        for (const name of names[locale]) expect(body).toContain(name);
        expect(body).not.toMatch(/\b(pga|mc-b|ga)\b/);
      }
    }
  });

  it('marks unwritten content only with TODO(launch), the engine link of step 8', () => {
    for (const file of subpageFiles) {
      expect([...file.body.matchAll(/TODO\(([^)]*)\)/g)].map((m) => m[1]).every((phase) => phase === 'launch'), `${file.locale}/${file.name}`).toBe(true);
    }
  });
});

describe('the acts still to be replaced (R4, ADR 0019)', () => {
  it.each(LOCALES)('%s: act 6 is about the page only; the engine is in chapter 7', (locale) => {
    expect(byAct(locale, 6)?.body ?? '').not.toMatch(/engine|motor|simulat|simulaci/i);
  });
});

describe('subpages only add to their act, or to the film that tells it now (rule (h))', () => {
  /** The film's captions in a locale, as the visitor reads them: placeholders filled from the code. */
  const film = (locale: Locale) =>
    Object.entries(captionSources)
      .filter(([path]) => path.includes(`/chapters/${locale}/`))
      .map(([, raw]) => filledCaptions(raw.replace(/^---[\s\S]*?---/, '')))
      .join('\n\n');

  it('splits prose into whole sentences', () => {
    expect(sentences('## A title\n\nOne *sentence*. Another "one"!\n\n- A list item.')).toEqual(['a title.', 'one sentence.', 'another one!', 'a list item.']);
  });

  it.each(subpageFiles.map((f) => [`${f.locale}/${f.name}`, f] as const))('%s shares no whole sentence with its act or the film', (_name, file) => {
    const act = ACTS[Number(file.data.act) - 1];
    const told = act?.film ? film(file.locale) : (byAct(file.locale, Number(file.data.act))?.body ?? '');
    expect(told.trim().length).toBeGreaterThan(0);
    const theirs = new Set(sentences(told));
    expect(sentences(file.body).filter((sentence) => theirs.has(sentence))).toEqual([]);
  });

  it('would catch a sentence copied from the act', () => {
    const act = byAct('en', 6)?.body ?? '';
    const copied = sentences(act)[2] ?? '';
    expect(copied.length).toBeGreaterThan(0);
    expect(new Set(sentences(act)).has(sentences(`Intro. ${copied}`)[1] ?? '')).toBe(true);
  });
});
