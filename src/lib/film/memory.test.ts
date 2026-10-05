import { describe, expect, it } from 'vitest';
import { DECK } from './deck';
import { accepts, EMPTY, MEMORY_KEY, MEMORY_MAX, MEMORY_VERSION, memoryOf, read, remember, withMemory, type Action, type Memory } from './memory';

const play = (...actions: Action[]): Memory => actions.reduce(remember, EMPTY);

/** A whole visit: every action of ADR 0029, in an order the film allows. */
const VISIT: Action[] = [
  { type: 'promise', promised: true },
  { type: 'round', move: 'cooperate' },
  { type: 'column', column: 0, move: 'defect' },
  { type: 'column', column: 1, move: 'defect' },
  { type: 'message', message: 'promise' },
  { type: 'decision', choice: 'roll', face: 4 },
  ...DECK.map((_, card): Action => ({ type: 'card', card, choice: card % 2 ? 'dont' : 'roll' })),
  { type: 'bet', bet: 3 },
  { type: 'guess', id: 'same', guess: 48 },
  { type: 'guess', id: 'switched', guess: 51 },
  { type: 'now', choice: 'roll' },
  { type: 'page', kept: true },
];

describe("the film's memory", () => {
  it('keeps a whole visit, in order, and reads it back the same', () => {
    const memory = play(...VISIT);
    expect(memory.actions).toEqual(VISIT);
    expect(memory.actions).toHaveLength(MEMORY_MAX);
    expect(read(memory)).toEqual(memory);
    // history.state is copied with the structured clone algorithm; JSON is stricter still.
    expect(read(structuredClone(memory))).toEqual(memory);
    expect(read(JSON.parse(JSON.stringify(memory)))).toEqual(memory);
  });

  it('starts empty, at its version', () => {
    expect(EMPTY).toEqual({ version: MEMORY_VERSION, actions: [] });
    expect(read(EMPTY)).toEqual(EMPTY);
  });

  it("keeps only the last answer to chapter 0, until the decision or chapter 8's answer settles it", () => {
    const changed = play({ type: 'promise', promised: false }, { type: 'round', move: 'defect' }, { type: 'promise', promised: true });
    expect(changed.actions).toEqual([{ type: 'round', move: 'defect' }, { type: 'promise', promised: true }]);
    const decided = play({ type: 'promise', promised: true }, { type: 'decision', choice: 'dont', face: null });
    expect(remember(decided, { type: 'promise', promised: false })).toBe(decided);
    const answered = play({ type: 'now', choice: 'dont' });
    expect(accepts(answered, { type: 'promise', promised: true })).toBe(false);
  });

  it('takes each one-time choice once', () => {
    for (const action of VISIT.filter((a) => !['promise', 'column', 'card', 'guess'].includes(a.type))) {
      const once = play(action);
      expect(remember(once, action), action.type).toBe(once);
    }
    const guessed = play({ type: 'guess', id: 'same', guess: 10 });
    expect(remember(guessed, { type: 'guess', id: 'same', guess: 20 })).toBe(guessed);
    expect(remember(guessed, { type: 'guess', id: 'switched', guess: 20 }).actions).toHaveLength(2);
  });

  it('takes the columns and the cards only in order, and no more than there are', () => {
    expect(accepts(EMPTY, { type: 'column', column: 1, move: 'defect' })).toBe(false);
    const both = play({ type: 'column', column: 0, move: 'defect' }, { type: 'column', column: 1, move: 'cooperate' });
    expect(accepts(both, { type: 'column', column: 2, move: 'defect' })).toBe(false);
    expect(accepts(EMPTY, { type: 'card', card: 1, choice: 'roll' })).toBe(false);
    const dealt = play(...DECK.map((_, card): Action => ({ type: 'card', card, choice: 'roll' })));
    expect(accepts(dealt, { type: 'card', card: DECK.length, choice: 'roll' })).toBe(false);
  });

  it('lets the chapters come in any order, as the scroll allows', () => {
    const backwards = [...VISIT.slice(6)].reverse().filter((a) => a.type !== 'card');
    expect(play(...backwards).actions).toEqual(backwards);
  });
});

describe('reading the memory back', () => {
  const memory = play(...VISIT);
  const tampered = (actions: unknown[]): unknown => ({ version: MEMORY_VERSION, actions });

  it('ignores anything that is not a record', () => {
    for (const value of [undefined, null, 0, 'film', [], [memory], () => memory]) expect(read(value)).toEqual(EMPTY);
  });

  it('ignores another version, and a record with a field more', () => {
    expect(read({ ...memory, version: 2 })).toEqual(EMPTY);
    expect(read({ ...memory, version: '1' })).toEqual(EMPTY);
    expect(read({ ...memory, seen: true })).toEqual(EMPTY);
    expect(read({ version: MEMORY_VERSION })).toEqual(EMPTY);
  });

  it('ignores the whole record if one action is not one the film writes', () => {
    const odd: unknown[] = [
      { type: 'promise', promised: 'yes' },
      { type: 'round', move: 'betray' },
      { type: 'message', message: 'hello' },
      { type: 'decision', choice: 'roll', face: 7 },
      { type: 'decision', choice: 'roll', face: null },
      { type: 'decision', choice: 'dont', face: 3 },
      { type: 'card', card: 0.5, choice: 'roll' },
      { type: 'bet', bet: 9 },
      { type: 'guess', id: 'same', guess: 48.5 },
      { type: 'guess', id: 'same', guess: 140 },
      { type: 'guess', id: 'other', guess: 40 },
      { type: 'now', choice: 'maybe' },
      { type: 'page', kept: 1 },
      { type: 'page', kept: true, at: 3 },
      { type: 'replay' },
      'promise',
      null,
    ];
    for (const action of odd) expect(read(tampered([VISIT[1], action])), JSON.stringify(action)).toEqual(EMPTY);
  });

  it('ignores a record that playing could not reach', () => {
    expect(read(tampered([VISIT[5], { type: 'promise', promised: true }]))).toEqual(EMPTY);
    expect(read(tampered([{ type: 'promise', promised: true }, { type: 'promise', promised: false }]))).toEqual(EMPTY);
    expect(read(tampered([{ type: 'card', card: 1, choice: 'roll' }]))).toEqual(EMPTY);
    expect(read(tampered([VISIT[1], VISIT[1]]))).toEqual(EMPTY);
    expect(read(tampered([...VISIT, VISIT[0]]))).toEqual(EMPTY);
  });

  it('sits in history.state under its key, next to whatever else the entry holds', () => {
    const state = withMemory({ other: 1 }, memory);
    expect(state).toEqual({ other: 1, [MEMORY_KEY]: memory });
    expect(memoryOf(state)).toEqual(memory);
    expect(withMemory(null, memory)).toEqual({ [MEMORY_KEY]: memory });
    expect(memoryOf(null)).toEqual(EMPTY);
    expect(memoryOf({ other: 1 })).toEqual(EMPTY);
    expect(memoryOf({ [MEMORY_KEY]: 'played' })).toEqual(EMPTY);
  });
});
