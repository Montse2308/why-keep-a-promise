/**
 * What /finding shows beyond chapter 7's curve (ADR 0034): the guilt available at each grid row, the
 * sensitivity θ and the fixed cost c from `params.sens`, and the robustness variant. Read from
 * src/data/curve.json as it is; nothing here recomputes the model or interpolates between rows.
 *
 * Build time only, and only behind the lock: the one component that imports this module is
 * src/components/curve/Curve.astro, which a locked build replaces with an empty stub
 * (astro.config.mjs). No other parameter of the file is read.
 */
import { fraction, type Fraction } from '../table/fraction';
import { PAYOFFS } from '../table/game';
import { readCurve, type Curve } from './curve';

export interface GuiltRow {
  /** Background trust, out of 100. */
  readonly trust: number;
  /** The guilt available to personal guilt, in hundredths (the file's `{num, den: 100}`). */
  readonly guilt: number;
  /** Whether, moved by personal guilt, you roll the die here. */
  readonly pulls: boolean;
  /** Personal guilt's payoff in the robustness variant. */
  readonly robust: number;
}

export interface Finding {
  readonly curve: Curve;
  readonly rows: readonly GuiltRow[];
  /** Sensitivity of personal guilt, as an exact fraction. */
  readonly theta: Fraction;
  /** Fixed cost of breaking a promise, for partner-specific commitment. */
  readonly c: number;
  /** What rolling costs the dictator: 14 − 10 (Vanberg's payoffs). */
  readonly cost: number;
  /** Personal guilt rolls where the guilt available is above `cost / θ`. */
  readonly threshold: Fraction;
  /** The robustness variant: the cap on the prior expectation, what the other gets without playing. */
  readonly cap: number;
}

type Json = Record<string, unknown>;

function object(value: unknown, where: string): Json {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error(`${where}: expected an object`);
  return value as Json;
}

function integer(value: unknown, where: string): number {
  if (!Number.isSafeInteger(value)) throw new Error(`${where}: expected an integer, got ${String(value)}`);
  return value as number;
}

/** A decimal written in the file, such as 0.6, as the exact fraction it spells (3/5). */
export function decimalFraction(value: number): Fraction {
  const match = /^(\d+)(?:\.(\d+))?$/.exec(String(value));
  if (!match) throw new Error(`Expected a plain non-negative decimal, got ${value}`);
  const decimals = match[2] ?? '';
  return fraction(Number(`${match[1]}${decimals}`), 10 ** decimals.length);
}

export function readFinding(raw: unknown): Finding {
  const curve = readCurve(raw);
  const file = object(raw, 'curve.json');
  const params = object(file.params, 'params');
  const sens = object(params.sens, 'params.sens');
  if (typeof sens.theta !== 'number') throw new Error('params.sens.theta: expected a number');
  const robustness = object(params.capRobustness, 'params.capRobustness');
  if (robustness.enabled !== true) throw new Error('params.capRobustness: expected the variant to be enabled');

  const grid = file.grid as unknown[];
  const rows = grid.map((entry, i): GuiltRow => {
    const where = `grid[${i}]`;
    const row = object(entry, where);
    const guilt = object(row.guilt, `${where}.guilt`);
    if (guilt.den !== 100) throw new Error(`${where}.guilt: expected denominator 100`);
    const base = curve.rows[i];
    if (!base) throw new Error(`${where}: missing from the curve`);
    return {
      trust: base.trust,
      guilt: integer(guilt.num, `${where}.guilt.num`),
      pulls: base.pulls,
      robust: integer(object(row.robustness, `${where}.robustness`).payoffPgaCapOn, `${where}.robustness.payoffPgaCapOn`),
    };
  });

  const theta = decimalFraction(sens.theta);
  const cost = PAYOFFS.dont.you - PAYOFFS.roll.you;
  return {
    curve,
    rows,
    theta,
    c: integer(sens.c, 'params.sens.c'),
    cost,
    threshold: fraction(cost * theta.den, theta.num),
    cap: integer(robustness.outsideOption, 'params.capRobustness.outsideOption'),
  };
}

/** Hundredths as written on the page: 1444 → "14.44", 660 → "6.60", 0 → "0". */
export function hundredths(value: number): string {
  if (value === 0) return '0';
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

/** A fraction to two decimals, rounded half up, in integer arithmetic: 20/3 → "6.67". */
export function twoDecimals(f: Fraction): string {
  if (f.num < 0) throw new RangeError('twoDecimals takes a non-negative fraction');
  return hundredths(Math.floor((200 * f.num + f.den) / (2 * f.den)));
}

/** The row where the guilt available is highest. */
export function guiltPeak(rows: readonly GuiltRow[]): GuiltRow {
  const top = rows.reduce<GuiltRow | undefined>((best, row) => (!best || row.guilt > best.guilt ? row : best), undefined);
  if (!top) throw new Error('No rows');
  return top;
}
