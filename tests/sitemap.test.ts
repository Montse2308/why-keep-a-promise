import { describe, expect, it } from 'vitest';
import endpoint from '../src/pages/sitemap.xml.ts?raw';
import { sitemapRoutes, sitemapXml } from '../src/lib/sitemap';
import { ROUTES } from '../src/lib/routes';
import { sitemapProblems } from '../scripts/verify-dist.mjs';

const SITE = 'https://montse2308.github.io';
const BASE = '/why-keep-a-promise';
const ROOT = `${SITE}${BASE}/`;

/** The pages of a built site, as verify:dist reads them: the English home names the root. */
function builtPages(withFinding: boolean): Record<string, string> {
  const routes = ROUTES.filter((route) => withFinding || route !== 'finding');
  const paths = routes.flatMap((route) => {
    const path = route === 'home' ? '' : `${route}/`;
    return [`${path}index.html`, `es/${path}index.html`];
  });
  return Object.fromEntries([...paths, '404.html'].map((path) => [path, path === 'index.html' ? `<link rel="canonical" href="${ROOT}">` : '<p>page</p>']));
}

describe('the sitemap (point 13 of the external review)', () => {
  it('lists the home and the notebook, /finding only behind the lock', () => {
    expect(sitemapRoutes(true)).toEqual(ROUTES);
    expect(sitemapRoutes(false)).toEqual(ROUTES.filter((route) => route !== 'finding'));
  });

  it('names every page in both languages, each with its alternates and the default', () => {
    const xml = sitemapXml(SITE, BASE, false);
    expect(xml.match(/<url>/g)).toHaveLength(12);
    expect(xml).toContain(`<loc>${ROOT}es/vanberg/</loc>`);
    expect(xml).toContain(`<xhtml:link rel="alternate" hreflang="en" href="${ROOT}vanberg/"/>`);
    expect(xml).toContain(`<xhtml:link rel="alternate" hreflang="x-default" href="${ROOT}vanberg/"/>`);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">')).toBe(true);
  });

  it('leaves /finding out while locked, as an entry and as an alternate', () => {
    expect(sitemapXml(SITE, BASE, false)).not.toContain('/finding/');
    expect(sitemapXml(SITE, BASE, true)).toContain(`<loc>${ROOT}finding/</loc>`);
  });

  it('builds the sitemap by the lock, with no dependency', () => {
    expect(endpoint).toContain('findingUnlocked(WORKING_PAPER.ssrn, import.meta.env.DEV)');
    expect(endpoint).toContain("import { sitemapXml } from '../lib/sitemap';");
  });

  describe('verify:dist', () => {
    it('passes the sitemap of each state against the pages of that state', () => {
      expect(sitemapProblems(true, sitemapXml(SITE, BASE, false), builtPages(true))).toEqual([]);
      expect(sitemapProblems(false, sitemapXml(SITE, BASE, true), builtPages(true))).toEqual([]);
    });

    it('fails a missing sitemap', () => {
      expect(sitemapProblems(true, undefined, builtPages(true))).toEqual(['sitemap.xml: missing']);
    });

    it('fails /finding in the sitemap while locked', () => {
      const problems = sitemapProblems(true, sitemapXml(SITE, BASE, true), builtPages(true));
      expect(problems).toContain(`sitemap.xml: names ${ROOT}finding/ while the lock is closed`);
      expect(problems).toContain(`sitemap.xml: names ${ROOT}es/finding/ while the lock is closed`);
    });

    it('fails an open sitemap that leaves /finding out, and one that names a page dist/ lacks', () => {
      expect(sitemapProblems(false, sitemapXml(SITE, BASE, false), builtPages(true))).toEqual([
        'sitemap.xml: leaves out finding/index.html',
        'sitemap.xml: leaves out es/finding/index.html',
      ]);
      const extra = sitemapXml(SITE, BASE, false).replace('</urlset>', `  <url>\n    <loc>${ROOT}missing/</loc>\n  </url>\n</urlset>`);
      expect(sitemapProblems(true, extra, builtPages(true))).toEqual([`sitemap.xml: ${ROOT}missing/ is not a page of the site`]);
    });

    it('fails a URL outside the site, and the 404 page', () => {
      const outside = sitemapXml(SITE, BASE, false).replace(`<loc>${ROOT}about/</loc>`, '<loc>https://example.com/about/</loc>');
      expect(sitemapProblems(true, outside, builtPages(true))).toEqual([
        'sitemap.xml: https://example.com/about/ is not a page of the site',
        'sitemap.xml: leaves out about/index.html',
      ]);
      const notFound = sitemapXml(SITE, BASE, false).replace('</urlset>', `  <url>\n    <loc>${ROOT}404.html</loc>\n  </url>\n</urlset>`);
      expect(sitemapProblems(true, notFound, builtPages(true))[0]).toMatch(/404\.html is not a page of the site/);
    });
  });
});
