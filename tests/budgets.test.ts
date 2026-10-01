import { describe, expect, it } from 'vitest';
import adr from '../docs/decisions/0025-technology.md?raw';
import agents from '../AGENTS.md?raw';
import ci from '../.github/workflows/ci.yml?raw';
import deploy from '../.github/workflows/deploy.yml?raw';
import pkg from '../package.json';
import { weighSite } from '../scripts/budgets.mjs';
import {
  BUDGETS,
  codePointsOf,
  covers,
  fontFacesOf,
  importsOf,
  KB,
  kilobytes,
  LCP_CEILING_MS,
  overruns,
  parseRanges,
  refsOf,
  resolveUrl,
  weigh,
  type PageWeight,
  type Reader,
} from '../src/lib/budgets';

const ceiling = (id: string) => BUDGETS.find((b) => b.id === id)?.bytes;

describe('the budgets', () => {
  it('are the ceilings of ADR 0025, in KiB as Lighthouse counts them', () => {
    expect(KB).toBe(1024);
    expect(ceiling('home-script')).toBe(40 * 1024);
    expect(ceiling('fonts')).toBe(160 * 1024);
    expect(ceiling('first-load')).toBe(450 * 1024);
    expect(LCP_CEILING_MS).toBe(2500);
    for (const line of ['JavaScript del home: ≤ 40 KB', 'Fuentes: ≤ 160 KB', 'Primera carga completa: ≤ 450 KB', 'LCP ≤ 2.5 s']) expect(adr).toContain(line);
  });

  it('hold the film’s script to the home pages, and the fonts and the first load to every page', () => {
    expect(BUDGETS.filter((b) => b.home).map((b) => b.id)).toEqual(['home-script']);
  });

  it('run after every build, in CI and before the deploy', () => {
    expect(pkg.scripts.budgets).toBe('node scripts/budgets.mjs');
    for (const workflow of [ci, deploy]) {
      expect(workflow).toContain('npm run budgets');
      expect(workflow.indexOf('npm run budgets')).toBeGreaterThan(workflow.indexOf('npm run build'));
    }
    expect(agents).toContain('`npm run budgets`');
  });

  it('print a size in KiB, one decimal', () => {
    expect(kilobytes(14_643)).toBe('14.3 KiB');
  });
});

describe('what a page asks for', () => {
  const html = `<!doctype html><html><head>
    <link rel="icon" type="image/svg+xml" href="/b/favicon.svg">
    <link rel="preload" href="/b/_astro/fonts/a.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="/b/_astro/site.css">
    <link rel="alternate" hreflang="es" href="/b/es/">
    <script>document.documentElement.classList.add('js');</script>
    <script type="application/json">{"not":"run"}</script>
    <style>@font-face{font-family:F;src:url("/b/_astro/fonts/b.woff2") format("woff2");unicode-range:U+0100-017F;}</style>
  </head><body><img src="/b/a.png" alt=""><img src="/b/later.png" loading="lazy" alt="">
    <script type="module" src="/b/_astro/film.js"></script></body></html>`;

  it('reads its scripts, styles, preloaded fonts and images, and skips data blocks and lazy images', () => {
    const refs = refsOf(html);
    expect(refs.scripts).toEqual(['/b/_astro/film.js']);
    expect(refs.inlineScripts).toEqual(["document.documentElement.classList.add('js');"]);
    expect(refs.styles).toEqual(['/b/_astro/site.css']);
    expect(refs.preloads).toEqual(['/b/_astro/fonts/a.woff2']);
    expect(refs.images).toEqual(['/b/favicon.svg', '/b/a.png']);
    expect(refs.inlineStyles).toHaveLength(1);
  });

  it('follows static imports, not dynamic ones', () => {
    expect(importsOf('import{a as b}from"./chunk.js";import"./side.js";export*from"./more.js";const x=import("./later.js");')).toEqual([
      './chunk.js',
      './side.js',
      './more.js',
    ]);
    expect(resolveUrl('./chunk.js', '/b/_astro/film.js')).toBe('/b/_astro/chunk.js');
    expect(resolveUrl('../x.css', '/b/es/')).toBe('/b/x.css');
  });

  it('reads @font-face rules and their unicode ranges', () => {
    const [face] = fontFacesOf('@font-face{font-family:"F x";src:url("/f.woff2") format("woff2");unicode-range:U+0000-00FF,U+0131,U+02??;}');
    expect(face?.family).toBe('F x');
    expect(face?.url).toBe('/f.woff2');
    expect(parseRanges('U+0000-00FF,U+0131,U+02??')).toEqual([
      [0, 0xff],
      [0x131, 0x131],
      [0x200, 0x2ff],
    ]);
    expect(fontFacesOf('@font-face{font-family:F;src:local("Arial");}')).toEqual([]);
  });

  it('counts a font only when the page holds a character in its range', () => {
    const face = { family: 'F', url: '/f.woff2', ranges: parseRanges('U+0100-017F') };
    expect(covers(face, codePointsOf('Montse, ¿por qué?'))).toBe(false);
    expect(covers(face, codePointsOf('Łódź'))).toBe(true);
    expect(covers({ ...face, ranges: [] }, codePointsOf('a'))).toBe(true);
  });
});

describe('weighing a page', () => {
  const files: Record<string, string> = {
    '/b/_astro/film.js': 'import{x}from"./chunk.js";import("./later.js");',
    '/b/_astro/chunk.js': 'export const x=1;',
    '/b/_astro/later.js': 'export const y=2;',
    '/b/_astro/site.css': '@font-face{font-family:G;src:url("./fonts/c.woff2");unicode-range:U+0000-00FF;}@font-face{font-family:G;src:url("./fonts/d.woff2");unicode-range:U+0100-017F;}',
  };
  const sizes: Record<string, number> = {
    '/b/_astro/film.js': 3000,
    '/b/_astro/chunk.js': 2000,
    '/b/_astro/later.js': 9000,
    '/b/_astro/site.css': 1000,
    '/b/_astro/fonts/a.woff2': 30_000,
    '/b/_astro/fonts/b.woff2': 20_000,
    '/b/_astro/fonts/c.woff2': 40_000,
    '/b/_astro/fonts/d.woff2': 15_000,
    '/b/favicon.svg': 500,
  };
  const reader: Reader = {
    text: (url) => files[url] ?? null,
    bytes: (url) => sizes[url] ?? null,
    compressed: (text) => text.length,
  };
  const page = (body: string) => `<head>
    <link rel="icon" href="/b/favicon.svg">
    <link rel="preload" href="/b/_astro/fonts/a.woff2" as="font" crossorigin>
    <link rel="stylesheet" href="/b/_astro/site.css">
    <script type="module">import"/b/_astro/chunk.js";</script>
    <style>@font-face{font-family:F;src:url("/b/_astro/fonts/b.woff2");unicode-range:U+0100-017F;}</style>
  </head><body>${body}<script type="module" src="/b/_astro/film.js"></script></body>`;

  it('adds the HTML, every script once with its static imports, the styles, the fonts it needs and the icon', () => {
    const weight = weigh('/b/', page('<p>Hello</p>'), 800, true, reader);
    expect(weight.resources.map((r) => r.url)).toEqual(['/b/', '/b/_astro/film.js', '/b/_astro/chunk.js', '/b/_astro/site.css', '/b/_astro/fonts/a.woff2', '/b/_astro/fonts/c.woff2', '/b/favicon.svg']);
    const inline = 'import"/b/_astro/chunk.js";'.length;
    expect(weight.totals['home-script']).toBe(3000 + 2000 + inline);
    expect(weight.totals.fonts).toBe(30_000 + 40_000);
    expect(weight.totals['first-load']).toBe(800 + 3000 + 2000 + 1000 + 30_000 + 40_000 + 500);
  });

  it('adds the latin-ext faces once the page holds one of their characters', () => {
    const weight = weigh('/b/', page('<p>Łódź</p>'), 800, true, reader);
    expect(weight.totals.fonts).toBe(30_000 + 20_000 + 40_000 + 15_000);
  });

  it('fails on a file the page asks for and the build does not have', () => {
    expect(() => weigh('/b/', '<script type="module" src="/b/_astro/gone.js"></script>', 100, true, reader)).toThrow(/gone\.js/);
  });

  it('reports every budget a page goes over, the home’s script only on the home', () => {
    const heavy = (home: boolean): PageWeight => ({
      page: home ? '/b/' : '/b/x/',
      home,
      resources: [],
      totals: { 'home-script': 41 * KB, fonts: 161 * KB, 'first-load': 100 * KB },
    });
    expect(overruns([heavy(true), heavy(false)]).map((o) => `${o.page} ${o.budget}`)).toEqual(['/b/ home-script', '/b/ fonts', '/b/x/ fonts']);
    expect(overruns([{ ...heavy(true), totals: { 'home-script': 40 * KB, fonts: 160 * KB, 'first-load': 450 * KB } }])).toEqual([]);
  });
});

describe('weighing a built site', () => {
  // A site of three pages, two homes sharing a script, in tests/fixtures/budgets-dist/.
  it('weighs every page, compressed, and knows the two homes', () => {
    const weights = weighSite('tests/fixtures/budgets-dist');
    expect(weights.map((w) => [w.page, w.home]).sort()).toEqual([
      ['/why-keep-a-promise/', true],
      ['/why-keep-a-promise/about/', false],
      ['/why-keep-a-promise/es/', true],
    ]);
    const home = weights.find((w) => w.page === '/why-keep-a-promise/');
    expect(home?.resources.map((r) => r.url)).toEqual(['/why-keep-a-promise/', '/why-keep-a-promise/_astro/film.js', '/why-keep-a-promise/_astro/a.css']);
    // Gzip folds the script's fifty repeats: far fewer bytes than its 750.
    expect(home?.totals['home-script']).toBeGreaterThan(0);
    expect(home?.totals['home-script']).toBeLessThan(100);
    expect(overruns(weights)).toEqual([]);
  });
});
