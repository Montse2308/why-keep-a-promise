import type { ChapterId } from './chapters';
import type { UiKey } from './i18n';
import type { Subpage } from './routes';

export type Phase = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6';

export interface Act {
  /** Section id on `/`; identical in every locale. */
  readonly id: 'question' | 'dilemma' | 'two-reasons' | 'vanberg' | 'finding' | 'how-its-built';
  readonly titleKey: UiKey;
  /** Subpage reached from this act's "Go deeper →" link, if any. */
  readonly deeper: Subpage | null;
  /** Phase in which the act's content is written. */
  readonly contentPhase: Phase;
  /**
   * The film's chapter that tells this act now (ADR 0021), if any: the act no longer shows on `/`,
   * its prose is retired, and links back to it lead to the chapter.
   */
  readonly film: ChapterId | null;
}

export const ACTS: readonly Act[] = [
  { id: 'question', titleKey: 'act.question.title', deeper: null, contentPhase: 'F2', film: 'arrival' },
  { id: 'dilemma', titleKey: 'act.dilemma.title', deeper: 'dilemma', contentPhase: 'F2', film: 'two-rooms' },
  { id: 'two-reasons', titleKey: 'act.two-reasons.title', deeper: null, contentPhase: 'F2', film: null },
  { id: 'vanberg', titleKey: 'act.vanberg.title', deeper: 'vanberg', contentPhase: 'F2', film: null },
  { id: 'finding', titleKey: 'act.finding.title', deeper: 'finding', contentPhase: 'F3', film: null },
  { id: 'how-its-built', titleKey: 'act.how-its-built.title', deeper: 'how-its-built', contentPhase: 'F2', film: null },
];

export function actForSubpage(subpage: Subpage): Act {
  const act = ACTS.find((candidate) => candidate.deeper === subpage);
  if (!act) throw new Error(`No act links to subpage "${subpage}"`);
  return act;
}
