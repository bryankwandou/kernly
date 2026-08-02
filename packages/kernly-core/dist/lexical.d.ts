/**
 * Stage 5 - lexical compaction.
 *
 * This is the layer that the caveman extension by Julius Brussee popularised:
 * strip the grammar, keep the nouns. It is genuinely effective and genuinely
 * dangerous, so Kernly applies it under three constraints the naive version
 * does not have.
 *
 *   - It only ever touches blocks classified as prose. Code, JSON, diffs,
 *     tables and logs pass through byte-identical.
 *   - Anything inside backticks, quotes, brackets or a URL is protected, because
 *     that is where identifiers and literal values live.
 *   - Strength is a dial, not a switch. At 0.3 it only removes filler; at 1.0 it
 *     removes every determiner and copula it can find.
 *
 * See github.com/juliusbrussee/caveman for the original idea. Kernly's variant
 * is a reimplementation, not a fork, and carries no upstream code.
 */
export interface LexicalResult {
    text: string;
    removed: number;
}
export declare function compact(text: string, strength: number): LexicalResult;
