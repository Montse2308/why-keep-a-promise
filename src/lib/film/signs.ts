/**
 * Chapter 6's two paper signs, hung on strings over the table: how often the die was rolled after a
 * promise, with the same partner (the square's sign) and with a new partner promised by someone else
 * (the triangle's), and under each what the recipients expected. Each shows a question mark until
 * the visitor guesses it or the film reaches the figures (ADR 0023, interaction 8). They are two
 * numbers on paper, not a chart. World units, as in stage.ts; Signs.astro draws them.
 */
import type { GuessId } from './guess';

export const SIGN = { width: 220, height: 104, top: 118 } as const;

/** Where each sign hangs, over the table and above the voices. */
export const SIGN_X: Record<'landscape' | 'portrait', Record<GuessId, number>> = {
  landscape: { same: 700, switched: 940 },
  portrait: { same: 682, switched: 918 },
};

/** How far above its place a sign waits, out of sight, before it comes down. */
export const SIGN_RISE = 480;

export const signTransform = (x: number, shown: number): string => `translate(${x.toFixed(2)} ${((1 - shown) * -SIGN_RISE).toFixed(2)})`;
