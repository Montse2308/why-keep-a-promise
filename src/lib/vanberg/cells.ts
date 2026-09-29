/**
 * Every cell of Vanberg's (2008) partner-switch treatment, and his baseline treatments, as exact
 * counts. Dictators' decisions in switch.dat, analysed with the method of promises.do (TABLE I–III):
 * how many rolled, and the sum of their second-order beliefs (what they believed their partner
 * expected of them, a five-point scale coded 0 to 1). The page shows them rounded; see
 * docs/sources.md (`vanberg-cells`, `vanberg-baseline`).
 */
import { fraction, outOf100, type Fraction } from '../table/fraction';

/** Whom the dictator faced: the partner they chatted with, or a new one who was or wasn't promised by another dictator. */
export type Partner = 'same' | 'new-promised' | 'new-unpromised';

export interface SwitchCell {
  readonly promised: boolean;
  readonly partner: Partner;
  readonly rolled: number;
  /** Dictator decisions in the cell: rounds, not people. */
  readonly n: number;
  /** Sum of the dictators' second-order beliefs, on the 0–1 scale. */
  readonly beliefSum: Fraction;
}

export const SWITCH_CELLS: readonly SwitchCell[] = [
  { promised: true, partner: 'same', rolled: 227, n: 309, beliefSum: fraction(493, 2) },
  { promised: false, partner: 'same', rolled: 39, n: 75, beliefSum: fraction(179, 4) },
  { promised: true, partner: 'new-promised', rolled: 129, n: 238, beliefSum: fraction(723, 4) },
  { promised: false, partner: 'new-promised', rolled: 30, n: 56, beliefSum: fraction(39) },
  { promised: true, partner: 'new-unpromised', rolled: 29, n: 56, beliefSum: fraction(139, 4) },
  { promised: false, partner: 'new-unpromised', rolled: 19, n: 34, beliefSum: fraction(79, 4) },
];

export function cell(promised: boolean, partner: Partner): SwitchCell {
  const found = SWITCH_CELLS.find((c) => c.promised === promised && c.partner === partner);
  if (!found) throw new Error(`No cell for promised=${promised}, partner=${partner}`);
  return found;
}

/** Share of decisions in which the dictator rolled, as shown: a percentage rounded to an integer. */
export function rollPercent(c: SwitchCell): number {
  return outOf100(fraction(c.rolled, c.n));
}

/** The mean second-order belief, read from 0 to 100 and rounded to an integer. */
export function beliefOutOf100(c: SwitchCell): number {
  const { num, den } = c.beliefSum;
  return outOf100(fraction(num, den * c.n));
}

/**
 * The partner-switch treatment: 192 people over 8 rounds (docs/sources.md, `vanberg-design`). Half of
 * them decide in each round, so its dictators made people / 2 · rounds decisions, the cells above.
 */
export const SWITCH_DESIGN = { people: 192, rounds: 8 } as const;

/** The baseline treatments of Vanberg's Appendix A (baseline.dat): the same game with and without the chat. */
export const BASELINE = {
  chat: { rolled: 92, n: 128 },
  noChat: { rolled: 67, n: 128 },
  /** People in each treatment, and rounds. */
  people: 32,
  rounds: 8,
} as const;
