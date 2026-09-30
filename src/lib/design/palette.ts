/**
 * Single source of the site's colour values (ADR 0018). `src/styles/tokens.css` must carry exactly
 * these values; `palette.test.ts` checks that, the WCAG contrast of every pair below, and that the
 * two roles, and the two main lines of the curve, stay apart under protanopia and deuteranopia. The
 * film has its own colours, in ./film.ts.
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
  'series-1',
  'series-2',
  'series-3',
] as const;
export type ColorToken = (typeof COLOR_TOKENS)[number];

/** The paper: everything that is read, in the visitor's theme. */
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
    // The curve on the notebook's paper (/finding). Neutral names, so the always-shipped tokens.css says nothing about the chart.
    'series-1': '#8e2f6e', // berry: personal guilt, the emphasised line
    'series-2': '#7d6400', // ochre: partner-specific commitment
    'series-3': '#008a7e', // teal: general guilt, the control, dotted
  },
  dark: {
    bg: '#1c1915', // warm ink
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
    'series-1': '#c472a6',
    'series-2': '#a88619',
    'series-3': '#16a39b',
  },
};

/** WCAG 2.2: 4.5:1 for text (1.4.3), 3:1 for graphics and interface boundaries (1.4.11). */
export const MIN_CONTRAST = { text: 4.5, graphic: 3 } as const;

export interface ContrastPair<T extends string = ColorToken> {
  readonly fg: T;
  readonly bg: T;
  readonly kind: keyof typeof MIN_CONTRAST;
  readonly use: string;
}

/** Every foreground/background pair on paper. `border` is decorative and not listed. */
export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  { fg: 'fg', bg: 'bg', kind: 'text', use: 'body text' },
  { fg: 'fg', bg: 'surface', kind: 'text', use: 'text on figures and buttons' },
  { fg: 'fg', bg: 'surface-hover', kind: 'text', use: 'button text on hover' },
  { fg: 'muted', bg: 'bg', kind: 'text', use: 'secondary text' },
  { fg: 'muted', bg: 'surface', kind: 'text', use: 'secondary text on a figure' },
  { fg: 'muted', bg: 'surface-hover', kind: 'text', use: 'option terms on a hovered button' },
  { fg: 'you', bg: 'bg', kind: 'text', use: 'role "you": label and marker' },
  { fg: 'you', bg: 'surface', kind: 'text', use: 'role "you" on a figure' },
  { fg: 'other', bg: 'bg', kind: 'text', use: 'role "other": label and marker' },
  { fg: 'other', bg: 'surface', kind: 'text', use: 'role "other" on a figure' },
  { fg: 'you', bg: 'surface-hover', kind: 'graphic', use: 'role marks in a hovered option' },
  { fg: 'other', bg: 'surface-hover', kind: 'graphic', use: 'role marks in a hovered option' },
  { fg: 'promise', bg: 'bg', kind: 'text', use: 'promise accent' },
  { fg: 'promise', bg: 'surface', kind: 'text', use: 'promise accent on a figure' },
  { fg: 'control', bg: 'bg', kind: 'graphic', use: 'control outlines' },
  { fg: 'control', bg: 'surface', kind: 'graphic', use: 'control outlines on a figure' },
  { fg: 'focus', bg: 'bg', kind: 'graphic', use: 'focus ring' },
  { fg: 'focus', bg: 'surface', kind: 'graphic', use: 'focus ring on a figure' },
  { fg: 'focus', bg: 'surface-hover', kind: 'graphic', use: 'focus ring on a hovered button' },
  { fg: 'series-1', bg: 'bg', kind: 'graphic', use: 'curve: personal guilt line and label mark' },
  { fg: 'series-1', bg: 'surface', kind: 'graphic', use: 'curve: personal guilt line on the figure' },
  { fg: 'series-2', bg: 'bg', kind: 'graphic', use: 'curve: partner-specific commitment line' },
  { fg: 'series-2', bg: 'surface', kind: 'graphic', use: 'curve: partner-specific commitment line on the figure' },
  { fg: 'series-3', bg: 'bg', kind: 'graphic', use: 'curve: general guilt dotted line' },
  { fg: 'series-3', bg: 'surface', kind: 'graphic', use: 'curve: general guilt dotted line on the figure' },
];

/** Minimum CIE76 ΔE between two colours after simulating each colour-vision deficiency. */
export const MIN_DISTANCE = {
  /** The two roles must never be confused. */
  roles: 40,
  /** The promise accent must stay apart from both roles. */
  promise: 20,
  /** Personal guilt and partner-specific commitment, the two lines the curve compares. */
  series: 40,
  /** Every curve colour against every role colour and the promise accent, in typical vision. */
  seriesFromRoles: 20,
} as const;

/** The curve's colours. General guilt (series-3) is also told apart by its dotted pattern. */
export const SERIES_TOKENS = ['series-1', 'series-2', 'series-3'] as const satisfies readonly ColorToken[];
