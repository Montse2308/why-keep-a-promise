import { describe, expect, it } from 'vitest';
import faviconSvg from '../../../public/favicon.svg?raw';
import tokensCss from '../../styles/tokens.css?raw';
import { contrastRatio, deltaE, parseHex, relativeLuminance, simulate, type Deficiency } from './color';
import { COLOR_TOKENS, CONTRAST_PAIRS, MIN_CONTRAST, MIN_DISTANCE, PALETTE, THEMES, type Theme } from './palette';

/** `--color-*` declarations of the light `:root` block and of the dark-scheme block. */
function colorDeclarations(css: string): Record<Theme, Record<string, string>> {
  const darkStart = css.indexOf('@media (prefers-color-scheme: dark)');
  if (darkStart < 0) throw new Error('tokens.css has no dark-scheme block');
  const darkEnd = css.indexOf('@media', darkStart + 1);
  const read = (block: string) =>
    Object.fromEntries([...block.matchAll(/--color-([a-z-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2]?.trim()]));
  return {
    light: read(css.slice(0, darkStart)),
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

describe.each(THEMES)('palette, %s theme', (theme) => {
  const colors = PALETTE[theme];

  it.each(CONTRAST_PAIRS.map((pair) => [`${pair.fg} on ${pair.bg}`, pair] as const))(
    'meets WCAG AA contrast: %s',
    (_name, pair) => {
      expect(contrastRatio(colors[pair.fg], colors[pair.bg])).toBeGreaterThanOrEqual(MIN_CONTRAST[pair.kind]);
    },
  );

  const visions: Array<Deficiency | 'typical'> = ['typical', 'protanopia', 'deuteranopia'];
  const seen = (hex: string, vision: Deficiency | 'typical') =>
    vision === 'typical' ? parseHex(hex) : simulate(hex, vision);

  it.each(visions)('keeps the two roles apart under %s vision', (vision) => {
    expect(deltaE(seen(colors.you, vision), seen(colors.other, vision))).toBeGreaterThanOrEqual(MIN_DISTANCE.roles);
  });

  it.each(visions)('keeps the promise accent apart from both roles under %s vision', (vision) => {
    for (const role of [colors.you, colors.other]) {
      expect(deltaE(seen(colors.promise, vision), seen(role, vision))).toBeGreaterThanOrEqual(MIN_DISTANCE.promise);
    }
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

describe('favicon.svg', () => {
  it('uses only palette values, including both role colours in each theme', () => {
    const [light, dark] = faviconSvg.split('prefers-color-scheme: dark') as [string, string | undefined];
    expect(dark).toBeDefined();
    const hexes = (text: string) => new Set([...text.matchAll(/#[0-9a-f]{6}\b/gi)].map((m) => m[0].toLowerCase()));
    for (const [theme, part] of [
      ['light', light],
      ['dark', dark ?? ''],
    ] as const) {
      const used = hexes(part);
      const values = new Set(Object.values(PALETTE[theme]));
      expect([...used].filter((hex) => !values.has(hex))).toEqual([]);
      expect(used).toContain(PALETTE[theme].you);
      expect(used).toContain(PALETTE[theme].other);
    }
  });
});
