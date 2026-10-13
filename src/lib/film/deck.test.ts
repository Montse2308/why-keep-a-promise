import { describe, expect, it } from 'vitest';
import decisions from '../../../docs/decisions/README.md?raw';
import beatComponent from '../../components/film/Beat.astro?raw';
import contextScript from '../../components/film/context.ts?raw';
import blackoutComponent from '../../components/film/chapters/Blackout.astro?raw';
import blackoutScript from '../../components/film/chapters/blackout.ts?raw';
import realPeopleComponent from '../../components/film/chapters/RealPeople.astro?raw';
import curveComponent from '../../components/curve/Curve.astro?raw';
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

describe('mobile cards, sliders and the last card of the deck (ADR 0046)', () => {
  it('records ADR 0046 in the decisions index', () => {
    expect(decisions).toContain('[0046](0046-card-scrolls-inside-on-a-phone.md)');
  });

  it('hides the last card’s tickets and the swipe hint once decided, and moves focus to the tally', () => {
    expect(blackoutComponent).toContain('tabindex="-1" aria-live="polite" data-deck-out');
    expect(blackoutScript).toContain("card.querySelector<HTMLElement>('.deck-card__tickets')?.setAttribute('hidden', '');");
    expect(blackoutScript).toContain('if (swipe) swipe.hidden = true;');
    expect(blackoutScript).toContain('film.focus(deckOut, { preventScroll: true });');
  });

  it('bounds a mobile card by the free space below the corner and by its own beat, leaving roll, envelope and compact laptops out', () => {
    expect(beatComponent).toContain('@media (max-width: 48rem), (max-height: 40rem) and (pointer: coarse)');
    expect(beatComponent).toContain(':global(html.js) .beat:where(:not(.beat--roll)) .card:where(:not(.card--envelope))');
    expect(beatComponent).toContain('calc(100svh - var(--side-top) - var(--space-4) - env(safe-area-inset-bottom, 0px))');
    expect(beatComponent).toContain('calc((var(--screens) * 100svh) - 35svh)');
    expect(beatComponent).toContain('overflow-x: hidden;');
    expect(beatComponent).toContain('overscroll-behavior: auto;');
  });

  it('scrolls an overflowing card internally to its bottom on a choice, without moving the page', () => {
    expect(contextScript).toContain("card.scrollTo({ top: card.scrollHeight, behavior: 'smooth' });");
    expect(contextScript).not.toContain('scrollIntoView');
    expect(blackoutScript).toContain('revealCard(deckOut);');
  });

  it('lets a vertical drag on any slider of the film scroll the page', () => {
    expect(blackoutComponent).toMatch(/\.bet__range \{[^}]*touch-action: pan-y;/);
    expect(realPeopleComponent).toMatch(/\.guess__range \{[^}]*touch-action: pan-y;/);
    expect(curveComponent).toMatch(/\.cv-slider \{[^}]*touch-action: pan-y;/);
  });
});

