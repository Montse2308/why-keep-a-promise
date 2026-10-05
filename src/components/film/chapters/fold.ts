/**
 * Chapter 3's controller (Fold.astro): keep the money or roll the die, once. The promise of
 * chapter 0 is settled with it.
 */
import { foldCues } from '../../../lib/film/sound';
import { decide, UNDECIDED, type DecisionState } from '../../../lib/table/decision';
import { DIE_FACES, type Choice, type Face } from '../../../lib/table/game';
import { ROLL_MS, settle, settled, type FilmContext } from '../context';

export function fold(film: FilmContext): void {
  // Played back from the memory, the die lands on the face it showed: a draw that falls on that face.
  let replayed: Face | null = null;
  const random = (): number => (replayed === null ? Math.random() : (replayed - 0.5) / DIE_FACES.length);

  const decisionTickets = film.root.querySelector('[data-decision-tickets]');
  const decisionOut = film.root.querySelector<HTMLElement>('[data-decision-out]');
  film.root.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      if (settled(button) || film.state().decision?.phase !== 'idle') return;
      const choice = button.dataset.choice as Choice;
      const chosen = decide(UNDECIDED, { type: 'choose', choice }, random);
      const thrown = choice === 'roll' ? decide(chosen, { type: 'throw' }, random) : chosen;
      film.update({ decision: thrown });
      settle(decisionTickets, button);
      film.settlePromise();
      // The die's face is noted with the choice, before it lands: the memory brings back the same roll.
      film.note({ type: 'decision', choice, face: thrown.phase === 'die' ? thrown.face : null });

      const land = (): void => {
        const decision: DecisionState = decide(film.state().decision ?? UNDECIDED, { type: 'settle' }, random);
        film.update({ decision });
        film.begin('count');
        if (decision.phase === 'outcome') {
          for (const [cue, after] of foldCues(decision.face !== null)) film.play(cue, after);
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
        film.later(land, ROLL_MS);
      } else {
        land();
      }
      film.request();
    });
  });
  film.onReplay('decision', ({ choice, face }) => {
    replayed = face;
    film.root.querySelector<HTMLButtonElement>(`[data-choice="${choice}"]`)?.click();
    replayed = null;
  });
}
