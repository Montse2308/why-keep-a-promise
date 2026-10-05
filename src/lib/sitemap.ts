/**
 * The sitemap (point 13 of the external review): every page in both languages, each with its
 * alternates, as the pages' own hreflang links name them. While the lock is closed it leaves /finding
 * out, as every link does (ADR 0026), and `npm run verify:dist` checks that. The 404 page is never in
 * it. No robots.txt points to it: a project site does not sit at the root of its domain, where search
 * engines look for one, so a search engine learns of the sitemap only if it is handed to it by hand.
 */
import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales';
import { linkable } from './notebook';
import { buildHref, type Route } from './routes';

/** The routes the sitemap lists in this state of the lock, in the notebook's order after the home. */
export function sitemapRoutes(unlocked: boolean): readonly Route[] {
  return ['home', ...linkable(unlocked).map((entry) => entry.page)];
}

const escapeXml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The sitemap as XML, with absolute URLs under `site` and `base`. */
export function sitemapXml(site: URL | string, base: string, unlocked: boolean): string {
  const url = (locale: Locale, route: Route) => escapeXml(new URL(buildHref(base, locale, route), site).href);
  const entries = sitemapRoutes(unlocked).flatMap((route) =>
    LOCALES.map((locale) =>
      [
        '  <url>',
        `    <loc>${url(locale, route)}</loc>`,
        ...LOCALES.map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt}" href="${url(alt, route)}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${url(DEFAULT_LOCALE, route)}"/>`,
        '  </url>',
      ].join('\n'),
    ),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}
