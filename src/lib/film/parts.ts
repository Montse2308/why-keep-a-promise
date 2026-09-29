/**
 * How each moving part of the stage is placed, as SVG transforms: shared by World.astro, which draws
 * a still frame, and the film's script, which moves the live stage, so both put a part in the same
 * place for the same view.
 */
import { COIN_STEP } from './board';
import { WORLD } from './stage';

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

/** The board comes down from above as it is shown. */
export const boardTransform = (shown: number): string => `translate(0 ${((1 - shown) * -320).toFixed(2)})`;

export const coinsTransform = (x: number): string => `translate(${x.toFixed(2)} ${COINS_Y})`;

/** The number over a stack of `n` coins sits just above its top coin. */
export const coinCountY = (n: number): number => -Math.max(n, 1) * COIN_STEP - 18;

/** A speech bubble floats beside its speaker's head, on the wall's side, and pops as it appears. */
export const bubbleTransform = (x: number, shown: number): string => {
  const side = x < WORLD.centre ? 1 : -1;
  const scale = 0.6 + 0.4 * shown;
  return `translate(${(x + side * 104).toFixed(2)} 418) scale(${(side * scale).toFixed(3)} ${scale.toFixed(3)})`;
};
