import { describe, expect, it } from 'vitest';
import { buildHref, normalizeBase, ROUTES, routeOf } from './routes';

const BASE = '/why-keep-a-promise';

describe('normalizeBase', () => {
  it.each([
    ['/', '/'],
    ['', '/'],
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
  });

  it('prefixes the Spanish locale', () => {
    expect(buildHref(BASE, 'es', 'home')).toBe('/why-keep-a-promise/es/');
    expect(buildHref(BASE, 'es', 'how-its-built')).toBe('/why-keep-a-promise/es/how-its-built/');
  });

  it('adds a fragment with or without a leading #', () => {
    expect(buildHref(BASE, 'en', 'home', 'finding')).toBe('/why-keep-a-promise/#finding');
    expect(buildHref(BASE, 'es', 'home', '#finding')).toBe('/why-keep-a-promise/es/#finding');
  });

  it('gives the same result whether or not base ends in a slash', () => {
    expect(buildHref(`${BASE}/`, 'es', 'dilemma')).toBe(buildHref(BASE, 'es', 'dilemma'));
  });
});

describe('routeOf', () => {
  it('reads back every route that buildHref writes, in both locales', () => {
    for (const locale of ['en', 'es'] as const) {
      for (const route of ROUTES) expect(routeOf(BASE, buildHref(BASE, locale, route))).toBe(route);
    }
  });

  it('takes the home with or without its last slash, and a page without it', () => {
    expect(routeOf(BASE, '/why-keep-a-promise')).toBe('home');
    expect(routeOf(BASE, '/why-keep-a-promise/es')).toBe('home');
    expect(routeOf(BASE, '/why-keep-a-promise/vanberg')).toBe('vanberg');
  });

  it('knows nothing of files, missing pages, the default locale named or other sites', () => {
    expect(routeOf(BASE, '/why-keep-a-promise/sitemap.xml')).toBeNull();
    expect(routeOf(BASE, '/why-keep-a-promise/nowhere/')).toBeNull();
    expect(routeOf(BASE, '/why-keep-a-promise/en/dilemma/')).toBeNull();
    expect(routeOf(BASE, '/why-keep-a-promise/dilemma/more/')).toBeNull();
    expect(routeOf(BASE, '/other-site/dilemma/')).toBeNull();
    expect(routeOf('/', '/dilemma/')).toBe('dilemma');
  });
});
