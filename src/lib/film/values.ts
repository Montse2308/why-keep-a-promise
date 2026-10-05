/**
 * Every number the film says, taken from the pure modules (docs/content-rules.md, rule (k)): the
 * captions and the `film.*` UI strings carry `{name}` placeholders, never a figure of their own, and
 * the build fills them from here. A test fails on a digit written by hand in either.
 *
 * The dilemma's payoffs come from src/lib/pd/ (Axelrod and Hamilton, 1981; docs/sources.md,
 * `axelrod-hamilton-1981`); the decision's, from Vanberg's game, `PAYOFFS` in src/lib/table/game.ts
 * (`vanberg-payoffs`); the experiment's results, from the exact counts in src/lib/table/ (`vanberg-rates`, `vanberg-beliefs`).
 */
import { PAYOFFS as PD } from '../pd/game';
import { promisedExpectation, scaleValue } from '../table/expectation';
import { outOf100, toNumber } from '../table/fraction';
import { expectedPayoffs, PAYOFFS as TABLE } from '../table/game';
import { rollShare } from '../table/results';
import { SWITCH_DESIGN } from '../vanberg/cells';

const roll = expectedPayoffs('roll');
const [failface] = TABLE.roll.failureFaces;
if (failface === undefined || TABLE.roll.failureFaces.length !== 1) throw new Error('The film says one failing face of the die');

export const FILM_VALUES = {
  /** Temptation, reward, punishment and sucker's payoff of the prisoner's dilemma. */
  T: PD.T,
  R: PD.R,
  P: PD.P,
  S: PD.S,
  /** Keeping the money: what the one who decides keeps, and what the other gets. */
  dont: TABLE.dont.you,
  dontother: TABLE.dont.other,
  /** Rolling the die: what the one who decides gets, and what the other gets unless the die fails. */
  roll: TABLE.roll.you,
  rollother: TABLE.roll.other.success,
  /** The face that leaves the other with nothing, and that nothing. */
  failface,
  failother: TABLE.roll.other.failure,
  /** What rolling costs the one who decides, and what it gives the other on average. */
  cost: TABLE.dont.you - TABLE.roll.you,
  expected: toNumber(roll.other),
  /**
   * What the recipients who had been promised bet, read from 0 to 100, without a switch and with
   * one (Vanberg, 2008; `vanberg-beliefs`), and the ends of that reading.
   */
  expectsame: outOf100(promisedExpectation('same')),
  expectswitched: outOf100(promisedExpectation('switched')),
  scalebottom: outOf100(scaleValue(0)),
  scaletop: outOf100(scaleValue(4)),
  /**
   * How often the die was rolled in the rounds where the one deciding had promised, with the same
   * partner and with a new partner promised by someone else, out of 100 (`vanberg-rates`); and how
   * many people played, over how many rounds (`vanberg-design`).
   */
  rolledsame: outOf100(rollShare('promised-same')),
  rolledswitched: outOf100(rollShare('promised-switched')),
  people: SWITCH_DESIGN.people,
  rounds: SWITCH_DESIGN.rounds,
} as const satisfies Readonly<Record<string, number>>;
