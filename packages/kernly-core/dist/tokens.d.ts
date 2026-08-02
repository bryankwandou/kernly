/**
 * Token estimation without shipping a 2 MB BPE table to the browser.
 *
 * This is an approximation, and it is labelled as one everywhere it surfaces in
 * the UI. Against cl100k_base on mixed English prose, code and JSON it lands
 * within roughly 6% on the corpus in `test/fixtures`, which is close enough to
 * drive a budget allocator. It is deliberately NOT used for billing.
 */
export declare function estimateTokens(text: string, kind?: "prose" | "code" | "json"): number;
/** Convenience wrapper for callers that only have loose text. */
export declare function estimate(text: string): number;
