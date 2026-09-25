# AGENTS.md

Single source of instructions for any agent (Claude, Copilot, others) working in this repository.
`CLAUDE.md` and `.github/copilot-instructions.md` only point here.

## What this is

The outreach page of a personal research project on why people keep promises that no longer pay.
A portfolio piece: one scrolling thread in six acts, one visual piece ("the table", Vanberg's 2008
partner-switching game), English at `/` and Spanish at `/es/`. It is **not** a simulator and **not**
the instrument of a paper. Details: `docs/plan.md`.

## Reading order

Read these before changing anything, in this order:

1. `docs/plan.md` — what the page is (decided; do not reopen).
2. `docs/content-rules.md` — what may and may not be written, anywhere.
3. `docs/phases.md` — phases F0–F6 and their exit criteria.
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
| `npm run verify:dist` | After `build`: fails if act 5's locked content reached `dist/` (ADR 0015) |

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
  content.config.ts      the acts content collection (frontmatter schema)
  content/acts/{en,es}/  act prose in Markdown, one file per act (F2)
  content/figures.ts     every figure and citation the prose may use, keyed to docs/sources.md
  data/curve.json        the engine's precomputed curve, copied with provenance; never edited (ADR 0010)
  i18n/en.json, es.json  UI strings, flat keys, full parity
  lib/                   pure, tested modules
    i18n.ts              typed t(); fails check and build on key mismatch
    locales.ts           locale list, no dictionary imports (safe for client scripts)
    routes.ts            buildHref/href/assetHref: every internal link goes through here
    acts.ts              the six acts, their ids and subpage links
    template.ts          fill({name}) placeholders in UI strings
    lock.ts              act 5's lock: full content only under review or in dev (ADR 0015)
    design/              palette.ts (single source of colour values), colour maths
    table/               game logic for the table: exact payoffs, moments 1–2 state machines
    curve/               reads curve.json (build time only), step-chart geometry, moment 3 logic
  assets/fonts/          self-hosted woff2 (Newsreader, Inter), OFL licences, provenance
  styles/                tokens.css (mirrors palette.ts, test-checked), base.css
  components/            AuthorStrip, LanguageSwitch, SiteFooter, Act,
                         table/GameTable + controller.ts (client script, moments 1–2),
                         curve/Curve + controller.ts (act 5's chart and moment 3, behind the lock),
                         curve/Locked (the empty stub a locked build uses instead)
  layouts/BaseLayout.astro
  views/                 HomeView, SubpageView (shared by both locales)
  pages/                 thin wrappers: / and /es/, plus four subpages each
scripts/verify-dist.mjs  checks dist/ against act 5's lock
tests/                   repo-level tests (page parity, prose figures and budgets, forbidden phrases,
                         curve figures against curve.json, verify:dist markers)
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
  never appear on the page. Do not change the repository's visibility, do not
  enable GitHub Pages, do not run `deploy.yml` (manual-only, F6).
- **Copying the manuscript or the paper's context.** Do not read or copy the manuscript or its working
  files, wherever they live (local folders, Drive). If something is missing, ask.
- **Importing the engine.** The engine repository (`Montse2308/Dilema-del-Prisionero` on GitHub,
  local folder `dilema-prisionero`) is never opened, added as a dependency, submodule or alias, and
  no file is copied from it. Its output reaches this repo only as `src/data/curve.json`, copied with
  provenance in F3 (ADR 0010).
- **Choosing another visual.** The only piece is the table, with three moments. No PixiJS, WebGPU,
  agent canvases, grids or population animations, no four panels, no extra charts, no playable
  dilemma in the main scroll.
- Naming the journal the manuscript was submitted to, submission dates or correspondence with
  authors in any file. Third-party references carry their journal, as any bibliography (ADR 0016).
- Inventing personal data (display name, profile URLs, email, photo). Anything not provided goes as
  `TODO(...)`.
- Writing act prose outside the phase that owns it.
- Adding dependencies outside the stack without asking.
