/** Colour maths for the palette tests: WCAG 2 contrast and colour-vision-deficiency checks. */

export type Rgb = readonly [number, number, number];

const HEX = /^#([0-9a-f]{6})$/i;

export function parseHex(hex: string): Rgb {
  const match = HEX.exec(hex);
  if (!match?.[1]) throw new Error(`Expected a #rrggbb colour, got "${hex}"`);
  const value = Number.parseInt(match[1], 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

/** sRGB channel (0–255) to linear light (0–1). */
function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function fromLinear(value: number): number {
  const v = Math.min(1, Math.max(0, value));
  const c = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
  return Math.round(c * 255);
}

/** WCAG 2 relative luminance. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map(toLinear) as unknown as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

export type Deficiency = 'protanopia' | 'deuteranopia';

// Machado, Oliveira & Fernandes (2009), severity 1.0, applied in linear RGB.
const CVD_MATRICES: Record<Deficiency, readonly [Rgb, Rgb, Rgb]> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
};

/** Simulates how a colour looks under a colour-vision deficiency. */
export function simulate(hex: string, deficiency: Deficiency): Rgb {
  const linear = parseHex(hex).map(toLinear);
  return CVD_MATRICES[deficiency].map((row) =>
    fromLinear(row.reduce((sum, weight, i) => sum + weight * (linear[i] ?? 0), 0)),
  ) as unknown as Rgb;
}

/** CIE L*a*b* (D65) of an sRGB colour. */
export function toLab(rgb: Rgb): Rgb {
  const [r, g, b] = rgb.map(toLinear) as unknown as Rgb;
  const xyz = [
    (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047,
    0.2126 * r + 0.7152 * g + 0.0722 * b,
    (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883,
  ].map((t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116)) as unknown as Rgb;
  return [116 * xyz[1] - 16, 500 * (xyz[0] - xyz[1]), 200 * (xyz[1] - xyz[2])];
}

/** CIE76 colour difference (ΔE*ab) between two sRGB colours. */
export function deltaE(a: Rgb, b: Rgb): number {
  const [l1, a1, b1] = toLab(a);
  const [l2, a2, b2] = toLab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}
