import { describe, expect, it } from 'vitest';
import sources from '../docs/sources.md?raw';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';
import { CITATIONS, FIGURES, SOURCE_KEYS } from '../src/content/figures';
import { ACTS } from '../src/lib/acts';
import { LOCALES, type Locale } from '../src/lib/locales';
import { SUBPAGES, type Subpage } from '../src/lib/routes';
import { SECTIONS } from '../src/lib/sections';
import { slotsIn, splitSubpage } from '../src/lib/subpages';
import { MARKERS, findMarks } from '../scripts/verify-dist.mjs';
import { citationsIn, numbersIn, readable, sentences, wordCount } from './prose';

type Raw = Record<string, string>;
const actSources = import.meta.glob('../src/content/acts/*/*.md', { query: '?raw', import: 'default', eager: true }) as Raw;
const subpageSources = import.meta.glob('../src/content/subpages/*/*.md', { query: '?raw', import: 'default', eager: true }) as Raw;
const sectionSources = import.meta.glob('../src/content/sections/*/*.md', { query: '?raw', import: 'default', eager: true }) as Raw;

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

const WRITTEN_ACTS = [1, 2, 3, 4, 5, 6] as const;
/** Words per act and language. R4 shortened acts 1–4 and 6 (ADR 0019); act 5 keeps its F3.1 budget. */
const WORD_BUDGET: Record<(typeof WRITTEN_ACTS)[number], { max: number; tables: boolean }> = {
  1: { max: 30, tables: true }, // a minimal entry: the scene sets up the situation
  2: { max: 210, tables: true },
  3: { max: 110, tables: false }, // the predictions table comes on top of the budget
  4: { max: 230, tables: true },
  5: { max: 420, tables: true },
  6: { max: 145, tables: true },
};

/** Words per subpage and language, tables not counted (the F4 session's budget). */
const SUBPAGE_BUDGET: Record<Subpage, number> = { dilemma: 600, vanberg: 700, finding: 700, 'how-its-built': 600 };

describe('act files', () => {
  it('exist for every act in every locale, with the same file names', () => {
    for (const locale of LOCALES) {
      const names = actFiles.filter((f) => f.locale === locale).map((f) => f.name).sort();
      expect(names).toEqual(['01-question', '02-dilemma', '03-two-reasons', '04-vanberg', '05-finding', '06-how-its-built']);
    }
  });

  it.each(actFiles.map((f) => [`${f.locale}/${f.name}`, f] as const))('%s matches its act', (_name, file) => {
    const index = Number(file.data.act) - 1;
    const act = ACTS[index];
    expect(act).toBeDefined();
    expect(file.name).toBe(`${String(index + 1).padStart(2, '0')}-${act?.id}`);
    expect(file.data.deeper).toBe(act?.deeper ?? 'null');
    const dictionary = file.locale === 'en' ? en : es;
    expect(file.data.title).toBe(act?.id === 'question' ? dictionary['site.title'] : act && dictionary[act.titleKey]);
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

  it('keeps "The research" to the question and the engine while locked (rule (j))', () => {
    const outsideTheLock = /\b(tests?|seeds?|semillas?|generations?|generaci[oó]n(es)?|imitat\w*|imitaci[oó]n|provenance|procedencia|curves?|curvas?|parameters?|par[aá]metros?|finding|hallazgo)\b|θ/iu;
    for (const locale of LOCALES) {
      const file = sectionFiles.find((f) => f.locale === locale && f.name === 'research');
      const { open, locked } = splitSubpage(file?.body ?? '');
      const openText = readable(open.map((segment) => (segment.kind === 'html' ? segment.html : '')).join('\n'));
      expect(openText).toContain('TypeScript');
      expect(openText).toMatch(locale === 'en' ? /\bmy research\b/ : /\bmi investigación\b/);
      expect(openText).not.toMatch(outsideTheLock);
      expect(findMarks(openText)).toEqual([]);
      // Behind the lock: only the links and the engine's repository, no finding either.
      expect(slotsIn(locked)).toEqual(['research-links']);
      expect(findMarks(locked.map((segment) => (segment.kind === 'html' ? segment.html : '')).join('\n'), MARKERS)).toEqual([]);
    }
  });

  it('keeps "About" to the facts Montse gave: the author links, and a TODO for the rest', () => {
    for (const locale of LOCALES) {
      const body = sectionFiles.find((f) => f.locale === locale && f.name === 'about')?.body ?? '';
      expect(readable(body).trim()).toBe('');
      expect([...body.matchAll(/TODO\(([^)]*)\)/g)].map((m) => m[1])).toEqual(['F5']);
    }
  });

  it('marks the research only with TODO(launch), the engine link of step 8', () => {
    for (const locale of LOCALES) {
      const body = sectionFiles.find((f) => f.locale === locale && f.name === 'research')?.body ?? '';
      expect([...body.matchAll(/TODO\(([^)]*)\)/g)].map((m) => m[1])).toEqual(['launch']);
    }
  });

  it.each(LOCALES)('%s: "The research" stays short, within 60 words', (locale) => {
    const body = sectionFiles.find((f) => f.locale === locale && f.name === 'research')?.body ?? '';
    expect(wordCount(readable(body))).toBeLessThanOrEqual(60);
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

  it('links the iterated dilemma to The Evolution of Trust in act 2, in both languages', () => {
    for (const locale of LOCALES) expect(byAct(locale, 2)?.body).toContain('(https://ncase.me/trust/)');
  });

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

  it("ends act 4 at Vanberg's conclusion and opens act 5 with the transition", () => {
    const conclusion = { en: "a preference for keeping one's word in itself.", es: 'una preferencia por cumplir la palabra en sí.' };
    const transition = { en: "Vanberg's design separates", es: 'El diseño de Vanberg separa' };
    for (const locale of LOCALES) {
      expect(byAct(locale, 4)?.body).not.toContain('TODO(');
      expect(byAct(locale, 4)?.body.trim().replace(/\s+/g, ' ').endsWith(conclusion[locale])).toBe(true);
      expect(byAct(locale, 5)?.body.trim().startsWith(transition[locale])).toBe(true);
    }
  });

  it("names act 5's and /finding's reasons in words, never by the curve's series ids", () => {
    const names = {
      en: ['personal guilt', 'partner-specific commitment', 'general guilt'],
      es: ['culpa personal', 'compromiso específico a la pareja', 'culpa general'],
    };
    for (const locale of LOCALES) {
      for (const file of [byAct(locale, 5), bySubpage(locale, 'finding')]) {
        const body = readable(file?.body ?? '').replace(/\s+/g, ' ').toLowerCase();
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
  it.each(LOCALES)('%s: act 4 keeps its cited figures, without the steps', (locale) => {
    const body = byAct(locale, 4)?.body ?? '';
    expect(body).not.toMatch(/^\s*\d+\.\s/m);
    for (const figure of ['192', '8', '73', '54', '70', '68']) expect(numbersIn(readable(body))).toContain(figure);
  });

  it.each(LOCALES)('%s: act 6 is about the page only; the engine is in "The research"', (locale) => {
    expect(byAct(locale, 6)?.body ?? '').not.toMatch(/engine|motor|simulat|simulaci/i);
  });
});

describe('subpages only add to their act (rule (h))', () => {
  it('splits prose into whole sentences', () => {
    expect(sentences('## A title\n\nOne *sentence*. Another "one"!\n\n- A list item.')).toEqual(['a title.', 'one sentence.', 'another one!', 'a list item.']);
  });

  it.each(subpageFiles.map((f) => [`${f.locale}/${f.name}`, f] as const))('%s shares no whole sentence with its act', (_name, file) => {
    const act = new Set(sentences(byAct(file.locale, Number(file.data.act))?.body ?? ''));
    expect(sentences(file.body).filter((sentence) => act.has(sentence))).toEqual([]);
  });

  it('would catch a sentence copied from the act', () => {
    const act = byAct('en', 2)?.body ?? '';
    const copied = sentences(act)[2] ?? '';
    expect(copied.length).toBeGreaterThan(0);
    expect(new Set(sentences(act)).has(sentences(`Intro. ${copied}`)[1] ?? '')).toBe(true);
  });
});
