/**
 * Client script for /finding's formula explorer (ADR 0038): it shows the explorer's block, which stays
 * hidden without JavaScript, and redraws the hill of the guilt available whenever a slider moves. All
 * the arithmetic is in src/lib/finding/explorer.ts; this only draws it, in pixels of the plot's real
 * width (so its labels keep their size on a phone), and says the state in the polite live region once
 * the slider rests. Nothing animates: with reduced motion or without it, every change is a cut.
 */
import { decimals, fillIn as fill, read, thetaText, type Reading } from '../../lib/finding/explorer';

export interface ExplorerStrings {
  /** «Background trust {a}: personal guilt rolls». */
  readonly rolls: string;
  readonly not: string;
  /** «Personal guilt rolls from {from} to {to}; the peak, {guilt}, is at {at}.» */
  readonly window: string;
  /** «With θ below {min}, personal guilt never rolls, at any background trust.» */
  readonly closed: string;
  readonly peak: string;
  readonly axis: string;
}

/** The live region speaks once a slider rests, not on every step of a drag. */
const ANNOUNCE_DELAY = 400;
/** The plot's vertical scale: the guilt at the highest belief, 100² / 400. */
const GUILT_MAX = 25;
/** Background trust runs out of 100 whatever the belief, so moving the belief moves the hill. */
const TRUST_MAX = 100;
const SVG = 'http://www.w3.org/2000/svg';

export function mountExplorers(scope: ParentNode = document): void {
  for (const root of scope.querySelectorAll<HTMLElement>('[data-explorer]')) {
    if (root.dataset.mounted !== undefined) continue;
    root.dataset.mounted = '';
    mount(root);
  }
}

function element<K extends keyof SVGElementTagNameMap>(parent: SVGElement, name: K, className: string): SVGElementTagNameMap[K] {
  const made = document.createElementNS(SVG, name);
  made.setAttribute('class', className);
  parent.append(made);
  return made;
}

function set(target: Element, attributes: Record<string, string | number>): void {
  for (const [name, value] of Object.entries(attributes)) target.setAttribute(name, String(value));
}

function mount(root: HTMLElement): void {
  const strings = JSON.parse(root.dataset.strings ?? '{}') as ExplorerStrings;
  const control = (id: string) => root.querySelector<HTMLInputElement>(`[data-control="${id}"]`);
  const shows = (id: string) => root.querySelector<HTMLOutputElement>(`[data-shows="${id}"]`);
  const [a, b, theta] = [control('a'), control('b'), control('theta')];
  const plot = root.querySelector<SVGSVGElement>('[data-plot]');
  const status = root.querySelector<HTMLElement>('[data-status]');
  const facts = root.querySelector<HTMLElement>('[data-facts]');
  if (!a || !b || !theta || !plot || !status || !facts) return;

  // The block of prose around the explorer, with its «Try it», shows only now that the script runs.
  const block = root.closest<HTMLElement>('[data-explorer-block]');
  if (block) block.hidden = false;

  const grid = [0, 1].map(() => element(plot, 'line', 'ex-grid'));
  const band = element(plot, 'rect', 'ex-window');
  const edges = [0, 1].map(() => element(plot, 'line', 'ex-edge'));
  const peakLine = element(plot, 'line', 'ex-peak');
  const hill = element(plot, 'path', 'ex-hill');
  const thresholdLine = element(plot, 'line', 'ex-threshold');
  const point = element(plot, 'circle', 'ex-point');
  const ticks = [0, 1, 2].map(() => element(plot, 'text', 'ex-tick'));
  const thresholdLabel = element(plot, 'text', 'ex-tick');
  const peakLabel = element(plot, 'text', 'ex-tick');
  const axisLabel = element(plot, 'text', 'ex-tick');

  let timer: ReturnType<typeof setTimeout> | undefined;
  let spoken = '';

  const draw = (reading: Reading) => {
    const width = plot.clientWidth || 600;
    const box = { left: 36, right: width - 12, top: 22, bottom: 180 };
    const x = (trust: number) => box.left + (trust / TRUST_MAX) * (box.right - box.left);
    // The Bézier's control point lies above the scale; only what is drawn as a mark is kept inside it.
    const yAt = (value: number) => box.bottom - (value / GUILT_MAX) * (box.bottom - box.top);
    const y = (value: number) => yAt(Math.min(value, GUILT_MAX));

    set(grid[0]!, { x1: box.left, x2: box.right, y1: y(0), y2: y(0) });
    set(grid[1]!, { x1: box.left, x2: box.right, y1: y(GUILT_MAX), y2: y(GUILT_MAX) });
    [0, 50, 100].forEach((trust, i) => {
      set(ticks[i]!, { x: x(trust), y: box.bottom + 20, 'text-anchor': i === 0 ? 'start' : i === 2 ? 'end' : 'middle' });
      ticks[i]!.textContent = String(trust);
    });
    set(axisLabel, { x: (box.left + box.right) / 2, y: box.bottom + 46, 'text-anchor': 'middle' });
    axisLabel.textContent = strings.axis;

    // The hill a · (b − a) / 100 from 0 to b is a parabola: one quadratic Bézier, its control at twice the peak.
    const { peak } = reading;
    set(hill, { d: `M ${x(0)} ${y(0)} Q ${x(peak.a)} ${yAt(2 * peak.guilt)} ${x(reading.b)} ${y(0)}` });
    set(peakLine, { x1: x(peak.a), x2: x(peak.a), y1: y(peak.guilt) - 6, y2: y(0) });
    set(peakLabel, { x: x(peak.a), y: y(peak.guilt) - 16, 'text-anchor': 'middle' });
    peakLabel.textContent = fill(strings.peak, { guilt: decimals(peak.guilt, 2) });

    const visible = reading.threshold <= GUILT_MAX;
    thresholdLine.style.display = visible ? '' : 'none';
    thresholdLabel.style.display = visible ? '' : 'none';
    if (visible) {
      set(thresholdLine, { x1: box.left, x2: box.right, y1: y(reading.threshold), y2: y(reading.threshold) });
      set(thresholdLabel, { x: box.left - 6, y: y(reading.threshold) + 4, 'text-anchor': 'end' });
      thresholdLabel.textContent = decimals(reading.threshold, 2);
    }

    const open = reading.window;
    band.style.display = open ? '' : 'none';
    edges.forEach((edge) => (edge.style.display = open ? '' : 'none'));
    if (open) {
      set(band, { x: x(open.from), y: box.top, width: Math.max(0, x(open.to) - x(open.from)), height: box.bottom - box.top });
      set(edges[0]!, { x1: x(open.from), x2: x(open.from), y1: box.top, y2: box.bottom });
      set(edges[1]!, { x1: x(open.to), x2: x(open.to), y1: box.top, y2: box.bottom });
    }

    set(point, { cx: x(reading.a), cy: y(reading.guilt), r: 7 });
    point.toggleAttribute('data-rolls', reading.rolls);
  };

  const update = (speak: boolean) => {
    // Background trust runs up to the belief: its slider's end follows the belief's.
    a.max = b.value;
    const reading = read(Number(a.value), Number(b.value), Number(theta.value));
    if (Number(a.value) !== reading.a) a.value = String(reading.a);
    shows('a')!.textContent = String(reading.a);
    shows('b')!.textContent = String(reading.b);
    shows('theta')!.textContent = decimals(reading.theta, 2);

    const said = fill(reading.rolls ? strings.rolls : strings.not, { a: reading.a });
    facts.textContent = reading.window
      ? fill(strings.window, { from: decimals(reading.window.from, 1), to: decimals(reading.window.to, 1), guilt: decimals(reading.peak.guilt, 2), at: decimals(reading.peak.a, 1).replace(/\.0$/, '') })
      : fill(strings.closed, { min: thetaText(reading.thetaMin) });
    draw(reading);

    clearTimeout(timer);
    if (!speak) {
      // Said only if it changed, so loading the page or resizing it does not speak.
      if (status.textContent !== said) status.textContent = said;
      spoken = said;
      return;
    }
    timer = setTimeout(() => {
      if (said !== spoken) status.textContent = said;
      spoken = said;
    }, ANNOUNCE_DELAY);
  };

  for (const input of [a, b, theta]) input.addEventListener('input', () => update(true));
  new ResizeObserver(() => update(false)).observe(plot);
  update(false);
}
