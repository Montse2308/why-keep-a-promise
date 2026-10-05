import { describe, expect, it } from 'vitest';
import baseLayout from '../layouts/BaseLayout.astro?raw';
import details from '../components/notebook/details.ts?raw';
import notebookComponent from '../components/notebook/Notebook.astro?raw';
import en from '../i18n/en.json';
import es from '../i18n/es.json';
import { AWAY_KEYS, consoleNote, THREADS, threadOf } from './details';

// The film's script and its chapters' controllers, read as one.
const film = Object.values(
  import.meta.glob<string>(['../components/film/film.ts', '../components/film/context.ts', '../components/film/chapters/*.ts'], { query: '?raw', import: 'default', eager: true }),
).join('\n');

describe("the tab's title", () => {
  it('has a line about the promise for every state of the thread, in both languages', () => {
    for (const dictionary of [en, es] as Record<string, string>[]) {
      for (const thread of THREADS) expect(dictionary[AWAY_KEYS[thread]]?.length, thread).toBeGreaterThan(5);
    }
    expect(en['tab.away.tied']).toBe('You promised. Come back.');
    expect(es['tab.away.tied']).toBe('Lo prometiste. Vuelve.');
  });

  it('follows the film’s thread, and falls back to no promise', () => {
    expect(threadOf('kept')).toBe('kept');
    expect(threadOf('broken')).toBe('broken');
    expect(threadOf(undefined)).toBe('none');
    expect(threadOf('anything')).toBe('none');
    expect(film).toContain('film.dataset.thread = thread;');
  });

  it('changes while the visitor is in another tab, and comes back when they return', () => {
    expect(details).toContain("doc.addEventListener('visibilitychange'");
    expect(details).toContain("doc.title = doc.visibilityState === 'hidden' ? lines[thread] : title;");
    expect(baseLayout).toContain('data-away={away}');
  });
});

describe("the console's note", () => {
  it('links to /how-its-built, in the page’s language', () => {
    expect(en['console.line']).toContain('{url}');
    expect(es['console.line']).toContain('{url}');
    expect(baseLayout).toContain("fill(t(locale, 'console.line'), { url: absoluteHref(site, locale, 'how-its-built') })");
  });

  it('sets the project’s name apart, then the line', () => {
    const [format, name, rest] = consoleNote('I promise', 'See how.');
    expect(format).toBe('%cI promise%c See how.');
    expect(name).toContain('italic');
    expect(rest).toContain('inherit');
  });
});

describe('both', () => {
  it('run in the notebook’s script, which every page loads (ADR 0025 lists every script of the site)', () => {
    expect(notebookComponent).toMatch(/import \{ details \} from '\.\/details';[\s\S]*details\(\);/);
  });
});
