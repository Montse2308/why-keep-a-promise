/**
 * First-load script of /finding's live engine (ADR 0042): it shows the block, which stays hidden
 * without JavaScript, and, until «Run the engine» is pressed, only swaps the chosen world's text and
 * count. The press loads the rest, ./compete-live.ts, from the URL the build wrote in the block's
 * `data-later-module` (CompeteLive.astro); it brings the chart and the controls, and starts the
 * worker with the engine from `data-later-worker`. Nothing of the engine is fetched or run before.
 * If that load fails, the still figure stays and the status says the engine could not run.
 *
 * It imports nothing and loads ./compete-live.ts with a script element, so it shares no module with
 * any other script: small and alone, Astro inlines it in the page, and /finding's first load fetches
 * no script more than before (an extra request delayed its largest paint by 0.15 s on Lighthouse).
 */
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

/** Fills a UI string's `{placeholders}`: its own, so this script imports nothing and can be inlined in the page. */
function fill(template: string, values: Readonly<Record<string, number>>): string {
  return template.replace(/\{([a-z]+)\}/gi, (whole, name: string) => String(values[name] ?? whole));
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
      // The module is a URL the build wrote, loaded by a script element: an `import()` here, even of a
      // variable, would keep Astro from inlining this script. It mounts every block marked as pressed.
      root.dataset.pressed = '';
      const script = document.createElement('script');
      script.type = 'module';
      script.src = root.dataset.laterModule ?? '';
      script.addEventListener('error', () => {
        // The button keeps the focus it has: it says it does nothing now, without leaving the tab order.
        run.textContent = strings.run;
        run.setAttribute('aria-disabled', 'true');
        status.textContent = strings.failed;
      });
      document.head.append(script);
    },
    { once: true },
  );
}
