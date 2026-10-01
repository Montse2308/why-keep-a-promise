import { describe, expect, it } from 'vitest';
import { LIGHT, LIGHT_POINTS, MIN_SKY_COLOUR } from '../design/film';
import { colourfulness, dawnToMorning, DAY_SWATCHES, filmSky, mixByChannel, mixByHue, positions, skyAt } from './day';
import { sample } from './track';

describe("/how-its-built's demonstration of the scene engine", () => {
  it('samples evenly from the first frame to the last', () => {
    expect(positions(3)).toEqual([0, 0.5, 1]);
    expect(positions()).toHaveLength(DAY_SWATCHES);
    expect(() => positions(1)).toThrow();
  });

  it("paints the film's sky with the film's own track, from dawn to nightfall", () => {
    const sky = filmSky();
    expect(sky[0]).toBe(skyAt('dawn'));
    expect(sky.at(-1)).toBe(skyAt('nightfall'));
    expect(sky).toEqual(positions().map((p) => sample(LIGHT['sky-top'], p)));
  });

  it('never lets the sky go grey, at any swatch', () => {
    for (const colour of filmSky(4 * DAY_SWATCHES)) expect(colourfulness(colour), colour).toBeGreaterThanOrEqual(MIN_SKY_COLOUR['sky-top']);
  });

  it('shows why the day has a sunrise: dawn to morning by channel turns grey, by hue it stays a colour', () => {
    const { channel, hue } = dawnToMorning();
    expect(Math.min(...channel.map(colourfulness))).toBeLessThan(MIN_SKY_COLOUR['sky-top']);
    expect(Math.min(...hue.map(colourfulness))).toBeGreaterThanOrEqual(MIN_SKY_COLOUR['sky-top']);
    // Both strips start and end on the same two light points; only the way between them differs.
    for (const strip of [channel, hue]) {
      expect(strip[0]).toBe(skyAt('dawn'));
      expect(strip.at(-1)).toBe(skyAt('morning'));
    }
  });

  it('mixes the two ways from the same ends', () => {
    expect(mixByChannel('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(mixByHue('#ff0000', '#0000ff', 0)).toBe('#ff0000');
    expect(mixByHue('#ff0000', '#0000ff', 1)).toBe('#0000ff');
  });

  it('names a real light point, between dawn and morning a sunrise', () => {
    const names = LIGHT_POINTS.map((point) => point.name);
    expect(names.indexOf('sunrise')).toBe(names.indexOf('dawn') + 1);
    expect(names.indexOf('morning')).toBe(names.indexOf('sunrise') + 1);
    expect(() => skyAt('midnight')).toThrow();
  });
});
