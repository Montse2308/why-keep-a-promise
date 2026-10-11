import { describe, expect, it } from 'vitest';
import r6 from 'dilema-prisionero/results/r6-curve-illustration.json';
import component from '../../components/finding/CompeteStill.astro?raw';
import { NARROW, STACK, WIDE, WIDE_FROM, levelsOf, stack } from './still';

describe('stack', () => {
  it('gives one dot per run, at its share of personal guilt', () => {
    const dots = stack([0, 100, 200]);
    expect(dots.map((dot) => [dot.run, dot.x])).toEqual([
      [0, 0],
      [1, 0.5],
      [2, 1],
    ]);
  });

  it('stacks runs that end at the same count, in the order of their seeds', () => {
    const dots = stack([0, 37, 0, 0]);
    expect(dots.map((dot) => [dot.run, dot.level, dot.column])).toEqual([
      [0, 0, 0],
      [1, 0, 0],
      [2, 1, 0],
      [3, 2, 0],
    ]);
  });

  it('lifts a dot that would touch one at a near count, and leaves one far enough on the axis', () => {
    // 4 of 200 is 2 %, within GAP of 0; 20 of 200 is 10 %, clear of both.
    const dots = stack([0, 4, 20]);
    expect(dots.map((dot) => dot.level)).toEqual([0, 1, 0]);
    expect(NARROW.gap).toBeGreaterThan(4 / 200);
  });

  it('goes on in another column past STACK, toward the middle of the axis', () => {
    const left = stack(Array.from({ length: 20 }, () => 0));
    expect(left.map((dot) => dot.level)).toEqual([...Array.from({ length: STACK }, (_, i) => i), ...Array.from({ length: STACK }, (_, i) => i)]);
    expect(left.at(-1)).toMatchObject({ column: 1, side: 1, x: 0 });
    const right = stack(Array.from({ length: 14 }, () => 200));
    expect(right.at(-1)).toMatchObject({ level: 3, column: 1, side: -1, x: 1 });
  });

  it("keeps a dot clear of a stack's second column, as wide as a phone's step", () => {
    // Eleven at 0 put the eleventh in a second column; 16 of 200 (8 %) would touch it there.
    const dots = stack([...Array.from({ length: 11 }, () => 0), 16]);
    expect(dots.at(-1)).toMatchObject({ level: 1, column: 0 });
    expect(NARROW.column).toBeGreaterThan(NARROW.gap);
  });

  it("on a wide plot, starts 38's second column at 0 % at the axis, as the first; a phone's keeps it clear", () => {
    // 38's runs as the paper ran them: fifteen end at 0, and two near it, at 11 and 14 of 200.
    const counts = r6.runs.find((batch) => batch.batch === 'q9b')?.results.map((result) => result.counts.PGA) ?? [];
    const second = (dots: ReturnType<typeof stack>) => dots.filter((dot) => dot.count === 0 && dot.column === 1).map((dot) => dot.level);
    expect(second(stack(counts, WIDE))).toEqual([0, 1, 2, 3, 4]);
    expect(second(stack(counts, NARROW))[0]).toBeGreaterThan(0);
    // Wide, the run at 11 stays on the axis, clear of the column beside the stack; the one at 14,
    // 1.5 % further, sits over it, as two dots that close always do.
    expect(stack(counts, WIDE).filter((dot) => dot.count === 11 || dot.count === 14).map((dot) => [dot.count, dot.level])).toEqual([
      [11, 0],
      [14, 1],
    ]);
  });

  it('places a wide plot from the width the page switches at, with the dot and step it draws', () => {
    expect(WIDE.gap).toBeCloseTo(10 / (WIDE_FROM - 10), 10);
    expect(WIDE.column).toBeCloseTo(12 / (WIDE_FROM - 10), 10);
    expect(component).toContain(`@container still (min-width: ${WIDE_FROM}px)`);
    expect(component).toContain('--dot: 0.625rem;');
    expect(component).toContain('--step: calc(var(--dot) + 2px);');
  });

  it('says how many levels a row needs', () => {
    expect(levelsOf(stack([0, 0, 0, 40]))).toBe(3);
    expect(levelsOf(stack(Array.from({ length: 40 }, () => 0)))).toBe(STACK);
    expect(levelsOf([])).toBe(1);
  });
});
