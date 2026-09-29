import { describe, expect, it } from 'vitest';
import en from '../../i18n/en.json';
import es from '../../i18n/es.json';
import type { UiKey } from '../i18n';
import { COLUMNS, conclusion, reduce, START } from '../pd/bestReply';
import { MOVES, PAYOFFS, payoff } from '../pd/game';
import { roundOf } from '../pd/round';
import { cellBox, noteFor, STACK_MAX } from './board';
import { askLine, conclusionLine, pickLine, roundLine } from './lines';
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
