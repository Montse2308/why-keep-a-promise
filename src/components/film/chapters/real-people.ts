/**
 * Chapter 6's controller (RealPeople.astro): guess before seeing. The bar is the visitor's; the
 * figure is set beside it, and the sign over the table turns it on. Nothing judges the guess
 * (ADR 0023).
 */
import { guessOf, type GuessId } from '../../../lib/film/guess';
import { fill } from '../../../lib/template';
import { settle, settled, type FilmContext } from '../context';

export function realPeople(film: FilmContext): void {
  film.root.querySelectorAll<HTMLElement>('[data-guess]').forEach((box) => {
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
      film.update({ guesses: { ...film.state().guesses, [id]: guess } });
      settle(box.querySelector('[data-guess-tickets]'), see);
      if (range) range.disabled = true;
      box.dataset.seen = '';
      if (out) out.textContent = (out.dataset.said ?? '').replace('{guess}', String(guess));
      film.note({ type: 'guess', id, guess });
      film.request();
    });
  });
}
