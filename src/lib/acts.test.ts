import { describe, expect, it } from 'vitest';
import { ACTS, actForSubpage } from './acts';
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
});
