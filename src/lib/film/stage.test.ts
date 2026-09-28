import { describe, expect, it } from 'vitest';
import { FACES, MOODS, TRIANGLE_MOODS } from './faces';
import { castPositions, KEY_POSE, SPANS, spanOf, SPREAD, stageAt, threadPath } from './stage';

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

  it('cuts between two shots instead of moving, with reduced motion', () => {
    const shots = new Set(
      Array.from({ length: 41 }, (_, i) => stageAt(inArrival(i / 40), { promised: null }, false, true).shot.width),
    );
    expect(shots.size).toBe(2);
  });

  it('brings the characters closer on a phone', () => {
    expect(stageAt(0, { promised: null }, true, false).spread).toBe(SPREAD.portrait);
    expect(SPREAD.portrait).toBeLessThan(SPREAD.landscape);
  });

  it('draws the thread from the circle’s side to the square’s', () => {
    for (const spread of [SPREAD.portrait, SPREAD.landscape]) {
      const cast = castPositions(spread);
      const numbers = threadPath(spread).match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
      const [fromX, , , , , , toX] = numbers;
      expect(fromX).toBeGreaterThan(cast.you[0]);
      expect(toX).toBeLessThan(cast.other[0]);
    }
  });
});
