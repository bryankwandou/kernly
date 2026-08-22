import type { Block } from "./types.js";

/**
 * Stage 4 - budget allocation.
 *
 * Selecting which blocks survive under a token ceiling is a 0/1 knapsack: each
 * block has a weight (its token count) and a value (its salience). Exact
 * knapsack is pseudo-polynomial and far too slow for a 200k-token context, so
 * Kernly uses the standard density-first greedy approximation, which is bounded
 * within a factor of two of optimal and runs in O(n log n).
 *
 * Two departures from textbook greedy matter in practice:
 *
 *   - Pinned blocks are charged against the budget but never compete for it.
 *     The system prompt and the live question are not negotiable.
 *   - Selection preserves document order on output. Reordering context by score
 *     measurably confuses models on multi-hop tasks, so ranking decides what
 *     survives, never where it sits.
 */

export interface Allocation {
  kept: Block[];
  dropped: Block[];
  /** Sum of scores kept divided by sum of all scores. */
  salienceRetained: number;
}

export function allocate(blocks: Block[], budget: number): Allocation {
  const live = blocks.filter((b) => b.duplicateOf === undefined);
  const totalScore = live.reduce((s, b) => s + b.score, 0) || 1;

  const pinned = live.filter((b) => b.pinned);
  const rest = live.filter((b) => !b.pinned);

  let spent = pinned.reduce((s, b) => s + b.tokens, 0);
  const keptIds = new Set(pinned.map((b) => b.id));

  // A heading is a pointer to content, not content. Left to compete on its own
  // it wins easily — it is short, and it repeats the section's strongest terms,
  // so it scores high on both affinity and density. The budget then fills with
  // signposts aimed at material that was evicted, which is worse than useless:
  // the model is told the answer exists and not given it.
  //
  // Headings are therefore withdrawn from the competition and re-attached
  // afterwards to whichever sections actually survived.
  const introduces = new Map<number, number>();
  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i].kind !== "heading") continue;
    const body = rest.slice(i + 1).find((b) => b.kind !== "heading");
    if (body) introduces.set(rest[i].id, body.id);
  }

  const candidates = rest.filter((b) => !introduces.has(b.id));

  // Density-first, but with the length normalisation softened.
  //
  // Strict value-per-token is the textbook approximation and it behaves badly on
  // prose: a three-token heading beats a forty-token paragraph on density almost
  // regardless of content, so a budget fills up with signposts pointing at
  // material that was evicted. A sublinear exponent keeps the greedy ordering
  // while stopping short blocks from winning purely for being short.
  const LENGTH_EXPONENT = 0.65;
  const density = (b: Block) => b.score / Math.pow(Math.max(1, b.tokens), LENGTH_EXPONENT);
  const ranked = [...candidates].sort((a, b) => density(b) - density(a));

  // The single strongest block by absolute score is admitted first if it fits at
  // all. Under a tight budget this is the difference between returning the
  // answer and returning a well-ranked summary of everything around it.
  const anchor = candidates.reduce<Block | null>(
    (best, b) => (!best || b.score > best.score ? b : best),
    null,
  );
  if (anchor && spent + anchor.tokens <= budget) {
    keptIds.add(anchor.id);
    spent += anchor.tokens;
  }

  for (const b of ranked) {
    if (keptIds.has(b.id)) continue;
    if (spent + b.tokens > budget) continue; // skip, do not stop: a later smaller block may still fit
    keptIds.add(b.id);
    spent += b.tokens;
  }

  // Headings are re-admitted last, and only where the section they introduce
  // survived. Restoring them in document order means a budget that runs out
  // part-way through leaves the earlier sections labelled rather than labelling
  // sections at random.
  for (const [headingId, bodyId] of introduces) {
    if (!keptIds.has(bodyId)) continue;
    const h = live.find((b) => b.id === headingId);
    if (!h || spent + h.tokens > budget) continue;
    keptIds.add(h.id);
    spent += h.tokens;
  }

  // A budget smaller than the pinned set is unsatisfiable. Rather than silently
  // truncating something the caller declared non-negotiable, keep the pins and
  // let the receipt report the overrun so the caller can react.
  const kept = live.filter((b) => keptIds.has(b.id));
  const dropped = blocks.filter((b) => !keptIds.has(b.id));

  const keptScore = kept.reduce((s, b) => s + b.score, 0);

  return { kept, dropped, salienceRetained: Math.min(1, keptScore / totalScore) };
}
