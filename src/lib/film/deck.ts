/**
 * Chapter 5's deck (ADR 0023, interaction 6): a short deck of cards, each a different person across
 * the table with the message they received. With some, the visitor chatted and promised; with the
 * others, the lights went out and the partner was switched, always in the fixed illustrative case
 * (`SWITCHED_PARTNER_RECEIVED_PROMISE`): the new partner received a promise from someone else who
 * decides, and the visitor's own promise went to someone who left.
 *
 * The visitor decides each card once, with Vanberg's payoffs (`PAYOFFS`). It is not a repeated
 * dilemma (rule (f)): no card knows the others, and at the end the film counts the promises the
 * visitor kept, never a sum of payoffs.
 */
import type { UiKey } from '../i18n';
import { SWITCHED_PARTNER_RECEIVED_PROMISE, type Partner } from '../table/expectation';
import type { Choice } from '../table/game';

export interface Card {
  /** A different person on every card: nobody comes back. */
  readonly person: number;
  /** The person the visitor chatted with and promised, or a new partner after the lights went out. */
  readonly partner: Partner;
  /** What that person was told: by the visitor, or, after a switch, by someone else. */
  readonly message: UiKey;
}

/** Six people, three of them after a switch; it opens as the blackout left the table. */
export const DECK: readonly Card[] = [
  { person: 1, partner: 'switched', message: 'film.deck.message.1' },
  { person: 2, partner: 'same', message: 'film.deck.message.2' },
  { person: 3, partner: 'same', message: 'film.deck.message.3' },
  { person: 4, partner: 'switched', message: 'film.deck.message.4' },
  { person: 5, partner: 'same', message: 'film.deck.message.5' },
  { person: 6, partner: 'switched', message: 'film.deck.message.6' },
];

/** The most cards the deck may hold (ADR 0023). */
export const DECK_MAX = 8;

/** Every card's person holds a promise: their own partner's, or, after a switch, someone else's. */
export const holdsPromise = (card: Card): boolean => card.partner === 'same' || SWITCHED_PARTNER_RECEIVED_PROMISE;

/** The decisions so far, one per card, in order. Nothing else: no payoff is carried from card to card. */
export interface DeckState {
  readonly choices: readonly Choice[];
}

export const DEALT: DeckState = { choices: [] };

/** The card waiting for a decision, or null once every card is decided. */
export function current(state: DeckState): number | null {
  return state.choices.length < DECK.length ? state.choices.length : null;
}

/** Decides the waiting card; once the deck is done, it stays as it was. */
export function decide(state: DeckState, choice: Choice): DeckState {
  return current(state) === null ? state : { choices: [...state.choices, choice] };
}

/**
 * What a decision does to the visitor's word on that card: kept or broken with the person they
 * promised, and nothing with a new partner, whom they never promised anything.
 */
export function promiseAfter(card: Card, choice: Choice): 'kept' | 'broken' | null {
  if (card.partner === 'switched') return null;
  return choice === 'roll' ? 'kept' : 'broken';
}

/** How many of the promises made to the person across the table the visitor kept, of how many. */
export function tally(state: DeckState): { readonly kept: number; readonly made: number } {
  const made = DECK.filter((card) => card.partner === 'same').length;
  const kept = state.choices.filter((choice, i) => {
    const card = DECK[i];
    return card !== undefined && promiseAfter(card, choice) === 'kept';
  }).length;
  return { kept, made };
}
