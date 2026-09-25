/**
 * Every figure the act prose may contain, each with the key of its entry in docs/sources.md
 * ("Clave: `<key>`"). tests/prose.test.ts fails on any number in src/content/acts/ that is not
 * listed here, and on any year that is not a citation in "Author (year)" form.
 */

export const SOURCE_KEYS = [
  'axelrod-1984',
  'charness-dufwenberg-2006',
  'battigalli-dufwenberg-2007',
  'vanberg-2008',
  'vanberg-payoffs',
  'vanberg-switch',
  'vanberg-chat',
  'vanberg-design',
  'vanberg-rates',
  'vanberg-beliefs',
  'case-2017',
  'kawagoe-narita-2014',
  'vanberg-second-order',
  'curve',
] as const;
export type SourceKey = (typeof SOURCE_KEYS)[number];

export interface Figure {
  /** The number as written in the prose, e.g. "5/6". */
  readonly value: string;
  readonly source: SourceKey;
  readonly what: string;
}

export const FIGURES: readonly Figure[] = [
  // Prisoner's dilemma payoffs, act 2.
  { value: '3', source: 'axelrod-1984', what: 'R, both cooperate' },
  { value: '5', source: 'axelrod-1984', what: 'T, defect on a cooperator' },
  { value: '1', source: 'axelrod-1984', what: 'P, both defect' },
  { value: '0', source: 'axelrod-1984', what: 'S, cooperate with a defector' },
  // The table: Vanberg's game.
  { value: '10', source: 'vanberg-payoffs', what: 'dictator after Roll; recipient expected after Roll' },
  { value: '14', source: 'vanberg-payoffs', what: "dictator after Don't Roll" },
  { value: '12', source: 'vanberg-payoffs', what: 'recipient after Roll, faces 2–6' },
  { value: '0', source: 'vanberg-payoffs', what: "recipient after face 1 or Don't Roll; bottom of the belief scale" },
  { value: '4', source: 'vanberg-payoffs', what: 'cost of rolling to the dictator, 14 − 10' },
  { value: '6', source: 'vanberg-payoffs', what: 'faces of the die' },
  { value: '1', source: 'vanberg-payoffs', what: 'the die face that gives the recipient 0' },
  { value: '5/6', source: 'vanberg-payoffs', what: 'probability the recipient gets 12' },
  { value: '1/2', source: 'vanberg-switch', what: 'probability of a partner switch' },
  // Chat and design.
  { value: '2', source: 'vanberg-chat', what: 'messages per person' },
  { value: '90', source: 'vanberg-chat', what: 'characters per message, at most' },
  { value: '192', source: 'vanberg-design', what: 'participants' },
  { value: '8', source: 'vanberg-design', what: 'rounds' },
  // Results.
  { value: '73', source: 'vanberg-rates', what: '% of promisers who rolled, same partner' },
  { value: '54', source: 'vanberg-rates', what: '% of promisers who rolled, new partner promised by another' },
  { value: '70', source: 'vanberg-beliefs', what: 'mean bet of promised recipients, no switch, out of 100' },
  { value: '68', source: 'vanberg-beliefs', what: 'mean bet of promised recipients, switch, out of 100' },
  { value: '100', source: 'vanberg-beliefs', what: 'top of the 0–100 belief scale' },
  // Act 5: the curve (src/data/curve.json). tests/curve.test.ts checks CURVE_FIGURES against the file.
  { value: '76', source: 'vanberg-second-order', what: 'belief after a promise, held fixed; top of the background-trust axis' },
  { value: '0', source: 'curve', what: 'bottom of the background-trust axis' },
  { value: '100', source: 'curve', what: 'background trust is read out of 100' },
  { value: '15', source: 'curve', what: 'first background trust at which personal guilt rolls' },
  { value: '65', source: 'curve', what: 'last background trust at which personal guilt rolls' },
  { value: '10', source: 'curve', what: 'higher payoff on the curve: you roll and the other joins' },
  { value: '5', source: 'curve', what: 'lower payoff on the curve: the other does not join, each keeps 5' },
  { value: '5', source: 'curve', what: 'grid step around the personal guilt window' },
  { value: '38', source: 'curve', what: 'background trust at which personal guilt weighs most' },
];

/** The curve's figures as act 5 and its chart state them, each checked against src/data/curve.json. */
export const CURVE_FIGURES = {
  axis: { min: 0, max: 76 },
  window: { from: 15, to: 65 },
  /** Grid step at the window's edges: the rows next to 15 and 65 are 5 away. */
  step: 5,
  /** Rolling pays `high`; not rolling pays `low`, what each keeps when the other does not join. */
  payoffs: { low: 5, high: 10 },
  peak: 38,
  /** The belief after a promise, out of 100 (docs/sources.md, `vanberg-second-order`). */
  beliefAfterPromise: 76,
} as const;

export interface Citation {
  /** Surnames in the order they are written, joined by "and" / "y" in the prose. */
  readonly authors: readonly string[];
  readonly year: number;
  readonly source: SourceKey;
}

export const CITATIONS: readonly Citation[] = [
  { authors: ['Axelrod'], year: 1984, source: 'axelrod-1984' },
  { authors: ['Charness', 'Dufwenberg'], year: 2006, source: 'charness-dufwenberg-2006' },
  { authors: ['Battigalli', 'Dufwenberg'], year: 2007, source: 'battigalli-dufwenberg-2007' },
  { authors: ['Vanberg'], year: 2008, source: 'vanberg-2008' },
  { authors: ['Case'], year: 2017, source: 'case-2017' },
  { authors: ['Kawagoe', 'Narita'], year: 2014, source: 'kawagoe-narita-2014' },
];
