/**
 * /finding's «How to cite» (ADR 0037): the working paper as APA and as BibTeX, and the engine as
 * APA, built from src/config.ts, never written by hand. Plain text, shown in selectable blocks
 * without JavaScript. Only the kind of document in the APA reference changes with the page's
 * language, as on /sources: «Working paper» / «Documento de trabajo». The BibTeX uses `note`.
 */
import { AUTHOR, ENGINE, WORKING_PAPER } from '../config';

/** The working paper as an APA reference; `type` is the kind of document, in the page's language. */
export function paperApa(type: string): string {
  return `${AUTHOR.cite} (${WORKING_PAPER.year}). ${WORKING_PAPER.title} [${type}]. SSRN. https://doi.org/${WORKING_PAPER.doi}`;
}

/** The BibTeX key: the author's surnames, the year and the title's first word, in lower case, ASCII only. */
export function bibtexKey(): string {
  const ascii = (text: string) => text.normalize('NFD').replace(/[^A-Za-z]/g, '').toLowerCase();
  const surnames = AUTHOR.cite.split(',')[0] ?? '';
  const first = WORKING_PAPER.title.split(/\s+/)[0] ?? '';
  return `${ascii(surnames)}${WORKING_PAPER.year}${ascii(first)}`;
}

/** The working paper as a BibTeX entry, its fields aligned. */
export function paperBibtex(): string {
  const fields: [string, string][] = [
    ['author', AUTHOR.bibtex],
    ['title', WORKING_PAPER.title],
    ['year', String(WORKING_PAPER.year)],
    ['note', 'SSRN Working Paper'],
    ['doi', WORKING_PAPER.doi],
    ['url', WORKING_PAPER.ssrn],
  ];
  const width = Math.max(...fields.map(([name]) => name.length));
  const lines = fields.map(([name, value], i) => `  ${name.padEnd(width)} = {${value}}${i < fields.length - 1 ? ',' : ''}`);
  return [`@misc{${bibtexKey()},`, ...lines, '}'].join('\n');
}

/** The engine's release as an APA reference to software. */
export function engineApa(): string {
  return `${AUTHOR.cite} (${ENGINE.year}). ${ENGINE.title} (Version ${ENGINE.version}) [Computer software]. Zenodo. https://doi.org/${ENGINE.doi}`;
}
