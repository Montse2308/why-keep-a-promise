---
title: The finding
---

<!-- lock -->

<p class="lede">A lab session cannot tell personal guilt from partner-specific commitment. Comparing worlds with different background trust can.</p>

<section class="minute" aria-labelledby="in-one-minute">

## In one minute

- **The question.** Why keep a promise that no longer pays? Two reasons predict it. *Personal
  guilt*: it hurts to let down an expectation you created. *Partner-specific commitment*: it hurts
  to break your word to this person.
- **What a lab cannot separate.** After a partner switch, both reasons predict that you roll less.
  The new partner knows nothing of the switch, so background trust is the same with and without
  it.
- **What separates them.** Background trust: what people expect of someone before any promise. In
  a simulation, what personal guilt earns is low at both ends of it and high in the middle. What
  partner-specific commitment earns does not move.
- **What this is not.** It does not say which reason people feel. It says which comparison could
  tell them apart. The model's numbers were not calibrated against any experiment.

<!-- slot:minute-links -->

</section>

<dl class="known wide">
<div class="known__column">
<dt>Already known</dt>
<dd>Vanberg (2008) switched partners to separate what the other expects from the word you gave. Promises were kept less often after a switch, and he read it as a preference for keeping one's word in itself.</dd>
<dd>Kawagoe and Narita (2014) proposed personal guilt, and derived that after a switch it is zero: the promise the new partner holds was not made by the one who decides.</dd>
</div>
<div class="known__column">
<dt>What this work adds</dt>
<dd>Personal guilt and partner-specific commitment fall in the same pair of Vanberg's design, so his result fits both.</dd>
<dd>The variable that separates them: background trust. Personal guilt depends on it; partner-specific commitment does not.</dd>
<dd>A population model, in which reasons spread by what they earn, and an open simulation engine that measures it.</dd>
<dd>A negative result: who gets to speak does not change who survives (<a href="#two-more-results">§6</a>).</dd>
</div>
</dl>

## Three worlds

In each world, the belief that a promise will be kept is the same, 76 out of 100. Only background
trust changes.

<div class="explorer-block" data-explorer-block hidden>

*Try it.* The hill comes from the formula, not from a lucky choice of numbers. Lower θ and the
window narrows, until below 0.277 it closes. Move the belief that a promise will be kept, and the
peak moves with it: it is always at half of it.

<!-- slot:explorer -->

</div>

<!-- slot:three-worlds -->

- **Where almost no one keeps their word**, little was expected to begin with. Guilt is the product
  of what was expected and what your promise added, and with almost nothing to start from, the
  product stays small.
- **Where almost everyone does**, your promise added almost nothing. The product is small again.
- **In between**, both amounts are large, and guilt is at its highest.
- **Partner-specific commitment** looks at none of this: it rolls whenever the promise binds it.

## What each reason earns

In the simulation, the other person sees which reason moves you before playing, and only joins if
you will roll. If they join and you roll, you earn 10; if they stay out, each keeps 5. So rolling is
what pays. Personal guilt earns 10 only inside its window. Partner-specific commitment and general
guilt earn 10 everywhere.

<!-- slot:result-figure -->

## For those who want the arithmetic

### Four reasons, two pairs

Each reason of the main thread has a general version and a narrower one. Guilt can answer to
anyone's expectation, or only to one you created. Your word can bind you to anyone you promised, or
only to this person. That makes four. With a partner switch, each one predicts:

| Reason                      | What it asks of you                                | With a partner switch |
| --------------------------- | -------------------------------------------------- | --------------------- |
| General guilt               | not to fall short of what anyone expects of you    | you roll the same     |
| General commitment          | to keep your word, given to anyone                 | you roll the same     |
| Personal guilt              | not to let down an expectation you created         | you roll less         |
| Partner-specific commitment | to keep your word to this person                   | you roll less         |

Vanberg's design separates the two pairs, but not what is inside each pair. That personal guilt is
zero after a switch is not an assumption of this page: Kawagoe and Narita (2014) derive it
themselves.

### The formula

Call background trust *a*, and write every belief in hundredths, so that 76 is the belief that a
promise will be kept: the mean second-order belief of dictators without a partner switch in Vanberg
(2008, Table I). The guilt available to you is then *a* · (76 − *a*) / 100. Personal guilt rolls
the die if θ · guilt > 4, the cost of rolling (14 − 10), with θ = 0.6, how much a unit of guilt
weighs against a unit of money: that is, if the guilt is above 20/3, about 6.67.

Setting *a* · (76 − *a*) / 100 = 20/3 gives the analytic cut: personal guilt rolls between about
10.1 and about 65.9. The grid the curve measures only has rows at some values, so there it rolls
from 15 to 65. The peak is at 38, where the guilt is 14.44.

Partner-specific commitment has a fixed cost, c = 5, for breaking your word. Since 5 > 4, it always
rolls when the promise binds it. General guilt answers to the belief that a promise will be kept,
which does not depend on background trust, so its choice does not either.

## Two more results

**Who speaks does not decide.** In the lab, an agreement, where both people promise, is kept more
often than a promise made by one side alone (Di Bartolomeo, Dufwenberg, Papa and Passarelli, 2023).
In the model, letting both people speak does not reproduce that. If the one who decides promises
just as often, a population where both can speak ends exactly like one where only the decider can:
the same reasons survive, seed by seed, in 60 runs out of 60. This follows from how beliefs start:
an agreement and a one-sided promise open with the same expectation, and no reason in the model
treats them differently. It does not say that agreements do not matter to people. It says that, to
produce that gap, a model needs more than these four reasons.

**When a promise can stop binding.** Let a promise stop binding this partner some share of the
time, and let the other person see which reason moves you. Then the other joins someone who rolls
only when bound if that share is below one half. Between zero and one half, personal guilt and
partner-specific commitment survive. From one half on, general guilt and general commitment do. It
is Vanberg's split into two pairs, read as who wins. Inside each pair, the two reasons end up
earning the same, so the share does not tell them apart, except in a narrow band just below one half
that runs through the same belief channel (the paper, Section 6). What does tell them apart, across
the whole range, is background trust.

*These two results use other settings than the curve; the paper lists them (Section 6 and Table 1).*

## What would settle it

Another partner-switch session would not: background trust is the same in both of its conditions,
so it sees a single point of the curve. In the model, personal guilt keeps its word only in the
middle range of background trust, and partner-specific commitment keeps it everywhere. Telling them
apart takes comparing sessions, or populations, whose background trust differs.

## A robustness check

In one variant, the prior expectation can be worth no more than what the other gets without
playing, 5. The right tail does not fall: from 70 on, personal guilt still earns 10. The variant was
announced before the measurement was run.

## Limits

- The other person sees which reason moves you. If they could not, not rolling would pay more and
  the order of payoffs would flip; this was not varied.
- This compares worlds with background trust held in place. In a normal run of the engine,
  background trust is rewritten every generation, and the population stays at a single point of
  the curve.
- In the middle, where two reasons earn the same, which one remains is chance.
- θ and c were not calibrated against the experiments.
- This is an identification result, about what can be told apart, not a claim that people feel
  personal guilt.

## Where the numbers come from

From a simulation engine I wrote in TypeScript. It is deterministic: every run has an explicit seed,
and the same seed repeats the same run. Its tests pin the curve on this page, and one command
regenerates every run in the paper. It is archived with a DOI. {engine}

<!-- slot:cite -->
