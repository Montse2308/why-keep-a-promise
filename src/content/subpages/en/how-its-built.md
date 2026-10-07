---
title: How it's built
---

## A storyboard first

Astro builds every page ahead of time, into plain HTML and CSS. The home is
first a storyboard: each chapter a still frame, its cards in order, every result written out. One
script turns it into the film; without it, the whole story is still there. The logic lives in small
pure modules with their tests, and JavaScript runs only in the film and in the notebook's panel.

## A scene engine of its own

The film moves on a scene engine written for it, in TypeScript. Tracks hold values keyed to the
scroll; the engine eases between them, so nothing starts or stops with a jolt, and frames the camera
for the shape of each screen. One loop reads the native scroll and paints what the tracks say:
nothing captures the wheel or the finger, and only transforms, opacity and colours change.

```ts
/** Quadratic ease-in-out: starts and ends at rest, so no move begins or stops with a jolt. */
export function easeInOut(t: number): number {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
}
```

It mixes colours by hue, in OKLCH, never channel by channel. That is why the film's day has a
sunrise:

<!-- slot:day -->

A test fails if the sky ever turns grey, or if any surface changes too fast to look smooth.

## The lock

Part of the site stays closed until the working paper is public on SSRN. Until then, that part is
left out of the build, not hidden: a plugin swaps each locked component for an empty stub, and a
script reads every built file and fails if any trace of it got through. The rule is one line:

```ts
export function findingUnlocked(ssrn: string, dev: boolean): boolean {
  return !isPending(ssrn) || dev;
}
```

## Fractions, not decimals

Payoffs and probabilities are kept as fractions of whole numbers: 5/6 stays 5/6 through every step.
The only rounding comes at the end, when a share is shown out of 100, and even that uses whole
numbers:

```ts
/** A non-negative fraction on a 0–100 scale, rounded half up to an integer, in integer arithmetic. */
export function outOf100(f: Fraction): number {
  if (f.num < 0) throw new RangeError('outOf100 takes a non-negative fraction');
  return Math.floor((200 * f.num + f.den) / (2 * f.den));
}
```

## Checks that stop the build

**Two languages, one set of keys.** A key in one language and not the other makes the type checker
reject the code:

```ts
const esCoversEn: Record<keyof typeof en, string> = es;
const enCoversEs: Record<keyof typeof es, string> = en;
```

**A register of figures.** Every number the page may say is listed with its source; the film's
captions hold none, only names that the build fills from the code. A test fails on any other number,
or on a citation that matches no source.

**Only adding.** A test fails if this notebook repeats a sentence of the film.

**Forbidden phrases.** Another test fails on a short list of phrases the page must never say.

## Access

Every choice is a native button that works from the keyboard, and each result is spoken through a
live region. With reduced motion, the film cuts between still frames and every game still works.
Contrast is tested at every point of the day's light, and the cast stays apart for the two commonest
kinds of colour blindness.

## Weight and speed

The home's script, its fonts and its first load each have a ceiling, set before the film was
written; a script checks every build against them.

<!-- slot:weight -->

## A log of decisions

Every decision that shaped the page is a short written record: what was decided, why, and what it
replaced. A decision changes only through a new record; the old one is archived, never rewritten.

<!-- lock -->

## The engine

The curve comes from a simulation engine written in TypeScript. Its random numbers come from a
seeded generator, so the same seed repeats the same run. Reasons spread by imitation: from one
generation to the next, the reasons that earn more are copied more. The engine exports the curve
with its provenance: the engine's commit, the seed and the command that produced it. On this side,
a test fails if the curve changes or if the file is missing.

The engine's repository: {engine}.
