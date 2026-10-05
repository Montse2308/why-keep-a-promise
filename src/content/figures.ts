/**
 * Every figure the prose of the subpages and the film's captions may contain, each with the key of
 * its entry in docs/sources.md ("Clave: `<key>`"). tests/prose.test.ts fails on any number in
 * src/content/subpages/ that is not listed here, and on any year that is not a citation in
 * "Author (year)" form; tests/film-captions.test.ts does the same for the captions, once their
 * placeholders are filled from the code. Code blocks are not prose and are not checked. /sources
 * shows this register to the visitor, key by key (src/lib/sources.ts).
 */

export const SOURCE_KEYS = [
  'axelrod-hamilton-1981',
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
  'vanberg-procedure',
  'vanberg-guessing',
  'vanberg-cells',
  'vanberg-baseline',
  'vanberg-abstract',
  'curve-finding',
] as const;
export type SourceKey = (typeof SOURCE_KEYS)[number];

export interface Figure {
  /** The number as written in the prose, e.g. "5/6". */
  readonly value: string;
  readonly source: SourceKey;
  readonly what: string;
}

export const FIGURES: readonly Figure[] = [
  // Prisoner's dilemma payoffs: chapter 1, /dilemma.
  { value: '3', source: 'axelrod-hamilton-1981', what: 'R, both cooperate' },
  { value: '5', source: 'axelrod-hamilton-1981', what: 'T, defect on a cooperator' },
  { value: '1', source: 'axelrod-hamilton-1981', what: 'P, both defect' },
  { value: '0', source: 'axelrod-hamilton-1981', what: 'S, cooperate with a defector' },
  // Vanberg's game: chapters 3 and 5.
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
  // Chapter 7's finding: the curve (src/data/curve.json). tests/curve.test.ts checks CURVE_FIGURES against the file.
  { value: '76', source: 'vanberg-second-order', what: 'belief after a promise, held fixed; top of the background-trust axis' },
  { value: '0', source: 'curve', what: 'bottom of the background-trust axis' },
  { value: '100', source: 'curve', what: 'background trust is read out of 100' },
  { value: '15', source: 'curve', what: 'first background trust at which personal guilt rolls' },
  { value: '65', source: 'curve', what: 'last background trust at which personal guilt rolls' },
  { value: '10', source: 'curve', what: 'higher payoff on the curve: you roll and the other joins' },
  { value: '5', source: 'curve', what: 'lower payoff on the curve: the other does not join, each keeps 5' },
  { value: '5', source: 'curve', what: 'grid step around the personal guilt window' },
  { value: '38', source: 'curve', what: 'background trust at which personal guilt weighs most' },
  // /dilemma: the dilemma's conditions.
  { value: '2', source: 'axelrod-hamilton-1981', what: 'the 2 of 2R > T + S' },
  { value: '2.5', source: 'axelrod-hamilton-1981', what: '(T + S) / 2, the average per round of taking turns at defecting' },
  // /vanberg: the whole design, the guesses, every cell and the baseline treatments.
  { value: '8', source: 'vanberg-procedure', what: 'rounds; one of them is paid' },
  { value: '65', source: 'vanberg-guessing', what: "cents to the recipient for a sure guess that turned out right" },
  { value: '60', source: 'vanberg-guessing', what: 'cents to the recipient for a probable guess that turned out right' },
  { value: '50', source: 'vanberg-guessing', what: "cents to the recipient for a 50–50 guess; cents to the dictator for guessing the recipient's answer" },
  { value: '35', source: 'vanberg-guessing', what: 'cents to the recipient for a probable guess that turned out wrong' },
  { value: '15', source: 'vanberg-guessing', what: 'cents to the recipient for a sure guess that turned out wrong' },
  { value: '80', source: 'vanberg-cells', what: "dictators' second-order belief, promised, same partner, out of 100" },
  { value: '76', source: 'vanberg-cells', what: "dictators' second-order belief, promised, new partner promised by another, out of 100" },
  { value: '100', source: 'vanberg-cells', what: 'top of the 0–100 reading of the second-order belief' },
  { value: '0', source: 'vanberg-cells', what: 'bottom of the 0–100 reading of the second-order belief' },
  { value: '92', source: 'vanberg-baseline', what: 'decisions in which the die was rolled, with the chat' },
  { value: '67', source: 'vanberg-baseline', what: 'decisions in which the die was rolled, without the chat' },
  { value: '128', source: 'vanberg-baseline', what: 'dictator decisions in each baseline treatment' },
  { value: '32', source: 'vanberg-baseline', what: 'people in each baseline treatment' },
  { value: '8', source: 'vanberg-baseline', what: 'rounds of each baseline treatment' },
  // /finding: the formula, its cut and the robustness variant (curve.json, ADR 0017). tests/finding.test.ts
  // checks FINDING_FIGURES against the file.
  { value: '14.44', source: 'curve-finding', what: 'guilt available at the peak, 38' },
  { value: '0.6', source: 'curve-finding', what: 'θ, the sensitivity of personal guilt (params.sens.theta)' },
  { value: '5', source: 'curve-finding', what: 'c, the fixed cost of breaking a promise (params.sens.c); the cap of the robustness variant' },
  { value: '4', source: 'curve-finding', what: 'the cost of rolling, 14 − 10, that θ · guilt must exceed' },
  { value: '14', source: 'vanberg-payoffs', what: "dictator after Don't Roll, in 14 − 10" },
  { value: '10', source: 'vanberg-payoffs', what: 'dictator after Roll, in 14 − 10' },
  { value: '20/3', source: 'curve-finding', what: 'the guilt threshold, 4 / θ' },
  { value: '6.67', source: 'curve-finding', what: '20/3 to two decimals' },
  { value: '10.1', source: 'curve-finding', what: 'lower analytic cut, to one decimal' },
  { value: '65.9', source: 'curve-finding', what: 'upper analytic cut, to one decimal' },
  { value: '70', source: 'curve-finding', what: 'first row of the right tail in the robustness variant' },
  { value: '10', source: 'curve-finding', what: "personal guilt's payoff from 70 on in the robustness variant" },
  { value: '76', source: 'curve-finding', what: 'the expectation after a promise, in the formula' },
  { value: '100', source: 'curve-finding', what: 'beliefs in hundredths, in the formula' },
];

/** /finding's figures, each checked against src/data/curve.json in tests/finding.test.ts. */
export const FINDING_FIGURES = {
  /** The expectation after a promise, out of 100: the 76 of a · (76 − a) / 100. */
  beliefAfterPromise: 76,
  /** θ as written, and the fixed cost c. */
  theta: '0.6',
  c: 5,
  /** The cost of rolling, 14 − 10. */
  cost: { dont: 14, roll: 10, difference: 4 },
  /** The threshold on the guilt available, 4 / θ, and how the prose rounds it. */
  threshold: { exact: '20/3', rounded: '6.67' },
  /** The analytic cut, a · (76 − a) / 100 = 20/3, to one decimal. */
  cut: { from: '10.1', to: '65.9' },
  /** The grid window where personal guilt rolls, and its peak. */
  window: { from: 15, to: 65 },
  peak: { trust: 38, guilt: '14.44' },
  /** The robustness variant: the cap, and personal guilt's payoff from 70 on. */
  robustness: { cap: 5, from: 70, payoff: 10 },
} as const;

/** The curve's figures as chapter 7's finding and its chart state them, each checked against src/data/curve.json. */
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
  { authors: ['Axelrod', 'Hamilton'], year: 1981, source: 'axelrod-hamilton-1981' },
  { authors: ['Charness', 'Dufwenberg'], year: 2006, source: 'charness-dufwenberg-2006' },
  { authors: ['Battigalli', 'Dufwenberg'], year: 2007, source: 'battigalli-dufwenberg-2007' },
  { authors: ['Vanberg'], year: 2008, source: 'vanberg-2008' },
  { authors: ['Case'], year: 2017, source: 'case-2017' },
  { authors: ['Kawagoe', 'Narita'], year: 2014, source: 'kawagoe-narita-2014' },
];
