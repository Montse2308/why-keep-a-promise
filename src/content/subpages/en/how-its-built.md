---
act: 6
title: How it's built
---

## The page

Everything is built once, ahead of time, with Astro, into HTML and CSS files that any server can
hand out as they are. JavaScript runs in two places only: the table, and the best-reply exercise on
the dilemma page. Without it, both still show their payoffs as a plain table.

## Fractions, not decimals

Payoffs and probabilities are kept as fractions of whole numbers: a chance of 5/6 stays 5/6 through
every step. The only rounding happens at the end, when a share is shown out of 100, and even that
uses whole numbers:

```ts
/** A non-negative fraction on a 0–100 scale, rounded half up to an integer, in integer arithmetic. */
export function outOf100(f: Fraction): number {
  if (f.num < 0) throw new RangeError('outOf100 takes a non-negative fraction');
  return Math.floor((200 * f.num + f.den) / (2 * f.den));
}
```

## Checks that stop the build

**Two languages, one set of keys.** Every piece of interface text has a key in English and in
Spanish. If a key exists in only one of them, the type checker rejects the code and the build stops:

```ts
const esCoversEn: Record<keyof typeof en, string> = es;
const enCoversEs: Record<keyof typeof es, string> = en;
```

**A register of figures.** Every number the prose may contain is on a list, with the source it
comes from. A test reads the prose of every section and fails on a number that is not on the list,
or on a citation that does not match a source.

**Forbidden phrases.** Another test searches the sources for a short list of phrases the page must
never say, in either language.

**The lock.** Part of the site stays closed until the manuscript is under review. While it is
closed, that part is left out of the build, not hidden, and a script reads the built files and fails
if any trace of it got through.

## Typefaces

The three typefaces are served from the site itself: Newsreader for reading, Inter for what you
touch, and JetBrains Mono for code, like the blocks on this page. Each was copied unchanged from its
published package, with its licence and its origin written down next to the files.

## Access

Everything interactive works from the keyboard, and focus moves on to the next step. Each result is
also spoken to screen readers through a live region. Every chart carries a hidden table with its
values. If your system asks for reduced motion, nothing moves.

<!-- lock -->

## The engine

The curve comes from a simulation engine written in TypeScript. Its random numbers come from a
seeded generator, so the same seed repeats the same run. Reasons spread by imitation: from one
generation to the next, the reasons that earn more are copied more. The engine exports the curve
with its provenance: the engine's commit, the seed and the command that produced it. On this side,
a test fails if the curve changes or if the file is missing.

The engine's repository: <span class="todo">TODO(launch): enlace al repo del motor</span>.
