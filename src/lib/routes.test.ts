import { describe, expect, it } from 'vitest';
import { buildHref, normalizeBase } from './routes';

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
