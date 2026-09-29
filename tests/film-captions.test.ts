import { describe, expect, it } from 'vitest';
import { BUILT, CHAPTERS } from '../src/lib/chapters';
import { LOCALES, type Locale } from '../src/lib/locales';

type Raw = Record<string, string>;
const sources = import.meta.glob('../src/content/chapters/*/*.md', { query: '?raw', import: 'default', eager: true }) as Raw;

interface CaptionFile {
  locale: Locale;
  name: string;
  chapter: string;
  body: string;
}

const files: CaptionFile[] = Object.entries(sources).map(([path, raw]) => {
  const match = /\/chapters\/(\w+)\/([^/]+)\.md$/.exec(path);
  const parts = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw.replace(/\r\n/g, '\n'));
  if (!match || !parts) throw new Error(`Unreadable caption file ${path}`);
  const chapter = /^chapter:\s*(\S+)\s*$/m.exec(parts[1] ?? '')?.[1] ?? '';
  return { locale: match[1] as Locale, name: match[2] ?? '', chapter, body: parts[2] ?? '' };
});

const captionsOf = (locale: Locale, id: string) => files.find((f) => f.locale === locale && f.chapter === id);

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
});
