/**
 * /sources (ADR 0024): every figure on the page, with its full reference and where it is used. It
 * is built from the register of figures (src/content/figures.ts): each entry is one of its source
 * keys, under the work it comes from, with the figures the register gives that key, in the register's
 * order. docs/sources.md is where each one was verified; this is what the visitor reads.
 *
 * Its open part (`ENTRIES`, `WORKS`) looks the same in both states of the lock (ADR 0034). The
 * finding's sources (`FINDING_ENTRIES`, `FINDING_WORKS`) join it only behind the lock, from a
 * component a locked build does not have (ADR 0035); θ and c are named there, never their values.
 */
import { ENGINE, WORKING_PAPER } from '../config';
import { CITATIONS, FIGURES, SOURCE_KEYS, type SourceKey } from '../content/figures';
import type { ChapterId } from './chapters';
import type { Locale, UiKey } from './i18n';
import type { Subpage } from './routes';

/** A place where a figure is used: a chapter of the film, or a page of the notebook. */
export type Place = { readonly chapter: ChapterId } | { readonly page: Subpage };

export type WorkId =
  | 'axelrod-hamilton-1981'
  | 'case-2017'
  | 'vanberg-2008'
  | 'charness-dufwenberg-2006'
  | 'battigalli-dufwenberg-2007'
  | 'kawagoe-narita-2014'
  | 'working-paper';

export interface Link {
  /**
   * As a bibliography writes it, in English in both languages; `*…*` marks the italics of a title,
   * and `{type}` the kind of document, written in the page's language (`typeKey`).
   */
  readonly text?: string;
  /** Or a line of the page's own, in its language: what the working paper's engine links are. */
  readonly key?: UiKey;
  readonly url?: string;
}

export interface Work {
  readonly id: WorkId;
  /** How the English prose cites it: "Author (year)"; `citeIn` gives it in the page's language. */
  readonly cite: string;
  /** The full reference, the same in both languages, as any bibliography's. */
  readonly reference: Link;
  /** The kind of document in the reference's `{type}`: the working paper's, in the page's language. */
  readonly typeKey?: UiKey;
  /** What else of the work was used: Vanberg's (2008) supplementary material, the working paper's engine. */
  readonly parts?: readonly Link[];
  /** What the parts are called, when they are not supplementary material. */
  readonly partsKey?: UiKey;
}

export const WORKS: readonly Work[] = [
  {
    id: 'axelrod-hamilton-1981',
    cite: 'Axelrod and Hamilton (1981)',
    reference: {
      text: 'Axelrod, R., & Hamilton, W. D. (1981). The Evolution of Cooperation. *Science*, 211(4489), 1390–1396.',
      url: 'https://doi.org/10.1126/science.7466396',
    },
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
  { source: 'axelrod-hamilton-1981', work: 'axelrod-hamilton-1981', places: [chapter('two-rooms'), page('dilemma')] },
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
 * The works only the finding draws on, behind the lock (ADR 0035): Kawagoe and Narita (2014), and the
 * working paper, whose engine measured the curve (src/config.ts).
 */
export const FINDING_WORKS: readonly Work[] = [
  {
    id: 'kawagoe-narita-2014',
    cite: 'Kawagoe and Narita (2014)',
    reference: {
      text: 'Kawagoe, T., & Narita, Y. (2014). Guilt aversion revisited: An experimental test of a new model. *Journal of Economic Behavior & Organization*, 102, 1–9.',
      url: 'https://ideas.repec.org/a/eee/jeborg/v102y2014icp1-9.html',
    },
  },
  {
    id: 'working-paper',
    cite: 'Hernández Gallegos (2026)',
    // Linked to its DOI, as the other references are; the status sentence links its page on SSRN.
    reference: { text: `Hernández Gallegos, M. X. (2026). *${WORKING_PAPER.title}* [{type}]. SSRN.`, url: `https://doi.org/${WORKING_PAPER.doi}` },
    typeKey: 'sources.working-paper.type',
    parts: [
      { key: 'sources.engine.repository', url: ENGINE.repository },
      { key: 'sources.engine.release', url: `https://doi.org/${ENGINE.doi}` },
    ],
    partsKey: 'sources.engine',
  },
];

/**
 * The finding's sources, behind the lock (ADR 0034, ADR 0035): the belief the curve holds fixed,
 * Kawagoe and Narita (2014), the curve and /finding's own figures, in the order the film meets them.
 */
export const FINDING_ENTRIES: readonly Entry[] = [
  { source: 'vanberg-second-order', work: 'vanberg-2008', places: [chapter('my-research'), page('finding')] },
  { source: 'kawagoe-narita-2014', work: 'kawagoe-narita-2014', places: [chapter('my-research'), page('finding')] },
  { source: 'curve', work: 'working-paper', places: [chapter('my-research'), page('finding')] },
  { source: 'curve-finding', work: 'working-paper', places: [page('finding')] },
];

/** The finding's source keys. */
export const FINDING: readonly SourceKey[] = FINDING_ENTRIES.map((entry) => entry.source);

/**
 * Keys whose place in their source is still to be verified (docs/sources.md: "Por verificar; bloquea
 * el lanzamiento"). /sources says so where the place would go, marked `data-unverified`, and the
 * deploy refuses a dist/ that still carries that mark (.github/workflows/deploy.yml). Once a key's
 * pages are verified, take it out of here and write its `sources.at.<key>`.
 */
export const UNVERIFIED: readonly SourceKey[] = [];

/**
 * Keys of the register no part of the page uses any more (docs/sources.md: "ya no se muestra"):
 * the chance of a partner switch and the chat's limits left with the previous version (P3).
 */
export const RETIRED: readonly SourceKey[] = ['vanberg-switch', 'vanberg-chat'];

export function work(id: WorkId): Work {
  const found = [...WORKS, ...FINDING_WORKS].find((candidate) => candidate.id === id);
  if (!found) throw new Error(`No work "${id}"`);
  return found;
}

/** The works of /sources, in their order, each with its entries. */
export function worksOf(): readonly { readonly work: Work; readonly entries: readonly Entry[] }[] {
  return WORKS.map((candidate) => ({ work: candidate, entries: ENTRIES.filter((entry) => entry.work === candidate.id) })).filter(
    (group) => group.entries.length > 0,
  );
}

/** The finding's entries under a work of the open part: Vanberg's (2008) belief the curve holds fixed. */
export function findingEntriesOf(id: WorkId): readonly Entry[] {
  return FINDING_ENTRIES.filter((entry) => entry.work === id);
}

/** The works only the finding draws on, after the open ones, each with its entries. */
export function findingWorksOf(): readonly { readonly work: Work; readonly entries: readonly Entry[] }[] {
  return FINDING_WORKS.map((candidate) => ({ work: candidate, entries: findingEntriesOf(candidate.id) }));
}

/**
 * The figures the register gives a source key, each once, in the register's order; never the value
 * of a model parameter, θ or c, which only /finding shows (ADR 0035).
 */
export function figuresOf(source: SourceKey): string[] {
  return [...new Set(FIGURES.filter((figure) => figure.source === source && !figure.parameter).map((figure) => figure.value))];
}

/** A reference as HTML: escaped, with `*…*` as the italics of a title. */
export function referenceHtml(text: string): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(/\*([^*]+)\*/g, '<i>$1</i>');
}

/**
 * A reference as HTML with its `{type}` filled: the kind of document, in the page's language, marked
 * with that language when the English reference around it is marked English.
 */
export function referenceWithType(text: string, type: string, lang?: string): string {
  const html = referenceHtml(type);
  return referenceHtml(text).replace('{type}', lang ? `<span lang="${lang}">${html}</span>` : html);
}

/** How the prose of a language cites a work: its authors joined by "and" or "y", as CITATIONS says. */
export function citeIn(work: Work, locale: Locale): string {
  return locale === 'es' ? work.cite.replace(' and ', ' y ') : work.cite;
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
