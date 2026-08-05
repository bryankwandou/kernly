# Kernly — pitch

Twelve slides. Each one below gives the line that goes on the slide, the thing
that goes underneath it, and what to say out loud. Nothing here claims a number
that is not reproducible from this repository.

---

## 1. Title

> **Kernly**
> Keep the kernel. Drop the chaff.

**On screen:** the mark, the line, and one URL — getkernly.vercel.app.

**Say:** "Kernly is a context compressor for LLM agents. The interesting part
isn't that it compresses. It's that you can prove what it did."

---

## 2. The problem, stated as money

> An agent loop re-reads its own history every single turn.

**On screen:** a turn counter climbing from 1 to 20, the same system prompt
highlighted twenty times.

**Say:** "By turn twenty, the model has read your system prompt twenty times,
the same file three times, and a paragraph nobody needed once. You paid for
every one of those reads. And past a certain length, the extra context is not
neutral — it dilutes attention and makes the answer worse. You are paying to
degrade your own output."

---

## 3. Why the existing answers don't reach

> Longer windows and sparser models are somebody else's research budget.

**On screen:** three columns — bigger context windows, sparse routing, prompt
caching. A note under each on what it does not cover.

**Say:** "Caching is the closest thing to a competitor and it is free, so let's
be honest about it: caching works beautifully when the prefix is identical.
Agent loops are exactly the case where it isn't — the context mutates a little
every turn, and a one-token change means a full cache miss. That gap is the
market."

---

## 4. What Kernly does

> Six deterministic stages. No model in the loop.

**On screen:** the pipeline, one row per stage, with the token count falling
down the right-hand edge.

**Say:** "Segment into typed blocks. Fold duplicates. Score against the task.
Fit to a budget. Compact the prose. Then a gate that reports how much it trusts
the result. Milliseconds, in a browser tab, no GPU."

---

## 5. The property nobody else has

> Same input, same config, same bytes. Forever.

**On screen:** two devnet transactions, minutes apart, digest
`191f39d9…a57c6d9a` on both.

**Say:** "Every compressor built on a language model is non-deterministic by
construction. Ours has no model inside it, which means a run is a pure function.
That is not an aesthetic preference. It is the thing that makes the next four
slides possible."

---

## 6. Therefore: a receipt

> Hash the run. Write the hash to Solana. Anyone can check it.

**On screen:** the on-chain JSON, five fields, with `d` circled.

**Say:** "Normalized input, output, canonical config, one sha256. That digest
goes on chain. No prompt content, ever. Because the algorithm is open and the
function is pure, a stranger re-runs it and either gets the same hash or catches
us lying."

---

## 7. Live, today

> Two signatures. One digest. Devnet.

**On screen:** the explorer, real transaction, real memo payload.

**Say:** "This is not a mock. `npm run proof` compresses a fixture, posts the
digest to devnet, reads it back off the chain, recomputes locally and compares.
Ten seconds, and you need nothing from us but a devnet keypair."

---

## 8. The number we were most afraid of

> Does the answer survive?

**On screen:** the retention table from EVAL.md, unedited, including the rows
where it fails.

**Say:** "Compression ratio is trivial to game — throw away everything and
report ninety-nine percent. So we built a harness that asks the real question.
Eight long documents, eight questions, the exact answer span labelled. At two to
two-and-a-half times compression, three quarters of questions still have their
answer. Below that it falls apart, and we're showing you that row rather than
cropping it. Running this harness the first time found two bugs that no unit
test would have caught, and fixing them moved recovery from sixty-two percent to
eighty-three."

---

## 9. And the gate

> It flagged 22 of the 28 failures. It missed 6.

**On screen:** the same table, escalation column highlighted.

**Say:** "A compressor that fails silently is worse than one that compresses
less. The gate exists to say 'do not trust this run'. It catches most failures
and it is not perfect, and a six-in-fifty-six miss rate is a defect we are
naming rather than burying."

---

## 10. Where this becomes a business

> The algorithm is free. The trust layer is not.

**On screen:** three tiers — open library, verification and analytics,
profile marketplace.

**Say:** "The pipeline is MIT and stays MIT; giving it away is how it spreads.
What accrues value is downstream. A wallet's cumulative attested savings is an
audit trail you cannot get from a vendor dashboard. And compression profiles —
the tuned configs for a specific corpus — are the real intellectual property.
Register a profile on chain, let anyone use it, meter usage through attested
receipts, pay the author. That is settlement between parties who don't trust
each other, which is the one thing a chain is unambiguously best at."

---

## 11. What's next, honestly

> The registry program. Then a model in the eval loop.

**On screen:** three items, dated.

**Say:** "Right now the chain holds a memo, and a memo is a log, not state. The
Anchor program that turns it into cumulative per-signer totals in a PDA is
written and not yet deployed — that is the next commit, and our own audit
document says so in harsher words than these. After that, answer agreement with
a real model in the loop, which is the stronger version of slide eight."

---

## 12. Close

> Send less. Prove it.

**On screen:** the mark, the URL, the repository.

**Say:** "Every efficiency claim in this industry is self-reported. We put ours
on a public ledger and open-sourced the function that produces it, so you never
have to take our word for anything. Try it at getkernly.vercel.app — the
playground runs entirely in your browser."

---

## Delivery notes

- **Lead with determinism, not carbon.** Carbon is a consequence and the numbers
  are milligrams; an audience doing that arithmetic mid-pitch will discount
  everything else. Mention it once, labelled as a derived estimate.
- **Show the failing rows.** Slide 8 is more persuasive with the bad numbers in
  it than without. Every judge has seen a flat green chart and stopped believing
  charts.
- **Have `npm run proof` in a terminal already open.** If anyone asks whether
  the chain part is real, run it live. It takes ten seconds and it ends the
  question.
- **Never say the word "revolutionary".** The demo either lands or it doesn't.
