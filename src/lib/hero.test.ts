import { describe, expect, it } from 'vitest';
import { CHAPTER_IDS, OPEN_CHAPTERS } from './chapters';
import { deltaE, parseHex, toLab } from './design/color';
import { frame, isClose, wholeScreen, type Area, type Viewport } from './film/camera';
import { stageAt } from './film/stage';
import { COVER_PAGES, COVER_SKY, DOORS, dawnSkyAt } from './hero';
import { linkable } from './notebook';

const distance = (a: string, b: string) => deltaE(toLab(parseHex(a)), toLab(parseHex(b)));

describe('the home’s cover (ADR 0036)', () => {
  it('has a door to each part of the page, in order: the story, the research, the notebook', () => {
    expect(DOORS.map((door) => door.id)).toEqual(['story', 'research', 'notebook']);
  });

  it('opens the story at the film’s first chapter and the research at chapter 7, which a locked film shows too', () => {
    expect(DOORS[0]?.chapter).toBe(CHAPTER_IDS[0]);
    expect(DOORS[1]?.chapter).toBe('my-research');
    expect(OPEN_CHAPTERS.some((c) => c.id === 'my-research' && c.beats.length > 0)).toBe(true);
    expect(DOORS[2]?.chapter).toBeNull();
  });

  it('links the same notebook pages in either state of the lock: never /finding', () => {
    expect(COVER_PAGES.map((entry) => entry.page)).toEqual(linkable(false).map((entry) => entry.page));
    expect(COVER_PAGES.some((entry) => entry.page === 'finding')).toBe(false);
  });

  it('starts in the dawn’s sky and ends in the colour the stage begins with, on any screen (ADR 0027: no cuts)', () => {
    const first = stageAt(0, { promised: null }, false, false);
    expect(COVER_SKY.top).toBe(first.light['sky-top']);
    expect(COVER_SKY.glow).toBe(first.light['sky-bottom']);
    const sideways: Viewport = { width: 844, height: 390 };
    const beside: Area = { x: 390, y: 64, width: 454, height: 326, beside: true };
    const screens: [Viewport, Area | undefined][] = [
      [{ width: 1440, height: 900 }, undefined],
      [{ width: 1024, height: 768 }, undefined],
      [{ width: 360, height: 800 }, undefined],
      [{ width: 320, height: 640 }, undefined],
      [sideways, beside],
    ];
    for (const [viewport, free] of screens) {
      const view = stageAt(0, { promised: null }, isClose(free ?? wholeScreen(viewport)), false);
      const top = frame(view.shot, viewport, free).y;
      expect(distance(COVER_SKY.foot, dawnSkyAt(top))).toBeLessThan(1);
    }
  });

  it('paints the sky as the world does: sky-top above, sky-bottom below', () => {
    expect(dawnSkyAt(-1e6)).toBe(COVER_SKY.top);
    expect(dawnSkyAt(1e6)).toBe(COVER_SKY.glow);
  });
});
