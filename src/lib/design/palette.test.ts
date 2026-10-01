import { describe, expect, it } from 'vitest';
import tokensCss from '../../styles/tokens.css?raw';
import { contrastRatio, parseHex, relativeLuminance, simulate } from './color';
import { FILM } from './film';
import { COLOR_TOKENS, CONTRAST_PAIRS, MIN_CONTRAST, PALETTE, THEMES, type Theme } from './palette';

const read = (block: string) =>
  Object.fromEntries([...block.matchAll(/--color-([a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2]?.trim()]));

/** `--color-*` declarations of the light `:root` block and of the dark-scheme block. */
function colorDeclarations(css: string): Record<Theme, Record<string, string>> {
  const darkStart = css.indexOf('@media (prefers-color-scheme: dark)');
  if (darkStart < 0) throw new Error('tokens.css has no dark-scheme block');
  const darkEnd = css.indexOf('@media', darkStart + 1);
  const light = css.slice(0, darkStart);
  return {
    light: read(light),
    dark: read(css.slice(darkStart, darkEnd < 0 ? undefined : darkEnd)),
  };
}

describe('colour maths', () => {
  it('matches the WCAG reference values', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 10);
    expect(relativeLuminance('#000000')).toBe(0);
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 10);
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
    expect(contrastRatio('#ffffff', '#777777')).toBe(contrastRatio('#777777', '#ffffff'));
  });

  it('rejects anything but #rrggbb', () => {
    expect(() => parseHex('#fff')).toThrow();
    expect(() => parseHex('rgb(0,0,0)')).toThrow();
  });

  it('leaves greys unchanged under simulation', () => {
    expect(simulate('#808080', 'protanopia')).toEqual(parseHex('#808080'));
    expect(simulate('#808080', 'deuteranopia')).toEqual(parseHex('#808080'));
  });
});

describe.each(THEMES)("the notebook's paper, %s theme", (theme) => {
  const colors = PALETTE[theme];

  it.each(CONTRAST_PAIRS.map((pair) => [`${pair.fg} on ${pair.bg} (${pair.use})`, pair] as const))('meets WCAG AA contrast: %s', (_name, pair) => {
    expect(contrastRatio(colors[pair.fg], colors[pair.bg])).toBeGreaterThanOrEqual(MIN_CONTRAST[pair.kind]);
  });

  it('checks the text and the focus ring against every paper they sit on', () => {
    const papers = (token: string, kind: 'text' | 'graphic') => [...new Set(CONTRAST_PAIRS.filter((pair) => pair.fg === token && pair.kind === kind).map((pair) => pair.bg))].sort();
    expect(papers('fg', 'text')).toEqual(['bg', 'glow', 'surface']);
    expect(papers('muted', 'text')).toEqual(['bg', 'glow', 'surface']);
    expect(papers('focus', 'graphic')).toEqual(['bg', 'glow', 'surface']);
  });

  it('is paper with colour, never a flat grey: the page keeps a warm or a night hue', () => {
    for (const token of ['bg', 'glow', 'surface'] as const) {
      const [r, g, b] = parseHex(colors[token]);
      expect(Math.max(r, g, b) - Math.min(r, g, b), token).toBeGreaterThan(0);
    }
    const [r, , b] = parseHex(colors.bg);
    // Day paper leans warm (more red than blue); night paper leans to the film's indigo ink.
    expect(theme === 'light' ? r > b : b > r).toBe(true);
  });
});

describe('the paper comes from the film (ADR 0027)', () => {
  it("reads in the film's ink on day paper and in its paper on night paper", () => {
    expect(PALETTE.light.fg).toBe(FILM.ink);
    expect(PALETTE.dark.bg).toBe(FILM.ink);
    expect(PALETTE.dark.fg).toBe(FILM.rim);
    expect(PALETTE.light.surface).toBe(FILM.card);
  });

  it("marks with the golden thread: its edge by day, the thread itself by night", () => {
    expect(PALETTE.light.accent).toBe(FILM['thread-edge']);
    expect(PALETTE.dark.accent).toBe(FILM.thread);
    expect(PALETTE.dark.focus).toBe(FILM.thread);
  });
});

describe('tokens.css', () => {
  it('carries exactly the values of palette.ts', () => {
    const declared = colorDeclarations(tokensCss);
    for (const theme of THEMES) {
      expect(declared[theme]).toEqual(Object.fromEntries(COLOR_TOKENS.map((token) => [token, PALETTE[theme][token]])));
    }
  });
});
