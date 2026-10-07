---
title: The finding
---

<!-- lock -->

## Four reasons, two pairs

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

## The formula

Call background trust *a*, and write every belief in hundredths, so that 76 is the expectation
after a promise. The guilt available to you is then *a* · (76 − *a*) / 100. Personal guilt rolls
the die if θ · guilt > 4, the cost of rolling (14 − 10), with θ = 0.6, how much a unit of guilt
weighs against a unit of money: that is, if the guilt is above 20/3, about 6.67.

Setting *a* · (76 − *a*) / 100 = 20/3 gives the analytic cut: personal guilt rolls between about
10.1 and about 65.9. The grid the curve measures only has rows at some values, so there it rolls
from 15 to 65. The peak is at 38, where the guilt is 14.44.

Partner-specific commitment has a fixed cost, c = 5, for breaking your word. Since 5 > 4, it always
rolls when the promise binds it. General guilt answers to the expectation after a promise, which
does not depend on background trust, so its choice does not either.

<!-- slot:guilt-chart -->

## A robustness check

In one variant, the prior expectation can be worth no more than what the other gets without
playing, 5. The right tail does not fall: from 70 on, personal guilt still earns 10. The variant was
announced before the measurement was run.

## Limits

- This compares worlds with background trust held in place. In a normal run of the engine,
  background trust is rewritten every generation, and the population stays at a single point of
  the curve.
- In the middle, where two reasons earn the same, which one remains is chance.
- θ and c were not calibrated against the experiments.
- This is an identification result, about what can be told apart, not a claim that people feel
  personal guilt.

The engine that measured the curve: {engine}.
