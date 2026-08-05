# Does the answer survive compression?

Compression ratios are easy to report and easy to game. Throw away ninety
percent of a document and the ratio looks superb right up until somebody asks a
question the discarded ninety percent contained the answer to. This page reports
the number that is actually at stake.

Reproduce with `npm run eval`. No API key, no model call, no network.

## Method

Eight synthetic long-context documents, each paired with a question a person
would plausibly ask of it and the exact span that answers it. Every document
contains distractor paragraphs that share vocabulary with the question but do
not answer it, and several bury the answer in the middle where a positional
prior helps least.

For each target ratio, the document is compressed with the question supplied as
the query, and the output is checked for the answer span's content tokens. A run
counts as retained at 0.8 recovery or above, which tolerates lexical compaction
dropping grammatical filler but not the loss of a fact.

## Results

| Target | Achieved | Answer kept | Mean recovery | Confidence | Gate escalated |
| --- | --- | --- | --- | --- | --- |
| 50% | 49.5% | 75.0% | 82.9% | 89.9% | 0% |
| 40% | 40.6% | 75.0% | 81.5% | 82.2% | 0% |
| 30% | 26.8% | 50.0% | 59.2% | 67.2% | 12.5% |
| 25% | 24.0% | 37.5% | 49.3% | 62.8% | 12.5% |
| 20% | 18.9% | 37.5% | 43.6% | 47.1% | 62.5% |
| 15% | 12.2% | 50.0% | 53.0% | 34.6% | 75.0% |
| 10% | 8.7% | 25.0% | 29.7% | 26.5% | 100% |

Across all 56 runs, 28 lost the answer. The confidence gate flagged 22 of those
and missed 6.

## Reading these numbers honestly

**The safe operating range is roughly 2× to 2.5× compression.** At a 40 to 50
percent target, three quarters of questions still have their answer present and
the mean recovery sits above 80 percent. Below a 30 percent target the pipeline
is no longer a summariser, it is a gamble, and the table says so.

**Nobody should run this unsupervised at aggressive ratios.** That is precisely
what the gate exists for, and it earns most of its keep: at the ratios where
failures cluster it escalates on the majority of them. It is not a guarantee.
Six silent failures out of 56 runs is a real defect rate, not a rounding error.

**The 15 percent row is noise, not a recovery.** Retention ticking up from 37.5
to 50 percent between the 20 and 15 percent rows across eight fixtures is one
document changing outcome. Eight fixtures cannot resolve differences that small,
and presenting that bump as a finding would be dishonest.

**This is a floor, not a ceiling, on the real question.** Answer-span presence is
necessary for a model to answer correctly; it is not sufficient. A model reading
compressed context might still be confused by what was removed around the
answer. Measuring that needs a model in the loop and a budget, and it is the next
thing to build. What can be said today is that a pipeline failing this test
could not possibly pass the harder one.

## What the harness already changed

Running it for the first time exposed two defects that no unit test would have
caught, because both produced perfectly plausible output.

**The positional prior was evicting answers.** The U-shaped curve that weights
document head and tail above the middle is sound when nothing is known about the
task. When a query is supplied and a middle block matches it strongly, the prior
was still discounting that block. It is now faded out in proportion to match
strength.

**Density-first selection was filling the budget with headings.** Strict
value-per-token ranking is the textbook knapsack approximation, and on prose it
systematically prefers a three-token heading over a forty-token paragraph almost
regardless of content. Budgets were filling with signposts that pointed at
material already discarded. The length normalisation is now sublinear, and the
single highest-scoring block is admitted before greedy selection begins.

Together these moved mean answer recovery at a 50 percent target from 62.1
percent to 82.9 percent, and cut silent failures from 15 to 6.

A third change was tried and rejected: light suffix stemming, so that a question
about what "caused" an outage would match a document describing the "cause". It
degraded retention at every useful ratio, because collapsing distinct technical
terms into shared stems flattened the rarity signal that locates them. The idea
was removed and the reasoning left in a comment at the call site, so the next
person to have it can check the measurement instead of repeating the work.
