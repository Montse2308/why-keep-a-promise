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
];

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
];
