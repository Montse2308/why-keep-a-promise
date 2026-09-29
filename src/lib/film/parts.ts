/**
 * How each moving part of the stage is placed, as SVG transforms: shared by World.astro, which draws
 * a still frame, and the film's script, which moves the live stage, so both put a part in the same
 * place for the same view.
 */
import type { Face } from '../table/game';
import { BOARD, COIN_STEP } from './board';
import { WORLD } from './stage';
import { VOICE_SCALE, type Point } from './voices';

/** Where the bottom coin of each stack sits: just over the characters' heads. */
export const COINS_Y = 404;

/** How far the rooms' bulbs rise out of sight when they are up. */
const BULB_RISE = 560;

/** The wall between the rooms grows up from the floor. */
export const wallTransform = (rooms: number): string =>
  `translate(0 ${WORLD.floor + 8}) scale(1 ${rooms.toFixed(4)}) translate(0 ${-(WORLD.floor + 8)})`;

/** How far in from each character, towards the wall, its room's bulb hangs. */
const BULB_IN = 40;

/** A bulb hangs over one of the cast, a little towards the wall, lowered as the rooms appear. */
export const bulbTransform = (x: number, bulbs: number): string => {
  const inward = x < WORLD.centre ? BULB_IN : -BULB_IN;
  return `translate(${(x + inward).toFixed(2)} ${((1 - bulbs) * -BULB_RISE).toFixed(2)})`;
};

/** The board shows as it comes down, and goes only at the very end of its fold. */
export const boardOpacity = (shown: number, folded: number): number => shown * Math.min(1, Math.max(0, (1 - folded) / 0.3));

/** The board comes down from above as it is shown, and folds flat towards its middle (chapter 3). */
export const boardTransform = (shown: number, folded = 0): string => {
  const middle = BOARD.card.y + BOARD.card.height / 2;
  const drop = `translate(0 ${((1 - shown) * -320).toFixed(2)})`;
  if (folded <= 0) return drop;
  const centre = BOARD.card.x + BOARD.card.width / 2;
  return `${drop} translate(${centre} ${middle}) scale(${(1 - folded * 0.25).toFixed(4)} ${Math.max(0.001, 1 - folded).toFixed(4)}) translate(${-centre} ${-middle})`;
};

export const coinsTransform = (x: number): string => `translate(${x.toFixed(2)} ${COINS_Y})`;

/** The number over a stack of `n` coins sits just above its top coin. */
export const coinCountY = (n: number): number => -Math.max(n, 1) * COIN_STEP - 18;

/** A speech bubble floats beside its speaker's head, on the wall's side, and pops as it appears. */
export const bubbleTransform = (x: number, shown: number): string => {
  const side = x < WORLD.centre ? 1 : -1;
  const scale = 0.6 + 0.4 * shown;
  return `translate(${(x + side * 104).toFixed(2)} 418) scale(${(side * scale).toFixed(3)} ${scale.toFixed(3)})`;
};

/** A voice floats at its place, drawn at the voices' scale, and pops up from a little smaller as it comes. */
export const voiceTransform = ([x, y]: Point, shown: number): string =>
  `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${(VOICE_SCALE * (0.7 + 0.3 * shown)).toFixed(4)})`;

/** The pips of a die face, on a 68-unit die: corners, middles and centre. */
export const PIP_AT = {
  tl: [-14, -14],
  tr: [14, -14],
  ml: [-14, 0],
  c: [0, 0],
  mr: [14, 0],
  bl: [-14, 14],
  br: [14, 14],
} as const satisfies Record<string, readonly [number, number]>;
export type Pip = keyof typeof PIP_AT;

export const PIPS: Record<Face, readonly Pip[]> = {
  1: ['c'],
  2: ['tl', 'br'],
  3: ['tl', 'c', 'br'],
  4: ['tl', 'tr', 'bl', 'br'],
  5: ['tl', 'tr', 'c', 'bl', 'br'],
  6: ['tl', 'tr', 'ml', 'mr', 'bl', 'br'],
};
