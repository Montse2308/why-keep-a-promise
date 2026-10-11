/**
 * /finding's «When the reasons compete» (ADR 0042): the paper's engine, v1.0.0, run in the three fixed
 * worlds of the cards, with the paper's seeds and the settings of the engine's own illustration of the
 * curve (`scripts/reproduce/r6-curve-illustration.ts`), unchanged. Nothing here is set by the visitor.
 *
 * This is the only module of the site that imports the engine (ADR 0043), from the dependency pinned
 * to the commit of its `v1.0.0` tag. The build draws the still figure with it, and the browser's worker
 * runs it when «Run the engine» is pressed; population.test.ts checks every seed against the paper's
 * runs (`results/r6-curve-illustration.json`).
 *
 * Background trust is put back after every generation, so each world stays the world it is: this
 * compares worlds; it is not a population moving along the curve (rule (e)).
 */
import {
  CAP_OFF,
  TRUST,
  census,
  makeRng,
  openingCells,
  step,
  uniformPopulation,
  type MoranParams,
  type MoranState,
} from 'dilema-prisionero/src/index.ts';
import type { WorldId } from './worlds';

/** The engine's version this module runs: the `v1.0.0` tag, pinned by its commit in package.json. */
export const ENGINE_COMMIT = '4e59df734c29915439c51d948bda6ac1360dc38b';

/** People in each run. */
export const SIZE = 200;
/** Generations of each run. */
export const GENERATIONS = 400;
/** The belief that a promise will be kept, put back with background trust after every generation. */
export const BELIEF = 0.76;

/** The settings of the engine's illustration of the curve, unchanged. */
export const PARAMS: MoranParams = {
  game: TRUST,
  size: SIZE,
  phi: 1,
  s: 0,
  p: 1,
  w: 0.5,
  sens: { theta: 0.6, c: 5 },
  encounters: 4,
  cap: CAP_OFF,
  observation: 'rational',
  beta1Kind: 'entered',
};

/** A batch of the paper's seeds: its name and how many runs it has. */
export type Batch = 'q9' | 'q9b';

export interface CompeteWorld {
  /** The world, by the card that names it. */
  readonly id: WorldId;
  /** Background trust, out of 100, as the page says it. */
  readonly trust: number;
  /** Background trust as the engine reads it. */
  readonly beta0: number;
  readonly batch: Batch;
  /** The paper's seeds, one run each. */
  readonly seeds: readonly string[];
}

/** The seeds of a batch, as the engine names them: `q9-0` … `q9-19`. */
export function seedNames(batch: Batch, runs: number): string[] {
  return Array.from({ length: runs }, (_, i) => `${batch}-${i}`);
}

/** The three worlds of the cards, in their order: 5 and 70 with 20 runs, 38 with 40. */
export const COMPETE_WORLDS: readonly CompeteWorld[] = [
  { id: 'few', trust: 5, beta0: 0.05, batch: 'q9', seeds: seedNames('q9', 20) },
  { id: 'between', trust: 38, beta0: 0.38, batch: 'q9b', seeds: seedNames('q9b', 40) },
  { id: 'most', trust: 70, beta0: 0.7, batch: 'q9', seeds: seedNames('q9', 20) },
];

/** The world the section starts on. */
export const START_WORLD: WorldId = 'between';

export function competeWorld(id: WorldId): CompeteWorld {
  const found = COMPETE_WORLDS.find((world) => world.id === id);
  if (!found) throw new Error(`No world "${id}"`);
  return found;
}

/** One generation of every run of a world: how many people in each run have personal guilt. */
export interface Generation {
  readonly generation: number;
  /** Personal guilt's count in each run, in the order of the world's seeds, out of `SIZE`. */
  readonly counts: readonly number[];
}

function startOf(world: CompeteWorld): MoranState {
  return {
    population: uniformPopulation(SIZE, ['PGA', 'MC-b']),
    beliefs: { beta0: world.beta0, beta1: BELIEF },
    cells: openingCells(BELIEF, world.beta0),
    generation: 0,
  };
}

/**
 * Every run of a world, generation by generation, from the start (generation 0, half and half) to
 * `GENERATIONS`: each step runs every seed one generation further, then puts background trust and the
 * belief back. A worker can take it a few generations at a time.
 */
export function* runWorld(world: CompeteWorld): Generator<Generation, void, undefined> {
  const runs = world.seeds.map((seed) => ({ rng: makeRng(seed), state: startOf(world) }));
  yield { generation: 0, counts: runs.map((run) => census(run.state.population).PGA) };
  for (let generation = 1; generation <= GENERATIONS; generation += 1) {
    for (const run of runs) {
      const result = step(run.state, PARAMS, run.rng);
      run.state = { ...result.state, beliefs: { beta0: world.beta0, beta1: BELIEF } };
    }
    yield { generation, counts: runs.map((run) => census(run.state.population).PGA) };
  }
}

/** Personal guilt's count in each run of a world after the last generation. */
export function finalCounts(world: CompeteWorld): number[] {
  let last: readonly number[] = [];
  for (const { counts } of runWorld(world)) last = counts;
  return [...last];
}

/** How the runs of a world stand: personal guilt gone, alone, or still mixed with commitment. */
export interface Tally {
  readonly gone: number;
  readonly full: number;
  readonly mixed: number;
  readonly runs: number;
}

/** Counts the runs by where personal guilt stands: none of `size`, all of it, or in between. */
export function tally(counts: readonly number[], size: number = SIZE): Tally {
  const gone = counts.filter((count) => count === 0).length;
  const full = counts.filter((count) => count === size).length;
  return { gone, full, mixed: counts.length - gone - full, runs: counts.length };
}

/** A run's share with personal guilt, from 0 to 1. */
export function share(count: number, size: number = SIZE): number {
  return count / size;
}
