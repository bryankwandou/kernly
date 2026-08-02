import type { CompressConfig, CompressResult, EnergyFactors } from "./types.js";
export * from "./types.js";
export { normalize, segment } from "./segment.js";
export { estimate, estimateTokens } from "./tokens.js";
export { receiptDigest, canonical, sha256 } from "./digest.js";
export { compact } from "./lexical.js";
/**
 * Default energy factors.
 *
 * These are order-of-magnitude estimates, not measurements, and the UI says so.
 * `whPerToken` sits in the range commonly reported for a mid-size hosted model
 * serving a single token; `gramsPerKwh` is close to the 2024 global average grid
 * intensity. Both are configurable precisely because the honest answer is that
 * the true number depends on hardware, batch size and which grid the datacentre
 * happens to sit on. Kernly's on-chain claim is about tokens, which are exactly
 * countable; the carbon figure is a derived convenience and is labelled as one.
 */
export declare const DEFAULT_ENERGY: EnergyFactors;
export declare const DEFAULT_CONFIG: CompressConfig;
/**
 * The Kernly pipeline.
 *
 * Ordering is load-bearing. Dedup runs before scoring so that duplicated blocks
 * do not inflate document frequency and depress the IDF of terms that are
 * actually rare. Lexical compaction runs last, after selection, because it
 * changes token counts and would otherwise make the budget allocator solve the
 * wrong problem.
 */
export declare function compress(input: string, partial?: Partial<CompressConfig>): Promise<CompressResult>;
/**
 * Stage 6 - the router.
 *
 * The honest framing: this is a heuristic, not a proof. It answers "does the
 * compressed context still look like it contains the answer?" and nothing more.
 * When it says no, the correct move is to lower the compression ratio or hand
 * the job to a larger model, and Kernly reports that rather than hiding it.
 *
 * Confidence falls when a lot of salience was discarded, when the compression
 * was unusually aggressive, or when so few blocks survived that the context is
 * probably no longer coherent.
 */
export declare function gate(salienceRetained: number, achievedRatio: number, keptBlocks: number, totalBlocks: number): number;
