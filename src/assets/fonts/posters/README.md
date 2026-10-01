# Poster fonts

Static TrueType cuts of the site's faces, used only at build time to draw the posters a shared link
shows (ADR 0025, `src/lib/posters/`). The renderer, `@resvg/resvg-js`, reads TrueType and not
woff2, and it does not apply a variable font's axes, so the site's variable woff2 files cannot serve.
These files never reach `dist/`: the visitor gets the posters as PNG.

| File                            | Family (as the file names it) | Weight | Style  | Subset | Sets                     |
| ------------------------------- | ----------------------------- | ------ | ------ | ------ | ------------------------ |
| `fraunces-latin-900-italic.ttf` | Fraunces                      | 900    | italic | latin  | the page's title         |
| `fraunces-latin-800-normal.ttf` | Fraunces                      | 800    | normal | latin  | the site's question      |
| `nunito-latin-800-normal.ttf`   | Nunito ExtraLight             | 800    | normal | latin  | the project's name       |

**Provenance.** Downloaded unmodified from Fontsource's CDN, version 5.3.0 of each family
(`https://cdn.jsdelivr.net/fontsource/fonts/fraunces@5.3.0/latin-900-italic.ttf`,
`.../fraunces@5.3.0/latin-800-normal.ttf`, `.../nunito@5.3.0/latin-800-normal.ttf`): the same
families and version as the site's files (`../README.md`). Fontsource's static Nunito instances carry
the family name «Nunito ExtraLight» whatever their weight, so the posters ask for that name
(`POSTER_FONTS` in `src/lib/posters/poster.ts`).

SHA-256:

```
9ebb72d830068f485baeef12fb9956a88a11cc9fafd21ddf36a6773345b4a9de  fraunces-latin-900-italic.ttf
feeed05961a51f553d11a72280e182f62930cb14595adfd7de8bf4075eec78c5  fraunces-latin-800-normal.ttf
1804f686f4a8fe643b997ca5fee109c2e9e27dc6b53b871f1ddc35a58e99005e  nunito-latin-800-normal.ttf
```

**License.** SIL Open Font License 1.1: [`../OFL-fraunces.txt`](../OFL-fraunces.txt),
[`../OFL-nunito.txt`](../OFL-nunito.txt).
