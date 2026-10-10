# Why keep a promise that no longer pays?

[Español](README.es.md)

**[Open the site](https://montse2308.github.io/why-keep-a-promise/)**

![Four frames of the page as the day goes by: the cover at dawn, with the title and its three doors, the prisoner's dilemma at midday, a new partner at the table in the afternoon while the thread of the promise still runs to the one who left, and the first table again at night.](.github/readme/film-en.webp)

The outreach page of a personal research project on why people keep promises that no longer pay
them. The home opens on a cover with a door to each part of the page, then a short illustrated
story in nine chapters that moves with the scroll, from the prisoner's dilemma to the partner-switching game of Vanberg (2008),
and a notebook one tap away holds the depth.

## What is worth a look

- **A storyboard first.** Every page is static HTML. Without JavaScript the home is a storyboard:
  each chapter a still frame with its captions, every result written out. One script sets it moving
  with the native scroll, which it never captures.
- **A scene engine of its own.** Tracks, easing, colours mixed in OKLCH and a camera framed for each
  screen, written in TypeScript for this story: pure modules with their tests, no animation library
  and no canvas.
- **A lock outside the build.** Part of the site stays closed until the
  [working paper](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7580218) is public on SSRN. That part is left out of the build, not
  hidden, and `npm run verify:dist` reads every built file and fails if any trace of it got through.
- **Budgets and tests that stop the build.** CI fails if the home's JavaScript goes over 40 KiB
  gzipped, the fonts over 160 KiB or any page's first load over 450 KiB. More than 1,200 tests keep
  the payoffs as exact fractions, every figure tied to its source and English and Spanish in step.

The page tells how it is made in
[How it's built](https://montse2308.github.io/why-keep-a-promise/how-its-built/).

## Run it locally

Requires the Node.js version in [`.nvmrc`](.nvmrc).

```sh
npm ci
npm run dev      # http://localhost:4321/why-keep-a-promise/
npm run check    # astro check + tsc
npm test         # vitest
npm run build    # static site in dist/
npm run verify:dist  # nothing locked reached dist/
npm run budgets      # every page within its weight budget
```

Built with Astro, TypeScript and SVG. English at `/`, Spanish at `/es/`.

## License

[MIT](LICENSE)
