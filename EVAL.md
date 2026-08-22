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

Recovery is measured against the best surviving block, not against the whole
output. That is stricter than it sounds and the change was forced rather than
chosen — see "Counting matches in a bag of words" below.

## Results

Thirteen fixtures: nine synthetic, plus the four documents the deployed demo
actually ships.

| Target | Achieved | Answer kept | Mean recovery | Confidence | Gate escalated |
| --- | --- | --- | --- | --- | --- |
| 50% | 49.2% | 84.6% | 84.5% | 80.8% | 15.4% |
| 40% | 38.7% | 84.6% | 84.5% | 80.4% | 15.4% |
| 30% | 27.1% | 84.6% | 84.5% | 73.1% | 15.4% |
| 25% | 22.8% | 61.5% | 64.3% | 63.4% | 30.8% |
| 20% | 17.4% | 38.5% | 44.3% | 45.6% | 69.2% |
| 15% | 12.7% | 46.2% | 49.5% | 34.8% | 84.6% |
| 10% | 6.7% | 30.8% | 34.6% | 20.8% | 92.3% |

Of the 91 runs, 35 lost the answer. The gate warned on 29 of those and missed 6.
Of the 56 runs that kept it, the gate warned anyway on 20.

The 20 per cent row scoring below the 15 per cent row is not a typo and not a
result. Thirteen documents means one changing outcome moves the column by nearly
eight points, and at those ratios the budget is small enough that which blocks
happen to fit is close to arbitrary. Nothing below 25 per cent should be read as
a measurement.

## The four documents the site actually ships

Until today the harness and the site had no fixture in common. The harness had
nine synthetic documents; `src/lib/samples.ts` had four samples the demo loads;
the two sets never met. So the retention figure quoted on the site was measured
on documents no visitor sees, while the documents every visitor does see were
measured on nothing at all.

That was not a bookkeeping complaint. The postmortem sample is what the chat page
opens with, at a default ratio of 40 per cent, and at 40 per cent it dropped the
paragraph naming the cause and returned the four paragraphs discussing the
aftermath. Confidence reported 0.80. The gate said nothing. The first thing a
visitor saw was a silent failure, and no test knew.

`scripts/demo-fixtures.mjs` now reads those four documents out of `samples.ts`
rather than copying them, and asserts that each still contains its recorded
answer span. Rewording a sample breaks the harness loudly instead of quietly
measuring text the site no longer serves.

## Counting matches in a bag of words

The failure above was invisible for a second reason, and it was in the harness
rather than the compressor. Recovery counted an answer span's content tokens
anywhere in the output. On the postmortem sample that scored 0.82 — a pass —
on a run that had dropped the answer outright, because words like "timeout",
"provider" and "pool" all appear in the follow-up sections that survived. The
harness was reporting a pass on a run that returned everything except the
answer.

Recovery is now measured against the best single surviving block. A fact
assembled from fragments three paragraphs apart is not a fact the model has been
given, and a metric that cannot tell those apart cannot be used to argue that
compression is safe. Applying the stricter measure to the old nine fixtures
alone moved retention from 58.2 to 56.0 per cent across all ratios, so the old
number was flattering by about two points on top of everything else.

## Passage length, and BM25's assumption about it

The postmortem sample hid its cause in a 188-token paragraph. BM25 with the
textbook `b = 0.75` scored that paragraph below a 33-token timeline line reading
"error rate on POST /checkout reaches 12 percent", and the allocator then
compounded it, since its density ranking divides by length a second time.

The textbook value assumes documents retrieved from a corpus, where a long
document is more likely to contain a query term by accident and deserves the
penalty. Blocks here are passages inside one document already known to be
relevant, and the assumption inverts: a long passage that matches the question is
more likely to be the explanation than a short one mentioning it in passing.

`b` was swept over all thirteen fixtures rather than picked. Retention sits flat
at 61.5 per cent anywhere from 0.15 to 0.6 and falls off at both ends, so the
chosen 0.4 is the middle of a plateau rather than a peak fitted to the one case
that exposed the problem. It is worth being clear about what that buys: 61.5 per
cent against 58.2 across all seven ratios, which is three runs out of ninety-one.
The reason to make the change is the demo sample it fixes at the default ratio,
not the aggregate, and the aggregate is quoted here so nobody has to take that on
trust.

That last line is reported because leaving it out would flatter the gate badly,
and an earlier version of this document did exactly that. See below.

## The ninth fixture

The eight documents this harness started with were all written the same way:
paragraphs separated by blank lines. That is a fair description of a policy
page or a design doc and a poor description of the material Kernly is aimed at.
An agent transcript, a log tail and an incident timeline are written one line
per event with no blank lines anywhere, and segmentation only ever split on
blank lines and headings. So the whole run arrived as one block.

One block is atomic to every stage after segmentation. It is scored as one
lump and it is admitted or evicted as one lump. A seventeen-line outage
timeline came through as a single 224-token block; against a 111-token budget
it could not fit at any price, so the allocator skipped it and spent the budget
on a 43-token paragraph of unrelated follow-ups. The compressor returned the red
herrings, dropped the answer, and finished at 14 percent of the input against a
requested 40 — most of the budget was never spent. Nothing was wrong in
scoring or in allocation. The unit they had been handed was too coarse to choose
within.

This was not found by the harness. It was found by pasting a timeline into the
deployed chat page and reading the output, which is a poor substitute for a test
and is why the fixture and a segmentation regression test both exist now.

Segmentation now splits a line-oriented run into one block per record, where a
record opens with a bullet, a numbered item, a timestamp or a bare log level.
It is reluctant on purpose: at least two lines have to open a record and record
lines have to be at least half the run, so an ordinary hard-wrapped paragraph is
left intact. Fracturing prose would be a worse bug than the one being fixed.

The fixture is still a miss at every ratio, and it is kept for that reason. With
the timeline split into ten blocks the allocator now has something to choose
between and hits 34 percent against a 40 percent target, but it chooses wrong.
The question is asked in the vocabulary of the symptom — "what actually caused
the checkout outage" — and the answer is written in the vocabulary of the
mechanism: a read timeout raised from 8 seconds to 90, a connection pool that
exhausts. The answer line shares no content word with the question. Two lines
that merely restate the symptom score above it, and the pseudo-relevance pass
does not bridge the gap because the terms it recruits come from those same two
lines. This is what lexical retrieval does. No threshold tuning fixes it;
embeddings would, at the cost of a model dependency, a vector index and the
determinism claim that the on-chain proof rests on.

What the pipeline does do here is say so. Coverage comes back at 0.34, the gate
escalates, and the receipt reports it before anybody reads the output. That is
the case the gate exists for, and the seven runs this fixture adds to the "lost
the answer" column are seven runs the gate caught — the misses stayed at four.

## Reading these numbers honestly

**The safe operating range is roughly 2× to 3.5× compression.** From a 30 to 50
percent target, seven of nine questions still have their answer present and mean
recovery sits near 80 percent. At 25 percent retention falls off a cliff to
55.6, and below 20 percent the pipeline is not a summariser, it is a gamble. The
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

**The 15 percent row is noise, not a recovery.** Retention rising from 38.5 to
46.2 percent as the budget gets *tighter* is one document changing outcome across
thirteen. A harness this size cannot resolve differences that small, and
presenting that reversal as a finding would be dishonest.

**Thirteen fixtures is a small harness and it has been tuned against.** The
feedback parameters below were chosen by sweeping four settings and keeping the
one that scored best on this table, and the BM25 length exponent was chosen the
same way. That is overfitting, in the ordinary sense, and the numbers above
should be read as an upper bound on what a fresh corpus would show. Two things
take a little of the sting out and neither is evidence: the settings that won
were the most conservative of those tried, and `b` was picked from the middle of
a flat plateau rather than from a peak, so it is not balanced on the one document
that motivated it.

**Four of the thirteen are now the same documents the demo ships**, which closes
the gap between what is measured and what is served, and opens a smaller one:
those four are no longer independent of the tuning. A parameter swept against a
table that includes the demo samples will favour the demo samples. The nine
synthetic fixtures are the only part of this table that was not, at some point,
optimised for.

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

## One the harness did not catch

The eight fixtures are all long. Feedback was recruiting vocabulary from the
three best blocks of the first pass without checking that those blocks had
actually matched well, and on a long document that is harmless — the third-best
block of a two thousand token postmortem is genuinely on topic. On a short one it
is not. Probing the live deployment with a six-paragraph billing policy found a
paragraph that shared exactly one common word with the question ("plans") sitting
in the feedback pool, having its own terms recruited, and then being scored again
on the strength of them. It ranked above the paragraph that stated the refund
window. Feedback now admits only blocks that scored at least half as well as the
best one, and the numbers in the table above are unchanged, because no fixture is
short enough to have shown it.

That is worth stating plainly: the harness is eight documents of one shape, and
this defect lived through every run of it. Passing the table is not the same as
being correct.

A change was tried and rejected: light suffix stemming, so that a question about
what "caused" an outage would match a document describing the "cause". It
degraded retention at every useful ratio, because collapsing distinct technical
terms into shared stems flattened the rarity signal that locates them. The idea
was removed and the reasoning left in a comment at the call site, so the next
person to have it can check the measurement instead of repeating the work.
