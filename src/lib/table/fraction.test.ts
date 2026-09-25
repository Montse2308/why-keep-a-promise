import { describe, expect, it } from 'vitest';
import { add, complement, equals, fraction, multiply, outOf100, toNumber } from './fraction';

describe('fraction', () => {
  it('reduces and keeps the denominator positive', () => {
    expect(fraction(60, 6)).toEqual({ num: 10, den: 1 });
    expect(fraction(2, -4)).toEqual({ num: -1, den: 2 });
    expect(fraction(0, 5)).toEqual({ num: 0, den: 1 });
    expect(fraction(-0, 3)).toEqual({ num: 0, den: 1 });
  });

  it('only takes integers and a non-zero denominator', () => {
    expect(() => fraction(1, 0)).toThrow(RangeError);
    expect(() => fraction(0.5, 1)).toThrow(RangeError);
    expect(() => fraction(1, 1.5)).toThrow(RangeError);
  });

  it('adds, multiplies and complements exactly', () => {
    expect(add(fraction(1, 6), fraction(5, 6))).toEqual(fraction(1));
    expect(add(fraction(1, 3), fraction(1, 6))).toEqual(fraction(1, 2));
    expect(multiply(fraction(12), fraction(5, 6))).toEqual(fraction(10));
    expect(complement(fraction(5, 6))).toEqual(fraction(1, 6));
    expect(equals(fraction(2, 4), fraction(1, 2))).toBe(true);
    expect(toNumber(fraction(1, 2))).toBe(0.5);
  });

  it('rounds half up on a 0–100 scale in integer arithmetic', () => {
    expect(outOf100(fraction(1, 2))).toBe(50);
    expect(outOf100(fraction(1, 200))).toBe(1); // 0.5 → 1
    expect(outOf100(fraction(1, 201))).toBe(0);
    expect(outOf100(fraction(1))).toBe(100);
    expect(() => outOf100(fraction(-1, 2))).toThrow(RangeError);
  });
});
