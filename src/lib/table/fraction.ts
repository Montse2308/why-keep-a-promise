/** Exact rational arithmetic on integers, so probabilities and expected payoffs never round. */

export interface Fraction {
  readonly num: number;
  readonly den: number;
}

function gcd(a: number, b: number): number {
  let [x, y] = [Math.abs(a), Math.abs(b)];
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** A reduced fraction with a positive denominator. */
export function fraction(num: number, den = 1): Fraction {
  if (!Number.isSafeInteger(num) || !Number.isSafeInteger(den)) {
    throw new RangeError(`Fractions take integers, got ${num}/${den}`);
  }
  if (den === 0) throw new RangeError('Denominator must not be zero');
  const sign = den < 0 ? -1 : 1;
  const divisor = gcd(num, den) || 1;
  // `+ 0` turns -0 into 0.
  return { num: (sign * num) / divisor + 0, den: (sign * den) / divisor };
}

export function add(a: Fraction, b: Fraction): Fraction {
  return fraction(a.num * b.den + b.num * a.den, a.den * b.den);
}

export function multiply(a: Fraction, b: Fraction): Fraction {
  return fraction(a.num * b.num, a.den * b.den);
}

/** 1 − f, for the other branch of a two-way draw. */
export function complement(f: Fraction): Fraction {
  return fraction(f.den - f.num, f.den);
}

export function equals(a: Fraction, b: Fraction): boolean {
  return a.num === b.num && a.den === b.den;
}

/** Only for display and for comparing against a random draw; never for arithmetic. */
export function toNumber(f: Fraction): number {
  return f.num / f.den;
}
