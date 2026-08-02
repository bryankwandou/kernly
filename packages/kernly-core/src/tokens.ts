/**
 * Token estimation without shipping a 2 MB BPE table to the browser.
 *
 * This is an approximation, and it is labelled as one everywhere it surfaces in
 * the UI. Against cl100k_base on mixed English prose, code and JSON it lands
 * within roughly 6% on the corpus in `test/fixtures`, which is close enough to
 * drive a budget allocator. It is deliberately NOT used for billing.
 */

const CJK = /[　-鿿가-힯＀-￯]/;

/** Cost multipliers per character class, derived by fitting against cl100k. */
const RATE = {
  prose: 4.0, // chars per token
  code: 3.1, // identifiers and punctuation fragment more
  json: 2.6, // braces, quotes and colons are each their own token
  cjk: 1.0, // roughly one token per ideograph
};

export function estimateTokens(text: string, kind: "prose" | "code" | "json" = "prose"): number {
  if (!text) return 0;

  let cjk = 0;
  for (const ch of text) if (CJK.test(ch)) cjk++;

  const ascii = text.length - cjk;
  const rate = RATE[kind];

  // Punctuation and digits break into their own tokens far more often than
  // letters do, so charge them at a higher rate than the base prose rate.
  const symbols = (text.match(/[^\w\s]/g) || []).length;
  const digits = (text.match(/\d/g) || []).length;
  const dense = symbols + digits * 0.5;

  const base = Math.max(0, ascii - dense) / rate;
  return Math.ceil(base + dense * 0.55 + cjk / RATE.cjk);
}

/** Convenience wrapper for callers that only have loose text. */
export function estimate(text: string): number {
  const looksJson = /^[\s]*[[{]/.test(text) && /[}\]][\s]*$/.test(text);
  if (looksJson) return estimateTokens(text, "json");
  if (/[;{}()=><]/.test(text) && /\n/.test(text)) return estimateTokens(text, "code");
  return estimateTokens(text, "prose");
}
