import { describe, expect, it } from 'vitest';
import { WORKING_PAPER } from '../src/config';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';
import { LOCALES } from '../src/lib/i18n';
import { description } from '../src/lib/meta';
import { ROUTES } from '../src/lib/routes';

/**
 * Phrases that must never appear in the site or its sources, in any language or case
 * (docs/content-rules.md). This file is the only place in src/ or tests/ that lists them.
 */
const FORBIDDEN = [
  'bi-stab',
  'bistab',
  'biestab',
  'bi-estab',
  'universalis',
  'particularis',
  'coming soon',
  'próximamente',
  'not yet approved',
  'aún no se aprueba',
  'está por lanzarse',
  // The working paper is not under review, accepted, peer-reviewed or published in a journal (rule (b), ADR 0034).
  'under review',
  'en revisión',
  'accepted',
  'aceptado',
  'aceptada',
  'peer-review',
  'peer review',
  'revisión por pares',
  'revisado por pares',
  'revisada por pares',
  'published in',
  'publicado en',
  'publicada en',
];

const files = import.meta.glob(['../src/**/*.{md,json,astro,ts,mjs}', '../README.md', '../README.es.md', '!**/*.test.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const normalize = (text: string) => text.normalize('NFC').toLocaleLowerCase('und');

describe('forbidden phrases', () => {
  it('scans the site sources', () => {
    expect(Object.keys(files).length).toBeGreaterThan(20);
    expect(Object.keys(files)).toContain('../src/content/chapters/en/06-real-people.md');
  });

  it.each(Object.entries(files))('%s contains none', (_path, text) => {
    const found = FORBIDDEN.filter((phrase) => normalize(text).includes(normalize(phrase)));
    expect(found).toEqual([]);
  });

  it.each(LOCALES.flatMap((locale) => ROUTES.map((route) => [`${locale} ${route}`, description(locale, route)] as const)))(
    "the description of %s contains none",
    (_page, text) => {
      expect(FORBIDDEN.filter((phrase) => normalize(text).includes(normalize(phrase)))).toEqual([]);
    },
  );

  it('matches regardless of case and accents written as one character', () => {
    const hits = (text: string) => FORBIDDEN.filter((phrase) => normalize(text).includes(normalize(phrase)));
    expect(hits('Coming Soon')).toEqual(['coming soon']);
    expect(hits('Peer-reviewed and published in a journal')).toEqual(['peer-review', 'published in']);
    expect(hits('El texto está EN REVISIÓN')).toEqual(['en revisión']);
    expect(hits('PRÓXIMAMENTE')).toEqual(['próximamente']);
    expect(hits('Próximamente')).toEqual(['próximamente']);
  });

  it("lets the working paper's title and its status sentence through", () => {
    const hits = (text: string) => FORBIDDEN.filter((phrase) => normalize(text).includes(normalize(phrase)));
    expect(hits(WORKING_PAPER.title)).toEqual([]);
    for (const dictionary of [en, es]) expect(hits(dictionary['paper.status'].replace('{title}', WORKING_PAPER.title))).toEqual([]);
  });
});
