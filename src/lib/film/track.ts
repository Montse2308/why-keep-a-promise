/**
 * Animation tracks for the film (ADR 0025): values keyed to the scroll position, from 0 (the top of
 * the film) to 1 (its end). Pure: the client script samples them on every frame, the storyboard
 * samples them once per chapter's key pose, and tests sample them anywhere.
 */
import { deltaE, parseHex, type Rgb } from '../design/color';

export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

/** Quadratic ease-in-out: starts and ends at rest, so no move begins or stops with a jolt. */
export function easeInOut(t: number): number {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
}

/** How far `p` has gone through the span [from, to], from 0 to 1. */
export function progress(p: number, from: number, to: number): number {
  if (!(to > from)) throw new Error(`A span must end after it starts (got ${from}–${to})`);
  return clamp((p - from) / (to - from), 0, 1);
}

export interface Keyframe<T extends number | string> {
  /** Scroll position, from 0 to 1. */
  readonly at: number;
  readonly value: T;
}

/** Keyframes in scroll order; numbers or `#rrggbb` colours, never mixed. */
export type Track<T extends number | string> = readonly Keyframe<T>[];

/** Checks a track once, where it is defined, instead of on every frame. */
export function track<T extends number | string>(frames: Track<T>): Track<T> {
  if (frames.length === 0) throw new Error('A track needs at least one keyframe');
  const kind = typeof frames[0]?.value;
  frames.forEach((frame, i) => {
    if (frame.at < 0 || frame.at > 1) throw new Error(`Keyframe ${i} sits outside 0–1 (at ${frame.at})`);
    if (typeof frame.value !== kind) throw new Error(`Keyframe ${i} mixes numbers and colours`);
    if (typeof frame.value === 'string') parseHex(frame.value);
    const previous = frames[i - 1];
    if (previous && !(frame.at > previous.at)) throw new Error(`Keyframe ${i} is not after keyframe ${i - 1}`);
  });
  return frames;
}

const toHex = (rgb: Rgb): string => `#${rgb.map((c) => Math.round(clamp(c, 0, 255)).toString(16).padStart(2, '0')).join('')}`;

const toLinear = (c: number): number => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const fromLinear = (v: number): number => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.max(v, 0) ** (1 / 2.4) - 0.055);

/** sRGB to OKLab (Ottosson, 2020): a space where equal steps look equal. */
function toOklab(rgb: Rgb): Rgb {
  const [r, g, b] = rgb.map(toLinear) as unknown as Rgb;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromOklab([L, a, b]: Rgb): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

/** OKLab to its polar form: lightness, chroma and hue in radians. */
function toPolar([L, a, b]: Rgb): Rgb {
  return [L, Math.hypot(a, b), Math.atan2(b, a)];
}

/**
 * Mixes two `#rrggbb` colours in OKLCH, turning the hue the short way round. Mixing sRGB channels,
 * or even OKLab, drains the colour between two opposite hues: pink to sky blue passes through grey.
 * Turning the hue passes through lavender instead, as a sunrise does (ADR 0027).
 */
export function mixHex(from: string, to: string, t: number): string {
  if (t <= 0) return toHex(parseHex(from));
  if (t >= 1) return toHex(parseHex(to));
  const [l1, c1, h1] = toPolar(toOklab(parseHex(from)));
  const [l2, c2, h2] = toPolar(toOklab(parseHex(to)));
  // A grey has no hue of its own: it takes the other colour's.
  const start = c1 < 0.02 ? h2 : h1;
  const end = c2 < 0.02 ? h1 : h2;
  let turn = end - start;
  if (turn > Math.PI) turn -= 2 * Math.PI;
  if (turn < -Math.PI) turn += 2 * Math.PI;
  const L = lerp(l1, l2, t);
  const C = lerp(c1, c2, t);
  const H = start + turn * t;
  return toHex(fromOklab([L, C * Math.cos(H), C * Math.sin(H)]));
}

/** The track's value at scroll position `p`, eased between the keyframes around it. */
export function sample<T extends number | string>(frames: Track<T>, p: number): T {
  const first = frames[0];
  const last = frames[frames.length - 1];
  if (!first || !last) throw new Error('A track needs at least one keyframe');
  if (p <= first.at) return first.value;
  if (p >= last.at) return last.value;
  const i = frames.findIndex((frame) => frame.at >= p);
  const from = frames[i - 1] ?? first;
  const to = frames[i] ?? last;
  const t = easeInOut((p - from.at) / (to.at - from.at));
  if (typeof from.value === 'number') return lerp(from.value, to.value as number, t) as T;
  return mixHex(from.value as string, to.value as string, t) as T;
}

/**
 * The steepest colour change of a track: the largest ΔE*ab between two consecutive keyframes,
 * divided by the share of the scroll they span. A cut shows up as a huge rate; the light test caps
 * it (ADR 0027: no colour cuts).
 */
export function steepestColourRate(frames: Track<string>): number {
  let steepest = 0;
  for (let i = 1; i < frames.length; i++) {
    const from = frames[i - 1];
    const to = frames[i];
    if (!from || !to) continue;
    const rate = deltaE(parseHex(from.value), parseHex(to.value)) / (to.at - from.at);
    steepest = Math.max(steepest, rate);
  }
  return steepest;
}
