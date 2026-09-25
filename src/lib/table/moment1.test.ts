import { describe, expect, it } from 'vitest';
import { fraction } from './fraction';
import { moment1, MOMENT1_START, outcomeOf, type Moment1Event, type Moment1State } from './moment1';
import { noRng, sequence } from './testing';

const run = (events: Moment1Event[], rng = noRng): Moment1State =>
  events.reduce((state, event) => moment1(state, event, rng), MOMENT1_START);

describe('moment 1', () => {
  it('Roll: the die decides what the other gets', () => {
    const die = run([{ type: 'choose', choice: 'roll' }, { type: 'throw' }], sequence(0.5));
    expect(die).toEqual({ phase: 'die', choice: 'roll', face: 4 });

    const outcome = moment1(die, { type: 'settle' }, noRng);
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

  it('play again returns to idle', () => {
    expect(run([{ type: 'choose', choice: 'dont' }, { type: 'settle' }, { type: 'reset' }])).toEqual(MOMENT1_START);
  });

  describe('illegal transitions leave the state unchanged', () => {
    const states: Moment1State[] = [
      MOMENT1_START,
      { phase: 'chosen', choice: 'roll' },
      { phase: 'chosen', choice: 'dont' },
      { phase: 'die', choice: 'roll', face: 3 },
      { phase: 'outcome', ...outcomeOf('roll', 3) },
    ];
    const events: Moment1Event[] = [
      { type: 'choose', choice: 'roll' },
      { type: 'choose', choice: 'dont' },
      { type: 'throw' },
      { type: 'settle' },
      { type: 'reset' },
    ];
    const legal = (state: Moment1State, event: Moment1Event): boolean =>
      (state.phase === 'idle' && event.type === 'choose') ||
      (state.phase === 'chosen' && state.choice === 'roll' && event.type === 'throw') ||
      (state.phase === 'chosen' && state.choice === 'dont' && event.type === 'settle') ||
      (state.phase === 'die' && event.type === 'settle') ||
      (state.phase === 'outcome' && event.type === 'reset');

    const cases = states.flatMap((state) =>
      events.filter((event) => !legal(state, event)).map((event) => [`${JSON.stringify(event)} in ${JSON.stringify(state)}`, state, event] as const),
    );

    it.each(cases)('%s', (_name, state, event) => {
      expect(moment1(state, event, noRng)).toBe(state);
    });
  });
});
