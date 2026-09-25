/**
 * Client script for the best-reply exercise on /dilemma. It turns clicks into events for the pure
 * state machine in src/lib/pd/, marks the matrix, keeps focus on the next control and announces
 * each result in the figure's `aria-live` region. Deterministic: nothing is drawn at random.
 */
import { cellTags, conclusion, currentColumn, reduce, START, type CellKey, type Event, type State } from '../../lib/pd/bestReply';
import type { Move } from '../../lib/pd/game';
import type { PdStrings } from '../../lib/pd/strings';
import { askText, conclusionText, pickText, tagText } from '../../lib/pd/text';

export function mountAll(scope: ParentNode = document): void {
  for (const root of scope.querySelectorAll<HTMLElement>('[data-best-reply]')) {
    if (root.dataset.mounted !== undefined) continue;
    root.dataset.mounted = '';
    mount(root);
  }
}

function mount(root: HTMLElement): void {
  const strings = JSON.parse(root.dataset.strings ?? '{}') as PdStrings;
  const slot = (name: string) => root.querySelector<HTMLElement>(`[data-slot="${name}"]`);
  const step = (name: string) => root.querySelector<HTMLElement>(`[data-step="${name}"]`);
  const status = slot('status');
  let state: State = START;

  function announce(text: string): void {
    if (!status) return;
    // Clearing first makes a repeated message be announced again.
    status.textContent = '';
    window.setTimeout(() => {
      status.textContent = text;
    }, 50);
  }

  function show(element: HTMLElement | null, visible: boolean): void {
    if (!element) return;
    const appearing = visible && element.hidden;
    element.hidden = !visible;
    if (appearing) {
      element.removeAttribute('data-entered');
      void element.getBoundingClientRect(); // restart the CSS animation
      element.setAttribute('data-entered', '');
    }
  }

  function render(): void {
    const column = currentColumn(state);
    for (const element of root.querySelectorAll<HTMLElement>('[data-column]')) {
      element.toggleAttribute('data-active', element.dataset.column === column);
    }

    const tags = cellTags(state);
    for (const cell of root.querySelectorAll<HTMLElement>('[data-cell]')) {
      const own = tags[cell.dataset.cell as CellKey] ?? [];
      cell.toggleAttribute('data-picked', own.includes('pick'));
      const holder = cell.querySelector<HTMLElement>('[data-tags]');
      if (!holder) continue;
      holder.replaceChildren(
        ...own.map((tag) => {
          const label = document.createElement('span');
          label.className = 'br-tag';
          label.dataset.tag = tag;
          label.textContent = tagText(strings, tag);
          return label;
        }),
      );
    }

    const ask = slot('ask');
    if (ask) ask.textContent = askText(strings, state) ?? '';
    show(step('ask'), column !== null);

    const log = slot('log');
    if (log) {
      log.replaceChildren(
        ...state.picks.map((pick) => {
          const item = document.createElement('li');
          item.textContent = pickText(strings, pick);
          return item;
        }),
      );
      log.hidden = state.picks.length === 0;
    }

    const result = conclusion(state);
    const [dominant, equilibrium] = result ? conclusionText(strings, result) : ['', ''];
    const dominantSlot = slot('dominant');
    const equilibriumSlot = slot('equilibrium');
    if (dominantSlot) dominantSlot.textContent = dominant;
    if (equilibriumSlot) equilibriumSlot.textContent = equilibrium;
    show(step('done'), result !== null);
  }

  function send(event: Event): void {
    state = reduce(state, event);
    render();
  }

  root.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button');
    if (!button || !root.contains(button)) return;

    if (button.dataset.move) {
      send({ type: 'pick', move: button.dataset.move as Move });
      const pick = state.picks.at(-1);
      const result = conclusion(state);
      const parts = [pick ? pickText(strings, pick) : '', result ? conclusionText(strings, result).join(' ') : askText(strings, state) ?? ''];
      announce(parts.filter(Boolean).join(' '));
      // Focus stays on the first move for the next column, or goes to "Start again" once done.
      (result ? step('done') : step('ask'))?.querySelector<HTMLButtonElement>('button')?.focus();
    } else if (button.dataset.action === 'reset') {
      send({ type: 'reset' });
      announce([strings['pd.announce.reset'], askText(strings, state) ?? ''].join(' '));
      step('ask')?.querySelector<HTMLButtonElement>('button')?.focus();
    }
  });

  const live = root.querySelector<HTMLElement>('[data-live]');
  if (live) live.hidden = false;
  render();
}
