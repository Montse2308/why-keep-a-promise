/**
 * The notebook's paper (ADR 0024, ADR 0027): single source of its colour values. Unlike the film,
 * which owns its light (./film.ts), the notebook follows the visitor's theme: day paper in the light
 * theme, night paper in the dark one, both drawn from the film's ink, paper and golden thread.
 * `src/styles/tokens.css` must carry exactly these values; `palette.test.ts` checks that and the
 * WCAG contrast of every pair below, in both themes.
 */

export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

/** Each token is the CSS custom property `--color-<token>`. */
export const COLOR_TOKENS = ['bg', 'glow', 'surface', 'fg', 'muted', 'border', 'control', 'focus', 'accent'] as const;
export type ColorToken = (typeof COLOR_TOKENS)[number];

/** The paper: everything that is read, in the visitor's theme. */
export const PALETTE: Record<Theme, Record<ColorToken, string>> = {
  light: {
    bg: '#f9f0e1', // day paper, warm, with the film's grain over it
    glow: '#fbe3c8', // the top of the page, lit like the film's dawn
    surface: '#fffdf8', // figures and the panel: the film's card paper
    fg: '#1d1b3a', // the film's ink
    muted: '#5b5875',
    border: '#e7dcc8', // hairline rules only; never the sole boundary of a control
    control: '#857d98', // control outlines and link underlines
    focus: '#1d1b3a',
    accent: '#8a6500', // the golden thread's edge: small marks, never text alone
  },
  dark: {
    bg: '#1d1b3a', // night paper: the film's ink
    glow: '#2c2858', // the top of the page, as the film's nightfall
    surface: '#28264d',
    fg: '#fffaf0', // the film's paper rim
    muted: '#c4bfdc',
    border: '#3b3866',
    control: '#8e88b8',
    focus: '#f3bd46', // the golden thread
    accent: '#f3bd46',
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
  { fg: 'fg', bg: 'glow', kind: 'text', use: 'the title, at the top of the page' },
  { fg: 'fg', bg: 'surface', kind: 'text', use: 'text on figures and in the panel' },
  { fg: 'muted', bg: 'bg', kind: 'text', use: 'secondary text' },
  { fg: 'muted', bg: 'glow', kind: 'text', use: 'secondary text at the top of the page' },
  { fg: 'muted', bg: 'surface', kind: 'text', use: 'secondary text on a figure or in the panel' },
  { fg: 'control', bg: 'bg', kind: 'graphic', use: 'control outlines and link underlines' },
  { fg: 'control', bg: 'surface', kind: 'graphic', use: 'control outlines on a figure or in the panel' },
  { fg: 'focus', bg: 'bg', kind: 'graphic', use: 'focus ring' },
  { fg: 'focus', bg: 'glow', kind: 'graphic', use: 'focus ring at the top of the page' },
  { fg: 'focus', bg: 'surface', kind: 'graphic', use: 'focus ring on a figure or in the panel' },
  { fg: 'accent', bg: 'bg', kind: 'graphic', use: 'small marks: the current page, the thread' },
  { fg: 'accent', bg: 'surface', kind: 'graphic', use: 'small marks in the panel' },
  // /finding's guilt chart, behind the lock: its dots and its threshold are drawn in ink and in the control's colour.
  { fg: 'fg', bg: 'surface', kind: 'graphic', use: "guilt chart: personal guilt's dots" },
  { fg: 'control', bg: 'surface', kind: 'graphic', use: 'guilt chart: the threshold and the ticks' },
];
