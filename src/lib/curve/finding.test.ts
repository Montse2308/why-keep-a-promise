import { describe, expect, it } from 'vitest';
import raw from '../../data/curve.json';
import { decimalFraction, guiltPeak, hundredths, readFinding, twoDecimals } from './finding';

describe('decimalFraction', () => {
  it('spells a decimal as the exact fraction it writes', () => {
    expect(decimalFraction(0.6)).toEqual({ num: 3, den: 5 });
    expect(decimalFraction(5)).toEqual({ num: 5, den: 1 });
    expect(decimalFraction(0.25)).toEqual({ num: 1, den: 4 });
    expect(() => decimalFraction(-1)).toThrow();
    expect(() => decimalFraction(1e-7)).toThrow();
  });
});

describe('hundredths and twoDecimals', () => {
  it('write hundredths with two decimals, and zero as 0', () => {
    expect(hundredths(1444)).toBe('14.44');
    expect(hundredths(660)).toBe('6.60');
    expect(hundredths(75)).toBe('0.75');
    expect(hundredths(0)).toBe('0');
  });

  it('round a fraction half up to two decimals', () => {
    expect(twoDecimals({ num: 20, den: 3 })).toBe('6.67');
    expect(twoDecimals({ num: 1, den: 8 })).toBe('0.13');
  });
});

describe('readFinding', () => {
  const finding = readFinding(raw);

  it('reads θ and c from params.sens, and the cost of rolling from the payoffs', () => {
    expect(finding.theta).toEqual({ num: 3, den: 5 });
    expect(finding.c).toBe(5);
    expect(finding.cost).toBe(4);
    expect(finding.threshold).toEqual({ num: 20, den: 3 });
  });

  it('reads the guilt of every row, with its peak at 38', () => {
    expect(finding.rows).toHaveLength(finding.curve.rows.length);
    expect(guiltPeak(finding.rows)).toMatchObject({ trust: 38, guilt: 1444 });
  });

  it('reads the robustness variant and its cap', () => {
    expect(finding.cap).toBe(5);
    expect(finding.rows.map((row) => row.robust)).toEqual(raw.grid.map((row) => row.robustness.payoffPgaCapOn));
  });

  it('rejects a file without the robustness variant', () => {
    const broken = structuredClone(raw) as { params: { capRobustness: { enabled: boolean } } };
    broken.params.capRobustness.enabled = false;
    expect(() => readFinding(broken)).toThrow(/capRobustness/);
  });
});
