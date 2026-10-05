/**
 * The film's memory in the tab (ADR 0029): what the visitor did, in the order they did it, and
 * nothing else. It lives only in `history.state` of the film's own entry in the tab's history: no
 * storage, no cookies, and nothing is sent. On a reload, a Back or a return from the notebook, the
 * film plays the actions again through the same code as a press, so it never shows a state that
 * playing could not reach. A record that is not exactly what this module writes is ignored whole,
 * and the film starts empty.
 */
import { BETS, type Bet } from './bet';
import { DECK } from './deck';
import { GUESSES, guessOf, type GuessId } from './guess';
import { MESSAGES, type Message } from './talk';
import { COLUMNS } from '../pd/bestReply';
import { MOVES, type Move } from '../pd/game';
import { CHOICES, DIE_FACES, type Choice, type Face } from '../table/game';

export type Action =
  /** Chapter 0: promise or not; it can change until chapter 3's decision or chapter 8's answer. */
  | { readonly type: 'promise'; readonly promised: boolean }
  /** Chapter 1: the one round of the dilemma. */
  | { readonly type: 'round'; readonly move: Move }
  /** Chapter 1: the visitor's move in each column, the first and then the second. */
  | { readonly type: 'column'; readonly column: number; readonly move: Move }
  /** Chapter 2: the message. */
  | { readonly type: 'message'; readonly message: Message }
  /** Chapter 3: the decision, and the face the die showed if it was rolled, so it lands the same. */
  | { readonly type: 'decision'; readonly choice: Choice; readonly face: Face | null }
  /** Chapter 5: each card of the deck, in order. */
  | { readonly type: 'card'; readonly card: number; readonly choice: Choice }
  /** Chapter 5: the bet, as the one who receives. */
  | { readonly type: 'bet'; readonly bet: Bet }
  /** Chapter 6: each guess, by figure. */
  | { readonly type: 'guess'; readonly id: GuessId; readonly guess: number }
  /** Chapter 8: what the visitor would do now. */
  | { readonly type: 'now'; readonly choice: Choice }
  /** Chapter 8: whether the page kept its promise. */
  | { readonly type: 'page'; readonly kept: boolean };

export const MEMORY_VERSION = 1;

export interface Memory {
  readonly version: typeof MEMORY_VERSION;
  readonly actions: readonly Action[];
}

export const EMPTY: Memory = { version: MEMORY_VERSION, actions: [] };

/** Where the memory sits in `history.state`, next to anything else the entry holds. */
export const MEMORY_KEY = 'film';

/** The most actions a visit can leave: one promise, the round, two columns, the message, the decision, the deck, the bet, two guesses and two answers. */
export const MEMORY_MAX = 1 + 1 + COLUMNS.length + 1 + 1 + DECK.length + 1 + GUESSES.length + 1 + 1;

const has = (actions: readonly Action[], type: Action['type']): boolean => actions.some((action) => action.type === type);
const count = (actions: readonly Action[], type: Action['type']): number => actions.filter((action) => action.type === type).length;

/** Whether playing could take the film from these actions to that one next. */
export function accepts(memory: Memory, action: Action): boolean {
  const { actions } = memory;
  switch (action.type) {
    case 'promise':
      return !has(actions, 'decision') && !has(actions, 'now');
    case 'column':
      return action.column === count(actions, 'column') && action.column < COLUMNS.length;
    case 'card':
      return action.card === count(actions, 'card') && action.card < DECK.length;
    case 'guess':
      return !actions.some((done) => done.type === 'guess' && done.id === action.id);
    default:
      return !has(actions, action.type);
  }
}

/**
 * The memory with one more action, or the same memory if playing could not get there. A new
 * answer to chapter 0 replaces the old one: only the last counts, and nothing that comes between
 * depends on it.
 */
export function remember(memory: Memory, action: Action): Memory {
  if (!accepts(memory, action)) return memory;
  const kept = action.type === 'promise' ? memory.actions.filter((done) => done.type !== 'promise') : memory.actions;
  return { version: MEMORY_VERSION, actions: [...kept, action] };
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const oneOf = <T>(list: readonly T[], value: unknown): value is T => list.includes(value as T);
const isIndex = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 0;

/** An action exactly as `remember` keeps it, with no field more or less; anything else is null. */
function actionOf(value: unknown): Action | null {
  if (!isObject(value)) return null;
  const fields = (...names: string[]): boolean => {
    const keys = Object.keys(value);
    return keys.length === names.length + 1 && names.every((name) => keys.includes(name));
  };
  const v = value;
  switch (v.type) {
    case 'promise':
      return fields('promised') && typeof v.promised === 'boolean' ? { type: 'promise', promised: v.promised } : null;
    case 'round':
      return fields('move') && oneOf(MOVES, v.move) ? { type: 'round', move: v.move } : null;
    case 'column':
      return fields('column', 'move') && isIndex(v.column) && oneOf(MOVES, v.move) ? { type: 'column', column: v.column, move: v.move } : null;
    case 'message':
      return fields('message') && oneOf(MESSAGES, v.message) ? { type: 'message', message: v.message } : null;
    case 'decision': {
      if (!fields('choice', 'face') || !oneOf(CHOICES, v.choice)) return null;
      // The die is rolled only for "roll", and its face is one of six.
      const face = v.choice === 'roll' ? (oneOf(DIE_FACES, v.face) ? v.face : undefined) : v.face === null ? null : undefined;
      return face === undefined ? null : { type: 'decision', choice: v.choice, face };
    }
    case 'card':
      return fields('card', 'choice') && isIndex(v.card) && oneOf(CHOICES, v.choice) ? { type: 'card', card: v.card, choice: v.choice } : null;
    case 'bet':
      return fields('bet') && oneOf(BETS, v.bet) ? { type: 'bet', bet: v.bet } : null;
    case 'guess': {
      const ids = GUESSES.map((guess) => guess.id);
      const fine = fields('id', 'guess') && oneOf(ids, v.id) && typeof v.guess === 'number' && guessOf(v.guess) === v.guess;
      return fine ? { type: 'guess', id: v.id as GuessId, guess: v.guess as number } : null;
    }
    case 'now':
      return fields('choice') && oneOf(CHOICES, v.choice) ? { type: 'now', choice: v.choice } : null;
    case 'page':
      return fields('kept') && typeof v.kept === 'boolean' ? { type: 'page', kept: v.kept } : null;
    default:
      return null;
  }
}

/**
 * Reads a record back. It must be this version, every action must be one `remember` keeps, and
 * every action must be one playing could reach after the ones before it. Otherwise: EMPTY.
 */
export function read(value: unknown): Memory {
  if (!isObject(value) || value.version !== MEMORY_VERSION || !Array.isArray(value.actions)) return EMPTY;
  if (Object.keys(value).length !== 2 || value.actions.length > MEMORY_MAX) return EMPTY;
  let memory = EMPTY;
  for (const raw of value.actions) {
    const action = actionOf(raw);
    if (!action || !accepts(memory, action) || (action.type === 'promise' && has(memory.actions, 'promise'))) return EMPTY;
    memory = remember(memory, action);
  }
  return memory;
}

/** The memory kept in an entry's `history.state`, or EMPTY. */
export const memoryOf = (state: unknown): Memory => read(isObject(state) ? state[MEMORY_KEY] : undefined);

/** An entry's `history.state` with this memory in it, and whatever else it held kept as it was. */
export const withMemory = (state: unknown, memory: Memory): Record<string, unknown> => ({ ...(isObject(state) ? state : {}), [MEMORY_KEY]: memory });
