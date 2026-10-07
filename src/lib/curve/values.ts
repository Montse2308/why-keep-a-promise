/**
 * Every number chapter 7's finding says (ADR 0034), read from the curve (src/data/curve.json, ADR 0010)
 * and from Vanberg's (2008) cells: its captions carry `{name}` placeholders, never a figure of their
 * own, as the rest of the film (docs/content-rules.md, rule (k)). tests/curve.test.ts checks each
 * against the registered figures (`CURVE_FIGURES`).
 *
 * Build time only, and only behind the lock: the one component that imports this module is
 * src/components/film/chapters/Finding.astro, which a locked build replaces with an empty stub.
 */
import { add, fraction, outOf100 } from '../table/fraction';
import { SWITCH_CELLS } from '../vanberg/cells';
import { payoffLevels, pullWindow, type Curve } from './curve';
import { CURVE } from './data';

/** The grid's step at the window's edges: the rows just outside it are this far from its ends. */
export function windowStep(curve: Curve): number {
  const { from, to } = pullWindow(curve);
  const trust = curve.rows.map((row) => row.trust);
  const before = trust[trust.indexOf(from) - 1];
  const after = trust[trust.indexOf(to) + 1];
  if (before === undefined || after === undefined || from - before !== after - to) {
    throw new Error('The window of personal guilt needs a row just outside each end, the same step away');
  }
  return from - before;
}

/**
 * What Vanberg's dictators believed their partner expected, without a switch, out of 100
 * (`vanberg-second-order`): every same-partner decision pooled.
 */
export function beliefWithoutSwitch(): number {
  const same = SWITCH_CELLS.filter((c) => c.partner === 'same');
  const sum = same.map((c) => c.beliefSum).reduce(add);
  const n = same.reduce((total, c) => total + c.n, 0);
  return outOf100(fraction(sum.num, sum.den * n));
}

function values(curve: Curve) {
  const [low, high, ...rest] = payoffLevels(curve);
  if (low === undefined || high === undefined || rest.length > 0) throw new Error('The finding says two payoffs: rolling and not rolling');
  const belief = beliefWithoutSwitch();
  // The simulation holds the expectation after a promise where background trust ends.
  if (belief !== curve.axis.max) throw new Error(`The belief after a promise (${belief}) is not the top of the axis (${curve.axis.max})`);
  const { from, to } = pullWindow(curve);
  return { min: curve.axis.min, max: curve.axis.max, outof: 100, peak: curve.peak, from, to, step: windowStep(curve), low, high, belief } as const;
}

export const CURVE_VALUES = values(CURVE);
