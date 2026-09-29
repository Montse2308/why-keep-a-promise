/**
 * The two voices (ADR 0021, ADR 0027), the two reasons of the story with a face: what the other
 * expects, a lilac cloud that never stops looking at the other, with the face of whoever waits
 * across the table in its globe; and my word, a paper scroll sealed with the golden thread, serious
 * and calm. They float over the circle from chapter 4 on. World units, as in stage.ts; Voices.astro
 * draws them.
 */

/** A point of the world. */
export type Point = readonly [number, number];

/** The voices are drawn at this scale of the character sheet. */
export const VOICE_SCALE = 0.78;

/**
 * Where each voice floats, from the circle's centre: the scroll on the outside, the cloud towards the
 * other. On a phone the circle stands near the edge of the view, so the voices lean inwards.
 */
export const VOICE_OFFSET = {
  landscape: { word: [-84, -152], expects: [104, -164] },
  portrait: { word: [-50, -160], expects: [104, -172] },
} as const satisfies Record<string, Record<'word' | 'expects', Point>>;

/** The cloud's globe, from the cloud's centre, before scaling: up and towards the other. */
export const GLOBE_AT: Point = [118, -60];

/** How far a voice's pupils move off the centre of its eyes, in the sheet's units. */
export const LOOK_REACH = 5;

export function voicePlaces(you: Point, portrait: boolean): { readonly word: Point; readonly expects: Point } {
  const offset = VOICE_OFFSET[portrait ? 'portrait' : 'landscape'];
  const at = ([dx, dy]: Point): Point => [you[0] + dx, you[1] + dy];
  return { word: at(offset.word), expects: at(offset.expects) };
}

/** Where a pair of pupils at `from` looks to see `to`: towards it, at most `reach` off centre. */
export function lookAt(from: Point, to: Point, reach = LOOK_REACH): Point {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy);
  if (length < 1e-9) return [0, 0];
  return [(dx / length) * reach, (dy / length) * reach * 0.7];
}
