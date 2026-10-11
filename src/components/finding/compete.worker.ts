/**
 * The worker of /finding's live engine (ADR 0042): the paper's engine, run by
 * src/lib/finding/population.ts, the module the build draws the still figure with. Loaded only when
 * «Run the engine» is pressed (compete.ts).
 *
 * It runs the world the page asks for, a few milliseconds at a time so a new request is heard, and
 * sends every generation as it comes, with its tally. A world asked for before goes on once the one
 * asked for last is done; a world already run is not run again (the page keeps what it got). If the
 * engine throws, it says so, and the page keeps its still figure.
 */
import { competeWorld, runWorld, tally, type Generation } from '../../lib/finding/population';
import type { FromWorker, ToWorker } from '../../lib/finding/live';
import type { WorldId } from '../../lib/finding/worlds';

/** How long one turn of work lasts before the worker listens again, in milliseconds. */
const TURN = 12;

const scope = self as unknown as {
  postMessage(message: FromWorker): void;
  onmessage: ((event: MessageEvent<ToWorker>) => void) | null;
};

const running = new Map<WorldId, Generator<Generation, void, undefined>>();
const finished = new Set<WorldId>();
let first: WorldId | null = null;
let queued = false;

function turn(): void {
  queued = false;
  const world = first && running.has(first) ? first : running.keys().next().value;
  if (!world) return;
  const generations = running.get(world);
  if (!generations) return;
  try {
    const until = performance.now() + TURN;
    while (performance.now() < until) {
      const next = generations.next();
      if (next.done) {
        running.delete(world);
        finished.add(world);
        break;
      }
      const { generation, counts } = next.value;
      scope.postMessage({ type: 'generation', world, generation, counts, tally: tally(counts) });
    }
  } catch {
    running.clear();
    scope.postMessage({ type: 'failed' });
    return;
  }
  if (running.size > 0) queue();
}

function queue(): void {
  if (queued) return;
  queued = true;
  setTimeout(turn, 0);
}

scope.onmessage = (event) => {
  const { world } = event.data;
  first = world;
  if (!running.has(world) && !finished.has(world)) {
    try {
      running.set(world, runWorld(competeWorld(world)));
    } catch {
      scope.postMessage({ type: 'failed' });
      return;
    }
  }
  queue();
};
