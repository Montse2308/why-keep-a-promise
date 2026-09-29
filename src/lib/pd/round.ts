/**
 * The one round of the prisoner's dilemma in chapter 1 (ADR 0023, interaction 2). The visitor plays
 * once; the other always defects, and the next beat says why: defecting is the other's best reply
 * to anything the visitor might do. There is no second round (docs/content-rules.md, rule (f)): once
 * played, the round stays as it was.
 */
import { dominantMove, payoff, type Cell, type Move } from './game';

/** What the other plays in the film's round: the dilemma's dominant move. */
export const OTHER_MOVE: Move = dominantMove() ?? 'defect';

export interface Round {
  readonly you: Move;
  readonly other: Move;
  readonly payoff: Cell;
}

/** Null until the visitor plays. */
export type RoundState = Round | null;

/** The round the visitor plays with `you`. */
export function roundOf(you: Move): Round {
  return { you, other: OTHER_MOVE, payoff: payoff(you, OTHER_MOVE) };
}

/** Plays the round, or, if it was already played, leaves it as it was. */
export function playRound(state: RoundState, you: Move): Round {
  return state ?? roundOf(you);
}
