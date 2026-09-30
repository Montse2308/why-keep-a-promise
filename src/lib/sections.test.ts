import { describe, expect, it } from 'vitest';
import { ACTS } from './acts';
import { homeBlocks, homeIds, SECTIONS } from './sections';
import { SLOTS } from './subpages';

describe('home sections (ADR 0019)', () => {
  it('puts About last; "The research" is told by chapter 7 now', () => {
    expect(homeIds()).toEqual(['question', 'dilemma', 'two-reasons', 'vanberg', 'finding', 'how-its-built', 'about']);
    expect(SECTIONS.map((section) => section.id)).toEqual(['about']);
  });

  it('keeps the six acts in their order, untouched', () => {
    expect(homeBlocks().flatMap((block) => (block.kind === 'act' ? [block.act] : []))).toEqual(ACTS);
  });

  it('never reuses an act id', () => {
    const ids = homeIds();
    expect(new Set(ids).size).toBe(ids.length);
    for (const section of SECTIONS) expect(ACTS.map((act) => act.id)).not.toContain(section.id);
  });

  it('gives each section slots of its own, known to the prose splitter', () => {
    const used = SECTIONS.flatMap((section) => section.slots);
    expect(new Set(used).size).toBe(used.length);
    for (const slot of used) expect(SLOTS).toContain(slot);
  });

  it('rejects a section that follows no act', () => {
    expect(() => homeBlocks(ACTS, [{ id: 'about', titleKey: 'section.about.title', after: 'nowhere' as never, slots: [] }])).toThrow(
      'follows an unknown act',
    );
  });
});
