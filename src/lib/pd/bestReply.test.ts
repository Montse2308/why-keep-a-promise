import { describe, expect, it } from 'vitest';
import { cellTags, conclusion, currentColumn, isDone, reduce, START, type Event, type State } from './bestReply';

const play = (...events: Event[]): State => events.reduce(reduce, START);
const pick = (move: 'cooperate' | 'defect'): Event => ({ type: 'pick', move });

describe('the best-reply exercise', () => {
  it('asks about "the other cooperates" first, then "the other defects"', () => {
    expect(currentColumn(START)).toBe('cooperate');
    expect(currentColumn(play(pick('defect')))).toBe('defect');
    expect(currentColumn(play(pick('defect'), pick('defect')))).toBeNull();
  });

  it('shows each pick against the alternative', () => {
    expect(play(pick('defect')).picks).toEqual([{ other: 'cooperate', you: 'defect', payoff: 5, alternative: 3, best: true }]);
    expect(play(pick('cooperate')).picks).toEqual([{ other: 'cooperate', you: 'cooperate', payoff: 3, alternative: 5, best: false }]);
    expect(play(pick('cooperate'), pick('cooperate')).picks[1]).toEqual({ other: 'defect', you: 'cooperate', payoff: 0, alternative: 1, best: false });
  });

  it('ignores picks once both columns are done, and starts over on reset', () => {
    const done = play(pick('defect'), pick('defect'));
    expect(reduce(done, pick('cooperate'))).toBe(done);
    expect(reduce(done, { type: 'reset' })).toEqual(START);
  });

  it('is deterministic: the same picks give the same state', () => {
    expect(play(pick('cooperate'), pick('defect'))).toEqual(play(pick('cooperate'), pick('defect')));
  });

  it.each([
    ['defect', 'defect'],
    ['cooperate', 'cooperate'],
    ['cooperate', 'defect'],
  ] as const)('ends at the same conclusion whatever the visitor picked (%s, %s)', (first, second) => {
    const state = play(pick(first), pick(second));
    expect(isDone(state)).toBe(true);
    expect(conclusion(state)).toEqual({
      dominant: 'defect',
      columns: [
        { other: 'cooperate', dominant: 5, alternative: 3 },
        { other: 'defect', dominant: 1, alternative: 0 },
      ],
      equilibrium: 1,
      better: 3,
    });
  });

  it('has no conclusion before both columns are done', () => {
    expect(conclusion(START)).toBeNull();
    expect(conclusion(play(pick('defect')))).toBeNull();
  });

  it("tags the visitor's pick and the best reply of each finished column", () => {
    const tags = cellTags(play(pick('cooperate')));
    expect(tags['cooperate-cooperate']).toEqual(['pick']);
    expect(tags['defect-cooperate']).toEqual(['best']);
    expect(tags['cooperate-defect']).toEqual([]);
    expect(tags['defect-defect']).toEqual([]);
  });

  it('marks, once done, where both end up and where both would be better off', () => {
    const tags = cellTags(play(pick('defect'), pick('defect')));
    expect(tags['defect-defect']).toEqual(['pick', 'best', 'equilibrium']);
    expect(tags['defect-cooperate']).toEqual(['pick', 'best']);
    expect(tags['cooperate-cooperate']).toEqual(['better']);
    expect(tags['cooperate-defect']).toEqual([]);
  });
});
