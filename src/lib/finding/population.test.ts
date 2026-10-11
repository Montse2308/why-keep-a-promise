// /finding's «When the reasons compete» (ADR 0042): the engine, run by population.ts, checked seed by
// seed against the paper's runs, `results/r6-curve-illustration.json` of the pinned dependency
// (ADR 0043). If one count differs, the build does not go on.
import { describe, expect, it } from 'vitest';
import r6 from 'dilema-prisionero/results/r6-curve-illustration.json';
import citation from 'dilema-prisionero/CITATION.cff?raw';
import lock from '../../../package-lock.json?raw';
import manifest from '../../../package.json?raw';
import { ENGINE } from '../../config';
import { ENGINE_RUNS_FIGURES, FIGURES } from '../../content/figures';
import { BELIEF, COMPETE_WORLDS, ENGINE_COMMIT, GENERATIONS, PARAMS, SIZE, START_WORLD, competeWorld, finalCounts, runWorld, seedNames, share, tally, type CompeteWorld } from './population';

/** Where each world's runs are in r6: 70 is checked against 0.74, whose 20 runs are the same, generation by generation. */
const R6_AT: Record<CompeteWorld['id'], { batch: string; beta0: number }> = {
  few: { batch: 'q9', beta0: 0.05 },
  between: { batch: 'q9b', beta0: 0.38 },
  most: { batch: 'q9', beta0: 0.74 },
};

const finals = new Map(COMPETE_WORLDS.map((world) => [world.id, finalCounts(world)]));
const final = (id: CompeteWorld['id']) => finals.get(id) ?? [];

describe('the pinned engine (ADR 0043)', () => {
  it('is the commit of the v1.0.0 tag, in package.json and in the lock', () => {
    const spec = (JSON.parse(manifest) as { dependencies: Record<string, string> }).dependencies['dilema-prisionero'];
    expect(spec).toBe(`github:Montse2308/Dilema-del-Prisionero#${ENGINE_COMMIT}`);
    const entry = (JSON.parse(lock) as { packages: Record<string, { resolved?: string }> }).packages['node_modules/dilema-prisionero'];
    expect(entry?.resolved?.endsWith(`Montse2308/Dilema-del-Prisionero.git#${ENGINE_COMMIT}`)).toBe(true);
  });

  it('is the version the page says, from ENGINE.version', () => {
    expect(/^version:\s*(\S+)$/m.exec(citation)?.[1]).toBe(ENGINE.version);
    expect(ENGINE.version).toBe('1.0.0');
  });
});

describe("the worlds and the paper's settings (ADR 0042)", () => {
  it("runs r6's settings, unchanged", () => {
    const run = r6.params.run;
    expect(r6.params.generations).toBe(GENERATIONS);
    expect(r6.params.beta1Held).toBe(BELIEF);
    expect(run.size).toBe(SIZE);
    expect({ game: run.game, phi: run.phi, s: run.s, p: run.p, w: run.w, sens: run.sens, encounters: run.encounters, observation: run.observation, beta1Kind: run.beta1Kind }).toEqual({
      game: 'trust',
      phi: PARAMS.phi,
      s: PARAMS.s,
      p: PARAMS.p,
      w: PARAMS.w,
      sens: PARAMS.sens,
      encounters: PARAMS.encounters,
      observation: PARAMS.observation,
      beta1Kind: PARAMS.beta1Kind,
    });
    expect(run.cap.enabled).toBe(false);
    expect(PARAMS.cap?.enabled).toBe(false);
  });

  it("are the cards' three worlds, with the paper's seeds", () => {
    expect(COMPETE_WORLDS.map((world) => [world.id, world.trust, world.beta0, world.seeds.length])).toEqual([
      ['few', 5, 0.05, 20],
      ['between', 38, 0.38, 40],
      ['most', 70, 0.7, 20],
    ]);
    expect(competeWorld('few').seeds).toEqual(r6.seeds.q9);
    expect(competeWorld('most').seeds).toEqual(r6.seeds.q9);
    expect(competeWorld('between').seeds).toEqual(r6.seeds.q9b);
    expect(seedNames('q9', 2)).toEqual(['q9-0', 'q9-1']);
    expect(START_WORLD).toBe('between');
  });
});

describe('the register of figures (ADR 0042)', () => {
  it("says the generations and the runs of each world as the module runs them and r6 lists them", () => {
    expect(ENGINE_RUNS_FIGURES.generations).toBe(GENERATIONS);
    expect(ENGINE_RUNS_FIGURES.generations).toBe(r6.params.generations);
    for (const world of COMPETE_WORLDS) expect(ENGINE_RUNS_FIGURES.runs[world.id], world.id).toBe(world.seeds.length);
    expect(ENGINE_RUNS_FIGURES.runs.few).toBe(r6.seeds.q9.length);
    expect(ENGINE_RUNS_FIGURES.runs.between).toBe(r6.seeds.q9b.length);
    const registered = FIGURES.filter((figure) => figure.source === 'engine-runs').map((figure) => figure.value);
    expect(registered).toEqual([String(GENERATIONS), String(ENGINE_RUNS_FIGURES.runs.few), String(ENGINE_RUNS_FIGURES.runs.between)]);
  });
});

describe("the runs, against the paper's (r6)", () => {
  it.each(COMPETE_WORLDS.map((world) => [world.trust, world] as const))('at %i, every seed ends with r6’s count of personal guilt', (_trust, world) => {
    const at = R6_AT[world.id];
    const batch = r6.runs.find((candidate) => candidate.batch === at.batch && candidate.beta0 === at.beta0);
    expect(batch, `${at.batch} at ${at.beta0}`).toBeDefined();
    expect(batch?.results.map((result) => result.seed)).toEqual(world.seeds);
    expect(final(world.id)).toEqual(batch?.results.map((result) => result.counts.PGA));
  });

  it('pins the final tallies: 38, gone 15 · only 14 · mixed 11 of 40; 5 and 70, gone 20 of 20', () => {
    expect(tally(final('between'))).toEqual({ gone: 15, full: 14, mixed: 11, runs: 40 });
    expect(tally(final('few'))).toEqual({ gone: 20, full: 0, mixed: 0, runs: 20 });
    expect(tally(final('most'))).toEqual({ gone: 20, full: 0, mixed: 0, runs: 20 });
  });

  it("pins 38's mean final count of personal guilt, 94.45 of 200, r6's", () => {
    const counts = final('between');
    const mean = counts.reduce((sum, count) => sum + count, 0) / counts.length;
    expect(mean).toBeCloseTo(94.45, 10);
    expect(r6.summary.find((row) => row.batch === 'q9b')?.meanPga).toBe(94.45);
  });
});

describe('runWorld', () => {
  it('yields generation 0, half and half, then every generation up to the last', () => {
    const seen: number[] = [];
    let first: readonly number[] = [];
    for (const { generation, counts } of runWorld(competeWorld('few'))) {
      if (generation === 0) first = counts;
      seen.push(generation);
    }
    expect(first).toEqual(Array.from({ length: 20 }, () => SIZE / 2));
    expect(seen).toEqual(Array.from({ length: GENERATIONS + 1 }, (_, i) => i));
  }, 60_000);

  it('is deterministic: the same world twice gives the same runs', () => {
    const twice = [0, 1].map(() => {
      const out: number[][] = [];
      for (const { generation, counts } of runWorld(competeWorld('few'))) {
        out.push([...counts]);
        if (generation === 30) break;
      }
      return out;
    });
    expect(twice[0]).toHaveLength(31);
    expect(twice[0]).toEqual(twice[1]);
  });
});

describe('tally and share', () => {
  it('counts a run as gone at 0, alone at the whole population and mixed in between', () => {
    expect(tally([0, 200, 1, 199, 0])).toEqual({ gone: 2, full: 1, mixed: 2, runs: 5 });
    expect(tally([])).toEqual({ gone: 0, full: 0, mixed: 0, runs: 0 });
    expect(share(50)).toBe(0.25);
  });
});
