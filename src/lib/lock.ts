/**
 * The lock (ADR 0026). Chapter 7's finding (its prose, the curve and its control), /finding and the
 * engine part of /how-its-built render only once the manuscript is under review, or on the dev
 * server. Otherwise chapter 7 ends at its sealed envelope, /finding and the notebook's entry for it
 * show their title and the status sentence, nothing links to /finding, and `npm run verify:dist`
 * fails if anything locked reached dist/.
 */
import type { UiKey } from './i18n';

export type ManuscriptStatus = 'in-preparation' | 'under-review';

export function findingUnlocked(status: ManuscriptStatus, dev: boolean): boolean {
  return status === 'under-review' || dev;
}

/** The status sentence's key (docs/content-rules.md, rule (b)); shown in both states. */
export function statusKey(status: ManuscriptStatus): UiKey {
  return `manuscript.status.${status}`;
}
