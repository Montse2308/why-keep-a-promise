import { describe, expect, it } from 'vitest';
import { bestReply, dominantMove, MOVES, payoff } from './game';
import { OTHER_MOVE, playRound } from './round';

describe('the one round of chapter 1 (ADR 0023, rule (f))', () => {
  it('has the other defect, the move that is their best reply to anything', () => {
    expect(OTHER_MOVE).toBe('defect');
    expect(OTHER_MOVE).toBe(dominantMove());
    for (const move of MOVES) expect(bestReply(move)).toBe(OTHER_MOVE);
  });

  it('pays both players what the matrix says', () => {
    expect(playRound(null, 'cooperate')).toEqual({ you: 'cooperate', other: 'defect', payoff: payoff('cooperate', 'defect') });
    expect(playRound(null, 'cooperate')?.payoff).toEqual({ you: 0, other: 5 });
    expect(playRound(null, 'defect')?.payoff).toEqual({ you: 1, other: 1 });
  });

  it('is played once: a second move leaves the round as it was', () => {
    for (const first of MOVES) {
      const once = playRound(null, first);
      for (const second of MOVES) expect(playRound(once, second)).toBe(once);
    }
  });
});
