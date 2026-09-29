import { describe, expect, it } from 'vitest';
import en from '../../i18n/en.json';
import es from '../../i18n/es.json';
import type { UiKey } from '../i18n';
import { COLUMNS, conclusion, reduce, START } from '../pd/bestReply';
import { MOVES, PAYOFFS, payoff } from '../pd/game';
import { roundOf } from '../pd/round';
import { cellBox, noteFor, STACK_MAX } from './board';
import { outcomeOf } from '../table/decision';
import { DIE_FACES, PAYOFFS as TABLE } from '../table/game';
import { fill } from '../template';
import { askLine, conclusionLine, decisionLine, pickLine, roundLine } from './lines';
import { FILM_VALUES } from './values';

const dictionaries = { en, es } as const;
const tr = (locale: keyof typeof dictionaries) => (key: UiKey) => dictionaries[locale][key];
const numbers = (text: string) => (text.match(/\d+/g) ?? []).map(Number);

describe('the lines of chapter 1, from the pure modules (rule (k))', () => {
  it.each(['en', 'es'] as const)('%s: the round says what each player got', (locale) => {
    for (const move of MOVES) {
      const line = roundLine(tr(locale), roundOf(move));
      expect(numbers(line)).toEqual([payoff(move, 'defect').you, payoff(move, 'defect').other]);
    }
  });

  it.each(['en', 'es'] as const)('%s: each pick names its payoff and the one it gave up', (locale) => {
    COLUMNS.forEach((other, i) => {
      for (const move of MOVES) {
        const state = reduce(COLUMNS.slice(0, i).reduce((s) => reduce(s, { type: 'pick', move }), START), { type: 'pick', move });
        const pick = state.picks[i];
        if (!pick) throw new Error('no pick');
        expect(pick.other).toBe(other);
        expect(numbers(pickLine(tr(locale), pick))).toEqual([payoff(move, other).you, payoff(move === 'cooperate' ? 'defect' : 'cooperate', other).you]);
      }
    });
  });

  it.each(['en', 'es'] as const)('%s: both columns done, defecting pays more in each: T against R, and P against S', (locale) => {
    const done = conclusion(COLUMNS.reduce((s) => reduce(s, { type: 'pick', move: 'cooperate' }), START));
    if (!done) throw new Error('no conclusion');
    const line = conclusionLine(tr(locale), done);
    expect(numbers(line)).toEqual([PAYOFFS.T, PAYOFFS.R, PAYOFFS.P, PAYOFFS.S]);
    expect(line).toContain(dictionaries[locale]['film.doing.defect']);
  });

  it.each(['en', 'es'] as const)('%s: asks about each column in turn', (locale) => {
    expect(askLine(tr(locale), 'cooperate')).not.toBe(askLine(tr(locale), 'defect'));
  });
});

describe('the board and the coins', () => {
  it('puts your move in the rows and the other’s in the columns', () => {
    expect(cellBox('cooperate', 'cooperate').x).toBe(cellBox('defect', 'cooperate').x);
    expect(cellBox('cooperate', 'cooperate').y).toBe(cellBox('cooperate', 'defect').y);
    expect(cellBox('defect', 'defect').x).toBeGreaterThan(cellBox('defect', 'cooperate').x);
    expect(cellBox('defect', 'defect').y).toBeGreaterThan(cellBox('cooperate', 'defect').y);
  });

  it('prints one note per marked cell, where both end up first', () => {
    expect(noteFor(['best', 'equilibrium'])).toBe('equilibrium');
    expect(noteFor(['pick', 'best'])).toBe('best');
    expect(noteFor(['better'])).toBe('better');
    expect(noteFor(['pick'])).toBeNull();
    expect(noteFor([])).toBeNull();
  });

  it('stacks up to the most anyone takes in the film, keeping the 14', () => {
    expect(STACK_MAX).toBe(14);
  });

  it('fills the film’s numbers from the dilemma’s payoffs', () => {
    expect(FILM_VALUES).toMatchObject(PAYOFFS);
  });
});

describe('the decision of chapter 3, from PAYOFFS (rule (k))', () => {
  const T = TABLE;

  it('fills the film’s numbers for the decision from Vanberg’s payoffs', () => {
    expect(FILM_VALUES).toMatchObject({
      dont: T.dont.you,
      dontother: T.dont.other,
      roll: T.roll.you,
      rollother: T.roll.other.success,
      failface: T.roll.failureFaces[0],
      failother: T.roll.other.failure,
      cost: T.dont.you - T.roll.you,
      expected: 10,
    });
  });

  it.each(['en', 'es'] as const)('%s: the tickets say what each choice pays, in PAYOFFS order', (locale) => {
    const d = dictionaries[locale];
    expect(numbers(fill(d['film.ticket.roll.detail'], FILM_VALUES))).toEqual([T.roll.you, T.roll.other.success, ...T.roll.failureFaces]);
    expect(numbers(fill(d['film.ticket.keep'], FILM_VALUES))).toEqual([T.dont.you]);
    expect(numbers(fill(d['film.ticket.keep.detail'], FILM_VALUES))).toEqual([T.dont.you, T.dont.other]);
  });

  it.each(['en', 'es'] as const)('%s: each face of the die leads to its own line, naming the face apart from the payoffs', (locale) => {
    for (const face of DIE_FACES) {
      const outcome = outcomeOf('roll', face);
      const line = decisionLine(tr(locale), outcome);
      const failed = (T.roll.failureFaces as readonly number[]).includes(face);
      const expected = failed ? [face, outcome.realized.you] : [face, outcome.realized.other, outcome.realized.you];
      expect(numbers(line)).toEqual([...expected, FILM_VALUES.cost, FILM_VALUES.expected]);
    }
    expect(numbers(decisionLine(tr(locale), outcomeOf('dont', null)))).toEqual([T.dont.you, T.dont.other]);
  });
});
