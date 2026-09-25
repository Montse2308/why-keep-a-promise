import { describe, expect, it } from 'vitest';
import { LOCALES, DEFAULT_LOCALE } from '../src/lib/i18n';
import { ROUTES } from '../src/lib/routes';

// Page files are only listed, never imported.
const pageFiles = Object.keys(import.meta.glob('../src/pages/**/*.astro')).map((path) =>
  path.replace(/^\.\.\/src\/pages\//, ''),
);

function expectedFile(locale: string, route: string): string {
  const prefix = locale === DEFAULT_LOCALE ? '' : `${locale}/`;
  return `${prefix}${route === 'home' ? 'index' : route}.astro`;
}

describe('page parity', () => {
  it('has a page for every route in every locale', () => {
    const expected = LOCALES.flatMap((locale) => ROUTES.map((route) => expectedFile(locale, route)));
    expect([...pageFiles].sort()).toEqual([...expected].sort());
  });
});
