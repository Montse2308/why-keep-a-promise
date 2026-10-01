/**
 * /how-its-built's small demonstration of the scene engine (ADR 0024): the film's sky, sampled by
 * the same functions the film's script calls on every frame, and the reason the day has a sunrise.
 * From dawn's peach straight to morning's blue, mixing each sRGB channel on its own passes through a
 * dirty grey; turning the hue in OKLCH, as `mixHex` does, passes through pink, as a sunrise does
 * (ADR 0027). Pure: the notebook draws these swatches at build time, with no script.
 */
import { parseHex } from '../design/color';
import { LIGHT, LIGHT_POINTS } from '../design/film';
import { clamp, easeInOut, mixHex, sample } from './track';

/** How many swatches each strip has. */
export const DAY_SWATCHES = 24;

/** `n` evenly spaced positions from 0 to 1, both ends included. */
export function positions(n: number = DAY_SWATCHES): number[] {
  if (n < 2) throw new Error('A strip needs two swatches at least');
  return Array.from({ length: n }, (_, i) => i / (n - 1));
}

/** The top of the film's sky across the whole film, as the film paints it. */
export function filmSky(n: number = DAY_SWATCHES): string[] {
  return positions(n).map((p) => sample(LIGHT['sky-top'], p));
}

const hex = (rgb: readonly number[]) => `#${rgb.map((c) => Math.round(clamp(c, 0, 255)).toString(16).padStart(2, '0')).join('')}`;

/** Two colours mixed channel by channel, eased the way the film eases: what the engine does not do. */
export function mixByChannel(from: string, to: string, t: number): string {
  const [a, b] = [parseHex(from), parseHex(to)];
  const e = easeInOut(t);
  return hex(a.map((c, i) => c + ((b[i] ?? c) - c) * e));
}

/** Two colours mixed by hue, eased the way the film eases: what the engine does. */
export function mixByHue(from: string, to: string, t: number): string {
  return mixHex(from, to, easeInOut(t));
}

/** The light point named `name`, its sky's top colour. */
export function skyAt(name: string): string {
  const point = LIGHT_POINTS.find((candidate) => candidate.name === name);
  if (!point) throw new Error(`No light point "${name}"`);
  return point.colours['sky-top'];
}

/** Dawn straight to morning, with no sunrise between them, mixed both ways. */
export function dawnToMorning(n: number = DAY_SWATCHES): { readonly channel: string[]; readonly hue: string[] } {
  const [dawn, morning] = [skyAt('dawn'), skyAt('morning')];
  return {
    channel: positions(n).map((t) => mixByChannel(dawn, morning, t)),
    hue: positions(n).map((t) => mixByHue(dawn, morning, t)),
  };
}

/** How much colour a swatch keeps: the spread between its strongest and weakest channel, out of 255. */
export function colourfulness(colour: string): number {
  const rgb = parseHex(colour);
  return Math.max(...rgb) - Math.min(...rgb);
}
