/**
 * Every number the film says, taken from the pure modules (docs/content-rules.md, rule (k)): the
 * captions and the `film.*` UI strings carry `{name}` placeholders, never a figure of their own, and
 * the build fills them from here. A test fails on a digit written by hand in either.
 *
 * The dilemma's payoffs come from src/lib/pd/ (Axelrod, 1984; docs/sources.md, `axelrod-1984`).
 */
import { PAYOFFS as PD } from '../pd/game';

export const FILM_VALUES = {
  /** Temptation, reward, punishment and sucker's payoff of the prisoner's dilemma. */
  T: PD.T,
  R: PD.R,
  P: PD.P,
  S: PD.S,
} as const satisfies Readonly<Record<string, number>>;

export type FilmValue = keyof typeof FILM_VALUES;
