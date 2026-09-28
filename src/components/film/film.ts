/**
 * The film's script (ADR 0025): turns the storyboard into the film. It reads the native scroll,
 * never captures it, and applies what src/lib/film/stage.ts says the stage shows at that point:
 * the camera, the day's light, the cast's moods, the die and the golden thread. It also handles the
 * chapters' choices, which are plain buttons.
 */
import { frame, isPortrait, viewBoxAttribute } from '../../lib/film/camera';
import { FACES, type Mood } from '../../lib/film/faces';
import { castPositions, stageAt, threadPath, type Promised, type StageView } from '../../lib/film/stage';
import { clamp, easeInOut, lerp } from '../../lib/film/track';

const DRAW_MS = 800;

function applyMood(root: Element | null, mood: Mood, pointer: readonly [number, number]): void {
  if (!root) return;
  const face = FACES[mood];
  const set = (selector: string, name: string, value: string) => root.querySelector(selector)?.setAttribute(name, value);
  set('.face__mouth', 'd', face.mouth);
  set('.face__brow-l', 'd', face.brows[0]);
  set('.face__brow-r', 'd', face.brows[1]);
  set('.face__open', 'visibility', face.closedEyes ? 'hidden' : 'visible');
  set('.face__closed', 'visibility', face.closedEyes ? 'visible' : 'hidden');
  set('.face__blush', 'opacity', face.blush ? '0.6' : '0');
  set('.face__sweat', 'opacity', face.sweat ? '1' : '0');
  set('.face__tear', 'opacity', face.tear ? '1' : '0');
  set('.face__pupils', 'transform', `translate(${face.look[0] + pointer[0]} ${face.look[1] + pointer[1]})`);
}

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
    you: part('you'),
    other: part('other'),
    shadowYou: part('shadow-you'),
    shadowOther: part('shadow-other'),
    thread: part('thread'),
    threadEdge: part('thread-edge'),
    threadLine: part('thread-line'),
    die: part('die'),
    dieSpin: part('die-spin'),
  };
  const spool = film.querySelector<SVGElement>('[data-spool]');
  const spoolLabel = film.querySelector<HTMLElement>('[data-spool-label]');
  const arrivalFrame = film.querySelector<HTMLElement>('#arrival .chapter__frame');

  let promised: Promised = null;
  let drawStart = 0;
  let pointer: [number, number] = [0, 0];
  let visible = true;
  let frameRequested = false;

  /** Scroll position through the whole film, from 0 to 1, of which the built chapters hold [from, to]. */
  const position = (): number => {
    const top = film.getBoundingClientRect().top + scrollY;
    const run = chapters.offsetHeight - innerHeight;
    const local = run > 0 ? clamp((scrollY - top) / run, 0, 1) : 0;
    return lerp(from, to, local);
  };

  const render = (now: number): void => {
    frameRequested = false;
    const p = position();
    const portrait = isPortrait({ width: innerWidth, height: innerHeight });
    const still = reduced.matches;
    const view: StageView = stageAt(p, { promised }, portrait, still);

    const box = frame(view.shot, { width: innerWidth, height: innerHeight });
    world.setAttribute('viewBox', viewBoxAttribute(box));
    parts.skyTop?.setAttribute('stop-color', view.light['sky-top']);
    parts.skyBottom?.setAttribute('stop-color', view.light['sky-bottom']);
    parts.hillFar?.setAttribute('fill', view.light['hill-far']);
    parts.hillNear?.setAttribute('fill', view.light['hill-near']);
    parts.floor?.setAttribute('fill', view.light.floor);
    parts.lamp?.setAttribute('opacity', String(view.lamp));
    film.style.setProperty('--film-fade-from', view.light.floor);
    // The far hills and the sky move slower than the set: a little depth when the camera moves.
    const drift = (box.x + box.width / 2 - 800) * 0.4;
    parts.far?.setAttribute('transform', `translate(${drift} ${(box.y - 200) * 0.3})`);
    parts.near?.setAttribute('transform', `translate(${drift * 0.4} 0)`);

    const cast = castPositions(view.spread);
    const bob = still ? 0 : Math.sin(now / 650) * 3;
    parts.you?.setAttribute('transform', `translate(${cast.you[0]} ${cast.you[1] + bob})`);
    parts.other?.setAttribute('transform', `translate(${cast.other[0]} ${cast.other[1] - bob})`);
    parts.shadowYou?.setAttribute('cx', String(cast.you[0]));
    parts.shadowOther?.setAttribute('cx', String(cast.other[0]));
    applyMood(parts.you, view.moods.you, pointer);
    applyMood(parts.other, view.moods.other, pointer);

    const float = view.die.floating && !still ? Math.sin(now / 520) * 7 : 0;
    parts.die?.setAttribute('transform', `translate(800 ${view.die.y + float})`);
    parts.dieSpin?.setAttribute('transform', `rotate(${view.die.floating && !still ? Math.sin(now / 900) * 12 : 0})`);

    const path = threadPath(view.spread);
    const drawn = view.thread.state === 'tied' ? (still ? 1 : easeInOut(clamp((now - drawStart) / DRAW_MS, 0, 1))) : 0;
    for (const line of [parts.threadEdge, parts.threadLine]) {
      line?.setAttribute('d', path);
      line?.setAttribute('stroke-dashoffset', String(1 - drawn));
    }
    parts.thread?.setAttribute('opacity', view.thread.state === 'none' ? '0' : '1');

    arrivalFrame?.style.setProperty('--title-gone', view.titleGone.toFixed(3));
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
      pointer = [((event.clientX / innerWidth) - 0.5) * 8, ((event.clientY / innerHeight) - 0.5) * 6];
    },
    { passive: true },
  );

  // Chapter 0: promise or not. Nothing is stored or sent (ADR 0023).
  const out = film.querySelector<HTMLElement>('#arrival .card__out');
  film.querySelectorAll<HTMLButtonElement>('[data-promise]').forEach((button, _i, all) => {
    button.addEventListener('click', () => {
      promised = button.dataset.promise === 'yes';
      drawStart = performance.now();
      all.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      if (out) out.textContent = (promised ? out.dataset.outYes : out.dataset.outNo) ?? '';
      spool?.setAttribute('data-spool', promised ? 'tied' : 'none');
      if (spoolLabel) spoolLabel.textContent = (promised ? film.dataset.threadTied : film.dataset.threadNone) ?? '';
      request();
    });
  });

  request();
}
