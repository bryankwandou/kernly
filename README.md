<div align="center">

# Kernly

**Keep the kernel. Drop the chaff.**

A deterministic context compressor for LLM agents. No GPU, no API call, no model
in the loop â€” and a receipt for every token it claims to save.

[Live demo](https://getkernly.vercel.app) Â· [Method](https://getkernly.vercel.app/method) Â· [Playground](https://getkernly.vercel.app/playground)

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
| 1 | Segment | Split into typed blocks â€” prose, code, JSON, diff, log, table |
| 2 | Fold | Collapse repeated lines and near-duplicate blocks |
| 3 | Score | Rank on BM25 task affinity, positional prior, density, structure |
| 4 | Allocate | Fit to a token budget as a density-first knapsack |
| 5 | Compact | Strip grammar from prose only, with every literal vaulted |
| 6 | Gate | Report confidence, and refuse when the context lost too much |

The ordering is load-bearing. Folding runs before scoring so duplicates cannot
distort term rarity; compaction runs after selection because it changes token
counts and would otherwise leave the allocator solving the wrong problem.

## Install

```bash
npm install @kernly/core
```

```ts
import { compress } from "@kernly/core";

const { output, receipt } = await compress(context, {
  ratio: 0.35,
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

Kernly hashes each run â€” normalized input, output, canonical config â€” and writes
that digest to Solana. Because the pipeline is deterministic and the source is
public, anyone can re-run it and confirm the digest. Five fields land on chain,
none of them prompt content:

```json
{ "v": "kernly.v1", "d": "<sha256>", "i": 336, "o": 121, "g": 0.031 }
```

The devnet MVP uses the SPL Memo program, so the flow is live today with no
deployment step. `programs/kernly-attest` holds the richer registry version â€”
cumulative per-signer totals in a PDA â€” which changes where the data lives, not
what is claimed.

## Honest limitations

- **Ranking is weaker than perplexity-based compression.** LLMLingua and its
  descendants score every token under a small language model and rank better.
  They also need a GPU to save you GPU time. Kernly takes the opposite trade
  deliberately.
- **The token count is an estimate**, fitted to cl100k, within roughly 6% on
  mixed content. Good enough to drive a budget; not suitable for billing.
- **The carbon figure is derived, not measured.** Tokens are exact. Watt-hours
  and grams come from two configurable factors whose true values depend on
  hardware, batch size and grid. Kernly anchors the tokens and labels the carbon
  as an estimate everywhere it appears.
- **The lexical stage is English-only.** Every other stage is language-agnostic.
- **Nothing is paraphrased**, by design â€” a paraphrase cannot be verified by
  re-running a deterministic function.

## Repo layout

```
packages/kernly-core/    the algorithm, MIT, zero dependencies
programs/kernly-attest/  Anchor program for the on-chain registry
src/                     Next.js app â€” landing, playground, verifier
SKILL.md                 agent-facing skill definition
```

## Development

```bash
npm install
npm run test:core   # 12 tests, no network
npm run dev
```

## Prior art

The lexical stage owes its idea to [caveman](https://github.com/juliusbrussee/caveman)
by Julius Brussee â€” strip the grammar, keep the nouns. Kernly's version is a
reimplementation with type-awareness and a literal vault, and carries no
upstream code. Stage-three scoring is a cheap statistical stand-in for the
perplexity ranking introduced by
[LLMLingua](https://www.microsoft.com/en-us/research/blog/llmlingua-innovating-llm-efficiency-with-prompt-compression/).

## Licence

MIT. The algorithm is the product, and it is open.
