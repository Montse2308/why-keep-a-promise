/**
 * Chapter 3's controller (Fold.astro): keep the money or roll the die, once. The promise of
 * chapter 0 is settled with it.
 */
import { decide, UNDECIDED, type DecisionState } from '../../../lib/table/decision';
import type { Choice } from '../../../lib/table/game';
import { ROLL_MS, settle, settled, type FilmContext } from '../context';

export function fold(film: FilmContext): void {
  const decisionTickets = film.root.querySelector('[data-decision-tickets]');
  const decisionOut = film.root.querySelector<HTMLElement>('[data-decision-out]');
  film.root.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      if (settled(button) || film.state().decision?.phase !== 'idle') return;
      const choice = button.dataset.choice as Choice;
      const chosen = decide(UNDECIDED, { type: 'choose', choice }, Math.random);
      film.update({ decision: choice === 'roll' ? decide(chosen, { type: 'throw' }, Math.random) : chosen });
      settle(decisionTickets, button);
      film.settlePromise();

      const land = (): void => {
        const decision: DecisionState = decide(film.state().decision ?? UNDECIDED, { type: 'settle' }, Math.random);
        film.update({ decision });
        film.begin('count');
        if (decision.phase === 'outcome' && decision.face !== null) film.play('land');
        if (decision.phase === 'outcome') {
          const said = decision.face === null ? button.dataset.said : (JSON.parse(button.dataset.said ?? '{}') as Record<string, string>)[decision.face];
          const promised = film.state().promised === true;
          const thread = promised ? (decision.choice === 'dont' ? decisionOut?.dataset.broken : decisionOut?.dataset.kept) : undefined;
          if (decisionOut) decisionOut.textContent = [said, thread].filter(Boolean).join(' ');
          if (promised) film.spoolAs(decision.choice === 'dont' ? 'broken' : 'kept');
        }
        film.request();
      };
      if (choice === 'roll' && !film.reduced.matches) {
        film.begin('roll');
        film.play('roll');
        setTimeout(land, ROLL_MS);
      } else {
        land();
      }
      film.request();
    });
  });
}
