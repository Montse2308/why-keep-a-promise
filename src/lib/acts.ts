/**
 * Previous version: the six acts, which the film tells now (ADR 0021). They stay until the notebook
 * (P5) as the index of its pages: each subpage deepens one act, takes its title and links back to the
 * chapter that stands for it.
 */
import type { ChapterId } from './chapters';
import type { UiKey } from './i18n';
import type { Subpage } from './routes';

export interface Act {
  /** The act's id; identical in every locale. */
  readonly id: 'question' | 'dilemma' | 'two-reasons' | 'vanberg' | 'finding' | 'how-its-built';
  readonly titleKey: UiKey;
  /** The subpage that deepens this act, if any. */
  readonly deeper: Subpage | null;
  /**
   * The film's chapter that stands for this act now (ADR 0021): the one that tells it, or, for act 6,
   * chapter 8, whose credits link its page. Links back to the act lead to that chapter.
   */
  readonly film: ChapterId;
}

export const ACTS: readonly Act[] = [
  { id: 'question', titleKey: 'act.question.title', deeper: null, film: 'arrival' },
  { id: 'dilemma', titleKey: 'act.dilemma.title', deeper: 'dilemma', film: 'two-rooms' },
  { id: 'two-reasons', titleKey: 'act.two-reasons.title', deeper: null, film: 'two-voices' },
  { id: 'vanberg', titleKey: 'act.vanberg.title', deeper: 'vanberg', film: 'real-people' },
  { id: 'finding', titleKey: 'act.finding.title', deeper: 'finding', film: 'my-research' },
  { id: 'how-its-built', titleKey: 'act.how-its-built.title', deeper: 'how-its-built', film: 'closing' },
];

export function actForSubpage(subpage: Subpage): Act {
  const act = ACTS.find((candidate) => candidate.deeper === subpage);
  if (!act) throw new Error(`No act links to subpage "${subpage}"`);
  return act;
}
