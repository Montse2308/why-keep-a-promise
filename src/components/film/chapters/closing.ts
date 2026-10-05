/**
 * Chapter 8's controller (Closing.astro). The other asks one last time: it is only an answer, the
 * promise of chapter 0 is settled with it, and nothing is paid. Then the visitor says whether the
 * page kept its own promise, the one it made at the arrival. With the sound on, the end of the
 * credits sounds when it comes into view.
 */
import type { Choice } from '../../../lib/table/game';
import { settle, settled, type FilmContext } from '../context';

export function closing(film: FilmContext): void {
  const nowTickets = film.root.querySelector('[data-now-tickets]');
  const nowOut = film.root.querySelector<HTMLElement>('[data-now-out]');
  film.root.querySelectorAll<HTMLButtonElement>('[data-now]').forEach((button) => {
    button.addEventListener('click', () => {
      if (settled(button) || film.state().now) return;
      film.update({ now: button.dataset.now as Choice });
      settle(nowTickets, button);
      film.settlePromise();
      if (nowOut) nowOut.textContent = button.dataset.said ?? '';
      film.request();
    });
  });

  const pageTickets = film.root.querySelector('[data-page-tickets]');
  const pageOut = film.root.querySelector<HTMLElement>('[data-page-out]');
  film.root.querySelectorAll<HTMLButtonElement>('[data-page-kept]').forEach((button) => {
    button.addEventListener('click', () => {
      if (settled(button) || film.state().pageKept != null) return;
      film.update({ pageKept: button.dataset.pageKept === 'yes' });
      settle(pageTickets, button);
      if (pageOut) pageOut.textContent = button.dataset.said ?? '';
      film.request();
    });
  });

  film.onSight(film.root.querySelector('.credits__end'), 'theme', 0.75);
}
