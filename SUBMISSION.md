# Hackathon submission

## Name

Kernly

## One line

A deterministic context compressor for LLM agents that writes a verifiable
receipt of every token it saves to Solana.

## The pitch in a paragraph

Agent loops re-send their entire history on every turn, so developers pay
repeatedly for context the model has already read and which, past a certain
length, makes the answer worse rather than better. Kernly cuts that context down
through six deterministic stages that run in a browser tab with no GPU and no
model call. Because there is no model in the loop, a compression run is a pure
function: the same input and config produce the same bytes forever. That single
property is what makes the rest possible — the run is hashed and the hash is
written to Solana, so anybody can re-run the open-source pipeline and confirm
the savings claim instead of trusting a vendor dashboard.

## Links

| What | Where |
| --- | --- |
| Live app | https://kernly.vercel.app |
| Playground (runs in your browser) | https://kernly.vercel.app/playground |
| Verifier | https://kernly.vercel.app/verify |
| Method write-up | https://kernly.vercel.app/method |
| Source | https://github.com/bryankwandou/kernly |
| Devnet transaction | https://explorer.solana.com/tx/2jNCWyHHA2nyPwCeQG7WLAePfwSN413kwP19w7XUYWeToP3SXCmirNF3H4s23EjmnGNPgakMbrumMJ9tHu6Pyamq?cluster=devnet |

## How to verify the whole thing in under a minute

Nothing below requires an API key, and none of it requires trusting us.

```bash
git clone https://github.com/bryankwandou/kernly && cd kernly && npm install

npm run test:core   # 12 unit tests, no network
npm run eval        # answer-retention sweep across seven ratios, no network

KERNLY_SIGNER=<base58 devnet key> npm run proof
# compresses a fixture, posts the digest to devnet, reads it back,
# recomputes locally, prints whether they match
```

Or skip the clone entirely: open the playground, compress something, connect a
wallet, attest, and follow the explorer link. Then paste that signature into the
verifier and watch the browser recompute the digest with no server involved.

## What runs on Solana

The devnet MVP writes a compression receipt through the SPL Memo program, signed
by the user's wallet. Five fields land on chain and none of them are prompt
content:

```json
{ "v": "kernly.v1", "d": "<sha256 digest>", "i": 150, "o": 65, "g": 0.0122 }
```

The verifier reads that record straight off the chain, recomputes the digest in
the browser from the user's own input, and shows both. There is no Kernly server
in the verification path, which is the entire reason the record is on a public
ledger rather than in a database.

Memo was chosen for the MVP over a custom program deliberately: it is deployed
on every cluster, so the flow is genuinely live today with no deployment step,
and the payload is readable by any explorer. `programs/kernly-attest` holds the
registry version — cumulative per-signer totals held in a PDA — which changes
where the data lives, not what is asserted. Our own audit document is blunt that
until that program ships, the chain integration is shallower than it should be.

## Evidence, in the order a sceptic should read it

1. **[EVAL.md](EVAL.md)** — does the answer survive compression? Eight long
   documents with labelled answer spans, swept across seven ratios. Published
   with the failing rows intact: the safe range is about 2x to 3.5x, and at a 25
   percent target retention falls off a cliff. The confidence gate caught 15 of
   19 failures, missed 4, and warned unnecessarily on 12 of the 37 healthy runs —
   both error rates are printed, because a gate that fires on everything scores
   perfectly on the first number alone.
2. **[PROOF.md](PROOF.md)** — the on-chain loop, two signatures minutes apart
   producing an identical digest, with the reproduction command.
3. **[AUDIT.md](AUDIT.md)** — an adversarial review written against the project.
   It argues the chain integration is currently decorative, that the carbon
   framing is the weakest part of the pitch, and that the moat is a plan rather
   than a fact.

That third document is included on purpose. Every criticism a judge is likely to
raise is already in it, in harsher language, with the fix named.

## What building the evaluation harness changed

It found two defects that no unit test would have caught, because both produced
output that looked entirely reasonable.

The positional prior — the well-documented tendency to weight a document's head
and tail above its middle — was discounting middle blocks even when they matched
the query strongly. Answers live in the middle of documents at least as often as
at the edges, and the prior was evicting them. It is now faded out in proportion
to match strength.

Density-first knapsack selection, the textbook approximation, systematically
prefers a three-token heading to a forty-token paragraph almost regardless of
content. Budgets were filling with signposts pointing at material that had
already been discarded. Length normalisation is now sublinear and the
highest-scoring block is admitted before greedy selection begins.

Later runs found three more. Exact term matching was too literal, so a question
about a "refund" scored zero against a document that only wrote "refunds";
matching now works on a shared prefix at a discount. One pass of BM25 can only
find passages that reuse the question's words, so a second pass was added:
harvest the rarest terms from the three best blocks of the first pass and re-rank
with those included at reduced weight. That is Rocchio pseudo-relevance feedback,
it needs no model, and it kept the pipeline deterministic.

The third was the gate itself. Confidence had been built entirely from retained
salience, achieved ratio and surviving block count — every one of those a
statement about the compression rather than about the question. Since retained
mass falls mechanically as the budget tightens, the gate was really just
reporting the setting it had been handed: it warned on 34 of 37 healthy runs,
which is indistinguishable from having no gate at all. The receipt now carries
`queryCoverage` and confidence is led by it.

Together: mean answer recovery at a 50 percent target went from 62.1 to 90.3
percent, answer retention across the 30 to 50 percent band went from 75 to 87.5,
silent failures fell from 15 to 4, and false alarms fell from 34 to 12.

One idea — light suffix stemming so a question about what "caused" an outage
matches a document describing the "cause" — was implemented, measured, found to
make retention worse, and removed. The reasoning sits in a comment at the call
site so the next person to have that idea checks the measurement instead of
repeating the work.

One failure is documented and not fixed. All four runs the gate still misses are
the same fixture, where the question is asked in plain words and the answering
passage is written in specific ones. Every question term appears in the output,
so coverage reads 1.0 and the gate sees nothing wrong, while the paragraph that
answers it was evicted. Closing that gap needs embeddings, and embeddings would
cost the determinism the receipts are built on. The trade is written down rather
than quietly taken.

## Why this is not another AI-plus-crypto wrapper

The honest test is: what breaks if you delete the chain? For most submissions in
this category the answer is nothing, and we hold ourselves to the same standard.

What the chain provides here is a savings history that its subject cannot edit.
An efficiency claim that ends up in a sustainability report or a procurement
document is worth exactly as much as the auditability of its source, and today
every such claim in this industry is self-reported by the party that benefits
from it. A public ledger plus a deterministic open-source function removes the
need to trust the claimant. That is not a property a server can offer, because
the objection to a server is that its owner can rewrite it.

The direction this scales in is settlement: compression profiles are the real
intellectual property, and registering a profile hash on chain with an author,
metering its use through attested receipts, and paying that author is a
transaction between parties with no reason to trust each other.

## Team

Bryan Kwandou — nayrbryangaming01@gmail.com

## Licence

MIT. The algorithm is the product, and it is open.
