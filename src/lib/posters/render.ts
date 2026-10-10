/**
 * Turns a page's poster into PNG at build time, with @resvg/resvg-js (ADR 0025: a dev dependency;
 * the visitor never downloads it). Only the endpoints in src/pages/ (the posters and the touch icon)
 * and the tests use it.
 * The renderer reads TrueType, not woff2, so the posters have their own static cuts of the site's
 * faces (src/assets/fonts/posters/); nothing on the system is read.
 */
import { Resvg } from '@resvg/resvg-js';
import { WORKING_PAPER } from '../../config';
import { stepLine } from '../curve/chart';
import { payoffLevels } from '../curve/curve';
import { CURVE } from '../curve/data';
import { findingUnlocked } from '../lock';
import { t } from '../i18n';
import type { Locale } from '../locales';
import { notebookPage } from '../notebook';
import type { Route } from '../routes';
import { posterFontPath, readPosterFont } from './fonts.mjs';
import { TOUCH_ICON, touchIconSvg } from './icon';
import { readMetrics, type FontMetrics } from './metrics';
import { layout, POSTER, POSTER_FONTS, posterSvg, type PosterChart, type PosterFont, type PosterLayout, type PosterText } from './poster';

const fontFile = (font: PosterFont) => posterFontPath(POSTER_FONTS[font].file);

let metrics: Record<PosterFont, FontMetrics> | null = null;

/** The advance widths of each poster face, read once. */
export function posterMetrics(): Record<PosterFont, FontMetrics> {
  metrics ??= Object.fromEntries((Object.keys(POSTER_FONTS) as PosterFont[]).map((font) => [font, readMetrics(readPosterFont(POSTER_FONTS[font].file))])) as Record<PosterFont, FontMetrics>;
  return metrics;
}

/**
 * What a page's poster says: the project's name, the page's title (with the site's question under a
 * notebook page's) and the author's signature (ADR 0032). Behind the lock, /finding's says its own line
 * under its title instead (ADR 0037).
 */
export function posterText(locale: Locale, route: Route, unlocked = false): PosterText {
  const name = t(locale, 'poster.name');
  const author = t(locale, 'author.name');
  if (route === 'home') return { name, title: t(locale, 'site.title'), author };
  if (route === 'finding' && unlocked) return { name, title: t(locale, notebookPage(route).titleKey), subtitle: t(locale, 'finding.line'), author, long: true };
  return { name, title: t(locale, notebookPage(route).titleKey), subtitle: t(locale, 'site.title'), author };
}

export function posterLayout(locale: Locale, route: Route, unlocked = false): PosterLayout {
  return layout(posterText(locale, route, unlocked), posterMetrics());
}

/** /finding's miniature, from the curve: personal guilt's step and partner-specific commitment's line (ADR 0037). */
export function findingChart(): PosterChart {
  return { personal: stepLine(CURVE.rows, 'personal'), partner: stepLine(CURVE.rows, 'partner'), axis: CURVE.axis, high: payoffLevels(CURVE).at(-1) ?? 0 };
}

export function posterPng(locale: Locale, route: Route): Uint8Array {
  // Behind the lock, /finding's poster carries its line and its miniature (ADR 0034, ADR 0037).
  const unlocked = route === 'finding' && findingUnlocked(WORKING_PAPER.ssrn, import.meta.env.DEV);
  const svg = posterSvg(route, posterLayout(locale, route, unlocked), unlocked ? findingChart() : undefined);
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: POSTER.width },
    font: { loadSystemFonts: false, fontFiles: (Object.keys(POSTER_FONTS) as PosterFont[]).map(fontFile), defaultFontFamily: POSTER_FONTS.label.family },
  });
  return resvg.render().asPng();
}

/** The icon for a phone's home screen (./icon.ts), as PNG; it has no text, so it reads no font. */
export function touchIconPng(): Uint8Array {
  const resvg = new Resvg(touchIconSvg(), { fitTo: { mode: 'width', value: TOUCH_ICON }, font: { loadSystemFonts: false } });
  return resvg.render().asPng();
}
