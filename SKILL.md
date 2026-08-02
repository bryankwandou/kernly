---
name: kernly
description: Compress an LLM context before sending it, using a deterministic six-stage filter that runs locally with no GPU and no API call. Use when a prompt, agent transcript, retrieval bundle or tool output is large enough that token cost, latency or lost-in-the-middle degradation is a concern; when the user says "compress this context", "reduce tokens", "this prompt is too long", "trim the context", "cut my token bill", or asks how to make an agent cheaper to run. Also use before handing a long context to a smaller model, since the router reports whether the compressed version is still trustworthy.
license: MIT
---

# Kernly

Cut the size of a context without a model in the loop, and know when not to trust
the result.

## When this applies

Reach for Kernly when a context is large and repetitive: multi-turn agent
transcripts, retrieval bundles with overlapping documents, tool output, log
dumps, support threads. It is worth the least on short, dense, hand-written
prompts, where there is little packaging to remove.

Do not use it when the exact wording matters — legal text, a prompt being
A/B tested, anything the user will read verbatim. The lexical stage rewrites
prose, and no rewrite is free.

## Use it

```bash
npm install @kernly/core
```

```ts
import { compress } from "@kernly/core";

const { output, receipt } = await compress(context, {
  ratio: 0.35,                       // aim to keep 35% of the tokens
  query: "why does auth return null", // what the context is for
  pin: ["^SYSTEM:", "MUST NOT"],      // never drop these
  lexicalStrength: 0.5,
});

if (receipt.escalate) {
  // The gate is not confident. Send the original, or lower the ratio.
}
```

`receipt` carries `tokensIn`, `tokensOut`, `ratio`, `salienceRetained`,
`confidence`, `escalate`, an energy estimate, a per-stage breakdown, and a
sha256 `digest` over the input, output and config.

## Choosing settings

| Situation | ratio | lexicalStrength | Why |
|---|---|---|---|
| Agent transcript, long | 0.25–0.35 | 0.5 | Redundancy carries most of the win; dedup does the work |
| Retrieval bundle | 0.35–0.5 | 0.3 | Keep document wording close to original for citation |
| Code-heavy context | 0.5–0.7 | 0.5 | Code is exempt from rewriting, so the ceiling is lower |
| Feeding a small model | 0.3 | 0.5 | Check `escalate` — small models are less able to repair gaps |
| Anything user-visible | — | 0 | Disable rewriting entirely |

Always pass `query`. Without it, scoring falls back to information density
alone, and density does not know which dense paragraph is the relevant one.

Always `pin` the system prompt and any hard constraint. Pins are charged against
the budget but never compete for it.

## Reading the gate

`confidence` answers one narrow question: does the compressed context still look
like it contains the answer? It is a heuristic, not a proof.

- Above `escalateBelow` (0.55 by default) — proceed.
- Below it — do not silently continue. Either lower the ratio and re-run, or
  send the original context to a larger model. Reporting the failure is the
  point; a compressor that never declines is one that loses answers quietly.

## Verifying a claim

The pipeline is deterministic: identical input and config always produce an
identical digest. That is what makes a savings claim checkable rather than
asserted. Anchoring the digest on Solana is optional and is a separate concern
from compression — see `src/lib/attest.ts`.

## What it will not do

- Paraphrase or summarise. Nothing is generated, only selected and stripped.
- Touch code, JSON, diffs, tables or logs at the lexical stage.
- Guarantee token counts. The estimator is an approximation fitted to cl100k,
  within roughly six percent on mixed content, and is not suitable for billing.
- Work on non-English prose at the lexical stage. Every other stage is
  language-agnostic.
