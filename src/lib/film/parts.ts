/**
 * How each moving part of the stage is placed, as SVG transforms: shared by World.astro, which draws
 * a still frame, and the film's script, which moves the live stage, so both put a part in the same
 * place for the same view.
 */
import type { Face } from '../table/game';
import { BOARD, COIN_STEP } from './board';
import { ENGINE_AT, SHADE, WORLD, type Place } from './stage';
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

/** One of the cast at its place, `lift` units up (the float of a still character). */
export const placeTransform = ({ at: [x, y], scale }: Place, lift = 0): string =>
  `translate(${x.toFixed(2)} ${(y - lift).toFixed(2)})${scale === 1 ? '' : ` scale(${scale.toFixed(4)})`}`;

/** A character's shadow on the ground under it; a character farther off casts it higher and smaller. */
export const shadowTransform = ({ at: [x, y], scale }: Place): string => {
  // At the table the shadow lies on the floor; farther off, on the hill under the character.
  const ground = scale >= 1 ? WORLD.floor + 12 : y + (WORLD.floor + 12 - 496) * scale;
  return `translate(${x.toFixed(2)} ${ground.toFixed(2)}) scale(${scale.toFixed(4)})`;
};

/**
 * A character's eyes, alone in the dark, where its face has them: the triangle's face sits lower and
 * smaller (Character.astro).
 */
export const eyesTransform = (place: Place, kind: 'circle' | 'square' | 'triangle', lift = 0): string =>
  `${placeTransform(place, lift)}${kind === 'triangle' ? ' translate(0 16) scale(0.74)' : ''}`;

/** A voice floats at its place, drawn at the voices' scale, and pops up from a little smaller as it comes. */
export const voiceTransform = ([x, y]: Point, shown: number): string =>
  `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${(VOICE_SCALE * (0.7 + 0.3 * shown)).toFixed(4)})`;

/** The lamp's shade hangs over the table's centre, and comes down from above as night falls. */
export const shadeTransform = (shade: number): string => `translate(${WORLD.centre} ${(SHADE.y - (1 - shade) * SHADE.rise).toFixed(2)})`;

/** How far above the table chapter 7's engine waits before it comes down onto it. */
const ENGINE_RISE = 560;

export const engineTransform = (shown: number): string => `translate(${ENGINE_AT[0]} ${(ENGINE_AT[1] - (1 - shown) * ENGINE_RISE).toFixed(2)})`;

/**
 * The engine's two gears, in its own units: where each turns, its size and how fast it turns
 * against the other, so their teeth mesh.
 */
export const GEARS = [
  { at: [-36, 10], radius: 24, teeth: 9, speed: 1 },
  { at: [2, 22], radius: 16, teeth: 6, speed: -1.5 },
] as const satisfies readonly { at: Point; radius: number; teeth: number; speed: number }[];

export const gearTransform = (gear: (typeof GEARS)[number], turn: number): string =>
  `translate(${gear.at[0]} ${gear.at[1]}) rotate(${((turn * gear.speed) % 360).toFixed(2)})`;

/** A gear's outline: `teeth` square teeth around a wheel of `radius`. */
export function gearPath(radius: number, teeth: number): string {
  const inner = radius - 5;
  const points: string[] = [];
  for (let i = 0; i < teeth * 4; i++) {
    const turn = (i / (teeth * 4)) * 2 * Math.PI;
    const r = i % 4 < 2 ? radius : inner;
    points.push(`${(r * Math.cos(turn)).toFixed(2)} ${(r * Math.sin(turn)).toFixed(2)}`);
  }
  return `M${points.join(' L')} Z`;
}

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
