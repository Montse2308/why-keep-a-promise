/**
 * The still figure of /finding's «When the reasons compete» (ADR 0042): where each run ended, after
 * the last generation, one dot per run, in a row per world. Computed at build time with the same
 * module the browser's worker runs (./population.ts), so it is what the page shows on load and
 * without JavaScript.
 *
 * A dot that would touch one already placed, at the same count or a near one, goes up a level, at
 * most `STACK` high; a taller stack goes on in another column beside it, toward the middle of the
 * axis, so no dot leaves the plot. Dots are placed twice, for a phone's plot and for a wide one, so a
 * wide plot does not keep the room a phone needs. A dot is a run, never a person (rule (d)).
 *
 * Build time only, behind the lock (ADR 0034).
 */
import { COMPETE_WORLDS, SIZE, finalCounts, share, tally, type CompeteWorld, type Tally } from './population';

/** Dots in a column before the stack goes on beside it. */
export const STACK = 10;

/**
 * Where dots may sit, for a plot of a given width: how close two dots may be on the same level (a
 * dot's width, 10 px) and how far a column sits from the one before it (one step of the stack,
 * 12 px), both as a share of the axis, over which a dot's place runs (the plot less a dot). The page
 * draws a column as that step in pixels, so a stack's columns stay together at any width; placing
 * dots as if the plot were its narrowest keeps them from touching where it is wider.
 */
export interface Layout {
  readonly gap: number;
  readonly column: number;
}

/** A dot's width and a stack's step, in pixels, as CompeteStill.astro draws them. */
const DOT = 10;
const STEP = 12;

function layoutFor(plot: number): Layout {
  return { gap: DOT / (plot - DOT), column: STEP / (plot - DOT) };
}

/** The narrowest plot, a phone's at 320 px: 256 px. */
export const NARROW = layoutFor(256);

/**
 * The plot's width from which the page uses `WIDE` (CompeteStill.astro's container query). There, a
 * run near a stack no longer touches its second column, so the column starts at the axis, as the first.
 */
export const WIDE_FROM = 600;
export const WIDE = layoutFor(WIDE_FROM);

export interface StillDot {
  /** The run, by the index of its seed in the world. */
  readonly run: number;
  /** Personal guilt's final count, out of `SIZE`. */
  readonly count: number;
  /** Its place on the axis, the share with personal guilt, from 0 to 1. */
  readonly x: number;
  /** Its place in its stack: the level, from 0 at the axis, and the column, from 0 at its place. */
  readonly level: number;
  readonly column: number;
  /** Which way further columns go: toward the middle, right from the left half, left from the right. */
  readonly side: 1 | -1;
}

export interface StillRow {
  readonly world: CompeteWorld;
  readonly counts: readonly number[];
  readonly tally: Tally;
  /** One dot per run, as a narrow plot places them, and as a wide one does (`WIDE_FROM` and over). */
  readonly dots: readonly StillDot[];
  readonly wide: readonly StillDot[];
  /** How many levels its tallest stack takes, for the row's height, narrow and wide. */
  readonly levels: number;
  readonly wideLevels: number;
}

/**
 * One dot per run, in the order of the seeds. Each takes the lowest level, in the first column, where
 * no dot already placed sits closer than the layout's gap; runs that end at the same count stack in
 * seed order.
 */
export function stack(counts: readonly number[], layout: Layout = NARROW, size: number = SIZE, height: number = STACK): StillDot[] {
  const { gap, column: step } = layout;
  const placed: { at: number; level: number }[] = [];
  return counts.map((count, run) => {
    const x = share(count, size);
    const side: 1 | -1 = x <= 0.5 ? 1 : -1;
    for (let column = 0; ; column += 1) {
      const at = x + side * column * step;
      for (let level = 0; level < height; level += 1) {
        if (placed.some((other) => other.level === level && Math.abs(other.at - at) < gap - 1e-9)) continue;
        placed.push({ at, level });
        return { run, count, x, level, column, side };
      }
    }
  });
}

/** The levels a row needs: its tallest stack, up to `height`. */
export function levelsOf(dots: readonly StillDot[]): number {
  return dots.reduce((most, dot) => Math.max(most, dot.level + 1), 1);
}

let rows: readonly StillRow[] | undefined;

/** The three worlds' rows, run once per build and kept: both languages draw the same runs. */
export function stillRows(): readonly StillRow[] {
  rows ??= COMPETE_WORLDS.map((world) => {
    const counts = finalCounts(world);
    const dots = stack(counts, NARROW);
    const wide = stack(counts, WIDE);
    return { world, counts, tally: tally(counts), dots, wide, levels: levelsOf(dots), wideLevels: levelsOf(wide) };
  });
  return rows;
}
