/**
 * What each page says of itself in its head, for search engines and shared links: its language for
 * Open Graph, its description, and the colour a phone tints its browser bar with.
 * The notebook's pages reuse their line in the panel (src/lib/notebook.ts); the home has its own.
 * /finding has no line: it carries the site's question, in both states of the lock, so its
 * description says nothing of the finding and never repeats the status sentence (rule (b)).
 */
import { LIGHT_POINTS } from './design/film';
import { PALETTE } from './design/palette';
import { t, type Locale, type UiKey } from './i18n';
import { notebookPage } from './notebook';
import type { Route } from './routes';

/**
 * Each language as Open Graph names it (language_TERRITORY). The territory says which English and
 * which Spanish the page is written in, nothing about where its author is.
 */
export const OG_LOCALES: Record<Locale, string> = { en: 'en_US', es: 'es_MX' };

/** The key of a page's description. */
export function descriptionKey(route: Route): UiKey {
  if (route === 'home') return 'site.description';
  return notebookPage(route).lineKey ?? 'site.title';
}

/** A page's description, as `<meta name="description">` and `og:description` carry it. */
export function description(locale: Locale, route: Route): string {
  return t(locale, descriptionKey(route));
}

export interface ThemeColor {
  readonly color: string;
  readonly media?: string;
}

/**
 * The page's `theme-color`, the colour of the top of the page: over the film, its dawn sky, which
 * keeps its own light whatever the visitor's theme (ADR 0027); elsewhere, the glow at the top of the
 * notebook's paper, day or night by the visitor's theme.
 */
export function themeColors(film: boolean): readonly ThemeColor[] {
  if (film) return [{ color: LIGHT_POINTS[0]!.colours['sky-top'] }];
  return [
    { color: PALETTE.light.glow, media: '(prefers-color-scheme: light)' },
    { color: PALETTE.dark.glow, media: '(prefers-color-scheme: dark)' },
  ];
}
