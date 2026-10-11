/**
 * First-load script of /finding's live engine (ADR 0042): it shows the block, which stays hidden
 * without JavaScript, and, until «Run the engine» is pressed, only swaps the chosen world's text and
 * count. The press loads the rest, ./compete-live.ts, which brings the chart, the controls and the
 * worker with the engine; nothing of the engine is fetched or run before. If that load fails, the
 * still figure stays and the status says the engine could not run.
 *
 * It imports only ./compete-live.ts, on the press, and the explorer's template filler, already on
 * /finding, so it shares no module with the film's script.
 */
import { fillIn as fill } from '../../lib/finding/explorer';
import type { WorldId } from '../../lib/finding/worlds';

export interface LiveStrings {
  readonly run: string;
  readonly starting: string;
  readonly pause: string;
  readonly resume: string;
  /** «Generation {g} of {total}». */
  readonly generation: string;
  /** «Personal guilt gone: {gone} of {runs} · Only personal guilt: {full} · Still mixed: {mixed}». */
  readonly count: string;
  /** What the live region says when a world ends. */
  readonly done: string;
  readonly failed: string;
  /** Generations of each run, and people in each. */
  readonly total: number;
  readonly size: number;
  readonly worlds: Readonly<Record<WorldId, { readonly trust: number; readonly runs: number }>>;
}

export function mountCompetes(scope: ParentNode = document): void {
  for (const root of scope.querySelectorAll<HTMLElement>('[data-compete-live]')) {
    if (root.dataset.mounted !== undefined) continue;
    root.dataset.mounted = '';
    mount(root);
  }
}

/** The world whose radio is checked. */
export function chosen(root: HTMLElement): WorldId {
  return (root.querySelector<HTMLInputElement>('[data-world]:checked')?.value ?? 'between') as WorldId;
}

/** Shows the chosen world's text and hides the others'. */
export function showText(root: HTMLElement, world: WorldId): void {
  for (const text of root.querySelectorAll<HTMLElement>('[data-world-text]')) text.hidden = text.dataset.worldText !== world;
}

function mount(root: HTMLElement): void {
  const strings = JSON.parse(root.dataset.strings ?? '{}') as LiveStrings;
  const run = root.querySelector<HTMLButtonElement>('[data-run]');
  const count = root.querySelector<HTMLElement>('[data-count]');
  const status = root.querySelector<HTMLElement>('[data-status]');
  if (!run || !count || !status) return;
  root.hidden = false;

  // Before the press, a world is at its start: every run still mixed.
  const onChoose = () => {
    const world = chosen(root);
    const runs = strings.worlds[world]?.runs ?? 0;
    showText(root, world);
    count.textContent = fill(strings.count, { gone: 0, full: 0, mixed: runs, runs });
  };
  root.addEventListener('change', onChoose);

  run.addEventListener(
    'click',
    () => {
      root.removeEventListener('change', onChoose);
      run.textContent = strings.starting;
      import('./compete-live')
        .then(({ mountLive }) => mountLive(root, strings))
        .catch(() => {
          // The button keeps the focus it has: it says it does nothing now, without leaving the tab order.
          run.textContent = strings.run;
          run.setAttribute('aria-disabled', 'true');
          status.textContent = strings.failed;
        });
    },
    { once: true },
  );
}
