/**
 * Chapter 5's controller (Blackout.astro). The deck, one card at a time, each a different person,
 * each decided once: the card flies off, the stage shows what the decision did, and the next person
 * slides into the seat. Swiping the card is a shortcut for its tickets; a vertical drag still
 * scrolls the page. Then, as the one who receives, the visitor bets on the recipients' five-point
 * scale.
 */
import { BET_START, isBet, type Bet } from '../../../lib/film/bet';
import { current as waiting, DEALT, decide as decideCard, tally, type DeckState } from '../../../lib/film/deck';
import type { Choice } from '../../../lib/table/game';
import { settle, settled, slide, type FilmContext } from '../context';

/** How long a decided card stays before the next one comes. */
const CARD_MS = 1100;

export function blackout(film: FilmContext): void {
  deck(film);
  bet(film);
}

function deck(film: FilmContext): void {
  const cards = [...film.root.querySelectorAll<HTMLElement>('[data-card]')];
  const deckOut = film.root.querySelector<HTMLElement>('[data-deck-out]');
  const tallies = JSON.parse(deckOut?.dataset.tally ?? '{}') as Record<string, string>;
  let deck: DeckState = DEALT;
  const onCard = (i: number, choice: Choice): void => {
    const card = cards[i];
    if (!card || waiting(deck) !== i) return;
    deck = decideCard(deck, choice);
    const button = card.querySelector<HTMLButtonElement>(`[data-deck-choice="${choice}"]`);
    if (button) settle(card, button);
    film.update({ deck: { choices: deck.choices, at: i } });
    film.note({ type: 'card', card: i, choice });
    const said = button?.dataset.said ?? '';
    const next = cards[i + 1];
    if (deckOut) deckOut.textContent = next ? said : `${said} ${tallies[String(tally(deck).kept)] ?? ''}`;
    film.request();
    // The last card stays, decided, with the tally under it.
    if (!next) return;
    card.dataset.gone = choice;
    // With reduced motion the card does not fly, so it does not sound (ADR 0030, rule 2).
    if (!film.reduced.matches) film.play('card');
    film.later(
      () => {
        card.hidden = true;
        next.hidden = false;
        if (!film.quiet()) next.dataset.arriving = '';
        film.update({ deck: { choices: deck.choices, at: i + 1 } });
        film.begin('turn');
        film.focus(next.querySelector<HTMLButtonElement>('button'), { preventScroll: true });
        film.request();
      },
      film.reduced.matches ? CARD_MS / 2 : CARD_MS,
    );
  };
  cards.forEach((card, i) => {
    card.querySelectorAll<HTMLButtonElement>('[data-deck-choice]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!settled(button)) onCard(i, button.dataset.deckChoice as Choice);
      });
    });
    let pointerId: number | null = null;
    let start: [number, number] = [0, 0];
    let dx = 0;
    let dragging = false;
    card.addEventListener('pointerdown', (event) => {
      if (waiting(deck) !== i || (event.pointerType === 'mouse' && event.button !== 0)) return;
      pointerId = event.pointerId;
      start = [event.clientX, event.clientY];
      dx = 0;
      dragging = false;
    });
    card.addEventListener('pointermove', (event) => {
      if (event.pointerId !== pointerId) return;
      const x = event.clientX - start[0];
      const y = event.clientY - start[1];
      if (!dragging) {
        // A mostly vertical move is the page scrolling: let it go.
        if (Math.abs(y) > 12 && Math.abs(y) > Math.abs(x)) pointerId = null;
        if (Math.abs(x) < 12 || Math.abs(x) < Math.abs(y)) return;
        dragging = true;
        card.setPointerCapture(event.pointerId);
        card.dataset.dragging = '';
      }
      dx = x;
      card.style.transform = `translateX(${dx.toFixed(1)}px) rotate(${(dx / 28).toFixed(2)}deg)`;
    });
    const release = (event: PointerEvent): void => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      if (!dragging) return;
      dragging = false;
      delete card.dataset.dragging;
      card.style.transform = '';
      if (Math.abs(dx) > Math.min(110, card.offsetWidth * 0.3)) onCard(i, dx > 0 ? 'roll' : 'dont');
    };
    card.addEventListener('pointerup', release);
    card.addEventListener('pointercancel', release);
  });
  film.onReplay('card', ({ card, choice }) => cards[card]?.querySelector<HTMLButtonElement>(`[data-deck-choice="${choice}"]`)?.click());
}

function bet(film: FilmContext): void {
  const betBox = film.root.querySelector<HTMLElement>('[data-bet]');
  const bets = JSON.parse(betBox?.dataset.bet ?? '{}') as Record<string, { label: string; said: string; at: number }>;
  const range = film.root.querySelector<HTMLInputElement>('[data-bet-range]');
  const betOut = film.root.querySelector<HTMLElement>('[data-bet-out]');
  const place = film.root.querySelector<HTMLButtonElement>('[data-bet-place]');
  const betNow = place?.querySelector('small');
  const betAt = (): Bet => {
    const value = Number(range?.value ?? BET_START);
    return isBet(value) ? value : BET_START;
  };
  range?.addEventListener('input', () => {
    const bet = bets[String(betAt())];
    if (!bet) return;
    range.setAttribute('aria-valuetext', bet.label);
    if (betNow) betNow.textContent = bet.label;
    film.update({ bet: null });
  });
  place?.addEventListener('click', () => {
    if (settled(place)) return;
    const value = betAt();
    const bet = bets[String(value)];
    film.update({ bet: value });
    settle(film.root.querySelector('[data-bet-tickets]'), place);
    if (range) range.disabled = true;
    if (betOut) betOut.textContent = bet?.said ?? '';
    // The reveal's scale shows the bet next to the real recipients' bets.
    const yours = film.root.querySelector<SVGElement>('[data-scale-yours]');
    yours?.style.setProperty('--at', String(bet?.at ?? 50));
    yours?.setAttribute('data-shown', '');
    const label = film.root.querySelector<HTMLElement>('[data-scale-yours-label]');
    if (label) label.hidden = false;
    const text = film.root.querySelector('[data-scale-yours-text]');
    if (text) text.textContent = bet?.label ?? '';
    film.note({ type: 'bet', bet: value });
    film.request();
  });
  film.onReplay('bet', ({ bet }) => {
    slide(range, bet);
    place?.click();
  });
}
