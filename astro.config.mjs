// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// Unicode ranges copied from each @fontsource-variable package's standard.css (src/assets/fonts/README.md).
const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'.split(',');
const LATIN_EXT =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'.split(',');

/**
 * One @font-face per subset and style of a self-hosted variable font.
 * @param {string} file file prefix in src/assets/fonts/
 * @param {string} weight variable weight range
 * @param {Array<'normal' | 'italic'>} styles
 */
function variants(file, weight, styles) {
  return styles.flatMap((style) =>
    /** @type {const} */ ([
      ['latin', LATIN],
      ['latin-ext', LATIN_EXT],
    ]).map(([subset, unicodeRange]) => ({
      src: [`./src/assets/fonts/${file}-${subset}-standard-${style}.woff2`],
      weight,
      style,
      unicodeRange,
    })),
  );
}

// https://astro.build/config
export default defineConfig({
  site: 'https://montse2308.github.io',
  base: '/why-keep-a-promise',
  output: 'static',
  // Every internal URL ends in "/" so it matches what GitHub Pages serves.
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  // Serif is what you read (prose, headings); sans is what you touch (the table, UI). ADR 0014.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Newsreader',
      cssVariable: '--font-serif',
      fallbacks: ['Georgia', 'serif'],
      display: 'swap',
      options: {
        variants: /** @type {any} */ (variants('newsreader', '200 800', ['normal', 'italic'])),
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Inter',
      cssVariable: '--font-sans',
      fallbacks: ['system-ui', 'sans-serif'],
      display: 'swap',
      options: {
        variants: /** @type {any} */ (variants('inter', '100 900', ['normal'])),
      },
    },
  ],
});
