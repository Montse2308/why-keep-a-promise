import { describe, expect, it } from 'vitest';

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
    expect(Object.keys(files)).toContain('../src/content/acts/en/04-vanberg.md');
  });

  it.each(Object.entries(files))('%s contains none', (_path, text) => {
    const found = FORBIDDEN.filter((phrase) => normalize(text).includes(normalize(phrase)));
    expect(found).toEqual([]);
  });

  it('matches regardless of case and accents written as one character', () => {
    const hits = (text: string) => FORBIDDEN.filter((phrase) => normalize(text).includes(normalize(phrase)));
    expect(hits('Coming Soon')).toEqual(['coming soon']);
    expect(hits('PRÓXIMAMENTE')).toEqual(['próximamente']);
    expect(hits('Próximamente')).toEqual(['próximamente']);
  });
});
