/** Chapter 2's controller (Talk.astro): one message, already written; the other answers. */
import { write, type Message } from '../../../lib/film/talk';
import { settle, settled, type FilmContext } from '../context';

export function talk(film: FilmContext): void {
  const chatTickets = film.root.querySelector('[data-chat-tickets]');
  const chatOut = film.root.querySelector<HTMLElement>('[data-chat-out]');
  const mine = film.root.querySelector<HTMLElement>('[data-chat-mine]');
  const answer = film.root.querySelector<HTMLElement>('[data-chat-answer]');
  film.root.querySelectorAll<HTMLButtonElement>('[data-message]').forEach((button) => {
    button.addEventListener('click', () => {
      if (settled(button) || film.state().chat) return;
      const message = button.dataset.message as Message;
      film.update({ chat: write(film.state().chat ?? null, message) });
      settle(chatTickets, button);
      // The chosen ticket stays, pressed and focused, as the message; the others go.
      chatTickets?.querySelectorAll<HTMLButtonElement>('button').forEach((other) => (other.hidden = other !== button));
      for (const [bubble, text] of [
        [mine, button.dataset.says],
        [answer, button.dataset.answer],
      ] as const) {
        if (!bubble) continue;
        bubble.querySelector('[data-text]')?.replaceChildren(text ?? '');
        bubble.dataset.shown = '';
      }
      if (chatOut) chatOut.textContent = button.dataset.said ?? '';
      film.note({ type: 'message', message });
      film.play('bubbles');
      film.request();
    });
  });
}
