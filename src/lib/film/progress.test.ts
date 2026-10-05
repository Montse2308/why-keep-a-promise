import { describe, expect, it } from 'vitest';
import { CHAPTER_IDS, CHAPTERS } from '../chapters';
import { LAST_CHAPTER, progressAt } from './progress';
import { LEAD } from './stage';
import { beatAt, chapterStart, TOTAL_SCREENS } from './timeline';

const samples = Array.from({ length: 400 }, (_, i) => (i / 399) * (TOTAL_SCREENS + 1));

describe("the film's progress", () => {
  it('has a bead for each of the nine chapters, and counts them as the cards do, from 0 to 8', () => {
    expect(progressAt(0).beads).toHaveLength(CHAPTER_IDS.length);
    expect(CHAPTERS.map((c) => c.number)).toEqual(CHAPTER_IDS.map((_, i) => i));
    expect(LAST_CHAPTER).toBe(8);
  });

  it('starts at chapter 0 and ends with every bead full, at chapter 8', () => {
    expect(progressAt(0).chapter).toBe(0);
    expect(progressAt(0).beads.slice(1).every((b) => b === 0)).toBe(true);
    for (const screens of [TOTAL_SCREENS - LEAD, TOTAL_SCREENS, TOTAL_SCREENS + 1]) {
      expect(progressAt(screens)).toEqual({ chapter: LAST_CHAPTER, beads: CHAPTERS.map(() => 1) });
    }
  });

  it('fills the beads in order: one only fills once the ones before it are full', () => {
    for (const screens of samples) {
      const { beads } = progressAt(screens);
      for (const bead of beads) {
        expect(bead).toBeGreaterThanOrEqual(0);
        expect(bead).toBeLessThanOrEqual(1);
      }
      beads.slice(1).forEach((bead, i) => {
        if (bead > 0) expect(beads[i]).toBe(1);
      });
    }
  });

  it('only ever fills, as the film goes on', () => {
    samples.slice(1).forEach((screens, i) => {
      const before = progressAt(samples[i] ?? 0).beads;
      progressAt(screens).beads.forEach((bead, j) => expect(bead).toBeGreaterThanOrEqual(before[j] ?? 0));
    });
  });

  it('names the chapter whose card has the stage, the one the stage plays', () => {
    for (const screens of samples) {
      const { chapter } = progressAt(screens);
      expect(CHAPTERS[chapter]?.id).toBe(beatAt(screens + LEAD).chapter);
    }
  });

  it('turns to a chapter as its first card comes up, with the bead before it full', () => {
    for (const c of CHAPTERS.slice(1)) {
      const arrives = chapterStart(c.id) - LEAD;
      expect(progressAt(arrives - 0.01).chapter).toBe(c.number - 1);
      expect(progressAt(arrives + 0.01).chapter).toBe(c.number);
      expect(progressAt(arrives).beads[c.number - 1]).toBeCloseTo(1, 12);
      expect(progressAt(arrives + 0.01).beads[c.number]).toBeGreaterThan(0);
    }
  });
});
