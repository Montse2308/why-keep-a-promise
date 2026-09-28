# AGENTS.md

Single source of instructions for any agent (Claude, Copilot, others) working in this repository.
`CLAUDE.md` and `.github/copilot-instructions.md` only point here.

## What this is

The outreach page of a personal research project on why people keep promises that no longer pay.
A portfolio piece in two layers (ADR 0021):

- **The film.** The home (`/`, `/es/`) is a short scroll-driven film in nine chapters on one paper
  stage whose light changes continuously. It goes from the prisoner's dilemma to cheap talk, to
  Vanberg's (2008) partner-switching game, to Montse's research, and ends with the manuscript
  stamp. Internal name: "Te lo prometo" / "I promise".
- **The notebook.** The depth, one tap away from anywhere: `/dilemma`, `/vanberg`, `/finding`,
  `/how-its-built`, `/sources`, `/about` (ADR 0024).

It is **not** a simulator and **not** the instrument of a paper. Details: `docs/plan.md`.

**Where things stand.** The plan was rebuilt with Montse in P0 (ADR 0021–0026). `src/` is still the
previous version (six acts, the act 1 scene, the table on a dark stage). From P1 on, the film
replaces it chapter by chapter; each chapter removes what it replaces, in the same commit as its
tests.

## Reading order

Read these before changing anything, in this order:

1. `docs/plan.md`: what the page is (decided; do not reopen).
2. `docs/content-rules.md`: what may and may not be written, anywhere.
3. `docs/phases.md`: phases P0–P6, then F5 (QA) and F6 (launch), with their exit criteria.
4. `docs/tasks.md`: current tasks; only work on the active phase.
5. `docs/decisions/README.md` and the ADRs it lists. Every ADR in `docs/decisions/` is in force in
   full. A decision changes only through a new ADR; a superseded ADR moves to `docs/archivo/`.

`docs/archivo/` is history: never follow it as a rule. `docs/prototipo/` holds the round-4 prototype
as a visual reference; it is not site code.

Work only on what the current session authorises. If two instructions conflict, stop and ask.
Every phase ends with a video or screenshots for Montse (360 and 1440 px): she reviews by looking,
not by reading test output.

## Commands

| Command           | What it does                                      |
| ----------------- | ------------------------------------------------- |
| `npm ci`          | Install exact dependencies                        |
| `npm run dev`     | Dev server at `http://localhost:4321/why-keep-a-promise/` |
| `npm run check`   | `astro check` + `tsc --noEmit`                    |
| `npm test`        | Vitest, once                                      |
| `npm run build`   | Static build into `dist/`                         |
| `npm run preview` | Serve `dist/` locally                             |
| `npm run verify:dist` | After `build`: fails if locked content reached `dist/`, or if the status sentence is off (ADR 0026) |

`check`, `test`, `build` and `verify:dist` must be green before every commit. CI
(`.github/workflows/ci.yml`) runs install → check → test → build → verify:dist on every push and PR.

## Stack (ADR 0025)

- Astro, 100 % static output. TypeScript strict. No UI framework, no Tailwind.
- Progressive enhancement: Astro renders a storyboard in HTML (each chapter as a still frame with
  its captions); one client script turns it into the film. Without JS, the storyboard is the page.
- Our own scene engine in `src/lib/film/` (tracks, easing, colour interpolation, camera fit), pure
  and tested. Native scroll: no snapping, no wheel or touch capture.
- Logic lives in pure modules with Vitest tests (`src/lib/`).
- CSS with tokens (`src/styles/tokens.css`, mirroring `src/lib/design/palette.ts`). Self-hosted
  fonts: Fraunces and Nunito from P1 (ADR 0027), JetBrains Mono for code only.
- Sound: optional, off by default, synthesised with Web Audio.
- Budgets: home JS ≤ 40 KB gzipped, first load ≤ 450 KB, LCP ≤ 2.5 s on a mid-range phone.
- The only new dependency the plan allows is `@resvg/resvg-js`, as a dev dependency, for Open Graph
  posters (P6). Anything else: ask first. Check current versions with the official tools; never pin
  versions from memory.
- Hosting: GitHub Pages at `https://montse2308.github.io/why-keep-a-promise/`. Zero budget.

## Map

The current code is the previous version. The film's pieces are marked **(P1+)**: they arrive from
P1 on and replace the previous ones.

```
src/
  config.ts              author links, manuscript status (it also opens the lock)
  content.config.ts      content collections (frontmatter schemas)
  content/acts/{en,es}/  previous version: act prose; replaced by content/chapters/ (P1–P4)
  content/chapters/{en,es}/  (P1+) the film's captions and dialogue, one file per chapter
  content/subpages/{en,es}/  notebook prose; <!-- slot:… --> and <!-- lock --> markers
  content/sections/{en,es}/  previous version: "The research" and "About" on the home; retired in P4
  content/figures.ts     every figure and citation the prose may use, keyed to docs/sources.md
  data/curve.json        the engine's precomputed curve, copied with provenance; never edited (ADR 0010)
  i18n/en.json, es.json  UI strings, flat keys, full parity
  lib/                   pure, tested modules
    i18n.ts              typed t(); fails check and build on key mismatch
    locales.ts           locale list, no dictionary imports (safe for client scripts)
    routes.ts            buildHref/href/assetHref: every internal link goes through here
    lock.ts              the lock: full content only under review or in dev (ADR 0026)
    film/                (P1+) the scene engine: tracks, easing, colours, camera, chapter spans
    chapters.ts          (P1+) the nine chapters, their ids and order
    acts.ts, sections.ts previous version: the acts and the home's order
    design/              palette.ts (single source of colour values), colour maths
    subpages.ts          splits notebook prose at its slot and lock markers
    table/               Vanberg's game: exact payoffs (PAYOFFS), moment 2 logic, recipient beliefs,
                         real roll counts; scene.ts is the previous act 1 scene (retired in P1)
    pd/                  the prisoner's dilemma and its best reply (moves to chapter 1 in P2)
    curve/               reads curve.json (build time only), step-chart geometry, the curve control;
                         finding.ts: guilt, θ, c and robustness for /finding, behind the lock
    vanberg/             every cell of the switch treatment and the baselines, exact counts
  assets/fonts/          self-hosted woff2, OFL licences, provenance
  styles/                tokens.css, base.css
  components/            previous version: FirstScreen, Act, HomeSection, table/ (GameTable, Scene),
                         pd/BestResponse, vanberg/SwitchTable, curve/Curve + Locked (the stub a
                         locked build uses), LanguageSwitch, SiteFooter
                         (P1+) film/ (the stage, characters, chapters), notebook/ (the panel)
  layouts/BaseLayout.astro
  views/                 HomeView, SubpageView (shared by both locales)
  pages/                 thin wrappers for each route and locale
scripts/verify-dist.mjs  checks dist/ against the lock and the status sentence (ADR 0026)
tests/                   repo-level tests (page parity, prose figures and budgets, forbidden phrases,
                         curve and /finding figures, verify:dist markers, code quoted on
                         /how-its-built; previous-version tests are replaced with their code)
docs/                    plan, rules, phases, tasks, ADRs (Spanish, single copy); archivo/ = history;
                         prototipo/ = the round-4 prototype
scratch/                 local notes, git-ignored, never committed
```

## Rules

- **Languages.** Code, comments, commits, file names and `README.md` are in English;
  `README.es.md` is its copy. Everything in `docs/` is in Spanish, one copy only. The site has full
  EN/ES parity.
- **i18n.** UI text lives in keys in `src/i18n/*.json`; a key in one locale and not the other breaks
  the build. Chapter and notebook prose goes in Markdown per locale. The EN/ES switch is a plain link
  to the same route in the other locale: no stored preference, no redirect, no JavaScript (ADR 0013).
- **Links.** Every internal link uses `href()` / `buildHref()` / `assetHref()` from
  `src/lib/routes.ts`, so `base` (`/why-keep-a-promise`) is always respected. Never hard-code `/…`
  paths.
- **Placeholders.** Unwritten content is marked `TODO(Px)` with the phase that writes it
  (`TODO(launch)` for step 8 of the launch checklist).
- **Decisions.** A superseded ADR, even partly, moves to `docs/archivo/decisiones/` with a line
  naming what replaces it; what still holds is restated in the new ADR. Keep
  `docs/decisions/README.md` in sync.
- **Commits.** Small, in English, Conventional Commits. Do not push unless Montse asks.
- **Content.** Everything in `docs/content-rules.md` applies to every file, including code comments,
  commit messages and tests.

## Prohibited

- **Publishing the result.**
  - No curve data, no saying which motive pays where, and no content from the finding beyond the
    status sentence, except behind the lock (ADR 0026).
  - The lock covers chapter 7's finding, `/finding`, the engine part of `/how-its-built`, and the
    links to them and to the engine repository.
  - Model parameters never appear, except θ, c, the guilt available and the robustness variant on
    `/finding`, behind the lock.
  - Outside the lock, chapter 7 says only the question and that Montse built a simulation engine in
    TypeScript. Nothing about the engine's tests, seed, generations, imitation or provenance
    (rule (j)).
  - The manuscript status sentence is never reworded or added to, even as the stamp (rule (b)).
  - Do not change the repository's visibility, do not enable GitHub Pages, and do not run
    `deploy.yml` (manual-only, F6).
- **Copying the manuscript or the paper's context.** Do not read or copy the manuscript or its
  working files, wherever they live (local folders, Drive). If something is missing, ask.
- **Importing the engine.** The engine repository (`Montse2308/Dilema-del-Prisionero` on GitHub,
  local folder `dilema-prisionero`) is never opened, added as a dependency, submodule or alias, and
  no file is copied from it. Its output reaches this repo only as `src/data/curve.json` (ADR 0010).
- **Visuals and games outside ADR 0023/0027.**
  - No WebGL, WebGPU, PixiJS, canvas, GSAP or Lottie.
  - No visualising populations or dynamics: no agents, grids or one dot per person.
  - No playable repeated prisoner's dilemma anywhere: link to *The Evolution of Trust* instead. The
    dilemma in chapter 1 is played once.
  - No charts beyond chapter 7's curve and `/finding`'s guilt chart, both behind the lock.
  - No interaction outside the list in ADR 0023.
  - The scroll is never hijacked.
- **Naming the journal** the manuscript was submitted to, submission dates or correspondence with
  authors, in any file. Third-party references carry their journal, as any bibliography (ADR 0016).
- **Inventing personal data** (display name, profile URLs, email, photo, school, job, city,
  biography). `/about` carries only the name, GitHub and LinkedIn.
- **Caricaturing a real person** as a character.
- Writing chapter or notebook prose outside the phase that owns it.
- Adding dependencies outside ADR 0025 without asking.
