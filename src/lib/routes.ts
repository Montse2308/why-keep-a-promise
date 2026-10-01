import { DEFAULT_LOCALE, type Locale } from './locales';

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
