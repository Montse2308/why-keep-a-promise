/**
 * What the recipient expects of the dictator in moment 2. It depends only on whether that person
 * received a promise, not on who made it.
 *
 * TODO(vanberg-beliefs): the published belief levels from Vanberg (2008) are not in
 * docs/sources.md yet. Until they are, the meter shows qualitative levels and no numbers.
 */

export type ExpectationLevel = 'lower' | 'higher';
export type Partner = 'same' | 'switched';
/** Who made the promise the recipient holds, if any. */
export type Promiser = 'you' | 'another-dictator' | null;

export interface Recipient {
  readonly receivedPromise: boolean;
  readonly promiser: Promiser;
  readonly expectation: ExpectationLevel;
}

/**
 * The fixed illustrative case for a switched partner, which the interface states outright:
 * "your new partner received a promise from another dictator".
 */
export const SWITCHED_PARTNER_RECEIVED_PROMISE = true;

/** Where each level sits on the meter, from 0 to 1: placement only, not data (see TODO above). */
export const METER_POSITION: Record<ExpectationLevel, number> = { lower: 1 / 3, higher: 2 / 3 };

export function expectationFor(receivedPromise: boolean): ExpectationLevel {
  return receivedPromise ? 'higher' : 'lower';
}

/** The recipient the visitor faces once the partner draw is known. */
export function recipientAfterDraw(promised: boolean, partner: Partner): Recipient {
  const receivedPromise = partner === 'same' ? promised : SWITCHED_PARTNER_RECEIVED_PROMISE;
  const promiser: Promiser = !receivedPromise ? null : partner === 'same' ? 'you' : 'another-dictator';
  return { receivedPromise, promiser, expectation: expectationFor(receivedPromise) };
}
