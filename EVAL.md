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
| 50% | 51.4% | 87.5% | 90.3% | 85.4% | 12.5% |
| 40% | 40.2% | 87.5% | 90.3% | 83.4% | 12.5% |
| 30% | 27.5% | 87.5% | 88.9% | 76.6% | 12.5% |
| 25% | 23.8% | 62.5% | 69.9% | 67.6% | 25.0% |
| 20% | 18.1% | 50.0% | 56.2% | 46.1% | 62.5% |
| 15% | 12.2% | 50.0% | 54.8% | 41.1% | 75.0% |
| 10% | 8.0% | 37.5% | 41.5% | 26.6% | 87.5% |

Of the 56 runs, 19 lost the answer. The gate warned on 15 of those and missed 4.
Of the 37 runs that kept it, the gate warned anyway on 12.

That last line is reported because leaving it out would flatter the gate badly,
and an earlier version of this document did exactly that. See below.

## Reading these numbers honestly

**The safe operating range is roughly 2× to 3.5× compression.** From a 30 to 50
percent target, seven of eight questions still have their answer present and mean
recovery sits near 90 percent. At 25 percent retention falls off a cliff to
62.5, and below 20 percent the pipeline is not a summariser, it is a gamble. The
table says so rather than stopping at the flattering rows.

**The gate is a smoke alarm, not a proof.** It catches roughly four in five lost
answers and cries wolf on roughly a third of healthy runs. Both halves of that
sentence matter. A caller who escalates on every warning will pay for some
inference they did not need; a caller who ignores warnings will ship a wrong
answer about one time in fourteen. Neither number is good enough to run
unattended at aggressive ratios, and the honest recommendation is to treat a
warning as a reason to lower the ratio rather than as a verdict.

**Four silent failures are all the same document.** Every run the gate missed is
the support-thread fixture, where the question is asked in ordinary words —
"how was the customer's login problem resolved" — about a passage written in
specific ones: two identities sharing an email address after an SSO migration.
Every term of the question appears somewhere in the compressed output, so
coverage reports 1.0 and the gate sees nothing wrong, while the paragraph that
actually answers it was evicted. This is the known floor of a purely lexical
method and it will not be fixed by tuning. Closing it needs a representation
that knows "resolved" and "restored access" are the same event, which means
embeddings, which means giving up the determinism the receipts depend on. The
trade is recorded here rather than quietly taken.

**The 15 percent row is noise, not a recovery.** Retention holding at 50 percent
between the 20 and 15 percent rows across eight fixtures is one document changing
outcome. Eight fixtures cannot resolve differences that small, and presenting
that flatness as a finding would be dishonest.

**Eight fixtures is a small harness and it has been tuned against.** The feedback
parameters below were chosen by sweeping four settings and keeping the one that
scored best on this table. That is overfitting, in the ordinary sense, and the
numbers above should be read as an upper bound on what a fresh corpus would show.
The settings that won were also the most conservative of the four, which is some
comfort, but not evidence.

**This is a floor, not a ceiling, on the real question.** Answer-span presence is
necessary for a model to answer correctly; it is not sufficient. A model reading
compressed context might still be confused by what was removed around the
answer. Measuring that needs a model in the loop and a budget, and it is the next
thing to build. What can be said today is that a pipeline failing this test could
not possibly pass the harder one. The side-by-side chat at `/chat` is the
informal version of that harder test: it sends the same question to the same
model twice, once against the full document and once against the compressed one,
and shows both answers.

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
material already discarded. The length normalisation is now sublinear, the
single highest-scoring block is admitted before greedy selection begins, and
headings no longer compete for budget at all — they are withdrawn, and re-attached
afterwards only to sections that actually survived.

Three further changes came out of later runs.

**Exact term matching was too literal.** A question about a "refund" scored zero
against a document that only ever wrote "refunds", so the paragraph holding the
answer ranked below an unrelated one about billing. Terms now match on a shared
prefix as well as exactly, at a discount, which also covers the harder
identity/identities shape where neither word contains the other.

**Blind ranking was missing answers written in different words.** One pass of
BM25 can only find a passage that reuses the question's vocabulary. A second pass
now runs: take the three highest-scoring blocks from the first, harvest their
rarest terms, and re-rank with those added at 0.4 weight. This is Rocchio
pseudo-relevance feedback, it needs no model, and it stays deterministic. It
moved retention at the 30 to 50 percent targets from 75 percent to 87.5.

**The gate was measuring the wrong thing.** Confidence was built from retained
salience, achieved ratio and surviving block count — all statements about the
compression, none about the question. Because retained mass falls mechanically as
the budget tightens, the gate ended up reporting the setting it had been given:
it warned on 34 of 37 healthy runs, which is the same as not having a gate. The
receipt now carries `queryCoverage`, the fraction of the question's rare terms
still present in the output, and confidence is led by that with the shape terms
reduced to a fifth of the weight. Across the harness, runs that kept the answer
average 0.85 coverage and runs that lost it average 0.46, so the threshold does
real work. False alarms fell from 34 to 12 while the catch rate held at four in
five.

A change was tried and rejected: light suffix stemming, so that a question about
what "caused" an outage would match a document describing the "cause". It
degraded retention at every useful ratio, because collapsing distinct technical
terms into shared stems flattened the rarity signal that locates them. The idea
was removed and the reasoning left in a comment at the call site, so the next
person to have it can check the measurement instead of repeating the work.
