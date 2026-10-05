import { describe, expect, it } from 'vitest';
import baseLayout from '../src/layouts/BaseLayout.astro?raw';
import notFound from '../src/pages/404.astro?raw';
import { LIGHT_POINTS } from '../src/lib/design/film';
import { PALETTE } from '../src/lib/design/palette';
import { LOCALES, t } from '../src/lib/i18n';
import { description, descriptionKey, OG_LOCALES, themeColors } from '../src/lib/meta';
import { NOTEBOOK } from '../src/lib/notebook';
import { ROUTES } from '../src/lib/routes';
import { findMarks } from '../scripts/verify-dist.mjs';

const pages = LOCALES.flatMap((locale) => ROUTES.map((route) => [`${locale} ${route}`, locale, route] as const));

describe('the descriptions (point 4 of the external review)', () => {
  it('covers the 14 pages', () => {
    expect(pages).toHaveLength(14);
  });

  it.each(pages)('%s has its description', (_name, locale, route) => {
    expect(description(locale, route).trim().length).toBeGreaterThan(20);
  });

  it('is written in each language, not copied from the other (the key is the same, so they stay in parity)', () => {
    for (const route of ROUTES) {
      const [first, ...rest] = LOCALES.map((locale) => description(locale, route));
      for (const other of rest) expect(other).not.toBe(first);
    }
  });

  it("gives each notebook page its line in the panel, and the home the description approved in 7.0.3", () => {
    expect(descriptionKey('home')).toBe('site.description');
    for (const entry of NOTEBOOK.filter((page) => page.lineKey)) expect(descriptionKey(entry.page)).toBe(entry.lineKey);
  });

  it("gives /finding the site's question: nothing of the finding, and not the status sentence (rule (b))", () => {
    expect(descriptionKey('finding')).toBe('site.title');
    for (const locale of LOCALES) {
      const text = description(locale, 'finding');
      expect(findMarks(text)).toEqual([]);
      for (const state of ['in-preparation', 'under-review'] as const) expect(text).not.toContain(t(locale, `manuscript.status.${state}`));
    }
  });

  it.each(pages)("%s's description carries none of the lock's marks", (_name, locale, route) => {
    expect(findMarks(description(locale, route))).toEqual([]);
  });

  it('is written in the head as the description and as og:description', () => {
    expect(baseLayout).toContain('<meta name="description" content={summary} />');
    expect(baseLayout).toContain('<meta property="og:description" content={summary} />');
    expect(baseLayout).toContain('const summary = description(locale, route);');
  });
});

describe('the language and the name for Open Graph', () => {
  it('names every locale as language_TERRITORY', () => {
    expect(Object.keys(OG_LOCALES).sort()).toEqual([...LOCALES].sort());
    for (const locale of LOCALES) expect(OG_LOCALES[locale]).toMatch(new RegExp(`^${locale}_[A-Z]{2}$`));
  });

  it("writes the page's language, the other one as its alternate, and the poster's name as the site's", () => {
    expect(baseLayout).toContain('<meta property="og:locale" content={OG_LOCALES[locale]} />');
    expect(baseLayout).toContain('<meta property="og:locale:alternate" content={OG_LOCALES[alt]} />');
    expect(baseLayout).toContain(`<meta property="og:site_name" content={t(locale, 'poster.name')} />`);
  });
});

describe('the colour of the browser bar (point 13 of the external review)', () => {
  it("is the film's dawn sky over the film, in either theme", () => {
    expect(themeColors(true)).toEqual([{ color: LIGHT_POINTS[0]?.colours['sky-top'] }]);
  });

  it("is the top of the notebook's paper elsewhere, day or night by the visitor's theme", () => {
    expect(themeColors(false)).toEqual([
      { color: PALETTE.light.glow, media: '(prefers-color-scheme: light)' },
      { color: PALETTE.dark.glow, media: '(prefers-color-scheme: dark)' },
    ]);
  });

  it('is written on every page, with the touch icon beside the tab icon', () => {
    for (const source of [baseLayout, notFound]) {
      expect(source).toContain('<meta name="theme-color" content={color} media={media} />');
      expect(source).toContain(`<link rel="apple-touch-icon" href={assetHref('apple-touch-icon.png')} />`);
    }
    expect(baseLayout).toContain('themeColors(film)');
    expect(notFound).toContain('themeColors(false)');
  });
});
