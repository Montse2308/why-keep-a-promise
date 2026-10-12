# Why keep a promise that no longer pays?

[Español](README.es.md)

**[Open the site](https://whykeepapromise.org/)**

![Four frames of the page as the day goes by: the cover at dawn, with the title and its three doors, the prisoner's dilemma at midday, a new partner at the table in the afternoon while the thread of the promise still runs to the one who left, and the first table again at night.](.github/readme/film-en.webp)

An illustrated page, in English and Spanish, about why people keep promises that no longer pay
them, and the research that grew out of that question. By Montserrat Ximena Hernández Gallegos.

## On the site

The home opens on a cover with three doors.

- **The story.** Nine illustrated chapters that move with the scroll, from the prisoner's dilemma to
  the partner-switching experiment of Vanberg (2008). You play along the way: you promise or not,
  play one round of the dilemma, decide whether to roll the die, and guess the lab's result before
  you see it.
- **The research.** [The finding](https://whykeepapromise.org/finding/), on a
  page that stands on its own: the question, what was known and what is new, three worlds, a
  formula you can move, two more results, the limits and how to cite. Chapter 7 tells it inside the
  story.
- **The notebook**, one tap away: the dilemma, Vanberg's experiment, how it's built, the sources and
  the author.

## The research

A lab session cannot tell personal guilt from partner-specific commitment. Comparing worlds with
different background trust can.

- **The working paper:** *Promises to whom: Identifying personal guilt and partner-specific
  commitment across populations*, on [SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7580218),
  DOI [10.2139/ssrn.7580218](https://doi.org/10.2139/ssrn.7580218).
- **The simulation engine** behind every number:
  [Montse2308/promises-to-whom-engine](https://github.com/Montse2308/promises-to-whom-engine), release
  v1.0.0, DOI [10.5281/zenodo.23222610](https://doi.org/10.5281/zenodo.23222610).

## How it's built

- **A storyboard first.** Every page is static HTML. Without JavaScript the home is a storyboard:
  each chapter a still frame with its captions, every result written out. One script sets it moving
  with the native scroll, which it never captures.
- **A scene engine of its own.** Tracks, easing, colours mixed in OKLCH and a camera framed for each
  screen, written in TypeScript for this story: pure modules with their tests, no animation library
  and no canvas.
- **A formula you can move.** On /finding, the formula behind the result runs in the page: move
  background trust, the belief that a promise will be kept or how much guilt weighs, and the window
  where personal guilt keeps its word opens, shifts or closes. Its script loads only there.
- **The engine, live.** On /finding, the paper's simulation engine runs in your browser in three
  fixed worlds, with the paper's seeds, and a test checks it against the paper's runs. Its code loads
  only when you press "Run the engine".
- **For everyone, and private.** Every game works with the keyboard and announces its result to
  screen readers, and with reduced motion nothing spins. Nothing is stored or sent: no cookies, no
  analytics, and your choices in the story stay in the tab.
- **A lock outside the build.** Until the working paper was public on SSRN, the finding was left
  out of the build, not hidden, and `npm run verify:dist` read every built file and failed if any
  trace of it got through. The lock is open now, and the check still runs before every deploy.
- **Budgets and tests that stop the build.** CI fails if the home's JavaScript goes over 40 KiB
  gzipped, the fonts over 160 KiB or any page's first load over 450 KiB. Nearly 1,400 tests keep
  the payoffs as exact fractions, every figure tied to its source and English and Spanish in step.

The page tells the whole of it in
[How it's built](https://whykeepapromise.org/how-its-built/).

## Run it locally

Requires the Node.js version in [`.nvmrc`](.nvmrc).

```sh
npm ci
npm run dev      # http://localhost:4321/
npm run check    # astro check + tsc
npm test         # vitest
npm run build    # static site in dist/
npm run verify:dist  # the lock's checks on the built files
npm run budgets      # every page within its weight budget
```

Built with Astro, TypeScript and SVG. English at `/`, Spanish at `/es/`.

## How to cite

Hernández Gallegos, M. X. (2026). *Promises to whom: Identifying personal guilt and
partner-specific commitment across populations* [Working paper]. SSRN.
https://doi.org/10.2139/ssrn.7580218

The engine has its own citation in
[its repository](https://github.com/Montse2308/promises-to-whom-engine#how-to-cite).

## License

[MIT](LICENSE)
