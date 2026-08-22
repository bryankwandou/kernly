<div align="center">

# Kernly

**Keep the kernel. Drop the chaff.**

A deterministic context compressor for LLM agents. No GPU, no API call, no model
in the loop, and a receipt for every token it claims to save.

Kernly is not a language model and does not contain one. It is the layer that
decides what a model gets to read.

[Live demo](https://kernly.vercel.app) · [Chat](https://kernly.vercel.app/chat) · [Playground](https://kernly.vercel.app/playground) · [Method](https://kernly.vercel.app/method)

</div>

---

## The problem

An agent loop re-sends its whole history every turn. By turn twenty the model is
reading the same system prompt for the twentieth time, the same file it already
read three times, and a paragraph about last quarter's offsite. All of it is
billed, all of it burns power, and a good share of it actively degrades the
answer through long-context attention dilution.

The industry answer has been longer windows and sparser models. Both work, and
both are somebody else's research budget. The lever an application developer
actually owns sits upstream: send less.

## What Kernly is

Six stages, no dependencies, runs in a browser tab in single-digit milliseconds.

| # | Stage | Does |
|---|---|---|
| 1 | Segment | Split into typed blocks: prose, code, JSON, diff, log, table |
| 2 | Fold | Collapse repeated lines and near-duplicate blocks |
| 3 | Score | Rank on BM25 task affinity, positional prior, density, structure |
| 4 | Allocate | Fit to a token budget as a length-normalised knapsack |
| 5 | Compact | Strip grammar from prose only, with every literal vaulted |
| 6 | Gate | Report confidence, and refuse when the context lost too much |

The ordering is load-bearing. Folding runs before scoring so duplicates cannot
distort term rarity; compaction runs after selection because it changes token
counts and would otherwise leave the allocator solving the wrong problem.

Kernly is not a language model and does not contain one. It decides what a model
reads and then hands that to somebody else's model. The hosted chat calls Groq
for open-weights models and Google for Gemini Flash, and it works the same either
way — that is the point of a layer. Set `GROQ_API_KEY`, `GEMINI_API_KEY`, or both
to run it yourself; set neither and the compressor still works, because the
compressor never needed a key.

## Evidence

Three documents exist so that none of the claims above have to be taken on
trust, and all three are reproducible from this repository.

- **[EVAL.md](EVAL.md)** asks the only question that matters: does the answer
  survive? Eight long documents, eight questions, seven compression ratios.
  Includes the ratios where the pipeline fails and the failures the gate missed.
  Run it with `npm run eval`.
- **[PROOF.md](PROOF.md)** is the on-chain loop demonstrated end to end on
  devnet, with two transaction signatures producing an identical digest minutes
  apart. Run it with `npm run proof`.
- **[AUDIT.md](AUDIT.md)** is an adversarial review of the product written
  against it rather than for it, covering the business model, the competitive
  position and the places the design is currently thin.

The short version of the evaluation: the safe operating range is roughly 2x to
3.5x compression, where seven of eight questions still have their answer present
and mean recovery sits near 90 percent. At 4x it falls off a cliff, and the gate
is what tells you so — imperfectly. It catches four in five lost answers and
warns unnecessarily on about a third of healthy runs. Both numbers are published,
because a gate that fires on everything looks flawless if you only report the
first one.

## Install

```bash
npm install @kernly/core
```

```ts
import { compress } from "@kernly/core";

const { output, receipt } = await compress(context, {
  ratio: 0.4,
  query: "why does the session lookup return undefined",
  pin: ["^SYSTEM:"],
});

console.log(receipt.tokensIn, "->", receipt.tokensOut);
if (receipt.escalate) console.warn("gate says do not trust this run");
```

## Why the chain is here

Every product in this category asks you to believe its own dashboard. That is a
weak position, and it gets weaker the moment the number ends up in a
sustainability report or a procurement claim.

Kernly hashes each run, over the normalized input, the output and the canonical
config, and writes that digest to Solana. Because the pipeline is deterministic
and the source is public, anyone can re-run it and confirm the digest. Five
fields land on chain, none of them prompt content:

```json
{ "v": "kernly.v1", "d": "<sha256>", "i": 150, "o": 65, "g": 0.0122 }
```

The devnet MVP uses the SPL Memo program, so the flow is live today with no
deployment step. `programs/kernly-attest` holds the richer registry version,
cumulative per-signer totals in a PDA, which changes where the data lives rather
than what is claimed.

## Honest limitations

- **The chain integration is currently shallow.** A memo is a public append-only
  log, not state that a program reasons about. The registry program is the fix
  and it is not deployed yet. [AUDIT.md](AUDIT.md) is blunt about this.
- **Answer retention degrades below 30 percent.** Measured, tabulated, and
  published rather than discovered by a user.
- **Ranking is weaker than perplexity-based compression.** LLMLingua and its
  descendants score every token under a small language model and rank better.
  They also need a GPU to save you GPU time. Kernly takes the opposite trade
  deliberately.
- **The token count is an estimate**, fitted to cl100k, within roughly 6% on
  mixed content. Good enough to drive a budget; not suitable for billing.
- **The carbon figure is derived, not measured.** Tokens are exact. Watt-hours
  and grams come from two configurable factors whose true values depend on
  hardware, batch size and grid.
- **The lexical stage is English-only.** Every other stage is language-agnostic.
- **Nothing is paraphrased**, by design. A paraphrase cannot be verified by
  re-running a deterministic function.

## Repo layout

```
packages/kernly-core/    the algorithm, MIT, zero dependencies
programs/kernly-attest/  Anchor program for the on-chain registry
scripts/                 evaluation harness and the devnet proof
src/                     Next.js app: landing, playground, verifier
SKILL.md                 agent-facing skill definition
```

## Development

```bash
npm install
npm run test:core   # 12 tests, no network
npm run eval        # answer-retention harness, no network
npm run dev
```

## Prior art

The lexical stage owes its idea to [caveman](https://github.com/juliusbrussee/caveman)
by Julius Brussee: strip the grammar, keep the nouns. Kernly's version is a
reimplementation with type-awareness and a literal vault, and carries no
upstream code. Stage-three scoring is a cheap statistical stand-in for the
perplexity ranking introduced by
[LLMLingua](https://www.microsoft.com/en-us/research/blog/llmlingua-innovating-llm-efficiency-with-prompt-compression/).

## Licence

MIT. The algorithm is the product, and it is open.
