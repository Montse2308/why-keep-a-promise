import { describe, expect, it } from 'vitest';
import raw from '../../data/curve.json';
import { FINDING_FIGURES as F } from '../../content/figures';
import { hundredths, readFinding } from '../curve/finding';
import { PAYOFFS } from '../table/game';
import { fill } from '../template';
import { CONTROLS, COST, decimals, fillIn, guilt, peak, read, rolls, thetaMin, thetaText, threshold, window } from './explorer';

/**
 * The explorer computes live, so its numbers are not in the register one by one (ADR 0038). This pins
 * the function to the register's values instead: the analytic cut, the peak, θmin with the belief at 76
 * and, as the working paper's section 5 gives it, at 80.
 */
describe("/finding's formula explorer, pinned to the register (ADR 0038)", () => {
  const theta = Number(F.theta);
  const b = F.beliefAfterPromise;

  it('starts where the page does: background trust 38, the belief at 76 and θ = 0.6', () => {
    expect([CONTROLS.a.start, CONTROLS.b.start, CONTROLS.theta.start]).toEqual([F.peak.trust, b, theta]);
    expect(COST).toBe(F.cost.difference);
    expect(COST).toBe(PAYOFFS.dont.you - PAYOFFS.roll.you);
  });

  it('fills its lines as the site does', () => {
    const line = 'Background trust {a}: from {from} to {to}';
    expect(fillIn(line, { a: 38, from: '10.1', to: '65.9' })).toBe(fill(line, { a: 38, from: '10.1', to: '65.9' }));
  });

  it('opens the window from 10.1 to 65.9, to one decimal', () => {
    const open = window(b, theta);
    expect([decimals(open?.from ?? NaN, 1), decimals(open?.to ?? NaN, 1)]).toEqual([F.cut.from, F.cut.to]);
  });

  it('peaks at 38 with 14.44', () => {
    expect(peak(b).a).toBe(F.peak.trust);
    expect(decimals(peak(b).guilt, 2)).toBe(F.peak.guilt);
  });

  it('closes the window below θ = 0.277 with the belief at 76, and below 0.25 at 80', () => {
    expect(thetaText(thetaMin(b))).toBe(F.explorer.thetaMin);
    expect(thetaText(thetaMin(80))).toBe(F.explorer.thetaMinAt80);
    expect(window(b, thetaMin(b))).toBeNull();
    expect(window(b, thetaMin(b) + 0.001)).not.toBeNull();
  });

  it('has the threshold 20/3 at θ = 0.6', () => {
    expect(threshold(theta)).toBeCloseTo(20 / 3, 12);
    expect(threshold(0)).toBe(Infinity);
    expect(window(b, 0)).toBeNull();
  });

  it('agrees with every row of the curve: the same guilt, and the same roll', () => {
    const finding = readFinding(raw);
    for (const row of finding.rows) {
      expect(hundredths(Math.round(guilt(row.trust, b) * 100)), `trust ${row.trust}`).toBe(hundredths(row.guilt));
      expect(rolls(row.trust, b, theta), `trust ${row.trust}`).toBe(row.pulls);
    }
  });

  it('keeps background trust between 0 and the belief, and moves the peak with the belief', () => {
    expect(read(90, 76, theta).a).toBe(76);
    expect(read(-3, 76, theta).a).toBe(0);
    for (const belief of [40, 76, 90, 100]) expect(read(0, belief, theta).peak.a).toBe(belief / 2);
    const wide = read(45, 90, theta);
    expect(wide.peak.guilt).toBe(20.25);
    expect(wide.window && wide.window.to - wide.window.from).toBeGreaterThan(65.9 - 10.1);
  });

  it('says whether personal guilt rolls where the page says it: at 38 yes, at 5 and 70 no', () => {
    expect(read(38, b, theta).rolls).toBe(true);
    expect(read(5, b, theta).rolls).toBe(false);
    expect(read(70, b, theta).rolls).toBe(false);
  });
});
