/**
 * What the recipient expects of the dictator in moment 2: the recipient's first-order belief
 * (`pfob`) in Vanberg (2008), their bet that the dictator rolls, on a 5-point scale coded 0–1
 * (Suppl. B, pp. 2–3, Screen 5B), averaged over recipients in switch.dat (docs/sources.md).
 * It depends only on whether that person received a promise, not on who made it.
 */
import { fraction, multiply, type Fraction } from './fraction';

export type Partner = 'same' | 'switched';
/** Who made the promise the recipient holds, if any. */
export type Promiser = 'you' | 'another-dictator' | null;

export interface Recipient {
  readonly receivedPromise: boolean;
  readonly promiser: Promiser;
  /** Mean bet on the 0–1 scale, exact. */
  readonly expectation: Fraction;
}

/** Sum of the recipients' bets (0–1) and how many recipients, by whether they received a promise. */
export const RECIPIENT_BELIEFS = {
  promise: { sum: fraction(831, 2), n: 603 }, // 415.5 / 603
  none: { sum: fraction(319, 4), n: 165 }, // 79.75 / 165
} as const;

/**
 * The same bets of the recipients who received a promise, split by whether their dictator was
 * switched, which they never knew: 0.696 without a switch (n = 309) and 0.682 with one (n = 294),
 * the "70" and "68" of docs/sources.md (`vanberg-beliefs`). On a scale coded in quarters, those
 * means leave one sum each, and the two add up to the recipients' total above.
 */
export const PROMISED_RECIPIENT_BELIEFS: Record<Partner, { readonly sum: Fraction; readonly n: number }> = {
  same: { sum: fraction(215), n: 309 },
  switched: { sum: fraction(401, 2), n: 294 },
};

/** What the promised recipients bet on average, by whether their dictator was switched. */
export function promisedExpectation(partner: Partner): Fraction {
  const { sum, n } = PROMISED_RECIPIENT_BELIEFS[partner];
  return multiply(sum, fraction(1, n));
}

/**
 * The recipient's five-point scale (Suppl. B, pp. 2–3, Screen 5B), from "certainly doesn't roll"
 * to "certainly rolls", coded in quarters from 0 to 1.
 */
export const SCALE_POINTS = [0, 1, 2, 3, 4] as const;
export type ScalePoint = (typeof SCALE_POINTS)[number];

export const scaleValue = (point: ScalePoint): Fraction => fraction(point, 4);

/**
 * The fixed illustrative case for a switched partner, which the interface states outright:
 * "your new partner received a promise from another dictator".
 */
export const SWITCHED_PARTNER_RECEIVED_PROMISE = true;

export function expectationFor(receivedPromise: boolean): Fraction {
  const { sum, n } = RECIPIENT_BELIEFS[receivedPromise ? 'promise' : 'none'];
  return multiply(sum, fraction(1, n));
}

/** The recipient the visitor faces once the partner draw is known. */
export function recipientAfterDraw(promised: boolean, partner: Partner): Recipient {
  const receivedPromise = partner === 'same' ? promised : SWITCHED_PARTNER_RECEIVED_PROMISE;
  const promiser: Promiser = !receivedPromise ? null : partner === 'same' ? 'you' : 'another-dictator';
  return { receivedPromise, promiser, expectation: expectationFor(receivedPromise) };
}
