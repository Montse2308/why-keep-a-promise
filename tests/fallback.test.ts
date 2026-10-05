// The film's fallback (P7.1, point 1 of the external review): a browser that cannot run the film's
// script, or whose copy of it fails, shows the storyboard, never a half-built stage.
import { describe, expect, it } from 'vitest';
import baseLayout from '../src/layouts/BaseLayout.astro?raw';

describe("the film's fallback", () => {
  it('gives the film its layout only where modules run', () => {
    expect(baseLayout).toContain("if ('noModule' in HTMLScriptElement.prototype) document.documentElement.classList.add('js');");
    expect(baseLayout).not.toMatch(/<script is:inline>document\.documentElement\.classList\.add\('js'\);/);
  });
});
