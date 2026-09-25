import { describe, expect, it } from 'vitest';
import config from '../src/config.ts?raw';
import curveComponent from '../src/components/curve/Curve.astro?raw';
import curveController from '../src/components/curve/controller.ts?raw';
import actEn from '../src/content/acts/en/05-finding.md?raw';
import actEs from '../src/content/acts/es/05-finding.md?raw';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';
import homeView from '../src/views/HomeView.astro?raw';
import subpageView from '../src/views/SubpageView.astro?raw';
import { splitSubpage } from '../src/lib/subpages';
import { findMarks, MARKERS, readStatus, UNLOCKED_MARKERS, UNLOCKED_PAGES } from '../scripts/verify-dist.mjs';

const subpages = import.meta.glob('../src/content/subpages/*/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/** Each subpage's Markdown, split at its lock marker (src/lib/subpages.ts). */
const parts = Object.entries(subpages).map(([path, raw]) => {
  const { open, locked } = splitSubpage(raw.replace(/^---[\s\S]*?---/, ''));
  const text = (segments: typeof open) => segments.map((segment) => (segment.kind === 'html' ? segment.html : '')).join('\n');
  return { path, open: text(open), locked: text(locked) };
});

const curveKeys = (dictionary: Record<string, string>) =>
  Object.entries(dictionary)
    .filter(([key]) => key.startsWith('curve.'))
    .map(([, value]) => value)
    .join('\n');

// What the lock covers once open: act 5, /finding and the engine part of /how-its-built.
const lockedSources = [
  actEn,
  actEs,
  curveKeys(en),
  curveKeys(es),
  curveComponent,
  curveController,
  homeView,
  subpageView,
  ...parts.map((part) => part.locked),
].join('\n');

describe('verify:dist (ADR 0015, ADR 0017)', () => {
  it('looks for marks that the locked content really carries, so the list cannot go stale', () => {
    expect(findMarks(lockedSources)).toEqual(MARKERS);
    for (const mark of UNLOCKED_MARKERS) expect(MARKERS).toContain(mark);
  });

  it('checks every page that carries locked content once unlocked, in both languages', () => {
    expect(Object.keys(UNLOCKED_PAGES).sort()).toEqual(
      ['index.html', 'finding/index.html', 'how-its-built/index.html'].flatMap((page) => [page, `es/${page}`]).sort(),
    );
  });

  it.each(parts.map((part) => [part.path.replace(/^.*subpages\//, ''), part] as const))(
    "%s: the open part carries none of the lock's marks",
    (_path, part) => {
      expect(findMarks(part.open)).toEqual([]);
    },
  );

  it('puts all of /finding and the engine of /how-its-built behind the lock', () => {
    for (const part of parts) {
      if (part.path.endsWith('/finding.md')) expect(part.open.trim()).toBe('');
      if (part.path.endsWith('/how-its-built.md')) expect(findMarks(part.locked).length).toBeGreaterThan(0);
      if (/\/(dilemma|vanberg)\.md$/.test(part.path)) expect(part.locked).toBe('');
    }
  });

  it('matches across line breaks and case', () => {
    expect(findMarks('<p>…from Kawagoe and\nNarita. Personal\n  guilt weighs…</p>')).toEqual(['Kawagoe', 'personal guilt']);
  });

  it('finds nothing in act 5 and /finding as they render while locked', () => {
    const locked = `<section id="finding" class="act"><h2 id="finding-title">${en['act.finding.title']}</h2><p class="act__status">${en['manuscript.status.in-preparation']}</p></section>`;
    const lockedEs = `<h2>${es['act.finding.title']}</h2><p>${es['manuscript.status.in-preparation']}</p>`;
    const subpage = `<article class="subpage"><h1 id="subpage-title">${en['act.finding.title']}</h1><p class="subpage__status">${en['manuscript.status.in-preparation']}</p></article>`;
    expect(findMarks(locked + lockedEs + subpage)).toEqual([]);
  });

  it('reads the manuscript status from src/config.ts', () => {
    expect(['in-preparation', 'under-review']).toContain(readStatus(config));
    expect(readStatus("export const MANUSCRIPT_STATUS: 'in-preparation' | 'under-review' = 'under-review';")).toBe('under-review');
    expect(() => readStatus('export const OTHER = 1;')).toThrow();
  });
});
