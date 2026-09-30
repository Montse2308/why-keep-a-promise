/**
 * The film's nine chapters (ADR 0021), in order. Their ids are the section ids on `/` and `/es/`,
 * identical in both locales, and anchor the notebook's magnifier links.
 *
 * A built chapter is told in beats: its cards, in order, each with its own length of scroll. The
 * chapter's Markdown marks where each beat's caption starts (`<!-- beat:<id> -->`).
 */
import { FINDING_BEATS } from './film/finding';

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
  /** Scroll length, in screens: the sum of its beats. */
  readonly screens: number;
  /** Phase that builds it (docs/phases.md). */
  readonly phase: BuildPhase;
  /** Its cards, in order. */
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
 * Beats of the built chapters, tuned against the video review of each phase. A beat holds its card
 * at the bottom of the screen for its length, less the gap before the card and the card's own
 * height, so a tall card needs a long beat. The light of ADR 0027 is set in shares of the open film
 * (`OPEN_CHAPTERS`), so the lengths keep each point of it in its chapter and the lamp exactly where
 * chapter 7 starts (src/lib/design/film.test.ts, ./chapters.test.ts).
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
  'two-voices': [
    { id: 'voices', screens: 1.2 },
    { id: 'together', screens: 0.8 },
    { id: 'trick', screens: 1 },
  ],
  blackout: [
    { id: 'blackout', screens: 1.2 },
    { id: 'new-partner', screens: 1 },
    { id: 'deck', screens: 2 },
    { id: 'receive', screens: 1.2 },
    { id: 'reveal', screens: 1.6 },
  ],
  'real-people': [
    { id: 'guess-same', screens: 1.1 },
    { id: 'guess-switched', screens: 1.1 },
    { id: 'expected', screens: 1.1 },
    { id: 'conclusion', screens: 1.1 },
  ],
  // The part of chapter 7 that shows in both states of the lock (rule (j)): the question, the engine
  // and the sealed envelope with its stamp. The finding's beats follow it only with the lock open.
  'my-research': [
    { id: 'question', screens: 1.1 },
    { id: 'engine', screens: 1.1 },
    { id: 'sealed', screens: 1.2 },
  ],
  // Chapter 8 keeps the open film at 36.75 screens, the length the light was set for. The credits
  // roll up with the scroll, so their beat is long enough for them to go by on a small phone.
  closing: [
    { id: 'collect', screens: 1.3 },
    { id: 'asked', screens: 1.1 },
    { id: 'credits', screens: 1.55 },
  ],
};

/** Rounded to a thousandth, so 1.2 + 1.4 + 1.5 + 1.4 is exactly 5.5. */
const sum = (beats: readonly Beat[]): number => Math.round(beats.reduce((total, b) => total + b.screens, 0) * 1000) / 1000;

/** The nine chapters, with chapter 7's finding (ADR 0026) after its open beats. */
function chaptersWith(finding: readonly Beat[]): readonly Chapter[] {
  return CHAPTER_IDS.map((id, number) => {
    const beats = id === 'my-research' ? [...(BEATS[id] ?? []), ...finding] : (BEATS[id] ?? []);
    if (beats.length === 0) throw new Error(`Chapter "${id}" has no beats`);
    return { id, number, screens: sum(beats), phase: PHASE[id], beats };
  });
}

/**
 * The film as this build shows it. With the lock open, chapter 7 goes on past the sealed envelope
 * with the finding's beats; a locked build resolves ./film/finding.ts to an empty list, so its film
 * ends chapter 7 at the envelope (ADR 0026).
 */
export const CHAPTERS: readonly Chapter[] = chaptersWith(FINDING_BEATS);

/**
 * The film without the finding: the one a locked build shows, and the clock of the day's light in
 * both states, so opening the lock changes the light nowhere (src/lib/film/timeline.ts).
 */
export const OPEN_CHAPTERS: readonly Chapter[] = chaptersWith([]);

/** The finding's beats in this build: chapter 7's last ones, or none while the lock is closed. */
export const LOCKED_BEATS: readonly Beat[] = FINDING_BEATS;

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

/** The chapters on the page: those with beats, which since P4 are all nine. */
export const BUILT: readonly Chapter[] = CHAPTERS.filter((c) => c.beats.length > 0);

/** A beat of a chapter, by id. */
export function beat(id: ChapterId, beatId: string): Beat {
  const found = chapter(id).beats.find((candidate) => candidate.id === beatId);
  if (!found) throw new Error(`No beat "${beatId}" in chapter "${id}"`);
  return found;
}
