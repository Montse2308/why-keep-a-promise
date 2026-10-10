import { describe, expect, it } from 'vitest';
import raw from '../src/data/curve.json';
import findingEn from '../src/content/subpages/en/finding.md?raw';
import findingEs from '../src/content/subpages/es/finding.md?raw';
import { FINDING_FIGURES as F } from '../src/content/figures';
import { pullWindow } from '../src/lib/curve/curve';
import { guiltPeak, hundredths, readFinding, twoDecimals } from '../src/lib/curve/finding';
import { PAYOFFS } from '../src/lib/table/game';

const finding = readFinding(raw);
const prose = { en: findingEn, es: findingEs };

/**
 * The analytic cut: a · (76 − a) / 100 = 20/3, that is 3a² − 228a + 2000 = 0 (with 76 and 20/3 from
 * the file). Its roots are irrational, so the test checks the rounding the prose states: g changes
 * sign between x − 0.05 and x + 0.05, in integer arithmetic.
 */
function g(num: bigint, den: bigint): bigint {
  // (a(76 − a) − 100 · threshold) · den², with a = num / den and threshold = t.num / t.den, times t.den.
  const belief = BigInt(finding.curve.axis.max);
  const t = { num: BigInt(finding.threshold.num), den: BigInt(finding.threshold.den) };
  return (num * (belief * den - num)) * t.den - 100n * t.num * den * den;
}

function roundsTo(tenths: string): boolean {
  const [whole, decimal] = tenths.split('.');
  const hundredthsValue = BigInt(`${whole}${decimal}`) * 10n; // x in hundredths
  const [low, high] = [hundredthsValue - 5n, hundredthsValue + 5n];
  const signLow = g(low, 100n) > 0n;
  const signHigh = g(high, 100n) > 0n;
  return signLow !== signHigh;
}

describe("/finding's figures, checked against src/data/curve.json", () => {
  it('holds the belief that a promise will be kept at 76, the 76 of the formula', () => {
    expect(raw.params.beta1).toEqual({ num: F.beliefAfterPromise, den: 100 });
    expect(finding.curve.axis.max).toBe(F.beliefAfterPromise);
  });

  it('reads θ = 0.6 and c = 5 from params.sens', () => {
    expect(String(raw.params.sens.theta)).toBe(F.theta);
    expect(finding.c).toBe(F.c);
  });

  it('takes the cost of rolling, 14 − 10 = 4, from the payoffs', () => {
    expect([PAYOFFS.dont.you, PAYOFFS.roll.you]).toEqual([F.cost.dont, F.cost.roll]);
    expect(finding.cost).toBe(F.cost.difference);
  });

  it('has the threshold 20/3, about 6.67', () => {
    expect(`${finding.threshold.num}/${finding.threshold.den}`).toBe(F.threshold.exact);
    expect(twoDecimals(finding.threshold)).toBe(F.threshold.rounded);
  });

  it('rolls personal guilt exactly where θ · guilt > 4, in every row', () => {
    for (const row of finding.rows) {
      // θ · (guilt / 100) > cost  ⇔  θ.num · guilt > cost · θ.den · 100
      const above = finding.theta.num * row.guilt > finding.cost * finding.theta.den * 100;
      expect(row.pulls, `trust ${row.trust}`).toBe(above);
    }
  });

  it('rolls from 15 to 65 on the grid, with the peak at 38 and guilt 14.44', () => {
    expect(pullWindow(finding.curve)).toEqual(F.window);
    const peak = guiltPeak(finding.rows);
    expect(peak.trust).toBe(F.peak.trust);
    expect(finding.curve.peak).toBe(F.peak.trust);
    expect(hundredths(peak.guilt)).toBe(F.peak.guilt);
  });

  it('cuts analytically at about 10.1 and about 65.9, the roots of the quadratic', () => {
    expect(roundsTo(F.cut.from)).toBe(true);
    expect(roundsTo(F.cut.to)).toBe(true);
    // And not at the neighbouring tenths.
    expect(roundsTo('10.0') || roundsTo('10.2') || roundsTo('65.8') || roundsTo('66.0')).toBe(false);
  });

  it('has the grid window inside the analytic cut, with the rows next to it outside', () => {
    const inside = (trust: number) => g(BigInt(trust), 1n) > 0n;
    expect(inside(F.window.from) && inside(F.window.to)).toBe(true);
    expect(inside(F.window.from - 5) || inside(F.window.to + 5)).toBe(false);
  });

  it('always rolls partner-specific commitment (c = 5 > 4) and general guilt', () => {
    expect(finding.c).toBeGreaterThan(finding.cost);
    for (const row of raw.grid) {
      expect(row.rolls['MC-b']).toBe(true);
      expect(row.rolls.GA).toBe(true);
    }
  });

  it('keeps the right tail in the robustness variant: from 70 on, personal guilt still earns 10', () => {
    expect(finding.cap).toBe(F.robustness.cap);
    const tail = finding.rows.filter((row) => row.trust >= F.robustness.from);
    expect(tail.length).toBeGreaterThan(0);
    for (const row of tail) expect(row.robust).toBe(F.robustness.payoff);
    // In the base curve, the same rows earn 5: the variant is what changes them.
    for (const row of tail) expect(row.pulls).toBe(false);
    expect(finding.rows.find((row) => row.trust < F.robustness.from && row.trust > F.window.to)).toBeUndefined();
  });

  it('reads the three worlds from the file: the guilt available at 5, 38 and 70, above the threshold only at 38 (ADR 0037)', () => {
    for (const world of F.worlds) {
      const row = finding.rows.find((candidate) => candidate.trust === world.trust);
      expect(row, `trust ${world.trust}`).toBeDefined();
      expect(hundredths(row?.guilt ?? -1)).toBe(world.guilt);
      expect(row?.pulls).toBe(world.trust === F.peak.trust);
    }
  });

  it('evaluates the quadratic where the guilt is known: at 38 it is above 20/3', () => {
    expect(g(38n, 1n) > 0n).toBe(true);
  });
});

describe('/finding states those figures', () => {
  const figures = [
    String(F.beliefAfterPromise),
    F.theta,
    `c = ${F.c}`,
    `(${F.cost.dont} − ${F.cost.roll})`,
    `> ${F.cost.difference}`,
    F.threshold.exact,
    F.threshold.rounded,
    F.cut.from,
    F.cut.to,
    String(F.window.from),
    String(F.window.to),
    String(F.peak.trust),
    F.peak.guilt,
    String(F.robustness.from),
  ];

  it.each(['en', 'es'] as const)('%s prose', (locale) => {
    const text = prose[locale].replace(/\s+/g, ' ');
    for (const figure of figures) expect(text, figure).toContain(figure);
  });

  it.each(['en', 'es'] as const)('%s prose is locked whole: it opens with the lock marker', (locale) => {
    expect(prose[locale].replace(/^---[\s\S]*?---\s*/, '').startsWith('<!-- lock -->')).toBe(true);
  });
});
