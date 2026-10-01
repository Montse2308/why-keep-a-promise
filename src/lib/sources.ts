/**
 * /sources (ADR 0024): every figure on the page, with its full reference and where it is used. It
 * is built from the register of figures (src/content/figures.ts): each entry is one of its source
 * keys, under the work it comes from, with the figures the register gives that key, in the register's
 * order. docs/sources.md is where each one was verified; this is what the visitor reads.
 *
 * /sources has no lock (ADR 0024), and what the lock does not cover looks the same in both of its
 * states (ADR 0026). So it lists the sources of what shows in both, and none of the finding's: those
 * are cited where the finding uses them, in chapter 7 and on /finding, behind the lock (`FINDING`).
 */
import { CITATIONS, FIGURES, SOURCE_KEYS, type SourceKey } from '../content/figures';
import type { ChapterId } from './chapters';
import type { UiKey } from './i18n';
import type { Subpage } from './routes';

/** A place where a figure is used: a chapter of the film, or a page of the notebook. */
export type Place = { readonly chapter: ChapterId } | { readonly page: Subpage };

export type WorkId = 'axelrod-1984' | 'case-2017' | 'vanberg-2008' | 'charness-dufwenberg-2006' | 'battigalli-dufwenberg-2007';

export interface Link {
  /** As a bibliography writes it; `*…*` marks the italics of a title. */
  readonly text: string;
  readonly url?: string;
}

export interface Work {
  readonly id: WorkId;
  /** How the prose cites it: "Author (year)". */
  readonly cite: string;
  /** The full reference, the same in both languages, as any bibliography's. */
  readonly reference: Link;
  /** What else of the work was used: Vanberg's (2008) supplementary material. */
  readonly parts?: readonly Link[];
}

export const WORKS: readonly Work[] = [
  {
    id: 'axelrod-1984',
    cite: 'Axelrod (1984)',
    reference: { text: 'Axelrod, R. (1984). *The Evolution of Cooperation*. Basic Books.' },
  },
  {
    id: 'case-2017',
    cite: 'Case (2017)',
    reference: { text: 'Case, N. (2017). *The Evolution of Trust*.', url: 'https://ncase.me/trust/' },
  },
  {
    id: 'vanberg-2008',
    cite: 'Vanberg (2008)',
    reference: { text: 'Vanberg, C. (2008). Why do people keep their promises? An experimental test of two explanations. *Econometrica*, 76(6), 1467–1480.' },
    parts: [
      { text: 'Supplement A: Appendix C, Translation of Instructions.', url: 'https://doi.org/10.3982/ECTA7673SUPPA' },
      { text: 'Supplement B: Appendix D, Translation of z-Tree Screens.', url: 'https://doi.org/10.3982/ECTA7673SUPPB' },
      { text: 'Supplement: data and programs (switch.dat, baseline.dat, promises.do).' },
    ],
  },
  {
    id: 'charness-dufwenberg-2006',
    cite: 'Charness and Dufwenberg (2006)',
    reference: {
      text: 'Charness, G., & Dufwenberg, M. (2006). Promises and Partnership. *Econometrica*, 74(6), 1579–1601.',
      url: 'https://ideas.repec.org/a/ecm/emetrp/v74y2006i6p1579-1601.html',
    },
  },
  {
    id: 'battigalli-dufwenberg-2007',
    cite: 'Battigalli and Dufwenberg (2007)',
    reference: {
      text: 'Battigalli, P., & Dufwenberg, M. (2007). Guilt in Games. *American Economic Review*, 97(2), 170–176.',
      url: 'https://ideas.repec.org/a/aea/aecrev/v97y2007i2p170-176.html',
    },
  },
];

export interface Entry {
  readonly source: SourceKey;
  readonly work: WorkId;
  /** Where its figures are used, in the film's order and then the notebook's. */
  readonly places: readonly Place[];
}

const chapter = (id: ChapterId): Place => ({ chapter: id });
const page = (id: Subpage): Place => ({ page: id });

/** Every source key that the page shows in both states of the lock, in the order the film meets them. */
export const ENTRIES: readonly Entry[] = [
  { source: 'axelrod-1984', work: 'axelrod-1984', places: [chapter('two-rooms'), page('dilemma')] },
  { source: 'case-2017', work: 'case-2017', places: [chapter('two-rooms'), page('dilemma')] },
  {
    source: 'vanberg-2008',
    work: 'vanberg-2008',
    places: [chapter('fold'), chapter('two-voices'), chapter('blackout'), chapter('real-people'), chapter('closing'), page('dilemma'), page('vanberg')],
  },
  { source: 'vanberg-payoffs', work: 'vanberg-2008', places: [chapter('fold'), chapter('blackout'), chapter('closing')] },
  { source: 'vanberg-beliefs', work: 'vanberg-2008', places: [chapter('blackout'), chapter('real-people')] },
  { source: 'vanberg-design', work: 'vanberg-2008', places: [chapter('real-people'), page('vanberg')] },
  { source: 'vanberg-rates', work: 'vanberg-2008', places: [chapter('real-people'), page('vanberg')] },
  { source: 'vanberg-procedure', work: 'vanberg-2008', places: [chapter('real-people'), page('vanberg')] },
  { source: 'vanberg-guessing', work: 'vanberg-2008', places: [page('vanberg')] },
  { source: 'vanberg-cells', work: 'vanberg-2008', places: [page('vanberg')] },
  { source: 'vanberg-baseline', work: 'vanberg-2008', places: [page('vanberg')] },
  { source: 'vanberg-abstract', work: 'vanberg-2008', places: [page('dilemma')] },
  { source: 'charness-dufwenberg-2006', work: 'charness-dufwenberg-2006', places: [chapter('two-voices')] },
  { source: 'battigalli-dufwenberg-2007', work: 'battigalli-dufwenberg-2007', places: [chapter('two-voices')] },
];

/**
 * The finding's sources, behind the lock (ADR 0026): Kawagoe and Narita (2014), the belief the curve
 * holds fixed, the curve and /finding's own figures. Chapter 7's finding and /finding cite them.
 */
export const FINDING: readonly SourceKey[] = ['kawagoe-narita-2014', 'vanberg-second-order', 'curve', 'curve-finding'];

/**
 * Keys whose place in their source is still to be verified (docs/sources.md: "Por verificar; bloquea
 * el lanzamiento"). /sources says so where the place would go, marked `data-unverified`, and the
 * deploy refuses a dist/ that still carries that mark (.github/workflows/deploy.yml). Once a key's
 * pages are verified, take it out of here and write its `sources.at.<key>`.
 */
export const UNVERIFIED: readonly SourceKey[] = ['axelrod-1984'];

/**
 * Keys of the register no part of the page uses any more (docs/sources.md: "ya no se muestra"):
 * the chance of a partner switch and the chat's limits left with the previous version (P3).
 */
export const RETIRED: readonly SourceKey[] = ['vanberg-switch', 'vanberg-chat'];

export function work(id: WorkId): Work {
  const found = WORKS.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`No work "${id}"`);
  return found;
}

/** The works of /sources, in their order, each with its entries. */
export function worksOf(): readonly { readonly work: Work; readonly entries: readonly Entry[] }[] {
  return WORKS.map((candidate) => ({ work: candidate, entries: ENTRIES.filter((entry) => entry.work === candidate.id) })).filter(
    (group) => group.entries.length > 0,
  );
}

/** The figures the register gives a source key, each once, in the register's order. */
export function figuresOf(source: SourceKey): string[] {
  return [...new Set(FIGURES.filter((figure) => figure.source === source).map((figure) => figure.value))];
}

/** A reference as HTML: escaped, with `*…*` as the italics of a title. */
export function referenceHtml(text: string): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(/\*([^*]+)\*/g, '<i>$1</i>');
}

/** A URL as a reader writes it: no scheme, no trailing slash. */
export function shownUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

/** The UI key of what an entry's figures are. */
export function whatKey(entry: Entry): UiKey {
  return `sources.${entry.source}` as UiKey;
}

/** The UI key of where in its source an entry's figures are, for the entries that say. */
export function atKey(entry: Entry): string {
  return `sources.at.${entry.source}`;
}

// Each key of the register is on /sources, behind the lock or retired: exactly one of the three.
for (const key of SOURCE_KEYS) {
  const places = ENTRIES.filter((entry) => entry.source === key).length + (FINDING.includes(key) ? 1 : 0) + (RETIRED.includes(key) ? 1 : 0);
  if (places !== 1) throw new Error(`Source key "${key}" must be on /sources, behind the lock or retired, once`);
}
for (const citation of CITATIONS) {
  if (!FINDING.includes(citation.source) && !WORKS.some((candidate) => candidate.id === citation.source)) throw new Error(`No work for the citation ${citation.source}`);
}
