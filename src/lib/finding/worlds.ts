/**
 * /finding's three worlds and the bottom panel of its figure (ADR 0037), read from the rows of
 * src/data/curve.json that src/lib/curve/finding.ts keeps; nothing here recomputes the model.
 *
 * The three worlds are three rows of the grid: background trust 5, 38 and 70. In each, the belief that
 * a promise will be kept is the curve's, 76; what a promise adds runs from the world's background
 * trust to it; the guilt available is the file's; and whether it is above the threshold, 20/3, is
 * whether θ · guilt passes the cost of rolling. The meter's scale is the guilt at the peak.
 *
 * Build time only, behind the lock (ADR 0034).
 */
import type { CurveRow } from '../curve/curve';
import type { Finding, GuiltRow } from '../curve/finding';

/** Which world, by the line of the page that names it. */
export const WORLD_IDS = ['few', 'between', 'most'] as const;
export type WorldId = (typeof WORLD_IDS)[number];

/** Background trust of each world: a row of the grid, out of 100. */
export const WORLD_TRUST: Record<WorldId, number> = { few: 5, between: 38, most: 70 };

export interface World {
  readonly id: WorldId;
  readonly trust: number;
  /** The belief that a promise will be kept, the same in every world: what a promise adds runs up to it. */
  readonly belief: number;
  /** In hundredths, as the file holds it. */
  readonly guilt: number;
  /** Whether θ · guilt passes the cost of rolling: the guilt is above the threshold. */
  readonly above: boolean;
  /** Whether, moved by personal guilt, you roll the die. */
  readonly personalRolls: boolean;
  /** Whether, moved by partner-specific commitment, you roll it when the promise binds you. */
  readonly partnerRolls: boolean;
  /** The meter: the guilt and the threshold as shares of the guilt at the peak, from 0 to 1. */
  readonly meter: { readonly guilt: number; readonly threshold: number };
}

function row(rows: readonly GuiltRow[], trust: number): GuiltRow {
  const found = rows.find((candidate) => candidate.trust === trust);
  if (!found) throw new Error(`No row of the grid at background trust ${trust}`);
  return found;
}

/** Whether guilt, in hundredths, passes the threshold: θ · guilt / 100 > cost, in integers. */
export function aboveThreshold(finding: Finding, guilt: number): boolean {
  return finding.theta.num * guilt > finding.cost * finding.theta.den * 100;
}

export function worlds(finding: Finding): readonly World[] {
  const peak = Math.max(...finding.rows.map((candidate) => candidate.guilt));
  const threshold = (100 * finding.threshold.num) / finding.threshold.den;
  return WORLD_IDS.map((id) => {
    const found = row(finding.rows, WORLD_TRUST[id]);
    const above = aboveThreshold(finding, found.guilt);
    if (above !== found.pulls) throw new Error(`At ${found.trust}, the file's roll and the threshold disagree`);
    return {
      id,
      trust: found.trust,
      belief: finding.curve.axis.max,
      guilt: found.guilt,
      above,
      personalRolls: found.pulls,
      partnerRolls: found.partnerRolls,
      meter: { guilt: found.guilt / peak, threshold: threshold / peak },
    };
  });
}

/**
 * The robustness variant on the payoff panel: the curve's rows with personal guilt's payoff in the
 * variant. Drawn only where it differs from the base line, so the panel shows the tail that stays up.
 */
export function variantRows(finding: Finding): readonly CurveRow[] {
  return finding.curve.rows.map((base, i) => {
    const variant = finding.rows[i];
    if (!variant || variant.trust !== base.trust) throw new Error(`Row ${i} of the variant is not the curve's`);
    return { ...base, payoff: { ...base.payoff, personal: variant.robust } };
  });
}

/** The first background trust from which the variant earns more than the base curve, and what it earns there. */
export function variantTail(finding: Finding): { readonly from: number; readonly payoff: number } {
  const first = finding.rows.find((candidate, i) => candidate.robust !== finding.curve.rows[i]?.payoff.personal);
  if (!first) throw new Error('The robustness variant never differs from the curve');
  return { from: first.trust, payoff: first.robust };
}
