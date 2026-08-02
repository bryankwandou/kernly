/**
 * Deterministic sha256 over (normalized input, output, canonical config).
 *
 * The digest is the only thing Kernly ever writes on-chain. It is what turns a
 * savings claim from marketing copy into something a third party can check:
 * re-run the pipeline with the published config, hash the result, compare.
 *
 * Implemented against WebCrypto so the same code path runs in the browser, in
 * an edge function and in Node 18+, with no native module and no polyfill.
 */
export declare function canonical(value: unknown): string;
export declare function sha256(input: string): Promise<string>;
export declare function receiptDigest(normalizedInput: string, output: string, config: unknown): Promise<string>;
