/**
 * What the stage shows at each point of the film (ADR 0021, ADR 0027): the camera, the light, where
 * the cast and the die stand, how they feel and the state of the golden thread. Pure: the build
 * samples it for the storyboard's still frames and the film's script samples it on every frame.
 *
 * Positions are world units in an SVG 1600 wide; the table's centre sits at x = 800, the floor at
 * y = 640. `p` is the scroll position through the whole film, from 0 to 1; the choreography is
 * written in screens from the top of the film (src/lib/film/timeline.ts) and turned into `p` there.
 */
import { CHAPTERS, type ChapterId } from '../chapters';
import { LAMP_FROM, LIGHT, LIGHT_SURFACES, type LightSurface } from '../design/film';
import type { Shot } from './camera';
import type { Mood } from './faces';
import { spans, type Span } from './spans';
import { at, TOTAL_SCREENS } from './timeline';
import { easeInOut, progress, sample, track } from './track';

export const WORLD = { width: 1600, centre: 800, floor: 640, tableTop: 560 } as const;

/** Every chapter's share of the whole film, in order. */
export const SPANS: readonly Span<ChapterId>[] = spans(CHAPTERS);

export function spanOf(id: ChapterId): Span<ChapterId> {
  const found = SPANS.find((span) => span.id === id);
  if (!found) throw new Error(`No span for chapter "${id}"`);
  return found;
}

/** The visitor's answer in chapter 0: null until they choose. */
export type Promised = boolean | null;

export type ThreadState = 'tied' | 'broken' | 'none';

export interface StageState {
  readonly promised: Promised;
}

export interface StageView {
  readonly shot: Shot;
  readonly light: Record<LightSurface, string>;
  /** How much of the lamp's warm light falls on the table, from 0 to 1. */
  readonly lamp: number;
  /** Half the distance between the circle and the square. */
  readonly spread: number;
  readonly die: { readonly y: number; readonly opacity: number; readonly floating: boolean };
  readonly moods: { readonly you: Mood; readonly other: Mood };
  readonly thread: { readonly state: ThreadState; readonly drawn: number };
  /** How far the chapter 0 title has gone, from 0 (fully shown) to 1 (gone). */
  readonly titleGone: number;
}

/**
 * With reduced motion the stage cuts between still poses instead of moving (ADR 0027): from each
 * cut's point on, everything that moves stands where it stands at the cut's pose. In screens.
 */
export const CUTS: readonly { readonly from: number; readonly pose: number }[] = [
  { from: 0, pose: 0 },
  { from: 0.9, pose: 1.8 },
];

/** The pose that stands for a point, in screens, when the stage cuts instead of moving. */
export function poseAt(screens: number): number {
  let pose = CUTS[0]?.pose ?? 0;
  for (const cut of CUTS) if (screens >= cut.from) pose = cut.pose;
  return pose;
}

/** The camera: wide on the title at the top, closing in on the table as the other asks. */
const SHOTS = {
  cx: track([{ at: 0, value: 800 }, { at: at(3), value: 800 }]),
  cy: track([{ at: 0, value: 470 }, { at: at(1.8), value: 505 }]),
  width: track([{ at: 0, value: 1500 }, { at: at(1.8), value: 1180 }]),
  widthPortrait: track([{ at: 0, value: 660 }, { at: at(1.8), value: 600 }]),
};

/** Half the distance between the two characters at the table, on landscape and portrait screens. */
export const SPREAD = { landscape: 280, portrait: 190 } as const;

/** The key pose of each built chapter, in `p`: the storyboard draws its still frame there. */
export const KEY_POSE: Partial<Record<ChapterId, number>> = { arrival: at(2.1) };

export function stageAt(p: number, state: StageState, portrait: boolean, reduced: boolean): StageView {
  const screens = p * TOTAL_SCREENS;
  const cameraAt = reduced ? at(poseAt(screens)) : p;
  const shot: Shot = {
    cx: sample(SHOTS.cx, cameraAt),
    cy: sample(SHOTS.cy, cameraAt),
    width: sample(SHOTS.width, cameraAt),
    widthPortrait: sample(SHOTS.widthPortrait, cameraAt),
  };
  const light = Object.fromEntries(LIGHT_SURFACES.map((s) => [s, sample(LIGHT[s], p)])) as Record<LightSurface, string>;
  const lamp = easeInOut(progress(p, LAMP_FROM, Math.min(1, LAMP_FROM + 0.05)));

  const asked = progress(p, at(0.6), at(1.35));
  const other: Mood = state.promised === true ? 'happy' : state.promised === false ? 'sad' : asked > 0 ? 'worried' : 'neutral';
  const you: Mood = state.promised === true ? 'proud' : state.promised === false ? 'neutral' : asked > 0.5 ? 'tempted' : 'neutral';
  const thread =
    state.promised === true
      ? { state: 'tied' as const, drawn: 1 }
      : { state: 'none' as const, drawn: 0 };

  return {
    shot,
    light,
    lamp,
    spread: portrait ? SPREAD.portrait : SPREAD.landscape,
    die: { y: WORLD.tableTop - 90, opacity: 1, floating: p < at(1.5) },
    moods: { you, other },
    thread,
    titleGone: easeInOut(progress(p, at(0.36), at(1.2))),
  };
}

/** Where the circle and the square stand for a given spread (their faces' centres). */
export function castPositions(spread: number): { readonly you: readonly [number, number]; readonly other: readonly [number, number] } {
  return { you: [WORLD.centre - spread, 500], other: [WORLD.centre + spread, 496] };
}

/** The golden thread between the circle and the square: it leaves each side and sags upwards. */
export function threadPath(spread: number): string {
  const from = WORLD.centre - spread + 50;
  const to = WORLD.centre + spread - 50;
  const y = 486;
  const lift = Math.min(96, spread * 0.36);
  const pull = (to - from) * 0.3;
  return `M${from} ${y} C${from + pull} ${y - lift} ${to - pull} ${y - lift} ${to} ${y}`;
}
