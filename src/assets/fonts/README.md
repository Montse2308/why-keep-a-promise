# Fonts

Self-hosted variable fonts, served through Astro's Fonts API with the `local` provider
(`astro.config.mjs`). Nothing is fetched from a CDN at build time or at runtime.

| File                                         | Family     | Axes        | Style  | Subset    |
| -------------------------------------------- | ---------- | ----------- | ------ | --------- |
| `newsreader-latin-standard-normal.woff2`     | Newsreader | wght, opsz  | normal | latin     |
| `newsreader-latin-ext-standard-normal.woff2` | Newsreader | wght, opsz  | normal | latin-ext |
| `newsreader-latin-standard-italic.woff2`     | Newsreader | wght, opsz  | italic | latin     |
| `newsreader-latin-ext-standard-italic.woff2` | Newsreader | wght, opsz  | italic | latin-ext |
| `inter-latin-standard-normal.woff2`          | Inter      | wght, opsz  | normal | latin     |
| `inter-latin-ext-standard-normal.woff2`      | Inter      | wght, opsz  | normal | latin-ext |

**Provenance.** Copied unmodified from the npm tarballs `@fontsource-variable/newsreader@5.3.0`
and `@fontsource-variable/inter@5.3.0` (`files/`). The packages are not dependencies of this
project. Unicode ranges in `astro.config.mjs` come from each package's `standard.css`.

**License.** SIL Open Font License 1.1: [`OFL-newsreader.txt`](OFL-newsreader.txt),
[`OFL-inter.txt`](OFL-inter.txt).
