/**
 * The film's script (ADR 0025): turns the storyboard into the film. It reads the native scroll,
 * never captures it, and applies what src/lib/film/stage.ts says the stage shows at that point: the
 * camera, the day's light, the cast and their moods, the rooms, the board, the coins, the die, the
 * golden thread, the two voices, the blackout, chapter 6's signs, chapter 7's night (the stars,
 * the lamp, the engine and the envelope) and chapter 8's return to the first table. Each chapter's
 * choices, which are plain buttons, sliders and, on the deck, a swipe that stands for a button, are
 * wired by its controller (./chapters/*.ts, through ./context.ts): every line a choice leads to was
 * resolved at build time, so the script only shows it. Nothing is stored or sent (ADR 0023). With
 * the sound on (./sound.ts), the die, the chat's bubbles, the seal and the end of the credits sound
 * as the stage shows them (ADR 0025).
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
  engineTransform,
  eyesTransform,
  GEARS,
  gearTransform,
  PIPS,
  placeTransform,
  shadeTransform,
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
import { START as NO_PICKS, type CellKey, type Tag } from '../../lib/pd/bestReply';
import type { Cue } from '../../lib/film/sound';
import { createSound } from './sound';
import { ROLL_MS, type Clock, type FilmContext, type Thread } from './context';
import { arrival } from './chapters/arrival';
import { blackout } from './chapters/blackout';
import { closing } from './chapters/closing';
import { fold } from './chapters/fold';
import { myResearch } from './chapters/my-research';
import { realPeople } from './chapters/real-people';
import { talk } from './chapters/talk';
import { twoRooms } from './chapters/two-rooms';
import { UNDECIDED } from '../../lib/table/decision';
import { DIE_FACES, type Face } from '../../lib/table/game';

const DRAW_MS = 800;
const COUNT_MS = 450;
/** How long a card's person takes to slide into the seat. */
const SLIDE_MS = 520;

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

/**
 * Starts the film over the storyboard. Once it runs, it marks `data-film-ready`; if it fails, it
 * takes `html.js` away, and the storyboard is the page (BaseLayout.astro). If that fallback already
 * came, because the script arrived too late, the film does not start over it.
 */
export function start(): void {
  const root = document.documentElement;
  if (!root.classList.contains('js')) return;
  try {
    run();
  } catch (error) {
    root.classList.remove('js');
    throw error;
  }
}

function run(): void {
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
    stars: part('stars'),
    shade: part('shade'),
    engine: part('engine'),
    gears: GEARS.map((_, i) => part(`gear-${i}`)),
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
  const envelope = film.querySelector<HTMLElement>('[data-envelope]');

  // The sound: off until the visitor presses its button, which shows only where Web Audio exists.
  const sound = createSound();
  const soundButton = film.querySelector<HTMLButtonElement>('[data-sound]');
  if (sound && soundButton) {
    soundButton.hidden = false;
    soundButton.addEventListener('click', () => soundButton.setAttribute('aria-pressed', String(sound.toggle())));
  }
  const play = (cue: Cue): void => sound?.play(cue);
  /**
   * A cue for something that comes into view: it sounds the first time it is seen with the sound on.
   * Most of it in view, not all: a card moving with the scroll may never report exactly 1.
   */
  const onSight = (element: Element | null | undefined, cue: Cue, threshold: number): void => {
    if (!element || !sound) return;
    const watch = new IntersectionObserver(
      (entries) => {
        if (!sound.on || !entries.some((entry) => entry.isIntersecting)) return;
        play(cue);
        watch.disconnect();
      },
      { threshold },
    );
    watch.observe(element);
  };

  let state: StageState = { promised: null, round: null, columns: NO_PICKS, chat: null, decision: UNDECIDED, deck: { choices: [], at: 0 }, bet: null, guesses: {}, now: null, pageKept: null };
  /** When each of the stage's animations last started (context.ts). */
  const clocks: Record<Clock, number> = { draw: 0, count: 0, roll: 0, turn: -Infinity };
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
    const arriving = still || view.beat.id !== 'deck' ? 1 : easeInOut(clamp((now - clocks.turn) / SLIDE_MS, 0, 1));
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
    const spun = view.die.rolling && !still ? clamp((now - clocks.roll) / ROLL_MS, 0, 1) : 0;
    const jump = view.die.rolling && !still ? -110 * Math.sin(Math.PI * spun) : 0;
    const turn = view.die.rolling && !still ? 720 * (1 - (1 - spun) ** 3) : view.die.floating && !still ? Math.sin(now / 900) * 12 : 0;
    set(parts.die, 'transform', `translate(800 ${(view.die.y + float + jump).toFixed(2)})`);
    set(parts.die, 'opacity', view.die.opacity.toFixed(3));
    set(parts.dieSpin, 'transform', `rotate(${turn.toFixed(2)})`);
    const face: Face = view.die.rolling && !still ? (DIE_FACES[Math.floor(now / 90) % DIE_FACES.length] ?? view.die.face) : view.die.face;
    for (const pip of pips) set(pip, 'visibility', PIPS[face].includes(pip.dataset.pip as Pip) ? 'visible' : 'hidden');

    paintBoard(view.board);
    const counted = still ? 1 : easeInOut(clamp((now - clocks.count) / COUNT_MS, 0, 1));
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
    const drawn = view.thread.state === 'tied' ? (still ? 1 : easeInOut(clamp((now - clocks.draw) / DRAW_MS, 0, 1))) : 0;
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

    // Chapter 7: the night's stars, the lamp coming down, the engine and its gears, the envelope.
    set(parts.stars, 'opacity', view.stars.toFixed(3));
    set(parts.shade, 'transform', shadeTransform(view.shade));
    set(parts.shade, 'opacity', view.shade > 0.01 ? '1' : '0');
    set(parts.engine, 'transform', engineTransform(view.engine.shown));
    set(parts.engine, 'opacity', view.engine.shown > 0.01 ? '1' : '0');
    if (view.engine.shown > 0) GEARS.forEach((gear, i) => set(parts.gears[i], 'transform', gearTransform(gear, view.engine.turn)));
    envelope?.style.setProperty('--opened', view.envelope.toFixed(3));

    title?.style.setProperty('--title-gone', view.titleGone.toFixed(3));
    // On a phone the sound's button waits under the spool until the title has gone (Film.astro).
    set(film, 'data-title', view.titleGone < 0.6 ? 'shown' : 'gone');
    if (visible) request();
  };

  const request = (): void => {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(render);
  };

  // Only animate while the film is on screen: past it, the page is the notebook's footer.
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
  function spoolAs(thread: Thread): void {
    spool?.setAttribute('data-spool', thread === 'kept' ? 'tied' : thread);
    if (film) film.dataset.thread = thread;
    const label = { tied: film?.dataset.threadTied, kept: film?.dataset.threadKept, broken: film?.dataset.threadBroken, none: film?.dataset.threadNone }[thread];
    if (spoolLabel) spoolLabel.textContent = label ?? '';
  }

  // Chapter 3 reminds the visitor what they answered in chapter 0, and chapter 8's other asks by it.
  const promiseLines = [...film.querySelectorAll<HTMLElement>('[data-promise-line]')];
  const remind = (): void => {
    for (const line of promiseLines) {
      const said = state.promised === true ? line.dataset.yes : state.promised === false ? line.dataset.no : line.dataset.none;
      line.textContent = said ?? '';
    }
  };
  remind();

  const promiseTickets = film.querySelector('#arrival .tickets');
  const context: FilmContext = {
    root: film,
    reduced,
    state: () => state,
    update: (patch) => {
      state = { ...state, ...patch };
    },
    begin: (clock) => {
      clocks[clock] = performance.now();
    },
    request,
    play,
    onSight,
    spoolAs,
    remind,
    settlePromise: () => promiseTickets?.querySelectorAll('button').forEach((ticket) => ticket.setAttribute('aria-disabled', 'true')),
  };

  arrival(context);
  twoRooms(context);
  talk(context);
  fold(context);
  blackout(context);
  realPeople(context);
  myResearch(context);
  closing(context);

  request();
  film.dataset.filmReady = '';
}
