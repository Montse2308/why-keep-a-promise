/**
 * Chapter 7's curve on the film's paper card (ADR 0027: the curve's series are redone on the Papel
 * palette, with the same tests). Personal guilt, the emphasised line, is drawn in ink; partner-specific
 * commitment, your word, in the gold of the thread that seals it; general guilt, the control, in the
 * lilac of the voice of what the other expects. A light line wears an ink casing, the cast's double
 * edge, so every line holds 3:1 on the card; the control is also dotted, so no line is told by colour
 * alone. ./film.test.ts checks the contrast and the colour-blind distances.
 *
 * Only Curve.astro reads this, inside the lock.
 */
import type { FilmToken } from '../design/film';
import type { Reason } from './curve';

export const FILM_SERIES: Record<Reason, FilmToken> = {
  personal: 'ink',
  partner: 'thread',
  general: 'voice-expects',
};

/** The token every casing is drawn in, and the paper the curve sits on. */
export const FILM_CASING: FilmToken = 'ink';
export const FILM_PAPER: FilmToken = 'card';

/**
 * Minimum CIE76 ΔE between the curve's colours: the two lines it compares, under protanopia and
 * deuteranopia too, and every line against the control and the cast it shares the film with.
 */
export const SERIES_DISTANCE = { series: 40, others: 20 } as const;

/** The lines that wear an ink casing: those in a light colour. */
export const CASED: readonly Reason[] = ['partner', 'general'];
