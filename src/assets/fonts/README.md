# Fonts

Self-hosted variable fonts, served through Astro's Fonts API with the `local` provider
(`astro.config.mjs`). Nothing is fetched from a CDN at build time or at runtime.

| File                                         | Family         | Axes | Style  | Subset    |
| -------------------------------------------- | -------------- | ---- | ------ | --------- |
| `fraunces-latin-wght-normal.woff2`           | Fraunces       | wght | normal | latin     |
| `fraunces-latin-ext-wght-normal.woff2`       | Fraunces       | wght | normal | latin-ext |
| `fraunces-latin-wght-italic.woff2`           | Fraunces       | wght | italic | latin     |
| `fraunces-latin-ext-wght-italic.woff2`       | Fraunces       | wght | italic | latin-ext |
| `nunito-latin-wght-normal.woff2`             | Nunito         | wght | normal | latin     |
| `nunito-latin-ext-wght-normal.woff2`         | Nunito         | wght | normal | latin-ext |
| `jetbrains-mono-latin-wght-normal.woff2`     | JetBrains Mono | wght | normal | latin     |
| `jetbrains-mono-latin-ext-wght-normal.woff2` | JetBrains Mono | wght | normal | latin-ext |

**Provenance.** Copied unmodified from the npm tarballs `@fontsource-variable/fraunces@5.3.0`,
`@fontsource-variable/nunito@5.3.0` and `@fontsource-variable/jetbrains-mono@5.3.0` (`files/`),
weight axis only (`wght`): the full Fraunces axes would add about 66 KB to the first load, over the
budget of ADR 0025. The packages are not dependencies of this project. Unicode ranges in
`astro.config.mjs` come from each package's `wght.css`.

Fraunces sets the headings and Nunito the text and the interface, in the film and in the notebook
alike (ADR 0027). The first load carries Fraunces (36,620 bytes normal, 45,656 italic) and Nunito
(39,128 bytes), `latin` only: 121,404 bytes, the same three files on every page. Spanish needs no
`latin-ext`. Nunito has no italic file: emphasis in the text is drawn by the browser.

JetBrains Mono is used only by the code blocks of `/how-its-built` and is never preloaded
(ADR 0027). Its two files weigh 40,404 bytes (`latin`) and 15,196 bytes (`latin-ext`).

Newsreader and Inter, the faces of the previous version, left with its last component (P5).

**License.** SIL Open Font License 1.1: [`OFL-fraunces.txt`](OFL-fraunces.txt),
[`OFL-nunito.txt`](OFL-nunito.txt), [`OFL-jetbrains-mono.txt`](OFL-jetbrains-mono.txt).
