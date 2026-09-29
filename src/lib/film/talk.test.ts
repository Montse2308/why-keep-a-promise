import { describe, expect, it } from 'vitest';
import en from '../../i18n/en.json';
import es from '../../i18n/es.json';
import { AFTER, AS_IF, LINES, MESSAGES, write } from './talk';

describe('chapter 2’s chat (ADR 0023, interaction 4)', () => {
  it('offers three messages already written, each with the other’s answer, in both languages', () => {
    expect(MESSAGES).toHaveLength(3);
    for (const message of MESSAGES) {
      for (const dictionary of [en, es]) {
        expect(dictionary[LINES[message].says].length).toBeGreaterThan(0);
        expect(dictionary[LINES[message].answer].length).toBeGreaterThan(0);
      }
    }
    expect(new Set(MESSAGES.map((m) => en[LINES[m].says])).size).toBe(3);
  });

  it('is written once: a second message leaves the chat as it was', () => {
    for (const first of MESSAGES) {
      const chat = write(null, first);
      for (const second of MESSAGES) expect(write(chat, second)).toBe(first);
    }
  });

  it('cheers both with a promise, and leaves the other worried by a refusal', () => {
    expect(AFTER.promise).toEqual({ you: 'happy', other: 'happy' });
    expect(AFTER.nothing.other).toBe('worried');
    expect(MESSAGES).toContain(AS_IF);
  });
});
