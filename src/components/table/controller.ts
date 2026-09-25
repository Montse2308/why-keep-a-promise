/**
 * Client script for the table: the site's only JavaScript. It turns clicks into events for the
 * pure state machines in src/lib/table/, shows the resulting state, moves focus to the first
 * control of the next step and announces each result in the table's `aria-live` region.
 * Every table on the page is mounted independently.
 */
import { METER_POSITION } from '../../lib/table/expectation';
import type { Fraction } from '../../lib/table/fraction';
import type { Choice, Face, Rng } from '../../lib/table/game';
import { moment1, MOMENT1_START, type Moment1Event, type Moment1State, type Outcome } from '../../lib/table/moment1';
import { moment2, MOMENT2_START, type Moment2Event, type Moment2State } from '../../lib/table/moment2';
import type { ClientStrings } from '../../lib/table/strings';
import { fill } from '../../lib/template';

const PIPS: Record<Face, readonly string[]> = {
  1: ['c'],
  2: ['tl', 'br'],
  3: ['tl', 'c', 'br'],
  4: ['tl', 'tr', 'bl', 'br'],
  5: ['tl', 'tr', 'c', 'bl', 'br'],
  6: ['tl', 'tr', 'ml', 'mr', 'bl', 'br'],
};
const METER_WIDTH = 240; // viewBox width of the meter in GameTable.astro

export function mountAll(scope: ParentNode = document, rng: Rng = Math.random): void {
  for (const root of scope.querySelectorAll<HTMLElement>('[data-game-table]')) {
    if (root.dataset.mounted !== undefined) continue;
    root.dataset.mounted = '';
    mount(root, rng);
  }
}

function formatFraction({ num, den }: Fraction): string {
  return den === 1 ? String(num) : `${num}/${den}`;
}

function toggle(element: Element | null, on: boolean, attribute = 'data-on'): void {
  element?.toggleAttribute(attribute, on);
}

function mount(root: HTMLElement, rng: Rng): void {
  const strings = JSON.parse(root.dataset.strings ?? '{}') as ClientStrings;
  const s = (key: keyof ClientStrings, values?: Record<string, string | number>) =>
    values ? fill(strings[key], values) : strings[key];
  const slot = <T extends Element = HTMLElement>(name: string) => root.querySelector<T>(`[data-slot="${name}"]`);
  const step = (name: string) => root.querySelector<HTMLElement>(`[data-step="${name}"]`);
  const status = slot('status');

  /** Shows or hides a step; a step that appears is marked so CSS can fade it in. */
  function showStep(name: string, visible: boolean): void {
    const element = step(name);
    if (!element) return;
    const appearing = visible && element.hidden;
    element.hidden = !visible;
    if (appearing) restart(element, 'data-entered');
  }

  function showControls(name: string, visible: boolean): void {
    const controls = step(name)?.querySelector<HTMLElement>('[data-controls]');
    if (controls) controls.hidden = !visible;
  }

  function setText(name: string, text: string | null): void {
    const element = slot(name);
    if (!element) return;
    element.hidden = text === null;
    element.textContent = text ?? '';
  }

  function restart(element: Element, attribute: string): void {
    element.removeAttribute(attribute);
    void element.getBoundingClientRect(); // restart the CSS animation
    element.setAttribute(attribute, '');
  }

  function focusStep(name: string): void {
    step(name)?.querySelector<HTMLButtonElement>('[data-controls]:not([hidden]) button')?.focus();
  }

  function announce(parts: string[]): void {
    if (!status) return;
    // Clearing first makes a repeated message ("New round.") be announced again.
    status.textContent = '';
    window.setTimeout(() => {
      status.textContent = parts.join(' ');
    }, 50);
  }

  function choiceSummary(choice: Choice): string {
    return s(choice === 'roll' ? 'table.summary.roll' : 'table.summary.dont');
  }

  function renderOutcome(outcome: Outcome | null, rolled: boolean): void {
    const die = slot('die');
    if (die) {
      die.hidden = outcome?.face == null;
      if (outcome?.face != null) {
        const on = PIPS[outcome.face];
        for (const pip of die.querySelectorAll('[data-pip]')) toggle(pip, on.includes(pip.getAttribute('data-pip') ?? ''));
        die.setAttribute('aria-label', s('table.die.label', { face: outcome.face }));
        if (rolled) restart(die, 'data-rolled');
      }
    }
    setText('expected-you', outcome ? formatFraction(outcome.expected.you) : '');
    setText('expected-other', outcome ? formatFraction(outcome.expected.other) : '');
    setText('realized-you', outcome ? String(outcome.realized.you) : '');
    setText('realized-other', outcome ? String(outcome.realized.other) : '');
  }

  function outcomeAnnouncement(outcome: Outcome): string[] {
    return [
      choiceSummary(outcome.choice),
      ...(outcome.face === null ? [] : [s('table.announce.die', { face: outcome.face })]),
      s('table.announce.outcome', { you: outcome.realized.you, other: outcome.realized.other }),
    ];
  }

  const live = root.querySelector<HTMLElement>('[data-live]');
  if (live) live.hidden = false;

  if (root.dataset.mode === 'moment2') {
    mountMoment2();
  } else {
    mountMoment1();
  }

  function mountMoment1(): void {
    let state: Moment1State = MOMENT1_START;
    const send = (event: Moment1Event) => (state = moment1(state, event, rng));

    function render(rolled = false): void {
      const outcome = state.phase === 'outcome' ? state : null;
      showControls('choice', state.phase === 'idle');
      setText('choice-summary', outcome ? choiceSummary(outcome.choice) : null);
      showStep('outcome', outcome !== null);
      renderOutcome(outcome, rolled);
    }

    root.addEventListener('click', (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>('button[data-action]');
      if (!button) return;
      const action = button.dataset.action;
      if (action === 'choose') {
        const choice = button.dataset.value as Choice;
        send({ type: 'choose', choice });
        if (choice === 'roll') send({ type: 'throw' });
        send({ type: 'settle' });
        render(true);
        if (state.phase === 'outcome') announce(outcomeAnnouncement(state));
        focusStep('outcome');
      } else if (action === 'reset') {
        send({ type: 'reset' });
        render();
        announce([s('table.announce.reset')]);
        focusStep('choice');
      }
    });

    render();
  }

  function mountMoment2(): void {
    let state: Moment2State = MOMENT2_START;
    const send = (event: Moment2Event) => (state = moment2(state, event, rng));
    const marker = slot<SVGRectElement>('marker');
    const meter = slot<SVGSVGElement>('meter');

    function render(rolled = false): void {
      const drawn = state.phase === 'idle' || state.phase === 'promised' ? null : state;
      const outcome = state.phase === 'outcome' || state.phase === 'reveal' ? state : null;

      showControls('promise', state.phase === 'idle');
      setText(
        'promise-summary',
        state.phase === 'idle' ? null : s(state.promised ? 'table.summary.promised' : 'table.summary.not-promised'),
      );

      showStep('draw', drawn !== null);
      if (drawn) {
        const { partner, recipient } = drawn;
        const level = s(recipient.expectation === 'higher' ? 'table.meter.higher' : 'table.meter.lower');
        setText('partner', s(partner === 'switched' ? 'table.switch.switched' : 'table.switch.same'));
        const illustrative = slot('illustrative');
        if (illustrative) illustrative.hidden = partner !== 'switched';
        setText(
          'promiser',
          partner === 'switched' ? null : s(recipient.promiser === 'you' ? 'table.promiser.you' : 'table.promiser.none'),
        );
        setText('level', level);
        meter?.setAttribute('aria-label', `${s('table.meter.label')}: ${level}`);
        if (marker) marker.style.transform = `translateX(${METER_POSITION[recipient.expectation] * METER_WIDTH}px)`;
      }
      toggle(marker, drawn !== null);

      showStep('choice', drawn !== null);
      showControls('choice', state.phase === 'switchDrawn');
      setText('choice-summary', outcome ? choiceSummary(outcome.choice) : null);

      showStep('outcome', outcome !== null);
      showControls('outcome', state.phase === 'outcome');
      renderOutcome(outcome, rolled);

      showStep('reveal', state.phase === 'reveal');
    }

    function drawAnnouncement(): string[] {
      if (state.phase !== 'switchDrawn') return [];
      const { promised, partner, recipient } = state;
      return [
        s(promised ? 'table.summary.promised' : 'table.summary.not-promised'),
        `${s(partner === 'switched' ? 'table.switch.switched' : 'table.switch.same')}.`,
        partner === 'switched'
          ? s('table.switch.illustrative')
          : s(recipient.promiser === 'you' ? 'table.promiser.you' : 'table.promiser.none'),
        `${s('table.meter.label')}: ${s(recipient.expectation === 'higher' ? 'table.meter.higher' : 'table.meter.lower')}.`,
      ];
    }

    root.addEventListener('click', (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>('button[data-action]');
      if (!button) return;
      switch (button.dataset.action) {
        case 'promise':
          send({ type: 'promise', promised: button.dataset.value === 'yes' });
          send({ type: 'draw' });
          render();
          announce(drawAnnouncement());
          focusStep('choice');
          break;
        case 'choose': {
          const choice = button.dataset.value as Choice;
          send({ type: 'choose', choice });
          if (choice === 'roll') send({ type: 'throw' });
          send({ type: 'settle' });
          render(true);
          if (state.phase === 'outcome') announce(outcomeAnnouncement(state));
          focusStep('outcome');
          break;
        }
        case 'reveal':
          send({ type: 'reveal' });
          render();
          announce([s('table.reveal.title')]);
          focusStep('reveal');
          break;
        case 'reset':
          send({ type: 'reset' });
          render();
          announce([s('table.announce.reset')]);
          focusStep('promise');
          break;
      }
    });

    render();
  }
}
