/**
 * What the film's script (./film.ts) hands each chapter's controller (./chapters/*.ts): the page,
 * the stage's state and the clocks of its animations, the sound, and the few things more than one
 * chapter touches (the spool in the corner, chapter 0's promise). The frame loop and the state stay
 * in film.ts; a controller only wires its chapter's choices and says what changed.
 */
import type { Cue } from '../../lib/film/sound';
import type { StageState } from '../../lib/film/stage';

/** The stage's animations that start with a choice: the thread drawn, the coins counted, the die rolled, a card's person seated. */
export type Clock = 'draw' | 'count' | 'roll' | 'turn';

/** The thread's state, as the spool in the corner says it. */
export type Thread = 'tied' | 'kept' | 'broken' | 'none';

export interface FilmContext {
  /** The film's section, `[data-film]`. */
  readonly root: HTMLElement;
  readonly reduced: MediaQueryList;
  /** The stage's state now. */
  readonly state: () => StageState;
  /** Replaces part of the state; the next frame paints it. */
  readonly update: (patch: Partial<StageState>) => void;
  /** Starts one of the stage's animations now. */
  readonly begin: (clock: Clock) => void;
  /** Asks for a frame. */
  readonly request: () => void;
  /** Sounds a cue, if the sound is on. */
  readonly play: (cue: Cue) => void;
  /** A cue for something that comes into view: it sounds the first time it is seen with the sound on. */
  readonly onSight: (element: Element | null | undefined, cue: Cue, threshold: number) => void;
  /** The spool in the corner: the thread's state, in words too. */
  readonly spoolAs: (thread: Thread) => void;
  /** Chapter 3 reminds the visitor what they answered in chapter 0, and chapter 8's other asks by it. */
  readonly remind: () => void;
  /** Chapter 0's answer is settled: its tickets stay focusable but inert. */
  readonly settlePromise: () => void;
}

/** A choice made once: the chosen ticket stays pressed, and every ticket of the group stays focusable but inert. */
export function settle(group: Element | null, chosen: HTMLButtonElement): void {
  group?.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    button.setAttribute('aria-pressed', String(button === chosen));
    button.setAttribute('aria-disabled', 'true');
  });
}

export const settled = (button: HTMLButtonElement): boolean => button.getAttribute('aria-disabled') === 'true';

/** How long the die spins in the air before it lands (chapter 3); the stage spins it for as long. */
export const ROLL_MS = 1000;
