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

`check`, `test` and `build` must be green before every commit. CI (`.github/workflows/ci.yml`) runs
install → check → test → build on every push and PR.

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
  config.ts              author links, manuscript status
  i18n/en.json, es.json  UI strings, flat keys, full parity
  lib/                   pure, tested modules
    i18n.ts              typed t(); fails check and build on key mismatch
    locales.ts           locale list, no dictionary imports (safe for client scripts)
    routes.ts            buildHref/href/assetHref: every internal link goes through here
    acts.ts              the six acts, their ids and subpage links
    lang-pref.ts         remembered EN/ES choice
    table/               game logic for the table (F1)
  components/            AuthorStrip, LanguageSwitch, SiteFooter, Act, table/GameTable
  layouts/BaseLayout.astro
  views/                 HomeView, SubpageView (shared by both locales)
  pages/                 thin wrappers: / and /es/, plus four subpages each
tests/                   repo-level tests (page parity)
docs/                    plan, rules, phases, tasks, ADRs (Spanish, single copy)
scratch/                 local notes, git-ignored, never committed
```

## Rules

- **Languages.** Code, comments, commits, file names and `README.md` in English; `README.es.md` is its
  copy. Everything in `docs/` is in Spanish, one copy only. The site has full EN/ES parity.
- **i18n.** UI text lives in keys in `src/i18n/*.json`; a key in one locale and not the other breaks
  the build. Act prose goes in Markdown per locale (from F2). The EN/ES switch maps to the same route
  in the other locale and remembers the choice.
- **Links.** Every internal link uses `href()` / `buildHref()` / `assetHref()` from `src/lib/routes.ts`,
  so `base` (`/why-keep-a-promise`) is always respected. Never hard-code `/…` paths.
- **Placeholders.** Unwritten content is marked `TODO(Fx)` with the phase that writes it.
- **Commits.** Small, in English, Conventional Commits. Do not push unless Montse asks.
- **Content.** Everything in `docs/content-rules.md` applies to every file, including code comments,
  commit messages and tests.

## Prohibited

- **Publishing the result.** No curve data, model parameters, which motive pays where, or content for
  act 5 or `/finding` beyond the status sentence. Do not change the repository's visibility, do not
  enable GitHub Pages, do not run `deploy.yml` (manual-only, F6).
- **Copying the manuscript or the paper's context.** Do not read or copy the manuscript or its working
  files, wherever they live (local folders, Drive). If something is missing, ask.
- **Importing the engine.** The engine repository (`dilema-prisionero`) is never opened, added as a
  dependency, submodule or alias, and no file is copied from it. Its output reaches this repo only as
  `src/data/curve.json`, copied with provenance in F3 (ADR 0010).
- **Choosing another visual.** The only piece is the table, with three moments. No PixiJS, WebGPU,
  agent canvases, grids or population animations, no four panels, no extra charts, no playable
  dilemma in the main scroll.
- Naming the journal, submission dates or correspondence with authors in any file.
- Inventing personal data (display name, profile URLs, email, photo). Anything not provided goes as
  `TODO(...)`.
- Writing act prose outside the phase that owns it.
- Adding dependencies outside the stack without asking.
