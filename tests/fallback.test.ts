// The film's fallback (P7.1, point 1 of the external review): a browser that cannot run the film's
// script, or whose copy of it fails, shows the storyboard, never a half-built stage.
import { describe, expect, it } from 'vitest';
import film from '../src/components/film/film.ts?raw';
import baseLayout from '../src/layouts/BaseLayout.astro?raw';

const inline = baseLayout.match(/<script is:inline>([\s\S]*?)<\/script>/)?.[1] ?? '';

describe("the film's fallback", () => {
  it('gives the film its layout only where modules run', () => {
    expect(inline).toContain("if (!('noModule' in HTMLScriptElement.prototype)) return;");
    expect(inline.indexOf('return;')).toBeLessThan(inline.indexOf("root.classList.add('js')"));
  });

  it('takes the layout away when the film has not started once the page is parsed, or after 4 s', () => {
    expect(inline).toContain("if (!document.querySelector('[data-film-ready]')) root.classList.remove('js');");
    expect(inline).toContain("document.addEventListener('DOMContentLoaded', fallback);");
    expect(inline).toContain('setTimeout(fallback, 4000);');
  });

  it('is plain ES5, for the browsers it is for', () => {
    expect(inline).not.toMatch(/=>|\bconst\b|\blet\b|`/);
  });

  it('marks the film ready once it runs, and takes the layout away if it fails or comes late', () => {
    expect(film).toMatch(/request\(\);\n {2}film\.dataset\.filmReady = '';\n\}/);
    expect(film).toContain("if (!root.classList.contains('js')) return;");
    expect(film).toMatch(/catch \(error\) \{\n {4}root\.classList\.remove\('js'\);/);
  });
});
