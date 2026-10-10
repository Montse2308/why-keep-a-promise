// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { WORKING_PAPER } from './src/config.ts';
import { findingUnlocked } from './src/lib/lock.ts';

// Unicode ranges copied from each @fontsource-variable package's wght.css (src/assets/fonts/README.md).
const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'.split(',');
const LATIN_EXT =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'.split(',');

/**
 * One @font-face per subset and style of a self-hosted variable font, weight axis only.
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
      src: [`./src/assets/fonts/${file}-${subset}-wght-${style}.woff2`],
      weight,
      style,
      unicodeRange,
    })),
  );
}

/**
 * What the lock keeps out of a build while it is closed (ADR 0034), each with the stub it resolves
 * to: the curve, /finding's guilt chart and its own components, chapter 7's finding and the finding's
 * part of /sources render nothing, and the film's timeline knows no beats past the sealed envelope. Paths from the project's
 * root.
 */
const LOCKED_MODULES = {
  '/src/components/curve/Curve.astro': '/src/components/curve/Locked.astro',
  '/src/components/curve/GuiltChart.astro': '/src/components/curve/Locked.astro',
  '/src/components/film/chapters/Finding.astro': '/src/components/curve/Locked.astro',
  '/src/components/notebook/SourcesFinding.astro': '/src/components/curve/Locked.astro',
  // /finding's own components (ADR 0037).
  '/src/components/finding/MinuteLinks.astro': '/src/components/curve/Locked.astro',
  '/src/components/finding/Cite.astro': '/src/components/curve/Locked.astro',
  '/src/components/finding/FindingProse.astro': '/src/components/curve/Locked.astro',
  '/src/lib/film/finding.ts': '/src/lib/film/finding.locked.ts',
};

/**
 * The lock at build time (ADR 0034). While it is closed, every module of `LOCKED_MODULES` resolves
 * to its stub, so its markup, script and data are not in the build at all; rendering a component
 * conditionally is not enough, because Astro bundles the script of every imported component. The
 * dev server is always unlocked, so the plugin only applies to builds.
 * @returns {import('vite').Plugin}
 */
function lockFinding() {
  const names = new Set(Object.keys(LOCKED_MODULES).map((path) => path.split('/').at(-1)?.replace(/\.ts$/, '')));
  return {
    name: 'lock-finding',
    apply: 'build',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (findingUnlocked(WORKING_PAPER.ssrn, false) || !names.has(source.split('/').at(-1)?.replace(/\.ts$/, ''))) return null;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      const id = resolved?.id.replace(/\\/g, '/');
      const locked = Object.keys(LOCKED_MODULES).find((path) => id?.endsWith(path));
      if (!id || !locked) return null;
      // The stub sits under the same root as the module it stands in for.
      const root = id.slice(0, id.length - locked.length);
      return this.resolve(`${root}${LOCKED_MODULES[/** @type {keyof typeof LOCKED_MODULES} */ (locked)]}`, importer, { ...options, skipSelf: true });
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
  // The faces of the film and the notebook (ADR 0027): Fraunces for display and headings, Nunito for text and
  // interface, weight axis only, to keep the first load within budget (ADR 0025); mono is code.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Fraunces',
      cssVariable: '--font-display',
      fallbacks: ['Georgia', 'serif'],
      display: 'swap',
      options: {
        variants: /** @type {any} */ (variants('fraunces', '100 900', ['normal', 'italic'])),
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Nunito',
      cssVariable: '--font-body',
      fallbacks: ['system-ui', 'sans-serif'],
      display: 'swap',
      options: {
        variants: /** @type {any} */ (variants('nunito', '200 1000', ['normal'])),
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
        variants: /** @type {any} */ (variants('jetbrains-mono', '100 800', ['normal'])),
      },
    },
  ],
});
