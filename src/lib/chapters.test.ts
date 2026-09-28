import { describe, expect, it } from 'vitest';
import { builtBy, chapter, CHAPTER_IDS, CHAPTERS } from './chapters';
import { spans } from './film/spans';

describe('the film’s chapters (ADR 0021)', () => {
  it('are the nine chapters, in the order of the plan', () => {
    expect(CHAPTER_IDS).toEqual([
      'arrival',
      'two-rooms',
      'talk',
      'fold',
      'two-voices',
      'blackout',
      'real-people',
      'my-research',
      'closing',
    ]);
    expect(CHAPTERS.map((c) => c.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('share the scroll without gaps', () => {
    const all = spans(CHAPTERS);
    expect(all).toHaveLength(9);
    expect(all.at(-1)?.to).toBe(1);
  });

  it('are built in the phases of docs/phases.md, in film order', () => {
    expect(builtBy('P1').map((c) => c.id)).toEqual(['arrival']);
    expect(builtBy('P2').map((c) => c.id)).toEqual(['arrival', 'two-rooms', 'talk', 'fold']);
    expect(builtBy('P4')).toHaveLength(9);
    expect(chapter('my-research').phase).toBe('P4');
    expect(() => chapter('nope' as never)).toThrow();
  });
});
