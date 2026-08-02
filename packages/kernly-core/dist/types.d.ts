/**
 * Kernly core type surface.
 *
 * The whole engine is deterministic and dependency-free so that an identical
 * input + config always yields an identical receipt hash. That property is what
 * makes an on-chain attestation meaningful: anybody can re-run the pipeline and
 * check the digest themselves.
 */
export type BlockKind = "prose" | "code" | "json" | "table" | "log" | "diff" | "heading" | "list";
export interface Block {
    id: number;
    kind: BlockKind;
    text: string;
    /** Character offset of this block in the normalized source. */
    start: number;
    /** Estimated token cost of the block as-is. */
    tokens: number;
    /** Blocks marked as pinned survive every stage untouched. */
    pinned: boolean;
    /** Populated by the salience stage. */
    score: number;
    /** Set when the dedup stage folds this block into an earlier one. */
    duplicateOf?: number;
}
export interface CompressConfig {
    /** Hard ceiling on output tokens. When omitted, `ratio` drives the budget. */
    budget?: number;
    /** Target fraction of the original token count to keep. 0.35 means "aim for 35%". */
    ratio: number;
    /** The task or question the context is being assembled for. Drives salience. */
    query?: string;
    /** Regex sources whose matching blocks can never be dropped or rewritten. */
    pin?: string[];
    /** Turn the caveman-style lexical layer on or off. */
    lexical: boolean;
    /** Aggressiveness of the lexical layer, 0..1. */
    lexicalStrength: number;
    /** Drop near-duplicate blocks, not just byte-identical ones. */
    nearDedup: boolean;
    /** Jaccard threshold above which two blocks count as near-duplicates. */
    nearDedupThreshold: number;
    /** Below this confidence the router recommends escalating to a larger model. */
    escalateBelow: number;
    /** Energy accounting inputs. See `docs/energy-accounting.md` for provenance. */
    energy: EnergyFactors;
}
export interface EnergyFactors {
    /** Watt-hours consumed per output+input token on the target class of model. */
    whPerToken: number;
    /** Grams of CO2e per kilowatt-hour for the serving grid. */
    gramsPerKwh: number;
}
export interface Receipt {
    tokensIn: number;
    tokensOut: number;
    /** tokensOut / tokensIn. Lower is more compressed. */
    ratio: number;
    tokensSaved: number;
    /** Fraction of the total salience mass that survived selection, 0..1. */
    salienceRetained: number;
    /** 0..1 heuristic that the compressed context is still sufficient. */
    confidence: number;
    /** True when confidence fell under `escalateBelow`. */
    escalate: boolean;
    wattHoursSaved: number;
    gramsCo2eSaved: number;
    /** sha256 over the normalized input, the output and the canonical config. */
    digest: string;
    stages: StageReport[];
}
export interface StageReport {
    name: string;
    tokensBefore: number;
    tokensAfter: number;
    note: string;
}
export interface CompressResult {
    output: string;
    receipt: Receipt;
    blocks: Block[];
}
