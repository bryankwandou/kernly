import type { Block } from "./types.js";

/**
 * Stage 3 — salience scoring.
 *
 * LLMLingua and its descendants score tokens by perplexity under a small
 * language model. That works well and it is also the reason those pipelines
 * need a GPU to save you GPU time. Kernly takes the opposite bet: score blocks
 * with cheap statistical signals that run in a browser tab in single-digit
 * milliseconds, and accept a slightly worse score in exchange for the
 * compressor itself being effectively free.
 *
 * Four signals are blended:
 *
 *   1. Query affinity  — BM25-style overlap with the task being performed.
 *   2. Positional prior — the well-documented tendency of long-context models
 *                         to lose the middle, so the head and tail are worth
 *                         more per token.
 *   3. Information density — rare terms and a high type/token ratio mean the
 *                         block is carrying content rather than connective tissue.
 *   4. Structural weight — headings, error lines, signatures and identifiers
 *                         punch above their token count.
 */

const STOP = new Set(
  ("a an the and or but if then else of to in on at by for with from as is are was were be been being " +
    "this that these those it its it's we you they he she i do does did have has had will would can could " +
    "should may might must there here what which who whom whose when where why how all any both each few " +
    "more most other some such no nor not only own same so than too very just about into over after before")
    .split(" "),
);

const STRUCTURAL = [
  { re: /^#{1,6}\s/m, w: 1.5 },
  { re: /\b(error|exception|failed|panic|traceback|stack trace)\b/i, w: 1.6 },
  { re: /\b(must|required|never|always|do not|don't)\b/i, w: 1.35 },
  { re: /^\s*(function|class|def|fn|pub fn|export|interface|type)\b/m, w: 1.3 },
  { re: /\b(TODO|FIXME|NOTE|WARNING)\b/, w: 1.2 },
];

/**
 * Terms are deliberately not stemmed.
 *
 * Suffix stripping is the obvious next idea here, on the reasoning that a
 * question asking what "caused" an outage should match a document saying "root
 * cause". It was implemented and measured against `scripts/eval.mjs`, and it
 * made answer retention worse at every useful compression ratio: the recall it
 * bought on question-to-statement matches was outweighed by distinct technical
 * terms collapsing into one stem and flattening the rarity signal that finds
 * them. The harness is in the repository so anyone can re-run that comparison
 * rather than take this paragraph on faith.
 */
function terms(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9_]{2,}/g) || []).filter((t) => !STOP.has(t));
}

export function score(blocks: Block[], query?: string): Block[] {
  const live = blocks.filter((b) => b.duplicateOf === undefined);
  if (!live.length) return blocks;

  // Document frequency across blocks, used for an IDF-style rarity weight.
  const df = new Map<string, number>();
  const perBlock = live.map((b) => {
    const t = terms(b.text);
    for (const u of new Set(t)) df.set(u, (df.get(u) || 0) + 1);
    return t;
  });

  const N = live.length;
  const idf = (t: string) => Math.log(1 + N / (1 + (df.get(t) || 0)));

  const qTerms = query ? new Set(terms(query)) : null;
  const avgLen = perBlock.reduce((s, t) => s + t.length, 0) / N || 1;

  live.forEach((b, i) => {
    const t = perBlock[i];
    if (!t.length) {
      b.score = 0.05;
      return;
    }

    // 1. Query affinity, BM25 with k1=1.2, b=0.75.
    let affinity = 0;
    if (qTerms && qTerms.size) {
      const tf = new Map<string, number>();
      for (const w of t) tf.set(w, (tf.get(w) || 0) + 1);
      for (const q of qTerms) {
        const f = tf.get(q) || 0;
        if (!f) continue;
        affinity += idf(q) * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (t.length / avgLen))));
      }
      affinity = affinity / (affinity + 1.5); // squash into 0..1
    }

    // 2. Positional prior — U-shaped, head weighted a little above tail.
    //
    // The prior exists to guess where the useful material sits when nothing
    // better is known. Once a block demonstrably matches the query, that guess
    // is not just redundant, it is harmful: answers live in the middle of
    // documents at least as often as at the edges, and an undamped U-curve was
    // measurably evicting them. The prior is therefore faded out in proportion
    // to how strongly the block matched.
    const p = N === 1 ? 0 : i / (N - 1);
    const rawPositional = 0.55 + 0.45 * Math.pow(Math.abs(p - 0.45) / 0.55, 1.6);
    const positional = 1 - (1 - rawPositional) * (1 - Math.min(1, affinity * 1.4));

    // 3. Information density.
    const unique = new Set(t).size;
    const ttr = unique / t.length;
    const rarity = t.reduce((s, w) => s + idf(w), 0) / t.length / Math.log(1 + N);
    const density = Math.min(1, 0.5 * ttr + 0.5 * rarity);

    // 4. Structural weight.
    let structural = 1;
    for (const s of STRUCTURAL) if (s.re.test(b.text)) structural = Math.max(structural, s.w);
    if (b.kind === "heading") structural *= 1.2;
    if (b.kind === "log") structural *= 0.8; // logs are bulky and mostly noise
    // Structure is a hint about importance, not a substitute for it. Left
    // uncapped, a heading stacking two multipliers outranked the paragraph that
    // actually answered the question.
    structural = Math.min(structural, 1.6);

    // Query affinity leads when a query exists. Density is the fallback signal
    // for the untargeted case and a tiebreaker otherwise, not a co-equal vote.
    const base = qTerms && qTerms.size ? 0.75 * affinity + 0.25 * density : density;
    b.score = Math.min(1, base * positional * structural);
  });

  for (const b of blocks) if (b.duplicateOf !== undefined) b.score = 0;
  return blocks;
}
