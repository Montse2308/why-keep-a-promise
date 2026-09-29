/**
 * What the film says after each choice, from the pure modules: the payoffs of src/lib/pd/, the
 * best-reply exercise of src/lib/pd/bestReply.ts and the decision at the table (`PAYOFFS`). The
 * build resolves every line a choice can lead to, so the film's script only shows them and never
 * computes a payoff (ADR 0023).
 */
import type { UiKey } from '../i18n';
import type { Conclusion, Pick } from '../pd/bestReply';
import { otherMove, type Move } from '../pd/game';
import type { Round } from '../pd/round';
import type { Outcome } from '../table/decision';
import { toNumber } from '../table/fraction';
import { PAYOFFS, type Choice } from '../table/game';
import { fill } from '../template';
import { BET_LABEL, type Bet } from './bet';
import { promiseAfter, type Card } from './deck';
import { FILM_VALUES } from './values';

/** Looks up a UI string. */
export type Strings = (key: UiKey) => string;

const OUT: Record<Move, UiKey> = { cooperate: 'film.two-rooms.out.cooperate', defect: 'film.two-rooms.out.defect' };
const ASK: Record<Move, UiKey> = { cooperate: 'film.two-rooms.ask.cooperate', defect: 'film.two-rooms.ask.defect' };
/** A move as the subject of a sentence ("Defecting pays…"), and in the middle of one. */
const DOING: Record<Move, UiKey> = { cooperate: 'film.doing.cooperate', defect: 'film.doing.defect' };
const DOING_MID: Record<Move, UiKey> = { cooperate: 'film.doing.cooperate.mid', defect: 'film.doing.defect.mid' };

/** The round's result: what each player got. */
export function roundLine(tr: Strings, round: Round): string {
  return fill(tr(OUT[round.you]), { you: round.payoff.you, other: round.payoff.other });
}

/** One column's pick against the other move, e.g. "Defecting gives you 5; cooperating would give you 3." */
export function pickLine(tr: Strings, pick: Pick): string {
  return fill(tr('film.two-rooms.pick'), {
    choice: tr(DOING[pick.you]),
    payoff: pick.payoff,
    alternative: tr(DOING_MID[otherMove(pick.you)]),
    other: pick.alternative,
  });
}

/** Both columns done: the move that pays more in both, with its four numbers. */
export function conclusionLine(tr: Strings, conclusion: Conclusion): string {
  const [first, second] = conclusion.columns;
  return fill(tr('film.two-rooms.both'), {
    move: tr(DOING[conclusion.dominant]),
    a: first?.dominant ?? '',
    b: first?.alternative ?? '',
    c: second?.dominant ?? '',
    d: second?.alternative ?? '',
  });
}

/** The question asked about a column of the matrix. */
export const askLine = (tr: Strings, other: Move): string => tr(ASK[other]);

/**
 * The decision's result (chapter 3): what each one got and, after a roll, what the die showed. The
 * face is named as a face, never as a payoff (rule (k)); rolling also says what it cost and what it
 * gives the other on average.
 */
export function decisionLine(tr: Strings, outcome: Outcome): string {
  const { you, other } = outcome.realized;
  if (outcome.choice === 'dont' || outcome.face === null) return fill(tr('film.fold.out.keep'), { you, other });
  const failed = (PAYOFFS.roll.failureFaces as readonly number[]).includes(outcome.face);
  const shown = fill(tr(failed ? 'film.fold.out.fail' : 'film.fold.out.roll'), { face: outcome.face, you, other });
  const cost = fill(tr('film.fold.out.cost'), { cost: FILM_VALUES.cost, expected: toNumber(outcome.expected.other) });
  return `${shown} ${cost}`;
}

/**
 * What a decision on a card of the deck leads to (chapter 5): the promise kept or broken with the
 * person the visitor promised; with a new partner, only that they had been promised nothing. It
 * says what happened, never which reason moved the visitor (ADR 0023).
 */
export function deckLine(tr: Strings, card: Card, choice: Choice): string {
  const promise = promiseAfter(card, choice);
  const key: UiKey =
    promise === 'kept' ? 'film.deck.out.kept' : promise === 'broken' ? 'film.deck.out.broken' : choice === 'roll' ? 'film.deck.out.rolled' : 'film.deck.out.kept-money';
  return fill(tr(key), FILM_VALUES);
}

/** The deck done: how many of the visitor's promises they kept. No payoffs are added up (rule (f)). */
export function tallyLine(tr: Strings, tally: { readonly kept: number; readonly made: number }): string {
  return fill(tr('film.deck.tally'), { kept: tally.kept, made: tally.made });
}

/** The visitor's bet, in the scale's words. */
export function betLine(tr: Strings, bet: Bet): string {
  return fill(tr('film.bet.out'), { bet: tr(BET_LABEL[bet]) });
}
