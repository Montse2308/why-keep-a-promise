import { describe, expect, it } from 'vitest';
import baseLayout from '../src/layouts/BaseLayout.astro?raw';
import posterReadme from '../src/assets/fonts/posters/README.md?raw';
import character from '../src/components/film/Character.astro?raw';
import endpoint from '../src/pages/posters/[locale]/[route].png.ts?raw';
import touchIconEndpoint from '../src/pages/apple-touch-icon.png.ts?raw';
import favicon from '../public/favicon.svg?raw';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';
import { FILM, LIGHT_POINTS } from '../src/lib/design/film';
import { LOCALES } from '../src/lib/locales';
import { hasGlyph, lineWidth, readMetrics, type FontMetrics } from '../src/lib/posters/metrics';
import { balance, CARD, cutout, escapeXml, fit, POSTER, POSTER_FONTS, POSTER_SCENES, posterPath, posterSvg, SIGNATURE_WIDTH, wrap, type PosterFont } from '../src/lib/posters/poster';
import { readPosterFont } from '../src/lib/posters/fonts.mjs';
import { ICON_SHAPES, TOUCH_ICON, touchIconSvg } from '../src/lib/posters/icon';
import { posterLayout, posterMetrics, posterPng, posterText, touchIconPng } from '../src/lib/posters/render';
import { ROUTES } from '../src/lib/routes';

const PAGES = LOCALES.flatMap((locale) => ROUTES.map((route) => [locale, route] as const));
const fontBytes = (font: PosterFont) => readPosterFont(POSTER_FONTS[font].file);

/** A made-up font: every character half an em wide. */
const even: FontMetrics = { unitsPerEm: 1000, advance: () => 500 };

describe('breaking a title into lines', () => {
  it('wraps word by word, never wider than the line unless one word is', () => {
    expect(wrap('aa bb cc', 30, even, 10)).toEqual(['aa bb', 'cc']);
    expect(wrap('abcdefghij', 20, even, 10)).toEqual(['abcdefghij']);
  });

  it('balances the lines, so no word is left alone', () => {
    expect(wrap('aaaa bbbb cc', 50, even, 10)).toEqual(['aaaa bbbb', 'cc']);
    expect(balance('aaaa bbbb cc', 50, even, 10)).toEqual(['aaaa', 'bbbb cc']);
  });

  it('picks the largest size that fits the lines allowed', () => {
    expect(fit('aaaa bbbb', 50, even, [20, 10], 1)).toEqual({ size: 10, lines: ['aaaa bbbb'] });
    expect(fit('aaaa bbbb', 50, even, [20, 10], 2)?.size).toBe(20);
    expect(fit('aaaaaaaaaaaa', 50, even, [20, 10], 3)).toBeNull();
  });

  it('measures letter spacing between characters', () => {
    expect(lineWidth('abc', even, 10, 2)).toBe(15 + 4);
  });

  it('escapes text for XML', () => {
    expect(escapeXml('a & <b> "c"')).toBe('a &amp; &lt;b&gt; &quot;c&quot;');
  });
});

describe("the posters' fonts", () => {
  it.each(Object.keys(POSTER_FONTS) as PosterFont[])('%s reads as TrueType, with real advance widths', (font) => {
    const metrics = readMetrics(fontBytes(font));
    expect(metrics.unitsPerEm).toBeGreaterThan(0);
    expect(metrics.advance('W')).toBeGreaterThan(metrics.advance('i'));
  });

  it('have a glyph for every character every poster sets', () => {
    for (const [locale, route] of PAGES) {
      const text = posterText(locale, route);
      const set: [PosterFont, string][] = [
        ['label', text.name.toLocaleUpperCase()],
        ['title', text.title],
        ['subtitle', text.subtitle ?? ''],
        ['label', text.author],
      ];
      for (const [font, words] of set) {
        for (const char of words.replace(/\s/g, '')) expect(hasGlyph(fontBytes(font), char), `${locale}/${route} ${font} "${char}"`).toBe(true);
      }
    }
  });

  it('are the site’s faces, cut static for the renderer, with their licence and provenance', () => {
    for (const { file } of Object.values(POSTER_FONTS)) expect(posterReadme).toContain(file);
    expect(posterReadme).toContain('Open Font License');
  });
});

describe('each poster', () => {
  it('says the project’s name and the page’s title, and the site’s question under a notebook page’s', () => {
    expect(posterText('en', 'home')).toEqual({ name: en['poster.name'], title: en['site.title'], author: en['author.name'] });
    expect(posterText('es', 'vanberg')).toEqual({ name: es['poster.name'], title: es['notebook.vanberg.title'], subtitle: es['site.title'], author: es['author.name'] });
    expect([en['poster.name'], es['poster.name']]).toEqual(['I promise', 'Te lo prometo']);
  });

  it.each(PAGES)('%s/%s says nothing else: no status sentence, no figure', (locale, route) => {
    const text = Object.values(posterText(locale, route)).join(' ');
    const dictionary: Record<string, string> = locale === 'en' ? en : es;
    for (const key of ['manuscript.status.in-preparation', 'manuscript.status.under-review']) expect(text).not.toContain(dictionary[key]);
    expect(text).not.toMatch(/\d/);
  });

  it.each(PAGES)('%s/%s is signed with the author’s full name, and only that, apart from the title (ADR 0032)', (locale, route) => {
    const dictionary: Record<string, string> = locale === 'en' ? en : es;
    const set = posterLayout(locale, route);
    expect(set.signature).toBe(dictionary['author.name']);
    expect(posterSvg(route, set)).toContain(`>${escapeXml(dictionary['author.name'] ?? '')}</text>`);
    expect(set.title.lines.join(' ')).not.toContain(set.signature);
    expect(lineWidth(set.signature, posterMetrics().label, 20)).toBeLessThanOrEqual(SIGNATURE_WIDTH);
  });

  it.each(LOCALES)('%s: the poster’s alternative text names the author, as the poster shows', (locale) => {
    const dictionary: Record<string, string> = locale === 'en' ? en : es;
    expect(dictionary['poster.alt']).toContain('{author}');
    expect(baseLayout).toContain("author: t(locale, 'author.name')");
  });

  it.each(PAGES)('%s/%s fits its card', (locale, route) => {
    const set = posterLayout(locale, route);
    const metrics = posterMetrics();
    const width = CARD.width - 2 * CARD.padding;
    expect(set.title.size).toBeGreaterThanOrEqual(48);
    for (const line of set.title.lines) expect(lineWidth(line, metrics.title, set.title.size)).toBeLessThanOrEqual(width);
    expect(set.titleTop + set.title.lines.length * set.title.size * 1.08).toBeLessThanOrEqual(CARD.y + CARD.height - CARD.padding);
    if (route !== 'home') expect(set.subtitle?.lines.length).toBeLessThanOrEqual(2);
  });

  it.each(ROUTES)('%s is drawn only in the film’s palette and its hour of the day', (route) => {
    const svg = posterSvg(route, posterLayout('en', route));
    const allowed = new Set(
      [...Object.values(FILM), ...LIGHT_POINTS.flatMap((p) => Object.values(p.colours)), '#fff', '#ff8fa3', '#8fd3ff', '#281e3c', '#fff4d6'].map((c) => c.toLowerCase()),
    );
    expect((svg.match(/#[0-9a-f]{3,8}\b/gi) ?? []).filter((c) => !allowed.has(c.toLowerCase()))).toEqual([]);
    const light = LIGHT_POINTS.find((p) => p.name === POSTER_SCENES[route].light);
    expect(svg).toContain(light?.colours['sky-top']);
  });

  it('cuts the cast as Character.astro does', () => {
    const drawn = cutout('circle', 'happy', 0, 0, 1) + cutout('square', 'happy', 0, 0, 1);
    for (const shape of ['r="58"', 'x="-56" y="-56" width="112" height="112" rx="18"', 'stroke-width="13"', 'stroke-width="7"', 'cx="-21" cy="-10" rx="14" ry="16"', 'cx="-21" cy="-8" r="7"']) {
      expect(character, shape).toContain(shape);
      expect(drawn, shape).toContain(shape);
    }
  });
});

describe('publishing the posters', () => {
  it('builds one per page and per language, where each page’s Open Graph tags look for it', () => {
    expect(endpoint).toContain('LOCALES.flatMap((locale) => ROUTES.map((route)');
    expect(baseLayout).toContain('posterPath(locale, route)');
    expect(posterPath('es', 'how-its-built')).toBe('posters/es/how-its-built.png');
    for (const tag of ['og:title', 'og:image', 'og:image:width', 'og:image:height', 'og:image:alt', 'og:url', 'twitter:card']) expect(baseLayout).toContain(`"${tag}"`);
  });

  it('renders a PNG of the poster’s size', () => {
    const png = posterPng('es', 'home');
    expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
    expect([view.getUint32(16), view.getUint32(20)]).toEqual([POSTER.width, POSTER.height]);
  });
});

describe("the icon for a phone's home screen (point 13 of the external review)", () => {
  /** The elements of an SVG drawing, without its comments, one per line, spaced alike. */
  const shapes = (svg: string) => (svg.replace(/<!--[\s\S]*?-->/g, '').match(/<(path|circle|rect)\b[^>]*\/>/g) ?? []).map((shape) => shape.replace(/\s+/g, ' ').toLowerCase());

  it("draws the tab's icon, shape for shape and colour for colour", () => {
    expect(ICON_SHAPES.map((shape) => shape.toLowerCase())).toEqual(shapes(favicon));
    expect(touchIconSvg()).toContain(ICON_SHAPES.join(''));
  });

  it("fills the square with the film's dawn sky: a phone does not draw transparency", () => {
    const svg = touchIconSvg();
    expect(svg).toContain('<rect x="-56" y="-56" width="112" height="112" fill="url(#sky)"/>');
    expect(svg).toContain(`stop-color="${LIGHT_POINTS[0]?.colours['sky-top']}"`);
  });

  it('renders a PNG of 180 px, built where every page names it', () => {
    const png = touchIconPng();
    expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
    expect([view.getUint32(16), view.getUint32(20)]).toEqual([TOUCH_ICON, TOUCH_ICON]);
    expect(TOUCH_ICON).toBe(180);
    expect(touchIconEndpoint).toContain('touchIconPng()');
  });
});
