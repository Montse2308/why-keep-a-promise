/**
 * The film's credits (chapter 8, ADR 0021): who plays whom, and the notebook's pages they lead to
 * (ADR 0024): all six, with /finding only behind the lock (ADR 0026). No profiles: GitHub and
 * LinkedIn belong to /about.
 */
import type { UiKey } from '../i18n';
import { linkable } from '../notebook';
import type { Subpage } from '../routes';

/** The cast, in the order the film brings them on: each shape, as the role it plays. */
export const CAST = ['you', 'other', 'partner', 'expects', 'word', 'thread'] as const;
export type Role = (typeof CAST)[number];

export const CAST_LINE: Record<Role, UiKey> = {
  you: 'film.closing.cast.you',
  other: 'film.closing.cast.other',
  partner: 'film.closing.cast.partner',
  expects: 'film.closing.cast.expects',
  word: 'film.closing.cast.word',
  thread: 'film.closing.cast.thread',
};

/** The notebook's pages the credits lead to, in the notebook's order: /finding only behind the lock. */
export function creditPages(unlocked: boolean): readonly Subpage[] {
  return linkable(unlocked).map((entry) => entry.page);
}
