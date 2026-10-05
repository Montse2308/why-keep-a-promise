/**
 * Chapter 1's controller (TwoRooms.astro): one round of the dilemma, played once, then the two
 * columns, one after the other.
 */
import { reduce as pick, START as NO_PICKS, isDone } from '../../../lib/pd/bestReply';
import type { Move } from '../../../lib/pd/game';
import { playRound } from '../../../lib/pd/round';
import { settle, settled, type FilmContext } from '../context';

export function twoRooms(film: FilmContext): void {
  const roundTickets = film.root.querySelector('[data-round-tickets]');
  const roundOut = film.root.querySelector<HTMLElement>('[data-round-out]');
  film.root.querySelectorAll<HTMLButtonElement>('[data-round]').forEach((button) => {
    button.addEventListener('click', () => {
      if (settled(button) || film.state().round) return;
      film.update({ round: playRound(film.state().round ?? null, button.dataset.round as Move) });
      film.begin('count');
      settle(roundTickets, button);
      if (roundOut) roundOut.textContent = button.dataset.said ?? '';
      film.request();
    });
  });

  const steps = [...film.root.querySelectorAll<HTMLElement>('[data-column]')];
  const columnsOut = film.root.querySelector<HTMLElement>('[data-columns-out]');
  steps.forEach((step, i) => {
    step.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach((button) => {
      button.addEventListener('click', () => {
        if (settled(button)) return;
        const columns = pick(film.state().columns ?? NO_PICKS, { type: 'pick', move: button.dataset.pick as Move });
        film.update({ columns });
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
        film.request();
      });
    });
  });
}
