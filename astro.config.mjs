// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { MANUSCRIPT_STATUS } from './src/config.ts';
import { findingUnlocked } from './src/lib/lock.ts';

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
 * @param {'standard' | 'wght'} [axes] the package's file infix: every axis, or weight only
 */
function variants(file, weight, styles, axes = 'standard') {
  return styles.flatMap((style) =>
    /** @type {const} */ ([
      ['latin', LATIN],
      ['latin-ext', LATIN_EXT],
    ]).map(([subset, unicodeRange]) => ({
      src: [`./src/assets/fonts/${file}-${subset}-${axes}-${style}.woff2`],
      weight,
      style,
      unicodeRange,
    })),
  );
}

/**
 * Act 5's lock at build time (ADR 0015). While it is locked, the curve component resolves to an
 * empty stub, so its markup, script and data are not in the build at all; rendering it
 * conditionally is not enough, because Astro bundles the script of every imported component. The
 * dev server is always unlocked, so the plugin only applies to builds.
 * @returns {import('vite').Plugin}
 */
function lockFinding() {
  const curve = '/src/components/curve/Curve.astro';
  return {
    name: 'lock-finding',
    apply: 'build',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (findingUnlocked(MANUSCRIPT_STATUS, false) || !source.endsWith('/Curve.astro')) return null;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (!resolved?.id.replace(/\\/g, '/').endsWith(curve)) return null;
      // The stub sits next to the component, so it resolves the same way.
      return this.resolve(source.replace(/Curve\.astro$/, 'Locked.astro'), importer, { ...options, skipSelf: true });
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://montse2308.github.io',
  base: '/why-keep-a-promise',
  output: 'static',
  vite: {
    plugins: [lockFinding()],
  },
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
  // Code blocks keep Markdown's plain <pre><code>: no syntax colours outside the palette.
  markdown: {
    syntaxHighlight: false,
  },
  // Serif is what you read (prose, headings); sans is what you touch (the table, UI); mono is code. ADR 0014.
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
    // The film's faces (ADR 0027): Fraunces for display, Nunito for text and interface. Weight axis only, to
    // keep the first load within budget (ADR 0025); they replace Newsreader and Inter as the film lands (P1).
    {
      provider: fontProviders.local(),
      name: 'Fraunces',
      cssVariable: '--font-display',
      fallbacks: ['Georgia', 'serif'],
      display: 'swap',
      options: {
        variants: /** @type {any} */ (variants('fraunces', '100 900', ['normal', 'italic'], 'wght')),
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Nunito',
      cssVariable: '--font-body',
      fallbacks: ['system-ui', 'sans-serif'],
      display: 'swap',
      options: {
        variants: /** @type {any} */ (variants('nunito', '200 1000', ['normal'], 'wght')),
      },
    },
    // Code blocks only, on /how-its-built; never preloaded (ADR 0027).
    {
      provider: fontProviders.local(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      fallbacks: ['ui-monospace', 'monospace'],
      display: 'swap',
      options: {
        variants: /** @type {any} */ (variants('jetbrains-mono', '100 800', ['normal'], 'wght')),
      },
    },
  ],
});
