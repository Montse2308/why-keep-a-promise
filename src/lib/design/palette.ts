/**
 * Single source of the site's colour values (ADR 0014). `src/styles/tokens.css` must carry exactly
 * these values; `palette.test.ts` checks that, the WCAG contrast of every pair below, and that the
 * two roles stay apart under protanopia and deuteranopia.
 */

export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

/** Each token is the CSS custom property `--color-<token>`. */
export const COLOR_TOKENS = [
  'bg',
  'surface',
  'surface-hover',
  'fg',
  'muted',
  'border',
  'control',
  'focus',
  'you',
  'other',
  'promise',
] as const;
export type ColorToken = (typeof COLOR_TOKENS)[number];

export const PALETTE: Record<Theme, Record<ColorToken, string>> = {
  light: {
    bg: '#f6f1e7', // warm paper
    surface: '#fbf8f2',
    'surface-hover': '#efe8da',
    fg: '#221d17', // warm ink
    muted: '#5e564a',
    border: '#ddd4c4', // hairline rules only; never the sole boundary of a control
    control: '#857b6c', // control outlines, die and meter strokes
    focus: '#221d17',
    you: '#23508f', // ink blue
    other: '#a4432a', // terracotta
    promise: '#56636b', // slate: neutral, apart from both roles
  },
  dark: {
    bg: '#1c1915', // warm ink, not pure black
    surface: '#25211c',
    'surface-hover': '#2f2a23',
    fg: '#ede5d6',
    muted: '#b1a794',
    border: '#3e382f',
    control: '#8a806f',
    focus: '#ede5d6',
    you: '#8db4ea',
    other: '#e8906d',
    promise: '#aab4bb',
  },
};

/** WCAG 2.2: 4.5:1 for text (1.4.3), 3:1 for graphics and interface boundaries (1.4.11). */
export const MIN_CONTRAST = { text: 4.5, graphic: 3 } as const;

export interface ContrastPair {
  readonly fg: ColorToken;
  readonly bg: ColorToken;
  readonly kind: keyof typeof MIN_CONTRAST;
  readonly use: string;
}

/** Every foreground/background pair the page uses. `border` is decorative and not listed. */
export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  { fg: 'fg', bg: 'bg', kind: 'text', use: 'body text' },
  { fg: 'fg', bg: 'surface', kind: 'text', use: 'text on the table and buttons' },
  { fg: 'fg', bg: 'surface-hover', kind: 'text', use: 'button text on hover' },
  { fg: 'muted', bg: 'bg', kind: 'text', use: 'secondary text' },
  { fg: 'muted', bg: 'surface', kind: 'text', use: 'secondary text on the table' },
  { fg: 'muted', bg: 'surface-hover', kind: 'text', use: 'option terms on a hovered button' },
  { fg: 'you', bg: 'bg', kind: 'text', use: 'role "you": label and marker' },
  { fg: 'you', bg: 'surface', kind: 'text', use: 'role "you" on the table' },
  { fg: 'other', bg: 'bg', kind: 'text', use: 'role "other": label and marker' },
  { fg: 'other', bg: 'surface', kind: 'text', use: 'role "other" on the table, meter fill' },
  { fg: 'you', bg: 'surface-hover', kind: 'graphic', use: 'role marks in a hovered option' },
  { fg: 'other', bg: 'surface-hover', kind: 'graphic', use: 'role marks in a hovered option' },
  { fg: 'promise', bg: 'bg', kind: 'text', use: 'promise accent' },
  { fg: 'promise', bg: 'surface', kind: 'text', use: 'promise accent on the table' },
  { fg: 'control', bg: 'bg', kind: 'graphic', use: 'control outlines' },
  { fg: 'control', bg: 'surface', kind: 'graphic', use: 'die and meter strokes' },
  { fg: 'focus', bg: 'bg', kind: 'graphic', use: 'focus ring' },
  { fg: 'focus', bg: 'surface', kind: 'graphic', use: 'focus ring on the table' },
  { fg: 'focus', bg: 'surface-hover', kind: 'graphic', use: 'focus ring on a hovered button' },
];

/** Minimum CIE76 ΔE between two colours after simulating each colour-vision deficiency. */
export const MIN_DISTANCE = {
  /** The two roles must never be confused. */
  roles: 40,
  /** The promise accent must stay apart from both roles. */
  promise: 20,
} as const;
