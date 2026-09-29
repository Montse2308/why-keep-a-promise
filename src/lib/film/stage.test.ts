import { describe, expect, it } from 'vitest';
import { reduce as pick, START as NO_PICKS } from '../pd/bestReply';
import { MOVES, payoff } from '../pd/game';
import { OTHER_MOVE, roundOf } from '../pd/round';
import { BOARD } from './board';
import { frame, isPortrait } from './camera';
import { FACES, MOODS, TRIANGLE_MOODS } from './faces';
import { BOARD_MARGIN, castPositions, CUTS, KEY_POSE, ROOMS_SPREAD, SPANS, spanOf, SPREAD, stageAt, threadPath, type StageState } from './stage';
import { at, beatRange, TOTAL_SCREENS } from './timeline';

const arrival = spanOf('arrival');
const inArrival = (share: number) => arrival.from + share * (arrival.to - arrival.from);

describe('the cast’s faces (ADR 0027)', () => {
  it('has the seven moods of the character sheet, and four for the triangle', () => {
    expect(MOODS).toEqual(['neutral', 'happy', 'proud', 'tempted', 'worried', 'shock', 'sad']);
    expect(TRIANGLE_MOODS).toHaveLength(4);
    for (const mood of TRIANGLE_MOODS) expect(MOODS).toContain(mood);
  });

  it('shuts the eyes only in a smile, and cries only when betrayed', () => {
    expect(MOODS.filter((m) => FACES[m].closedEyes)).toEqual(['proud']);
    expect(MOODS.filter((m) => FACES[m].tear)).toEqual(['sad']);
    expect(MOODS.filter((m) => FACES[m].sweat)).toEqual(['tempted']);
  });
});

describe('chapter 0, the arrival (ADR 0021)', () => {
  it('opens the film, and its key pose sits inside it', () => {
    expect(SPANS[0]?.id).toBe('arrival');
    expect(arrival.from).toBe(0);
    const key = KEY_POSE.arrival ?? -1;
    expect(key).toBeGreaterThan(arrival.from);
    expect(key).toBeLessThan(arrival.to);
  });

  it('starts calm, then the other worries while the circle is tempted, until the visitor answers', () => {
    const calm = stageAt(0, { promised: null }, false, false);
    expect(calm.moods).toEqual({ you: 'neutral', other: 'neutral' });
    const asked = stageAt(inArrival(0.5), { promised: null }, false, false);
    expect(asked.moods).toEqual({ you: 'tempted', other: 'worried' });
  });

  it('ties the golden thread only when the visitor promises', () => {
    const yes = stageAt(inArrival(0.5), { promised: true }, false, false);
    expect(yes.thread).toEqual({ state: 'tied', drawn: 1 });
    expect(yes.moods).toEqual({ you: 'proud', other: 'happy' });
    const no = stageAt(inArrival(0.5), { promised: false }, false, false);
    expect(no.thread.state).toBe('none');
    expect(no.moods.other).toBe('sad');
    expect(stageAt(inArrival(0.5), { promised: null }, false, false).thread.state).toBe('none');
  });

  it('fades the title out as the camera closes in on the table', () => {
    const top = stageAt(0, { promised: null }, false, false);
    const later = stageAt(inArrival(0.6), { promised: null }, false, false);
    expect(top.titleGone).toBe(0);
    expect(later.titleGone).toBe(1);
    expect(later.shot.width).toBeLessThan(top.shot.width);
  });

  it('cuts between two shots instead of moving, with reduced motion, until the next chapter takes the stage', () => {
    // The first cut to a later chapter's pose comes a little before chapter 0's stretch ends.
    const next = CUTS.find((cut) => at(cut.pose) >= arrival.to)?.from ?? arrival.to * TOTAL_SCREENS;
    const shots = new Set(
      Array.from({ length: 41 }, (_, i) => (i / 40) * next * 0.999).map((screens) => stageAt(at(screens), { promised: null }, false, true).shot.width),
    );
    expect(shots.size).toBe(2);
  });

  it('brings the characters closer on a phone', () => {
    expect(stageAt(0, { promised: null }, true, false).spread).toBe(SPREAD.portrait);
    expect(SPREAD.portrait).toBeLessThan(SPREAD.landscape);
  });

  it('draws the thread from the circle’s side to the square’s', () => {
    for (const spread of [SPREAD.portrait, SPREAD.landscape, ROOMS_SPREAD.landscape]) {
      const cast = castPositions(spread);
      const numbers = threadPath(spread).match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
      const [fromX, , , , , , toX] = numbers;
      expect(fromX).toBeGreaterThan(cast.you[0]);
      expect(toX).toBeLessThan(cast.other[0]);
    }
  });
});

describe('chapter 1, two rooms (ADR 0021, ADR 0023)', () => {
  const rooms = beatRange('two-rooms', 'rooms');
  const play = beatRange('two-rooms', 'play');
  const columns = beatRange('two-rooms', 'columns');
  const trap = beatRange('two-rooms', 'trap');
  /** A point well inside a beat, once its card has the stage. */
  const inside = (range: { from: number }) => at(range.from + 0.4);
  const view = (p: number, state: StageState = { promised: true }, portrait = false) => stageAt(p, state, portrait, false);

  it('parts the two into rooms: the table goes, the wall and the bulbs come, the die leaves', () => {
    const table = view(at(1));
    expect(table).toMatchObject({ rooms: 0, table: 1, bulbs: 0, spread: SPREAD.landscape });
    expect(table.die.opacity).toBe(1);
    const apart = view(inside(rooms));
    expect(apart).toMatchObject({ rooms: 1, table: 0, bulbs: 1, spread: ROOMS_SPREAD.landscape });
    expect(apart.die.opacity).toBe(0);
    expect(view(inside(rooms), { promised: true }, true).spread).toBe(ROOMS_SPREAD.portrait);
    expect(ROOMS_SPREAD.landscape).toBeGreaterThan(SPREAD.landscape);
  });

  it('shows the round’s coins only once it is played, with the payoffs of the matrix', () => {
    expect(view(inside(play)).coins.shown).toBe(0);
    for (const move of MOVES) {
      const round = roundOf(move);
      const coins = view(inside(play), { promised: true, round }).coins;
      expect(coins).toEqual({ you: payoff(move, OTHER_MOVE).you, other: payoff(move, OTHER_MOVE).other, shown: 1 });
      // The coins go when the board comes down.
      expect(view(inside(columns), { promised: true, round }).coins.shown).toBe(0);
    }
    expect(view(inside(play), { promised: true, round: roundOf('cooperate') }).coins).toMatchObject({ you: 0, other: 5 });
  });

  it('lowers the board for the two columns and keeps it through the trap, raising the bulbs', () => {
    expect(view(inside(play)).board.shown).toBe(0);
    const down = view(inside(columns));
    expect(down.board.shown).toBe(1);
    expect(down.bulbs).toBe(0);
    expect(view(inside(trap)).board.shown).toBe(1);
  });

  it('asks about one column at a time, and marks each pick and each best reply', () => {
    expect(view(inside(columns)).board.column).toBe('cooperate');
    const first = pick(NO_PICKS, { type: 'pick', move: 'cooperate' });
    const one = view(inside(columns), { promised: true, columns: first });
    expect(one.board.column).toBe('defect');
    expect(one.board.tags['cooperate-cooperate']).toContain('pick');
    expect(one.board.tags['defect-cooperate']).toContain('best');
    const both = pick(first, { type: 'pick', move: 'defect' });
    expect(view(inside(columns), { promised: true, columns: both }).board.column).toBeNull();
  });

  it('closes the trap whatever the visitor picked: defecting is the best reply in both columns, and both end up at (P, P)', () => {
    const cooperatedTwice = pick(pick(NO_PICKS, { type: 'pick', move: 'cooperate' }), { type: 'pick', move: 'cooperate' });
    for (const state of [{ promised: null }, { promised: true, columns: cooperatedTwice }] satisfies StageState[]) {
      const tags = view(inside(trap), state).board.tags;
      expect(tags['defect-cooperate']).toContain('best');
      expect(tags['defect-defect']).toEqual(expect.arrayContaining(['best', 'equilibrium']));
      expect(tags['cooperate-cooperate']).toEqual(['better']);
      expect(tags['cooperate-defect']).toEqual([]);
      for (const cell of Object.values(tags)) expect(cell).not.toContain('pick');
    }
  });

  it('keeps the board clear of the corner on any screen while it is down', () => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 1440, height: 640 },
      { width: 360, height: 740 },
      { width: 320, height: 568 },
    ]) {
      const shot = view(inside(columns), { promised: true }, isPortrait(viewport)).shot;
      expect(frame(shot, viewport).y).toBeLessThanOrEqual(BOARD.card.y - BOARD_MARGIN);
    }
  });

  it('gives each beat its faces: worried apart, betrayed after cooperating, tempted by the columns', () => {
    expect(view(inside(rooms)).moods).toEqual({ you: 'worried', other: 'worried' });
    expect(view(inside(play), { promised: true, round: roundOf('cooperate') }).moods).toEqual({ you: 'sad', other: 'happy' });
    expect(view(inside(play), { promised: true, round: roundOf('defect') }).moods).toEqual({ you: 'worried', other: 'worried' });
    expect(view(inside(columns)).moods).toEqual({ you: 'tempted', other: 'tempted' });
    expect(view(inside(trap)).moods).toEqual({ you: 'worried', other: 'worried' });
  });

  it('keeps the golden thread tied across the rooms, and none without a promise', () => {
    for (const range of [rooms, play, columns, trap]) {
      expect(view(inside(range)).thread.state).toBe('tied');
      expect(view(inside(range), { promised: false }).thread.state).toBe('none');
    }
  });

  it('cuts between still poses with reduced motion: nothing moves between two cuts', () => {
    const cuts = CUTS.filter((cut) => cut.from < trap.to);
    cuts.forEach((cut, i) => {
      const end = cuts[i + 1]?.from ?? trap.to;
      const poses = new Set(
        Array.from({ length: 12 }, (_, k) => cut.from + ((end - cut.from) * (k + 0.5)) / 12).map((screens) => {
          const still = stageAt(at(screens), { promised: true }, false, true);
          return JSON.stringify([still.shot, still.spread, still.rooms, still.board.shown, still.bulbs]);
        }),
      );
      expect(poses.size, `cut at ${cut.from}`).toBe(1);
    });
  });

  it('draws its still frame at the trap', () => {
    const key = (KEY_POSE['two-rooms'] ?? 0) * TOTAL_SCREENS;
    expect(key).toBeGreaterThan(trap.from);
    expect(key).toBeLessThan(trap.to);
  });
});

describe('chapter 2, what if they could talk? (ADR 0021, ADR 0023)', () => {
  const chat = beatRange('talk', 'chat');
  const cheap = beatRange('talk', 'cheap');
  const inside = (range: { from: number }) => at(range.from + 0.4);
  const view = (p: number, state: StageState = { promised: true }) => stageAt(p, state, false, false);

  it('talks in the same rooms, under the same board: the matrix does not change', () => {
    const talking = view(inside(chat));
    expect(talking).toMatchObject({ rooms: 1, table: 0 });
    expect(talking.board.shown).toBe(1);
    expect(talking.board.tags).toEqual(view(inside(beatRange('two-rooms', 'trap'))).board.tags);
  });

  it('lets the other speak first, and the visitor only once they write', () => {
    expect(view(at(chat.from - 1)).bubbles).toEqual({ you: 0, other: 0 });
    expect(view(inside(chat)).bubbles).toEqual({ you: 0, other: 1 });
    expect(view(inside(chat), { promised: true, chat: 'trust' }).bubbles).toEqual({ you: 1, other: 1 });
  });

  it('shows how each message lands, then both tempted again: talk changes no payoff', () => {
    expect(view(inside(chat)).moods).toEqual({ you: 'neutral', other: 'worried' });
    expect(view(inside(chat), { promised: true, chat: 'promise' }).moods).toEqual({ you: 'happy', other: 'happy' });
    expect(view(inside(chat), { promised: true, chat: 'nothing' }).moods.other).toBe('worried');
    expect(view(inside(cheap), { promised: true, chat: 'promise' }).moods).toEqual({ you: 'tempted', other: 'tempted' });
  });

  it('draws its still frame in the chat', () => {
    const key = (KEY_POSE.talk ?? 0) * TOTAL_SCREENS;
    expect(key).toBeGreaterThan(chat.from);
    expect(key).toBeLessThan(chat.to);
  });
});
