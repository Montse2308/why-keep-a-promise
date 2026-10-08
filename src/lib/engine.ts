/**
 * The simulation engine's links (ADR 0034), the same in both languages: its repository, and the DOI
 * of its release archived on Zenodo, both from src/config.ts. The prose behind the lock writes
 * `{engine}` where they go (chapter 7's finding, /finding and the engine part of /how-its-built), and
 * the notebook's panel puts them under the finding's entry. They render only behind the lock.
 */
import { ENGINE } from '../config';

/** Where the prose puts the engine's links. */
export const ENGINE_TOKEN = '{engine}';

/** The repository, shown without its scheme, and the release's DOI. */
export function engineLinks(): string {
  const shown = ENGINE.repository.replace(/^https:\/\//, '');
  return `<a href="${ENGINE.repository}">${shown}</a> (DOI <a href="https://doi.org/${ENGINE.doi}">${ENGINE.doi}</a>)`;
}

/** Prose with its `{engine}` turned into the engine's links. */
export function withEngine(html: string): string {
  return html.replaceAll(ENGINE_TOKEN, engineLinks());
}
