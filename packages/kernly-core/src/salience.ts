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
 * Terms are deliberately not stemmed, and query matching is widened instead.
 *
 * Full suffix stripping was implemented and measured against `scripts/eval.mjs`,
 * and it made answer retention worse: the recall it bought was outweighed by
 * distinct technical terms collapsing into a shared stem, which flattened the
 * rarity signal that finds them in the first place.
 *
 * Dropping the idea entirely was the wrong conclusion. A question asking about
 * the "refund" window will not match a document that says "refunds", and that
 * single missed match was enough to rank the answer-bearing block below an
 * irrelevant one on the retrieval fixture. The compromise implemented below
 * keeps every term distinct in the index — so IDF, rarity and density are all
 * computed on unstemmed terms exactly as before — and widens matching only at
 * the point where a query term is compared against a block, where a near-miss
 * scores at a discount rather than not at all.
 */
function terms(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9_]{2,}/g) || []).filter((t) => !STOP.has(t));
}

/**
 * Whether two unstemmed terms are close enough to count as a discounted match.
 *
 * The rule is a shared-prefix test rather than a stem: the two terms must agree
 * on a prefix long enough to carry meaning, and whatever each has left over
 * afterwards must be short. That admits refund/refunds and plan/plans, where one
 * word contains the other, and also identity/identities, where neither does —
 * the case a strict prefix rule misses and the harness kept failing on, because
 * a support thread will say "identity service" once and "duplicate identities"
 * two paragraphs later.
 *
 * It stays a heuristic. It will occasionally pair identity with identify, which
 * is precisely why matches found this way score below exact ones instead of
 * equal to them.
 */
const VARIANT_MIN_PREFIX = 5;
const VARIANT_MAX_SUFFIX = 3;
const VARIANT_WEIGHT = 0.65;

function isVariant(a: string, b: string): boolean {
  if (a === b) return false;
  const limit = Math.min(a.length, b.length);
  let shared = 0;
  while (shared < limit && a[shared] === b[shared]) shared += 1;
  if (shared < VARIANT_MIN_PREFIX) return false;
  return a.length - shared <= VARIANT_MAX_SUFFIX && b.length - shared <= VARIANT_MAX_SUFFIX;
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

  // For each query term, the vocabulary terms that count as a near match. The
  // scan is over the corpus vocabulary once per query term, and a query is a
  // handful of terms, so this stays well inside the millisecond budget the rest
  // of the pipeline is held to.
  const variants = new Map<string, string[]>();
  if (qTerms) {
    for (const q of qTerms) {
      const near: string[] = [];
      for (const v of df.keys()) if (isVariant(q, v)) near.push(v);
      if (near.length) variants.set(q, near);
    }
  }

  const tfs = perBlock.map((t) => {
    const tf = new Map<string, number>();
    for (const w of t) tf.set(w, (tf.get(w) || 0) + 1);
    return tf;
  });

  /**
   * BM25 affinity of one block against a weighted bag of terms, k1=1.2, b=0.75.
   *
   * The weight per term is what lets the same routine serve both passes below:
   * the question's own terms enter at full strength, and terms recruited from
   * the first pass enter at a discount.
   */
  const affinityOf = (i: number, wanted: Map<string, number>): number => {
    const t = perBlock[i];
    if (!t.length || !wanted.size) return 0;
    const tf = tfs[i];
    let sum = 0;
    for (const [q, w0] of wanted) {
      let f = tf.get(q) || 0;
      let weight = w0;

      // An exact hit always wins. Only when the term is absent from this block
      // is the widened match consulted, so a block that uses the term verbatim
      // is never outranked by one that merely inflects it.
      if (!f) {
        for (const v of variants.get(q) ?? []) {
          const fv = tf.get(v) || 0;
          if (fv > f) f = fv;
        }
        if (f) weight = w0 * VARIANT_WEIGHT;
      }

      if (!f) continue;
      sum += weight * idf(q) * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (t.length / avgLen))));
    }
    return sum / (sum + 1.5); // squash into 0..1
  };

  /**
   * Pseudo-relevance feedback.
   *
   * The harness kept finding one failure the variant rule could not touch: a
   * question asked in ordinary words about a passage written in specific ones.
   * "How was the login problem resolved" shares no rare term with "two
   * identities after the SSO migration were merged", so BM25 scores the
   * answering paragraph at zero and the selector evicts it while the receipt
   * reports the compression went fine.
   *
   * The classical fix costs nothing and needs no model. Run the query once,
   * assume the top handful of blocks are roughly on topic, harvest their rarest
   * terms, and run again with those added at a discount. It is Rocchio feedback
   * over an unstemmed index, entirely deterministic, and it recovers the
   * vocabulary the question did not happen to use.
   *
   * The discount and the term count are both deliberately small. Feedback is a
   * guess about what the question meant, and a guess given equal footing with
   * what the question actually said drifts the ranking toward whatever the
   * document talks about most.
   */
  const FEEDBACK_BLOCKS = 3;
  const FEEDBACK_TERMS = 8;
  const FEEDBACK_WEIGHT = 0.4;

  const wantedTerms = new Map<string, number>();
  if (qTerms) for (const q of qTerms) wantedTerms.set(q, 1);

  if (qTerms && qTerms.size && N > FEEDBACK_BLOCKS) {
    const scored = live
      .map((_, i) => ({ i, a: affinityOf(i, wantedTerms) }))
      .filter((x) => x.a > 0)
      .sort((x, y) => y.a - x.a);

    // Only blocks that matched comparably to the best one are allowed to
    // contribute vocabulary. Taking the top three unconditionally lets a block
    // that shares one common word with the question into the pool, and once its
    // terms are recruited they score it again on the second pass — a feedback
    // loop that promotes the block on the strength of its own contents. A short
    // document has few blocks and is where this bites hardest: a billing
    // paragraph matching only on "plans" was ending up ranked above the
    // paragraph that stated the refund window.
    const FEEDBACK_FLOOR = 0.5;
    const best = scored[0]?.a ?? 0;
    const firstPass = scored
      .filter((x) => x.a >= best * FEEDBACK_FLOOR)
      .slice(0, FEEDBACK_BLOCKS);

    // Feedback only makes sense if the first pass found something to feed back.
    // When nothing matched, expanding would recruit terms from an arbitrary
    // corner of the document, which is worse than admitting the miss.
    if (firstPass.length) {
      const pool = new Map<string, number>();
      for (const { i } of firstPass) {
        for (const [term, f] of tfs[i]) {
          if (qTerms.has(term)) continue;
          pool.set(term, (pool.get(term) || 0) + f * idf(term));
        }
      }
      const recruited = [...pool.entries()]
        .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
        .slice(0, FEEDBACK_TERMS);
      for (const [term] of recruited) wantedTerms.set(term, FEEDBACK_WEIGHT);
    }
  }

  live.forEach((b, i) => {
    const t = perBlock[i];
    if (!t.length) {
      b.score = 0.05;
      return;
    }

    // 1. Query affinity.
    const affinity = qTerms && qTerms.size ? affinityOf(i, wantedTerms) : 0;

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

/**
 * How much of the question actually survived into the output, weighted by how
 * rare each question term is in the source.
 *
 * The gate used to reason only about the shape of the output: how much scored
 * mass was kept, how hard the ratio was pushed, how many blocks remained. That
 * is a statement about the compression and not about the question, and the
 * harness found the gap — runs where plenty of salient mass survived, none of it
 * the part that answered what was asked, and the receipt reported high
 * confidence anyway.
 *
 * Rarity weighting is what makes this worth computing. A question term that
 * appears in half the document says nothing about whether the answer is present;
 * one that appears in a single block is very nearly a pointer to it. Terms are
 * matched exactly first and then by the same discounted variant rule the scorer
 * uses, so refund/refunds does not read as a miss.
 *
 * Returns null when there is no query, or when none of its terms appear in the
 * source at all. Both cases mean the same thing — there is no evidence here
 * either way — and the gate falls back to its original shape-only reasoning
 * rather than treating absence of evidence as a perfect score.
 */
export function queryCoverage(blocks: Block[], output: string, query?: string): number | null {
  if (!query) return null;
  const wanted = [...new Set(terms(query))];
  if (!wanted.length) return null;

  const live = blocks.filter((b) => b.duplicateOf === undefined);
  const n = live.length || 1;
  const df = new Map<string, number>();
  for (const b of live) {
    for (const t of new Set(terms(b.text))) df.set(t, (df.get(t) || 0) + 1);
  }

  const present = new Set(terms(output));
  let weighted = 0;
  let total = 0;

  for (const q of wanted) {
    // A question term absent from the source cannot be evidence either way, so
    // it is left out of the denominator rather than counted as a failure.
    const seen = df.get(q) ?? [...df.keys()].filter((v) => isVariant(q, v)).reduce((s, v) => s + (df.get(v) || 0), 0);
    if (!seen) continue;

    const weight = Math.log(1 + n / seen);
    total += weight;

    if (present.has(q)) {
      weighted += weight;
      continue;
    }
    for (const p of present) {
      if (isVariant(q, p)) {
        weighted += weight * VARIANT_WEIGHT;
        break;
      }
    }
  }

  return total ? weighted / total : null;
}
