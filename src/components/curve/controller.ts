/**
 * Client script for the curve's control (chapter 7): the slider moves a cursor over the rows of the curve. It reads
 * the rows the component rendered into the figure (never curve.json itself), shows the payoff of
 * each reason at the selected row and announces it in the figure's `aria-live` region.
 */
import { xPercent, yPixel, type Frame } from '../../lib/curve/chart';
import { REASONS, type Curve, type CurveRow } from '../../lib/curve/curve';
import { announcement, pullsText, rowAt, valueText } from '../../lib/curve/moment3';
import type { CurveStrings } from '../../lib/curve/strings';
import { fill } from '../../lib/template';

/** The live region speaks once the slider rests, not on every step of a drag. */
const ANNOUNCE_DELAY = 400;

export function mountAll(scope: ParentNode = document): void {
  for (const root of scope.querySelectorAll<HTMLElement>('[data-curve]')) {
    if (root.dataset.mounted !== undefined) continue;
    root.dataset.mounted = '';
    mount(root);
  }
}

function mount(root: HTMLElement): void {
  const rows = JSON.parse(root.dataset.rows ?? '[]') as CurveRow[];
  const axis = JSON.parse(root.dataset.axis ?? '{}') as Curve['axis'];
  const frame = JSON.parse(root.dataset.frame ?? '{}') as Frame;
  const strings = JSON.parse(root.dataset.strings ?? '{}') as CurveStrings;
  const slot = <T extends Element = HTMLElement>(name: string) => root.querySelector<T>(`[data-slot="${name}"]`);
  const slider = root.querySelector<HTMLInputElement>('input[type="range"]');
  const cursor = slot<SVGGElement>('cursor');
  const line = slot<SVGLineElement>('cursor-line');
  const dot = slot<SVGCircleElement>('cursor-dot');
  const status = slot('status');
  const live = root.querySelector<HTMLElement>('[data-live]');
  if (!slider || rows.length === 0) return;

  let timer: number | undefined;

  function render(row: CurveRow): void {
    const x = `${xPercent(row.trust, axis)}%`;
    line?.setAttribute('x1', x);
    line?.setAttribute('x2', x);
    dot?.setAttribute('cx', x);
    dot?.setAttribute('cy', String(yPixel(row.payoff.personal, frame)));
    slider?.setAttribute('aria-valuetext', valueText(strings, row));
    const trust = slot('trust');
    if (trust) trust.textContent = fill(strings['curve.trust.value'], { n: row.trust });
    for (const reason of REASONS) {
      const value = slot(reason);
      if (value) value.textContent = String(row.payoff[reason]);
    }
    const pulls = slot('pulls');
    if (pulls) pulls.textContent = pullsText(strings, row);
  }

  function announce(row: CurveRow): void {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (status) status.textContent = announcement(strings, row);
    }, ANNOUNCE_DELAY);
  }

  slider.addEventListener('input', () => {
    const row = rowAt(rows, Number(slider.value));
    render(row);
    announce(row);
  });

  if (live) live.hidden = false;
  cursor?.setAttribute('data-on', '');
  render(rowAt(rows, Number(slider.value)));
}
