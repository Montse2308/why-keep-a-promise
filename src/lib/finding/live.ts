/**
 * The live engine of /finding's «When the reasons compete» (ADR 0042), what the page does with what
 * the worker sends: the messages between them, the pace of the drawing, each run's line and the
 * main button's label. Pure, and free of the engine: the page's code imports this, never
 * ./population.ts, so the engine reaches the browser only in the worker, when «Run the engine» is
 * pressed.
 */
import type { Tally } from './population';
import type { WorldId } from './worlds';

/** Generations drawn per second while a world plays. */
export const PACE = 30;

/** The page asks the worker to run a world, or to go on with it first. */
export interface RunRequest {
  readonly type: 'run';
  readonly world: WorldId;
}

/** The worker sends every generation of a world as it runs it, with its tally. */
export interface GenerationMessage {
  readonly type: 'generation';
  readonly world: WorldId;
  readonly generation: number;
  /** Personal guilt's count in each run, in the order of the world's seeds. */
  readonly counts: readonly number[];
  readonly tally: Tally;
}

export interface FailureMessage {
  readonly type: 'failed';
}

export type ToWorker = RunRequest;
export type FromWorker = GenerationMessage | FailureMessage;

/**
 * Where a world's drawing is: not run yet, waiting for its first generation, playing, paused, or at
 * its last generation.
 */
export type Phase = 'idle' | 'starting' | 'running' | 'paused' | 'done';

/** The main button's label in each phase: one button runs, pauses and resumes. */
export type ButtonLabel = 'run' | 'starting' | 'pause' | 'resume';

export function buttonLabel(phase: Phase): ButtonLabel {
  if (phase === 'starting') return 'starting';
  if (phase === 'running') return 'pause';
  if (phase === 'paused') return 'resume';
  return 'run';
}

/**
 * The generation shown after `seconds` more of playing, from `shown` (a fraction while it plays), at
 * `pace` generations a second, never past the last generation that arrived: `received` counts them,
 * generation 0 included. Nothing arrived yet, it stays where it is.
 */
export function advance(shown: number, seconds: number, received: number, pace: number = PACE): number {
  if (received === 0) return shown;
  return Math.min(shown + Math.max(0, seconds) * pace, received - 1);
}

/**
 * One run's line up to generation `upTo`, as an SVG path in the plot's own units: the generation
 * across, and the count of personal guilt up, `size` at the top. `generations` holds every
 * generation's counts, one per run.
 */
export function linePath(generations: readonly (readonly number[])[], run: number, upTo: number, size: number): string {
  const last = Math.min(Math.floor(upTo), generations.length - 1);
  let path = '';
  for (let generation = 0; generation <= last; generation += 1) {
    const count = generations[generation]?.[run] ?? 0;
    path += `${generation === 0 ? 'M' : 'L'}${generation} ${size - count}`;
  }
  return path;
}

/** The run highlighted after the current one, round the world's runs. */
export function nextRun(current: number, runs: number): number {
  return runs > 0 ? (current + 1) % runs : 0;
}
