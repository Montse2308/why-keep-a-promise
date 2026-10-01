/**
 * The notebook (ADR 0024): the six pages of depth, one tap from anywhere. The panel, the footer of
 * every page and chapter 8's credits list them in this order; the film's magnifiers open the one
 * that deepens the moment they stand in. /finding is locked whole (ADR 0026): while the lock is
 * closed nothing links to it, and its entry shows its title and the status sentence.
 */
import type { ChapterId } from './chapters';
import type { UiKey } from './i18n';
import { SUBPAGES, type Subpage } from './routes';

export interface NotebookPage {
  readonly page: Subpage;
  readonly titleKey: UiKey;
  /**
   * One line on what the page holds, under its title in the panel. The finding's entry has none: it
   * shows the status sentence instead, in both states of the lock (ADR 0026).
   */
  readonly lineKey: UiKey | null;
  /** The film's chapter the page deepens, which its back link leads to; none for a page of the whole film. */
  readonly film: ChapterId | null;
}

export const NOTEBOOK: readonly NotebookPage[] = [
  { page: 'dilemma', titleKey: 'notebook.dilemma.title', lineKey: 'notebook.dilemma.line', film: 'two-rooms' },
  { page: 'vanberg', titleKey: 'notebook.vanberg.title', lineKey: 'notebook.vanberg.line', film: 'real-people' },
  { page: 'finding', titleKey: 'notebook.finding.title', lineKey: null, film: 'my-research' },
  { page: 'how-its-built', titleKey: 'notebook.how-its-built.title', lineKey: 'notebook.how-its-built.line', film: 'closing' },
  { page: 'sources', titleKey: 'notebook.sources.title', lineKey: 'notebook.sources.line', film: null },
  { page: 'about', titleKey: 'notebook.about.title', lineKey: 'notebook.about.line', film: null },
];

export function notebookPage(page: Subpage): NotebookPage {
  const found = NOTEBOOK.find((entry) => entry.page === page);
  if (!found) throw new Error(`No notebook page "${page}"`);
  return found;
}

/** The pages anything may link to in this state of the lock: /finding only behind it (ADR 0026). */
export function linkable(unlocked: boolean): readonly NotebookPage[] {
  return NOTEBOOK.filter((entry) => unlocked || entry.page !== 'finding');
}

/** The id of the footer's list of the notebook's pages: where the button leads without JavaScript. */
export const NOTEBOOK_PAGES_ID = 'notebook-pages';

/**
 * The magnifiers (ADR 0024): a small link on a card of the film, where curiosity is born, to the
 * page that goes deeper. The finding's sits on the last card of chapter 7's finding, so it exists
 * only behind the lock, as that card does.
 */
export interface Magnifier {
  readonly page: Subpage;
  readonly chapter: ChapterId;
  readonly beat: string;
}

export const MAGNIFIERS: readonly Magnifier[] = [
  { page: 'dilemma', chapter: 'two-rooms', beat: 'trap' },
  { page: 'vanberg', chapter: 'real-people', beat: 'expected' },
  { page: 'finding', chapter: 'my-research', beat: 'chance' },
];

/** The magnifier on a beat, if it has one. */
export function magnifierOn(chapter: ChapterId, beat: string): Magnifier | undefined {
  return MAGNIFIERS.find((m) => m.chapter === chapter && m.beat === beat);
}

// The notebook lists the routes' pages, in their order: a page added to one must be added to the other.
if (NOTEBOOK.map((entry) => entry.page).join() !== SUBPAGES.join()) throw new Error('The notebook and SUBPAGES list different pages');
