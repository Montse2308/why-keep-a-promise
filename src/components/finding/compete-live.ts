/**
 * /finding's live engine (ADR 0042), loaded only when «Run the engine» is pressed (./compete.ts), from
 * its own bundle, and mounted as it loads (at the end of this file). It starts the worker with the
 * paper's engine (./compete.worker.ts, from the URL the build wrote in the block's
 * `data-later-worker`), keeps every generation it sends, world by world, for as long as the page is
 * open, and draws them: one line per run, the share of
 * the population with personal guilt against the generations, at about 30 generations a second and
 * never ahead of what arrived (src/lib/finding/live.ts).
 *
 * One button runs, pauses and resumes; «Start over» plays the world again from its start; the
 * slider moves through the generations once the world has ended; «Highlight another run» moves the
 * thread's gold to the next run. Choosing another world runs it, or shows it as it was left; a world
 * already run is never run again. The count follows the generation shown; the polite live region
 * speaks only when a world ends. With reduced motion, the chart appears whole when the world ends.
 * If the worker cannot start or fails, the still figure stays and the status says so.
 */
import { fillIn as fill } from '../../lib/finding/explorer';
import { advance, buttonLabel, linePath, nextRun, type FromWorker, type Phase, type ToWorker } from '../../lib/finding/live';
import type { Tally } from '../../lib/finding/population';
import type { WorldId } from '../../lib/finding/worlds';
import type { LiveStrings } from './compete';

const SVG = 'http://www.w3.org/2000/svg';

interface WorldState {
  /** Every generation that arrived: personal guilt's count in each run. */
  readonly generations: (readonly number[])[];
  readonly tallies: Tally[];
  /** The generation shown; a fraction while it plays. */
  shown: number;
  phase: Phase;
  highlight: number;
  /** Whether the worker was asked to run it. */
  asked: boolean;
}

export function mountLive(root: HTMLElement, strings: LiveStrings): void {
  const find = <T extends Element>(selector: string) => root.querySelector<T>(selector);
  const run = find<HTMLButtonElement>('[data-run]');
  const restart = find<HTMLButtonElement>('[data-restart]');
  const highlight = find<HTMLButtonElement>('[data-highlight]');
  const scrub = find<HTMLInputElement>('[data-scrub]');
  const generationText = find<HTMLElement>('[data-generation]');
  const countText = find<HTMLElement>('[data-count]');
  const status = find<HTMLElement>('[data-status]');
  const lines = find<SVGGElement>('[data-lines]');
  const highlighted = find<SVGPathElement>('[data-highlighted]');
  if (!run || !restart || !highlight || !scrub || !generationText || !countText || !status || !lines || !highlighted) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const states = new Map<WorldId, WorldState>();
  const stateOf = (world: WorldId): WorldState => {
    let state = states.get(world);
    if (!state) {
      state = { generations: [], tallies: [], shown: 0, phase: 'idle', highlight: 0, asked: false };
      states.set(world, state);
    }
    return state;
  };
  const chosen = () => (root.querySelector<HTMLInputElement>('[data-world]:checked')?.value ?? 'between') as WorldId;
  let world = chosen();
  let failed = false;
  let frame = 0;
  let last = 0;
  let drawn = -1;
  let worker: Worker;

  const fail = () => {
    failed = true;
    cancelAnimationFrame(frame);
    // The main button keeps the focus it may have: it says it does nothing now, without leaving the tab order.
    for (const control of [restart, highlight, scrub]) control.disabled = true;
    run.setAttribute('aria-disabled', 'true');
    run.textContent = strings.run;
    status.textContent = strings.failed;
  };

  try {
    worker = new Worker(root.dataset.laterWorker ?? '', { type: 'module' });
  } catch {
    fail();
    return;
  }
  worker.addEventListener('error', fail);
  worker.addEventListener('messageerror', fail);
  worker.addEventListener('message', (event: MessageEvent<FromWorker>) => {
    const message = event.data;
    if (message.type === 'failed') return fail();
    const state = stateOf(message.world);
    state.generations[message.generation] = message.counts;
    state.tallies[message.generation] = message.tally;
    if (message.world === world) {
      if (state.phase === 'starting') {
        state.phase = 'running';
        controls();
      }
      play();
    }
  });
  const ask = (state: WorldState, id: WorldId) => {
    if (state.asked && state.generations.length > strings.total) return;
    state.asked = true;
    worker.postMessage({ type: 'run', world: id } satisfies ToWorker);
  };

  const runs = () => strings.worlds[world]?.runs ?? 0;

  // One path per run, made once for the most runs a world has; the highlighted one is drawn on top.
  const most = Math.max(...Object.values(strings.worlds).map((w) => w.runs));
  const paths = Array.from({ length: most }, () => {
    const path = document.createElementNS(SVG, 'path');
    path.setAttribute('class', 'live__line');
    lines.append(path);
    return path;
  });

  const draw = (force = false) => {
    const state = stateOf(world);
    const ended = state.generations.length > strings.total;
    // With reduced motion, nothing is drawn while the world plays: it appears whole when it ends.
    const upTo = reduced.matches && state.phase !== 'done' && !(state.phase === 'paused' && ended) ? -1 : Math.floor(state.shown);
    const shownGeneration = upTo < 0 ? 0 : upTo;
    if (force || upTo !== drawn) {
      drawn = upTo;
      paths.forEach((path, i) => path.setAttribute('d', i < runs() && i !== state.highlight && upTo >= 0 ? linePath(state.generations, i, upTo, strings.size) : ''));
      highlighted.setAttribute('d', upTo >= 0 ? linePath(state.generations, state.highlight, upTo, strings.size) : '');
    }
    const tally = state.tallies[shownGeneration] ?? { gone: 0, full: 0, mixed: runs(), runs: runs() };
    const generation = fill(strings.generation, { g: shownGeneration, total: strings.total });
    generationText.textContent = generation;
    countText.textContent = fill(strings.count, { ...tally });
    scrub.value = String(shownGeneration);
    scrub.setAttribute('aria-valuetext', generation);
  };

  const controls = () => {
    const state = stateOf(world);
    run.textContent = strings[buttonLabel(state.phase)];
    restart.disabled = state.phase === 'idle';
    highlight.disabled = false;
    scrub.disabled = state.phase !== 'done';
  };

  const end = () => {
    const state = stateOf(world);
    state.phase = 'done';
    state.shown = strings.total;
    const tally = state.tallies[strings.total];
    const trust = strings.worlds[world]?.trust ?? 0;
    if (tally) status.textContent = fill(strings.done, { trust, total: strings.total, ...tally });
  };

  const tick = (now: number) => {
    frame = 0;
    const state = stateOf(world);
    if (failed || (state.phase !== 'running' && state.phase !== 'starting')) return;
    const seconds = last ? (now - last) / 1000 : 0;
    last = now;
    const received = state.generations.length;
    if (reduced.matches) state.shown = received > strings.total ? strings.total : 0;
    else state.shown = advance(state.shown, seconds, received);
    if (received > strings.total && state.shown >= strings.total) {
      end();
      controls();
      draw(true);
      return;
    }
    draw();
    frame = requestAnimationFrame(tick);
  };

  function play(): void {
    const state = stateOf(world);
    if (failed || frame || (state.phase !== 'running' && state.phase !== 'starting')) return;
    last = 0;
    frame = requestAnimationFrame(tick);
  }

  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  /** Plays the shown world from where it is, asking the worker for it if it never ran. */
  const go = () => {
    const state = stateOf(world);
    ask(state, world);
    state.phase = state.generations.length > 0 ? 'running' : 'starting';
    status.textContent = '';
    controls();
    play();
  };

  run.addEventListener('click', () => {
    if (failed) return;
    const state = stateOf(world);
    if (state.phase === 'running' || state.phase === 'starting') {
      state.phase = 'paused';
      stop();
      controls();
      draw(true);
      return;
    }
    if (state.phase === 'done') state.shown = 0;
    go();
  });

  restart.addEventListener('click', () => {
    if (failed) return;
    stop();
    stateOf(world).shown = 0;
    go();
    draw(true);
  });

  highlight.addEventListener('click', () => {
    const state = stateOf(world);
    state.highlight = nextRun(state.highlight, runs());
    draw(true);
  });

  scrub.addEventListener('input', () => {
    const state = stateOf(world);
    if (state.phase !== 'done') return;
    state.shown = Number(scrub.value);
    draw(true);
  });

  // Another world: the one shown pauses where it is; the chosen one runs, or shows as it was left.
  root.addEventListener('change', (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.dataset.world === undefined) return;
    const leaving = stateOf(world);
    if (leaving.phase === 'running' || leaving.phase === 'starting') leaving.phase = 'paused';
    stop();
    world = chosen();
    for (const text of root.querySelectorAll<HTMLElement>('[data-world-text]')) text.hidden = text.dataset.worldText !== world;
    const state = stateOf(world);
    status.textContent = '';
    if (failed) return;
    if (state.phase === 'done') {
      end();
      controls();
      draw(true);
      return;
    }
    go();
    draw(true);
  });

  // The press that loaded this module runs the chosen world.
  go();
  draw(true);
}

// Bundled apart and loaded by the first-load script when «Run the engine» is pressed (./compete.ts):
// it mounts every block that asked for it. A module that only exported this would be bundled empty.
for (const root of document.querySelectorAll<HTMLElement>('[data-compete-live][data-pressed]')) {
  if (root.dataset.live !== undefined) continue;
  root.dataset.live = '';
  mountLive(root, JSON.parse(root.dataset.strings ?? '{}') as LiveStrings);
}
