import { describe, expect, it } from 'vitest';
import { buildHref, normalizeBase, ROUTES, routeOf } from './routes';

// A site in a folder of its domain, as it was on GitHub Pages; and the site at the root of its own
// domain, as it is (ADR 0044). The functions take either.
const BASE = '/why-keep-a-promise';
const ROOT = '/';

describe('normalizeBase', () => {
  it.each([
    ['/', '/'],
    ['', '/'],
    ['//', '/'],
    ['/why-keep-a-promise', '/why-keep-a-promise/'],
    ['/why-keep-a-promise/', '/why-keep-a-promise/'],
    ['why-keep-a-promise', '/why-keep-a-promise/'],
  ])('%j → %j', (input, expected) => {
    expect(normalizeBase(input)).toBe(expected);
  });
});

describe('buildHref', () => {
  it('keeps the default locale unprefixed', () => {
    expect(buildHref(BASE, 'en', 'home')).toBe('/why-keep-a-promise/');
    expect(buildHref(BASE, 'en', 'vanberg')).toBe('/why-keep-a-promise/vanberg/');
    expect(buildHref(ROOT, 'en', 'home')).toBe('/');
    expect(buildHref(ROOT, 'en', 'vanberg')).toBe('/vanberg/');
  });

  it('prefixes the Spanish locale', () => {
    expect(buildHref(BASE, 'es', 'home')).toBe('/why-keep-a-promise/es/');
    expect(buildHref(BASE, 'es', 'how-its-built')).toBe('/why-keep-a-promise/es/how-its-built/');
    expect(buildHref(ROOT, 'es', 'home')).toBe('/es/');
    expect(buildHref(ROOT, 'es', 'how-its-built')).toBe('/es/how-its-built/');
  });

  it('adds a fragment with or without a leading #', () => {
    expect(buildHref(BASE, 'en', 'home', 'finding')).toBe('/why-keep-a-promise/#finding');
    expect(buildHref(BASE, 'es', 'home', '#finding')).toBe('/why-keep-a-promise/es/#finding');
    expect(buildHref(ROOT, 'en', 'home', 'finding')).toBe('/#finding');
    expect(buildHref(ROOT, 'es', 'home', '#finding')).toBe('/es/#finding');
  });

  it('gives the same result whether or not base ends in a slash', () => {
    expect(buildHref(`${BASE}/`, 'es', 'dilemma')).toBe(buildHref(BASE, 'es', 'dilemma'));
    expect(buildHref('', 'es', 'dilemma')).toBe(buildHref(ROOT, 'es', 'dilemma'));
  });

  it('never writes a double slash at the root', () => {
    for (const locale of ['en', 'es'] as const) {
      for (const route of ROUTES) expect(buildHref(ROOT, locale, route)).not.toContain('//');
    }
  });
});

describe('routeOf', () => {
  it('reads back every route that buildHref writes, in both locales', () => {
    for (const base of [BASE, ROOT]) {
      for (const locale of ['en', 'es'] as const) {
        for (const route of ROUTES) expect(routeOf(base, buildHref(base, locale, route))).toBe(route);
      }
    }
  });

  it('takes the home with or without its last slash, and a page without it', () => {
    expect(routeOf(BASE, '/why-keep-a-promise')).toBe('home');
    expect(routeOf(BASE, '/why-keep-a-promise/es')).toBe('home');
    expect(routeOf(BASE, '/why-keep-a-promise/vanberg')).toBe('vanberg');
    expect(routeOf(ROOT, '/')).toBe('home');
    expect(routeOf(ROOT, '/es')).toBe('home');
    expect(routeOf(ROOT, '/vanberg')).toBe('vanberg');
  });

  it('knows nothing of files, missing pages, the default locale named or other sites', () => {
    expect(routeOf(BASE, '/why-keep-a-promise/sitemap.xml')).toBeNull();
    expect(routeOf(BASE, '/why-keep-a-promise/nowhere/')).toBeNull();
    expect(routeOf(BASE, '/why-keep-a-promise/en/dilemma/')).toBeNull();
    expect(routeOf(BASE, '/why-keep-a-promise/dilemma/more/')).toBeNull();
    expect(routeOf(BASE, '/other-site/dilemma/')).toBeNull();
    expect(routeOf(ROOT, '/dilemma/')).toBe('dilemma');
    expect(routeOf(ROOT, '/sitemap.xml')).toBeNull();
    expect(routeOf(ROOT, '/robots.txt')).toBeNull();
    expect(routeOf(ROOT, '/nowhere/')).toBeNull();
    expect(routeOf(ROOT, '/en/dilemma/')).toBeNull();
    expect(routeOf(ROOT, '/dilemma/more/')).toBeNull();
  });

  it('at the root, reads a path of the old folder as a page that does not exist', () => {
    expect(routeOf(ROOT, '/why-keep-a-promise/')).toBeNull();
    expect(routeOf(ROOT, '/why-keep-a-promise/vanberg/')).toBeNull();
  });
});
