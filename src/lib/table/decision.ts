/**
 * The decision at the table (chapter 3; ADR 0023, interaction 5): keep the money or roll the die,
 * with Vanberg's payoffs (`PAYOFFS`). The visitor decides once:
 * idle → chosen(roll | dont) → [roll only: die] → outcome.
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

export type DecisionState =
  | { readonly phase: 'idle' }
  | { readonly phase: 'chosen'; readonly choice: Choice }
  | { readonly phase: 'die'; readonly choice: 'roll'; readonly face: Face }
  | ({ readonly phase: 'outcome' } & Outcome);

export type DecisionEvent = { readonly type: 'choose'; readonly choice: Choice } | { readonly type: 'throw' } | { readonly type: 'settle' };

export const UNDECIDED: DecisionState = { phase: 'idle' };

export function outcomeOf(choice: Choice, face: Face | null): Outcome {
  return { choice, face, expected: expectedPayoffs(choice), realized: realizedPayoffs(choice, face) };
}

export function decide(state: DecisionState, event: DecisionEvent, rng: Rng): DecisionState {
  switch (event.type) {
    case 'choose':
      return state.phase === 'idle' ? { phase: 'chosen', choice: event.choice } : state;
    case 'throw':
      return state.phase === 'chosen' && state.choice === 'roll' ? { phase: 'die', choice: 'roll', face: throwDie(rng) } : state;
    case 'settle':
      if (state.phase === 'chosen' && state.choice === 'dont') return { phase: 'outcome', ...outcomeOf('dont', null) };
      if (state.phase === 'die') return { phase: 'outcome', ...outcomeOf('roll', state.face) };
      return state;
  }
}
