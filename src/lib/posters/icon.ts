/**
 * The icon a phone keeps when the page is added to its home screen (`apple-touch-icon`, point 13 of
 * the external review), and the same drawing at the sizes a search engine asks for: the tab's icon
 * (public/favicon.svg), the circle and the square tied by the golden thread, on the film's dawn sky.
 * A phone does not draw transparency, and the icon is cropped to a circle on a light or dark ground,
 * so the sky fills the whole square. The drawing sits inside that circle. Rendered to PNG at build
 * time, as the posters are.
 */
import { FILM, LIGHT_POINTS } from '../design/film';

/** The icon's size in px: what iOS asks for. */
export const TOUCH_ICON = 180;

/** The PNG favicons, in px: square, and a multiple of 48, which is what Google asks for. */
export const FAVICON_PNG = [48, 96] as const;

/** The drawing of public/favicon.svg, in its own viewBox (-40 -40 80 80). */
export const ICON_SHAPES = [
  `<path d="M-13 1 C-6 -24 8 -24 15 -3" fill="none" stroke="${FILM['thread-edge']}" stroke-width="10" stroke-linecap="round"/>`,
  `<path d="M-13 1 C-6 -24 8 -24 15 -3" fill="none" stroke="${FILM.thread}" stroke-width="6" stroke-linecap="round"/>`,
  `<circle cx="-20" cy="12" r="15" fill="${FILM.you}" stroke="${FILM.ink}" stroke-width="5"/>`,
  `<rect x="6" y="-3" width="30" height="30" rx="6" fill="${FILM.other}" stroke="${FILM.ink}" stroke-width="5"/>`,
] as const;

/**
 * The icon as SVG, `size` px on a side: the drawing a little smaller than the square, centred on
 * the dawn sky. One drawing for every size; the viewBox is what leaves the margin.
 */
export function touchIconSvg(size = TOUCH_ICON): string {
  const dawn = LIGHT_POINTS[0]!.colours;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-56 -56 112 112">`,
    `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dawn['sky-top']}"/><stop offset="1" stop-color="${dawn['sky-bottom']}"/></linearGradient></defs>`,
    '<rect x="-56" y="-56" width="112" height="112" fill="url(#sky)"/>',
    `<g transform="translate(0 2)">${ICON_SHAPES.join('')}</g>`,
    '</svg>',
  ].join('');
}
