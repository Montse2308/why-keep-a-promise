import { describe, expect, it } from 'vitest';
import en from '../../i18n/en.json';
import { SWITCHED_PARTNER_RECEIVED_PROMISE } from '../table/expectation';
import { CHOICES, type Choice } from '../table/game';
import { current, DEALT, decide, DECK, DECK_MAX, holdsPromise, promiseAfter, tally } from './deck';

const play = (...choices: Choice[]) => choices.reduce(decide, DEALT);

describe('the deck of chapter 5 is not a repeated dilemma (rule (f), ADR 0023)', () => {
  it('is short, and every card is a different person', () => {
    expect(DECK.length).toBeLessThanOrEqual(DECK_MAX);
    expect(new Set(DECK.map((card) => card.person)).size).toBe(DECK.length);
    expect(new Set(DECK.map((card) => card.message)).size).toBe(DECK.length);
    for (const card of DECK) expect(Object.keys(en)).toContain(card.message);
  });

  it('keeps only one decision per card: no payoff is carried from one card to the next', () => {
    const state = play('roll', 'dont');
    expect(Object.keys(state)).toEqual(['choices']);
    expect(state.choices).toEqual(['roll', 'dont']);
  });

  it('ends by counting the promises kept, never a sum of payoffs', () => {
    const done = play(...DECK.map((card) => (card.partner === 'same' ? 'roll' : 'dont')));
    expect(Object.keys(tally(done)).sort()).toEqual(['kept', 'made']);
    expect(tally(done)).toEqual({ kept: 3, made: 3 });
    expect(tally(play(...DECK.map(() => 'dont' as const)))).toEqual({ kept: 0, made: 3 });
    expect(tally(DEALT)).toEqual({ kept: 0, made: 3 });
  });

  it('asks one card at a time, each once, and nothing after the last', () => {
    expect(current(DEALT)).toBe(0);
    expect(current(play('roll'))).toBe(1);
    const done = play(...DECK.map(() => 'roll' as const));
    expect(current(done)).toBeNull();
    expect(decide(done, 'dont')).toBe(done);
  });
});

describe('the switch on the cards (rule (k))', () => {
  it('mixes the two cases, and opens as the blackout left the table', () => {
    expect(DECK[0]?.partner).toBe('switched');
    const switched = DECK.filter((card) => card.partner === 'switched').length;
    expect(switched).toBeGreaterThan(0);
    expect(switched).toBeLessThan(DECK.length);
  });

  it('always uses the fixed illustrative case: the new partner holds a promise from someone else', () => {
    expect(SWITCHED_PARTNER_RECEIVED_PROMISE).toBe(true);
    for (const card of DECK) expect(holdsPromise(card)).toBe(true);
  });

  it('keeps or breaks the visitor’s word only with the person they promised', () => {
    for (const choice of CHOICES) {
      expect(promiseAfter({ person: 0, partner: 'switched', message: 'film.deck.message.1' }, choice)).toBeNull();
    }
    expect(promiseAfter({ person: 0, partner: 'same', message: 'film.deck.message.2' }, 'roll')).toBe('kept');
    expect(promiseAfter({ person: 0, partner: 'same', message: 'film.deck.message.2' }, 'dont')).toBe('broken');
  });
});
