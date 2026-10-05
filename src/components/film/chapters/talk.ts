/**
 * Chapter 2's controller (Talk.astro): one message, already written; the other answers. Once it is
 * chosen, the tickets go and the chat reads in order: the question, the visitor's message, the answer.
 */
import { write, type Message } from '../../../lib/film/talk';
import { settle, settled, type FilmContext } from '../context';

export function talk(film: FilmContext): void {
  const chatTickets = film.root.querySelector('[data-chat-tickets]');
  const chatOut = film.root.querySelector<HTMLElement>('[data-chat-out]');
  const mine = film.root.querySelector<HTMLElement>('[data-chat-mine]');
  const answer = film.root.querySelector<HTMLElement>('[data-chat-answer]');
  const free = film.root.querySelector<HTMLElement>('[data-chat-free]');
  film.root.querySelectorAll<HTMLButtonElement>('[data-message]').forEach((button) => {
    button.addEventListener('click', () => {
      if (settled(button) || film.state().chat) return;
      const message = button.dataset.message as Message;
      film.update({ chat: write(film.state().chat ?? null, message) });
      settle(chatTickets, button);
      for (const [bubble, text] of [
        [mine, button.dataset.says],
        [answer, button.dataset.answer],
      ] as const) {
        if (!bubble) continue;
        bubble.querySelector('[data-text]')?.replaceChildren(text ?? '');
        bubble.dataset.shown = '';
      }
      // The message is now the visitor's bubble: the tickets go, and the focus goes with it.
      if (chatTickets instanceof HTMLElement) chatTickets.hidden = true;
      if (free) free.hidden = true;
      film.focus(mine, { preventScroll: true });
      if (chatOut) chatOut.textContent = button.dataset.said ?? '';
      film.note({ type: 'message', message });
      film.play('bubbles');
      film.request();
    });
  });
  film.onReplay('message', ({ message }) => film.root.querySelector<HTMLButtonElement>(`[data-message="${message}"]`)?.click());
}
