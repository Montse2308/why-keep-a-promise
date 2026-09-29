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
import {
  boardOpacity,
  boardTransform,
  bubbleTransform,
  bulbTransform,
  coinCountY,
  coinsTransform,
  eyesTransform,
  PIPS,
  placeTransform,
  shadowTransform,
  voiceTransform,
  wallTransform,
  type Pip,
} from '../../lib/film/parts';
import { signTransform } from '../../lib/film/signs';
import { lookAt } from '../../lib/film/voices';
import { brokenBetween, stageAt, threadBetween, type Place, type StageState, type StageView } from '../../lib/film/stage';
import { scrollPosition } from '../../lib/film/timeline';
import { clamp, easeInOut } from '../../lib/film/track';
import { reduce as pick, START as NO_PICKS, isDone, type CellKey, type Tag } from '../../lib/pd/bestReply';
import type { Move } from '../../lib/pd/game';
import { playRound } from '../../lib/pd/round';
import { write, type Message } from '../../lib/film/talk';
import { BET_START, isBet, type Bet } from '../../lib/film/bet';
import { current as waiting, DEALT, decide as decideCard, tally, type DeckState } from '../../lib/film/deck';
import { guessOf, type GuessId } from '../../lib/film/guess';
import { fill } from '../../lib/template';
import { decide, UNDECIDED, type DecisionState } from '../../lib/table/decision';
import { DIE_FACES, type Choice, type Face } from '../../lib/table/game';

const DRAW_MS = 800;
const COUNT_MS = 450;
/** How long the die spins in the air before it lands. */
const ROLL_MS = 1000;
/** How long a card's person takes to slide into the seat, and how long a decided card stays. */
const SLIDE_MS = 520;
const CARD_MS = 1100;

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
    partner: part('partner'),
    shadowYou: part('shadow-you'),
    shadowOther: part('shadow-other'),
    shadowPartner: part('shadow-partner'),
    dark: part('dark'),
    eyesYou: part('eyes-you'),
    eyesOther: part('eyes-other'),
    eyesPartner: part('eyes-partner'),
    thread: part('thread'),
    threadEdge: part('thread-edge'),
    threadLine: part('thread-line'),
    threadBroken: part('thread-broken'),
    brokenEdges: [part('broken-edge-0'), part('broken-edge-1')],
    brokenLines: [part('broken-line-0'), part('broken-line-1')],
    table: part('table'),
    die: part('die'),
    dieSpin: part('die-spin'),
    board: part('board'),
    coinsYou: part('coins-you'),
    coinsOther: part('coins-other'),
    bubbleYou: part('bubble-you'),
    bubbleOther: part('bubble-other'),
    voices: part('voices'),
    voiceWord: part('voice-word'),
    voiceExpects: part('voice-expects'),
    wordPupils: part('word-pupils'),
    expectsPupils: part('expects-pupils'),
    wordGlow: part('word-glow'),
    globeOther: part('globe-other'),
    globePartner: part('globe-partner'),
    signs: part('signs'),
  };
  /** Each of chapter 6's signs: the sign, its figure, its question mark and the expectation under it. */
  const signParts = (['same', 'switched'] as const).map((id) => ({
    id,
    sign: part(`sign-${id}`),
    figure: part(`sign-${id}-figure`),
    question: part(`sign-${id}-question`),
    expected: part(`sign-${id}-expected`),
  }));
  const bands = [...world.querySelectorAll<SVGElement>('[data-band]')];
  const pips = [...world.querySelectorAll<SVGElement>('[data-pip]')];
  const cells = [...world.querySelectorAll<SVGElement>('[data-cell]')];
  const spool = film.querySelector<SVGElement>('[data-spool]');
  const spoolLabel = film.querySelector<HTMLElement>('[data-spool-label]');
  const title = film.querySelector<HTMLElement>('[data-title]');

  let state: StageState = { promised: null, round: null, columns: NO_PICKS, chat: null, decision: UNDECIDED, deck: { choices: [], at: 0 }, bet: null, guesses: {} };
  let drawStart = 0;
  let rollStart = 0;
  let countStart = 0;
  let turnStart = -Infinity;
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
    set(parts.board, 'opacity', boardOpacity(board.shown, board.folded).toFixed(3));
    set(parts.board, 'transform', boardTransform(board.shown, board.folded));
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

    // On the deck, each new card's person slides into the seat.
    const arriving = still || view.beat.id !== 'deck' ? 1 : easeInOut(clamp((now - turnStart) / SLIDE_MS, 0, 1));
    const seated = (place: Place): Place =>
      arriving >= 1 || place.opacity < 0.5 ? place : { ...place, at: [place.at[0] + (1 - arriving) * 240, place.at[1]], opacity: place.opacity * arriving };
    const you: Place = { at: view.cast.you, scale: 1, opacity: 1 };
    const other = view.cast.other.scale < 1 ? view.cast.other : seated(view.cast.other);
    const partner = seated(view.cast.partner);
    const bob = still ? 0 : Math.sin(now / 650) * 3;
    set(parts.you, 'transform', placeTransform(you, -bob));
    set(parts.other, 'transform', placeTransform(other, bob));
    set(parts.other, 'opacity', other.opacity.toFixed(3));
    set(parts.partner, 'transform', placeTransform(partner, -bob));
    set(parts.partner, 'opacity', partner.opacity.toFixed(3));
    set(parts.shadowYou, 'transform', shadowTransform(you));
    set(parts.shadowOther, 'transform', shadowTransform(other));
    set(parts.shadowOther, 'opacity', (0.2 * other.opacity).toFixed(3));
    set(parts.shadowPartner, 'transform', shadowTransform(partner));
    set(parts.shadowPartner, 'opacity', (0.2 * partner.opacity).toFixed(3));
    applyMood(parts.you, view.moods.you, pointer);
    applyMood(parts.other, view.moods.other, pointer);
    applyMood(parts.partner, view.moods.partner, pointer);
    const cast = { you: view.cast.you, other: other.at };

    // The blackout: the stage goes dark, and only the cast's eyes show where each one is.
    set(parts.dark, 'opacity', view.dark.toFixed(3));
    for (const [eyes, place, kind] of [
      [parts.eyesYou, you, 'circle'],
      [parts.eyesOther, other, 'square'],
      [parts.eyesPartner, partner, 'triangle'],
    ] as const) {
      set(eyes, 'opacity', (view.dark * place.opacity).toFixed(3));
      if (view.dark > 0) set(eyes, 'transform', eyesTransform(place, kind, kind === 'square' ? bob : -bob));
    }

    set(parts.wall, 'transform', wallTransform(view.rooms));
    set(parts.wall, 'opacity', view.rooms > 0.01 ? '1' : '0');
    set(parts.bulbYou, 'transform', bulbTransform(cast.you[0], view.bulbs));
    set(parts.bulbOther, 'transform', bulbTransform(cast.other[0], view.bulbs));
    set(parts.bulbYou, 'opacity', view.bulbs > 0.01 ? '1' : '0');
    set(parts.bulbOther, 'opacity', view.bulbs > 0.01 ? '1' : '0');
    set(parts.table, 'opacity', view.table.toFixed(3));

    // The die floats in chapter 0; in chapter 3 it jumps and spins while it rolls, faces flashing,
    // then lands on the face the decision drew.
    const float = view.die.floating && !still ? Math.sin(now / 520) * 7 : 0;
    const spun = view.die.rolling && !still ? clamp((now - rollStart) / ROLL_MS, 0, 1) : 0;
    const jump = view.die.rolling && !still ? -110 * Math.sin(Math.PI * spun) : 0;
    const turn = view.die.rolling && !still ? 720 * (1 - (1 - spun) ** 3) : view.die.floating && !still ? Math.sin(now / 900) * 12 : 0;
    set(parts.die, 'transform', `translate(800 ${(view.die.y + float + jump).toFixed(2)})`);
    set(parts.die, 'opacity', view.die.opacity.toFixed(3));
    set(parts.dieSpin, 'transform', `rotate(${turn.toFixed(2)})`);
    const face: Face = view.die.rolling && !still ? (DIE_FACES[Math.floor(now / 90) % DIE_FACES.length] ?? view.die.face) : view.die.face;
    for (const pip of pips) set(pip, 'visibility', PIPS[face].includes(pip.dataset.pip as Pip) ? 'visible' : 'hidden');

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

    const path = threadBetween(view.cast.you, other);
    const drawn = view.thread.state === 'tied' ? (still ? 1 : easeInOut(clamp((now - drawStart) / DRAW_MS, 0, 1))) : 0;
    for (const line of [parts.threadEdge, parts.threadLine]) {
      set(line, 'd', path);
      set(line, 'stroke-dashoffset', (1 - drawn).toFixed(3));
    }
    set(parts.thread, 'opacity', view.thread.state === 'tied' ? view.thread.shown.toFixed(3) : '0');
    set(parts.threadBroken, 'opacity', view.thread.state === 'broken' ? view.thread.shown.toFixed(3) : '0');
    brokenBetween(view.cast.you, other).forEach((d, i) => {
      set(parts.brokenEdges[i], 'd', d);
      set(parts.brokenLines[i], 'd', d);
    });

    // The voices float, each at its own pace, and look at what the stage says they look at.
    const { voices } = view;
    set(parts.voices, 'opacity', voices.shown.toFixed(3));
    if (voices.shown > 0) {
      const drift = (speed: number): number => (still ? 0 : Math.sin(now / speed) * 4);
      set(parts.voiceWord, 'transform', voiceTransform([voices.at.word[0], voices.at.word[1] + drift(700)], voices.shown));
      set(parts.voiceExpects, 'transform', voiceTransform([voices.at.expects[0], voices.at.expects[1] + drift(560)], voices.shown));
      const [wx, wy] = lookAt(voices.at.word, voices.look.word);
      const [ex, ey] = lookAt(voices.at.expects, voices.look.expects);
      set(parts.wordPupils, 'transform', `translate(${wx.toFixed(1)} ${wy.toFixed(1)})`);
      set(parts.expectsPupils, 'transform', `translate(${ex.toFixed(1)} ${ey.toFixed(1)})`);
      set(parts.wordGlow, 'opacity', voices.glow.toFixed(3));
      set(parts.globeOther, 'opacity', voices.globe === 'other' ? '1' : '0');
      set(parts.globePartner, 'opacity', voices.globe === 'partner' ? '1' : '0');
    }

    // Chapter 6: the signs come down on their strings, swaying a little, and each figure turns on.
    const { signs } = view;
    set(parts.signs, 'opacity', signs.shown > 0.01 ? '1' : '0');
    if (signs.shown > 0) {
      for (const { id, sign, figure, question, expected } of signParts) {
        const sway = still ? 0 : Math.sin(now / (id === 'same' ? 1300 : 1100)) * 3;
        set(sign, 'transform', `${signTransform(signs.x[id], signs.shown)} rotate(${(sway * 0.4).toFixed(2)})`);
        set(figure, 'opacity', signs[id].toFixed(3));
        set(question, 'opacity', (1 - signs[id]).toFixed(3));
        set(expected, 'opacity', signs.expected.toFixed(3));
      }
    }

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

  /** The spool in the corner: the thread's state, in words too. */
  function spoolAs(thread: 'tied' | 'kept' | 'broken' | 'none'): void {
    spool?.setAttribute('data-spool', thread === 'kept' ? 'tied' : thread);
    const label = { tied: film?.dataset.threadTied, kept: film?.dataset.threadKept, broken: film?.dataset.threadBroken, none: film?.dataset.threadNone }[thread];
    if (spoolLabel) spoolLabel.textContent = label ?? '';
  }

  // Chapter 3 reminds the visitor what they answered in chapter 0.
  const promiseLine = film.querySelector<HTMLElement>('[data-promise-line]');
  const remind = (): void => {
    if (!promiseLine) return;
    const said = state.promised === true ? promiseLine.dataset.yes : state.promised === false ? promiseLine.dataset.no : promiseLine.dataset.none;
    promiseLine.textContent = said ?? '';
  };
  remind();

  // Chapter 0: promise or not. The answer can change until the decision of chapter 3.
  const promiseTickets = film.querySelector('#arrival .tickets');
  const promiseOut = film.querySelector<HTMLElement>('#arrival [data-out]');
  film.querySelectorAll<HTMLButtonElement>('[data-promise]').forEach((button, _i, all) => {
    button.addEventListener('click', () => {
      if (settled(button)) return;
      const promised = button.dataset.promise === 'yes';
      state = { ...state, promised };
      drawStart = performance.now();
      all.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      if (promiseOut) promiseOut.textContent = (promised ? promiseOut.dataset.outYes : promiseOut.dataset.outNo) ?? '';
      spoolAs(promised ? 'tied' : 'none');
      remind();
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

  // Chapter 3: keep the money or roll the die, once. The promise of chapter 0 is settled with it.
  const decisionTickets = film.querySelector('[data-decision-tickets]');
  const decisionOut = film.querySelector<HTMLElement>('[data-decision-out]');
  film.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      if (settled(button) || state.decision?.phase !== 'idle') return;
      const choice = button.dataset.choice as Choice;
      const chosen = decide(UNDECIDED, { type: 'choose', choice }, Math.random);
      state = { ...state, decision: choice === 'roll' ? decide(chosen, { type: 'throw' }, Math.random) : chosen };
      settle(decisionTickets, button);
      promiseTickets?.querySelectorAll('button').forEach((ticket) => ticket.setAttribute('aria-disabled', 'true'));

      const land = (): void => {
        const decision: DecisionState = decide(state.decision ?? UNDECIDED, { type: 'settle' }, Math.random);
        state = { ...state, decision };
        countStart = performance.now();
        if (decision.phase === 'outcome') {
          const said = decision.face === null ? button.dataset.said : (JSON.parse(button.dataset.said ?? '{}') as Record<string, string>)[decision.face];
          const thread = state.promised === true ? (decision.choice === 'dont' ? decisionOut?.dataset.broken : decisionOut?.dataset.kept) : undefined;
          if (decisionOut) decisionOut.textContent = [said, thread].filter(Boolean).join(' ');
          if (state.promised === true) spoolAs(decision.choice === 'dont' ? 'broken' : 'kept');
        }
        request();
      };
      if (choice === 'roll' && !reduced.matches) {
        rollStart = performance.now();
        setTimeout(land, ROLL_MS);
      } else {
        land();
      }
      request();
    });
  });

  // Chapter 5: the deck, one card at a time, each a different person, each decided once. The card
  // flies off, the stage shows what the decision did, and the next person slides into the seat.
  // Swiping the card is a shortcut for its tickets; a vertical drag still scrolls the page.
  const cards = [...film.querySelectorAll<HTMLElement>('[data-card]')];
  const deckOut = film.querySelector<HTMLElement>('[data-deck-out]');
  const tallies = JSON.parse(deckOut?.dataset.tally ?? '{}') as Record<string, string>;
  let deck: DeckState = DEALT;
  const onCard = (i: number, choice: Choice): void => {
    const card = cards[i];
    if (!card || waiting(deck) !== i) return;
    deck = decideCard(deck, choice);
    const button = card.querySelector<HTMLButtonElement>(`[data-deck-choice="${choice}"]`);
    if (button) settle(card, button);
    state = { ...state, deck: { choices: deck.choices, at: i } };
    const said = button?.dataset.said ?? '';
    const next = cards[i + 1];
    if (deckOut) deckOut.textContent = next ? said : `${said} ${tallies[String(tally(deck).kept)] ?? ''}`;
    request();
    // The last card stays, decided, with the tally under it.
    if (!next) return;
    card.dataset.gone = choice;
    setTimeout(
      () => {
        card.hidden = true;
        next.hidden = false;
        next.dataset.arriving = '';
        state = { ...state, deck: { choices: deck.choices, at: i + 1 } };
        turnStart = performance.now();
        next.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
        request();
      },
      reduced.matches ? CARD_MS / 2 : CARD_MS,
    );
  };
  cards.forEach((card, i) => {
    card.querySelectorAll<HTMLButtonElement>('[data-deck-choice]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!settled(button)) onCard(i, button.dataset.deckChoice as Choice);
      });
    });
    let pointerId: number | null = null;
    let start: [number, number] = [0, 0];
    let dx = 0;
    let dragging = false;
    card.addEventListener('pointerdown', (event) => {
      if (waiting(deck) !== i || (event.pointerType === 'mouse' && event.button !== 0)) return;
      pointerId = event.pointerId;
      start = [event.clientX, event.clientY];
      dx = 0;
      dragging = false;
    });
    card.addEventListener('pointermove', (event) => {
      if (event.pointerId !== pointerId) return;
      const x = event.clientX - start[0];
      const y = event.clientY - start[1];
      if (!dragging) {
        // A mostly vertical move is the page scrolling: let it go.
        if (Math.abs(y) > 12 && Math.abs(y) > Math.abs(x)) pointerId = null;
        if (Math.abs(x) < 12 || Math.abs(x) < Math.abs(y)) return;
        dragging = true;
        card.setPointerCapture(event.pointerId);
        card.dataset.dragging = '';
      }
      dx = x;
      card.style.transform = `translateX(${dx.toFixed(1)}px) rotate(${(dx / 28).toFixed(2)}deg)`;
    });
    const release = (event: PointerEvent): void => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      if (!dragging) return;
      dragging = false;
      delete card.dataset.dragging;
      card.style.transform = '';
      if (Math.abs(dx) > Math.min(110, card.offsetWidth * 0.3)) onCard(i, dx > 0 ? 'roll' : 'dont');
    };
    card.addEventListener('pointerup', release);
    card.addEventListener('pointercancel', release);
  });

  // Chapter 5: as the one who receives, the visitor bets on the recipients' five-point scale.
  const betBox = film.querySelector<HTMLElement>('[data-bet]');
  const bets = JSON.parse(betBox?.dataset.bet ?? '{}') as Record<string, { label: string; said: string; at: number }>;
  const range = film.querySelector<HTMLInputElement>('[data-bet-range]');
  const betOut = film.querySelector<HTMLElement>('[data-bet-out]');
  const place = film.querySelector<HTMLButtonElement>('[data-bet-place]');
  const betNow = place?.querySelector('small');
  const betAt = (): Bet => {
    const value = Number(range?.value ?? BET_START);
    return isBet(value) ? value : BET_START;
  };
  range?.addEventListener('input', () => {
    const bet = bets[String(betAt())];
    if (!bet) return;
    range.setAttribute('aria-valuetext', bet.label);
    if (betNow) betNow.textContent = bet.label;
    state = { ...state, bet: null };
  });
  place?.addEventListener('click', () => {
    if (settled(place)) return;
    const value = betAt();
    const bet = bets[String(value)];
    state = { ...state, bet: value };
    settle(film.querySelector('[data-bet-tickets]'), place);
    if (range) range.disabled = true;
    if (betOut) betOut.textContent = bet?.said ?? '';
    // The reveal's scale shows the bet next to the real recipients' bets.
    const yours = film.querySelector<SVGElement>('[data-scale-yours]');
    yours?.style.setProperty('--at', String(bet?.at ?? 50));
    yours?.setAttribute('data-shown', '');
    const label = film.querySelector<HTMLElement>('[data-scale-yours-label]');
    if (label) label.hidden = false;
    const text = film.querySelector('[data-scale-yours-text]');
    if (text) text.textContent = bet?.label ?? '';
    request();
  });

  // Chapter 6: guess before seeing. The bar is the visitor's; the figure is set beside it, and the
  // sign over the table turns it on. Nothing judges the guess (ADR 0023).
  film.querySelectorAll<HTMLElement>('[data-guess]').forEach((box) => {
    const id = box.dataset.guess as GuessId;
    const range = box.querySelector<HTMLInputElement>('[data-guess-range]');
    const see = box.querySelector<HTMLButtonElement>('[data-guess-see]');
    const yours = see?.querySelector('small');
    const out = box.querySelector<HTMLElement>('[data-guess-out]');
    const value = (): number => guessOf(Number(range?.value));
    range?.addEventListener('input', () => {
      range.setAttribute('aria-valuetext', fill(range.dataset.percent ?? '{n}%', { n: value() }));
      if (yours) yours.textContent = fill(see?.dataset.yours ?? '{n}', { n: value() });
    });
    see?.addEventListener('click', () => {
      if (settled(see)) return;
      const guess = value();
      state = { ...state, guesses: { ...state.guesses, [id]: guess } };
      settle(box.querySelector('[data-guess-tickets]'), see);
      if (range) range.disabled = true;
      box.dataset.seen = '';
      if (out) out.textContent = (out.dataset.said ?? '').replace('{guess}', String(guess));
      request();
    });
  });

  request();
}
