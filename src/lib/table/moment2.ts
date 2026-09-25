/**
 * Moment 2 (act 4): promise or not, then a partner draw, then Roll or Don't Roll.
 * idle → promised(yes | no) → switchDrawn(same | switched), P = 1/2 → chosen → [roll only: die]
 *   → outcome → reveal → idle
 * An event that is illegal in the current state returns that same state object.
 */
import { fraction, type Fraction } from './fraction';
import { drawWith, throwDie, type Choice, type Face, type Rng } from './game';
import { recipientAfterDraw, type Partner, type Recipient } from './expectation';
import { outcomeOf, type Outcome } from './moment1';

/**
 * Probability that the visitor is switched to a new partner: Vanberg (2008), Suppl. A, p. 2, Step 3.
 * The switch happens after roles are assigned, and only the dictator learns whether it happened.
 */
export const SWITCH_PROBABILITY: Fraction = fraction(1, 2);

interface Drawn {
  readonly promised: boolean;
  readonly partner: Partner;
  readonly recipient: Recipient;
}

export type Moment2State =
  | { readonly phase: 'idle' }
  | { readonly phase: 'promised'; readonly promised: boolean }
  | ({ readonly phase: 'switchDrawn' } & Drawn)
  | ({ readonly phase: 'chosen'; readonly choice: Choice } & Drawn)
  | ({ readonly phase: 'die'; readonly choice: 'roll'; readonly face: Face } & Drawn)
  | ({ readonly phase: 'outcome' } & Drawn & Outcome)
  | ({ readonly phase: 'reveal' } & Drawn & Outcome);

export type Moment2Event =
  | { readonly type: 'promise'; readonly promised: boolean }
  | { readonly type: 'draw' }
  | { readonly type: 'choose'; readonly choice: Choice }
  | { readonly type: 'throw' }
  | { readonly type: 'settle' }
  | { readonly type: 'reveal' }
  | { readonly type: 'reset' };

export const MOMENT2_START: Moment2State = { phase: 'idle' };

function drawnOf(state: Drawn): Drawn {
  return { promised: state.promised, partner: state.partner, recipient: state.recipient };
}

export function moment2(state: Moment2State, event: Moment2Event, rng: Rng): Moment2State {
  switch (event.type) {
    case 'promise':
      return state.phase === 'idle' ? { phase: 'promised', promised: event.promised } : state;
    case 'draw': {
      if (state.phase !== 'promised') return state;
      const partner: Partner = drawWith(SWITCH_PROBABILITY, rng) ? 'switched' : 'same';
      return { phase: 'switchDrawn', promised: state.promised, partner, recipient: recipientAfterDraw(state.promised, partner) };
    }
    case 'choose':
      return state.phase === 'switchDrawn' ? { phase: 'chosen', choice: event.choice, ...drawnOf(state) } : state;
    case 'throw':
      return state.phase === 'chosen' && state.choice === 'roll'
        ? { phase: 'die', choice: 'roll', face: throwDie(rng), ...drawnOf(state) }
        : state;
    case 'settle':
      if (state.phase === 'chosen' && state.choice === 'dont') {
        return { phase: 'outcome', ...drawnOf(state), ...outcomeOf('dont', null) };
      }
      if (state.phase === 'die') return { phase: 'outcome', ...drawnOf(state), ...outcomeOf('roll', state.face) };
      return state;
    case 'reveal':
      return state.phase === 'outcome' ? { ...state, phase: 'reveal' } : state;
    case 'reset':
      return state.phase === 'reveal' ? MOMENT2_START : state;
  }
}
