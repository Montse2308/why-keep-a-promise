/**
 * The curve of chapter 7's finding, read from src/data/curve.json (ADR 0010). The page never recomputes the
 * model: this module only checks the file's shape and keeps the columns the page shows, one row
 * per value of background trust. Model parameters and intermediate values in the file are never
 * read here, so they cannot reach the page.
 */

/** The three reasons the curve compares, in the order the page lists them. */
export const REASONS = ['personal', 'partner', 'general'] as const;
export type Reason = (typeof REASONS)[number];

/** Series ids in curve.json: personal guilt, partner-specific commitment, general guilt (control). */
export const SERIES_IDS = { personal: 'PGA', partner: 'MC-b', general: 'GA' } as const satisfies Record<Reason, string>;

export interface CurveRow {
  /** Background trust, out of 100 (the file stores it as a fraction with denominator 100). */
  readonly trust: number;
  /** Material payoff of each reason in this world. */
  readonly payoff: Readonly<Record<Reason, number>>;
  /** Whether, moved by personal guilt, you roll the die in this world. */
  readonly pulls: boolean;
}

export interface Curve {
  readonly rows: readonly CurveRow[];
  /** Ends of the background-trust axis, out of 100. */
  readonly axis: { readonly min: number; readonly max: number };
  /** Background trust where personal guilt weighs most, out of 100. */
  readonly peak: number;
}

type Json = Record<string, unknown>;

function object(value: unknown, where: string): Json {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error(`${where}: expected an object`);
  return value as Json;
}

/** A `{num, den: 100}` fraction as an integer out of 100. */
function outOf100(value: unknown, where: string): number {
  const { num, den } = object(value, where);
  if (den !== 100) throw new Error(`${where}: expected denominator 100, got ${String(den)}`);
  if (!Number.isInteger(num) || (num as number) < 0 || (num as number) > 100) {
    throw new Error(`${where}: expected an integer numerator from 0 to 100, got ${String(num)}`);
  }
  return num as number;
}

function payoff(value: unknown, where: string): number {
  if (!Number.isInteger(value)) throw new Error(`${where}: payoffs must be integers, got ${String(value)}`);
  return value as number;
}

/** Validates the parsed curve.json and keeps what the page shows. Throws on any mismatch. */
export function readCurve(raw: unknown): Curve {
  const file = object(raw, 'curve.json');
  if (file.schemaVersion !== 1) throw new Error(`curve.json: unsupported schemaVersion ${String(file.schemaVersion)}`);

  const series = file.series;
  if (!Array.isArray(series)) throw new Error('curve.json: series must be a list');
  const ids = series.map((entry, i) => object(entry, `series[${i}]`).id).sort();
  if (JSON.stringify(ids) !== JSON.stringify(Object.values(SERIES_IDS).sort())) {
    throw new Error(`curve.json: expected series ${Object.values(SERIES_IDS).join(', ')}, got ${ids.join(', ')}`);
  }

  if (!Array.isArray(file.grid) || file.grid.length === 0) throw new Error('curve.json: grid must be a non-empty list');
  const rows = file.grid.map((entry, i): CurveRow => {
    const where = `grid[${i}]`;
    const row = object(entry, where);
    const payoffs = object(row.payoff, `${where}.payoff`);
    const rolls = object(row.rolls, `${where}.rolls`);
    const pulls = rolls[SERIES_IDS.personal];
    if (typeof pulls !== 'boolean') throw new Error(`${where}.rolls: expected a boolean for ${SERIES_IDS.personal}`);
    return {
      trust: outOf100(row.beta0, `${where}.beta0`),
      payoff: {
        personal: payoff(payoffs[SERIES_IDS.personal], `${where}.payoff.${SERIES_IDS.personal}`),
        partner: payoff(payoffs[SERIES_IDS.partner], `${where}.payoff.${SERIES_IDS.partner}`),
        general: payoff(payoffs[SERIES_IDS.general], `${where}.payoff.${SERIES_IDS.general}`),
      },
      pulls,
    };
  });
  rows.forEach((row, i) => {
    const previous = rows[i - 1];
    if (previous && row.trust <= previous.trust) throw new Error(`curve.json: grid must be strictly ordered by beta0 (row ${i})`);
  });

  const axis = object(file.axis, 'axis');
  const curve: Curve = {
    rows,
    axis: { min: outOf100(axis.min, 'axis.min'), max: outOf100(axis.max, 'axis.max') },
    peak: outOf100(file.peak, 'peak'),
  };
  if (rows[0]?.trust !== curve.axis.min || rows.at(-1)?.trust !== curve.axis.max) {
    throw new Error('curve.json: the grid must span the axis exactly');
  }
  if (!rows.some((row) => row.trust === curve.peak)) throw new Error('curve.json: the peak must be a grid row');
  return curve;
}

/** First and last background trust at which, moved by personal guilt, you roll the die. */
export function pullWindow(curve: Curve): { readonly from: number; readonly to: number } {
  const pulling = curve.rows.filter((row) => row.pulls);
  const first = pulling[0];
  const last = pulling.at(-1);
  if (!first || !last) throw new Error('Personal guilt never pulls on this curve');
  return { from: first.trust, to: last.trust };
}

/** Every payoff any reason takes on the curve, ascending. */
export function payoffLevels(curve: Curve): number[] {
  return [...new Set(curve.rows.flatMap((row) => REASONS.map((reason) => row.payoff[reason])))].sort((a, b) => a - b);
}
