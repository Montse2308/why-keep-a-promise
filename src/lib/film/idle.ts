/**
 * Life at rest (point 10 of the external review, P7.3): what the cast does while the visitor reads
 * and the scroll rests, so a phone's first screen is not a still picture. Nothing here runs on its
 * own: the film's frame loop (src/components/film/film.ts), which already runs while the film is on
 * screen, asks it what to show from how long the scroll has rested. So it waits while the page
 * scrolls, stops with the tab hidden (no frames come), and with reduced motion it is never asked.
 * It moves the cast's eyes, which carry no shadow filter (Character.astro), and the die, small, in a
 * short rock every few seconds; never the scene's large shapes.
 */

/** How long the scroll rests before the cast comes to life, in ms. */
export const REST_MS = 1200;

/** How long a blink keeps the eyes shut, in ms. */
export const BLINK_MS = 160;

/** The waits between one blink and the next, in ms, over and over: every few seconds, never in step. */
export const BLINK_GAPS: readonly number[] = [2900, 4400, 3300, 5100, 3800];

export type Blinker = 'you' | 'other' | 'partner';

/** Each of the cast blinks on its own clock, so no two blink as one. */
export const BLINK_OFFSET: Readonly<Record<Blinker, number>> = { you: 300, other: 1900, partner: 1100 };

const CYCLE = BLINK_GAPS.reduce((sum, gap) => sum + gap, 0);

/** Whether one of the cast has its eyes shut in a blink, `rest` ms after the scroll last moved. */
export function blinking(rest: number, who: Blinker): boolean {
  const since = rest - REST_MS - BLINK_OFFSET[who];
  if (!(since >= 0)) return false;
  const at = since % CYCLE;
  let start = 0;
  for (const gap of BLINK_GAPS) {
    if (at >= start && at < start + BLINK_MS) return true;
    start += gap;
  }
  return false;
}

/** A blink as the eyes' transform: shut to a sliver around their middle (Character.astro), or open. */
export function blinkTransform(shut: boolean): string {
  return shut ? 'translate(0 -10) scale(1 0.12) translate(0 10)' : '';
}

/** Where the square looks while it waits for the visitor's answer in chapter 0. */
export type Gaze = 'circle' | 'ticket';

/**
 * The square's glances while it waits, over and over: at the circle it asked, then down at the
 * tickets the answer is on, then back to the visitor. In ms after the scroll rests.
 */
export const GAZES: readonly { readonly from: number; readonly gaze: Gaze | null }[] = [
  { from: 0, gaze: null },
  { from: 900, gaze: 'circle' },
  { from: 2700, gaze: 'ticket' },
  { from: 4700, gaze: null },
];

/** How long one round of glances lasts, in ms. */
export const GAZE_CYCLE = 7200;

/** Where the pupils go for each glance, in the face's units: left to the circle, down left to the tickets. */
export const GAZE_LOOK: Readonly<Record<Gaze, readonly [number, number]>> = { circle: [-7, 1], ticket: [-4, 8] };

/** Where the square looks, `rest` ms after the scroll last moved: nowhere in particular until it rests. */
export function gazeAt(rest: number): Gaze | null {
  const since = rest - REST_MS;
  if (!(since >= 0)) return null;
  const at = since % GAZE_CYCLE;
  let gaze: Gaze | null = null;
  for (const step of GAZES) if (at >= step.from) gaze = step.gaze;
  return gaze;
}

/** The die waiting on the table rocks every so often, as if nudged; in ms. */
export const ROCK_EVERY = 3600;
export const ROCK_MS = 900;
/** How far it tips, at most, in degrees. */
export const ROCK_DEG = 7;
/** Half the die's side (World.astro): it tips over the edge of its bottom face. */
const DIE_HALF = 34;

/** How far the waiting die tips, in degrees, `rest` ms after the scroll last moved: two swings that settle. */
export function rockAt(rest: number): number {
  const since = rest - REST_MS - 600;
  if (!(since >= 0)) return 0;
  const t = since % ROCK_EVERY;
  if (t >= ROCK_MS) return 0;
  return ROCK_DEG * Math.sin((4 * Math.PI * t) / ROCK_MS) * (1 - t / ROCK_MS);
}

/** The rock as the die's transform: it tips over the bottom corner on the side it leans to. */
export function rockTransform(degrees: number): string {
  if (degrees === 0) return 'rotate(0)';
  const corner = degrees > 0 ? DIE_HALF : -DIE_HALF;
  return `rotate(${degrees.toFixed(2)} ${corner} ${DIE_HALF})`;
}
