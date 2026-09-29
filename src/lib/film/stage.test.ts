import { describe, expect, it } from 'vitest';
import { reduce as pick, START as NO_PICKS } from '../pd/bestReply';
import { MOVES, payoff } from '../pd/game';
import { OTHER_MOVE, roundOf } from '../pd/round';
import { BOARD } from './board';
import { frame, isPortrait } from './camera';
import { FACES, MOODS, TRIANGLE_MOODS } from './faces';
import { outcomeOf, type DecisionState } from '../table/decision';
import { PAYOFFS, type Face } from '../table/game';
import {
  BOARD_MARGIN,
  brokenThreadPaths,
  castPositions,
  CUTS,
  DIE,
  KEY_POSE,
  LEAD,
  RESTING_FACE,
  ROOMS_SPREAD,
  SPANS,
  spanOf,
  SPREAD,
  stageAt,
  threadPath,
  threadState,
  WORLD,
  type StageState,
} from './stage';
import { at, beatRange, BUILT_SCREENS, TOTAL_SCREENS } from './timeline';
import { GLOBE_AT, VOICE_SCALE } from './voices';

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

  it('cuts between still poses with reduced motion across the film: nothing moves between two cuts', () => {
    const cuts = CUTS.filter((cut) => cut.from < BUILT_SCREENS);
    expect(cuts.length).toBeGreaterThan(8);
    cuts.forEach((cut, i) => {
      const end = cuts[i + 1]?.from ?? BUILT_SCREENS;
      const poses = new Set(
        Array.from({ length: 12 }, (_, k) => cut.from + ((end - cut.from) * (k + 0.5)) / 12).map((screens) => {
          const still = stageAt(at(screens), { promised: true }, false, true);
          return JSON.stringify([still.shot, still.spread, still.rooms, still.board.shown, still.board.folded, still.bulbs, still.die.y, still.die.opacity]);
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

describe('chapter 3, the matrix folds (ADR 0021, ADR 0023)', () => {
  const fold = beatRange('fold', 'fold');
  const decide = beatRange('fold', 'decide');
  const inside = (range: { from: number }, by = 0.4) => at(range.from + by);
  const view = (p: number, state: StageState = { promised: true }) => stageAt(p, state, false, false);
  const rolled = (face: Face): DecisionState => ({ phase: 'outcome', ...outcomeOf('roll', face) });
  const kept: DecisionState = { phase: 'outcome', ...outcomeOf('dont', null) };

  it('brings the two back to the table, and the talk is over', () => {
    const back = view(inside(decide));
    expect(back).toMatchObject({ rooms: 0, table: 1, bulbs: 0, spread: SPREAD.landscape });
    expect(back.bubbles).toEqual({ you: 0, other: 0 });
  });

  it('folds the board into the die, which drops onto the table and rests there', () => {
    const before = view(at(fold.from - 1));
    expect(before.board.folded).toBe(0);
    expect(before.die.opacity).toBe(0);
    const after = view(inside(decide));
    expect(after.board.folded).toBe(1);
    expect(after.die).toMatchObject({ y: DIE.rests, opacity: 1, floating: false, rolling: false, face: RESTING_FACE });
    // With the board folded, the camera no longer keeps its top in view.
    expect(after.shot.top ?? 0).toBeGreaterThan(1000);
  });

  it('shows the decision’s coins only once it is made, as PAYOFFS pays them', () => {
    expect(view(inside(decide)).coins.shown).toBe(0);
    expect(view(inside(decide), { promised: true, decision: kept }).coins).toEqual({ you: PAYOFFS.dont.you, other: PAYOFFS.dont.other, shown: 1 });
    expect(view(inside(decide), { promised: true, decision: rolled(3) }).coins).toEqual({ you: PAYOFFS.roll.you, other: PAYOFFS.roll.other.success, shown: 1 });
    expect(view(inside(decide), { promised: true, decision: rolled(1) }).coins).toEqual({ you: PAYOFFS.roll.you, other: PAYOFFS.roll.other.failure, shown: 1 });
  });

  it('rolls the die while it is in the air, and shows the face it landed on, never as a payoff', () => {
    const rolling = view(inside(decide), { promised: true, decision: { phase: 'die', choice: 'roll', face: 4 } });
    expect(rolling.die.rolling).toBe(true);
    expect(rolling.coins.shown).toBe(0);
    for (const face of [1, 2, 3, 4, 5, 6] as const) expect(view(inside(decide), { promised: true, decision: rolled(face) }).die).toMatchObject({ rolling: false, face });
  });

  it('holds the golden thread when a promise is kept, snaps it when it is broken, and has none without one', () => {
    expect(view(inside(decide), { promised: true, decision: rolled(1) }).thread.state).toBe('tied');
    expect(view(inside(decide), { promised: true, decision: kept }).thread.state).toBe('broken');
    expect(view(inside(decide), { promised: false, decision: kept }).thread.state).toBe('none');
    expect(view(inside(decide), { promised: null, decision: rolled(4) }).thread.state).toBe('none');
    expect(threadState({ promised: true })).toBe('tied');
  });

  it('gives the decision its faces: tempted and hoping, then kept or betrayed', () => {
    expect(view(inside(fold)).moods).toEqual({ you: 'shock', other: 'shock' });
    expect(view(inside(decide)).moods).toEqual({ you: 'tempted', other: 'happy' });
    expect(view(inside(decide), { promised: false }).moods).toEqual({ you: 'tempted', other: 'worried' });
    expect(view(inside(decide), { promised: true, decision: rolled(4) }).moods).toEqual({ you: 'proud', other: 'happy' });
    expect(view(inside(decide), { promised: false, decision: rolled(1) }).moods).toEqual({ you: 'happy', other: 'shock' });
    expect(view(inside(decide), { promised: true, decision: kept }).moods).toEqual({ you: 'neutral', other: 'sad' });
  });

  it('draws the broken thread as two ends, each still tied to its character', () => {
    for (const spread of [SPREAD.portrait, SPREAD.landscape]) {
      const cast = castPositions(spread);
      const [left, right] = brokenThreadPaths(spread).map((d) => d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []);
      expect(left?.[0]).toBeGreaterThan(cast.you[0]);
      expect(left?.[0]).toBeLessThan(WORLD.centre);
      expect(right?.[0]).toBeLessThan(cast.other[0]);
      expect(right?.[0]).toBeGreaterThan(WORLD.centre);
    }
  });

  it('draws its still frame at the decision', () => {
    const key = (KEY_POSE.fold ?? 0) * TOTAL_SCREENS;
    expect(key).toBeGreaterThan(decide.from);
    expect(key).toBeLessThan(decide.to);
  });
});

describe('chapter 4, two voices (ADR 0021, ADR 0027)', () => {
  const voices = beatRange('two-voices', 'voices');
  const together = beatRange('two-voices', 'together');
  const trick = beatRange('two-voices', 'trick');
  const inside = (range: { from: number }, by = 0.4) => at(range.from + by);
  const view = (p: number, state: StageState = { promised: true }, portrait = false) => stageAt(p, state, portrait, false);
  const kept: DecisionState = { phase: 'outcome', ...outcomeOf('roll', 4) };
  const broken: DecisionState = { phase: 'outcome', ...outcomeOf('dont', null) };

  it('brings the two voices in over the circle, and keeps them', () => {
    expect(view(at(voices.from - 1)).voices.shown).toBe(0);
    for (const range of [voices, together, trick]) expect(view(inside(range)).voices.shown).toBe(1);
    for (const portrait of [false, true]) {
      const { cast, voices: v } = view(inside(voices), { promised: true }, portrait);
      // One on each side of the circle, above its head, and both short of the other.
      expect(v.at.word[0]).toBeLessThan(cast.you[0]);
      expect(v.at.expects[0]).toBeGreaterThan(cast.you[0]);
      expect(v.at.expects[0]).toBeLessThan(cast.other.at[0] - 100);
      for (const at of [v.at.word, v.at.expects]) expect(at[1]).toBeLessThan(cast.you[1] - 120);
    }
  });

  it('keeps both voices in view on any screen, clear of the spool’s corner', () => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 1440, height: 640 },
      { width: 360, height: 740 },
      { width: 320, height: 568 },
    ]) {
      const v = view(inside(together, 0.1), { promised: true }, isPortrait(viewport));
      const box = frame(v.shot, viewport);
      // Their outlines, and the cloud's globe up towards the other, at the voices' scale.
      const [wx, wy] = v.voices.at.word;
      const [ex, ey] = v.voices.at.expects;
      expect(wx - 80 * VOICE_SCALE).toBeGreaterThan(box.x);
      expect(ex + (GLOBE_AT[0] + 36) * VOICE_SCALE).toBeLessThan(box.x + box.width);
      expect(Math.min(wy - 36 * VOICE_SCALE, ey + (GLOBE_AT[1] - 30) * VOICE_SCALE)).toBeGreaterThan(box.y);
    }
  });

  it('has both voices look at the other while they agree, and at each other over the trick', () => {
    for (const point of [inside(voices), inside(together, 0.1)]) {
      const v = view(point);
      expect(v.voices.look).toEqual({ expects: v.cast.other.at, word: v.cast.other.at });
    }
    const arguing = view(inside(trick));
    expect(arguing.voices.look).toEqual({ expects: arguing.voices.at.word, word: arguing.voices.at.expects });
  });

  it('clears the decision’s coins as the voices come, and keeps the thread as chapter 3 left it', () => {
    expect(view(inside(voices), { promised: true, decision: kept }).coins.shown).toBe(0);
    expect(view(inside(voices), { promised: true, decision: kept }).thread.state).toBe('tied');
    expect(view(inside(voices), { promised: true, decision: broken }).thread.state).toBe('broken');
    expect(view(inside(voices), { promised: false, decision: broken }).thread.state).toBe('none');
  });

  it('leaves the other as the decision left them, and surprises the circle with the trick', () => {
    expect(view(inside(voices), { promised: true, decision: kept }).moods).toEqual({ you: 'worried', other: 'happy' });
    expect(view(inside(voices), { promised: true, decision: broken }).moods.other).toBe('sad');
    expect(view(inside(together, 0.1)).moods).toEqual({ you: 'happy', other: 'neutral' });
    expect(view(inside(trick)).moods.you).toBe('shock');
  });

  it('draws its still frame while the voices agree', () => {
    const key = (KEY_POSE['two-voices'] ?? 0) * TOTAL_SCREENS;
    expect(key).toBeGreaterThan(together.from);
    expect(key).toBeLessThan(together.to);
    expect(stageAt(KEY_POSE['two-voices'] ?? 0, { promised: true }, false, true).beat).toEqual({ chapter: 'two-voices', id: 'together' });
  });
});

describe('the storyboard’s still frames (ADR 0025)', () => {
  it('draw each chapter in one of its own beats, with that beat’s faces', () => {
    for (const [chapter, key] of Object.entries(KEY_POSE)) {
      expect(stageAt(key ?? 0, { promised: true }, false, true).beat.chapter, chapter).toBe(chapter);
    }
  });

  it('cut, with reduced motion, to a pose that each beat’s card already has the stage for', () => {
    for (const cut of CUTS.slice(2)) {
      const cutBeat = stageAt(at(cut.from + LEAD + 0.01), { promised: true }, false, true).beat;
      expect(stageAt(at(cut.pose), { promised: true }, false, true).beat, `cut at ${cut.from}`).toEqual(cutBeat);
    }
  });
});
