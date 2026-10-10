import { describe, expect, it } from 'vitest';
import en from '../i18n/en.json';
import es from '../i18n/es.json';
import finding from '../components/film/chapters/Finding.astro?raw';
import realPeople from '../components/film/chapters/RealPeople.astro?raw';
import twoRooms from '../components/film/chapters/TwoRooms.astro?raw';
import notebookComponent from '../components/notebook/Notebook.astro?raw';
import notebookScript from '../components/notebook/notebook.ts?raw';
import notebookFooter from '../components/notebook/NotebookFooter.astro?raw';
import { CHAPTER_IDS, LOCKED_BEATS, OPEN_CHAPTERS, type ChapterId } from './chapters';
import { linkable, MAGNIFIERS, magnifierOn, NOTEBOOK, NOTEBOOK_PAGES_ID, notebookPage } from './notebook';
import { SUBPAGES } from './routes';

const dictionaries = { en, es } as const;

describe('the notebook (ADR 0024)', () => {
  it('has the six pages of ADR 0024, in the order of the routes', () => {
    expect(NOTEBOOK.map((entry) => entry.page)).toEqual(['dilemma', 'vanberg', 'finding', 'how-its-built', 'sources', 'about']);
    expect(NOTEBOOK.map((entry) => entry.page)).toEqual([...SUBPAGES]);
    for (const page of SUBPAGES) expect(notebookPage(page).page).toBe(page);
  });

  it('gives every entry a title and a line on what it holds, in both languages; the finding, its status sentence instead', () => {
    for (const dictionary of Object.values(dictionaries)) {
      const titles = NOTEBOOK.map((entry) => dictionary[entry.titleKey]);
      expect(new Set(titles).size).toBe(NOTEBOOK.length);
      for (const entry of NOTEBOOK) {
        if (entry.page === 'finding') expect(entry.lineKey).toBeNull();
        else expect(entry.lineKey && dictionary[entry.lineKey]).toBeTruthy();
      }
    }
  });

  it('leads each page back to the chapter it deepens, in the film’s order; the pages of the whole film to none', () => {
    const films = NOTEBOOK.map((entry) => entry.film);
    expect(films).toEqual(['two-rooms', 'real-people', 'my-research', 'closing', null, null]);
    const order = films.filter((id): id is ChapterId => id !== null).map((id) => CHAPTER_IDS.indexOf(id));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('links to /finding only behind the lock (ADR 0034)', () => {
    expect(linkable(true).map((entry) => entry.page)).toEqual([...SUBPAGES]);
    expect(linkable(false).map((entry) => entry.page)).toEqual(SUBPAGES.filter((page) => page !== 'finding'));
  });
});

describe('the magnifiers (ADR 0024)', () => {
  it('sit on cards the film has, at most one on a card and one per page', () => {
    for (const m of MAGNIFIERS) {
      const beats = m.page === 'finding' ? LOCKED_BEATS : (OPEN_CHAPTERS.find((c) => c.id === m.chapter)?.beats ?? []);
      expect(beats.map((b) => b.id), `${m.chapter}/${m.beat}`).toContain(m.beat);
      expect(magnifierOn(m.chapter, m.beat)).toBe(m);
    }
    expect(new Set(MAGNIFIERS.map((m) => `${m.chapter}/${m.beat}`)).size).toBe(MAGNIFIERS.length);
    expect(new Set(MAGNIFIERS.map((m) => m.page)).size).toBe(MAGNIFIERS.length);
  });

  it("open each page from the chapter it deepens, and the finding's from the last card of chapter 7's finding", () => {
    for (const m of MAGNIFIERS) expect(m.chapter).toBe(notebookPage(m.page).film);
    const last = LOCKED_BEATS.at(-1)?.id;
    expect(MAGNIFIERS.find((m) => m.page === 'finding')).toEqual({ page: 'finding', chapter: 'my-research', beat: last });
  });

  it('are placed in the chapters on the cards the list names, and nowhere else', () => {
    const placed = (source: string) => [...source.matchAll(/<Magnifier locale=\{locale\} chapter="([a-z-]+)" beat=(?:"([a-z-]+)"|\{b\.id\})/g)].map((m) => [m[1], m[2] ?? 'last']);
    expect(placed(twoRooms)).toEqual([['two-rooms', 'trap']]);
    expect(placed(realPeople)).toEqual([['real-people', 'expected']]);
    // Chapter 7's finding puts it on its last card only; that component exists only behind the lock.
    expect(placed(finding)).toEqual([['my-research', 'last']]);
    // There it is drawn as a button, like the cover's «Start» (P9, E6).
    expect(finding).toMatch(/\{b\.id === last && <Magnifier locale=\{locale\} chapter="my-research" beat=\{b\.id\} button \/>\}/);
  });
});

describe("the notebook's panel (ADR 0024)", () => {
  it('is a native modal dialog, opened by a button that says it opens one and controls it', () => {
    expect(notebookComponent).toMatch(/<dialog id="notebook" class="notebook" aria-labelledby="notebook-title" data-notebook>/);
    expect(notebookComponent).toMatch(/<button type="button"[^>]*aria-haspopup="dialog" aria-controls="notebook" aria-expanded="false" hidden data-notebook-open>/);
    expect(notebookScript).toContain('dialog.showModal();');
  });

  it('gives the focus back to the button whenever it closes: Esc, its close button or the backdrop', () => {
    expect(notebookScript).toMatch(/dialog\.addEventListener\('close', \(\) => \{\s*button\.setAttribute\('aria-expanded', 'false'\);\s*button\.focus\(\);/);
    expect(notebookScript).toContain("dialog.querySelector('[data-notebook-close]')?.addEventListener('click', () => dialog.close());");
    expect(notebookScript).toMatch(/if \(event\.target === dialog\) dialog\.close\(\);/);
    // Focus starts on the close button, the first thing in the panel.
    expect(notebookComponent).toMatch(/<button type="button" class="notebook__close" autofocus data-notebook-close>/);
  });

  it('falls back, without JavaScript or <dialog>, to a link to the footer’s list of the notebook', () => {
    expect(notebookComponent).toContain('href={`#${NOTEBOOK_PAGES_ID}`} data-notebook-link');
    expect(notebookFooter).toContain('<nav id={NOTEBOOK_PAGES_ID}');
    expect(NOTEBOOK_PAGES_ID).toMatch(/^[a-z-]+$/);
    expect(notebookScript).toContain("if (!dialog || !button || typeof dialog.showModal !== 'function') return;");
  });

  it('marks the page you are on, in the panel and in the footer', () => {
    expect(notebookComponent).toContain("const current = entry.page === route ? 'page' : undefined;");
    expect(notebookFooter).toContain("aria-current={entry.page === route ? 'page' : undefined}");
  });
});
