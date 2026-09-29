/**
 * Chapter 5's bet (ADR 0023, interaction 7): the visitor, now the one who receives, bets what the one
 * who decides will do, on the recipients' five-point scale of Vanberg's experiment. Then the film
 * shows the switch they could not see, and what the real recipients bet (`PROMISED_RECIPIENT_BELIEFS`).
 * A bet is never evidence about the visitor: the film only places it on the scale (ADR 0023).
 */
import type { UiKey } from '../i18n';
import { SCALE_POINTS, scaleValue, type ScalePoint } from '../table/expectation';
import { outOf100 } from '../table/fraction';
import type { Mood } from './faces';

/** A point of the scale, from 0 (certainly doesn't roll) to 4 (certainly rolls). */
export type Bet = ScalePoint;

export const BETS: readonly Bet[] = SCALE_POINTS;

/** Where the scale starts before the visitor moves it: its middle. */
export const BET_START: Bet = 2;

export const BET_LABEL: Record<Bet, UiKey> = {
  0: 'film.bet.point.0',
  1: 'film.bet.point.1',
  2: 'film.bet.point.2',
  3: 'film.bet.point.3',
  4: 'film.bet.point.4',
};

/** Where a bet sits on the scale read from 0 to 100: only to place it, never to print it. */
export const betAt = (bet: Bet): number => outOf100(scaleValue(bet));

export function isBet(value: number): value is Bet {
  return (BETS as readonly number[]).includes(value);
}

/** How the circle waits once it has bet: hopeful when it counts on the roll, worried when it doesn't. */
export function betMood(bet: Bet | null): Mood {
  if (bet === null) return 'worried';
  return bet >= 3 ? 'happy' : bet === 2 ? 'neutral' : 'worried';
}
