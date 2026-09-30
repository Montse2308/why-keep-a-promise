/**
 * Geometry of chapter 7's step chart, in data units (background trust out of 100, payoff). The
 * component maps it to SVG; nothing here interpolates between grid rows.
 */
import type { Curve, CurveRow, Reason } from './curve';

/** A straight piece of a step line: horizontal (y1 = y2) or a vertical riser (x1 = x2). */
export interface Segment {
  readonly x1: number;
  readonly x2: number;
  readonly y1: number;
  readonly y2: number;
}

interface Run {
  from: number;
  to: number;
  readonly value: number;
}

/**
 * The step line of one reason. Each run of equal payoffs spans its first to its last grid row. The
 * gap between two runs, where the grid has no row, is drawn at the lower payoff, so a higher run
 * (the window where personal guilt pays more) is drawn exactly where the grid has it and no wider.
 */
export function stepLine(rows: readonly CurveRow[], reason: Reason): Segment[] {
  const runs: Run[] = [];
  for (const row of rows) {
    const value = row.payoff[reason];
    const last = runs.at(-1);
    if (last && last.value === value) last.to = row.trust;
    else runs.push({ from: row.trust, to: row.trust, value });
  }

  const risers: Segment[] = [];
  runs.forEach((run, i) => {
    const next = runs[i + 1];
    if (!next) return;
    const at = run.value < next.value ? next.from : run.to;
    if (run.value < next.value) run.to = at;
    else next.from = at;
    risers.push({ x1: at, x2: at, y1: run.value, y2: next.value });
  });

  const horizontals = runs.map(({ from, to, value }) => ({ x1: from, x2: to, y1: value, y2: value }));
  return [...horizontals, ...risers];
}

/** Background trust as a percentage of the axis width. */
export function xPercent(trust: number, axis: Curve['axis']): number {
  return ((trust - axis.min) / (axis.max - axis.min)) * 100;
}

/** The chart's vertical frame, in CSS px: the baseline and the height of the highest payoff. */
export interface Frame {
  /** y of payoff 0. */
  readonly zero: number;
  /** y of the highest payoff on the curve. */
  readonly top: number;
  /** The highest payoff on the curve. */
  readonly high: number;
}

export function yPixel(payoff: number, frame: Frame): number {
  return frame.zero - (payoff / frame.high) * (frame.zero - frame.top);
}
