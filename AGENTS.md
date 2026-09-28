# AGENTS.md

Single source of instructions for any agent (Claude, Copilot, others) working in this repository.
`CLAUDE.md` and `.github/copilot-instructions.md` only point here.

## What this is

The outreach page of a personal research project on why people keep promises that no longer pay.
A portfolio piece: one scrolling thread in six acts plus two sections ("The research" between acts
4 and 5, "About" at the end), one visual piece ("the table", Vanberg's 2008 partner-switching game),
English at `/` and Spanish at `/es/`. Act 1 is the hero: a scroll-bound scene played on the table
itself, the manuscript status as a stamp, and the author's name. It is **not** a simulator and
**not** the instrument of a paper. Details: `docs/plan.md`.

The page is being redesigned in phases R0–R4, between F4 and F5 (ADR 0018, 0019, 0020). R1 (the visual
system), R2 (the structure) and R3 (the scene) are in; R4 (shorter act prose) is next.

## Reading order

Read these before changing anything, in this order:

1. `docs/plan.md` — what the page is (decided; do not reopen).
2. `docs/content-rules.md` — what may and may not be written, anywhere.
3. `docs/phases.md` — phases F0–F6, the redesign phases R0–R4, and their exit criteria.
4. `docs/tasks.md` — current tasks; only work on the active phase.
5. `docs/decisions/` — ADRs. A decision changes only through a new ADR that supersedes it.

Work only on what the current session authorises. If two instructions conflict, stop and ask.

## Commands

| Command           | What it does                                      |
| ----------------- | ------------------------------------------------- |
| `npm ci`          | Install exact dependencies                        |
| `npm run dev`     | Dev server at `http://localhost:4321/why-keep-a-promise/` |
| `npm run check`   | `astro check` + `tsc --noEmit`                    |
| `npm test`        | Vitest, once                                      |
| `npm run build`   | Static build into `dist/`                         |
| `npm run preview` | Serve `dist/` locally                             |
| `npm run verify:dist` | After `build`: fails if locked content reached `dist/`, or if the status sentence is off (ADR 0015, ADR 0019) |

`check`, `test`, `build` and `verify:dist` must be green before every commit. CI
(`.github/workflows/ci.yml`) runs install → check → test → build → verify:dist on every push and PR.

## Stack

- Astro, 100 % static output. TypeScript strict. No UI framework, no Tailwind.
- Interactivity is TypeScript + SVG. Logic lives in pure modules with Vitest tests (`src/lib/`).
- CSS with tokens (`src/styles/tokens.css`), light/dark, `prefers-reduced-motion`. Self-hosted fonts.
- Hosting: GitHub Pages at `https://montse2308.github.io/why-keep-a-promise/`. Zero budget.
- Do not add dependencies outside this stack without asking. Check current versions with the official
  tools; never pin versions from memory.

## Map

```
src/
  config.ts              author links, manuscript status (it also opens act 5's lock)
  content.config.ts      the acts, subpages and sections content collections (frontmatter schemas)
  content/acts/{en,es}/  act prose in Markdown, one file per act (F2)
  content/subpages/{en,es}/  subpage prose, one file per subpage (F4); <!-- slot:… --> and <!-- lock -->
  content/sections/{en,es}/  research.md and about.md, the home sections that are not acts (ADR 0019)
  content/figures.ts     every figure and citation the prose may use, keyed to docs/sources.md
  data/curve.json        the engine's precomputed curve, copied with provenance; never edited (ADR 0010)
  i18n/en.json, es.json  UI strings, flat keys, full parity
  lib/                   pure, tested modules
    i18n.ts              typed t(); fails check and build on key mismatch
    locales.ts           locale list, no dictionary imports (safe for client scripts)
    routes.ts            buildHref/href/assetHref: every internal link goes through here
    acts.ts              the six acts, their ids and subpage links
    sections.ts          the home page's order: the acts, "The research" after act 4, "About" last
    template.ts          fill({name}) placeholders in UI strings
    lock.ts              act 5's lock: full content only under review or in dev (ADR 0015)
    design/              palette.ts (single source of colour values: the paper in two themes, and
                         the stage, always dark; ADR 0018), colour maths
    subpages.ts          splits subpage and section prose at its slot and lock markers (ADR 0017)
    table/               game logic for the table: exact payoffs, moments 1–2 state machines;
                         scene.ts: act 1's scene, its beats, scroll stops, captions and payoffs
    curve/               reads curve.json (build time only), step-chart geometry, moment 3 logic;
                         finding.ts: guilt, θ, c and robustness for /finding, behind the lock
    pd/                  the prisoner's dilemma and /dilemma's best-reply state machine
    vanberg/             every cell of the switch treatment and the baselines, exact counts
  assets/fonts/          self-hosted woff2 (Newsreader, Inter, JetBrains Mono), OFL licences, provenance
  styles/                tokens.css (mirrors palette.ts, test-checked; its .stage block redefines
                         the tokens on the stage), base.css (.stage, .display, the prose column)
  components/            LanguageSwitch (the first screen's corner and the footer), SiteFooter, Act,
                         FirstScreen (act 1: the status stamp, the author, the link to the research),
                         HomeSection + SectionSegments ("The research", its links behind the lock;
                         "About"),
                         table/GameTable + controller.ts (always on the stage; client script,
                         moments 1–2), table/Scene (act 1's scene: SVG and scroll-bound CSS, no
                         script; the still version by default, ADR 0020),
                         curve/Curve + controller.ts (act 5's chart and moment 3, and /finding's
                         guilt chart, behind the lock), curve/Locked (the empty stub a locked build
                         uses instead), pd/BestResponse + controller.ts (/dilemma's best reply),
                         vanberg/SwitchTable (/vanberg's table)
  layouts/BaseLayout.astro
  views/                 HomeView, SubpageView (shared by both locales)
  pages/                 thin wrappers: / and /es/, plus four subpages each
scripts/verify-dist.mjs  checks dist/ against the lock: act 5, /finding, the engine on /how-its-built,
                         the research links; and the status sentence, twice on each home page
tests/                   repo-level tests (page parity, prose figures and budgets, rule (h), forbidden
                         phrases, curve and /finding figures against curve.json, verify:dist markers,
                         code quoted on /how-its-built, act 1's scene and its CSS against rule (k))
docs/                    plan, rules, phases, tasks, ADRs (Spanish, single copy)
scratch/                 local notes, git-ignored, never committed
```

## Rules

- **Languages.** Code, comments, commits, file names and `README.md` in English; `README.es.md` is its
  copy. Everything in `docs/` is in Spanish, one copy only. The site has full EN/ES parity.
- **i18n.** UI text lives in keys in `src/i18n/*.json`; a key in one locale and not the other breaks
  the build. Act prose goes in Markdown per locale (from F2). The EN/ES switch is a plain link to the
  same route in the other locale: no stored preference, no redirect, no JavaScript (ADR 0013).
- **Links.** Every internal link uses `href()` / `buildHref()` / `assetHref()` from `src/lib/routes.ts`,
  so `base` (`/why-keep-a-promise`) is always respected. Never hard-code `/…` paths.
- **Placeholders.** Unwritten content is marked `TODO(Fx)` with the phase that writes it.
- **Commits.** Small, in English, Conventional Commits. Do not push unless Montse asks.
- **Content.** Everything in `docs/content-rules.md` applies to every file, including code comments,
  commit messages and tests.

## Prohibited

- **Publishing the result.** No curve data, which motive pays where, or content for act 5 or
  `/finding` beyond the status sentence, except behind act 5's lock (ADR 0015). Model parameters
  never appear on the page, except θ, c, the guilt available and the robustness variant on
  `/finding`, behind the same lock (ADR 0017). "The research" section is always visible, with only
  the question and the fact that Montse built a simulation engine in TypeScript; its links to act 5,
  `/finding` and the engine repository exist only behind the lock (ADR 0019, rule (j)). Nothing about
  the engine's tests, seed, generations, imitation or provenance outside the lock. The manuscript
  status sentence is never reworded or added to, even as the hero's stamp (rule (b)). Do not change
  the repository's visibility, do not
  enable GitHub Pages, do not run `deploy.yml` (manual-only, F6).
- **Copying the manuscript or the paper's context.** Do not read or copy the manuscript or its working
  files, wherever they live (local folders, Drive). If something is missing, ask.
- **Importing the engine.** The engine repository (`Montse2308/Dilema-del-Prisionero` on GitHub,
  local folder `dilema-prisionero`) is never opened, added as a dependency, submodule or alias, and
  no file is copied from it. Its output reaches this repo only as `src/data/curve.json`, copied with
  provenance in F3 (ADR 0010).
- **Choosing another visual.** The only piece is the table, with three moments. Act 1's scene is
  the table before moment 1, not a fourth moment nor a second piece; it moves with scroll-bound CSS
  only, never hijacks the scroll, and has a still version (ADR 0020, rule (k)). No PixiJS, WebGPU,
  canvas, GSAP, Lottie, agent canvases, grids or population animations, no four panels, no extra
  charts beyond `/finding`'s guilt chart, no playable dilemma in the main scroll, no playable
  repeated dilemma anywhere. `/dilemma`'s one-shot best reply is the only other interaction
  (ADR 0017).
- Naming the journal the manuscript was submitted to, submission dates or correspondence with
  authors in any file. Third-party references carry their journal, as any bibliography (ADR 0016).
- Inventing personal data (display name, profile URLs, email, photo, school, job, city, biography).
  Anything not provided goes as `TODO(...)`; "About" follows rule (j).
- Writing act prose outside the phase that owns it.
- Adding dependencies outside the stack without asking.
