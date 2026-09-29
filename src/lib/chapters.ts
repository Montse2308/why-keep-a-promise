/**
 * The film's nine chapters (ADR 0021), in order. Their ids are the section ids on `/` and `/es/`,
 * identical in both locales, and anchor the notebook's magnifier links.
 *
 * A built chapter is told in beats: its cards, in order, each with its own length of scroll. The
 * chapter's Markdown marks where each beat's caption starts (`<!-- beat:<id> -->`).
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

export interface Beat {
  /** Unique within its chapter; marks its caption in the chapter's Markdown. */
  readonly id: string;
  /** Scroll length, in screens: how long its card stays over the stage. */
  readonly screens: number;
}

export interface Chapter {
  readonly id: ChapterId;
  /** Its number in the film, from 0. */
  readonly number: number;
  /** Scroll length, in screens: the sum of its beats once it is built. */
  readonly screens: number;
  /** Phase that builds it (docs/phases.md). */
  readonly phase: BuildPhase;
  /** Its cards, in order; empty until its phase builds it. */
  readonly beats: readonly Beat[];
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

/**
 * Beats of the built chapters, tuned against the video review of each phase. The whole film stays
 * at 35 screens, so each point of the day's light still falls in the chapter ADR 0027 gives it
 * (src/lib/design/film.test.ts).
 */
const BEATS: Partial<Record<ChapterId, readonly Beat[]>> = {
  arrival: [{ id: 'ask', screens: 3 }],
  'two-rooms': [
    { id: 'rooms', screens: 1.2 },
    { id: 'play', screens: 1.4 },
    { id: 'columns', screens: 1.5 },
    { id: 'trap', screens: 1.4 },
  ],
  talk: [
    { id: 'chat', screens: 1.4 },
    { id: 'cheap', screens: 1.1 },
  ],
  fold: [
    { id: 'fold', screens: 1.6 },
    { id: 'decide', screens: 2.4 },
  ],
};

/** Screens of the chapters still to be built: a placeholder their phase replaces with beats. */
const PLANNED_SCREENS: Partial<Record<ChapterId, number>> = {
  'two-voices': 3,
  blackout: 6,
  'real-people': 4,
  'my-research': 4,
  closing: 3,
};

/** Rounded to a thousandth, so 1.2 + 1.4 + 1.5 + 1.4 is exactly 5.5. */
const sum = (beats: readonly Beat[]): number => Math.round(beats.reduce((total, b) => total + b.screens, 0) * 1000) / 1000;

export const CHAPTERS: readonly Chapter[] = CHAPTER_IDS.map((id, number) => {
  const beats = BEATS[id] ?? [];
  const screens = beats.length > 0 ? sum(beats) : PLANNED_SCREENS[id];
  if (screens === undefined) throw new Error(`Chapter "${id}" has neither beats nor planned screens`);
  return { id, number, screens, phase: PHASE[id], beats };
});

export function chapter(id: ChapterId): Chapter {
  const found = CHAPTERS.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`No chapter "${id}"`);
  return found;
}

/** The chapters that phase `phase` and the ones before it build, in film order. */
export function builtBy(phase: BuildPhase): readonly Chapter[] {
  const order: readonly BuildPhase[] = ['P1', 'P2', 'P3', 'P4'];
  return CHAPTERS.filter((c) => order.indexOf(c.phase) <= order.indexOf(phase));
}

/** The chapters on the page: those with beats, which are always the film's first ones. */
export const BUILT: readonly Chapter[] = CHAPTERS.filter((c) => c.beats.length > 0);

/** A beat of a chapter, by id. */
export function beat(id: ChapterId, beatId: string): Beat {
  const found = chapter(id).beats.find((candidate) => candidate.id === beatId);
  if (!found) throw new Error(`No beat "${beatId}" in chapter "${id}"`);
  return found;
}
