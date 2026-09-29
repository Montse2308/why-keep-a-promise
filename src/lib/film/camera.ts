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

export interface ViewBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Narrower than this ratio (width / height), a screen counts as portrait. */
export const PORTRAIT_BELOW = 0.9;

/**
 * Where the shot's centre sits on screen, from the top: higher on a phone, where the caption card
 * covers the lower part of the screen.
 */
export const ANCHOR = { landscape: 0.46, portrait: 0.36 } as const;

export function isPortrait(viewport: Viewport): boolean {
  return viewport.width / viewport.height < PORTRAIT_BELOW;
}

/**
 * The viewBox that shows `shot` on `viewport`: the shot's width fills the screen, the height follows
 * the screen's shape, and the centre sits at the anchor. The world is drawn wide and tall enough
 * that any screen shape only shows more sky and floor.
 */
export function frame(shot: Shot, viewport: Viewport): ViewBox {
  if (!(viewport.width > 0 && viewport.height > 0)) throw new Error('The viewport needs a size');
  const portrait = isPortrait(viewport);
  const width = portrait ? shot.widthPortrait : shot.width;
  const height = (width * viewport.height) / viewport.width;
  const anchor = portrait ? ANCHOR.portrait : ANCHOR.landscape;
  const y = shot.cy - height * anchor;
  return { x: shot.cx - width / 2, y: shot.top === undefined ? y : Math.min(y, shot.top), width, height };
}

export const viewBoxAttribute = (box: ViewBox): string =>
  [box.x, box.y, box.width, box.height].map((n) => Number(n.toFixed(2))).join(' ');
