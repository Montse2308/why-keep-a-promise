/**
 * The curve's control (chapter 7; moment 3 of the previous version's table): a slider over the rows of the curve. Pure selection, formatting
 * and announcement; the client script in src/components/curve/ only wires them to the page. The
 * slider moves over row indices, so it only ever lands on values that exist in curve.json.
 */
import { fill } from '../template';
import type { CurveRow } from './curve';
import type { CurveStrings } from './strings';

/** The row under the slider. Out-of-range or fractional input snaps to an existing row. */
export function rowAt(rows: readonly CurveRow[], index: number): CurveRow {
  if (rows.length === 0) throw new Error('The curve has no rows');
  const safe = Number.isFinite(index) ? Math.round(index) : 0;
  return rows[Math.min(rows.length - 1, Math.max(0, safe))] as CurveRow;
}

/** Index of the row at a background trust, for the slider's starting value. */
export function indexOf(rows: readonly CurveRow[], trust: number): number {
  const index = rows.findIndex((row) => row.trust === trust);
  if (index < 0) throw new Error(`No row at background trust ${trust}`);
  return index;
}

/** The slider's `aria-valuetext`, e.g. "background trust 38 of 100". */
export function valueText(strings: CurveStrings, row: CurveRow): string {
  return fill(strings['curve.value'], { n: row.trust });
}

/** Whether, moved by personal guilt, you roll the die at this row. */
export function pullsText(strings: CurveStrings, row: CurveRow): string {
  return strings[row.pulls ? 'curve.pulls.yes' : 'curve.pulls.no'];
}

/** What the live region says when the slider settles on a row. */
export function announcement(strings: CurveStrings, row: CurveRow): string {
  const payoff = (name: keyof CurveStrings, value: number) => fill(strings['curve.announce.payoff'], { name: strings[name], payoff: value });
  return [
    fill(strings['curve.announce.trust'], { n: row.trust }),
    payoff('curve.series.personal', row.payoff.personal),
    payoff('curve.series.partner', row.payoff.partner),
    payoff('curve.series.general', row.payoff.general),
    pullsText(strings, row),
  ].join(' ');
}
