import type { Block } from "./types.js";
/** FNV-1a. Fast, no deps, good enough for shingle buckets. */
export declare function hash32(s: string): number;
/**
 * Line-level folding inside a single block.
 *
 * Block-level dedup cannot see repetition that lives inside one paragraph, and
 * that is exactly the shape agent tool output takes: three consecutive
 * "Reading file x" lines with no blank line between them arrive as one block.
 * Collapsing them here, before scoring, is both the cheapest and the most
 * frequently triggered win in the pipeline.
 *
 * Only exact matches after whitespace normalization are folded, and only when
 * the line appears more than once. Anything subtler is left to the block stage,
 * where the near-duplicate threshold is under the caller's control.
 */
export declare function foldLines(text: string): {
    text: string;
    folded: number;
};
export declare function dedup(blocks: Block[], near: boolean, threshold: number): Block[];
