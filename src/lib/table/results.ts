/**
 * What real dictators did in Vanberg (2008): how many rolled the die, by whether they promised and
 * whether they kept their partner or were switched to a partner who had received a promise from
 * another dictator. Exact counts from switch.dat (docs/sources.md); the page shows them rounded.
 */
import { fraction, type Fraction } from './fraction';
import type { Partner } from './expectation';

export type CellKey = `${'promised' | 'not-promised'}-${Partner}`;

export const ROLL_COUNTS: Record<CellKey, { readonly rolled: number; readonly n: number }> = {
  'promised-same': { rolled: 227, n: 309 },
  'promised-switched': { rolled: 129, n: 238 },
  'not-promised-same': { rolled: 39, n: 75 },
  'not-promised-switched': { rolled: 30, n: 56 },
};

export const CELLS: readonly CellKey[] = ['promised-same', 'promised-switched', 'not-promised-same', 'not-promised-switched'];

/** The headline pair: dictators who promised, same partner against switched partner. */
export const HEADLINE: readonly [CellKey, CellKey] = ['promised-same', 'promised-switched'];

export function rollShare(cell: CellKey): Fraction {
  const { rolled, n } = ROLL_COUNTS[cell];
  return fraction(rolled, n);
}
