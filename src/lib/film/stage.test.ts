import { describe, expect, it } from 'vitest';
import { reduce as pick, START as NO_PICKS } from '../pd/bestReply';
import { MOVES, payoff } from '../pd/game';
import { OTHER_MOVE, roundOf } from '../pd/round';
import { BOARD } from './board';
import { frame, isPortrait } from './camera';
import { FACES, MOODS, TRIANGLE_MOODS } from './faces';
import { outcomeOf, type DecisionState } from '../table/decision';
import { PAYOFFS, type Face } from '../table/game';
import { DECK } from './deck';
import { LOCKED_BEATS } from '../chapters';
import { SIGN } from './signs';
import {
  AWAY,
  BOARD_MARGIN,
  brokenThreadPaths,
  castPositions,
  CUTS,
  DIE,
  ENGINE_AT,
  GEAR_TURN,
  KEY_POSE,
  LEAD,
  RESTING_FACE,
  ROOMS_SPREAD,
  SPANS,
  spanOf,
  SHADE,
  SHADE_MARGIN,
  SIGNS_MARGIN,
  SPREAD,
  stageAt,
  threadBetween,
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
    expect(calm.moods).toEqual({ you: 'neutral', other: 'neutral', partner: 'neutral' });
    const asked = stageAt(inArrival(0.5), { promised: null }, false, false);
    expect(asked.moods).toEqual({ you: 'tempted', other: 'worried', partner: 'neutral' });
  });

  it('ties the golden thread only when the visitor promises', () => {
    const yes = stageAt(inArrival(0.5), { promised: true }, false, false);
    expect(yes.thread).toEqual({ state: 'tied', drawn: 1, shown: 1 });
    expect(yes.moods).toEqual({ you: 'proud', other: 'happy', partner: 'neutral' });
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
    expect(view(inside(rooms)).moods).toEqual({ you: 'worried', other: 'worried', partner: 'neutral' });
    expect(view(inside(play), { promised: true, round: roundOf('cooperate') }).moods).toEqual({ you: 'sad', other: 'happy', partner: 'neutral' });
    expect(view(inside(play), { promised: true, round: roundOf('defect') }).moods).toEqual({ you: 'worried', other: 'worried', partner: 'neutral' });
    expect(view(inside(columns)).moods).toEqual({ you: 'tempted', other: 'tempted', partner: 'neutral' });
    expect(view(inside(trap)).moods).toEqual({ you: 'worried', other: 'worried', partner: 'neutral' });
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
    expect(view(inside(chat)).moods).toEqual({ you: 'neutral', other: 'worried', partner: 'neutral' });
    expect(view(inside(chat), { promised: true, chat: 'promise' }).moods).toEqual({ you: 'happy', other: 'happy', partner: 'neutral' });
    expect(view(inside(chat), { promised: true, chat: 'nothing' }).moods.other).toBe('worried');
    expect(view(inside(cheap), { promised: true, chat: 'promise' }).moods).toEqual({ you: 'tempted', other: 'tempted', partner: 'neutral' });
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
    expect(view(inside(fold)).moods).toEqual({ you: 'shock', other: 'shock', partner: 'neutral' });
    expect(view(inside(decide)).moods).toEqual({ you: 'tempted', other: 'happy', partner: 'neutral' });
    expect(view(inside(decide), { promised: false }).moods).toEqual({ you: 'tempted', other: 'worried', partner: 'neutral' });
    expect(view(inside(decide), { promised: true, decision: rolled(4) }).moods).toEqual({ you: 'proud', other: 'happy', partner: 'neutral' });
    expect(view(inside(decide), { promised: false, decision: rolled(1) }).moods).toEqual({ you: 'happy', other: 'shock', partner: 'neutral' });
    expect(view(inside(decide), { promised: true, decision: kept }).moods).toEqual({ you: 'neutral', other: 'sad', partner: 'neutral' });
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
    expect(view(inside(voices), { promised: true, decision: kept }).moods).toEqual({ you: 'worried', other: 'happy', partner: 'neutral' });
    expect(view(inside(voices), { promised: true, decision: broken }).moods.other).toBe('sad');
    expect(view(inside(together, 0.1)).moods).toEqual({ you: 'happy', other: 'neutral', partner: 'neutral' });
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

describe('chapter 5, the blackout (ADR 0021, ADR 0023, ADR 0027)', () => {
  const blackout = beatRange('blackout', 'blackout');
  const newPartner = beatRange('blackout', 'new-partner');
  const deck = beatRange('blackout', 'deck');
  const receive = beatRange('blackout', 'receive');
  const reveal = beatRange('blackout', 'reveal');
  const inside = (range: { from: number }, by = 0.4) => at(range.from + by);
  const view = (p: number, state: StageState = { promised: true }, portrait = false) => stageAt(p, state, portrait, false);
  const onDeck = (card: number, choices: readonly ('roll' | 'dont')[] = []): StageState => ({ promised: true, deck: { choices, at: card } });
  const seat = (portrait = false) => castPositions(portrait ? SPREAD.portrait : SPREAD.landscape).other;
  const switchedCard = DECK.findIndex((card) => card.partner === 'switched');
  const sameCard = DECK.findIndex((card) => card.partner === 'same');
  const all = (choice: 'roll' | 'dont', upTo: number) => DECK.slice(0, upTo + 1).map(() => choice);

  it('puts the lights out as its card comes up, and brings them back', () => {
    expect(view(at(blackout.from - 1.2)).dark).toBe(0);
    expect(view(at(blackout.from - 0.1)).dark).toBeGreaterThan(0.9);
    expect(view(inside(blackout, 0.6)).dark).toBe(0);
    expect(view(inside(newPartner)).dark).toBe(0);
  });

  it('sits the triangle in the square’s seat in the dark, and sends the square to another table', () => {
    const before = view(at(blackout.from - 1.2));
    expect(before.cast.other).toEqual({ at: seat(), scale: 1, opacity: 1 });
    expect(before.cast.partner.opacity).toBe(0);
    for (const portrait of [false, true]) {
      const after = view(inside(newPartner), { promised: true }, portrait);
      expect(after.cast.partner).toEqual({ at: seat(portrait), scale: 1, opacity: 1 });
      expect(after.cast.other).toEqual({ ...AWAY[portrait ? 'portrait' : 'landscape'], opacity: 1 });
    }
  });

  it('keeps the golden thread tied to the one who left, and the new partner has none (ADR 0027)', () => {
    const after = view(inside(newPartner));
    expect(after.thread).toEqual({ state: 'tied', drawn: 1, shown: 1 });
    const numbers = threadBetween(after.cast.you, after.cast.other).match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
    expect(numbers.at(-2)).toBeCloseTo(after.cast.other.at[0] - 50 * after.cast.other.scale, 6);
    expect(view(inside(newPartner), { promised: false }).thread.state).toBe('none');
    expect(view(inside(newPartner), { promised: true, decision: { phase: 'outcome', ...outcomeOf('dont', null) } }).thread.state).toBe('broken');
  });

  it('keeps the square at its other table in view on any screen', () => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 1440, height: 640 },
      { width: 360, height: 740 },
      { width: 320, height: 568 },
    ]) {
      const v = view(inside(newPartner), { promised: true }, isPortrait(viewport));
      const box = frame(v.shot, viewport);
      const [x, y] = v.cast.other.at;
      const half = 70 * v.cast.other.scale;
      expect(x + half).toBeLessThan(box.x + box.width);
      expect(y - half).toBeGreaterThan(box.y);
    }
  });

  it('has what the other expects watch the new partner, and my word the square it was given to', () => {
    const v = view(inside(newPartner));
    expect(v.voices.look.expects).toEqual(v.cast.partner.at);
    expect(v.voices.look.word).toEqual(v.cast.other.at);
    expect(v.voices.globe).toBe('partner');
    expect(view(at(blackout.from - 1.2)).voices.globe).toBe('other');
  });

  it('shows on stage the person of the card in play: a new partner, or the one the visitor promised', () => {
    const switched = view(inside(deck), onDeck(switchedCard));
    expect(switched.cast.partner.opacity).toBe(1);
    expect(switched.cast.other.scale).toBeLessThan(1);
    const same = view(inside(deck), onDeck(sameCard));
    expect(same.cast.other).toEqual({ at: seat(), scale: 1, opacity: 1 });
    expect(same.cast.partner.opacity).toBe(0);
    expect(same.voices.globe).toBe('other');
  });

  it('ties each card’s promise, and snaps it only when the visitor keeps the money from the one they promised', () => {
    expect(view(inside(deck), onDeck(sameCard)).thread.state).toBe('tied');
    expect(view(inside(deck), onDeck(sameCard, all('dont', sameCard))).thread.state).toBe('broken');
    expect(view(inside(deck), onDeck(switchedCard, all('dont', switchedCard))).thread.state).toBe('tied');
    // Every card carries its own promise, whatever the visitor answered in chapter 0.
    expect(view(inside(deck), { promised: false, deck: { choices: [], at: sameCard } }).thread.state).toBe('tied');
  });

  it('gives the deck its faces: tempted, and whoever sits across hoping, until the visitor decides', () => {
    expect(view(inside(deck), onDeck(switchedCard)).moods).toEqual({ you: 'tempted', other: 'neutral', partner: 'happy' });
    expect(view(inside(deck), onDeck(switchedCard, all('roll', switchedCard))).moods).toEqual({ you: 'happy', other: 'neutral', partner: 'happy' });
    expect(view(inside(deck), onDeck(sameCard, all('dont', sameCard))).moods).toEqual({ you: 'neutral', other: 'sad', partner: 'neutral' });
    expect(view(inside(deck), onDeck(sameCard, all('roll', sameCard))).moods.you).toBe('proud');
  });

  it('seats the visitor as the one who receives at the table as it was, with the other’s promise and no thread', () => {
    const v = view(inside(receive), onDeck(switchedCard));
    expect(v.cast.other).toEqual({ at: seat(), scale: 1, opacity: 1 });
    expect(v.cast.partner.opacity).toBe(0);
    expect(v.thread.shown).toBe(0);
    expect(v.bubbles.other).toBe(1);
    expect(v.moods.you).toBe('worried');
    expect(view(inside(receive), { promised: true, bet: 4 }).moods.you).toBe('happy');
    expect(view(inside(receive), { promised: true, bet: 0 }).moods.you).toBe('worried');
  });

  it('flickers the lights for the reveal: the one who promised is gone, and a new partner decides', () => {
    expect(view(at(reveal.from - 0.4)).dark).toBeGreaterThan(0.8);
    const v = view(inside(reveal));
    expect(v.dark).toBe(0);
    expect(v.cast.partner.opacity).toBe(1);
    expect(v.cast.other.scale).toBeLessThan(1);
    expect(v.bubbles.other).toBe(0);
    expect(v.moods.you).toBe('shock');
    expect(v.voices.look).toEqual({ expects: v.cast.partner.at, word: v.cast.partner.at });
  });

  it('draws its still frame with the new partner in the seat', () => {
    const still = stageAt(KEY_POSE.blackout ?? 0, { promised: true }, false, true);
    expect(still.beat).toEqual({ chapter: 'blackout', id: 'new-partner' });
    expect(still.cast.partner.opacity).toBe(1);
  });
});

describe('chapter 6, the real people (ADR 0021, ADR 0023)', () => {
  const guessSame = beatRange('real-people', 'guess-same');
  const guessSwitched = beatRange('real-people', 'guess-switched');
  const expected = beatRange('real-people', 'expected');
  const conclusion = beatRange('real-people', 'conclusion');
  const inside = (range: { from: number }, by = 0.4) => at(range.from + by);
  const view = (p: number, state: StageState = { promised: true }, portrait = false) => stageAt(p, state, portrait, false);

  it('brings everyone back to the table as it was, and the visitor’s own thread with them', () => {
    const v = view(inside(guessSame));
    expect(v.cast.other).toEqual({ at: castPositions(SPREAD.landscape).other, scale: 1, opacity: 1 });
    expect(v.cast.partner.opacity).toBe(0);
    expect(v.thread).toEqual({ state: 'tied', drawn: 1, shown: 1 });
    expect(view(inside(guessSame), { promised: false }).thread.state).toBe('none');
  });

  it('lowers two signs over the table, each figure a question mark until it is guessed or reached', () => {
    expect(view(at(guessSame.from - 1)).signs.shown).toBe(0);
    const asking = view(inside(guessSame));
    expect(asking.signs).toMatchObject({ shown: 1, same: 0, switched: 0, expected: 0 });
    expect(view(inside(guessSame), { promised: true, guesses: { same: 60 } }).signs).toMatchObject({ same: 1, switched: 0 });
    expect(view(inside(guessSwitched), { promised: true, guesses: { same: 60, switched: 30 } }).signs).toMatchObject({ same: 1, switched: 1 });
    // Without guessing, the film shows both figures, and what was expected, when it reaches them.
    expect(view(inside(expected, 0.1)).signs).toMatchObject({ shown: 1, same: 1, switched: 1, expected: 1 });
  });

  it('hangs the signs over the table, clear of the voices, and keeps them in view on any screen', () => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 1440, height: 640 },
      { width: 360, height: 740 },
      { width: 320, height: 568 },
    ]) {
      const portrait = isPortrait(viewport);
      const v = view(inside(guessSame), { promised: true }, portrait);
      const box = frame(v.shot, viewport);
      expect(box.y).toBeLessThanOrEqual(SIGN.top - SIGNS_MARGIN + 1e-9);
      for (const x of [v.signs.x.same, v.signs.x.switched]) {
        expect(x - SIGN.width / 2).toBeGreaterThan(box.x);
        expect(x + SIGN.width / 2).toBeLessThan(box.x + box.width);
      }
      expect(v.signs.x.switched - v.signs.x.same).toBeGreaterThanOrEqual(SIGN.width);
      // The signs end above the voices' tops, the cloud's globe included.
      const globeTop = v.voices.at.expects[1] + (GLOBE_AT[1] - 30) * VOICE_SCALE;
      expect(SIGN.top + SIGN.height).toBeLessThan(Math.min(globeTop, v.voices.at.word[1] - 36 * VOICE_SCALE));
    }
  });

  it('lights my word at Vanberg’s conclusion, and only there', () => {
    expect(view(inside(expected, 0.1)).voices.glow).toBe(0);
    expect(view(inside(conclusion)).voices.glow).toBe(1);
  });

  it('gives the figures their faces: surprise at the gap, and the other glad at the end', () => {
    expect(view(inside(expected, 0.1)).moods.you).toBe('shock');
    expect(view(inside(conclusion)).moods).toEqual({ you: 'neutral', other: 'happy', partner: 'neutral' });
  });

  it('draws its still frame with both figures and what was expected', () => {
    const still = stageAt(KEY_POSE['real-people'] ?? 0, { promised: true }, false, true);
    expect(still.beat).toEqual({ chapter: 'real-people', id: 'expected' });
    expect(still.signs).toMatchObject({ shown: 1, same: 1, switched: 1, expected: 1 });
  });
});

describe('chapter 7, this is where I come in (ADR 0021, ADR 0027)', () => {
  const conclusion = beatRange('real-people', 'conclusion');
  const question = beatRange('my-research', 'question');
  const engine = beatRange('my-research', 'engine');
  const sealed = beatRange('my-research', 'sealed');
  const inside = (range: { from: number }, by = 0.4) => at(range.from + by);
  const view = (p: number, state: StageState = { promised: true }, portrait = false, reduced = false) => stageAt(p, state, portrait, reduced);
  /** How far the engine's drawing reaches from its centre, ink included (Engine.astro): its body, and its crank. */
  const ENGINE_LEFT = 93;
  const ENGINE_RIGHT = 109;

  it('takes chapter 6’s signs back up and lowers the lamp over the table as the chapter comes', () => {
    const before = view(inside(conclusion, 0.3));
    expect(before.signs.shown).toBe(1);
    expect(before.shade).toBe(0);
    const v = view(inside(question));
    expect(v.signs.shown).toBe(0);
    expect(v.shade).toBe(1);
    expect(v.lamp).toBeGreaterThan(0);
  });

  it('brings the stars out as night falls, all of them by the envelope', () => {
    expect(view(inside(conclusion, 0.3)).stars).toBe(0);
    const [q, e, s] = [question, engine, sealed].map((range) => view(inside(range)).stars);
    expect(q).toBeGreaterThan(0);
    expect(e).toBeGreaterThan(q ?? 1);
    expect(s).toBe(1);
  });

  it('keeps the lamp in view on any screen, above the voices', () => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 1440, height: 640 },
      { width: 360, height: 740 },
      { width: 320, height: 568 },
    ]) {
      const portrait = isPortrait(viewport);
      for (const range of [question, engine, sealed]) {
        const v = view(inside(range), { promised: true }, portrait);
        expect(frame(v.shot, viewport).y).toBeLessThanOrEqual(SHADE.top - SHADE_MARGIN + 1e-9);
        // The bulb hangs 34 units under the shade's middle; the cloud's globe is the voices' top.
        const globeTop = v.voices.at.expects[1] + (GLOBE_AT[1] - 30) * VOICE_SCALE;
        expect(SHADE.y + 36).toBeLessThan(Math.min(globeTop, v.voices.at.word[1] - 36 * VOICE_SCALE));
      }
    }
  });

  it('brings the engine down onto the table where the die rested, and the die goes', () => {
    expect(view(inside(question)).engine.shown).toBe(0);
    expect(view(inside(question)).die.opacity).toBe(1);
    const v = view(inside(engine));
    expect(v.engine.shown).toBe(1);
    expect(v.die.opacity).toBe(0);
    expect(ENGINE_AT[0]).toBe(WORLD.centre);
    expect(view(inside(sealed)).engine.shown).toBe(1);
  });

  it('fits the engine on the table between the circle and the square, on a phone too', () => {
    for (const spread of [SPREAD.landscape, SPREAD.portrait]) {
      const cast = castPositions(spread);
      expect(ENGINE_AT[0] - ENGINE_LEFT).toBeGreaterThan(cast.you[0] + 58 + 6.5);
      expect(ENGINE_AT[0] + ENGINE_RIGHT).toBeLessThan(cast.other[0] - 56 - 6.5);
    }
  });

  it('turns the engine’s gears with the scroll only, and holds them with reduced motion', () => {
    const early = view(inside(engine, 0.1)).engine.turn;
    const late = view(inside(engine, 0.7)).engine.turn;
    expect(late - early).toBeCloseTo(0.6 * GEAR_TURN, 6);
    // Two points under the same cut: the engine's card has the stage in both.
    expect(view(inside(engine, 0.1), { promised: true }, false, true).engine.turn).toBe(view(inside(engine, 0.4), { promised: true }, false, true).engine.turn);
  });

  it('has everyone watch the engine, surprised, then glad at the envelope; my word stops glowing', () => {
    const v = view(inside(engine));
    expect(v.voices.look).toEqual({ expects: ENGINE_AT, word: ENGINE_AT });
    expect(v.moods).toEqual({ you: 'shock', other: 'shock', partner: 'neutral' });
    expect(view(inside(question)).moods).toEqual({ you: 'neutral', other: 'neutral', partner: 'neutral' });
    expect(view(inside(sealed)).moods).toEqual({ you: 'happy', other: 'happy', partner: 'neutral' });
    expect(view(inside(question)).voices.glow).toBe(0);
  });

  it('seals the envelope, and with the lock open opens it before the finding', () => {
    expect(view(at(sealed.from)).envelope).toBe(0);
    expect(view(at(sealed.from), { promised: true }, false, true).envelope).toBe(0);
    expect(view(inside(sealed, 0.4)).envelope).toBe(LOCKED_BEATS.length > 0 ? 1 : 0);
  });

  it('holds the light still across the finding, and cuts to each of its beats with reduced motion', () => {
    const first = LOCKED_BEATS[0];
    const last = LOCKED_BEATS.at(-1);
    if (!first || !last) throw new Error('The tests run with the lock open');
    const start = view(at(beatRange('my-research', first.id).from));
    const end = view(at(beatRange('my-research', last.id).to - 0.01));
    expect(end.light).toEqual(start.light);
    expect(end.lamp).toBe(start.lamp);
    for (const b of LOCKED_BEATS) expect(CUTS.some((cut) => cut.from === beatRange('my-research', b.id).from - LEAD)).toBe(true);
    // The envelope stays open through the finding, with or without motion.
    expect(view(at(beatRange('my-research', first.id).from + 0.5), { promised: true }, false, true).envelope).toBe(1);
  });

  it('draws its still frame with the engine on the table under the lamp, at night', () => {
    const still = stageAt(KEY_POSE['my-research'] ?? 0, { promised: true }, false, true);
    expect(still.beat).toEqual({ chapter: 'my-research', id: 'engine' });
    expect(still).toMatchObject({ shade: 1, engine: { shown: 1 }, envelope: 0 });
    expect(still.lamp).toBeGreaterThan(0.5);
    expect(still.signs.shown).toBe(0);
  });
});

describe('chapter 8, closing (ADR 0021, ADR 0023, ADR 0027)', () => {
  const sealed = beatRange('my-research', 'sealed');
  const collect = beatRange('closing', 'collect');
  const asked = beatRange('closing', 'asked');
  const credits = beatRange('closing', 'credits');
  const inside = (range: { from: number }, by = 0.4) => at(range.from + by);
  const view = (p: number, state: StageState = { promised: true }, portrait = false, reduced = false) => stageAt(p, state, portrait, reduced);
  const kept: StageState = { promised: true, decision: { phase: 'outcome', ...outcomeOf('roll', 4) } };
  const broken: StageState = { promised: true, decision: { phase: 'outcome', ...outcomeOf('dont', null) } };

  it('goes back to the first table: the engine goes up, and the die floats over it again, as at the arrival', () => {
    expect(view(inside(sealed)).engine.shown).toBe(1);
    const v = view(inside(collect), kept);
    expect(v.engine.shown).toBe(0);
    expect(v.die).toEqual({ y: DIE.floats, opacity: 1, floating: true, rolling: false, face: RESTING_FACE });
    expect(v.die).toEqual(stageAt(at(1), { promised: true }, false, false).die);
    expect(v).toMatchObject({ table: 1, rooms: 0, dark: 0 });
    // The voices stop watching the engine and look at the other again.
    expect(v.voices.look).toEqual({ expects: v.cast.other.at, word: v.cast.other.at });
  });

  it('keeps the night to the end: the lamp over the table and every star', () => {
    for (const range of [collect, asked, credits]) {
      const v = view(inside(range));
      expect(v).toMatchObject({ shade: 1, stars: 1 });
      expect(v.lamp).toBeGreaterThan(0.5);
    }
  });

  it('asks with the other hoping if it was promised, then each takes the answer as it comes', () => {
    expect(view(inside(collect)).moods).toEqual({ you: 'tempted', other: 'happy', partner: 'neutral' });
    expect(view(inside(collect), { promised: false }).moods.other).toBe('worried');
    expect(view(inside(collect), { promised: true, now: 'roll' }).moods).toEqual({ you: 'proud', other: 'happy', partner: 'neutral' });
    expect(view(inside(collect), { promised: false, now: 'roll' }).moods.you).toBe('happy');
    // It is only an answer: keeping the money now betrays no one, and nobody cries.
    for (const promised of [true, false, null]) {
      expect(view(inside(collect), { promised, now: 'dont' }).moods).toEqual({ you: 'neutral', other: 'worried', partner: 'neutral' });
    }
  });

  it('leaves the golden thread as chapter 3 left it, whatever the visitor answers now', () => {
    for (const now of ['roll', 'dont'] as const) {
      expect(view(inside(collect), { ...kept, now }).thread).toMatchObject({ state: 'tied', shown: 1 });
      expect(view(inside(collect), { ...broken, now }).thread).toMatchObject({ state: 'broken', shown: 1 });
      expect(view(inside(collect), { promised: false, now }).thread.state).toBe('none');
    }
  });

  it('waits on the page’s question a little nervous, glad at a yes, and calm at a no', () => {
    expect(view(inside(asked)).moods).toEqual({ you: 'worried', other: 'worried', partner: 'neutral' });
    expect(view(inside(asked), { promised: true, pageKept: true }).moods).toEqual({ you: 'proud', other: 'proud', partner: 'neutral' });
    expect(view(inside(asked), { promised: true, pageKept: false }).moods).toEqual({ you: 'neutral', other: 'neutral', partner: 'neutral' });
  });

  it('brings the new partner back for the curtain call, at the other table, with everyone glad', () => {
    expect(view(inside(asked)).cast.partner.opacity).toBe(0);
    for (const portrait of [false, true]) {
      const v = view(inside(credits), { promised: true }, portrait);
      const away = AWAY[portrait ? 'portrait' : 'landscape'];
      expect(v.cast.partner).toEqual({ at: away.at, scale: away.scale, opacity: 1 });
      expect(v.cast.other).toEqual({ at: castPositions(portrait ? SPREAD.portrait : SPREAD.landscape).other, scale: 1, opacity: 1 });
      expect(v.moods).toEqual({ you: 'happy', other: 'happy', partner: 'happy' });
      // The cloud keeps its eyes, and its globe, on the square across the table, not on the bow.
      expect(v.voices.globe).toBe('other');
      expect(v.voices.look.expects).toEqual(v.cast.other.at);
    }
  });

  it('keeps the lamp, the voices and the whole cast in view on any screen', () => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 1440, height: 640 },
      { width: 360, height: 740 },
      { width: 320, height: 568 },
    ]) {
      const portrait = isPortrait(viewport);
      for (const range of [collect, asked, credits]) {
        const v = view(inside(range), { promised: true }, portrait);
        const box = frame(v.shot, viewport);
        expect(box.y).toBeLessThanOrEqual(SHADE.top - SHADE_MARGIN + 1e-9);
        const globeTop = v.voices.at.expects[1] + (GLOBE_AT[1] - 30) * VOICE_SCALE;
        expect(Math.min(globeTop, v.voices.at.word[1] - 36 * VOICE_SCALE)).toBeGreaterThan(box.y);
        expect(v.voices.at.word[0] - 80 * VOICE_SCALE).toBeGreaterThan(box.x);
        expect(v.cast.other.at[0] + 64).toBeLessThan(box.x + box.width);
        if (range === credits) {
          const { at: [x, y], scale } = v.cast.partner;
          expect(x + 62 * scale).toBeLessThan(box.x + box.width);
          expect(y - 66 * scale).toBeGreaterThan(box.y);
        }
      }
    }
  });

  it('cuts to each of its beats with reduced motion, after the finding’s, with the curtain call already on', () => {
    for (const range of [collect, asked, credits]) expect(CUTS.some((cut) => cut.from === range.from - LEAD)).toBe(true);
    CUTS.slice(1).forEach((cut, i) => expect(cut.from).toBeGreaterThan(CUTS[i]?.from ?? Infinity));
    expect(view(at(credits.from - 0.3), { promised: true }, false, true).cast.partner.opacity).toBe(1);
    expect(view(at(collect.from - 0.3), { promised: true }, false, true).die).toMatchObject({ opacity: 1, floating: true });
  });

  it('draws its still frame at the first table, at night, with the die floating over it', () => {
    const still = stageAt(KEY_POSE.closing ?? 0, kept, false, true);
    expect(still.beat).toEqual({ chapter: 'closing', id: 'collect' });
    expect(still).toMatchObject({ shade: 1, engine: { shown: 0 }, die: { floating: true, opacity: 1 }, thread: { state: 'tied' } });
  });
});
