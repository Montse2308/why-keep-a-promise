import { describe, expect, it } from 'vitest';
import { START as NO_PICKS } from '../pd/bestReply';
import { UNDECIDED } from '../table/decision';
import { comingIntoView, SIGHT_CUE, SIGHT_SPANS, SIGHTS, sightsAt, type Sight } from './sights';
import { CUES } from './sound';
import { stageAt, type StageState, type StageView } from './stage';
import { TOTAL_SCREENS } from './timeline';

const STATE: StageState = { promised: null, round: null, columns: NO_PICKS, chat: null, decision: UNDECIDED, deck: { choices: [], at: 0 }, bet: null, guesses: {}, now: null, pageKept: null };

/** What the stage shows while each sight is in view (ADR 0030: everything that sounds is also seen). */
const SHOWS: Record<Sight, (view: StageView) => boolean> = {
  blackout: (view) => view.dark > 0.4,
  flicker: (view) => view.dark > 0.4,
  // The light is mostly back, and the triangle sits in the square's seat.
  'lights-on': (view) => view.dark < 0.5 && view.cast.partner.opacity > 0.5,
  // The signs hang over the table, their figures more on than off.
  signs: (view) => view.signs.shown > 0.5 && view.signs.same > 0.5 && view.signs.switched > 0.5,
};

const STEPS = Math.round(TOTAL_SCREENS * 50);
const everywhere = (reduced: boolean) => Array.from({ length: STEPS + 1 }, (_, i) => i / STEPS).map((p) => ({ p, sights: sightsAt(p, STATE, reduced) }));

describe('what the scroll brings that sounds', () => {
  it('sounds only cues of the score', () => {
    for (const sight of SIGHTS) expect(CUES).toContain(SIGHT_CUE[sight]);
    expect(SIGHT_CUE.blackout).toBe('switch');
    expect(SIGHT_CUE.flicker).toBe('switch');
    expect(SIGHT_CUE['lights-on']).toBe('lights-on');
    expect(SIGHT_CUE.signs).toBe('sign');
  });

  it.each([false, true])('sounds only what the stage shows (reduced motion: %s)', (reduced) => {
    for (const { p, sights } of everywhere(reduced)) {
      for (const sight of sights) {
        for (const portrait of [false, true]) expect(SHOWS[sight](stageAt(p, STATE, portrait, reduced)), `${sight} at ${(p * TOTAL_SCREENS).toFixed(2)}`).toBe(true);
      }
    }
  });

  it('comes in the film’s order, one at a time: no two stretches overlap', () => {
    const spans = SIGHTS.map((sight) => SIGHT_SPANS[sight]);
    for (const [from, to] of spans) expect(to).toBeGreaterThan(from);
    for (let i = 1; i < spans.length; i++) expect(spans[i]?.[0]).toBeGreaterThanOrEqual(spans[i - 1]?.[1] ?? Infinity);
    for (const { sights } of everywhere(false)) expect(sights.size).toBeLessThanOrEqual(1);
  });

  it('shows every sight to whoever scrolls with motion', () => {
    const seen = new Set(everywhere(false).flatMap(({ sights }) => [...sights]));
    expect([...seen].sort()).toEqual([...SIGHTS].sort());
  });

  it('with reduced motion, does not sound the blackout and the flicker its cuts skip', () => {
    const seen = new Set(everywhere(true).flatMap(({ sights }) => [...sights]));
    expect(seen.has('blackout')).toBe(false);
    expect(seen.has('flicker')).toBe(false);
  });

  it('turns the signs on with the scroll while a figure is not guessed, once for both', () => {
    const at = everywhere(false).find(({ sights }) => sights.has('signs'))?.p;
    if (at === undefined) throw new Error('the signs never turn on');
    expect(sightsAt(at, { guesses: { same: 40 } }, false).has('signs')).toBe(true);
    expect(sightsAt(at, { guesses: { switched: 40 } }, false).has('signs')).toBe(true);
    // Both guessed: both figures are on already, and nothing turns on with the scroll.
    expect(sightsAt(at, { guesses: { same: 40, switched: 60 } }, false).has('signs')).toBe(false);
  });

  it('sounds a sight as it comes into view, once a visit', () => {
    const none = new Set<Sight>();
    const dark = new Set<Sight>(['blackout']);
    expect(comingIntoView(none, dark, none)).toEqual(['blackout']);
    // Still in view on the next frame: it does not sound again.
    expect(comingIntoView(dark, dark, none)).toEqual([]);
    // Back in view later in the visit, once it has sounded: nothing.
    expect(comingIntoView(none, dark, dark)).toEqual([]);
  });
});
