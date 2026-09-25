import { describe, expect, it } from 'vitest';
import sources from '../docs/sources.md?raw';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';
import { CITATIONS, FIGURES, SOURCE_KEYS } from '../src/content/figures';
import { ACTS } from '../src/lib/acts';
import { LOCALES, type Locale } from '../src/lib/locales';

const files = import.meta.glob('../src/content/acts/*/*.md', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>;

interface ActFile {
  locale: Locale;
  name: string;
  data: Record<string, string>;
  body: string;
}

const actFiles: ActFile[] = Object.entries(files).map(([path, raw]) => {
  const match = /\/acts\/(\w+)\/([^/]+)\.md$/.exec(path);
  const parts = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw.replace(/\r\n/g, '\n'));
  if (!match || !parts) throw new Error(`Unreadable act file ${path}`);
  const data = Object.fromEntries(
    (parts[1] ?? '').split('\n').map((line) => {
      const [key, ...rest] = line.split(':');
      return [key?.trim() ?? '', rest.join(':').trim()];
    }),
  );
  return { locale: match[1] as Locale, name: match[2] ?? '', data, body: parts[2] ?? '' };
});

const byAct = (locale: Locale, act: number) => actFiles.find((f) => f.locale === locale && Number(f.data.act) === act);

/** The prose a reader sees: no TODO markers, no link targets, no list numbers, no table rules. */
function readable(body: string, { tables = true } = {}): string {
  return body
    .replace(/<(span|p) class="todo">[\s\S]*?<\/\1>/g, ' ')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/^\s*\d+\.\s/gm, ' ')
    .split('\n')
    .filter((line) => !/^\s*\|?\s*:?-{3,}/.test(line))
    .filter((line) => tables || !line.trim().startsWith('|'))
    .join('\n');
}

const CITATION = /(\p{Lu}[\p{L}'-]+(?:\s+(?:and|y)\s+\p{Lu}[\p{L}'-]+)*)\s+\((\d{4})\)/gu;
const NUMBER = /\d+(?:[/.,]\d+)*/g;

function citationsIn(text: string): string[] {
  return [...text.matchAll(CITATION)].map((m) => `${(m[1] ?? '').split(/\s+(?:and|y)\s+/).join('+')} ${m[2]}`);
}

function numbersIn(text: string): string[] {
  return [...text.replace(CITATION, ' ').matchAll(NUMBER)].map((m) => m[0]);
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
}

const WRITTEN_ACTS = [1, 2, 3, 4, 5, 6] as const;
const WORD_BUDGET: Record<(typeof WRITTEN_ACTS)[number], { max: number; tables: boolean }> = {
  1: { max: 60, tables: true },
  2: { max: 250, tables: true },
  3: { max: 250, tables: false }, // the predictions table comes on top of the budget
  4: { max: 350, tables: true },
  5: { max: 350, tables: true },
  6: { max: 200, tables: true },
};

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

describe('figures in the prose', () => {
  const allowed = new Set(FIGURES.map((f) => f.value));

  it.each(actFiles.map((f) => [`${f.locale}/${f.name}`, f] as const))('%s uses only registered figures', (_name, file) => {
    expect(numbersIn(readable(file.body)).filter((n) => !allowed.has(n))).toEqual([]);
  });

  it.each(actFiles.map((f) => [`${f.locale}/${f.name}`, f] as const))(
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

  it('rejects an unregistered number and a bare year', () => {
    const allowedNumbers = (text: string) => numbersIn(text).filter((n) => !allowed.has(n));
    expect(allowedNumbers('About 75% rolled.')).toEqual(['75']);
    expect(allowedNumbers('In 2008 the study ran.')).toEqual(['2008']);
    expect(allowedNumbers('As Vanberg (2008) shows, 73% rolled.')).toEqual([]);
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

  it('links the iterated dilemma to The Evolution of Trust in act 2, in both languages', () => {
    for (const locale of LOCALES) expect(byAct(locale, 2)?.body).toContain('(https://ncase.me/trust/)');
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

  it("names act 5's three reasons in words, never by the curve's series ids", () => {
    const names = {
      en: ['personal guilt', 'partner-specific commitment', 'general guilt'],
      es: ['culpa personal', 'compromiso específico a la pareja', 'culpa general'],
    };
    for (const locale of LOCALES) {
      const body = readable(byAct(locale, 5)?.body ?? '').replace(/\s+/g, ' ').toLowerCase();
      for (const name of names[locale]) expect(body).toContain(name);
      expect(body).not.toMatch(/\b(pga|mc-b|ga)\b/);
    }
  });
});
