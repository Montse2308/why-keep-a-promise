import { describe, expect, it } from 'vitest';
import { add, fraction, outOf100 } from '../table/fraction';
import { ROLL_COUNTS } from '../table/results';
import { BASELINE, beliefOutOf100, cell, rollPercent, SWITCH_CELLS, SWITCH_DESIGN } from './cells';

describe("the partner-switch treatment's cells", () => {
  it('has six cells: promised or not, by the partner faced', () => {
    expect(SWITCH_CELLS).toHaveLength(6);
    expect(new Set(SWITCH_CELLS.map((c) => `${c.promised}-${c.partner}`)).size).toBe(6);
  });

  it('holds every decision of the treatment: half of its 192 people decide in each of its 8 rounds', () => {
    const decisions = SWITCH_CELLS.reduce((sum, c) => sum + c.n, 0);
    expect(decisions).toBe((SWITCH_DESIGN.people / 2) * SWITCH_DESIGN.rounds);
    expect(SWITCH_DESIGN).toEqual({ people: 192, rounds: 8 });
  });

  it('agrees with the four cells whose roll counts the film uses', () => {
    expect(cell(true, 'same')).toMatchObject(ROLL_COUNTS['promised-same']);
    expect(cell(false, 'same')).toMatchObject(ROLL_COUNTS['not-promised-same']);
    expect(cell(true, 'new-promised')).toMatchObject(ROLL_COUNTS['promised-switched']);
    expect(cell(false, 'new-promised')).toMatchObject(ROLL_COUNTS['not-promised-switched']);
  });

  it('shows the rounded roll rates and second-order beliefs', () => {
    const shown = SWITCH_CELLS.map((c) => [rollPercent(c), beliefOutOf100(c)]);
    expect(shown).toEqual([
      [73, 80],
      [52, 60],
      [54, 76],
      [54, 70],
      [52, 62],
      [56, 58],
    ]);
  });

  it('pools the no-switch cells into the belief after a promise that act 5 holds at 76 (n = 384)', () => {
    const same = SWITCH_CELLS.filter((c) => c.partner === 'same');
    const n = same.reduce((sum, c) => sum + c.n, 0);
    const beliefs = same.map((c) => c.beliefSum).reduce(add);
    expect(n).toBe(384);
    expect(fraction(beliefs.num, beliefs.den * n)).toEqual(fraction(1165, 1536));
    expect(outOf100(fraction(beliefs.num, beliefs.den * n))).toBe(76);
  });

  it("has Vanberg's pair: rolling falls from 73 to 54 while the belief moves from 80 to 76", () => {
    const same = cell(true, 'same');
    const switched = cell(true, 'new-promised');
    expect([rollPercent(same), rollPercent(switched)]).toEqual([73, 54]);
    expect([beliefOutOf100(same), beliefOutOf100(switched)]).toEqual([80, 76]);
  });
});

describe('the baseline treatments', () => {
  it('rolled in 92 of 128 decisions with the chat and in 67 of 128 without, with 32 people each over 8 rounds', () => {
    expect(BASELINE).toEqual({ chat: { rolled: 92, n: 128 }, noChat: { rolled: 67, n: 128 }, people: 32, rounds: 8 });
    // Half of each treatment's people decide in every round.
    expect((BASELINE.people / 2) * BASELINE.rounds).toBe(BASELINE.chat.n);
  });
});
