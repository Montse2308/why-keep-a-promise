/**
 * The film's progress (point 9 of the external review, P7.3): which chapter has the stage, and how
 * far the film has gone through each of its chapters, as beads on a thread that fill with the
 * scroll. It only says where the visitor is: nothing in it can be pressed or reached with the
 * keyboard, so the film keeps no menu (ADR 0024).
 */
import { CHAPTERS } from '../chapters';
import { LEAD } from './stage';
import { beatAt, chapterStart } from './timeline';
import { clamp } from './track';

export interface Progress {
  /** The number of the chapter on the stage, from 0, as its card says it. */
  readonly chapter: number;
  /** How far the film has gone through each chapter, from 0 to 1, in film order. */
  readonly beads: readonly number[];
}

/** The last chapter's number: the film counts from 0, so it reads "Chapter 5 of 8". */
export const LAST_CHAPTER: number = CHAPTERS.at(-1)?.number ?? 0;

/**
 * The progress at a point of the film, in screens from its top. A chapter takes the stage as its
 * first card comes up, as the stage's beat does (./stage.ts), and its bead is full as the next
 * chapter's card comes up.
 */
export function progressAt(screens: number): Progress {
  const ahead = screens + LEAD;
  const { chapter } = beatAt(ahead);
  return {
    chapter: CHAPTERS.find((c) => c.id === chapter)?.number ?? 0,
    beads: CHAPTERS.map((c) => clamp((ahead - chapterStart(c.id)) / c.screens, 0, 1)),
  };
}
