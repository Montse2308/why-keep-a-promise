import { describe, expect, it } from 'vitest';
import { ACTS, actForSubpage } from './acts';
import { CHAPTER_IDS } from './chapters';
import { SUBPAGES } from './routes';

describe('acts', () => {
  it('has six acts in the decided order', () => {
    expect(ACTS.map((act) => act.id)).toEqual([
      'question',
      'dilemma',
      'two-reasons',
      'vanberg',
      'finding',
      'how-its-built',
    ]);
  });

  it('links every subpage from exactly one act', () => {
    for (const subpage of SUBPAGES) {
      expect(ACTS.filter((act) => act.deeper === subpage)).toHaveLength(1);
      expect(actForSubpage(subpage).deeper).toBe(subpage);
    }
  });

  it('gives every act the chapter that stands for it now, in the film’s order; act 6, the credits', () => {
    expect(ACTS.map((act) => act.film)).toEqual(['arrival', 'two-rooms', 'two-voices', 'real-people', 'my-research', 'closing']);
    const order = ACTS.map((act) => CHAPTER_IDS.indexOf(act.film));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });
});
