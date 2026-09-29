/**
 * Chapter 6's guesses (ADR 0023, interaction 8): before each figure shows, the visitor moves a bar
 * to guess how often the real people who had promised rolled the die, with the same partner and
 * after a switch; then the figure appears, from the exact counts (`ROLL_COUNTS`, Vanberg, 2008). The
 * film sets the guess beside the figure and says nothing about it: a guess is never evidence about
 * the visitor (ADR 0023).
 */
import { outOf100 } from '../table/fraction';
import { HEADLINE, rollShare, type CellKey } from '../table/results';

export type GuessId = 'same' | 'switched';

/** The two figures to guess, in order: the headline pair, promised with the same partner and switched. */
export const GUESSES: readonly { readonly id: GuessId; readonly cell: CellKey }[] = [
  { id: 'same', cell: HEADLINE[0] },
  { id: 'switched', cell: HEADLINE[1] },
];

/** Where the bar starts, as a share of the rounds, out of 100. */
export const GUESS_START = 50;

/** The figure a guess is set beside: the share of rounds in which the die was rolled, out of 100. */
export function truth(id: GuessId): number {
  const guess = GUESSES.find((candidate) => candidate.id === id);
  if (!guess) throw new Error(`No guess "${id}"`);
  return outOf100(rollShare(guess.cell));
}

/** A guess as the bar gives it: a whole number from 0 to 100. */
export function guessOf(value: number): number {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : GUESS_START;
}

/** What the visitor guessed, by figure; a figure shows once it is guessed. */
export type Guesses = Partial<Record<GuessId, number>>;
