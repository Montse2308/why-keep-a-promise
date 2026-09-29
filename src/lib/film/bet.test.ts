import { describe, expect, it } from 'vitest';
import en from '../../i18n/en.json';
import es from '../../i18n/es.json';
import { BET_LABEL, BET_START, betAt, betMood, BETS, isBet } from './bet';

describe('the bet of chapter 5 (ADR 0023, interaction 7)', () => {
  it('has the five points of the recipients’ scale, each with its words in both languages', () => {
    expect(BETS).toEqual([0, 1, 2, 3, 4]);
    for (const bet of BETS) {
      expect(en[BET_LABEL[bet]]).toBeTruthy();
      expect(es[BET_LABEL[bet]]).toBeTruthy();
    }
    expect(new Set(BETS.map((bet) => en[BET_LABEL[bet]])).size).toBe(5);
  });

  it('starts in the middle, and places each point on the scale read from 0 to 100', () => {
    expect(BET_START).toBe(2);
    expect(BETS.map(betAt)).toEqual([0, 25, 50, 75, 100]);
    expect(isBet(3)).toBe(true);
    expect(isBet(5)).toBe(false);
    expect(isBet(1.5)).toBe(false);
  });

  it('lets the circle hope or worry about the roll, and nothing more', () => {
    expect(betMood(null)).toBe('worried');
    expect(BETS.map(betMood)).toEqual(['worried', 'worried', 'neutral', 'happy', 'happy']);
  });
});
