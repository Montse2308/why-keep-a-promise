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
      const move = button.dataset.round as Move;
      film.update({ round: playRound(film.state().round ?? null, move) });
      film.begin('count');
      film.play('coins');
      settle(roundTickets, button);
      if (roundOut) roundOut.textContent = button.dataset.said ?? '';
      film.note({ type: 'round', move });
      film.request();
    });
  });

  film.onReplay('round', ({ move }) => film.root.querySelector<HTMLButtonElement>(`[data-round="${move}"]`)?.click());

  const steps = [...film.root.querySelectorAll<HTMLElement>('[data-column]')];
  const columnsOut = film.root.querySelector<HTMLElement>('[data-columns-out]');
  steps.forEach((step, i) => {
    step.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach((button) => {
      button.addEventListener('click', () => {
        if (settled(button)) return;
        const move = button.dataset.pick as Move;
        const columns = pick(film.state().columns ?? NO_PICKS, { type: 'pick', move });
        film.update({ columns });
        settle(step, button);
        const next = steps[i + 1];
        const said = button.dataset.said ?? '';
        if (columnsOut) columnsOut.textContent = isDone(columns) ? `${said} ${columnsOut.dataset.both ?? ''}` : said;
        if (next) {
          // One step at a time, so the card keeps its size: the board keeps the finished column.
          next.hidden = false;
          film.focus(next.querySelector<HTMLButtonElement>('button'));
          step.hidden = true;
        }
        film.note({ type: 'column', column: i, move });
        film.request();
      });
    });
  });
  film.onReplay('column', ({ column, move }) => steps[column]?.querySelector<HTMLButtonElement>(`[data-pick="${move}"]`)?.click());
}
