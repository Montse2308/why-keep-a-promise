# AGENTS.md

Single source of instructions for any agent (Claude, Copilot, others) working in this repository.
`CLAUDE.md` and `.github/copilot-instructions.md` only point here.

## What this is

The outreach page of a personal research project on why people keep promises that no longer pay.
A portfolio piece in two layers (ADR 0021):

- **The film.** The home (`/`, `/es/`) is a short scroll-driven film in nine chapters on one paper
  stage whose light changes continuously. It goes from the prisoner's dilemma to cheap talk, to
  Vanberg's (2008) partner-switching game, to Montse's research, and ends with the working
  paper's stamp. Internal name: "Te lo prometo" / "I promise".
- **The notebook.** The depth, one tap away from anywhere: `/dilemma`, `/vanberg`, `/finding`,
  `/how-its-built`, `/sources`, `/about` (ADR 0024).

It is **not** a simulator and **not** the instrument of a paper. Details: `docs/plan.md`.

**Where things stand.** The plan was rebuilt with Montse in P0 (ADR 0021–0026). P0 to P6 are closed
(P6, the polish, with PR #9). F5 (QA) and F6 (launch) are closed: the site is live at
`https://montse2308.github.io/why-keep-a-promise/`, with the lock open. The repository is public,
Pages publishes with GitHub Actions, and `deploy.yml` ran on 2026-10-08 (run 37860472991, on `main`
after PR #19); every step of `docs/launch-checklist.md` is marked. P8 (polish after the launch: the
Spanish home title on a computer, sharp card titles, external links in a new tab, ADR 0029, and the
cover of ADR 0036) reached `main` with PR #20. P9, **/finding on its own** (/finding becomes the
page Montse shares, understood without the story: the text she approved on 2026-10-10, the three
worlds, a two-panel figure, a formula explorer, how to cite; with the rest of the site around it:
its poster and JSON-LD, the cover's link to it, the engine on /how-its-built, ORCID and SSRN on
/about), reached `main` with PR #21, and `deploy.yml` ran on 2026-10-10; its last details after the
deploy are step 9.10 in `docs/tasks.md`. There is no active phase: what follows is maintenance, with
plain commits to `main` or short branches, and `deploy.yml` run by Montse.
P7, the fixes from an external review, was planned in small steps (one per session) in
`docs/p7-review-plan.md`, `docs/phases.md` and `docs/tasks.md`, and is closed (PR #17).
P7.0, the decisions (ADR 0029–0033) and the approved texts, is closed (PR #10). P7.1, the film's
script split by chapter, the fallback to the storyboard and the memory in the tab, is closed
(PR #11). P7.2 (each page's description and Open Graph metadata, the 404 page, `noindex` on the
locked /finding, the sitemap, the touch icon, Axelrod and Hamilton (1981) as the dilemma's source)
is merged (PR #12); Montse's two steps, checking 70 and 68 against `switch.dat` (7.2.9) and
confirming its new texts (7.2.11), are still open. P7.3 (the chat in order, the progress beads,
life at rest, the arrival halfway, «Watch again» and the end melting into the footer) is done and
waits for Montse's review (7.3.10). P7.4 (the new sound cues) and P7.5 (the side card with a phone
held sideways, the notebook's transitions) are closed. P7.6 (the hills without a shadow filter,
still frames that draw only what their pose shows, chapter 4's citation line, the EN/ES switch in
the notebook's panel, the author's signature on the posters) is closed; Montse approved it
(7.6.11). P7.7 (the READMEs, Lighthouse and the weights again, and the full review: sizes,
sideways, both languages, keyboard, reduced motion, no JS, a blocked script and axe, with its four
fixes) is closed; Montse approved it (7.7.7), and its PR is merged (#17). The film tells all nine chapters, chapter 7's finding
behind the lock, and ends in chapter 8's credits, with «Watch again» under them; it has its sound,
off until pressed, its progress under the spool, its cast alive at rest, and remembers what was
played in its tab entry. The notebook has its six pages, its panel on every page (with the finding's
entry: its title and the status sentence, and the EN/ES switch), its magnifiers in the film and its
footer. Every page has its description, its signed poster for a shared link and its place in the
sitemap (/finding only behind the lock), and every build is weighed against the budgets.

## Reading order

Read these before changing anything, in this order:

1. `docs/plan.md`: what the page is (decided; do not reopen).
2. `docs/content-rules.md`: what may and may not be written, anywhere.
3. `docs/phases.md`: phases P0–P8, F5 (QA) and F6 (launch), with their exit criteria.
4. `docs/tasks.md`: current tasks; only work on the active phase. P7 is split into numbered steps
   (`7.1.3`), each small enough for one short session and left green; when asked to continue P7,
   take the first open step whose dependencies are met, and stop at steps marked **(Montse)**.
5. `docs/p7-review-plan.md`, while P7 is open: why each P7 step exists, in what order, and what was
   left out and must not be reopened. Read it before any P7 step. `docs/p7-external-review.md` is
   the review it comes from: evidence (files, lines, measurements), not rules.
6. `docs/decisions/README.md` and the ADRs it lists. Every ADR in `docs/decisions/` is in force in
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
| `npm run verify:dist` | After `build`: fails if locked content or a link to `/finding` reached a locked `dist/`, or if the status sentence, the descriptions, `noindex` or the sitemap are off (ADR 0034), or if a link leaving the site does not open in a new tab with its notice, or one inside it does (8.3) |
| `npm run budgets` | After `build`: weighs every page of `dist/` and fails if one goes over a budget of ADR 0025 (home JS, fonts, first load) or /finding's JS (ADR 0038), or if the homes' weights `/how-its-built` cites (`src/data/weight.json`) differ from the build's; `npm run budgets -- --write` writes them |
| `npm run check:launch` | Builds, then fails while a link is still a `*_PENDING` placeholder in `dist/`, `src/` or the READMEs (ADR 0034). Not in CI; step 3 of the launch checklist and `deploy.yml` run it |

`check`, `test`, `build`, `verify:dist` and `budgets` must be green before every commit. CI
(`.github/workflows/ci.yml`) runs install → check → test → build → verify:dist → budgets on every
push and PR.

The LCP is measured apart, by hand, with Lighthouse pinned (not a dependency), three runs per home
against `npm run preview`; `node scripts/lighthouse.mjs` turns the reports into
`src/data/lighthouse.json`, whose LCP `/how-its-built` cites (the command is in the script's header);
the weights beside it come from `src/data/weight.json`.

## Stack (ADR 0025, ADR 0028, ADR 0029, ADR 0030)

- Astro, 100 % static output. TypeScript strict. No UI framework, no Tailwind.
- Progressive enhancement: Astro renders a storyboard in HTML (each chapter as a still frame with
  its captions); one client script turns it into the film. Without JS, the storyboard is the page.
- Our own scene engine in `src/lib/film/` (tracks, easing, colour interpolation, camera fit), pure
  and tested. Native scroll: no snapping, no wheel or touch capture.
- Logic lives in pure modules with Vitest tests (`src/lib/`).
- CSS with tokens (`src/styles/tokens.css`, mirroring `src/lib/design/palette.ts`). Self-hosted
  fonts: Fraunces and Nunito from P1 (ADR 0027), JetBrains Mono for code only.
- Sound: optional, off by default, synthesised with Web Audio; only the closed list of cues of
  ADR 0030 sounds, each with what the stage shows.
- Memory: the film remembers what was played only in `history.state` of its own tab entry
  (ADR 0029). No `localStorage`, `sessionStorage`, IndexedDB, cookies or analytics; nothing is sent.
- Budgets: home JS ≤ 40 KiB gzipped (the two homes), `/finding`'s JS ≤ 8 KiB gzipped (ADR 0038),
  fonts ≤ 160 KiB and first load ≤ 450 KiB (every page), LCP ≤ 2.5 s on a mid-range phone. KiB, and
  which pages, by ADR 0028.
- The only new dependency the plan allows is `@resvg/resvg-js`, as a dev dependency, for Open Graph
  posters (in since P6). Anything else: ask first.
- No `@types/node`: code that needs Node's API at build time is plain `.mjs` (`scripts/`,
  `src/lib/posters/fonts.mjs`). Check current versions with the official tools; never pin
  versions from memory.
- Hosting: GitHub Pages at `https://montse2308.github.io/why-keep-a-promise/`. Zero budget.

## Map

```
src/
  config.ts              author links; the working paper (its title and SSRN link, which also opens
                         the lock) and the engine's links, placeholders until launch (ADR 0034)
  content.config.ts      content collections (frontmatter schemas)
  content/chapters/{en,es}/  the film's captions, one file per chapter, split into beats by
                         <!-- beat:… --> marks; a number is a {placeholder}, never a figure;
                         chapter 7's finding follows its <!-- lock --> mark
  content/subpages/{en,es}/  the notebook's prose, one file per page; <!-- slot:… --> and
                         <!-- lock --> markers
  content/figures.ts     every figure and citation the prose may use, keyed to docs/sources.md;
                         /sources shows it
  data/curve.json        the engine's precomputed curve, copied with provenance; never edited (ADR 0010)
  data/lighthouse.json   the home's Lighthouse measurement, with provenance (scripts/lighthouse.mjs)
  data/weight.json       the homes' weights as `npm run budgets` weighs them (`-- --write`)
  i18n/en.json, es.json  UI strings, flat keys, full parity
  lib/                   pure, tested modules
    i18n.ts              typed t(); fails check and build on key mismatch
    locales.ts           locale list, no dictionary imports (safe for client scripts)
    routes.ts            buildHref/href/assetHref: every internal link goes through here;
                         routeOf reads a path back into its route
    lock.ts              the lock: full content only once the working paper's link is real, or in
                         dev (ADR 0034); the status sentence's parts
    engine.ts            the engine's links, where the prose behind the lock writes {engine}
    external.ts          links that leave the site: a new tab, rel and the ↗ with its notice, in
                         components and in rendered prose (8.3); internal links stay in the tab
    hero.ts              the home's cover (ADR 0036): its three doors, the notebook pages it
                         links (never /finding) and its sky, which ends in the stage's first colour
    film/                the scene engine: tracks, easing, colours (OKLCH), camera, chapter
                         spans; timeline.ts (screens, beats, the native scroll mapped to the film);
                         faces.ts (the moods); stage.ts (what the stage shows at each point);
                         captions.ts (beats in Markdown); values.ts (every number the film says,
                         from the pure modules); lines.ts (what it says after each choice);
                         board.ts, parts.ts (the board, coins, die and where each part goes);
                         talk.ts (chapter 2's chat); voices.ts (the two voices, chapter 4 on);
                         deck.ts, bet.ts (chapter 5's deck and bet); guess.ts, signs.ts (chapter 6);
                         finding.ts (chapter 7's beats past the envelope, stubbed while locked);
                         credits.ts (chapter 8's cast and the notebook pages its credits link);
                         day.ts (/how-its-built's demonstration of the engine's sky);
                         sound.ts (the score: every cue, what is seen with it, its envelopes,
                         chapter 3's cues in a row); sights.ts (what the scroll brings that
                         sounds, once a visit: the voices, the blackout, the light, the signs);
                         memory.ts (the memory in the tab: the actions, their version and how a
                         record is read back, ADR 0029); progress.ts (the chapter on stage and
                         the beads under the spool); idle.ts (life at rest: blinks, the square's
                         glances, the waiting die's rock, asked by the frame loop)
    back.ts              when a notebook link back to the film goes back in the tab's history
    finding/worlds.ts    /finding's three worlds and the payoff panel's variant tail, from curve.json
    finding/explorer.ts  /finding's formula explorer: the guilt available, its window, peak and θmin
                         (ADR 0038); pure, imports nothing, pinned to the register by its test
    jsonld.ts            /finding's structured data: the working paper and the engine, from config.ts
    cite.ts              /finding's «How to cite»: the working paper (APA, BibTeX) and the engine, from config.ts
    chapters.ts          the nine chapters, their ids, order and beats; OPEN_CHAPTERS is the
                         film without the finding, the clock of the day's light
    notebook.ts          the notebook's six pages, their order, titles and lines, the chapter each
                         leads back to, what may be linked in each state of the lock, and the
                         film's magnifiers (MAGNIFIERS)
    sources.ts           /sources: the works, each key of the register under its work, where its
                         figures are used; the finding's keys only behind the lock (FINDING_ENTRIES,
                         ADR 0035), the retired ones left out
    design/              film.ts (the film's colours and the day's light; film.css mirrors it),
                         palette.ts (the notebook's paper, day and night; tokens.css mirrors it),
                         colour maths
    subpages.ts          splits notebook prose at its slot and lock markers
    meta.ts              what each page says of itself in its head: its description, its language
                         for Open Graph and the colour of the browser bar
    sitemap.ts           the sitemap, with each page's languages; /finding only behind the lock
    budgets.ts           the weight budgets and how a built page is weighed against them
    details.ts           the tab's title while away and the console's note
    posters/             the Open Graph posters: poster.ts (the drawing, the lines set to fit, and
                         /finding's miniature behind the lock),
                         metrics.ts (advance widths from TrueType), render.ts + fonts.mjs (PNG
                         with resvg at build time); icon.ts, the home-screen icon
    table/               Vanberg's game: exact payoffs (PAYOFFS), the decision (chapter 3), the
                         recipients' beliefs and scale, real roll counts, exact fractions
    pd/                  the prisoner's dilemma: its payoffs, the one round of chapter 1 and the
                         best reply of its two columns
    curve/               reads curve.json (build time only), step-chart geometry, the curve control;
                         values.ts: chapter 7's numbers; film.ts: the curve on the film's paper;
                         finding.ts: guilt, θ, c and robustness for /finding; all behind the lock
    vanberg/             every cell of the switch treatment and the baselines, exact counts
  assets/fonts/          self-hosted woff2, OFL licences, provenance; posters/ static TrueType
                         cuts for the posters only, never shipped
  styles/                tokens.css, base.css
  components/            film/ (Film, Chapter, ChapterTitle (a chapter's title, read as one name),
                         Beat, Ticket(s), World, Board, Coins, Character, Voices, Signs, Engine,
                         Magnifier, chapters/ one .astro per chapter plus
                         Finding, the locked part of chapter 7, and beside each its controller
                         (arrival.ts, two-rooms.ts, …: its choices, noted and played back);
                         film.ts the frame loop and the stage's state, context.ts what it hands
                         the controllers, sound.ts the Web Audio player);
                         notebook/ (Notebook, the button and panel, with notebook.ts, details.ts,
                         back.ts and transitions.ts, which lets the transition between notebook
                         pages go on the way to the film; NotebookFooter; Sources, with SourceWork,
                         SourceEntry and SourcesFinding, its locked part; Author, Day, Weight,
                         Vignette);
                         curve/Curve (chapter 7's curve) + GuiltChart (/finding's) + Locked (the
                         stub a locked build uses for both and for chapter 7's finding);
                         pd/Matrix and vanberg/SwitchTable (static tables of the notebook);
                         finding/ (/finding's own, behind the lock, ADR 0037: MinuteLinks, the buttons
                         of «In one minute»; Explorer, with explorer.ts, its script, the only one
                         on /finding besides the panel's; ThreeWorlds; ResultFigure, the two panels, GuiltChart on
                         top; Cite; FindingProse, the styles of its blocks of prose);
                         LanguageSwitch; PaperStatus, the status sentence (ADR 0034); Hero, the
                         home's cover (ADR 0036)
  layouts/BaseLayout.astro
  views/                 HomeView, SubpageView (shared by both locales)
  pages/                 thin wrappers for each route and locale; posters/[locale]/[route].png.ts
                         renders each page's poster; 404.astro (one page, both
                         languages), sitemap.xml.ts and apple-touch-icon.png.ts
scripts/verify-dist.mjs  checks dist/ against the lock, its links, the status sentence, the
                         descriptions, noindex and the sitemap (ADR 0034)
scripts/check-launch.mjs fails while a `*_PENDING` placeholder is left (ADR 0034)
scripts/budgets.mjs      weighs dist/ against the budgets (ADR 0025) and src/data/weight.json
scripts/lighthouse.mjs   Lighthouse reports → src/data/lighthouse.json
tests/                   repo-level tests (page parity, prose figures and budgets, rule (h), the
                         film's captions, forbidden phrases, curve and /finding figures,
                         verify:dist markers, code quoted on /how-its-built, budgets, posters,
                         the Lighthouse measurement, the film's fallback and its memory, the
                         pages' heads, the 404 page and the sitemap, the launch's workflows and
                         checklist, the story's name and the notebook's transitions)
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
  (`TODO(launch)` for step 3 of the launch checklist). Links not known until launch, the working
  paper's SSRN page and the engine's DOI, are the literal `SSRN_URL_PENDING` and
  `ENGINE_DOI_PENDING` in `src/config.ts` (ADR 0034).
- **Decisions.** A superseded ADR, even partly, moves to `docs/archivo/decisiones/` with a line
  naming what replaces it; what still holds is restated in the new ADR. Keep
  `docs/decisions/README.md` in sync.
- **Commits.** Small, in English, Conventional Commits. Do not push unless Montse asks.
- **Content.** Everything in `docs/content-rules.md` applies to every file, including code comments,
  commit messages and tests.

## Prohibited

- **Publishing the result.**
  - No curve data, no saying which motive pays where, and no content from the finding beyond the
    status sentence, except behind the lock (ADR 0034).
  - The lock covers chapter 7's finding, `/finding`, the engine part of `/how-its-built`, the
    finding's sources on `/sources` (ADR 0035), and the links to them and to the engine repository. It opens once the working paper is public on SSRN.
  - Model parameters never appear, except θ, c, the guilt available and the robustness variant on
    `/finding`, behind the lock. There too, «Two more results» names in words the share of the
    time a promise stops binding and its cut at one half, and the protocol null's 60 out of 60: no
    letter `s`, no φ, N, generations or named seeds, and not the lab's 59 % or 43 % (ADR 0039). The
    formula explorer moves only θ, background trust and the belief that a promise will be kept
    (ADR 0038). Behind the lock, `/sources` lists `/finding`'s figures from the register and names θ
    and c, never their values (ADR 0035).
  - Outside the lock, chapter 7 says only the question and that Montse built a simulation engine in
    TypeScript. Nothing about the engine's tests, seed, generations, imitation or provenance
    (rule (j)).
  - The status sentence (the working paper's title, linked to SSRN) is never reworded or added to,
    even as the stamp (rule (b)). There is no other state: nothing says under review, accepted,
    peer-reviewed or published in a journal.
  - Do not change the repository's visibility or its GitHub Pages settings, and do not run
    `deploy.yml`: it is manual-only, and only Montse runs it, after merging into `main`.
- **Copying the working paper or the paper's context.** Do not read or copy the working paper or its
  working files, wherever they live (local folders, Drive). If something is missing, ask.
- **Importing the engine.** The engine repository (`Montse2308/Dilema-del-Prisionero` on GitHub,
  local folder `dilema-prisionero`) is never opened, added as a dependency, submodule or alias, and
  no file is copied from it. Its output reaches this repo only as `src/data/curve.json` (ADR 0010).
- **Visuals and games outside ADR 0023/0027.**
  - No WebGL, WebGPU, PixiJS, canvas, GSAP or Lottie.
  - No visualising populations or dynamics: no agents, grids or one dot per person.
  - No playable repeated prisoner's dilemma anywhere: link to *The Evolution of Trust* instead. The
    dilemma in chapter 1 is played once.
  - No charts beyond chapter 7's curve and `/finding`'s figures (the guilt chart, what each reason
    earns, the three worlds' meters and the formula explorer, ADR 0037 and 0038), all behind the
    lock, and the miniature on `/finding`'s poster.
  - No interaction outside the list in ADR 0023, with the formula explorer of ADR 0038.
  - The scroll is never hijacked.
- **Naming a journal** for Montse's text, which goes to no journal (it is a working paper on SSRN,
  ADR 0034), submission dates or correspondence with other authors, in any file. Third-party
  references carry their journal, as any bibliography (ADR 0016).
- **Inventing personal data** (display name, profile URLs, email, photo, school, job, city,
  biography). `/about` carries only the name, GitHub, LinkedIn, ORCID and the SSRN author page
  (ADR 0041).
- **Caricaturing a real person** as a character.
- Writing chapter or notebook prose outside the phase that owns it.
- Adding dependencies outside ADR 0025 without asking.
