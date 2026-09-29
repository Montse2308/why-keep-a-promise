/**
 * The film's script (ADR 0025): turns the storyboard into the film. It reads the native scroll,
 * never captures it, and applies what src/lib/film/stage.ts says the stage shows at that point: the
 * camera, the day's light, the cast and their moods, the rooms, the board, the coins, the die and
 * the golden thread. It also handles the chapters' choices, which are plain buttons: every line a
 * choice leads to was resolved at build time, so the script only shows it. Nothing is stored or sent
 * (ADR 0023).
 */
import { frame, isPortrait, viewBoxAttribute } from '../../lib/film/camera';
import { FACES, type Mood } from '../../lib/film/faces';
import { noteFor } from '../../lib/film/board';
import { bubbleTransform, bulbTransform, boardTransform, coinCountY, coinsTransform, wallTransform } from '../../lib/film/parts';
import { castPositions, stageAt, threadPath, type StageState, type StageView } from '../../lib/film/stage';
import { scrollPosition } from '../../lib/film/timeline';
import { clamp, easeInOut } from '../../lib/film/track';
import { reduce as pick, START as NO_PICKS, isDone, type CellKey, type Tag } from '../../lib/pd/bestReply';
import type { Move } from '../../lib/pd/game';
import { playRound } from '../../lib/pd/round';
import { write, type Message } from '../../lib/film/talk';

const DRAW_MS = 800;
const COUNT_MS = 450;

/** Sets an attribute only when it changes, so a still frame costs the page nothing. */
const cache = new WeakMap<Element, Map<string, string>>();
function set(element: Element | null | undefined, name: string, value: string): void {
  if (!element) return;
  let values = cache.get(element);
  if (!values) cache.set(element, (values = new Map()));
  if (values.get(name) === value) return;
  values.set(name, value);
  element.setAttribute(name, value);
}

function applyMood(root: Element | null, mood: Mood, pointer: readonly [number, number]): void {
  if (!root) return;
  const face = FACES[mood];
  const at = (selector: string, name: string, value: string) => set(root.querySelector(selector), name, value);
  at('.face__mouth', 'd', face.mouth);
  at('.face__brow-l', 'd', face.brows[0]);
  at('.face__brow-r', 'd', face.brows[1]);
  at('.face__open', 'visibility', face.closedEyes ? 'hidden' : 'visible');
  at('.face__closed', 'visibility', face.closedEyes ? 'visible' : 'hidden');
  at('.face__blush', 'opacity', face.blush ? '0.6' : '0');
  at('.face__sweat', 'opacity', face.sweat ? '1' : '0');
  at('.face__tear', 'opacity', face.tear ? '1' : '0');
  at('.face__pupils', 'transform', `translate(${(face.look[0] + pointer[0]).toFixed(1)} ${(face.look[1] + pointer[1]).toFixed(1)})`);
}

/** A choice made once: the chosen ticket stays pressed, and every ticket of the group stays focusable but inert. */
function settle(group: Element | null, chosen: HTMLButtonElement): void {
  group?.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    button.setAttribute('aria-pressed', String(button === chosen));
    button.setAttribute('aria-disabled', 'true');
  });
}

const settled = (button: HTMLButtonElement): boolean => button.getAttribute('aria-disabled') === 'true';

export function start(): void {
  const film = document.querySelector<HTMLElement>('[data-film]');
  const world = film?.querySelector<SVGSVGElement>('[data-world="live"]');
  const chapters = film?.querySelector<HTMLElement>('.film__chapters');
  if (!film || !world || !chapters) return;

  const from = Number(film.dataset.from ?? 0);
  const to = Number(film.dataset.to ?? 1);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const part = (name: string) => world.querySelector<SVGElement>(`[data-part="${name}"]`);
  const parts = {
    skyTop: part('sky-top'),
    skyBottom: part('sky-bottom'),
    far: part('far'),
    near: part('near'),
    hillFar: part('hill-far'),
    hillNear: part('hill-near'),
    floor: part('floor'),
    lamp: part('lamp'),
    wall: part('wall'),
    bulbYou: part('bulb-you'),
    bulbOther: part('bulb-other'),
    you: part('you'),
    other: part('other'),
    shadowYou: part('shadow-you'),
    shadowOther: part('shadow-other'),
    thread: part('thread'),
    threadEdge: part('thread-edge'),
    threadLine: part('thread-line'),
    table: part('table'),
    die: part('die'),
    dieSpin: part('die-spin'),
    board: part('board'),
    coinsYou: part('coins-you'),
    coinsOther: part('coins-other'),
    bubbleYou: part('bubble-you'),
    bubbleOther: part('bubble-other'),
  };
  const bands = [...world.querySelectorAll<SVGElement>('[data-band]')];
  const cells = [...world.querySelectorAll<SVGElement>('[data-cell]')];
  const spool = film.querySelector<SVGElement>('[data-spool]');
  const spoolLabel = film.querySelector<HTMLElement>('[data-spool-label]');
  const title = film.querySelector<HTMLElement>('[data-title]');

  let state: StageState = { promised: null, round: null, columns: NO_PICKS, chat: null };
  let drawStart = 0;
  let countStart = 0;
  let pointer: [number, number] = [0, 0];
  let visible = true;
  let frameRequested = false;

  /** Scroll position through the whole film, from 0 to 1, of which the built chapters hold [from, to]. */
  const position = (): number =>
    scrollPosition(scrollY, chapters.getBoundingClientRect().top + scrollY, chapters.offsetHeight, { from, to });

  /** A stack of coins: `n` of them, counted up as they appear unless motion is reduced. */
  function paintCoins(root: SVGElement | null, x: number, n: number, shown: number, counted: number): void {
    if (!root) return;
    const count = Math.round(n * counted);
    set(root, 'transform', coinsTransform(x));
    set(root, 'opacity', shown.toFixed(3));
    root.querySelectorAll('[data-coin]').forEach((coin, i) => set(coin, 'visibility', i < count ? 'visible' : 'hidden'));
    set(root.querySelector('[data-coin-empty]'), 'opacity', n === 0 ? '0.7' : '0');
    const label = root.querySelector('[data-coin-count]');
    set(label, 'y', String(coinCountY(count)));
    if (label && label.textContent !== String(count)) label.textContent = String(count);
  }

  function paintBoard(board: StageView['board']): void {
    set(parts.board, 'opacity', board.shown.toFixed(3));
    set(parts.board, 'transform', boardTransform(board.shown));
    for (const band of bands) set(band, 'opacity', band.dataset.band === board.column ? '0.1' : '0');
    for (const cell of cells) {
      const tags: readonly Tag[] = board.tags[cell.dataset.cell as CellKey] ?? [];
      cell.querySelectorAll<SVGElement>('[data-tag]').forEach((mark) => {
        const tag = mark.dataset.tag ?? '';
        set(mark, 'opacity', (tags as readonly string[]).includes(tag) ? (tag === 'best' ? '0.45' : '1') : '0');
      });
      const note = noteFor(tags);
      cell.querySelectorAll<SVGElement>('[data-note]').forEach((text) => set(text, 'opacity', text.dataset.note === note ? '1' : '0'));
    }
  }

  const render = (now: number): void => {
    frameRequested = false;
    const p = position();
    const portrait = isPortrait({ width: innerWidth, height: innerHeight });
    const still = reduced.matches;
    const view: StageView = stageAt(p, state, portrait, still);

    const box = frame(view.shot, { width: innerWidth, height: innerHeight });
    set(world, 'viewBox', viewBoxAttribute(box));
    set(parts.skyTop, 'stop-color', view.light['sky-top']);
    set(parts.skyBottom, 'stop-color', view.light['sky-bottom']);
    set(parts.hillFar, 'fill', view.light['hill-far']);
    set(parts.hillNear, 'fill', view.light['hill-near']);
    set(parts.floor, 'fill', view.light.floor);
    set(parts.lamp, 'opacity', view.lamp.toFixed(3));
    film.style.setProperty('--film-fade-from', view.light.floor);
    // The far hills and the sky move slower than the set: a little depth when the camera moves.
    const drift = (box.x + box.width / 2 - 800) * 0.4;
    set(parts.far, 'transform', `translate(${drift.toFixed(2)} ${((box.y - 200) * 0.3).toFixed(2)})`);
    set(parts.near, 'transform', `translate(${(drift * 0.4).toFixed(2)} 0)`);

    const cast = castPositions(view.spread);
    const bob = still ? 0 : Math.sin(now / 650) * 3;
    set(parts.you, 'transform', `translate(${cast.you[0].toFixed(2)} ${(cast.you[1] + bob).toFixed(2)})`);
    set(parts.other, 'transform', `translate(${cast.other[0].toFixed(2)} ${(cast.other[1] - bob).toFixed(2)})`);
    set(parts.shadowYou, 'cx', cast.you[0].toFixed(2));
    set(parts.shadowOther, 'cx', cast.other[0].toFixed(2));
    applyMood(parts.you, view.moods.you, pointer);
    applyMood(parts.other, view.moods.other, pointer);

    set(parts.wall, 'transform', wallTransform(view.rooms));
    set(parts.wall, 'opacity', view.rooms > 0.01 ? '1' : '0');
    set(parts.bulbYou, 'transform', bulbTransform(cast.you[0], view.bulbs));
    set(parts.bulbOther, 'transform', bulbTransform(cast.other[0], view.bulbs));
    set(parts.bulbYou, 'opacity', view.bulbs > 0.01 ? '1' : '0');
    set(parts.bulbOther, 'opacity', view.bulbs > 0.01 ? '1' : '0');
    set(parts.table, 'opacity', view.table.toFixed(3));

    const float = view.die.floating && !still ? Math.sin(now / 520) * 7 : 0;
    set(parts.die, 'transform', `translate(800 ${(view.die.y + float).toFixed(2)})`);
    set(parts.die, 'opacity', view.die.opacity.toFixed(3));
    set(parts.dieSpin, 'transform', `rotate(${view.die.floating && !still ? (Math.sin(now / 900) * 12).toFixed(2) : 0})`);

    paintBoard(view.board);
    const counted = still ? 1 : easeInOut(clamp((now - countStart) / COUNT_MS, 0, 1));
    paintCoins(parts.coinsYou, cast.you[0], view.coins.you, view.coins.shown, counted);
    paintCoins(parts.coinsOther, cast.other[0], view.coins.other, view.coins.shown, counted);

    for (const [bubble, x, shown] of [
      [parts.bubbleYou, cast.you[0], view.bubbles.you],
      [parts.bubbleOther, cast.other[0], view.bubbles.other],
    ] as const) {
      set(bubble, 'opacity', shown.toFixed(3));
      set(bubble, 'transform', bubbleTransform(x, shown));
    }

    const path = threadPath(view.spread);
    const drawn = view.thread.state === 'tied' ? (still ? 1 : easeInOut(clamp((now - drawStart) / DRAW_MS, 0, 1))) : 0;
    for (const line of [parts.threadEdge, parts.threadLine]) {
      set(line, 'd', path);
      set(line, 'stroke-dashoffset', (1 - drawn).toFixed(3));
    }
    set(parts.thread, 'opacity', view.thread.state === 'none' ? '0' : '1');

    title?.style.setProperty('--title-gone', view.titleGone.toFixed(3));
    if (visible) request();
  };

  const request = (): void => {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(render);
  };

  // Only animate while the film is on screen: past it, the page is the previous version's prose.
  new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    if (visible) request();
  }).observe(film);
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  addEventListener(
    'pointermove',
    (event) => {
      pointer = [(event.clientX / innerWidth - 0.5) * 8, (event.clientY / innerHeight - 0.5) * 6];
    },
    { passive: true },
  );

  // Chapter 0: promise or not.
  const promiseOut = film.querySelector<HTMLElement>('#arrival [data-out]');
  film.querySelectorAll<HTMLButtonElement>('[data-promise]').forEach((button, _i, all) => {
    button.addEventListener('click', () => {
      if (settled(button)) return;
      const promised = button.dataset.promise === 'yes';
      state = { ...state, promised };
      drawStart = performance.now();
      all.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      if (promiseOut) promiseOut.textContent = (promised ? promiseOut.dataset.outYes : promiseOut.dataset.outNo) ?? '';
      spool?.setAttribute('data-spool', promised ? 'tied' : 'none');
      if (spoolLabel) spoolLabel.textContent = (promised ? film.dataset.threadTied : film.dataset.threadNone) ?? '';
      request();
    });
  });

  // Chapter 1: one round of the dilemma, played once.
  const roundTickets = film.querySelector('[data-round-tickets]');
  const roundOut = film.querySelector<HTMLElement>('[data-round-out]');
  film.querySelectorAll<HTMLButtonElement>('[data-round]').forEach((button) => {
    button.addEventListener('click', () => {
      if (settled(button) || state.round) return;
      state = { ...state, round: playRound(state.round ?? null, button.dataset.round as Move) };
      countStart = performance.now();
      settle(roundTickets, button);
      if (roundOut) roundOut.textContent = button.dataset.said ?? '';
      request();
    });
  });

  // Chapter 1: the two columns, one after the other.
  const steps = [...film.querySelectorAll<HTMLElement>('[data-column]')];
  const columnsOut = film.querySelector<HTMLElement>('[data-columns-out]');
  steps.forEach((step, i) => {
    step.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach((button) => {
      button.addEventListener('click', () => {
        if (settled(button)) return;
        const columns = pick(state.columns ?? NO_PICKS, { type: 'pick', move: button.dataset.pick as Move });
        state = { ...state, columns };
        settle(step, button);
        const next = steps[i + 1];
        const said = button.dataset.said ?? '';
        if (columnsOut) columnsOut.textContent = isDone(columns) ? `${said} ${columnsOut.dataset.both ?? ''}` : said;
        if (next) {
          // One step at a time, so the card keeps its size: the board keeps the finished column.
          next.hidden = false;
          next.querySelector<HTMLButtonElement>('button')?.focus();
          step.hidden = true;
        }
        request();
      });
    });
  });

  // Chapter 2: one message, already written; the other answers.
  const chatTickets = film.querySelector('[data-chat-tickets]');
  const chatOut = film.querySelector<HTMLElement>('[data-chat-out]');
  const mine = film.querySelector<HTMLElement>('[data-chat-mine]');
  const answer = film.querySelector<HTMLElement>('[data-chat-answer]');
  film.querySelectorAll<HTMLButtonElement>('[data-message]').forEach((button) => {
    button.addEventListener('click', () => {
      if (settled(button) || state.chat) return;
      state = { ...state, chat: write(state.chat ?? null, button.dataset.message as Message) };
      settle(chatTickets, button);
      // The chosen ticket stays, pressed and focused, as the message; the others go.
      chatTickets?.querySelectorAll<HTMLButtonElement>('button').forEach((other) => (other.hidden = other !== button));
      for (const [bubble, text] of [
        [mine, button.dataset.says],
        [answer, button.dataset.answer],
      ] as const) {
        if (!bubble) continue;
        bubble.querySelector('[data-text]')?.replaceChildren(text ?? '');
        bubble.dataset.shown = '';
      }
      if (chatOut) chatOut.textContent = button.dataset.said ?? '';
      request();
    });
  });

  request();
}
