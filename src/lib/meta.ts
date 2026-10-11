/**
 * What each page says of itself in its head, for search engines and shared links: its language for
 * Open Graph, its description, and the colour a phone tints its browser bar with.
 * The notebook's pages reuse their line in the panel (src/lib/notebook.ts); the home has its own.
 * /finding has no line in the panel. Behind the lock it has a description of its own, the question
 * the page answers, which names the finding's reasons and so is locked content (ADR 0034); while the
 * lock is closed it is a title and the status sentence, and carries the site's question instead.
 * Neither repeats the status sentence (rule (b)).
 */
import { LIGHT_POINTS } from './design/film';
import { PALETTE } from './design/palette';
import { t, type Locale, type UiKey } from './i18n';
import { notebookPage } from './notebook';
import type { Route } from './routes';
import { fill } from './template';

/**
 * Each language as Open Graph names it (language_TERRITORY). The territory says which English and
 * which Spanish the page is written in, nothing about where its author is.
 */
export const OG_LOCALES: Record<Locale, string> = { en: 'en_US', es: 'es_MX' };

/** The key of a page's description. */
export function descriptionKey(route: Route, unlocked: boolean): UiKey {
  if (route === 'home') return 'site.description';
  if (route === 'finding') return unlocked ? 'finding.description' : 'site.title';
  return notebookPage(route).lineKey ?? 'site.title';
}

/** A page's description, as `<meta name="description">` and `og:description` carry it. */
export function description(locale: Locale, route: Route, unlocked: boolean): string {
  return t(locale, descriptionKey(route, unlocked));
}

/**
 * The alternative text of a page's poster (`og:image:alt`): what the poster shows and the title it
 * carries, signed by the author (ADR 0032). Behind the lock, /finding's poster shows its miniature and
 * its line under its title (ADR 0037): its text names them, from the keys the poster draws
 * (`notebook.finding.title`, `finding.line`; src/lib/posters/render.ts). Locked, it is the text of before.
 */
export function posterAlt(locale: Locale, route: Route, title: string, unlocked: boolean): string {
  const author = t(locale, 'author.name');
  if (route === 'finding' && unlocked) {
    return fill(t(locale, 'finding.poster.alt'), { author, title: t(locale, notebookPage(route).titleKey), line: t(locale, 'finding.line') });
  }
  return fill(t(locale, 'poster.alt'), { title, author });
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
