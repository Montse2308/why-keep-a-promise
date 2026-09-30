import { describe, expect, it } from 'vitest';
import { beat, BUILT, builtBy, chapter, CHAPTER_IDS, CHAPTERS, LOCKED_BEATS, OPEN_CHAPTERS } from './chapters';
import { LAMP_FROM } from './design/film';
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

describe('beats (the cards of a chapter)', () => {
  it('are on the page only for the film’s first chapters, with no gap', () => {
    expect(BUILT.length).toBeGreaterThan(0);
    expect(BUILT.map((c) => c.id)).toEqual(CHAPTER_IDS.slice(0, BUILT.length));
    for (const c of CHAPTERS.slice(BUILT.length)) expect(c.beats).toEqual([]);
  });

  it('make up the length of their chapter, each with a positive length and its own id', () => {
    for (const c of BUILT) {
      const total = c.beats.reduce((sum, b) => sum + b.screens, 0);
      expect(total).toBeCloseTo(c.screens, 9);
      for (const b of c.beats) expect(b.screens).toBeGreaterThan(0);
      expect(new Set(c.beats.map((b) => b.id)).size).toBe(c.beats.length);
      for (const b of c.beats) expect(b.id).toMatch(/^[a-z-]+$/);
    }
  });

  it('are built only by their own phase or an earlier one', () => {
    const order = ['P1', 'P2', 'P3', 'P4'];
    const reached = Math.max(...BUILT.map((c) => order.indexOf(c.phase)));
    expect(builtBy(order[reached] as 'P1').length).toBeGreaterThanOrEqual(BUILT.length);
  });

  it('light the lamp exactly where chapter 7 starts in the open film, as ADR 0027 turns it on for chapters 7 and 8', () => {
    const total = OPEN_CHAPTERS.reduce((sum, c) => sum + c.screens, 0);
    const seventh = OPEN_CHAPTERS.slice(0, chapter('my-research').number).reduce((sum, c) => sum + c.screens, 0);
    expect(total).toBeCloseTo(36.75, 9);
    expect(LAMP_FROM * total).toBeCloseTo(seventh, 9);
  });

  it('are found by id, and an unknown one fails', () => {
    expect(beat('arrival', 'ask').screens).toBe(3);
    expect(() => beat('arrival', 'nope')).toThrow();
  });
});

describe('chapter 8, closing (ADR 0021)', () => {
  it('asks one last time, asks about the page’s own promise and rolls the credits, the film’s last beats', () => {
    expect(chapter('closing').beats.map((b) => b.id)).toEqual(['collect', 'asked', 'credits']);
    expect(CHAPTERS.at(-1)?.id).toBe('closing');
    expect(BUILT).toEqual(CHAPTERS);
  });
});

describe('chapter 7 and its lock (ADR 0026)', () => {
  const seventh = chapter('my-research');
  const open = OPEN_CHAPTERS.find((c) => c.id === 'my-research');

  it('shows the question, the engine and the sealed envelope in both states of the lock', () => {
    expect(open?.beats.map((b) => b.id)).toEqual(['question', 'engine', 'sealed']);
    expect(seventh.beats.slice(0, 3)).toEqual(open?.beats);
  });

  it('adds the finding after the envelope only with the lock open, and changes no other chapter', () => {
    expect(seventh.beats.slice(3)).toEqual(LOCKED_BEATS);
    expect(seventh.screens).toBeCloseTo((open?.screens ?? 0) + LOCKED_BEATS.reduce((sum, b) => sum + b.screens, 0), 9);
    CHAPTERS.forEach((c, i) => {
      if (c.id !== 'my-research') expect(c).toEqual(OPEN_CHAPTERS[i]);
    });
    // The finding's beats are its own: none shares an id with the open ones.
    for (const b of LOCKED_BEATS) expect(open?.beats.map((o) => o.id)).not.toContain(b.id);
  });
});
