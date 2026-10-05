import { describe, expect, it } from 'vitest';
import notFound from '../src/pages/404.astro?raw';
import { LOCALES, DEFAULT_LOCALE } from '../src/lib/i18n';
import { ROUTES } from '../src/lib/routes';

// Page files are only listed, never imported.
const pageFiles = Object.keys(import.meta.glob('../src/pages/**/*.astro')).map((path) =>
  path.replace(/^\.\.\/src\/pages\//, ''),
);

/** The page GitHub Pages serves for a missing address: one for the whole site, in both languages. */
const NOT_FOUND = '404.astro';

function expectedFile(locale: string, route: string): string {
  const prefix = locale === DEFAULT_LOCALE ? '' : `${locale}/`;
  return `${prefix}${route === 'home' ? 'index' : route}.astro`;
}

describe('page parity', () => {
  it('has a page for every route in every locale, and the 404 page once', () => {
    const expected = [...LOCALES.flatMap((locale) => ROUTES.map((route) => expectedFile(locale, route))), NOT_FOUND];
    expect([...pageFiles].sort()).toEqual([...expected].sort());
  });
});

describe('the 404 page (point 13 of the external review)', () => {
  it('speaks both languages, each marked, with a link back to the film in each', () => {
    expect(notFound).toContain('const locales = [DEFAULT_LOCALE, otherLocale(DEFAULT_LOCALE)];');
    expect(notFound).toContain(`<span class="not-found__title" lang={locale}>`);
    expect(notFound).toContain(`<p class="not-found__line" lang={locale}>`);
    expect(notFound).toContain(`<a href={href(locale, 'home')}>{t(locale, 'notebook.film')}</a>`);
  });

  it('stays out of search engines', () => {
    expect(notFound).toContain('<meta name="robots" content="noindex" />');
  });

  it('links through the routes, never to a hard-coded path', () => {
    expect(notFound).not.toMatch(/href="\//);
  });
});
