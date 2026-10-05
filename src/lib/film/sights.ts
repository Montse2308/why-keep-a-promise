/**
 * What the scroll brings that sounds (ADR 0030): the stretches of the film where the stage shows
 * something with a cue of its own, without the visitor pressing anything. Each sounds once a visit,
 * the first time the scroll brings it into view with the sound on (rule 1); going back and forth
 * does not repeat it. The film's script asks, at every frame, which of them the stage shows now.
 * Pure: the stretches are the stage's own (./stage.ts), so what sounds is what is seen.
 */
import type { Cue } from './sound';
import { EXPECTED, FLICKER_OUT, FLICKER_ON, LIGHTS_OUT, LIGHTS_ON, poseAt, type StageState } from './stage';
import { TOTAL_SCREENS } from './timeline';

/**
 * Chapter 5: the lights go out, they come back, and they flicker for the reveal. Chapter 6: the
 * signs turn their figures on, where the visitor has not guessed them.
 */
export const SIGHTS = ['blackout', 'lights-on', 'flicker', 'signs'] as const;
export type Sight = (typeof SIGHTS)[number];

/** The cue each sight sounds: the blackout and the flicker are the same switch. */
export const SIGHT_CUE: Record<Sight, Cue> = {
  blackout: 'switch',
  'lights-on': 'lights-on',
  flicker: 'switch',
  signs: 'sign',
};

const middle = ([from, to]: readonly [number, number]): number => (from + to) / 2;

/**
 * Where each sight is in view, in screens: from halfway through the change it goes with, while it
 * holds. The blackout, once the stage is more dark than lit, until the light starts back; the light,
 * once it is more back than not, a little while; the flicker as the blackout; the signs' figures,
 * once they are more on than off. Both figures turn on together, so they sound once.
 */
export const SIGHT_SPANS: Record<Sight, readonly [number, number]> = {
  blackout: [middle(LIGHTS_OUT), LIGHTS_ON[0]],
  'lights-on': [middle(LIGHTS_ON), LIGHTS_ON[1] + 0.4],
  flicker: [middle(FLICKER_OUT), FLICKER_ON[0]],
  signs: [middle(EXPECTED), EXPECTED[1] + 0.4],
};

/**
 * The sights the stage shows at `p`, the scroll through the whole film. With reduced motion the
 * stage stands at its poses (./stage.ts), and the sights with it: one the poses skip is not seen,
 * so it does not sound. The signs turn on with the scroll only where a figure is not guessed: a
 * guessed one is on already, and sounded when the visitor asked to see it.
 */
export function sightsAt(p: number, state: Pick<StageState, 'guesses'>, reduced: boolean): ReadonlySet<Sight> {
  const screens = p * TOTAL_SCREENS;
  const m = reduced ? poseAt(screens) : screens;
  const unguessed = state.guesses?.same === undefined || state.guesses.switched === undefined;
  return new Set(SIGHTS.filter((sight) => m >= SIGHT_SPANS[sight][0] && m < SIGHT_SPANS[sight][1] && (sight !== 'signs' || unguessed)));
}

/** The sights that have just come into view and have not sounded yet this visit, in the film's order. */
export function comingIntoView(before: ReadonlySet<Sight>, now: ReadonlySet<Sight>, heard: ReadonlySet<Sight>): readonly Sight[] {
  return SIGHTS.filter((sight) => now.has(sight) && !before.has(sight) && !heard.has(sight));
}
