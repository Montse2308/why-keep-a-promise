/**
 * The film's timeline (ADR 0025), counted in screens of scroll from the top of the film: where each
 * chapter and each of its beats starts, and how the native scroll maps to the film's position `p`,
 * from 0 (its top) to 1 (its end). Screens are what a reader feels and what the chapters declare, so
 * the stage's choreography is written in them and turned into `p` with `at()`.
 */
import { BUILT, chapter, CHAPTERS, LOCKED_BEATS, OPEN_CHAPTERS, type Beat, type ChapterId } from '../chapters';
import { totalScreens } from './spans';
import { clamp, lerp } from './track';

/** The whole film, built or not, in screens. */
export const TOTAL_SCREENS = totalScreens(CHAPTERS);

/** The film's position of a point `screens` into it. */
export const at = (screens: number): number => screens / TOTAL_SCREENS;

/** Where a chapter starts, in screens from the top of the film. */
export function chapterStart(id: ChapterId): number {
  const index = CHAPTERS.findIndex((c) => c.id === id);
  return totalScreens(CHAPTERS.slice(0, index));
}

/** The film without chapter 7's finding, in screens: the clock of the day's light. */
export const OPEN_SCREENS = totalScreens(OPEN_CHAPTERS);

/**
 * Chapter 7's finding, in screens from the top of the film: the end of the chapter, after the sealed
 * envelope. Empty while the lock is closed (ADR 0034).
 */
export const LOCKED_STRETCH = (() => {
  const to = chapterStart('my-research') + chapter('my-research').screens;
  return { from: to - totalScreens(LOCKED_BEATS), to } as const;
})();

/**
 * Where the day's light stands at a point of the film, in screens (ADR 0027): as a share of the open
 * film. The finding's stretch holds the light where the envelope left it, well into nightfall, so a
 * build with the lock open lights every other beat exactly as a locked one does.
 */
export function lightAt(screens: number): number {
  const { from, to } = LOCKED_STRETCH;
  const open = screens <= from ? screens : screens >= to ? screens - (to - from) : from;
  return open / OPEN_SCREENS;
}

export interface BeatRange {
  readonly chapter: ChapterId;
  readonly beat: Beat;
  /** Where the beat's stretch of scroll starts and ends, in screens from the top of the film. */
  readonly from: number;
  readonly to: number;
}

/** Every beat of the built chapters, in film order, with its stretch of scroll. */
export const BEATS: readonly BeatRange[] = BUILT.flatMap((c) => {
  let from = chapterStart(c.id);
  return c.beats.map((b) => {
    const range = { chapter: c.id, beat: b, from, to: from + b.screens };
    from = range.to;
    return range;
  });
});

/** A beat's stretch of scroll, in screens. */
export function beatRange(id: ChapterId, beatId: string): BeatRange {
  const found = BEATS.find((range) => range.chapter === id && range.beat.id === beatId);
  if (!found) throw new Error(`No built beat "${beatId}" in chapter "${id}"`);
  return found;
}

/** Where the built part of the film ends, in screens. */
export const BUILT_SCREENS = totalScreens(BUILT);

/** The share of the film the built chapters hold, as positions: [0, to]. */
export const BUILT_SPAN = { from: 0, to: at(BUILT_SCREENS) } as const;

/**
 * The film's position while the page is scrolled to `scrollTop`: how far the top of the screen has
 * gone through the built chapters, whose stretch of the page starts at `top` and is `height` tall.
 * The top of the screen, not its middle, so each beat's stretch of the page matches its stretch of
 * the timeline exactly, on any screen.
 */
export function scrollPosition(scrollTop: number, top: number, height: number, span: { readonly from: number; readonly to: number } = BUILT_SPAN): number {
  if (!(height > 0)) return span.from;
  return lerp(span.from, span.to, clamp((scrollTop - top) / height, 0, 1));
}

/** The beat under the top of the screen at a point, in screens; the last built one past the end. */
export function beatAt(screens: number): BeatRange {
  const found = BEATS.find((range) => screens < range.to) ?? BEATS.at(-1);
  if (!found) throw new Error('The film has no built beat');
  return found;
}
