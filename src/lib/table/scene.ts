/**
 * Act 1's scene (ADR 0020): the table before moment 1, told in Vanberg's (2008) order while the
 * visitor scrolls. A, B and C are watched, never played: A promises B, the roles are drawn and A
 * decides, B is swapped for C, and A rolls the die. Then the seat becomes "you" and moment 1 begins.
 *
 * The scene moves with scroll-bound CSS only (src/components/table/Scene.astro). Its keyframes use
 * the progress stops below, as percentages of the time the scene stays pinned, and a test checks
 * that the CSS uses no other stop. Content follows docs/content-rules.md, rule (k): the payoffs are
 * the table's, the die's face is not a payoff, and the scene claims no result of the experiment.
 */
import type { UiKey } from '../i18n';
import { fill } from '../template';
import { expectedValue, branches, PAYOFFS, type Face } from './game';
import { toNumber } from './fraction';

export type BeatId = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Beat {
  readonly beat: BeatId;
  /** What happens, for the code and its tests; the page tells it through the captions. */
  readonly what: string;
  /** Progress, 0–100, over the time the scene stays pinned. */
  readonly from: number;
  readonly to: number;
}

export const BEATS: readonly Beat[] = [
  { beat: 0, what: 'arrival: A and B face to face, the die between them, not thrown', from: 0, to: 8 },
  { beat: 1, what: 'the chat: A writes to B before anyone knows who decides', from: 8, to: 24 },
  { beat: 2, what: 'the promise stays: the bubble closes and leaves a diamond on B’s side', from: 24, to: 34 },
  { beat: 3, what: 'the roles are drawn: A is tagged "decides"', from: 34, to: 44 },
  { beat: 4, what: 'the partner switch: B leaves with its diamond, C arrives with one from another decider', from: 44, to: 62 },
  { beat: 5, what: 'the die rolls and lands; the table’s payoffs appear', from: 62, to: 82 },
  { beat: 6, what: 'the exit: A, B and C leave, the seat becomes "you"', from: 82, to: 100 },
];

/**
 * Stops inside a beat, where one movement ends and the next begins. Every keyframe stop of the
 * scene's CSS is a beat boundary or one of these.
 */
export const STEPS = {
  hintGone: 4,
  typed: 20,
  bubbleGone: 29,
  tagged: 38,
  bOut: 52,
  cIn: 58,
  dieApex: 68,
  dieLanded: 74,
  payoffsShown: 78,
  castGone: 88,
  seatsShown: 94,
} as const;

/** How long, in progress points, a caption takes to fade in or out at the edges of its range. */
export const CAPTION_FADE = 2;

/** Every progress stop the scene's keyframes may use. */
export function sceneStops(): number[] {
  const stops = new Set<number>([
    ...BEATS.flatMap((beat) => [beat.from, beat.to]),
    ...Object.values(STEPS),
    ...CAPTIONS.flatMap((caption) => [caption.from, caption.from + CAPTION_FADE, caption.to - CAPTION_FADE, caption.to]),
  ]);
  return [...stops].filter((stop) => stop >= 0 && stop <= 100).sort((a, b) => a - b);
}

export interface Caption {
  readonly key: UiKey;
  /** The beat it tells; the caption shows from `from` to `to`. */
  readonly beat: BeatId;
  readonly from: number;
  readonly to: number;
}

/** The captions, in order. Beats 2 and 3 carry none: beat 1's caption stays through them. */
export const CAPTIONS: readonly Caption[] = [
  { key: 'scene.caption.talk', beat: 1, from: 8, to: 44 },
  { key: 'scene.caption.switch', beat: 4, from: 44, to: 62 },
  { key: 'scene.caption.die', beat: 5, from: 62, to: 82 },
  { key: 'scene.caption.yours', beat: 6, from: 82, to: 100 },
];

/** The face the die lands on, the same on every visit and in the still version. It is not a payoff. */
export const SCENE_FACE: Face = 5;

export interface ScenePayoffs {
  /** What the one who decides gets after rolling. */
  readonly roll: number;
  /** What the one who decides would have got by not rolling. */
  readonly dont: number;
  /** What the one who receives expects after a roll. */
  readonly expected: number;
  /** What rolling costs the one who decides. */
  readonly cost: number;
}

/** The table's own payoffs (Vanberg 2008, Suppl. A, p. 2), so the first screen and the table agree. */
export function scenePayoffs(): ScenePayoffs {
  const roll = PAYOFFS.roll.you;
  const dont = PAYOFFS.dont.you;
  const expected = toNumber(expectedValue(branches('roll').other));
  if (!Number.isInteger(expected)) throw new Error(`The scene shows a whole expected payoff, got ${expected}`);
  return { roll, dont, expected, cost: dont - roll };
}

/** The captions' text, filled with the table's payoffs. `expected` is the table's own word for it. */
export function sceneCaptions(translate: (key: UiKey) => string): { beat: BeatId; text: string }[] {
  const payoffs = scenePayoffs();
  const values = { ...payoffs, expectedWord: translate('table.expected').toLocaleLowerCase() };
  return CAPTIONS.map((caption) => ({ beat: caption.beat, text: fill(translate(caption.key), values) }));
}
