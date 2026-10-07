import { describe, expect, it } from 'vitest';
import astroConfig from '../astro.config.mjs?raw';
import config from '../src/config.ts?raw';
import curveComponent from '../src/components/curve/Curve.astro?raw';
import curveController from '../src/components/curve/controller.ts?raw';
import curveStub from '../src/components/curve/Locked.astro?raw';
import guiltChart from '../src/components/curve/GuiltChart.astro?raw';
import filmComponent from '../src/components/film/Film.astro?raw';
import findingComponent from '../src/components/film/chapters/Finding.astro?raw';
import myResearch from '../src/components/film/chapters/MyResearch.astro?raw';
import closingComponent from '../src/components/film/chapters/Closing.astro?raw';
import engineComponent from '../src/components/film/Engine.astro?raw';
import worldComponent from '../src/components/film/World.astro?raw';
import magnifier from '../src/components/film/Magnifier.astro?raw';
import twoRooms from '../src/components/film/chapters/TwoRooms.astro?raw';
import realPeople from '../src/components/film/chapters/RealPeople.astro?raw';
import notebook from '../src/components/notebook/Notebook.astro?raw';
import paperStatus from '../src/components/PaperStatus.astro?raw';
import notebookScript from '../src/components/notebook/notebook.ts?raw';
import notebookFooter from '../src/components/notebook/NotebookFooter.astro?raw';
import sourcesComponent from '../src/components/notebook/Sources.astro?raw';
import vignette from '../src/components/notebook/Vignette.astro?raw';
import day from '../src/components/notebook/Day.astro?raw';
import author from '../src/components/notebook/Author.astro?raw';
import baseLayout from '../src/layouts/BaseLayout.astro?raw';
import chapterEn from '../src/content/chapters/en/07-my-research.md?raw';
import chapterEs from '../src/content/chapters/es/07-my-research.md?raw';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';
import findingBeats from '../src/lib/film/finding.ts?raw';
import findingStub from '../src/lib/film/finding.locked.ts?raw';
import { FINDING_BEATS as STUBBED } from '../src/lib/film/finding.locked';
import homeView from '../src/views/HomeView.astro?raw';
import subpageView from '../src/views/SubpageView.astro?raw';
import { LOCKED_BEATS } from '../src/lib/chapters';
import { splitAtLock } from '../src/lib/film/captions';
import { slotsIn, splitSubpage } from '../src/lib/subpages';
import { worksOf } from '../src/lib/sources';
import {
  countStandalone,
  descriptionProblems,
  descriptionsOf,
  FINDING_PAGES,
  findingLinks,
  findMarks,
  HOME_PAGES,
  isNoindex,
  isPendingLink,
  linksTo,
  lockedLinkProblems,
  lockedMarks,
  MARKERS,
  noindexProblems,
  NOT_FOUND_PAGE,
  readPaper,
  STATUS_ON_HOME,
  statusProblems,
  statusSentence,
  UNLOCKED_MARKERS,
  UNLOCKED_PAGES,
  withoutInlineTags,
} from '../scripts/verify-dist.mjs';
import { WORKING_PAPER } from '../src/config';
import { findingUnlocked, isPending } from '../src/lib/lock';

/** The working paper while its link is a placeholder (the lock closed), and once it is real (open). */
const LOCKED = { title: WORKING_PAPER.title, ssrn: 'SSRN_URL_PENDING' };
const OPEN = { title: WORKING_PAPER.title, ssrn: 'https://ssrn.com/abstract=1' };

const subpages = import.meta.glob('../src/content/subpages/*/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/** Each subpage's Markdown, split at its lock marker (src/lib/subpages.ts). */
const parts = Object.entries(subpages).map(([path, raw]) => {
  const { open, locked } = splitSubpage(raw.replace(/^---[\s\S]*?---/, ''));
  const text = (segments: typeof open) => segments.map((segment) => (segment.kind === 'html' ? segment.html : '')).join('\n');
  return { path, open: text(open), locked: text(locked) };
});

/** Chapter 7's captions, split at the lock mark (ADR 0026). */
const seventh = [chapterEn, chapterEs].map((raw) => splitAtLock(raw.replace(/^---[\s\S]*?---/, '')));

/** UI strings only the locked components use: the curve's, and those of chapter 7's finding. */
const isLockedKey = (key: string) => key.startsWith('curve.') || key.startsWith('film.finding.');
const keys = (dictionary: Record<string, string>, locked: boolean) =>
  Object.entries(dictionary)
    .filter(([key]) => isLockedKey(key) === locked)
    .map(([, value]) => value)
    .join('\n');

// What the lock covers once open: chapter 7's finding, the curve and its control, /finding and its
// guilt chart, the engine part of /how-its-built, and the engine's links, whose repository is in
// src/config.ts (ADR 0034).
const lockedSources = [
  ...seventh.map((part) => part.locked),
  keys(en, true),
  keys(es, true),
  curveComponent,
  guiltChart,
  curveController,
  findingComponent,
  findingBeats,
  subpageView,
  ...parts.map((part) => part.locked),
  config,
].join('\n');

// What renders in both states: chapter 7's question, engine and envelope, the film around them (chapter
// 8's credits and the magnifiers too), the home, the notebook's panel, footer and pages, and every
// other UI string.
const openSources = {
  'chapter 7, open part (en)': seventh[0]?.open ?? '',
  'chapter 7, open part (es)': seventh[1]?.open ?? '',
  'MyResearch.astro': myResearch,
  'Film.astro': filmComponent,
  'World.astro': worldComponent,
  'Engine.astro': engineComponent,
  'Closing.astro': closingComponent,
  'HomeView.astro': homeView,
  'Magnifier.astro': magnifier,
  'TwoRooms.astro': twoRooms,
  'RealPeople.astro': realPeople,
  'Notebook.astro': notebook,
  'notebook.ts': notebookScript,
  'NotebookFooter.astro': notebookFooter,
  'Sources.astro': sourcesComponent,
  'Vignette.astro': vignette,
  'Day.astro': day,
  'Author.astro': author,
  'BaseLayout.astro': baseLayout,
  // /sources' open part: the references of its works, and the works themselves.
  'the works of /sources': worksOf().map((group) => JSON.stringify(group)).join('\n'),
  'the open UI strings (en)': keys(en, false),
  'the open UI strings (es)': keys(es, false),
};

describe('verify:dist (ADR 0026)', () => {
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

  it.each(Object.entries(openSources))("%s carries none of the lock's marks", (_name, source) => {
    expect(findMarks(source)).toEqual([]);
  });

  it('puts all of /finding and the engine of /how-its-built behind the lock, and nothing of /sources', () => {
    for (const part of parts) {
      if (part.path.endsWith('/finding.md')) expect(part.open.trim()).toBe('');
      if (part.path.endsWith('/how-its-built.md')) expect(findMarks(part.locked).length).toBeGreaterThan(0);
      if (/\/(dilemma|vanberg|sources|about)\.md$/.test(part.path)) expect(part.locked).toBe('');
    }
    // /sources has no lock (ADR 0024): it looks the same in both states, so it lists none of the finding's sources.
    for (const [path, raw] of Object.entries(subpages).filter(([path]) => path.endsWith('/sources.md'))) {
      const split = splitSubpage(raw.replace(/^---[\s\S]*?---/, ''));
      expect(slotsIn(split.open), path).toEqual(['sources']);
      expect(split.locked, path).toEqual([]);
    }
    expect(sourcesComponent).not.toMatch(/findingUnlocked\(|unlocked \?/);
  });

  it("puts chapter 7's finding behind the lock, in the component a locked build does not have", () => {
    for (const part of seventh) expect(findMarks(part.locked).length).toBeGreaterThan(0);
    // The finding renders inside its marks, and chapter 7 renders it only with the lock open.
    expect(findingComponent).toMatch(/<div class="finding" data-locked-content data-finding>/);
    expect(myResearch).toMatch(/\{unlocked && <Finding locale=\{locale\} captions=\{locked\} \/>\}/);
    // The finding's first beat is a mark: only a timeline with the lock open names it.
    expect(LOCKED_BEATS[0]?.id).toBe('third-reason');
  });

  it('requires chapter 7’s finding on both home pages once unlocked', () => {
    for (const page of Object.keys(HOME_PAGES)) {
      expect(UNLOCKED_PAGES[page as keyof typeof UNLOCKED_PAGES]).toEqual(expect.arrayContaining(['data-finding', 'finding-curve', 'third-reason']));
    }
  });

  it('stubs every locked module in a locked build, with a stub that carries nothing', () => {
    const map = /const LOCKED_MODULES = \{([\s\S]*?)\};/.exec(astroConfig)?.[1] ?? '';
    const pairs = [...map.matchAll(/'([^']+)':\s*'([^']+)'/g)].map((m) => [m[1], m[2]]);
    expect(pairs).toEqual([
      ['/src/components/curve/Curve.astro', '/src/components/curve/Locked.astro'],
      ['/src/components/curve/GuiltChart.astro', '/src/components/curve/Locked.astro'],
      ['/src/components/film/chapters/Finding.astro', '/src/components/curve/Locked.astro'],
      ['/src/lib/film/finding.ts', '/src/lib/film/finding.locked.ts'],
    ]);
    // The component stub is only its frontmatter; the timeline stub knows no beats.
    expect(curveStub.replace(/^---[\s\S]*?---/, '').trim()).toBe('');
    expect(STUBBED).toEqual([]);
    expect(findMarks(curveStub + findingStub)).toEqual([]);
  });

  it('matches across line breaks and case', () => {
    expect(findMarks('<p>…from Kawagoe and\nNarita. Personal\n  guilt weighs…</p>')).toEqual(['Kawagoe', 'personal guilt']);
  });

  it("finds nothing in chapter 7's envelope and /finding as they render while locked", () => {
    const stamp = (dictionary: Record<string, string>) =>
      dictionary['paper.status']?.replace('{title}', `<a href="${LOCKED.ssrn}"><cite>${WORKING_PAPER.title}</cite></a>`);
    const envelope = `<section id="my-research" class="chapter"><h2 id="my-research-title" class="card__chapter">${en['film.chapter']} · ${en['notebook.finding.title']}</h2><div class="envelope" data-envelope><p class="envelope__stamp">${stamp(en)}</p></div></section>`;
    const envelopeEs = `<div class="envelope" data-envelope><p class="envelope__stamp">${stamp(es)}</p></div>`;
    const subpage = `<article class="subpage"><h1 id="subpage-title">${en['notebook.finding.title']}</h1><p class="subpage__status">${stamp(en)}</p></article>`;
    expect(lockedMarks(envelope + envelopeEs + subpage, WORKING_PAPER.title)).toEqual([]);
  });

  it("leaves the working paper's title out of the search, and only the title (ADR 0034)", () => {
    // The title names two of the finding's reasons; it is part of the status sentence, seen in both states.
    expect(findMarks(WORKING_PAPER.title)).toEqual(['personal guilt', 'partner-specific commitment']);
    expect(lockedMarks(`<p>${WORKING_PAPER.title.toUpperCase()}</p>`, WORKING_PAPER.title)).toEqual([]);
    expect(lockedMarks(`<p>${WORKING_PAPER.title}</p><p>Personal guilt rolls in the middle.</p>`, WORKING_PAPER.title)).toEqual(['personal guilt']);
    expect(() => lockedMarks('<p>text</p>', ' ')).toThrow();
  });

  it('counts the status sentence where it stands alone, its link and italics included, across line breaks and case', () => {
    const sentence = statusSentence(en, 'A Title');
    expect(sentence).toBe('Working paper: A Title (SSRN).');
    expect(countStandalone('<p class="stamp">Working paper: <a href="x"><cite>A Title</cite></a> (SSRN).</p><p class="subpage__status">\n Working\n paper: A TITLE (SSRN).</p>', sentence)).toBe(2);
    expect(countStandalone('<p>Nothing to see.</p>', sentence)).toBe(0);
    expect(() => countStandalone('<p>text</p>', ' ')).toThrow();
    expect(withoutInlineTags('<p class="a">x <a href="y" class="z"><cite>t</cite></a> <em>e</em></p>')).toBe('<p class="a">x t e</p>');
  });

  it('does not count the same words inside a sentence of prose', () => {
    const sentence = statusSentence(es, 'Un título');
    expect(countStandalone(`<p>Según el texto, ${sentence} Y sigue…</p>`, sentence)).toBe(0);
  });

  it('reads the working paper from src/config.ts, and the lock from its link, as src/lib/lock.ts does', () => {
    expect(readPaper(config)).toEqual({ title: WORKING_PAPER.title, ssrn: WORKING_PAPER.ssrn });
    expect(readPaper("export const WORKING_PAPER = {\n  title: 'T',\n  ssrn: 'https://ssrn.com/abstract=1',\n} as const;")).toEqual({ title: 'T', ssrn: OPEN.ssrn });
    expect(() => readPaper('export const OTHER = 1;')).toThrow();
    for (const link of [LOCKED.ssrn, OPEN.ssrn, 'ENGINE_DOI_PENDING', WORKING_PAPER.ssrn]) {
      expect(isPendingLink(link)).toBe(isPending(link));
      expect(isPendingLink(link)).toBe(!findingUnlocked(link, false));
    }
  });

  describe('the status sentence (rule (b), ADR 0034)', () => {
    const dictionaries = { en, es };
    const page = (dictionary: Record<string, string>, times: number, ssrn: string) =>
      `<main>${`<p>${dictionary['paper.status']?.replace('{title}', `<a href="${ssrn}"><cite>${WORKING_PAPER.title}</cite></a>`)}</p>`.repeat(times)}</main>`;
    const home = (paper = LOCKED, times = STATUS_ON_HOME) => ({
      'index.html': page(en, times, paper.ssrn),
      'es/index.html': page(es, times, paper.ssrn),
      'finding/index.html': page(en, 1, paper.ssrn),
    });

    it("passes with chapter 7's stamp and the notebook's entry on each home page, in both states", () => {
      expect(STATUS_ON_HOME).toBe(2);
      expect(statusProblems(LOCKED, dictionaries, home(LOCKED))).toEqual([]);
      expect(statusProblems(OPEN, dictionaries, home(OPEN))).toEqual([]);
    });

    it('renders the sentence in one component, the same in both states', () => {
      expect(paperStatus).toContain('{before}<a href={WORKING_PAPER.ssrn}><cite>{WORKING_PAPER.title}</cite></a>{after}');
      expect(paperStatus).not.toMatch(/unlocked|findingUnlocked/);
    });

    it('stamps the envelope with the status sentence, standing alone, and nowhere else in chapter 7', () => {
      expect(myResearch).toMatch(/<p class="envelope__stamp"><PaperStatus locale=\{locale\} \/><\/p>/);
      expect(myResearch.match(/<PaperStatus /g)).toHaveLength(1);
    });

    it("gives the notebook's panel the entry for the finding: its title and the sentence, standing alone", () => {
      expect(notebook).toMatch(/<span class="notebook__status"><PaperStatus locale=\{locale\} \/><\/span>/);
      expect(notebook.match(/<PaperStatus /g)).toHaveLength(1);
      // The entry links to /finding only behind the lock; closed, its title is plain text.
      expect(notebook).toContain('{unlocked ? anchor : title}');
      expect(notebook).toMatch(/const title = \(\s*<span class="notebook__name"/);
      expect(notebook).toContain('const unlocked = findingUnlocked(WORKING_PAPER.ssrn, import.meta.env.DEV);');
      // The engine's links (src/lib/engine.ts), only behind the lock.
      expect(notebook).toMatch(/\{unlocked && \(\s*<span class="notebook__line">\s*\{tr\('notebook\.engine'\)\} <Fragment set:html=\{engineLinks\(\)\} \/>/);
      expect(notebook.match(/engineLinks\(\)/g)).toHaveLength(1);
    });

    it('keeps the status sentence off the footer and the rest of the page, so the home says it twice', () => {
      for (const source of [notebookFooter, baseLayout, sourcesComponent, magnifier]) {
        expect(source).not.toMatch(/PaperStatus|paper\.status/);
      }
      // The panel is in the layout once, on every page: one entry for the finding per page.
      expect(baseLayout.match(/<Notebook /g)).toHaveLength(1);
      expect(baseLayout.match(/<NotebookFooter /g)).toHaveLength(1);
    });

    it('leaves /finding out of the footer while the lock is closed, as out of the credits', () => {
      expect(notebookFooter).toContain('const pages = linkable(findingUnlocked(WORKING_PAPER.ssrn, import.meta.env.DEV));');
      expect(closingComponent).toContain('const pages = creditPages(findingUnlocked(WORKING_PAPER.ssrn, import.meta.env.DEV));');
    });

    it('fails when the sentence is missing, appears once, or three times', () => {
      expect(statusProblems(LOCKED, dictionaries, home(LOCKED, 0))).toHaveLength(4);
      expect(statusProblems(LOCKED, dictionaries, home(LOCKED, 1))[0]).toMatch(/appears 1 times, not 2/);
      expect(statusProblems(LOCKED, dictionaries, home(LOCKED, 3))[0]).toMatch(/appears 3 times, not 2/);
    });

    it('fails when the sentence does not link to the working paper', () => {
      expect(linksTo('<a href="SSRN_URL_PENDING">x</a><a class="b" href="https://ssrn.com/abstract=1?a=1&amp;b=2">y</a>', 'https://ssrn.com/abstract=1?a=1&b=2')).toBe(1);
      expect(statusProblems(OPEN, dictionaries, home(LOCKED))).toEqual([
        'index.html: links to the working paper 0 times, not 2',
        'es/index.html: links to the working paper 0 times, not 2',
      ]);
    });

    it('fails when a home page is missing', () => {
      const { 'es/index.html': _gone, ...pages } = home();
      expect(statusProblems(LOCKED, dictionaries, pages)).toEqual(['es/index.html: missing']);
    });
  });

  describe('links to /finding while locked (ADR 0026)', () => {
    const base = '/why-keep-a-promise/';
    const link = (path: string, attributes = '') => `<a${attributes} href="${base}${path}">x</a>`;

    it('counts links to /finding in either language, with any attributes, and nothing else', () => {
      expect(findingLinks(link('finding/') + link('es/finding/', ' class="a" data-astro-cid-x') + link('finding/#top'))).toBe(3);
      expect(findingLinks(link('vanberg/') + '<link rel="canonical" href="https://x.io/why-keep-a-promise/finding/">')).toBe(0);
    });

    it('lets only /finding link to itself (its language switch)', () => {
      expect(FINDING_PAGES).toEqual(['finding/index.html', 'es/finding/index.html']);
      const pages = {
        'index.html': link('dilemma/'),
        'finding/index.html': link('es/finding/'),
        'es/finding/index.html': link('finding/'),
      };
      expect(lockedLinkProblems(pages)).toEqual([]);
    });

    it('fails when any other page links to /finding', () => {
      const pages = { 'index.html': link('finding/') + link('finding/'), 'es/vanberg/index.html': link('es/finding/') };
      expect(lockedLinkProblems(pages)).toEqual(['index.html: links to /finding 2 times', 'es/vanberg/index.html: links to /finding once']);
    });
  });

  describe('the descriptions (src/lib/meta.ts)', () => {
    const dictionaries = { en, es };
    const head = (name: string | null, og: string | null = name) =>
      `<head>${name === null ? '' : `<meta name="description" content="${name}">`}${og === null ? '' : `<meta property="og:description" content="${og}">`}</head>`;

    it('reads a description and its Open Graph copy, entities decoded', () => {
      expect(descriptionsOf(head('Why &amp; how &quot;it&quot; works &#8212; 2008'))).toEqual({ name: 'Why & how "it" works — 2008', og: 'Why & how "it" works — 2008' });
      expect(descriptionsOf('<head></head>')).toEqual({ name: null, og: null });
    });

    it('passes pages that each carry their own, the same twice', () => {
      const pages = { 'index.html': head(en['site.description']), 'finding/index.html': head(en['site.title']) };
      expect(descriptionProblems(LOCKED, dictionaries, pages)).toEqual([]);
    });

    it('leaves out the 404 page, which nothing indexes', () => {
      expect(NOT_FOUND_PAGE).toBe('404.html');
      expect(descriptionProblems(LOCKED, dictionaries, { '404.html': '<head></head>' })).toEqual([]);
    });

    it('fails a page without one, an empty one, or one Open Graph does not repeat', () => {
      const pages = { 'index.html': head(null), 'dilemma/index.html': head(' '), 'vanberg/index.html': head('A', 'B'), 'about/index.html': head('A', null) };
      expect(descriptionProblems(LOCKED, dictionaries, pages)).toEqual([
        'index.html: no description',
        'dilemma/index.html: no description',
        'vanberg/index.html: og:description is not its description',
        'about/index.html: og:description is not its description',
      ]);
    });

    it('fails a description with the status sentence, in either state and language (rule (b))', () => {
      const pages = { 'finding/index.html': head(statusSentence(es, WORKING_PAPER.title)), 'es/finding/index.html': head(`¿Por qué? ${statusSentence(en, WORKING_PAPER.title)}`) };
      for (const paper of [LOCKED, OPEN]) {
        expect(descriptionProblems(paper, dictionaries, pages)).toEqual([
          'finding/index.html: the description repeats the status sentence',
          'es/finding/index.html: the description repeats the status sentence',
        ]);
      }
    });

    it('fails a description that carries a mark of the locked content, only while locked', () => {
      const pages = { 'finding/index.html': head('On personal guilt and background trust') };
      expect(descriptionProblems(LOCKED, dictionaries, pages)).toEqual([
        'finding/index.html: the description carries locked content: personal guilt',
        'finding/index.html: the description carries locked content: background trust',
      ]);
      expect(descriptionProblems(OPEN, dictionaries, pages)).toEqual([]);
    });
  });

  describe('noindex on /finding (point 13 of the external review)', () => {
    const tag = '<meta name="robots" content="noindex">';
    const site = (finding: boolean, extra: Record<string, string> = {}) => ({
      'index.html': '<head></head>',
      'finding/index.html': finding ? tag : '<head></head>',
      'es/finding/index.html': finding ? tag : '<head></head>',
      '404.html': tag,
      ...extra,
    });

    it('reads the robots tag', () => {
      expect(isNoindex(tag)).toBe(true);
      expect(isNoindex('<meta name="robots" content="noindex, nofollow">')).toBe(true);
      expect(isNoindex('<meta name="description" content="noindex">')).toBe(false);
    });

    it('wants /finding hidden while locked and indexed once open; the 404 page always hidden', () => {
      expect(noindexProblems(true, site(true))).toEqual([]);
      expect(noindexProblems(false, site(false))).toEqual([]);
    });

    it('fails /finding indexed while locked, or hidden once open', () => {
      expect(noindexProblems(true, site(false))).toEqual([
        "finding/index.html: no noindex while the lock is closed",
        "es/finding/index.html: no noindex while the lock is closed",
      ]);
      expect(noindexProblems(false, site(true))).toEqual([
        "finding/index.html: noindex while the lock is open",
        "es/finding/index.html: noindex while the lock is open",
      ]);
    });

    it('fails any other page that asks not to be indexed, and a 404 page that does not', () => {
      expect(noindexProblems(true, site(true, { 'vanberg/index.html': tag, '404.html': '<head></head>' }))).toEqual([
        "404.html: no noindex while the lock is closed",
        "vanberg/index.html: noindex while the lock is closed",
      ]);
    });

    it('sets it in the layout by the lock, on /finding only', () => {
      expect(baseLayout).toContain("const noindex = route === 'finding' && !findingUnlocked(WORKING_PAPER.ssrn, import.meta.env.DEV);");
      expect(baseLayout).toContain('{noindex && <meta name="robots" content="noindex" />}');
    });
  });
});
