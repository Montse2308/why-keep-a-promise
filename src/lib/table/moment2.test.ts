import { describe, expect, it } from 'vitest';
import { expectationFor, recipientAfterDraw, RECIPIENT_BELIEFS, SWITCHED_PARTNER_RECEIVED_PROMISE, type Partner } from './expectation';
import { fraction, multiply, outOf100 } from './fraction';
import { outcomeOf } from './moment1';
import { moment2, MOMENT2_START, SWITCH_PROBABILITY, type Moment2Event, type Moment2State } from './moment2';
import { noRng, sequence } from './testing';

const SWITCHED = 0; // below 1/2
const SAME = 0.5;

const run = (events: Moment2Event[], rng = noRng): Moment2State =>
  events.reduce((state, event) => moment2(state, event, rng), MOMENT2_START);

const drawn = (promised: boolean, draw: number) =>
  run([{ type: 'promise', promised }, { type: 'draw' }], sequence(draw));

describe('moment 2: partner draw', () => {
  it('switches partner with probability 1/2', () => {
    expect(SWITCH_PROBABILITY).toEqual(fraction(1, 2));
    expect(drawn(true, SWITCHED)).toMatchObject({ phase: 'switchDrawn', partner: 'switched' });
    expect(drawn(true, 0.4999)).toMatchObject({ partner: 'switched' });
    expect(drawn(true, SAME)).toMatchObject({ phase: 'switchDrawn', partner: 'same' });
  });

  it('invariant: if you promised, the recipient expects the same with or without a switch; only the promiser changes', () => {
    const same = drawn(true, SAME);
    const switched = drawn(true, SWITCHED);
    if (same.phase !== 'switchDrawn' || switched.phase !== 'switchDrawn') throw new Error('expected switchDrawn');

    expect(switched.recipient.expectation).toEqual(same.recipient.expectation);
    expect(outOf100(switched.recipient.expectation)).toBe(outOf100(same.recipient.expectation));
    expect(switched.recipient.receivedPromise).toBe(same.recipient.receivedPromise);
    expect(same.recipient.promiser).toBe('you');
    expect(switched.recipient.promiser).toBe('another-dictator');
  });

  it('uses the fixed illustrative case for a switched partner: a promise from another dictator', () => {
    expect(SWITCHED_PARTNER_RECEIVED_PROMISE).toBe(true);
    expect(recipientAfterDraw(false, 'switched')).toEqual({
      receivedPromise: true,
      promiser: 'another-dictator',
      expectation: expectationFor(true),
    });
  });

  it('without a promise and without a switch, the recipient holds no promise', () => {
    expect(recipientAfterDraw(false, 'same')).toEqual({
      receivedPromise: false,
      promiser: null,
      expectation: expectationFor(false),
    });
  });

  it("depends only on whether that person received a promise", () => {
    for (const promised of [true, false]) {
      for (const partner of ['same', 'switched'] as Partner[]) {
        const recipient = recipientAfterDraw(promised, partner);
        expect(recipient.expectation).toEqual(expectationFor(recipient.receivedPromise));
      }
    }
  });
});

describe('moment 2: the meter', () => {
  it('derives 69 and 48 out of 100 from the exact belief fractions', () => {
    expect(RECIPIENT_BELIEFS.promise).toEqual({ sum: fraction(831, 2), n: 603 });
    expect(RECIPIENT_BELIEFS.none).toEqual({ sum: fraction(319, 4), n: 165 });
    expect(expectationFor(true)).toEqual(multiply(fraction(831, 2), fraction(1, 603)));
    expect(expectationFor(false)).toEqual(multiply(fraction(319, 4), fraction(1, 165)));
    expect(outOf100(expectationFor(true))).toBe(69);
    expect(outOf100(expectationFor(false))).toBe(48);
  });
});

describe('moment 2: full round', () => {
  it('promise → draw → Roll → die → outcome → reveal → idle', () => {
    const rng = sequence(SAME, 0.9);
    const outcome = run(
      [{ type: 'promise', promised: true }, { type: 'draw' }, { type: 'choose', choice: 'roll' }, { type: 'throw' }, { type: 'settle' }],
      rng,
    );
    expect(outcome).toEqual({
      phase: 'outcome',
      promised: true,
      partner: 'same',
      recipient: recipientAfterDraw(true, 'same'),
      ...outcomeOf('roll', 6),
    });

    const reveal = moment2(outcome, { type: 'reveal' }, noRng);
    expect(reveal).toEqual({ ...outcome, phase: 'reveal' });
    expect(moment2(reveal, { type: 'reset' }, noRng)).toEqual(MOMENT2_START);
  });

  it("Don't Roll skips the die", () => {
    const outcome = run(
      [{ type: 'promise', promised: false }, { type: 'draw' }, { type: 'choose', choice: 'dont' }, { type: 'settle' }],
      sequence(SWITCHED),
    );
    expect(outcome).toMatchObject({ phase: 'outcome', partner: 'switched', face: null, realized: { you: 14, other: 0 } });
  });
});

describe('moment 2: illegal transitions leave the state unchanged', () => {
  const recipient = recipientAfterDraw(true, 'same');
  const base = { promised: true, partner: 'same' as const, recipient };
  const states: Moment2State[] = [
    MOMENT2_START,
    { phase: 'promised', promised: true },
    { phase: 'switchDrawn', ...base },
    { phase: 'chosen', choice: 'roll', ...base },
    { phase: 'chosen', choice: 'dont', ...base },
    { phase: 'die', choice: 'roll', face: 2, ...base },
    { phase: 'outcome', ...base, ...outcomeOf('roll', 2) },
    { phase: 'reveal', ...base, ...outcomeOf('roll', 2) },
  ];
  const events: Moment2Event[] = [
    { type: 'promise', promised: true },
    { type: 'promise', promised: false },
    { type: 'draw' },
    { type: 'choose', choice: 'roll' },
    { type: 'choose', choice: 'dont' },
    { type: 'throw' },
    { type: 'settle' },
    { type: 'reveal' },
    { type: 'reset' },
  ];
  const legal = (state: Moment2State, event: Moment2Event): boolean =>
    (state.phase === 'idle' && event.type === 'promise') ||
    (state.phase === 'promised' && event.type === 'draw') ||
    (state.phase === 'switchDrawn' && event.type === 'choose') ||
    (state.phase === 'chosen' && state.choice === 'roll' && event.type === 'throw') ||
    (state.phase === 'chosen' && state.choice === 'dont' && event.type === 'settle') ||
    (state.phase === 'die' && event.type === 'settle') ||
    (state.phase === 'outcome' && event.type === 'reveal') ||
    (state.phase === 'reveal' && event.type === 'reset');

  const cases = states.flatMap((state) =>
    events.filter((event) => !legal(state, event)).map((event) => [`${JSON.stringify(event)} in ${state.phase}`, state, event] as const),
  );

  it.each(cases)('%s', (_name, state, event) => {
    expect(moment2(state, event, noRng)).toBe(state);
  });
});
