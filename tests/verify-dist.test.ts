import { describe, expect, it } from 'vitest';
import config from '../src/config.ts?raw';
import curveComponent from '../src/components/curve/Curve.astro?raw';
import curveController from '../src/components/curve/controller.ts?raw';
import actEn from '../src/content/acts/en/05-finding.md?raw';
import actEs from '../src/content/acts/es/05-finding.md?raw';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';
import homeSection from '../src/components/HomeSection.astro?raw';
import homeView from '../src/views/HomeView.astro?raw';
import subpageView from '../src/views/SubpageView.astro?raw';
import { splitSubpage } from '../src/lib/subpages';
import {
  countStandalone,
  findMarks,
  HOME_PAGES,
  MARKERS,
  readStatus,
  STATUS_ON_HOME,
  statusProblems,
  UNLOCKED_MARKERS,
  UNLOCKED_PAGES,
} from '../scripts/verify-dist.mjs';

const subpages = import.meta.glob('../src/content/subpages/*/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const sections = import.meta.glob('../src/content/sections/*/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/** Each subpage's and home section's Markdown, split at its lock marker (src/lib/subpages.ts). */
const parts = Object.entries({ ...subpages, ...sections }).map(([path, raw]) => {
  const { open, locked } = splitSubpage(raw.replace(/^---[\s\S]*?---/, ''));
  const text = (segments: typeof open) => segments.map((segment) => (segment.kind === 'html' ? segment.html : '')).join('\n');
  return { path, open: text(open), locked: text(locked) };
});

const curveKeys = (dictionary: Record<string, string>) =>
  Object.entries(dictionary)
    .filter(([key]) => key.startsWith('curve.'))
    .map(([, value]) => value)
    .join('\n');

// What the lock covers once open: act 5, /finding, the engine part of /how-its-built and the links
// of "The research".
const lockedSources = [
  actEn,
  actEs,
  curveKeys(en),
  curveKeys(es),
  curveComponent,
  curveController,
  homeView,
  homeSection,
  subpageView,
  ...parts.map((part) => part.locked),
].join('\n');

describe('verify:dist (ADR 0015, ADR 0017, ADR 0019)', () => {
  it('looks for marks that the locked content really carries, so the list cannot go stale', () => {
    expect(findMarks(lockedSources)).toEqual(MARKERS);
    for (const mark of UNLOCKED_MARKERS) expect(MARKERS).toContain(mark);
  });

  it('checks every page that carries locked content once unlocked, in both languages', () => {
    expect(Object.keys(UNLOCKED_PAGES).sort()).toEqual(
      ['index.html', 'finding/index.html', 'how-its-built/index.html'].flatMap((page) => [page, `es/${page}`]).sort(),
    );
  });

  it.each(parts.map((part) => [part.path.replace(/^.*content\//, ''), part] as const))(
    "%s: the open part carries none of the lock's marks",
    (_path, part) => {
      expect(findMarks(part.open)).toEqual([]);
    },
  );

  it('puts all of /finding and the engine of /how-its-built behind the lock', () => {
    for (const part of parts) {
      if (part.path.endsWith('/finding.md')) expect(part.open.trim()).toBe('');
      if (part.path.endsWith('/how-its-built.md')) expect(findMarks(part.locked).length).toBeGreaterThan(0);
      if (/\/(dilemma|vanberg|about)\.md$/.test(part.path)) expect(part.locked).toBe('');
    }
  });

  it('keeps "The research" visible and puts only its links behind the lock', () => {
    const research = parts.filter((part) => part.path.endsWith('/research.md'));
    expect(research).toHaveLength(2);
    for (const part of research) {
      expect(part.open).toContain('TypeScript');
      expect(part.locked).toContain('TODO(launch)');
    }
    // The links render inside the mark only when unlocked, so a locked build cannot carry them.
    expect(homeSection).toMatch(/unlocked && parts\.locked\.length > 0 && \(\s*<div class="research__more" data-research-links>/);
  });

  it('requires the research links on both home pages once unlocked', () => {
    for (const page of Object.keys(HOME_PAGES)) expect(UNLOCKED_PAGES[page as keyof typeof UNLOCKED_PAGES]).toContain('data-research-links');
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

  it('counts the status sentence where it stands alone, across line breaks and case', () => {
    const sentence = en['manuscript.status.in-preparation'];
    expect(countStandalone('<p class="stamp">A manuscript is in preparation.</p><p class="act__status">\n A manuscript\n is in PREPARATION.</p>', sentence)).toBe(2);
    expect(countStandalone('<p>Nothing to see.</p>', sentence)).toBe(0);
    expect(() => countStandalone('<p>text</p>', ' ')).toThrow();
  });

  it('does not count the same words inside a sentence of prose (/how-its-built)', () => {
    const prose = '<p>Part of the site stays closed until the manuscript is under review. While it is closed…</p>';
    expect(countStandalone(prose, en['manuscript.status.under-review'])).toBe(0);
  });

  describe('the status sentence (rule (b), ADR 0026)', () => {
    const dictionaries = { en, es };
    const page = (sentence: string, times: number) => `<main>${`<p>${sentence}</p>`.repeat(times)}</main>`;
    const home = (status: 'in-preparation' | 'under-review', times = STATUS_ON_HOME) => ({
      'index.html': page(en[`manuscript.status.${status}`], times),
      'es/index.html': page(es[`manuscript.status.${status}`], times),
      'finding/index.html': page(en[`manuscript.status.${status}`], 1),
    });

    it('passes with act 5 alone on each home page while the film lands, in both states', () => {
      expect(STATUS_ON_HOME).toBe(1);
      expect(statusProblems('in-preparation', dictionaries, home('in-preparation'))).toEqual([]);
      expect(statusProblems('under-review', dictionaries, home('under-review'))).toEqual([]);
    });

    it('fails when the sentence is missing, or appears twice', () => {
      expect(statusProblems('in-preparation', dictionaries, home('in-preparation', 0))).toHaveLength(2);
      expect(statusProblems('in-preparation', dictionaries, home('in-preparation', 2))[0]).toMatch(/appears 2 times, not 1/);
    });

    it('fails when the inactive sentence ships anywhere', () => {
      const pages = { ...home('in-preparation'), 'vanberg/index.html': page(es['manuscript.status.under-review'], 1) };
      expect(statusProblems('in-preparation', dictionaries, pages)).toEqual([
        "vanberg/index.html: carries the 'under-review' sentence while the status is 'in-preparation'",
      ]);
    });

    it('fails when a home page is missing', () => {
      const { 'es/index.html': _gone, ...pages } = home('in-preparation');
      expect(statusProblems('in-preparation', dictionaries, pages)).toEqual(['es/index.html: missing']);
    });
  });

  it('reads the manuscript status from src/config.ts', () => {
    expect(['in-preparation', 'under-review']).toContain(readStatus(config));
    expect(readStatus("export const MANUSCRIPT_STATUS: 'in-preparation' | 'under-review' = 'under-review';")).toBe('under-review');
    expect(() => readStatus('export const OTHER = 1;')).toThrow();
  });
});
