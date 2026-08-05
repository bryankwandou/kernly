# Adversarial audit

Written against Kernly, not for it. The instruction was to attack the idea
without cushioning, so every section below starts from the assumption that the
project is weaker than it looks and has to earn each point back.

---

## 1. The roast

### The on-chain part is decoration until proven otherwise

A judge who has seen four hundred submissions will ask one question: what breaks
if you delete Solana from this product? Today the honest answer is "the receipt
page". Compression works fine off-chain. Writing a hash to a memo program is not
a use of a blockchain, it is a use of a very expensive append-only log that
happens to be public.

This is the single most likely reason to lose. "We added a memo" is the most
common failure pattern in AI-plus-crypto submissions.

**What actually fixes it** — not a better explanation, a different design. The
chain has to hold something that cannot live on a server without losing its
meaning:

- **Cumulative, non-repudiable savings per signer.** A PDA that only increments,
  keyed to a wallet, is a carbon-savings ledger a third party can audit without
  asking Kernly for a database dump. That is a real reason for state to be on
  chain: the claim is about a history, and the value comes from nobody being able
  to quietly edit the history.
- **Filter authorship and royalties.** Compression profiles — the config blobs
  that tune segmentation and salience for a specific corpus — are the actual
  intellectual property. Register a profile hash on chain with an author, let
  anyone use it, meter usage by attested receipts, pay the author. Now the chain
  is doing settlement between parties who do not trust each other, which is the
  only thing chains are unambiguously good at.
- **Staked claims.** A publisher bonds SOL behind a savings claim. Anyone who
  can produce an input where the published config does not reproduce the digest
  slashes the bond. This turns the verifier from a nice page into an economic
  actor.

Until at least the first of those ships as an Anchor program, the correct
self-assessment is: interesting compression library with a blockchain garnish.

### The token savings number is softer than it sounds

Token counts come from a character-class estimator, not a real BPE tokenizer.
Roughly six percent error. That is fine for a dashboard and fatal for a billing
claim, and the pitch drifts toward billing language. If somebody pays based on
"tokens saved", a six percent estimator is a lawsuit waiting to be filed.

**Fix:** ship the real tokenizer as an optional path, keep the estimator as the
zero-dependency default, and never let the on-chain record carry an estimated
count without a flag saying which counter produced it.

### Nobody has demonstrated that compressed context still answers the question

The gate returns a confidence score computed from salience retention, ratio and
block coverage. It is a heuristic about the *shape* of the output. It has never
been correlated against whether a model given the compressed context produces
the same answer as a model given the full context. Without that correlation the
gate is a number that looks rigorous and proves nothing.

**Fix:** an evaluation harness. Take a public QA set with long contexts, run
each question at full context and at several compression ratios, measure answer
agreement, and publish the curve. If agreement holds above 95% at a 3× ratio,
that chart is the strongest slide in the deck. If it does not, better to know
before a judge finds out.

This is the highest-value missing artifact in the entire project.

### "Green AI" is the weakest part of the pitch, not the strongest

Grams of CO2e derived from a global average grid intensity multiplied by a
guessed watt-hours-per-token is not measurement, it is arithmetic dressed as
science. The numbers are also tiny — the devnet fixture avoided 0.0122 grams.
Twelve milligrams. An audience doing that math in their head will discount
everything else you said.

The environmental framing is a *consequence*, not a value proposition. Buyers do
not purchase context compression to save the planet, they purchase it because
their inference bill is large. Lead with cost and latency; let carbon be the
third bullet, honestly labelled.

### The moat is thin and the incumbents are adjacent

Everything in the pipeline is public technique: BM25 is from the nineties,
positional priors are well documented, near-duplicate folding via Jaccard is a
textbook method. A competent engineer rebuilds this in a fortnight. Meanwhile
every model provider is shipping prompt caching, and caching solves a large part
of the same pain for free with no integration work.

The defensible layer is not the algorithm. It is the corpus of tuned profiles
plus the verification network plus the receipts that accumulate under a wallet.
None of those exist yet at scale, which means the moat is currently a plan.

### Determinism is the real asset and the pitch buries it

The one genuinely differentiated property is that the pipeline has no model call
inside it, so the same input and config produce the same bytes forever. That is
what makes a receipt verifiable, makes CI reproducible, and makes an audit
possible. Every LLM-based compressor in the market fails this. It should be the
first sentence, and right now it is somewhere in paragraph four.

---

## 2. Business model canvas

| Block | Honest state |
| --- | --- |
| **Customer segments** | Weakly defined. "Teams with large LLM bills" is not a segment. The plausible beachhead is agent-framework builders whose context windows overflow on long tool traces — they feel the pain daily and can integrate a library in an afternoon. Enterprises with compliance requirements are the second wave, because they need the audit trail, not the savings. |
| **Value proposition** | "Cut context cost with a result you can prove" is strong. "Save carbon" is weak. "Beat prompt caching" is unproven and must not be claimed until benchmarked. |
| **Channels** | Open-source library plus a skill definition. Correct choice — developer tooling spreads through repos, not sales calls. Underused: the verify page is a shareable artifact, and shared artifacts are distribution. |
| **Customer relationships** | Currently none. No account, no dashboard, no reason to return after the first run. The wallet-keyed cumulative ledger is what turns a one-off tool into a returning relationship. |
| **Revenue streams** | Genuinely unresolved, and this is the biggest business hole. The algorithm is MIT-licensed, which means the thing that works is the thing nobody pays for. Candidates: hosted verification and analytics, profile marketplace with a take rate, enterprise attestation with retention guarantees. Pick one before the demo, because "we'll figure out monetisation" reads as "we haven't thought about it". |
| **Key resources** | The pipeline, the determinism property, the profile corpus that does not exist yet. |
| **Key activities** | Building the eval harness, shipping the Anchor registry, growing the profile library. In that order. |
| **Key partners** | Agent frameworks, inference providers who want to advertise efficiency, sustainability reporting vendors who need auditable numbers. |
| **Cost structure** | Near zero. Static site, client-side compute, devnet transactions. Real costs start with hosted verification. |

---

## 3. SWOT

**Strengths.** Determinism, and the fact that it is demonstrable rather than
claimed. Zero-dependency runtime that works in a browser, an edge function and
Node without a native module. The code is small enough to actually read, which
matters for a trust product. The devnet loop is live and reproducible today.

**Weaknesses.** No evaluation against answer quality. Token counts estimated.
Carbon figures soft. Blockchain integration currently shallow. No revenue model.
No retention mechanism. Algorithm reimplementable in two weeks.

**Opportunities.** Every provider's prompt caching leaves the long-tail case
uncovered — contexts that change slightly on each turn get no cache hit at all,
and that is exactly the agent-loop case. Regulatory pressure on reported
emissions is creating demand for numbers that survive an audit. Nobody has built
a credible verification layer for efficiency claims.

**Threats.** A model provider shipping native context compression closes the
market overnight. Context windows continuing to grow while prices fall reduces
the urgency. And the perennial one: the problem gets solved adequately for free,
so the willingness to pay never materialises.

---

## 4. Scorecard

Scored against what would be needed to place first, not against effort spent.

| Dimension | Score | Reasoning |
| --- | --- | --- |
| Problem is real | 8 / 10 | Inference cost is a live budget line for anyone shipping agents. |
| Solution is differentiated | 7 / 10 | Determinism is genuinely rare. The rest is public technique. |
| Technical execution | 8 / 10 | Small, tested, reproducible, no dependency sprawl. |
| Chain integration depth | 4 / 10 | Memo works and is honest about being an MVP, but it is shallow. |
| Evidence of value | 3 / 10 | No answer-quality evaluation. This is the gap. |
| Business model | 4 / 10 | Open core with no chosen revenue line. |
| Presentation | 7 / 10 | Clear, restrained, no filler. Leads with the wrong claim. |

Weighted, this is a competent submission that is one artifact — the evaluation
curve — and one program away from being a strong one.

---

## 5. What to do next, in order

1. **Evaluation harness.** Answer agreement versus compression ratio, on a
   public long-context QA set. Publish the curve, including the ratios where it
   falls apart. Honest failure points build more credibility than a flat green
   line nobody believes.
2. **Anchor registry program.** Cumulative per-signer savings in a PDA. Deploy to
   devnet. This converts the chain from a log into state that matters.
3. **Pick the revenue line and say it out loud.** Profile marketplace is the
   most defensible, because it is the only one where the open licence helps
   rather than hurts.
4. **Rewrite the top of the pitch** around determinism and cost, with carbon
   demoted to a labelled estimate.
5. **Real tokenizer as an opt-in path**, with the on-chain record flagging which
   counter produced the numbers.
