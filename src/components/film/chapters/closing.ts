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
      const choice = button.dataset.now as Choice;
      film.update({ now: choice });
      settle(nowTickets, button);
      film.settlePromise();
      if (nowOut) nowOut.textContent = button.dataset.said ?? '';
      film.note({ type: 'now', choice });
      film.request();
    });
  });

  const pageTickets = film.root.querySelector('[data-page-tickets]');
  const pageOut = film.root.querySelector<HTMLElement>('[data-page-out]');
  film.root.querySelectorAll<HTMLButtonElement>('[data-page-kept]').forEach((button) => {
    button.addEventListener('click', () => {
      if (settled(button) || film.state().pageKept != null) return;
      const kept = button.dataset.pageKept === 'yes';
      film.update({ pageKept: kept });
      settle(pageTickets, button);
      if (pageOut) pageOut.textContent = button.dataset.said ?? '';
      film.note({ type: 'page', kept });
      film.request();
    });
  });

  film.onSight(film.root.querySelector('.credits__end'), 'theme', 0.75);
}
