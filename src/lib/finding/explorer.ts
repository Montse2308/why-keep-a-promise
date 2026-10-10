/**
 * /finding's formula explorer (ADR 0038): the formula of the guilt available, and nothing more. With
 * background trust `a` and the belief that a promise will be kept `b`, both out of 100, the guilt
 * available is a · (b − a) / 100. Personal guilt rolls the die when θ · guilt passes the cost of
 * rolling, 14 − 10 = 4, that is, when the guilt is above 4 / θ. The window where it rolls lies between
 * the roots of a · (b − a) / 100 = 4 / θ; its peak is at a = b / 2, where the guilt is b² / 400; and
 * the window closes for θ at or below 1600 / b².
 *
 * Pure, and safe for a client script: it does not read src/data/curve.json and runs no model. The
 * numbers it computes live are not in the register one by one; its test pins it to the register's
 * values instead (src/lib/finding/explorer.test.ts). It imports nothing, so the explorer's script
 * shares no module with the film's and the home loads nothing more for it.
 */

/** What rolling costs the one who decides: 14 − 10, Vanberg's payoffs (the test checks it against `PAYOFFS`). */
export const COST = 4;

/** The controls: their range, step and starting value (ADR 0038). `a` runs from 0 up to `b`. */
export const CONTROLS = {
  a: { min: 0, step: 1, start: 38 },
  b: { min: 40, max: 100, step: 1, start: 76 },
  theta: { min: 0, max: 1.5, step: 0.01, start: 0.6 },
} as const;

/** The guilt available with background trust `a` and the belief `b`. */
export function guilt(a: number, b: number): number {
  return (a * (b - a)) / 100;
}

/** The guilt personal guilt must pass to roll, 4 / θ; infinite when θ is 0. */
export function threshold(theta: number): number {
  return theta > 0 ? COST / theta : Infinity;
}

/** Whether, moved by personal guilt, you roll: θ · guilt > 4. */
export function rolls(a: number, b: number, theta: number): boolean {
  return theta * guilt(a, b) > COST;
}

/** Where the guilt is highest: at half of the belief, with b² / 400. */
export function peak(b: number): { readonly a: number; readonly guilt: number } {
  return { a: b / 2, guilt: (b * b) / 400 };
}

/** The θ at or below which personal guilt never rolls, at any background trust: 1600 / b². */
export function thetaMin(b: number): number {
  return (4 * 100 * COST) / (b * b);
}

/**
 * The window where personal guilt rolls: the roots of a · (b − a) / 100 = 4 / θ, that is
 * a² − b·a + 100 · 4 / θ = 0. None when the peak does not pass the threshold.
 */
export function window(b: number, theta: number): { readonly from: number; readonly to: number } | null {
  if (!(theta > thetaMin(b))) return null;
  const root = Math.sqrt(b * b - 400 * threshold(theta));
  return { from: (b - root) / 2, to: (b + root) / 2 };
}

/** Fills `{name}` placeholders, as src/lib/template.ts does, without importing it (see above). */
export function fillIn(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{([a-z]+)\}/gi, (whole, name: string) => (values[name] === undefined ? whole : String(values[name])));
}

/** A number to a fixed count of decimals, as the page writes it: a point, in both languages. */
export function decimals(value: number, count: number): string {
  return value.toFixed(count);
}

/** θmin as the prose writes it: three decimals, without trailing zeros (0.277, 0.25). */
export function thetaText(value: number): string {
  return value.toFixed(3).replace(/\.?0+$/, '');
}

/** Everything the explorer shows for one setting of its controls. */
export interface Reading {
  readonly a: number;
  readonly b: number;
  readonly theta: number;
  readonly guilt: number;
  readonly threshold: number;
  readonly rolls: boolean;
  readonly window: { readonly from: number; readonly to: number } | null;
  readonly peak: { readonly a: number; readonly guilt: number };
  readonly thetaMin: number;
}

/** Reads the controls, keeping `a` within 0 and `b`. */
export function read(a: number, b: number, theta: number): Reading {
  const trust = Math.min(Math.max(a, CONTROLS.a.min), b);
  return {
    a: trust,
    b,
    theta,
    guilt: guilt(trust, b),
    threshold: threshold(theta),
    rolls: rolls(trust, b, theta),
    window: window(b, theta),
    peak: peak(b),
    thetaMin: thetaMin(b),
  };
}
