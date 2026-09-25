import { describe, expect, it } from 'vitest';
import { alternation, bestReply, dominantMove, nashEquilibria, PAYOFFS, payoff } from './game';

describe("the prisoner's dilemma of act 2", () => {
  it('has the payoffs of the static matrix, your payoff first', () => {
    expect(payoff('cooperate', 'cooperate')).toEqual({ you: 3, other: 3 });
    expect(payoff('cooperate', 'defect')).toEqual({ you: 0, other: 5 });
    expect(payoff('defect', 'cooperate')).toEqual({ you: 5, other: 0 });
    expect(payoff('defect', 'defect')).toEqual({ you: 1, other: 1 });
  });

  it('orders them T > R > P > S', () => {
    const { T, R, P, S } = PAYOFFS;
    expect(T > R && R > P && P > S).toBe(true);
  });

  it('makes defecting the best reply to either move, so it is dominant', () => {
    expect(bestReply('cooperate')).toBe('defect');
    expect(bestReply('defect')).toBe('defect');
    expect(dominantMove()).toBe('defect');
  });

  it('has one Nash equilibrium, both defect, and both are better off cooperating', () => {
    expect(nashEquilibria()).toEqual([['defect', 'defect']]);
    const [you, other] = nashEquilibria()[0] ?? [];
    expect(you && other && payoff(you, other)).toEqual({ you: 1, other: 1 });
  });

  it('meets 2R > T + S: 3 per round against 2.5 for taking turns', () => {
    expect(alternation()).toEqual({ cooperate: { num: 3, den: 1 }, alternate: { num: 5, den: 2 }, cooperationPays: true });
  });
});
