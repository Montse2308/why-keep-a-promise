/**
 * How the film's scroll is shared out among its chapters (ADR 0021, ADR 0025). Each chapter asks
 * for a length in screens; the spans below turn those lengths into shares of the scroll, from 0 to 1,
 * in chapter order and without gaps.
 */
import { progress } from './track';

export interface Span<Id extends string = string> {
  readonly id: Id;
  readonly from: number;
  readonly to: number;
}

export function spans<Id extends string>(lengths: readonly { readonly id: Id; readonly screens: number }[]): Span<Id>[] {
  if (lengths.length === 0) throw new Error('The film needs at least one chapter');
  const total = lengths.reduce((sum, { id, screens }) => {
    if (!(screens > 0)) throw new Error(`Chapter "${id}" needs a positive length (got ${screens})`);
    return sum + screens;
  }, 0);
  let at = 0;
  return lengths.map(({ id, screens }, i) => {
    const from = at;
    at = i === lengths.length - 1 ? 1 : at + screens / total;
    return { id, from, to: at };
  });
}

/** The chapter whose span holds `p`; the last one at the very end. */
export function spanAt<Id extends string>(all: readonly Span<Id>[], p: number): Span<Id> {
  const found = all.find((span) => p < span.to) ?? all[all.length - 1];
  if (!found) throw new Error('No spans');
  return found;
}

/** How far `p` has gone through `span`, from 0 to 1. */
export const within = (span: Span, p: number): number => progress(p, span.from, span.to);

/** The total scroll length of the film, in screens. */
export const totalScreens = (lengths: readonly { readonly screens: number }[]): number =>
  lengths.reduce((sum, { screens }) => sum + screens, 0);
