/**
 * The best-reply exercise of chapter 1 (ADR 0023: /dilemma shows the matrix only), as a
 * pure state machine. The visitor picks a move against each column of the matrix, first "the other
 * cooperates", then "the other defects", and sees their payoff against the alternative. Once both columns are done, the matrix shows that defecting pays
 * more in both (a dominant strategy) and that two players who reason so end at (1, 1), not (3, 3).
 */
import { bestReply, bothBetterOff, dominantMove, MOVES, nashEquilibria, otherMove, payoff, type Move } from './game';

/** The other's move in each column, in the order the exercise asks about them. */
export const COLUMNS: readonly Move[] = ['cooperate', 'defect'];

export interface Pick {
  /** The column: what the other does. */
  readonly other: Move;
  readonly you: Move;
  /** Your payoff for the move you picked. */
  readonly payoff: number;
  /** Your payoff had you picked the other move. */
  readonly alternative: number;
  readonly best: boolean;
}

export interface State {
  readonly picks: readonly Pick[];
}

export type Event = { readonly type: 'pick'; readonly move: Move } | { readonly type: 'reset' };

export const START: State = { picks: [] };

/** The column being asked about, or null once both are done. */
export function currentColumn(state: State): Move | null {
  return COLUMNS[state.picks.length] ?? null;
}

export function isDone(state: State): boolean {
  return currentColumn(state) === null;
}

export function reduce(state: State, event: Event): State {
  if (event.type === 'reset') return START;
  const other = currentColumn(state);
  if (other === null) return state;
  const you = event.move;
  const pick: Pick = {
    other,
    you,
    payoff: payoff(you, other).you,
    alternative: payoff(otherMove(you), other).you,
    best: bestReply(other) === you,
  };
  return { picks: [...state.picks, pick] };
}

export type CellKey = `${Move}-${Move}`;
/** `pick`: the visitor's move in that column. `best`: the best reply in a finished column. Once
 * both columns are done, `equilibrium` marks where two players who reason so end up, and
 * `better` the cell where both would be better off. */
export type Tag = 'pick' | 'best' | 'equilibrium' | 'better';

export function cellKey(you: Move, other: Move): CellKey {
  return `${you}-${other}`;
}

/** What each cell of the matrix shows in this state, keyed `<your move>-<other's move>`. */
export function cellTags(state: State): Record<CellKey, Tag[]> {
  const tags = Object.fromEntries(MOVES.flatMap((you) => MOVES.map((other) => [cellKey(you, other), [] as Tag[]]))) as Record<CellKey, Tag[]>;
  for (const pick of state.picks) {
    tags[cellKey(pick.you, pick.other)].push('pick');
    tags[cellKey(bestReply(pick.other), pick.other)].push('best');
  }
  if (isDone(state)) {
    const [equilibrium] = nashEquilibria();
    if (equilibrium) {
      tags[cellKey(...equilibrium)].push('equilibrium');
      const at = payoff(...equilibrium);
      for (const you of MOVES) for (const other of MOVES) if (bothBetterOff(payoff(you, other), at)) tags[cellKey(you, other)].push('better');
    }
  }
  return tags;
}

export interface Conclusion {
  /** The move that pays more in both columns. */
  readonly dominant: Move;
  /** Your payoff with the dominant move and with the other move, per column, in COLUMNS order. */
  readonly columns: readonly { readonly other: Move; readonly dominant: number; readonly alternative: number }[];
  /** Where two players who both play the dominant move end up, and where both would do better. */
  readonly equilibrium: number;
  readonly better: number;
}

/** What the finished exercise shows. Null until both columns are done. */
export function conclusion(state: State): Conclusion | null {
  const dominant = dominantMove();
  if (!isDone(state) || dominant === null) return null;
  const [equilibrium] = nashEquilibria();
  if (!equilibrium) return null;
  const at = payoff(...equilibrium);
  const better = MOVES.flatMap((you) => MOVES.map((other) => payoff(you, other))).find((cell) => bothBetterOff(cell, at));
  if (!better) return null;
  return {
    dominant,
    columns: COLUMNS.map((other) => ({ other, dominant: payoff(dominant, other).you, alternative: payoff(otherMove(dominant), other).you })),
    equilibrium: at.you,
    better: better.you,
  };
}
