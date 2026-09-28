# Fonts

Self-hosted variable fonts, served through Astro's Fonts API with the `local` provider
(`astro.config.mjs`). Nothing is fetched from a CDN at build time or at runtime.

| File                                         | Family         | Axes       | Style  | Subset    |
| -------------------------------------------- | -------------- | ---------- | ------ | --------- |
| `newsreader-latin-standard-normal.woff2`     | Newsreader     | wght, opsz | normal | latin     |
| `newsreader-latin-ext-standard-normal.woff2` | Newsreader     | wght, opsz | normal | latin-ext |
| `newsreader-latin-standard-italic.woff2`     | Newsreader     | wght, opsz | italic | latin     |
| `newsreader-latin-ext-standard-italic.woff2` | Newsreader     | wght, opsz | italic | latin-ext |
| `inter-latin-standard-normal.woff2`          | Inter          | wght, opsz | normal | latin     |
| `inter-latin-ext-standard-normal.woff2`      | Inter          | wght, opsz | normal | latin-ext |
| `fraunces-latin-wght-normal.woff2`           | Fraunces       | wght       | normal | latin     |
| `fraunces-latin-ext-wght-normal.woff2`       | Fraunces       | wght       | normal | latin-ext |
| `fraunces-latin-wght-italic.woff2`           | Fraunces       | wght       | italic | latin     |
| `fraunces-latin-ext-wght-italic.woff2`       | Fraunces       | wght       | italic | latin-ext |
| `nunito-latin-wght-normal.woff2`             | Nunito         | wght       | normal | latin     |
| `nunito-latin-ext-wght-normal.woff2`         | Nunito         | wght       | normal | latin-ext |
| `jetbrains-mono-latin-wght-normal.woff2`     | JetBrains Mono | wght       | normal | latin     |
| `jetbrains-mono-latin-ext-wght-normal.woff2` | JetBrains Mono | wght       | normal | latin-ext |

**Provenance.** Copied unmodified from the npm tarballs `@fontsource-variable/newsreader@5.3.0`,
`@fontsource-variable/inter@5.3.0` and `@fontsource-variable/jetbrains-mono@5.3.0` (`files/`). Fraunces
and Nunito, for the film (ADR 0027), come the same way from `@fontsource-variable/fraunces@5.3.0` and
`@fontsource-variable/nunito@5.3.0`, weight axis only (`wght`): the full Fraunces axes would add about
66 KB to the first load, over the budget of ADR 0025. Their ranges come from each package's
`wght.css`, identical to the others. The
packages are not dependencies of this project. Unicode ranges in `astro.config.mjs` come from each
package's `standard.css` (`wght.css` for JetBrains Mono, whose ranges are the same).

JetBrains Mono is used only by the code blocks of `/how-its-built` and is never preloaded
(ADR 0027). Its two files weigh 40,404 bytes (`latin`) and 15,196 bytes (`latin-ext`).

The film's first load carries Fraunces (36,620 bytes normal, 45,656 italic) and Nunito (39,128 bytes),
`latin` only: 121,404 bytes. Spanish needs no `latin-ext`.

Newsreader and Inter stay until the film replaces every component that uses them (P1–P4).

**License.** SIL Open Font License 1.1: [`OFL-newsreader.txt`](OFL-newsreader.txt),
[`OFL-inter.txt`](OFL-inter.txt), [`OFL-jetbrains-mono.txt`](OFL-jetbrains-mono.txt),
[`OFL-fraunces.txt`](OFL-fraunces.txt), [`OFL-nunito.txt`](OFL-nunito.txt).
