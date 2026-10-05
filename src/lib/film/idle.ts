/**
 * Life at rest (point 10 of the external review, P7.3): what the cast does while the visitor reads
 * and the scroll rests, so a phone's first screen is not a still picture. Nothing here runs on its
 * own: the film's frame loop (src/components/film/film.ts), which already runs while the film is on
 * screen, asks it what to show from how long the scroll has rested. So it waits while the page
 * scrolls, stops with the tab hidden (no frames come), and with reduced motion it is never asked.
 * It moves only the cast's eyes, which carry no shadow filter (Character.astro), never the scene.
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
