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
export declare function allocate(blocks: Block[], budget: number): Allocation;
