/**
 * The posters a link shows when it is shared (ADR 0025): one per page and per language, drawn in
 * SVG with the film's palette and turned into PNG at build time (src/pages/posters/), because
 * LinkedIn and other networks do not take SVG for Open Graph. A poster is a piece of the stage in the
 * day's light: a paper card with the project's name (ADR 0021: «I promise» / «Te lo prometo») and
 * the page's title, and the circle and the square tied by the golden thread. It carries nothing else:
 * no status sentence, nothing behind the lock (ADR 0026), no figure.
 *
 * The renderer does not wrap text, so titles are broken into lines here, measured with the fonts'
 * own advance widths (./metrics.ts), at the largest size that fits the card.
 */
import { FILM, LIGHT_POINTS, type LightPoint } from '../design/film';
import { FACES, type Mood } from '../film/faces';
import { threadBetween } from '../film/stage';
import type { Locale } from '../locales';
import type { Route } from '../routes';
import { lineWidth, type FontMetrics } from './metrics';

export const POSTER = { width: 1200, height: 630 } as const;

/** Where a page's poster is published, under the site's base. */
export function posterPath(locale: Locale, route: Route): string {
  return `posters/${locale}/${route}.png`;
}

/**
 * The faces a poster sets its text in, by the family names the files carry: the static instances
 * Fontsource cuts from the variable fonts name Nunito's family «Nunito ExtraLight», whatever the
 * weight (src/assets/fonts/posters/README.md).
 */
export const POSTER_FONTS = {
  title: { file: 'fraunces-latin-900-italic.ttf', family: 'Fraunces', weight: 900, style: 'italic' },
  subtitle: { file: 'fraunces-latin-800-normal.ttf', family: 'Fraunces', weight: 800, style: 'normal' },
  label: { file: 'nunito-latin-800-normal.ttf', family: 'Nunito ExtraLight', weight: 800, style: 'normal' },
} as const;
export type PosterFont = keyof typeof POSTER_FONTS;

/** Each page's hour of the film's day, and the cast's moods on its poster. */
export const POSTER_SCENES: Record<Route, { light: LightPoint['name']; you: Mood; other: Mood }> = {
  home: { light: 'sunrise', you: 'happy', other: 'happy' },
  dilemma: { light: 'morning', you: 'tempted', other: 'tempted' },
  vanberg: { light: 'noon', you: 'worried', other: 'neutral' },
  finding: { light: 'nightfall', you: 'proud', other: 'happy' },
  'how-its-built': { light: 'afternoon', you: 'neutral', other: 'happy' },
  sources: { light: 'sunset', you: 'happy', other: 'neutral' },
  about: { light: 'dawn', you: 'happy', other: 'proud' },
};

export interface PosterText {
  /** The project's name, set small above the title. */
  readonly name: string;
  readonly title: string;
  /** The site's question under a notebook page's title; none on the home, whose title it is. */
  readonly subtitle?: string;
}

/** The card's text box, in poster pixels. */
export const CARD = { x: 56, y: 56, width: 648, height: 518, padding: 52 } as const;
const TEXT_X = CARD.x + CARD.padding;
const TEXT_WIDTH = CARD.width - 2 * CARD.padding;
const LABEL = { size: 26, spacing: 4.5, y: CARD.y + CARD.padding + 26 } as const;
const TITLE = { top: LABEL.y + 74, sizes: [84, 78, 72, 68, 64, 60, 56, 52, 48], leading: 1.08 } as const;
const SUBTITLE = { size: 28, leading: 1.25, maxLines: 2, bottom: CARD.y + CARD.height - CARD.padding } as const;

/** Breaks a text into lines no wider than `width`, word by word. A word wider than the line stays whole. */
export function wrap(text: string, width: number, metrics: FontMetrics, size: number, letterSpacing = 0): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.trim().split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && lineWidth(next, metrics, size, letterSpacing) > width) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export interface Fitted {
  readonly size: number;
  readonly lines: readonly string[];
}

/**
 * Breaks a text into as few lines as `wrap` does, but as even as they can be (CSS's `text-wrap:
 * balance`): the narrowest width that still needs no more lines, so no word is left alone at the end.
 */
export function balance(text: string, width: number, metrics: FontMetrics, size: number): string[] {
  const greedy = wrap(text, width, metrics, size);
  let low = 0;
  let high = width;
  while (high - low > 1) {
    const mid = (low + high) / 2;
    const lines = wrap(text, mid, metrics, size);
    if (lines.length <= greedy.length && lines.every((line) => lineWidth(line, metrics, size) <= mid)) high = mid;
    else low = mid;
  }
  return wrap(text, high, metrics, size);
}

/** The largest size, of those given, at which the text fits in `maxLines` lines of `width`; null if none. */
export function fit(text: string, width: number, metrics: FontMetrics, sizes: readonly number[], maxLines: number): Fitted | null {
  for (const size of sizes) {
    const lines = wrap(text, width, metrics, size);
    if (lines.length <= maxLines && lines.every((line) => lineWidth(line, metrics, size) <= width)) return { size, lines: balance(text, width, metrics, size) };
  }
  return null;
}

/** The lines of a poster, set: what the tests check fits the card, and what the SVG draws. */
export interface PosterLayout {
  readonly label: string;
  readonly title: Fitted;
  readonly titleTop: number;
  readonly subtitle: Fitted | null;
}

export function layout(text: PosterText, metrics: Record<PosterFont, FontMetrics>): PosterLayout {
  const subtitle = text.subtitle ? fit(text.subtitle, TEXT_WIDTH, metrics.subtitle, [SUBTITLE.size], SUBTITLE.maxLines) : null;
  if (text.subtitle && !subtitle) throw new Error(`The poster's subtitle does not fit: "${text.subtitle}"`);
  const subtitleHeight = subtitle ? subtitle.lines.length * SUBTITLE.size * SUBTITLE.leading + 24 : 0;
  const room = SUBTITLE.bottom - subtitleHeight - TITLE.top;
  const title = TITLE.sizes
    .map((size) => fit(text.title, TEXT_WIDTH, metrics.title, [size], Math.floor(room / (size * TITLE.leading))))
    .find((fitted) => fitted !== null);
  if (!title) throw new Error(`The poster's title does not fit: "${text.title}"`);
  const label = text.name.toLocaleUpperCase();
  if (lineWidth(label, metrics.label, LABEL.size, LABEL.spacing) > TEXT_WIDTH) throw new Error(`The poster's name does not fit: "${label}"`);
  return { label, title, titleTop: TITLE.top, subtitle };
}

/** Text as XML character data. */
export function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const fontAttributes = (font: PosterFont) => {
  const { family, weight, style } = POSTER_FONTS[font];
  return `font-family="${family}" font-weight="${weight}" font-style="${style}"`;
};

/**
 * One of the cast as Character.astro cuts it from paper (ADR 0027): an ink contour, a paper rim, the
 * fill, and the face of a mood in ink. A test keeps the two drawings the same.
 */
export function cutout(kind: 'circle' | 'square', mood: Mood, x: number, y: number, scale: number): string {
  const face = FACES[mood];
  const fill = kind === 'circle' ? FILM.you : FILM.other;
  const shape = (paint: string, stroke: string, width: number) =>
    kind === 'circle'
      ? `<circle r="58" fill="${paint}" stroke="${stroke}" stroke-width="${width}"/>`
      : `<rect x="-56" y="-56" width="112" height="112" rx="18" fill="${paint}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`;
  const [lookX, lookY] = face.look;
  const eyes = face.closedEyes
    ? `<path d="M-33 -8 Q-21 -22 -9 -8 M9 -8 Q21 -22 33 -8" fill="none" stroke="${FILM.ink}" stroke-width="5" stroke-linecap="round"/>`
    : `<ellipse cx="-21" cy="-10" rx="14" ry="16" fill="#fff"/><ellipse cx="21" cy="-10" rx="14" ry="16" fill="#fff"/>` +
      `<g transform="translate(${lookX} ${lookY})"><circle cx="-21" cy="-8" r="7" fill="${FILM.ink}"/><circle cx="21" cy="-8" r="7" fill="${FILM.ink}"/>` +
      `<circle cx="-18" cy="-11" r="2.2" fill="#fff"/><circle cx="24" cy="-11" r="2.2" fill="#fff"/></g>`;
  const line = (d: string) => `<path d="${d}" fill="none" stroke="${FILM.ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  const extras = [
    face.blush ? `<g fill="#ff8fa3" opacity="0.6"><ellipse cx="-34" cy="12" rx="9" ry="5"/><ellipse cx="34" cy="12" rx="9" ry="5"/></g>` : '',
    face.sweat ? `<path d="M46 -40 q9 15 0 22 q-9 -7 0 -22z" fill="#8fd3ff" stroke="#fff" stroke-width="3"/>` : '',
    face.tear ? `<path d="M-30 4 q5 10 0 14 q-5 -4 0 -14z" fill="#8fd3ff" stroke="#fff" stroke-width="2"/>` : '',
  ].join('');
  return (
    `<g transform="translate(${x} ${y}) scale(${scale})">` +
    `<g filter="url(#paper)">${shape(FILM.ink, FILM.ink, 13)}${shape(fill, FILM.rim, 7)}</g>` +
    `${eyes}${line(face.brows[0])}${line(face.brows[1])}${line(face.mouth)}${extras}</g>`
  );
}

/** A few stars, for the poster set at nightfall. */
const STARS: readonly (readonly [number, number, number])[] = [
  [760, 70, 3],
  [880, 120, 2.2],
  [1010, 60, 2.6],
  [1130, 140, 3],
  [1080, 230, 2],
  [820, 210, 2.2],
];

/** The poster of a page, as SVG. */
export function posterSvg(route: Route, set: PosterLayout): string {
  const scene = POSTER_SCENES[route];
  const light = LIGHT_POINTS.find((point) => point.name === scene.light);
  if (!light) throw new Error(`No light point "${scene.light}"`);
  const sky = light.colours;
  const { width, height } = POSTER;

  const titleLines = set.title.lines
    .map((line, i) => `<text x="${TEXT_X}" y="${(set.titleTop + set.title.size * (1 + i * TITLE.leading)).toFixed(1)}" font-size="${set.title.size}" ${fontAttributes('title')} letter-spacing="${(-0.015 * set.title.size).toFixed(2)}" fill="${FILM.ink}">${escapeXml(line)}</text>`)
    .join('');
  const subtitleLines = set.subtitle
    ? set.subtitle.lines
        .map((line, i, all) => {
          const y = SUBTITLE.bottom - (all.length - 1 - i) * SUBTITLE.size * SUBTITLE.leading;
          return `<text x="${TEXT_X}" y="${y.toFixed(1)}" font-size="${SUBTITLE.size}" ${fontAttributes('subtitle')} fill="${FILM['card-muted']}">${escapeXml(line)}</text>`;
        })
        .join('')
    : '';
  const stars = scene.light === 'nightfall' ? STARS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff4d6"/>`).join('') : '';
  // The cast in the film's units, tied by the film's own thread, then set on the poster.
  const cast = { at: [865, 452], scale: 1.25, apart: 160 } as const;
  const thread = threadBetween([0, 0], { at: [cast.apart, 0], scale: 1, opacity: 1 });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    '<defs>',
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky['sky-top']}"/><stop offset="1" stop-color="${sky['sky-bottom']}"/></linearGradient>`,
    '<filter id="paper" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#281e3c" flood-opacity="0.25"/></filter>',
    '</defs>',
    `<rect width="${width}" height="${height}" fill="url(#sky)"/>`,
    stars,
    `<path d="M0 470 C 220 410, 420 420, 640 455 S 1000 420, 1200 445 V ${height} H 0 Z" fill="${sky['hill-far']}"/>`,
    `<path d="M0 535 C 260 500, 520 505, 760 528 S 1040 505, 1200 520 V ${height} H 0 Z" fill="${sky['hill-near']}"/>`,
    `<rect y="560" width="${width}" height="${height - 560}" fill="${sky.floor}"/>`,
    `<ellipse cx="${cast.at[0]}" cy="560" rx="62" ry="10" fill="${FILM.ink}" opacity="0.2"/>`,
    `<ellipse cx="${cast.at[0] + cast.apart * cast.scale}" cy="560" rx="62" ry="10" fill="${FILM.ink}" opacity="0.2"/>`,
    `<g transform="translate(${cast.at[0]} ${cast.at[1]}) scale(${cast.scale})">`,
    `<path d="${thread}" fill="none" stroke="${FILM['thread-edge']}" stroke-width="9" stroke-linecap="round"/>`,
    `<path d="${thread}" fill="none" stroke="${FILM.thread}" stroke-width="5" stroke-linecap="round"/>`,
    cutout('circle', scene.you, 0, 0, 1),
    cutout('square', scene.other, cast.apart, 0, 1),
    '</g>',
    `<g filter="url(#paper)"><rect x="${CARD.x}" y="${CARD.y}" width="${CARD.width}" height="${CARD.height}" rx="28" fill="${FILM.card}"/></g>`,
    `<text x="${TEXT_X}" y="${LABEL.y}" font-size="${LABEL.size}" ${fontAttributes('label')} letter-spacing="${LABEL.spacing}" fill="${FILM['thread-edge']}">${escapeXml(set.label)}</text>`,
    `<path d="M${TEXT_X} ${LABEL.y + 22} H ${TEXT_X + 84}" stroke="${FILM.thread}" stroke-width="6" stroke-linecap="round"/>`,
    titleLines,
    subtitleLines,
    '</svg>',
  ].join('');
}
