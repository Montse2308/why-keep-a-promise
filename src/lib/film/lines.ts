/**
 * What the film says after each choice, from the pure modules: the payoffs of src/lib/pd/ and the
 * best-reply exercise of src/lib/pd/bestReply.ts. The build resolves every line a choice can lead
 * to, so the film's script only shows them and never computes a payoff (ADR 0023).
 */
import type { UiKey } from '../i18n';
import type { Conclusion, Pick } from '../pd/bestReply';
import { otherMove, type Move } from '../pd/game';
import type { Round } from '../pd/round';
import { fill } from '../template';

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
