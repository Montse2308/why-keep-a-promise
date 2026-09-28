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

/** Mixes two `#rrggbb` colours channel by channel. */
export function mixHex(from: string, to: string, t: number): string {
  const a = parseHex(from);
  const b = parseHex(to);
  return toHex([lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]);
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
