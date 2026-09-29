/**
 * The game at the table: Vanberg's (2008) Roll / Don't Roll. The dictator (the visitor) chooses;
 * the recipient (the other) only receives.
 *
 * Payoffs and the die rule: Vanberg (2008), Suppl. A, p. 2, "Payoffs From the Decision"
 * (docs/sources.md).
 */
import { add, complement, fraction, multiply, type Fraction } from './fraction';

export type Choice = 'roll' | 'dont';
export const CHOICES: readonly Choice[] = ['roll', 'dont'];

export type Face = 1 | 2 | 3 | 4 | 5 | 6;
export const DIE_FACES: readonly Face[] = [1, 2, 3, 4, 5, 6];

/** A random source in [0, 1). The page passes `Math.random`; tests pass a fixed sequence. */
export type Rng = () => number;

export interface Payoffs<T> {
  readonly you: T;
  readonly other: T;
}

export const PAYOFFS = {
  roll: {
    you: 10,
    /** The recipient gets `success`, unless the die shows one of `failureFaces`. */
    other: { success: 12, failure: 0 },
    failureFaces: [1] as readonly Face[],
  },
  dont: { you: 14, other: 0 },
} as const;

/** A payoff and the exact probability of getting it. */
export interface Branch {
  readonly payoff: number;
  readonly probability: Fraction;
}

const CERTAIN = fraction(1);

/** Probability that the die spares the recipient: 5/6. */
export const ROLL_SUCCESS: Fraction = fraction(
  DIE_FACES.length - PAYOFFS.roll.failureFaces.length,
  DIE_FACES.length,
);

/** Every payoff each role can get from a choice, with its probability. */
export function branches(choice: Choice): Payoffs<readonly Branch[]> {
  if (choice === 'dont') {
    return {
      you: [{ payoff: PAYOFFS.dont.you, probability: CERTAIN }],
      other: [{ payoff: PAYOFFS.dont.other, probability: CERTAIN }],
    };
  }
  return {
    you: [{ payoff: PAYOFFS.roll.you, probability: CERTAIN }],
    other: [
      { payoff: PAYOFFS.roll.other.success, probability: ROLL_SUCCESS },
      { payoff: PAYOFFS.roll.other.failure, probability: complement(ROLL_SUCCESS) },
    ],
  };
}

/** Exact expected value: for the recipient after Roll, 12 · 5/6 + 0 · 1/6 = 10. */
export function expectedValue(options: readonly Branch[]): Fraction {
  return options.reduce((sum, { payoff, probability }) => add(sum, multiply(fraction(payoff), probability)), fraction(0));
}

export function expectedPayoffs(choice: Choice): Payoffs<Fraction> {
  const { you, other } = branches(choice);
  return { you: expectedValue(you), other: expectedValue(other) };
}

/** What each role actually gets. Roll needs the face the die showed. */
export function realizedPayoffs(choice: Choice, face: Face | null): Payoffs<number> {
  if (choice === 'dont') return { you: PAYOFFS.dont.you, other: PAYOFFS.dont.other };
  if (face === null) throw new Error('Roll needs a die face');
  const failed = PAYOFFS.roll.failureFaces.includes(face);
  return { you: PAYOFFS.roll.you, other: failed ? PAYOFFS.roll.other.failure : PAYOFFS.roll.other.success };
}

function draw(rng: Rng): number {
  const value = rng();
  if (!(value >= 0 && value < 1)) throw new RangeError(`RNG must return a number in [0, 1), got ${value}`);
  return value;
}

export function throwDie(rng: Rng): Face {
  return DIE_FACES[Math.floor(draw(rng) * DIE_FACES.length)] as Face;
}
