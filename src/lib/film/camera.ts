/**
 * The film's camera (ADR 0025): which part of the SVG world a screen shows. The world is drawn once;
 * the camera only changes the SVG's viewBox, so nothing is laid out again while scrolling.
 */

export interface Shot {
  /** World point the shot is centred on. */
  readonly cx: number;
  readonly cy: number;
  /** World width in view on a landscape screen. */
  readonly width: number;
  /** World width in view on a portrait screen (a phone), where the set is shown closer. */
  readonly widthPortrait: number;
  /**
   * The highest world point the shot must keep in view, if any. On a screen wider and shorter than
   * the shot expects, the view moves up to keep it, and shows less floor instead.
   */
  readonly top?: number;
}

export interface Viewport {
  readonly width: number;
  readonly height: number;
}

/**
 * The part of the screen the cards leave free, in CSS pixels from the screen's top left corner. With
 * the card at the side (a phone held sideways, ADR 0031), it is the screen right of the card.
 */
export interface Area extends Viewport {
  readonly x: number;
  readonly y: number;
  /** The area lies beside a card at the side, not above one at the bottom. */
  readonly beside?: boolean;
}

export interface ViewBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Narrower than this ratio (width / height), a screen counts as portrait. */
export const PORTRAIT_BELOW = 0.9;

/**
 * Where the shot's centre sits in the free area, from the top: higher on a phone, where the caption
 * card covers the lower part of the screen; near the middle beside a card at the side.
 */
export const ANCHOR = { landscape: 0.46, portrait: 0.36, beside: 0.5 } as const;

export function isPortrait(viewport: Viewport): boolean {
  return viewport.width / viewport.height < PORTRAIT_BELOW;
}

/**
 * Whether the free area takes the closer, portrait shot (and the stage its portrait layout): on a
 * narrow screen, and beside a card at the side, where what is left is about as tall as it is wide.
 */
export const isClose = (free: Area): boolean => free.beside === true || isPortrait(free);

/**
 * How much wider than the portrait shot the shot beside a card is: the area left is shorter than a
 * phone held upright, and the board and the cast must both fit in its height.
 */
export const BESIDE_WIDER = 1.3;

/** The whole screen, when no card sits at the side. */
export const wholeScreen = (viewport: Viewport): Area => ({ x: 0, y: 0, width: viewport.width, height: viewport.height });

/**
 * The viewBox that shows `shot` on `viewport`, framed in the `free` area: the shot's width fills the
 * free area, the centre sits at the anchor of its height, and the rest of the screen (behind a card
 * at the side) shows more of the world at the same scale. Whether the shot is the closer one
 * follows the free area (`isClose`), not the screen. The world is drawn wide and tall enough that
 * any screen shape only shows more sky and floor.
 */
export function frame(shot: Shot, viewport: Viewport, free: Area = wholeScreen(viewport)): ViewBox {
  if (!(viewport.width > 0 && viewport.height > 0)) throw new Error('The viewport needs a size');
  if (!(free.width > 0 && free.height > 0)) throw new Error('The free area needs a size');
  const close = isClose(free);
  const shown = free.beside ? shot.widthPortrait * BESIDE_WIDER : close ? shot.widthPortrait : shot.width;
  /** World units per CSS pixel. */
  const unit = shown / free.width;
  const anchor = free.beside ? ANCHOR.beside : close ? ANCHOR.portrait : ANCHOR.landscape;
  const x = shot.cx - (free.x + free.width / 2) * unit;
  const y = shot.cy - (free.y + free.height * anchor) * unit;
  // The shot's top stays in view within the free area, not just within the screen.
  const highest = shot.top === undefined ? y : Math.min(y, shot.top - free.y * unit);
  return { x, y: highest, width: viewport.width * unit, height: viewport.height * unit };
}

export const viewBoxAttribute = (box: ViewBox): string =>
  [box.x, box.y, box.width, box.height].map((n) => Number(n.toFixed(2))).join(' ');
