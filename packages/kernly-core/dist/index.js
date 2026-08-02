import { normalize, segment } from "./segment.js";
import { dedup } from "./dedup.js";
import { score } from "./salience.js";
import { allocate } from "./budget.js";
import { compact } from "./lexical.js";
import { estimate } from "./tokens.js";
import { receiptDigest } from "./digest.js";
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
export const DEFAULT_ENERGY = {
    whPerToken: 0.0003,
    gramsPerKwh: 480,
};
export const DEFAULT_CONFIG = {
    ratio: 0.35,
    lexical: true,
    lexicalStrength: 0.5,
    nearDedup: true,
    nearDedupThreshold: 0.82,
    escalateBelow: 0.55,
    energy: DEFAULT_ENERGY,
};
/**
 * The Kernly pipeline.
 *
 * Ordering is load-bearing. Dedup runs before scoring so that duplicated blocks
 * do not inflate document frequency and depress the IDF of terms that are
 * actually rare. Lexical compaction runs last, after selection, because it
 * changes token counts and would otherwise make the budget allocator solve the
 * wrong problem.
 */
export async function compress(input, partial = {}) {
    const config = { ...DEFAULT_CONFIG, ...partial, energy: { ...DEFAULT_ENERGY, ...partial.energy } };
    const stages = [];
    const src = normalize(input);
    const tokensIn = estimate(src);
    const pins = (config.pin || []).map((p) => new RegExp(p, "i"));
    let blocks = segment(src, pins);
    stages.push({
        name: "segment",
        tokensBefore: tokensIn,
        tokensAfter: tokensIn,
        note: `${blocks.length} typed blocks`,
    });
    // Stage 2 - fold redundancy.
    const beforeDedup = liveTokens(blocks);
    blocks = dedup(blocks, config.nearDedup, config.nearDedupThreshold);
    const afterDedup = liveTokens(blocks);
    const foldedCount = blocks.filter((b) => b.duplicateOf !== undefined).length;
    stages.push({
        name: "dedup",
        tokensBefore: beforeDedup,
        tokensAfter: afterDedup,
        note: `${foldedCount} redundant blocks folded`,
    });
    // Stage 3 - score what is left.
    blocks = score(blocks, config.query);
    // Stage 4 - fit to budget.
    const budget = config.budget ?? Math.max(1, Math.round(tokensIn * config.ratio));
    const { kept, dropped, salienceRetained } = allocate(blocks, budget);
    stages.push({
        name: "select",
        tokensBefore: afterDedup,
        tokensAfter: kept.reduce((s, b) => s + b.tokens, 0),
        note: `${kept.length} kept, ${dropped.filter((b) => b.duplicateOf === undefined).length} dropped, budget ${budget}`,
    });
    // Stage 5 - lexical compaction on prose only.
    const beforeLex = kept.reduce((s, b) => s + b.tokens, 0);
    const rendered = kept.map((b) => {
        if (!config.lexical || b.pinned || b.kind !== "prose")
            return b.text;
        return compact(b.text, config.lexicalStrength).text;
    });
    const output = rendered.join("\n\n").trim();
    const tokensOut = estimate(output);
    stages.push({
        name: "compact",
        tokensBefore: beforeLex,
        tokensAfter: tokensOut,
        note: config.lexical ? `strength ${config.lexicalStrength}` : "disabled",
    });
    // Stage 6 - the escalation gate.
    const achieved = tokensIn ? tokensOut / tokensIn : 1;
    const confidence = gate(salienceRetained, achieved, kept.length, blocks.length);
    const tokensSaved = Math.max(0, tokensIn - tokensOut);
    const wattHoursSaved = tokensSaved * config.energy.whPerToken;
    const gramsCo2eSaved = (wattHoursSaved / 1000) * config.energy.gramsPerKwh;
    const receipt = {
        tokensIn,
        tokensOut,
        ratio: Number(achieved.toFixed(4)),
        tokensSaved,
        salienceRetained: Number(salienceRetained.toFixed(4)),
        confidence: Number(confidence.toFixed(4)),
        escalate: confidence < config.escalateBelow,
        wattHoursSaved: Number(wattHoursSaved.toFixed(6)),
        gramsCo2eSaved: Number(gramsCo2eSaved.toFixed(6)),
        digest: await receiptDigest(src, output, config),
        stages,
    };
    return { output, receipt, blocks };
}
function liveTokens(blocks) {
    return blocks.filter((b) => b.duplicateOf === undefined).reduce((s, b) => s + b.tokens, 0);
}
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
export function gate(salienceRetained, achievedRatio, keptBlocks, totalBlocks) {
    const massTerm = Math.pow(salienceRetained, 0.7);
    // Compressing hard is not itself a problem; compressing hard while shedding
    // salience is. The penalty is therefore conditioned on the mass term.
    const aggression = Math.max(0, 0.5 - achievedRatio) * 2; // 0 at ratio>=0.5, 1 at ratio 0
    const aggressionPenalty = aggression * (1 - salienceRetained) * 0.6;
    const coverage = totalBlocks ? Math.min(1, (keptBlocks / totalBlocks) * 2.5) : 1;
    return Math.max(0, Math.min(1, massTerm * (0.75 + 0.25 * coverage) - aggressionPenalty));
}
