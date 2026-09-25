/**
 * Moment 1 (acts 1–2): Roll or Don't Roll, no promise.
 * idle → chosen(roll | dont) → [roll only: die] → outcome → idle
 * An event that is illegal in the current state returns that same state object.
 */
import type { Fraction } from './fraction';
import { expectedPayoffs, realizedPayoffs, throwDie, type Choice, type Face, type Payoffs, type Rng } from './game';

export interface Outcome {
  readonly choice: Choice;
  /** The face the die showed; `null` after Don't Roll. */
  readonly face: Face | null;
  readonly expected: Payoffs<Fraction>;
  readonly realized: Payoffs<number>;
}

export type Moment1State =
  | { readonly phase: 'idle' }
  | { readonly phase: 'chosen'; readonly choice: Choice }
  | { readonly phase: 'die'; readonly choice: 'roll'; readonly face: Face }
  | ({ readonly phase: 'outcome' } & Outcome);

export type Moment1Event =
  | { readonly type: 'choose'; readonly choice: Choice }
  | { readonly type: 'throw' }
  | { readonly type: 'settle' }
  | { readonly type: 'reset' };

export const MOMENT1_START: Moment1State = { phase: 'idle' };

export function outcomeOf(choice: Choice, face: Face | null): Outcome {
  return { choice, face, expected: expectedPayoffs(choice), realized: realizedPayoffs(choice, face) };
}

export function moment1(state: Moment1State, event: Moment1Event, rng: Rng): Moment1State {
  switch (event.type) {
    case 'choose':
      return state.phase === 'idle' ? { phase: 'chosen', choice: event.choice } : state;
    case 'throw':
      return state.phase === 'chosen' && state.choice === 'roll'
        ? { phase: 'die', choice: 'roll', face: throwDie(rng) }
        : state;
    case 'settle':
      if (state.phase === 'chosen' && state.choice === 'dont') return { phase: 'outcome', ...outcomeOf('dont', null) };
      if (state.phase === 'die') return { phase: 'outcome', ...outcomeOf('roll', state.face) };
      return state;
    case 'reset':
      return state.phase === 'outcome' ? MOMENT1_START : state;
  }
}
