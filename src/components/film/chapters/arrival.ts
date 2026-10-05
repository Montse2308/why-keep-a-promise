/**
 * Chapter 0's controller (Arrival.astro): promise or not. The answer can change until the decision
 * of chapter 3, which settles it (./fold.ts).
 */
import { settled, type FilmContext } from '../context';

export function arrival(film: FilmContext): void {
  const promiseOut = film.root.querySelector<HTMLElement>('#arrival [data-out]');
  film.root.querySelectorAll<HTMLButtonElement>('[data-promise]').forEach((button, _i, all) => {
    button.addEventListener('click', () => {
      if (settled(button)) return;
      const promised = button.dataset.promise === 'yes';
      film.update({ promised });
      film.begin('draw');
      all.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      if (promiseOut) promiseOut.textContent = (promised ? promiseOut.dataset.outYes : promiseOut.dataset.outNo) ?? '';
      film.spoolAs(promised ? 'tied' : 'none');
      film.remind();
      film.note({ type: 'promise', promised });
      film.request();
    });
  });
  film.onReplay('promise', ({ promised }) => film.root.querySelector<HTMLButtonElement>(`[data-promise="${promised ? 'yes' : 'no'}"]`)?.click());
}
