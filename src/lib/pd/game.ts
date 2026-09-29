/**
 * The one-shot prisoner's dilemma of chapter 1 and /dilemma, with the payoffs of Axelrod (1984):
 * T = 5, R = 3, P = 1, S = 0 (docs/sources.md, `axelrod-1984`). It is not the table: the table is
 * Vanberg's game (docs/content-rules.md, rule (g)). Pure and deterministic; nothing here draws at random.
 */
import { fraction, type Fraction } from '../table/fraction';

export const MOVES = ['cooperate', 'defect'] as const;
export type Move = (typeof MOVES)[number];

/** Temptation, reward, punishment and sucker's payoff. */
export const PAYOFFS = { T: 5, R: 3, P: 1, S: 0 } as const;

export interface Cell {
  readonly you: number;
  readonly other: number;
}

/** Your payoff and the other's when you play `you` and the other plays `other`. */
export function payoff(you: Move, other: Move): Cell {
  const { T, R, P, S } = PAYOFFS;
  if (you === 'cooperate') return other === 'cooperate' ? { you: R, other: R } : { you: S, other: T };
  return other === 'cooperate' ? { you: T, other: S } : { you: P, other: P };
}

export function otherMove(move: Move): Move {
  return move === 'cooperate' ? 'defect' : 'cooperate';
}

/** Your best reply to the other's move. The dilemma's payoffs never tie. */
export function bestReply(other: Move): Move {
  return payoff('defect', other).you > payoff('cooperate', other).you ? 'defect' : 'cooperate';
}

/** The move that is your best reply to every move of the other, if there is one. */
export function dominantMove(): Move | null {
  const replies = new Set(MOVES.map(bestReply));
  return replies.size === 1 ? (MOVES.map(bestReply)[0] ?? null) : null;
}

/** Pairs of moves (yours, the other's) in which neither player gains by changing theirs alone. */
export function nashEquilibria(): Array<readonly [Move, Move]> {
  // The game is symmetric, so the other's best reply to your move is `bestReply` as well.
  return MOVES.flatMap((you) => MOVES.map((other) => [you, other] as const)).filter(
    ([you, other]) => bestReply(other) === you && bestReply(you) === other,
  );
}

/** Both players do better at `a` than at `b`. */
export function bothBetterOff(a: Cell, b: Cell): boolean {
  return a.you > b.you && a.other > b.other;
}

/**
 * 2R > T + S: cooperating every round pays more than taking turns defecting on each other. Per
 * round, R against the average of T and S.
 */
export function alternation(): { readonly cooperate: Fraction; readonly alternate: Fraction; readonly cooperationPays: boolean } {
  const { T, R, S } = PAYOFFS;
  return { cooperate: fraction(R), alternate: fraction(T + S, 2), cooperationPays: 2 * R > T + S };
}
