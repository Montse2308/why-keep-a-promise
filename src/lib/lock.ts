/**
 * The lock on act 5 (ADR 0015). Its full content (prose, chart and moment 3) renders only once the
 * manuscript is under review, or on the dev server. Otherwise act 5 shows its title and the status
 * sentence, and `npm run verify:dist` fails if anything locked reached dist/.
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
