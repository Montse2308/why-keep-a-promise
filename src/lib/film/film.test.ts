import { describe, expect, it } from 'vitest';
import { ANCHOR, frame, isPortrait, viewBoxAttribute, type Shot } from './camera';
import { spanAt, spans, totalScreens, within } from './spans';
import { parseHex } from '../design/color';
import { easeInOut, mixHex, progress, sample, steepestColourRate, track } from './track';

describe('easing and spans of the scroll', () => {
  it('eases from rest to rest, symmetrically', () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(0.5)).toBe(0.5);
    expect(easeInOut(0.25) + easeInOut(0.75)).toBeCloseTo(1, 12);
    expect(easeInOut(-1)).toBe(0);
    expect(easeInOut(2)).toBe(1);
  });

  it('measures progress through a span and clamps outside it', () => {
    expect(progress(0.3, 0.2, 0.4)).toBeCloseTo(0.5, 12);
    expect(progress(0.1, 0.2, 0.4)).toBe(0);
    expect(progress(0.9, 0.2, 0.4)).toBe(1);
    expect(() => progress(0.5, 0.4, 0.4)).toThrow();
  });
});

describe('tracks', () => {
  const numbers = track([
    { at: 0, value: 10 },
    { at: 0.5, value: 20 },
    { at: 1, value: 0 },
  ]);

  it('holds the first and last values outside the keyframes', () => {
    const late = track([{ at: 0.2, value: 1 }, { at: 0.8, value: 3 }]);
    expect(sample(late, 0)).toBe(1);
    expect(sample(late, 1)).toBe(3);
  });

  it('passes through every keyframe and eases between them', () => {
    expect(sample(numbers, 0)).toBe(10);
    expect(sample(numbers, 0.5)).toBe(20);
    expect(sample(numbers, 1)).toBe(0);
    expect(sample(numbers, 0.25)).toBeCloseTo(15, 12);
    expect(sample(numbers, 0.125)).toBeLessThan(12.5);
  });

  it('mixes colours in OKLCH: exact at the ends, grey stays grey, and opposite hues keep their colour', () => {
    expect(mixHex('#ff0000', '#0000ff', 0)).toBe('#ff0000');
    expect(mixHex('#ff0000', '#0000ff', 1)).toBe('#0000ff');
    const grey = parseHex(mixHex('#000000', '#ffffff', 0.5));
    expect(new Set(grey).size).toBe(1);
    expect(grey[0]).toBeGreaterThan(90);
    expect(grey[0]).toBeLessThan(110);
    expect(sample(track([{ at: 0, value: '#000000' }, { at: 1, value: '#ffffff' }]), 0.5)).toBe(mixHex('#000000', '#ffffff', 0.5));
    // Halfway from pink to sky blue: channel by channel it would be a grey; by hue, a lavender.
    const [r, g, b] = parseHex(mixHex('#f6b3c0', '#9ed0ff', 0.5));
    expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeGreaterThan(30);
    expect(b).toBeGreaterThan(g);
  });

  it('rejects tracks that are empty, out of order, out of range or mixed', () => {
    expect(() => track([])).toThrow();
    expect(() => track([{ at: 0.5, value: 1 }, { at: 0.5, value: 2 }])).toThrow();
    expect(() => track([{ at: 1.2, value: 1 }])).toThrow();
    expect(() => track([{ at: 0, value: '#fff' }])).toThrow();
    expect(() => track<number | string>([{ at: 0, value: 1 }, { at: 1, value: '#ffffff' }])).toThrow();
  });

  it('flags a colour cut as a steep rate', () => {
    const gentle = track([{ at: 0, value: '#ffc58f' }, { at: 0.3, value: '#9ed0ff' }]);
    const cut = track([{ at: 0, value: '#ffc58f' }, { at: 0.001, value: '#0b0e14' }]);
    expect(steepestColourRate(cut)).toBeGreaterThan(100 * steepestColourRate(gentle));
  });
});

describe('camera', () => {
  const shot: Shot = { cx: 800, cy: 500, width: 1200, widthPortrait: 600 };

  it('fills a landscape screen with the shot width, anchored a bit above the middle', () => {
    const box = frame(shot, { width: 1440, height: 900 });
    expect(box.width).toBe(1200);
    expect(box.height).toBeCloseTo(750, 9);
    expect(box.x).toBe(200);
    expect(box.y + box.height * ANCHOR.landscape).toBeCloseTo(500, 9);
  });

  it('shows a phone the closer shot, higher up, above the caption card', () => {
    expect(isPortrait({ width: 360, height: 740 })).toBe(true);
    const box = frame(shot, { width: 360, height: 740 });
    expect(box.width).toBe(600);
    expect(box.height).toBeCloseTo((600 * 740) / 360, 9);
    expect(box.y + box.height * ANCHOR.portrait).toBeCloseTo(500, 9);
  });

  it('moves up to keep a shot’s top in view on a wide, short screen, and never down', () => {
    const tall = frame({ ...shot, top: 100 }, { width: 1440, height: 900 });
    expect(tall.y).toBeLessThanOrEqual(100);
    const short = frame({ ...shot, top: 100 }, { width: 1440, height: 500 });
    expect(short.y).toBe(100);
    expect(frame({ ...shot, top: 100 }, { width: 1440, height: 500 }).height).toBe(frame(shot, { width: 1440, height: 500 }).height);
    expect(frame({ ...shot, top: 5000 }, { width: 1440, height: 500 })).toEqual(frame(shot, { width: 1440, height: 500 }));
  });

  it('refuses a screen without a size and prints a compact viewBox', () => {
    expect(() => frame(shot, { width: 0, height: 900 })).toThrow();
    expect(viewBoxAttribute({ x: 200, y: 155.00001, width: 1200, height: 750 })).toBe('200 155 1200 750');
  });
});

describe('chapter spans', () => {
  const lengths = [
    { id: 'a', screens: 2 },
    { id: 'b', screens: 6 },
    { id: 'c', screens: 2 },
  ] as const;
  const all = spans(lengths);

  it('shares the scroll in order, without gaps, from 0 to exactly 1', () => {
    expect(all.map((s) => s.id)).toEqual(['a', 'b', 'c']);
    expect(all[0]?.from).toBe(0);
    expect(all.at(-1)?.to).toBe(1);
    all.slice(1).forEach((span, i) => expect(span.from).toBe(all[i]?.to));
    expect(all[1]?.to).toBeCloseTo(0.8, 12);
    expect(totalScreens(lengths)).toBe(10);
  });

  it('finds the chapter at a scroll position and the progress within it', () => {
    expect(spanAt(all, 0).id).toBe('a');
    expect(spanAt(all, 0.5).id).toBe('b');
    expect(spanAt(all, 1).id).toBe('c');
    const b = spanAt(all, 0.5);
    expect(within(b, 0.5)).toBeCloseTo(0.5, 12);
  });

  it('refuses chapters without length', () => {
    expect(() => spans([])).toThrow();
    expect(() => spans([{ id: 'a', screens: 0 }])).toThrow();
  });
});
