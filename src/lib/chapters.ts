/**
 * The film's nine chapters (ADR 0021), in order. Their ids are the section ids on `/` and `/es/`,
 * identical in both locales, and anchor the notebook's magnifier links.
 */

export const CHAPTER_IDS = [
  'arrival',
  'two-rooms',
  'talk',
  'fold',
  'two-voices',
  'blackout',
  'real-people',
  'my-research',
  'closing',
] as const;

export type ChapterId = (typeof CHAPTER_IDS)[number];

export type BuildPhase = 'P1' | 'P2' | 'P3' | 'P4';

export interface Chapter {
  readonly id: ChapterId;
  /** Its number in the film, from 0. */
  readonly number: number;
  /** Scroll length, in screens: how long the chapter stays on the stage. */
  readonly screens: number;
  /** Phase that builds it (docs/phases.md). */
  readonly phase: BuildPhase;
}

const PHASE: Record<ChapterId, BuildPhase> = {
  arrival: 'P1',
  'two-rooms': 'P2',
  talk: 'P2',
  fold: 'P2',
  'two-voices': 'P3',
  blackout: 'P3',
  'real-people': 'P3',
  'my-research': 'P4',
  closing: 'P4',
};

/** Screens per chapter; tuned against the video review of each phase. */
const SCREENS: Record<ChapterId, number> = {
  arrival: 3,
  'two-rooms': 5,
  talk: 2.5,
  fold: 4,
  'two-voices': 3,
  blackout: 6,
  'real-people': 4,
  'my-research': 4,
  closing: 3,
};

export const CHAPTERS: readonly Chapter[] = CHAPTER_IDS.map((id, number) => ({
  id,
  number,
  screens: SCREENS[id],
  phase: PHASE[id],
}));

export function chapter(id: ChapterId): Chapter {
  const found = CHAPTERS.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`No chapter "${id}"`);
  return found;
}

/** The chapters already built by the end of `phase`, in film order. */
export function builtBy(phase: BuildPhase): readonly Chapter[] {
  const order: readonly BuildPhase[] = ['P1', 'P2', 'P3', 'P4'];
  return CHAPTERS.filter((c) => order.indexOf(c.phase) <= order.indexOf(phase));
}
