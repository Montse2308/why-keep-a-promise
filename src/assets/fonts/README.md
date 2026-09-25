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
| `jetbrains-mono-latin-wght-normal.woff2`     | JetBrains Mono | wght       | normal | latin     |
| `jetbrains-mono-latin-ext-wght-normal.woff2` | JetBrains Mono | wght       | normal | latin-ext |

**Provenance.** Copied unmodified from the npm tarballs `@fontsource-variable/newsreader@5.3.0`,
`@fontsource-variable/inter@5.3.0` and `@fontsource-variable/jetbrains-mono@5.3.0` (`files/`). The
packages are not dependencies of this project. Unicode ranges in `astro.config.mjs` come from each
package's `standard.css` (`wght.css` for JetBrains Mono, whose ranges are the same).

JetBrains Mono is used only by the code blocks of `/how-its-built` and is never preloaded
(ADR 0017). Its two files weigh 40,404 bytes (`latin`) and 15,196 bytes (`latin-ext`).

**License.** SIL Open Font License 1.1: [`OFL-newsreader.txt`](OFL-newsreader.txt),
[`OFL-inter.txt`](OFL-inter.txt), [`OFL-jetbrains-mono.txt`](OFL-jetbrains-mono.txt).
