/**
 * Chapter 2's chat (ADR 0023, interaction 4): what if the two could talk before choosing? The
 * visitor picks one of three messages already written, never free text, and the other answers. It is
 * talk only: the dilemma is not played again (docs/content-rules.md, rule (f)). The messages are the
 * characters' lines, not anyone's quote (rule (k)).
 */
import type { UiKey } from '../i18n';
import type { Mood } from './faces';

export const MESSAGES = ['promise', 'trust', 'nothing'] as const;
export type Message = (typeof MESSAGES)[number];

/** Null until the visitor writes. */
export type Chat = Message | null;

/** Writes the message, or, once one was written, leaves the chat as it was. */
export function write(chat: Chat, message: Message): Message {
  return chat ?? message;
}

export const LINES: Record<Message, { readonly says: UiKey; readonly answer: UiKey }> = {
  promise: { says: 'film.talk.says.promise', answer: 'film.talk.answer.promise' },
  trust: { says: 'film.talk.says.trust', answer: 'film.talk.answer.trust' },
  nothing: { says: 'film.talk.says.nothing', answer: 'film.talk.answer.nothing' },
};

/** How the two feel once the message is out: a promise cheers both; saying nothing leaves the other worried. */
export const AFTER: Record<Message, { readonly you: Mood; readonly other: Mood }> = {
  promise: { you: 'happy', other: 'happy' },
  trust: { you: 'happy', other: 'neutral' },
  nothing: { you: 'neutral', other: 'worried' },
};

/** What the storyboard shows without JavaScript: the chat as if the visitor had promised. */
export const AS_IF: Message = 'promise';
