import { describe, expect, it } from 'vitest';
import { BUILT, chapter, CHAPTERS, LOCKED_BEATS, OPEN_CHAPTERS } from '../chapters';
import { LIGHT_POINTS } from '../design/film';
import { splitAtLock, splitBeats } from './captions';
import { totalScreens } from './spans';
import {
  at,
  beatAt,
  beatRange,
  BEATS,
  BUILT_SCREENS,
  BUILT_SPAN,
  chapterStart,
  lightAt,
  LOCKED_STRETCH,
  OPEN_SCREENS,
  scrollPosition,
  TOTAL_SCREENS,
} from './timeline';
import { spanOf } from './stage';

describe('the timeline, in screens', () => {
  it('turns screens into film positions, and chapters start where their spans do', () => {
    expect(at(0)).toBe(0);
    expect(at(TOTAL_SCREENS)).toBe(1);
    for (const c of CHAPTERS) expect(at(chapterStart(c.id))).toBeCloseTo(spanOf(c.id).from, 12);
  });

  it('lays every built beat end to end, from the top of the film to the end of the built part', () => {
    expect(BEATS[0]?.from).toBe(0);
    BEATS.slice(1).forEach((range, i) => expect(range.from).toBeCloseTo(BEATS[i]?.to ?? -1, 12));
    expect(BEATS.at(-1)?.to).toBeCloseTo(BUILT_SCREENS, 12);
    expect(BEATS).toHaveLength(BUILT.reduce((n, c) => n + c.beats.length, 0));
    expect(BUILT_SPAN.to).toBeCloseTo(at(BUILT_SCREENS), 12);
  });

  it('finds the beat under the top of the screen', () => {
    const first = BEATS[0];
    if (!first) throw new Error('no beats');
    expect(beatAt(0)).toBe(first);
    expect(beatAt(first.to - 0.01)).toBe(first);
    expect(beatAt(BUILT_SCREENS + 10)).toBe(BEATS.at(-1));
    expect(beatRange('arrival', 'ask')).toBe(first);
    expect(() => beatRange('closing', 'nope')).toThrow();
  });

  it('maps the native scroll to the film by the top of the screen', () => {
    const span = { from: 0, to: 0.4 };
    expect(scrollPosition(0, 100, 1000, span)).toBe(0);
    expect(scrollPosition(600, 100, 1000, span)).toBeCloseTo(0.2, 12);
    expect(scrollPosition(5000, 100, 1000, span)).toBe(0.4);
    expect(scrollPosition(300, 100, 0, span)).toBe(0);
    // A beat's stretch of the page is its stretch of the timeline: its top edge maps to its start.
    const height = BUILT_SCREENS * 800;
    for (const range of BEATS) expect(scrollPosition(range.from * 800, 0, height)).toBeCloseTo(at(range.from), 12);
  });
});

describe('captions split by beat', () => {
  const html = '<!-- beat:one -->\n<p>First.</p>\n<!--beat:two-->\n<h3>Second.</h3><p>More.</p>\n';

  it('gives each beat its caption, in order', () => {
    const beats = splitBeats(html, ['one', 'two']);
    expect([...beats.keys()]).toEqual(['one', 'two']);
    expect(beats.get('one')).toBe('<p>First.</p>');
    expect(beats.get('two')).toBe('<h3>Second.</h3><p>More.</p>');
  });

  it('fails when the marks and the beats disagree, or text comes before the first mark', () => {
    expect(() => splitBeats(html, ['two', 'one'])).toThrow();
    expect(() => splitBeats(html, ['one'])).toThrow();
    expect(() => splitBeats(`<p>Stray.</p>${html}`, ['one', 'two'])).toThrow();
    expect(splitBeats('<!-- beat:only -->', ['only']).get('only')).toBe('');
  });
});

describe('the day’s light keeps the open film’s clock (ADR 0026, ADR 0027)', () => {
  const finding = totalScreens(LOCKED_BEATS);

  it('sets chapter 7’s finding at the end of the chapter, right after the sealed envelope', () => {
    expect(LOCKED_STRETCH.from).toBeCloseTo(beatRange('my-research', 'sealed').to, 9);
    expect(LOCKED_STRETCH.to).toBeCloseTo(chapterStart('my-research') + chapter('my-research').screens, 9);
    expect(LOCKED_STRETCH.to - LOCKED_STRETCH.from).toBeCloseTo(finding, 9);
    expect(OPEN_SCREENS).toBeCloseTo(totalScreens(OPEN_CHAPTERS), 9);
    expect(TOTAL_SCREENS).toBeCloseTo(OPEN_SCREENS + finding, 9);
  });

  it('lights every point outside the finding as the open film would, and holds the light inside it', () => {
    for (const screens of [0, 3, 12.5, 29.4, LOCKED_STRETCH.from]) expect(lightAt(screens)).toBeCloseTo(screens / OPEN_SCREENS, 12);
    for (const share of [0.2, 0.5, 0.9]) {
      const inside = LOCKED_STRETCH.from + share * (LOCKED_STRETCH.to - LOCKED_STRETCH.from);
      expect(lightAt(inside)).toBeCloseTo(LOCKED_STRETCH.from / OPEN_SCREENS, 12);
    }
    expect(lightAt(LOCKED_STRETCH.to + 1)).toBeCloseTo((LOCKED_STRETCH.from + 1) / OPEN_SCREENS, 12);
    expect(lightAt(TOTAL_SCREENS)).toBeCloseTo(1, 12);
  });

  it('brings the finding in after nightfall, the day’s last point, so the light it holds is the night’s', () => {
    expect(lightAt(LOCKED_STRETCH.from)).toBeGreaterThan(LIGHT_POINTS.at(-1)?.at ?? 1);
  });
});

describe('captions split at the lock (ADR 0026)', () => {
  it('keeps everything open without a lock mark, and splits at the one mark there is', () => {
    expect(splitAtLock('<p>All open.</p>')).toEqual({ open: '<p>All open.</p>', locked: '' });
    expect(splitAtLock('<p>Open.</p><!-- lock --><p>Locked.</p>')).toEqual({ open: '<p>Open.</p>', locked: '<p>Locked.</p>' });
    expect(() => splitAtLock('<!-- lock --><!--lock-->')).toThrow();
  });
});
