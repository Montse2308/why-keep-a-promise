import { describe, expect, it } from 'vitest';
import { decide, outcomeOf, UNDECIDED, type DecisionEvent, type DecisionState } from './decision';
import { fraction } from './fraction';
import { PAYOFFS } from './game';
import { noRng, sequence } from './testing';

const run = (events: DecisionEvent[], rng = noRng): DecisionState => events.reduce((state, event) => decide(state, event, rng), UNDECIDED);

describe('the decision at the table (chapter 3)', () => {
  it('Roll: the die decides what the other gets', () => {
    const die = run([{ type: 'choose', choice: 'roll' }, { type: 'throw' }], sequence(0.5));
    expect(die).toEqual({ phase: 'die', choice: 'roll', face: 4 });

    const outcome = decide(die, { type: 'settle' }, noRng);
    expect(outcome).toEqual({
      phase: 'outcome',
      choice: 'roll',
      face: 4,
      expected: { you: fraction(10), other: fraction(10) },
      realized: { you: 10, other: 12 },
    });
  });

  it('Roll with face 1 leaves the other with 0', () => {
    const outcome = run([{ type: 'choose', choice: 'roll' }, { type: 'throw' }, { type: 'settle' }], sequence(0));
    expect(outcome).toMatchObject({ phase: 'outcome', face: 1, realized: { you: 10, other: 0 } });
  });

  it("Don't Roll: no die, 14 against 0", () => {
    const outcome = run([{ type: 'choose', choice: 'dont' }, { type: 'settle' }]);
    expect(outcome).toEqual({ phase: 'outcome', ...outcomeOf('dont', null) });
    expect(outcome).toMatchObject({ face: null, realized: { you: 14, other: 0 } });
  });

  it('pays what PAYOFFS says, and nothing else', () => {
    expect(outcomeOf('dont', null).realized).toEqual({ you: PAYOFFS.dont.you, other: PAYOFFS.dont.other });
    for (const face of [1, 2, 3, 4, 5, 6] as const) {
      const failed = (PAYOFFS.roll.failureFaces as readonly number[]).includes(face);
      expect(outcomeOf('roll', face).realized).toEqual({ you: PAYOFFS.roll.you, other: failed ? PAYOFFS.roll.other.failure : PAYOFFS.roll.other.success });
    }
  });

  it('is decided once: a decided table ignores every later choice', () => {
    const decided = run([{ type: 'choose', choice: 'dont' }, { type: 'settle' }]);
    for (const event of [{ type: 'choose', choice: 'roll' }, { type: 'choose', choice: 'dont' }, { type: 'throw' }, { type: 'settle' }] as DecisionEvent[]) {
      expect(decide(decided, event, noRng)).toBe(decided);
    }
  });

  describe('illegal transitions leave the state unchanged', () => {
    const states: DecisionState[] = [
      UNDECIDED,
      { phase: 'chosen', choice: 'roll' },
      { phase: 'chosen', choice: 'dont' },
      { phase: 'die', choice: 'roll', face: 3 },
      { phase: 'outcome', ...outcomeOf('roll', 3) },
    ];
    const events: DecisionEvent[] = [{ type: 'choose', choice: 'roll' }, { type: 'choose', choice: 'dont' }, { type: 'throw' }, { type: 'settle' }];
    const legal = (state: DecisionState, event: DecisionEvent): boolean =>
      (state.phase === 'idle' && event.type === 'choose') ||
      (state.phase === 'chosen' && state.choice === 'roll' && event.type === 'throw') ||
      (state.phase === 'chosen' && state.choice === 'dont' && event.type === 'settle') ||
      (state.phase === 'die' && event.type === 'settle');

    const cases = states.flatMap((state) =>
      events.filter((event) => !legal(state, event)).map((event) => [`${JSON.stringify(event)} in ${JSON.stringify(state)}`, state, event] as const),
    );

    it.each(cases)('%s', (_name, state, event) => {
      expect(decide(state, event, noRng)).toBe(state);
    });
  });
});
