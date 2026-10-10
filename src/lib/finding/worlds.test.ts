import { describe, expect, it } from 'vitest';
import raw from '../../data/curve.json';
import { FINDING_FIGURES as F, CURVE_FIGURES } from '../../content/figures';
import { stepLine } from '../curve/chart';
import { hundredths, readFinding } from '../curve/finding';
import { aboveThreshold, variantRows, variantTail, worlds } from './worlds';

const finding = readFinding(raw);

describe("/finding's three worlds (ADR 0037)", () => {
  const three = worlds(finding);

  it('are the rows at 5, 38 and 70 of the grid, with the guilt the register gives them', () => {
    expect(three.map((world) => [world.trust, hundredths(world.guilt)])).toEqual(F.worlds.map((world) => [world.trust, world.guilt]));
  });

  it('all hold the belief that a promise will be kept at 76: a promise adds from the world’s trust up to it', () => {
    for (const world of three) expect(world.belief).toBe(F.beliefAfterPromise);
  });

  it('pass the threshold, and roll personal guilt, only in between; partner-specific commitment rolls in all three', () => {
    expect(three.map((world) => [world.above, world.personalRolls, world.partnerRolls])).toEqual([
      [false, false, true],
      [true, true, true],
      [false, false, true],
    ]);
  });

  it('draw the meter against the guilt at the peak, with the threshold, 20/3, at its place', () => {
    const between = three[1];
    expect(between?.meter.guilt).toBe(1);
    expect(between?.meter.threshold).toBeCloseTo(2000 / 3 / 1444, 10);
    for (const world of three) expect(world.meter.guilt > world.meter.threshold).toBe(world.above);
  });

  it('read the threshold in integers: 20/3 lies between 6.66 and 6.67', () => {
    expect(aboveThreshold(finding, 666)).toBe(false);
    expect(aboveThreshold(finding, 667)).toBe(true);
  });
});

describe("/finding's payoff panel (ADR 0037)", () => {
  it('keeps personal guilt at 10 from 70 on in the robustness variant, and draws only that tail', () => {
    expect(variantTail(finding)).toEqual({ from: F.robustness.from, payoff: F.robustness.payoff });
    const base = stepLine(finding.curve.rows, 'personal');
    const variant = stepLine(variantRows(finding), 'personal');
    const high = variant.find((segment) => segment.y1 === CURVE_FIGURES.payoffs.high && segment.y2 === CURVE_FIGURES.payoffs.high);
    expect(high).toEqual({ x1: CURVE_FIGURES.window.from, x2: CURVE_FIGURES.axis.max, y1: 10, y2: 10 });
    expect(base.some((segment) => segment.y1 === 10 && segment.x2 === CURVE_FIGURES.window.to)).toBe(true);
  });
});
