/**
 * Where the prisoner's dilemma board sits on the stage (ADR 0021, rule (g)): a paper card with the
 * 2×2 matrix of payoffs, above the two rooms. Rows are your move, columns the other's; every cell
 * shows your payoff next to a circle and the other's next to a square. World units, as in stage.ts.
 * The stage keeps the board's top in view; Board.astro draws it from these numbers.
 */
import type { Tag } from '../pd/bestReply';
import { MOVES, PAYOFFS as PD, type Move } from '../pd/game';
import { PAYOFFS as TABLE } from '../table/game';

export const BOARD = {
  /** The paper card behind the matrix. */
  card: { x: 500, y: 100, width: 600, height: 272 },
  /** Left edge of each column and top edge of each row, in MOVES order. */
  columns: [668, 884],
  rows: [148, 256],
  cell: { width: 200, height: 100 },
  /** Baseline of the column headers, and where the row labels start. */
  header: 134,
  rowLabel: 546,
} as const;

export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** The cell where you play `you` and the other plays `other`. */
export function cellBox(you: Move, other: Move): Box {
  const x = BOARD.columns[MOVES.indexOf(other)] ?? 0;
  const y = BOARD.rows[MOVES.indexOf(you)] ?? 0;
  return { x, y, width: BOARD.cell.width, height: BOARD.cell.height };
}

/**
 * The one note a marked cell prints under its numbers, so its colour never goes alone: where both
 * end up first, then where both would be better off, then the best reply.
 */
export const NOTES = ['equilibrium', 'better', 'best'] as const satisfies readonly Tag[];
export type Note = (typeof NOTES)[number];

export function noteFor(tags: readonly Tag[]): Note | null {
  return NOTES.find((note) => tags.includes(note)) ?? null;
}

/** How many coins a stack can show: the most anyone takes in the film (14, keeping the money). */
export const STACK_MAX = Math.max(PD.T, PD.R, TABLE.dont.you, TABLE.roll.you, TABLE.roll.other.success);

/** A coin's height in a stack, in world units. */
export const COIN_STEP = 7;
