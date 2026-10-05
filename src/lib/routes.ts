import { DEFAULT_LOCALE, isLocale, type Locale } from './locales';

/** The notebook's pages (ADR 0024), in its order (src/lib/notebook.ts). */
export const SUBPAGES = ['dilemma', 'vanberg', 'finding', 'how-its-built', 'sources', 'about'] as const;
export type Subpage = (typeof SUBPAGES)[number];
export type Route = 'home' | Subpage;
export const ROUTES: readonly Route[] = ['home', ...SUBPAGES];

/** Normalises a base path to "/" or "/segment/". */
export function normalizeBase(base: string): string {
  const trimmed = base.trim().replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? '/' : `/${trimmed}/`;
}

/**
 * Builds an internal URL that respects the configured `base`.
 * Every internal link in the site goes through this function (or `href`).
 */
export function buildHref(base: string, locale: Locale, route: Route, hash?: string): string {
  const localeSegment = locale === DEFAULT_LOCALE ? '' : `${locale}/`;
  const routeSegment = route === 'home' ? '' : `${route}/`;
  const fragment = hash ? `#${hash.replace(/^#/, '')}` : '';
  return `${normalizeBase(base)}${localeSegment}${routeSegment}${fragment}`;
}

/** `buildHref` bound to Astro's `base` (`import.meta.env.BASE_URL`). */
export function href(locale: Locale, route: Route, hash?: string): string {
  return buildHref(import.meta.env.BASE_URL, locale, route, hash);
}

/** Absolute URL for canonical and hreflang tags. */
export function absoluteHref(site: URL | string, locale: Locale, route: Route): string {
  return new URL(href(locale, route), site).href;
}

/** URL for a file in `public/`, respecting `base`. */
export function assetHref(path: string): string {
  return `${normalizeBase(import.meta.env.BASE_URL)}${path.replace(/^\/+/, '')}`;
}

/**
 * The route a path of this site leads to, in either locale, or null when it leads elsewhere: a
 * file, a page that does not exist, or outside `base`.
 */
export function routeOf(base: string, pathname: string): Route | null {
  const root = normalizeBase(base);
  if (`${pathname}/` === root) return 'home';
  if (!pathname.startsWith(root)) return null;
  const segments = pathname.slice(root.length).split('/').filter(Boolean);
  const [first] = segments;
  if (first !== undefined && first !== DEFAULT_LOCALE && isLocale(first)) segments.shift();
  if (segments.length === 0) return 'home';
  const [page] = segments;
  return segments.length === 1 && (SUBPAGES as readonly string[]).includes(page ?? '') ? (page as Subpage) : null;
}
